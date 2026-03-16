import * as ts from 'typescript';
import type { FileSymbol } from '../../shared/types/nodes';

/** Extract exported symbols from a TypeScript/JavaScript source file. */
export function extractSymbols(content: string, fileName: string): FileSymbol[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const symbols: FileSymbol[] = [];

  const lineOf = (pos: number): number =>
    sourceFile.getLineAndCharacterOfPosition(pos).line + 1;

  ts.forEachChild(sourceFile, (node) => {
    const isExported = hasExportModifier(node);
    const start = lineOf(node.getStart());
    const end = lineOf(node.getEnd());

    if (ts.isFunctionDeclaration(node) && node.name) {
      symbols.push({ name: node.name.text, kind: 'function', line: start, endLine: end, exported: isExported });
    } else if (ts.isClassDeclaration(node) && node.name) {
      symbols.push({ name: node.name.text, kind: 'class', line: start, endLine: end, exported: isExported });
    } else if (ts.isTypeAliasDeclaration(node)) {
      symbols.push({ name: node.name.text, kind: 'type', line: start, endLine: end, exported: isExported });
    } else if (ts.isInterfaceDeclaration(node)) {
      symbols.push({ name: node.name.text, kind: 'interface', line: start, endLine: end, exported: isExported });
    } else if (ts.isEnumDeclaration(node)) {
      symbols.push({ name: node.name.text, kind: 'enum', line: start, endLine: end, exported: isExported });
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          symbols.push({ name: decl.name.text, kind: 'variable', line: start, endLine: end, exported: isExported });
        }
      }
    }
  });

  return symbols;
}

function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  const mods = ts.getModifiers(node);
  return mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}
