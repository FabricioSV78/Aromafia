import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const budget = JSON.parse(readFileSync('config/performance-budgets.json', 'utf8'));
const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const files = walk('dist');
const js = files.filter((path) => path.endsWith('.js'));
const css = files.filter((path) => path.endsWith('.css'));
const gzipBytes = (paths) =>
  paths.reduce((total, path) => total + gzipSync(readFileSync(path)).byteLength, 0);
const results = {
  javascriptGzipBytes: gzipBytes(js),
  cssGzipBytes: gzipBytes(css),
  htmlMaxBytes: Math.max(
    0,
    ...files.filter((path) => path.endsWith('.html')).map((path) => statSync(path).size),
  ),
};
console.log(JSON.stringify(results, null, 2));
if (
  results.javascriptGzipBytes > budget.maxTotalJavaScriptGzipBytes ||
  results.cssGzipBytes > budget.maxTotalCssGzipBytes ||
  results.htmlMaxBytes > budget.maxHtmlBytes
)
  throw new Error('El build excede el presupuesto de la base. Investiga antes de elevar límites.');
const originalHashes = new Set(
  JSON.parse(readFileSync('docs/original-assets.json', 'utf8')).assets.map((asset) => asset.sha256),
);
// Optimized responsive derivatives are allowed; untouched original binaries must stay outside dist.
if (
  files.some((path) =>
    originalHashes.has(createHash('sha256').update(readFileSync(path)).digest('hex')),
  )
)
  throw new Error('Los recursos originales no deben copiarse al build automáticamente.');
