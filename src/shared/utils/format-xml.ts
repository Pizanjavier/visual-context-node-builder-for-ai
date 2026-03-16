import type { ContextSection, FileEntry, EdgeEntry } from './context-helpers';
import { getFilteredContent, resolveRelationships } from './context-helpers';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escape CDATA content so that `]]>` sequences don't break the section. */
const escapeCdata = (s: string): string =>
  s.replace(/]]>/g, ']]]]><![CDATA[>');

/** Build XML export from context files, edges, notes, and intent. */
export function buildXml(
  files: FileEntry[], edges: EdgeEntry[], notes: string[], intent: string,
): string {
  const p: string[] = ['<context>'];
  if (intent) p.push(`  <intent>${esc(intent)}</intent>`);
  if (notes.length > 0) {
    p.push('  <notes>');
    for (const n of notes) p.push(`    <note>${esc(n)}</note>`);
    p.push('  </notes>');
  }
  const rels = resolveRelationships(files, edges);
  if (rels.length > 0) {
    p.push('  <relationships>');
    for (const r of rels) p.push(`    <rel>${esc(r)}</rel>`);
    p.push('  </relationships>');
  }
  p.push('  <files>');
  for (const f of files) {
    p.push(`    <file path="${esc(f.data.relativePath)}">`);
    p.push(`      <![CDATA[${escapeCdata(getFilteredContent(f.data))}]]>`);
    p.push('    </file>');
  }
  p.push('  </files>');
  p.push('</context>');
  return p.join('\n');
}

/** Build ordered XML from sorted ContextSections. */
export function buildXmlOrdered(sections: ContextSection[]): string {
  const p: string[] = ['<context>'];
  for (const s of sections) {
    switch (s.kind) {
      case 'systemInstruction':
        p.push(`  <system-instruction>${esc(s.text)}</system-instruction>`);
        break;
      case 'intent':
        p.push(`  <intent>${esc(s.text)}</intent>`);
        break;
      case 'note':
        p.push(`  <note>${esc(s.text)}</note>`);
        break;
      case 'file':
        p.push(`  <file path="${esc(s.data.relativePath)}">`);
        p.push(`    <![CDATA[${escapeCdata(getFilteredContent(s.data))}]]>`);
        p.push('  </file>');
        break;
      case 'package':
        p.push(`  <package name="${esc(s.data.packageName)}" version="${esc(s.data.version)}">`);
        p.push(`    <![CDATA[${escapeCdata(s.data.typesContent)}]]>`);
        p.push('  </package>');
        break;
      case 'relationships': {
        const rels = resolveRelationships(s.nodes, s.edges);
        if (rels.length > 0) {
          p.push('  <relationships>');
          for (const r of rels) p.push(`    <rel>${esc(r)}</rel>`);
          p.push('  </relationships>');
        }
        break;
      }
    }
  }
  p.push('</context>');
  return p.join('\n');
}
