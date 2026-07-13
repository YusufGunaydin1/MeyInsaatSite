import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Proje detay MOBİL lab: canlı mobil yığının kompakt iki alternatifi (cihaz
  çerçevesinde). A) Kompakt Akış — tek yoğun kaydırma; B) Sekmeli — segment
  kontrol tek bölüm gösterir. Kanıt: iki varyant da render olur, görseller
  decode olur, B sekmeleri tek bölüme geçer, sayfa yatay taşmaz.
*/

const PAGE = 'showcases/proje-detay-mobil-lab';

test.describe('proje-detay mobil lab — kompakt varyantlar', () => {
  test('iki varyant render olur; görseller decode; B sekmeleri çalışır; taşma yok', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'vitrin masaüstünde incelenir');
    await page.goto(u(PAGE));

    // Her iki kompakt mobil varyant da mevcut
    await expect(page.getByTestId('mobil-kompakt')).toBeVisible();
    await expect(page.getByTestId('mobil-sekmeli')).toBeVisible();

    // Sahne görselleri gerçekten decode olur — URL DOM'da olması yetmez (R36)
    for (const tid of ['m-iso', 'm-strip']) {
      await expect
        .poll(() => page.getByTestId(tid).first().evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }

    // Varyant B: JS aktif → tek bölüm görünür; sekmeler HİKÂYE→MEKÂN→KÜNYE geçer
    const sek = page.getByTestId('mobil-sekmeli');
    await expect(sek).toHaveClass(/is-live/);
    await expect(sek.getByTestId('msk-panel-0')).toBeVisible();
    await expect(sek.getByTestId('msk-panel-1')).toBeHidden();
    await sek.locator('[data-msk-tab="1"]').click();
    await expect(sek.getByTestId('msk-panel-1')).toBeVisible();
    await expect(sek.getByTestId('msk-panel-0')).toBeHidden();
    await sek.locator('[data-msk-tab="2"]').click();
    await expect(sek.getByTestId('msk-panel-2')).toBeVisible();
    await expect(sek.locator('[data-msk-tab="2"]')).toHaveAttribute('aria-selected', 'true');

    // Kompakt varyant kendi CTA'sını taşır
    await expect(page.getByTestId('mobil-kompakt').getByTestId('m-cta')).toBeVisible();

    // Sayfa yatay taşma yapmaz
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
