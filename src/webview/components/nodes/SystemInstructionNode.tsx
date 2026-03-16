import { memo, useCallback, useState } from 'react';
import { type NodeProps, useNodeId } from '@xyflow/react';
import type { SystemInstructionNodeData } from '../../../shared/types/nodes';
import { useCanvasStore } from '../../store/canvas-store';
import {
  FONT_UI, COLOR_SYSTEM, COLOR_SYSTEM_BG, COLOR_SYSTEM_BORDER, COLOR_SYSTEM_TEXT, COLOR_SYSTEM_HANDLE,
} from '../../theme/tokens';

type Props = NodeProps & { data: SystemInstructionNodeData };

const nodeStyle: React.CSSProperties = {
  backgroundColor: COLOR_SYSTEM_BG,
  border: `1px solid ${COLOR_SYSTEM_BORDER}`,
  borderLeft: `3px solid ${COLOR_SYSTEM}`,
  borderRadius: '3px',
  padding: '0 10px 8px',
  minWidth: '200px',
  maxWidth: '280px',
  fontFamily: FONT_UI,
  fontSize: '12px',
  color: COLOR_SYSTEM_TEXT,
};

const headerStyle: React.CSSProperties = {
  fontFamily: FONT_UI,
  fontWeight: 600,
  fontSize: '10px',
  color: COLOR_SYSTEM,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '8px 0 4px',
};

const dragHandleStyle: React.CSSProperties = {
  width: '32px',
  height: '4px',
  backgroundColor: COLOR_SYSTEM_HANDLE,
  borderRadius: '2px',
  margin: '6px auto 0',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  backgroundColor: 'transparent',
  border: 'none',
  color: COLOR_SYSTEM_TEXT,
  fontSize: '12px',
  fontFamily: FONT_UI,
  resize: 'vertical',
  outline: 'none',
};

/** System instruction node for prompt workbench. */
export const SystemInstructionNode = memo(function SystemInstructionNode({
  data,
  selected,
}: Props): React.ReactElement {
  const nodeId = useNodeId();
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const [text, setText] = useState(data.text);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setText(newValue);
      if (nodeId) {
        updateNodeData(nodeId, { text: newValue });
      }
    },
    [nodeId, updateNodeData],
  );

  return (
    <div style={{
      ...nodeStyle,
      border: selected ? `1.5px solid ${COLOR_SYSTEM}` : nodeStyle.border,
      borderLeft: `3px solid ${COLOR_SYSTEM}`,
      boxShadow: selected
        ? `0 0 0 1.5px ${COLOR_SYSTEM}, 0 2px 8px rgba(0,0,0,0.6)`
        : '0 1px 3px rgba(0,0,0,0.4)',
    }}>
      <div style={dragHandleStyle} />
      <div style={headerStyle}>System</div>
      <textarea
        style={textareaStyle}
        value={text}
        onChange={onChange}
        placeholder="Enter system instructions..."
      />
    </div>
  );
});
