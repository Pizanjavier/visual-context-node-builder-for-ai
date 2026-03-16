import * as vscode from 'vscode';
import { CanvasPanel } from '../providers/canvas-panel';

/** Registers the "Open Visual Context Builder" command. */
export function registerOpenCanvasCommand(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  return vscode.commands.registerCommand('vcnb.openCanvas', () => {
    CanvasPanel.createOrShow(context.extensionUri);
  });
}
