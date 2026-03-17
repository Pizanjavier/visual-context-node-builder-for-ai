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
  /** Set when this node was added via git-seed. */
  gitSeeded?: boolean;
  /** Change type if this file was part of a git diff. */
  changeType?: 'added' | 'modified' | 'deleted' | 'renamed';
  /** Symbol names that were changed in the git diff. */
  changedSymbolNames?: string[];
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
