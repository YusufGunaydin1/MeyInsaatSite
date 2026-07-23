import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
  Yayınlanan URL sözleşmesi — dist/ üzerinden doğrulanır (canlıya giden şey budur).

  Site tek bir kanonik biçim yayınlar: sondaki eğik çizgi. GitHub Pages /kurumsal
  isteğini /kurumsal/ adresine 301'ler; canonical, hreflang, sitemap ve iç
  bağlantılar bu biçimde AYRIŞIRSA her tarama bir yönlendirme masrafı öder ve
  Google "yönlendirmeli sayfa" kaydı tutar. Henüz hiç indekslenmemiş bir sitede
  bu doğrudan indeksleme hızına yazılır.

  Bu spec tarayıcı açmaz; üretilen HTML'i okur.
*/

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const ORIGIN = 'https://meyinsaat.com';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

interface Page {
  file: string;
  url: string;
  html: string;
  canonical: string | null;
  noindex: boolean;
  isRedirectStub: boolean;
}

const pages: Page[] = htmlFiles(DIST).map((file) => {
  const html = readFileSync(file, 'utf8');
  const rel = relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  return {
    file: relative(DIST, file),
    url: `${ORIGIN}/${rel}`,
    html,
    canonical: /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1] ?? null,
    noindex: /content="noindex/.test(html),
    isRedirectStub: /http-equiv="refresh"/.test(html),
  };
});

const real = pages.filter((p) => !p.isRedirectStub);
const indexable = real.filter((p) => !p.noindex);

const sitemapUrls = new Set(
  [...readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (m) => m[1]
  )
);

test('dist gerçekten üretilmiş ve sayfalar bulunmuş', () => {
  expect(real.length).toBeGreaterThan(30);
  expect(indexable.length).toBeGreaterThan(30);
});

test('her sayfanın canonical değeri kendi URL’sidir (sondaki eğik çizgi dahil)', () => {
  const wrong = indexable
    .filter((p) => p.canonical !== p.url)
    .map((p) => `${p.file}: canonical=${p.canonical} beklenen=${p.url}`);
  expect(wrong).toEqual([]);
});

test('sitemap kümesi indekslenebilir sayfa kümesiyle birebir aynıdır', () => {
  const built = new Set(indexable.map((p) => p.url));
  expect([...sitemapUrls].filter((u) => !built.has(u))).toEqual([]);
  expect([...built].filter((u) => !sitemapUrls.has(u))).toEqual([]);
});

test('hreflang bağlantıları dört dili + x-default kapsar ve hepsi eğik çizgiyle biter', () => {
  const page = real.find((p) => p.file === 'kurumsal/index.html')!;
  const pairs = [
    ...page.html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g),
  ].map((m) => [m[1], m[2]] as const);
  expect(pairs.map(([lang]) => lang)).toEqual(['tr', 'en', 'ru', 'ar', 'x-default']);
  for (const [lang, href] of pairs) {
    expect(href, `hreflang=${lang} eğik çizgisiz`).toMatch(/\/$/);
    expect(href).toMatch(/^https:\/\/meyinsaat\.com\//);
  }
});

test('hiçbir iç bağlantı yönlendirmeye düşmez (showcases dışı)', () => {
  const offenders: string[] = [];
  for (const p of real) {
    if (p.file.startsWith('showcases/')) continue; // dahili tasarım vitrini, noindex
    for (const m of p.html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const href = m[1];
      if (href.endsWith('/')) continue;
      if (/\.[a-z0-9]{2,5}$/i.test(href)) continue; // dosya (görsel, xml, css…)
      offenders.push(`${p.file} → ${href}`);
    }
  }
  expect(offenders).toEqual([]);
});

test('yönlendirme sayfaları noindex taşır ve hedefe canonical verir', () => {
  const stubs = pages.filter((p) => p.isRedirectStub);
  expect(stubs.length).toBeGreaterThan(0);
  for (const s of stubs) {
    expect(s.noindex, `${s.file} noindex taşımıyor`).toBe(true);
    expect(s.canonical, `${s.file} canonical yok`).toMatch(/\/$/);
  }
});

test('satılan daire sayfası noindex ve sitemap dışıdır; canlı D-12 indekslenir', () => {
  const sold = real.filter((p) => p.file.includes('el-ele-apartmani-3-2-dubleks-satildi'));
  expect(sold.length).toBe(4); // dört dil
  for (const p of sold) {
    expect(p.noindex, `${p.file} noindex değil`).toBe(true);
    expect(sitemapUrls.has(p.url)).toBe(false);
  }
  expect(sitemapUrls.has(`${ORIGIN}/satilik-daireler/pendik-satilik-3-2-dubleks/`)).toBe(true);
});
