import { useGitSeedStore } from '../store/git-seed-store';
import {
  FONT_UI,
  COLOR_BG_ELEVATED, COLOR_ACCENT, COLOR_TEXT_SECONDARY, COLOR_BORDER,
} from '../theme/tokens';

const containerStyle: React.CSSProperties = {
  flexShrink: 0,
  borderBottom: `1px solid ${COLOR_BORDER}`,
};

const trackStyle: React.CSSProperties = {
  height: '3px',
  backgroundColor: COLOR_BG_ELEVATED,
  width: '100%',
};

const fillBaseStyle: React.CSSProperties = {
  height: '3px',
  backgroundColor: COLOR_ACCENT,
  transition: 'width 200ms ease-out',
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 12px',
  fontFamily: FONT_UI,
  fontSize: '11px',
  color: COLOR_TEXT_SECONDARY,
};

const cancelBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: COLOR_TEXT_SECONDARY,
  fontSize: '11px',
  cursor: 'pointer',
  padding: '0 4px',
  fontFamily: FONT_UI,
};

/** Amber progress bar shown during git seed scanning. */
// Implemented by: react-canvas agent
export function ScanProgressBar(): React.ReactElement | null {
  const isSeeding = useGitSeedStore((s) => s.isSeeding);
  const progress = useGitSeedStore((s) => s.seedProgress);
  const clearSeed = useGitSeedStore((s) => s.clearSeed);

  if (!isSeeding) return null;

  const percent = progress?.percent ?? 0;
  const step = progress?.step ?? 'Scanning...';

  const fillStyle: React.CSSProperties = {
    ...fillBaseStyle,
    width: `${Math.max(2, percent)}%`,
  };

  return (
    <div style={containerStyle}>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
      <div style={infoRowStyle}>
        <span>{step}</span>
        <span>{percent}%</span>
        <button type="button" onClick={clearSeed} style={cancelBtnStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}
