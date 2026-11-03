import { expect, test, type Locator, type Page } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

async function openBook(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).toHaveClass(/is-enhanced/);
  await page.locator('[data-book-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
}

async function focused(page: Page, slug: string): Promise<void> {
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-busy', 'false');
  await expect(page).toHaveURL(new RegExp(`/perfume/${slug}$`));
  await expect(page.locator('[data-book-return]')).toBeVisible();
}

async function bounds(
  locator: Locator,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const value = await locator.boundingBox();
  if (!value) throw new Error('La zona del perfume debe tener una posición visible.');
  return value;
}

test('acerca las zonas de ambas caras y revierte al mismo elemento, página y posición', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const root = page.locator('[data-book-root]');
  const camera = page.locator('[data-book-camera]');
  const visible = page.locator('[data-book-leaf]:visible [data-product-slug]');
  const slugs = await visible.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-product-slug')),
  );
  expect(slugs.length).toBe(
    await page.evaluate(() => (matchMedia('(min-width: 56rem)').matches ? 4 : 2)),
  );
  const pageUrl = page.url();
  const neutral = await camera.evaluate((element) => getComputedStyle(element).transform);
  for (const slug of slugs) {
    if (!slug) throw new Error('Cada zona debe identificar su perfume.');
    const zone = page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
    const original = await zone.elementHandle();
    if (!original) throw new Error('No se puede enfocar una zona inexistente.');
    const before = await bounds(zone);
    const source = zone.locator('[data-product-link]');
    await source.click();
    await focused(page, slug);
    expect(await zone.evaluate((current, previous) => current === previous, original)).toBe(true);
    await expect(page.locator('[data-book-pages] [data-product-slug]')).toHaveCount(6);
    await expect(page.locator('dialog[data-order-stage]')).toHaveCount(1);
    await expect(page.locator('dialog[data-order-stage]')).toBeHidden();
    await expect(page.locator('[data-product-dialog]')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/');
    const after = await bounds(zone);
    if (await page.evaluate(() => matchMedia('(min-width: 56rem)').matches))
      expect(after.width * after.height).toBeGreaterThan(before.width * before.height * 1.3);
    for (const other of await page.locator('[data-book-pages] [data-product-slug]').all()) {
      const selected = (await other.getAttribute('data-product-slug')) === slug;
      expect(await other.evaluate((element) => element.closest('[hidden], [inert]') !== null)).toBe(
        !selected,
      );
    }
    await page.locator('[data-book-return]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page).toHaveURL(pageUrl);
    await expect(source).toBeFocused();
    const returned = await bounds(zone);
    for (const dimension of ['x', 'y', 'width', 'height'] as const)
      expect(Math.abs(returned[dimension] - before[dimension])).toBeLessThanOrEqual(2);
    expect(await camera.evaluate((element) => getComputedStyle(element).transform)).toBe(neutral);
    await original.dispose();
  }
});

test('el movimiento de cámara permanece dentro del libro y no admite focos simultáneos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page);
  const root = page.locator('[data-book-root]');
  const visual = page.locator('[data-product-slug="9pm"] [data-product-visual]');
  const before = await bounds(visual);
  const source = page.locator('[data-product-slug="9pm"] [data-product-link]');
  await source.click();
  await expect(root).toHaveAttribute('data-book-phase', 'focusing');
  await expect(root).toHaveAttribute('data-book-busy', 'true');
  await page.locator('[data-product-slug="hawas-ice"] [data-product-link]').evaluate((link) => {
    if (link instanceof HTMLAnchorElement) {
      link.click();
      link.click();
    }
  });
  await expect
    .poll(async () => {
      const current = await bounds(visual);
      return (
        Math.abs(current.width - before.width) +
        Math.abs(current.x - before.x) +
        Math.abs(current.y - before.y)
      );
    })
    .toBeGreaterThan(4);
  await focused(page, '9pm');
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await page.locator('[data-book-return]').click();
  await expect(root).toHaveAttribute('data-book-phase', 'returning');
  await expect(root).toHaveAttribute('data-book-phase', 'browsing');
  await expect(source).toBeFocused();
  await expect(page).toHaveURL(/#libro\/1$/);
});

test('Escape, Atrás, Adelante y recarga conservan el perfume y su página', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const source = page.locator('[data-product-slug="hawas-ice"] [data-product-link]');
  await source.click();
  await focused(page, 'hawas-ice');
  const selectedUrl = page.url();
  await page.goBack();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(source).toBeFocused();
  await page.goForward();
  await focused(page, 'hawas-ice');
  await page.reload();
  await focused(page, 'hawas-ice');
  await expect(page).toHaveURL(selectedUrl);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(source).toBeFocused();
  await expect(page).toHaveURL(/#libro\/1$/);
});

test('reencuadra el mismo perfume al cambiar de ancho y mantiene controles utilizables', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openBook(page);
  await page.locator('[data-product-slug="khamrah-qahwa"] [data-product-link]').click();
  await focused(page, 'khamrah-qahwa');
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 640 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await focused(page, 'khamrah-qahwa');
    await expect(page.locator('[data-product-slug="khamrah-qahwa"]')).toBeInViewport();
    await expect(page.locator('[data-book-return]')).toBeInViewport();
    await expect(page.locator('[data-book-focused-name]')).toHaveText('Khamrah Qahwa');
    await expect(page.locator('[data-book-focused-name]')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.locator('[data-book-return]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(
    page.locator('[data-product-slug="khamrah-qahwa"] [data-product-link]'),
  ).toBeFocused();
});

test('cambiar a movimiento reducido durante el acercamiento deja una vista enfocada y reversible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page);
  const source = page.locator('[data-product-slug="9pm"] [data-product-link]');
  await source.click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focusing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await focused(page, '9pm');
  await page.locator('[data-book-return]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(source).toBeFocused();
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`el detalle comienza visible tras navegar un catálogo desplazado a320px (${reducedMotion})`, async ({
    page,
  }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile'), 'Native mobile touch input.');
    await page.setViewportSize({ width: 320, height: 568 });
    await page.emulateMedia({ reducedMotion });
    await openBook(page);
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-book-root]');
    await page.locator('[data-book-next]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page).toHaveURL(/#libro\/2$/);
    const zone = page.locator('[data-book-pages] [data-product-slug="mandarine"]');
    const source = zone.locator('[data-product-link]');
    const before = await bounds(source);
    const entryScroll = await page.evaluate(() => window.scrollY);
    expect(entryScroll).toBeGreaterThan(20);
    // A real tap on the visible part avoids Playwright first scrolling the whole link into view.
    const tapY = Math.max(16, Math.min(470, before.y + before.height / 2));
    expect(tapY).toBeGreaterThan(before.y);
    expect(tapY).toBeLessThan(before.y + before.height);
    await page.touchscreen.tap(before.x + before.width / 2, tapY);
    const entryDetailScroll = await page.evaluate(() => window.scrollY);
    await focused(page, 'mandarine');
    const heading = zone.locator('h4');
    const brand = zone.locator('.perfume-zone__brand');
    for (const element of [brand, heading]) {
      const box = await bounds(element);
      expect(box.y).toBeGreaterThanOrEqual(12);
      expect(box.y + box.height).toBeLessThan(500);
    }
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - entryDetailScroll)).toBeLessThan(
      2,
    );
    await zone.locator('[data-order-open]').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(entryScroll + 100);
    await page.locator('[data-book-return]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page).toHaveURL(/#libro\/2$/);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - entryScroll)).toBeLessThan(2);
    await expect(source).toBeFocused();
  });
}

test('el enfoque es accesible y el teclado alcanza el regreso sin entrar en zonas ajenas @a11y', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const source = page.locator('[data-product-slug="9pm"] [data-product-link]');
  await source.focus();
  await page.keyboard.press('Enter');
  await focused(page, '9pm');
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.locator('[data-book-return]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(source).toBeFocused();
});

test('Control y clic conserva el destino nativo sin cambiar el estado del libro', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const opened = context.waitForEvent('page');
  await page
    .locator('[data-product-slug="9pm"] [data-product-link]')
    .click({ modifiers: ['Control'] });
  const route = await opened;
  await route.waitForURL(/\/#libro\/1\/perfume\/9pm$/);
  await expect(route.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(route.locator('[data-book-focused-name]')).toHaveText('9 pm');
  await expect(route.getByRole('heading', { name: '9 pm', exact: true })).toBeVisible();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(page).toHaveURL(/#libro\/1$/);
  await route.close();
});
