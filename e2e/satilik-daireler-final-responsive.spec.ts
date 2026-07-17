import { expect, test } from '@playwright/test';
import { u } from './util';

const ROOT = 'showcases/satilik-daireler';

const expectNoHorizontalOverflow = async (page: import('@playwright/test').Page) => {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
};

test.describe('kompakt mobil Satılık Daireler akışı', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil davranış 360×740 projesinde doğrulanır');
  });

  test('mobil menü klavye ile açılır, kapanır ve alıcı rotasına gider', async ({ page }) => {
    await page.goto(u(ROOT));
    const header = page.getByTestId('sd-header');
    const toggle = page.getByTestId('sd-nav-toggle');
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeGreaterThanOrEqual(56);
    expect(headerBox?.height).toBeLessThanOrEqual(64);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('sd-nav-mobile')).toBeVisible();
    await expect(page.getByTestId('sd-nav-mobile').getByRole('link', { name: 'Ana Sayfa', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('sd-nav-mobile')).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.getByTestId('sd-nav-mobile').getByRole('link', { name: 'Galeri', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${ROOT}/galeri/?$`));
    await expect(page.getByTestId('sd-gallery-page')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('kök ve iki daire geçişi yatay taşma ya da sabit engel üretmez', async ({ page }) => {
    await page.goto(u(ROOT));
    await expect(page.getByTestId('sd-card-daire-1')).toBeVisible();
    await expect(page.getByTestId('sd-card-daire-2')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(await page.locator('main *').evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).position === 'fixed').length)).toBe(0);

    await page.getByTestId('sd-card-daire-1').getByRole('link', { name: /Daire 1 detaylarını gör/ }).click();
    await expect(page.getByTestId('sd-detail-daire-1')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByTestId('sd-apartment-switch').getByRole('link', { name: /Daire 2.*geç/ }).click();
    await expect(page.getByTestId('sd-detail-daire-2')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('mobil galeride filtreler ve ışık kutusu dokunmatik hedeflerini korur', async ({ page }) => {
    await page.goto(u(`${ROOT}/galeri`));
    const gallery = page.getByTestId('sd-gallery-full');
    await gallery.locator('[data-gallery-filter="ortak"]').click();
    await expect(gallery.locator('[data-gallery-item]')).toHaveCount(2);

    const filterBoxes = await gallery.locator('[data-gallery-filter]').evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(filterBoxes.every((box) => box.width >= 44 && box.height >= 44)).toBe(true);

    await gallery.locator('[data-gallery-item]').first().click();
    await expect(page.getByTestId('sd-lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('sd-lightbox')).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });

  test('mobil form doğrulamayı içerik üstünü kapatmadan gösterir', async ({ page }) => {
    await page.goto(u(`${ROOT}/iletisim`));
    const form = page.getByTestId('sd-viewing-form');
    await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
    await expect(page.getByTestId('sd-form-summary')).toBeVisible();
    await expect(page.getByTestId('sd-form-summary').locator('li')).toHaveCount(6);
    await expectNoHorizontalOverflow(page);
    expect(await page.locator('.sd-contact-layout *').evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).position === 'fixed').length)).toBe(0);
  });
});
