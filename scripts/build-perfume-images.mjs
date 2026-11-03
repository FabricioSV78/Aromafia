import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const recipes = JSON.parse(await readFile('src/assets/perfumes/image-recipes.json', 'utf8'));
const publicRoot = 'public/images/perfumes';
const outputs = [];
const canvasSize = 960;
const roleSizes = { general: [320, 640], detail: [480, 640, 960], inspiration: [240, 480] };
const backgrounds = new Map(
  await Promise.all(
    Object.entries(recipes.studios).map(async ([role, configuration]) => {
      const studio = configuration.reuse ? recipes.studios[configuration.reuse] : configuration;
      if (!studio?.source || !studio.inputs?.length)
        throw new Error(`${role}: missing Mandarin studio source or reference.`);
      const bytes = await readFile(studio.source);
      // These are provenance of the image_gen inputs, not build dependencies on public outputs.
      const inputs = studio.inputs;
      return [
        role,
        {
          bytes,
          metadata: {
            source: studio.source,
            sha256: hash(bytes),
            origin: 'Built-in image_gen edit: empty backdrop derived from Mandarin references only',
            prompt: studio.prompt,
            inputs,
            ...(configuration.reuse ? { reusedFrom: configuration.reuse } : {}),
          },
        },
      ];
    }),
  ),
);

for (const [slug, roles] of Object.entries(recipes.products)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Unsafe product folder.');
  const directory = join(publicRoot, slug);
  await mkdir(directory, { recursive: true });
  for (const [role, recipe] of Object.entries(roles)) {
    const width = role === 'inspiration' ? 720 : canvasSize;
    const height = canvasSize;
    const sourceBytes = await readFile(recipe.source);
    const meta = await sharp(sourceBytes).metadata();
    const background = backgrounds.get(role);
    if (!background) throw new Error(`${role}: no prepared studio background.`);
    let master;
    let objectBounds;
    if (recipe.scene) {
      const frame = recipe.framing;
      const scene = frame
        ? sharp(sourceBytes).extract({
            left: Math.round(meta.width * frame.left),
            top: Math.round(meta.height * frame.top),
            width: Math.round(meta.width * frame.width),
            height: Math.round(meta.height * frame.height),
          })
        : sharp(sourceBytes);
      master = await scene.resize(width, height, { fit: 'cover' }).removeAlpha().png().toBuffer();
      objectBounds = recipe.objectBounds ?? { left: 0.08, top: 0.08, width: 0.84, height: 0.84 };
    } else {
      let cutout = sharp(sourceBytes).ensureAlpha();
      if (recipe.mask || recipe.outline) {
        let svg = recipe.mask
          ? await readFile(recipe.mask, 'utf8')
          : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${recipe.outline.viewBox}"><path fill="white" d="${recipe.outline.path}"/></svg>`;
        svg = svg.replace('<svg ', `<svg width="${meta.width}" height="${meta.height}" `);
        const mask = await sharp(Buffer.from(svg)).resize(meta.width, meta.height).png().toBuffer();
        cutout = sharp(
          await cutout
            .composite([{ input: mask, blend: 'dest-in' }])
            .png()
            .toBuffer(),
        );
      }
      const fullCutout = await cutout.png().toBuffer();
      const originalBounds = await alphaBounds(fullCutout);
      const crop = recipe.framing
        ? {
            left: Math.round(meta.width * recipe.framing.left),
            top: Math.round(meta.height * recipe.framing.top),
            width: Math.round(meta.width * recipe.framing.width),
            height: Math.round(meta.height * recipe.framing.height),
          }
        : originalBounds;
      const fill = recipe.fill ?? 0.86;
      const scale = Math.min((height * fill) / crop.height, (width * 0.94) / crop.width);
      const photoWidth = Math.round(crop.width * scale);
      const photoHeight = Math.round(crop.height * scale);
      const photo = await sharp(fullCutout)
        .extract(crop)
        .resize(photoWidth, photoHeight)
        .png()
        .toBuffer();
      const anchorX = recipe.framing?.anchorX ?? 0.5;
      const anchorY = recipe.framing?.anchorY ?? 1;
      const left = Math.round(width * (recipe.positionX ?? 0.5) - photoWidth * anchorX);
      const top = Math.round(height * 0.94 - photoHeight * anchorY);
      const bounds = await alphaBounds(photo);
      objectBounds = {
        left: (left + bounds.left) / width,
        top: (top + bounds.top) / height,
        width: bounds.width / width,
        height: bounds.height / height,
      };
      if (
        objectBounds.left < -0.002 ||
        objectBounds.top < -0.002 ||
        objectBounds.left + objectBounds.width > 1.002 ||
        objectBounds.top + objectBounds.height > 1.002
      )
        throw new Error(`${slug}/${role}: product would be cropped.`);
      const shadowX = left + bounds.left + bounds.width / 2;
      const shadowY = Math.min(height * 0.96, top + bounds.top + bounds.height + height * 0.004);
      const shadow = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><filter id="s" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><feGaussianBlur stdDeviation="${height * 0.012}"/></filter></defs><ellipse cx="${shadowX}" cy="${shadowY}" rx="${bounds.width * 0.43}" ry="${height * 0.013}" fill="#69432c" opacity=".28" filter="url(#s)"/></svg>`,
      );
      const cropLeft = Math.max(0, -left);
      const cropTop = Math.max(0, -top);
      const visible = await sharp(photo)
        .extract({
          left: cropLeft,
          top: cropTop,
          width: Math.min(photoWidth - cropLeft, width - Math.max(0, left)),
          height: Math.min(photoHeight - cropTop, height - Math.max(0, top)),
        })
        .toBuffer();
      const secondaryLayers = [];
      if (recipe.secondary) {
        const secondaryBytes = await readFile(recipe.secondary.source);
        const boxBounds = await alphaBounds(secondaryBytes);
        const box = await sharp(secondaryBytes)
          .extract(boxBounds)
          .resize(Math.round(width * 0.58), Math.round(height * 0.73), { fit: 'inside' })
          .png()
          .toBuffer({ resolveWithObject: true });
        secondaryLayers.push({
          input: box.data,
          left: Math.round(width * 0.04),
          top: Math.round(height * 0.94 - box.info.height),
        });
      }
      master = await sharp(background.bytes)
        .resize(width, height, { fit: 'cover' })
        .composite([
          { input: shadow, left: 0, top: 0 },
          ...secondaryLayers,
          { input: visible, left: Math.max(0, left), top: Math.max(0, top) },
        ])
        .removeAlpha()
        .png()
        .toBuffer();
    }
    const sizes = roleSizes[role];
    const derivatives = [];
    for (const size of sizes) {
      const outputHeight = Math.round((size * height) / width);
      const file = size === sizes.at(-1) ? `${role}.webp` : `${role}-${size}.webp`;
      const path = join(directory, file);
      await sharp(master)
        .resize(size, outputHeight)
        .removeAlpha()
        .webp({ quality: 94, effort: 6, smartSubsample: true })
        .toFile(path);
      const bytes = await readFile(path);
      derivatives.push({
        path: path.replaceAll('\\', '/'),
        width: size,
        height: outputHeight,
        bytes: bytes.length,
        sha256: hash(bytes),
      });
    }
    outputs.push({
      slug,
      role,
      source: recipe.source,
      sourceSha256: hash(sourceBytes),
      ...(recipe.scene ? { scenePreserved: true } : { backgroundRole: role }),
      ...(recipe.secondary
        ? {
            secondarySource: recipe.secondary.source,
            secondarySha256: hash(await readFile(recipe.secondary.source)),
          }
        : {}),
      objectBounds,
      derivatives,
    });
    console.log(`${slug}/${role}: ${derivatives.length} opaque, framed WebP files.`);
  }
}
await writeFile(
  'docs/perfume-assets.json',
  `${JSON.stringify(
    {
      preparedOn: '2026-11-03',
      structure: '/images/perfumes/<slug>/{general,detail,inspiration}.webp',
      backgrounds: Object.fromEntries(
        Array.from(backgrounds, ([role, background]) => [role, background.metadata]),
      ),
      treatment:
        'Authentic source RGB, outer silhouettes only, proportional sizing and role-specific Mandarin-derived background/shadow composition baked into opaque WebP. No generated product, label or box. Mandarin approved photographic scenes retained byte-identically. AI-derived empty studios match the reference style, not an assertion of identical background pixels.',
      quality: 94,
      images: outputs,
    },
    null,
    2,
  )}\n`,
);

function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function alphaBounds(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 24) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
  if (left === info.width) throw new Error('Empty product silhouette.');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}
