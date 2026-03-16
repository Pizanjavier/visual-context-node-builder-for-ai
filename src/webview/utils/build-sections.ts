import type { Node, Edge } from '@xyflow/react';
import type { ContextFileNodeData, PackageNodeData } from '../../shared/types/nodes';
import type { ContextSection } from '../../shared/utils/context-builder';

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
