import * as vscode from 'vscode';
import * as path from 'path';
import { extractSymbols } from './symbol-extractor';
import type { ContextFileNodeData } from '../../shared/types/nodes';

/** Maximum file size in bytes (5 MB). */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svg',
  '.woff', '.woff2', '.ttf', '.eot',
  '.zip', '.gz', '.tar', '.7z',
  '.exe', '.dll', '.so', '.dylib',
  '.pdf', '.mp3', '.mp4', '.wav',
]);

/** Read a file and extract its symbols into ContextFileNodeData. */
export async function readFileAsNodeData(
  fileUri: vscode.Uri,
): Promise<ContextFileNodeData> {
  const ext = path.extname(fileUri.fsPath).toLowerCase();

  if (BINARY_EXTENSIONS.has(ext)) {
    throw new Error(`Binary file not supported: ${path.basename(fileUri.fsPath)}`);
  }

  const stat = await vscode.workspace.fs.stat(fileUri);
  if (stat.size > MAX_FILE_SIZE) {
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File too large (${sizeMb} MB): ${path.basename(fileUri.fsPath)}. Maximum is 5 MB.`,
    );
  }

  const raw = await vscode.workspace.fs.readFile(fileUri);
  const content = Buffer.from(raw).toString('utf-8');
  const fileName = path.basename(fileUri.fsPath);
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  const relativePath = workspaceFolder
    ? path.relative(workspaceFolder.uri.fsPath, fileUri.fsPath)
    : fileUri.fsPath;

  const isTypeScript = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'].includes(ext);
  const symbols = isTypeScript ? extractSymbols(content, fileName) : [];

  return {
    filePath: fileUri.fsPath,
    fileName,
    relativePath,
    symbols,
    selectedSymbols: symbols.filter((s) => s.exported).map((s) => s.name),
    redacted: false,
    content,
  };
}
