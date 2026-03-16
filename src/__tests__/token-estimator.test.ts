import { describe, it, expect } from 'vitest';
import { estimateTokens, formatTokenCount } from '../shared/utils/token-estimator';

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('returns 0 for undefined-like falsy input', () => {
    expect(estimateTokens(undefined as unknown as string)).toBe(0);
  });

  it('estimates tokens for a known string', () => {
    // 12 chars / 4 = 3 tokens
    expect(estimateTokens('hello world!')).toBe(3);
  });

  it('rounds up for non-divisible lengths', () => {
    // 5 chars / 4 = 1.25, ceil = 2
    expect(estimateTokens('hello')).toBe(2);
  });

  it('handles very long string', () => {
    const long = 'a'.repeat(10000);
    expect(estimateTokens(long)).toBe(2500);
  });
});

describe('formatTokenCount', () => {
  it('formats 0', () => {
    expect(formatTokenCount(0)).toBe('~0 tokens');
  });

  it('formats 500', () => {
    expect(formatTokenCount(500)).toBe('~500 tokens');
  });

  it('formats 1500 with locale separators', () => {
    const result = formatTokenCount(1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
    expect(result).toContain('tokens');
  });

  it('formats 15000 with locale separators', () => {
    const result = formatTokenCount(15000);
    expect(result).toContain('15');
    expect(result).toContain('000');
    expect(result).toContain('tokens');
  });
});
