import { expect, test, type Page, type TestInfo } from './fixtures';
import sharp from 'sharp';

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PixelBand {
  side: 'left' | 'right';
  left: number;
  top: number;
  width: number;
  height: number;
}

async function activate(page: Page, selector: string): Promise<void> {
  await page.locator(selector).evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error('Missing book control.');
    element.click();
  });
}

function outsideBands(camera: Bounds, viewport: { width: number; height: number }): PixelBand[] {
  const top = Math.max(0, Math.ceil(camera.y + 8));
  const bottom = Math.min(viewport.height - 8, Math.floor(camera.y + camera.height - 8));
  const left = Math.floor(camera.x) - 6;
  const right = Math.ceil(camera.x + camera.width) + 2;
  if (left < 0 || right + 4 > viewport.width || bottom <= top)
    throw new Error('The mobile book must leave room for both exterior edge samples.');
  return [
    { side: 'left', left, top, width: 4, height: bottom - top },
    { side: 'right', left: right, top, width: 4, height: bottom - top },
  ];
}

async function changedPixelRatio(baseline: Buffer, actual: Buffer, band: PixelBand) {
  const region = { left: band.left, top: band.top, width: band.width, height: band.height };
  const before = await sharp(baseline).extract(region).removeAlpha().raw().toBuffer();
  const after = await sharp(actual).extract(region).removeAlpha().raw().toBuffer();
  let changed = 0;
  for (let index = 0; index < before.length; index += 3) {
    const delta = Math.max(
      Math.abs((before[index] ?? 0) - (after[index] ?? 0)),
      Math.abs((before[index + 1] ?? 0) - (after[index + 1] ?? 0)),
      Math.abs((before[index + 2] ?? 0) - (after[index + 2] ?? 0)),
    );
    if (delta > 10) changed++;
  }
  return changed / (before.length / 3);
}

async function compareOutsideEdges(
  baseline: Buffer,
  actual: Buffer,
  bands: readonly PixelBand[],
  label: string,
  testInfo: TestInfo,
) {
  for (const band of bands) {
    const ratio = await changedPixelRatio(baseline, actual, band);
    if (ratio > 0.02) {
      await testInfo.attach(`${label}-baseline`, { body: baseline, contentType: 'image/png' });
      await testInfo.attach(`${label}-actual`, { body: actual, contentType: 'image/png' });
    }
    expect(
      ratio,
      `${label}: the ${band.side} exterior must retain the settled background and book stack`,
    ).toBeLessThanOrEqual(0.02);
  }
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
]) {
  test(`el giro móvil no dibuja barras fuera del libro a ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile Chromium touch emulation.');
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install();
    await page.goto('/');
    const root = page.locator('[data-book-root]');
    await expect(root).toHaveAttribute('data-book-phase', 'closed');
    await page.evaluate(async () => {
      await document.fonts.ready;
      const photos = Array.from(
        document.querySelectorAll<HTMLImageElement>('[data-product-visual] img'),
      );
      for (const photo of photos) photo.loading = 'eager';
      await Promise.all(photos.map((photo) => photo.decode()));
    });

    const opener = await page.locator('[data-book-open]').boundingBox();
    const cover = await page.locator('[data-book-cover]').boundingBox();
    if (!opener || !cover) throw new Error('The cover and its opener must have visible geometry.');
    expect(opener.width).toBeLessThanOrEqual(177);
    expect(opener.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(opener.x + opener.width / 2 - (cover.x + cover.width / 2))).toBeLessThanOrEqual(
      1,
    );

    // The first opening initializes the lazy engine at normal time. Only then freeze RAF.
    await page.locator('[data-book-open]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'opening');
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 50));
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.clock.runFor(32);
    await expect(page).toHaveURL(/#libro\/1$/);

    const camera = page.locator('[data-book-camera]');
    const original = await camera.boundingBox();
    if (!original) throw new Error('The book must reserve a measurable frame.');
    const bands = outsideBands(original, viewport);
    for (const direction of ['next', 'previous'] as const) {
      const baseline = await page.screenshot({ scale: 'css' });
      await activate(page, `[data-book-${direction === 'next' ? 'next' : 'prev'}]`);
      await expect(root).toHaveAttribute('data-book-phase', 'turning');
      await expect(root).toHaveAttribute('data-book-busy', 'true');
      const rotations: number[] = [];
      let elapsed = 0;
      for (const time of [208, 364, 520, 676, 832, 950, 1020]) {
        await page.clock.runFor(time - elapsed);
        elapsed = time;
        await expect(root).toHaveAttribute('data-book-phase', 'turning');
        const bounds = await camera.boundingBox();
        if (!bounds) throw new Error('Turning must retain the book frame.');
        for (const key of ['x', 'y', 'width', 'height'] as const)
          expect(Math.abs(bounds[key] - original[key])).toBeLessThanOrEqual(1);
        const motion = await page.locator('.book-turn').evaluate((sheet) => {
          const layer = sheet.parentElement;
          if (!layer) throw new Error('A turning page needs its own layer.');
          return {
            rotation: new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m11,
            sheetOpacity: getComputedStyle(sheet).opacity,
            layerOpacity: getComputedStyle(layer).opacity,
            depth: getComputedStyle(layer).transformStyle,
          };
        });
        expect(motion.sheetOpacity).toBe('1');
        expect(motion.layerOpacity).toBe('1');
        expect(motion.depth).toBe('preserve-3d');
        rotations.push(motion.rotation);
        const actual = await page.screenshot({ scale: 'css' });
        await compareOutsideEdges(baseline, actual, bands, `${direction}-${time}ms`, testInfo);
      }
      expect(Math.max(...rotations) - Math.min(...rotations)).toBeGreaterThan(1.5);
      await page.clock.runFor(80);
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await expect(root).toHaveAttribute('data-book-busy', 'false');
      await expect(page).toHaveURL(direction === 'next' ? /#libro\/2$/ : /#libro\/1$/);
      await expect(page.locator('.book-turn')).toHaveCount(0);
    }
  });
}
