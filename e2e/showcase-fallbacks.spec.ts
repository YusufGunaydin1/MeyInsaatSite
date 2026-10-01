import { test, expect } from '@playwright/test';
import { u } from './util';

test.describe('Showcases without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all original and furnished room concepts remain viewable', async ({ page }) => {
    await page.goto(u('showcases/ic-mekan-lab/'), { waitUntil: 'domcontentloaded' });
    const fallback = page.locator('.il-fallback');
    await expect(fallback).toBeVisible();
    await expect(fallback.locator('figure')).toHaveCount(6);
    for (const image of await fallback.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(1000);
    }
    await expect(page.getByRole('link', { name: 'Gerçek daireyi incele' })).toHaveAttribute('href', '/satilik-daireler/pendik-satilik-3-2-dubleks/');
  });

  test('motion lab keeps its poster, architectural model and facade readable', async ({ page }) => {
    await page.goto(u('showcases/hareket-lab/'), { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('motion-build').locator('[data-build-poster]')).toBeVisible();
    await expect(page.getByTestId('motion-assembly').locator('svg')).toBeVisible();
    await page.getByTestId('motion-facade').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('facade-day-image')).toBeVisible();
    await expect(page.getByTestId('motion-build').locator('.ml-controls')).toBeHidden();
  });
});
