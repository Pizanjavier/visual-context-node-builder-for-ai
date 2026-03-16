import { useState, useCallback } from 'react';
import { useRecipeStore } from '../store/recipe-store';
import { useCanvasStore } from '../store/canvas-store';
import { useExtensionBridge } from '../hooks/useExtensionBridge';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #333333',
  borderRadius: '4px',
  padding: '20px',
  width: '320px',
  fontFamily: UI_FONT,
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#e2e2e2',
  marginBottom: '12px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#141414',
  border: '1px solid #2d2d2d',
  borderRadius: '2px',
  color: '#e2e2e2',
  fontSize: '13px',
  fontFamily: UI_FONT,
  outline: 'none',
  boxSizing: 'border-box',
};

const btnRow: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
  marginTop: '16px',
};

const cancelBtn: React.CSSProperties = {
  padding: '6px 14px',
  backgroundColor: 'transparent',
  border: '1px solid #333333',
  borderRadius: '2px',
  color: '#888888',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: UI_FONT,
};

const saveBtn: React.CSSProperties = {
  padding: '6px 14px',
  backgroundColor: '#d97706',
  border: '1px solid #d97706',
  borderRadius: '2px',
  color: '#1a1a1a',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: UI_FONT,
};

/** Modal for entering a recipe name and saving the canvas. */
export function SaveRecipeModal(): React.ReactElement | null {
  const saveOpen = useRecipeStore((s) => s.saveOpen);
  const closeSave = useRecipeStore((s) => s.closeSave);
  const serialize = useCanvasStore((s) => s.serialize);
  const { postMessage } = useExtensionBridge();
  const [name, setName] = useState('');

  const onSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const snapshot = serialize(trimmed);
    postMessage({ type: 'saveRecipe', snapshot });
    setName('');
    closeSave();
  }, [name, serialize, postMessage, closeSave]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onSave();
      if (e.key === 'Escape') closeSave();
    },
    [onSave, closeSave],
  );

  if (!saveOpen) return null;

  return (
    <div style={overlayStyle} onClick={closeSave}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>Save Recipe</div>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Recipe name..."
          autoFocus
        />
        <div style={btnRow}>
          <button style={cancelBtn} type="button" onClick={closeSave}>
            Cancel
          </button>
          <button style={saveBtn} type="button" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
