/** Keep URLs stable; ignore tracking parameters and never emit a made-up domain. */
export function canonicalUrl(pathname: string, origin: string | null): string | null {
  if (!origin) return null;
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) {
    throw new Error('La ruta canonical debe ser una ruta local absoluta.');
  }
  const path = pathname.split(/[?#]/)[0] ?? '/';
  return new URL(path.endsWith('/') ? path : `${path}/`, origin).href;
}
