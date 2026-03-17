import { create } from 'zustand';

export type GitDependentsState = {
  panelOpen: boolean;
  selectedPaths: Set<string>;
  collapsedGroups: Set<string>;
  openPanel: () => void;
  closePanel: () => void;
  togglePath: (path: string) => void;
  selectAllPaths: (paths: string[]) => void;
  deselectAllPaths: () => void;
  toggleGroup: (dir: string) => void;
};

/** Zustand store for the git dependents sidebar panel. */
export const useGitDependentsStore = create<GitDependentsState>((set, get) => ({
  panelOpen: false,
  selectedPaths: new Set(),
  collapsedGroups: new Set(),

  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),

  togglePath: (path) => {
    const next = new Set(get().selectedPaths);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    set({ selectedPaths: next });
  },

  selectAllPaths: (paths) => {
    const next = new Set(get().selectedPaths);
    for (const p of paths) next.add(p);
    set({ selectedPaths: next });
  },

  deselectAllPaths: () => set({ selectedPaths: new Set() }),

  toggleGroup: (dir) => {
    const next = new Set(get().collapsedGroups);
    if (next.has(dir)) next.delete(dir);
    else next.add(dir);
    set({ collapsedGroups: next });
  },
}));
