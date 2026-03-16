import * as vscode from 'vscode';
import type { WebviewToExtensionMessage } from '../../shared/types/messages';
import {
  saveRecipe,
  loadRecipe,
  listRecipes,
  deleteRecipe,
} from '../services/recipe-storage';

type RecipeMessage = Extract<
  WebviewToExtensionMessage,
  { type: 'saveRecipe' | 'loadRecipe' | 'listRecipes' | 'deleteRecipe' }
>;

/** Returns true if the message is a recipe message that was handled. */
export async function handleRecipeMessage(
  msg: WebviewToExtensionMessage,
  webview: vscode.Webview,
): Promise<boolean> {
  const recipeTypes = new Set(['saveRecipe', 'loadRecipe', 'listRecipes', 'deleteRecipe']);
  if (!recipeTypes.has(msg.type)) return false;

  const root = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!root) {
    webview.postMessage({ type: 'error', message: 'No workspace folder open' });
    return true;
  }

  const recipeMsg = msg as RecipeMessage;
  try {
    switch (recipeMsg.type) {
      case 'saveRecipe': {
        await saveRecipe(root, recipeMsg.snapshot);
        webview.postMessage({ type: 'recipeSaved', name: recipeMsg.snapshot.name });
        break;
      }
      case 'loadRecipe': {
        const snapshot = await loadRecipe(root, recipeMsg.fileName);
        webview.postMessage({ type: 'recipeLoaded', snapshot });
        break;
      }
      case 'listRecipes': {
        const recipes = await listRecipes(root);
        webview.postMessage({ type: 'recipeList', recipes });
        break;
      }
      case 'deleteRecipe': {
        await deleteRecipe(root, recipeMsg.fileName);
        const recipes = await listRecipes(root);
        webview.postMessage({ type: 'recipeList', recipes });
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recipe operation failed';
    webview.postMessage({ type: 'error', message });
  }

  return true;
}
