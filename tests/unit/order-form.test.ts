// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initializeOrderForm,
  type OrderFormController,
} from '../../src/features/orders/order-form';

let root: HTMLElement;
let form: HTMLFormElement;
let select: HTMLSelectElement;
let controllers: OrderFormController[];

beforeEach(() => {
  root = document.createElement('section');
  root.dataset['whatsappHref'] = 'https://wa.me/51955565209';
  root.innerHTML = `
    <button data-order-close>Volver</button>
    <form data-order-form hidden>
      <input name="name"><p data-order-error="name" hidden></p>
      <input name="phone"><p data-order-error="phone" hidden></p>
      <input name="city"><p data-order-error="city" hidden></p>
      <select name="productSlug">
        <option value="">Elige tu perfume</option>
        <option value="9pm">9 pm</option>
        <option value="hawas-ice">Hawas Ice 100ml</option>
      </select>
      <p data-order-error="productSlug" hidden></p>
      <textarea name="comment"></textarea><p data-order-error="comment" hidden></p>
      <p data-order-status></p>
    </form>`;
  document.body.append(root);
  const foundForm = root.querySelector('form');
  const foundSelect = root.querySelector('select');
  if (!foundForm || !foundSelect) throw new Error('La prueba necesita un formulario completo.');
  form = foundForm;
  select = foundSelect;
  controllers = [];
});

afterEach(() => {
  controllers.forEach((controller) => controller.dispose());
  root.remove();
});

describe('ciclo de vida del formulario de consulta', () => {
  it('al remontar conserva una sola emisión por acción y dispose repetido no elimina el montaje nuevo', () => {
    const changed = vi.fn();
    const closed = vi.fn();
    root.addEventListener('aromafia:order-product', changed);
    root.addEventListener('aromafia:order-close', closed);
    const first = initializeOrderForm(root);
    const second = initializeOrderForm(root);
    controllers.push(first, second);
    first.dispose();
    expect(form.hidden).toBe(false);
    expect(form.noValidate).toBe(true);
    select.value = 'hawas-ice';
    select.dispatchEvent(new Event('change'));
    root.querySelector<HTMLButtonElement>('[data-order-close]')?.click();
    expect(changed).toHaveBeenCalledOnce();
    expect(closed).toHaveBeenCalledOnce();
    second.dispose();
    select.dispatchEvent(new Event('change'));
    root.querySelector<HTMLButtonElement>('[data-order-close]')?.click();
    expect(changed).toHaveBeenCalledOnce();
    expect(closed).toHaveBeenCalledOnce();
    expect(form.hidden).toBe(true);
    expect(form.noValidate).toBe(false);
  });

  it('no acepta una selección ajena y elimina errores al abrir otro perfume público', () => {
    const controller = initializeOrderForm(root);
    controllers.push(controller);
    expect(controller.selectProduct('9pm')).toBe(true);
    expect(controller.selectProduct('../privado')).toBe(false);
    expect(select.value).toBe('9pm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(root.querySelector('[name="name"]')?.getAttribute('aria-invalid')).toBe('true');
    expect(controller.selectProduct('hawas-ice')).toBe(true);
    expect(select.value).toBe('hawas-ice');
    expect(root.querySelector('[name="name"]')?.hasAttribute('aria-invalid')).toBe(false);
    expect(root.querySelector<HTMLElement>('[data-order-error="name"]')?.hidden).toBe(true);
    controller.dispose();
    expect(controller.selectProduct('9pm')).toBe(false);
    expect(select.value).toBe('hawas-ice');
  });
});
