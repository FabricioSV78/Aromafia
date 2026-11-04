import { expect, test } from './fixtures';
import { products } from '../../src/features/catalog/data/products';
import { expectPublicPrices } from './catalog-assertions';

const perfumes = products
  .filter((product) => product.status === 'published')
  .sort((a, b) => a.order - b.order);
const contentSelectors = [
  '[data-product-visual]',
  '.perfume-zone__heading',
  '.perfume-zone__description',
  '.product-price',
  '[data-fragrance-notes]',
  '.perfume-reading__aside',
  '[data-editorial-trust]',
] as const;

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
]) {
  test(`detalle editorial ${viewport.width}×${viewport.height}: seis perfumes equilibrados y compra agrupada`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const measurements = [];
    for (const [index, perfume] of perfumes.entries()) {
      await page.goto(`/#libro/${Math.floor(index / 2) + 1}/perfume/${perfume.slug}`);
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
      const zone = page.locator(`[data-book-pages] [data-product-slug="${perfume.slug}"]`);
      await expect(zone).toHaveAttribute('data-photo-ready', '');
      await page.evaluate(() => document.fonts.ready);
      await zone.locator('img').evaluateAll(async (images) => {
        await Promise.all(
          images.map(async (image) => {
            if (!(image instanceof HTMLImageElement))
              throw new Error('The shared detail must retain its real photographs.');
            image.loading = 'eager';
            await image.decode();
          }),
        );
      });
      const layout = await zone.evaluate((element, selectors) => {
        const rectangle = (node: Element) => {
          const bounds = node.getBoundingClientRect();
          return {
            left: bounds.left,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            width: bounds.width,
            height: bounds.height,
          };
        };
        const query = (selector: string) => {
          const node = element.querySelector(selector);
          if (!node) throw new Error(`The shared detail needs ${selector}.`);
          return node;
        };
        return {
          paper: rectangle(element),
          parts: selectors.map((selector) => {
            const node = query(selector);
            return {
              selector,
              ...rectangle(node),
              clipped:
                node.scrollWidth > node.clientWidth + 2 ||
                node.scrollHeight > node.clientHeight + 2,
            };
          }),
          brand: rectangle(query('.perfume-zone__brand')),
          inspiration: rectangle(query('[data-inspiration-image]')),
          facts: rectangle(query('.perfume-reading__facts')),
          purchase: rectangle(query('.perfume-reading__purchase')),
          currentPrice: rectangle(query('.product-price__current')),
          referencePrice: element.querySelector('[data-market-reference]')
            ? rectangle(query('[data-market-reference]'))
            : null,
        };
      }, contentSelectors);
      const part = (selector: (typeof contentSelectors)[number]) => {
        const found = layout.parts.find((item) => item.selector === selector);
        if (!found) throw new Error(`${perfume.slug}: ${selector} needs layout measurements.`);
        return found;
      };
      const photo = part('[data-product-visual]');
      const notes = part('[data-fragrance-notes]');
      const aside = part('.perfume-reading__aside');
      const benefits = part('[data-editorial-trust]');
      const context = `${viewport.width}×${viewport.height}, ${perfume.slug}`;
      const starts = [photo.top, layout.brand.top, aside.top];
      expect(
        Math.max(...starts) - Math.min(...starts),
        `${context}: columns share their start`,
      ).toBeLessThanOrEqual(2);
      for (const block of layout.parts) {
        const label = `${context}: ${block.selector}`;
        expect(block.width, label).toBeGreaterThan(0);
        expect(block.height, label).toBeGreaterThan(0);
        expect(block.left, label).toBeGreaterThanOrEqual(layout.paper.left - 1);
        expect(block.top, label).toBeGreaterThanOrEqual(layout.paper.top - 1);
        expect(block.right, label).toBeLessThanOrEqual(layout.paper.right + 1);
        expect(block.bottom, label).toBeLessThanOrEqual(layout.paper.bottom + 1);
        expect(block.clipped, label).toBe(false);
        await expect(zone.locator(block.selector), label).toBeInViewport({ ratio: 0.98 });
      }
      for (const [index, first] of layout.parts.entries()) {
        for (const second of layout.parts.slice(index + 1)) {
          const overlapWidth =
            Math.min(first.right, second.right) - Math.max(first.left, second.left);
          const overlapHeight =
            Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
          expect(
            overlapWidth > 1 && overlapHeight > 1,
            `${context}: ${first.selector} must not overlap ${second.selector}`,
          ).toBe(false);
        }
      }
      expect(
        Math.abs(photo.width - photo.height),
        `${context}: complete square photograph`,
      ).toBeLessThanOrEqual(1);
      const referenceArea = layout.inspiration.width * layout.inspiration.height;
      const photoArea = photo.width * photo.height;
      expect(referenceArea, `${context}: reference remains secondary`).toBeLessThan(photoArea);
      expect(
        referenceArea / photoArea,
        `${context}: reference remains legible`,
      ).toBeGreaterThanOrEqual(0.08);
      expect(
        layout.purchase.top - layout.facts.bottom,
        `${context}: facts and buying stay grouped`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        layout.purchase.top - layout.facts.bottom,
        `${context}: no empty buying column`,
      ).toBeLessThanOrEqual(24);
      expect(
        benefits.top - notes.bottom,
        `${context}: notes precede the benefits`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        benefits.top - notes.bottom,
        `${context}: no excessive gap under notes`,
      ).toBeLessThanOrEqual(96);
      if (layout.referencePrice) {
        expect(
          layout.referencePrice.right,
          `${context}: price references stay beside the amount`,
        ).toBeLessThanOrEqual(layout.currentPrice.left);
        expect(layout.referencePrice.top, `${context}: price row alignment`).toBeGreaterThanOrEqual(
          layout.currentPrice.top - 1,
        );
        expect(layout.referencePrice.bottom, `${context}: price row alignment`).toBeLessThanOrEqual(
          layout.currentPrice.bottom + 1,
        );
      }
      await expect(zone.locator('[data-product-visual] img')).toHaveCSS('object-fit', 'contain');
      await expect(zone.locator('[data-inspiration-image]')).toHaveCSS('object-fit', 'contain');
      await expectPublicPrices(zone, perfume);
      await expect(zone.locator('[data-order-open]')).toBeEnabled();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      measurements.push({ slug: perfume.slug, viewport, ...layout });
    }
    await testInfo.attach('shared-detail-balance', {
      body: JSON.stringify(measurements, null, 2),
      contentType: 'application/json',
    });
  });
}
