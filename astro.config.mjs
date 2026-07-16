// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Live on the custom domain meyinsaat.com → served at the ROOT. Base is hardcoded
// to '/' on purpose: the old SITE_BASE env override (a github.io project-URL relic)
// kept getting left in a shell and silently forced local dev onto '/MeyInsaatSite',
// 404-ing the whole site. No env override → that class of bug can't recur.
const SITE = 'https://meyinsaat.com';

export default defineConfig({
  site: SITE,
  base: '/',
  trailingSlash: 'ignore',
  // /showcases = dahili tasarım vitrini: sitemap dışı (sayfa ayrıca noindex).
  // /satilik-daireler = canlı ama fiyatlar TEMSİLÎ: gerçek satış verisi girilince
  // bu istisnayı ve features/Satilik*Page'deki noindex'i BİRLİKTE kaldır.
  integrations: [react(), sitemap({
    filter: (page) => !page.includes('/showcases') && !page.includes('/satilik-daireler'),
  })],
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
