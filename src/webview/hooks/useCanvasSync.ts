import { useCallback } from 'react';
import type { Node, OnSelectionChangeFunc } from '@xyflow/react';
import { useCanvasStore } from '../store/canvas-store';

/** Syncs React Flow selection state with the Zustand store. */
export function useCanvasSync(): {
  onSelectionChange: OnSelectionChangeFunc;
} {
  const setSelectedNodeIds = useCanvasStore((s) => s.setSelectedNodeIds);

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      setSelectedNodeIds(nodes.map((n) => n.id));
    },
    [setSelectedNodeIds],
  );

  return { onSelectionChange };
}
