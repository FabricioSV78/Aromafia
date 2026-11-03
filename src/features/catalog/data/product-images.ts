import type { CatalogProduct, ProductImage } from '../domain/product';

type PhotoVariants = Pick<CatalogProduct, 'generalImage' | 'detailImage'>;

function photo(slug: string, role: 'general' | 'detail', alt: string): ProductImage {
  const width = role === 'general' ? 640 : 960;
  const candidates = role === 'general' ? [320, 640] : [480, 640, 960];
  return {
    composition: 'scene',
    src: `/images/perfumes/${slug}/${role}.webp`,
    srcSet: candidates
      .map(
        (size) =>
          `/images/perfumes/${slug}/${role}${size === width ? '' : '-' + size}.webp ${size}w`,
      )
      .join(', '),
    width,
    height: width,
    alt,
  };
}

/** Finished opaque photographs; all light, framing and background are baked in. */
export const productImages = {
  '9pm': {
    generalImage: photo('9pm', 'general', 'Imagen de referencia de 9 pm de Afnan.'),
    detailImage: photo('9pm', 'detail', '9 pm de Afnan con su caja original.'),
  },
  'hawas-ice': {
    generalImage: photo(
      'hawas-ice',
      'general',
      'Imagen de referencia de Hawas Ice 100ml de Rasasi.',
    ),
    detailImage: photo('hawas-ice', 'detail', 'Hawas Ice de Rasasi con su caja original.'),
  },
  mandarine: {
    generalImage: photo(
      'mandarine',
      'general',
      'Odyssey Mandarin Sky de Armaf, frasco sobre fondo crema.',
    ),
    detailImage: photo(
      'mandarine',
      'detail',
      'Odyssey Mandarin Sky de Armaf con su caja original sobre fondo crema.',
    ),
  },
  'khamrah-qahwa': {
    generalImage: photo(
      'khamrah-qahwa',
      'general',
      'Imagen de referencia de Khamrah Qahwa de Lattafa.',
    ),
    detailImage: photo('khamrah-qahwa', 'detail', 'Khamrah Qahwa de Lattafa con su caja original.'),
  },
  'hawas-malibu': {
    generalImage: photo(
      'hawas-malibu',
      'general',
      'Imagen de referencia de Hawas Malibu de Rasasi.',
    ),
    detailImage: photo('hawas-malibu', 'detail', 'Hawas Malibu de Rasasi con su caja original.'),
  },
  'royale-opal': {
    generalImage: photo('royale-opal', 'general', 'Imagen de referencia de Zakat Royale Opal.'),
    detailImage: photo('royale-opal', 'detail', 'Zakat Royale Opal con su caja original.'),
  },
} satisfies Record<string, PhotoVariants>;
