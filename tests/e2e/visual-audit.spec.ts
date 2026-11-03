import { expect, test } from './fixtures';
import { products } from '../../src/features/catalog/data/products';

for (const [width, height] of [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [768, 1024],
  [430, 932],
  [390, 844],
  [375, 667],
  [320, 568],
] as const) {
  test(`catálogo y seis detalles legibles a ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const [index, product] of products.entries()) {
      await page.goto(`/#libro/${Math.floor(index / 2) + 1}`);
      const root = page.locator('[data-book-root]');
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      const zone = page.locator(`[data-book-pages] [data-product-slug="${product.slug}"]`);
      const layout = await zone.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return Array.from(
          element.querySelectorAll<HTMLElement>(
            'h4,.perfume-zone__description,.product-price,.perfume-zone__overview-cue,[data-product-visual]',
          ),
        ).map((node) => {
          const bounds = node.getBoundingClientRect();
          return {
            inside: bounds.top >= box.top - 1 && bounds.bottom <= box.bottom + 1,
            clipped:
              node.scrollHeight > node.clientHeight + 2 || node.scrollWidth > node.clientWidth + 2,
          };
        });
      });
      expect(
        layout.every((part) => part.inside && !part.clipped),
        product.slug,
      ).toBe(true);
      await zone.locator('[data-product-link]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      for (const selector of [
        'h4',
        '.perfume-zone__description',
        '[data-fragrance-notes]',
        '[data-inspired-reference]',
        '[data-order-open]',
      ]) {
        const part = zone.locator(selector);
        await part.scrollIntoViewIfNeeded();
        await expect(part).toBeInViewport({ ratio: 0.98 });
        expect(await part.evaluate((node) => node.scrollWidth <= node.clientWidth + 2)).toBe(true);
      }
      await expect(zone.locator('[data-product-sources]')).toHaveCount(0);
      await expect(zone.getByText('Concentración', { exact: true })).toHaveCount(0);
      await expect(zone.locator('.inspired-reference__notice')).toHaveCount(0);
      const price = zone.locator('[data-order-open]');
      await price.click();
      await expect(root).toHaveAttribute('data-book-phase', 'ordering');
      await expect(page.locator('select[name="productSlug"]')).toHaveValue(product.slug);
      await page.locator('[data-order-close]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      await page.locator('[data-book-return]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await expect(zone.locator('[data-product-link]')).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator('.book-turn')).toHaveCount(0);
    }
  });
}
