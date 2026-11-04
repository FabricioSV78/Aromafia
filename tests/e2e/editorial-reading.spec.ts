import { expect, test, type Locator, type Page } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { products } from '../../src/features/catalog/data/products';
import type { ProductImage } from '../../src/features/catalog/domain/product';
import { expectPublicPrices } from './catalog-assertions';

function imagePaths(image: ProductImage): readonly string[] {
  return [
    image.src,
    ...(image.srcSet?.split(',').map((item) => item.trim().split(' ')[0]) ?? []),
  ].filter((path): path is string => Boolean(path));
}

async function expectPhotoRole(photo: Locator, image: ProductImage): Promise<void> {
  await expect
    .poll(async () =>
      imagePaths(image).includes(
        await photo.evaluate((element) =>
          element instanceof HTMLImageElement && element.currentSrc
            ? new URL(element.currentSrc).pathname
            : '',
        ),
      ),
    )
    .toBe(true);
}

async function expectFinishedPhoto(photo: Locator): Promise<void> {
  const presentation = await photo.evaluate((element) => {
    if (!(element instanceof HTMLImageElement)) throw new Error('Expected a finished photograph.');
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const hero = element.closest('[data-product-visual]');
    const surfaces = hero
      ? [
          element,
          element.closest('picture'),
          element.closest('.product-hero__photo-frame'),
          hero,
          hero.closest('.product-hero-slot'),
        ]
      : [element];
    return {
      naturalAspect: element.naturalWidth / element.naturalHeight,
      displayedAspect: bounds.width / bounds.height,
      fit: style.objectFit,
      transform: style.transform,
      surfaces: surfaces.map((surface) => {
        if (!surface) throw new Error('Finished photos need their real framing surfaces.');
        const painted = getComputedStyle(surface);
        return {
          background: painted.backgroundImage,
          color: painted.backgroundColor,
          filter: painted.filter,
          mask: painted.maskImage,
          blend: painted.mixBlendMode,
          shadow: painted.boxShadow,
          border: painted.borderWidth,
          before: getComputedStyle(surface, '::before').content,
          after: getComputedStyle(surface, '::after').content,
        };
      }),
    };
  });
  expect(presentation.fit).toBe('contain');
  expect(presentation.transform).toBe('none');
  expect(Math.abs(presentation.displayedAspect - presentation.naturalAspect)).toBeLessThanOrEqual(
    0.01,
  );
  for (const surface of presentation.surfaces) {
    expect(surface.background).toBe('none');
    expect(surface.color).toBe('rgba(0, 0, 0, 0)');
    expect(surface.filter).toBe('none');
    expect(surface.mask).toBe('none');
    expect(surface.blend).toBe('normal');
    expect(surface.shadow).toBe('none');
    expect(surface.border).toBe('0px');
    expect(['none', 'normal']).toContain(surface.before);
    expect(['none', 'normal']).toContain(surface.after);
  }
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 640 },
]) {
  test(`las seis superficies fotográficas igualan el tamaño de 9PM a ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const sizes: { slug: string; width: number; height: number }[] = [];
    for (const [ordinal, product] of products.entries()) {
      await page.goto(`/#libro/${Math.floor(ordinal / 2) + 1}`);
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
      const visual = page.locator(
        `[data-book-pages] [data-product-slug="${product.slug}"] [data-product-visual]`,
      );
      if (viewport.width < 896) await visual.scrollIntoViewIfNeeded();
      await expect(visual).toBeInViewport({ ratio: 0.98 });
      const box = await visual.boundingBox();
      if (!box) throw new Error('Las seis fotografías deben reservar su superficie.');
      sizes.push({ slug: product.slug, width: box.width, height: box.height });
      const frame = await visual.locator('.product-hero__photo-frame').boundingBox();
      if (!frame) throw new Error('El frasco completo debe tener un encuadre propio.');
      expect(frame.x).toBeGreaterThanOrEqual(box.x - 1);
      expect(frame.y).toBeGreaterThanOrEqual(box.y - 1);
      expect(frame.x + frame.width).toBeLessThanOrEqual(box.x + box.width + 1);
      expect(frame.y + frame.height).toBeLessThanOrEqual(box.y + box.height + 1);
      expect(Math.abs(frame.width - box.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.height - box.height)).toBeLessThanOrEqual(1);
      const photo = visual.locator('img');
      await photo.evaluate(async (element) => {
        if (!(element instanceof HTMLImageElement)) throw new Error('The photograph must load.');
        element.loading = 'eager';
        await element.decode();
      });
      const delivered = await photo.evaluate((element) => {
        if (!(element instanceof HTMLImageElement)) throw new Error('Missing photograph.');
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return {
          width: bounds.width,
          height: bounds.height,
          naturalWidth: element.naturalWidth,
          naturalHeight: element.naturalHeight,
          mask: style.maskImage,
          filter: style.filter,
        };
      });
      expect(Math.abs(delivered.width - box.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(delivered.height - box.height)).toBeLessThanOrEqual(1);
      expect(delivered.naturalWidth).toBeGreaterThan(0);
      expect(delivered.naturalWidth).toBe(delivered.naturalHeight);
      expect(delivered.mask).toBe('none');
      expect(delivered.filter).toBe('none');
      await expectFinishedPhoto(photo);
      const copy = await visual.evaluate((element) => {
        const zone = element.closest('[data-product-slug]');
        const heading = zone?.querySelector('.perfume-zone__heading');
        const description = zone?.querySelector('.perfume-zone__description');
        const purchase = zone?.querySelector('.perfume-zone__purchase');
        if (!zone || !heading || !description || !purchase)
          throw new Error('Cada fila necesita encabezado, descripción y compra.');
        const headingBottom = heading.getBoundingClientRect().bottom;
        const headerBottom =
          innerWidth < 640
            ? Math.max(headingBottom, element.getBoundingClientRect().bottom)
            : headingBottom;
        return {
          descriptionGap: description.getBoundingClientRect().top - headerBottom,
          purchaseGap:
            purchase.getBoundingClientRect().top - description.getBoundingClientRect().bottom,
        };
      });
      expect(copy.descriptionGap).toBeGreaterThanOrEqual(-1);
      expect(
        copy.descriptionGap,
        `${product.slug}: descripción próxima al título`,
      ).toBeLessThanOrEqual(20);
      expect(copy.purchaseGap).toBeGreaterThanOrEqual(-1);
      expect(copy.purchaseGap, `${product.slug}: precio sin hueco de relleno`).toBeLessThanOrEqual(
        24,
      );
    }
    const target = sizes.find((size) => size.slug === '9pm');
    if (!target) throw new Error('9PM debe estar presente como referencia de tamaño.');
    expect(target.width).toBeGreaterThan(0);
    expect(target.height).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(Math.abs(size.width - target.width), `${size.slug}: ancho`).toBeLessThanOrEqual(1);
      expect(Math.abs(size.height - target.height), `${size.slug}: alto`).toBeLessThanOrEqual(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
]) {
  test(`los títulos de una o dos líneas conservan su tipografía sin reservar huecos a ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const samples: { slug: string; fontSize: number; lineHeight: number }[] = [];
    for (const { slug } of products) {
      await page.goto(`/#libro/2/perfume/${slug}`);
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
      const zone = page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
      const heading = zone.locator('h4');
      const typography = await heading.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          height: element.getBoundingClientRect().height,
          lineHeight: Number.parseFloat(style.lineHeight),
          fontSize: Number.parseFloat(style.fontSize),
          overflow: element.scrollHeight - element.clientHeight,
        };
      });
      expect(typography.fontSize).toBeGreaterThanOrEqual(28);
      expect(typography.height).toBeLessThanOrEqual(typography.lineHeight * 2 + 2);
      expect(typography.overflow).toBeLessThanOrEqual(2);
      samples.push({ slug, fontSize: typography.fontSize, lineHeight: typography.lineHeight });
      const title = await heading.boundingBox();
      const headingBox = await zone.locator('.perfume-zone__heading').boundingBox();
      const description = await zone.locator('.perfume-zone__description').boundingBox();
      if (!title || !headingBox || !description)
        throw new Error('El título necesita su flujo real.');
      expect(headingBox.y + headingBox.height - title.y - title.height).toBeLessThanOrEqual(13);
      expect(description.y - title.y - title.height).toBeGreaterThanOrEqual(0);
      expect(description.y - title.y - title.height).toBeLessThanOrEqual(26);
      const product = products.find((item) => item.slug === slug);
      await expect(zone.locator('[data-inspired-reference]')).toHaveCount(
        product?.inspiredBy ? 1 : 0,
      );
      await expect(zone.locator('[data-reference-pending]')).toHaveCount(0);
      await expect(zone.getByText('Precio de oferta', { exact: true })).toHaveCount(0);
      await page.screenshot({
        path: testInfo.outputPath(`${slug}-${viewport.width}-shared-detail.png`),
      });
    }
    const reference = samples[0];
    if (!reference) throw new Error('Debe existir una plantilla común de título.');
    for (const sample of samples) {
      expect(sample.fontSize, sample.slug).toBe(reference.fontSize);
      expect(sample.lineHeight, sample.slug).toBe(reference.lineHeight);
    }
  });
}

for (const [ordinal, product] of products.entries()) {
  const face = Math.floor(ordinal / 2) + 1;
  const productName = product.displayName;
  const productNotes = [product.notes.top, product.notes.heart, product.notes.base].map((group) =>
    group.join(', '),
  );

  const zoneFor = (page: Page) =>
    page.locator(`[data-book-pages] [data-product-slug="${product.slug}"]`);

  async function focused(page: Page): Promise<Locator> {
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-editorial', 'true');
    const zone = zoneFor(page);
    await expect(zone).toHaveClass(/is-reading/);
    await expect(zone.locator('[data-book-reading]')).toBeVisible();
    return zone;
  }

  async function expectNativeScale(locator: Locator): Promise<void> {
    const pose = await locator.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
    });
    for (const [index, expected] of [1, 0, 0, 1, 0, 0].entries())
      expect(pose[index]).toBeCloseTo(expected, 3);
  }

  test(`${productName}: transforma sus elementos reales en una composición editorial a escala nativa`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const desktop = testInfo.project.name.startsWith('desktop');
    await page.setViewportSize(
      desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 },
    );
    await page.goto(`/#libro/${face}`);
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    const zone = zoneFor(page);
    await expect(page.locator('[data-editorial-detail]')).toHaveCount(products.length);
    await expect(zone).toHaveClass(/perfume-zone--editorial/);
    const source = zone.locator('[data-product-link]');
    await source.scrollIntoViewIfNeeded();
    const selectors = [
      '[data-product-visual]',
      '[data-product-visual] img',
      'h4',
      '.product-price__current',
    ];
    const originals = await Promise.all(
      selectors.map((selector) => zone.locator(selector).elementHandle()),
    );
    if (originals.some((element) => !element))
      throw new Error('Los elementos compartidos deben existir.');
    const overview = await zone.boundingBox();
    if (!product.generalImage || !product.detailImage)
      throw new Error('Cada perfume debe tener fotografías general y de detalle independientes.');
    expect(product.generalImage.src).not.toBe(product.detailImage.src);
    const photo = zone.locator('[data-product-visual] img');
    const detailSource = zone.locator('[data-product-visual] source[data-detail-image]');
    await expect(photo).toHaveCount(1);
    await expect(detailSource).toHaveCount(1);
    await expect(detailSource).toHaveAttribute('media', 'not all');
    await expectPhotoRole(photo, product.generalImage);
    await page.screenshot({ path: testInfo.outputPath(`${product.slug}-overview.png`) });
    await source.click();
    await focused(page);
    await expect(detailSource).toHaveAttribute('media', 'all');
    await expectPhotoRole(photo, product.detailImage);
    await expectFinishedPhoto(photo);
    for (const [index, selector] of selectors.entries()) {
      expect(
        await zone
          .locator(selector)
          .evaluate((current, original) => current === original, originals[index]),
      ).toBe(true);
      await expectNativeScale(zone.locator(selector));
    }
    await expectNativeScale(page.locator('[data-book-camera]'));
    await expect(zone.getByRole('heading', { name: productName, exact: true })).toBeVisible();
    await expect(zone.locator('[data-fragrance-notes] dd')).toHaveText(productNotes);
    await expectPublicPrices(zone, product);
    await expect(zone.getByText('Precio de oferta', { exact: true })).toHaveCount(0);
    const reference = zone.locator('[data-inspired-reference]');
    if (product.inspiredBy) {
      await expect(reference).toBeVisible();
      await expect(reference).toContainText(product.inspiredBy.name);
      await expect(reference.locator('.inspired-reference__label')).toHaveText(
        'Alternativa olfativa a',
      );
      await expect(reference.locator('.inspired-reference__notice')).toHaveCount(0);
      if (product.inspiredBy.image) {
        await expect(reference.locator('img')).toHaveCount(1);
        await expect(reference.locator('img')).toHaveAttribute('src', product.inspiredBy.image.src);
        await expect(reference.locator('img')).toHaveAttribute('alt', product.inspiredBy.image.alt);
        expect(product.inspiredBy.image.src).not.toBe(product.generalImage.src);
        expect(product.inspiredBy.image.src).not.toBe(product.detailImage.src);
        await reference.locator('img').evaluate(async (element) => {
          if (!(element instanceof HTMLImageElement))
            throw new Error('La referencia necesita una foto real.');
          element.loading = 'eager';
          await element.decode();
        });
        await expectFinishedPhoto(reference.locator('img'));
        const hero = await zone.locator('[data-product-visual] img').boundingBox();
        const comparison = await reference.locator('img').boundingBox();
        if (!hero || !comparison) throw new Error('Las fotografías deben tener dimensiones.');
        expect(hero.width * hero.height).toBeGreaterThan(comparison.width * comparison.height * 2);
        expect(comparison.height).toBeGreaterThanOrEqual(desktop ? 165 : 200);
      }
    } else {
      await expect(reference).toHaveCount(0);
    }
    await expect(zone.locator('[data-reference-pending]')).toHaveCount(0);
    const trust = zone.locator('[data-editorial-trust]');
    await expect(trust).toContainText('100% originales');
    await expect(trust).toContainText('Trujillo y Chiclayo');
    await expect(trust).toContainText('todo el Perú');
    if (desktop) {
      const hero = await zone.locator('[data-product-visual]').boundingBox();
      const title = await zone.locator('h4').boundingBox();
      const aside = await zone.locator('.perfume-reading__aside').boundingBox();
      if (!hero || !title || !aside) throw new Error('La composición debe tener tres zonas.');
      expect(hero.x + hero.width).toBeLessThanOrEqual(title.x + 2);
      expect(aside.x).toBeGreaterThan(title.x);
      const notes = await zone.locator('[data-fragrance-notes]').boundingBox();
      const benefits = await trust.boundingBox();
      if (!notes || !benefits)
        throw new Error('Las notas y los servicios deben tener espacio propio.');
      expect(notes.y + notes.height).toBeLessThanOrEqual(benefits.y + 2);
      for (const viewport of [
        { width: 1280, height: 720 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 },
      ]) {
        await page.setViewportSize(viewport);
        await focused(page);
        const paper = await zone.boundingBox();
        if (!paper) throw new Error('El detalle debe conservar su papel.');
        for (const selector of [
          'h4',
          '[data-product-visual]',
          '.product-price',
          '.perfume-zone__description',
          '.perfume-reading__facts',
          '[data-fragrance-notes]',
          ...(product.inspiredBy ? ['[data-inspired-reference]'] : []),
          '[data-editorial-trust]',
          '[data-order-open]',
          '.perfume-reading__order-note',
        ]) {
          const part = zone.locator(selector);
          const box = await part.boundingBox();
          if (!box) throw new Error(`${selector} debe tener espacio propio.`);
          await expect(part).toBeInViewport({ ratio: 0.98 });
          expect(box.y).toBeGreaterThanOrEqual(paper.y - 2);
          expect(box.y + box.height).toBeLessThanOrEqual(paper.y + paper.height + 2);
        }
        const noteBox = await zone.locator('[data-fragrance-notes]').boundingBox();
        if (!noteBox) throw new Error('Las notas deben ser legibles.');
        for (const selector of ['[data-editorial-trust]', '[data-order-open]']) {
          const other = await zone.locator(selector).boundingBox();
          if (!other) throw new Error('Compra y servicios necesitan espacio propio.');
          const overlapX =
            Math.min(noteBox.x + noteBox.width, other.x + other.width) -
            Math.max(noteBox.x, other.x);
          const overlapY =
            Math.min(noteBox.y + noteBox.height, other.y + other.height) -
            Math.max(noteBox.y, other.y);
          expect(
            overlapX <= 2 || overlapY <= 2,
            `Las notas no deben superponerse con ${selector}`,
          ).toBe(true);
        }
        for (const [first, second] of [
          ...(product.inspiredBy
            ? ([
                ['[data-inspired-reference]', '.perfume-reading__facts'],
                ['[data-inspired-reference]', '.perfume-reading__purchase'],
              ] as const)
            : []),
          ['.perfume-reading__facts', '.perfume-reading__purchase'],
        ] as const) {
          const a = await zone.locator(first).boundingBox();
          const b = await zone.locator(second).boundingBox();
          if (!a || !b) throw new Error('Cada bloque editorial debe reservar su espacio.');
          const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
          expect(
            overlapX <= 2 || overlapY <= 2,
            `${first} no debe superponerse con ${second}`,
          ).toBe(true);
        }
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.locator('[data-product-dialog], [data-product-detail]')).toHaveCount(0);
    await expect(page.locator('dialog[data-order-stage]')).toBeHidden();
    await page.screenshot({
      path: testInfo.outputPath(`${product.slug}-detail.png`),
      fullPage: true,
    });
    await page.locator('[data-book-return]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    await expect(source).toBeFocused();
    await expect(detailSource).toHaveAttribute('media', 'not all');
    await expectPhotoRole(photo, product.generalImage);
    const returned = await zone.boundingBox();
    if (!overview || !returned) throw new Error('El retorno debe recuperar la zona del libro.');
    for (const key of ['x', 'y', 'width', 'height'] as const)
      expect(Math.abs(overview[key] - returned[key])).toBeLessThanOrEqual(2);
    for (const original of originals) await original?.dispose();
  });

  test(`${productName}: la lectura móvil permite recorrer los detalles y comprar sin perder el contexto @a11y`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const viewport of [
      { width: 768, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 640 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`/#libro/${face}/perfume/${product.slug}`);
      const zone = await focused(page);
      let previousBottom = 0;
      for (const selector of [
        'h4',
        '[data-product-visual]',
        '.perfume-zone__description',
        '.product-price',
        '[data-fragrance-notes]',
        ...(product.inspiredBy ? ['[data-inspired-reference]'] : []),
        '[data-editorial-trust]',
        '[data-order-open]',
      ]) {
        const box = await zone.locator(selector).boundingBox();
        if (!box) throw new Error('El contenido móvil debe mantener su orden de lectura.');
        expect(box.y).toBeGreaterThanOrEqual(previousBottom - 2);
        previousBottom = box.y + box.height;
      }
      expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(
        true,
      );
      for (const selector of [
        'h4',
        '[data-product-visual]',
        '.product-price',
        '[data-fragrance-notes]',
        ...(product.inspiredBy ? ['[data-inspired-reference]'] : []),
        '[data-editorial-trust]',
        '[data-order-open]',
      ]) {
        const part = zone.locator(selector);
        await part.scrollIntoViewIfNeeded();
        await expect(part).toBeInViewport({ ratio: 0.98 });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const buy = zone.locator('[data-order-open]');
      await buy.click();
      const dialog = page.locator('dialog[data-order-stage]');
      await expect(dialog).toBeVisible();
      // Clicking may reveal the control above the sticky return bar before opening.
      const scrollBefore = await page.evaluate(() => scrollY);
      await expect(dialog.locator('select[name="productSlug"]')).toHaveValue(product.slug);
      const box = await dialog.boundingBox();
      if (!box) throw new Error('La compra debe abrir un modal compacto.');
      expect(box.width).toBeLessThanOrEqual(Math.min(480, viewport.width - 16));
      await page.keyboard.press('Escape');
      await focused(page);
      await expect(dialog).toBeHidden();
      await expect(buy).toBeFocused();
      expect(Math.abs((await page.evaluate(() => scrollY)) - scrollBefore)).toBeLessThanOrEqual(2);
      if (viewport.width === 320) {
        const audit = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
      await page.locator('[data-book-return]').click();
      await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
      await expect(zone.locator('[data-product-link]')).toBeFocused();
      expect(await page.evaluate(() => scrollY)).toBe(0);
    }
  });

  test(`${productName}: la transición y su reversa conservan nodos y terminan sin transformaciones residuales`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/#libro/${face}`);
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    for (const direction of ['focus', 'return'] as const) {
      const samples = await page.evaluate(
        ({ direction, slug }) =>
          new Promise<
            { time: number; phase: string; x: number; y: number; width: number; height: number }[]
          >((resolve, reject) => {
            const root = document.querySelector<HTMLElement>('[data-book-root]');
            const visual = document.querySelector<HTMLElement>(
              `[data-product-slug="${slug}"] [data-product-visual]`,
            );
            const action = document.querySelector<HTMLElement>(
              direction === 'focus'
                ? `[data-product-slug="${slug}"] [data-product-link]`
                : '[data-book-return]',
            );
            if (!root || !visual || !action)
              return reject(new Error('La escena debe estar lista.'));
            const done = direction === 'focus' ? 'focused' : 'browsing';
            const started = performance.now();
            const samples: {
              time: number;
              phase: string;
              x: number;
              y: number;
              width: number;
              height: number;
            }[] = [];
            action.click();
            const sample = () => {
              const rect = visual.getBoundingClientRect();
              samples.push({
                time: performance.now() - started,
                phase: root.dataset['bookPhase'] ?? '',
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              });
              if (root.dataset['bookPhase'] === done && samples.length > 2) resolve(samples);
              else if (performance.now() - started > 5000)
                reject(new Error('La transición debe terminar.'));
              else requestAnimationFrame(sample);
            };
            requestAnimationFrame(sample);
          }),
        { direction, slug: product.slug },
      );
      expect(samples.length).toBeGreaterThan(10);
      for (const sample of samples) {
        for (const value of [sample.x, sample.y, sample.width, sample.height])
          expect(Number.isFinite(value)).toBe(true);
        expect(sample.x).toBeGreaterThanOrEqual(-2);
        expect(sample.y).toBeGreaterThanOrEqual(-2);
        expect(sample.x + sample.width).toBeLessThanOrEqual(1442);
        expect(sample.y + sample.height).toBeLessThanOrEqual(902);
      }
      await testInfo.attach(`${product.slug}-${direction}-frames`, {
        body: JSON.stringify(samples, null, 2),
        contentType: 'application/json',
      });
      await expectNativeScale(page.locator('[data-book-camera]'));
      await expectNativeScale(zoneFor(page).locator('[data-product-visual]'));
      await expect(page.locator('.book-turn')).toHaveCount(0);
    }
    await expect(zoneFor(page).locator('[data-product-link]')).toBeFocused();
  });

  test(`${productName}: resize, recarga e interrupción de movimiento mantienen el detalle y limpian su altura al volver`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/#libro/${face}`);
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    await zoneFor(page).locator('[data-product-link]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focusing');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await focused(page);
    for (const viewport of [
      { width: 320, height: 640 },
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await focused(page);
      await expectNativeScale(page.locator('[data-book-camera]'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator('[data-book-return]')).toBeInViewport({ ratio: 1 });
    }
    await page.reload();
    await focused(page);
    await zoneFor(page).locator('[data-order-open]').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    const root = page.locator('[data-book-root]');
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(root).toHaveAttribute('data-book-editorial', 'false');
    await expect(zoneFor(page).locator('[data-product-link]')).toBeFocused();
    expect(
      await root.evaluate((element) => element.style.getPropertyValue('--editorial-height')),
    ).toBe('');
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('.book-turn')).toHaveCount(0);
  });
}
