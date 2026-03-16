import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

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
): ResolvedImport[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const imports: ResolvedImport[] = [];

  ts.forEachChild(sourceFile, (node) => {
    // import ... from './foo'
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      const resolved = resolveLocalImport(specifier, fileDir);
      if (resolved) {
        imports.push({ specifier, resolvedPath: resolved });
      }
    }

    // export ... from './foo'
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      const resolved = resolveLocalImport(specifier, fileDir);
      if (resolved) {
        imports.push({ specifier, resolvedPath: resolved });
      }
    }
  });

  return imports;
}

/** Resolve a relative import specifier to an absolute file path. */
function resolveLocalImport(specifier: string, fromDir: string): string | undefined {
  if (!specifier.startsWith('.')) return undefined;

  const basePath = path.resolve(fromDir, specifier);

  // Try exact path first (has extension)
  if (path.extname(basePath) && fs.existsSync(basePath)) {
    return basePath;
  }

  // Try adding extensions
  for (const ext of TS_EXTENSIONS) {
    const withExt = basePath + ext;
    if (fs.existsSync(withExt)) return withExt;
  }

  // Try index file in directory
  for (const ext of TS_EXTENSIONS) {
    const indexFile = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexFile)) return indexFile;
  }

  return undefined;
}
