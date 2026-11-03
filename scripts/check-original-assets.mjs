import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(
  readFileSync(new URL('../docs/original-assets.json', import.meta.url), 'utf8'),
);
for (const asset of manifest.assets) {
  const data = readFileSync(new URL(`../${asset.path}`, import.meta.url));
  const hash = createHash('sha256').update(data).digest('hex');
  if (hash !== asset.sha256) throw new Error(`Recurso de marca modificado: ${asset.path}`);
  console.log(`Original conservado: ${asset.path}`);
}
