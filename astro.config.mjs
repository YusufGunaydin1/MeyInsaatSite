// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project URL until the custom domain lands.
// When the domain is live: set site to it, set base to '/', add public/CNAME.
const SITE = process.env.SITE_URL ?? 'https://meyinsaat.com';
const BASE = process.env.SITE_BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  // /showcases = dahili tasarım vitrini: sitemap dışı (sayfa ayrıca noindex)
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/showcases') })],
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
