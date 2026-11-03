import type { PerfumeVariant } from '../domain/product';
import { pen } from '../../../shared/lib/money';

type MarketReference = NonNullable<PerfumeVariant['marketReference']>;

/** Observed third-party prices, not AROMAFIA's historical prices. Evidence in docs/catalog-reference-prices-2026-11-03.md. */
export const marketReferencePrices: Readonly<Partial<Record<string, MarketReference>>> = {
  '9pm': {
    price: pen(15_900),
    source: { label: 'Passim', url: 'https://passimperu.com/producto/afnan-9pm-sellado/' },
    checkedOn: '2026-11-03',
  },
  'hawas-ice': {
    price: pen(18_900),
    source: { label: 'Passim', url: 'https://passimperu.com/producto/rasasi-hawas-ice-sellado/' },
    checkedOn: '2026-11-03',
  },
  mandarine: {
    price: pen(15_590),
    source: {
      label: 'Renace',
      url: 'https://www.renace.com.pe/producto/odyssey-mandarin-sky-armaf-eau-de-parfum-100ml/',
    },
    checkedOn: '2026-11-03',
  },
  'khamrah-qahwa': {
    price: pen(16_900),
    source: {
      label: 'Sin Filtro',
      url: 'https://www.sinfiltro.pe/shop/1059366100-khamrah-qahwa-eau-de-parfum-100ml-6405',
    },
    checkedOn: '2026-11-03',
  },
  'hawas-malibu': {
    price: pen(21_900),
    source: {
      label: 'Passim',
      url: 'https://passimperu.com/producto/rasasi-hawas-malibu-sellado/',
    },
    checkedOn: '2026-11-03',
  },
};
