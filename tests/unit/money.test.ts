import { describe, expect, it } from 'vitest';
import { formatPen, pen } from '../../src/shared/lib/money';

describe('PEN money', () => {
  it('represents soles as integer céntimos without losing small amounts', () => {
    expect(pen(12_345)).toEqual({ currency: 'PEN', amountInCents: 12_345 });
    expect(pen(0).amountInCents).toBe(0);
    expect(formatPen(pen(1))).toMatch(/^S\/\s?0\.01$/u);
    expect(formatPen(pen(12_345))).toMatch(/^S\/\s?123\.45$/u);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid or unsafe céntimos: %s',
    (amount) => {
      expect(() => pen(amount)).toThrow(TypeError);
    },
  );

  it('does not silently format malformed price objects', () => {
    expect(() => formatPen({ currency: 'PEN', amountInCents: 1.2 })).toThrow(TypeError);
  });
});
