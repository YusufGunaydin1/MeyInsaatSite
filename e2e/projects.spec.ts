import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  The three real MEY buildings (Maşuk Apartmanı, El Ele Apartmanı, Çamoğlu Apartmanı). Prove the
  visitor sees real names + decoded building renders, the per-building
  construction story (real stage frames) where it exists, and honest placeholders
  for facts not yet provided — never invented location/year/unit data.
*/

async function decodes(page, selector: string) {
  // Aktif düzendeki GÖRÜNÜR eşleşmeyi seç: kapak masaüstünde `.pds` sahnesinde,
  // mobilde kompakt akışta (`pdm-cover`) — biri daima display:none (naturalWidth 0).
  const img = page.locator(selector).filter({ visible: true }).first();
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
  await expect(page.locator('main')).toContainText('Çamoğlu Apartmanı');
  await expect(page.locator('main')).not.toContainText('PLACEHOLDER');
  await decodes(page, 'main .card img');
});

test('El Ele page: horizontal stage hero, construction story, honest samples', async ({ page }) => {
  await page.goto(u('/projeler/el-ele-apartmani'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('El Ele Apartmanı');
  // Full gallery set → the horizontal detail stage replaces the simple hero (like Maşuk).
  await expect(page.getByTestId('pd-stage')).toHaveCount(1);
  await decodes(page, '[data-testid="pd-photo"] img, [data-testid="pdm-cover"]');

  // Per-building construction story: 5 real stage frames + labelled records.
  await expect(page.getByText('ŞANTİYE KAYITLARI')).toBeVisible();
  await expect(page.locator('.ps-stage')).toHaveCount(5);
  await decodes(page, '.ps-img');

  // Facts not yet provided stay honest: the survey "pending" tag on the photo and
  // the single footnote that flags the grey sample values as representative.
  await expect(page.locator('.pds-tag-pending')).toContainText('DOĞRULANIYOR');
  await expect(page.getByTestId('pd-note')).toHaveCount(1);
});

test('Çamoğlu Apartmanı page: horizontal stage hero, construction story, honest samples', async ({ page }) => {
  await page.goto(u('/projeler/camoglu-apartmani'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Çamoğlu Apartmanı');
  // Full gallery set → the horizontal detail stage replaces the simple hero (like Maşuk/El Ele).
  await expect(page.getByTestId('pd-stage')).toHaveCount(1);
  await decodes(page, '[data-testid="pd-photo"] img, [data-testid="pdm-cover"]');

  // Per-building construction story: 5 real stage frames + labelled records.
  await expect(page.getByText('ŞANTİYE KAYITLARI')).toBeVisible();
  await expect(page.locator('.ps-stage')).toHaveCount(5);
  await decodes(page, '.ps-img');

  // Facts not yet provided stay honest: the survey "pending" tag on the photo and
  // the single footnote that flags the grey sample values as representative.
  await expect(page.locator('.pds-tag-pending')).toContainText('DOĞRULANIYOR');
  await expect(page.getByTestId('pd-note')).toHaveCount(1);
});

test('Maşuk page: horizontal stage hero, decoded cover, no fabricated story', async ({ page }) => {
  await page.goto(u('/projeler/masuk-apartmani'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maşuk Apartmanı');
  // Maşuk's full gallery set → the horizontal detail stage replaces the simple hero.
  await expect(page.getByTestId('pd-stage')).toHaveCount(1);
  await decodes(page, '[data-testid="pd-photo"] img, [data-testid="pdm-cover"]');
  // Maşuk has no stage sequence → the story section must be absent (not faked).
  await expect(page.locator('.ps-strip')).toHaveCount(0);
});
