import { describe, it, expect } from 'vitest';
import { getFilteredContent, resolveRelationships } from '../shared/utils/context-helpers';
import type { ContextFileNodeData } from '../shared/types/nodes';

function makeFileData(overrides: Partial<ContextFileNodeData> = {}): ContextFileNodeData {
  return {
    filePath: '/project/src/foo.ts',
    fileName: 'foo.ts',
    relativePath: 'src/foo.ts',
    symbols: [],
    selectedSymbols: [],
    redacted: false,
    content: 'const x = 1;\nfunction hello() {\n  return "hi";\n}',
    ...overrides,
  };
}

describe('getFilteredContent edge cases', () => {
  it('handles empty content', () => {
    const data = makeFileData({ content: '' });
    expect(getFilteredContent(data)).toBe('');
  });

  it('redaction takes priority over symbol filtering', () => {
    const data = makeFileData({
      redacted: true,
      symbols: [{ name: 'fn', kind: 'function', line: 1, endLine: 1, exported: true }],
      selectedSymbols: ['fn'],
    });
    expect(getFilteredContent(data)).toBe('[REDACTED FOR PRIVACY]');
  });

  it('preserves import lines before first symbol', () => {
    const content = 'import { x } from "y";\nimport z from "w";\nfunction alpha() {}';
    const data = makeFileData({
      content,
      symbols: [
        { name: 'alpha', kind: 'function', line: 3, endLine: 3, exported: false },
      ],
      selectedSymbols: ['alpha'],
    });
    const result = getFilteredContent(data);
    expect(result).toContain('import { x } from "y"');
    expect(result).toContain('import z from "w"');
    expect(result).toContain('function alpha()');
  });
});

describe('resolveRelationships edge cases', () => {
  it('handles empty files array', () => {
    const edges = [{ source: 'a', target: 'b' }];
    expect(resolveRelationships([], edges)).toEqual([]);
  });

  it('handles multiple edges', () => {
    const files = [
      { id: 'a', data: makeFileData({ relativePath: 'a.ts' }) },
      { id: 'b', data: makeFileData({ relativePath: 'b.ts' }) },
      { id: 'c', data: makeFileData({ relativePath: 'c.ts' }) },
    ];
    const edges = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const result = resolveRelationships(files, edges);
    expect(result).toHaveLength(2);
  });
});
