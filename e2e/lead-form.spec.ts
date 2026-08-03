import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { u } from './util';

/*
  Talep formu — üç yüzeyde tek bileşen (RailForm).

  Form, content/company.json'daki Web3Forms anahtarına bağlıdır. Bu spec iki
  gerçeği de doğrular ve dosyaya bakarak hangisini uygulayacağına kendisi karar
  verir: anahtar boşken form yerine dürüst not durmalı (ölü Gönder YOK), anahtar
  girildiği anda tam form + gönderim akışı çalışmalıdır. Sahibi anahtarı
  yapıştırdığında test kendiliğinden "açık" moda geçer — güncelleme gerekmez.

  JSON'u fs ile okuyoruz: ESM'de JSON import'u "import attribute" ister ve
  Playwright'ın TS dönüşümünden geçmez.
*/
const company = JSON.parse(
  readFileSync(fileURLToPath(new URL('../content/company.json', import.meta.url)), 'utf8')
) as { contact?: { formAccessKey?: string } };

const KEY = (company.contact?.formAccessKey ?? '').trim();
const ENABLED = Boolean(KEY);

/** Üç yüzey: form parametreli tek bileşen olduğu için hepsi aynı testlerden geçer. */
const SURFACES = [
  { name: 'daire detay', path: 'satilik-daireler/pendik-satilik-3-2-dubleks/', location: 'daire-detay-d12' },
  { name: 'satılık liste', path: 'satilik-daireler/', location: 'satilik-liste' },
  { name: 'iletişim', path: 'iletisim/', location: 'iletisim' },
] as const;

const WEB3FORMS = 'https://api.web3forms.com/submit';

/** Gerçek Web3Forms'a HİÇBİR istek gitmesin; gövde yakalanıp doğrulanır. */
async function stubWeb3Forms(page: Page, outcome: 'success' | 'reject' | 'offline') {
  const bodies: any[] = [];
  await page.route(WEB3FORMS, async (route) => {
    bodies.push(JSON.parse(route.request().postData() ?? '{}'));
    if (outcome === 'offline') return route.abort('failed');
    await route.fulfill({
      status: outcome === 'success' ? 200 : 422,
      contentType: 'application/json',
      body: JSON.stringify(
        outcome === 'success'
          ? { success: true, message: 'Email sent successfully' }
          : { success: false, message: 'Invalid access key' }
      ),
    });
  });
  return bodies;
}

/*
  Ada bağlanmadan alan doldurmak yanıltıcıdır: React hidrasyonda kontrollü
  girdileri kendi state'ine (boş) döndürür ve o ana kadar Gönder de kapalıdır.
  Kullanıcının GÖRDÜĞÜ hazır olma işareti düğmenin açılmasıdır — ona bakılır.
*/
async function ready(page: Page) {
  await expect(page.getByTestId('kcf-submit').first()).toBeEnabled();
}

async function fillValid(page: Page) {
  await ready(page);
  await page.getByTestId('kcf-name').fill('Ayşe Yılmaz');
  await page.getByTestId('kcf-phone').fill('0532 625 68 12');
  await page.getByTestId('kcf-email').fill('ayse@example.com');
  await page.getByTestId('kcf-message').fill('Daireyi hafta sonu görebilir miyim?');
  await page.getByTestId('kcf-consent').check();
}

test.describe('Web3Forms anahtarı yokken', () => {
  test.skip(ENABLED, 'company.json anahtar içeriyor — açık mod testleri geçerli');

  for (const surface of SURFACES) {
    test(`${surface.name}: ölü gönderim yerine dürüst not`, async ({ page }) => {
      await page.goto(u(surface.path));
      await expect(page.getByTestId('kcf-offline').first()).toBeVisible();
      await expect(page.getByTestId('kcf-form')).toHaveCount(0);
      await expect(page.getByTestId('kcf-submit')).toHaveCount(0);
      await expect(page.getByTestId('kcf-offline').first()).toContainText(/telefon veya WhatsApp/i);
    });
  }
});

test.describe('Web3Forms anahtarı varken', () => {
  test.skip(!ENABLED, 'company.json anahtar içermiyor — kapalı mod testleri geçerli');

  for (const surface of SURFACES) {
    test.describe(surface.name, () => {
      test('ada hidratlanır ve tam alan kümesi görünür', async ({ page }) => {
        await page.goto(u(surface.path));
        const form = page.getByTestId('kcf-form').first();
        await expect(form).toBeVisible();
        await expect(page.getByTestId('kcf-offline')).toHaveCount(0);

        for (const id of ['kcf-name', 'kcf-phone', 'kcf-email', 'kcf-message', 'kcf-consent']) {
          await expect(page.getByTestId(id).first(), id).toBeVisible();
        }
        await expect(page.getByTestId('kcf-message').first()).toHaveAttribute(
          'placeholder',
          'Örn. Daireyi hafta sonu görebilir miyim?'
        );
        // KVKK bağlantısı yeni sekmede ve opener sızdırmadan açılır
        const privacy = page.getByTestId('kcf-privacy-link').first();
        await expect(privacy).toHaveAttribute('href', '/gizlilik-ve-cerez-politikasi/');
        await expect(privacy).toHaveAttribute('target', '_blank');
        await expect(privacy).toHaveAttribute('rel', /noopener/);
        await expect(privacy).toHaveAttribute('rel', /noreferrer/);
      });

      test('mobil kullanılabilirlik: 16px giriş, 44px dokunma hedefi', async ({ page }) => {
        await page.goto(u(surface.path));
        // 16px ALTI iOS Safari'de odaklanınca sayfayı yakınlaştırır — ölçülür, varsayılmaz.
        for (const id of ['kcf-name', 'kcf-phone', 'kcf-email', 'kcf-message']) {
          const size = await page
            .getByTestId(id)
            .first()
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
          expect(size, `${id} font-size`).toBeGreaterThanOrEqual(16);
        }
        for (const id of ['kcf-name', 'kcf-phone', 'kcf-submit']) {
          const box = await page.getByTestId(id).first().boundingBox();
          expect(box!.height, `${id} yüksekliği`).toBeGreaterThanOrEqual(44);
        }
      });

      test('Türkçe doğrulama: boş gönderim engellenir, hatalar alana bağlanır', async ({ page }) => {
        await page.goto(u(surface.path));
        await ready(page);
        const requests: string[] = [];
        page.on('request', (r) => requests.push(r.url()));

        await page.getByTestId('kcf-submit').first().click();
        const nameErr = page.getByTestId('kcf-err-name').first();
        await expect(nameErr).toBeVisible();
        await expect(nameErr).toContainText('Lütfen adınızı');
        await expect(page.getByTestId('kcf-err-phone').first()).toBeVisible();
        await expect(page.getByTestId('kcf-err-consent').first()).toBeVisible();
        expect(requests.filter((url) => url.startsWith(WEB3FORMS))).toHaveLength(0);

        // hata alana aria-describedby ile bağlı olmalı, yoksa ekran okuyucu duymaz
        const input = page.getByTestId('kcf-name').first();
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        const describedBy = await input.getAttribute('aria-describedby');
        expect(describedBy).toBe(await nameErr.getAttribute('id'));
      });

      test('telefon gevşek kabul edilir; KVKK onayı zorunludur', async ({ page }) => {
        // 'reject' seçildi: doğrulama geçince form GÖNDERİR — başarı olsaydı
        // alanlar kalkar ve döngünün kalanı çalışamazdı.
        await stubWeb3Forms(page, 'reject');
        await page.goto(u(surface.path));
        await ready(page);
        await page.getByTestId('kcf-name').first().fill('Ayşe Yılmaz');
        await page.getByTestId('kcf-consent').first().check();

        for (const value of ['0532 625 68 12', '532 625 68 12', '+90 532 625 68 12', '+90-532-625-68-12']) {
          await page.getByTestId('kcf-phone').first().fill(value);
          await page.getByTestId('kcf-submit').first().click();
          await expect(page.getByTestId('kcf-err-phone'), value).toHaveCount(0);
        }

        // onay kaldırılırsa gönderim durur
        await page.getByTestId('kcf-consent').first().uncheck();
        await page.getByTestId('kcf-submit').first().click();
        await expect(page.getByTestId('kcf-err-consent').first()).toContainText('onay kutusunu işaretleyin');
      });

      test('başarı: gövde doğru, alanlar kalkar, panel + kanallar görünür', async ({ page }) => {
        const bodies = await stubWeb3Forms(page, 'success');
        await page.goto(u(surface.path));
        await page.evaluate(() => {
          (window as any).dataLayer = (window as any).dataLayer || [];
        });

        await fillValid(page);
        await page.getByTestId('kcf-submit').first().click();

        const success = page.getByTestId('kcf-success').first();
        await expect(success).toBeVisible();
        await expect(success).toContainText('Teşekkürler! Mesajınız bize ulaştı.');
        await expect(page.getByTestId('kcf-form')).toHaveCount(0);
        // çıkmaz sokak yok: panelde gerçek bir kanal düğmesi var
        await expect(page.getByTestId('kcf-success-fallback').first().locator('a').first()).toBeVisible();
        await expect(page.getByTestId('kcf-status').first()).toContainText('Teşekkürler');

        expect(bodies).toHaveLength(1);
        const body = bodies[0];
        expect(body.access_key).toBe(KEY);
        expect(body.from_name).toBe('meyinsaat.com');
        expect(body.subject).toMatch(/^Web Formu · /);
        expect(body.name).toBe('Ayşe Yılmaz');
        expect(body.email).toBe('ayse@example.com');
        expect(body.telefon).toBe('0532 625 68 12');
        expect(body.daire).toBeTruthy();
        expect(body.sayfa).toContain(surface.path);
        expect(body.message).toContain('Daireyi hafta sonu');
        expect(body.botcheck).toBe('');

        const events = await page.evaluate(() => (window as any).dataLayer ?? []);
        expect(events).toContainEqual({ event: 'form_submit_lead', form_location: surface.location });
      });

      test('e-posta boş bırakılabilir; telefon gövdede tam durur', async ({ page }) => {
        const bodies = await stubWeb3Forms(page, 'success');
        await page.goto(u(surface.path));
        await ready(page);
        await page.getByTestId('kcf-name').first().fill('Ayşe Yılmaz');
        await page.getByTestId('kcf-phone').first().fill('0532 625 68 12');
        await page.getByTestId('kcf-consent').first().check();
        await page.getByTestId('kcf-submit').first().click();

        await expect(page.getByTestId('kcf-success').first()).toBeVisible();
        expect(bodies[0].telefon).toBe('0532 625 68 12');
        expect(bodies[0].message).toContain('Telefon: 0532 625 68 12');
        expect(bodies[0].email).toBe('bildirim@meyinsaat.com');
      });

      for (const [label, outcome] of [
        ['API reddederse', 'reject'],
        ['ağ koparsa', 'offline'],
      ] as const) {
        test(`${label}: sahte başarı yok, düğme geri açılır, kanallar görünür`, async ({ page }) => {
          await stubWeb3Forms(page, outcome);
          await page.goto(u(surface.path));
          await fillValid(page);
          await page.getByTestId('kcf-submit').first().click();

          const failure = page.getByTestId('kcf-error').first();
          await expect(failure).toBeVisible();
          await expect(failure).toContainText('Mesaj gönderilemedi.');
          await expect(page.getByTestId('kcf-success')).toHaveCount(0);
          await expect(page.getByTestId('kcf-submit').first()).toBeEnabled();
          await expect(page.getByTestId('kcf-error-fallback').first().locator('a').first()).toBeVisible();

          const events = await page.evaluate(() => (window as any).dataLayer ?? []);
          expect(events.filter((e: any) => e?.event === 'form_submit_lead')).toHaveLength(0);
        });
      }

      test('bal küpü dolu bot: hiçbir şey gönderilmez', async ({ page }) => {
        const bodies = await stubWeb3Forms(page, 'success');
        await page.goto(u(surface.path));
        await fillValid(page);
        // Bal küpü ekran dışında ve pointer-events:none — bot gibi doğrudan işaretlenir.
        await page
          .locator('input[name="botcheck"]')
          .first()
          .evaluate((el) => {
            (el as HTMLInputElement).checked = true;
          });
        await page.getByTestId('kcf-submit').first().click();

        await expect(page.getByTestId('kcf-success').first()).toBeVisible();
        expect(bodies).toHaveLength(0);
      });
    });
  }

  test('iletişim sayfasında satış hattı yayımlanmaz — ofis kanalları gösterilir', async ({ page }) => {
    await page.goto(u('iletisim/'));
    await expect(page.locator('a[href="tel:+905326256812"]')).toHaveCount(0);
    await expect(page.locator('a[href*="wa.me/905326256812"]')).toHaveCount(0);
    await expect(page.getByTestId('kcf-nojs-call').first()).toHaveAttribute('href', 'tel:+902163940551');
    await expect(page.getByTestId('kcf-nojs-email').first()).toHaveAttribute('href', /^mailto:/);
  });

  test.describe('JS kapalıyken', () => {
    test.use({ javaScriptEnabled: false });

    for (const surface of SURFACES) {
      test(`${surface.name}: ölü form gizlenir, kanallar görünür kalır`, async ({ page }) => {
        await page.goto(u(surface.path));
        // Ada hidratlanamaz; sunucudan gelen form Gönder'e basınca hiçbir şey
        // yapmazdı — gizlenir ve yerine gerçek kanallar gösterilir.
        await expect(page.getByTestId('kcf-form').first()).toBeHidden();
        await expect(page.getByTestId('kcf-nojs-fallback').first()).toBeVisible();
      });
    }
  });
});
