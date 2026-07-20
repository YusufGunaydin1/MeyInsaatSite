import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { u } from './util';

const evidenceDir = join(process.cwd(), 'test-results', 'fineUX', 'satilik-mobile');

type Box = { x: number; y: number; width: number; height: number } | null;

async function box(page: Page, selector: string): Promise<Box> {
  return page.locator(selector).first().boundingBox();
}

async function imageMetrics(page: Page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const images = entries.filter((entry) => entry.initiatorType === 'img');
    return {
      count: images.length,
      encodedBytes: images.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      transferBytes: images.reduce((sum, entry) => sum + entry.transferSize, 0),
      names: images.map((entry) => entry.name.split('/').pop()),
    };
  });
}

async function naturalWidth(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((image: HTMLImageElement) => image.naturalWidth);
}

async function centerIsUnoccluded(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const stack = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return stack.some((candidate) => candidate === element || element.contains(candidate));
  });
}

async function settlePrimaryImage(page: Page, selector: string) {
  await expect
    .poll(() => page.locator(selector).first().evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await page.waitForTimeout(350);
}

test('fineUX capture matrix: Satılık landing composition', async ({ page }, testInfo) => {
  const cells = testInfo.project.name === 'mobile-360'
    ? [{ width: 360, height: 740, name: '360' }]
    : [
        { width: 1366, height: 768, name: '1366' },
        { width: 1024, height: 768, name: '1024' },
      ];

  mkdirSync(evidenceDir, { recursive: true });
  for (const cell of cells) {
    await page.setViewportSize({ width: cell.width, height: cell.height });
    await page.goto(u('satilik-daireler/'), { waitUntil: 'domcontentloaded' });
    await settlePrimaryImage(page, '.ks-hero-img');

    const metrics = {
      viewport: cell,
      hero: await box(page, '.ks-hero'),
      heroContent: await box(page, '.ks-hero-in'),
      help: await box(page, '.ks-hero-help'),
      listing: await box(page, '.ks-listing'),
      tabs: await box(page, '.kl-tabs-row'),
      heroNaturalWidth: await naturalWidth(page, '.ks-hero-img'),
      images: await imageMetrics(page),
    };
    console.log(`[fineUX][landing-${cell.name}] ${JSON.stringify(metrics)}`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `${cell.name}px horizontal overflow`).toBeLessThanOrEqual(0);

    if (cell.name === '360') {
      expect(metrics.hero?.height, 'mobile hero height').toBeLessThanOrEqual(340);
      expect(metrics.help?.height, 'mobile help row height').toBeLessThanOrEqual(64);
      expect(metrics.listing?.y, 'listings should begin within the first screen').toBeLessThanOrEqual(420);
      expect(metrics.tabs?.height, 'mobile controls stay compact').toBeLessThanOrEqual(106);
      expect(metrics.heroNaturalWidth, 'mobile hero source width').toBeLessThanOrEqual(480);
      expect(metrics.images.count, 'initial landing image requests').toBeLessThanOrEqual(6);
      await expect(page.getByTestId('kl-filters')).toBeHidden();
      const filterBox = await page.getByTestId('kl-filter-toggle').boundingBox();
      expect(filterBox?.height, 'filter touch target').toBeGreaterThanOrEqual(40);
      expect(await centerIsUnoccluded(page, '[data-testid="kl-filter-toggle"]'), 'filter control center').toBe(true);
    } else {
      expect(metrics.hero?.height, `${cell.name}px hero height`).toBeLessThanOrEqual(330);
      await expect(page.getByTestId('kl-filters')).toBeVisible();
    }

    await page.screenshot({ path: join(evidenceDir, `landing-${cell.name}.png`), fullPage: false });
  }
});

test('fineUX capture: mobile apartment gallery and image delivery', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'narrow-mobile evidence only');
  mkdirSync(evidenceDir, { recursive: true });
  await page.goto(u('satilik-daireler/daire-1'), { waitUntil: 'domcontentloaded' });
  await settlePrimaryImage(page, '[data-testid="kc-car-main"]');

  const metrics = {
    viewport: { width: 360, height: 740 },
    heading: await box(page, '.kcd-head'),
    gallery: await box(page, '[data-testid="kc-carousel"]'),
    stage: await box(page, '.kcar-stage'),
    specs: await box(page, '.kcg-specside'),
    mainNaturalWidth: await naturalWidth(page, '[data-testid="kc-car-main"]'),
    images: await imageMetrics(page),
  };
  console.log(`[fineUX][detail-360] ${JSON.stringify(metrics)}`);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, 'detail horizontal overflow').toBeLessThanOrEqual(0);
  expect(metrics.heading?.height, 'detail heading height').toBeLessThanOrEqual(231);
  expect(metrics.gallery?.y, 'gallery should start near the top').toBeLessThanOrEqual(390);
  expect(metrics.mainNaturalWidth, 'mobile gallery source width').toBeLessThanOrEqual(480);
  expect(metrics.images.count, 'initial gallery image requests').toBeLessThanOrEqual(11);
  const nextBox = await page.getByTestId('kc-car-next').boundingBox();
  expect(nextBox?.width, 'carousel touch target width').toBeGreaterThanOrEqual(40);
  expect(nextBox?.height, 'carousel touch target height').toBeGreaterThanOrEqual(40);
  expect(await centerIsUnoccluded(page, '[data-testid="kc-car-next"]'), 'carousel next control center').toBe(true);
  await page.screenshot({ path: join(evidenceDir, 'detail-360.png'), fullPage: false });
});
