import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRecipeStore } from '../store/recipe-store';
import { useExtensionBridge } from '../hooks/useExtensionBridge';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

const overlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#1e1e1e', border: '1px solid #333333',
  borderRadius: '4px', padding: '20px', width: '340px', fontFamily: UI_FONT,
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px', fontWeight: 600, color: '#e2e2e2', marginBottom: '12px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', backgroundColor: '#141414',
  border: '1px solid #2d2d2d', borderRadius: '2px', color: '#e2e2e2',
  fontSize: '13px', fontFamily: CODE_FONT, outline: 'none', boxSizing: 'border-box',
};

const listStyle: React.CSSProperties = {
  maxHeight: '200px', overflowY: 'auto', marginTop: '8px',
  border: '1px solid #2d2d2d', borderRadius: '2px', backgroundColor: '#141414',
};

const itemStyle: React.CSSProperties = {
  padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
  color: '#e2e2e2', fontFamily: CODE_FONT, backgroundColor: 'transparent',
  border: 'none', width: '100%', textAlign: 'left', display: 'block',
};

const itemHoverStyle: React.CSSProperties = { ...itemStyle, backgroundColor: '#252525' };

const btnRow: React.CSSProperties = {
  display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px',
};

const cancelBtn: React.CSSProperties = {
  padding: '6px 14px', backgroundColor: 'transparent', border: '1px solid #333333',
  borderRadius: '2px', color: '#888888', fontSize: '12px', cursor: 'pointer', fontFamily: UI_FONT,
};

const addBtn: React.CSSProperties = {
  padding: '6px 14px', backgroundColor: '#6366f1', border: '1px solid #6366f1',
  borderRadius: '2px', color: '#ffffff', fontSize: '12px', fontWeight: 600,
  cursor: 'pointer', fontFamily: UI_FONT,
};

/** Modal for entering a package name with autocomplete from package.json. */
export function PackageInputModal(): React.ReactElement | null {
  const isOpen = useRecipeStore((s) => s.packageInputOpen);
  const close = useRecipeStore((s) => s.closePackageInput);
  const available = useRecipeStore((s) => s.availablePackages);
  const { postMessage } = useExtensionBridge();
  const [name, setName] = useState('');
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  useEffect(() => {
    if (isOpen) {
      postMessage({ type: 'listPackages' });
      setName('');
    }
  }, [isOpen, postMessage]);

  const filtered = useMemo(() => {
    if (!name.trim()) return available;
    const q = name.toLowerCase();
    return available.filter((p) => p.toLowerCase().includes(q));
  }, [name, available]);

  const onAdd = useCallback((pkg?: string) => {
    const value = (pkg ?? name).trim();
    if (!value) return;
    postMessage({ type: 'resolvePackage', packageName: value });
    setName('');
    close();
  }, [name, postMessage, close]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onAdd();
      if (e.key === 'Escape') close();
    },
    [onAdd, close],
  );

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={close}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>Add Package Types</div>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search dependencies..."
          autoFocus
        />
        {filtered.length > 0 && (
          <div style={listStyle}>
            {filtered.map((pkg, i) => (
              <button
                key={pkg}
                style={i === hoveredIdx ? itemHoverStyle : itemStyle}
                type="button"
                onClick={() => onAdd(pkg)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(-1)}
              >
                {pkg}
              </button>
            ))}
          </div>
        )}
        <div style={btnRow}>
          <button style={cancelBtn} type="button" onClick={close}>Cancel</button>
          <button style={addBtn} type="button" onClick={() => onAdd()}>Add</button>
        </div>
      </div>
    </div>
  );
}
