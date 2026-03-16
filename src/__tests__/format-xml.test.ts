import { describe, it, expect } from 'vitest';
import { buildXml, buildXmlOrdered } from '../shared/utils/format-xml';
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

describe('CDATA escaping', () => {
  it('escapes ]]> in file content for buildXml', () => {
    const files = [{ id: 'a', data: makeFileData({ content: 'code ]]> more' }) }];
    const xml = buildXml(files, [], [], '');
    expect(xml).not.toContain('<![CDATA[code ]]> more]]>');
    expect(xml).toContain(']]]]><![CDATA[>');
  });

  it('escapes ]]> in file content for buildXmlOrdered', () => {
    const sections: ContextSection[] = [
      {
        kind: 'file',
        data: makeFileData({ content: 'a ]]> b' }),
        id: 'f1',
        sortKey: 0,
      },
    ];
    const xml = buildXmlOrdered(sections);
    expect(xml).toContain(']]]]><![CDATA[>');
  });

  it('escapes ]]> in package types content for buildXmlOrdered', () => {
    const sections: ContextSection[] = [
      {
        kind: 'package',
        data: {
          packageName: 'test-pkg',
          version: '1.0.0',
          typesContent: 'type X = "]]>"',
          typesEntry: 'index.d.ts',
        },
        sortKey: 0,
      },
    ];
    const xml = buildXmlOrdered(sections);
    expect(xml).toContain(']]]]><![CDATA[>');
  });

  it('does not alter content without ]]>', () => {
    const files = [{ id: 'a', data: makeFileData({ content: 'clean code' }) }];
    const xml = buildXml(files, [], [], '');
    expect(xml).toContain('<![CDATA[clean code]]>');
  });
});

describe('buildXmlOrdered sections', () => {
  it('renders system instruction', () => {
    const sections: ContextSection[] = [
      { kind: 'systemInstruction', text: 'Be helpful', sortKey: 0 },
    ];
    const xml = buildXmlOrdered(sections);
    expect(xml).toContain('<system-instruction>Be helpful</system-instruction>');
  });

  it('renders intent', () => {
    const sections: ContextSection[] = [
      { kind: 'intent', text: 'Fix the bug', sortKey: 0 },
    ];
    const xml = buildXmlOrdered(sections);
    expect(xml).toContain('<intent>Fix the bug</intent>');
  });

  it('renders note', () => {
    const sections: ContextSection[] = [
      { kind: 'note', text: 'Important note', sortKey: 0 },
    ];
    const xml = buildXmlOrdered(sections);
    expect(xml).toContain('<note>Important note</note>');
  });

  it('renders relationships', () => {
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
    const xml = buildXmlOrdered(sections);
    expect(xml).toContain('<relationships>');
    expect(xml).toContain('<rel>');
  });
});
