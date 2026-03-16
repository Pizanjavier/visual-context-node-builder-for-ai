const REDACTED_MARKER = '[REDACTED FOR PRIVACY]';

/** Replace specific symbol ranges in content with redaction markers. */
export function redactContent(
  content: string,
  symbolNames: string[],
): string {
  if (symbolNames.length === 0) return REDACTED_MARKER;

  let result = content;
  for (const name of symbolNames) {
    // Match function/class/type/const declarations with the given name
    const pattern = new RegExp(
      `(export\\s+)?(function|class|type|interface|const|let|var|enum)\\s+${escapeRegex(name)}\\b[^]*?(?=\\n(?:export\\s+)?(?:function|class|type|interface|const|let|var|enum)\\s|$)`,
      'g',
    );
    result = result.replace(pattern, REDACTED_MARKER + '\n');
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
