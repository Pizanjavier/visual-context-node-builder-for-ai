import * as path from 'path';
import type {
  DependencyCategory,
  DependencyCategoryFilter,
} from '../types/dependency-categories';

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mts', '.cts',
  '.py', '.go', '.rs', '.java', '.kt', '.swift',
  '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php',
  '.lua', '.dart', '.vue', '.svelte',
]);

const STYLE_EXTENSIONS = new Set([
  '.css', '.scss', '.sass', '.less', '.styl',
]);

const DATA_EXTENSIONS = new Set([
  '.json', '.yaml', '.yml', '.toml', '.xml',
  '.proto', '.graphql', '.gql', '.sql',
]);

/** Determine which category a file belongs to based on its extension. */
export function getFileCategory(
  filePath: string,
): DependencyCategory | undefined {
  const ext = path.extname(filePath).toLowerCase();
  if (SOURCE_EXTENSIONS.has(ext)) return 'source';
  if (STYLE_EXTENSIONS.has(ext)) return 'styles';
  if (DATA_EXTENSIONS.has(ext)) return 'data';
  return undefined;
}

/** Check whether a file path passes the given category filter. */
export function passesFilter(
  filePath: string,
  filter: DependencyCategoryFilter,
): boolean {
  const category = getFileCategory(filePath);
  // Files with unknown categories are always included
  if (category === undefined) return true;
  return filter[category];
}

/** Filter an array of file paths by category. */
export function filterByCategory<T extends { resolvedPath: string }>(
  items: T[],
  filter: DependencyCategoryFilter,
): T[] {
  return items.filter((item) => passesFilter(item.resolvedPath, filter));
}
