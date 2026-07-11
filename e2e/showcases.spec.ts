import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /showcases: dahili tasarım vitrini. Render olmalı; ama dışarıya sızmamalı —
  noindex meta + sitemap dışı + ana navigasyonda linki yok.
*/

test('showcases hub renders with the preserved-design card', async ({ page }) => {
  await page.goto(u('showcases/'));
  await expect(page.locator('h1')).toContainText('Tasarım Vitrini');
  // The compact panel (photo fixed, right window slides) is PRESERVED by user order.
  const card = page.locator('.sc-card').first();
  await expect(card).toContainText('KORUNDU');
  await expect(card).toContainText('Kompakt panel');
  await expect(card.locator('a.sc-open')).toHaveAttribute('href', /proje-detay-yatay-lab/);
  // noindex: arama motorlarına kapalı
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('showcases is absent from sitemap and main nav', async ({ page, request, baseURL }) => {
  const xml = await (await request.get(baseURL + 'sitemap-0.xml')).text();
  expect(xml).not.toContain('/showcases');

  await page.goto(u('/'));
  const navHrefs = await page
    .locator('header nav a')
    .evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(navHrefs.some((h) => h?.includes('showcases'))).toBe(false);
});
