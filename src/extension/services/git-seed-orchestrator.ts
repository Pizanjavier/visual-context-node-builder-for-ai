import * as vscode from 'vscode';
import * as path from 'path';
import type {
  GitDiffSource,
  GitSeedResult,
  ChangedFile,
} from '../../shared/types/git';
import { isGitRepository, getGitDiff, getFileContentAtRef } from './git-reader';
import { parseDiffOutput, mapDiffToSymbols } from './diff-parser';
import type { ParsedDiffFile } from './diff-parser';
import { extractSymbols } from './symbol-extractor';
import {
  buildWorkspaceImportIndex,
  findReverseDependencies,
} from './reverse-dep-scanner';
import type { ImportIndex } from './reverse-dep-scanner';

type ProgressCallback = (step: string, percent: number) => void;

const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts']);

/** Module-level cache for the workspace import index. */
let cachedImportIndex: ImportIndex | undefined;

/** Clear the cached import index. Call when workspace files change. */
export function clearImportIndexCache(): void {
  cachedImportIndex = undefined;
}

/**
 * Execute the full git-seed pipeline: diff -> parse -> symbols -> reverse deps.
 * Reports progress via the callback at each major step.
 */
export async function executeGitSeed(
  source: GitDiffSource,
  workspaceRoot: string,
  postProgress: ProgressCallback,
): Promise<GitSeedResult> {
  postProgress('Checking git repository...', 0);
  const isRepo = await isGitRepository(workspaceRoot);
  if (!isRepo) {
    throw new Error('Not a git repository. Open a workspace with a git repo.');
  }

  postProgress('Getting git diff...', 10);
  const rawDiff = await getGitDiff(source, workspaceRoot);
  if (rawDiff.trim().length === 0) {
    return { source, changedFiles: [], reverseDependencies: {} };
  }

  postProgress('Parsing diff output...', 20);
  const parsedFiles = parseDiffOutput(rawDiff);

  postProgress('Analyzing changed files...', 25);
  const changedFiles = await processChangedFiles(
    parsedFiles,
    source,
    workspaceRoot,
    postProgress,
  );

  postProgress('Building workspace import index...', 60);
  if (!cachedImportIndex) {
    cachedImportIndex = await buildWorkspaceImportIndex(workspaceRoot);
  }

  postProgress('Finding reverse dependencies...', 80);
  const allSymbols = changedFiles.flatMap((f) => f.changedSymbols);
  const reverseDependencies = await findReverseDependencies(
    allSymbols,
    cachedImportIndex,
    workspaceRoot,
  );

  postProgress('Done', 100);
  return { source, changedFiles, reverseDependencies };
}

/** Process each parsed diff file into a ChangedFile with symbols. */
async function processChangedFiles(
  parsedFiles: ParsedDiffFile[],
  source: GitDiffSource,
  workspaceRoot: string,
  postProgress: ProgressCallback,
): Promise<ChangedFile[]> {
  const changedFiles: ChangedFile[] = [];
  const total = parsedFiles.length;

  for (let i = 0; i < total; i++) {
    const percent = 25 + Math.round((i / Math.max(total, 1)) * 35);
    const parsed = parsedFiles[i];
    const filePath = parsed.status === 'deleted' ? parsed.oldPath : parsed.newPath;
    postProgress(`Analyzing ${filePath}...`, percent);

    try {
      const result = await processSingleFile(parsed, source, workspaceRoot);
      if (result) {
        changedFiles.push(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[git-seed] Skipping ${filePath}: ${msg}`);
    }
  }

  return changedFiles;
}

/** Process a single diff file: read content, extract symbols, map to diff. */
async function processSingleFile(
  parsed: ParsedDiffFile,
  source: GitDiffSource,
  workspaceRoot: string,
): Promise<ChangedFile | undefined> {
  const filePath = parsed.status === 'deleted' ? parsed.oldPath : parsed.newPath;
  const ext = path.extname(filePath).toLowerCase();

  if (!TS_EXTENSIONS.has(ext)) {
    return buildChangedFileWithoutSymbols(parsed, workspaceRoot);
  }

  const absPath = path.resolve(workspaceRoot, filePath);
  const content = await readFileForAnalysis(parsed, absPath, source, workspaceRoot);
  if (content === undefined) {
    return buildChangedFileWithoutSymbols(parsed, workspaceRoot);
  }

  const symbols = extractSymbols(content, path.basename(filePath));
  const relativePath = filePath;
  const changedSymbols = mapDiffToSymbols(parsed, symbols, relativePath, absPath);

  return {
    filePath: absPath,
    relativePath,
    status: parsed.status,
    changedSymbols,
  };
}

/** Read file content for symbol extraction — current or from a ref. */
async function readFileForAnalysis(
  parsed: ParsedDiffFile,
  absPath: string,
  source: GitDiffSource,
  workspaceRoot: string,
): Promise<string | undefined> {
  if (parsed.status === 'deleted') {
    return readDeletedFileContent(absPath, source, workspaceRoot);
  }
  try {
    const raw = await vscode.workspace.fs.readFile(vscode.Uri.file(absPath));
    return Buffer.from(raw).toString('utf-8');
  } catch {
    return undefined;
  }
}

/** Read a deleted file's content from the parent commit. */
async function readDeletedFileContent(
  absPath: string,
  source: GitDiffSource,
  workspaceRoot: string,
): Promise<string | undefined> {
  try {
    const ref = getParentRef(source);
    return await getFileContentAtRef(absPath, ref, workspaceRoot);
  } catch {
    return undefined;
  }
}

/** Determine the parent ref to read deleted file content from. */
function getParentRef(source: GitDiffSource): string {
  switch (source.kind) {
    case 'staged':
    case 'unstaged':
      return 'HEAD';
    case 'commit':
      return `${source.commitHash}~1`;
    case 'range':
      return source.fromRef;
  }
}

/** Build a ChangedFile for non-TS files (no symbol analysis). */
function buildChangedFileWithoutSymbols(
  parsed: ParsedDiffFile,
  workspaceRoot: string,
): ChangedFile {
  const filePath = parsed.status === 'deleted' ? parsed.oldPath : parsed.newPath;
  const absPath = path.resolve(workspaceRoot, filePath);
  return {
    filePath: absPath,
    relativePath: filePath,
    status: parsed.status,
    changedSymbols: [],
  };
}
