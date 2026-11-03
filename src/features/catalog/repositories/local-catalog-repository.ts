import type { CatalogPage, CatalogQuery, CatalogRepository } from '../domain/catalog-repository';
import { validateCatalog } from '../domain/catalog-validation';
import type { CatalogProduct, PerfumeVariant } from '../domain/product';
import { getEffectiveVariantPrice, hasActiveOffer } from '../domain/variant-price';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;
const collator = new Intl.Collator('es-PE', { sensitivity: 'base', numeric: true });

function normalized(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-PE').trim();
}

function validateQuery(query: CatalogQuery): void {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  if (!Number.isSafeInteger(page) || page < 1)
    throw new RangeError('Page must be a positive integer.');
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new RangeError(`Page size must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
  }
  for (const price of [query.minPriceInCents, query.maxPriceInCents]) {
    if (price !== undefined && (!Number.isSafeInteger(price) || price < 0)) {
      throw new RangeError('Price filters must use non-negative integer céntimos.');
    }
  }
  if (
    query.minPriceInCents !== undefined &&
    query.maxPriceInCents !== undefined &&
    query.minPriceInCents > query.maxPriceInCents
  ) {
    throw new RangeError('Minimum price must not exceed maximum price.');
  }
}

function matchesVariant(variant: PerfumeVariant, query: CatalogQuery, now: Date): boolean {
  if (query.availability?.length && !query.availability.includes(variant.availability))
    return false;
  if (query.promotionOnly && !hasActiveOffer(variant, now)) return false;
  const price = getEffectiveVariantPrice(variant, now);
  if (
    query.minPriceInCents !== undefined &&
    (!price || price.amountInCents < query.minPriceInCents)
  )
    return false;
  if (
    query.maxPriceInCents !== undefined &&
    (!price || price.amountInCents > query.maxPriceInCents)
  )
    return false;
  return true;
}

function matchingPrice(product: CatalogProduct, query: CatalogQuery, now: Date): number | null {
  const prices = product.variants
    .filter((variant) => matchesVariant(variant, query, now))
    .map((variant) => getEffectiveVariantPrice(variant, now)?.amountInCents)
    .filter((price): price is number => price !== undefined);
  return prices.length ? Math.min(...prices) : null;
}

/** Replace this adapter with a server repository without changing public consumers. */
export class LocalCatalogRepository implements CatalogRepository {
  readonly #products: readonly CatalogProduct[];
  readonly #now: () => Date;

  constructor(products: readonly CatalogProduct[], options: { readonly now?: () => Date } = {}) {
    validateCatalog(products);
    this.#products = structuredClone(products);
    this.#now = options.now ?? (() => new Date());
  }

  async getBySlug(slug: string): Promise<CatalogProduct | null> {
    const product = this.#products.find(
      (item) => item.status === 'published' && item.slug === slug,
    );
    return product ? structuredClone(product) : null;
  }

  async list(query: CatalogQuery = {}): Promise<CatalogPage> {
    validateQuery(query);
    const now = this.#now();
    if (!Number.isFinite(now.getTime()))
      throw new TypeError('Catalog clock returned an invalid date.');
    const search = normalized(query.search ?? '');
    const families = query.olfactoryFamilies?.map(normalized) ?? [];

    const items = this.#products.filter((product) => {
      if (product.status !== 'published') return false;
      if (query.brandIds?.length && (!product.brand || !query.brandIds.includes(product.brand.id)))
        return false;
      if (query.classifications?.length && !query.classifications.includes(product.classification))
        return false;
      if (query.featuredOnly && !product.featured) return false;
      if (
        families.length &&
        !product.olfactoryFamilies.some((family) => families.includes(normalized(family)))
      )
        return false;
      if (
        search &&
        !normalized(
          `${product.name} ${product.displayName} ${product.brand?.name ?? ''} ${product.description ?? ''}`,
        ).includes(search)
      )
        return false;
      return product.variants.some((variant) => matchesVariant(variant, query, now));
    });

    items.sort((a, b) => {
      if (query.sort === 'editorial' && a.order !== b.order) return a.order - b.order;
      if (query.sort === 'price-asc' || query.sort === 'price-desc') {
        const aPrice = matchingPrice(a, query, now);
        const bPrice = matchingPrice(b, query, now);
        // Unknown prices always come last, in either direction.
        if (aPrice === null && bPrice !== null) return 1;
        if (aPrice !== null && bPrice === null) return -1;
        if (aPrice !== null && bPrice !== null && aPrice !== bPrice) {
          return query.sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
        }
      }
      return collator.compare(a.name, b.name) || collator.compare(a.id, b.id);
    });

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * pageSize;
    return {
      items: structuredClone(items.slice(offset, offset + pageSize)),
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    };
  }
}
