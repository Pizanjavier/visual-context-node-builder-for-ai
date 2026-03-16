/**
 * Context builder — re-exports from split modules.
 * Preserves the original public API surface.
 */
export type { FileEntry, EdgeEntry, ContextSection } from './context-helpers';
export { getFilteredContent, resolveRelationships } from './context-helpers';
export { buildMarkdown, buildMarkdownOrdered } from './format-markdown';
export { buildXml, buildXmlOrdered } from './format-xml';
