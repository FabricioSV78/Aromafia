import { expect, test, type Page } from './fixtures';
import { contact } from '../../src/config/contact';
import { products } from '../../src/features/catalog/data/products';
import { expectPublicPrices } from './catalog-assertions';

const perfumes = [
  { slug: '9pm', name: '9 pm', cents: 15_000 },
  { slug: 'hawas-ice', name: 'Hawas Ice 100ml', cents: 18_500 },
  { slug: 'mandarine', name: 'Odyssey Mandarin Sky', cents: 14_900 },
  { slug: 'khamrah-qahwa', name: 'Khamrah Qahwa', cents: 16_000 },
  { slug: 'hawas-malibu', name: 'Hawas Malibu', cents: 18_900 },
  { slug: 'royale-opal', name: 'Zakat Royale Opal', cents: 11_500 },
];
const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

async function ready(page: Page): Promise<void> {
  await expect(page.locator('[data-book-root]')).toHaveClass(/is-enhanced/);
}

async function settled(page: Page): Promise<void> {
  await expect(page.locator('[data-book-root]')).not.toHaveAttribute('data-book-busy', 'true');
}

async function openBook(page: Page): Promise<void> {
  await page.goto('/');
  await ready(page);
  await page.locator('[data-book-open]').scrollIntoViewIfNeeded();
  const closedBounds = await page.locator('[data-book-camera]').boundingBox();
  if (!closedBounds) throw new Error('El libro cerrado debe reservar su geometría.');
  await page.locator('[data-book-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-mode', 'open');
  await settled(page);
  const openedBounds = await page.locator('[data-book-camera]').boundingBox();
  if (!openedBounds) throw new Error('El libro abierto debe conservar su geometría.');
  for (const key of ['x', 'y', 'width', 'height'] as const)
    expect(Math.abs(openedBounds[key] - closedBounds[key])).toBeLessThanOrEqual(1);
}

test('parte de una portada cerrada y la abre con movimiento de libro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await ready(page);
  const root = page.locator('[data-book-root]');
  const cover = page.locator('[data-book-cover]');
  await expect(root).toHaveAttribute('data-book-mode', 'closed');
  await expect(page.locator('[data-book-leaf]:visible')).toHaveCount(0);
  const before = await cover.evaluate((element) => getComputedStyle(element).transform);
  await page.locator('[data-book-open]').click();
  await expect(root).toHaveAttribute('data-book-busy', 'true');
  await expect
    .poll(() => cover.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before);
  await expect(root).toHaveAttribute('data-book-mode', 'open');
  await settled(page);
  await expect(cover).toBeHidden();
  expect(
    await page
      .locator('[data-book-pages]')
      .evaluate((element) => getComputedStyle(element).opacity),
  ).toBe('1');
  await expect(page).toHaveURL(/#libro\/1$/);
  await expect(page.locator('[data-book-prev]')).toBeDisabled();
  await expect(page.locator('[data-book-next]')).toBeEnabled();
  await page.locator('[data-book-next]').click();
  const turning = page.locator('.book-turn');
  await expect(turning).toBeAttached();
  await expect.poll(() => turning.getAttribute('style')).toMatch(/rotateY/);
  await settled(page);
  await expect(turning).toHaveCount(0);
  await page.locator('[data-book-close]').click();
  await expect(root).toHaveAttribute('data-book-busy', 'true');
  await settled(page);
  await expect(root).toHaveAttribute('data-book-mode', 'closed');
  await expect(page.locator('[data-book-open]')).toBeFocused();
  await expect(page.locator('[data-book-pages]')).toBeHidden();
  await expect(cover).toBeVisible();
  await page.locator('[data-book-open]').click();
  await settled(page);
  await expect(root).toHaveAttribute('data-book-phase', 'browsing');
  await expect(cover).toBeHidden();
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await page.locator('[data-book-close]').click();
  await settled(page);
  await expect(root).toHaveAttribute('data-book-phase', 'closed');
  await expect(cover).toBeVisible();
});

test('recorre tres caras con dos perfumes y una contraportada, sin duplicar productos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const leaves = page.locator('[data-book-leaf]');
  await expect(leaves).toHaveCount(4);
  const productLeaves = leaves.filter({ has: page.locator('[data-product-slug]') });
  await expect(productLeaves).toHaveCount(3);
  for (const leaf of await productLeaves.all())
    await expect(leaf.locator('[data-product-slug]')).toHaveCount(2);
  await expect(leaves.filter({ hasNot: page.locator('[data-product-slug]') })).toHaveCount(1);
  const zones = page.locator('[data-book-pages] [data-product-slug]');
  await expect(zones).toHaveCount(6);
  expect(
    await zones.evaluateAll((items) => items.map((item) => item.getAttribute('data-product-slug'))),
  ).toEqual(perfumes.map((perfume) => perfume.slug));
  const seen = new Set<string>();
  const step = await page.evaluate(() => (matchMedia('(min-width: 56rem)').matches ? 2 : 1));
  for (let index = 0; index < 4; index += step) {
    await expect(page).toHaveURL(new RegExp(`#libro/${index + 1}$`));
    const visible = page.locator('[data-book-leaf]:visible');
    await expect(visible).toHaveCount(step);
    const visibleProducts = visible.locator('[data-product-slug]');
    await expect(visibleProducts).toHaveCount(Math.min(step, Math.max(0, 3 - index)) * 2);
    for (const zone of await visibleProducts.all()) {
      const slug = await zone.getAttribute('data-product-slug');
      const perfume = perfumes.find((item) => item.slug === slug);
      if (!perfume) throw new Error('Zona visible sin producto conocido.');
      seen.add(perfume.slug);
      await expect(zone.getByRole('heading', { name: perfume.name, exact: true })).toBeVisible();
      await expect(zone).toContainText(currency.format(perfume.cents / 100));
      const product = products.find((item) => item.slug === slug);
      const image = product?.generalImage;
      if (!product?.brand || !product.shortDescription || !image)
        throw new Error('Cada producto público necesita los datos verificados y su fotografía.');
      await expect(zone.locator('[data-product-visual] img')).toHaveAttribute('src', image.src);
      await expect(zone.locator('[data-product-visual] img')).toHaveAttribute('alt', image.alt);
      await expect
        .poll(() =>
          zone
            .locator('[data-product-visual] img')
            .evaluate(
              (element) =>
                element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
            ),
        )
        .toBe(true);
      await expect(zone.locator('.perfume-zone__brand')).toHaveText(product.brand.name);
      await expect(zone.locator('.perfume-zone__description')).toHaveText(product.shortDescription);
      await expectPublicPrices(zone, product);
      await expect(zone.locator('[data-product-link]').first()).toHaveAttribute(
        'href',
        `/#libro/${Math.floor(perfumes.indexOf(perfume) / 2) + 1}/perfume/${perfume.slug}`,
      );
    }
    if (index + step < 4) {
      await page.locator('[data-book-next]').click();
      await settled(page);
    }
  }
  expect([...seen]).toEqual(perfumes.map((perfume) => perfume.slug));
  await expect(page.locator('[data-book-next]')).toBeDisabled();
  await expect(page.locator('[data-order-stage]')).toBeHidden();
  await expect(page.locator('dialog[data-order-stage]')).toHaveCount(1);
  expect(
    await page
      .locator('dialog[data-order-stage]')
      .evaluate((element) => element instanceof HTMLDialogElement && element.open),
  ).toBe(false);
  await expect(page.locator('[data-product-dialog]')).toHaveCount(0);
});

test('las hojas inactivas no ofrecen foco ni contenido al lector de pantalla', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const inactive = page.locator('[data-book-leaf][hidden]');
  expect(await inactive.count()).toBeGreaterThan(0);
  for (const leaf of await inactive.all()) {
    expect(await leaf.evaluate((element) => element instanceof HTMLElement && element.inert)).toBe(
      true,
    );
  }
  await page.locator('[data-book-leaf]:visible [data-product-link]').first().focus();
  await page.keyboard.press('ArrowRight');
  await settled(page);
  await expect(page.locator('[data-book-status]')).not.toHaveText('');
  const focusOnVisibleLeaf = await page.evaluate(() => {
    const leaf = document.activeElement?.closest('[data-book-leaf]');
    return leaf instanceof HTMLElement && !leaf.hidden && !leaf.inert;
  });
  expect(focusOnVisibleLeaf).toBe(true);
});

test('restaura página al recargar y puede regresar a la portada', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#libro/3');
  await ready(page);
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-mode', 'open');
  await settled(page);
  await expect(page.locator('[data-product-slug="hawas-malibu"]')).toBeVisible();
  await page.reload();
  await ready(page);
  await settled(page);
  await expect(page.locator('[data-product-slug="hawas-malibu"]')).toBeVisible();
  await page.locator('[data-book-close]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-mode', 'closed');
  await settled(page);
  await expect(page.locator('[data-book-open]')).toBeVisible();
  await expect(page.locator('[data-book-leaf]:visible')).toHaveCount(0);
});

test('mantiene una vista en tamaños habituales y permite lectura sin recortes en móviles cortos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await openBook(page);
    const visible = page.locator('[data-book-leaf]:visible');
    await expect(visible).toHaveCount(viewport.width >= 896 ? 2 : 1);
    await expect(visible.locator('[data-product-slug]')).toHaveCount(viewport.width >= 896 ? 4 : 2);
    const rootBox = await page.locator('[data-book-root]').boundingBox();
    if (!rootBox) throw new Error('El libro debe ocupar un espacio en la vista.');
    if (viewport.width >= 896 && viewport.height >= 720)
      expect(rootBox.height).toBeLessThanOrEqual(viewport.height + 2);
    const bounds = await page.locator('[data-book-viewport]').boundingBox();
    if (!bounds) throw new Error('El escenario del libro debe estar presente.');
    expect(bounds.y).toBeGreaterThanOrEqual(-1);
    if (viewport.width >= 896 && viewport.height >= 720)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
    if (viewport.width === 1440) {
      const book = await page.locator('[data-book-camera]').boundingBox();
      if (!book) throw new Error('El libro debe ocupar el escenario disponible.');
      expect(book.width).toBeGreaterThan(1040);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (viewport.width >= 896 && viewport.height >= 720)
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
      ).toBe(true);
    await page.locator('[data-book-next]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-book-next]')).toBeInViewport();
  }
});

test('las fotografías, nombres y precios caben en sus filas en todas las caras del catálogo', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [
    { width: 1650, height: 954 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#libro/1');
    await ready(page);
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    await page.evaluate(() => document.fonts.ready);
    const seen = new Set<string>();
    for (let opening = 0; opening < 4; opening++) {
      for (const zone of await page.locator('[data-book-leaf]:visible [data-product-slug]').all()) {
        const slug = await zone.getAttribute('data-product-slug');
        if (!slug) throw new Error('Cada fila debe identificar su perfume.');
        seen.add(slug);
        const context = `${viewport.width}×${viewport.height}, ${slug}`;
        if (viewport.width < 896 || viewport.height < 720) await zone.scrollIntoViewIfNeeded();
        const row = await zone.boundingBox();
        if (!row) throw new Error(`${context}: la fila debe reservar espacio.`);
        const parts = [
          zone.locator('[data-product-visual]'),
          zone.locator('h4'),
          zone.locator('.product-price__current'),
          zone.locator('.perfume-zone__overview-cue'),
        ];
        for (const part of parts) {
          if (viewport.width < 896) await part.scrollIntoViewIfNeeded();
          await expect(part, context).toBeInViewport({ ratio: 0.98 });
          const bounds = await part.boundingBox();
          if (!bounds) throw new Error(`${context}: imagen y texto deben tener geometría visible.`);
          expect(bounds.x, context).toBeGreaterThanOrEqual(row.x - 1);
          expect(bounds.y, context).toBeGreaterThanOrEqual(row.y - 1);
          expect(bounds.x + bounds.width, context).toBeLessThanOrEqual(row.x + row.width + 1);
          expect(bounds.y + bounds.height, context).toBeLessThanOrEqual(row.y + row.height + 1);
        }
        const geometry = await zone.evaluate((element) => {
          const heading = element.querySelector('h4');
          const price = element.querySelector('.product-price__current');
          const visual = element.querySelector('[data-product-visual]');
          if (!heading || !price || !visual)
            throw new Error('La fila requiere foto, nombre y precio.');
          const nameBounds = heading.getBoundingClientRect();
          const priceBounds = price.getBoundingClientRect();
          const photoBounds = visual.getBoundingClientRect();
          return {
            nameFontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
            priceFontSize: Number.parseFloat(getComputedStyle(price).fontSize),
            nameBottom: nameBounds.bottom,
            priceTop: priceBounds.top,
            textLeft: nameBounds.left,
            photoRight: photoBounds.right,
            headingClipped: heading.scrollWidth > heading.clientWidth + 1,
          };
        });
        expect(geometry.nameFontSize, context).toBeGreaterThanOrEqual(18);
        expect(geometry.priceFontSize, context).toBeGreaterThanOrEqual(20);
        expect(geometry.nameBottom, context).toBeLessThanOrEqual(geometry.priceTop);
        expect(geometry.photoRight, context).toBeLessThanOrEqual(geometry.textLeft + 1);
        expect(geometry.headingClipped, context).toBe(false);
      }
      const next = page.locator('[data-book-next]');
      if (await next.isDisabled()) break;
      await next.click();
      await settled(page);
    }
    expect(
      [...seen],
      `${viewport.width}×${viewport.height}: deben poder leerse los seis perfumes`,
    ).toEqual(perfumes.map((perfume) => perfume.slug));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (viewport.width >= 896 && viewport.height >= 720)
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2),
      ).toBe(true);
  }
});

test('movimiento reducido conserva navegación y elimina animaciones', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const engineRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/(?:gsap|ScrollTrigger)[^/]*\.js(?:\?|$)/i.test(request.url()))
      engineRequests.push(request.url());
  });
  await openBook(page);
  await page.locator('[data-book-next]').click();
  await settled(page);
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  expect(engineRequests).toEqual([]);
});

test('los controles siguen estables después de pulsaciones rápidas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page);
  const next = page.locator('[data-book-next]');
  await next.click();
  await next.evaluate((button) => {
    if (button instanceof HTMLButtonElement) {
      button.click();
      button.click();
    }
  });
  await settled(page);
  const step = await page.evaluate(() => (matchMedia('(min-width: 56rem)').matches ? 2 : 1));
  const visible = page.locator('[data-book-leaf]:visible');
  await expect(visible).toHaveCount(step);
  const hash = new URL(page.url()).hash;
  expect(hash).toMatch(/^#libro\/[1-4]$/);
  expect(await page.locator('[data-book-status]').textContent()).not.toBe('');
  await page.locator('[data-book-prev]').click();
  await settled(page);
  await expect(page.locator('[data-book-leaf]:visible')).toHaveCount(step);
});

test('un gesto horizontal pasa la hoja y los gestos verticales o cancelados la conservan', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  const viewport = page.locator('[data-book-viewport]');
  const box = await viewport.boundingBox();
  if (!box) throw new Error('La superficie del libro debe estar presente.');
  const origin = { clientX: box.x + box.width * 0.65, clientY: box.y + box.height * 0.55 };
  const pointer = { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0 };
  const gesture = async (dx: number, dy: number, cancel = false) => {
    await viewport.dispatchEvent('pointerdown', { ...pointer, ...origin, buttons: 1 });
    if (cancel) await viewport.dispatchEvent('pointercancel', { ...pointer, ...origin });
    await viewport.dispatchEvent('pointerup', {
      ...pointer,
      clientX: origin.clientX + dx,
      clientY: origin.clientY + dy,
      buttons: 0,
    });
  };
  await gesture(-100, 0);
  const nextPage = await page.evaluate(() => (matchMedia('(min-width: 56rem)').matches ? 3 : 2));
  await expect(page).toHaveURL(new RegExp(`#libro/${nextPage}$`));
  await settled(page);
  await gesture(0, 100);
  await expect(page).toHaveURL(new RegExp(`#libro/${nextPage}$`));
  await gesture(100, 0, true);
  await expect(page).toHaveURL(new RegExp(`#libro/${nextPage}$`));
  await gesture(100, 0);
  await expect(page).toHaveURL(/#libro\/1$/);
});

test('activar movimiento reducido durante un giro asienta la página y conserva los controles', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page);
  await page.locator('[data-book-next]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-busy', 'true');
  await expect(page.locator('.book-turn')).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  for (const leaf of await page.locator('[data-book-leaf]:visible').all()) {
    expect(await leaf.evaluate((element) => element instanceof HTMLElement && element.inert)).toBe(
      false,
    );
  }
  await page.locator('[data-book-prev]').click();
  await expect(page).toHaveURL(/#libro\/1$/);
  await expect(page.locator('[data-product-slug="9pm"]')).toBeVisible();
});

test('Atrás y Adelante restauran la apertura del libro sin perder su página', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page);
  await page.locator('[data-book-next]').click();
  await settled(page);
  const advanced = page.url();
  await page.goBack();
  await expect(page).toHaveURL(/#libro\/1$/);
  await expect(page.locator('[data-product-slug="9pm"]')).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(advanced);
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-mode', 'open');
});

test('mantiene los contactos confirmados sin abrir conversaciones', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  for (const channel of [contact.instagram, contact.facebook, contact.tiktok]) {
    const link = page.getByRole('banner').getByRole('link', { name: channel.label, exact: true });
    await expect(link).toHaveAttribute('href', channel.href);
  }
  await expect(page.getByRole('contentinfo').getByRole('link')).toHaveCount(0);
  await expect(page.locator('header a[href="' + contact.whatsapp.href + '"]')).toHaveCount(1);
});
