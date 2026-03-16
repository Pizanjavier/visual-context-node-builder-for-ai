import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { CanvasSnapshot } from '../../shared/types/snapshot';

export type CanvasState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: string[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  removeNodes: (ids: string[]) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  updateNodeData: (nodeId: string, data: Partial<Record<string, unknown>>) => void;
  clearCanvas: () => void;
  getFilePaths: () => string[];
  intent: string;
  setIntent: (text: string) => void;
  serialize: (name: string) => CanvasSnapshot;
  restore: (snapshot: CanvasSnapshot) => void;
};

/**
 * Primary Zustand store for the canvas graph state.
 * Manages nodes, edges, selection, intent text, and serialization
 * for recipes. React Flow change handlers are wired directly into
 * this store to keep a single source of truth.
 */
export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  addEdge: (edge) => {
    set({ edges: [...get().edges, edge] });
  },

  removeNodes: (ids) => {
    const idSet = new Set(ids);
    set({
      nodes: get().nodes.filter((n) => !idSet.has(n.id)),
      edges: get().edges.filter(
        (e) => !idSet.has(e.source) && !idSet.has(e.target),
      ),
      selectedNodeIds: get().selectedNodeIds.filter((id) => !idSet.has(id)),
    });
  },

  setSelectedNodeIds: (ids) => {
    set({ selectedNodeIds: ids });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeIds: [], intent: '' });
  },

  getFilePaths: () => {
    return get().nodes
      .filter((n) => n.type === 'contextFile')
      .map((n) => (n.data as Record<string, unknown>)['filePath'] as string)
      .filter(Boolean);
  },

  intent: '',
  setIntent: (text) => {
    set({ intent: text });
  },

  serialize: (name) => {
    const { nodes, edges, intent } = get();
    return {
      version: 1,
      name,
      createdAt: new Date().toISOString(),
      intent,
      nodes: nodes.map((n) => {
        const data = { ...n.data } as Record<string, unknown>;
        // Strip file content from snapshots to keep them small
        if (n.type === 'contextFile') {
          delete data['content'];
        }
        return { id: n.id, type: n.type ?? 'default', position: n.position, data };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        ...(e.type ? { type: e.type } : {}),
      })),
    };
  },

  restore: (snapshot) => {
    const nodes: Node[] = snapshot.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    }));
    const edges: Edge[] = snapshot.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(e.type ? { type: e.type } : {}),
    }));
    set({ nodes, edges, selectedNodeIds: [], intent: snapshot.intent });
  },
}));
