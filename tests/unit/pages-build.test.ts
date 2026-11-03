import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { checkPagesBuild } from '../../scripts/check-pages-build.mjs';

const fixtures: string[] = [];
async function fixture(): Promise<string> {
  const parent = resolve('.cache', 'pages-tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(join(parent, 'build-'));
  fixtures.push(root);
  await mkdir(join(root, 'intro', 'v3'), { recursive: true });
  await Promise.all([
    writeFile(
      join(root, 'index.html'),
      '<meta name="robots" content="noindex, nofollow"><div data-book-root data-brand-intro><iframe data-src="/intro/v3/scene.html"></iframe><a href="/#libro/1">Abrir</a></div>',
    ),
    writeFile(join(root, '404.html'), '<title>No encontrado</title>'),
    writeFile(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n'),
    writeFile(join(root, '_headers'), await readFile('public/_headers')),
    writeFile(join(root, 'intro', 'v3', 'scene.html'), '<link rel="stylesheet" href="scene.css">'),
    writeFile(join(root, 'intro', 'v3', 'scene.css'), 'body { background: #f0e8d5; }'),
  ]);
  return root;
}

afterEach(async () => {
  for (const root of fixtures.splice(0)) {
    if (
      !root.startsWith(resolve('.cache', 'pages-tests') + '\\') &&
      !root.startsWith(resolve('.cache', 'pages-tests') + '/')
    )
      throw new Error('El fixture debe permanecer dentro del espacio de pruebas.');
    await rm(root, { recursive: true, force: true });
  }
});

describe('Pages static upload preflight', () => {
  it('accepts the static intro, relative CSS and book hash navigation without functions', async () => {
    const result = await checkPagesBuild(await fixture());
    expect(result.files).toBe(6);
    expect(result.localReferences).toBe(3);
    expect(result.indexable).toBe(false);
  });
  it('rejects publishing private sources or environment files', async () => {
    for (const path of ['.env', 'src/private.ts']) {
      const root = await fixture();
      if (path.startsWith('src/')) await mkdir(join(root, 'src'));
      await writeFile(join(root, path), 'private fixture');
      await expect(checkPagesBuild(root)).rejects.toThrow(/privado/u);
    }
  });
  it('catches missing intro resources and a missing custom 404 before upload', async () => {
    const root = await fixture();
    await writeFile(
      join(root, 'intro', 'v3', 'scene.css'),
      '.base { background: url("missing.png"); }',
    );
    await expect(checkPagesBuild(root)).rejects.toThrow(/referencia local inexistente/u);
    await rm(join(root, '404.html'));
    await expect(checkPagesBuild(root)).rejects.toThrow(/404\.html/u);
  });
  it('rejects a frame policy that would block the approved intro', async () => {
    const root = await fixture();
    const headers = await readFile(join(root, '_headers'), 'utf8');
    await writeFile(join(root, '_headers'), headers.replace('SAMEORIGIN', 'DENY'));
    await expect(checkPagesBuild(root)).rejects.toThrow(/SAMEORIGIN/u);
  });
});
