import type { CatalogProduct } from '../domain/product';
import { productImages } from './product-images';
import { productInspirations } from './product-inspirations';

type ResearchedContent = Pick<
  CatalogProduct,
  | 'brand'
  | 'description'
  | 'shortDescription'
  | 'generalImage'
  | 'detailImage'
  | 'inspiredBy'
  | 'classification'
  | 'olfactoryFamilies'
  | 'notes'
  | 'sources'
>;

/** Facts checked 2026-11-02. Sources and discrepancies are recorded in docs/sources-research-*.md. */
export const researchedContent = {
  '9pm': {
    brand: { id: 'afnan', name: 'Afnan' },
    shortDescription: 'Manzana y canela sobre vainilla y haba tonka.',
    description:
      'Una salida de manzana, bergamota y canela da paso a un corazón floral de lirio de los valles y azahar, con un fondo de vainilla, ámbar y haba tonka.',
    classification: 'men',
    olfactoryFamilies: ['Especiada', 'Afrutada'],
    notes: {
      top: ['Bergamota', 'Lavandín', 'Canela', 'Manzana'],
      heart: ['Lirio de los valles', 'Azahar'],
      base: ['Pachulí', 'Ámbar', 'Vainilla', 'Haba tonka'],
    },
    ...productImages['9pm'],
    inspiredBy: productInspirations['9pm'],
    sources: [{ label: 'Afnan', url: 'https://us.afnan.com/products/9-pm' }],
  },
  'hawas-ice': {
    brand: { id: 'rasasi', name: 'Rasasi' },
    shortDescription: 'Manzana helada, cítricos y notas marinas.',
    description:
      'Manzana helada y cítricos abren una composición de ciruela, azahar y acorde marino, sobre un fondo de musgo, maderas, ámbar y almizcle.',
    classification: 'men',
    olfactoryFamilies: ['Aromática', 'Amaderada', 'Afrutada'],
    notes: {
      top: ['Manzana helada', 'Bergamota', 'Limón', 'Anís estrellado'],
      heart: ['Azahar', 'Acorde marino helado', 'Ciruela', 'Cardamomo'],
      base: ['Musgo cristalino', 'Madera a la deriva', 'Ámbar', 'Almizcle'],
    },
    ...productImages['hawas-ice'],
    inspiredBy: productInspirations['hawas-ice'],
    sources: [{ label: 'Rasasi', url: 'https://store.rasasi.com.sa/en/aeezlxd/p330366857' }],
  },
  mandarine: {
    brand: { id: 'armaf', name: 'Armaf' },
    shortDescription: 'Mandarina y naranja con caramelo y maderas.',
    description:
      'Odyssey Mandarin Sky combina mandarina, naranja, salvia y azafrán con caramelo, haba tonka y tagetes. El fondo reúne vetiver, cedro y ambroxan.',
    classification: 'men',
    olfactoryFamilies: ['Ambarada', 'Amaderada'],
    notes: {
      top: ['Salvia', 'Mandarina', 'Naranja', 'Azafrán'],
      heart: ['Caramelo', 'Haba tonka', 'Tagetes'],
      base: ['Vetiver', 'Cedro', 'Ambroxan'],
    },
    ...productImages.mandarine,
    inspiredBy: productInspirations.mandarine,
    sources: [{ label: 'Armaf', url: 'https://www.armaf.ae/products/odyssey-mandarin-sky-man' }],
  },
  'khamrah-qahwa': {
    brand: { id: 'lattafa', name: 'Lattafa' },
    shortDescription: 'Especias cálidas, praliné y café arábica.',
    description:
      'Jengibre, canela y cardamomo abren una composición de praliné, frutas confitadas y flores blancas, con un fondo de café arábica, haba tonka y vainilla.',
    classification: 'unisex',
    olfactoryFamilies: ['Gourmand'],
    notes: {
      top: ['Jengibre', 'Canela', 'Cardamomo'],
      heart: ['Praliné', 'Frutas confitadas', 'Flores blancas'],
      base: ['Café arábica', 'Haba tonka', 'Almizcle', 'Benjuí', 'Vainilla'],
    },
    ...productImages['khamrah-qahwa'],
    inspiredBy: productInspirations['khamrah-qahwa'],
    sources: [{ label: 'Lattafa', url: 'https://lattafa.com/product/khamrah-qahwa/' }],
  },
  'hawas-malibu': {
    brand: { id: 'rasasi', name: 'Rasasi' },
    shortDescription: 'Piña y cítricos con ámbar, iris y un fondo amaderado.',
    description:
      'Piña, naranja y pomelo preceden a un corazón de ámbar, iris y lavanda. El fondo reúne haba tonka, almizcle, cashmeran y pachulí.',
    classification: 'men',
    olfactoryFamilies: ['Fresca'],
    notes: {
      top: ['Piña', 'Naranja', 'Pomelo'],
      heart: ['Ámbar', 'Iris', 'Lavanda'],
      base: ['Haba tonka', 'Almizcle', 'Cashmeran', 'Pachulí'],
    },
    ...productImages['hawas-malibu'],
    inspiredBy: productInspirations['hawas-malibu'],
    sources: [{ label: 'Rasasi', url: 'https://store.rasasi.com.sa/en/bpzlndr/p533992836' }],
  },
  'royale-opal': {
    brand: { id: 'zakat', name: 'Zakat' },
    shortDescription: 'Canela y nuez moscada con dátiles y un fondo avainillado.',
    description:
      'Zakat Royale Opal reúne canela, nuez moscada y bergamota, con un corazón de dátiles, praliné y notas florales. El fondo combina vainilla, haba tonka, resinas y maderas.',
    classification: 'unisex',
    olfactoryFamilies: ['Ambarada', 'Avainillada'],
    notes: {
      top: ['Canela', 'Nuez moscada', 'Bergamota'],
      heart: ['Dátiles', 'Praliné', 'Nardos', 'Mahonial'],
      base: ['Vainilla', 'Haba tonka', 'Mirra', 'Benjuí', 'Amberwood', 'Akigalawood'],
    },
    ...productImages['royale-opal'],
    inspiredBy: productInspirations['royale-opal'],
    sources: [
      { label: 'Blomster', url: 'https://www.blomsterusa.com/en/products/royale-opal-by-zakat' },
      {
        label: 'Kingdom',
        url: 'https://kingdomfragrances.com/products/zakat-royale-opal-2-7oz-edp',
      },
    ],
  },
} satisfies Record<string, ResearchedContent>;
