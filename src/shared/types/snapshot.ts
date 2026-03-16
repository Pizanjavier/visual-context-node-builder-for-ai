/** Serialized node for canvas snapshots (no file content). */
export type SerializedNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

/** Serialized edge for canvas snapshots. */
export type SerializedEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
};

/** Full canvas snapshot, used for recipes and templates. */
export type CanvasSnapshot = {
  version: 1;
  name: string;
  createdAt: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  intent: string;
};

/** Metadata for a saved recipe (displayed in the library). */
export type RecipeMeta = {
  name: string;
  fileName: string;
  createdAt: string;
  nodeCount: number;
};
