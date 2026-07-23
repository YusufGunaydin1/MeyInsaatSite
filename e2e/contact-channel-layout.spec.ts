import { expect, test } from '@playwright/test';
import { u } from './util';

test.use({ viewport: { width: 360, height: 740 } });

test('mobile contact values keep a readable text column', async ({ page }) => {
  await page.goto(u('iletisim/'), { waitUntil: 'domcontentloaded' });

  const values = page.getByTestId('contact-route-board').locator('.cb-primary-copy strong');
  const metrics = await values.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
      return {
        text: element.textContent?.trim(),
        width: box.width,
        height: box.height,
        lineHeight,
      };
    })
  );

  expect(metrics).toHaveLength(2);
  for (const metric of metrics) {
    expect(metric.width, `${metric.text} text column`).toBeGreaterThanOrEqual(190);
    expect(metric.height, `${metric.text} wrapped into fragments`).toBeLessThanOrEqual(
      metric.lineHeight * 1.5
    );
  }
});

test('contact composition stays open and uses DOM drafting details', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(u('iletisim/'), { waitUntil: 'domcontentloaded' });

  const board = page.getByTestId('contact-route-board');
  const draftingField = board.getByTestId('contact-drafting-field');
  await expect(draftingField).toBeVisible();

  const composition = await board.evaluate((root) => {
    const style = (selector: string) =>
      getComputedStyle(root.querySelector<HTMLElement>(selector)!);
    const head = style('.cb-head');
    const grid = style('.cb-grid');
    const direct = style('.cb-direct');
    const channelBackgrounds = [...root.querySelectorAll<HTMLElement>('.cb-primary')]
      .map((element) => getComputedStyle(element).backgroundColor);

    return {
      headBackground: head.backgroundColor,
      headInlineBorders: [head.borderInlineStartWidth, head.borderInlineEndWidth],
      gridBackground: grid.backgroundColor,
      gridInlineBorders: [grid.borderInlineStartWidth, grid.borderInlineEndWidth],
      directBackground: direct.backgroundColor,
      channelBackgrounds,
      draftingPrimitives: root.querySelectorAll(
        '.cb-dimension, .cb-drawing-line, .cb-drawing-node, .cb-setout'
      ).length,
      draftingGrid: style('.cb-drawing-grid').backgroundImage,
    };
  });

  const white = 'rgb(255, 255, 255)';
  expect(composition.headBackground).not.toBe(white);
  expect(composition.gridBackground).not.toBe(white);
  expect(composition.directBackground).not.toBe(white);
  expect(composition.channelBackgrounds).not.toContain(white);
  expect(composition.headInlineBorders).toEqual(['0px', '0px']);
  expect(composition.gridInlineBorders).toEqual(['0px', '0px']);
  expect(composition.draftingPrimitives).toBeGreaterThanOrEqual(10);
  expect(composition.draftingGrid).not.toBe('none');
});

for (const route of ['iletisim/', 'ar/iletisim/']) {
  test(`${route} renders the construction artwork without clipping`, async ({ page }) => {
    await page.goto(u(route), { waitUntil: 'domcontentloaded' });

    const artwork = page.getByTestId('contact-hero-illustration');
    const image = artwork.locator('img');
    await expect(artwork).toBeVisible();
    await expect(image).toBeVisible();

    const metrics = await image.evaluate((element) => {
      const image = element as HTMLImageElement;
      const imageBox = image.getBoundingClientRect();
      const artworkBox = image.parentElement!.getBoundingClientRect();
      return {
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        currentSrc: image.currentSrc,
        contained:
          imageBox.left >= artworkBox.left - 1 &&
          imageBox.right <= artworkBox.right + 1 &&
          imageBox.top >= artworkBox.top - 1 &&
          imageBox.bottom <= artworkBox.bottom + 1,
      };
    });

    expect(metrics.complete).toBe(true);
    expect(metrics.naturalWidth).toBeGreaterThan(0);
    expect(metrics.naturalHeight).toBeGreaterThan(0);
    expect(metrics.currentSrc).toMatch(/\/_astro\/construction-skyline\.[\w-]+\.webp$/);
    expect(metrics.contained).toBe(true);
  });
}
