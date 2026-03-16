import { describe, it, expect } from 'vitest';
import {
  getFilteredContent,
  buildMarkdown,
  buildXml,
  resolveRelationships,
} from '../shared/utils/context-builder';
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

describe('getFilteredContent', () => {
  it('returns redacted marker when file is redacted', () => {
    const data = makeFileData({ redacted: true });
    expect(getFilteredContent(data)).toBe('[REDACTED FOR PRIVACY]');
  });

  it('returns full content when no symbols exist', () => {
    const data = makeFileData({ symbols: [], content: 'full content here' });
    expect(getFilteredContent(data)).toBe('full content here');
  });

  it('returns full content when all symbols are selected', () => {
    const data = makeFileData({
      symbols: [
        { name: 'hello', kind: 'function', line: 2, endLine: 4, exported: true },
      ],
      selectedSymbols: ['hello'],
    });
    expect(getFilteredContent(data)).toBe(data.content);
  });

  it('returns only selected symbol ranges when some are unchecked', () => {
    const content = 'import x from "y";\nfunction alpha() {}\nfunction beta() {}';
    const data = makeFileData({
      content,
      symbols: [
        { name: 'alpha', kind: 'function', line: 2, endLine: 2, exported: false },
        { name: 'beta', kind: 'function', line: 3, endLine: 3, exported: false },
      ],
      selectedSymbols: ['alpha'],
    });
    const result = getFilteredContent(data);
    expect(result).toContain('import x from "y"');
    expect(result).toContain('function alpha()');
    expect(result).not.toContain('function beta()');
  });

  it('returns "// No symbols selected" when none are selected', () => {
    const data = makeFileData({
      symbols: [
        { name: 'hello', kind: 'function', line: 2, endLine: 4, exported: true },
      ],
      selectedSymbols: [],
    });
    expect(getFilteredContent(data)).toBe('// No symbols selected');
  });
});

describe('resolveRelationships', () => {
  it('resolves valid edges to path strings', () => {
    const files = [
      { id: 'a', data: makeFileData({ relativePath: 'src/a.ts' }) },
      { id: 'b', data: makeFileData({ relativePath: 'src/b.ts' }) },
    ];
    const edges = [{ source: 'a', target: 'b' }];
    const result = resolveRelationships(files, edges);
    expect(result).toEqual(['src/a.ts \u2192 src/b.ts']);
  });

  it('filters out edges with invalid node IDs', () => {
    const files = [{ id: 'a', data: makeFileData({ relativePath: 'src/a.ts' }) }];
    const edges = [{ source: 'a', target: 'missing' }];
    const result = resolveRelationships(files, edges);
    expect(result).toEqual([]);
  });

  it('returns empty array when no edges', () => {
    const files = [{ id: 'a', data: makeFileData() }];
    expect(resolveRelationships(files, [])).toEqual([]);
  });
});

describe('buildMarkdown', () => {
  it('includes intent, notes, relationships, and files', () => {
    const files = [
      { id: 'a', data: makeFileData({ relativePath: 'src/a.ts', content: 'code a' }) },
      { id: 'b', data: makeFileData({ relativePath: 'src/b.ts', content: 'code b' }) },
    ];
    const edges = [{ source: 'a', target: 'b' }];
    const md = buildMarkdown(files, edges, ['Fix the bug'], 'Refactor auth module');
    expect(md).toContain('## Intent');
    expect(md).toContain('Refactor auth module');
    expect(md).toContain('## Notes');
    expect(md).toContain('- Fix the bug');
    expect(md).toContain('## Relationships');
    expect(md).toContain('## Files');
    expect(md).toContain('### src/a.ts');
    expect(md).toContain('```\ncode a\n```');
  });

  it('omits optional sections when empty', () => {
    const files = [{ id: 'x', data: makeFileData({ content: 'code' }) }];
    const md = buildMarkdown(files, [], [], '');
    expect(md).not.toContain('## Intent');
    expect(md).not.toContain('## Notes');
    expect(md).not.toContain('## Relationships');
    expect(md).toContain('## Files');
  });
});

describe('buildXml', () => {
  it('produces valid XML structure with CDATA', () => {
    const files = [
      { id: 'a', data: makeFileData({ relativePath: 'src/a.ts', content: 'code' }) },
    ];
    const xml = buildXml(files, [], ['A note'], 'Do things');
    expect(xml).toContain('<context>');
    expect(xml).toContain('</context>');
    expect(xml).toContain('<intent>Do things</intent>');
    expect(xml).toContain('<note>A note</note>');
    expect(xml).toContain('<![CDATA[code]]>');
    expect(xml).toContain('<file path="src/a.ts">');
  });

  it('escapes & < > in XML content', () => {
    const files = [
      { id: 'a', data: makeFileData({ relativePath: 'src/a.ts' }) },
    ];
    const xml = buildXml(files, [], [], 'Fix <bug> & "error"');
    expect(xml).toContain('&lt;bug&gt;');
    expect(xml).toContain('&amp;');
  });

  it('omits optional sections when empty', () => {
    const files = [{ id: 'x', data: makeFileData({ content: 'c' }) }];
    const xml = buildXml(files, [], [], '');
    expect(xml).not.toContain('<intent>');
    expect(xml).not.toContain('<notes>');
    expect(xml).not.toContain('<relationships>');
    expect(xml).toContain('<files>');
  });
});
