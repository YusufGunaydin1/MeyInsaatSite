import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Arabic must be truly RTL: layout mirrors via logical properties, the Arabic
  face loads, and Latin-script pages never download the Arabic font (subset gate).
*/

test('ar page is RTL and the guide-line mirrors to the right', async ({ page }) => {
  await page.goto(u('/ar'));
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // border-inline-start must resolve to border-RIGHT in RTL.
  const borders = await page
    .locator('.guide-line-v')
    .first()
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return { right: s.borderRightWidth, left: s.borderLeftWidth };
    });
  expect(borders.right).toBe('1px');
  expect(borders.left).toBe('0px');
});

test('ar page loads IBM Plex Sans Arabic and headline actually uses it', async ({ page }) => {
  await page.goto(u('/ar'));
  await page.waitForLoadState('networkidle');
  const loaded = await page.evaluate(() =>
    document.fonts.check('700 32px "IBM Plex Sans Arabic"')
  );
  expect(loaded).toBe(true);

  const h1Font = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1Font).toContain('IBM Plex Sans Arabic');
});

test('tr page does NOT download the Arabic face; ar does', async ({ page }) => {
  const trRequests: string[] = [];
  page.on('request', (r) => trRequests.push(r.url()));
  await page.goto(u('/'));
  await page.waitForLoadState('networkidle');
  expect(trRequests.filter((u) => u.includes('arabic')).length).toBe(0);

  const arRequests: string[] = [];
  const page2 = await page.context().newPage();
  page2.on('request', (r) => arRequests.push(r.url()));
  await page2.goto(u('/ar'));
  await page2.waitForLoadState('networkidle');
  expect(arRequests.filter((u) => u.includes('ibm-plex-sans-arabic')).length).toBeGreaterThan(0);
});

test('ru headline uses Oswald natively (variable font ships full Cyrillic)', async ({ page }) => {
  await page.goto(u('/ru'));
  await page.waitForLoadState('networkidle');
  // The hero display heading — now the page's visible h1 (the dark cinematic cover)
  const h1 = page.locator('.t-display-xl').first();
  const family = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family.split(',')[0]).toContain('Oswald');
  // The Cyrillic subset must actually be DOWNLOADED, not just named in the stack —
  // otherwise RU silently renders in the fallback face.
  const cyrillicLoaded = await h1.evaluate(() =>
    [...document.fonts].some(
      (f) => f.family.includes('Oswald') && f.status === 'loaded'
    )
  );
  expect(cyrillicLoaded).toBe(true);
});
