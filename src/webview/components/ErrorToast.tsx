import { useEffect, useCallback } from 'react';
import { useErrorStore } from '../store/error-store';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  backgroundColor: '#252525',
  border: '1px solid #dc2626',
  borderRadius: '3px',
  color: '#e2e2e2',
  fontFamily: UI_FONT,
  fontSize: '12px',
  maxWidth: '400px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888888',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '0 2px',
  lineHeight: 1,
  flexShrink: 0,
};

const AUTO_DISMISS_MS = 5000;

/** Toast notification for extension host errors. Positioned bottom-left. */
// Implemented by: react-canvas agent
export function ErrorToast(): React.ReactElement | null {
  const message = useErrorStore((s) => s.message);
  const dismiss = useErrorStore((s) => s.dismiss);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, dismiss]);

  const onClose = useCallback(() => {
    dismiss();
  }, [dismiss]);

  if (!message) return null;

  return (
    <div style={toastStyle}>
      <span style={{ flex: 1 }}>{message}</span>
      <button type="button" style={closeBtnStyle} onClick={onClose}>
        &times;
      </button>
    </div>
  );
}
