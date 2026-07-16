import { test, expect, type Page } from '@playwright/test';
import { u } from './util';

/*
  Satılık Daireler — CANLI listeleme ailesi (/satilik-daireler + iki detay) ve
  vitrindeki alternatif dizilim. Ölçülen şeyler kullanıcının GÖRDÜĞÜ davranış:
  sekme/filtre/sıralama/favori kart sayısını değiştirir, karusel çalışır, ödeme
  satırları toplama EŞİTTİR, ray formu mock sonuç panellerini gösterir, mobilde
  taşma yoktur. Sayfalar gerçek satış verisi girilene dek BİLEREK noindex.
*/

const K = 'satilik-daireler/';
const V = 'showcases/satilik-daireler/kompakt/vitrin';

const decoded = async (page: Page, sel: string) => {
  await expect
    .poll(() => page.locator(sel).first().evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
};

test('liste: nav Satılık aktif + sekmeler/filtre/ray + tek temsilî-veri çipi', async ({ page }) => {
  await page.goto(u(K));
  // temsilî fiyatlar yayında kaldığı sürece bilinçli noindex
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('header nav a[aria-current="page"]').first()).toHaveText(/satılık daireler/i);
  await expect(page.getByTestId('kl-tab-tumu')).toContainText('Tümü (8)');
  await expect(page.getByTestId('kl-filters')).toBeVisible();
  await expect(page.getByTestId('kl-compare')).toBeVisible();
  await expect(page.getByTestId('kcf-form')).toBeVisible(); // hızlı iletişim
  await expect(page.getByTestId('kc-mock-chip')).toHaveCount(1);
});

test('liste: sekme + filtre + sıralama + favoriler + daha fazla yükle', async ({ page }) => {
  await page.goto(u(K));
  await expect(page.getByTestId('kl-card')).toHaveCount(6); // 8 sonuç, ilk 6 gösterilir
  await expect(page.getByTestId('kl-count')).toContainText('8 sonuç');
  await page.getByTestId('kl-more').click();
  await expect(page.getByTestId('kl-card')).toHaveCount(8);
  // sekme: dubleks → 3
  await page.getByTestId('kl-tab-dubleks').click();
  await expect(page.getByTestId('kl-card')).toHaveCount(3);
  // filtre: proje El Ele → 2; sıralama desc → pahalı önce
  await page.getByTestId('kl-f-proje').selectOption('el-ele');
  await expect(page.getByTestId('kl-card')).toHaveCount(2);
  await page.getByTestId('kl-sort').selectOption('desc');
  await expect(page.getByTestId('kl-card').first()).toContainText('14.900.000 TL');
  // favori: kalp → sayaç → yalnız favoriler
  await page.getByTestId('kl-fav-d11').click();
  await expect(page.getByTestId('kl-favorilerim')).toContainText('(1)');
  await page.getByTestId('kl-favorilerim').click();
  await expect(page.getByTestId('kl-card')).toHaveCount(1);
  // temizle → tümü geri
  await page.getByTestId('kl-clear').click();
  await expect(page.getByTestId('kl-count')).toContainText('8 sonuç');
  // gerçek daire detaya, temsilî satır proje sayfasına gider (tümü görünür olsun)
  await page.getByTestId('kl-more').click();
  await expect(page.getByTestId('kl-detay-d11')).toHaveAttribute('href', /satilik-daireler\/daire-1$/);
  await expect(page.getByTestId('kl-detay-ali-3')).toHaveAttribute('href', /projeler\/ali$/);
});

test('detay D-11: matris lejantı ve gerçek durum dağılımı', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  const matrix = page.getByTestId('kc-matrix');
  await expect(matrix.getByTestId('kc-matrix-legend').locator('li')).toHaveCount(3);
  await expect(matrix.locator('td[data-durum="musait"]')).toHaveCount(4); // 2 dubleks × 2 kat satırı
  await expect(matrix.locator('td[data-durum="satildi"]')).toHaveCount(8);
  // t-tech görsel olarak büyük harfe çevirir; textContent 'Müsait' kalır
  await expect(matrix.locator('td[data-durum="musait"]').first()).toContainText('Müsait');
});

test('vitrin dizilimi: proje sekmeleri filtreler; teaser kartlar fiyat uydurmaz', async ({ page }) => {
  await page.goto(u(V));
  await expect(page.getByTestId('kc-mock-chip')).toHaveCount(1);
  await expect(page.getByTestId('kx-card')).toHaveCount(4); // 2 gerçek + 2 teaser
  await page.getByTestId('kx-tab-el-ele').click();
  await expect(page.getByTestId('kx-card')).toHaveCount(2);
  await page.getByTestId('kx-tab-ali').click();
  const teaser = page.getByTestId('kx-card');
  await expect(teaser).toHaveCount(1);
  await expect(teaser).toContainText('Satış bilgisi yakında');
  await expect(teaser).not.toContainText(' TL');
  await expect(page.getByTestId('kc-tum-daireler')).toHaveAttribute('href', /\/satilik-daireler$/);
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

test('detay: ödeme planı satırları toplama eşit', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  const rows = await page
    .getByTestId('kc-payment-row')
    .locator('[data-tutar]')
    .evaluateAll((els) => els.map((el) => Number(el.getAttribute('data-tutar'))));
  const total = Number(await page.getByTestId('kc-payment-total').getAttribute('data-tutar'));
  expect(rows).toHaveLength(3);
  expect(rows.reduce((a, b) => a + b, 0)).toBe(total);
  await expect(page.getByTestId('kc-payment-total')).toContainText('14.900.000 TL');
  await expect(page.getByTestId('kc-price')).toContainText('14.900.000 TL');
});

test('ray formu: doğrulama → hata; mock başarı ve hata panelleri', async ({ page }) => {
  await page.goto(u(K + 'daire-2'));
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

test('detaylar çapraz bağlanır; ölü uçlar dürüst "yakında" diyaloğuna çıkar', async ({ page }) => {
  await page.goto(u(K + 'daire-1'));
  await expect(page.getByTestId('kc-compare')).toHaveAttribute('href', /satilik-daireler\/daire-2$/);
  await expect(page.getByTestId('kc-sim-daire-2')).toHaveAttribute('href', /satilik-daireler\/daire-2$/);
  await page.getByTestId('kc-rail-phone').click();
  await expect(page.getByTestId('kc-soon-dialog')).toBeVisible();
  await expect(page.getByTestId('kc-soon-dialog')).toContainText('Satış hattı');
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
  await page.goto(u(K));
  await page.locator('details[data-mobile-menu] summary').click();
  await expect(page.locator('details[data-mobile-menu] nav')).toBeVisible();
});
