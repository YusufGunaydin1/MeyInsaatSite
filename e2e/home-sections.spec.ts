import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Home content sections: real-projects preview, on-site journey, materials,
  why-MEY, contact CTA. Prove what the visitor sees — real copy, images that
  actually decode, and the real 23/6 numbers (no fabricated stats, no leftover
  placeholders where facts exist). The before/after band was removed 2026-07.
*/

async function decodes(page, selector: string) {
  const img = page.locator(selector).first();
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
}

test('projects preview shows the three real buildings linked to their pages', async ({ page }) => {
  await page.goto(u('/'));
  const tiles = page.locator('main a.card[href*="/projeler/"]');
  await expect(tiles).toHaveCount(3);
  for (const name of ['Ali Apartmanı', 'El Ele Apartmanı', 'Sapanbağları']) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  await decodes(page, 'main a.card img');
  // The generic placeholder tiles ("Proje portföyü hazırlanıyor") are gone.
  await expect(page.locator('main')).not.toContainText('Proje portföyü hazırlanıyor');
});

test('before/after band is gone from home', async ({ page }) => {
  await page.goto(u('/'));
  await expect(page.locator('.ba-band')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('SONRA · TESLİM');
});

test('on-site journey renders six real stages with decoded imagery', async ({ page }) => {
  await page.goto(u('/'));
  await expect(page.locator('.cj-stage')).toHaveCount(6);
  await expect(page.getByText('02 — ŞANTİYEDEN')).toBeVisible();
  await expect(page.locator('.cj-stage').first()).toContainText('Kazı & Zemin');
  await decodes(page, '.cj-img');
});

test('journey is a single six-across row on desktop', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 1024, 'desktop only');
  await page.goto(u('/'));
  const cols = await page
    .locator('.cj-journey')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(cols).toBe(6);
  const tops = await page
    .locator('.cj-stage')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size, 'all six stages share one row').toBe(1);
});

test('process steps render as four rising levels on home and services', async ({ page }) => {
  for (const path of ['/', '/hizmetler']) {
    await page.goto(u(path));
    const steps = page.locator('.ps-step');
    await expect(steps, `steps on ${path}`).toHaveCount(4);
    await expect(steps.first()).toContainText('Değerlendirme ve tasarım');
    // The old white-card grid is gone; the red level line carries the design.
    const border = await steps
      .first()
      .locator('.ps-level')
      .evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).toBe('rgb(181, 35, 35)'); // --mey-red
  }
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
