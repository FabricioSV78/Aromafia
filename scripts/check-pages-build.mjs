import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const privateDirectories = new Set([
  'src',
  'docs',
  'tests',
  'reports',
  'node_modules',
  'pantalla_inicial',
  'functions',
  '.git',
]);
const required = [
  'index.html',
  '404.html',
  'robots.txt',
  '_headers',
  'intro/v3/scene.html',
  'intro/v3/scene.css',
];

/** Check only a built static directory; this never connects to a Cloudflare account. */
export async function checkPagesBuild(directory = 'dist') {
  const root = await realpath(directory);
  const files = new Map();
  async function walk(folder) {
    for (const name of await readdir(folder)) {
      const absolute = join(folder, name);
      const path = relative(root, absolute).replaceAll('\\', '/');
      const stat = await lstat(absolute);
      if (stat.isSymbolicLink()) throw new Error(`Pages: enlace simbólico no permitido: ${path}`);
      if (name.startsWith('.') || name === '_worker.js' || privateDirectories.has(name))
        throw new Error(`Pages: archivo o directorio privado/runtime inesperado: ${path}`);
      if (stat.isDirectory()) await walk(absolute);
      else if (stat.isFile()) {
        if (stat.size > 25 * 1024 * 1024) throw new Error(`Pages: archivo mayor de25MiB: ${path}`);
        if (['.map', '.ts', '.tsx', '.astro'].includes(extname(name)))
          throw new Error(`Pages: fuente privada inesperada: ${path}`);
        files.set(path, { absolute, bytes: stat.size });
      }
    }
  }
  await walk(root);
  // The dashboard's drag-and-drop limit is stricter than the general Pages plan limit.
  if (files.size > 1000) throw new Error('Pages: la carga manual admite hasta1000 archivos.');
  for (const path of required)
    if (!files.has(path)) throw new Error(`Pages: falta el recurso obligatorio ${path}`);
  const read = (path) => readFile(join(root, path), 'utf8');
  const headers = await read('_headers');
  if (!/^\s+X-Frame-Options:\s*SAMEORIGIN\s*$/mu.test(headers))
    throw new Error('Pages: SAMEORIGIN es necesario para la intro local.');
  if (!headers.includes('/_astro/*') || !headers.includes('immutable'))
    throw new Error('Pages: faltan los encabezados de los recursos con hash.');
  const home = await read('index.html');
  if (home.includes('/@vite/client')) throw new Error('Pages: se necesita un build de producción.');
  if (!home.includes('data-brand-intro') || !home.includes('data-book-root'))
    throw new Error('Pages: el build debe incluir la intro y el catálogo.');

  let localReferences = 0;
  for (const [path, entry] of files) {
    if (!['.html', '.css'].includes(extname(path))) continue;
    const text = await readFile(entry.absolute, 'utf8');
    const references = [];
    if (path.endsWith('.html')) {
      for (const match of text.matchAll(/\b(?:src|href|data-src)=["']([^"']+)["']/gu))
        references.push(match[1]);
      for (const match of text.matchAll(/\bsrcset=["']([^"']+)["']/gu))
        for (const candidate of match[1].split(','))
          references.push(candidate.trim().split(/\s+/u)[0]);
    }
    for (const match of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gu))
      references.push(match[1]);
    for (const reference of references) {
      if (!reference || reference.startsWith('#')) continue;
      const url = new URL(reference.replaceAll('&amp;', '&'), `https://pages.invalid/${path}`);
      if (url.origin !== 'https://pages.invalid') continue;
      const target = decodeURIComponent(url.pathname).replace(/^\//u, '');
      const candidates = [target, `${target}.html`, `${target.replace(/\/$/u, '')}/index.html`];
      if (target === '') candidates.push('index.html');
      if (!candidates.some((candidate) => files.has(candidate)))
        throw new Error(`Pages: referencia local inexistente en ${path}: ${target}`);
      localReferences++;
    }
  }
  const largest = [...files].sort((a, b) => b[1].bytes - a[1].bytes)[0];
  const indexable = /name="robots"\s+content="index, follow"/u.test(home);
  const robots = await read('robots.txt');
  if (!indexable && !robots.includes('Disallow: /'))
    throw new Error('Pages: robots debe conservar la política de revisión del HTML.');
  if (indexable && (!home.includes('rel="canonical"') || !files.has('sitemap-index.xml')))
    throw new Error('Pages: la indexación necesita dominio canónico y sitemap.');
  return {
    files: files.size,
    bytes: [...files.values()].reduce((sum, file) => sum + file.bytes, 0),
    largest: largest ? { path: largest[0], bytes: largest[1].bytes } : null,
    localReferences,
    indexable,
    uploadDirectory: 'dist',
    indexSha256: createHash('sha256').update(home).digest('hex'),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const report = 'reports/cloudflare-pages/preflight.json';
  const result = await checkPagesBuild();
  await mkdir(dirname(report), { recursive: true });
  await writeFile(report, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}
