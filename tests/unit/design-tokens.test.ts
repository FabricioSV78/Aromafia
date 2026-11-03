import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../src/design/tokens.css', import.meta.url), 'utf8');
const tokens = new Map(Array.from(css.matchAll(/(--[\w-]+):\s*([^;]+);/g), (m) => [m[1], m[2]]));
function color(token: string): string {
  const value = tokens.get(token);
  if (!value) throw new Error(`Token inexistente: ${token}`);
  return value.startsWith('var(') ? color(value.slice(4, -1)) : value;
}
function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((index) => {
    const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return (rgb[0] ?? 0) * 0.2126 + (rgb[1] ?? 0) * 0.7152 + (rgb[2] ?? 0) * 0.0722;
}
function contrast(first: string, second: string): number {
  const a = luminance(color(first));
  const b = luminance(color(second));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
describe('contrastes del sistema de diseño', () => {
  for (const foreground of [
    '--color-text',
    '--color-text-muted',
    '--color-link',
    '--color-error',
    '--color-success',
  ]) {
    it(`${foreground} permite texto AA sobre los fondos de marca`, () => {
      expect(contrast(foreground, '--color-background')).toBeGreaterThanOrEqual(4.5);
      expect(contrast(foreground, '--color-surface')).toBeGreaterThanOrEqual(4.5);
    });
  }
  it('acciones principales mantienen contraste en reposo y hover', () => {
    expect(contrast('--color-on-action', '--color-action')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('--color-on-action', '--color-action-hover')).toBeGreaterThanOrEqual(4.5);
  });
  it('el anillo de foco tiene contraste suficiente contra el fondo', () => {
    expect(contrast('--color-focus', '--color-background')).toBeGreaterThanOrEqual(3);
    expect(contrast('--color-border', '--color-background')).toBeGreaterThanOrEqual(3);
  });
});
