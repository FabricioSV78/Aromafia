export const site = {
  name: 'AROMAFIA',
  slogan: 'Huele como jeque, paga como causa.',
  locale: 'es-PE',
  openGraphLocale: 'es_PE',
  currency: 'PEN',
  url: import.meta.env.PUBLIC_SITE_URL || null,
  indexable: import.meta.env.PUBLIC_SITE_INDEXABLE === 'true',
} as const;
