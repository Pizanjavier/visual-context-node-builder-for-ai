/** Categories of file dependencies for filtering during expansion. */
export type DependencyCategory = 'source' | 'styles' | 'data';

/** User-selected category filter for dependency expansion. */
export type DependencyCategoryFilter = {
  source: boolean;
  styles: boolean;
  data: boolean;
};

/** Default filter state: all categories enabled. */
export const DEFAULT_CATEGORY_FILTER: DependencyCategoryFilter = {
  source: true,
  styles: true,
  data: true,
};

/** Human-readable labels for each category. */
export const CATEGORY_LABELS: Record<DependencyCategory, string> = {
  source: 'Source Code',
  styles: 'Styles',
  data: 'Data / Config',
};
