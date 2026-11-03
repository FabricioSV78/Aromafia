import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import originalAssets from '../../../../docs/original-assets.json' with { type: 'json' };

interface IntroAsset {
  readonly name: string;
  readonly contentType: string;
  readonly body: string | Uint8Array;
}

const sourcePath = 'pantalla_inicial/AROMAFIA · Animación de logo v3 (1).html';
const sourceBytes = readFileSync(resolve(sourcePath));
const sourceSha256 = sha256(sourceBytes);
const approvedSource = originalAssets.assets.find((asset) => asset.path === sourcePath);
if (!approvedSource || approvedSource.sha256 !== sourceSha256)
  throw new Error('The approved v3 intro must remain unchanged before preparing its assets.');

const assets = new Map<string, IntroAsset>();
const rasterMetadata: {
  name: string;
  bytes: number;
  sha256: string;
  width: number;
  height: number;
}[] = [];

// Reuse the PNG layers already present in v3; no image is resegmented or regenerated.
const externalized = sourceBytes
  .toString('utf8')
  .replace(/data:image\/png;base64,([A-Za-z0-9+/=]+)/gu, (_match: string, encoded: string) => {
    const bytes = Buffer.from(encoded, 'base64');
    if (bytes.length < 24 || bytes.readUInt32BE(0) !== 0x89504e47)
      throw new Error('An embedded v3 image is not a PNG.');
    const hash = sha256(bytes);
    const name = `image-${hash.slice(0, 16)}.png`;
    if (!assets.has(name)) {
      assets.set(name, { name, contentType: 'image/png', body: bytes });
      rasterMetadata.push({
        name,
        bytes: bytes.length,
        sha256: hash,
        width: bytes.readUInt32BE(16),
        height: bytes.readUInt32BE(20),
      });
    }
    return name;
  });
const style = /<style>([\s\S]*?)<\/style>/u.exec(externalized);
if (!style?.[1] || !externalized.includes('<html lang="es">'))
  throw new Error('The approved v3 document has an unexpected structure.');

// The parent starts playback after all resources load, then removes this document at the end.
const integrationCss = `
html[data-intro-paused] *,
html[data-intro-paused] *::before,
html[data-intro-paused] *::after { animation-play-state: paused !important; }
.stage { animation-iteration-count: 1; animation-fill-mode: forwards; }
`;
const stylesheet = `${style[1]}\n${integrationCss}`;
const document = externalized
  .replace(style[0], '<link rel="stylesheet" href="scene.css">')
  .replace('<html lang="es">', '<html lang="es" data-intro-paused>')
  .replace('</head>', '<meta name="robots" content="noindex, nofollow"></head>');
assets.set('scene.css', {
  name: 'scene.css',
  contentType: 'text/css; charset=utf-8',
  body: stylesheet,
});
assets.set('scene.html', {
  name: 'scene.html',
  contentType: 'text/html; charset=utf-8',
  body: document,
});

/** Static build resources; this module must never be imported by a client script. */
export function getIntroAssets(): ReadonlyMap<string, IntroAsset> {
  return assets;
}

export const introAssetManifest = {
  preparedOn: '2026-11-03',
  source: { path: sourcePath, bytes: sourceBytes.length, sha256: sourceSha256 },
  destination: '/intro/v3/',
  treatment:
    'The 11 PNG images already embedded in the approved HTML are externalized byte-for-byte. Original body, keyframes, colors and proportions are retained. Only style/resource URLs, an initial pause, a single stage cycle and noindex metadata are added. No character layer is resegmented, edited or generated.',
  mainCycleSeconds: 16,
  rasterBytes: rasterMetadata.reduce((total, asset) => total + asset.bytes, 0),
  rasters: rasterMetadata,
  documents: [
    { name: 'scene.css', bytes: Buffer.byteLength(stylesheet), sha256: sha256(stylesheet) },
    { name: 'scene.html', bytes: Buffer.byteLength(document), sha256: sha256(document) },
  ],
};

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}
