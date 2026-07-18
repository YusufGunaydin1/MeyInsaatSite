import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  KURUMSAL LAB — /showcases/kurumsal-lab (dahili). Üç tasarım yönü (Künye / Vitrin /
  Süreç) render olmalı; her yönün imza bölümü görünmeli; GÖRSELLER GERÇEKTEN yüklenmeli
  (naturalWidth>0 — url DOM'da değil, çözülmüş piksel); eksik sert bilgiler görünür
  rozet kalmalı (uydurma yok); linkler gerçek proje sayfalarına gitmeli. noindex.
*/

const VARIANTS = [
  'variant-secki',
  'variant-dossier',
  'variant-gallery',
  'variant-surec',
];
const SIGNATURES = ['sck-process', 'sck-values', 'dsr-drawbuild', 'gal-hero', 'src-spine'];
const BUILDINGS = ['Maşuk Apartmanı', 'El Ele Apartmanı', 'Çamoğlu Apartmanı'];

test.describe('Kurumsal lab — 3 tasarım yönü', () => {
  test('render + noindex + üç yön ve imza bölümleri var', async ({ page }) => {
    await page.goto(u('showcases/kurumsal-lab'));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex'
    );
    for (const v of VARIANTS) {
      await expect(page.locator(`[data-testid="${v}"]`)).toBeVisible();
    }
    for (const s of SIGNATURES) {
      await expect(page.locator(`[data-testid="${s}"]`)).toBeVisible();
    }
    // Slogan her yönün h1'inde (4 yön: Seçki + Künye + Vitrin + Süreç)
    await expect(page.locator('h1', { hasText: 'inşa ederiz' })).toHaveCount(4);
    // Üç gerçek bina her yönde geçer
    for (const name of BUILDINGS) {
      expect(await page.getByText(name, { exact: false }).count()).toBeGreaterThan(0);
    }
  });

  test('sert bilgiler işaretli, asla uydurulmaz (Kurucu rozeti)', async ({ page }) => {
    await page.goto(u('showcases/kurumsal-lab'));
    await expect(page.getByText('Kurucu:').first()).toBeVisible();
    expect(await page.getByText('Bilgi bekleniyor').count()).toBeGreaterThan(0);
  });

  test('görseller gerçekten yükleniyor (naturalWidth>0) — tüm yönler', async ({
    page,
  }) => {
    await page.goto(u('showcases/kurumsal-lab'));
    // reveal + lazy: sayfayı gez ki tembel görseller görünüre girip çözülsün
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    const imgs = page.locator(
      '[data-testid="variant-secki"] img, [data-testid="variant-dossier"] img, [data-testid="variant-gallery"] img, [data-testid="variant-surec"] img'
    );
    const n = await imgs.count();
    expect(n).toBeGreaterThan(20); // izometrikler + 8 ikon + binalar + malzeme/lobi
    const widths = await imgs.evaluateAll((els) =>
      els.map((e) => (e as HTMLImageElement).naturalWidth)
    );
    const broken = widths.filter((w) => !w || w === 0).length;
    expect(broken, `kırık görsel: ${broken}/${widths.length}`).toBe(0);
  });

  test('linkler gerçek proje detay sayfalarına gidiyor', async ({ page }) => {
    await page.goto(u('showcases/kurumsal-lab'));
    for (const slug of ['ali', 'el-ele-apartmani', 'sapanbaglari']) {
      expect(
        await page.locator(`a[href*="projeler/${slug}"]`).count()
      ).toBeGreaterThan(0);
    }
  });
});
