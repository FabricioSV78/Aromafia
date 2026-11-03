import type { CatalogProduct, PerfumeVariant } from '../domain/product';
import { pen } from '../../../shared/lib/money';
import { researchedContent } from './product-research';
import { marketReferencePrices } from './market-reference-prices';

/** Unknown information remains explicit. Override a field on its product when confirmed. */
const pendingContent = {
  brand: null,
  description: null,
  shortDescription: null,
  generalImage: null,
  detailImage: null,
  classification: 'unspecified',
  olfactoryFamilies: [],
  notes: { top: [], heart: [], base: [] },
  inspiredBy: null,
  badges: [],
  featured: false,
  seoTitle: null,
  seoDescription: null,
  reviewStatus: 'pending',
  // Phase 3 authorizes listing the supplied names/prices with explicit pending-content labels.
  status: 'published',
} as const;

/** Capacities and stock confirmed by the owner; concentration checked against the product. */
function catalogVariant(productId: string, offerCents: number, capacityMl: number): PerfumeVariant {
  const marketReference = marketReferencePrices[productId.replace(/^aromafia-/, '')];
  return {
    id: `${productId}-presentation-1`,
    sku: null,
    capacityMl,
    concentration: 'Eau de Parfum',
    price: pen(offerCents),
    priceKind: 'offer',
    regularPrice: null,
    ...(marketReference ? { marketReference } : {}),
    availability: 'in_stock',
    promotion: null,
  };
}

/** Owner-confirmed names, capacities and prices, combined with sourced fragrance information. */
export const products: readonly CatalogProduct[] = [
  {
    ...pendingContent,
    ...researchedContent['9pm'],
    id: 'aromafia-9pm',
    slug: '9pm',
    name: '9 pm',
    displayName: '9 pm',
    whatsappMessageName: '9 pm',
    occasionSuggestion: 'La noche',
    order: 1,
    variants: [catalogVariant('aromafia-9pm', 15_000, 100)],
  },
  {
    ...pendingContent,
    ...researchedContent['hawas-ice'],
    id: 'aromafia-hawas-ice',
    slug: 'hawas-ice',
    name: 'Hawas Ice 100ml',
    displayName: 'Hawas Ice 100ml',
    whatsappMessageName: 'Hawas Ice 100ml',
    occasionSuggestion: 'Días cálidos',
    order: 2,
    variants: [catalogVariant('aromafia-hawas-ice', 18_500, 100)],
  },
  {
    ...pendingContent,
    ...researchedContent.mandarine,
    id: 'aromafia-mandarine',
    slug: 'mandarine',
    name: 'Odyssey Mandarin Sky',
    displayName: 'Odyssey Mandarin Sky',
    whatsappMessageName: 'Odyssey Mandarin Sky',
    occasionSuggestion: 'Salidas y reuniones',
    order: 3,
    variants: [catalogVariant('aromafia-mandarine', 14_900, 100)],
  },
  {
    ...pendingContent,
    ...researchedContent['khamrah-qahwa'],
    id: 'aromafia-khamrah-qahwa',
    slug: 'khamrah-qahwa',
    name: 'Khamrah Qahwa',
    displayName: 'Khamrah Qahwa',
    whatsappMessageName: 'Khamrah Qahwa',
    occasionSuggestion: 'Noches frescas',
    order: 4,
    variants: [catalogVariant('aromafia-khamrah-qahwa', 16_000, 100)],
  },
  {
    ...pendingContent,
    ...researchedContent['hawas-malibu'],
    id: 'aromafia-hawas-malibu',
    slug: 'hawas-malibu',
    name: 'Hawas Malibu',
    displayName: 'Hawas Malibu',
    whatsappMessageName: 'Hawas Malibu',
    occasionSuggestion: 'Días de sol',
    order: 5,
    variants: [catalogVariant('aromafia-hawas-malibu', 18_900, 100)],
  },
  {
    ...pendingContent,
    ...researchedContent['royale-opal'],
    id: 'aromafia-royale-opal',
    slug: 'royale-opal',
    name: 'Zakat Royale Opal',
    displayName: 'Zakat Royale Opal',
    whatsappMessageName: 'Zakat Royale Opal',
    occasionSuggestion: 'Cenas especiales',
    order: 6,
    variants: [catalogVariant('aromafia-royale-opal', 11_500, 80)],
  },
];
