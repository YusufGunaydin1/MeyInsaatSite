import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Satılık Daireler — ÜÇ YÖN ailesi (album / sergi / aksam + uc-yon karşılaştırma).
  Paralel oturumun editoryal/mimari/monolit ailesi kendi spec'lerinde; burada
  YALNIZ uc-yon ailesi doğrulanır. Ana alıcı yolculuğu albüm yönü üzerinden
  uçtan uca yürür; görseller decode edilir (URL DOM'da olması yetmez — R36).
*/

const ROOT = 'showcases/satilik-daireler';
const YONLER = ['album', 'sergi', 'aksam'] as const;
const PAGES = ['', 'daireler', 'daire-1', 'daire-2', 'el-ele-apartmani', 'galeri', 'iletisim'];

test('uc-yon karşılaştırması üç yönü açıklamalarıyla listeler', async ({ page }) => {
  await page.goto(u(`${ROOT}/uc-yon`));
  await expect(page.locator('h1')).toContainText('Üç Tasarım Yönü');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  for (const yon of YONLER) {
    const card = page.getByTestId(`sv-variation-${yon}`);
    await expect(card).toBeVisible();
    await expect(card).toContainText('ALICI İZLENİMİ');
    await expect(card.getByTestId(`sv-open-${yon}`)).toHaveAttribute('href', new RegExp(`${ROOT}/${yon}$`));
  }
});

test.describe('alıcı yolculuğu — albüm yönü', () => {
  test('masaüstü: giriş → daireler → daire 1 → galeri/lightbox → daire 2 → randevu', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'masaüstü yolculuğu');

    await page.goto(u(`${ROOT}/album`));
    await page.getByTestId('sv-cta-daireler').click();
    await expect(page).toHaveURL(/album\/daireler/);
    await expect(page.getByTestId('sv-apt-daire-1')).toBeVisible();

    await page.getByTestId('sv-open-daire-1').click();
    await expect(page.getByTestId('sv-detail-daire-1')).toBeVisible();
    // Hero fotoğrafı gerçekten decode olur
    await expect
      .poll(() => page.locator('main img').first().evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    // Uydurulmamış bilgiler görünür rozet olarak durur
    expect(await page.getByTestId('sv-chip').count()).toBeGreaterThan(0);

    // Galeri: daire-1 derin bağlantısı sekmeyi önceden seçer
    await page.goto(u(`${ROOT}/album/galeri?bolum=daire-1`));
    await expect(page.getByTestId('sv-tab-daire-1')).toHaveAttribute('aria-selected', 'true');
    const first = page.getByTestId('sv-gallery-item').first();
    await first.click();
    const lightbox = page.getByTestId('sv-lightbox');
    await expect(lightbox).toBeVisible();
    await expect(page.getByTestId('sv-lightbox-counter')).toContainText('1 /');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('sv-lightbox-counter')).toContainText('2 /');
    await page.getByTestId('sv-lightbox-prev').click();
    await expect(page.getByTestId('sv-lightbox-counter')).toContainText('1 /');
    await expect
      .poll(() => lightbox.locator('img').evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();

    // Daire 2'ye doğal geçiş ve oradan randevuya ön-seçimli gidiş
    await page.goto(u(`${ROOT}/album/daire-1`));
    await page.getByTestId('sv-switch-daire-2').click();
    await expect(page.getByTestId('sv-detail-daire-2')).toBeVisible();

    await page.goto(u(`${ROOT}/album/iletisim?daire=daire-2`));
    await expect(page.getByTestId('svf-apartment-daire2')).toBeChecked();

    // Doğrulama: boş gönderim hataları gösterir, sonra başarı durumu
    await page.getByTestId('svf-apartment-ikiside').check();
    await page.getByTestId('svf-submit').click();
    await expect(page.getByTestId('svf-err-name')).toBeVisible();
    await page.locator('#svf-name').fill('Deneme Alıcı');
    await page.locator('#svf-contact').fill('deneme@ornek.com');
    await page.getByTestId('svf-submit').click();
    await expect(page.getByTestId('svf-success')).toBeVisible({ timeout: 4000 });

    // Hata durumu vitrin kontrolüyle canlandırılır
    await page.getByTestId('svf-again').click();
    await page.getByTestId('svf-demo').getByLabel('Hatalı').check();
    await page.locator('#svf-name').fill('Deneme Alıcı');
    await page.locator('#svf-contact').fill('deneme@ornek.com');
    await page.getByTestId('svf-apartment-daire1').check();
    await page.getByTestId('svf-submit').click();
    await expect(page.getByTestId('svf-failure')).toBeVisible({ timeout: 4000 });
  });

  test('mobil 360: perde menü, gezinme, taşma yok, görseller yüklenir', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil proje');

    await page.goto(u(`${ROOT}/album`));
    const overflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);

    await page.getByTestId('sv-nav-toggle').click();
    const mobileNav = page.getByTestId('sv-nav-mobile');
    await expect(mobileNav).toBeVisible();
    await mobileNav.getByRole('link', { name: 'Daire 2' }).click();
    await expect(page.getByTestId('sv-detail-daire-2')).toBeVisible();
    expect(await overflow()).toBeLessThanOrEqual(0);
    const img = page.locator('main img').first();
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  });
});

test.describe('sergi ve akşam yönleri', () => {
  test('sergi: sol ray gezinmesi ve pafta düzeni (masaüstü)', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'ray yalnız masaüstünde');
    await page.goto(u(`${ROOT}/sergi`));
    const rail = page.getByTestId('sv-nav-desktop');
    await expect(rail).toBeVisible();
    await rail.getByRole('link', { name: 'Daire 2' }).click();
    await expect(page.getByTestId('sv-detail-daire-2')).toBeVisible();
    await expect(page.getByTestId('sv-facts')).toContainText('3+2');
  });

  test('akşam: yapışkan randevu çubuğu kaydırınca belirir', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'masaüstü kontrolü');
    await page.goto(u(`${ROOT}/aksam`));
    const sticky = page.getByTestId('sv-sticky-cta');
    await expect(sticky).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(sticky).toBeVisible();
    // iletisim sayfasında çubuk yok
    await page.goto(u(`${ROOT}/aksam/iletisim`));
    await expect(page.getByTestId('sv-sticky-cta')).toHaveCount(0);
  });

  test('mobil 360: sergi üst bar paneli ve akşam alt-sayfa menüsü çalışır', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil proje');
    for (const yon of ['sergi', 'aksam'] as const) {
      await page.goto(u(`${ROOT}/${yon}`));
      await page.getByTestId('sv-nav-toggle').click();
      const nav = page.getByTestId('sv-nav-mobile');
      await expect(nav).toBeVisible();
      await nav.getByRole('link', { name: 'Galeri' }).click();
      await expect(page.getByTestId('sv-gallery')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});

test('filigranlı kareler ve ölü uçlar: tüm aile sayfaları temiz', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'tek projede tarama yeter');
  for (const yon of YONLER) {
    for (const p of PAGES) {
      await page.goto(u(`${ROOT}/${yon}${p ? '/' + p : ''}`));
      // Üçüncü taraf filigranlı kare (cevre-deniz) hiçbir yerde render edilmez.
      // (daire-1/d2-teras.png engeli derleme düzeyinde: publicAsset() fırlatır;
      // dosya adı temiz daire-2/d2-teras.png ile çakıştığından URL'den ayırt edilemez.)
      expect(await page.content()).not.toContain('cevre-deniz');
      // Sayfada en az bir yön-içi bağlantı hedefi var (ölü uç yok)
      expect(
        await page.locator(`a[href*="${ROOT}/${yon}"]`).count()
      ).toBeGreaterThan(0);
    }
  }
});
