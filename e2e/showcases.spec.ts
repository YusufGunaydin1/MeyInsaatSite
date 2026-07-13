import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  /showcases: dahili tasarım vitrini. Render olmalı; ama dışarıya sızmamalı —
  noindex meta + sitemap dışı + ana navigasyonda linki yok.
*/

test('showcases hub renders with the adopted-design card', async ({ page }) => {
  await page.goto(u('showcases/'));
  await expect(page.locator('h1')).toContainText('Tasarım Vitrini');
  // The stepped compact panel won (2026-07-11) and shipped to production. Target
  // the LIVE card by status (card order changes as proposals are added), not .first().
  const live = page
    .locator('.sc-card')
    .filter({ has: page.locator('.sc-status.live') })
    .first();
  await expect(live).toContainText('CANLIDA');
  await expect(live).toContainText('adımlı gezinme');
  await expect(live.locator('a.sc-open')).toHaveAttribute('href', /projeler\/ali/);
  // noindex: arama motorlarına kapalı
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
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

test('showcases is absent from sitemap and main nav', async ({ page, request, baseURL }) => {
  const xml = await (await request.get(baseURL + 'sitemap-0.xml')).text();
  expect(xml).not.toContain('/showcases');

  await page.goto(u('/'));
  const navHrefs = await page
    .locator('header nav a')
    .evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(navHrefs.some((h) => h?.includes('showcases'))).toBe(false);
});
