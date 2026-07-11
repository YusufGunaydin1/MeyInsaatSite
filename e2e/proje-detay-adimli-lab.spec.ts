import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Adımlı varyant: iğne YOK — sayfa scroll'u karelere dokunmaz; kareler yalnız
  Önceki/Sonraki düğmeleriyle değişir. Reduced-motion'da da aynı deneyim.
*/

const PAGE = 'showcases/proje-detay-adimli-lab/';

test.describe('proje-detay adımlı lab', () => {
  test('düğmeler kare değiştirir; scroll değiştirmez; foto sabit', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'masaüstü kurgusu');
    await page.goto(u(PAGE));
    const root = page.getByTestId('yatay-detay-adimli');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveClass(/yda-live/);

    const label = page.getByTestId('yda-progress');
    await expect(label).toContainText('01 / 03');
    await expect(page.locator('[data-yda-prev]')).toBeDisabled();

    // Scroll kareyi DEĞİŞTİRMEZ (iğneli varyanttan ayrışma noktası)
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    await expect(label).toContainText('01 / 03');
    await page.mouse.wheel(0, -400);

    const photoBefore = (await root.locator('.dh-img').first().boundingBox())!;

    await page.locator('[data-yda-next]').click();
    await expect(label).toContainText('02 / 03 — MEKÂN');
    await page.locator('[data-yda-next]').click();
    await expect(label).toContainText('03 / 03 — KÜNYE');
    await expect(page.locator('[data-yda-next]')).toBeDisabled();
    await page.locator('[data-yda-prev]').click();
    await expect(label).toContainText('02 / 03');

    const photoAfter = (await root.locator('.dh-img').first().boundingBox())!;
    expect(Math.abs(photoBefore.x - photoAfter.x), 'foto yerinden oynamaz').toBeLessThan(1);

    // Görünmeyen kareler erişilebilirlik akışından çıkar
    await expect(page.getByTestId('yda-panel-hikaye')).toHaveAttribute('aria-hidden', 'true');
  });

  test('reduced-motion: adımlı deneyim AYNEN çalışır', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'emülasyon tek projede yeter');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(u(PAGE));
    const root = page.getByTestId('yatay-detay-adimli');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveClass(/yda-live/);

    const label = page.getByTestId('yda-progress');
    await page.locator('[data-yda-next]').click();
    await expect(label).toContainText('02 / 03');

    // Kompakt sayfa: foto sütun genişliğinde kalır (dev-foto regresyonu yok)
    const photo = (await root.locator('.dh-img').first().boundingBox())!;
    expect(photo.width).toBeLessThan(500);
  });

  test('mobil: dikey yığın, düğme yok, yatay taşma yok', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'mobil proje');
    await page.goto(u(PAGE));
    const root = page.getByTestId('yatay-detay-adimli');
    await expect(root).not.toHaveClass(/yda-live/);
    await expect(page.locator('[data-yda-next]')).toBeHidden();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    for (const tid of ['yda-panel-hikaye', 'yda-panel-mekan', 'yda-panel-kunye']) {
      await page.getByTestId(tid).scrollIntoViewIfNeeded();
      await expect(page.getByTestId(tid)).toBeVisible();
    }
  });
});
