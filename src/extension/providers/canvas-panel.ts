import * as vscode from 'vscode';
import type { WebviewToExtensionMessage } from '../../shared/types/messages';
import { createMessageHandler } from './message-handler';

/** Manages the WebviewPanel lifecycle for the Visual Context Builder canvas. */
export class CanvasPanel {
  public static readonly viewType = 'vcnb.canvas';
  private static instance: CanvasPanel | undefined;
  private ready = false;
  private pendingMessages: unknown[] = [];

  private constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly extensionUri: vscode.Uri,
  ) {
    this.panel.onDidDispose(() => this.dispose());
    this.panel.webview.html = this.getHtml();
    const handler = createMessageHandler(this.panel.webview);
    this.panel.webview.onDidReceiveMessage((msg: WebviewToExtensionMessage) => {
      if (msg.type === 'ready') {
        this.ready = true;
        for (const m of this.pendingMessages) {
          this.panel.webview.postMessage(m);
        }
        this.pendingMessages = [];
      }
      handler(msg);
    });
  }

  /** Show the canvas panel, creating it if needed. */
  static createOrShow(extensionUri: vscode.Uri): CanvasPanel {
    if (CanvasPanel.instance) {
      CanvasPanel.instance.panel.reveal(vscode.ViewColumn.One);
      return CanvasPanel.instance;
    }

    const panel = vscode.window.createWebviewPanel(
      CanvasPanel.viewType,
      'Visual Context Builder',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist'),
        ],
      },
    );

    CanvasPanel.instance = new CanvasPanel(panel, extensionUri);
    return CanvasPanel.instance;
  }

  /** Send a message to the webview, queuing if not ready yet. */
  postMessage(message: unknown): void {
    if (this.ready) {
      this.panel.webview.postMessage(message);
    } else {
      this.pendingMessages.push(message);
    }
  }

  private getWebviewUri(fileName: string): vscode.Uri {
    return this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'dist', fileName),
    );
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
    const scriptUri = this.getWebviewUri('webview.js');
    const cssUri = this.getWebviewUri('webview.css');
    const nonce = this.getNonce();

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src ${this.panel.webview.cspSource} 'unsafe-inline';
             script-src 'nonce-${nonce}';
             font-src ${this.panel.webview.cspSource};" />
  <title>Visual Context Builder</title>
  <link rel="stylesheet" href="${cssUri}" />
  <style>
    html, body, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #1a1a1a;
      color: #d4d4d4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private dispose(): void {
    CanvasPanel.instance = undefined;
    this.panel.dispose();
  }
}
