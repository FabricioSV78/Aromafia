export interface OrderProduct {
  readonly slug: string;
  readonly displayName: string;
}

export const orderLimits = { name: 80, phone: 32, city: 100, comment: 500 } as const;
export type OrderField = 'name' | 'phone' | 'city' | 'productSlug' | 'comment';
export type OrderErrors = Partial<Record<OrderField, string>>;

export interface OrderRequestInput {
  readonly name: unknown;
  readonly phone: unknown;
  readonly city: unknown;
  readonly productSlug: unknown;
  readonly comment: unknown;
}

export interface OrderRequest {
  readonly name: string;
  readonly phone: string;
  readonly city: string;
  readonly productSlug: string;
  readonly productName: string;
  readonly comment: string;
}

export type OrderValidation =
  | { readonly ok: true; readonly request: OrderRequest }
  | { readonly ok: false; readonly errors: OrderErrors };

const text = (value: unknown): string =>
  typeof value === 'string' ? value.normalize('NFC').trim() : '';
const line = (value: unknown): string => text(value).replace(/\s+/gu, ' ');
const hasLetter = (value: string): boolean => /\p{L}/u.test(value);
const hasControl = (value: string): boolean =>
  Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return (code < 32 && code !== 9 && code !== 10) || code === 127;
  });

/** Validates a consultation only; it never reserves stock or authorizes a price/payment. */
export function validateOrderRequest(
  input: OrderRequestInput,
  products: readonly OrderProduct[],
): OrderValidation {
  const name = line(input.name);
  const rawPhone = text(input.phone);
  const phone = rawPhone.replace(/[\s().-]/gu, '');
  const city = line(input.city);
  const productSlug = text(input.productSlug);
  const comment = text(input.comment).replace(/\r\n?/gu, '\n');
  const product = products.find((item) => item.slug === productSlug);
  const errors: OrderErrors = {};

  if (name.length < 2 || name.length > orderLimits.name || !hasLetter(name) || hasControl(name))
    errors.name = `Nombre: 2–${orderLimits.name} caracteres.`;
  if (
    rawPhone.length > orderLimits.phone ||
    !/^\+?[0-9\s().-]+$/u.test(rawPhone) ||
    !/^\+?[0-9]{9,15}$/u.test(phone)
  )
    errors.phone = 'Teléfono: 9–15 dígitos.';
  if (city.length < 2 || city.length > orderLimits.city || !hasLetter(city) || hasControl(city))
    errors.city = `Ciudad: 2–${orderLimits.city} caracteres.`;
  if (!product) errors.productSlug = 'Selecciona un perfume del catálogo.';
  if (comment.length > orderLimits.comment || hasControl(comment))
    errors.comment = `Usa un comentario de hasta ${orderLimits.comment} caracteres.`;

  if (!product || Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    request: {
      name,
      phone,
      city,
      productSlug: product.slug,
      productName: product.displayName,
      comment,
    },
  };
}
