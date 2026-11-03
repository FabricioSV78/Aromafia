import { describe, expect, it } from 'vitest';
import { products } from '../../src/features/catalog/data/products';
import type { CatalogQuery } from '../../src/features/catalog/domain/catalog-repository';
import type { CatalogProduct, PerfumeVariant } from '../../src/features/catalog/domain/product';
import {
  getEffectiveVariantPrice,
  getVariantPriceDisplay,
  hasActivePromotion,
} from '../../src/features/catalog/domain/variant-price';
import { LocalCatalogRepository } from '../../src/features/catalog/repositories/local-catalog-repository';
import { pen } from '../../src/shared/lib/money';

const NOW = new Date('2026-11-02T12:00:00Z');

// Synthetic fixtures only. None of these products are added to the public catalog.
function fakeVariant(id: string, overrides: Partial<PerfumeVariant> = {}): PerfumeVariant {
  return {
    id: `variant-${id}`,
    sku: `TEST-${id}`,
    capacityMl: 100,
    concentration: null,
    price: pen(20_000),
    priceKind: 'regular',
    regularPrice: null,
    availability: 'in_stock',
    promotion: null,
    ...overrides,
  };
}

function fakeProduct(id: string, overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id,
    slug: id,
    name: `Producto de prueba ${id}`,
    displayName: `Producto de prueba ${id}`,
    brand: { id: 'test-brand', name: 'Marca ficticia de pruebas' },
    description: 'Registro sintético exclusivo para pruebas automatizadas.',
    shortDescription: null,
    generalImage: {
      src: '/test-general.webp',
      alt: 'Frasco ficticio de prueba',
      width: 400,
      height: 600,
    },
    detailImage: {
      src: '/test-detail.webp',
      alt: 'Frasco ficticio de prueba',
      width: 800,
      height: 1200,
    },
    variants: [fakeVariant(id)],
    classification: 'unisex',
    olfactoryFamilies: ['cítrica'],
    notes: { top: ['limón'], heart: [], base: [] },
    featured: false,
    whatsappMessageName: `Producto de prueba ${id}`,
    order: 1,
    reviewStatus: 'confirmed',
    inspiredBy: null,
    badges: [],
    seoTitle: null,
    seoDescription: null,
    status: 'published',
    ...overrides,
  };
}

function repository(data: readonly CatalogProduct[]): LocalCatalogRepository {
  return new LocalCatalogRepository(data, { now: () => new Date(NOW) });
}

describe('public catalog repository', () => {
  it('lists the six published products in editorial order and reports honest totals', async () => {
    expect(products).toHaveLength(6);
    expect(await repository(products).list({ sort: 'editorial' })).toEqual({
      items: products,
      page: 1,
      pageSize: 24,
      totalItems: 6,
      totalPages: 1,
    });
  });

  it('never exposes draft or archived records through list or direct slug lookup', async () => {
    const catalog = repository([
      fakeProduct('public'),
      fakeProduct('draft', { status: 'draft' }),
      fakeProduct('archived', { status: 'archived' }),
    ]);

    expect((await catalog.list()).items.map((product) => product.id)).toEqual(['public']);
    expect(await catalog.getBySlug('draft')).toBeNull();
    expect(await catalog.getBySlug('archived')).toBeNull();
    expect(await catalog.getBySlug('missing')).toBeNull();
    expect((await catalog.getBySlug('public'))?.id).toBe('public');
  });

  it('isolates stored records from input and returned object mutations', async () => {
    const original = fakeProduct('isolated');
    if (!original.brand) throw new Error('Expected fixture brand');
    const input = [original];
    const catalog = repository(input);
    Object.assign(original.brand, { name: 'Changed outside repository' });
    input.splice(0);

    const first = await catalog.getBySlug('isolated');
    if (!first?.brand) throw new Error('Expected fixture product and brand');
    Object.assign(first, { name: 'Changed returned product' });
    Object.assign(first.brand, { name: 'Changed returned brand' });
    const page = await catalog.list();
    const returnedVariant = page.items[0]?.variants[0];
    if (!returnedVariant) throw new Error('Expected fixture variant');
    Object.assign(returnedVariant, { price: pen(1) });

    const second = await catalog.getBySlug('isolated');
    expect(second?.name).toBe('Producto de prueba isolated');
    expect(second?.brand?.name).toBe('Marca ficticia de pruebas');
    expect(second?.variants[0]?.price?.amountInCents).toBe(20_000);
  });

  it('combines accent-insensitive search with brand, family, classification and featured filters', async () => {
    const catalog = repository([
      fakeProduct('selected', { name: 'Ámbar de prueba', featured: true }),
      fakeProduct('other-brand', {
        name: 'Ámbar de prueba',
        brand: { id: 'other', name: 'Otra marca ficticia' },
      }),
      fakeProduct('other-family', { name: 'Ámbar de prueba', olfactoryFamilies: ['floral'] }),
    ]);

    const page = await catalog.list({
      search: ' AMBAR ',
      brandIds: ['test-brand'],
      olfactoryFamilies: ['CITRICA'],
      classifications: ['unisex'],
      featuredOnly: true,
    });
    expect(page.items.map((product) => product.id)).toEqual(['selected']);
  });

  it('requires price and availability constraints to match the same variant', async () => {
    const catalog = repository([
      fakeProduct('mixed', {
        variants: [
          fakeVariant('cheap-unavailable', { price: pen(5_000), availability: 'out_of_stock' }),
          fakeVariant('expensive-available', { price: pen(20_000), availability: 'in_stock' }),
        ],
      }),
    ]);

    expect(
      (await catalog.list({ availability: ['in_stock'], maxPriceInCents: 10_000 })).items,
    ).toEqual([]);
    expect(
      (await catalog.list({ availability: ['out_of_stock'], maxPriceInCents: 10_000 })).totalItems,
    ).toBe(1);
  });

  it('searches incomplete public records without treating a missing brand as a match', async () => {
    const catalog = repository([
      fakeProduct('pending-content', {
        name: 'Mandarine de prueba',
        brand: null,
        description: null,
        generalImage: null,
        detailImage: null,
        reviewStatus: 'pending',
        variants: [
          fakeVariant('pending-content', { sku: null, capacityMl: null, availability: 'unknown' }),
        ],
      }),
    ]);

    expect((await catalog.list({ search: 'mandarine' })).totalItems).toBe(1);
    expect((await catalog.list({ brandIds: ['test-brand'] })).items).toEqual([]);
    expect((await catalog.list({ search: 'null' })).items).toEqual([]);
    expect((await catalog.list({ availability: ['in_stock'] })).items).toEqual([]);
  });

  it('uses configured editorial order without changing the default name ordering', async () => {
    const catalog = repository([
      fakeProduct('a', { order: 3 }),
      fakeProduct('c', { order: 1 }),
      fakeProduct('b', { order: 2 }),
    ]);
    expect((await catalog.list({ sort: 'editorial' })).items.map((product) => product.id)).toEqual([
      'c',
      'b',
      'a',
    ]);
    expect((await catalog.list()).items.map((product) => product.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by eligible variants and keeps unknown prices last in both directions', async () => {
    const catalog = repository([
      fakeProduct('mixed', {
        variants: [
          fakeVariant('sold-out', { price: pen(5_000), availability: 'out_of_stock' }),
          fakeVariant('available', { price: pen(20_000) }),
        ],
      }),
      fakeProduct('middle', { variants: [fakeVariant('middle', { price: pen(15_000) })] }),
      fakeProduct('unknown', {
        variants: [fakeVariant('unknown', { price: null, availability: 'unknown' })],
      }),
    ]);

    const query = { availability: ['in_stock', 'unknown'] as const };
    expect(
      (await catalog.list({ ...query, sort: 'price-asc' })).items.map((product) => product.id),
    ).toEqual(['middle', 'mixed', 'unknown']);
    expect(
      (await catalog.list({ ...query, sort: 'price-desc' })).items.map((product) => product.id),
    ).toEqual(['mixed', 'middle', 'unknown']);
    expect(
      (await catalog.list({ maxPriceInCents: 30_000 })).items.some(
        (product) => product.id === 'unknown',
      ),
    ).toBe(false);
  });

  it('paginates deterministically and reports totals even beyond the last page', async () => {
    const catalog = repository([fakeProduct('c'), fakeProduct('a'), fakeProduct('b')]);
    const page = await catalog.list({ page: 2, pageSize: 2 });
    expect(page.items.map((product) => product.id)).toEqual(['c']);
    expect(page.totalItems).toBe(3);
    expect(page.totalPages).toBe(2);
    const beyond = await catalog.list({ page: 3, pageSize: 2 });
    expect(beyond.items).toEqual([]);
    expect(beyond.totalItems).toBe(3);
  });

  it.each<CatalogQuery>([
    { page: 0 },
    { page: 1.5 },
    { pageSize: 0 },
    { pageSize: 61 },
    { minPriceInCents: -1 },
    { maxPriceInCents: 1.1 },
    { minPriceInCents: 200, maxPriceInCents: 100 },
  ])('rejects invalid query values: %j', async (query) => {
    await expect(repository([]).list(query)).rejects.toThrow(RangeError);
  });
});

describe('verified promotional prices', () => {
  const promotion = {
    price: pen(15_000),
    startsAt: '2026-11-02T00:00:00Z',
    endsAt: '2026-11-03T00:00:00Z',
  };

  it('applies an offer only inside its explicit interval', () => {
    const variant = fakeVariant('promo', { promotion });
    expect(getEffectiveVariantPrice(variant, new Date('2026-11-01T23:59:59Z'))?.amountInCents).toBe(
      20_000,
    );
    expect(getEffectiveVariantPrice(variant, new Date(promotion.startsAt))?.amountInCents).toBe(
      15_000,
    );
    expect(hasActivePromotion(variant, NOW)).toBe(true);
    expect(getEffectiveVariantPrice(variant, new Date(promotion.endsAt))?.amountInCents).toBe(
      20_000,
    );
  });

  it('supports a confirmed current offer without inventing a former price or promotion interval', async () => {
    const variant = fakeVariant('current-offer', { price: pen(15_000), priceKind: 'offer' });
    const catalog = repository([fakeProduct('current-offer', { variants: [variant] })]);
    expect(getVariantPriceDisplay(variant, NOW)).toEqual({
      currentPrice: pen(15_000),
      regularPrice: null,
      isOffer: true,
    });
    expect(variant.promotion).toBeNull();
    expect((await catalog.list({ promotionOnly: true, maxPriceInCents: 16_000 })).totalItems).toBe(
      1,
    );
    expect((await catalog.list({ minPriceInCents: 16_000 })).totalItems).toBe(0);
  });

  it('shows a confirmed former price only when greater than the effective current price', () => {
    const variant = fakeVariant('comparison', {
      price: pen(15_000),
      priceKind: 'offer',
      regularPrice: pen(18_000),
    });
    expect(getVariantPriceDisplay(variant, NOW)).toEqual({
      currentPrice: pen(15_000),
      regularPrice: pen(18_000),
      isOffer: true,
    });
    expect(() =>
      repository([
        fakeProduct('bad-comparison', {
          variants: [
            fakeVariant('bad-comparison', { priceKind: 'offer', regularPrice: pen(20_000) }),
          ],
        }),
      ]),
    ).toThrow();
    expect(() =>
      repository([
        fakeProduct('unknown-comparison', {
          variants: [
            fakeVariant('unknown-comparison', {
              price: null,
              priceKind: 'offer',
              regularPrice: pen(22_000),
            }),
          ],
        }),
      ]),
    ).toThrow();
  });

  it('uses active promotional prices in filters without exposing expired offers as active', async () => {
    const catalog = repository([
      fakeProduct('active', { variants: [fakeVariant('active', { promotion })] }),
      fakeProduct('expired', {
        variants: [
          fakeVariant('expired', {
            promotion: {
              ...promotion,
              startsAt: '2026-10-01T00:00:00Z',
              endsAt: '2026-10-31T00:00:00Z',
            },
          }),
        ],
      }),
    ]);
    const page = await catalog.list({ promotionOnly: true, maxPriceInCents: 16_000 });
    expect(page.items.map((product) => product.id)).toEqual(['active']);
  });

  it('rejects invented discount comparisons and ambiguous promotion dates', () => {
    expect(() =>
      repository([
        fakeProduct('bad', { variants: [fakeVariant('bad', { price: null, promotion })] }),
      ]),
    ).toThrow(/confirmed/);
    expect(() =>
      repository([
        fakeProduct('bad', {
          variants: [fakeVariant('bad', { promotion: { ...promotion, price: pen(20_000) } })],
        }),
      ]),
    ).toThrow(/below/);
    expect(() =>
      repository([
        fakeProduct('bad', {
          variants: [
            fakeVariant('bad', { promotion: { ...promotion, startsAt: '2026-11-02T00:00:00' } }),
          ],
        }),
      ]),
    ).toThrow(/time zone/);
    expect(() =>
      repository([
        fakeProduct('bad', {
          variants: [
            fakeVariant('bad', { promotion: { ...promotion, endsAt: promotion.startsAt } }),
          ],
        }),
      ]),
    ).toThrow(/end after/);
  });
});

describe('catalog import integrity', () => {
  it('allows unknown SKU and capacity while preserving validation for entered values', () => {
    expect(() =>
      repository([
        fakeProduct('pending-a', {
          reviewStatus: 'pending',
          variants: [fakeVariant('pending-a', { sku: null, capacityMl: null })],
        }),
        fakeProduct('pending-b', {
          reviewStatus: 'pending',
          variants: [fakeVariant('pending-b', { sku: null, capacityMl: null })],
        }),
      ]),
    ).not.toThrow();
    for (const capacityMl of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        repository([
          fakeProduct('bad-capacity', {
            reviewStatus: 'pending',
            variants: [fakeVariant('bad-capacity', { capacityMl })],
          }),
        ]),
      ).toThrow();
    }
    expect(() =>
      repository([
        fakeProduct('bad-sku', {
          reviewStatus: 'pending',
          variants: [fakeVariant('bad-sku', { sku: ' ' })],
        }),
      ]),
    ).toThrow();
  });

  it('does not allow missing facts to be marked confirmed', () => {
    for (const override of [
      { brand: null },
      { description: null },
      { generalImage: null },
      { detailImage: null },
    ]) {
      expect(() => repository([fakeProduct('missing', override)])).toThrow();
    }
    expect(() =>
      repository([
        fakeProduct('missing-variant', {
          variants: [fakeVariant('missing-variant', { sku: null, capacityMl: null })],
        }),
      ]),
    ).toThrow();
  });

  it('rejects duplicate product identifiers, slugs, variant identifiers and SKUs', () => {
    expect(() => repository([fakeProduct('a'), fakeProduct('b', { id: 'a' })])).toThrow(
      /Duplicate product id/,
    );
    expect(() => repository([fakeProduct('a'), fakeProduct('b', { slug: 'a' })])).toThrow(
      /Duplicate product slug/,
    );
    expect(() =>
      repository([
        fakeProduct('a'),
        fakeProduct('b', { variants: [fakeVariant('b', { id: 'variant-a' })] }),
      ]),
    ).toThrow(/Duplicate variant id/);
    expect(() =>
      repository([
        fakeProduct('a'),
        fakeProduct('b', { variants: [fakeVariant('b', { sku: 'TEST-a' })] }),
      ]),
    ).toThrow(/Duplicate SKU/);
  });

  it('requires accessible, dimensioned images and rejects an invalid slug', () => {
    expect(() => repository([fakeProduct('bad', { slug: '../bad' })])).toThrow(
      /Invalid product slug/,
    );
    expect(() => repository([fakeProduct('bad', { generalImage: null })])).toThrow();
    expect(() =>
      repository([
        fakeProduct('bad', {
          generalImage: { src: '/test.webp', alt: '', width: 400, height: 600 },
        }),
      ]),
    ).toThrow(/alt/);
    expect(() =>
      repository([
        fakeProduct('bad', {
          detailImage: { src: '/test.webp', alt: 'Test', width: 0, height: 600 },
        }),
      ]),
    ).toThrow(/width and height/);
  });

  it('rejects photographic fill values that collapse, stretch beyond the surface or are not finite', () => {
    for (const fill of [0, -0.1, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        repository([
          fakeProduct('bad-photo-fill', {
            detailImage: {
              src: '/test.webp',
              alt: 'Frasco de prueba',
              width: 400,
              height: 600,
              fill,
            },
          }),
        ]),
      ).toThrow(/fill/);
    }
  });

  it('validates a confirmed inspiration image and rejects unsafe photo locations', () => {
    for (const src of [
      'http://example.test/photo.webp',
      'https://user:secret@example.test/photo.webp',
      '//example.test/photo.webp',
      '/\\example.test/photo.webp',
      '/photo with space.webp',
    ]) {
      expect(() =>
        repository([
          fakeProduct('invalid-image', {
            inspiredBy: {
              name: 'Referencia ficticia de prueba',
              brand: null,
              relation: 'inspired_by',
              image: { src, alt: 'Referencia de prueba', width: 200, height: 300 },
            },
          }),
        ]),
      ).toThrow();
    }
    expect(() =>
      repository([
        fakeProduct('valid-image', {
          inspiredBy: {
            name: 'Referencia ficticia de prueba',
            brand: null,
            relation: 'similar_to',
            image: {
              src: 'https://example.test/photo.webp',
              alt: 'Referencia de prueba',
              width: 200,
              height: 300,
            },
          },
        }),
      ]),
    ).not.toThrow();
  });
});
