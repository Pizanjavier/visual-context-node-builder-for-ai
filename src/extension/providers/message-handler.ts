import * as vscode from 'vscode';
import type { WebviewToExtensionMessage } from '../../shared/types/messages';
import { readFileAsNodeData } from '../services/file-reader';
import { expandDependencies } from '../services/dependency-graph';
import { resolvePackageTypes } from '../services/package-resolver';
import { handleRecipeMessage } from './recipe-handler';

/** Handles messages from the webview and responds via the webview panel. */
export function createMessageHandler(
  webview: vscode.Webview,
): (msg: WebviewToExtensionMessage) => void {
  return async (msg: WebviewToExtensionMessage) => {
    // Delegate recipe messages to dedicated handler
    if (await handleRecipeMessage(msg, webview)) return;

    switch (msg.type) {
      case 'ready':
        webview.postMessage({ type: 'init' });
        break;

      case 'pickFiles': {
        const uris = await vscode.window.showOpenDialog({
          canSelectMany: true,
          canSelectFiles: true,
          canSelectFolders: false,
          openLabel: 'Add to Context',
          filters: { 'All Files': ['*'] },
        });
        if (uris) {
          for (const uri of uris) {
            try {
              const data = await readFileAsNodeData(uri);
              webview.postMessage({ type: 'fileData', data });
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              webview.postMessage({ type: 'error', message });
            }
          }
        }
        break;
      }

      case 'requestFile':
        try {
          const uri = vscode.Uri.file(msg.filePath);
          const data = await readFileAsNodeData(uri);
          webview.postMessage({ type: 'fileData', data });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          webview.postMessage({ type: 'error', message });
        }
        break;

      case 'expandDependencies':
        try {
          const files = await expandDependencies(msg.filePath, new Set(), msg.categoryFilter);
          webview.postMessage({
            type: 'dependencyFiles',
            parentNodeId: msg.nodeId,
            files,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          webview.postMessage({ type: 'error', message });
        }
        break;

      case 'listPackages': {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri;
        if (root) {
          try {
            const pkgUri = vscode.Uri.joinPath(root, 'package.json');
            const raw = await vscode.workspace.fs.readFile(pkgUri);
            const pkg = JSON.parse(Buffer.from(raw).toString('utf-8'));
            const deps = Object.keys(pkg.dependencies ?? {});
            const devDeps = Object.keys(pkg.devDependencies ?? {});
            webview.postMessage({ type: 'packageList', packages: [...deps, ...devDeps].sort() });
          } catch {
            webview.postMessage({ type: 'packageList', packages: [] });
          }
        }
        break;
      }

      case 'resolvePackage':
        try {
          const pkgData = await resolvePackageTypes(msg.packageName);
          webview.postMessage({ type: 'packageData', data: pkgData });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          webview.postMessage({ type: 'error', message });
        }
        break;

      case 'copyToClipboard':
        await vscode.env.clipboard.writeText(msg.text);
        vscode.window.showInformationMessage('Context copied to clipboard.');
        break;

      case 'saveToFile': {
        const ext = msg.format === 'xml' ? 'xml' : 'md';
        const uri = await vscode.window.showSaveDialog({
          filters: { [ext.toUpperCase()]: [ext] },
          defaultUri: vscode.Uri.file(`context-bundle.${ext}`),
        });
        if (uri) {
          await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from(msg.content, 'utf-8'),
          );
          vscode.window.showInformationMessage(`Saved to ${uri.fsPath}`);
        }
        break;
      }
    }
  };
}
