import { expect, test } from './fixtures';
import { contact } from '../../src/config/contact';
import { products } from '../../src/features/catalog/data/products';
import { expectPublicPrices } from './catalog-assertions';

test('el nombre seleccionado ocupa el extremo derecho y el detalle permanece en el libro', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [ordinal, product] of products.entries()) {
      await page.goto(`/#libro/${Math.floor(ordinal / 2) + 1}/perfume/${product.slug}`);
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
      const name = page.locator('[data-book-focused-name]');
      const controls = page.locator('[data-book-focus-controls]');
      await expect(name).toHaveText(product.displayName);
      await expect(name).toBeInViewport({ ratio: 1 });
      expect(await name.evaluate((element) => getComputedStyle(element).textAlign)).toBe('right');
      const label = await name.boundingBox();
      const bar = await controls.boundingBox();
      if (!label || !bar) throw new Error('El nombre y los controles deben reservar su espacio.');
      expect(Math.abs(label.x + label.width - bar.x - bar.width)).toBeLessThanOrEqual(2);
      await expect(controls.getByRole('link')).toHaveCount(0);
      await expect(page.locator('[data-book-focused-route], [data-product-detail]')).toHaveCount(0);
      await expect(page.locator('a[href^="/perfumes/"]')).toHaveCount(0);
      await expect(page.getByRole('link', { name: /ver ficha completa/i })).toHaveCount(0);
      expect(new URL(page.url()).pathname).toBe('/');
      expect(page.context().pages()).toHaveLength(1);
      await page.locator('[data-book-return]').click();
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
      await expect(controls).toBeHidden();
    }
  }
});

test('sin JavaScript el catálogo contiene los seis detalles y sus compras nativas', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 640 },
    ...(testInfo.project.use.baseURL ? { baseURL: testInfo.project.use.baseURL } : {}),
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).not.toHaveClass(/is-enhanced/);
  for (const product of products) {
    const zone = page.locator(`[data-book-pages] [data-product-slug="${product.slug}"]`);
    const body = zone.locator('[data-book-reading]');
    await expect(body).toBeVisible();
    expect(await body.evaluate((element) => element instanceof HTMLElement && element.inert)).toBe(
      false,
    );
    await expect(
      zone.getByRole('heading', { name: product.displayName, exact: true }),
    ).toBeVisible();
    await expect(body.locator('[data-fragrance-notes] dd')).toHaveText(
      [product.notes.top, product.notes.heart, product.notes.base].map((group) => group.join(', ')),
    );
    await expect(body.locator('[data-fragrance-notes] dt')).toHaveText([
      'Notas de entrada',
      'Notas de corazón',
      'Notas de fondo',
    ]);
    await expect(zone).toHaveAttribute('data-editorial-detail', '');
    const reference = body.locator('[data-inspired-reference]');
    if (product.inspiredBy) await expect(reference).toBeVisible();
    else await expect(reference).toHaveCount(0);
    await expect(body.locator('[data-reference-pending]')).toHaveCount(0);
    await expect(zone.getByText('Precio de oferta', { exact: true })).toHaveCount(0);
    await expect(body.locator('[data-editorial-trust]')).toHaveCount(1);
    await expectPublicPrices(zone, product);
    await expect(body.locator('[data-product-sources]')).toHaveCount(0);
    await expect(body.getByText('Concentración', { exact: true })).toHaveCount(0);
    await expect(body.locator('.inspired-reference__notice')).toHaveCount(0);
    const buy = body.locator('[data-order-fallback]');
    await expect(buy).toBeVisible();
    await expect(buy).toHaveAttribute('href', contact.whatsapp.href);
    await buy.scrollIntoViewIfNeeded();
    await expect(buy).toBeInViewport({ ratio: 0.98 });
    await expect(body.locator('[data-order-open]')).toBeHidden();
  }
  await expect(page.locator('dialog:visible')).toHaveCount(0);
  await expect(page.locator('a[href^="/perfumes/"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('al fallar el módulo se puede leer y consultar sin abandonar el catálogo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.route(/\/_astro\/.*\.js$/, (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).not.toHaveClass(/is-enhanced/, { timeout: 5000 });
  await expect(page.locator('[data-book-reading]')).toHaveCount(6);
  for (const reading of await page.locator('[data-book-reading]').all()) {
    await expect(reading).toBeVisible();
    await expect(reading.locator('[data-order-fallback]')).toHaveAttribute(
      'href',
      contact.whatsapp.href,
    );
  }
  await expect(page.locator('a[href^="/perfumes/"]')).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe('/');
});

test('los enlaces directos corrigen la cara y conservan el nombre al recargar', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#libro/1/perfume/royale-opal');
  await expect(page).toHaveURL(/#libro\/3\/perfume\/royale-opal$/);
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(page.locator('[data-book-focused-name]')).toHaveText('Zakat Royale Opal');
  await expect(page.locator('[data-book-reading]:visible')).toHaveCount(1);
  await expect(page.locator('dialog[data-order-stage]')).toBeHidden();
  await page.reload();
  await expect(page.locator('[data-book-focused-name]')).toHaveText('Zakat Royale Opal');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
});

test('las antiguas páginas de ficha ya no se publican', async ({ request }) => {
  for (const product of products) {
    const response = await request.get(`/perfumes/${product.slug}/`);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('Página no encontrada');
  }
});
