import { assertPenMoney } from '../../../shared/lib/money';
import type { CatalogProduct, ProductImage } from './product';

function requiredText(value: string, label: string): void {
  if (!value.trim()) throw new TypeError(`${label} must not be empty.`);
}

function nullableText(value: string | null, label: string): void {
  if (value !== null) requiredText(value, label);
}

function validateSource(source: { label: string; url: string }): void {
  requiredText(source.label, 'Source label');
  const url = new URL(source.url);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new TypeError('Sources must use HTTPS without credentials.');
}

function validateImage(image: ProductImage): void {
  if (image.composition !== undefined && !['isolated', 'scene'].includes(image.composition))
    throw new TypeError('Unknown product image composition.');
  requiredText(image.alt, 'Product image alt');
  if (
    image.fill !== undefined &&
    (!Number.isFinite(image.fill) || image.fill <= 0 || image.fill > 1)
  )
    throw new TypeError('Product image fill must be greater than zero and at most one.');
  if (image.maskSrc !== undefined && !/^\/images\/[a-z0-9/.-]+\.svg$/u.test(image.maskSrc))
    throw new TypeError('Photo masks must use a local SVG path.');
  if (image.framing) {
    const { left, top, width, height } = image.framing;
    for (const anchor of [image.framing.anchorX, image.framing.anchorY])
      if (anchor !== undefined && (!Number.isFinite(anchor) || anchor < 0 || anchor > 1))
        throw new TypeError('Image footprint anchors must stay within the framing rectangle.');
    if (
      ![left, top, width, height].every(Number.isFinite) ||
      left < 0 ||
      top < 0 ||
      width <= 0 ||
      height <= 0 ||
      left + width > 1 ||
      top + height > 1
    )
      throw new TypeError('Image framing must stay within the source photograph.');
  }
  if (
    image.whitePoint !== undefined &&
    (!Number.isInteger(image.whitePoint) || image.whitePoint < 1 || image.whitePoint > 255)
  )
    throw new TypeError('Image white point must be an integer from 1 to 255.');
  if (
    image.src.includes('\\') ||
    Array.from(image.src).some(
      (character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
    )
  ) {
    throw new TypeError(
      'Product image paths must not contain backslashes or unencoded whitespace.',
    );
  }
  const local = image.src.startsWith('/') && !image.src.startsWith('//');
  if (!local) {
    const url = new URL(image.src);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new TypeError(
        'Product images must use a local absolute path or HTTPS without credentials.',
      );
    }
  }
  if (![image.width, image.height].every((size) => Number.isSafeInteger(size) && size > 0)) {
    throw new TypeError('Product images need positive integer width and height.');
  }
  if (image.srcSet) {
    for (const candidate of image.srcSet.split(',')) {
      const match = /^(\/[^\s,]+) ([1-9]\d*)w$/.exec(candidate.trim());
      if (!match || match[1]?.startsWith('//'))
        throw new TypeError('Responsive product images need local paths and width descriptors.');
    }
  }
}

function unique(value: string, seen: Set<string>, label: string): void {
  requiredText(value, label);
  if (seen.has(value)) throw new TypeError(`Duplicate ${label}: ${value}`);
  seen.add(value);
}

function timestamp(value: string, label: string): number {
  const parsed = Date.parse(value);
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(parsed)) {
    throw new TypeError(`${label} must be an ISO 8601 timestamp including a time zone.`);
  }
  return parsed;
}

/** Validates trusted local catalog imports. External APIs need their own boundary decoder. */
export function validateCatalog(products: readonly CatalogProduct[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const variantIds = new Set<string>();
  const skus = new Set<string>();

  for (const product of products) {
    unique(product.id, ids, 'product id');
    unique(product.slug, slugs, 'product slug');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) {
      throw new TypeError(`Invalid product slug: ${product.slug}`);
    }
    requiredText(product.name, 'Product name');
    if (!['draft', 'published', 'archived'].includes(product.status))
      throw new TypeError('Invalid publication status.');
    if (!['pending', 'confirmed'].includes(product.reviewStatus))
      throw new TypeError('Invalid content review status.');
    requiredText(product.displayName, 'Product display name');
    requiredText(product.whatsappMessageName, 'WhatsApp product name');
    if (product.brand) {
      requiredText(product.brand.id, 'Brand id');
      requiredText(product.brand.name, 'Brand name');
    }
    nullableText(product.description, 'Product description');
    nullableText(product.shortDescription, 'Product short description');
    if (product.occasionSuggestion !== undefined)
      requiredText(product.occasionSuggestion, 'Occasion suggestion');
    nullableText(product.seoTitle, 'SEO title');
    nullableText(product.seoDescription, 'SEO description');
    if (!Number.isSafeInteger(product.order) || product.order < 1)
      throw new TypeError('Editorial order must be a positive integer.');
    for (const label of [
      ...product.badges,
      ...product.olfactoryFamilies,
      ...product.notes.top,
      ...product.notes.heart,
      ...product.notes.base,
    ])
      requiredText(label, 'Catalog label');
    if (product.status === 'published' && !product.variants.length)
      throw new TypeError(`Published product ${product.slug} needs a variant.`);
    if (product.reviewStatus === 'confirmed') {
      if (!product.brand || !product.description)
        throw new TypeError(`Confirmed product ${product.slug} needs a brand and description.`);
      if (!product.generalImage || !product.detailImage || !product.variants.length)
        throw new TypeError(
          `Confirmed product ${product.slug} needs both photo roles and a variant.`,
        );
    }
    for (const image of [product.generalImage, product.detailImage]) {
      if (image === undefined)
        throw new TypeError('Product photo roles must be explicit images or null.');
      if (image !== null) validateImage(image);
    }
    for (const source of product.sources ?? []) {
      requiredText(source.label, 'Product source label');
      const url = new URL(source.url);
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new TypeError('Product sources must use HTTPS without credentials.');
    }
    if (product.inspiredBy) {
      requiredText(product.inspiredBy.name, 'Inspiration name');
      nullableText(product.inspiredBy.brand, 'Inspiration brand');
      if (!['inspired_by', 'similar_to'].includes(product.inspiredBy.relation))
        throw new TypeError('Invalid inspiration relation.');
      if (product.inspiredBy.image) validateImage(product.inspiredBy.image);
      product.inspiredBy.sources?.forEach(validateSource);
    }

    for (const variant of product.variants) {
      unique(variant.id, variantIds, 'variant id');
      if (variant.sku !== null) unique(variant.sku, skus, 'SKU');
      if (
        variant.capacityMl !== null &&
        (!Number.isFinite(variant.capacityMl) || variant.capacityMl <= 0)
      ) {
        throw new TypeError(`Variant ${variant.id} needs a positive capacity in ml or null.`);
      }
      nullableText(variant.concentration, 'Concentration');
      if (
        product.reviewStatus === 'confirmed' &&
        (variant.sku === null || variant.capacityMl === null)
      )
        throw new TypeError(`Confirmed variant ${variant.id} needs its actual SKU and capacity.`);
      if (!['unknown', 'in_stock', 'out_of_stock', 'preorder'].includes(variant.availability))
        throw new TypeError('Invalid availability.');
      if (!['regular', 'offer'].includes(variant.priceKind))
        throw new TypeError('Invalid price kind.');
      if (variant.price) assertPenMoney(variant.price, `Price for ${variant.id}`);
      if (variant.priceKind === 'offer' && !variant.price)
        throw new TypeError(`Offer for ${variant.id} needs a confirmed current price.`);
      if (variant.regularPrice) {
        assertPenMoney(variant.regularPrice, `Regular price for ${variant.id}`);
        if (
          variant.priceKind !== 'offer' ||
          !variant.price ||
          variant.regularPrice.amountInCents <= variant.price.amountInCents
        )
          throw new TypeError(
            `Confirmed regular price for ${variant.id} must be above an offer price.`,
          );
      }
      if (variant.marketReference) {
        const reference = variant.marketReference;
        assertPenMoney(reference.price, `Market reference for ${variant.id}`);
        validateSource(reference.source);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(reference.checkedOn) ||
          !Number.isFinite(Date.parse(reference.checkedOn))
        )
          throw new TypeError('Market reference needs its observation date.');
        if (!variant.price || reference.price.amountInCents <= variant.price.amountInCents)
          throw new TypeError('A market comparison must be above the local price.');
      }
      if (variant.promotion) {
        const promotion = variant.promotion;
        assertPenMoney(promotion.price, `Promotion for ${variant.sku}`);
        if (!variant.price || promotion.price.amountInCents >= variant.price.amountInCents) {
          throw new TypeError(
            `Promotion for ${variant.sku} must be below a confirmed regular price.`,
          );
        }
        if (
          timestamp(promotion.startsAt, 'Promotion start') >=
          timestamp(promotion.endsAt, 'Promotion end')
        ) {
          throw new TypeError(`Promotion for ${variant.sku} must end after it starts.`);
        }
      }
    }
  }
}
