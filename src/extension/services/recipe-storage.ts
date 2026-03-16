import * as vscode from 'vscode';
import type { CanvasSnapshot, RecipeMeta } from '../../shared/types/snapshot';

const RECIPES_DIR = '.vcnb/recipes';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function recipesUri(root: vscode.Uri): vscode.Uri {
  return vscode.Uri.joinPath(root, RECIPES_DIR);
}

/** Ensure the .vcnb/recipes/ directory exists. */
async function ensureDir(root: vscode.Uri): Promise<void> {
  const dir = recipesUri(root);
  try {
    await vscode.workspace.fs.stat(dir);
  } catch {
    await vscode.workspace.fs.createDirectory(dir);
  }
}

/** Save a canvas snapshot as a recipe JSON file. */
export async function saveRecipe(
  root: vscode.Uri, snapshot: CanvasSnapshot,
): Promise<string> {
  await ensureDir(root);
  const fileName = `${slugify(snapshot.name)}.json`;
  const uri = vscode.Uri.joinPath(recipesUri(root), fileName);
  const content = JSON.stringify(snapshot, null, 2);
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
  return fileName;
}

/** Validate that a recipe file name is safe (no path traversal). */
function validateFileName(fileName: string): void {
  if (
    fileName.includes('/') ||
    fileName.includes('\\') ||
    fileName.includes('..') ||
    !fileName.endsWith('.json')
  ) {
    throw new Error(`Invalid recipe file name: ${fileName}`);
  }
}

/** Load a recipe by file name. */
export async function loadRecipe(
  root: vscode.Uri, fileName: string,
): Promise<CanvasSnapshot> {
  validateFileName(fileName);
  const uri = vscode.Uri.joinPath(recipesUri(root), fileName);
  const raw = await vscode.workspace.fs.readFile(uri);
  return JSON.parse(Buffer.from(raw).toString('utf-8')) as CanvasSnapshot;
}

/** List all saved recipes with metadata. */
export async function listRecipes(root: vscode.Uri): Promise<RecipeMeta[]> {
  const dir = recipesUri(root);
  try {
    const entries = await vscode.workspace.fs.readDirectory(dir);
    const recipes: RecipeMeta[] = [];
    for (const [name, type] of entries) {
      if (type !== vscode.FileType.File || !name.endsWith('.json')) continue;
      try {
        const snap = await loadRecipe(root, name);
        recipes.push({
          name: snap.name,
          fileName: name,
          createdAt: snap.createdAt,
          nodeCount: snap.nodes.length,
        });
      } catch {
        // Skip malformed files
      }
    }
    return recipes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

/** Delete a recipe by file name. */
export async function deleteRecipe(
  root: vscode.Uri, fileName: string,
): Promise<void> {
  validateFileName(fileName);
  const uri = vscode.Uri.joinPath(recipesUri(root), fileName);
  await vscode.workspace.fs.delete(uri);
}
