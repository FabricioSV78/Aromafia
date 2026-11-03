import { expect, test, type Locator, type Page } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { products } from '../../src/features/catalog/data/products';
import { expectPublicPrices } from './catalog-assertions';

const perfumes = [
  { slug: '9pm', name: '9 pm', amount: 150 },
  { slug: 'hawas-ice', name: 'Hawas Ice 100ml', amount: 185 },
  { slug: 'mandarine', name: 'Odyssey Mandarin Sky', amount: 149 },
  { slug: 'khamrah-qahwa', name: 'Khamrah Qahwa', amount: 160 },
  { slug: 'hawas-malibu', name: 'Hawas Malibu', amount: 189 },
  { slug: 'royale-opal', name: 'Zakat Royale Opal', amount: 115 },
];
const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const bookParts = ['[data-book-camera]', '[data-book-volume]', '[data-book-pages]'];
interface BookBounds {
  selector: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

async function readBookBounds(page: Page): Promise<readonly BookBounds[]> {
  return page.evaluate(
    (selectors) =>
      selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error('El marco del libro debe existir.');
        const rect = element.getBoundingClientRect();
        return { selector, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }),
    bookParts,
  );
}

async function assertSameBookBounds(page: Page, before: readonly BookBounds[]): Promise<void> {
  for (const current of await readBookBounds(page)) {
    const source = before.find((part) => part.selector === current.selector);
    if (!source) throw new Error('El marco conserva todas sus partes.');
    for (const key of ['x', 'y', 'width', 'height'] as const)
      expect(
        Math.abs(current[key] - source[key]),
        `${current.selector}: ${key} debe mantenerse`,
      ).toBeLessThanOrEqual(2);
  }
}

function zoneFor(page: Page, slug: string): Locator {
  return page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
}

async function focused(page: Page, slug: string): Promise<Locator> {
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  const zone = zoneFor(page, slug);
  await expect(zone).toHaveClass(/is-reading/);
  await expect(zone.locator('[data-book-reading]')).toBeVisible();
  return zone;
}

async function assertOneView(page: Page, zone: Locator): Promise<void> {
  const parts = [
    zone.locator('[data-product-visual]'),
    zone.locator('h4'),
    zone.locator('.product-price__current'),
    zone.locator('.perfume-zone__description'),
    zone.locator('.perfume-reading__facts'),
    zone.locator('[data-fragrance-notes]'),
    zone.locator('[data-order-open]'),
    zone.locator('.perfume-reading__order-note'),
  ];
  for (const part of parts) await expect(part).toBeInViewport({ ratio: 0.98 });
  for (const container of [
    zone,
    zone.locator('.perfume-zone__copy'),
    zone.locator('[data-book-reading]'),
  ]) {
    const dimensions = await container.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      height: element.clientHeight,
      scrollWidth: element.scrollWidth,
      width: element.clientWidth,
    }));
    expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height + 2);
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 2);
  }
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2)).toBe(
    true,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function isEditorialFlow(page: Page, zone: Locator): Promise<boolean> {
  return (
    (await zone.getAttribute('data-editorial-detail')) !== null &&
    (await page.evaluate(() => innerWidth < 896))
  );
}

async function assertReadingPresentation(page: Page, zone: Locator): Promise<void> {
  if (!(await isEditorialFlow(page, zone))) return assertOneView(page, zone);
  // The shared editorial detail allows natural document scrolling on mobile and tablet.
  for (const selector of [
    'h4',
    '[data-product-visual]',
    '.product-price__current',
    '.perfume-zone__description',
    '.perfume-reading__facts',
    '[data-fragrance-notes]',
    '[data-editorial-trust]',
    '[data-order-open]',
    '.perfume-reading__order-note',
  ]) {
    const part = zone.locator(selector);
    await part.scrollIntoViewIfNeeded();
    await expect(part).toBeInViewport({ ratio: 0.98 });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  await expect(page.locator('[data-book-return]')).toBeInViewport({ ratio: 1 });
}

test('los seis perfumes conservan datos y elementos reales, con lectura móvil editorial natural', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const detailRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/perfumes/'))
      detailRequests.push(request.url());
  });
  for (const [ordinal, perfume] of perfumes.entries()) {
    await page.goto(`/#libro/${Math.floor(ordinal / 2) + 1}`);
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    const zone = zoneFor(page, perfume.slug);
    const hero = await zone.locator('[data-product-visual]').elementHandle();
    const title = await zone.locator('h4').elementHandle();
    const price = await zone.locator('.product-price__current').elementHandle();
    if (!hero || !title || !price) throw new Error('Cada zona necesita imagen, nombre y precio.');
    await zone.locator('[data-product-link]').click();
    await focused(page, perfume.slug);
    expect(
      await zone.locator('[data-product-visual]').evaluate((now, before) => now === before, hero),
    ).toBe(true);
    expect(await zone.locator('h4').evaluate((now, before) => now === before, title)).toBe(true);
    expect(
      await zone
        .locator('.product-price__current')
        .evaluate((now, before) => now === before, price),
    ).toBe(true);
    await expect(zone.getByRole('heading', { name: perfume.name, exact: true })).toBeVisible();
    await expect(zone).toContainText(currency.format(perfume.amount));
    const product = products.find((item) => item.slug === perfume.slug);
    const variant = product?.variants[0];
    const image = product?.detailImage;
    if (!product?.brand || !variant?.capacityMl || !image || !product.sources?.length)
      throw new Error(
        'El perfume debe tener información, presentación, imagen y fuentes verificadas.',
      );
    await expectPublicPrices(zone, product);
    await expect(zone.locator('.perfume-zone__brand')).toHaveText(product.brand.name);
    await expect(zone.locator('[data-product-visual] source[data-detail-image]')).toHaveAttribute(
      'media',
      'all',
    );
    const detailUrls = [
      image.src,
      ...(image.srcSet?.split(',').map((item) => item.trim().split(' ')[0]) ?? []),
    ];
    await expect
      .poll(async () =>
        detailUrls.includes(
          await zone
            .locator('[data-product-visual] img')
            .evaluate((element) =>
              element instanceof HTMLImageElement && element.currentSrc
                ? new URL(element.currentSrc).pathname
                : '',
            ),
        ),
      )
      .toBe(true);
    await expect(zone.locator('[data-product-visual] img')).toHaveAttribute(
      'alt',
      product.generalImage?.alt ?? image.alt,
    );
    await expect(zone).toContainText(`${variant.capacityMl} ml`);
    await expect(zone.getByText('Concentración', { exact: true })).toHaveCount(0);
    await expect(zone.locator('.perfume-reading__facts dt')).toHaveText([
      'Presentación',
      'Ideal para',
    ]);
    if (!product.occasionSuggestion)
      throw new Error('Cada perfume debe tener una sugerencia de uso editorial.');
    await expect(zone.locator('.perfume-reading__facts dd').nth(1)).toHaveText(
      product.occasionSuggestion,
    );
    const renderedDescription = (
      await zone.locator('.perfume-zone__description').textContent()
    )?.trim();
    expect([product.description, product.shortDescription]).toContain(renderedDescription);
    const notes = zone.locator('[data-fragrance-notes]');
    const labels = ['Notas de entrada', 'Notas de corazón', 'Notas de fondo'];
    for (const label of labels) await expect(notes.getByText(label, { exact: true })).toBeVisible();
    await expect(notes.locator('dd')).toHaveText(
      [product.notes.top, product.notes.heart, product.notes.base].map((group) => group.join(', ')),
    );
    await expect(zone.locator('[data-product-sources]')).toHaveCount(0);
    await expect(zone.locator('.inspired-reference__notice')).toHaveCount(0);
    await expect(zone.getByText(/Similitud orientativa/)).toHaveCount(0);
    await expect(zone.locator('[data-inspired-reference]')).toHaveCount(product.inspiredBy ? 1 : 0);
    await expect(zone.locator('[data-reference-pending]')).toHaveCount(0);
    await expect(zone.getByText('Precio de oferta', { exact: true })).toHaveCount(0);
    await expect(
      zone.getByRole('button', { name: `Comprar ${perfume.name}`, exact: true }),
    ).toBeVisible();
    const trust = zone.locator('[data-editorial-trust]');
    await expect(trust).toBeVisible();
    await expect(trust).toContainText('100% originales');
    await expect(trust).toContainText('Trujillo y Chiclayo');
    await expect(trust).toContainText('todo el Perú');
    await assertReadingPresentation(page, zone);
    await expect(page.locator('dialog[data-order-stage]')).toHaveCount(1);
    await expect(page.locator('dialog[data-order-stage]')).toBeHidden();
    await expect(page.locator('[data-product-dialog]')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/');
    await hero.dispose();
    await title.dispose();
    await price.dispose();
  }
  expect(detailRequests).toEqual([]);
});

test('los detalles conservan el marco de escritorio y la lectura móvil restaura el libro al regresar', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [ordinal, perfume] of perfumes.entries()) {
      const face = Math.floor(ordinal / 2) + 1;
      await page.goto(`/#libro/${face}`);
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
      const before = await readBookBounds(page);
      await page.goto(`/#libro/${face}/perfume/${perfume.slug}`);
      const zone = await focused(page, perfume.slug);
      await assertReadingPresentation(page, zone);
      if (!(await isEditorialFlow(page, zone))) await assertSameBookBounds(page, before);
      await expect(page.locator('[data-book-return]')).toBeInViewport({ ratio: 1 });
      await page.locator('[data-book-return]').click();
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
      await assertSameBookBounds(page, before);
    }
  }
});

test('regresar repone la misma zona y permite volver a entrar sin restos de la composición ampliada', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#libro/1');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  const zone = zoneFor(page, '9pm');
  const source = zone.locator('[data-product-link]');
  const before = await zone.boundingBox();
  if (!before) throw new Error('La zona debe tener posición en el libro.');
  await source.click();
  await focused(page, '9pm');
  await page.locator('[data-book-return]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(zone.locator('[data-book-reading]')).toBeHidden();
  await expect(source).toBeFocused();
  const after = await zone.boundingBox();
  if (!after) throw new Error('Regresar debe restaurar la zona.');
  for (const key of ['x', 'y', 'width', 'height'] as const)
    expect(Math.abs(after[key] - before[key])).toBeLessThanOrEqual(2);
  await source.click();
  await focused(page, '9pm');
  await assertReadingPresentation(page, zone);
});

test('imagen, título y precio permanecen dentro de la vista durante la entrada y el regreso', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-book-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  const bookBefore = await readBookBounds(page);
  for (const direction of ['focus', 'return'] as const) {
    const samples = await page.evaluate(
      (direction) =>
        new Promise<
          {
            time: number;
            boxes: { selector: string; left: number; top: number; right: number; bottom: number }[];
          }[]
        >((resolve, reject) => {
          const root = document.querySelector<HTMLElement>('[data-book-root]');
          const action = document.querySelector<HTMLElement>(
            direction === 'focus'
              ? '[data-product-slug="9pm"] [data-product-link]'
              : '[data-book-return]',
          );
          if (!root || !action) {
            reject(new Error('La acción debe existir.'));
            return;
          }
          const phase = direction === 'focus' ? 'focusing' : 'returning';
          const finished = direction === 'focus' ? 'focused' : 'browsing';
          const selectors = [
            '[data-book-camera]',
            '[data-book-volume]',
            '[data-book-pages]',
            '[data-product-slug="9pm"] [data-product-visual]',
            '[data-product-slug="9pm"] h4',
            '[data-product-slug="9pm"] .product-price',
          ];
          const samples: {
            time: number;
            boxes: { selector: string; left: number; top: number; right: number; bottom: number }[];
          }[] = [];
          const started = performance.now();
          let phaseStarted = 0;
          action.click();
          function sample() {
            if (!root) return;
            if (root.dataset['bookPhase'] === phase) {
              if (!phaseStarted) phaseStarted = performance.now();
              const boxes = selectors.map((selector) => {
                const element = document.querySelector(selector);
                if (!element) throw new Error('El elemento compartido debe existir.');
                const rect = element.getBoundingClientRect();
                return {
                  selector,
                  left: rect.left,
                  top: rect.top,
                  right: rect.right,
                  bottom: rect.bottom,
                };
              });
              samples.push({ time: performance.now() - phaseStarted, boxes });
            }
            if (root.dataset['bookPhase'] === finished && samples.length) resolve(samples);
            else if (performance.now() - started > 4000)
              reject(new Error('La transición no terminó.'));
            else requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        }),
      direction,
    );
    expect(samples.length).toBeGreaterThan(10);
    for (const sample of samples) {
      for (const source of bookBefore) {
        const box = sample.boxes.find((part) => part.selector === source.selector);
        if (!box) throw new Error('Cada cuadro debe medir el marco real del libro.');
        for (const [value, expected] of [
          [box.left, source.x],
          [box.top, source.y],
          [box.right - box.left, source.width],
          [box.bottom - box.top, source.height],
        ]) {
          if (value === undefined || expected === undefined)
            throw new Error('Geometría incompleta.');
          expect(
            Math.abs(value - expected),
            `${direction}: ${source.selector} cambia de marco`,
          ).toBeLessThanOrEqual(2);
        }
      }
    }
    await assertSameBookBounds(page, bookBefore);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Se necesita una vista con dimensiones.');
    for (const time of [1.05 * 250, 1.05 * 500, 1.05 * 750]) {
      const sample = samples.reduce((nearest, current) =>
        Math.abs(current.time - time) < Math.abs(nearest.time - time) ? current : nearest,
      );
      for (const box of sample.boxes) {
        expect(
          box.left,
          `${direction}: ${box.selector} sale por la izquierda`,
        ).toBeGreaterThanOrEqual(-2);
        expect(box.top, `${direction}: ${box.selector} sale por arriba`).toBeGreaterThanOrEqual(-2);
        expect(box.right, `${direction}: ${box.selector} sale por la derecha`).toBeLessThanOrEqual(
          viewport.width + 2,
        );
        expect(box.bottom, `${direction}: ${box.selector} sale por abajo`).toBeLessThanOrEqual(
          viewport.height + 2,
        );
      }
    }
  }
});

test('reducir movimiento durante el regreso asienta también su URL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#libro/1/perfume/9pm');
  await focused(page, '9pm');
  await page.waitForTimeout(400);
  await page.locator('[data-book-return]').click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(page).toHaveURL(/#libro\/1$/);
  await expect(zoneFor(page, '9pm').locator('[data-book-reading]')).toBeHidden();
});

test('recarga y resize conservan el detalle completo y Escape devuelve el foco @a11y', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#libro/3/perfume/royale-opal');
  await focused(page, 'royale-opal');
  await page.reload();
  await focused(page, 'royale-opal');
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await assertReadingPresentation(page, await focused(page, 'royale-opal'));
  }
  const zone = zoneFor(page, 'royale-opal');
  const cta = zone.locator('[data-order-open]');
  await cta.focus();
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await expect(zone.locator('[data-product-link]')).toBeFocused();
});
