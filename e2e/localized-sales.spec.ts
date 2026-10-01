import { test, expect } from '@playwright/test';
import { u } from './util';

const locales = [
  { code: 'en', title: 'Apartments for Sale in Pendik', details: 'Specifications', directions: 'Directions', close: 'Close' },
  { code: 'ru', title: 'Квартиры на продажу в Пендике', details: 'Характеристики', directions: 'Маршрут', close: 'Закрыть' },
  { code: 'ar', title: 'شقق للبيع في بندك', details: 'المواصفات', directions: 'الاتجاهات', close: 'إغلاق' },
];
const sale = 'pendik-satilik-3-2-dubleks';
const sold = 'el-ele-apartmani-3-2-dubleks-satildi';
const untranslated = /Formu kısa süre|Satılık Daireler|Künye|Yakın zamanda|Gönderiliyor|Yol tarifi|Daire \d|üst kat|alt kat|Sonraki fotoğraf|Bilgi bekleniyor/;

for (const locale of locales) {
  test(`${locale.code}: project enquiry links to its available apartment`, async ({ page }) => {
    await page.goto(u(`/${locale.code}/projeler/el-ele-apartmani/`), { waitUntil: 'domcontentloaded' });
    const link = page.getByTestId('pd-sale-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', `/${locale.code}/satilik-daireler/${sale}/`);
    await link.click();
    await expect(page.getByTestId('kc-price')).toHaveText('13.750.000 TL');
  });

  test(`${locale.code}: filters, favourites and detail navigation stay localized`, async ({ page }, info) => {
    await page.goto(u(`/${locale.code}/satilik-daireler/`), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1:visible')).toHaveText(locale.title);
    await expect(page.getByTestId('kl-card')).toHaveCount(5);
    await expect(page.locator('main')).not.toContainText(untranslated);
    const overlaps = await page.locator('.kl-card-media').evaluateAll(cards => cards.flatMap(card => {
      const labels = Array.from(card.querySelectorAll('.kl-badge,.kl-heart,.kl-sold'));
      return labels.flatMap((a, i) => labels.slice(i + 1).flatMap(b => {
        const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
        return Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1
          && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1
          ? [`${a.textContent} / ${b.textContent}`] : [];
      }));
    }));
    expect(overlaps, 'Translated badges and favourite controls must remain readable').toEqual([]);
    const mobile = info.project.name === 'mobile-360';
    await page.getByTestId(mobile ? 'klm-tab-proje' : 'kl-tab-proje').click();
    await expect(page.getByTestId('kl-card')).toHaveCount(3);
    await page.getByTestId(mobile ? 'klm-tab-ilan' : 'kl-tab-ilan').click();
    await expect(page.getByTestId('kl-card')).toHaveCount(2);
    if (mobile) {
      await page.getByTestId('klm-filter-toggle').click();
      await page.getByTestId('klm-f-status').selectOption('available');
      await page.getByTestId('klm-apply').click();
    } else {
      await page.getByTestId('kl-fav-d12').click();
      await page.getByTestId('kl-favorilerim').click();
    }
    await expect(page.getByTestId('kl-card')).toHaveCount(1);
    await expect(page.getByTestId('kl-price-d12')).toHaveText('13.750.000 TL');
    await page.getByTestId('kl-detay-d12').click();
    await expect(page).toHaveURL(new RegExp(`/${locale.code}/satilik-daireler/${sale}/$`));
    await expect(page.getByTestId('kc-specs-d2')).not.toContainText(untranslated);
  });

  for (const slug of [sale, sold]) {
    test(`${locale.code}/${slug}: gallery, FAQ, map and contact work`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(u(`/${locale.code}/satilik-daireler/${slug}/`), { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: locale.details, exact: true })).toBeVisible();
      await expect(page.locator('main')).not.toContainText(untranslated);
      await expect(page.getByTestId('kc-car-main')).not.toHaveAttribute('alt', untranslated);
      // The expansion control is desktop-only; its attached node proves hydration.
      await expect(page.getByTestId('kc-car-wide')).toHaveCount(1);
      await page.getByTestId('kc-car-next').click();
      await expect(page.getByTestId('kc-car-count')).toHaveText(/^2 \/ /);
      await expect(page.getByTestId('kc-car-count')).toHaveCSS('direction', 'ltr');
      await expect(page.locator('.kcar-cap')).not.toContainText(untranslated);
      await page.getByTestId('kc-car-full').click();
      await expect(page.getByTestId('kc-car-overlay')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('kc-car-overlay')).toHaveCount(0);
      const question = page.getByTestId('kc-faq').locator('summary').first();
      await question.click();
      await expect(page.getByTestId('kc-faq').locator('details').first()).toHaveAttribute('open', '');
      const expand = page.getByTestId('kc-loc-expand');
      await expand.scrollIntoViewIfNeeded();
      await expand.click();
      const modal = page.getByTestId('kc-loc-modal');
      await expect(modal).toBeVisible();
      await expect(modal).not.toContainText(/DOĞRULANMIŞ|KESİN|Yol tarifi/);
      await expect(modal.getByRole('link', { name: locale.directions, exact: true })).toHaveAttribute('href', /google.*maps/);
      await modal.getByRole('button', { name: locale.close, exact: true }).click();
      await expect(modal).toHaveCount(0);
      await expect(page.getByTestId('kc-rail-phone')).toHaveAttribute('href', 'tel:+905326256812');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }
}
