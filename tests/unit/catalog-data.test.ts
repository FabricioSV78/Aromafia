import { describe, expect, it } from 'vitest';
import { products } from '../../src/features/catalog/data/products';
import {
  regularPriceProposals,
  validatePriceProposals,
} from '../../src/features/catalog/data/price-proposals';
import type { CatalogProduct } from '../../src/features/catalog/domain/product';
import { getVariantPriceDisplay } from '../../src/features/catalog/domain/variant-price';
import { LocalCatalogRepository } from '../../src/features/catalog/repositories/local-catalog-repository';
import { catalogRepository } from '../../src/features/catalog/services/catalog.server';
import { pen } from '../../src/shared/lib/money';

const NOW = new Date('2026-11-02T12:00:00Z');
const EXPECTED = [
  ['9 pm', 15_000],
  ['Hawas Ice 100ml', 18_500],
  ['Odyssey Mandarin Sky', 14_900],
  ['Khamrah Qahwa', 16_000],
  ['Hawas Malibu', 18_900],
  ['Zakat Royale Opal', 11_500],
];

describe('owner-provided catalog content', () => {
  it('contains the six owner-confirmed identities, prices and stable routes in editorial order', () => {
    expect(
      products.map((product) => [product.name, product.variants[0]?.price?.amountInCents]),
    ).toEqual(EXPECTED);
    expect(products.map((product) => product.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(products.map((product) => product.slug)).toEqual([
      '9pm',
      'hawas-ice',
      'mandarine',
      'khamrah-qahwa',
      'hawas-malibu',
      'royale-opal',
    ]);
    for (const product of products) {
      expect(product.displayName).toBe(product.name);
      expect(product.whatsappMessageName).toBe(product.name);
      expect(product.variants).toHaveLength(1);
      expect(product.variants[0]?.price?.currency).toBe('PEN');
      expect(product.variants[0]?.priceKind).toBe('offer');
    }
  });

  it('publishes sourced perfume content with owner-confirmed presentations and availability', () => {
    const brands = ['Afnan', 'Rasasi', 'Armaf', 'Lattafa', 'Rasasi', 'Zakat'];
    const capacities = [100, 100, 100, 100, 100, 80];
    for (const [index, product] of products.entries()) {
      expect(product.status).toBe('published');
      expect(product.reviewStatus).toBe('pending');
      expect(product.brand?.name).toBe(brands[index]);
      expect(product.description?.trim().length).toBeGreaterThan(0);
      expect(product.shortDescription?.trim().length).toBeGreaterThan(0);
      for (const image of [product.generalImage, product.detailImage]) {
        expect(image?.src).toMatch(/^\/images\/perfumes\/.+\.webp$/);
        expect(image?.width).toBeGreaterThanOrEqual(320);
        expect(image?.height).toBeGreaterThanOrEqual(320);
        expect(image?.alt.trim().length).toBeGreaterThan(0);
      }
      expect(product.generalImage?.src).not.toBe(product.detailImage?.src);
      if (product.generalImage?.composition !== 'scene') {
        expect(product.generalImage?.fill).toBeGreaterThan(0);
        expect(product.generalImage?.fill).toBeLessThan(product.detailImage?.fill ?? 0);
      }
      expect(product.detailImage?.width).toBeGreaterThan(product.generalImage?.width ?? 0);
      for (const group of [product.notes.top, product.notes.heart, product.notes.base]) {
        expect(group.length).toBeGreaterThan(0);
        expect(group.every((note) => note.trim().length > 0)).toBe(true);
      }
      expect(product.sources?.length).toBeGreaterThan(0);
      for (const source of product.sources ?? []) {
        expect(source.label.trim().length).toBeGreaterThan(0);
        expect(new URL(source.url).protocol).toBe('https:');
      }
      const inspiration = product.inspiredBy;
      if (!inspiration?.image)
        throw new Error('Cada perfume necesita su tercera foto de referencia.');
      expect(inspiration.name.trim().length).toBeGreaterThan(0);
      expect(inspiration.brand?.trim().length).toBeGreaterThan(0);
      expect(inspiration.relation).toBe('similar_to');
      expect(inspiration.image.src).toMatch(/^\/images\/perfumes\/.+\.webp$/);
      expect(inspiration.image.width).toBeGreaterThan(0);
      expect(inspiration.image.height).toBeGreaterThan(0);
      expect(
        new Set([product.generalImage?.src, product.detailImage?.src, inspiration.image.src]).size,
      ).toBe(3);
      expect(inspiration.sources?.length).toBeGreaterThanOrEqual(1);
      for (const source of inspiration.sources ?? []) {
        expect(source.label.trim().length).toBeGreaterThan(0);
        expect(new URL(source.url).protocol).toBe('https:');
      }
      expect(product.featured).toBe(false);
      expect(product.badges).toEqual([]);
      for (const variant of product.variants) {
        expect(variant.sku).toBeNull();
        expect(variant.capacityMl).toBe(capacities[index]);
        expect(variant.concentration).toBe('Eau de Parfum');
        expect(variant.availability).toBe('in_stock');
        expect(variant.regularPrice).toBeNull();
        if (variant.marketReference) {
          expect(variant.marketReference.price.currency).toBe('PEN');
          expect(variant.marketReference.price.amountInCents).toBeGreaterThan(
            variant.price?.amountInCents ?? Number.POSITIVE_INFINITY,
          );
          expect(variant.marketReference.source.label.trim().length).toBeGreaterThan(0);
          expect(new URL(variant.marketReference.source.url).protocol).toBe('https:');
          expect(variant.marketReference.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
        expect(variant.promotion).toBeNull();
      }
    }
  });

  it('exposes the six explicitly published products while keeping their content review pending', async () => {
    const page = await catalogRepository.list({ sort: 'editorial' });
    expect(page.items).toEqual(products);
    expect(page.totalItems).toBe(6);
    for (const product of products) {
      const publicProduct = await catalogRepository.getBySlug(product.slug);
      expect(publicProduct).toEqual(product);
      expect(publicProduct?.reviewStatus).toBe('pending');
    }
  });

  it('keeps merchant price references separate from AROMAFIA former-price history', () => {
    const comparisons = products.flatMap((product) =>
      product.variants.flatMap((variant) =>
        variant.marketReference ? [variant.marketReference] : [],
      ),
    );
    expect(comparisons.length).toBeGreaterThanOrEqual(5);
    for (const variant of products.flatMap((product) => product.variants))
      expect(variant.regularPrice).toBeNull();
    expect(
      products.find((product) => product.slug === 'royale-opal')?.variants[0]?.marketReference,
    ).toBeUndefined();
  });

  it('still hides the same products when their publication state is draft or archived', async () => {
    const hidden = products.map((product, index): CatalogProduct => ({
      ...product,
      status: index % 2 === 0 ? 'draft' : 'archived',
    }));
    const repository = new LocalCatalogRepository(hidden, { now: () => new Date(NOW) });
    expect((await repository.list()).items).toEqual([]);
    for (const product of hidden) expect(await repository.getBySlug(product.slug)).toBeNull();
  });

  it('keeps editable comparison proposals out of the real public records', async () => {
    const repository = new LocalCatalogRepository(products, { now: () => new Date(NOW) });
    const page = await repository.list({ sort: 'editorial' });
    expect(page.items).toHaveLength(6);
    expect(page.items).toEqual(products);
    for (const product of page.items) {
      const variant = product.variants[0];
      if (!variant) throw new Error('Expected a test variant');
      expect(getVariantPriceDisplay(variant, NOW)).toEqual({
        currentPrice: variant.price,
        regularPrice: null,
        isOffer: true,
      });
      const direct = await repository.getBySlug(product.slug);
      expect(direct?.variants[0]?.regularPrice).toBeNull();
    }
    const publicJson = JSON.stringify(page);
    expect(publicJson).not.toContain('"status":"proposed"');
  });
});

describe('private editable former-price proposals', () => {
  it('validates existing references and keeps the supplied current prices unchanged', () => {
    const before = structuredClone(products);
    expect(regularPriceProposals).toHaveLength(6);
    expect(new Set(regularPriceProposals.map((proposal) => proposal.variantId)).size).toBe(6);
    expect(regularPriceProposals.every((proposal) => proposal.status === 'proposed')).toBe(true);
    expect(() => validatePriceProposals(products, regularPriceProposals)).not.toThrow();
    expect(products).toEqual(before);
  });

  it('rejects orphan references, duplicate proposals and comparisons below the current price', () => {
    const proposal = regularPriceProposals[0];
    if (!proposal) throw new Error('Expected an editable price proposal');
    expect(() =>
      validatePriceProposals(products, [{ ...proposal, productId: 'missing-product' }]),
    ).toThrow();
    expect(() =>
      validatePriceProposals(products, [{ ...proposal, variantId: 'missing-variant' }]),
    ).toThrow();
    expect(() => validatePriceProposals(products, [proposal, proposal])).toThrow();
    expect(() =>
      validatePriceProposals(products, [{ ...proposal, regularPrice: pen(1) }]),
    ).toThrow();
  });
});
