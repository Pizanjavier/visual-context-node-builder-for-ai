import { create } from 'zustand';
import type {
  DependencyCategory,
  DependencyCategoryFilter,
} from '../../shared/types/dependency-categories';
import { DEFAULT_CATEGORY_FILTER } from '../../shared/types/dependency-categories';

export type DepFilterState = {
  /** Current category filter preferences. */
  filter: DependencyCategoryFilter;
  /** Toggle a single category on/off. */
  toggleCategory: (category: DependencyCategory) => void;
  /** Reset all categories to their defaults (all on). */
  resetFilter: () => void;
};

/**
 * Zustand store for dependency category filter preferences.
 * Persists during the session so the user's choices carry
 * across multiple "Expand Deps" invocations.
 */
export const useDepFilterStore = create<DepFilterState>((set, get) => ({
  filter: { ...DEFAULT_CATEGORY_FILTER },

  toggleCategory: (category) => {
    const current = get().filter;
    set({ filter: { ...current, [category]: !current[category] } });
  },

  resetFilter: () => {
    set({ filter: { ...DEFAULT_CATEGORY_FILTER } });
  },
}));
