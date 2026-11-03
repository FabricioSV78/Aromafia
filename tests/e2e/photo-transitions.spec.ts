import { expect, test, type Page, type TestInfo } from './fixtures';
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { products } from '../../src/features/catalog/data/products';

interface Point {
  x: number;
  y: number;
}

interface PhotoSample {
  source: string;
  decorative: boolean;
  stageAspect: number;
  points: Point[];
  reference: Point;
}

interface PhotoResult {
  frame: string;
  source: string;
  decorative: boolean;
  stageAspect: number;
  corners: number[][];
  reference: number[];
  whiteCorners: number;
}

const rootSelector = '[data-book-root]';
const slugs = products
  .filter((product) => product.status === 'published')
  .sort((a, b) => a.order - b.order)
  .map((product) => product.slug);

async function activate(page: Page, selector: string): Promise<void> {
  await page.locator(selector).evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error('La acción debe ser un control HTML.');
    element.click();
  });
}

async function prepare(page: Page, testInfo: TestInfo): Promise<void> {
  await page.setViewportSize(
    testInfo.project.name.startsWith('desktop')
      ? { width: 1440, height: 900 }
      : { width: 390, height: 844 },
  );
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
    // Both independently encoded roles are ready before deterministic pixel sampling.
    // They still travel in the same real <img>; these preloaders never enter the DOM.
    await Promise.all(
      Array.from(document.querySelectorAll<HTMLSourceElement>('source[data-detail-image]')).map(
        async (source) => {
          const preload = new Image();
          preload.sizes = source.sizes;
          preload.srcset = source.srcset;
          preload.src = source.srcset.split(',')[0]?.trim().split(' ')[0] ?? '';
          await preload.decode();
        },
      ),
    );
  });
  // Let the lazy motion engine initialize through a real, normally timed opening first.
  await page.locator('[data-book-open]').click();
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'opening');
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 50));
}

async function photoSamples(page: Page): Promise<PhotoSample[]> {
  return page.locator('[data-product-visual] img').evaluateAll((elements) => {
    const samples = [];
    const turning = document.querySelector('.book-turn');
    for (const element of elements) {
      if (!(element instanceof HTMLImageElement)) continue;
      const visual = element.closest<HTMLElement>('[data-product-visual]');
      if (!visual || !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
        continue;
      const sheet = element.closest<HTMLElement>('.book-turn');
      // Native pages can be fully occluded by a decorative turning sheet. Sampling
      // their coordinates would attribute the covering product's pixels to them.
      if (turning && !sheet) continue;
      if (sheet) {
        const cosine = new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m11;
        const back = Boolean(element.closest('.book-turn__back'));
        // The back face and the almost edge-on sheet have no visible photo to inspect.
        if (Math.abs(cosine) < 0.2 || back !== cosine < 0) continue;
      }
      const clippedFrame = element.closest<HTMLElement>('.product-hero__photo-frame');
      const probeParent = clippedFrame ?? visual;
      const width = clippedFrame?.clientWidth ?? element.clientWidth;
      const height = clippedFrame?.clientHeight ?? element.clientHeight;
      if (!width || !height || !element.naturalWidth || !element.naturalHeight) continue;
      const fit = getComputedStyle(element).objectFit;
      const scale =
        fit === 'cover'
          ? Math.max(width / element.naturalWidth, height / element.naturalHeight)
          : Math.min(width / element.naturalWidth, height / element.naturalHeight);
      const imageWidth = fit === 'fill' ? width : element.naturalWidth * scale;
      const imageHeight = fit === 'fill' ? height : element.naturalHeight * scale;
      // Sample the actual drawn bitmap, including its baked background at the edges.
      const left = element.offsetLeft + Math.max(0, (width - imageWidth) / 2);
      const top = element.offsetTop + Math.max(0, (height - imageHeight) / 2);
      const drawnWidth = Math.min(width, imageWidth);
      const drawnHeight = Math.min(height, imageHeight);
      const margin = clippedFrame ? 0.04 : 0.08;

      // Zero-size, transparent probes inherit the real 3D plane. They avoid using an
      // axis-aligned bounding box as if a turning sheet were a flat photograph.
      const localPoints = [
        [left + drawnWidth * margin, top + drawnHeight * 0.08],
        [left + drawnWidth * (1 - margin), top + drawnHeight * 0.08],
        [left + drawnWidth * margin, top + drawnHeight * 0.22],
        [left + drawnWidth * (1 - margin), top + drawnHeight * 0.22],
        [left + drawnWidth * 0.5, clippedFrame ? -6 : Math.max(2, top - 6)],
      ];
      const probes = localPoints.map(([x = 0, y = 0]) => {
        const probe = document.createElement('span');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = `position:absolute;inset:auto;left:${x}px;top:${y}px;width:0;height:0;padding:0;margin:0;border:0;pointer-events:none;`;
        probeParent.append(probe);
        return probe;
      });
      const projected = probes.map((probe) => {
        const rect = probe.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });
      for (const probe of probes) probe.remove();
      const reference = projected.pop();
      if (
        !reference ||
        projected.some(({ x, y }) => x < 3 || y < 3 || x >= innerWidth - 3 || y >= innerHeight - 3)
      )
        continue;
      samples.push({
        source: element.currentSrc.split('/').pop() ?? element.alt,
        decorative: Boolean(sheet),
        stageAspect: visual.getBoundingClientRect().width / visual.getBoundingClientRect().height,
        points: projected,
        reference,
      });
    }
    return samples;
  });
}

async function inspectFrame(
  page: Page,
  testInfo: TestInfo,
  frame: string,
  results: PhotoResult[],
): Promise<void> {
  const phase = await page.locator(rootSelector).getAttribute('data-book-phase');
  if (phase === 'focusing' || phase === 'returning') {
    const aspect = await page
      .locator('[data-book-pages] .is-selected [data-product-visual]')
      .evaluate((element) => {
        const { width, height } = element.getBoundingClientRect();
        return width / height;
      });
    expect(
      Math.abs(aspect - 1),
      `${frame}: la superficie fotográfica real debe conservar su proporción cuadrada.`,
    ).toBeLessThanOrEqual(0.02);
  }
  const samples = await photoSamples(page);
  const path = testInfo.outputPath(`${frame}.png`);
  const screenshot = await page.screenshot({ path, scale: 'css' });
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const patch = ({ x, y }: Point): number[] => {
    const sums = [0, 0, 0];
    let pixels = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = Math.round(x) + dx;
        const py = Math.round(y) + dy;
        if (px < 0 || py < 0 || px >= info.width || py >= info.height) continue;
        const offset = (py * info.width + px) * info.channels;
        for (let channel = 0; channel < 3; channel++)
          sums[channel] = (sums[channel] ?? 0) + (data[offset + channel] ?? 0);
        pixels++;
      }
    }
    return sums.map((sum) => Math.round(sum / Math.max(1, pixels)));
  };
  const entries = samples.map((sample) => {
    const corners = sample.points.map(patch);
    return {
      frame,
      source: sample.source,
      decorative: sample.decorative,
      stageAspect: sample.stageAspect,
      corners,
      reference: patch(sample.reference),
      // Two separate background patches distinguish a rectangular source backdrop
      // from a small glass/cap reflection. The central bottle, label and base shadow
      // are deliberately outside these samples.
      whiteCorners: corners.filter(
        (rgb) => Math.min(...rgb) >= 225 && Math.max(...rgb) - Math.min(...rgb) <= 9,
      ).length,
    };
  });
  results.push(...entries);
  if (entries.some((entry) => entry.whiteCorners >= 2))
    await testInfo.attach(frame, { path, contentType: 'image/png' });
}

async function checkpoints(
  page: Page,
  testInfo: TestInfo,
  name: string,
  times: readonly number[],
  phase: string,
  results: PhotoResult[],
): Promise<void> {
  let previous = 0;
  for (const time of times) {
    await page.clock.runFor(time - previous);
    previous = time;
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', phase);
    await inspectFrame(page, testInfo, `${name}-${time}ms`, results);
  }
}

async function expectCleanPhotos(results: PhotoResult[], testInfo: TestInfo): Promise<void> {
  const path = testInfo.outputPath('photo-background-pixels.json');
  await writeFile(path, JSON.stringify(results, null, 2));
  await testInfo.attach('photo-background-pixels', {
    path,
    contentType: 'application/json',
  });
  expect(
    results
      .filter((result) => result.whiteCorners >= 2)
      .map((result) => `${result.frame}: ${result.source} (${result.whiteCorners}/4)`),
    'Las esquinas del fondo fotográfico deben integrarse en la superficie cálida durante el movimiento.',
  ).toEqual([]);
}

test('las seis fotografías conservan un fondo cálido durante el enfoque y el regreso', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await prepare(page, testInfo);
  const results: PhotoResult[] = [];
  const groupSize = testInfo.project.name.startsWith('desktop') ? 4 : 2;
  for (const [index, slug] of slugs.entries()) {
    if (index && index % groupSize === 0) {
      await activate(page, '[data-book-next]');
      await page.clock.runFor(1200);
      await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
    }
    const zone = page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
    const photo = zone.locator('[data-product-visual] img');
    const original = await photo.elementHandle();
    if (!original) throw new Error('Cada perfume debe conservar su fotografía real.');
    await inspectFrame(page, testInfo, `${slug}-overview`, results);
    await activate(page, `[data-book-pages] [data-product-slug="${slug}"] [data-product-link]`);
    await checkpoints(page, testInfo, `${slug}-focus`, [210, 525, 840], 'focusing', results);
    await page.clock.runFor(1000);
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'focused');
    await inspectFrame(page, testInfo, `${slug}-focused`, results);
    expect(await photo.evaluate((current, previous) => current === previous, original)).toBe(true);
    await activate(page, '[data-book-return]');
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'retracting');
    await checkpoints(page, testInfo, `${slug}-return`, [370, 685, 1000], 'returning', results);
    await page.clock.runFor(600);
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
    await expect(zone.locator('[data-product-link]')).toBeFocused();
    expect(await photo.evaluate((current, previous) => current === previous, original)).toBe(true);
    await original.dispose();
  }
  expect(results.length).toBeGreaterThanOrEqual(slugs.length * 8);
  await expectCleanPhotos(results, testInfo);
});

test('portada y giros de ambas caras conservan el fondo de las fotografías y limpian sus clones', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await prepare(page, testInfo);
  const results: PhotoResult[] = [];
  await activate(page, '[data-book-close]');
  await checkpoints(page, testInfo, 'close', [54, 162, 540, 864], 'closing', results);
  await page.clock.runFor(400);
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'closed');
  await activate(page, '[data-book-open]');
  await checkpoints(page, testInfo, 'open', [216, 540, 864, 1026], 'opening', results);
  await page.clock.runFor(400);
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
  for (const direction of ['next', 'previous'] as const) {
    await activate(page, `[data-book-${direction === 'next' ? 'next' : 'prev'}]`);
    await checkpoints(page, testInfo, direction, [208, 520, 832], 'turning', results);
    await page.clock.runFor(400);
    await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page.locator('.book-turn')).toHaveCount(0);
    expect(
      results.some((result) => result.decorative && result.frame.startsWith(direction)),
      `El giro ${direction} debe incluir píxeles de la fotografía del clon visible.`,
    ).toBe(true);
  }
  await expect(page.locator('[data-book-pages] [data-product-slug]')).toHaveCount(slugs.length);
  await expectCleanPhotos(results, testInfo);
});
