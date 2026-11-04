import { expect, test, type Locator, type Page, type TestInfo } from './fixtures';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { products } from '../../src/features/catalog/data/products';

const rootSelector = '[data-book-root]';
const slugs = products
  .filter((product) => product.status === 'published')
  .sort((a, b) => a.order - b.order)
  .map((product) => product.slug);

interface BlendResult {
  perfume: string;
  direction: string;
  duration: number;
  opacity: number[];
  previousPhotoPixelError: number;
}

async function activate(control: Locator): Promise<void> {
  await control.evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error('Expected an HTML control.');
    element.click();
  });
}

async function prepare(page: Page, viewport: { width: number; height: number }): Promise<void> {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator(rootSelector)).toHaveClass(/is-enhanced/);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const photos = Array.from(
      document.querySelectorAll<HTMLImageElement>('[data-product-visual] img'),
    );
    for (const photo of photos) photo.loading = 'eager';
    await Promise.all(photos.map((photo) => photo.decode()));
    await Promise.all(
      Array.from(document.querySelectorAll<HTMLSourceElement>('source[data-detail-image]')).map(
        async (source) => {
          const preload = new Image();
          preload.sizes = source.sizes;
          preload.srcset = source.srcset;
          await preload.decode();
        },
      ),
    );
  });
  // Load the deferred motion engine normally before controlling its animation frames.
  await page.locator('[data-book-open]').click();
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 50));
}

async function pauseBlend(image: Locator): Promise<number> {
  let duration = 0;
  await expect
    .poll(async () => {
      duration = await image.evaluate(async (element) => {
        const animation = element.getAnimations()[0];
        if (!animation) return 0;
        const timing = animation.effect?.getComputedTiming().duration;
        if (typeof timing !== 'number') return 0;
        // Playwright's clock controls GSAP; the compositor owns this native animation.
        animation.pause();
        await animation.ready;
        animation.currentTime = 0;
        return timing;
      });
      return duration;
    })
    .toBeGreaterThan(0);
  return duration;
}

async function sampleOpacity(image: Locator, currentTime: number): Promise<number> {
  return image.evaluate((element, time) => {
    const animation = element.getAnimations()[0];
    if (!animation) throw new Error('The photograph blend ended before sampling.');
    animation.currentTime = time;
    return Number(getComputedStyle(element).opacity);
  }, currentTime);
}

async function capture(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<Buffer<ArrayBufferLike>> {
  const path = testInfo.outputPath(`${name}.png`);
  const screenshot = await page.screenshot({ path, scale: 'css' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
  return screenshot;
}

async function previousPhotoPixelError(
  frame: Locator,
  screenshot: Buffer<ArrayBufferLike>,
  previous: string,
): Promise<number> {
  const bounds = await frame.boundingBox();
  if (!bounds) throw new Error('The complete photograph must remain visible during its blend.');
  const metadata = await sharp(screenshot).metadata();
  const left = Math.round(bounds.x);
  const top = Math.round(bounds.y);
  const width = Math.round(bounds.width);
  const height = Math.round(bounds.height);
  expect(left).toBeGreaterThanOrEqual(0);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(left + width).toBeLessThanOrEqual(metadata.width ?? 0);
  expect(top + height).toBeLessThanOrEqual(metadata.height ?? 0);
  // Ignore the outer few pixels affected by subpixel FLIP positioning and resampling.
  const actual = await sharp(screenshot)
    .extract({ left, top, width, height })
    .resize(108, 108)
    .extract({ left: 6, top: 6, width: 96, height: 96 })
    .removeAlpha()
    .raw()
    .toBuffer();
  const expected = await sharp(resolve('public', new URL(previous).pathname.slice(1)))
    .resize(108, 108)
    .extract({ left: 6, top: 6, width: 96, height: 96 })
    .removeAlpha()
    .raw()
    .toBuffer();
  let difference = 0;
  for (let index = 0; index < actual.length; index++) {
    difference += Math.abs((actual[index] ?? 0) - (expected[index] ?? 0));
  }
  return difference / actual.length;
}

async function expectClean(zone: Locator): Promise<void> {
  await expect(zone).not.toHaveAttribute('data-photo-blending');
  await expect(zone).not.toHaveAttribute('data-photo-changing');
  await expect(zone.locator('.product-hero__photo-frame')).toHaveCSS('background-image', 'none');
  await expect(zone.locator('.product-hero__photo-frame')).toHaveCSS('opacity', '1');
  expect(
    await zone.locator('[data-product-visual] img').evaluate((image) => ({
      opacity: image instanceof HTMLElement ? image.style.opacity : null,
      animations: image.getAnimations().length,
    })),
  ).toEqual({ opacity: '', animations: 0 });
}

async function inspectBlend(
  page: Page,
  zone: Locator,
  previous: string,
  slug: string,
  direction: 'detail' | 'general',
  testInfo: TestInfo,
): Promise<BlendResult> {
  const image = zone.locator('[data-product-visual] img');
  const frame = zone.locator('.product-hero__photo-frame');
  const duration = await pauseBlend(image);
  // Commit the native pause before reading pixels; computed opacity alone can lead the compositor.
  await page.clock.runFor(16);
  await expect(zone).toHaveAttribute('data-photo-blending', '');
  await expect(zone.locator('[data-product-visual] picture')).toHaveCount(1);
  await expect(zone.locator('[data-product-visual] img')).toHaveCount(1);
  expect(duration).toBeGreaterThanOrEqual(300);
  expect(duration).toBeLessThanOrEqual(600);
  const state = await image.evaluate((element) => {
    if (!(element instanceof HTMLImageElement)) throw new Error('Missing real product photograph.');
    return { source: element.currentSrc, complete: element.complete && element.naturalWidth > 0 };
  });
  expect(state.complete).toBe(true);
  expect(new URL(state.source).pathname).toMatch(
    new RegExp(`^/images/perfumes/${slug}/${direction}(?:-\\d+)?\\.webp$`),
  );
  const background = await frame.evaluate((element) => {
    const styles = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return {
      source: styles.backgroundImage,
      size: styles.backgroundSize,
      repeat: styles.backgroundRepeat,
      opacity: styles.opacity,
      aspect: bounds.width / bounds.height,
    };
  });
  expect(background.source).toBe(`url("${previous}")`);
  expect(background.size).toBe('contain');
  expect(background.repeat).toBe('no-repeat');
  expect(background.opacity).toBe('1');
  expect(Math.abs(background.aspect - 1)).toBeLessThanOrEqual(0.02);
  const opacity = [await sampleOpacity(image, 0)];
  expect(opacity[0]).toBe(0);
  const initial = await capture(page, testInfo, `${slug}-${direction}-000`);
  const pixelError = await previousPhotoPixelError(frame, initial, previous);
  expect(
    pixelError,
    'The previous complete photograph must cover the frame, without a blank flash.',
  ).toBeLessThan(14);
  let elapsed = 16;
  for (const fraction of [0.5, 390 / 420]) {
    const currentTime = Math.round(duration * fraction);
    // Set the native sample before the clock's frame commits both it and the real book movement.
    opacity.push(await sampleOpacity(image, currentTime));
    await page.clock.runFor(currentTime - elapsed);
    elapsed = currentTime;
    await capture(page, testInfo, `${slug}-${direction}-${currentTime}`);
  }
  expect(opacity[1]).toBeGreaterThan(0);
  expect(opacity[1]).toBeLessThan(1);
  expect(opacity[2]).toBeGreaterThan(opacity[1] ?? 0);
  expect(opacity[2]).toBeLessThan(1);
  await image.evaluate((element) => element.getAnimations()[0]?.finish());
  await page.clock.runFor(40);
  await expectClean(zone);
  return { perfume: slug, direction, duration, opacity, previousPhotoPixelError: pixelError };
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`las seis fotografías se funden en ambas direcciones a ${viewport.width}px conservando el img real`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120000);
    await prepare(page, viewport);
    const root = page.locator(rootSelector);
    const perOpening = viewport.width >= 896 ? 4 : 2;
    const results: BlendResult[] = [];
    for (const [index, slug] of slugs.entries()) {
      if (index > 0 && index % perOpening === 0) {
        await activate(page.locator('[data-book-next]'));
        await page.clock.runFor(1400);
        await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      }
      const zone = page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
      const image = zone.locator('[data-product-visual] img');
      const original = await image.elementHandle();
      const general = await image.evaluate((element) => {
        if (!(element instanceof HTMLImageElement)) throw new Error('Missing general photograph.');
        return element.currentSrc;
      });
      await activate(zone.locator('[data-product-link]'));
      results.push(await inspectBlend(page, zone, general, slug, 'detail', testInfo));
      await page.clock.runFor(1500);
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      const detail = await image.evaluate((element) => {
        if (!(element instanceof HTMLImageElement)) throw new Error('Missing detail photograph.');
        return element.currentSrc;
      });
      expect(await image.evaluate((current, previous) => current === previous, original)).toBe(
        true,
      );
      await activate(page.locator('[data-book-return]'));
      await page.clock.runFor(190);
      results.push(await inspectBlend(page, zone, detail, slug, 'general', testInfo));
      await page.clock.runFor(1500);
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      expect(await image.evaluate((current, previous) => current === previous, original)).toBe(
        true,
      );
      await original?.dispose();
    }
    await testInfo.attach('photo-crossfade-measurements', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
  });
}

test('movimiento reducido y desmontaje terminan el fundido sin fotografías ni callbacks huérfanos', async ({
  page,
}) => {
  await prepare(page, { width: 390, height: 844 });
  const root = page.locator(rootSelector);
  const zone = page.locator('[data-book-pages] [data-product-slug="9pm"]');
  const image = zone.locator('[data-product-visual] img');
  await activate(zone.locator('[data-product-link]'));
  await pauseBlend(image);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-book-phase', 'focused');
  await expectClean(zone);
  await expect(zone.locator('[data-detail-image]')).toHaveAttribute('media', 'all');
  await activate(page.locator('[data-book-return]'));
  await expect(root).toHaveAttribute('data-book-phase', 'browsing');
  await expect(zone.locator('[data-detail-image]')).toHaveAttribute('media', 'not all');
  await image.evaluate(async (element) => {
    if (!(element instanceof HTMLImageElement)) throw new Error('Missing general photograph.');
    await element.decode();
  });
  await expectClean(zone);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await activate(zone.locator('[data-product-link]'));
  await pauseBlend(image);
  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect(root).not.toHaveClass(/is-enhanced/);
  await expectClean(zone);
  await expect(zone.locator('[data-detail-image]')).toHaveAttribute('media', 'not all');
  await page.clock.runFor(1200);
  await expectClean(zone);
  await expect(zone.locator('[data-detail-image]')).toHaveAttribute('media', 'not all');
  await expect(zone.locator('[data-product-visual] img')).toHaveCount(1);
});
