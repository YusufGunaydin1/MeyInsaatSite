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
    // Eski satılık daire slug'ları (daire-1/daire-2 — yayında linklenmiş/indekslenmiş
    // olabilir) → profesyonel, aranan URL'ler. daire-2 indekslenmişti; kalıcı link
    // değeri için host/CDN'de ayrıca 301 önerilir (statik çıktı meta-refresh üretir).
    '/satilik-daireler/daire-2': '/satilik-daireler/pendik-satilik-3-2-dubleks',
    '/satilik-daireler/daire-1': '/satilik-daireler/el-ele-apartmani-3-2-dubleks-satildi',
    '/en/satilik-daireler/daire-2': '/en/satilik-daireler/pendik-satilik-3-2-dubleks',
    '/en/satilik-daireler/daire-1': '/en/satilik-daireler/el-ele-apartmani-3-2-dubleks-satildi',
    '/ru/satilik-daireler/daire-2': '/ru/satilik-daireler/pendik-satilik-3-2-dubleks',
    '/ru/satilik-daireler/daire-1': '/ru/satilik-daireler/el-ele-apartmani-3-2-dubleks-satildi',
    '/ar/satilik-daireler/daire-2': '/ar/satilik-daireler/pendik-satilik-3-2-dubleks',
    '/ar/satilik-daireler/daire-1': '/ar/satilik-daireler/el-ele-apartmani-3-2-dubleks-satildi',
  },
  // /showcases = dahili tasarım vitrini: sitemap dışı (sayfa ayrıca noindex).
  // /satilik-daireler = CANLI ve gerçek (D-12 sahibinden ilanı) → sitemap'e girer.
  // Tek istisna satılan D-11 (el-ele-apartmani-3-2-dubleks-satildi): noindex → dışlanır.
  // DİKKAT: dışlama dizesi satılan slug'ın TAMAMI; canlı slug'ın alt-dizesi DEĞİL
  // (Şema A ayrık kökler kullanır) — yoksa .includes() canlı D-12'yi de düşürürdü.
  integrations: [react(), sitemap({
    i18n: {
      defaultLocale: 'tr',
      locales: { tr: 'tr-TR', en: 'en-US', ru: 'ru-RU', ar: 'ar-SA' },
    },
    filter: (page) =>
      !page.includes('/showcases') &&
      !page.includes('/satilik-daireler/el-ele-apartmani-3-2-dubleks-satildi'),
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
