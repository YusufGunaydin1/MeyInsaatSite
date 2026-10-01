import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /showcases: dahili tasarım vitrini. Render olmalı; ama dışarıya sızmamalı —
  noindex meta + sitemap dışı + ana navigasyonda linki yok.
*/

test('showcases hub lists only active design proposals', async ({ page }) => {
  await page.goto(u('showcases/'));
  await expect(page.locator('h1')).toContainText('Tasarım Vitrini');
  await expect(page.locator('.sc-card')).toHaveCount(4);
  await expect(page.locator('.sc-card')).toContainText(['İç Mekân', 'Hareket', 'Konum', 'Kurumsal']);
  await expect(page.locator('.sc-card .sc-status')).toHaveText(Array(4).fill('○ ÖNERİ'));
  await expect(page.locator('a[href*="showcases/iletisim-lab"]')).toHaveCount(0);
  await expect(page.locator('a[href*="showcases/satilik-daireler"]')).toHaveCount(0);
  await expect(page.locator('a[href*="showcases/satilik-mobile-kompakt"]')).toHaveCount(0);
  await expect(page.getByTestId('showcases-sale-entry')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /\bnoindex\b/);
});

test('showcases hub links the exact-location proposal', async ({ page }) => {
  await page.goto(u('showcases/'));
  const proposal = page.locator('.sc-card').filter({ hasText: 'Konum' }).first();
  await expect(proposal).toContainText('ÖNERİ');
  await expect(proposal.locator('a.sc-open')).toHaveAttribute('href', /showcases\/konum-lab$/);
});

test('showcases hub lists the kurumsal upgrade proposal', async ({ page }) => {
  await page.goto(u('showcases/'));
  const proposal = page
    .locator('.sc-card')
    .filter({ hasText: 'Kurumsal' })
    .first();
  await expect(proposal).toContainText('ÖNERİ');
  await expect(proposal.locator('a.sc-open')).toHaveAttribute(
    'href',
    /showcases\/kurumsal-lab/
  );
});

test('showcases is absent from sitemap and main nav', async ({ page, baseURL }) => {
  const response = await page.goto(baseURL + 'sitemap-0.xml');
  expect(response?.status()).toBe(200);
  const xml = await response!.text();
  expect(xml).not.toContain('/showcases');

  await page.goto(u('/'));
  const navHrefs = await page
    .locator('header nav a')
    .evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(navHrefs.some((h) => h?.includes('showcases'))).toBe(false);
});

test('new visual labs are reachable from their image-led cards', async ({ page }) => {
  for (const [name, route] of [['İç Mekân', 'ic-mekan-lab'], ['Hareket', 'hareket-lab']]) {
    await page.goto(u('showcases/'), { waitUntil: 'domcontentloaded' });
    const card = page.locator('.sc-card').filter({ hasText: name }).first();
    await card.locator('img').scrollIntoViewIfNeeded();
    await expect.poll(() => card.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(500);
    await card.locator('.sc-open').click();
    await expect(page).toHaveURL(new RegExp(`/showcases/${route}/$`));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /\bnoindex\b/);
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(1);
    await page.getByRole('link', { name: 'Vitrine dön' }).click();
    await expect(page.locator('h1')).toHaveText('Tasarım Vitrini');
  }
});
