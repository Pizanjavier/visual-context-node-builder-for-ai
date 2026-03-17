import type { ContextSection, FileEntry, EdgeEntry } from './context-helpers';
import { getFilteredContent, resolveRelationships } from './context-helpers';

/** Build Markdown export from context files, edges, notes, and intent. */
export function buildMarkdown(
  files: FileEntry[], edges: EdgeEntry[], notes: string[], intent: string,
): string {
  const p: string[] = [];
  if (intent) p.push(`## Intent\n\n${intent}`);
  if (notes.length > 0) p.push(`## Notes\n\n${notes.map((n) => `- ${n}`).join('\n')}`);
  const rels = resolveRelationships(files, edges);
  if (rels.length > 0) p.push(`## Relationships\n\n${rels.map((r) => `- ${r}`).join('\n')}`);
  p.push('## Files\n');
  for (const f of files) {
    p.push(`### ${f.data.relativePath}\n\n\`\`\`\n${getFilteredContent(f.data)}\n\`\`\``);
  }
  return p.join('\n\n');
}

/** Build ordered Markdown from sorted ContextSections. */
export function buildMarkdownOrdered(sections: ContextSection[]): string {
  const p: string[] = [];
  for (const s of sections) {
    switch (s.kind) {
      case 'systemInstruction':
        p.push(`## System Instructions\n\n${s.text}`);
        break;
      case 'intent':
        p.push(`## Your Request\n\n${s.text}`);
        break;
      case 'note':
        p.push(`## Note\n\n${s.text}`);
        break;
      case 'file':
        p.push(`### ${s.data.relativePath}\n\n\`\`\`\n${getFilteredContent(s.data)}\n\`\`\``);
        break;
      case 'package':
        p.push(`### ${s.data.packageName} (v${s.data.version})\n\n\`\`\`typescript\n${s.data.typesContent}\n\`\`\``);
        break;
      case 'gitSummary': {
        const lines: string[] = [`## Git Diff Summary\nSource: ${s.summary.sourceDescription}\n`];
        lines.push('### Changed Symbols');
        for (const f of s.summary.changedFiles) {
          const syms = f.changedSymbols.length > 0
            ? f.changedSymbols.join(', ')
            : '(no symbols — non-code file)';
          lines.push(`- \`${f.relativePath}\` (${f.status}): ${syms}`);
        }
        if (s.summary.impactedSymbols.length > 0) {
          lines.push('\n### Impact Analysis');
          for (const sym of s.summary.impactedSymbols) {
            lines.push(`- \`${sym.symbolName}\` (from \`${sym.sourceFile}\`) is used by:`);
            for (const u of sym.usedBy) lines.push(`  - ${u.relativePath}:${u.line}`);
          }
        }
        p.push(lines.join('\n'));
        break;
      }
      case 'relationships': {
        const rels = resolveRelationships(s.nodes, s.edges);
        if (rels.length > 0) p.push(`## Relationships\n\n${rels.map((r) => `- ${r}`).join('\n')}`);
        break;
      }
    }
  }
  return p.join('\n\n');
}
