import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { products } from '../../src/features/catalog/data/products';
import { validateCatalog } from '../../src/features/catalog/domain/catalog-validation';
import { pen } from '../../src/shared/lib/money';

const product = products[0];
const generalImage = product?.generalImage;
if (!product || !generalImage || !product.variants[0])
  throw new Error('Expected a public product.');

describe('finished photographs by perfume and public role', () => {
  it('delivers three distinct, opaque photographs with their declared dimensions', async () => {
    for (const entry of products) {
      const roles = {
        general: entry.generalImage,
        detail: entry.detailImage,
        inspiration: entry.inspiredBy?.image,
      };
      const paths = Object.values(roles).map((image) => image?.src);
      expect(new Set(paths).size).toBe(3);
      for (const [role, image] of Object.entries(roles)) {
        if (!image) throw new Error(`${entry.slug} needs its ${role} photograph.`);
        expect(image.src).toBe(`/images/perfumes/${entry.slug}/${role}.webp`);
        expect(image.maskSrc).toBeUndefined();
        expect(image.framing).toBeUndefined();
        const metadata = await sharp(resolve('public', image.src.slice(1))).metadata();
        expect(metadata.width).toBe(image.width);
        expect(metadata.height).toBe(image.height);
        expect(metadata.hasAlpha).toBe(false);
        expect(metadata.format).toBe('webp');
        expect(image.width / image.height).toBe(role === 'inspiration' ? 0.75 : 1);
      }
    }
  });

  it('serves responsive variants from the same perfume folder at their declared widths', async () => {
    for (const entry of products) {
      for (const image of [entry.generalImage, entry.detailImage, entry.inspiredBy?.image]) {
        if (!image?.srcSet) throw new Error(`${entry.slug} needs responsive photographs.`);
        const candidates = image.srcSet.split(',');
        expect(candidates.length).toBeGreaterThanOrEqual(2);
        for (const candidate of candidates) {
          const [path, descriptor] = candidate.trim().split(/\s+/u);
          if (!path || !descriptor) throw new Error('Each candidate needs a path and width.');
          expect(path.startsWith(`/images/perfumes/${entry.slug}/`)).toBe(true);
          expect(descriptor).toMatch(/^\d+w$/u);
          const metadata = await sharp(resolve('public', path.slice(1))).metadata();
          expect(metadata.width).toBe(Number.parseInt(descriptor, 10));
          expect(metadata.width / metadata.height).toBe(image.width / image.height);
        }
      }
    }
  });
});

it('a comparison with another shop requires a higher price, HTTPS source and observation date', () => {
  const variant = product.variants[0];
  if (!variant) throw new Error('Expected a public variant.');
  const reference = {
    price: pen(15_900),
    source: { label: 'Test shop', url: 'https://example.com/product' },
    checkedOn: '2026-11-03',
  };
  for (const invalid of [
    { ...reference, price: pen(1) },
    { ...reference, source: { label: 'Test shop', url: 'javascript:alert(1)' } },
    { ...reference, checkedOn: 'yesterday' },
  ]) {
    expect(() =>
      validateCatalog([{ ...product, variants: [{ ...variant, marketReference: invalid }] }]),
    ).toThrow();
  }
  expect(variant.regularPrice).toBeNull();
});
