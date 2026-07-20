import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Home content sections: real-projects preview, on-site journey, materials,
  why-MEY, contact CTA. Prove what the visitor sees — real copy, images that
  actually decode, and the confirmed 23-year/2021 facts (no fabricated stats or
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
  for (const name of ['Maşuk Apartmanı', 'El Ele Apartmanı', 'Çamoğlu Apartmanı']) {
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

test('materials board: annotated palette + interior photo on the dark panel', async ({ page }, testInfo) => {
  await page.goto(u('/'));
  const section = page.locator('.mp-section');
  await section.scrollIntoViewIfNeeded();

  // both images actually decode (cutout PNG + lobby photo)
  await decodes(page, '.mp-img');
  await decodes(page, '.mp-photo-img');

  // five material callouts exist twice: floating notes (desktop) and legend (small screens)
  await expect(section.locator('.mp-note')).toHaveCount(5);
  await expect(section.locator('.mp-legend-row')).toHaveCount(5);
  const floating = section.locator('.mp-note').first();
  const legend = section.locator('.mp-legend');
  if (testInfo.project.name === 'mobile-360') {
    await expect(legend).toBeVisible();
    await expect(floating).toBeHidden();
  } else {
    await expect(floating).toBeVisible();
    await expect(legend).toBeHidden();
  }
  await expect(section.locator('.mp-note-name').first()).toHaveText('CAM');
  await expect(section.locator('.mp-photo-tag')).toContainText('İÇ MEKAN');

  // it is the dark theatre panel, not a light card grid
  const bg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(14, 15, 17)');
});

test('why-MEY shows the confirmed 23-year group history and 2021 construction founding year', async ({ page }) => {
  await page.goto(u('/'));
  const cells = page.locator('.wm-cell');
  await expect(cells).toHaveCount(4);
  await expect(cells.nth(0).locator('.wm-num')).toHaveText('23');
  await expect(cells.nth(1).locator('.wm-num')).toHaveText('2021');
  await expect(cells.nth(1)).toContainText('MEY İNŞAAT KURULUŞ YILI');
  await expect(cells.nth(2)).toContainText('TEK ELDEN');
  await expect(cells.nth(3)).toContainText('ŞEFFAF');
  // The old stats grid rendered [Bilgi bekleniyor] chips here — must be gone.
  await expect(page.locator('.wm-grid')).not.toContainText('Bilgi bekleniyor');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('contact CTA closes the page with scoped general contact links', async ({ page }) => {
  await page.goto(u('/'));
  const cta = page.locator('.cc');
  await expect(cta).toBeVisible();
  await decodes(page, '.cc-bg');
  await expect(cta.locator('a.btn-primary')).toHaveAttribute('href', /\/iletisim\/?$/);
  await expect(cta.locator('a.btn-ghost')).toHaveAttribute('href', /\/projeler\/?$/);
  await expect(cta.locator('a[href="tel:+902163940551"]')).toHaveText('+90 (0216) 394 05 51');
  await expect(cta.locator('a[href="mailto:info@meykozmetik.com"]')).toHaveText('info@meykozmetik.com');
  await expect(cta.locator('a[href^="https://wa.me/"]')).toHaveCount(0);
  await expect(cta).not.toContainText('+90 532 625 68 12');
});
