import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  The three real MEY buildings (Ali, El Ele Apartmanı, Sapanbağları). Prove the
  visitor sees real names + decoded building renders, the per-building
  construction story (real stage frames) where it exists, and honest placeholders
  for facts not yet provided — never invented location/year/unit data.
*/

async function decodes(page, selector: string) {
  const img = page.locator(selector).first();
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
}

test('projects list shows the three real buildings with decoded covers', async ({ page }) => {
  await page.goto(u('/projeler'));
  const tiles = page.locator('main .card');
  await expect(tiles).toHaveCount(3);
  await expect(page.locator('main')).toContainText('El Ele Apartmanı');
  await expect(page.locator('main')).toContainText('Sapanbağları');
  await expect(page.locator('main')).not.toContainText('PLACEHOLDER');
  await decodes(page, 'main .card img');
});

test('El Ele page: real name, decoded render, construction story, honest specs', async ({ page }) => {
  await page.goto(u('/projeler/el-ele-apartmani'));
  await expect(page.locator('h1')).toHaveText('El Ele Apartmanı');
  await decodes(page, '.pd-hero-img');

  // Per-building construction story: 5 real stage frames + labelled records.
  await expect(page.getByText('ŞANTİYE KAYITLARI')).toBeVisible();
  await expect(page.locator('.ps-stage')).toHaveCount(5);
  await decodes(page, '.ps-img');

  // Facts not yet provided render as visible placeholders, never invented.
  await expect(page.locator('.pd-specs')).toContainText('Bilgi bekleniyor');
});

test('Ali page: decoded render, no fabricated construction story', async ({ page }) => {
  await page.goto(u('/projeler/ali'));
  await expect(page.locator('h1')).toHaveText('Ali Apartmanı');
  await decodes(page, '.pd-hero-img');
  // Ali has no stage sequence → the story section must be absent (not faked).
  await expect(page.locator('.ps-strip')).toHaveCount(0);
});
