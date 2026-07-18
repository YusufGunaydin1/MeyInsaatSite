import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /projeler/masuk-apartmani detay sahnesi — ADIMLI: foto solda sabit; sağ pencere üç kareyi
  1:1 gösterir, kareler YALNIZ Önceki/Sonraki düğmeleriyle değişir. Kullanıcının
  GÖRDÜĞÜ doğrulanır: scroll kareyi DEĞİŞTİRMEZ, düğmeler 01→02→03 yürütür ve
  uçlarda pasifleşir, foto yerinden oynamaz, görseller decode olur, örnek
  değerler gri (dürüstlük) ve dipnot TEKtir. AR'de kayma işareti döner.
  Reduced-motion AYNI adımlı deneyimi alır. Dar ekran/no-JS dikey yığın.
*/

const PAGE = 'projeler/masuk-apartmani';
/** Koyulaştırılmış graphite-400 (#66696D) — örnek/gri değerlerin rengi */
const SAMPLE_GREY = 'rgb(102, 105, 109)';

function trackX(transform: string): number {
  if (transform === 'none') return 0;
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return NaN;
  return parseFloat(m[1].split(',')[4]);
}

test.describe('proje detay — adımlı sahne', () => {
  test('masaüstü: düğmeler kare değiştirir, scroll değiştirmez, foto sabit', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'adımlı mod yalnız masaüstünde');
    await page.goto(u(PAGE));

    const root = page.getByTestId('pd-stage');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveClass(/pds-live/);

    const track = page.getByTestId('pd-track');
    const label = page.getByTestId('pd-progress');
    await expect(label).toContainText('01 / 03');
    await expect(page.locator('[data-pd-prev]')).toBeDisabled();

    // Eylem düğmesi göze çarpar: marka kırmızısı zemin + beyaz yazı;
    // pasif uç nötrdür (kırmızı DEĞİL) — tek kırmızı, basılabilir olandır
    await expect(page.locator('[data-pd-next]')).toHaveCSS('background-color', 'rgb(181, 35, 35)');
    await expect(page.locator('[data-pd-next]')).toHaveCSS('color', 'rgb(255, 255, 255)');
    const prevBg = await page
      .locator('[data-pd-prev]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(prevBg).not.toBe('rgb(181, 35, 35)');

    // Scroll kareyi DEĞİŞTİRMEZ (eski iğneli kurgudan ayrışma noktası)
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(250);
    await expect(label).toContainText('01 / 03');
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(250);

    const winW = await page.locator('.pds-window').evaluate((el) => el.clientWidth);
    const photoBefore = (await root.locator('.pds-left img').first().boundingBox())!;

    // 01 → 02 → 03: ray kare genişliği kadar kayar, etiket günceller
    await page.locator('[data-pd-next]').dispatchEvent('click');
    await expect(label).toContainText('02 / 03');
    await expect
      .poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform)))
      .toBeCloseTo(-winW, 0);

    await page.locator('[data-pd-next]').dispatchEvent('click');
    await expect(label).toContainText('03 / 03');
    await expect(page.locator('[data-pd-next]')).toBeDisabled();

    // Son karenin içeriği görünür, sahne görselleri decode olmuştur
    await expect(page.getByTestId('pd-cta')).toBeVisible();
    for (const tid of ['pd-iso', 'pd-foto-1']) {
      await expect
        .poll(() => page.getByTestId(tid).first().evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }

    // Geri: Önceki çalışır
    await page.locator('[data-pd-prev]').dispatchEvent('click');
    await expect(label).toContainText('02 / 03');

    // Foto yerinden oynamamıştır; pencerenin kendi scroll'u sıfırdadır
    const photoAfter = (await root.locator('.pds-left img').first().boundingBox())!;
    expect(Math.abs(photoBefore.x - photoAfter.x)).toBeLessThan(1);
    const winScroll = await page
      .locator('.pds-window')
      .evaluate((el) => Math.abs(el.scrollLeft) + Math.abs(el.scrollTop));
    expect(winScroll).toBe(0);

    // Görünmeyen kareler odak akışından çıkar (inert + aria-hidden)
    await expect(page.getByTestId('pd-frame-hikaye')).toHaveAttribute('aria-hidden', 'true');
  });

  test('dürüstlük: örnek değerler gri, gerçek değerler değil, dipnot TEK', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'renk denetimi tek projede yeter');
    await page.goto(u(PAGE));

    // Örnek (doğrulanmamış) değer gri graphite-400 — künye YER satırı
    const sample = page.locator('.pk-sample').first();
    await expect(sample).toHaveCSS('color', SAMPLE_GREY);
    // Gerçek değer (PROJE TİPİ: KONUT) gri DEĞİL
    const real = page.locator('.pk-ozet-v:not(.pk-sample)').first();
    const realColor = await real.evaluate((el) => getComputedStyle(el).color);
    expect(realColor).not.toBe(SAMPLE_GREY);
    // Açıklayan t-caption dipnotu tam olarak BİR kez
    await expect(page.getByTestId('pd-note')).toHaveCount(1);
  });

  test('AR RTL: kayma işareti döner — kareler sağdan sola ilerler', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'adımlı mod yalnız masaüstünde');
    await page.goto(u('ar/projeler/masuk-apartmani'));
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const root = page.getByTestId('pd-stage');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveClass(/pds-live/);
    const track = page.getByTestId('pd-track');
    const winW = await page.locator('.pds-window').evaluate((el) => el.clientWidth);

    await page.locator('[data-pd-next]').dispatchEvent('click');
    await expect(page.getByTestId('pd-progress')).toContainText('02 / 03');
    await expect
      .poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform)))
      .toBeCloseTo(winW, 0); // LTR'deki -winW yerine +winW
  });

  test('reduced-motion: adımlı deneyim AYNEN çalışır, foto sütunda kalır', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'emülasyon tek projede yeter');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(PAGE));
    const root = page.getByTestId('pd-stage');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveClass(/pds-live/);

    const label = page.getByTestId('pd-progress');
    await page.locator('[data-pd-next]').dispatchEvent('click');
    await expect(label).toContainText('02 / 03');

    // Kompakt sayfa: foto konteyner genişliğine şişmez
    const photo = (await root.locator('.pds-left img').first().boundingBox())!;
    expect(photo.width).toBeLessThan(500);
  });

  test('mobil 360: yığın düzeni, yatay taşma yok, görseller yüklenir', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil proje');
    await page.goto(u(PAGE));
    // <1024: masaüstü sahne gizli, kompakt mobil akış (Variant A) görünür
    await expect(page.getByTestId('pd-stage')).toBeHidden();
    await expect(page.getByTestId('pd-mobile')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    for (const tid of ['pdm-cover', 'pdm-strip', 'pdm-iso']) {
      const img = page.getByTestId(tid).first();
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
  });
});
