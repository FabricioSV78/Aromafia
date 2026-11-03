import type { ProductInspiration } from '../domain/product';

/** Real reference photographs with their studio composition baked in; sources remain olfactory comparisons. */
export const productInspirations = {
  '9pm': {
    brand: 'Jean Paul Gaultier',
    name: 'Ultra Male',
    relation: 'similar_to',
    image: {
      composition: 'scene',
      src: '/images/perfumes/9pm/inspiration.webp',
      srcSet:
        '/images/perfumes/9pm/inspiration-240.webp 240w, /images/perfumes/9pm/inspiration.webp 480w',
      width: 480,
      height: 640,
      alt: 'Ultra Male de Jean Paul Gaultier, referencia olfativa.',
    },
    sources: [
      {
        label: 'Multimarcas',
        url: 'https://multimarcasperfumes.cl/products/9-pm-edp-100-ml-afnan',
      },
      {
        label: 'Silk',
        url: 'https://silkperfumes.cl/products/afnan-9pm-hombre-edp-100ml',
      },
    ],
  },
  'hawas-ice': {
    brand: 'Rabanne',
    name: 'Invictus Aqua',
    relation: 'similar_to',
    image: {
      composition: 'scene',
      src: '/images/perfumes/hawas-ice/inspiration.webp',
      srcSet:
        '/images/perfumes/hawas-ice/inspiration-240.webp 240w, /images/perfumes/hawas-ice/inspiration.webp 480w',
      width: 480,
      height: 640,
      alt: 'Invictus Aqua de Rabanne, referencia olfativa.',
    },
    sources: [
      {
        label: 'Fordgate',
        url: 'https://fordgatepharmacy.com.au/shop/hawas-ice-edp-100ml-rasasi/',
      },
      {
        label: 'Perfume Cartel',
        url: 'https://www.perfumecartel.com.au/products/rasasi-hawas-ice',
      },
    ],
  },
  mandarine: {
    brand: 'Jean Paul Gaultier',
    name: 'Scandal Pour Homme',
    relation: 'similar_to',
    image: {
      composition: 'scene',
      src: '/images/perfumes/mandarine/inspiration.webp',
      srcSet:
        '/images/perfumes/mandarine/inspiration-240.webp 240w, /images/perfumes/mandarine/inspiration.webp 480w',
      width: 480,
      height: 640,
      alt: 'Scandal Pour Homme de Jean Paul Gaultier, referencia aportada por AROMAFIA.',
    },
    sources: [
      {
        label: 'La Belle',
        url: 'https://labelleperfumes.com/products/new-odyssey-mandarin-sky-3-4-oz-edp',
      },
      {
        label: 'Imperian',
        url: 'https://imperian.co.uk/products/odyssey-mandarin-sky-limited-edition-perfume-100ml-edp-armaf',
      },
    ],
  },
  'khamrah-qahwa': {
    brand: 'Kilian Paris',
    name: 'Angels’ Share',
    relation: 'similar_to',
    image: {
      composition: 'scene',
      src: '/images/perfumes/khamrah-qahwa/inspiration.webp',
      srcSet:
        '/images/perfumes/khamrah-qahwa/inspiration-240.webp 240w, /images/perfumes/khamrah-qahwa/inspiration.webp 480w',
      width: 480,
      height: 640,
      alt: 'Angels’ Share de Kilian Paris, referencia olfativa.',
    },
    sources: [
      {
        label: 'Multimarcas',
        url: 'https://multimarcasperfumes.cl/products/khamrah-qahwa-edp-100-ml-unisex-lattafa',
      },
      {
        label: 'Silk',
        url: 'https://silkperfumes.cl/collections/perfumes-lattafa-khamrah',
      },
    ],
  },
  'hawas-malibu': {
    brand: 'Jean Paul Gaultier',
    name: 'Le Beau Le Parfum',
    relation: 'similar_to',
    image: {
      composition: 'scene',
      src: '/images/perfumes/hawas-malibu/inspiration.webp',
      srcSet:
        '/images/perfumes/hawas-malibu/inspiration-240.webp 240w, /images/perfumes/hawas-malibu/inspiration.webp 480w',
      width: 480,
      height: 640,
      alt: 'Le Beau Le Parfum de Jean Paul Gaultier, referencia olfativa.',
    },
    sources: [
      {
        label: 'Frag+Bar',
        url: 'https://fragbar.com/products/hawas-malibu-le-beau-le-parfum',
      },
      {
        label: 'Multimarcas',
        url: 'https://multimarcasperfumes.cl/products/hawas-malibu-edp-100-ml-unisex-rasasi',
      },
    ],
  },
  'royale-opal': {
    brand: 'Kilian Paris',
    name: 'Angels’ Share',
    relation: 'similar_to',
    image: {
      composition: 'scene',
      src: '/images/perfumes/royale-opal/inspiration.webp',
      srcSet:
        '/images/perfumes/royale-opal/inspiration-240.webp 240w, /images/perfumes/royale-opal/inspiration.webp 480w',
      width: 480,
      height: 640,
      alt: 'Angels’ Share de Kilian Paris, referencia olfativa.',
    },
    sources: [
      {
        label: 'Kingdom',
        url: 'https://kingdomfragrances.com/products/zakat-royale-opal-2-7oz-edp',
      },
      {
        label: 'Dubai Perfume Shop',
        url: 'https://dubaiperfumeshop.us/en/products/zakat-royale-opal-unisex-2-7-oz-edp-sp',
      },
    ],
  },
} satisfies Record<string, ProductInspiration>;
