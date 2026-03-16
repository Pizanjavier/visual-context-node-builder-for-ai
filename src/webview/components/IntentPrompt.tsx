import { useCallback } from 'react';
import { useCanvasStore } from '../store/canvas-store';

const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';
const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const MAX_CHARS = 4000;

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '12px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min(600px, 80%)',
  zIndex: 10,
};

const labelStyle: React.CSSProperties = {
  fontFamily: UI_FONT,
  fontWeight: 600,
  fontSize: '11px',
  color: '#888888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '48px',
  maxHeight: '200px',
  padding: '10px 14px',
  backgroundColor: '#141414',
  border: '1px solid #2d2d2d',
  borderRadius: '2px',
  color: '#e2e2e2',
  fontSize: '12px',
  fontFamily: CODE_FONT,
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
};

const counterStyle: React.CSSProperties = {
  fontFamily: CODE_FONT,
  fontSize: '10px',
  color: '#555555',
  textAlign: 'right',
  marginTop: '2px',
};

/** Persistent text area for the user to describe their intent for the AI. */
export function IntentPrompt(): React.ReactElement {
  const intent = useCanvasStore((s) => s.intent);
  const setIntent = useCanvasStore((s) => s.setIntent);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_CHARS) {
        setIntent(value);
      }
    },
    [setIntent],
  );

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>YOUR REQUEST</div>
      <textarea
        style={textareaStyle}
        value={intent}
        onChange={onChange}
        placeholder="Describe your request for the AI..."
        maxLength={MAX_CHARS}
      />
      <div style={counterStyle}>
        {intent.length} / {MAX_CHARS} chars
      </div>
    </div>
  );
}
