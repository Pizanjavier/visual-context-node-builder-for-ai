import { useCanvasStore } from '../store/canvas-store';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 1,
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  maxWidth: '400px',
  padding: '32px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#555555',
  fontFamily: UI_FONT,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '20px',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#444444',
  fontFamily: UI_FONT,
  lineHeight: '2',
  marginBottom: '4px',
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  fontSize: '10px',
  fontFamily: CODE_FONT,
  color: '#555555',
  backgroundColor: '#2a2a2a',
  border: '1px solid #3a3a3a',
  borderRadius: '2px',
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? 'Cmd' : 'Ctrl';

/** Faint watermark-style hints shown when the canvas is empty. */
export function EmptyCanvasHints(): React.ReactElement | null {
  const nodeCount = useCanvasStore((s) => s.nodes.length);

  if (nodeCount > 0) return null;

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={titleStyle}>Empty Canvas</div>
        <div style={hintStyle}>
          Drop files from Explorer or click <strong>Add ▾</strong>
        </div>
        <div style={hintStyle}>
          Use <strong>System ▾</strong> templates for quick setup
        </div>
        <div style={hintStyle}>
          <span style={kbdStyle}>{mod}+S</span> to save as recipe
        </div>
        <div style={hintStyle}>
          <span style={kbdStyle}>Del</span> to remove selected nodes
        </div>
        <div style={hintStyle}>
          <span style={kbdStyle}>{mod}+A</span> to select all
        </div>
      </div>
    </div>
  );
}
