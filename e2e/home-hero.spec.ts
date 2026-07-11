import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Home hero — the sky cover under a dark scrim (owner-directed): three
  delivered blocks under a blue sky, white copy over a graphite scrim sitting
  in the open sky on the left. Prove what the visitor sees: a visible Oswald h1
  carrying the friendlier copy, a decoded building image behind it, both CTAs
  wired, and the scroll-to-build signature still sitting right below. Guards the
  old cold headline ("ÇİZDİĞİMİZİ İNŞA EDERİZ.") from creeping back.
*/

test('friendly Oswald h1 in the sky, white on scrim, CTAs wired', async ({ page }) => {
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

  // Theatre cover: the h1 renders white over the scrim (not the light-page graphite).
  const color = await h1.evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(255, 255, 255)');

  // On desktop the title sits in the open sky left of the towers.
  const vw = page.viewportSize()!.width;
  if (vw >= 1000) {
    const box = (await h1.boundingBox())!;
    expect(box.x).toBeLessThan(vw * 0.12);
    expect(box.x + box.width).toBeLessThan(vw * 0.6);
  }

  // The building behind the cover actually decodes (not just a URL in the DOM).
  const bg = hero.locator('.home-hero-bg');
  await bg.scrollIntoViewIfNeeded();
  await expect
    .poll(() => bg.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);

  // Art direction: phones get the corner-building cover, desktop the sky
  // panorama — prove the browser actually picked the right source.
  const currentSrc = await bg.evaluate((el: HTMLImageElement) => el.currentSrc);
  if (page.viewportSize()!.width <= 768) {
    expect(currentSrc).toContain('hero-residential-corner-building');
  } else {
    expect(currentSrc).toContain('hero-three-blocks-sky');
  }

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
