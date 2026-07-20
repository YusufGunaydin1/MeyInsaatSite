import { expect, test, type Page } from '@playwright/test';
import { u } from './util';

const ROUTE = 'showcases/satilik-mobile-kompakt/';
const LIVE_ROUTE = 'satilik-daireler/';

type Rect = { x: number; y: number; width: number; height: number };

async function rects(page: Page, selectors: Record<string, string>) {
  return page.evaluate((entries) => Object.fromEntries(
    Object.entries(entries).map(([key, selector]) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return [key, box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null];
    })
  ), selectors) as Promise<Record<string, Rect | null>>;
}

async function openReady(page: Page, route: string) {
  await page.goto(u(route), { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('kl-card').first()).toBeVisible();
  const saleListingIsland = page.locator('astro-island[component-url*="SaleListing"]');
  await expect.poll(() => saleListingIsland.evaluate((element) => element.hasAttribute('ssr'))).toBe(false);
}

test('showcases hub labels the adopted mobile design as live', async ({ page }) => {
  await page.goto(u('showcases/'), { waitUntil: 'domcontentloaded' });
  const live = page.locator('.sc-card').filter({ hasText: 'Satılık: kompakt mobil hero + filtre' });
  await expect(live).toHaveCount(1);
  await expect(live).toContainText('● CANLIDA');
  await expect(live).toContainText('canlı mobile <= 640 px · desktop unchanged');
  await expect(live.locator('a.sc-open')).toHaveAttribute('href', /showcases\/satilik-mobile-kompakt$/);
});

test('showcase desktop geometry remains identical to the live Satılık page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-360', 'desktop-parity contract');

  const selectors = {
    hero: '.ks-hero',
    heroInner: '.ks-hero-in',
    title: '.ks-hero-title',
    help: '.ks-hero-help',
    listing: '.ks-listing',
    tabs: '.kl-tabs-row',
    filters: '.kl-filters',
    results: '.kl-results-row',
    firstCard: '[data-testid="kl-card"]',
  };

  await openReady(page, LIVE_ROUTE);
  const live = await rects(page, selectors);

  await openReady(page, ROUTE);
  const showcase = await rects(page, selectors);
  await expect(page.getByTestId('ksm-mobile-hero')).toBeHidden();
  await expect(page.getByTestId('klm-controls')).toBeHidden();

  for (const key of Object.keys(selectors)) {
    expect(showcase[key], `${key} exists in the showcase`).not.toBeNull();
    expect(live[key], `${key} exists on the live page`).not.toBeNull();
    for (const metric of ['x', 'y', 'width', 'height'] as const) {
      expect(
        Math.abs((showcase[key]?.[metric] ?? 0) - (live[key]?.[metric] ?? 0)),
        `${key}.${metric} desktop drift`
      ).toBeLessThanOrEqual(0.5);
    }
  }
});

test('live mobile page uses the compact hero and matches its showcase reference', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'narrow-mobile contract');

  await openReady(page, LIVE_ROUTE);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.getByTestId('ksm-mobile-hero')).toBeVisible();
  await expect(page.locator('.ks-hero-left')).toBeHidden();
  await expect(page.locator('.ks-hero-help')).toBeHidden();
  await expect(page.getByTestId('klm-controls')).toBeVisible();
  await expect(page.locator('.kl-tabs-row')).toBeHidden();
  await expect(page.getByTestId('kl-filters')).toBeHidden();
  await expect(page.locator('.kl-results-row')).toBeHidden();

  await expect(page.getByTestId('ksm-call')).toHaveAttribute('href', 'tel:+905326256812');
  await expect(page.getByTestId('ksm-whatsapp')).toHaveAttribute('href', 'https://wa.me/905326256812');
  await expect(page.getByTestId('klm-count')).toContainText('5 sonuç');
  await expect(page.locator('[data-unit="d12"]')).toContainText('13.750.000 TL');
  await expect(page.locator('[data-unit="d11"]')).toContainText('YAKIN ZAMANDA SATILDI');
  await expect(page.locator('[data-unit="d11"]')).not.toContainText('14.900.000');

  const liveGeometry = await rects(page, {
    hero: '[data-testid="ksm-hero"]',
    controls: '[data-testid="klm-controls"]',
    firstCard: '[data-testid="kl-card"]',
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  expect(overflow, 'no horizontal overflow').toBeLessThanOrEqual(0);
  expect(liveGeometry.hero?.height, 'mobile-only hero height').toBeLessThanOrEqual(160);
  expect(liveGeometry.controls?.height, 'closed mobile controls height').toBeLessThanOrEqual(108);
  expect(liveGeometry.firstCard?.y, 'inventory begins high in the first viewport').toBeLessThanOrEqual(370);

  await openReady(page, ROUTE);
  const showcaseGeometry = await rects(page, {
    hero: '[data-testid="ksm-hero"]',
    controls: '[data-testid="klm-controls"]',
    firstCard: '[data-testid="kl-card"]',
  });
  for (const key of Object.keys(liveGeometry)) {
    for (const metric of ['x', 'y', 'width', 'height'] as const) {
      expect(
        Math.abs((showcaseGeometry[key]?.[metric] ?? 0) - (liveGeometry[key]?.[metric] ?? 0)),
        `${key}.${metric} mobile showcase drift`
      ).toBeLessThanOrEqual(0.5);
    }
  }

  for (const testId of ['ksm-call', 'ksm-whatsapp', 'klm-filter-toggle']) {
    const box = await page.getByTestId(testId).boundingBox();
    expect(box?.height, `${testId} touch height`).toBeGreaterThanOrEqual(44);
  }
  for (const tab of await page.locator('.klm-tab').all()) {
    expect((await tab.boundingBox())?.height, 'category touch height').toBeGreaterThanOrEqual(44);
  }
});

test('mobile filters disclose on demand and update the real inventory', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'narrow-mobile interaction');
  await openReady(page, LIVE_ROUTE);

  await expect(page.getByTestId('klm-filter-panel')).toHaveCount(0);
  await page.getByTestId('klm-tab-ilan').click();
  await expect(page.getByTestId('klm-count')).toContainText('2 sonuç');
  await page.getByTestId('klm-filter-toggle').click();
  await expect(page.getByTestId('klm-filter-panel')).toBeVisible();
  await page.getByTestId('klm-f-status').selectOption('available');
  await expect(page.getByTestId('klm-count')).toContainText('1 sonuç');
  await page.getByTestId('klm-apply').click();
  await expect(page.getByTestId('klm-filter-panel')).toHaveCount(0);
  await expect(page.locator('[data-unit="d12"]')).toBeVisible();
  await expect(page.locator('[data-unit="d11"]')).toHaveCount(0);

  await page.getByTestId('klm-filter-toggle').click();
  await page.getByTestId('klm-clear').click();
  await page.getByTestId('klm-apply').click();
  await expect(page.getByTestId('klm-count')).toContainText('5 sonuç');
  await page.getByTestId('klm-tab-proje').click();
  await expect(page.getByTestId('klm-count')).toContainText('3 sonuç');
  await expect(page.locator('[data-kind="proje"]')).toHaveCount(3);
});
