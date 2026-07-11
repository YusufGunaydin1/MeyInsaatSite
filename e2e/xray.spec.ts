import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Facade x-ray lens (approved lab variant B1): the pixel-aligned cutaway twin
  sits above the cover; hidden idle, revealed in a small feathered circle under
  the cursor. Hover is the ONLY way in — no open/close button exists on any
  device (owner call 2026-07: an explicit control kills the magic; touch gets
  no interior view). Prove: hidden -> hover reveal at the cursor, layers
  coincide (0-delta boxes), and no toggle anywhere.
*/

test('detail stage photo: cutaway hidden idle, revealed under cursor, no toggle', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 900, 'desktop hover flow');
  await page.goto(u('/projeler/ali'));
  // Ali renders the horizontal stage; the lens lives on its fixed left photo.
  const xr = page.locator('[data-testid="pd-photo"] .xrv');
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

  // no explicit control — hover is the only way in
  await expect(xr.locator('.xrv-toggle')).toHaveCount(0);
});

test('classic hero (El Ele) keeps the lens: hidden idle, hover reveals', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 900, 'desktop hover flow');
  await page.goto(u('/projeler/el-ele-apartmani'));
  const xr = page.locator('.pd-hero-media .xrv');
  const top = xr.locator('.xrv-top');
  await xr.scrollIntoViewIfNeeded();
  await expect(top).toHaveCSS('opacity', '0');
  const box = (await xr.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  await expect(top).toHaveCSS('opacity', '1');
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

test('no interior toggle exists on any locale', async ({ page }) => {
  for (const path of ['/projeler/ali', '/en/projeler/ali']) {
    await page.goto(u(path));
    await expect(page.locator('.xrv-toggle'), `toggle on ${path}`).toHaveCount(0);
  }
});

test('touch: lens stays off and never blocks scrolling', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'touch behavior (mobile project)');
  await page.goto(u('/projeler/ali'));
  const xr = page.locator('[data-testid="pd-photo"] .xrv');
  const top = xr.locator('.xrv-top');
  await xr.scrollIntoViewIfNeeded();

  // The image must not claim touch gestures — page scroll stays free.
  const touchAction = await xr.evaluate((el) => getComputedStyle(el).touchAction);
  expect(touchAction).toBe('auto');

  // A tap on the image itself reveals nothing (no lens, no control on touch).
  const box = (await xr.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.3);
  await expect(top).toHaveCSS('opacity', '0');
  await expect(xr.locator('.xrv-toggle')).toHaveCount(0);
});
