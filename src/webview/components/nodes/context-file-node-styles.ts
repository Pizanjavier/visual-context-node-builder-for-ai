// Implemented by: react-canvas agent

import {
  FONT_CODE, FONT_UI,
  COLOR_BG_SURFACE, COLOR_BG_ELEVATED, COLOR_BORDER,
  COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY,
  COLOR_ACCENT, COLOR_DANGER,
} from '../../theme/tokens';

export const CODE_FONT = FONT_CODE;
export const UI_FONT = FONT_UI;

export const nodeStyle: React.CSSProperties = {
  backgroundColor: COLOR_BG_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '3px',
  minWidth: '220px',
  maxWidth: '280px',
  fontFamily: UI_FONT,
  fontSize: '12px',
  color: COLOR_TEXT_PRIMARY,
  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  overflow: 'hidden',
};

export const headerStyle: React.CSSProperties = {
  height: '36px',
  backgroundColor: COLOR_BG_ELEVATED,
  padding: '0 12px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

export const fileNameStyle: React.CSSProperties = {
  fontFamily: CODE_FONT,
  fontWeight: 600,
  fontSize: '13px',
  color: COLOR_TEXT_PRIMARY,
  lineHeight: '1.2',
};

export const pathStyle: React.CSSProperties = {
  fontFamily: CODE_FONT,
  fontSize: '11px',
  color: COLOR_TEXT_SECONDARY,
  padding: '4px 12px 6px',
  wordBreak: 'break-all',
};

export const sectionLabelStyle: React.CSSProperties = {
  fontFamily: UI_FONT,
  fontWeight: 600,
  fontSize: '11px',
  color: COLOR_TEXT_SECONDARY,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '6px 12px 4px',
};

export const symbolRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 12px',
  fontSize: '11px',
};

export const kindBadgeStyle: React.CSSProperties = {
  fontSize: '9px',
  padding: '1px 4px',
  borderRadius: '2px',
  backgroundColor: COLOR_BG_ELEVATED,
  border: `1px solid ${COLOR_BORDER}`,
  color: COLOR_TEXT_SECONDARY,
  textTransform: 'uppercase',
  fontFamily: CODE_FONT,
};

export const handleStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  backgroundColor: COLOR_ACCENT,
  border: `2px solid ${COLOR_BG_SURFACE}`,
};

export const actionBtnStyle: React.CSSProperties = {
  padding: '3px 8px',
  backgroundColor: 'transparent',
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px',
  color: COLOR_TEXT_PRIMARY,
  fontSize: '11px',
  cursor: 'pointer',
  fontFamily: UI_FONT,
};

export const redactedLabelStyle: React.CSSProperties = {
  fontFamily: UI_FONT,
  fontWeight: 600,
  fontSize: '10px',
  color: COLOR_DANGER,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '2px 12px 6px',
};

export const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: COLOR_TEXT_SECONDARY,
  fontSize: '14px',
  cursor: 'pointer',
  padding: '0 2px',
  lineHeight: 1,
};
