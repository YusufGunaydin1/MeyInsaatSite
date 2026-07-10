import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Facade x-ray lens (approved lab variant B1): the pixel-aligned cutaway twin
  sits above the cover; hidden idle, revealed in a small feathered circle under
  the cursor. Prove the perceived behavior: hidden -> hover reveal at the
  cursor -> full cutaway via the toggle (keyboard/touch path), and that the
  two layers actually coincide (0-delta boxes) so the "same flat" claim holds.
*/

test('detail hero: cutaway hidden idle, revealed under cursor, toggle opens full', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 900, 'desktop hover flow');
  await page.goto(u('/projeler/ali'));
  const xr = page.locator('.pd-hero-media .xrv');
  const top = xr.locator('.xrv-top');
  await xr.scrollIntoViewIfNeeded();

  // idle: overlay invisible
  await expect(top).toHaveCSS('opacity', '0');

  // layers pixel-aligned: same box for base and cutaway
  const delta = await xr.evaluate((el) => {
    const [a, b] = Array.from(el.querySelectorAll('img')).map((i) =>
      i.getBoundingClientRect()
    );
    return (
      Math.abs(a.x - b.x) + Math.abs(a.y - b.y) +
      Math.abs(a.width - b.width) + Math.abs(a.height - b.height)
    );
  });
  expect(delta).toBeLessThan(1);

  // hover: overlay visible, mask centered at the cursor position
  const box = (await xr.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3);
  await expect(top).toHaveCSS('opacity', '1');
  const mask = await top.evaluate(
    (el) => getComputedStyle(el).maskImage || (getComputedStyle(el) as any).webkitMaskImage
  );
  expect(mask).toContain('radial-gradient');
  expect(mask).toContain('60%'); // --x written from the pointer position
  await expect(top).toBeVisible();
  await expect
    .poll(() => top.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);

  // toggle: full cutaway for keyboard/touch users
  const btn = xr.locator('.xrv-toggle');
  await expect(btn).toHaveText('İç görünümü aç');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect(btn).toHaveText('İç görünümü kapat');
  const openMask = await top.evaluate(
    (el) => getComputedStyle(el).maskImage || (getComputedStyle(el) as any).webkitMaskImage
  );
  expect(openMask).toBe('none');
});

test('project tiles carry the lens on /projeler and home', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 900, 'desktop hover flow');
  for (const path of ['/projeler', '/']) {
    await page.goto(u(path));
    const overlays = page.locator('a.card .xrv-top');
    await expect(overlays, `overlays on ${path}`).toHaveCount(3);
    // tiles never render the toggle button inside their link
    await expect(page.locator('a.card .xrv-toggle')).toHaveCount(0);
  }
});

test('toggle button is localized and present for touch users', async ({ page }) => {
  await page.goto(u('/en/projeler/ali'));
  await expect(page.locator('.pd-hero-media .xrv-toggle')).toHaveText('Show interior');
});

test('touch: lens is off by default, never blocks scrolling, button opens it', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'touch behavior (mobile project)');
  await page.goto(u('/projeler/ali'));
  const xr = page.locator('.pd-hero-media .xrv');
  const top = xr.locator('.xrv-top');
  await xr.scrollIntoViewIfNeeded();

  // The image must not claim touch gestures — page scroll stays free.
  const touchAction = await xr.evaluate((el) => getComputedStyle(el).touchAction);
  expect(touchAction).toBe('auto');

  // A tap on the image itself reveals nothing (no lens on touch).
  const box = (await xr.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.3);
  await expect(top).toHaveCSS('opacity', '0');

  // The button is the on/off switch for the interior view.
  const btn = xr.locator('.xrv-toggle');
  await btn.tap();
  await expect(top).toHaveCSS('opacity', '1');
  await expect(btn).toHaveText('İç görünümü kapat');
  await btn.tap();
  await expect(top).toHaveCSS('opacity', '0');
  await expect(btn).toHaveText('İç görünümü aç');
});
