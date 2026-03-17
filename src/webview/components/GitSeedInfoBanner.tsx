import { useCallback, useMemo } from 'react';
import { useGitSeedStore } from '../store/git-seed-store';
import { useGitDependentsStore } from '../store/git-dependents-store';
import type { GitDiffSource } from '../../shared/types/git';
import {
  FONT_UI, FONT_CODE,
  COLOR_BG_SURFACE, COLOR_BORDER, COLOR_TEXT_SECONDARY, COLOR_ACCENT,
} from '../theme/tokens';

const bannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  height: '32px',
  padding: '0 12px',
  backgroundColor: COLOR_BG_SURFACE,
  borderBottom: `1px solid ${COLOR_BORDER}`,
  fontFamily: FONT_UI,
  fontSize: '11px',
  color: COLOR_TEXT_SECONDARY,
  flexShrink: 0,
};

const iconStyle: React.CSSProperties = {
  fontFamily: FONT_CODE,
  fontSize: '13px',
  lineHeight: 1,
};

const dismissStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: COLOR_TEXT_SECONDARY,
  fontSize: '14px',
  cursor: 'pointer',
  padding: '0 2px',
  lineHeight: 1,
};

const depLinkStyle: React.CSSProperties = {
  color: COLOR_ACCENT,
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  background: 'none',
  border: 'none',
  font: 'inherit',
  padding: 0,
};

function describeSource(source: GitDiffSource): string {
  switch (source.kind) {
    case 'staged': return 'Staged changes';
    case 'unstaged': return 'Unstaged changes';
    case 'commit': return `Commit ${source.commitHash.slice(0, 7)}`;
    case 'range': return `${source.fromRef}..${source.toRef}`;
  }
}

/** Dismissible info banner shown after a git seed completes. */
export function GitSeedInfoBanner(): React.ReactElement | null {
  const result = useGitSeedStore((s) => s.seedResult);
  const dismissed = useGitSeedStore((s) => s.bannerDismissed);
  const dismissBanner = useGitSeedStore((s) => s.dismissBanner);
  const openPanel = useGitDependentsStore((s) => s.openPanel);

  const counts = useMemo(() => {
    if (!result) return null;
    const fileCount = result.changedFiles.length;
    const symbolCount = result.changedFiles.reduce((sum, f) => sum + f.changedSymbols.length, 0);
    const depPaths = new Set<string>();
    for (const deps of Object.values(result.reverseDependencies)) {
      for (const dep of deps) depPaths.add(dep.relativePath);
    }
    return { source: describeSource(result.source), fileCount, symbolCount, depCount: depPaths.size };
  }, [result]);

  const onDepClick = useCallback(() => { openPanel(); }, [openPanel]);

  if (!result || dismissed || !counts) return null;

  return (
    <div style={bannerStyle}>
      <span style={iconStyle}>{'\u2387'}</span>
      <span>
        Seeded from: {counts.source} &middot; {counts.fileCount} files &middot; {counts.symbolCount} symbols &middot;{' '}
        <button type="button" style={depLinkStyle} onClick={onDepClick}>
          {counts.depCount} dependents
        </button>
      </span>
      <button type="button" onClick={dismissBanner} style={dismissStyle}>
        &times;
      </button>
    </div>
  );
}
