import { useCallback, useMemo } from 'react';
import { useGitSeedStore } from '../store/git-seed-store';
import { useGitDependentsStore } from '../store/git-dependents-store';
import { useCanvasStore } from '../store/canvas-store';
import { useExtensionBridge } from '../hooks/useExtensionBridge';
import type { ContextFileNodeData } from '../../shared/types/nodes';
import type { ReverseDependency } from '../../shared/types/git';
import {
  FONT_UI, FONT_CODE,
  COLOR_BG_ELEVATED, COLOR_BG_SURFACE, COLOR_BORDER,
  COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY, COLOR_TEXT_MUTED,
  COLOR_ACCENT, COLOR_ACCENT_DARK,
} from '../theme/tokens';

type GroupedDep = {
  dir: string;
  files: Array<{ relativePath: string; filePath: string; symbols: string[] }>;
};

const panelStyle: React.CSSProperties = {
  position: 'absolute', top: 0, right: 0, width: '320px', height: '100%',
  backgroundColor: COLOR_BG_ELEVATED, borderLeft: `1px solid ${COLOR_BORDER}`,
  display: 'flex', flexDirection: 'column', zIndex: 20,
  fontFamily: FONT_UI, fontSize: '12px', color: COLOR_TEXT_PRIMARY,
};
const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '10px 14px', backgroundColor: COLOR_BG_SURFACE,
  borderBottom: `1px solid ${COLOR_BORDER}`, fontWeight: 600, fontSize: '11px',
  color: COLOR_TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const closeBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: COLOR_TEXT_SECONDARY,
  fontSize: '16px', cursor: 'pointer', padding: '2px 6px',
};
const listStyle: React.CSSProperties = {
  flex: 1, overflow: 'auto', padding: '8px 0',
};
const groupHeader: React.CSSProperties = {
  padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
  gap: '6px', color: COLOR_TEXT_SECONDARY, fontSize: '11px', fontFamily: FONT_CODE,
};
const fileRow: React.CSSProperties = {
  padding: '4px 14px 4px 28px', display: 'flex', alignItems: 'center', gap: '6px',
};
const symLabel: React.CSSProperties = {
  fontSize: '10px', color: COLOR_TEXT_MUTED, fontFamily: FONT_CODE, marginLeft: '4px',
};
const footerStyle: React.CSSProperties = {
  padding: '10px 14px', borderTop: `1px solid ${COLOR_BORDER}`,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const addBtn: React.CSSProperties = {
  padding: '6px 14px', backgroundColor: COLOR_ACCENT, border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: '2px', color: COLOR_ACCENT_DARK, fontSize: '12px', fontWeight: 600,
  cursor: 'pointer', fontFamily: FONT_UI,
};
const selectAllBtn: React.CSSProperties = {
  padding: '4px 10px', backgroundColor: 'transparent', border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px', color: COLOR_TEXT_SECONDARY, fontSize: '11px', cursor: 'pointer',
  fontFamily: FONT_UI,
};

/** Sidebar panel showing reverse dependents grouped by directory. */
export function GitDependentsPanel(): React.ReactElement | null {
  const panelOpen = useGitDependentsStore((s) => s.panelOpen);
  const closePanel = useGitDependentsStore((s) => s.closePanel);
  const selectedPaths = useGitDependentsStore((s) => s.selectedPaths);
  const togglePath = useGitDependentsStore((s) => s.togglePath);
  const selectAllPaths = useGitDependentsStore((s) => s.selectAllPaths);
  const deselectAllPaths = useGitDependentsStore((s) => s.deselectAllPaths);
  const collapsedGroups = useGitDependentsStore((s) => s.collapsedGroups);
  const toggleGroup = useGitDependentsStore((s) => s.toggleGroup);
  const seedResult = useGitSeedStore((s) => s.seedResult);
  const addNode = useCanvasStore((s) => s.addNode);
  const addEdge = useCanvasStore((s) => s.addEdge);
  const nodes = useCanvasStore((s) => s.nodes);
  const { postMessage } = useExtensionBridge();

  const groups = useMemo((): GroupedDep[] => {
    if (!seedResult) return [];
    const depMap = new Map<string, { relativePath: string; filePath: string; symbols: Set<string> }>();
    for (const [key, deps] of Object.entries(seedResult.reverseDependencies)) {
      const symbolName = key.split('::')[1] ?? key;
      for (const dep of deps) {
        const existing = depMap.get(dep.relativePath);
        if (existing) { existing.symbols.add(symbolName); }
        else { depMap.set(dep.relativePath, { relativePath: dep.relativePath, filePath: dep.filePath, symbols: new Set([symbolName]) }); }
      }
    }
    const byDir = new Map<string, GroupedDep['files']>();
    for (const dep of depMap.values()) {
      const parts = dep.relativePath.split('/');
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
      const list = byDir.get(dir) ?? [];
      list.push({ relativePath: dep.relativePath, filePath: dep.filePath, symbols: [...dep.symbols] });
      byDir.set(dir, list);
    }
    return [...byDir.entries()]
      .map(([dir, files]) => ({ dir, files: files.sort((a, b) => a.relativePath.localeCompare(b.relativePath)) }))
      .sort((a, b) => a.dir.localeCompare(b.dir));
  }, [seedResult]);

  const allPaths = useMemo(() => groups.flatMap((g) => g.files.map((f) => f.relativePath)), [groups]);
  const existingSet = useMemo(() => {
    const paths = new Set<string>();
    for (const n of nodes) {
      if (n.type === 'contextFile') {
        const rp = (n.data as Record<string, unknown>)['relativePath'] as string | undefined;
        const fp = (n.data as Record<string, unknown>)['filePath'] as string | undefined;
        if (rp) paths.add(rp);
        if (fp) paths.add(fp);
      }
    }
    return paths;
  }, [nodes]);

  const onAddToCanvas = useCallback(() => {
    if (!seedResult) return;
    let yOffset = 100;
    for (const path of selectedPaths) {
      if (existingSet.has(path)) continue;
      const depInfo = groups.flatMap((g) => g.files).find((f) => f.relativePath === path);
      if (!depInfo) continue;
      const nodeId = `git-dep-${depInfo.relativePath}`;
      const data: ContextFileNodeData = {
        filePath: depInfo.filePath, fileName: depInfo.relativePath.split('/').pop() ?? depInfo.relativePath,
        relativePath: depInfo.relativePath, symbols: [], selectedSymbols: [],
        redacted: false, content: '', gitSeeded: true,
      };
      addNode({ id: nodeId, type: 'contextFile', position: { x: 520, y: yOffset }, data });
      postMessage({ type: 'requestFile', filePath: depInfo.filePath });
      for (const sym of depInfo.symbols) {
        const srcFile = seedResult.changedFiles.find((f) =>
          seedResult.reverseDependencies[`${f.filePath}::${sym}`]?.some((d: ReverseDependency) => d.relativePath === depInfo.relativePath));
        if (srcFile) {
          const srcNodeId = `git-${srcFile.relativePath}`;
          addEdge({ id: `gitdep-${srcNodeId}-${nodeId}-${sym}`, source: srcNodeId, target: nodeId, type: 'gitDependency', data: { symbolName: sym } });
        }
      }
      yOffset += 200;
    }
    deselectAllPaths();
  }, [selectedPaths, seedResult, groups, existingSet, addNode, addEdge, postMessage, deselectAllPaths]);

  if (!panelOpen || !seedResult) return null;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span>DEPENDENTS ({allPaths.length})</span>
        <button type="button" onClick={closePanel} style={closeBtn}>&times;</button>
      </div>
      <div style={listStyle}>
        {groups.map((group) => {
          const collapsed = collapsedGroups.has(group.dir);
          return (
            <div key={group.dir}>
              <div style={groupHeader} onClick={() => toggleGroup(group.dir)}>
                <span>{collapsed ? '\u25B6' : '\u25BC'}</span>
                <span>{group.dir}/</span>
                <span style={{ color: COLOR_TEXT_MUTED }}>({group.files.length})</span>
              </div>
              {!collapsed && group.files.map((file) => {
                const onCanvas = existingSet.has(file.filePath);
                return (
                  <label key={file.relativePath} style={{ ...fileRow, opacity: onCanvas ? 0.5 : 1 }}>
                    <input type="checkbox" disabled={onCanvas} checked={onCanvas || selectedPaths.has(file.relativePath)}
                      onChange={() => togglePath(file.relativePath)} style={{ accentColor: COLOR_ACCENT }} />
                    <span>{file.relativePath.split('/').pop()}</span>
                    <span style={symLabel}>uses {file.symbols.join(', ')}</span>
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={footerStyle}>
        <button type="button" style={selectAllBtn}
          onClick={() => selectAllPaths(allPaths.filter((p) => !existingSet.has(p)))}>Select All</button>
        <button type="button" style={addBtn} onClick={onAddToCanvas}
          disabled={selectedPaths.size === 0}>Add to Canvas ({selectedPaths.size})</button>
      </div>
    </div>
  );
}
