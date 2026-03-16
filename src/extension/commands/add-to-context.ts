import * as vscode from 'vscode';
import { CanvasPanel } from '../providers/canvas-panel';
import { readFileAsNodeData } from '../services/file-reader';

/** Registers the "Add to Visual Context" command for Explorer right-click. */
export function registerAddToContextCommand(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'vcnb.addToContext',
    async (uri?: vscode.Uri) => {
      if (!uri) return;

      const panel = CanvasPanel.createOrShow(context.extensionUri);

      try {
        const data = await readFileAsNodeData(uri);
        panel.postMessage({ type: 'fileData', data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        vscode.window.showErrorMessage(`Cannot add file: ${message}`);
      }
    },
  );
}
