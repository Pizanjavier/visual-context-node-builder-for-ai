// Implemented by: react-canvas agent

import {
  FONT_UI,
  COLOR_BG_ELEVATED,
  COLOR_BORDER,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_ACCENT,
} from '../../theme/tokens';

export const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: 0,
  marginBottom: '4px',
  backgroundColor: COLOR_BG_ELEVATED,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '3px',
  padding: '8px 10px',
  fontFamily: FONT_UI,
  fontSize: '11px',
  color: COLOR_TEXT_PRIMARY,
  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  zIndex: 10,
  minWidth: '140px',
};

export const popoverTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '10px',
  color: COLOR_TEXT_SECONDARY,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

export const popoverRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 0',
  cursor: 'pointer',
};

export const popoverCheckboxStyle: React.CSSProperties = {
  accentColor: COLOR_ACCENT,
  cursor: 'pointer',
};

export const expandBtnStyle: React.CSSProperties = {
  marginTop: '6px',
  padding: '3px 8px',
  backgroundColor: 'transparent',
  border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: '2px',
  color: COLOR_ACCENT,
  fontSize: '11px',
  cursor: 'pointer',
  fontFamily: FONT_UI,
  width: '100%',
};
