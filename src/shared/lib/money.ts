/** Money is stored in integer céntimos, never as a floating-point soles value. */
export interface PenMoney {
  readonly currency: 'PEN';
  readonly amountInCents: number;
}

export function assertPenMoney(value: PenMoney, label = 'price'): void {
  if (
    value.currency !== 'PEN' ||
    !Number.isSafeInteger(value.amountInCents) ||
    value.amountInCents < 0
  ) {
    throw new TypeError(`${label} must use PEN and non-negative integer céntimos.`);
  }
}

export function pen(amountInCents: number): PenMoney {
  const value: PenMoney = { currency: 'PEN', amountInCents };
  assertPenMoney(value);
  return Object.freeze(value);
}

const formatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

export function formatPen(value: PenMoney): string {
  assertPenMoney(value);
  return formatter.format(value.amountInCents / 100);
}
