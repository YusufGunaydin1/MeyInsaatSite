import { test, expect, type Page } from '@playwright/test';
import { u } from './util';

/*
  Satılık Daireler — CANLI listeleme ailesi (/satilik-daireler + iki detay) ve
  vitrindeki alternatif dizilim. Ölçülen şeyler kullanıcının GÖRDÜĞÜ davranış:
  sekme/filtre/sıralama/favori kart sayısını değiştirir, karusel çalışır, D-11
  sold durumunda hiçbir fiyat göstermez, D-12 doğrulanmış fiyatını korur, ray
  formu mock sonuç panellerini gösterir ve mobilde taşma yoktur.
*/

const K = 'satilik-daireler/';
const V = 'showcases/satilik-daireler/kompakt/vitrin';

const decoded = async (page: Page, sel: string) => {
  await expect
    .poll(() => page.locator(sel).first().evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
};

const revealMobileFilters = async (page: Page) => {
  const toggle = page.getByTestId('kl-filter-toggle');
  if (await toggle.isVisible()) {
    await expect(page.getByTestId('kl-filters')).toBeHidden();
    await toggle.click();
  }
  await expect(page.getByTestId('kl-filters')).toBeVisible();
};

test('liste: nav Satılık aktif + sekmeler/filtre/ray + tek temsilî-veri çipi', async ({ page }) => {
  await page.goto(u(K));
  // temsilî m² ve ödeme bilgileri yayında kaldığı sürece bilinçli noindex
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('header nav a[aria-current="page"]').first()).toHaveText(/^satılık$/i);
  await expect(page.getByTestId('kl-tab-tumu')).toContainText('Tümü (5)');
  await revealMobileFilters(page);
  await expect(page.getByTestId('kl-compare')).toBeVisible();
  await expect(page.getByTestId('kcf-form')).toBeVisible(); // hızlı iletişim
  await expect(page.getByTestId('kc-mock-chip')).toHaveCount(1);
  await expect(page.getByTestId('kl-sales-phone')).toHaveAttribute('href', 'tel:+905326256812');
  await expect(page.getByTestId('kl-sales-phone')).toContainText('+90 532 625 68 12');
  await expect(page.getByTestId('kl-sales-whatsapp')).toHaveAttribute('href', 'https://wa.me/905326256812');
  await expect(page.getByTestId('kl-sales-whatsapp')).toContainText('+90 532 625 68 12');
  await expect(page.getByTestId('kc-sales-phone')).toHaveAttribute('href', 'tel:+905326256812');
});

test('liste: D-11 yakın zamanda satıldı ve fiyatsız; D-12 13.750.000 TL kalır', async ({ page }) => {
  await page.goto(u(K));
  await expect(page.getByTestId('kl-card')).toHaveCount(5);
  await expect(page.getByTestId('kl-count')).toContainText('5 sonuç');
  await expect(page.getByTestId('kl-more')).toHaveCount(0); // 5 kart tek sayfaya sığar
  // İki gerçek kayıt görünür; yalnız satıştaki D-12 fiyat ve favori taşır.
  await expect(page.locator('[data-kind="ilan"]')).toHaveCount(2);
  await expect(page.locator('[data-kind="proje"]')).toHaveCount(3);
  const d11 = page.locator('[data-unit="d11"]');
  const d12 = page.locator('[data-unit="d12"]');
  await expect(d11).toHaveAttribute('data-status', 'satildi');
  await expect(page.getByTestId('kl-recently-sold-d11')).toHaveText('YAKIN ZAMANDA SATILDI');
  await expect(page.getByTestId('kl-status-d11')).toHaveText('Yakın zamanda satıldı');
  await expect(d11.locator('.kl-price')).toHaveCount(0);
  await expect(d11.locator('.kl-heart')).toHaveCount(0);
  await expect(d11).not.toContainText('14.900.000');
  await expect(d12).toHaveAttribute('data-status', 'musait');
  await expect(page.getByTestId('kl-price-d12')).toHaveText('13.750.000 TL');
  await expect(page.getByTestId('kl-fav-d12')).toBeVisible();
  await expect(page.getByTestId('kl-compare-status-d11')).toHaveText('Yakın zamanda satıldı');
  await expect(page.getByTestId('kl-compare-price-d12')).toHaveText('13.750.000 TL');
  await expect(page.locator('[data-kind="proje"] .kl-price')).toHaveCount(0);
  await expect(page.locator('[data-kind="proje"] .kl-heart')).toHaveCount(0);
  await expect(page.locator('[data-kind="proje"]').filter({ hasText: ' TL' })).toHaveCount(0);
  // satılmış projeler: bant görünür, sözcük doğru, kullanıcı beyazı kırmızı üzerinde GÖRÜR
  for (const key of ['masuk', 'camoglu']) {
    const band = page.getByTestId(`kl-sold-${key}`);
    await expect(band).toBeVisible();
    await expect(band).toHaveText('TÜMÜ SATILDI');
    const [bg, fg] = await band.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.backgroundColor, s.color];
    });
    expect(bg, key + ' bant zemini').toBe('rgb(181, 35, 35)');
    expect(fg, key + ' bant yazısı').toBe('rgb(255, 255, 255)');
  }
  // El Ele projesinde bir daire satışta: proje kartı doğru sayıyı taşır.
  await expect(page.getByTestId('kl-sold-el-ele')).toHaveCount(0);
  await expect(page.locator('[data-unit="p-el-ele"]')).toContainText('1 satılık dubleks');
  await expect(page.getByTestId('kl-proje-el-ele')).toHaveAttribute('href', /projeler\/el-ele-apartmani$/);
  await expect(page.getByTestId('kl-proje-masuk')).toHaveAttribute('href', /projeler\/masuk-apartmani$/);
  await expect(page.getByTestId('kl-detay-d11')).toHaveAttribute('href', /satilik-daireler\/daire-1$/);
  // CTA hiyerarşisi: ilan Detayları Gör beyaz-üstü-kırmızı; proje Projeyi İncele hayalet kalır
  const cta = page.getByTestId('kl-detay-d11');
  const [ctaBg, ctaFg] = await cta.evaluate((el) => {
    const s = getComputedStyle(el);
    return [s.backgroundColor, s.color];
  });
  expect(ctaBg, 'ilan CTA zemini').toBe('rgb(181, 35, 35)');
  expect(ctaFg, 'ilan CTA yazısı').toBe('rgb(255, 255, 255)');
  const ghostBg = await page.getByTestId('kl-proje-masuk').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(ghostBg, 'proje CTA zemin dolgusuz').toBe('rgba(0, 0, 0, 0)');
  // ince tür ayrımı: proje gövdesi beton tonlu (ilan beyaz) + fotoğrafta PROJE çipi
  const binaBg = await page.locator('[data-kind="proje"]').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  const ilanBg = await page.locator('[data-kind="ilan"]').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(binaBg).toBe('rgb(244, 244, 242)');
  expect(ilanBg).toBe('rgb(255, 255, 255)');
  await expect(page.locator('[data-kind="proje"] .kl-kind')).toHaveCount(3);
  await expect(page.locator('[data-kind="proje"] .kl-kind').first()).toHaveText('PROJE');
});

test('liste: sekme + filtre + sıralama + favoriler dürüst envanterde', async ({ page }) => {
  await page.goto(u(K));
  await revealMobileFilters(page);
  // sekmeler tür sayar
  await page.getByTestId('kl-tab-proje').click();
  await expect(page.getByTestId('kl-card')).toHaveCount(3);
  await page.getByTestId('kl-tab-ilan').click();
  await expect(page.getByTestId('kl-card')).toHaveCount(2);
  await page.getByTestId('kl-tab-tumu').click();
  // birim filtresi aktifken proje kartları düşer
  await page.getByTestId('kl-f-oda').selectOption('3+2');
  await expect(page.getByTestId('kl-card')).toHaveCount(2);
  await expect(page.locator('[data-kind="proje"]')).toHaveCount(0);
  await page.getByTestId('kl-clear').click();
  // proje filtresi iki kart türüne de uygulanır: El Ele → 2 ilan + 1 proje kartı
  await page.getByTestId('kl-f-proje').selectOption('el-ele');
  await expect(page.getByTestId('kl-card')).toHaveCount(3);
  // sıralama: fiyatlı D-12 önce; fiyatsız satılmış D-11 ve proje kartı sonra
  await page.getByTestId('kl-sort').selectOption('desc');
  await expect(page.getByTestId('kl-card').first()).toContainText('13.750.000 TL');
  await expect(page.getByTestId('kl-card').last()).toHaveAttribute('data-kind', 'proje');
  await page.getByTestId('kl-clear').click();
  // fiyat filtresi satılmış/fiyatsız D-11'i dışarıda bırakır
  await page.getByTestId('kl-f-fiyat').selectOption('10+');
  await expect(page.locator('[data-kind="ilan"]')).toHaveCount(1);
  await expect(page.locator('[data-unit="d12"]')).toContainText('13.750.000 TL');
  await expect(page.locator('[data-unit="d11"]')).toHaveCount(0);
  await page.getByTestId('kl-clear').click();
  // favori: satıştaki D-12 kalbi → sayaç → yalnız favoriler
  await page.getByTestId('kl-fav-d12').click();
  await expect(page.getByTestId('kl-favorilerim')).toContainText('(1)');
  await page.getByTestId('kl-favorilerim').click();
  await expect(page.getByTestId('kl-card')).toHaveCount(1);
  // temizle → tümü geri
  await page.getByTestId('kl-clear').click();
  await expect(page.getByTestId('kl-count')).toContainText('5 sonuç');
});

test('detay D-11: matris lejantı ve gerçek durum dağılımı', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  const matrix = page.getByTestId('kc-matrix');
  await expect(matrix.getByTestId('kc-matrix-legend').locator('li')).toHaveCount(3);
  await expect(matrix.locator('td[data-durum="musait"]')).toHaveCount(2); // yalnız D-12 × 2 kat satırı
  await expect(matrix.locator('td[data-durum="satildi"]')).toHaveCount(10);
  await expect(matrix.locator('td').filter({ hasText: 'D-11' })).toHaveCount(2);
  await expect(matrix.locator('td').filter({ hasText: 'D-11' }).first()).toHaveAttribute('data-durum', 'satildi');
  await expect(matrix.locator('td').filter({ hasText: 'D-12' })).toHaveCount(2);
  await expect(matrix.locator('td').filter({ hasText: 'D-12' }).first()).toHaveAttribute('data-durum', 'musait');
  // t-tech görsel olarak büyük harfe çevirir; textContent 'Müsait' kalır
  await expect(matrix.locator('td[data-durum="musait"]').first()).toContainText('Müsait');
});

test('vitrin dizilimi: proje sekmeleri filtreler; teaser kartlar fiyat uydurmaz', async ({ page }) => {
  await page.goto(u(V));
  const unitsIsland = page.locator('astro-island[component-url*="UnitsExplorer"]');
  await expect.poll(() => unitsIsland.evaluate((element) => element.hasAttribute('ssr'))).toBe(false);
  await expect(page.getByTestId('kc-mock-chip')).toHaveCount(1);
  await expect(page.getByTestId('kx-card')).toHaveCount(4); // 2 gerçek + 2 teaser
  await page.getByTestId('kx-tab-el-ele').click();
  await expect(page.getByTestId('kx-card')).toHaveCount(2);
  const d11 = page.locator('[data-unit="d11"]');
  const d12 = page.locator('[data-unit="d12"]');
  await expect(d11).toContainText('YAKIN ZAMANDA SATILDI');
  await expect(d11).not.toContainText('14.900.000');
  await expect(d12).toContainText('13.750.000 TL');
  await page.getByTestId('kx-tab-masuk-apartmani').click();
  const teaser = page.getByTestId('kx-card');
  await expect(teaser).toHaveCount(1);
  await expect(teaser).toContainText('Tümü satıldı');
  await expect(teaser).not.toContainText(' TL');
  await expect(page.getByTestId('kc-tum-daireler')).toHaveAttribute('href', /\/satilik-daireler$/);
});

test('detay: varsayılan galeri|künye; ⟷ geniş görünümü açar, tercih iki sayfada da tutulur', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-360', 'dar ekranda düzen zaten tek sütun, düğme gizli');
  await page.goto(u(K + 'daire-1'));
  const stage = page.getByTestId('kc-car-main');
  const kunye1 = page.getByTestId('kc-specs-d1');
  // varsayılan: künye galerinin SAĞINDA (ref-a düzeni)
  let sb = (await stage.boundingBox())!;
  let kb = (await kunye1.boundingBox())!;
  expect(kb.x).toBeGreaterThan(sb.x + sb.width - 1);
  const darGenislik = sb.width;
  // genişlet: sahne belirgin büyür, künye ALTA iner ve görünür kalır
  await page.getByTestId('kc-car-wide').click();
  await expect(page.getByTestId('kc-car-wide')).toHaveAttribute('aria-pressed', 'true');
  sb = (await stage.boundingBox())!;
  kb = (await kunye1.boundingBox())!;
  expect(sb.width).toBeGreaterThan(darGenislik * 1.3);
  expect(kb.y).toBeGreaterThan(sb.y + sb.height - 1);
  await expect(kunye1).toBeVisible();
  // tercih diğer detay sayfasına taşınır (localStorage)
  await page.goto(u(K + 'daire-2'));
  await expect(page.getByTestId('kc-car-wide')).toHaveAttribute('aria-pressed', 'true');
  const sb2 = (await page.getByTestId('kc-car-main').boundingBox())!;
  const kb2 = (await page.getByTestId('kc-specs-d2').boundingBox())!;
  expect(kb2.y).toBeGreaterThan(sb2.y + sb2.height - 1);
  // daralt: yan künye geri gelir
  await page.getByTestId('kc-car-wide').click();
  await expect(page.getByTestId('kc-car-wide')).toHaveAttribute('aria-pressed', 'false');
  const sb3 = (await page.getByTestId('kc-car-main').boundingBox())!;
  const kb3 = (await page.getByTestId('kc-specs-d2').boundingBox())!;
  expect(kb3.x).toBeGreaterThan(sb3.x + sb3.width - 1);
});

test('detay D-11: karusel ok/sayaç/küçük resim/tam ekran', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  await decoded(page, '[data-testid="kc-car-main"]');
  await expect(page.getByTestId('kc-car-count')).toHaveText('1 / 20');
  await page.getByTestId('kc-car-next').click();
  await expect(page.getByTestId('kc-car-count')).toHaveText('2 / 20');
  await page.getByTestId('kc-car-prev').click();
  await page.getByTestId('kc-car-prev').click();
  await expect(page.getByTestId('kc-car-count')).toHaveText('20 / 20'); // uçtan sarar
  await page.getByTestId('kc-car-thumb-5').click();
  await expect(page.getByTestId('kc-car-count')).toHaveText('6 / 20');
  await page.getByTestId('kc-car-full').click();
  await expect(page.getByTestId('kc-car-overlay')).toBeVisible();
  await decoded(page, '[data-testid="kc-car-overlay-img"]');
  await page.getByTestId('kc-car-close').click();
  await expect(page.getByTestId('kc-car-overlay')).toHaveCount(0);
});

test('detay: D-11 sold durumunda fiyatsız; D-12 fiyatı değişmeden satışta', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  await expect(page.getByTestId('kc-sold-status')).toHaveText('YAKIN ZAMANDA SATILDI');
  await expect(page.getByTestId('kc-sold-detail')).toContainText('Bu dairenin satış işlemi tamamlandı.');
  await expect(page.getByTestId('kc-price')).toHaveCount(0);
  await expect(page.getByTestId('kc-payment')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('14.900.000');
  await expect(page.getByTestId('kc-sold-next')).toContainText('13.750.000 TL');
  await expect(page.getByTestId('kc-sold-next')).toHaveAttribute('href', /satilik-daireler\/daire-2$/);

  await page.goto(u(K + 'daire-2'));
  await expect(page.getByTestId('kc-price')).toHaveText('13.750.000 TL');
  await expect(page.getByTestId('kc-finance')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('14.900.000');
  const similarD11 = page.getByTestId('kc-sim-unit-d11');
  await expect(page.getByTestId('kc-sim-status-d11')).toHaveText('YAKIN ZAMANDA SATILDI');
  await expect(similarD11.locator('.kc-sim-fiyat')).toHaveCount(0);
});

test('ray formu: doğrulama → hata; mock başarı ve hata panelleri', async ({ page }) => {
  await page.goto(u(K + 'daire-2'));
  const railFormIsland = page.locator('astro-island[component-url*="RailForm"]');
  await expect.poll(() => railFormIsland.evaluate((element) => element.hasAttribute('ssr'))).toBe(false);
  await page.getByTestId('kcf-submit').click();
  await expect(page.getByTestId('kcf-err-name')).toBeVisible();
  await expect(page.getByTestId('kcf-err-contact')).toBeVisible();
  await page.getByTestId('kcf-name').fill('Deneme Ziyaretçi');
  await page.getByTestId('kcf-contact').fill('05xx xxx xx xx');
  await page.getByTestId('kcf-demo-failure').check();
  await page.getByTestId('kcf-submit').click();
  await expect(page.getByTestId('kcf-failure')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('kcf-demo-success').check();
  await page.getByTestId('kcf-submit').click();
  await expect(page.getByTestId('kcf-success')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('kcf-again').click();
  await expect(page.getByTestId('kcf-form')).toBeVisible();
});

test('detay satış contact links are live; remaining dead ends use the honest dialog', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  await expect(page.getByTestId('kc-compare')).toHaveAttribute('href', /satilik-daireler\/daire-2$/);
  await expect(page.getByTestId('kc-sim-daire-2')).toHaveAttribute('href', /satilik-daireler\/daire-2$/);
  await expect(page.getByTestId('kc-rail-phone')).toHaveAttribute('href', 'tel:+905326256812');
  await expect(page.getByTestId('kc-rail-phone')).toContainText('+90 532 625 68 12');
  await expect(page.getByTestId('kc-rail-whatsapp')).toHaveAttribute('href', 'https://wa.me/905326256812');
  await expect(page.getByTestId('kc-rail-whatsapp')).toContainText('+90 532 625 68 12');
  await expect(page.getByTestId('kc-rail-alarm')).toHaveCount(0);
  await page.goto(u(K + 'daire-2'));
  await page.getByTestId('kc-rail-doc').first().click();
  await expect(page.getByTestId('kc-soon-dialog')).toBeVisible();
  await expect(page.getByTestId('kc-soon-dialog')).toContainText('Proje Broşürü');
  await page.getByTestId('kc-soon-close').click();
  await expect(page.getByTestId('kc-soon-dialog')).not.toBeVisible();
  // kırıntı listeye döner
  await expect(page.getByTestId('kc-breadcrumb').locator('a').nth(1)).toHaveAttribute('href', /\/satilik-daireler$/);
});

test('yerelleştirilmiş rotalar ayakta: /en, /ru, /ar listeye ulaşır', async ({ page }) => {
  for (const prefix of ['en/', 'ru/', 'ar/']) {
    await page.goto(u(prefix + K));
    await expect(page.getByTestId('kl-tab-tumu'), prefix).toBeVisible();
    // mobilde masaüstü nav gizli — görünürlük değil varlık + doğru hedef ölçülür
    await expect(page.locator('header nav a[aria-current="page"]').first()).toHaveAttribute(
      'href',
      new RegExp(prefix.replace('/', '') + '/satilik-daireler$')
    );
  }
});

test('mobil: canlı üç sayfa + vitrin — yatay taşma yok, görseller çözülür, menü açılır', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'yalnız mobil projede');
  for (const route of [K, K + 'daire-1', K + 'daire-2', V]) {
    await page.goto(u(route));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, route + ' yatay taşma').toBeLessThanOrEqual(0);
    await decoded(page, 'main img');
  }
  // dar ekranda geniş-görünüm anahtarı GİZLİ (düzen zaten tek sütun)
  await page.goto(u(K + 'daire-1'));
  await expect(page.getByTestId('kc-car-main')).toBeVisible();
  await expect(page.getByTestId('kc-car-wide')).toBeHidden();
  await page.goto(u(K));
  await expect(page.getByTestId('kl-filter-toggle')).toBeVisible();
  await expect(page.getByTestId('kl-filters')).toBeHidden();
  await page.locator('details[data-mobile-menu] summary').click();
  await expect(page.locator('details[data-mobile-menu] nav')).toBeVisible();
});
