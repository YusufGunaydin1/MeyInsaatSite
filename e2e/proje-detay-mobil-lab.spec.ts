import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Proje detay MOBİL lab: seçilen KOMPAKT AKIŞ (Variant A) — canlı prod bileşeni
  (`MobileDetail`) cihaz çerçevesinde önizlenir (Ali verisi). Kanıt: kompakt blok
  render olur, sahne görselleri decode olur, CTA var, sayfa yatay taşmaz.
*/

const PAGE = 'showcases/proje-detay-mobil-lab';

test.describe('proje-detay mobil lab — kompakt akış (canlı)', () => {
  test('kompakt blok render olur; görseller decode; CTA var; taşma yok', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'vitrin masaüstünde incelenir');
    await page.goto(u(PAGE));

    const pdm = page.getByTestId('pd-mobile');
    await expect(pdm).toBeVisible();
    await expect(pdm.getByTestId('pdm-cta')).toBeVisible();

    // Sahne görselleri gerçekten decode olur — URL DOM'da olması yetmez (R36)
    for (const tid of ['pdm-cover', 'pdm-strip', 'pdm-iso']) {
      const img = page.getByTestId(tid).first();
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
