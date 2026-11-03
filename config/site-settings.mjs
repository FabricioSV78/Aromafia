/** Validate public, non-secret configuration before a build. */
export function readSiteSettings(env) {
  const rawUrl = (env.PUBLIC_SITE_URL ?? '').trim();
  const flag = env.PUBLIC_SITE_INDEXABLE ?? 'false';
  if (!['true', 'false'].includes(flag)) {
    throw new Error('PUBLIC_SITE_INDEXABLE debe ser true o false.');
  }
  let siteUrl;
  if (rawUrl) {
    const url = new URL(rawUrl);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    ) {
      throw new Error(
        'PUBLIC_SITE_URL debe ser un origen HTTPS real, sin credenciales, rutas ni parámetros.',
      );
    }
    siteUrl = url.origin;
  }
  if (flag === 'true' && !siteUrl) {
    throw new Error('La indexación requiere PUBLIC_SITE_URL con el dominio real.');
  }
  return { siteUrl, indexable: flag === 'true' };
}
