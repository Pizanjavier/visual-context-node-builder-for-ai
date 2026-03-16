/** A symbol extracted from a source file. */
export type FileSymbol = {
  name: string;
  kind: 'function' | 'class' | 'type' | 'interface' | 'variable' | 'enum';
  line: number;
  endLine: number;
  exported: boolean;
};

/** Data payload for a ContextFileNode on the canvas. */
export type ContextFileNodeData = {
  filePath: string;
  fileName: string;
  relativePath: string;
  symbols: FileSymbol[];
  /** Symbol names that are currently selected (included in bundle). */
  selectedSymbols: string[];
  /** Whether the entire file content is redacted. */
  redacted: boolean;
  content: string;
  /** Whether dependencies have been expanded for this node. */
  depsExpanded?: boolean;
};

/** Data payload for a StickyNoteNode. */
export type StickyNoteNodeData = {
  text: string;
};

/** Data payload for a SystemInstructionNode. */
export type SystemInstructionNodeData = {
  text: string;
};

/** Data payload for a PackageNode (node_modules .d.ts reference). */
export type PackageNodeData = {
  packageName: string;
  version: string;
  typesContent: string;
  /** Entry file the types were read from (e.g. "index.d.ts"). */
  typesEntry: string;
};
