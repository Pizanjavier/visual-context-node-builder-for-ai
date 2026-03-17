import type { FileSymbol } from './nodes';

/** Source of a git diff the user wants to analyze. */
export type GitDiffSource =
  | { kind: 'staged' }
  | { kind: 'unstaged' }
  | { kind: 'commit'; commitHash: string }
  | { kind: 'range'; fromRef: string; toRef: string };

/** A symbol that was changed in a diff hunk. */
export type ChangedSymbol = {
  filePath: string;
  relativePath: string;
  symbolName: string;
  symbolKind: FileSymbol['kind'];
  changeType: 'added' | 'modified' | 'deleted';
  /** Diff hunk lines for this specific symbol. */
  diffExcerpt: string;
};

/** A reverse dependency — a location that uses a changed symbol. */
export type ReverseDependency = {
  /** The file that contains the usage. */
  filePath: string;
  relativePath: string;
  /** The symbol in that file that references the changed symbol. */
  usageContext: string;
  /** Line number of the usage. */
  line: number;
};

/** A changed file with its changed symbols. */
export type ChangedFile = {
  filePath: string;
  relativePath: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  changedSymbols: ChangedSymbol[];
};

/**
 * Reverse deps as a serializable record.
 * Map can't cross postMessage — use plain object instead.
 * Key format: "filePath::symbolName"
 */
export type ReverseDependencyMap = Record<string, ReverseDependency[]>;

/** Full result of a git-seed operation. */
export type GitSeedResult = {
  source: GitDiffSource;
  changedFiles: ChangedFile[];
  reverseDependencies: ReverseDependencyMap;
};

/** Progress update during git seed operation. */
export type GitSeedProgress = {
  step: string;
  percent: number;
};

/** Commit info for the commit picker. */
export type CommitInfo = {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
};
