import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import { buildSections } from '../webview/utils/build-sections';
import type { ContextFileNodeData } from '../shared/types/nodes';

function makeFileNode(id: string, y: number, overrides: Partial<ContextFileNodeData> = {}): Node {
  return {
    id,
    type: 'contextFile',
    position: { x: 0, y },
    data: {
      filePath: `/project/src/${id}.ts`,
      fileName: `${id}.ts`,
      relativePath: `src/${id}.ts`,
      symbols: [],
      selectedSymbols: [],
      redacted: false,
      content: `// ${id}`,
      ...overrides,
    },
  };
}

function makeNoteNode(id: string, y: number, text: string): Node {
  return { id, type: 'stickyNote', position: { x: 0, y }, data: { text } };
}

function makeSysNode(id: string, y: number, text: string): Node {
  return { id, type: 'systemInstruction', position: { x: 0, y }, data: { text } };
}

function makePkgNode(id: string, y: number): Node {
  return {
    id,
    type: 'package',
    position: { x: 0, y },
    data: {
      packageName: 'test-pkg',
      version: '1.0.0',
      typesContent: 'declare const x: number;',
      typesEntry: 'index.d.ts',
    },
  };
}

describe('buildSections', () => {
  it('creates file sections from contextFile nodes', () => {
    const nodes = [makeFileNode('a', 100)];
    const sections = buildSections(nodes, [], '');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.kind).toBe('file');
  });

  it('creates note sections from stickyNote nodes', () => {
    const nodes = [makeNoteNode('n1', 50, 'My note')];
    const sections = buildSections(nodes, [], '');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.kind).toBe('note');
  });

  it('creates systemInstruction sections', () => {
    const nodes = [makeSysNode('s1', 10, 'Be helpful')];
    const sections = buildSections(nodes, [], '');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.kind).toBe('systemInstruction');
  });

  it('creates package sections', () => {
    const nodes = [makePkgNode('p1', 200)];
    const sections = buildSections(nodes, [], '');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.kind).toBe('package');
  });

  it('adds intent section when intent is non-empty', () => {
    const sections = buildSections([], [], 'Do something');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.kind).toBe('intent');
  });

  it('omits intent section when intent is empty', () => {
    const sections = buildSections([], [], '');
    expect(sections).toHaveLength(0);
  });

  it('adds relationships section when edges exist', () => {
    const nodes = [makeFileNode('a', 100), makeFileNode('b', 200)];
    const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }];
    const sections = buildSections(nodes, edges, '');
    const relSection = sections.find((s) => s.kind === 'relationships');
    expect(relSection).toBeDefined();
  });

  it('sorts sections by Y position (top to bottom)', () => {
    const nodes = [
      makeSysNode('s1', 300, 'system'),
      makeNoteNode('n1', 100, 'note'),
      makeFileNode('f1', 200),
    ];
    const sections = buildSections(nodes, [], '');
    expect(sections[0]!.kind).toBe('note');
    expect(sections[1]!.kind).toBe('file');
    expect(sections[2]!.kind).toBe('systemInstruction');
  });

  it('skips empty sticky notes', () => {
    const nodes = [makeNoteNode('n1', 50, '')];
    const sections = buildSections(nodes, [], '');
    expect(sections).toHaveLength(0);
  });

  it('skips empty system instructions', () => {
    const nodes = [makeSysNode('s1', 10, '')];
    const sections = buildSections(nodes, [], '');
    expect(sections).toHaveLength(0);
  });
});
