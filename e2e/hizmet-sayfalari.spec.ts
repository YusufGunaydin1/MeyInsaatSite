import { test, expect, type Page } from '@playwright/test';
import { u } from './util';

/*
  Kat karşılığı / kentsel dönüşüm / anahtar teslim sayfaları.

  Bu üç sayfa arsa sahibi ve kat maliki sorgularının indiği yer. Test ettiği
  şey "sayfa 200 döndü" değil: başlığın gerçekten GÖRÜNÜR olduğu (satılık
  index'inde H1 mobilde display:none kaldığı için indekslenen viewport'ta
  kaybolmuştu — aynı hata burada tekrarlanmasın), yalnız TR yayınlandığı ve
  yapısal verinin sayfada görünen metinle aynı olduğu.
*/

const SAYFALAR = [
  {
    slug: 'kat-karsiligi-insaat',
    baslik: "Pendik'te Kat Karşılığı İnşaat",
    metaTitle: 'Pendik Kat Karşılığı İnşaat — MEY İnşaat',
    referansVar: true,
  },
  {
    slug: 'kentsel-donusum',
    baslik: 'Kentsel Dönüşüm ve Riskli Bina Yenileme',
    metaTitle: 'Kentsel Dönüşüm ve Riskli Bina Yenileme — MEY İnşaat',
    referansVar: false,
  },
  {
    slug: 'anahtar-teslim-insaat',
    baslik: 'Anahtar Teslim İnşaat — Kendi Arsanıza',
    metaTitle: 'Anahtar Teslim İnşaat, İstanbul — MEY İnşaat',
    referansVar: false,
  },
];

async function ldNodes(page: Page): Promise<any[]> {
  return page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => JSON.parse(e.textContent || '{}'))
  );
}

for (const s of SAYFALAR) {
  test.describe(`/hizmetler/${s.slug}/`, () => {
    test('H1 gerçekten görünür ve doğru metni taşır', async ({ page }) => {
      await page.goto(u(`/hizmetler/${s.slug}/`));
      const h1 = page.locator('h1');
      await expect(h1).toHaveText(s.baslik);
      // Görünürlük iddiası: yalnız DOM'da olması yetmez, yükseklik almalı.
      await expect(h1).toBeVisible();
      expect((await h1.boundingBox())!.height).toBeGreaterThan(0);
    });

    test('title + canonical + tek dilli hreflang', async ({ page }) => {
      await page.goto(u(`/hizmetler/${s.slug}/`));
      await expect(page).toHaveTitle(s.metaTitle);

      const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
      expect(canonical).toBe(`https://meyinsaat.com/hizmetler/${s.slug}/`);

      // Mevzuat metni makine çevirisiyle yayınlanmaz: yalnız TR ilan edilir,
      // x-default yok (tek dil varken anlamsız), EN/RU/AR ikizi yok.
      const alts = await page.$$eval('link[rel="alternate"]', (els) =>
        els.map((e) => e.getAttribute('hreflang'))
      );
      expect(alts).toEqual(['tr']);

      const robots = await page.getAttribute('meta[name="robots"]', 'content');
      expect(robots).toContain('index,follow');
    });

    test('Service + FAQPage şeması sayfadaki metinle aynı', async ({ page }) => {
      await page.goto(u(`/hizmetler/${s.slug}/`));
      const nodes = await ldNodes(page);

      const service = nodes.find((n) => n['@type'] === 'Service');
      expect(service, 'Service düğümü yok').toBeTruthy();
      expect(service.provider['@id']).toBe('https://meyinsaat.com/#org');
      expect(service.areaServed.map((a: any) => a.name)).toContain('Pendik');

      const faq = nodes.find((n) => n['@type'] === 'FAQPage');
      expect(faq, 'FAQPage düğümü yok').toBeTruthy();

      // Google, sayfada bulunmayan cevabı gördüğünde yapıyı yok sayar —
      // şemadaki her soru gerçekten <dt> olarak basılmalı.
      const gorunenSorular = await page.$$eval('dt', (els) =>
        els.map((e) => e.textContent!.trim())
      );
      for (const q of faq.mainEntity) {
        expect(gorunenSorular, `şemadaki soru sayfada yok: ${q.name}`).toContain(q.name);
      }
    });

    test('satış hattına giden bir CTA var', async ({ page }) => {
      await page.goto(u(`/hizmetler/${s.slug}/`));
      const cta = page.getByTestId('service-call');
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute('href', 'tel:+905326256812');
    });

    test('360px viewport yatay taşma üretmiyor', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(u(`/hizmetler/${s.slug}/`));
      const tasma = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(tasma).toBe(false);
    });

    if (s.referansVar) {
      test('referans binalar proje sayfalarına link veriyor', async ({ page }) => {
        await page.goto(u(`/hizmetler/${s.slug}/`));
        for (const slug of ['el-ele-apartmani', 'camoglu-apartmani', 'masuk-apartmani']) {
          await expect(page.locator(`a[href="/projeler/${slug}/"]`)).toHaveCount(1);
        }
      });
    }
  });
}

test('/hizmetler/ üç hizmet sayfasının hepsine link veriyor', async ({ page }) => {
  await page.goto(u('/hizmetler/'));
  for (const s of SAYFALAR) {
    const link = page.locator(`a[href="/hizmetler/${s.slug}/"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toBeVisible();
  }
});

test('EN/RU/AR hizmet sayfalarına klon üretmiyor', async ({ page }) => {
  for (const lang of ['en', 'ru', 'ar']) {
    const res = await page.goto(u(`/${lang}/hizmetler/kat-karsiligi-insaat/`));
    expect(res!.status(), `/${lang}/ klonu yayında`).toBe(404);
  }
});
