import type { ContextFileNodeData, PackageNodeData } from '../types/nodes';

export type FileEntry = { id: string; data: ContextFileNodeData };
export type EdgeEntry = { source: string; target: string };

/** A section of ordered context for the prompt workbench. */
export type ContextSection =
  | { kind: 'systemInstruction'; text: string; sortKey: number }
  | { kind: 'intent'; text: string; sortKey: number }
  | { kind: 'note'; text: string; sortKey: number }
  | { kind: 'file'; data: ContextFileNodeData; id: string; sortKey: number }
  | { kind: 'package'; data: PackageNodeData; sortKey: number }
  | { kind: 'relationships'; edges: EdgeEntry[]; nodes: FileEntry[]; sortKey: number };

/** Get filtered content based on selected symbols and redaction state. */
export function getFilteredContent(data: ContextFileNodeData): string {
  if (data.redacted) return '[REDACTED FOR PRIVACY]';
  if (data.symbols.length === 0) return data.content;
  if (data.selectedSymbols.length === data.symbols.length) return data.content;
  const selected = data.symbols.filter((s) => data.selectedSymbols.includes(s.name));
  if (selected.length === 0) return '// No symbols selected';
  const lines = data.content.split('\n');
  const firstSymbolLine = Math.min(...data.symbols.map((s) => s.line));
  const kept: string[] = lines.slice(0, firstSymbolLine - 1);
  for (const sym of selected) {
    kept.push(...lines.slice(sym.line - 1, sym.endLine));
  }
  return kept.join('\n');
}

/** Resolve edge pairs to human-readable path relationship strings. */
export function resolveRelationships(files: FileEntry[], edges: EdgeEntry[]): string[] {
  const idToPath = new Map(files.map((f) => [f.id, f.data.relativePath]));
  return edges
    .map((e) => {
      const s = idToPath.get(e.source);
      const t = idToPath.get(e.target);
      return s && t ? `${s} \u2192 ${t}` : null;
    })
    .filter((r): r is string => r !== null);
}
