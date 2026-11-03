import { describe, expect, it } from 'vitest';
import { canonicalUrl } from '../../src/shared/lib/seo';
import { readSiteSettings } from '../../config/site-settings.mjs';

describe('configuración de publicación y SEO', () => {
  it('no inventa un dominio ni permite indexar la base local', () => {
    expect(readSiteSettings({})).toEqual({ siteUrl: undefined, indexable: false });
    expect(canonicalUrl('/', null)).toBeNull();
    expect(() => readSiteSettings({ PUBLIC_SITE_INDEXABLE: 'true' })).toThrow();
  });
  it('rechaza URL con credenciales, protocolo inseguro o rutas', () => {
    for (const url of [
      'http://example.test',
      'https://user:secret@example.test',
      'https://example.test/shop/',
      'https://example.test/?x=1',
    ]) {
      expect(() => readSiteSettings({ PUBLIC_SITE_URL: url })).toThrow();
    }
  });
  it('habilita sitemap/indexación solamente con configuración explícita', () => {
    expect(
      readSiteSettings({ PUBLIC_SITE_URL: 'https://example.test/', PUBLIC_SITE_INDEXABLE: 'true' }),
    ).toEqual({ siteUrl: 'https://example.test', indexable: true });
    expect(() => readSiteSettings({ PUBLIC_SITE_INDEXABLE: 'yes' })).toThrow();
  });
  it('canonical elimina tracking y no permite salir al dominio de un tercero', () => {
    expect(canonicalUrl('/perfumes/ejemplo?utm_source=test#notas', 'https://example.test')).toBe(
      'https://example.test/perfumes/ejemplo/',
    );
    expect(() => canonicalUrl('//other.test', 'https://example.test')).toThrow();
    expect(() => canonicalUrl('/\\other.test', 'https://example.test')).toThrow();
  });
});
