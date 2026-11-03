import { expect, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { contact } from '../../src/config/contact';

test('libro cerrado y abierto semántico y accesible @a11y', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).toHaveClass(/is-enhanced/);
  await expect(page).toHaveTitle(/AROMAFIA/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-PE');
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.locator('[data-book-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-mode', 'open');
  await expect(page.locator('[data-book-root]')).not.toHaveAttribute('data-book-busy', 'true');
  const openedAudit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(openedAudit.violations).toEqual([]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('navegación por teclado y recuperación de un 404 @a11y', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).toHaveClass(/is-enhanced/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.goto('/pagina-inexistente/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f0e8d5');
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await expect(page).toHaveURL('/');
});

test('contenido disponible con movimiento reducido y sin JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 320, height: 640 },
    ...(testInfo.project.use.baseURL ? { baseURL: testInfo.project.use.baseURL } : {}),
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached();
  await expect(page.getByRole('link', { name: 'AROMAFIA, inicio' })).toBeVisible();
  await expect(page.locator('[data-book-leaf]')).toHaveCount(4);
  await expect(page.locator('[data-book-pages] article[data-product-slug]')).toHaveCount(6);
  for (const leaf of await page.locator('[data-book-leaf]').all()) await expect(leaf).toBeVisible();
  const detailLink = page.locator('[data-product-link]').first();
  await expect(detailLink).toHaveAttribute('href', '/#libro/1/perfume/9pm');
  for (const reading of await page.locator('[data-book-reading]').all()) {
    await expect(reading).toBeVisible();
    await expect(reading.locator('[data-order-fallback]')).toHaveAttribute(
      'href',
      contact.whatsapp.href,
    );
  }
  await expect(page.locator('[data-book-reading]')).toHaveCount(6);
  await expect(page.locator('[data-product-slug="9pm"] [data-fragrance-notes]')).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await context.close();
});

test('si falla el módulo del libro recupera el catálogo nativo en flujo', async ({ page }) => {
  await page.route(/\/_astro\/.*\.js$/, (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).not.toHaveClass(/is-enhanced/, { timeout: 5000 });
  await expect(page.locator('[data-book-leaf]')).toHaveCount(4);
  await expect(page.locator('[data-product-link]')).toHaveCount(6);
  await expect(page.locator('[data-product-slug="9pm"] [data-book-reading]')).toBeVisible();
  await expect(page.locator('[data-product-slug="9pm"] [data-order-fallback]')).toHaveAttribute(
    'href',
    contact.whatsapp.href,
  );
  await expect(page.getByRole('heading', { name: '9 pm', exact: true })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});

test('el catálogo local conserva noindex y no inventa metadatos comerciales', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#12100c');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('astro-island')).toHaveCount(0);
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /');
});
