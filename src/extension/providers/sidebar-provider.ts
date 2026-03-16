import * as vscode from 'vscode';
import { CanvasPanel } from './canvas-panel';

/** Sidebar panel that provides quick access to the Visual Context Builder. */
export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'vcnb.welcome';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    webviewView.webview.onDidReceiveMessage((msg: { type: string }) => {
      if (msg.type === 'openCanvas') {
        vscode.commands.executeCommand('vcnb.openCanvas');
      } else if (msg.type === 'addFiles') {
        this.pickAndAddFiles();
      }
    });
  }

  private async pickAndAddFiles(): Promise<void> {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: true,
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: 'Add to Context',
      filters: { 'All Files': ['*'] },
    });
    if (!uris || uris.length === 0) return;

    const { readFileAsNodeData } = await import('../services/file-reader.js');
    const panel = CanvasPanel.createOrShow(this.extensionUri);

    for (const uri of uris) {
      try {
        const data = await readFileAsNodeData(uri);
        panel.postMessage({ type: 'fileData', data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        vscode.window.showErrorMessage(`Cannot add file: ${message}`);
      }
    }
  }

  private getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < 32; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
  }

  private getHtml(): string {
    const nonce = this.getNonce();
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <style nonce="${nonce}">
    body {
      margin: 0;
      padding: 16px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
    }
    h3 { margin: 0 0 8px; font-size: 13px; font-weight: 600; }
    p { margin: 0 0 16px; font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.5; }
    button {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 8px;
      border: none;
      border-radius: 2px;
      font-size: 12px;
      cursor: pointer;
      font-family: var(--vscode-font-family);
    }
    .primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .primary:hover { background: var(--vscode-button-hoverBackground); }
    .secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .shortcuts { margin-top: 16px; font-size: 11px; color: var(--vscode-descriptionForeground); }
    .shortcuts kbd {
      padding: 1px 4px;
      border: 1px solid var(--vscode-widget-border);
      border-radius: 2px;
      font-family: var(--vscode-editor-font-family);
      font-size: 10px;
    }
  </style>
</head>
<body>
  <h3>Visual Context Builder</h3>
  <p>Map, prune, and bundle codebase context for AI coding assistants.</p>
  <button class="primary" id="btn-open">Open Canvas</button>
  <button class="secondary" id="btn-add">Add Files to Context</button>
  <div class="shortcuts">
    <p>Right-click any file in Explorer to add it directly.</p>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.getElementById('btn-open').addEventListener('click', () => vscode.postMessage({ type: 'openCanvas' }));
    document.getElementById('btn-add').addEventListener('click', () => vscode.postMessage({ type: 'addFiles' }));
  </script>
</body>
</html>`;
  }
}
