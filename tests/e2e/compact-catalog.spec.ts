import { expect, test, type Locator, type Page, type TestInfo } from './fixtures';
import { products } from '../../src/features/catalog/data/products';

const perfumes = products
  .filter((product) => product.status === 'published')
  .sort((a, b) => a.order - b.order);
const names = new Map([
  ['9pm', '9PM'],
  ['hawas-ice', 'Hawas Ice'],
  ['mandarine', 'Mandarin Sky'],
  ['khamrah-qahwa', 'Khamrah Qahwa'],
  ['hawas-malibu', 'Hawas Malibu'],
  ['royale-opal', 'Royale Opal'],
]);
const rightColumn = [
  '.perfume-zone__brand',
  'h4',
  '.perfume-zone__description',
  '.product-price',
  '.perfume-zone__explore',
] as const;

async function press(control: Locator, info: TestInfo): Promise<void> {
  await control.scrollIntoViewIfNeeded();
  if (info.project.use.hasTouch) await control.tap();
  else await control.click();
}

async function expectCompactRow(
  zone: Locator,
  slug: string,
): Promise<{ width: number; height: number }> {
  await zone.scrollIntoViewIfNeeded();
  await expect(zone.locator('source[data-detail-image]')).toHaveAttribute('media', 'not all');
  const image = zone.locator('[data-product-visual] img');
  await image.evaluate(async (element) => {
    if (!(element instanceof HTMLImageElement))
      throw new Error('The real product photo is required.');
    element.loading = 'eager';
    await element.decode();
  });
  const layout = await zone.evaluate((element, selectors) => {
    const rect = (node: Element) => {
      const box = node.getBoundingClientRect();
      return {
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };
    const photo = element.querySelector('[data-product-visual]');
    if (!photo) throw new Error('The photograph must keep its own frame.');
    return {
      row: rect(element),
      photo: rect(photo),
      copy: selectors.map((selector) => {
        const node = element.querySelector<HTMLElement>(selector);
        if (!node) throw new Error(`Missing compact catalogue content: ${selector}`);
        return {
          selector,
          ...rect(node),
          clipped:
            node.scrollWidth > node.clientWidth + 2 || node.scrollHeight > node.clientHeight + 2,
        };
      }),
    };
  }, rightColumn);
  expect(
    Math.abs(layout.photo.width - layout.photo.height),
    `${slug}: square complete photo`,
  ).toBeLessThanOrEqual(1);
  expect(layout.photo.width, `${slug}: photo remains visible`).toBeGreaterThan(80);
  for (const part of [layout.photo, ...layout.copy]) {
    expect(part.left, slug).toBeGreaterThanOrEqual(layout.row.left - 1);
    expect(part.right, slug).toBeLessThanOrEqual(layout.row.right + 1);
    expect(part.top, slug).toBeGreaterThanOrEqual(layout.row.top - 1);
    expect(part.bottom, slug).toBeLessThanOrEqual(layout.row.bottom + 1);
  }
  for (const [index, part] of layout.copy.entries()) {
    const message = `${slug}: ${part.selector} stays with the right column`;
    expect(part.left, message).toBeGreaterThanOrEqual(layout.photo.right + 4);
    expect(part.width, message).toBeGreaterThan(0);
    expect(part.height, message).toBeGreaterThan(0);
    expect(part.clipped, message).toBe(false);
    const previous = layout.copy[index - 1];
    if (previous)
      expect(part.top, `${slug}: reading order does not overlap`).toBeGreaterThanOrEqual(
        previous.bottom - 1,
      );
    const locator = zone.locator(part.selector);
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toBeInViewport({ ratio: 0.98 });
  }
  const action = layout.copy.at(-1);
  if (!action) throw new Error('The row must retain its Explore action.');
  expect(
    layout.row.bottom - action.bottom,
    `${slug}: Explore clears the separator`,
  ).toBeGreaterThanOrEqual(6);
  await expect(image).toHaveCSS('object-fit', 'contain');
  return { width: layout.photo.width, height: layout.photo.height };
}

async function exercise(
  page: Page,
  viewport: { width: number; height: number },
  info: TestInfo,
  capture: boolean,
): Promise<void> {
  const root = page.locator('[data-book-root]');
  const sizes: { slug: string; width: number; height: number }[] = [];
  for (const [index, perfume] of perfumes.entries()) {
    const face = Math.floor(index / 2) + 1;
    const zone = page.locator(`[data-book-pages] [data-product-slug="${perfume.slug}"]`);
    const title = zone.locator('h4');
    const shortName = names.get(perfume.slug);
    if (!shortName) throw new Error('Every published perfume needs its approved overview name.');
    await expect(title).toHaveText(shortName);
    await expect(title).toHaveAttribute('id', `nombre-${perfume.slug}`);
    await expect(zone.locator('[data-product-link]')).toHaveAttribute(
      'href',
      `/#libro/${face}/perfume/${perfume.slug}`,
    );
    sizes.push({ slug: perfume.slug, ...(await expectCompactRow(zone, perfume.slug)) });
    if (index % 2 === 0) {
      await expect(page.locator('[data-book-leaf]:visible [data-product-slug]')).toHaveCount(2);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      if (viewport.width >= 360 && viewport.height >= 680) {
        await expect(page.locator('[data-book-camera]')).toBeInViewport({ ratio: 0.99 });
        await expect(page.locator('[data-book-controls]')).toBeInViewport({ ratio: 0.99 });
      }
      if (capture) {
        const path = info.outputPath(`compact-${viewport.width}-page-${face}.png`);
        await page.screenshot({ path, fullPage: true });
        await info.attach(`compact-${viewport.width}-page-${face}`, {
          path,
          contentType: 'image/png',
        });
      }
    }
    const originalTitle = await title.elementHandle();
    await press(zone.locator('[data-product-link]'), info);
    await expect(root).toHaveAttribute('data-book-phase', 'focused');
    await expect(title).toHaveText(perfume.displayName);
    await expect(page.locator('[data-book-focused-name]')).toHaveText(perfume.displayName);
    await expect(zone.locator('.perfume-zone__brand')).toHaveText(
      perfume.brand?.name ?? 'Marca por confirmar',
    );
    const variant = perfume.variants[0];
    if (!variant?.capacityMl || !variant.price)
      throw new Error('The fixture needs confirmed commercial data.');
    await expect(zone.locator('.perfume-reading__facts')).toContainText(`${variant.capacityMl} ml`);
    await expect(zone.locator('.product-price__current')).toHaveAttribute(
      'value',
      (variant.price.amountInCents / 100).toFixed(2),
    );
    expect(await title.evaluate((element, original) => element === original, originalTitle)).toBe(
      true,
    );
    await press(zone.locator('[data-order-open]'), info);
    await expect(root).toHaveAttribute('data-book-phase', 'ordering');
    const select = page.locator('[data-order-form] select[name="productSlug"]');
    await expect(select).toHaveValue(perfume.slug);
    await expect(select.locator('option:checked')).toHaveText(perfume.displayName);
    await press(page.locator('[data-order-close]'), info);
    await expect(root).toHaveAttribute('data-book-phase', 'focused');
    await press(page.locator('[data-book-return]'), info);
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(title).toHaveText(shortName);
    expect(await title.evaluate((element, original) => element === original, originalTitle)).toBe(
      true,
    );
    await originalTitle?.dispose();
    if (index % 2 === 1 && index < perfumes.length - 1) {
      await press(page.locator('[data-book-next]'), info);
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await expect(page).toHaveURL(new RegExp(`#libro/${face + 1}$`));
      await expect(page.locator('.book-turn')).toHaveCount(0);
    }
  }
  const target = sizes[0];
  if (!target) throw new Error('The catalogue must contain six photographs.');
  for (const size of sizes) {
    expect(
      Math.abs(size.width - target.width),
      `${size.slug}: uniform photo width`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(size.height - target.height),
      `${size.slug}: uniform photo height`,
    ).toBeLessThanOrEqual(1);
  }
  await expect(page.locator('.book-footer .trust-strip li')).toHaveCount(3);
  await expect(page.locator('.book-footer')).toContainText('100% originales');
  await expect(page.locator('.book-footer')).toContainText('Trujillo y Chiclayo');
  await expect(page.locator('.book-footer')).toContainText('todo el Perú');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await info.attach('compact-photo-sizes', {
    body: JSON.stringify(sizes, null, 2),
    contentType: 'application/json',
  });
}

for (const viewport of [
  { width: 360, height: 680 },
  { width: 360, height: 740 },
  { width: 393, height: 745 },
  { width: 390, height: 760 },
  { width: 430, height: 932 },
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
]) {
  test(`catálogo compacto ${viewport.width}×${viewport.height}: foto izquierda, todo el texto a la derecha y nombres por vista`, async ({
    page,
  }, info) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#libro/1');
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    await page.evaluate(() => document.fonts.ready);
    await exercise(page, viewport, info, true);
  });
}

test('el movimiento normal conserva el mismo título y restaura el nombre corto al volver', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const viewport = { width: 390, height: 760 };
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('[data-book-root]')).toHaveClass(/is-enhanced/);
  await press(page.locator('[data-book-open]'), info);
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
  await exercise(page, viewport, info, false);
});
