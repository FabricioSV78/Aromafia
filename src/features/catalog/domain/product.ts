import type { PenMoney } from '../../../shared/lib/money';

export type PublicationStatus = 'draft' | 'published' | 'archived';
/** Content review is independent of publication; pending fields stay explicit. */
export type ContentReviewStatus = 'pending' | 'confirmed';
export type Availability = 'unknown' | 'in_stock' | 'out_of_stock' | 'preorder';
export type CommercialClassification = 'women' | 'men' | 'unisex' | 'unspecified';

export interface ProductBrand {
  readonly id: string;
  readonly name: string;
}

export interface ProductImage {
  /** A complete studio photo keeps its own background; isolated photos use the shared scene. */
  readonly composition?: 'isolated' | 'scene';
  /** Local absolute path or an approved HTTPS asset URL. */
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly srcSet?: string;
  /** Relative product size within its photographic surface; role-specific, never a stretch. */
  readonly fill?: number;
  /** Normalized framing of the real source photograph, including its natural shadow. */
  readonly framing?: {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
    /** Bottle footprint within the framing rectangle, from 0 to 1. */
    readonly anchorX?: number;
    readonly anchorY?: number;
  };
  /** Measured neutral source background; used for a small exposure correction in CSS. */
  readonly whitePoint?: number;
  readonly transparent?: boolean;
  /** Local SVG alpha mask; clips the source background without redrawing the product. */
  readonly maskSrc?: string;
}

export interface ProductInformationSource {
  readonly label: string;
  readonly url: string;
}

export interface PricePromotion {
  /** Verified promotional price; it must be lower than the regular price. */
  readonly price: PenMoney;
  /** ISO 8601 timestamp including a time zone. Inclusive start, exclusive end. */
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface PerfumeVariant {
  readonly id: string;
  /** Internal variant ids are not commercial SKUs. */
  readonly sku: string | null;
  readonly capacityMl: number | null;
  readonly concentration: string | null;
  /** Null means the price has not been confirmed, never zero by default. */
  readonly price: PenMoney | null;
  /** Owner-confirmed offer, even when no timed promotion was supplied. */
  readonly priceKind: 'regular' | 'offer';
  /** Confirmed reference price only. Editable proposals live outside the public model. */
  readonly regularPrice: PenMoney | null;
  /** A dated price observed at another shop, explicitly distinct from this shop's price history. */
  readonly marketReference?: {
    readonly price: PenMoney;
    readonly source: ProductInformationSource;
    readonly checkedOn: string;
  };
  readonly availability: Availability;
  readonly promotion: PricePromotion | null;
}

export interface FragranceNotes {
  readonly top: readonly string[];
  readonly heart: readonly string[];
  readonly base: readonly string[];
}

export interface CatalogProduct {
  readonly id: string;
  /** Stable, lowercase, hyphen-separated URL identifier. */
  readonly slug: string;
  readonly name: string;
  readonly displayName: string;
  readonly brand: ProductBrand | null;
  readonly description: string | null;
  readonly shortDescription: string | null;
  /** Editorial wearing suggestion, not a restriction or manufacturer-certified usage rule. */
  readonly occasionSuggestion?: string;
  /** Compact catalog photograph; null remains an explicit missing photograph. */
  readonly generalImage: ProductImage | null;
  /** Independent, higher-resolution reading photograph of the same product. */
  readonly detailImage: ProductImage | null;
  readonly variants: readonly PerfumeVariant[];
  readonly classification: CommercialClassification;
  readonly olfactoryFamilies: readonly string[];
  readonly notes: FragranceNotes;
  /** Public references for researched product facts; commercial stock is confirmed separately. */
  readonly sources?: readonly ProductInformationSource[];
  /** Null means no approved reference; never infer one from the product name. */
  readonly inspiredBy: ProductInspiration | null;
  readonly badges: readonly string[];
  readonly featured: boolean;
  readonly whatsappMessageName: string;
  readonly order: number;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly reviewStatus: ContentReviewStatus;
  readonly status: PublicationStatus;
}

export interface ProductInspiration {
  readonly sources?: readonly ProductInformationSource[];
  readonly name: string;
  readonly brand: string | null;
  readonly relation: 'inspired_by' | 'similar_to';
  readonly image: ProductImage | null;
}
