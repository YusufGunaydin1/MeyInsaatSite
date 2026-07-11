import { test, expect, type Page } from '@playwright/test';
import { u } from './util';

/*
  /projeler/ali yatay detay sahnesi: foto solda sabit, sağ pencere dikey scroll
  ile üç kareyi yatay tarar. Kullanıcının GÖRDÜĞÜ doğrulanır: sticky pist
  ortasında GERÇEKTEN iğnelidir (rect.top == computed top ±2 — padding-pist
  hatası bunu sessizce kırar), ray p=1'de tam pan kadar ötelenir, etiket
  01→02→03 günceller, oklar kare atlatır, görseller decode olur, örnek değerler
  gri (dürüstlük) ve dipnot TEKtir. AR'de pan işareti döner (sağdan sola).
  Mobil / reduced-motion / no-JS dikey yığın; 360'ta yatay taşma yok.
*/

const PAGE = 'projeler/ali';
/** Koyulaştırılmış graphite-400 (#66696D) — örnek/gri değerlerin rengi */
const SAMPLE_GREY = 'rgb(102, 105, 109)';

function trackX(transform: string): number {
  if (transform === 'none') return 0;
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return NaN;
  return parseFloat(m[1].split(',')[4]);
}

async function stageGeo(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-pd-stage]') as HTMLElement;
    const sticky = el.querySelector('.pds-sticky') as HTMLElement;
    const win = el.querySelector('.pds-window') as HTMLElement;
    const track = el.querySelector('.pds-track') as HTMLElement;
    const topOff = parseFloat(getComputedStyle(sticky).top) || 0;
    return {
      start: el.getBoundingClientRect().top + window.scrollY - topOff,
      total: el.offsetHeight - sticky.offsetHeight,
      pan: track.scrollWidth - win.clientWidth,
    };
  });
}

test.describe('proje detay — yatay sahne', () => {
  test('masaüstü: iğneli pan çalışır, sticky gerçekten iğneli, etiket ve oklar', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'iğneli mod yalnız masaüstünde');
    await page.goto(u(PAGE));

    const root = page.getByTestId('pd-stage');
    await expect(root).toHaveClass(/pds-pinned/);

    const track = page.getByTestId('pd-track');
    const label = page.getByTestId('pd-progress');

    const geo = await stageGeo(page);
    expect(geo.pan).toBeGreaterThan(500);

    // Kare 1: pist başı → ray sıfırda, etiket 01
    await page.evaluate((y) => window.scrollTo(0, y), geo.start);
    await expect
      .poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform)))
      .toBeCloseTo(0, 0);
    await expect(label).toContainText('01 / 03');

    // Pist ortası: sticky GERÇEKTEN iğnelenmiş — viewport'ta hesaplanan ofsette
    await page.evaluate((y) => window.scrollTo(0, y), geo.start + geo.total * 0.5);
    await expect
      .poll(() =>
        page
          .locator('.pds-sticky')
          .evaluate((el) => Math.abs(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).top) || 0)))
      )
      .toBeLessThan(2);
    await expect(label).toContainText('02 / 03');

    // Pist sonu: p=1 → ray tam (scrollWidth - pencere) kadar ötelenir
    await page.evaluate((y) => window.scrollTo(0, y), geo.start + geo.total);
    await expect
      .poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform)))
      .toBeCloseTo(-geo.pan, 0);
    await expect(label).toContainText('03 / 03');

    // Son karenin içeriği görünür, sahne görselleri decode olmuştur
    await expect(page.getByTestId('pd-cta')).toBeVisible();
    for (const tid of ['pd-iso', 'pd-map', 'pd-foto-1']) {
      await expect
        .poll(() => page.getByTestId(tid).evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }

    // Ok düğmesi geri götürür. dispatchEvent: locator.click() öncesi
    // scrollIntoView sticky düğmeyi DOKÜMAN konumuna kaydırıp p'yi bozuyor.
    await page.locator('[data-pd-prev]').dispatchEvent('click');
    await expect(label).toContainText('02 / 03');

    // Klavye odağı ekran dışı karede kalmaz: odak son kareye sayfayı taşır,
    // pencerenin kendi scroll'u sıfırda kalır (pan hizası bozulmaz)
    await page.evaluate(() =>
      (document.querySelector('[data-testid="pd-cta"]') as HTMLElement).focus()
    );
    await expect(label).toContainText('03 / 03');
    const winScroll = await page
      .locator('.pds-window')
      .evaluate((el) => Math.abs(el.scrollLeft) + Math.abs(el.scrollTop));
    expect(winScroll).toBe(0);
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

  test('AR RTL: pan işareti döner — kareler sağdan sola ilerler', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'iğneli mod yalnız masaüstünde');
    await page.goto(u('ar/projeler/ali'));
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const root = page.getByTestId('pd-stage');
    await expect(root).toHaveClass(/pds-pinned/);
    const track = page.getByTestId('pd-track');
    const geo = await stageGeo(page);

    await page.evaluate((y) => window.scrollTo(0, y), geo.start + geo.total);
    await expect
      .poll(async () => trackX(await track.evaluate((el) => getComputedStyle(el).transform)))
      .toBeCloseTo(geo.pan, 0); // LTR'deki -pan yerine +pan
    await expect(page.getByTestId('pd-progress')).toContainText('03 / 03');
  });

  test('reduced-motion: iğne yok, kareler dikey yığın ve erişilebilir', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'emülasyon tek projede yeter');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(PAGE));
    const root = page.getByTestId('pd-stage');
    await expect(root).toBeVisible();
    await expect(root).not.toHaveClass(/pds-pinned/);
    for (const tid of ['pd-frame-hikaye', 'pd-frame-mekan', 'pd-frame-kunye']) {
      await page.getByTestId(tid).scrollIntoViewIfNeeded();
      await expect(page.getByTestId(tid)).toBeVisible();
    }
  });

  test('mobil 360: yığın düzeni, yatay taşma yok, görseller yüklenir', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil proje');
    await page.goto(u(PAGE));
    await expect(page.getByTestId('pd-stage')).not.toHaveClass(/pds-pinned/);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    for (const tid of ['pd-foto-1', 'pd-strip', 'pd-iso']) {
      const img = page.getByTestId(tid).first();
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
  });
});
