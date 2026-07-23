import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// JSON'u fs ile okuyoruz: ESM'de JSON import'u "import attribute" ister ve
// Playwright'ın TS dönüşümünden geçmez.
const analytics = JSON.parse(
  readFileSync(fileURLToPath(new URL('../content/analytics.json', import.meta.url)), 'utf8')
) as {
  ga4MeasurementId?: string;
  adsConversionId?: string;
  adsConversionLabels?: Record<string, string>;
};

/*
  Ölçümleme, content/analytics.json'daki kimliklere bağlıdır. Bu spec iki gerçeği
  de doğrular ve dosyaya bakarak hangisini uygulayacağına kendisi karar verir:
  kimlikler boşken site çerezsiz/scriptsiz kalmalı, kimlikler girildiği anda
  onay bandı + arama/WhatsApp dönüşümleri çalışmalıdır. Sahibi kimliği
  yapıştırdığında test kendiliğinden "açık" moda geçer — güncelleme gerekmez.
*/

const GA4 = (analytics.ga4MeasurementId ?? '').trim();
const ADS = (analytics.adsConversionId ?? '').trim();
const CALL_LABEL = (analytics.adsConversionLabels?.call ?? '').trim();
const ENABLED = Boolean(GA4 || ADS);

const LANDING = 'satilik-daireler/pendik-satilik-3-2-dubleks/';

/** gtag.js gerçekten indirilmesin: dış istek testi yavaşlatır ve ölçümü kirletir. */
async function stubTagLoader(page: Page) {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
}

test.describe('ölçümleme kapalıyken', () => {
  test.skip(ENABLED, 'analytics.json kimlik içeriyor — açık mod testleri geçerli');

  test('hiçbir gtag scripti, çerez bandı veya dataLayer basılmaz', async ({ page }) => {
    await page.goto(LANDING);
    expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).dataLayer)).toBeUndefined();
  });

  test('dönüşüm yüzeyleri yine de sayfadadır (kimlik gelince ölçülecek)', async ({ page }) => {
    await page.goto(LANDING);
    expect(await page.locator('a[href^="tel:"]').count()).toBeGreaterThan(0);
    expect(await page.locator('a[href*="wa.me/"]').count()).toBeGreaterThan(0);
  });
});

test.describe('ölçümleme açıkken', () => {
  test.skip(!ENABLED, 'analytics.json kimlik içermiyor — kapalı mod testleri geçerli');

  test.beforeEach(async ({ page }) => {
    await stubTagLoader(page);
  });

  test('onay bandı çıkar, izin varsayılanı denied olur', async ({ page }) => {
    await page.goto(LANDING);
    await expect(page.getByTestId('consent-banner')).toBeVisible();
    const consentDefault = await page.evaluate(() =>
      ((window as any).dataLayer ?? []).find(
        (a: IArguments) => a[0] === 'consent' && a[1] === 'default'
      )?.[2]
    );
    expect(consentDefault).toMatchObject({ ad_storage: 'denied', analytics_storage: 'denied' });
  });

  test('kabul edilince izin granted olur ve bant bir daha çıkmaz', async ({ page }) => {
    await page.goto(LANDING);
    await page.getByTestId('consent-accept').click();
    await expect(page.getByTestId('consent-banner')).toBeHidden();
    const update = await page.evaluate(() =>
      ((window as any).dataLayer ?? []).find(
        (a: IArguments) => a[0] === 'consent' && a[1] === 'update'
      )?.[2]
    );
    expect(update).toMatchObject({ ad_storage: 'granted', ad_user_data: 'granted' });

    await page.reload();
    await expect(page.getByTestId('consent-banner')).toBeHidden();
  });

  test('telefon dokunuşu generate_lead + Ads dönüşümü gönderir', async ({ page }) => {
    await page.goto(LANDING);
    const call = page.locator('a[href^="tel:"]').first();
    // tel: gerçekten açılmasın; dinleyici capture fazında olduğu için bu iptal
    // ölçümü etkilemez — tam da doğrulamak istediğimiz davranış.
    await call.evaluate((el) => el.addEventListener('click', (e) => e.preventDefault()));
    await call.click();

    const events = await page.evaluate(() =>
      ((window as any).dataLayer ?? [])
        .filter((a: IArguments) => a[0] === 'event')
        .map((a: IArguments) => ({ name: a[1], params: a[2] }))
    );
    const lead = events.find((e: any) => e.name === 'generate_lead');
    expect(lead?.params).toMatchObject({ method: 'call', line: 'sales' });

    if (ADS && CALL_LABEL) {
      const conv = events.find((e: any) => e.name === 'conversion');
      expect(conv?.params?.send_to).toBe(`${ADS}/${CALL_LABEL}`);
    }
  });

  test('ofis santrali GA4 olayı gönderir ama Ads dönüşümü YAZMAZ', async ({ page }) => {
    // Footer'daki 0216 hattı her sayfada; satış hattı sayılsaydı her footer
    // dokunuşu reklam dönüşümü gibi görünür ve teklif algoritması bozulurdu.
    await page.goto(LANDING);
    const office = page.locator('a[href="tel:+902163940551"]').first();
    await office.evaluate((el) => el.addEventListener('click', (e) => e.preventDefault()));
    await office.click();
    const events = await page.evaluate(() =>
      ((window as any).dataLayer ?? [])
        .filter((a: IArguments) => a[0] === 'event')
        .map((a: IArguments) => ({ name: a[1], params: a[2] }))
    );
    expect(events.find((e: any) => e.name === 'generate_lead')?.params).toMatchObject({
      method: 'call',
      line: 'office',
    });
    expect(events.find((e: any) => e.name === 'conversion')).toBeUndefined();
  });

  test('WhatsApp dokunuşu whatsapp yöntemiyle raporlanır', async ({ page }) => {
    await page.goto(LANDING);
    const wa = page.locator('a[href*="wa.me/"]').first();
    await wa.evaluate((el) => el.addEventListener('click', (e) => e.preventDefault()));
    await wa.click();
    const lead = await page.evaluate(() =>
      ((window as any).dataLayer ?? [])
        .filter((a: IArguments) => a[0] === 'event' && a[1] === 'generate_lead')
        .map((a: IArguments) => a[2])
        .pop()
    );
    expect(lead).toMatchObject({ method: 'whatsapp' });
  });
});
