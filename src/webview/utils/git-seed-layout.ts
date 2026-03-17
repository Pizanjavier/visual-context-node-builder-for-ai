import type { ChangedFile, ReverseDependencyMap } from '../../shared/types/git';

type NodePosition = {
  id: string;
  position: { x: number; y: number };
};

const LEFT_X = 100;
const RIGHT_X = 520;
const VERTICAL_SPACING = 200;
const GROUP_GAP = 40;

/**
 * Computes auto-layout positions for git-seeded nodes.
 * Changed files go in a left column; reverse dependency files go
 * in a right column, grouped by which changed file they reference.
 */
// Implemented by: react-canvas agent
export function calculateGitSeedLayout(
  changedFiles: ChangedFile[],
  reverseDeps: ReverseDependencyMap,
): NodePosition[] {
  const positions: NodePosition[] = [];

  // Left column: changed files
  for (let i = 0; i < changedFiles.length; i++) {
    const file = changedFiles[i];
    positions.push({
      id: `git-${file.relativePath}`,
      position: { x: LEFT_X, y: 100 + i * VERTICAL_SPACING },
    });
  }

  // Build a map: changed file relativePath -> set of dep relativePaths
  const depsBySource = new Map<string, Set<string>>();
  for (const [key, deps] of Object.entries(reverseDeps)) {
    const sourceFilePath = key.split('::')[0];
    const sourceFile = changedFiles.find((f) => f.filePath === sourceFilePath);
    if (!sourceFile) continue;
    const existing = depsBySource.get(sourceFile.relativePath) ?? new Set();
    for (const dep of deps) {
      existing.add(dep.relativePath);
    }
    depsBySource.set(sourceFile.relativePath, existing);
  }

  // Right column: reverse dep files, grouped by source file
  const placedDeps = new Set<string>();
  let rightY = 100;

  for (const file of changedFiles) {
    const depPaths = depsBySource.get(file.relativePath);
    if (!depPaths) continue;

    let groupHasNew = false;
    for (const depPath of depPaths) {
      if (placedDeps.has(depPath)) continue;
      placedDeps.add(depPath);
      groupHasNew = true;
      positions.push({
        id: `git-dep-${depPath}`,
        position: { x: RIGHT_X, y: rightY },
      });
      rightY += VERTICAL_SPACING;
    }
    if (groupHasNew) {
      rightY += GROUP_GAP;
    }
  }

  return positions;
}
