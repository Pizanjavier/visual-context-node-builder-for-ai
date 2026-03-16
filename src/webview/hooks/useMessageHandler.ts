import { useCallback, useEffect, useRef } from 'react';
import type { ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../../shared/types/messages';
import { useCanvasStore } from '../store/canvas-store';
import { useErrorStore } from '../store/error-store';
import { useRecipeStore } from '../store/recipe-store';
import { useExtensionBridge } from './useExtensionBridge';

const NODE_OFFSET_X = 320;
const NODE_OFFSET_Y = 220;
const DEP_OFFSET_X = 400;
const DEP_SPACING_Y = 180;

/** Handles incoming messages from the extension host and updates the canvas. */
export function useMessageHandler(): void {
  const addNode = useCanvasStore((s) => s.addNode);
  const addEdge = useCanvasStore((s) => s.addEdge);
  const getFilePaths = useCanvasStore((s) => s.getFilePaths);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const restore = useCanvasStore((s) => s.restore);
  const showError = useErrorStore((s) => s.show);
  const setRecipes = useRecipeStore((s) => s.setRecipes);
  const setAvailablePackages = useRecipeStore((s) => s.setAvailablePackages);
  const nodeCount = useRef(0);
  const postRef = useRef<(msg: WebviewToExtensionMessage) => void>(() => {});

  const onMessage = useCallback(
    (msg: ExtensionToWebviewMessage) => {
      switch (msg.type) {
        case 'fileData': {
          // If node already exists (e.g. from recipe restore), update its data
          const currentNodes = useCanvasStore.getState().nodes;
          const existing = currentNodes.find(
            (n) => n.type === 'contextFile' &&
              (n.data as Record<string, unknown>)['filePath'] === msg.data.filePath,
          );
          if (existing) {
            updateNodeData(existing.id, msg.data);
            break;
          }
          const count = nodeCount.current++;
          addNode({
            id: `file-${Date.now()}-${count}`,
            type: 'contextFile',
            position: {
              x: 100 + (count % 4) * NODE_OFFSET_X,
              y: 100 + Math.floor(count / 4) * NODE_OFFSET_Y,
            },
            data: msg.data,
          });
          break;
        }
        case 'dependencyFiles': {
          const parentId = msg.parentNodeId;
          const parentNode = useCanvasStore.getState().nodes.find((n) => n.id === parentId);
          const parentX = parentNode?.position.x ?? 100;
          const parentY = parentNode?.position.y ?? 100;
          const existing = new Set(getFilePaths());
          const filesToAdd = msg.files.filter((f) => !existing.has(f.filePath));
          const totalHeight = (filesToAdd.length - 1) * DEP_SPACING_Y;
          const startY = parentY - totalHeight / 2;

          for (let i = 0; i < filesToAdd.length; i++) {
            const file = filesToAdd[i];
            existing.add(file.filePath);
            const count = nodeCount.current++;
            const childId = `file-${Date.now()}-${count}`;
            addNode({
              id: childId,
              type: 'contextFile',
              position: {
                x: parentX + DEP_OFFSET_X,
                y: startY + i * DEP_SPACING_Y,
              },
              data: file,
            });
            addEdge({
              id: `dep-${parentId}-${childId}`,
              source: parentId,
              target: childId,
              type: 'dependency',
            });
          }
          break;
        }
        case 'packageData': {
          const count = nodeCount.current++;
          addNode({
            id: `pkg-${Date.now()}-${count}`,
            type: 'package',
            position: {
              x: 100 + (count % 4) * NODE_OFFSET_X,
              y: 100 + Math.floor(count / 4) * NODE_OFFSET_Y,
            },
            data: msg.data,
          });
          break;
        }
        case 'packageList':
          setAvailablePackages(msg.packages);
          break;
        case 'recipeList':
          setRecipes(msg.recipes);
          break;

        case 'recipeLoaded': {
          restore(msg.snapshot);
          for (const node of msg.snapshot.nodes) {
            if (node.type === 'contextFile' && node.data['filePath']) {
              postRef.current({
                type: 'requestFile',
                filePath: node.data['filePath'] as string,
              });
            }
          }
          break;
        }

        case 'recipeSaved':
          break;

        case 'error':
          console.error('[VCNB]', msg.message);
          showError(msg.message);
          break;
      }
    },
    [addNode, addEdge, getFilePaths, updateNodeData, showError, setRecipes, setAvailablePackages, restore],
  );

  const { postMessage } = useExtensionBridge(onMessage);
  postRef.current = postMessage;

  useEffect(() => {
    postMessage({ type: 'ready' });
  }, [postMessage]);
}
