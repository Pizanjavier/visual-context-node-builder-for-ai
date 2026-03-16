import { useCallback, useMemo, useRef, useState } from 'react';
import { useCanvasStore } from '../store/canvas-store';
import { useExportStore } from '../store/export-store';
import { useRecipeStore } from '../store/recipe-store';
import { useExtensionBridge } from '../hooks/useExtensionBridge';
import { useClickOutside } from '../hooks/useClickOutside';
import { formatTokenCount } from '../../shared/utils/token-estimator';
import { buildMarkdownOrdered, buildXmlOrdered } from '../../shared/utils/context-builder';
import { buildSections } from '../utils/build-sections';
import { TemplateDropdown } from './TemplateDropdown';
import { useConfirmStore } from './ConfirmModal';
import { useHelpStore } from '../store/help-store';

import {
  FONT_UI, FONT_CODE,
  COLOR_BG_SURFACE, COLOR_BG_ELEVATED, COLOR_BORDER,
  COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY, COLOR_TEXT_MUTED,
  COLOR_ACCENT, COLOR_ACCENT_DARK,
} from '../theme/tokens';

const UI_FONT = FONT_UI;
const CODE_FONT = FONT_CODE;

const toolbarStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
  backgroundColor: COLOR_BG_SURFACE, borderBottom: `1px solid ${COLOR_BORDER}`,
  fontFamily: UI_FONT, fontSize: '12px', color: COLOR_TEXT_PRIMARY, zIndex: 10,
};
const buttonStyle: React.CSSProperties = {
  padding: '4px 10px', backgroundColor: 'transparent', border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px', color: COLOR_TEXT_PRIMARY, fontSize: '12px', cursor: 'pointer',
  fontFamily: UI_FONT, position: 'relative',
};
const newButton: React.CSSProperties = { ...buttonStyle, color: COLOR_TEXT_SECONDARY, borderColor: COLOR_TEXT_MUTED };
const generateButton: React.CSSProperties = {
  ...buttonStyle, backgroundColor: COLOR_ACCENT, border: `1px solid ${COLOR_ACCENT}`, color: COLOR_ACCENT_DARK, fontWeight: 600,
};
const tokenStyle: React.CSSProperties = { marginLeft: 'auto', fontFamily: CODE_FONT, color: COLOR_TEXT_SECONDARY, fontSize: '12px' };
const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, marginTop: '4px',
  backgroundColor: COLOR_BG_ELEVATED, border: `1px solid ${COLOR_BORDER}`, borderRadius: '2px', zIndex: 20, minWidth: '120px',
};
const helpBtn: React.CSSProperties = {
  padding: '2px 8px', backgroundColor: 'transparent', border: '1px solid #444444',
  borderRadius: '50%', color: COLOR_TEXT_SECONDARY, fontSize: '12px', cursor: 'pointer',
  fontFamily: UI_FONT, fontWeight: 600, lineHeight: '1', marginLeft: '4px',
};
const dropdownItemStyle: React.CSSProperties = {
  padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: COLOR_TEXT_PRIMARY,
  fontFamily: UI_FONT, backgroundColor: 'transparent', border: 'none',
  width: '100%', textAlign: 'left', display: 'block',
};

/** Canvas toolbar with action buttons and token counter. */
export function Toolbar(): React.ReactElement {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const addNode = useCanvasStore((s) => s.addNode);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);
  const intent = useCanvasStore((s) => s.intent);
  const openExport = useExportStore((s) => s.open);
  const openSave = useRecipeStore((s) => s.openSave);
  const openLibrary = useRecipeStore((s) => s.openLibrary);
  const { postMessage } = useExtensionBridge();
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(addMenuRef, addMenuOpen, () => setAddMenuOpen(false));

  const nodeDataKey = useMemo(() => nodes.map((n) => {
    const data = n.data as Record<string, unknown>;
    const content = typeof data?.['content'] === 'string' ? data['content'] as string : '';
    const text = typeof data?.['text'] === 'string' ? data['text'] as string : '';
    const types = typeof data?.['typesContent'] === 'string' ? data['typesContent'] as string : '';
    return `${content.length}:${text.length}:${types.length}`;
  }).join(','), [nodes]);

  const totalTokens = useMemo(() => nodes.reduce((sum, n) => {
    const data = n.data as Record<string, unknown>;
    if (typeof data?.['content'] === 'string') {
      return sum + Math.ceil((data['content'] as string).length / 4);
    }
    if (typeof data?.['text'] === 'string') {
      return sum + Math.ceil((data['text'] as string).length / 4);
    }
    if (typeof data?.['typesContent'] === 'string') {
      return sum + Math.ceil((data['typesContent'] as string).length / 4);
    }
    return sum;
  }, 0), [nodeDataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPackageInput = useRecipeStore((s) => s.openPackageInput);
  const confirm = useConfirmStore((s) => s.show);
  const openHelp = useHelpStore((s) => s.openHelp);

  const onNew = useCallback(() => {
    if (nodes.length === 0) { clearCanvas(); return; }
    confirm('Clear the canvas?', clearCanvas);
  }, [clearCanvas, nodes, confirm]);

  const onAddFile = useCallback(() => {
    postMessage({ type: 'pickFiles' });
    setAddMenuOpen(false);
  }, [postMessage]);

  const onAddNote = useCallback(() => {
    addNode({
      id: `note-${Date.now()}`,
      type: 'stickyNote',
      position: { x: 200, y: 200 },
      data: { text: '' },
    });
    setAddMenuOpen(false);
  }, [addNode]);

  const onAddSystem = useCallback(() => {
    addNode({
      id: `sys-${Date.now()}`,
      type: 'systemInstruction',
      position: { x: 200, y: 50 },
      data: { text: '' },
    });
    setAddMenuOpen(false);
  }, [addNode]);

  const onAddPackage = useCallback(() => {
    openPackageInput();
    setAddMenuOpen(false);
  }, [openPackageInput]);

  const onGenerate = useCallback(() => {
    const sections = buildSections(nodes, edges, intent);
    const md = buildMarkdownOrdered(sections);
    const xml = buildXmlOrdered(sections);
    openExport(md, xml);
  }, [nodes, edges, intent, openExport]);

  return (
    <div style={toolbarStyle}>
      <button style={newButton} type="button" onClick={onNew}>New</button>
      <div ref={addMenuRef} style={{ position: 'relative' }} data-tip="add">
        <button
          style={buttonStyle}
          type="button"
          onClick={() => setAddMenuOpen(!addMenuOpen)}
        >
          Add ▾
        </button>
        {addMenuOpen && (
          <div style={dropdownStyle}>
            <button style={dropdownItemStyle} type="button" onClick={onAddFile}>
              File
            </button>
            <button style={dropdownItemStyle} type="button" onClick={onAddNote}>
              Note
            </button>
            <button style={dropdownItemStyle} type="button" onClick={onAddSystem}>
              System
            </button>
            <button style={dropdownItemStyle} type="button" onClick={onAddPackage}>
              Package
            </button>
          </div>
        )}
      </div>
      <TemplateDropdown />
      <button style={buttonStyle} type="button" onClick={openLibrary} data-tip="recipes">
        Recipes
      </button>
      <button style={buttonStyle} type="button" onClick={openSave} data-tip="save">
        Save
      </button>
      <button style={generateButton} type="button" onClick={onGenerate} data-tip="generate">
        Generate Context
      </button>
      <span style={tokenStyle}>#{formatTokenCount(totalTokens)}</span>
      <button style={helpBtn} type="button" onClick={openHelp}>?</button>
    </div>
  );
}
