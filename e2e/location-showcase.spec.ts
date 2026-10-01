import { expect, test, type Locator, type Page } from '@playwright/test';
import { u } from './util';

const LOCATIONS = [
  { slug: 'el-ele-apartmani', name: 'El Ele Apartmanı', lat: '40.875102', lng: '29.227424' },
  { slug: 'masuk-apartmani', name: 'Maşuk Apartmanı', lat: '40.874297', lng: '29.229697' },
  { slug: 'camoglu-apartmani', name: 'Çamoğlu Apartmanı', lat: '40.882302', lng: '29.226140' },
] as const;

const googlePin = (location: typeof LOCATIONS[number]) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.lat},${location.lng}`)}`;

const yandexPin = (location: typeof LOCATIONS[number]) =>
  `https://yandex.com.tr/maps/?pt=${encodeURIComponent(`${location.lng},${location.lat}`)}&z=18&l=map`;

const applePin = (location: typeof LOCATIONS[number]) =>
  `https://maps.apple.com/?ll=${encodeURIComponent(`${location.lat},${location.lng}`)}&q=${encodeURIComponent(location.name)}`;

async function expectTargets(locator: Locator) {
  const targets = locator.locator('a:visible, button:visible');
  const boxes = await targets.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    })
  );
  expect(boxes.length).toBeGreaterThan(0);
  expect(boxes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);
}

test('location lab presents three noindex visual directions with exact location facts', async ({ page }) => {
  await page.goto(u('/showcases/konum-lab'), { waitUntil: 'domcontentloaded' });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.getByTestId('location-variant-a')).toHaveCount(1);
  await expect(page.getByTestId('location-variant-b')).toHaveCount(1);
  await expect(page.getByTestId('location-variant-c')).toHaveCount(1);
  await expect(page.locator('.lab-item')).toHaveCount(3);

  for (const location of LOCATIONS) {
    const card = page.getByTestId(`location-b-card-${location.slug}`);
    await expect(card).toContainText(location.name);
    await expect(card).toContainText(`${location.lat}° N · ${location.lng}° E`);
    await expect(card.getByTestId(`location-b-${location.slug}-google`)).toHaveAttribute('href', googlePin(location));
    await expect(card.getByTestId(`location-b-${location.slug}-yandex`)).toHaveAttribute('href', yandexPin(location));
    await expect(card.getByTestId(`location-b-${location.slug}-apple`)).toHaveAttribute('href', applePin(location));
  }

  await expect(page.getByTestId('location-c-google')).toHaveAttribute(
    'href',
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('40.875102,29.227424')}`
  );
  await expect(page.getByTestId('location-c-yandex')).toHaveAttribute('href', yandexPin(LOCATIONS[0]));
  await expect(page.getByTestId('location-c-apple')).toHaveAttribute('href', applePin(LOCATIONS[0]));
});

test('interactive map selector updates map, address, directions and all provider pins together', async ({ page }) => {
  await page.goto(u('/showcases/konum-lab'), { waitUntil: 'domcontentloaded' });
  const variant = page.getByTestId('location-variant-a');

  for (const location of LOCATIONS) {
    await variant.getByTestId(`location-a-select-${location.slug}`).click();
    await expect(variant.locator('.km-active-address')).toContainText(location.name);
    await expect(variant.locator('.km-active-address')).toContainText(`${location.lat}° N · ${location.lng}° E`);
    await expect(variant.getByTestId('location-a-map').locator('iframe')).toHaveAttribute(
      'src',
      new RegExp(`marker=${location.lat}%2C${location.lng}`)
    );
    await expect(variant.getByTestId('location-a-google')).toHaveAttribute('href', googlePin(location));
    await expect(variant.getByTestId('location-a-yandex')).toHaveAttribute('href', yandexPin(location));
    await expect(variant.getByTestId('location-a-apple')).toHaveAttribute('href', applePin(location));
    await expect(variant.getByTestId('location-a-google-directions')).toHaveAttribute(
      'href',
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${location.lat},${location.lng}`)}`
    );
  }
});

test('location alternatives retain responsive order, touch targets and viewport containment', async ({ page }, testInfo) => {
  await page.goto(u('/showcases/konum-lab'), { waitUntil: 'domcontentloaded' });
  await expectNoHorizontalOverflow(page);

  for (const key of ['a', 'b', 'c']) {
    const variant = page.getByTestId(`location-variant-${key}`);
    await variant.scrollIntoViewIfNeeded();
    await expectTargets(variant);
  }

  const layout = await page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
    };
    return {
      aMap: box('.km-map-frame'),
      aPanel: box('.km-explorer-panel'),
      bPlot: box('.km-atlas-plot'),
      bList: box('.km-atlas-list'),
      cMap: box('.km-dossier-map'),
      cCopy: box('.km-dossier-copy'),
    };
  });

  if (testInfo.project.name === 'mobile-360') {
    expect(layout.aPanel.y).toBeGreaterThanOrEqual(layout.aMap.bottom - 1);
    expect(layout.bList.y).toBeGreaterThanOrEqual(layout.bPlot.bottom - 1);
    expect(layout.cCopy.y).toBeGreaterThanOrEqual(layout.cMap.bottom - 1);
  } else {
    expect(layout.aPanel.x).toBeGreaterThanOrEqual(layout.aMap.right - 1);
    expect(layout.bList.x).toBeGreaterThanOrEqual(layout.bPlot.right - 1);
    expect(layout.cCopy.x).toBeGreaterThanOrEqual(layout.cMap.right - 1);
  }
});

test('retired showcase routes are no longer generated', async ({ request }) => {
  for (const route of [
    'showcases/iletisim-lab/',
    'showcases/satilik-mobile-kompakt/',
    'showcases/proje-detay-mobil-lab/',
    'showcases/proje-detay-adimli-lab/',
    'showcases/satilik-daireler/',
  ]) {
    const response = await request.get(u(route));
    expect(response.status(), route).toBe(404);
  }
});
