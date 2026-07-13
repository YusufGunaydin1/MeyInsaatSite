import { test, expect } from '@playwright/test';
import { u } from './util';

const LOCALES = [
  { code: 'tr', prefix: '', dir: 'ltr' },
  { code: 'en', prefix: '/en', dir: 'ltr' },
  { code: 'ru', prefix: '/ru', dir: 'ltr' },
  { code: 'ar', prefix: '/ar', dir: 'rtl' },
];

const ROUTES = ['/', '/kurumsal', '/hizmetler', '/projeler', '/projeler/el-ele-apartmani', '/iletisim'];

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    test(`${locale.code} ${route} renders`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(String(e)));

      const url = `${locale.prefix}${route === '/' ? (locale.prefix ? '' : '/') : route}`;
      const res = await page.goto(u(url || '/'));
      expect(res?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
      await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
      await expect(page).toHaveTitle(/MEY/);
      // Detay sayfası iki düzende iki <h1> içerir (biri display:none → a11y ağacı
      // dışında); role sorgusu yalnız GÖRÜNÜR h1'i eşler (her düzende tek).
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      // Site footer landmark only: the detail stage's dossier card also renders a
      // sectioning <footer> (inside <article>, not a contentinfo landmark), so a
      // bare `footer` locator now matches two elements — target the page footer.
      await expect(page.getByRole('contentinfo')).toBeVisible();

      // Prove images the user sees actually load (naturalWidth > 0), not just URLs in DOM.
      // The scrub poster is excluded: it flips to hidden when the canvas takes over
      // (it has its own dedicated test) and a live :visible locator would go stale.
      const imgs = await page.locator('main img:not([data-poster]), header img').all();
      for (const [i, img] of imgs.entries()) {
        if (!(await img.isVisible())) continue;
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(async () => img.evaluate((el: HTMLImageElement) => el.naturalWidth), {
            message: `image ${i} on ${locale.code}${route} must decode`,
          })
          .toBeGreaterThan(0);
      }

      expect(errors, `console pageerrors on ${locale.code}${route}`).toEqual([]);
    });
  }
}

test('language switcher navigates to same route in other locale', async ({ page }) => {
  await page.goto(u('/kurumsal'));
  await page.locator('[data-lang-switcher] summary').click();
  await page.locator('[data-lang-switcher] a', { hasText: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/kurumsal\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('placeholders are visibly flagged, never fake facts', async ({ page }) => {
  await page.goto(u('/iletisim'));
  // No invented phone/email: placeholder chips render instead.
  const chips = page.locator('main span', { hasText: /Bilgi bekleniyor/ });
  expect(await chips.count()).toBeGreaterThan(0);
});
