import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /showcases/proje-detay-lab: Ali detay sayfası için 3 varyant (bölümler ·
  kolaj · dosya). Kullanıcının GÖRDÜĞÜ doğrulanır: her varyantın görselleri
  gerçekten decode olur (naturalWidth>0), serif alıntı gerçekten Plex Serif ile
  çizilir, 360px'te yatay taşma yoktur, sayfa dışarı sızmaz (noindex + sitemap dışı).
*/

test.describe('proje-detay lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(u('showcases/proje-detay-lab'));
  });

  test('üç varyant da render olur, tüm görseller decode edilir', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Proje Detay');

    for (const id of ['variant-bolumler', 'variant-kolaj', 'variant-dosya']) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    // Varyant başına beklenen görsel envanteri (hero + içerik görselleri)
    await expect(page.getByTestId('variant-bolumler').getByTestId('va-strip')).toHaveCount(3);
    await expect(page.getByTestId('vb-foto-1')).toBeVisible();
    await expect(page.getByTestId('vb-foto-2')).toBeVisible();
    await expect(page.getByTestId('vc-iso')).toBeAttached();
    await expect(page.getByTestId('vc-map')).toBeAttached();
    await expect(page.getByTestId('variant-dosya').locator('.vc-chip img')).toHaveCount(4);

    // R36: algılanan özellik — <img> sayfada durmakla kalmaz, gerçekten yüklenir
    const imgs = page.locator('[data-testid^="variant-"] img');
    const n = await imgs.count();
    expect(n).toBeGreaterThanOrEqual(14);
    for (let i = 0; i < n; i++) {
      const img = imgs.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
          message: `img #${i} decode olmadı`,
        })
        .toBeGreaterThan(0);
    }
  });

  test('alıntılar IBM Plex Serif ile çizilir (yüklü font, sadece istenen aile değil)', async ({ page }) => {
    for (const tid of ['va-quote', 'vb-quote']) {
      const quote = page.getByTestId(tid);
      await quote.scrollIntoViewIfNeeded();
      await expect(quote).toBeVisible();
      const family = await quote.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(family).toContain('IBM Plex Serif');
    }
    await page.evaluate(() => (document as Document & { fonts: FontFaceSet }).fonts.ready);
    const loaded = await page.evaluate(() => document.fonts.check('16px "IBM Plex Serif"'));
    expect(loaded).toBe(true);
  });

  test('örnek değerler gri + dipnot görünür (dürüstlük dili)', async ({ page }) => {
    await expect(page.getByText(/örnek yerleşimdir/).first()).toBeVisible();
    const sample = page.getByTestId('variant-dosya').locator('.vc-sample').first();
    await sample.scrollIntoViewIfNeeded();
    const color = await sample.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(102, 105, 109)'); // --color-graphite-400: soluk = doğrulanmamış
  });

  test('yatay taşma yok', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('dışarı sızmaz: noindex + sitemap dışı', async ({ page, request, baseURL }) => {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    const xml = await (await request.get(baseURL + 'sitemap-0.xml')).text();
    expect(xml).not.toContain('proje-detay-lab');
  });
});
