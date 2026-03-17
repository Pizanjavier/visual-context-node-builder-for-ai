import type { FileSymbol } from '../../shared/types/nodes';
import type { ChangedSymbol } from '../../shared/types/git';

/** A parsed hunk from unified diff output. */
type DiffHunk = {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  content: string;
};

/** A parsed file entry from unified diff output. */
type ParsedDiffFile = {
  oldPath: string;
  newPath: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  hunks: DiffHunk[];
};

const DIFF_HEADER_RE = /^diff --git /;
const OLD_PATH_RE = /^--- (?:a\/)?(.+)$/;
const NEW_PATH_RE = /^\+\+\+ (?:b\/)?(.+)$/;
const HUNK_HEADER_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
const BINARY_RE = /^Binary files /;

/** Parse unified diff output into structured file entries with hunks. */
export function parseDiffOutput(diffText: string): ParsedDiffFile[] {
  const files: ParsedDiffFile[] = [];
  const lines = diffText.split('\n');
  let i = 0;

  while (i < lines.length) {
    if (!DIFF_HEADER_RE.test(lines[i])) {
      i++;
      continue;
    }

    // Skip the diff --git line
    i++;

    // Skip optional extended header lines (index, similarity, etc.)
    while (i < lines.length && !lines[i].startsWith('--- ') && !DIFF_HEADER_RE.test(lines[i])) {
      if (BINARY_RE.test(lines[i])) {
        // Binary file — skip entirely, advance to next diff header
        i++;
        continue;
      }
      i++;
    }

    if (i >= lines.length || DIFF_HEADER_RE.test(lines[i])) {
      // No --- line found (binary file or malformed) — skip
      continue;
    }

    const oldMatch = OLD_PATH_RE.exec(lines[i]);
    i++;
    if (!oldMatch || i >= lines.length) continue;

    const newMatch = NEW_PATH_RE.exec(lines[i]);
    i++;
    if (!newMatch) continue;

    const oldPath = oldMatch[1];
    const newPath = newMatch[1];
    const status = resolveStatus(oldPath, newPath);
    const hunks: DiffHunk[] = [];

    // Parse hunks until next diff header or end of input
    while (i < lines.length && !DIFF_HEADER_RE.test(lines[i])) {
      const hunkMatch = HUNK_HEADER_RE.exec(lines[i]);
      if (!hunkMatch) {
        i++;
        continue;
      }

      const oldStart = parseInt(hunkMatch[1], 10);
      const oldCount = hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1;
      const newStart = parseInt(hunkMatch[3], 10);
      const newCount = hunkMatch[4] !== undefined ? parseInt(hunkMatch[4], 10) : 1;
      i++;

      const contentLines: string[] = [];
      while (i < lines.length && !DIFF_HEADER_RE.test(lines[i]) && !HUNK_HEADER_RE.test(lines[i])) {
        contentLines.push(lines[i]);
        i++;
      }

      hunks.push({
        oldStart,
        oldCount,
        newStart,
        newCount,
        content: contentLines.join('\n'),
      });
    }

    files.push({ oldPath, newPath, status, hunks });
  }

  return files;
}

function resolveStatus(oldPath: string, newPath: string): ParsedDiffFile['status'] {
  if (oldPath === '/dev/null') return 'added';
  if (newPath === '/dev/null') return 'deleted';
  if (oldPath !== newPath) return 'renamed';
  return 'modified';
}

/**
 * Map a parsed diff file to the symbols it touches.
 *
 * For added files all symbols are returned as 'added'.
 * For deleted files all symbols are returned as 'deleted'.
 * For modified/renamed files only symbols overlapping with hunks are included.
 */
export function mapDiffToSymbols(
  parsedDiff: ParsedDiffFile,
  symbols: FileSymbol[],
  relativePath: string,
  filePath: string,
): ChangedSymbol[] {
  if (parsedDiff.status === 'added') {
    return symbols.map((s) => buildChangedSymbol(s, 'added', '', relativePath, filePath));
  }

  if (parsedDiff.status === 'deleted') {
    return symbols.map((s) => buildChangedSymbol(s, 'deleted', '', relativePath, filePath));
  }

  // Modified or renamed — find symbols overlapping with hunks
  const symbolExcerpts = new Map<string, string[]>();

  for (const hunk of parsedDiff.hunks) {
    const hunkStart = hunk.newStart;
    const hunkEnd = hunk.newStart + Math.max(hunk.newCount - 1, 0);

    for (const symbol of symbols) {
      if (rangesOverlap(hunkStart, hunkEnd, symbol.line, symbol.endLine)) {
        const key = symbolKey(symbol);
        const existing = symbolExcerpts.get(key) ?? [];
        existing.push(hunk.content);
        symbolExcerpts.set(key, existing);
      }
    }
  }

  const result: ChangedSymbol[] = [];
  for (const symbol of symbols) {
    const key = symbolKey(symbol);
    const excerpts = symbolExcerpts.get(key);
    if (excerpts) {
      result.push(
        buildChangedSymbol(
          symbol,
          'modified',
          excerpts.join('\n'),
          relativePath,
          filePath,
        ),
      );
    }
  }

  return result;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

function symbolKey(s: FileSymbol): string { return `${s.name}:${s.line}`; }

function buildChangedSymbol(
  symbol: FileSymbol,
  changeType: ChangedSymbol['changeType'],
  diffExcerpt: string,
  relativePath: string,
  filePath: string,
): ChangedSymbol {
  return {
    filePath,
    relativePath,
    symbolName: symbol.name,
    symbolKind: symbol.kind,
    changeType,
    diffExcerpt,
  };
}

export type { DiffHunk, ParsedDiffFile };
