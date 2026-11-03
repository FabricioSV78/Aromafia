import type { APIRoute, GetStaticPaths } from 'astro';
import { getIntroAssets } from '../../../features/intro/services/intro-document.server';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = () =>
  Array.from(getIntroAssets().keys(), (file) => ({ params: { file } }));

export const GET: APIRoute = ({ params }) => {
  const asset = params.file ? getIntroAssets().get(params.file) : undefined;
  if (!asset) return new Response(null, { status: 404 });
  const body = typeof asset.body === 'string' ? asset.body : new Uint8Array(asset.body);
  return new Response(body, {
    headers: {
      'Content-Type': asset.contentType,
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
};
