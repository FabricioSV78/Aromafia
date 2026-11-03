import { describe, expect, it } from 'vitest';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '../../src/features/orders/services/whatsapp';
import type { OrderRequest } from '../../src/features/orders/domain/order-request';
import { contact } from '../../src/config/contact';

const request: OrderRequest = {
  name: 'María & José',
  phone: '+51955565209',
  city: 'Trujillo',
  productSlug: '9pm',
  productName: '9 pm',
  comment: '¿Entrega mañana? #1\nGracias 😊',
};

describe('borrador de WhatsApp', () => {
  it('conserva el destino configurado y codifica caracteres especiales sin añadir parámetros de cliente sueltos', () => {
    const url = new URL(buildWhatsAppUrl(contact.whatsapp.href, request));
    expect(url.origin + url.pathname).toBe(contact.whatsapp.href);
    expect([...url.searchParams.keys()]).toEqual(['text']);
    expect(url.hash).toBe('');
    expect(url.searchParams.get('text')).toBe(buildWhatsAppMessage(request));
    expect(url.href).toContain('%26');
    expect(url.searchParams.get('text')).toContain('María & José');
    expect(url.searchParams.get('text')).toContain('¿Entrega mañana? #1\nGracias 😊');
  });

  it('incluye la consulta, los datos y la confirmación comercial sin afirmar un pedido registrado', () => {
    const message = buildWhatsAppMessage(request);
    expect(message).toContain('Quiero consultar por 9 pm.');
    expect(message).toContain('Mi teléfono es +51955565209 y soy de Trujillo.');
    expect(message).toContain('confirmar la presentación y el precio');
    expect(message).not.toMatch(/pedido confirmado|pago realizado|stock reservado/i);
  });

  it('omite comentarios vacíos y elimina un borrador previo de la URL', () => {
    const emptyComment = { ...request, comment: '' };
    const url = new URL(
      buildWhatsAppUrl(`${contact.whatsapp.href}?text=anterior#viejo`, emptyComment),
    );
    expect(url.searchParams.get('text')).not.toContain('Comentario:');
    expect(url.searchParams.get('text')).not.toContain('anterior');
    expect(url.hash).toBe('');
  });

  it.each([
    'javascript:alert(1)',
    'https://otro.test/51955565209',
    'http://wa.me/51955565209',
    'https://wa.me@otro.test/51955565209',
    'https://wa.me:8443/51955565209',
    'https://wa.me/no-es-numero',
  ])('rechaza un destino ajeno o inseguro %s', (href) => {
    expect(() => buildWhatsAppUrl(href, request)).toThrow();
  });
});
