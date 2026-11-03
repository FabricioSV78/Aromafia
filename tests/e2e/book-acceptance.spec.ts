import { expect, test, type Locator } from './fixtures';
import { products } from '../../src/features/catalog/data/products';

async function documentBounds(locator: Locator) {
  return locator.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      left: bounds.left + scrollX,
      top: bounds.top + scrollY,
      width: bounds.width,
      height: bounds.height,
      bottom: bounds.bottom + scrollY,
    };
  });
}

test('en ventanas bajas los seis detalles caben en el mismo papel sin cruzar notas y servicios', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [
    { width: 915, height: 540 },
    { width: 1024, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [ordinal, product] of products.entries()) {
      await page.goto(`/#libro/${Math.floor(ordinal / 2) + 1}`);
      const root = page.locator('[data-book-root]');
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      const camera = page.locator('[data-book-camera]');
      const before = await documentBounds(camera);
      const zone = page.locator(`[data-book-pages] [data-product-slug="${product.slug}"]`);
      await zone.locator('[data-product-link]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      const after = await documentBounds(camera);
      for (const key of ['left', 'top', 'width', 'height'] as const)
        expect(
          Math.abs(after[key] - before[key]),
          `${product.slug}: marco ${key}`,
        ).toBeLessThanOrEqual(1);

      const paper = await documentBounds(zone);
      const notes = await documentBounds(zone.locator('.fragrance-notes'));
      const services = await documentBounds(zone.locator('.editorial-trust'));
      expect(notes.bottom, `${product.slug}: notas dentro del papel`).toBeLessThanOrEqual(
        paper.bottom,
      );
      expect(notes.bottom, `${product.slug}: notas antes de servicios`).toBeLessThanOrEqual(
        services.top - 2,
      );
      expect(services.bottom).toBeLessThanOrEqual(paper.bottom);
      const buy = zone.locator('[data-order-open]');
      await buy.focus();
      await expect(buy).toBeInViewport({ ratio: 1 });
      await page.keyboard.press('Enter');
      await expect(root).toHaveAttribute('data-book-phase', 'ordering');
      await expect(page.locator('[data-order-stage]')).toBeInViewport({ ratio: 0.98 });
      await page.keyboard.press('Escape');
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      await expect(buy).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );

      if (product.slug === 'royale-opal') {
        await page.screenshot({
          path: testInfo.outputPath(`short-desktop-${viewport.width}.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('rotar con la compra abierta conserva los campos y permite volver con teclado al perfume elegido', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#libro/1/perfume/9pm');
  const root = page.locator('[data-book-root]');
  await expect(root).toHaveAttribute('data-book-phase', 'focused');
  await page.locator('[data-product-slug="9pm"] [data-order-open]').click();
  const name = page.getByLabel('Nombre', { exact: true });
  await name.fill('Prueba de orientación');
  await page.setViewportSize({ width: 915, height: 412 });
  await expect(root).toHaveAttribute('data-book-phase', 'ordering');
  await expect(name).toHaveValue('Prueba de orientación');
  await page.locator('select[name="productSlug"]').selectOption('royale-opal');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-book-phase', 'ordering');
  await expect(name).toHaveValue('Prueba de orientación');
  await page.keyboard.press('Escape');
  await expect(root).toHaveAttribute('data-book-phase', 'focused');
  await expect(page).toHaveURL(/#libro\/3\/perfume\/royale-opal$/);
  const buy = page.locator('[data-book-pages] [data-product-slug="royale-opal"] [data-order-open]');
  await expect(buy).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute('data-book-phase', 'focused');
  await buy.focus();
  await expect
    .poll(async () => {
      const button = await buy.boundingBox();
      const controls = await page.locator('[data-book-focus-controls]').boundingBox();
      return Boolean(button && controls && button.y >= 0 && button.y + button.height <= controls.y);
    })
    .toBe(true);
  await page.keyboard.press('Escape');
  await expect(root).toHaveAttribute('data-book-phase', 'browsing');
  await expect(page).toHaveURL(/#libro\/3$/);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
