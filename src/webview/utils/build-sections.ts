import type { Node, Edge } from '@xyflow/react';
import type { ContextFileNodeData, PackageNodeData } from '../../shared/types/nodes';
import type { ContextSection, GitChangeSummary } from '../../shared/utils/context-builder';
import { useGitSeedStore } from '../store/git-seed-store';

export type { ContextSection };

/**
 * Maps canvas nodes to ordered ContextSections.
 * Sort key = node Y position (top-to-bottom reading order).
 */
export function buildSections(
  nodes: Node[],
  edges: Edge[],
  intent: string,
): ContextSection[] {
  const sections: ContextSection[] = [];

  for (const node of nodes) {
    const y = node.position.y;

    if (node.type === 'systemInstruction') {
      const text = (node.data as { text: string }).text;
      if (text) sections.push({ kind: 'systemInstruction', text, sortKey: y });
    } else if (node.type === 'stickyNote') {
      const text = (node.data as { text: string }).text;
      if (text) sections.push({ kind: 'note', text, sortKey: y });
    } else if (node.type === 'contextFile') {
      const data = node.data as ContextFileNodeData;
      sections.push({ kind: 'file', data, id: node.id, sortKey: y });
    } else if (node.type === 'package') {
      const data = node.data as PackageNodeData;
      sections.push({ kind: 'package', data, sortKey: y });
    }
  }

  // Add git summary if there are git-seeded nodes
  const gitResult = useGitSeedStore.getState().seedResult;
  if (gitResult && gitResult.changedFiles.length > 0) {
    const sourceDesc = describeGitSource(gitResult.source);
    const changedFiles = gitResult.changedFiles.map((f) => ({
      relativePath: f.relativePath,
      status: f.status,
      changedSymbols: f.changedSymbols.map((s) => s.symbolName),
    }));
    const impactedSymbols: GitChangeSummary['impactedSymbols'] = [];
    for (const [key, deps] of Object.entries(gitResult.reverseDependencies)) {
      if (deps.length === 0) continue;
      const [sourceFilePath, symbolName] = key.split('::');
      if (!symbolName) continue;
      const sourceFile = gitResult.changedFiles.find((f) => f.filePath === sourceFilePath);
      // Deduplicate by file — one entry per consuming file, not per line
      const seenFiles = new Set<string>();
      const usedBy: Array<{ relativePath: string; line: number }> = [];
      for (const dep of deps) {
        if (seenFiles.has(dep.relativePath)) continue;
        seenFiles.add(dep.relativePath);
        // Skip test files — they're low-signal for AI context
        if (dep.relativePath.includes('__tests__') || dep.relativePath.includes('.test.') || dep.relativePath.includes('.spec.')) continue;
        usedBy.push({ relativePath: dep.relativePath, line: dep.line });
      }
      if (usedBy.length === 0) continue;
      impactedSymbols.push({
        symbolName,
        sourceFile: sourceFile?.relativePath ?? sourceFilePath,
        usedBy,
      });
    }
    // sortKey of -1000 to appear after system instructions but before files
    sections.push({ kind: 'gitSummary', summary: { sourceDescription: sourceDesc, changedFiles, impactedSymbols }, sortKey: -1000 });
  }

  if (intent) {
    const lowestY = Math.max(...nodes.map((n) => n.position.y), 0);
    sections.push({ kind: 'intent', text: intent, sortKey: lowestY + 100 });
  }

  if (edges.length > 0) {
    const fileNodes = nodes
      .filter((n) => n.type === 'contextFile')
      .map((n) => ({ id: n.id, data: n.data as ContextFileNodeData }));
    const edgeEntries = edges.map((e) => ({ source: e.source, target: e.target }));
    const lowestY = Math.max(...nodes.map((n) => n.position.y), 0);
    sections.push({
      kind: 'relationships',
      edges: edgeEntries,
      nodes: fileNodes,
      sortKey: lowestY + 200,
    });
  }

  sections.sort((a, b) => a.sortKey - b.sortKey);
  return sections;
}

/** Describe a GitDiffSource as a human-readable string. */
function describeGitSource(source: { kind: string; commitHash?: string; fromRef?: string; toRef?: string }): string {
  switch (source.kind) {
    case 'staged': return 'Staged changes';
    case 'unstaged': return 'Unstaged changes';
    case 'commit': return `Commit ${(source.commitHash ?? '').slice(0, 7)}`;
    case 'range': return `${source.fromRef ?? ''}..${source.toRef ?? ''}`;
    default: return 'Git changes';
  }
}
