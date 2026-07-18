import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Gerçek harita bağlantıları — künye karesi (desktop), mobil akış ve satılık
  konum paneli. Koordinat uydurulmaz: href'ler MEY'in doğruladığı adres metnini
  sorgu olarak taşır; pin'i sağlayıcının geocoder'ı çözer. Dış sağlayıcıya
  GİDİLMEZ (testte harici ağ yok) — kanıt, kullanıcının tıklayacağı href'in
  doğru adresi ve hedefi taşımasıdır. RU yereli Yandex'i öne alır.
*/

const MASUK_Q = encodeURIComponent('Batı Mah. Maşuk Sok. No:10, Pendik İstanbul');
const ELELE_Q = encodeURIComponent('Batı Mah. Çiğdem Sok. No:6, Pendik İstanbul');

test('masaüstü künye: üç sağlayıcı bağlantısı gerçek adresi taşır', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'adımlı mod yalnız masaüstünde');
  await page.goto(u('/projeler/masuk-apartmani'));
  const root = page.getByTestId('pd-stage');
  await root.scrollIntoViewIfNeeded();
  await page.locator('[data-pd-next]').dispatchEvent('click');
  await page.locator('[data-pd-next]').dispatchEvent('click');

  const links = page.getByTestId('pd-frame-kunye').getByTestId('map-links');
  await expect(links).toBeVisible();
  await expect(links).toContainText('HARİTADA AÇ');
  const google = links.getByTestId('map-google');
  await expect(google).toHaveAttribute('href', `https://www.google.com/maps/search/?api=1&query=${MASUK_Q}`);
  await expect(google).toHaveAttribute('target', '_blank');
  await expect(links.getByTestId('map-yandex')).toHaveAttribute('href', `https://yandex.com.tr/maps/?text=${MASUK_Q}`);
  await expect(links.getByTestId('map-apple')).toHaveAttribute('href', `https://maps.apple.com/?q=${MASUK_Q}`);
});

test('RU yereli: Yandex önde gelir', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'sıralama masaüstü künyede ölçülür');
  await page.goto(u('/ru/projeler/masuk-apartmani'));
  const root = page.getByTestId('pd-stage');
  await root.scrollIntoViewIfNeeded();
  await page.locator('[data-pd-next]').dispatchEvent('click');
  await page.locator('[data-pd-next]').dispatchEvent('click');

  const links = page.getByTestId('pd-frame-kunye').getByTestId('map-links');
  await expect(links).toContainText('ОТКРЫТЬ НА КАРТЕ');
  await expect(links.locator('a').first()).toHaveText('Yandex');
});

test('mobil 360: künye harita bağlantıları görünür ve doğru', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-360', 'mobil proje');
  await page.goto(u('/projeler/masuk-apartmani'));
  const links = page.getByTestId('pd-mobile').getByTestId('map-links');
  await links.scrollIntoViewIfNeeded();
  await expect(links).toBeVisible();
  await expect(links.getByTestId('map-google')).toHaveAttribute(
    'href',
    `https://www.google.com/maps/search/?api=1&query=${MASUK_Q}`
  );
});

test('satılık konum paneli: El Ele adresi sağlayıcılara bağlanır', async ({ page }) => {
  await page.goto(u('/satilik-daireler/daire-1'));
  const links = page.getByTestId('kc-map').getByTestId('map-links');
  await links.scrollIntoViewIfNeeded();
  await expect(links).toBeVisible();
  await expect(links.getByTestId('map-google')).toHaveAttribute(
    'href',
    `https://www.google.com/maps/search/?api=1&query=${ELELE_Q}`
  );
  await expect(links.getByTestId('map-yandex')).toHaveAttribute('href', `https://yandex.com.tr/maps/?text=${ELELE_Q}`);
});
