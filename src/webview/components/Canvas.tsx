import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCanvasStore } from '../store/canvas-store';
import { useCanvasSync } from '../hooks/useCanvasSync';
import { useFileDrop } from '../hooks/useFileDrop';
import { ContextFileNode } from './nodes/ContextFileNode';
import { StickyNoteNode } from './nodes/StickyNoteNode';
import { SystemInstructionNode } from './nodes/SystemInstructionNode';
import { PackageNode } from './nodes/PackageNode';
import { DependencyEdge } from './edges/DependencyEdge';
import {
  GRID_GAP, COLOR_BORDER, COLOR_BG_SURFACE, COLOR_ACCENT,
  COLOR_MINIMAP_BG, COLOR_MINIMAP_MASK,
} from '../theme/tokens';

const MINIMAP_STYLE = {
  backgroundColor: COLOR_MINIMAP_BG,
  maskColor: COLOR_MINIMAP_MASK,
};

/** Main React Flow canvas with dot grid, controls, and minimap. */
export function Canvas(): React.ReactElement {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const { onSelectionChange } = useCanvasSync();
  const { onDragOver, onDrop } = useFileDrop();

  const nodeTypes = useMemo(
    () => ({
      contextFile: ContextFileNode,
      stickyNote: StickyNoteNode,
      systemInstruction: SystemInstructionNode,
      package: PackageNode,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({ dependency: DependencyEdge }),
    [],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={GRID_GAP}
          size={1}
          color={COLOR_BORDER}
        />
        <Controls
          showInteractive={false}
          style={{ backgroundColor: COLOR_BG_SURFACE, borderColor: COLOR_BORDER }}
        />
        <MiniMap
          style={MINIMAP_STYLE}
          nodeColor={COLOR_ACCENT}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
