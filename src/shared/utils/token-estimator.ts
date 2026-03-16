// Rough token estimation: ~4 characters per token for English/code text.
const CHARS_PER_TOKEN = 4;

/** Estimate the number of tokens in a string. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Format token count for display (e.g., "~2,450 tokens"). */
export function formatTokenCount(count: number): string {
  return `~${count.toLocaleString()} tokens`;
}
