import * as path from 'path';
import * as vscode from 'vscode';
import { scanImports } from './import-scanner';
import { readFileAsNodeData } from './file-reader';
import type { ContextFileNodeData } from '../../shared/types/nodes';

const MAX_DEPTH = 3;
const MAX_FILES = 500;

/** BFS expansion of dependencies from a root file. */
export async function expandDependencies(
  rootFilePath: string,
  existingPaths: Set<string>,
): Promise<ContextFileNodeData[]> {
  const visited = new Set<string>(existingPaths);
  visited.add(rootFilePath);

  const queue: Array<{ filePath: string; depth: number }> = [];
  const results: ContextFileNodeData[] = [];

  // Seed queue with root file imports
  const rootContent = await readRawContent(rootFilePath);
  if (!rootContent) return results;

  const rootImports = scanImports(
    rootContent,
    path.basename(rootFilePath),
    path.dirname(rootFilePath),
  );

  for (const imp of rootImports) {
    if (!visited.has(imp.resolvedPath)) {
      visited.add(imp.resolvedPath);
      queue.push({ filePath: imp.resolvedPath, depth: 1 });
    }
  }

  // BFS
  while (queue.length > 0 && results.length < MAX_FILES) {
    const item = queue.shift();
    if (!item) break;

    try {
      const uri = vscode.Uri.file(item.filePath);
      const nodeData = await readFileAsNodeData(uri);
      results.push(nodeData);

      if (item.depth < MAX_DEPTH) {
        const imports = scanImports(
          nodeData.content,
          nodeData.fileName,
          path.dirname(item.filePath),
        );

        for (const imp of imports) {
          if (!visited.has(imp.resolvedPath)) {
            visited.add(imp.resolvedPath);
            queue.push({ filePath: imp.resolvedPath, depth: item.depth + 1 });
          }
        }
      }
    } catch {
      // Skip unreadable files (binary, missing, etc.)
      continue;
    }
  }

  return results;
}

async function readRawContent(filePath: string): Promise<string | undefined> {
  try {
    const uri = vscode.Uri.file(filePath);
    const raw = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(raw).toString('utf-8');
  } catch {
    return undefined;
  }
}
