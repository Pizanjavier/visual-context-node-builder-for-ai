import { useCallback, useRef, useState } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useExtensionBridge } from '../hooks/useExtensionBridge';
import { useGitSeedStore } from '../store/git-seed-store';
import {
  FONT_UI,
  COLOR_BG_ELEVATED, COLOR_BORDER, COLOR_TEXT_PRIMARY, COLOR_ACCENT,
} from '../theme/tokens';

const buttonStyle: React.CSSProperties = {
  padding: '4px 10px', backgroundColor: 'transparent', border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: '2px', color: COLOR_ACCENT, fontSize: '12px', cursor: 'pointer',
  fontFamily: FONT_UI, position: 'relative',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, marginTop: '4px',
  backgroundColor: COLOR_BG_ELEVATED, border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px', zIndex: 20, minWidth: '120px',
};

const itemStyle: React.CSSProperties = {
  padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: COLOR_TEXT_PRIMARY,
  fontFamily: FONT_UI, backgroundColor: 'transparent', border: 'none',
  width: '100%', textAlign: 'left', display: 'block',
};

/** Dropdown button for git seed options: Staged, Unstaged, Pick Commit. */
// Implemented by: react-canvas agent
export function GitSeedMenu(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));
  const requestGitSeed = useGitSeedStore((s) => s.requestGitSeed);
  const { postMessage } = useExtensionBridge();

  const onStaged = useCallback(() => {
    const source = { kind: 'staged' as const };
    requestGitSeed(source);
    postMessage({ type: 'requestGitSeed', source });
    setOpen(false);
  }, [requestGitSeed, postMessage]);

  const onUnstaged = useCallback(() => {
    const source = { kind: 'unstaged' as const };
    requestGitSeed(source);
    postMessage({ type: 'requestGitSeed', source });
    setOpen(false);
  }, [requestGitSeed, postMessage]);

  const onPickCommit = useCallback(() => {
    postMessage({ type: 'requestGitSeedFromCommit' });
    setOpen(false);
  }, [postMessage]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button style={buttonStyle} type="button" onClick={() => setOpen(!open)}>
        Seed from Git &#x25BE;
      </button>
      {open && (
        <div style={dropdownStyle}>
          <button style={itemStyle} type="button" onClick={onStaged}>Staged</button>
          <button style={itemStyle} type="button" onClick={onUnstaged}>Unstaged</button>
          <button style={itemStyle} type="button" onClick={onPickCommit}>Pick Commit</button>
        </div>
      )}
    </div>
  );
}
