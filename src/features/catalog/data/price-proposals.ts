import type { CatalogProduct } from '../domain/product';
import { assertPenMoney, pen, type PenMoney } from '../../../shared/lib/money';

/** Private authoring data, never a verified historical price or public product property. */
export interface RegularPriceProposal {
  readonly productId: string;
  readonly variantId: string;
  readonly regularPrice: PenMoney;
  readonly status: 'proposed';
}

/** Editable examples requested by the owner, NOT market or previous-sale prices. */
export const regularPriceProposals: readonly RegularPriceProposal[] = [
  {
    productId: 'aromafia-9pm',
    variantId: 'aromafia-9pm-presentation-1',
    regularPrice: pen(18_000),
    status: 'proposed',
  },
  {
    productId: 'aromafia-hawas-ice',
    variantId: 'aromafia-hawas-ice-presentation-1',
    regularPrice: pen(22_000),
    status: 'proposed',
  },
  {
    productId: 'aromafia-mandarine',
    variantId: 'aromafia-mandarine-presentation-1',
    regularPrice: pen(17_900),
    status: 'proposed',
  },
  {
    productId: 'aromafia-khamrah-qahwa',
    variantId: 'aromafia-khamrah-qahwa-presentation-1',
    regularPrice: pen(19_000),
    status: 'proposed',
  },
  {
    productId: 'aromafia-hawas-malibu',
    variantId: 'aromafia-hawas-malibu-presentation-1',
    regularPrice: pen(22_900),
    status: 'proposed',
  },
  {
    productId: 'aromafia-royale-opal',
    variantId: 'aromafia-royale-opal-presentation-1',
    regularPrice: pen(13_900),
    status: 'proposed',
  },
];

/** Check editing references without merging a proposal into any public catalog record. */
export function validatePriceProposals(
  catalog: readonly CatalogProduct[],
  proposals: readonly RegularPriceProposal[],
): void {
  const seen = new Set<string>();
  for (const proposal of proposals) {
    const product = catalog.find((item) => item.id === proposal.productId);
    const variant = product?.variants.find((item) => item.id === proposal.variantId);
    if (!variant)
      throw new TypeError('Price proposal must reference an existing product and variant.');
    if (seen.has(variant.id)) throw new TypeError('Duplicate price proposal for a variant.');
    seen.add(variant.id);
    if (proposal.status !== 'proposed')
      throw new TypeError('Editing proposals must remain proposed.');
    assertPenMoney(proposal.regularPrice, 'Proposed regular price');
    if (!variant.price || proposal.regularPrice.amountInCents <= variant.price.amountInCents)
      throw new TypeError('A proposed regular price must be above the confirmed current price.');
  }
}
