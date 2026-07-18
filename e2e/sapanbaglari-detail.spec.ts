import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /projeler/sapanbaglari — Maşuk/El Ele ile AYNI adımlı detay sahnesini kullanır ama
  KENDİ metnini taşır (beyaz-antrasit modern cephe · beyaz beton · antrasit panel).
  Bu spec, üçüncü bir projenin sahneyi doğru açtığını ve ne Maşuk ne de El Ele
  metninin SIZMADIĞINI kanıtlar: zengin sahne var, adımlar yürür, görseller decode
  olur, metin sapanbaglari'ya özgü. Maşuk'un/El Ele'nin kendi davranışı kendi
  spec'lerinde; burada tekrar edilmez.
*/

const PAGE = 'projeler/sapanbaglari';

test.describe('çamoğlu detay — kendi metniyle adımlı sahne', () => {
  test('masaüstü: zengin sahne açılır, adımlar yürür, çamoğlu metni (Maşuk/El Ele sızıntısı yok)', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'adımlı mod yalnız masaüstünde');
    await page.goto(u(PAGE));

    const root = page.getByTestId('pd-stage');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveClass(/pds-live/); // basit hero değil → zengin sahne

    // Çamoğlu Apartmanı'na ÖZGÜ metin (paylaşımlı Maşuk metni de El Ele metni de değil)
    await expect(page.getByTestId('pd-quote')).toContainText('Yalın hat');
    await expect(root).toContainText('Beyaz-antrasit cephe');

    // Maşuk'un metni SIZMAMALI
    await expect(root).not.toContainText('Cam balkon');
    await expect(root).not.toContainText(/Bağcılar/i);
    // El Ele'nin metni SIZMAMALI
    await expect(root).not.toContainText('Ferforje');
    await expect(root).not.toContainText('Klasik zarafet');

    // Adımlar: 01 → 02 → 03, uçlarda pasifleşir
    const label = page.getByTestId('pd-progress');
    await expect(label).toContainText('01 / 03');
    await expect(page.locator('[data-pd-prev]')).toBeDisabled();
    await page.locator('[data-pd-next]').dispatchEvent('click');
    await expect(label).toContainText('02 / 03');
    await page.locator('[data-pd-next]').dispatchEvent('click');
    await expect(label).toContainText('03 / 03');
    await expect(page.locator('[data-pd-next]')).toBeDisabled();

    // Künye karesi çamoğlu malzeme paletini + kendi aksonometrisini gösterir
    await expect(page.getByTestId('pd-cta')).toBeVisible();
    await expect(root).toContainText('ANTRASİT PANEL');

    // Sahne görselleri gerçekten DECODE olur (URL DOM'da olması yetmez — R36)
    for (const tid of ['pd-iso', 'pd-foto-1']) {
      await expect
        .poll(() => page.getByTestId(tid).first().evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
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
