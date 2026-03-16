import { useEffect } from 'react';
import { useCanvasStore } from '../store/canvas-store';
import { useRecipeStore } from '../store/recipe-store';

/** Registers global keyboard shortcuts for the canvas. */
export function useKeyboardShortcuts(): void {
  const removeNodes = useCanvasStore((s) => s.removeNodes);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const setSelectedNodeIds = useCanvasStore((s) => s.setSelectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const openSave = useRecipeStore((s) => s.openSave);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      // Delete selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.length > 0) {
        // Don't delete if user is typing in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        removeNodes(selectedNodeIds);
      }

      // Select all: Ctrl/Cmd + A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        setSelectedNodeIds(nodes.map((n) => n.id));
      }

      // Save recipe: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        openSave();
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        setSelectedNodeIds([]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeIds, removeNodes, setSelectedNodeIds, nodes, openSave]);
}
