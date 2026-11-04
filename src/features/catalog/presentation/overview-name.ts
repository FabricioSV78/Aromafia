import type { CatalogProduct } from '../domain/product';

const overviewNames: Readonly<Record<string, string>> = {
  '9pm': '9PM',
  'hawas-ice': 'Hawas Ice',
  mandarine: 'Mandarin Sky',
  'khamrah-qahwa': 'Khamrah Qahwa',
  'hawas-malibu': 'Hawas Malibu',
  'royale-opal': 'Royale Opal',
};

/** Editorial labels belong to the overview; product identity and purchase names stay intact. */
export function getOverviewName(product: Pick<CatalogProduct, 'slug' | 'displayName'>): string {
  return overviewNames[product.slug] ?? product.displayName;
}
