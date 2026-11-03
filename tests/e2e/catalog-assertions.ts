import { expect, type Locator } from '@playwright/test';
import type { CatalogProduct } from '../../src/features/catalog/domain/product';
import { formatPen } from '../../src/shared/lib/money';

/** A merchant comparison is never presented as AROMAFIA's previous selling price. */
export async function expectPublicPrices(zone: Locator, product: CatalogProduct): Promise<void> {
  const variant = product.variants[0];
  if (!variant) throw new Error('El producto público necesita una presentación.');
  await expect(zone.locator('.product-price del')).toHaveCount(variant.regularPrice ? 1 : 0);
  const market = zone.locator('[data-market-reference]');
  if (variant.marketReference && !variant.regularPrice) {
    await expect(market).toHaveCount(1);
    await expect(market).toContainText(/ref\./i);
    await expect(market.locator('s')).toContainText(formatPen(variant.marketReference.price));
    await expect(zone.locator('[data-market-source]')).toHaveAttribute(
      'href',
      variant.marketReference.source.url,
    );
    await expect(zone.locator('[data-market-source]')).toContainText(
      variant.marketReference.source.label,
    );
  } else {
    await expect(market).toHaveCount(0);
    await expect(zone.locator('.product-price s')).toHaveCount(0);
  }
  await expect(zone.getByText('Precio de oferta', { exact: true })).toHaveCount(0);
}
