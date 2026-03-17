import { create } from 'zustand';
import type { GitDiffSource, GitSeedProgress, GitSeedResult } from '../../shared/types/git';
import type { ContextFileNodeData } from '../../shared/types/nodes';
import { useCanvasStore } from './canvas-store';
import { useGitDependentsStore } from './git-dependents-store';

export type GitSeedState = {
  isSeeding: boolean;
  seedProgress: GitSeedProgress | null;
  seedSource: GitDiffSource | null;
  seedResult: GitSeedResult | null;
  bannerDismissed: boolean;
  requestGitSeed: (source: GitDiffSource) => void;
  setSeedProgress: (progress: GitSeedProgress) => void;
  handleSeedResult: (result: GitSeedResult) => void;
  clearSeed: () => void;
  dismissBanner: () => void;
};

/**
 * Zustand store for git seed state: tracks progress, results,
 * and creates canvas nodes only for changed files.
 * Reverse dependents are shown in the GitDependentsPanel sidebar.
 */
export const useGitSeedStore = create<GitSeedState>((set) => ({
  isSeeding: false,
  seedProgress: null,
  seedSource: null,
  seedResult: null,
  bannerDismissed: false,

  requestGitSeed: (source) => {
    set({ isSeeding: true, seedSource: source, seedProgress: null, seedResult: null, bannerDismissed: false });
  },

  setSeedProgress: (progress) => {
    set({ seedProgress: progress });
  },

  handleSeedResult: (result) => {
    set({ isSeeding: false, seedProgress: null, seedResult: result });
    const canvas = useCanvasStore.getState();

    // Only create nodes for changed files — dependents go to sidebar panel
    let yOffset = 100;
    for (const file of result.changedFiles) {
      const nodeId = `git-${file.relativePath}`;
      const symbolNames = file.changedSymbols.map((s) => s.symbolName);
      const data: ContextFileNodeData = {
        filePath: file.filePath,
        fileName: file.relativePath.split('/').pop() ?? file.relativePath,
        relativePath: file.relativePath,
        symbols: file.changedSymbols.map((s) => ({
          name: s.symbolName, kind: s.symbolKind, line: 0, endLine: 0, exported: true,
        })),
        selectedSymbols: symbolNames,
        redacted: false,
        content: '',
        gitSeeded: true,
        changeType: file.status,
        changedSymbolNames: symbolNames,
      };
      canvas.addNode({
        id: nodeId, type: 'contextFile',
        position: { x: 100, y: yOffset },
        data,
      });
      yOffset += 200;
    }

    // Auto-open dependents panel if there are reverse dependencies
    const hasDeps = Object.values(result.reverseDependencies).some((d) => d.length > 0);
    if (hasDeps) {
      useGitDependentsStore.getState().openPanel();
    }
  },

  clearSeed: () => {
    set({ isSeeding: false, seedProgress: null, seedSource: null, seedResult: null, bannerDismissed: false });
  },

  dismissBanner: () => {
    set({ bannerDismissed: true });
  },
}));
