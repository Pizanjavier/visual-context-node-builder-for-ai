import * as ts from 'typescript';
import * as path from 'path';
import * as vscode from 'vscode';
import { scanImports } from './import-scanner';
import { loadPathConfig } from './path-resolver';
import type { PathConfig } from './path-resolver';
import type {
  ChangedSymbol,
  ReverseDependency,
  ReverseDependencyMap,
} from '../../shared/types/git';

/** Maps absolute file paths to the list of files that import them. */
export type ImportIndex = Map<string, ImportEntry[]>;

type ImportEntry = {
  importingFile: string;
  namedImports: string[];
  isNamespaceImport: boolean;
  namespaceAlias?: string;
};

type ImportBindings = {
  namedImports: string[];
  isNamespaceImport: boolean;
  namespaceAlias?: string;
};

const DEFAULT_FILE_LIMIT = 2000;
const BATCH_SIZE = 50;

/** Build a reverse import index for all workspace TS/JS files. */
export async function buildWorkspaceImportIndex(
  workspaceRoot: string,
  fileLimit: number = DEFAULT_FILE_LIMIT,
): Promise<ImportIndex> {
  const files = await vscode.workspace.findFiles(
    '**/*.{ts,tsx,js,jsx}',
    '**/node_modules/**',
  );
  if (files.length > fileLimit) {
    console.warn(
      `[reverse-dep-scanner] ${files.length} files found, truncating to ${fileLimit}`,
    );
  }
  const truncated = files.slice(0, fileLimit);
  const pathConfig = loadPathConfig(workspaceRoot, workspaceRoot);
  const index: ImportIndex = new Map();

  for (let i = 0; i < truncated.length; i += BATCH_SIZE) {
    const batch = truncated.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((uri) => indexFileImports(uri, pathConfig, index)),
    );
  }
  return index;
}

/** Parse one file's imports and add entries to the reverse index. */
async function indexFileImports(
  fileUri: vscode.Uri,
  pathConfig: PathConfig | undefined,
  index: ImportIndex,
): Promise<void> {
  let content: string;
  try {
    const raw = await vscode.workspace.fs.readFile(fileUri);
    content = Buffer.from(raw).toString('utf-8');
  } catch {
    return;
  }
  const filePath = fileUri.fsPath;
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const resolved = scanImports(content, fileName, fileDir, pathConfig);
  const bindingsMap = extractImportBindings(content, fileName);

  for (const imp of resolved) {
    const bindings = bindingsMap.get(imp.specifier);
    if (!bindings) continue;
    const entry: ImportEntry = {
      importingFile: filePath,
      namedImports: bindings.namedImports,
      isNamespaceImport: bindings.isNamespaceImport,
      namespaceAlias: bindings.namespaceAlias,
    };
    const existing = index.get(imp.resolvedPath);
    if (existing) { existing.push(entry); }
    else { index.set(imp.resolvedPath, [entry]); }
  }
}

/** Extract import bindings (named, namespace) keyed by specifier. */
function extractImportBindings(
  content: string,
  fileName: string,
): Map<string, ImportBindings> {
  const sf = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true);
  const result = new Map<string, ImportBindings>();

  ts.forEachChild(sf, (node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      return;
    }
    const specifier = node.moduleSpecifier.text;
    const clause = node.importClause;
    const bindings: ImportBindings = { namedImports: [], isNamespaceImport: false };

    if (clause?.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) {
        bindings.isNamespaceImport = true;
        bindings.namespaceAlias = clause.namedBindings.name.text;
      } else if (ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          bindings.namedImports.push(el.propertyName?.text ?? el.name.text);
        }
      }
    }
    if (clause?.name) {
      bindings.namedImports.push('default');
    }
    result.set(specifier, bindings);
  });
  return result;
}

/** Find reverse dependencies for a set of changed symbols. */
export async function findReverseDependencies(
  changedSymbols: ChangedSymbol[],
  importIndex: ImportIndex,
  workspaceRoot: string,
): Promise<ReverseDependencyMap> {
  const result: ReverseDependencyMap = {};

  for (const symbol of changedSymbols) {
    const absPath = path.isAbsolute(symbol.filePath)
      ? symbol.filePath
      : path.resolve(workspaceRoot, symbol.filePath);
    const importers = importIndex.get(absPath);
    if (!importers?.length) continue;

    const key = `${absPath}::${symbol.symbolName}`;
    const deps: ReverseDependency[] = [];
    for (const entry of importers) {
      deps.push(...await findSymbolUsages(entry, symbol.symbolName, workspaceRoot));
    }
    if (deps.length > 0) { result[key] = deps; }
  }
  return result;
}

/** Search a single importing file for usages of a symbol name. */
async function findSymbolUsages(
  entry: ImportEntry,
  symbolName: string,
  workspaceRoot: string,
): Promise<ReverseDependency[]> {
  const importsSymbol =
    entry.namedImports.includes(symbolName) || entry.isNamespaceImport;
  if (!importsSymbol) return [];

  let content: string;
  try {
    const raw = await vscode.workspace.fs.readFile(vscode.Uri.file(entry.importingFile));
    content = Buffer.from(raw).toString('utf-8');
  } catch {
    return [];
  }

  const searchTerm = entry.isNamespaceImport
    ? `${entry.namespaceAlias}.${symbolName}`
    : symbolName;
  const pattern = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`);
  const lines = content.split('\n');
  const relativePath = path.relative(workspaceRoot, entry.importingFile);
  const results: ReverseDependency[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(import|export)\s/.test(lines[i])) continue;
    if (pattern.test(lines[i])) {
      results.push({
        filePath: entry.importingFile,
        relativePath,
        usageContext: lines[i].trim(),
        line: i + 1,
      });
    }
  }
  return results;
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
