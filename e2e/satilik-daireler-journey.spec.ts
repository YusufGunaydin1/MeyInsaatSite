import { test, expect } from '@playwright/test';
import { u } from './util';

const ROOT = 'showcases/satilik-daireler';
const variations = ['editoryal', 'mimari', 'monolit'] as const;

for (const variation of variations) {
  test(`${variation}: keşif → Daire 1 → Daire 2 → bina → galeri → görüşme`, async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'tam buyer journey masaüstünde doğrulanır');

    await page.goto(u(`${ROOT}/${variation}`));
    await page.getByRole('link', { name: /Daireleri incele/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`/${variation}/daireler/?$`));

    await page.getByTestId('apartments-overview').locator('a[href$="/daire-1"]').first().click();
    await expect(page.getByTestId('apartment-detail-daire-1')).toBeVisible();
    await expect(page.locator('main h1')).toHaveText('Daire 1');

    await page.getByTestId('apartment-switch').getByRole('link', { name: /Diğer daireyi incele/ }).click();
    await expect(page.getByTestId('apartment-detail-daire-2')).toBeVisible();
    await expect(page.locator('main h1')).toHaveText('Daire 2');

    const desktopNav = page.getByRole('navigation', { name: 'Satılık daireler ana navigasyonu' });
    await desktopNav.getByRole('link', { name: /El Ele Apartmanı/ }).click();
    await expect(page.getByTestId('building-story')).toBeVisible();
    await expect(page.locator('main h1')).toContainText('İki evin ortak adresi');

    await desktopNav.getByRole('link', { name: 'Galeri' }).click();
    await expect(page.getByTestId('curated-gallery')).toBeVisible();
    await page.getByRole('button', { name: 'Daire 2', exact: true }).click();
    await expect(page.locator('[data-gallery-item]:visible')).toHaveCount(8);

    const firstGalleryButton = page.locator('[data-gallery-item]:visible [data-gallery-open]').first();
    await firstGalleryButton.click();
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('1 / 8');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('2 / 8');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(firstGalleryButton).toBeFocused();

    await desktopNav.getByRole('link', { name: 'Görüşme' }).click();
    await expect(page.getByTestId('viewing-request')).toBeVisible();
    await expect(page.locator('form')).toContainText('Vitrin gönderim senaryosu');
  });
}

test('demo formu doğrulama, yükleme, hata ve başarı durumlarını API çağrısı olmadan gösterir', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'form durumları bir kez masaüstünde doğrulanır');
  await page.goto(u(`${ROOT}/editoryal/iletisim`));
  const form = page.locator('[data-viewing-form]');

  await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
  await expect(page.locator('[data-form-error-summary]')).toBeVisible();
  await expect(page.locator('[data-form-error-list] li')).toHaveCount(6);

  await form.locator('select[name="apartment"]').selectOption('daire-1');
  await form.locator('input[name="name"]').fill('Deniz Kaya');
  await form.locator('input[name="method"][value="email"]').check();
  await form.locator('input[name="contact"]').fill('deniz@example.com');
  await form.locator('select[name="availability"]').selectOption('flexible');
  await form.locator('input[name="acknowledgement"]').check();
  await form.locator('input[name="scenario"][value="error"]').check();

  let externalSubmissions = 0;
  page.on('request', (request) => {
    if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') externalSubmissions += 1;
  });

  await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
  await expect(form.getByRole('button', { name: 'Demo hazırlanıyor…' })).toBeDisabled();
  await expect(page.locator('[data-form-server-error]')).toBeVisible();
  expect(externalSubmissions).toBe(0);

  await page.getByRole('button', { name: 'Forma geri dön' }).click();
  await form.locator('input[name="scenario"][value="success"]').check();
  await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
  await expect(page.locator('[data-form-success]')).toBeVisible();
  await expect(page.locator('[data-form-success]')).toContainText('Herhangi bir veri gönderilmedi');
  expect(externalSubmissions).toBe(0);
});
