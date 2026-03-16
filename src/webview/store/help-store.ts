import { create } from 'zustand';

const DISMISSED_KEY = 'vcnb-dismissed-tips';

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function saveDismissed(dismissed: Set<string>): void {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
  } catch { /* ignore */ }
}

export type HelpState = {
  helpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  dismissed: Set<string>;
  dismiss: (tipId: string) => void;
  isDismissed: (tipId: string) => boolean;
  resetTips: () => void;
};

/**
 * Store for managing help panel visibility and tooltip dismissal
 * state. Dismissed tips are persisted to localStorage so they
 * survive webview reloads.
 */
export const useHelpStore = create<HelpState>((set, get) => ({
  helpOpen: false,
  openHelp: () => set({ helpOpen: true }),
  closeHelp: () => set({ helpOpen: false }),
  dismissed: loadDismissed(),
  dismiss: (tipId) => {
    const next = new Set(get().dismissed);
    next.add(tipId);
    saveDismissed(next);
    set({ dismissed: next });
  },
  isDismissed: (tipId) => get().dismissed.has(tipId),
  resetTips: () => {
    saveDismissed(new Set());
    set({ dismissed: new Set() });
  },
}));
