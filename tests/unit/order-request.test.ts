import { describe, expect, it } from 'vitest';
import { orderLimits, validateOrderRequest } from '../../src/features/orders/domain/order-request';

const products = [
  { slug: '9pm', displayName: '9 pm' },
  { slug: 'hawas-ice', displayName: 'Hawas Ice 100ml' },
];
const valid = {
  name: 'José María',
  phone: '+51 955-565-209',
  city: 'Chiclayo',
  productSlug: '9pm',
  comment: '',
};

describe('solicitud de consulta', () => {
  it('normaliza espacios, acentos combinados y teléfono sin alterar el nombre del producto público', () => {
    const result = validateOrderRequest(
      {
        ...valid,
        name: '  Jose\u0301   María  ',
        city: '  La   Esperanza ',
        comment: '  Por favor\r\ncoordinar horario.  ',
      },
      products,
    );
    expect(result).toEqual({
      ok: true,
      request: {
        name: 'José María',
        phone: '+51955565209',
        city: 'La Esperanza',
        productSlug: '9pm',
        productName: '9 pm',
        comment: 'Por favor\ncoordinar horario.',
      },
    });
  });

  it('admite nombres y ciudades con caracteres internacionales', () => {
    expect(
      validateOrderRequest(
        { ...valid, name: 'Ana O’Connor', city: 'José Leonardo Ortiz' },
        products,
      ).ok,
    ).toBe(true);
    expect(validateOrderRequest({ ...valid, name: '李小龍', city: 'São Paulo' }, products).ok).toBe(
      true,
    );
  });

  it('rechaza un perfume fuera de las opciones públicas', () => {
    expect(validateOrderRequest({ ...valid, productSlug: 'perfume-inventado' }, products)).toEqual({
      ok: false,
      errors: { productSlug: 'Selecciona un perfume del catálogo.' },
    });
    expect(validateOrderRequest(valid, []).ok).toBe(false);
  });

  it('devuelve errores asociados a cada campo para entradas vacías o de tipo ajeno', () => {
    const result = validateOrderRequest(
      { name: null, phone: 955565209, city: [], productSlug: {}, comment: '' },
      products,
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Las entradas ajenas al formulario no deben ser válidas.');
    expect(Object.keys(result.errors)).toEqual(['name', 'phone', 'city', 'productSlug']);
  });

  it.each(['123', '955a65209', '++51955565209', '+1234567890123456', '955565209 extensión 4'])(
    'rechaza teléfono inválido %s',
    (phone) => {
      const result = validateOrderRequest({ ...valid, phone }, products);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('El teléfono no debe aceptarse.');
      expect(result.errors.phone).toBeDefined();
    },
  );

  it('acepta teléfono local y verifica límites sin truncar silenciosamente los datos', () => {
    expect(
      validateOrderRequest(
        { ...valid, phone: '955565209', comment: 'á'.repeat(orderLimits.comment) },
        products,
      ).ok,
    ).toBe(true);
    const result = validateOrderRequest(
      {
        ...valid,
        name: 'a'.repeat(orderLimits.name + 1),
        city: 'c'.repeat(orderLimits.city + 1),
        comment: 'x'.repeat(orderLimits.comment + 1),
      },
      products,
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Los datos demasiado largos deben rechazarse.');
    expect(Object.keys(result.errors)).toEqual(['name', 'city', 'comment']);
  });

  it('rechaza caracteres de control en comentarios y permite saltos normales', () => {
    expect(validateOrderRequest({ ...valid, comment: 'Hola\u0000mensaje' }, products).ok).toBe(
      false,
    );
    expect(
      validateOrderRequest({ ...valid, comment: 'Primera línea\nSegunda línea' }, products).ok,
    ).toBe(true);
  });
});
