import { execFile } from 'child_process';
import { promisify } from 'util';
import type { GitDiffSource, CommitInfo } from '../../shared/types/git';

const execFileAsync = promisify(execFile);

/** Timeout for all git commands (30 seconds). */
const GIT_TIMEOUT_MS = 30_000;

/** Pattern for sanitizing user-provided refs (hashes, branch names, etc.). */
const SAFE_REF_PATTERN = /^[a-zA-Z0-9._/~^-]+$/;

/** Validate a git ref string to prevent command injection. */
function sanitizeRef(ref: string): string {
  if (!SAFE_REF_PATTERN.test(ref)) {
    throw new Error(`Invalid git reference: "${ref}"`);
  }
  return ref;
}

/** Run a git command and return stdout. */
async function runGit(
  args: string[],
  workspaceRoot: string,
): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: workspaceRoot,
      timeout: GIT_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes('ENOENT')) {
      throw new Error(
        'Git binary not found. Ensure git is installed and in PATH.',
      );
    }
    if (message.includes('not a git repository')) {
      throw new Error('Not a git repository.');
    }
    throw err;
  }
}

/** Check whether the given directory is inside a git work tree. */
export async function isGitRepository(
  workspaceRoot: string,
): Promise<boolean> {
  try {
    const result = await runGit(
      ['rev-parse', '--is-inside-work-tree'],
      workspaceRoot,
    );
    return result.trim() === 'true';
  } catch {
    return false;
  }
}

/** Get the raw unified diff text for a given source. */
export async function getGitDiff(
  source: GitDiffSource,
  workspaceRoot: string,
): Promise<string> {
  const baseFlags = ['--unified=3', '--find-renames'];

  switch (source.kind) {
    case 'staged':
      return runGit(['diff', '--cached', ...baseFlags], workspaceRoot);

    case 'unstaged':
      return runGit(['diff', ...baseFlags], workspaceRoot);

    case 'commit': {
      const hash = sanitizeRef(source.commitHash);
      return runGit(
        ['diff', `${hash}~1`, hash, ...baseFlags],
        workspaceRoot,
      );
    }

    case 'range': {
      const from = sanitizeRef(source.fromRef);
      const to = sanitizeRef(source.toRef);
      return runGit(['diff', from, to, ...baseFlags], workspaceRoot);
    }
  }
}

/** Parse the output of git log into CommitInfo objects. */
function parseCommitLog(output: string): CommitInfo[] {
  const trimmed = output.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const lines = trimmed.split('\n');
  const commits: CommitInfo[] = [];
  const FIELDS_PER_COMMIT = 5;

  for (let i = 0; i + FIELDS_PER_COMMIT <= lines.length; i += FIELDS_PER_COMMIT) {
    commits.push({
      hash: lines[i],
      shortHash: lines[i + 1],
      message: lines[i + 2],
      author: lines[i + 3],
      date: lines[i + 4],
    });
  }

  return commits;
}

/** Fetch recent commit history. */
export async function getCommitLog(
  workspaceRoot: string,
  limit: number = 20,
): Promise<CommitInfo[]> {
  const safeLimit = Math.max(1, Math.min(limit, 200));
  const output = await runGit(
    ['log', `--format=%H%n%h%n%s%n%an%n%aI`, `-n`, String(safeLimit)],
    workspaceRoot,
  );
  return parseCommitLog(output);
}

/** Read a file's content at a specific git ref. */
export async function getFileContentAtRef(
  filePath: string,
  ref: string,
  workspaceRoot: string,
): Promise<string> {
  const safeRef = sanitizeRef(ref);

  // Make the path relative to the workspace root
  const path = await import('path');
  const relativePath = path.relative(workspaceRoot, filePath);

  try {
    return await runGit(['show', `${safeRef}:${relativePath}`], workspaceRoot);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('does not exist') || message.includes('bad revision')) {
      throw new Error(`Invalid commit reference: ${safeRef}`);
    }
    throw err;
  }
}

/** Count the number of staged files. */
export async function getStagedFileCount(
  workspaceRoot: string,
): Promise<number> {
  const output = await runGit(
    ['diff', '--cached', '--name-only'],
    workspaceRoot,
  );
  return countNonEmptyLines(output);
}

/** Count the number of unstaged changed files. */
export async function getUnstagedFileCount(
  workspaceRoot: string,
): Promise<number> {
  const output = await runGit(['diff', '--name-only'], workspaceRoot);
  return countNonEmptyLines(output);
}

/** Count non-empty lines in a string. */
function countNonEmptyLines(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split('\n').length;
}
