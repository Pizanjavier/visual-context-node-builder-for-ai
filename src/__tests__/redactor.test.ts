import { describe, it, expect } from 'vitest';
import { redactContent } from '../shared/utils/redactor';

describe('redactContent', () => {
  it('redacts entire content when no symbol names given', () => {
    const result = redactContent('const x = 1;', []);
    expect(result).toBe('[REDACTED FOR PRIVACY]');
  });

  it('redacts matching symbol declarations', () => {
    const code = [
      'export function secret() {',
      '  return 42;',
      '}',
    ].join('\n');
    const result = redactContent(code, ['secret']);
    expect(result).toContain('[REDACTED FOR PRIVACY]');
    expect(result).not.toContain('return 42');
  });

  it('returns original content when no symbols match', () => {
    const code = 'const x = 1;\nconst y = 2;';
    const result = redactContent(code, ['nonexistent']);
    // The pattern won't match so original content is preserved
    expect(result).toContain('const x = 1');
    expect(result).toContain('const y = 2');
  });

  it('handles multiple symbol names', () => {
    const code = [
      'function alpha() { return 1; }',
      'function beta() { return 2; }',
    ].join('\n');
    const result = redactContent(code, ['alpha', 'beta']);
    expect(result).toContain('[REDACTED FOR PRIVACY]');
  });
});
