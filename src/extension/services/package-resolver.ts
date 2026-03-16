import * as vscode from 'vscode';
import * as path from 'path';
import type { PackageNodeData } from '../../shared/types/nodes';

const MAX_TYPES_SIZE = 50_000; // ~12.5k tokens max

type PkgJson = {
  name?: string;
  version?: string;
  types?: string;
  typings?: string;
};

/** Resolve a package name to its .d.ts content from node_modules. */
export async function resolvePackageTypes(
  packageName: string,
): Promise<PackageNodeData> {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!root) throw new Error('No workspace folder open');

  const pkgJsonUri = vscode.Uri.joinPath(root, 'node_modules', packageName, 'package.json');
  const raw = await vscode.workspace.fs.readFile(pkgJsonUri);
  const pkg = JSON.parse(Buffer.from(raw).toString('utf-8')) as PkgJson;
  const version = pkg.version ?? 'unknown';

  // Try: package's own types/typings field
  const typesField = pkg.types ?? pkg.typings;
  const candidates: string[] = [];
  if (typesField) candidates.push(typesField);

  // Try: @types/{package} if no bundled types
  const scopedName = packageName.startsWith('@')
    ? packageName.replace('/', '__')
    : packageName;
  candidates.push(
    `../../@types/${scopedName}/index.d.ts`,
  );

  // Fallback: index.d.ts in the package itself
  candidates.push('index.d.ts');

  for (const candidate of candidates) {
    try {
      const typesUri = candidate.startsWith('../../')
        ? vscode.Uri.joinPath(root, 'node_modules', candidate.slice(6))
        : vscode.Uri.joinPath(root, 'node_modules', packageName, candidate);

      const content = Buffer.from(
        await vscode.workspace.fs.readFile(typesUri),
      ).toString('utf-8');

      const trimmed = content.length > MAX_TYPES_SIZE
        ? content.slice(0, MAX_TYPES_SIZE) + '\n// ... truncated (file too large)'
        : content;

      return {
        packageName,
        version,
        typesContent: trimmed,
        typesEntry: path.basename(candidate),
      };
    } catch {
      // Try next candidate
    }
  }

  throw new Error(`No type definitions found for "${packageName}"`);
}
