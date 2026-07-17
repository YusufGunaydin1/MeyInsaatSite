import { expect, test } from '@playwright/test';
import { u } from './util';

const ROOT = 'showcases/satilik-daireler';

test.describe('tek ve kompakt Satılık Daireler deneyimi', () => {
  test('ilk ekran iki daireye yönlendirir ve ayrıntı akışı daireler arasında sürer', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'masaüstü içerik yoğunluğu 1440×900 projesinde ölçülür');

    await page.goto(u(ROOT));
    await expect(page.getByTestId('sd-sale-home')).toBeVisible();
    await expect(page.locator('main h1')).toHaveText('Müteahhitten sıfır 3+2 dubleks daireler.');
    await expect(page.getByTestId('sd-header').getByRole('link', { name: 'Satılık Daireler', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('sd-header').locator('a[href*="/editoryal"], a[href*="/mimari"], a[href*="/monolit"]')).toHaveCount(0);

    const cards = [page.getByTestId('sd-card-daire-1'), page.getByTestId('sd-card-daire-2')];
    for (const card of cards) {
      await expect(card).toBeVisible();
      await expect(card).toContainText('3+2');
      await expect(card).toContainText('Dubleks');
      await expect(card).toContainText('Yeni yapım');
      await expect(card).toContainText('Fiyat bilgisi için bize ulaşın');
      const box = await card.boundingBox();
      expect(box && box.y + box.height, 'iki daire kartı 1440×900 ilk görünümünde tamamlanmalı').toBeLessThanOrEqual(900);
    }

    await cards[0].getByRole('link', { name: /Daire 1 detaylarını gör/ }).click();
    await expect(page).toHaveURL(new RegExp(`/${ROOT}/daire-1/?$`));
    await expect(page.getByTestId('sd-detail-daire-1')).toBeVisible();
    await expect(page.getByTestId('daire-1-room-atlas')).toBeVisible();
    await expect(page.getByTestId('sd-pending-facts')).toContainText('Bilgi yakında');

    const galleryTrigger = page.getByTestId('sd-gallery-detail').locator('[data-gallery-item]').first();
    await galleryTrigger.click();
    const lightbox = page.getByTestId('sd-lightbox');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByRole('button', { name: 'Galeriyi kapat' })).toBeFocused();
    await expect(lightbox.locator('[data-lightbox-counter]')).toHaveText('1 / 4');
    await page.keyboard.press('ArrowRight');
    await expect(lightbox.locator('[data-lightbox-counter]')).toHaveText('2 / 4');
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(galleryTrigger).toBeFocused();

    await page.getByTestId('sd-apartment-switch').getByRole('link', { name: /Daire 2.*geç/ }).click();
    await expect(page).toHaveURL(new RegExp(`/${ROOT}/daire-2/?$`));
    await expect(page.getByTestId('sd-detail-daire-2')).toBeVisible();
    await expect(page.getByTestId('daire-2-room-atlas')).toBeVisible();
    await expect(page.locator('main h1')).toHaveText('Daire 2');
  });

  test('tam galeri filtreleri ve klavye ışık kutusu çalışır', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'tam galeri davranışı masaüstünde bir kez doğrulanır');

    await page.goto(u(`${ROOT}/galeri`));
    const gallery = page.getByTestId('sd-gallery-full');
    await expect(gallery).toBeVisible();
    await gallery.locator('[data-gallery-filter="daire-2"]').click();
    await expect(gallery.locator('[data-gallery-item]')).toHaveCount(8);
    await expect(gallery).toContainText('8 fotoğraf');
    await gallery.locator('[data-gallery-item]').first().click();
    await expect(page.getByTestId('sd-lightbox').locator('[data-lightbox-counter]')).toHaveText('1 / 8');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('sd-lightbox').locator('[data-lightbox-counter]')).toHaveText('8 / 8');
    await page.keyboard.press('Escape');
  });

  test('demo formu doğrulama, yükleme, kontrollü hata ve başarıyı ağ çağrısı olmadan sunar', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'form durumları masaüstünde bir kez doğrulanır');

    await page.goto(u(`${ROOT}/iletisim?daire=daire-1`));
    const form = page.getByTestId('sd-viewing-form');
    await expect(form.locator('#sd-form-apartment')).toHaveValue('daire-1');
    await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
    await expect(page.getByTestId('sd-form-summary')).toBeFocused();
    await expect(page.getByTestId('sd-form-summary').locator('li')).toHaveCount(5);

    await form.locator('#sd-form-name').fill('Deniz Kaya');
    await form.getByLabel('E-posta').check();
    await form.locator('#sd-form-contact').fill('deniz@example.com');
    await form.locator('#sd-form-availability').selectOption('flexible');
    await form.getByText(/Bu formun gösterim amaçlı olduğunu/).click();
    await form.getByLabel('Hatayı göster').check();

    let submissions = 0;
    page.on('request', (request) => {
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') submissions += 1;
    });

    await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
    await expect(form.getByRole('button', { name: 'Demo hazırlanıyor…' })).toBeDisabled();
    await expect(page.getByTestId('sd-form-error-state')).toBeFocused();
    expect(submissions).toBe(0);

    await page.getByRole('button', { name: 'Forma geri dön' }).click();
    await form.getByLabel('Başarıyı göster').check();
    await form.getByRole('button', { name: 'Demo talebi hazırla' }).click();
    await expect(page.getByTestId('sd-form-success')).toBeFocused();
    await expect(page.getByTestId('sd-form-success')).toContainText('Herhangi bir veri gönderilmedi');
    expect(submissions).toBe(0);
  });

  test('tüm yeni rotalar ve ikincil eski karşılaştırma rotası erişilebilir', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'rota matrisi masaüstünde bir kez doğrulanır');
    const paths = ['', 'daire-1', 'daire-2', 'el-ele-apartmani', 'galeri', 'iletisim'];

    for (const path of paths) {
      const response = await page.goto(u(path ? `${ROOT}/${path}` : ROOT));
      expect(response?.status(), `${path || 'kök'} rotası`).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('img[src*="cevre-deniz"]')).toHaveCount(0);
    }

    const response = await page.goto(u(`${ROOT}/eski-karsilastirma`));
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId('sale-comparison-hub')).toBeVisible();
  });
});
