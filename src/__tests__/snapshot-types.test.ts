import { describe, it, expect } from 'vitest';
import type { CanvasSnapshot, RecipeMeta, SerializedNode, SerializedEdge } from '../shared/types/snapshot';

describe('snapshot type contracts', () => {
  it('CanvasSnapshot has expected shape', () => {
    const snapshot: CanvasSnapshot = {
      version: 1,
      name: 'test',
      createdAt: new Date().toISOString(),
      intent: 'test intent',
      nodes: [],
      edges: [],
    };
    expect(snapshot.version).toBe(1);
    expect(snapshot.name).toBe('test');
    expect(snapshot.nodes).toEqual([]);
    expect(snapshot.edges).toEqual([]);
  });

  it('SerializedNode has expected shape', () => {
    const node: SerializedNode = {
      id: 'n1',
      type: 'contextFile',
      position: { x: 10, y: 20 },
      data: { filePath: '/test.ts' },
    };
    expect(node.id).toBe('n1');
    expect(node.position.x).toBe(10);
  });

  it('SerializedEdge has expected shape', () => {
    const edge: SerializedEdge = {
      id: 'e1',
      source: 'a',
      target: 'b',
      type: 'dependency',
    };
    expect(edge.source).toBe('a');
    expect(edge.type).toBe('dependency');
  });

  it('RecipeMeta has expected shape', () => {
    const meta: RecipeMeta = {
      name: 'My Recipe',
      fileName: 'my-recipe.json',
      createdAt: '2024-01-01T00:00:00.000Z',
      nodeCount: 5,
    };
    expect(meta.nodeCount).toBe(5);
  });
});
