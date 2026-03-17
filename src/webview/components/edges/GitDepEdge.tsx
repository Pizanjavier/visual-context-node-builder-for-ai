import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { FONT_CODE, COLOR_BG_SURFACE, COLOR_BORDER_SUBTLE, COLOR_TEXT_MUTED } from '../../theme/tokens';

const EDGE_COLOR = '#555555';
const DASH_PATTERN = '4 4';

const labelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontFamily: FONT_CODE,
  color: COLOR_TEXT_MUTED,
  backgroundColor: COLOR_BG_SURFACE,
  border: `1px solid ${COLOR_BORDER_SUBTLE}`,
  borderRadius: '3px',
  padding: '1px 5px',
  pointerEvents: 'none',
};

/** Dashed bezier edge for git reverse dependency connections. */
// Implemented by: react-canvas agent
export const GitDepEdge = memo(function GitDepEdge(
  props: EdgeProps,
): React.ReactElement {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  });

  const symbolName = (props.data as Record<string, unknown> | undefined)?.['symbolName'];
  const label = typeof symbolName === 'string' ? `uses ${symbolName}` : 'uses';

  return (
    <>
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: EDGE_COLOR,
          strokeWidth: 1,
          strokeDasharray: DASH_PATTERN,
          opacity: 0.7,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            ...labelStyle,
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
