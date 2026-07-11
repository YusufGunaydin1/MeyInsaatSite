import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /showcases/proje-detay-yatay-lab: foto solda sabit, sağ panel dikey scroll ile
  yatay akar. Kullanıcının GÖRDÜĞÜ doğrulanır: iğneli modda ray gerçekten
  ötelenir (transform ölçülür), son karede küpür tam hizadadır, ilerleme
  etiketi günceller; reduced-motion ve mobilde dikey yığına düşer; görseller
  decode olur; sayfa dışarı sızmaz.
*/

const PAGE = 'showcases/proje-detay-yatay-lab';

function trackX(transform: string): number {
  if (transform === 'none') return 0;
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return NaN;
  return parseFloat(m[1].split(',')[4]);
}

test.describe('proje-detay yatay lab', () => {
  test('masaüstü: iğneli yatay pan çalışır, kareler hizalanır, etiket günceller', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'iğneli mod yalnız masaüstünde');
    await page.goto(u(PAGE));

    const root = page.getByTestId('yatay-detay');
    await expect(root).toHaveClass(/yd-pinned/);

    const track = page.getByTestId('yd-track');
    const label = page.getByTestId('yd-progress');

    // Kare 1: ray sıfırda, etiket 01
    await root.scrollIntoViewIfNeeded();
    await expect.poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform))).toBe(0);
    await expect(label).toContainText('01 / 03');

    // Pin geometrisi: sahnenin sonuna kaydır → p=1 → ray tam (scrollWidth - pencere) kadar ötelenir
    const geo = await root.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const win = el.querySelector('.yd-window')!;
      const track = el.querySelector('.yd-track')!;
      return {
        top: rect.top + window.scrollY,
        total: el.getBoundingClientRect().height - window.innerHeight,
        pan: track.scrollWidth - win.clientWidth,
      };
    });
    expect(geo.pan).toBeGreaterThan(500);

    await page.evaluate((y) => window.scrollTo(0, y), geo.top + geo.total);
    await expect
      .poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform)))
      .toBeCloseTo(-geo.pan, 0);
    await expect(label).toContainText('03 / 03');
    await expect(label).toContainText('KÜNYE');

    // Son karenin içeriği gerçekten görünür ve görselleri decode olmuştur
    await expect(page.getByTestId('pk-cta')).toBeVisible();
    for (const tid of ['pk-iso', 'pm-map', 'ph-foto-1']) {
      await expect
        .poll(() => page.getByTestId(tid).evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }

    // Ortadaki kare: ok düğmesi geri götürür
    await page.locator('[data-yd-prev]').click();
    await expect(label).toContainText('02 / 03');
  });

  test('reduced-motion: iğne yok, paneller dikey yığın', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'emülasyon tek projede yeter');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(PAGE));
    const root = page.getByTestId('yatay-detay');
    await expect(root).toBeVisible();
    await expect(root).not.toHaveClass(/yd-pinned/);
    // Üç panel de dikey akışta erişilebilir
    for (const tid of ['yd-panel-hikaye', 'yd-panel-mekan', 'yd-panel-kunye']) {
      await page.getByTestId(tid).scrollIntoViewIfNeeded();
      await expect(page.getByTestId(tid)).toBeVisible();
    }
  });

  test('mobil: yığın düzeni, yatay taşma yok, görseller yüklenir', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil proje');
    await page.goto(u(PAGE));
    await expect(page.getByTestId('yatay-detay')).not.toHaveClass(/yd-pinned/);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    for (const tid of ['ph-foto-1', 'pm-strip', 'pk-iso']) {
      const img = page.getByTestId(tid).first();
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test('dışarı sızmaz: noindex + sitemap dışı', async ({ page, request, baseURL }) => {
    await page.goto(u(PAGE));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    const xml = await (await request.get(baseURL + 'sitemap-0.xml')).text();
    expect(xml).not.toContain('proje-detay-yatay-lab');
  });
});
