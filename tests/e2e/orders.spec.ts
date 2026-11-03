import { expect, test, type Page } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { contact } from '../../src/config/contact';

async function openOrder(page: Page, slug = '9pm'): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/#libro/1/perfume/${slug}`);
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await page.locator(`[data-product-slug="${slug}"] [data-order-open]`).click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
  await expect(page.locator('[data-order-stage]')).toBeVisible();
  await expect(page.locator('[data-order-form]')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/perfume/${slug}/pedido$`));
}

test('el pedido nace del perfume elegido y permite cambiarlo sin abandonar el libro', async ({
  page,
}) => {
  await openOrder(page, 'mandarine');
  const form = page.locator('[data-order-form]');
  await expect(form.locator('select[name="productSlug"]')).toHaveValue('mandarine');
  await expect(
    form.locator('select[name="productSlug"] option[value]:not([value=""])'),
  ).toHaveCount(6);
  await form.getByLabel('Nombre', { exact: true }).fill('Ana María');
  await form.getByLabel('Teléfono', { exact: true }).fill('955123456');
  await form.getByLabel('Ciudad', { exact: true }).fill('Trujillo');
  await form.getByLabel('Perfume', { exact: true }).selectOption('royale-opal');
  await expect(page).toHaveURL(/#libro\/3\/perfume\/royale-opal\/pedido$/);
  await page.locator('[data-order-close]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(page.locator('[data-product-slug="royale-opal"] [data-book-reading]')).toBeVisible();
  await expect(page).toHaveURL(/#libro\/3\/perfume\/royale-opal$/);
  await page.locator('[data-product-slug="royale-opal"] [data-order-open]').click();
  await expect(form.getByLabel('Nombre', { exact: true })).toHaveValue('Ana María');
  await expect(form.getByLabel('Perfume', { exact: true })).toHaveValue('royale-opal');
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('dialog[data-order-stage]')).toHaveCount(1);
  await expect(page.locator('dialog[data-order-stage]')).toBeVisible();
});

test('los errores se asocian a sus campos y el foco identifica el primero', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openOrder(page);
  const form = page.locator('[data-order-form]');
  const submit = form.getByRole('button', { name: 'Continuar en WhatsApp' });
  await submit.click();
  const name = form.getByLabel('Nombre', { exact: true });
  const phone = form.getByLabel('Teléfono', { exact: true });
  const city = form.getByLabel('Ciudad', { exact: true });
  await expect(name).toBeFocused();
  for (const field of [name, phone, city])
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  for (const key of ['name', 'phone', 'city'])
    await expect(form.locator(`[data-order-error="${key}"]`)).toBeVisible();
  await expect(form.locator('[data-order-status]')).toContainText('Revisa los campos');
  const stage = page.locator('[data-order-stage]');
  const paper = await stage.boundingBox();
  if (!paper) throw new Error('El formulario necesita papel visible.');
  for (const part of [
    page.locator('[data-order-root] h2'),
    page.locator('[data-order-close]'),
    form.locator('[data-order-error="name"]'),
    form.locator('[data-order-error="phone"]'),
    form.locator('[data-order-error="city"]'),
    submit,
    form.locator('[data-order-status]'),
  ]) {
    await expect(part).toBeInViewport({ ratio: 1 });
    const box = await part.boundingBox();
    if (!box) throw new Error('Cada mensaje y control debe conservar su posición.');
    expect(box.y).toBeGreaterThanOrEqual(paper.y);
    expect(box.y + box.height).toBeLessThanOrEqual(paper.y + paper.height);
  }
  await name.fill('Ana María');
  await phone.fill('letras');
  await city.fill('Trujillo');
  await submit.click();
  await expect(phone).toBeFocused();
  await expect(phone).toHaveAttribute('aria-invalid', 'true');
  await expect(name).not.toHaveAttribute('aria-invalid', 'true');
  await expect(city).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
});

test('Comprar abre un modal compacto y el fondo permanece bloqueado hasta cerrarlo', async ({
  page,
}) => {
  await openOrder(page);
  const dialog = page.locator('dialog[data-order-stage]');
  const book = await page.locator('[data-book-camera]').boundingBox();
  const box = await dialog.boundingBox();
  if (!box || !book) throw new Error('El modal y el libro deben conservar su geometría.');
  expect(box.width).toBeLessThanOrEqual(480);
  expect(box.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight - 16));
  const name = dialog.getByLabel('Nombre', { exact: true });
  await name.focus();
  await page.locator('[data-book-return]').evaluate((element) => {
    if (element instanceof HTMLElement) element.focus();
  });
  await expect(name).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(page.locator('[data-product-slug="9pm"] [data-order-open]')).toBeFocused();
  const after = await page.locator('[data-book-camera]').boundingBox();
  if (!after) throw new Error('El libro debe permanecer detrás de la compra.');
  for (const key of ['x', 'y', 'width', 'height'] as const)
    expect(Math.abs(after[key] - book[key])).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('construye el borrador de WhatsApp con caracteres especiales sin enviar una conversación real', async ({
  page,
}) => {
  await openOrder(page, 'hawas-ice');
  const form = page.locator('[data-order-form]');
  await form.getByLabel('Nombre', { exact: true }).fill('Ana María & José');
  await form.getByLabel('Teléfono', { exact: true }).fill('+51 955 123 456');
  await form.getByLabel('Ciudad', { exact: true }).fill('Trujillo & Chiclayo');
  await form
    .locator('textarea[name="comment"]')
    .fill('¿Tienen presentación disponible?\nPara regalo: mamá & papá #1.');
  const stored = await page.evaluate(() =>
    [...Object.values(localStorage), ...Object.values(sessionStorage)].join('\n'),
  );
  expect(stored).not.toContain('Ana María & José');
  expect(stored).not.toContain('955123456');
  let requested = '';
  await page.route('https://wa.me/**', async (route) => {
    requested = route.request().url();
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<main>Borrador interceptado por la prueba.</main>',
    });
  });
  await form.getByRole('button', { name: 'Continuar en WhatsApp' }).click();
  await expect.poll(() => requested).not.toBe('');
  const destination = new URL(requested);
  const configured = new URL(contact.whatsapp.href);
  expect(destination.origin + destination.pathname).toBe(configured.origin + configured.pathname);
  const message = destination.searchParams.get('text');
  expect(message).toContain('Ana María & José');
  expect(message).toContain('Hawas Ice 100ml');
  expect(message).toContain('+51955123456');
  expect(message).toContain('Trujillo & Chiclayo');
  expect(message).toContain('mamá & papá #1.');
  expect(message).toContain('confirmar la presentación y el precio');
  await expect(page.getByText('Borrador interceptado por la prueba.')).toBeVisible();
});

test('la URL de pedido admite recarga, Atrás y Escape con un regreso lógico al perfume', async ({
  page,
}) => {
  await openOrder(page, 'khamrah-qahwa');
  await page.reload();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
  await expect(page.locator('select[name="productSlug"]')).toHaveValue('khamrah-qahwa');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(page).toHaveURL(/\/perfume\/khamrah-qahwa$/);
  await page.locator('[data-product-slug="khamrah-qahwa"] [data-order-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
  await page.goBack();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  await expect(
    page.locator('[data-product-slug="khamrah-qahwa"] [data-book-reading]'),
  ).toBeVisible();
});

test('volver del pedido y después al libro no deja una entrada duplicada del detalle', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const changeProduct of [false, true]) {
    await page.goto('/#libro/1');
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    await page.locator('[data-product-slug="9pm"] [data-product-link]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
    await page.locator('[data-product-slug="9pm"] [data-order-open]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
    if (changeProduct) await page.locator('select[name="productSlug"]').selectOption('royale-opal');
    await page.locator('[data-order-close]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
    await page.locator('[data-book-return]').click();
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page).toHaveURL(new RegExp(`#libro/${changeProduct ? 3 : 1}$`));
  }
});

test('el formulario es accesible y mantiene visibles sus controles en móvil @a11y', async ({
  page,
}) => {
  await openOrder(page);
  const form = page.locator('[data-order-form]');
  await expect(form.getByLabel('Nombre', { exact: true })).toHaveAttribute('autocomplete', 'name');
  await expect(form.getByLabel('Teléfono', { exact: true })).toHaveAttribute('type', 'tel');
  await expect(form.getByLabel('Ciudad', { exact: true })).toHaveAttribute(
    'autocomplete',
    'address-level2',
  );
  await expect(form.locator('textarea[name="comment"]')).toHaveAttribute('maxlength', '500');
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
    for (const control of await form
      .locator('input, select, textarea, button[type="submit"]')
      .all())
      await expect(control).toBeInViewport({ ratio: 0.98 });
    await expect(page.locator('[data-order-close]')).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test('con poca altura el papel permite reflow y conserva acceso a lectura y errores', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 450 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#libro/1/perfume/9pm');
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'focused');
  const zone = page.locator('[data-product-slug="9pm"]');
  for (const part of ['.perfume-reading__order-note', '[data-order-open]']) {
    const element = zone.locator(part);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeInViewport({ ratio: 0.98 });
  }
  await zone.locator('[data-order-open]').click();
  await expect(page.locator('[data-book-root]')).toHaveAttribute('data-book-phase', 'ordering');
  await page.locator('[data-order-form] button[type="submit"]').click();
  for (const selector of [
    '[data-order-close]',
    '[data-order-status]',
    '[data-order-form] button[type="submit"]',
  ]) {
    const element = page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeInViewport({ ratio: 0.98 });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
