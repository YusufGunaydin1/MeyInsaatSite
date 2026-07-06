import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  The scroll-to-build scrub must actually scrub: frame index measured at multiple
  scroll positions must rise monotonically 1 -> 26 (prove the behavior, not the DOM).
  Under prefers-reduced-motion the section degrades to a static poster + stage list.
*/

test.describe('scroll-to-build signature', () => {
  test.skip(({ contextOptions }) => contextOptions?.reducedMotion === 'reduce');

  test('frame index tracks scroll monotonically to the final frame', async ({ page }) => {
    await page.goto(u('/'));
    const section = page.locator('[data-scrub]');
    await section.scrollIntoViewIfNeeded();

    // Wait for preload (loader disappears, data-ready set)
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });

    // The canvas must be VISIBLE at a real size — the backing store drawing is not
    // enough (a collapsed 0px column once shipped while frames still "rendered").
    const canvasBox = await page.locator('[data-canvas]').boundingBox();
    expect(canvasBox!.width).toBeGreaterThan(250);
    expect(canvasBox!.height).toBeGreaterThan(400);

    const wrapBox = await page.locator('[data-scrub-wrap]').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    });
    const vh = await page.evaluate(() => window.innerHeight);
    const span = wrapBox.height - vh;

    const samples: number[] = [];
    for (const p of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      await page.evaluate(
        ({ y }) => window.scrollTo(0, y),
        { y: wrapBox.top + span * p }
      );
      await page.waitForTimeout(120); // let rAF render
      const frame = await section.evaluate((el: any) => el.__scrub?.getFrame());
      samples.push(frame);
    }

    expect(samples[0]).toBe(1);
    expect(samples[samples.length - 1]).toBe(26);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i], `frame at sample ${i} >= previous`).toBeGreaterThanOrEqual(samples[i - 1]);
    }
    // It must actually move through the sequence, not jump 1->26.
    expect(new Set(samples).size).toBeGreaterThanOrEqual(4);
  });

  test('canvas paints real pixels and readout updates', async ({ page }) => {
    await page.goto(u('/'));
    const section = page.locator('[data-scrub]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });

    const first = await page.locator('[data-readout]').textContent();

    // Scroll to the end of the pin
    await page.evaluate(() => {
      const wrap = document.querySelector('[data-scrub-wrap]')!;
      const r = wrap.getBoundingClientRect();
      window.scrollTo(0, r.top + window.scrollY + r.height - window.innerHeight);
    });
    await page.waitForTimeout(200);

    const last = await page.locator('[data-readout]').textContent();
    expect(last).not.toBe(first);
    expect(last).toMatch(/6/); // KAT 6 / FLOOR 6 at top-out

    // Canvas is not blank: sampled pixels must vary (a real photo was drawn).
    const variance = await page.locator('[data-canvas]').evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!;
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let min = 255, max = 0;
      for (let i = 0; i < d.length; i += 4001 * 4) {
        const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      return max - min;
    });
    expect(variance).toBeGreaterThan(30);
  });

  test('stage list activates as the build rises', async ({ page }) => {
    await page.goto(u('/'));
    const section = page.locator('[data-scrub]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });

    await page.evaluate(() => {
      const wrap = document.querySelector('[data-scrub-wrap]')!;
      const r = wrap.getBoundingClientRect();
      window.scrollTo(0, r.top + window.scrollY + (r.height - window.innerHeight));
    });
    await page.waitForTimeout(200);
    await expect(page.locator('[data-stage-item="3"]')).toHaveAttribute('aria-current', 'step');
  });
});

test.describe('reduced motion fallback', () => {
  test.skip(({ contextOptions }) => contextOptions?.reducedMotion !== 'reduce');

  test('static poster + full stage list, no pin', async ({ page }) => {
    await page.goto(u('/'));
    const section = page.locator('[data-scrub]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveAttribute('data-static', 'true');

    // Poster (final frame) is the visible content and actually decodes.
    const poster = page.locator('[data-poster]');
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

    // All four stages readable as plain text.
    for (let i = 0; i < 4; i++) {
      await expect(page.locator(`[data-stage-item="${i}"]`)).toBeVisible();
    }

    // No 300vh pin in static mode.
    const wrapH = await page.locator('[data-scrub-wrap]').evaluate((el) => el.getBoundingClientRect().height);
    const vh = await page.evaluate(() => window.innerHeight);
    expect(wrapH).toBeLessThan(vh * 2);
  });
});
