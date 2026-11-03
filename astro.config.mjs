import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { readSiteSettings } from './config/site-settings.mjs';

const fileEnv = ['.env', '.env.local'].reduce(
  (env, file) => (existsSync(file) ? { ...env, ...parseEnv(readFileSync(file, 'utf8')) } : env),
  {},
);
const settings = readSiteSettings({ ...fileEnv, ...process.env });

export default defineConfig({
  ...(settings.siteUrl ? { site: settings.siteUrl } : {}),
  output: 'static',
  trailingSlash: 'always',
  integrations: [react(), ...(settings.indexable ? [sitemap()] : [])],
  devToolbar: { enabled: false },
  vite: {
    server: {
      watch: {
        ignored: [
          '**/.cache/**',
          '**/reports/**',
          '**/playwright-report/**',
          '**/test-results/**',
          '**/.agents/**',
          '**/AROMAFIA_IDENTIDAD_VISUAL_DEFINITIVA/**',
        ],
      },
    },
    define: {
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify(settings.siteUrl ?? ''),
      'import.meta.env.PUBLIC_SITE_INDEXABLE': JSON.stringify(String(settings.indexable)),
    },
  },
});
