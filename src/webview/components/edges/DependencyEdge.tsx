import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

const EDGE_COLOR = '#555555';
const EDGE_WIDTH = 1.5;

/** A smooth-step edge representing an import dependency between files. */
export const DependencyEdge = memo(function DependencyEdge(
  props: EdgeProps,
): React.ReactElement {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  });

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      style={{
        stroke: EDGE_COLOR,
        strokeWidth: EDGE_WIDTH,
        opacity: 0.6,
      }}
    />
  );
});
