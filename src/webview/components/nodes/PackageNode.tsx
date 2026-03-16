import { memo, useState, useCallback } from 'react';
import { type NodeProps } from '@xyflow/react';
import type { PackageNodeData } from '../../../shared/types/nodes';

import {
  FONT_UI, FONT_CODE,
  COLOR_PACKAGE, COLOR_PACKAGE_BG, COLOR_PACKAGE_BORDER, COLOR_PACKAGE_TEXT,
  COLOR_PACKAGE_NAME, COLOR_PACKAGE_VERSION, COLOR_PACKAGE_HANDLE,
} from '../../theme/tokens';

type Props = NodeProps & { data: PackageNodeData };

const nodeStyle: React.CSSProperties = {
  backgroundColor: COLOR_PACKAGE_BG,
  border: `1px solid ${COLOR_PACKAGE_BORDER}`,
  borderLeft: `3px solid ${COLOR_PACKAGE}`,
  borderRadius: '3px',
  padding: '0 10px 8px',
  minWidth: '180px',
  maxWidth: '260px',
  fontFamily: FONT_UI,
  fontSize: '12px',
  color: COLOR_PACKAGE_TEXT,
};

const dragHandleStyle: React.CSSProperties = {
  width: '32px',
  height: '4px',
  backgroundColor: COLOR_PACKAGE_HANDLE,
  borderRadius: '2px',
  margin: '6px auto 0',
};

const headerStyle: React.CSSProperties = {
  fontFamily: FONT_UI,
  fontWeight: 600,
  fontSize: '10px',
  color: COLOR_PACKAGE,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '8px 0 2px',
};

const nameStyle: React.CSSProperties = {
  fontFamily: FONT_CODE,
  fontSize: '13px',
  fontWeight: 500,
  color: COLOR_PACKAGE_NAME,
  wordBreak: 'break-all',
};

const versionStyle: React.CSSProperties = {
  fontFamily: FONT_CODE,
  fontSize: '10px',
  color: COLOR_PACKAGE_VERSION,
  marginTop: '2px',
};

const previewBtn: React.CSSProperties = {
  marginTop: '6px',
  padding: '3px 8px',
  backgroundColor: 'transparent',
  border: `1px solid ${COLOR_PACKAGE_BORDER}`,
  borderRadius: '2px',
  color: COLOR_PACKAGE_VERSION,
  fontSize: '10px',
  cursor: 'pointer',
  fontFamily: FONT_UI,
  width: '100%',
};

const previewStyle: React.CSSProperties = {
  marginTop: '6px',
  maxHeight: '120px',
  overflow: 'auto',
  fontFamily: FONT_CODE,
  fontSize: '10px',
  color: '#999999',
  whiteSpace: 'pre',
  lineHeight: '1.4',
};

/** Node showing a node_modules package type reference. */
export const PackageNode = memo(function PackageNode({
  data,
  selected,
}: Props): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  const lines = data.typesContent.split('\n').length;

  return (
    <div style={{
      ...nodeStyle,
      border: selected ? `1.5px solid ${COLOR_PACKAGE}` : nodeStyle.border,
      borderLeft: `3px solid ${COLOR_PACKAGE}`,
      boxShadow: selected
        ? `0 0 0 1.5px ${COLOR_PACKAGE}, 0 2px 8px rgba(0,0,0,0.6)`
        : '0 1px 3px rgba(0,0,0,0.4)',
    }}>
      <div style={dragHandleStyle} />
      <div style={headerStyle}>Package</div>
      <div style={nameStyle}>{data.packageName}</div>
      <div style={versionStyle}>
        v{data.version} · {data.typesEntry} · {lines} lines
      </div>
      <button style={previewBtn} type="button" onClick={toggle}>
        {expanded ? 'Hide types' : 'Show types'}
      </button>
      {expanded && (
        <div style={previewStyle}>{data.typesContent}</div>
      )}
    </div>
  );
});
