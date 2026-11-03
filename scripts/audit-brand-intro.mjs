import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';

const output = 'reports/brand-intro/visual';
const baseUrl = process.env['AUDIT_BASE_URL'] ?? 'http://127.0.0.1:4321/';
await mkdir(output, { recursive: true });
const original = pathToFileURL(
  resolve('pantalla_inicial/AROMAFIA · Animación de logo v3 (1).html'),
).href;
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const comparisons = [];
const errors = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 568],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: width < 896,
      hasTouch: width < 896,
      reducedMotion: 'no-preference',
    });
    const reference = await context.newPage();
    await reference.goto(original);
    const expectedFrames = new Map();
    for (const time of [2000, 8500, 12500]) {
      await reference.locator('.stage').evaluate((element, milliseconds) => {
        for (const animation of element.ownerDocument.getAnimations()) {
          animation.pause();
          animation.currentTime = milliseconds;
        }
      }, time);
      expectedFrames.set(
        time,
        await reference.locator('.stage').screenshot({
          path: `${output}/${width}-${time}-original.png`,
        }),
      );
    }
    await reference.close();
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push({ width, message: error.message }));
    await page.goto(baseUrl);
    await expect(page.locator('[data-brand-intro]')).toHaveAttribute('data-intro-phase', 'playing');
    const stage = page.frameLocator('[data-intro-frame]').locator('.stage');
    for (const time of [2000, 8500, 12500]) {
      await stage.evaluate((element, milliseconds) => {
        for (const animation of element.ownerDocument.getAnimations()) {
          animation.pause();
          animation.currentTime = milliseconds;
        }
      }, time);
      const actual = await stage.screenshot({ path: `${output}/${width}-${time}-integrated.png` });
      const expected = expectedFrames.get(time);
      const before = await sharp(expected).removeAlpha().raw().toBuffer();
      const after = await sharp(actual).removeAlpha().raw().toBuffer();
      if (before.length !== after.length) throw new Error('The approved stage geometry changed.');
      let delta = 0;
      let changed = 0;
      for (let index = 0; index < before.length; index++) {
        const difference = Math.abs(before[index] - after[index]);
        delta += difference;
        if (difference > 8) changed++;
      }
      const record = {
        width,
        height,
        time,
        meanChannelDifference: delta / before.length,
        changedChannelRatio: changed / before.length,
      };
      comparisons.push(record);
      expect(record.meanChannelDifference).toBeLessThan(1);
      // A nested compositor may round the original moving raster-letter edges by a subpixel.
      expect(record.changedChannelRatio).toBeLessThan(0.01);
    }
    await page.screenshot({ path: `${output}/${width}-intro.png` });
    await stage.evaluate((element) => {
      const animation = element
        .getAnimations()
        .find((entry) => entry instanceof CSSAnimation && entry.animationName === 'stage');
      if (!animation) throw new Error('The original stage needs its CSS animation.');
      animation.finish();
    });
    await expect(page.locator('[data-brand-intro]')).toHaveCount(0);
    await page.screenshot({ path: `${output}/${width}-catalog.png` });
    await context.close();
  }
  // One complete pass at normal time verifies the real event, not a synthetic deadline.
  const naturalContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const natural = await naturalContext.newPage();
  await natural.goto(baseUrl);
  await expect(natural.locator('[data-brand-intro]')).toHaveAttribute(
    'data-intro-phase',
    'playing',
  );
  const started = Date.now();
  await expect(natural.locator('[data-brand-intro]')).toHaveCount(0, { timeout: 20_000 });
  const naturalExitMilliseconds = Date.now() - started;
  await expect(natural.locator('[data-book-open]')).toBeVisible();
  await natural.screenshot({ path: `${output}/390-natural-exit.png` });
  await naturalContext.close();
  await writeFile(
    `${output}/metrics.json`,
    JSON.stringify({ comparisons, naturalExitMilliseconds, errors, fpsMeasured: false }, null, 2),
  );
  console.log(JSON.stringify({ comparisons: comparisons.length, naturalExitMilliseconds, errors }));
} finally {
  await browser.close();
}
