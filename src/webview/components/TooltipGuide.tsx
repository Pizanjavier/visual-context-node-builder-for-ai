import { useState, useEffect, useCallback } from 'react';
import { useHelpStore } from '../store/help-store';

const UI_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

type TooltipDef = {
  id: string;
  selector: string;
  text: string;
  position: 'bottom' | 'bottom-right';
};

const TOOLTIPS: TooltipDef[] = [
  { id: 'add', selector: '[data-tip="add"]', text: 'Add files, notes, system instructions, or packages', position: 'bottom' },
  { id: 'system', selector: '[data-tip="system"]', text: 'Quick-start templates with pre-filled system prompts', position: 'bottom' },
  { id: 'recipes', selector: '[data-tip="recipes"]', text: 'Load saved canvas layouts', position: 'bottom' },
  { id: 'save', selector: '[data-tip="save"]', text: 'Save current canvas as a reusable recipe', position: 'bottom' },
  { id: 'generate', selector: '[data-tip="generate"]', text: 'Export arranged context as Markdown or XML', position: 'bottom' },
];

const dotStyle: React.CSSProperties = {
  position: 'absolute',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: '#d97706',
  cursor: 'pointer',
  zIndex: 15,
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  backgroundColor: '#252525',
  border: '1px solid #444444',
  borderRadius: '3px',
  padding: '6px 10px',
  fontSize: '11px',
  color: '#cccccc',
  fontFamily: UI_FONT,
  maxWidth: '220px',
  lineHeight: '1.4',
  zIndex: 16,
  whiteSpace: 'normal',
};

type Rect = { top: number; left: number; width: number; height: number };

/** Contextual tooltip dots on toolbar buttons. Dismissed after first hover. */
export function TooltipGuide(): React.ReactElement | null {
  const dismissed = useHelpStore((s) => s.dismissed);
  const dismiss = useHelpStore((s) => s.dismiss);
  const [hovered, setHovered] = useState<string | null>(null);
  const [rects, setRects] = useState<Record<string, Rect>>({});

  const measure = useCallback(() => {
    const next: Record<string, Rect> = {};
    for (const tip of TOOLTIPS) {
      if (dismissed.has(tip.id)) continue;
      const el = document.querySelector(tip.selector);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[tip.id] = { top: r.top, left: r.left, width: r.width, height: r.height };
    }
    setRects(next);
  }, [dismissed]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    const interval = setInterval(measure, 2000);
    return () => {
      window.removeEventListener('resize', measure);
      clearInterval(interval);
    };
  }, [measure]);

  const activeTips = TOOLTIPS.filter((t) => !dismissed.has(t.id) && rects[t.id]);

  if (activeTips.length === 0) return null;

  return (
    <>
      {activeTips.map((tip) => {
        const r = rects[tip.id];
        if (!r) return null;
        const dotTop = r.top + r.height - 3;
        const dotLeft = r.left + r.width - 3;

        return (
          <div key={tip.id}>
            <div
              style={{ ...dotStyle, top: `${dotTop}px`, left: `${dotLeft}px` }}
              onMouseEnter={() => setHovered(tip.id)}
              onMouseLeave={() => {
                setHovered(null);
                dismiss(tip.id);
              }}
            />
            {hovered === tip.id && (
              <div
                style={{
                  ...tooltipStyle,
                  top: `${r.top + r.height + 6}px`,
                  left: `${r.left}px`,
                }}
              >
                {tip.text}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
