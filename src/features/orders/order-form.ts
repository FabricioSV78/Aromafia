import { validateOrderRequest, type OrderField, type OrderProduct } from './domain/order-request';
import { buildWhatsAppUrl } from './services/whatsapp';

export interface OrderFormController {
  selectProduct: (slug: string) => boolean;
  dispose: () => void;
}

const mounted = new WeakMap<HTMLElement, OrderFormController>();
const fieldNames: readonly OrderField[] = ['name', 'phone', 'city', 'productSlug', 'comment'];

export function initializeOrderForm(root: HTMLElement): OrderFormController {
  mounted.get(root)?.dispose();
  const form = root.querySelector<HTMLFormElement>('[data-order-form]');
  const select = root.querySelector<HTMLSelectElement>('select[name="productSlug"]');
  const status = root.querySelector<HTMLElement>('[data-order-status]');
  const whatsappHref = root.dataset['whatsappHref'];
  if (!form || !select || !status || !whatsappHref)
    return { selectProduct: () => false, dispose: () => {} };

  const products: readonly OrderProduct[] = Array.from(select.options)
    .filter((option) => option.value)
    .map((option) => ({ slug: option.value, displayName: option.textContent?.trim() ?? '' }));
  const abort = new AbortController();
  const { signal } = abort;
  const fields = new Map(fieldNames.map((name) => [name, form.elements.namedItem(name)]));
  let disposed = false;

  function clearErrors() {
    for (const name of fieldNames) {
      const field = fields.get(name);
      if (field instanceof HTMLElement) field.removeAttribute('aria-invalid');
      const error = root.querySelector<HTMLElement>(`[data-order-error="${name}"]`);
      if (error) {
        error.hidden = true;
        error.textContent = '';
      }
    }
    if (status) status.textContent = '';
  }

  function selectProduct(slug: string): boolean {
    if (disposed || !products.some((product) => product.slug === slug) || !select) return false;
    select.value = slug;
    clearErrors();
    return true;
  }

  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      clearErrors();
      const data = new FormData(form);
      const result = validateOrderRequest(
        {
          name: data.get('name'),
          phone: data.get('phone'),
          city: data.get('city'),
          productSlug: data.get('productSlug'),
          comment: data.get('comment'),
        },
        products,
      );
      if (!result.ok) {
        for (const name of fieldNames) {
          const message = result.errors[name];
          if (!message) continue;
          const field = fields.get(name);
          if (field instanceof HTMLElement) field.setAttribute('aria-invalid', 'true');
          const error = root.querySelector<HTMLElement>(`[data-order-error="${name}"]`);
          if (error) {
            error.textContent = message;
            error.hidden = false;
          }
        }
        status.textContent = 'Revisa los campos indicados para continuar.';
        const first = fieldNames.find((name) => result.errors[name]);
        const field = first ? fields.get(first) : null;
        if (field instanceof HTMLElement) field.focus();
        return;
      }
      try {
        const href = buildWhatsAppUrl(whatsappHref, result.request);
        status.textContent = 'Abriendo WhatsApp para que revises el mensaje.';
        window.location.assign(href);
      } catch {
        status.textContent = 'No se pudo abrir WhatsApp. Usa el enlace de contacto para consultar.';
      }
    },
    { signal },
  );
  root.querySelector('[data-order-close]')?.addEventListener(
    'click',
    () => {
      root.dispatchEvent(new CustomEvent('aromafia:order-close', { bubbles: true }));
    },
    { signal },
  );
  select.addEventListener(
    'change',
    () => {
      if (!products.some((product) => product.slug === select.value)) return;
      root.dispatchEvent(
        new CustomEvent('aromafia:order-product', {
          detail: { slug: select.value },
          bubbles: true,
        }),
      );
    },
    { signal },
  );
  form.noValidate = true;
  form.hidden = false;

  const api: OrderFormController = {
    selectProduct,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      abort.abort();
      clearErrors();
      form.hidden = true;
      form.noValidate = false;
      mounted.delete(root);
    },
  };
  mounted.set(root, api);
  return api;
}
