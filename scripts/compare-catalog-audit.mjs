import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { chromium, expect } from '@playwright/test';

const directory = join('reports', 'visual-mobile-audit');
const { images } = JSON.parse(await readFile(join(directory, 'after', 'metrics.json'), 'utf8'));
const sizes = [...new Set(images.map((image) => image.width))];
const names = [...new Set(images.map((image) => image.name))];
// The short mobile document deliberately reflows; show its entire paper as an extra artifact.
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 320, height: 568 },
    reducedMotion: 'reduce',
  });
  await page.goto('http://127.0.0.1:4321/#libro/1');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await page.locator('[data-book-leaf]:visible img').evaluateAll(async (images) => {
    for (const image of images) image.loading = 'eager';
    await Promise.all(images.map((image) => image.decode()));
  });
  await page.screenshot({
    path: join(directory, 'after', '320-overview-full.png'),
    fullPage: true,
  });
} finally {
  await browser.close();
}
const pairs = images
  .filter((image) => image.name.startsWith('overview') || image.name.endsWith('-top'))
  .map(
    (image) => `<section data-width="${image.width}" data-name="${image.name}">
      <h2>${image.width} × ${image.height} · ${image.name}</h2>
      <div class="pair"><figure><figcaption>Antes</figcaption><a href="before/${image.file}"><img loading="lazy" src="before/${image.file}" alt="Antes: ${image.name} a ${image.width}px"></a></figure>
      <figure><figcaption>Después</figcaption><a href="after/${image.file}"><img loading="lazy" src="after/${image.file}" alt="Después: ${image.name} a ${image.width}px"></a></figure></div>
    </section>`,
  );
await writeFile(
  join(directory, 'comparison.html'),
  `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AROMAFIA — Comparación visual</title>
  <style>body{margin:0;padding:24px;background:#181410;color:#f5e4ca;font:16px system-ui}header{position:sticky;top:0;background:#181410f5;padding:12px;z-index:1}h1{font:32px Georgia}h2{font-size:18px}label{display:inline-block;margin:8px}select{font:inherit;padding:8px}section{margin:32px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0}figcaption{padding:8px}img{display:block;width:100%;height:auto}a{color:inherit}@media(max-width:650px){.pair{grid-template-columns:1fr}}</style>
  <header><h1>AROMAFIA · Auditoría visual</h1><p>Capturas reales de Chromium, antes y después. Pulsa una imagen para verla a tamaño original.</p>
  <label>Resolución <select id="width"><option value="all">Todas</option>${sizes.map((size) => `<option>${size}</option>`).join('')}</select></label>
  <label>Vista <select id="name"><option value="all">Todas</option>${names
    .filter((name) => name.startsWith('overview') || name.endsWith('-top'))
    .map((name) => `<option>${name}</option>`)
    .join('')}</select></label></header>
  <main>${pairs.join('\n')}</main>
  <script>const controls=[document.querySelector('#width'),document.querySelector('#name')];function filter(){for(const section of document.querySelectorAll('section'))section.hidden=!controls.every(control=>control.value==='all'||section.dataset[control.id]===control.value)}for(const control of controls)control.addEventListener('change',filter);</script></html>`,
);
for (const [width, name] of [
  [1440, 'overview-1'],
  [320, 'overview-1'],
  [1440, 'khamrah-qahwa-top'],
  [390, 'mandarine-top'],
]) {
  const file = `${width}-${name}.png`;
  const afterFile = width === 320 ? '320-overview-full.png' : file;
  const before = await sharp(join(directory, 'before', file)).metadata();
  const after = await sharp(join(directory, 'after', afterFile)).metadata();
  await sharp({
    create: {
      width: before.width + after.width,
      height: Math.max(before.height, after.height) + 36,
      channels: 3,
      background: '#181410',
    },
  })
    .composite([
      { input: join(directory, 'before', file), left: 0, top: 36 },
      { input: join(directory, 'after', afterFile), left: before.width, top: 36 },
      {
        input: Buffer.from(
          `<svg width="${before.width + after.width}" height="36"><g fill="#f5e4ca" font-family="sans-serif" font-size="18"><text x="12" y="25">Antes</text><text x="${before.width + 12}" y="25">Después</text></g></svg>`,
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(join(directory, `comparison-${width}-${name}.png`));
}
console.log(`Saved ${pairs.length} visual comparisons and four full-resolution pairs.`);
