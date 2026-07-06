// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project URL until the custom domain lands.
// When the domain is live: set site to it, set base to '/', add public/CNAME.
const SITE = process.env.SITE_URL ?? 'https://yusufgunaydin1.github.io';
const BASE = process.env.SITE_BASE ?? '/MeyInsaatSite';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [react(), sitemap()],
  i18n: {
    locales: ['tr', 'en', 'ru', 'ar'],
    defaultLocale: 'tr',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
