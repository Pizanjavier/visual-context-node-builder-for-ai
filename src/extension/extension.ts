import * as vscode from 'vscode';
import { registerOpenCanvasCommand } from './commands/open-canvas';
import { registerAddToContextCommand } from './commands/add-to-context';
import { registerSeedFromGitCommand } from './commands/seed-from-git';
import { SidebarProvider } from './providers/sidebar-provider';

/** Called when the extension is activated. */
export function activate(context: vscode.ExtensionContext): void {
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    registerOpenCanvasCommand(context),
    registerAddToContextCommand(context),
    registerSeedFromGitCommand(context),
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewId,
      sidebarProvider,
    ),
  );
}

/** Called when the extension is deactivated. */
export function deactivate(): void {
  // cleanup handled by disposables
}
