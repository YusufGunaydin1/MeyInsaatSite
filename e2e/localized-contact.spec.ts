import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { u } from './util';

const company = JSON.parse(readFileSync(new URL('../content/company.json', import.meta.url), 'utf8'));
const locales = [
  { code: 'tr', heading: 'Doğrudan ulaşın' },
  { code: 'en', heading: 'Contact us directly' },
  { code: 'ru', heading: 'Свяжитесь с нами напрямую' },
  { code: 'ar', heading: 'تواصل معنا مباشرة' },
];

for (const locale of locales) {
  test(`${locale.code}: unconfigured form provides usable office contacts`, async ({ page }) => {
    test.skip(Boolean(company.contact.formAccessKey), 'Configured forms are covered by lead-form.spec.ts');
    const prefix = locale.code === 'tr' ? '' : `/${locale.code}`;
    await page.goto(u(`${prefix}/iletisim/`), { waitUntil: 'domcontentloaded' });
    const section = page.getByTestId('contact-form');
    await expect(section.getByRole('heading')).toHaveText(locale.heading);
    await expect(section).not.toContainText(/opening soon|Formu kısa süre|WhatsApp|aynı gün/);
    await expect(section.getByTestId('kcf-offline-call')).toHaveAttribute('href', 'tel:+902163940551');
    await expect(section.getByTestId('kcf-offline-email')).toHaveAttribute('href', 'mailto:info@meykozmetik.com');
    await expect(section.getByTestId('kcf-offline-call')).toBeVisible();
    await expect(section.getByTestId('kcf-offline-call').locator('bdi')).toHaveCSS('direction', 'ltr');
    await expect(section.getByTestId('kcf-offline-email')).toBeVisible();
    await expect(section.locator('form')).toHaveCount(0);
    expect(await section.evaluate(el => getComputedStyle(el).direction)).toBe(locale.code === 'ar' ? 'rtl' : 'ltr');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test(`${locale.code}: corporate statistics contain only supplied figures`, async ({ page }) => {
    const prefix = locale.code === 'tr' ? '' : `/${locale.code}`;
    await page.goto(u(`${prefix}/kurumsal/`), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main .placeholder-chip')).toHaveCount(0);
    await expect(page.locator('main dl dd')).toContainText(['23', '2021']);
  });
}

test.describe('Direct contact without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('English office and Arabic sales links remain usable', async ({ page }) => {
    test.skip(Boolean(company.contact.formAccessKey), 'Configured form fallback is covered separately');
    await page.goto(u('/en/iletisim/'), { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('kcf-offline-email')).toBeVisible();
    await page.goto(u('/ar/satilik-daireler/'), { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('kcf-offline-whatsapp')).toHaveAttribute('href', /^https:\/\/wa.me\/905326256812/);
    await expect(page.getByTestId('kl-detay-d12')).toHaveAttribute('href', '/ar/satilik-daireler/pendik-satilik-3-2-dubleks/');
  });
});
