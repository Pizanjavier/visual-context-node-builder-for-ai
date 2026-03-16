import { useHelpStore } from '../store/help-store';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 50,
  display: 'flex',
  justifyContent: 'flex-end',
};

const panelStyle: React.CSSProperties = {
  width: '340px',
  height: '100%',
  backgroundColor: '#1e1e1e',
  borderLeft: '1px solid #333333',
  padding: '16px',
  fontFamily: UI_FONT,
  color: '#e2e2e2',
  overflowY: 'auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const closeBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888888',
  fontSize: '16px',
  cursor: 'pointer',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#888888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
  marginTop: '16px',
};

const tipStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#cccccc',
  lineHeight: '1.7',
  marginBottom: '4px',
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  fontSize: '10px',
  fontFamily: CODE_FONT,
  color: '#cccccc',
  backgroundColor: '#2a2a2a',
  border: '1px solid #3a3a3a',
  borderRadius: '2px',
  marginLeft: '2px',
  marginRight: '2px',
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? 'Cmd' : 'Ctrl';

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid #333333',
  margin: '16px 0',
};

const resetBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid #333333',
  color: '#888888',
  fontSize: '11px',
  cursor: 'pointer',
  padding: '4px 10px',
  borderRadius: '2px',
  fontFamily: UI_FONT,
  marginTop: '8px',
};

/** Slide-in help panel with quick-start guide and keyboard shortcuts. */
export function HelpPanel(): React.ReactElement | null {
  const helpOpen = useHelpStore((s) => s.helpOpen);
  const closeHelp = useHelpStore((s) => s.closeHelp);
  const resetTips = useHelpStore((s) => s.resetTips);

  if (!helpOpen) return null;

  return (
    <div style={overlayStyle} onClick={closeHelp}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={titleStyle}>Quick Start</span>
          <button style={closeBtn} type="button" onClick={closeHelp}>
            ✕
          </button>
        </div>

        <div style={sectionTitle}>Getting Started</div>
        <div style={tipStyle}>
          1. <strong>Add files</strong> — drag from Explorer or use Add ▾ → File
        </div>
        <div style={tipStyle}>
          2. <strong>Add context</strong> — notes, system instructions, or packages
        </div>
        <div style={tipStyle}>
          3. <strong>Arrange</strong> — vertical position = export order (top → bottom)
        </div>
        <div style={tipStyle}>
          4. <strong>Generate</strong> — click Generate Context to export
        </div>

        <div style={sectionTitle}>Node Types</div>
        <div style={tipStyle}>
          <strong>File</strong> — source code with dependency resolution
        </div>
        <div style={tipStyle}>
          <strong>Note</strong> — freeform text annotation
        </div>
        <div style={tipStyle}>
          <strong>System</strong> — AI system instruction (appears first in export)
        </div>
        <div style={tipStyle}>
          <strong>Package</strong> — type definitions from node_modules
        </div>

        <div style={sectionTitle}>Keyboard Shortcuts</div>
        <div style={tipStyle}>
          <span style={kbdStyle}>{mod}+S</span> Save as recipe
        </div>
        <div style={tipStyle}>
          <span style={kbdStyle}>{mod}+A</span> Select all nodes
        </div>
        <div style={tipStyle}>
          <span style={kbdStyle}>Del</span> Remove selected nodes
        </div>
        <div style={tipStyle}>
          <span style={kbdStyle}>Esc</span> Deselect all
        </div>

        <div style={sectionTitle}>Tips</div>
        <div style={tipStyle}>
          Nodes higher on the canvas appear first in the exported context.
        </div>
        <div style={tipStyle}>
          File content is re-read from disk when loading recipes — always fresh.
        </div>
        <div style={tipStyle}>
          Connect nodes with edges to show file relationships in the export.
        </div>
        <div style={tipStyle}>
          Use system templates for common tasks like code review or refactoring.
        </div>

        <div style={dividerStyle} />
        <button style={resetBtn} type="button" onClick={resetTips}>
          Reset toolbar tooltips
        </button>
      </div>
    </div>
  );
}
