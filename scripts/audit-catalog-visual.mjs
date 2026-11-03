import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';

const phase = process.argv[2] ?? 'before';
const baseUrl = process.env['AUDIT_BASE_URL'] ?? 'http://127.0.0.1:4321/';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after.');
const output = process.env['AUDIT_OUTPUT_DIR'] ?? join('reports', 'visual-mobile-audit', phase);
await mkdir(output, { recursive: true });
const viewports = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [768, 1024],
  [430, 932],
  [390, 844],
  [375, 667],
  [320, 568],
];
const slugs = ['9pm', 'hawas-ice', 'mandarine', 'khamrah-qahwa', 'hawas-malibu', 'royale-opal'];
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const records = [];
const errors = [];
const images = [];
try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: width < 896,
      hasTouch: width < 896,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push({ width, message: error.message }));
    const root = page.locator('[data-book-root]');
    const shot = async (name) => {
      const file = `${width}-${name}.png`;
      await page.locator('img:visible').evaluateAll(async (images) => {
        await Promise.all(
          images
            .filter((image) => {
              const box = image.getBoundingClientRect();
              return box.bottom > 0 && box.top < innerHeight;
            })
            .map((image) => image.decode()),
        );
      });
      await page.screenshot({ path: join(output, file) });
      images.push({ width, height, name, file });
    };
    await page.goto(baseUrl);
    await expect(root).toHaveAttribute('data-book-phase', 'closed');
    await shot('cover');
    await page.locator('[data-book-open]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    for (const [index, slug] of slugs.entries()) {
      const face = Math.floor(index / 2) + 1;
      if (width < 896 ? index % 2 === 0 && index > 0 : index === 4) {
        await page.locator('[data-book-next]').click();
        await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      }
      const zone = page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
      if (index % 2 === 0) {
        await page
          .locator('[data-book-leaf]:visible [data-product-visual] img')
          .evaluateAll(async (images) => {
            for (const image of images) image.loading = 'eager';
            await Promise.all(images.map((image) => image.decode()));
          });
        await shot(`overview-${face}`);
      }
      await zone.locator('[data-product-link]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      if (phase === 'after') await expect(zone).toHaveAttribute('data-photo-ready', '');
      await zone.locator('[data-product-visual] img').evaluate(async (image) => {
        image.loading = 'eager';
        await image.decode();
      });
      await shot(`${slug}-top`);
      records.push(
        await zone.evaluate(
          (element, profile) => {
            const rect = (selector) => {
              const node = element.querySelector(selector);
              if (!node) return null;
              const box = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              return {
                x: box.x + scrollX,
                y: box.y + scrollY,
                right: box.right + scrollX,
                bottom: box.bottom + scrollY,
                width: box.width,
                height: box.height,
                font: Number.parseFloat(style.fontSize),
                overflowX: node.scrollWidth - node.clientWidth,
                overflowY: node.scrollHeight - node.clientHeight,
              };
            };
            return {
              ...profile,
              horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
              title: rect('h4'),
              photo: rect('[data-product-visual]'),
              notes: rect('.fragrance-notes'),
              reference: rect('[data-inspired-reference]'),
              facts: rect('.perfume-reading__facts'),
              buy: rect('[data-order-open]'),
              trust: rect('.editorial-trust'),
              description: rect('.perfume-zone__description'),
            };
          },
          { width, height, slug },
        ),
      );
      if (width < 896) {
        await zone.locator('.fragrance-notes').scrollIntoViewIfNeeded();
        await shot(`${slug}-notes`);
        await zone.locator('[data-order-open]').focus();
        await expect(zone.locator('[data-order-open]')).toBeInViewport({ ratio: 0.98 });
        await shot(`${slug}-purchase`);
      }
      await zone.locator('[data-order-open]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'ordering');
      if (index === 2) {
        await shot('order-modal');
        await page.locator('[data-order-form] button[type="submit"]').click();
        await shot('order-errors');
      }
      await page.locator('[data-order-close]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      await page.locator('[data-book-return]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await expect(zone.locator('[data-product-link]')).toBeFocused();
    }
    await page.locator('[data-book-close]').click();
    await expect(root).toHaveAttribute('data-book-phase', 'closed');
    await context.close();
    console.log(`Captured and interacted: ${width}x${height}, six perfumes.`);
  }
} finally {
  await browser.close();
}

await writeFile(join(output, 'metrics.json'), JSON.stringify({ records, errors, images }, null, 2));
// Contact sheets preserve the captured pixels; they are review artifacts, never product assets.
for (const [width] of viewports) {
  const selected = images.filter(
    (x) => x.width === width && (x.name.startsWith('overview') || x.name.endsWith('-top')),
  );
  const thumbWidth = width < 896 ? 200 : 460;
  const thumbHeight = Math.round((selected[0].height / width) * thumbWidth);
  const columns = 3;
  const thumbs = await Promise.all(
    selected.map(async (item, index) => ({
      input: await sharp(join(output, item.file)).resize({ width: thumbWidth }).toBuffer(),
      left: (index % columns) * thumbWidth,
      top: Math.floor(index / columns) * thumbHeight,
    })),
  );
  await sharp({
    create: {
      width: thumbWidth * columns,
      height: thumbHeight * Math.ceil(thumbs.length / columns),
      channels: 3,
      background: '#12100c',
    },
  })
    .composite(thumbs)
    .png()
    .toFile(join(output, `${width}-contact-sheet.png`));
}
console.log(
  JSON.stringify({
    details: records.length,
    screenshots: images.length,
    errors: errors.length,
    overflows: records.filter((x) => x.horizontalOverflow > 0).length,
  }),
);
