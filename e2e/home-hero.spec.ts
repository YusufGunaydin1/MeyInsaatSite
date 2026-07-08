import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Home hero — the dark cinematic cover (owner-directed from the /showcases
  hero-lab "koyu kapak" pick). Prove what the visitor sees: a visible Oswald h1
  carrying the friendlier copy, a decoded building image behind it, both CTAs
  wired, and the scroll-to-build signature still sitting right below. Guards the
  old cold headline ("ÇİZDİĞİMİZİ İNŞA EDERİZ.") from creeping back.
*/

test('friendly Oswald h1 over a decoded building, CTAs wired', async ({ page }) => {
  await page.goto(u('/'));

  const hero = page.locator('.home-hero');
  await expect(hero).toBeVisible();

  // Exactly one h1, visible, carrying the friendly headline (not the old cold one).
  const h1 = page.locator('main h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toBeVisible();
  await expect(h1).toContainText('YAŞAM ALANLARINIZI');
  await expect(h1).toContainText('ÖZENLE İNŞA EDİYORUZ');
  await expect(h1).not.toContainText('ÇİZDİĞİMİZİ');

  // Display face is actually Oswald (not the Plex fallback).
  const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font.split(',')[0]).toContain('Oswald');

  // The building behind the cover actually decodes (not just a URL in the DOM).
  const bg = hero.locator('.home-hero-bg');
  await bg.scrollIntoViewIfNeeded();
  await expect
    .poll(() => bg.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);

  // Both CTAs present and wired to the real routes.
  await expect(hero.locator('a.btn-primary')).toHaveAttribute('href', /\/projeler\/?$/);
  await expect(hero.locator('a.btn-ghost')).toHaveAttribute('href', /\/iletisim\/?$/);
});

test('hero sits above the scroll-to-build signature', async ({ page }) => {
  await page.goto(u('/'));
  const heroBox = await page.locator('.home-hero').boundingBox();
  const scrubBox = await page.locator('[data-scrub]').boundingBox();
  expect(heroBox!.y).toBeLessThan(scrubBox!.y);
});
