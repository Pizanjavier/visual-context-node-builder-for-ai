import { useCallback, useRef, useState } from 'react';
import { useCanvasStore } from '../store/canvas-store';
import { useClickOutside } from '../hooks/useClickOutside';
import { PROMPT_TEMPLATES } from '../../shared/templates/prompt-templates';
import {
  FONT_UI, COLOR_BG_ELEVATED, COLOR_BORDER, COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY,
} from '../theme/tokens';

const buttonStyle: React.CSSProperties = {
  padding: '4px 10px',
  backgroundColor: 'transparent',
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px',
  color: COLOR_TEXT_PRIMARY,
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: FONT_UI,
  position: 'relative',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '4px',
  backgroundColor: COLOR_BG_ELEVATED,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: '2px',
  zIndex: 20,
  minWidth: '180px',
};

const itemStyle: React.CSSProperties = {
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '12px',
  color: COLOR_TEXT_PRIMARY,
  fontFamily: FONT_UI,
  backgroundColor: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  display: 'block',
};

const descStyle: React.CSSProperties = {
  fontSize: '10px',
  color: COLOR_TEXT_SECONDARY,
  marginTop: '2px',
};

/** Dropdown for selecting built-in prompt templates. */
export function TemplateDropdown(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickOutside(wrapperRef, open, () => setOpen(false));
  const addNode = useCanvasStore((s) => s.addNode);
  const setIntent = useCanvasStore((s) => s.setIntent);

  const onSelect = useCallback(
    (index: number) => {
      const template = PROMPT_TEMPLATES[index];
      if (!template) return;
      const snap = template.snapshot;
      // Add the system instruction node without clearing the canvas
      for (const node of snap.nodes) {
        addNode({ id: `${node.id}-${Date.now()}`, type: node.type, position: node.position, data: node.data });
      }
      if (snap.intent) setIntent(snap.intent);
      setOpen(false);
    },
    [addNode, setIntent],
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }} data-tip="system">
      <button style={buttonStyle} type="button" onClick={() => setOpen(!open)}>
        System ▾
      </button>
      {open && (
        <div style={dropdownStyle}>
          {PROMPT_TEMPLATES.map((t, i) => (
            <button
              key={t.name}
              style={itemStyle}
              type="button"
              onClick={() => onSelect(i)}
            >
              {t.name}
              <div style={descStyle}>{t.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
