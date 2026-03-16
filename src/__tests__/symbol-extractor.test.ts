import { describe, it, expect } from 'vitest';
import { extractSymbols } from '../extension/services/symbol-extractor';

describe('extractSymbols', () => {
  it('extracts exported function', () => {
    const code = 'export function greet(name: string): string {\n  return name;\n}';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({
      name: 'greet',
      kind: 'function',
      exported: true,
    });
  });

  it('extracts non-exported function', () => {
    const code = 'function helper(): void {}';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({
      name: 'helper',
      kind: 'function',
      exported: false,
    });
  });

  it('extracts class declarations', () => {
    const code = 'export class MyService {\n  run(): void {}\n}';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({ name: 'MyService', kind: 'class', exported: true });
  });

  it('extracts type aliases', () => {
    const code = 'export type Config = { key: string };';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({ name: 'Config', kind: 'type', exported: true });
  });

  it('extracts interfaces', () => {
    const code = 'export interface Logger {\n  log(msg: string): void;\n}';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({ name: 'Logger', kind: 'interface', exported: true });
  });

  it('extracts enums', () => {
    const code = 'export enum Status {\n  Active,\n  Inactive,\n}';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({ name: 'Status', kind: 'enum', exported: true });
  });

  it('extracts variable declarations', () => {
    const code = 'export const MAX_DEPTH = 3;';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(1);
    expect(symbols[0]).toMatchObject({ name: 'MAX_DEPTH', kind: 'variable', exported: true });
  });

  it('reports correct line and endLine', () => {
    const code = '// comment\nexport function foo(): void {\n  return;\n}';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols[0]?.line).toBe(2);
    expect(symbols[0]?.endLine).toBe(4);
  });

  it('returns empty array for empty file', () => {
    expect(extractSymbols('', 'test.ts')).toEqual([]);
  });

  it('returns symbols with exported: false for file with no exports', () => {
    const code = 'function a() {}\nconst b = 1;';
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols.length).toBeGreaterThan(0);
    expect(symbols.every((s) => s.exported === false)).toBe(true);
  });

  it('extracts multiple symbols from one file', () => {
    const code = [
      'export function alpha() {}',
      'export class Beta {}',
      'type Gamma = string;',
    ].join('\n');
    const symbols = extractSymbols(code, 'test.ts');
    expect(symbols).toHaveLength(3);
    const names = symbols.map((s) => s.name);
    expect(names).toContain('alpha');
    expect(names).toContain('Beta');
    expect(names).toContain('Gamma');
  });
});
