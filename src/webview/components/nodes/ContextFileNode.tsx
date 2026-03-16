import { memo, useCallback, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ContextFileNodeData } from '../../../shared/types/nodes';
import { useCanvasStore } from '../../store/canvas-store';
import { useDepFilterStore } from '../../store/dep-filter-store';
import { useExtensionBridge } from '../../hooks/useExtensionBridge';
import { DepFilterPopover } from './DepFilterPopover';
import {
  nodeStyle,
  headerStyle,
  fileNameStyle,
  pathStyle,
  sectionLabelStyle,
  symbolRowStyle,
  kindBadgeStyle,
  handleStyle,
  actionBtnStyle,
  redactedLabelStyle,
  closeBtnStyle,
} from './context-file-node-styles';
import {
  COLOR_ACCENT, COLOR_BORDER, COLOR_DANGER, COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY,
  COLOR_BORDER_SUBTLE,
} from '../../theme/tokens';

type Props = NodeProps & { data: ContextFileNodeData };

/** A node representing a source code file with selectable symbols. */
// Implemented by: react-canvas agent
export const ContextFileNode = memo(function ContextFileNode({
  id,
  data,
  selected,
}: Props): React.ReactElement {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const removeNodes = useCanvasStore((s) => s.removeNodes);
  const categoryFilter = useDepFilterStore((s) => s.filter);
  const { postMessage } = useExtensionBridge();
  const [showFilter, setShowFilter] = useState(false);

  const toggleFilterPopover = useCallback(() => {
    if (data.depsExpanded) {
      updateNodeData(id, { depsExpanded: false });
    } else {
      setShowFilter((prev) => !prev);
    }
  }, [data.depsExpanded, id, updateNodeData]);

  const onExpandDeps = useCallback(() => {
    postMessage({
      type: 'expandDependencies',
      filePath: data.filePath,
      nodeId: id,
      categoryFilter,
    });
    updateNodeData(id, { depsExpanded: true });
    setShowFilter(false);
  }, [postMessage, data.filePath, id, categoryFilter, updateNodeData]);

  const onRemove = useCallback(() => {
    removeNodes([id]);
  }, [id, removeNodes]);

  const toggleRedacted = useCallback(() => {
    updateNodeData(id, { redacted: !data.redacted });
  }, [id, data.redacted, updateNodeData]);

  const toggleSymbol = useCallback(
    (symbolName: string) => {
      const isSelected = data.selectedSymbols.includes(symbolName);
      const next = isSelected
        ? data.selectedSymbols.filter((s) => s !== symbolName)
        : [...data.selectedSymbols, symbolName];
      updateNodeData(id, { selectedSymbols: next });
    },
    [id, data.selectedSymbols, updateNodeData],
  );

  const style: React.CSSProperties = {
    ...nodeStyle,
    ...(selected ? {
      border: `1.5px solid ${COLOR_ACCENT}`,
      boxShadow: `0 0 0 1.5px ${COLOR_ACCENT}, 0 2px 8px rgba(0,0,0,0.6)`,
    } : {}),
    ...(data.redacted ? { borderLeft: `3px solid ${COLOR_DANGER}` } : {}),
  };

  return (
    <div style={style}>
      <Handle type="target" position={Position.Left} style={handleStyle} />

      <div style={{ ...headerStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={fileNameStyle}>
          {data.redacted ? <s>{data.fileName}</s> : data.fileName}
        </div>
        <button type="button" onClick={onRemove} style={closeBtnStyle}>
          &times;
        </button>
      </div>
      <div style={pathStyle}>{data.relativePath}</div>

      {data.redacted && <div style={redactedLabelStyle}>CONTENT HIDDEN</div>}

      {data.symbols.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLOR_BORDER}`, paddingBottom: '6px' }}>
          <div style={sectionLabelStyle}>EXPORTED SYMBOLS</div>
          {data.symbols.map((sym) => (
            <label key={sym.name} style={symbolRowStyle}>
              <input
                type="checkbox"
                checked={data.selectedSymbols.includes(sym.name)}
                onChange={() => toggleSymbol(sym.name)}
                style={{ accentColor: COLOR_ACCENT, cursor: 'pointer' }}
              />
              <span style={kindBadgeStyle}>{sym.kind.slice(0, 3)}</span>
              <span style={{
                textDecoration: data.redacted ? 'line-through' : 'none',
                color: sym.exported ? COLOR_TEXT_PRIMARY : COLOR_TEXT_SECONDARY,
              }}>
                {sym.name}
              </span>
            </label>
          ))}
        </div>
      )}

      <div style={{
        padding: '6px 12px 8px',
        borderTop: `1px solid ${COLOR_BORDER}`,
        display: 'flex',
        gap: '6px',
      }}>
        <div style={{ position: 'relative' }}>
          {showFilter && <DepFilterPopover onExpand={onExpandDeps} />}
          <button
            type="button"
            onClick={toggleFilterPopover}
            style={{
              ...actionBtnStyle,
              ...(data.depsExpanded ? { color: COLOR_TEXT_SECONDARY, borderColor: COLOR_BORDER_SUBTLE } : {}),
            }}
          >
            {data.depsExpanded ? 'Deps Expanded' : 'Expand Deps'}
          </button>
        </div>
        <button
          type="button"
          onClick={toggleRedacted}
          style={{
            ...actionBtnStyle,
            color: data.redacted ? COLOR_DANGER : COLOR_TEXT_PRIMARY,
            borderColor: data.redacted ? COLOR_DANGER : COLOR_BORDER,
          }}
        >
          {data.redacted ? 'Show Content' : 'Hide Content'}
        </button>
      </div>

      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
});
