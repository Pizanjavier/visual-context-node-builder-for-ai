import { useCallback } from 'react';
import { useExportStore, type ExportFormat } from '../store/export-store';
import { useExtensionBridge } from '../hooks/useExtensionBridge';
import { formatTokenCount } from '../../shared/utils/token-estimator';

const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';
const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '400px',
  height: '100%',
  backgroundColor: '#1e1e1e',
  borderLeft: '1px solid #333333',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 20,
  fontFamily: UI_FONT,
  fontSize: '12px',
  color: '#e2e2e2',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  backgroundColor: '#252525',
  borderBottom: '1px solid #333333',
};

const headerLabel: React.CSSProperties = {
  fontFamily: UI_FONT,
  fontWeight: 600,
  fontSize: '11px',
  color: '#888888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const closeButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888888',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '2px 6px',
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0',
  padding: '0 14px',
  borderBottom: '1px solid #333333',
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #d97706' : '2px solid transparent',
  color: active ? '#e2e2e2' : '#888888',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: UI_FONT,
});

const previewStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '12px 14px',
  backgroundColor: '#141414',
  fontFamily: CODE_FONT,
  fontSize: '11px',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: '#c9d1d9',
};

const footerStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderTop: '1px solid #333333',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const outlinedButton: React.CSSProperties = {
  padding: '6px 14px',
  backgroundColor: 'transparent',
  border: '1px solid #333333',
  borderRadius: '2px',
  color: '#e2e2e2',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: UI_FONT,
};

const primaryButton: React.CSSProperties = {
  padding: '6px 14px',
  backgroundColor: '#d97706',
  border: '1px solid #d97706',
  borderRadius: '2px',
  color: '#1a1a1a',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: UI_FONT,
};

/** Slide-in export panel showing context preview and actions. */
export function ExportPanel(): React.ReactElement | null {
  const { isOpen, format, mdPreview, xmlPreview, tokenCount, close, setFormat } =
    useExportStore();
  const { postMessage } = useExtensionBridge();

  const currentPreview = format === 'md' ? mdPreview : xmlPreview;

  const onCopy = useCallback(() => {
    postMessage({ type: 'copyToClipboard', text: currentPreview });
  }, [postMessage, currentPreview]);

  const onSave = useCallback(() => {
    postMessage({ type: 'saveToFile', content: currentPreview, format });
  }, [postMessage, currentPreview, format]);

  const onTabClick = useCallback(
    (f: ExportFormat) => () => setFormat(f),
    [setFormat],
  );

  if (!isOpen) return null;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={headerLabel}>EXPORT CONTEXT</span>
        <button style={closeButton} onClick={close} type="button">
          &times;
        </button>
      </div>

      <div style={tabBarStyle}>
        <button style={tabStyle(format === 'md')} onClick={onTabClick('md')} type="button">
          Markdown
        </button>
        <button style={tabStyle(format === 'xml')} onClick={onTabClick('xml')} type="button">
          XML
        </button>
      </div>

      <div style={previewStyle}>{currentPreview}</div>

      <div style={footerStyle}>
        <span style={{ color: '#888888', fontFamily: CODE_FONT, fontSize: '11px' }}>
          {formatTokenCount(tokenCount)}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button style={primaryButton} onClick={onCopy} type="button">
            Copy to Clipboard
          </button>
          <button style={outlinedButton} onClick={onSave} type="button">
            Save to File
          </button>
        </div>
      </div>
    </div>
  );
}
