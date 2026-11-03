import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const introSelector = '[data-brand-intro]';
const frameSelector = '[data-intro-frame]';
const sessionKey = 'aromafia:intro:v3:seen';

async function playing(page: Page): Promise<void> {
  await expect(page.locator(introSelector)).toBeVisible();
  await expect(page.locator(introSelector)).toHaveAttribute('data-intro-phase', 'playing');
  await expect(page.locator('[data-intro-skip]')).toBeFocused();
}

async function released(page: Page): Promise<void> {
  await expect(page.locator(introSelector)).toHaveCount(0);
  await expect(page.locator(frameSelector)).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-brand-intro-pending');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'closed');
  await expect(page.locator('[data-book-open]')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`la intro v3 es la primera vista y permite saltar a ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await playing(page);
    const dialog = page.locator(introSelector);
    expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-brand-intro-pending');
    expect(
      await page.locator('html').evaluate((element) => getComputedStyle(element).overflowY),
    ).toBe('hidden');
    const bounds = await dialog.boundingBox();
    if (!bounds) throw new Error('La intro debe ocupar el viewport.');
    expect(Math.abs(bounds.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(bounds.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(bounds.width - viewport.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(bounds.height - viewport.height)).toBeLessThanOrEqual(1);
    const frame = page.locator(frameSelector);
    await expect(frame).toHaveAttribute('sandbox', 'allow-same-origin');
    const scene = page.frameLocator(frameSelector);
    await expect(scene.locator('html')).not.toHaveAttribute('data-intro-paused');
    await expect(scene.locator('script')).toHaveCount(0);
    await expect(scene.locator('.stage')).toHaveCSS('animation-duration', '16s');
    await expect(scene.locator('.stage')).toHaveCSS('animation-iteration-count', '1');
    const skip = page.getByRole('button', { name: /Saltar intro/i });
    const target = await skip.boundingBox();
    if (!target) throw new Error('Saltar intro debe tener un área táctil visible.');
    expect(target.height).toBeGreaterThanOrEqual(44);
    if (viewport.width === 1440) {
      const accessibility = await new AxeBuilder({ page }).include(introSelector).analyze();
      expect(accessibility.violations).toEqual([]);
    }
    await testInfo.attach(`intro-${viewport.width}`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await skip.click();
    await released(page);
    await expect(page.locator('[data-book-open]')).toBeFocused();
    expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBe('1');
    await page.locator('[data-book-open]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('una sola pasada termina en el catálogo y no deja el iframe animándose', async ({ page }) => {
  await page.goto('/');
  await playing(page);
  await page
    .frameLocator(frameSelector)
    .locator('.stage')
    .evaluate((stage) => {
      const animation = stage
        .getAnimations()
        .find((entry) => entry instanceof CSSAnimation && entry.animationName === 'stage');
      if (!animation) throw new Error('La intro necesita su animación CSS original.');
      // Native Animation.finish emits the real CSS animationend event in the browser.
      animation.finish();
    });
  await released(page);
  await expect(page.locator('[data-book-open]')).toBeFocused();
});

test('Escape cierra la intro y la misma pestaña no la repite al recargar', async ({ page }) => {
  await page.goto('/');
  await playing(page);
  await page.keyboard.press('Escape');
  await released(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/intro/v3/')) requests.push(request.url());
  });
  await page.reload();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'closed');
  await expect(page.locator(introSelector)).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-brand-intro-pending');
  expect(requests).toEqual([]);
});

test('movimiento reducido omite la intro y la descarga de sus recursos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/intro/v3/')) requests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'closed');
  await expect(page.locator(introSelector)).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-brand-intro-pending');
  expect(requests).toEqual([]);
  await page.locator('[data-book-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
});

test('cambiar a movimiento reducido durante la intro libera el catálogo', async ({ page }) => {
  await page.goto('/');
  await playing(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await released(page);
});

test('un enlace directo a un perfume conserva su destino y omite la intro', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/intro/v3/')) requests.push(request.url());
  });
  await page.goto('/#libro/2/perfume/mandarine');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(page.locator(introSelector)).toBeHidden();
  // Desktop normalizes the second physical face to its first two-page opening.
  await expect(page).toHaveURL(/#libro\/[12]\/perfume\/mandarine$/);
  await expect(page.locator('[data-book-pages] [data-product-slug="mandarine"]')).toHaveClass(
    /is-reading/,
  );
  expect(requests).toEqual([]);
});

test('una escena inexistente libera el catálogo sin bloquear la compra', async ({ page }) => {
  await page.route('**/intro/v3/scene.html', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'text/html',
      body: '<!doctype html><title>404</title>',
    }),
  );
  await page.goto('/');
  await released(page);
  await page.locator('[data-book-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
});

test('una carga de escena que no responde tiene un límite y devuelve la web', async ({ page }) => {
  test.setTimeout(20_000);
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/intro/v3/scene.html', async (route) => {
    await pending;
    await route.abort();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator(introSelector)).toHaveAttribute('data-intro-phase', 'loading');
    await expect(page.locator(introSelector)).toHaveCount(0, { timeout: 10_000 });
    await released(page);
  } finally {
    release?.();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  }
});

test('si falla el módulo cliente el guard independiente recupera el HTML', async ({ page }) => {
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-brand-intro-pending', {
    timeout: 5000,
  });
  await expect(page.locator(introSelector)).toBeHidden();
  await expect(page.locator('[data-book-root]')).not.toHaveClass(/is-enhanced/);
  await expect(page.locator('#contenido')).toBeVisible();
  await expect(page.locator('[data-book-pages] [data-product-slug]')).toHaveCount(6);
});

test('salir durante la intro y volver no recupera un diálogo o iframe huérfano', async ({
  page,
}) => {
  await page.goto('/');
  await playing(page);
  await page.goto('/ruta-inexistente-para-probar-regreso');
  await page.goBack();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'closed');
  await expect(page.locator(introSelector)).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-brand-intro-pending');
  await expect(page.locator('[data-book-open]')).toBeVisible();
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('el catálogo nativo se lee sin una intro o bloqueo de desplazamiento', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(introSelector)).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-brand-intro-pending');
    await expect(page.locator(`${frameSelector}[src]`)).toHaveCount(0);
    await expect(page.locator('#contenido')).toBeVisible();
    await expect(page.locator('[data-book-pages] [data-product-slug]')).toHaveCount(6);
    const purchase = page.locator('[data-book-pages] a[href^="https://wa.me/"]').first();
    await expect(purchase).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  });
});
