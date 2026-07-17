import { test, expect } from '@playwright/test';
import { u } from './util';

const ROOT = 'showcases/satilik-daireler';
const variations = ['editoryal', 'mimari', 'monolit'] as const;

test('mobil menü klavye ile açılır, kapanır ve odağı geri verir', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'mobil proje');

  for (const variation of variations) {
    await page.goto(u(`${ROOT}/${variation}`));
    const toggle = page.locator('[data-sale-menu-toggle]');
    await expect(toggle).toHaveAccessibleName('Menüyü aç');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Menüyü kapat');
    await expect(page.getByRole('navigation', { name: 'Mobil satılık daireler navigasyonu' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  }
});

test('mobil ana akışlarda yatay taşma, kırpılmış kontrol ve eksik alt yok', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'mobil proje');
  const routes = variations.flatMap((variation) => [
    `${ROOT}/${variation}`,
    `${ROOT}/${variation}/daireler`,
    `${ROOT}/${variation}/galeri`,
    `${ROOT}/${variation}/iletisim`,
  ]);

  for (const route of routes) {
    await page.goto(u(route));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(0);

    const missingAlt = await page.locator('img').evaluateAll((images) =>
      images.filter((image) => !image.hasAttribute('alt')).map((image) => image.getAttribute('src'))
    );
    expect(missingAlt, `missing alt on ${route}`).toEqual([]);
  }
});

test('mobil lightbox dokunma hedefleri ve çıkış davranışı', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'mobil proje');
  await page.goto(u(`${ROOT}/monolit/galeri`));
  await page.getByRole('button', { name: 'Daire 1', exact: true }).click();
  await page.locator('[data-gallery-item]:visible [data-gallery-open]').first().click();

  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  for (const button of await dialog.locator('button').all()) {
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(42);
  }
  await page.getByRole('button', { name: 'Büyütülmüş görünümü kapat' }).click();
  await expect(dialog).toBeHidden();
});
