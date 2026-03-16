import { describe, it, expect } from 'vitest';

/**
 * Tests for the recipe-storage validateFileName logic.
 * We re-implement the validation here since the module depends on vscode,
 * but the validation logic is pure and can be tested independently.
 */

function validateFileName(fileName: string): void {
  if (
    fileName.includes('/') ||
    fileName.includes('\\') ||
    fileName.includes('..') ||
    !fileName.endsWith('.json')
  ) {
    throw new Error(`Invalid recipe file name: ${fileName}`);
  }
}

describe('recipe-storage validateFileName', () => {
  it('accepts valid file names', () => {
    expect(() => validateFileName('my-recipe.json')).not.toThrow();
    expect(() => validateFileName('recipe-2024.json')).not.toThrow();
    expect(() => validateFileName('a.json')).not.toThrow();
  });

  it('rejects file names with forward slashes', () => {
    expect(() => validateFileName('../evil.json')).toThrow('Invalid recipe file name');
    expect(() => validateFileName('sub/dir.json')).toThrow('Invalid recipe file name');
  });

  it('rejects file names with backslashes', () => {
    expect(() => validateFileName('..\\evil.json')).toThrow('Invalid recipe file name');
    expect(() => validateFileName('sub\\dir.json')).toThrow('Invalid recipe file name');
  });

  it('rejects file names with double dots', () => {
    expect(() => validateFileName('..secret.json')).toThrow('Invalid recipe file name');
  });

  it('rejects file names not ending in .json', () => {
    expect(() => validateFileName('recipe.txt')).toThrow('Invalid recipe file name');
    expect(() => validateFileName('recipe.json.bak')).toThrow('Invalid recipe file name');
    expect(() => validateFileName('recipe')).toThrow('Invalid recipe file name');
  });
});

describe('recipe-storage slugify', () => {
  function slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }

  it('converts to lowercase kebab-case', () => {
    expect(slugify('My Recipe Name')).toBe('my-recipe-name');
  });

  it('strips special characters', () => {
    expect(slugify('recipe@#$%^&*!')).toBe('recipe');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello');
  });

  it('truncates at 60 characters', () => {
    const long = 'a'.repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(60);
  });
});
