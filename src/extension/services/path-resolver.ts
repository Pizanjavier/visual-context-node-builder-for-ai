import * as path from 'path';
import * as fs from 'fs';

const RESOLVABLE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mts', '.cts',
  '.css', '.scss', '.sass', '.less',
  '.json', '.vue', '.svelte',
];

const CONFIG_NAMES = ['tsconfig.json', 'jsconfig.json'];
const MAX_EXTENDS_DEPTH = 5;

export type PathMapping = {
  pattern: string;
  targets: string[];
};

export type PathConfig = {
  baseDir: string;
  mappings: PathMapping[];
};

/**
 * Find and load path mappings by walking up from a source file's
 * directory. Follows `extends` chains to find inherited paths.
 */
export function loadPathConfig(
  startDir: string,
  workspaceRoot?: string,
): PathConfig | undefined {
  const root = workspaceRoot ?? findFsRoot(startDir);
  let dir = startDir;

  while (dir.length >= root.length) {
    for (const name of CONFIG_NAMES) {
      const configPath = path.join(dir, name);
      if (!fs.existsSync(configPath)) continue;

      const result = parseConfigWithExtends(configPath);
      if (result) return result;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return undefined;
}

/** Parse a tsconfig/jsconfig, following `extends` to find paths. */
function parseConfigWithExtends(
  configPath: string,
  depth = 0,
): PathConfig | undefined {
  if (depth > MAX_EXTENDS_DEPTH) return undefined;

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(stripJsonComments(raw));
    const opts = config.compilerOptions;
    const configDir = path.dirname(configPath);

    // This config has paths — use it
    if (opts?.paths) {
      const baseUrl = opts.baseUrl ?? '.';
      const baseDir = path.resolve(configDir, baseUrl);

      const mappings: PathMapping[] = [];
      for (const [pattern, targets] of Object.entries(opts.paths)) {
        mappings.push({ pattern, targets: targets as string[] });
      }

      return { baseDir, mappings };
    }

    // This config has baseUrl but no paths — still useful
    if (opts?.baseUrl) {
      return {
        baseDir: path.resolve(configDir, opts.baseUrl),
        mappings: [],
      };
    }

    // Follow `extends` to check parent config
    if (config.extends) {
      const parentPath = resolveExtends(config.extends, configDir);
      if (parentPath) {
        return parseConfigWithExtends(parentPath, depth + 1);
      }
    }
  } catch {
    // Malformed config — skip
  }

  return undefined;
}

/** Resolve the `extends` field to an absolute config path. */
function resolveExtends(
  extendsValue: string,
  fromDir: string,
): string | undefined {
  // Relative path (./base.json, ../tsconfig.base.json)
  if (extendsValue.startsWith('.')) {
    const resolved = path.resolve(fromDir, extendsValue);
    return resolveConfigFile(resolved);
  }

  // Node module (e.g., "@company/tsconfig/base")
  try {
    const modulePath = path.join(fromDir, 'node_modules', extendsValue);
    return resolveConfigFile(modulePath);
  } catch {
    return undefined;
  }
}

/** Try to resolve a config path, adding .json if needed. */
function resolveConfigFile(filePath: string): string | undefined {
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }
  const withJson = filePath + '.json';
  if (fs.existsSync(withJson)) return withJson;

  // Could be a directory with tsconfig.json inside
  const nested = path.join(filePath, 'tsconfig.json');
  if (fs.existsSync(nested)) return nested;

  return undefined;
}

/** Resolve a non-relative import using path mappings. */
export function resolveAliasedImport(
  specifier: string,
  config: PathConfig,
): string | undefined {
  for (const mapping of config.mappings) {
    const captured = matchPattern(specifier, mapping.pattern);
    if (captured === undefined) continue;

    for (const target of mapping.targets) {
      const resolved = target.replace('*', captured);
      const fullPath = path.resolve(config.baseDir, resolved);
      const found = tryResolveFile(fullPath);
      if (found) return found;
    }
  }

  // Fallback: try baseUrl-only resolution
  const basePath = path.resolve(config.baseDir, specifier);
  return tryResolveFile(basePath);
}

function matchPattern(
  specifier: string,
  pattern: string,
): string | undefined {
  const starIdx = pattern.indexOf('*');
  if (starIdx === -1) {
    return specifier === pattern ? '' : undefined;
  }

  const prefix = pattern.slice(0, starIdx);
  const suffix = pattern.slice(starIdx + 1);

  if (!specifier.startsWith(prefix)) return undefined;
  if (suffix && !specifier.endsWith(suffix)) return undefined;

  const end = suffix ? specifier.length - suffix.length : undefined;
  return specifier.slice(prefix.length, end);
}

function tryResolveFile(basePath: string): string | undefined {
  if (path.extname(basePath) && fs.existsSync(basePath)) {
    return basePath;
  }

  for (const ext of RESOLVABLE_EXTENSIONS) {
    const withExt = basePath + ext;
    if (fs.existsSync(withExt)) return withExt;
  }

  for (const ext of RESOLVABLE_EXTENSIONS) {
    const indexFile = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexFile)) return indexFile;
  }

  return undefined;
}

function findFsRoot(dir: string): string {
  let current = dir;
  let parent = path.dirname(current);
  while (parent !== current) {
    current = parent;
    parent = path.dirname(current);
  }
  return current;
}

function stripJsonComments(text: string): string {
  return text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}
