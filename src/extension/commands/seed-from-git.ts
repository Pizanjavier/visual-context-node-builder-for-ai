import * as vscode from 'vscode';
import type { GitDiffSource, CommitInfo } from '../../shared/types/git';
import {
  getStagedFileCount,
  getUnstagedFileCount,
  getCommitLog,
  isGitRepository,
} from '../services/git-reader';
import { CanvasPanel } from '../providers/canvas-panel';
import { executeGitSeed } from '../services/git-seed-orchestrator';

type DiffQuickPickItem = vscode.QuickPickItem & { sourceKind: string };

/** Register the "Seed Canvas from Git Changes" command. */
export function registerSeedFromGitCommand(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  return vscode.commands.registerCommand('vcnb.seedFromGit', async () => {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const isRepo = await isGitRepository(workspaceRoot);
    if (!isRepo) {
      vscode.window.showErrorMessage('Not a git repository.');
      return;
    }

    const source = await showDiffSourcePicker(workspaceRoot);
    if (!source) return;

    const panel = CanvasPanel.createOrShow(context.extensionUri);

    try {
      const result = await executeGitSeed(
        source,
        workspaceRoot,
        (step, percent) => {
          panel.postMessage({
            type: 'gitSeedProgress',
            progress: { step, percent },
          });
        },
      );
      panel.postMessage({ type: 'gitSeedResult', result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      vscode.window.showErrorMessage(`Git seed failed: ${message}`);
      panel.postMessage({ type: 'error', message: `Git seed failed: ${message}` });
    }
  });
}

/** Show the primary QuickPick for choosing a diff source. */
async function showDiffSourcePicker(
  workspaceRoot: string,
): Promise<GitDiffSource | undefined> {
  const [stagedCount, unstagedCount] = await Promise.all([
    getStagedFileCount(workspaceRoot).catch(() => 0),
    getUnstagedFileCount(workspaceRoot).catch(() => 0),
  ]);

  const items: DiffQuickPickItem[] = [
    {
      label: '$(git-commit) Staged changes',
      description: `${stagedCount} file${stagedCount === 1 ? '' : 's'}`,
      sourceKind: 'staged',
    },
    {
      label: '$(diff) Unstaged changes',
      description: `${unstagedCount} file${unstagedCount === 1 ? '' : 's'}`,
      sourceKind: 'unstaged',
    },
    {
      label: '$(git-compare) Compare with commit...',
      description: 'Select a commit to diff against',
      sourceKind: 'commit',
    },
  ];

  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Choose diff source for canvas seeding',
  });
  if (!pick) return undefined;

  return createGitDiffSource(pick.sourceKind, workspaceRoot);
}

/**
 * Create a GitDiffSource from a quick-pick selection kind.
 * For 'commit', shows a secondary picker for commit selection.
 */
export async function createGitDiffSource(
  kind: string,
  workspaceRoot: string,
): Promise<GitDiffSource | undefined> {
  switch (kind) {
    case 'staged':
      return { kind: 'staged' };
    case 'unstaged':
      return { kind: 'unstaged' };
    case 'commit':
      return showCommitPicker(workspaceRoot);
    default:
      return undefined;
  }
}

/** Run the commit picker and execute git seed, posting results to the webview. */
export async function showCommitPickerAndSeed(
  webview: vscode.Webview,
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return;
  const source = await showCommitPicker(workspaceRoot);
  if (!source) return;
  try {
    const result = await executeGitSeed(source, workspaceRoot, (step: string, percent: number) => {
      webview.postMessage({ type: 'gitSeedProgress', progress: { step, percent } });
    });
    webview.postMessage({ type: 'gitSeedResult', result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    webview.postMessage({ type: 'error', message: `Git seed failed: ${message}` });
  }
}

/** Show a secondary QuickPick with recent commits. */
async function showCommitPicker(
  workspaceRoot: string,
): Promise<GitDiffSource | undefined> {
  const commits = await getCommitLog(workspaceRoot, 20);
  if (commits.length === 0) {
    vscode.window.showInformationMessage('No commits found in this repository.');
    return undefined;
  }

  const items = commits.map((c: CommitInfo) => ({
    label: `${c.shortHash} ${c.message}`,
    description: `${c.author} \u00B7 ${c.date}`,
    commitHash: c.hash,
  }));

  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a commit to compare against HEAD',
  });
  if (!pick) return undefined;

  return { kind: 'commit', commitHash: pick.commitHash };
}

/** Get the workspace root path or undefined. */
function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
