import { products } from '../data/products';
import type { CatalogRepository } from '../domain/catalog-repository';
import { LocalCatalogRepository } from '../repositories/local-catalog-repository';

/**
 * Server/build-time composition root. Never import this module into a hydrated island:
 * local source data may include drafts even though repository reads exclude them.
 * Switch the adapter here when a backend is actually required.
 */
export const catalogRepository: CatalogRepository = new LocalCatalogRepository(products);
