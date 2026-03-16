import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import { scanImports } from '../extension/services/import-scanner';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

const mockExistsSync = vi.mocked(fs.existsSync);

describe('scanImports', () => {
  it('resolves named import from relative path', () => {
    mockExistsSync.mockImplementation((p) =>
      String(p).endsWith('/project/bar.ts'),
    );
    const code = "import { foo } from './bar';";
    const result = scanImports(code, 'index.ts', '/project');
    expect(result).toHaveLength(1);
    expect(result[0]?.specifier).toBe('./bar');
    expect(result[0]?.resolvedPath).toContain('bar.ts');
  });

  it('resolves namespace import', () => {
    mockExistsSync.mockImplementation((p) =>
      String(p).endsWith('/project/mod.ts'),
    );
    const code = "import * as x from './mod';";
    const result = scanImports(code, 'index.ts', '/project');
    expect(result).toHaveLength(1);
    expect(result[0]?.specifier).toBe('./mod');
    expect(result[0]?.resolvedPath).toContain('mod.ts');
  });

  it('resolves re-export from relative path', () => {
    mockExistsSync.mockImplementation((p) =>
      String(p).endsWith('/project/other.ts'),
    );
    const code = "export { thing } from './other';";
    const result = scanImports(code, 'index.ts', '/project');
    expect(result).toHaveLength(1);
    expect(result[0]?.specifier).toBe('./other');
    expect(result[0]?.resolvedPath).toContain('other.ts');
  });

  it('ignores non-relative imports (node_modules)', () => {
    mockExistsSync.mockReturnValue(false);
    const code = "import { useState } from 'react';";
    const result = scanImports(code, 'index.ts', '/project');
    expect(result).toHaveLength(0);
  });

  it('returns empty array for file with no imports', () => {
    mockExistsSync.mockReturnValue(false);
    const code = 'const x = 42;';
    const result = scanImports(code, 'index.ts', '/project');
    expect(result).toHaveLength(0);
  });

  it('returns empty when file cannot be resolved', () => {
    mockExistsSync.mockReturnValue(false);
    const code = "import { missing } from './nonexistent';";
    const result = scanImports(code, 'index.ts', '/project');
    expect(result).toHaveLength(0);
  });
});
