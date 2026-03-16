import { memo, useCallback, useState } from 'react';
import { type NodeProps, useNodeId } from '@xyflow/react';
import type { StickyNoteNodeData } from '../../../shared/types/nodes';
import { useCanvasStore } from '../../store/canvas-store';
import {
  FONT_UI, COLOR_NOTE_BG, COLOR_NOTE_BORDER, COLOR_NOTE_TEXT, COLOR_NOTE_HANDLE, COLOR_ACCENT,
} from '../../theme/tokens';

type Props = NodeProps & { data: StickyNoteNodeData };

const noteStyle: React.CSSProperties = {
  backgroundColor: COLOR_NOTE_BG,
  border: `1px solid ${COLOR_NOTE_BORDER}`,
  borderRadius: '3px',
  padding: '0 10px 8px',
  minWidth: '160px',
  maxWidth: '220px',
  fontFamily: FONT_UI,
  fontSize: '12px',
  color: COLOR_NOTE_TEXT,
};

const dragHandleStyle: React.CSSProperties = {
  width: '32px',
  height: '4px',
  backgroundColor: COLOR_NOTE_HANDLE,
  borderRadius: '2px',
  margin: '6px auto 6px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '60px',
  backgroundColor: 'transparent',
  border: 'none',
  color: COLOR_NOTE_TEXT,
  fontSize: '12px',
  fontFamily: FONT_UI,
  resize: 'vertical',
  outline: 'none',
};

/** A minimal sticky note for annotation on the canvas. */
export const StickyNoteNode = memo(function StickyNoteNode({
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
      ...noteStyle,
      border: selected
        ? `1.5px solid ${COLOR_ACCENT}`
        : noteStyle.border,
      boxShadow: selected
        ? `0 0 0 1.5px ${COLOR_ACCENT}, 0 2px 8px rgba(0,0,0,0.6)`
        : '0 1px 3px rgba(0,0,0,0.4)',
    }}>
      <div style={dragHandleStyle} />
      <textarea
        style={textareaStyle}
        value={text}
        onChange={onChange}
        placeholder="Add a note..."
      />
    </div>
  );
});
