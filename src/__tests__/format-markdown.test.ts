import { describe, it, expect } from 'vitest';
import { buildMarkdownOrdered } from '../shared/utils/format-markdown';
import type { ContextFileNodeData } from '../shared/types/nodes';
import type { ContextSection } from '../shared/utils/context-helpers';

function makeFileData(overrides: Partial<ContextFileNodeData> = {}): ContextFileNodeData {
  return {
    filePath: '/project/src/foo.ts',
    fileName: 'foo.ts',
    relativePath: 'src/foo.ts',
    symbols: [],
    selectedSymbols: [],
    redacted: false,
    content: 'const x = 1;',
    ...overrides,
  };
}

describe('buildMarkdownOrdered', () => {
  it('renders system instruction section', () => {
    const sections: ContextSection[] = [
      { kind: 'systemInstruction', text: 'You are a reviewer', sortKey: 0 },
    ];
    const md = buildMarkdownOrdered(sections);
    expect(md).toContain('## System Instructions');
    expect(md).toContain('You are a reviewer');
  });

  it('renders intent section', () => {
    const sections: ContextSection[] = [
      { kind: 'intent', text: 'Fix the auth module', sortKey: 0 },
    ];
    const md = buildMarkdownOrdered(sections);
    expect(md).toContain('## Your Request');
    expect(md).toContain('Fix the auth module');
  });

  it('renders note section', () => {
    const sections: ContextSection[] = [
      { kind: 'note', text: 'Check edge cases', sortKey: 0 },
    ];
    const md = buildMarkdownOrdered(sections);
    expect(md).toContain('## Note');
    expect(md).toContain('Check edge cases');
  });

  it('renders file section with code block', () => {
    const sections: ContextSection[] = [
      { kind: 'file', data: makeFileData({ content: 'let y = 2;' }), id: 'f1', sortKey: 0 },
    ];
    const md = buildMarkdownOrdered(sections);
    expect(md).toContain('### src/foo.ts');
    expect(md).toContain('```\nlet y = 2;\n```');
  });

  it('renders package section with typescript code block', () => {
    const sections: ContextSection[] = [
      {
        kind: 'package',
        data: {
          packageName: 'lodash',
          version: '4.17.21',
          typesContent: 'declare function chunk<T>(array: T[]): T[][];',
          typesEntry: 'index.d.ts',
        },
        sortKey: 0,
      },
    ];
    const md = buildMarkdownOrdered(sections);
    expect(md).toContain('### lodash (v4.17.21)');
    expect(md).toContain('```typescript');
  });

  it('renders relationships section', () => {
    const sections: ContextSection[] = [
      {
        kind: 'relationships',
        edges: [{ source: 'a', target: 'b' }],
        nodes: [
          { id: 'a', data: makeFileData({ relativePath: 'src/a.ts' }) },
          { id: 'b', data: makeFileData({ relativePath: 'src/b.ts' }) },
        ],
        sortKey: 100,
      },
    ];
    const md = buildMarkdownOrdered(sections);
    expect(md).toContain('## Relationships');
  });

  it('returns empty string for no sections', () => {
    expect(buildMarkdownOrdered([])).toBe('');
  });
});
