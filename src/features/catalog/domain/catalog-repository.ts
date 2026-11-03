import type { Availability, CatalogProduct, CommercialClassification } from './product';

export type CatalogSort = 'editorial' | 'name-asc' | 'price-asc' | 'price-desc';

export interface CatalogQuery {
  readonly search?: string;
  readonly brandIds?: readonly string[];
  readonly classifications?: readonly CommercialClassification[];
  readonly olfactoryFamilies?: readonly string[];
  readonly availability?: readonly Availability[];
  readonly minPriceInCents?: number;
  readonly maxPriceInCents?: number;
  readonly featuredOnly?: boolean;
  /** Includes owner-confirmed untimed offers and currently active timed promotions. */
  readonly promotionOnly?: boolean;
  readonly sort?: CatalogSort;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CatalogPage {
  readonly items: readonly CatalogProduct[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

/** Public read contract. Drafts and archived products must never be exposed. */
export interface CatalogRepository {
  list(query?: CatalogQuery): Promise<CatalogPage>;
  getBySlug(slug: string): Promise<CatalogProduct | null>;
}
