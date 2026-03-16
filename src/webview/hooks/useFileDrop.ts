import { useCallback, type DragEvent } from 'react';
import { useExtensionBridge } from './useExtensionBridge';

/**
 * Hook to handle file drops onto the canvas.
 * Files dropped from VS Code Explorer trigger a requestFile message
 * to the extension host.
 *
 * **Platform limitation:** The `text/plain` data transfer type used here
 * may not work reliably on all platforms or with all drag sources.
 * VS Code Explorer drag-and-drop is the primary supported path.
 * External file manager drops may not provide the expected data format.
 */
export function useFileDrop(): {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
} {
  const { postMessage } = useExtensionBridge();

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const filePath = e.dataTransfer.getData('text/plain');
      if (filePath) {
        postMessage({ type: 'requestFile', filePath });
      }
    },
    [postMessage],
  );

  return { onDragOver, onDrop };
}
