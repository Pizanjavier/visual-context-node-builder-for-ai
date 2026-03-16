import { useCallback, useEffect } from 'react';
import { useRecipeStore } from '../store/recipe-store';
import { useExtensionBridge } from '../hooks/useExtensionBridge';
import { useConfirmStore } from './ConfirmModal';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CODE_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 50,
  display: 'flex',
  justifyContent: 'flex-end',
};

const panelStyle: React.CSSProperties = {
  width: '320px',
  height: '100%',
  backgroundColor: '#1e1e1e',
  borderLeft: '1px solid #333333',
  padding: '16px',
  fontFamily: UI_FONT,
  color: '#e2e2e2',
  overflowY: 'auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const closeBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888888',
  fontSize: '16px',
  cursor: 'pointer',
};

const itemStyle: React.CSSProperties = {
  padding: '10px 12px',
  backgroundColor: '#252525',
  border: '1px solid #333333',
  borderRadius: '2px',
  marginBottom: '8px',
  cursor: 'pointer',
};

const itemNameStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#e2e2e2',
};

const itemMetaStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#888888',
  fontFamily: CODE_FONT,
  marginTop: '4px',
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#666666',
  fontSize: '11px',
  cursor: 'pointer',
  float: 'right',
};

const emptyStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '12px',
  textAlign: 'center',
  padding: '24px 0',
};

/** Slide-in panel listing saved context recipes. */
export function RecipeLibrary(): React.ReactElement | null {
  const libraryOpen = useRecipeStore((s) => s.libraryOpen);
  const closeLibrary = useRecipeStore((s) => s.closeLibrary);
  const recipes = useRecipeStore((s) => s.recipes);
  const { postMessage } = useExtensionBridge();
  const confirm = useConfirmStore((s) => s.show);

  useEffect(() => {
    if (libraryOpen) postMessage({ type: 'listRecipes' });
  }, [libraryOpen, postMessage]);

  const onLoad = useCallback(
    (fileName: string) => {
      confirm('Load this recipe? Current canvas will be replaced.', () => {
        postMessage({ type: 'loadRecipe', fileName });
        closeLibrary();
      });
    },
    [postMessage, closeLibrary, confirm],
  );

  const onDelete = useCallback(
    (e: React.MouseEvent, fileName: string) => {
      e.stopPropagation();
      confirm('Delete this recipe?', () => {
        postMessage({ type: 'deleteRecipe', fileName });
      });
    },
    [postMessage, confirm],
  );

  if (!libraryOpen) return null;

  return (
    <div style={overlayStyle} onClick={closeLibrary}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={titleStyle}>Recipes</span>
          <button style={closeBtn} type="button" onClick={closeLibrary}>✕</button>
        </div>
        {recipes.length === 0 && (
          <div style={emptyStyle}>No saved recipes yet</div>
        )}
        {recipes.map((r) => (
          <div
            key={r.fileName}
            style={itemStyle}
            onClick={() => onLoad(r.fileName)}
          >
            <button
              style={deleteBtnStyle}
              type="button"
              onClick={(e) => onDelete(e, r.fileName)}
            >
              delete
            </button>
            <div style={itemNameStyle}>{r.name}</div>
            <div style={itemMetaStyle}>
              {r.nodeCount} nodes · {new Date(r.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
