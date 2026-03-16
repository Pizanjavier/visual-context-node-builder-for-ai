import { create } from 'zustand';
import {
  FONT_UI, COLOR_BG_SURFACE, COLOR_BORDER, COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY,
  COLOR_ACCENT, COLOR_ACCENT_DARK, COLOR_OVERLAY,
} from '../theme/tokens';

const UI_FONT = FONT_UI;

type ConfirmState = {
  open: boolean;
  message: string;
  onConfirm: (() => void) | null;
  show: (message: string, onConfirm: () => void) => void;
  close: () => void;
};

/**
 * Store for the confirmation modal. Holds the message to display
 * and a callback to invoke when the user confirms the action.
 */
export const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  message: '',
  onConfirm: null,
  show: (message, onConfirm) => set({ open: true, message, onConfirm }),
  close: () => set({ open: false, message: '', onConfirm: null }),
}));

const overlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundColor: COLOR_OVERLAY,
  zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: COLOR_BG_SURFACE, border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '4px', padding: '20px', width: '300px', fontFamily: UI_FONT,
};

const msgStyle: React.CSSProperties = {
  fontSize: '13px', color: COLOR_TEXT_PRIMARY, marginBottom: '16px', lineHeight: '1.5',
};

const btnRow: React.CSSProperties = {
  display: 'flex', gap: '8px', justifyContent: 'flex-end',
};

const cancelBtn: React.CSSProperties = {
  padding: '6px 14px', backgroundColor: 'transparent', border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px', color: COLOR_TEXT_SECONDARY, fontSize: '12px', cursor: 'pointer', fontFamily: UI_FONT,
};

const confirmBtn: React.CSSProperties = {
  padding: '6px 14px', backgroundColor: COLOR_ACCENT, border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: '2px', color: COLOR_ACCENT_DARK, fontSize: '12px', fontWeight: 600,
  cursor: 'pointer', fontFamily: UI_FONT,
};

/** Reusable confirmation modal for the webview (replaces window.confirm). */
export function ConfirmModal(): React.ReactElement | null {
  const { open, message, onConfirm, close } = useConfirmStore();

  if (!open) return null;

  const handleConfirm = (): void => {
    if (onConfirm) onConfirm();
    close();
  };

  return (
    <div style={overlayStyle} onClick={close}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={msgStyle}>{message}</div>
        <div style={btnRow}>
          <button style={cancelBtn} type="button" onClick={close}>Cancel</button>
          <button style={confirmBtn} type="button" onClick={handleConfirm} autoFocus>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
