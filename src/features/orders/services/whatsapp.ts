import type { OrderRequest } from '../domain/order-request';

export function buildWhatsAppMessage(request: OrderRequest): string {
  return [
    `Hola, soy ${request.name}. Quiero consultar por ${request.productName}.`,
    `Mi teléfono es ${request.phone} y soy de ${request.city}.`,
    request.comment ? `Comentario: ${request.comment}` : '',
    'Quiero confirmar la presentación y el precio antes de pedirlo.',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Opens a draft message for the customer to review; no message is sent by this site. */
export function buildWhatsAppUrl(baseHref: string, request: OrderRequest): string {
  const url = new URL(baseHref);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'wa.me' ||
    url.port ||
    url.username ||
    url.password ||
    !/^\/[1-9][0-9]{6,14}$/u.test(url.pathname)
  )
    throw new TypeError('Invalid WhatsApp destination.');
  url.search = '';
  url.hash = '';
  url.searchParams.set('text', buildWhatsAppMessage(request));
  return url.href;
}
