import { expect, test, type Locator, type Page, type TestInfo } from './fixtures';
import { products } from '../../src/features/catalog/data/products';

const perfumes = products
  .filter((product) => product.status === 'published')
  .sort((a, b) => a.order - b.order);
const rootSelector = '[data-book-root]';
const cardParts = [
  '[data-product-visual]',
  '.perfume-zone__heading',
  '.perfume-zone__description',
  '.product-price',
  '.perfume-zone__explore',
] as const;

async function press(control: Locator, testInfo: TestInfo): Promise<void> {
  await control.scrollIntoViewIfNeeded();
  if (testInfo.project.use.hasTouch) await control.tap();
  else await control.click();
}

async function prepare(
  page: Page,
  viewport: { width: number; height: number },
  leaf = 1,
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/#libro/${leaf}`);
  await expect(page.locator(rootSelector)).toHaveAttribute('data-book-phase', 'browsing');
  await page.evaluate(() => document.fonts.ready);
}

/** Enlarged text may make a whole notes/reference block taller than the screen. */
async function expectReachable(part: Locator, context: string): Promise<void> {
  expect(
    await part.evaluate((element) => element.scrollWidth <= element.clientWidth + 2),
    `${context}: content must reflow horizontally.`,
  ).toBe(true);
  const available = await part.evaluate(() => innerHeight);
  const box = await part.boundingBox();
  if (!box) throw new Error(`${context}: readable content must have geometry.`);
  if (box.height * 0.95 <= available) {
    await part.scrollIntoViewIfNeeded();
    await expect(part).toBeInViewport({ ratio: 0.95 });
    return;
  }
  // Read every meaningful child instead of requiring an oversized section in one frame.
  const children = part.locator(
    'dt, dd, h3, h4, p, img, .product-price__reference, .product-price__current',
  );
  expect(
    await children.count(),
    `${context}: a tall block needs reachable reading parts.`,
  ).toBeGreaterThan(0);
  for (const [index, child] of (await children.all()).entries()) {
    await expectReachable(child, `${context}: reading part ${index + 1}`);
  }
}

async function expectCard(zone: Locator): Promise<void> {
  await zone.scrollIntoViewIfNeeded();
  const image = zone.locator('[data-product-visual] img');
  await image.evaluate(async (element) => {
    if (!(element instanceof HTMLImageElement)) throw new Error('A product needs its real photo.');
    await element.decode();
  });
  const layout = await zone.evaluate((element, selectors) => {
    const bounds = element.getBoundingClientRect();
    const parts = selectors.map((selector) => {
      const node = element.querySelector<HTMLElement>(selector);
      if (!node) throw new Error(`Missing catalogue content: ${selector}`);
      const rectangle = node.getBoundingClientRect();
      return {
        selector,
        left: rectangle.left,
        top: rectangle.top,
        right: rectangle.right,
        bottom: rectangle.bottom,
        width: rectangle.width,
        height: rectangle.height,
        clipped:
          node.scrollWidth > node.clientWidth + 2 || node.scrollHeight > node.clientHeight + 2,
      };
    });
    return {
      slug: element.getAttribute('data-product-slug'),
      left: bounds.left,
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.bottom,
      parts,
    };
  }, cardParts);
  for (const part of layout.parts) {
    const context = `${layout.slug}: ${part.selector}`;
    expect(part.width, context).toBeGreaterThan(0);
    expect(part.height, context).toBeGreaterThan(0);
    expect(part.left, context).toBeGreaterThanOrEqual(layout.left - 1);
    expect(part.top, context).toBeGreaterThanOrEqual(layout.top - 1);
    expect(part.right, context).toBeLessThanOrEqual(layout.right + 1);
    expect(part.bottom, context).toBeLessThanOrEqual(layout.bottom + 1);
    expect(part.clipped, context).toBe(false);
  }
  for (const [index, first] of layout.parts.entries()) {
    for (const second of layout.parts.slice(index + 1)) {
      const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
      const overlapHeight = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
      expect(
        overlapWidth > 1 && overlapHeight > 1,
        `${layout.slug}: ${first.selector} overlaps ${second.selector}`,
      ).toBe(false);
    }
  }
  const photograph = layout.parts.find((part) => part.selector === '[data-product-visual]');
  const action = layout.parts.find((part) => part.selector === '.perfume-zone__explore');
  if (!photograph || !action) throw new Error('The catalogue must retain its photo and action.');
  expect(
    Math.abs(photograph.width - photograph.height),
    `${layout.slug}: complete square photo`,
  ).toBeLessThanOrEqual(1);
  expect(
    layout.bottom - action.bottom,
    `${layout.slug}: action clears the next separator`,
  ).toBeGreaterThanOrEqual(10);
  await expect(image).toHaveCSS('object-fit', 'contain');
  for (const selector of cardParts) {
    await expectReachable(zone.locator(selector), `${layout.slug}: ${selector}`);
  }
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    'The document must not need horizontal scrolling.',
  ).toBe(true);
}

async function expectDetailAndPurchase(
  page: Page,
  zone: Locator,
  slug: string,
  testInfo: TestInfo,
): Promise<void> {
  const root = page.locator(rootSelector);
  await press(zone.locator('[data-product-link]'), testInfo);
  await expect(root).toHaveAttribute('data-book-phase', 'focused');
  for (const selector of [
    'h4',
    '[data-product-visual]',
    '.product-price',
    '[data-fragrance-notes]',
    '[data-inspired-reference]',
    '[data-order-open]',
  ]) {
    await expectReachable(zone.locator(selector), `${slug}: ${selector}`);
  }
  await press(zone.locator('[data-order-open]'), testInfo);
  await expect(root).toHaveAttribute('data-book-phase', 'ordering');
  const dialog = page.locator('dialog[data-order-stage]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('select[name="productSlug"]')).toHaveValue(slug);
  const dialogBounds = await dialog.boundingBox();
  const viewport = page.viewportSize();
  if (!dialogBounds || !viewport) throw new Error('The purchase dialog must fit a real viewport.');
  expect(dialogBounds.x).toBeGreaterThanOrEqual(0);
  expect(dialogBounds.y).toBeGreaterThanOrEqual(0);
  expect(dialogBounds.x + dialogBounds.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(dialogBounds.y + dialogBounds.height).toBeLessThanOrEqual(viewport.height + 1);
  for (const field of await dialog.locator('input, select, textarea').all()) {
    await field.scrollIntoViewIfNeeded();
    await expect(field).toBeInViewport({ ratio: 0.95 });
    expect(
      await field.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= innerWidth + 1;
      }),
      `${slug}: purchase fields must fit horizontally.`,
    ).toBe(true);
  }
  const continueButton = dialog.getByRole('button', { name: 'Continuar en WhatsApp' });
  await continueButton.scrollIntoViewIfNeeded();
  await expect(continueButton).toBeInViewport({ ratio: 0.95 });
  await expect(continueButton).toBeEnabled();
  await press(dialog.locator('[data-order-close]'), testInfo);
  await expect(root).toHaveAttribute('data-book-phase', 'focused');
  await expect(dialog).toBeHidden();
  await press(page.locator('[data-book-return]'), testInfo);
  await expect(root).toHaveAttribute('data-book-phase', 'browsing');
  await expect(zone.locator('[data-product-link]')).toBeFocused();
  await expectNoHorizontalOverflow(page);
}

async function exerciseAllPerfumes(page: Page, testInfo: TestInfo): Promise<void> {
  const root = page.locator(rootSelector);
  for (const [index, perfume] of perfumes.entries()) {
    const zone = page.locator(`[data-book-pages] [data-product-slug="${perfume.slug}"]`);
    await expectCard(zone);
    await expectDetailAndPurchase(page, zone, perfume.slug, testInfo);
    if (index % 2 === 1) {
      await press(page.locator('[data-book-next]'), testInfo);
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await expect(page).toHaveURL(new RegExp(`#libro/${Math.floor(index / 2) + 2}$`));
      await expect(page.locator('.book-turn')).toHaveCount(0);
    }
  }
  await press(page.locator('[data-book-close]'), testInfo);
  await expect(root).toHaveAttribute('data-book-phase', 'closed');
  await expect(page.locator('[data-book-open]')).toBeVisible();
  await expectNoHorizontalOverflow(page);
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 360, height: 740 },
  { width: 375, height: 667 },
  { width: 390, height: 760 },
  { width: 393, height: 745 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
]) {
  test(`móvil ${viewport.width}×${viewport.height}: seis perfumes ordenados, detalle, compra y regreso`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    await prepare(page, viewport);
    await exerciseAllPerfumes(page, testInfo);
  });
}

test('texto al125% conserva los seis perfumes y la compra legibles a360px', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await prepare(page, { width: 360, height: 740 });
  await page.addStyleTag({ content: 'html { font-size: 125%; }' });
  await exerciseAllPerfumes(page, testInfo);
});

test('texto al200% conserva los seis perfumes y la compra legibles a320px', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await prepare(page, { width: 320, height: 568 });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await exerciseAllPerfumes(page, testInfo);
});

test('la barra del navegador cambia la altura sin cortar las filas ni perder la página', async ({
  page,
}, testInfo) => {
  test.setTimeout(45000);
  await prepare(page, { width: 390, height: 844 }, 2);
  const root = page.locator(rootSelector);
  const zones = page.locator('[data-book-leaf]:visible [data-product-slug]');
  for (const height of [844, 745, 844]) {
    await page.setViewportSize({ width: 390, height });
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page).toHaveURL(/#libro\/2$/);
    await expect(zones).toHaveCount(2);
    for (const zone of await zones.all()) await expectCard(zone);
    await expectNoHorizontalOverflow(page);
    await expect(page.locator('.book-turn')).toHaveCount(0);
  }
  const mandarin = page.locator('[data-book-pages] [data-product-slug="mandarine"]');
  await expectDetailAndPurchase(page, mandarin, 'mandarine', testInfo);
  await expect(page).toHaveURL(/#libro\/2$/);
});
