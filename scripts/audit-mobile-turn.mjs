import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';

const phase = process.argv[2] ?? 'before';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after.');
const output = join('reports', 'mobile-polish', phase);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const records = [];
const errors = [];
try {
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    page.on('crash', () => errors.push({ width, type: 'crash' }));
    page.on('pageerror', (error) => errors.push({ width, message: error.message }));
    await page.clock.install();
    await page.goto('http://127.0.0.1:4321/');
    const root = page.locator('[data-book-root]');
    await expect(root).toHaveAttribute('data-book-phase', 'closed');
    const opener = await page.locator('[data-book-open]').evaluate((node) => ({
      box: node.getBoundingClientRect().toJSON(),
      font: getComputedStyle(node).fontSize,
    }));
    await page.screenshot({ path: join(output, `${width}-cover.png`), fullPage: true });
    await page.evaluate(async () => {
      const images = [...document.querySelectorAll('[data-product-visual] img')];
      for (const image of images) image.loading = 'eager';
      await Promise.all(images.map((image) => image.decode()));
    });
    await page.locator('[data-book-open]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 50));
    await page.evaluate(() => scrollTo(0, 0));
    const camera = await page.locator('[data-book-camera]').boundingBox();
    const prices = await page
      .locator('[data-book-leaf]:visible .product-price__current')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          text: node.textContent,
          font: getComputedStyle(node).fontSize,
          box: node.getBoundingClientRect().toJSON(),
        })),
      );
    await page.screenshot({ path: join(output, `${width}-catalog.png`), fullPage: true });
    const directions = [];
    for (const direction of ['next', 'prev']) {
      await page.locator(`[data-book-${direction}]`).evaluate((node) => node.click());
      const frames = [];
      let previous = 0;
      for (const time of [80, 208, 364, 520, 676, 832, 950, 1020]) {
        await page.clock.runFor(time - previous);
        previous = time;
        await expect(root).toHaveAttribute('data-book-phase', 'turning');
        const path = join(output, `${width}-${direction}-${time}.png`);
        await page.screenshot({ path });
        const sheet = await page.locator('.book-turn').evaluate((node) => ({
          box: node.getBoundingClientRect().toJSON(),
          transform: getComputedStyle(node).transform,
          layerOverflow: getComputedStyle(node.parentElement).overflow,
        }));
        frames.push({ time, sheet });
      }
      await page.clock.runFor(300);
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await expect(page.locator('.book-turn')).toHaveCount(0);
      directions.push({ direction, frames });
    }
    records.push({ width, height, opener, camera, prices, directions });
    const selected = [208, 520, 832, 950, 1020];
    const thumbWidth = 210;
    const thumbHeight = Math.round((height * thumbWidth) / width);
    const input = [];
    for (const [row, direction] of ['next', 'prev'].entries())
      for (const [column, time] of selected.entries())
        input.push({
          input: await sharp(join(output, `${width}-${direction}-${time}.png`))
            .resize({ width: thumbWidth })
            .toBuffer(),
          left: column * thumbWidth,
          top: row * thumbHeight,
        });
    await sharp({
      create: {
        width: selected.length * thumbWidth,
        height: thumbHeight * 2,
        channels: 3,
        background: '#12100c',
      },
    })
      .composite(input)
      .png()
      .toFile(join(output, `${width}-turn-contact.png`));
    await context.close();
    console.log(`Captured ${width}x${height}: cover, catalogue and 16 turn frames.`);
  }
} finally {
  await browser.close();
}
await writeFile(join(output, 'metrics.json'), `${JSON.stringify({ records, errors }, null, 2)}\n`);
if (errors.length) process.exitCode = 1;
