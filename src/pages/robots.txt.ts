import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () => {
  const body =
    site.indexable && site.url
      ? `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap-index.xml\n`
      : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
