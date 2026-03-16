import { describe, it, expect } from 'vitest';
import { PROMPT_TEMPLATES } from '../shared/templates/prompt-templates';

describe('PROMPT_TEMPLATES', () => {
  it('has at least 3 templates', () => {
    expect(PROMPT_TEMPLATES.length).toBeGreaterThanOrEqual(3);
  });

  it('each template has required fields', () => {
    for (const t of PROMPT_TEMPLATES) {
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.snapshot).toBeDefined();
      expect(t.snapshot.version).toBe(1);
      expect(t.snapshot.nodes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each template snapshot has a system instruction node', () => {
    for (const t of PROMPT_TEMPLATES) {
      const sysNode = t.snapshot.nodes.find((n) => n.type === 'systemInstruction');
      expect(sysNode).toBeDefined();
      expect((sysNode!.data as { text: string }).text.length).toBeGreaterThan(10);
    }
  });

  it('each template has a non-empty intent', () => {
    for (const t of PROMPT_TEMPLATES) {
      expect(t.snapshot.intent.length).toBeGreaterThan(0);
    }
  });

  it('has unique template names', () => {
    const names = PROMPT_TEMPLATES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
