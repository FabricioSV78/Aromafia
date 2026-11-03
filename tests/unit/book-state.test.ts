import { describe, expect, it } from 'vitest';
import {
  bookHash,
  normalizeBookIndex,
  parseBookHash,
  visibleBookIndices,
} from '../../src/motion/book-state';

describe('book navigation state', () => {
  it('keeps a perfume on its corresponding spread when moving between mobile and desktop', () => {
    expect(normalizeBookIndex(3, 6, 1)).toBe(3);
    expect(normalizeBookIndex(3, 6, 2)).toBe(2);
    expect(visibleBookIndices(2, 6, 2)).toEqual([2, 3]);
    expect(visibleBookIndices(3, 6, 1)).toEqual([3]);
  });
  it('bounds navigation and handles a final unpaired page', () => {
    expect(normalizeBookIndex(-1, 6, 2)).toBe(0);
    expect(normalizeBookIndex(100, 6, 2)).toBe(4);
    expect(visibleBookIndices(4, 5, 2)).toEqual([4]);
    expect(visibleBookIndices(0, 0, 1)).toEqual([]);
    expect(normalizeBookIndex(Number.NaN, 6, 1)).toBe(0);
  });
  it('restores book and perfume deep links without adding external destinations', () => {
    expect(bookHash(2)).toBe('#libro/3');
    expect(bookHash(2, 'hawas-ice')).toBe('#libro/3/perfume/hawas-ice');
    expect(parseBookHash('#libro/4/perfume/hawas-ice', 6, 2)).toEqual({
      index: 2,
      slug: 'hawas-ice',
    });
    expect(parseBookHash('#libro/99', 6, 1)).toEqual({ index: 5, slug: null });
  });
  it('restores a product consultation on the correct spread and keeps ordinary links unchanged', () => {
    expect(bookHash(1, 'khamrah-qahwa', true)).toBe('#libro/2/perfume/khamrah-qahwa/pedido');
    expect(parseBookHash('#libro/2/perfume/khamrah-qahwa/pedido', 4, 2)).toEqual({
      index: 0,
      slug: 'khamrah-qahwa',
      order: true,
    });
    expect(parseBookHash('#libro/2/perfume/khamrah-qahwa/pedido', 4, 1)).toEqual({
      index: 1,
      slug: 'khamrah-qahwa',
      order: true,
    });
    expect(bookHash(2, null, true)).toBe('#libro/3');
    expect(parseBookHash('#libro/3/perfume/royale-opal', 4, 2)).not.toHaveProperty('order');
  });
  it('ignores unrelated anchors and malformed or unsafe state', () => {
    for (const hash of [
      '',
      '#contacto',
      '#coleccion',
      '#libro/0',
      '#libro/-1',
      '#libro/1.5',
      '#libro/99999999999999999999',
      '#libro/1/perfume/../otro',
      '#libro/1/perfume/https://other.test',
      '#libro/1/pedido',
      '#libro/1/perfume/9pm/pedido/extra',
      '#libro/1/perfume/9pm/pedidos',
      '#libro/1/perfume/9pm/pedido?phone=955565209',
    ]) {
      expect(parseBookHash(hash, 6, 2)).toBeNull();
    }
    expect(() => bookHash(0, '../otro')).toThrow();
  });
});
