import { expect, test, type Locator, type Page } from './fixtures';

const rootSelector = '[data-book-root]';
const zoneSelector = '[data-book-pages] [data-product-slug="9pm"]';
const detailPattern = '**/9pm/detail*.webp';

async function openCatalog(page: Page): Promise<Locator> {
  await page.goto('/#libro/1');
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
  const zone = page.locator(zoneSelector);
  await zone.locator('[data-product-visual] img').evaluate(async (image) => {
    if (!(image instanceof HTMLImageElement)) throw new Error('Missing product photo.');
    await image.decode();
  });
  return zone;
}

async function photoState(zone: Locator) {
  return zone.locator('[data-product-visual] img').evaluate((image) => {
    if (!(image instanceof HTMLImageElement)) throw new Error('Missing product photo.');
    return {
      source: image.currentSrc,
      complete: image.complete && image.naturalWidth > 0,
      mask: getComputedStyle(image).maskImage,
    };
  });
}

test('la carga fría conserva la foto general hasta decodificar el detalle completo sin bloquear la compra', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route(detailPattern, async (route) => {
    requests++;
    await held;
    await route.continue();
  });
  try {
    const zone = await openCatalog(page);
    const image = zone.locator('[data-product-visual] img');
    const original = await image.elementHandle();
    const general = await photoState(zone);
    await zone.locator('[data-product-link]').click();
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'focused');
    await expect.poll(() => requests).toBeGreaterThan(0);
    await expect(zone).not.toHaveAttribute('data-photo-ready');
    await expect(zone.locator('[data-detail-image]')).toHaveAttribute('media', 'not all');
    expect(await photoState(zone)).toEqual(general);
    const heldPath = testInfo.outputPath('cold-photo-held.png');
    await page.screenshot({ path: heldPath });
    await testInfo.attach('cold-photo-held', {
      path: heldPath,
      contentType: 'image/png',
    });
    await zone.locator('[data-order-open]').click();
    await expect(page.locator('dialog[data-order-stage]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'focused');
    release();
    await expect(zone).toHaveAttribute('data-photo-ready', '');
    await expect.poll(async () => (await photoState(zone)).complete).toBe(true);
    const detail = await photoState(zone);
    expect(new URL(detail.source).pathname).toMatch(
      /^\/images\/perfumes\/9pm\/detail(?:-\d+)?\.webp$/,
    );
    expect(detail.mask).toBe('none');
    expect(await image.evaluate((current, previous) => current === previous, original)).toBe(true);
    await expect(zone.locator('.product-hero__photo-frame')).toHaveCSS('opacity', '1');
    await image.scrollIntoViewIfNeeded();
    const loadedPath = testInfo.outputPath('cold-photo-loaded.png');
    await page.screenshot({ path: loadedPath });
    await testInfo.attach('cold-photo-loaded', {
      path: loadedPath,
      contentType: 'image/png',
    });
    await page.locator('[data-book-return]').click();
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
    await expect(zone).not.toHaveAttribute('data-photo-ready');
    await expect.poll(() => photoState(zone)).toEqual(general);
    await original?.dispose();
  } finally {
    release();
  }
});

test('un detalle que falla conserva la fotografía general legible y permite volver e intentarlo de nuevo', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let requests = 0;
  await page.route(detailPattern, async (route) => {
    requests++;
    await route.abort('failed');
  });
  const zone = await openCatalog(page);
  const general = await photoState(zone);
  for (let attempt = 0; attempt < 2; attempt++) {
    await zone.locator('[data-product-link]').click();
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'focused');
    await expect.poll(() => requests).toBeGreaterThan(attempt);
    await page.waitForLoadState('networkidle');
    expect(await photoState(zone)).toEqual(general);
    await expect(zone).not.toHaveAttribute('data-photo-ready');
    await expect(zone).not.toHaveAttribute('data-photo-changing');
    await page.locator('[data-book-return]').click();
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
  }
});

test('la referencia puede tardar sin bloquear la fotografía principal ni la compra', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route('**/9pm/inspiration*.webp', async (route) => {
    requested = true;
    await held;
    await route.continue();
  });
  try {
    const zone = await openCatalog(page);
    await zone.locator('[data-product-link]').click();
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'focused');
    await expect(zone).toHaveAttribute('data-photo-ready', '');
    await zone.locator('[data-inspired-reference]').scrollIntoViewIfNeeded();
    await expect.poll(() => requested).toBe(true);
    const main = await photoState(zone);
    expect(main.complete).toBe(true);
    expect(main.mask).toBe('none');
    expect(new URL(main.source).pathname).toMatch(
      /^\/images\/perfumes\/9pm\/detail(?:-\d+)?\.webp$/,
    );
    await zone.locator('[data-order-open]').click();
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'ordering');
    await page.keyboard.press('Escape');
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'focused');
    release();
    await zone.locator('[data-inspiration-image]').evaluate(async (image) => {
      if (!(image instanceof HTMLImageElement)) throw new Error('Missing inspiration photo.');
      await image.decode();
    });
    expect(await photoState(zone)).toEqual(main);
  } finally {
    release();
  }
});

for (const action of ['return', 'dispose'] as const) {
  test(`una resolución tardía no reactiva el detalle después de ${action}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let requested = false;
    await page.route(detailPattern, async (route) => {
      requested = true;
      await held;
      await route.continue();
    });
    try {
      const zone = await openCatalog(page);
      const general = await photoState(zone);
      await zone.locator('[data-product-link]').click();
      await expect.poll(() => requested).toBe(true);
      if (action === 'return') {
        await page.locator('[data-book-return]').click();
        await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
      } else {
        await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
        await expect(page.locator(rootSelector)).not.toHaveClass(/is-enhanced/);
      }
      release();
      await page.waitForLoadState('networkidle');
      await expect(zone).not.toHaveAttribute('data-photo-ready');
      await expect(zone).not.toHaveAttribute('data-photo-changing');
      await expect(zone.locator('[data-detail-image]')).toHaveAttribute('media', 'not all');
      expect(await photoState(zone)).toEqual(general);
    } finally {
      release();
    }
  });
}
