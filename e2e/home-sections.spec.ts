import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Home content sections adopted 2026-07 from the /showcases labs: before/after,
  on-site journey, materials, why-MEY, contact CTA. Prove what the visitor sees —
  real copy, images that actually decode, and the real 23/6 numbers (no
  fabricated stats, no leftover placeholders where facts exist).
*/

async function decodes(page, selector: string) {
  const img = page.locator(selector).first();
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
}

test('before/after band shows a decoded composite with both tags', async ({ page }) => {
  await page.goto(u('/'));
  const band = page.locator('.ba-band');
  await expect(band).toBeVisible();
  await decodes(page, '.ba-img');
  await expect(band.locator('.ba-before')).toHaveText('ÖNCE');
  await expect(band.locator('.ba-after')).toContainText('SONRA');
});

test('on-site journey renders six real stages with decoded imagery', async ({ page }) => {
  await page.goto(u('/'));
  await expect(page.locator('.cj-stage')).toHaveCount(6);
  await expect(page.getByText('03 — ŞANTİYEDEN')).toBeVisible();
  await expect(page.locator('.cj-stage').first()).toContainText('Kazı & Zemin');
  await decodes(page, '.cj-img');
});

test('materials mood board renders three decoded tiles', async ({ page }) => {
  await page.goto(u('/'));
  await expect(page.locator('.mm-cell')).toHaveCount(3);
  await decodes(page, '.mm-img');
  await expect(page.locator('.mm-tag').first()).toContainText('MALZEME');
});

test('why-MEY shows the real 23/6 numbers, no placeholder chips', async ({ page }) => {
  await page.goto(u('/'));
  const cells = page.locator('.wm-cell');
  await expect(cells).toHaveCount(4);
  await expect(cells.nth(0).locator('.wm-num')).toHaveText('23');
  await expect(cells.nth(1).locator('.wm-num')).toHaveText('6');
  await expect(cells.nth(2)).toContainText('TEK ELDEN');
  await expect(cells.nth(3)).toContainText('ŞEFFAF');
  // The old stats grid rendered [Bilgi bekleniyor] chips here — must be gone.
  await expect(page.locator('.wm-grid')).not.toContainText('Bilgi bekleniyor');
});

test('contact CTA closes the page: decoded backdrop, wired actions', async ({ page }) => {
  await page.goto(u('/'));
  const cta = page.locator('.cc');
  await expect(cta).toBeVisible();
  await decodes(page, '.cc-bg');
  await expect(cta.locator('a.btn-primary')).toHaveAttribute('href', /\/iletisim\/?$/);
  await expect(cta.locator('a.btn-ghost')).toHaveAttribute('href', /\/projeler\/?$/);
  // Contact facts are null in company.json → honest placeholders, never invented.
  await expect(cta.locator('.cc-channels')).toContainText('Bilgi bekleniyor');
});
