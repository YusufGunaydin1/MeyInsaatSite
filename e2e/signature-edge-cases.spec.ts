import { test, expect, type Page } from '@playwright/test';
import { u } from './util';

/*
  Scroll-to-build off the happy path: failed or slow frame loads, Safari's missing
  canvas filter, landscape phones, no JavaScript. Each asserts what the visitor
  SEES. The happy-path scrub lives in signature.spec.ts.
*/

const FRAME = /\/frame-\d+[^/]*\.webp$/;

async function scrollPin(page: Page, p: number) {
  await page.evaluate((p) => {
    const w = document.querySelector('[data-scrub-wrap]')!;
    const r = w.getBoundingClientRect();
    window.scrollTo(0, r.top + window.scrollY + (r.height - window.innerHeight) * p);
  }, p);
  await page.waitForTimeout(200);
}

async function openSection(page: Page) {
  await page.goto(u('/'));
  const section = page.locator('[data-scrub]');
  await section.scrollIntoViewIfNeeded();
  return section;
}

/* Sum of sampled alpha: 0 means nothing was ever painted */
const paintedAlpha = (page: Page, sel: string) =>
  page.locator(sel).evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let alpha = 0;
    for (let i = 3; i < d.length; i += 4 * 97) alpha += d[i];
    return alpha;
  });

test.describe('scroll-to-build under failure and slow loads', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'network behaviour, one viewport is enough');
  });

  test('a dropped frame is skipped; the scrub still runs to the roof', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/\/frame-09[^/]*\.webp$/, (r) =>
      r.request().resourceType() === 'fetch' ? r.abort() : r.continue()
    );
    const section = await openSection(page);
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await expect(page.locator('[data-loader]')).toBeHidden();

    await scrollPin(page, 1);
    expect(await section.evaluate((el: any) => el.__scrub.getFrame())).toBe(17);
    await expect(page.locator('[data-readout]')).toContainText('6');
    expect(errors).toEqual([]);
  });

  test('when no frame loads, the section falls back to the static poster', async ({ page }) => {
    await page.route(FRAME, (r) => (r.request().resourceType() === 'fetch' ? r.abort() : r.continue()));
    const section = await openSection(page);
    await expect(section).toHaveAttribute('data-static', 'true', { timeout: 20_000 });
    await expect(page.locator('[data-loader]')).toBeHidden();
    const poster = page.locator('[data-poster]');
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    const wrapH = await page.locator('[data-scrub-wrap]').evaluate((el) => el.getBoundingClientRect().height);
    expect(wrapH, 'no 340vh pin over a frozen image').toBeLessThan(page.viewportSize()!.height * 2);
  });

  test('while frames load, no level readout contradicts the finished-building poster', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route(FRAME, async (r) => {
      if (r.request().resourceType() === 'fetch') await gate;
      await r.continue();
    });
    const section = await openSection(page);
    await scrollPin(page, 0.3);
    await expect(page.locator('[data-loader]')).toBeVisible();
    await expect(page.locator('[data-poster]')).toBeVisible();
    await expect(page.locator('[data-level]')).toBeHidden();

    release();
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await expect(page.locator('[data-level]')).toBeVisible();
  });
});

test.describe('scroll-to-build backdrop', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'engine capability, not viewport');
  });

  test('with canvas ctx.filter the blurred backdrop paints', async ({ page }) => {
    const section = await openSection(page);
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await scrollPin(page, 0.5);
    expect(await paintedAlpha(page, '[data-bgfx]')).toBeGreaterThan(0);
  });

  test('without ctx.filter (Safari) the backdrop stays empty, never a sharp photo', async ({ page }) => {
    await page.addInitScript(() => {
      delete (CanvasRenderingContext2D.prototype as any).filter;
    });
    const section = await openSection(page);
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await scrollPin(page, 0.5);
    expect(await paintedAlpha(page, '[data-bgfx]')).toBe(0);
    expect(await paintedAlpha(page, '[data-canvas]'), 'the building itself still paints').toBeGreaterThan(0);
  });
});

test.describe('scroll-to-build on a landscape phone', () => {
  test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });

  test('tiny canvas: readout hidden, the stage line carries floor + level', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'viewport is set here');
    const section = await openSection(page);
    await expect(section).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
    await scrollPin(page, 0.5);
    await expect(page.locator('[data-readout]')).toBeHidden();
    await expect(page.locator('[data-level]')).toBeVisible();
    await expect(page.locator('[data-mobile-stage]')).toContainText(/[+±−]\d+\.\d{2} M/);
  });
});

test.describe('scroll-to-build without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('static poster + all four stages, no pin, no stuck loader', async ({ page }) => {
    const section = await openSection(page);
    const wrap = (await page.locator('[data-scrub-wrap]').boundingBox())!;
    expect(wrap.height, 'no 340vh pin').toBeLessThan(page.viewportSize()!.height * 2);
    await expect(page.locator('[data-loader]')).toBeHidden();
    await expect(section.locator('.scrub-hud')).toBeHidden();
    await expect(page.locator('[data-level]')).toBeHidden();
    await expect(page.locator('[data-poster]')).toBeVisible();
    for (let i = 0; i < 4; i++) {
      const item = page.locator(`[data-stage-item="${i}"]`);
      await item.scrollIntoViewIfNeeded();
      await expect(item).toBeInViewport();
    }
  });
});
