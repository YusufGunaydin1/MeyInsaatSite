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
  // Eski proje slug'ları (yayında linklenmiş olabilir) → gerçek bina adlarına.
  // Statik çıktıda Astro bunlar için meta-refresh HTML sayfası üretir.
  redirects: {
    '/projeler/ali': '/projeler/masuk-apartmani',
    '/projeler/sapanbaglari': '/projeler/camoglu-apartmani',
    '/en/projeler/ali': '/en/projeler/masuk-apartmani',
    '/en/projeler/sapanbaglari': '/en/projeler/camoglu-apartmani',
    '/ru/projeler/ali': '/ru/projeler/masuk-apartmani',
    '/ru/projeler/sapanbaglari': '/ru/projeler/camoglu-apartmani',
    '/ar/projeler/ali': '/ar/projeler/masuk-apartmani',
    '/ar/projeler/sapanbaglari': '/ar/projeler/camoglu-apartmani',
  },
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
