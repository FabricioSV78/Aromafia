import type { PenMoney } from '../../../shared/lib/money';
import type { PerfumeVariant } from './product';

export interface VariantPriceDisplay {
  readonly currentPrice: PenMoney | null;
  readonly regularPrice: PenMoney | null;
  readonly isOffer: boolean;
}

export function hasActivePromotion(variant: PerfumeVariant, at: Date): boolean {
  const promotion = variant.promotion;
  if (!promotion) return false;

  const timestamp = at.getTime();
  return timestamp >= Date.parse(promotion.startsAt) && timestamp < Date.parse(promotion.endsAt);
}

/** The caller supplies one shared timestamp for a render or repository request. */
export function getEffectiveVariantPrice(variant: PerfumeVariant, at: Date): PenMoney | null {
  if (variant.promotion && hasActivePromotion(variant, at)) return variant.promotion.price;
  return variant.price;
}

/** Confirmed untimed offers require no fabricated promotion dates. */
export function getVariantPriceDisplay(variant: PerfumeVariant, at: Date): VariantPriceDisplay {
  if (hasActivePromotion(variant, at)) {
    return {
      currentPrice: getEffectiveVariantPrice(variant, at),
      regularPrice: variant.price,
      isOffer: true,
    };
  }
  return {
    currentPrice: variant.price,
    regularPrice: variant.priceKind === 'offer' ? variant.regularPrice : null,
    isOffer: variant.priceKind === 'offer' && variant.price !== null,
  };
}

export function hasActiveOffer(variant: PerfumeVariant, at: Date): boolean {
  return getVariantPriceDisplay(variant, at).isOffer;
}
