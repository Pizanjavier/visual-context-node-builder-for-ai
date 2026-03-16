import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { resolveAliasedImport } from './path-resolver';
import type { PathConfig } from './path-resolver';

const TS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];

/** Resolved import with source and target paths. */
export type ResolvedImport = {
  specifier: string;
  resolvedPath: string;
};

/** Scan a TypeScript/JavaScript file for local import paths. */
export function scanImports(
  content: string,
  fileName: string,
  fileDir: string,
  pathConfig?: PathConfig,
): ResolvedImport[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const imports: ResolvedImport[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const resolved = resolveImport(specifier, fileDir, pathConfig);
      if (resolved) {
        imports.push({ specifier, resolvedPath: resolved });
      }
    }

    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const resolved = resolveImport(specifier, fileDir, pathConfig);
      if (resolved) {
        imports.push({ specifier, resolvedPath: resolved });
      }
    }
  });

  return imports;
}

/** Resolve an import specifier: relative first, then aliases. */
function resolveImport(
  specifier: string,
  fromDir: string,
  pathConfig?: PathConfig,
): string | undefined {
  if (specifier.startsWith('.')) {
    return resolveLocalImport(specifier, fromDir);
  }

  if (pathConfig) {
    return resolveAliasedImport(specifier, pathConfig);
  }

  return undefined;
}

/** Resolve a relative import specifier to an absolute file path. */
function resolveLocalImport(
  specifier: string,
  fromDir: string,
): string | undefined {
  const basePath = path.resolve(fromDir, specifier);

  if (path.extname(basePath) && fs.existsSync(basePath)) {
    return basePath;
  }

  for (const ext of TS_EXTENSIONS) {
    const withExt = basePath + ext;
    if (fs.existsSync(withExt)) return withExt;
  }

  for (const ext of TS_EXTENSIONS) {
    const indexFile = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexFile)) return indexFile;
  }

  return undefined;
}
