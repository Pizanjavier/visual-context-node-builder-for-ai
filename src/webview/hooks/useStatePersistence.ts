import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/canvas-store';

type VsCodeApi = {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare function acquireVsCodeApi(): VsCodeApi;

let cachedApi: VsCodeApi | undefined;

function getApi(): VsCodeApi {
  if (!cachedApi) {
    cachedApi = acquireVsCodeApi();
  }
  return cachedApi;
}

type PersistedState = {
  nodes: ReturnType<typeof useCanvasStore.getState>['nodes'];
  edges: ReturnType<typeof useCanvasStore.getState>['edges'];
  intent: string;
};

const DEBOUNCE_MS = 500;

/**
 * Persists canvas state via `vscode.setState()` / `vscode.getState()`
 * so the canvas survives webview hide/show cycles.
 *
 * On mount, restores any previously persisted state.
 * On state changes, debounces writes to avoid excessive serialization.
 */
export function useStatePersistence(): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  // Restore state on mount (runs once)
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    try {
      const saved = getApi().getState() as PersistedState | undefined;
      if (saved && Array.isArray(saved.nodes) && saved.nodes.length > 0) {
        const store = useCanvasStore.getState();
        // Only restore if the canvas is currently empty (fresh mount)
        if (store.nodes.length === 0) {
          useCanvasStore.setState({
            nodes: saved.nodes,
            edges: saved.edges ?? [],
            intent: saved.intent ?? '',
          });
        }
      }
    } catch {
      // getState may not be available outside VS Code webview
    }
  }, []);

  // Subscribe to store changes and debounce persistence
  useEffect(() => {
    const unsubscribe = useCanvasStore.subscribe((state) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          const persisted: PersistedState = {
            nodes: state.nodes,
            edges: state.edges,
            intent: state.intent,
          };
          getApi().setState(persisted);
        } catch {
          // setState may not be available outside VS Code webview
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
