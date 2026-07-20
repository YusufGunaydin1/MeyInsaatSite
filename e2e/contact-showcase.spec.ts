import { expect, test, type Locator, type Page } from '@playwright/test';
import { u } from './util';

const CONTACT_ROUTE = 'iletisim/';
const LAB_ROUTE = 'showcases/iletisim-lab/';
const ADDRESS = 'Orhanlı, Vakum Sk. No:26, 34956 Tuzla/İstanbul';
const MAP_QUERY = encodeURIComponent(ADDRESS.replace('/', ' '));

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(0);
}

async function expectTargets(locator: Locator, minimum = 44) {
  const boxes = await locator.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(boxes.length).toBeGreaterThan(0);
  expect(boxes.every((box) => box.width >= minimum && box.height >= minimum)).toBe(true);
}

async function boardMetrics(board: Locator) {
  return board.evaluate((root) => {
    const metric = (selector: string) => {
      const element = selector === ':scope'
        ? root as HTMLElement
        : root.querySelector<HTMLElement>(selector)!;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        x: box.x,
        y: box.y,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        backgroundColor: style.backgroundColor,
      };
    };
    return {
      root: metric(':scope'),
      head: metric('.cb-head'),
      grid: metric('.cb-grid'),
      direct: metric('.cb-direct'),
      routes: metric('.cb-routeboard'),
      office: metric('.cb-office'),
    };
  });
}

test('live contact page contains only verified general contact facts', async ({ page }) => {
  await page.goto(u(CONTACT_ROUTE), { waitUntil: 'domcontentloaded' });

  const board = page.getByTestId('contact-route-board');
  await expect(board).toBeVisible();
  await expect(board.locator('h1')).toHaveText(/Sorunuz için\s+en kısa yol\./);
  await expect(board).toHaveCSS('background-image', 'none');
  await expect(board.getByTestId('contact-live-phone')).toHaveAttribute('href', 'tel:+902163940551');
  await expect(board.getByTestId('contact-live-email')).toHaveAttribute('href', 'mailto:info@meykozmetik.com');
  await expect(board.getByTestId('contact-live-route-sale')).toHaveAttribute('href', /\/satilik-daireler$/);
  await expect(board.getByTestId('contact-live-route-projects')).toHaveAttribute('href', /\/projeler$/);
  await expect(board.getByTestId('contact-live-route-corporate')).toHaveAttribute('href', 'mailto:info@meykozmetik.com');
  await expect(board).toContainText('+90 (0216) 394 05 51');
  await expect(board).toContainText('info@meykozmetik.com');
  await expect(board).toContainText(ADDRESS);
  await expect(board).not.toContainText('+90 532 625 68 12');
  await expect(board).not.toContainText(/Çalışma saat|Working hours|Часы работы|ساعات العمل/i);
  await expect(board).not.toContainText('Bilgi bekleniyor');
  await expectTargets(board.locator('a'));
  await expectNoOverflow(page);
});

test('every localized live contact route renders B with localized decision paths', async ({ page }) => {
  const locales = [
    { route: 'iletisim/', heading: /Sorunuz için\s+en kısa yol\./, prefix: '', dir: 'ltr' },
    { route: 'en/iletisim/', heading: /The shortest route\s+to your answer\./, prefix: '/en', dir: 'ltr' },
    { route: 'ru/iletisim/', heading: /Кратчайший путь\s+к ответу\./, prefix: '/ru', dir: 'ltr' },
    { route: 'ar/iletisim/', heading: /أقصر طريق\s+إلى الإجابة\./, prefix: '/ar', dir: 'rtl' },
  ];

  for (const locale of locales) {
    await page.goto(u(locale.route), { waitUntil: 'domcontentloaded' });
    const board = page.getByTestId('contact-route-board');
    await expect(board.locator('h1'), locale.route).toHaveText(locale.heading);
    await expect(board.getByTestId('contact-live-route-sale')).toHaveAttribute('href', new RegExp(`${locale.prefix}/satilik-daireler$`));
    await expect(board.getByTestId('contact-live-route-projects')).toHaveAttribute('href', new RegExp(`${locale.prefix}/projeler$`));
    await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
    await expect(board, locale.route).not.toContainText(/Çalışma saat|Working hours|Часы работы|ساعات العمل/i);
    await expectNoOverflow(page);
  }
});

test('live B and its showcase reference share the same responsive component geometry', async ({ page }, testInfo) => {
  await page.goto(u(CONTACT_ROUTE), { waitUntil: 'domcontentloaded' });
  const liveBoard = page.getByTestId('contact-route-board');
  const live = await boardMetrics(liveBoard);

  if (testInfo.project.name === 'mobile-360') {
    expect(live.routes.y).toBeGreaterThanOrEqual(live.direct.bottom - 1);
  } else {
    expect(live.routes.x).toBeGreaterThanOrEqual(live.direct.right - 1);
  }

  await page.goto(u(LAB_ROUTE), { waitUntil: 'domcontentloaded' });
  const showcase = await boardMetrics(page.getByTestId('contact-variant-b'));
  for (const key of Object.keys(live) as Array<keyof typeof live>) {
    expect(showcase[key].width, `${key} width drift`).toBeCloseTo(live[key].width, 1);
    expect(showcase[key].height, `${key} height drift`).toBeCloseTo(live[key].height, 1);
    expect(showcase[key].display, `${key} display drift`).toBe(live[key].display);
    expect(showcase[key].gridTemplateColumns, `${key} grid drift`).toBe(live[key].gridTemplateColumns);
    expect(showcase[key].backgroundColor, `${key} surface drift`).toBe(live[key].backgroundColor);
  }
});

test('showcases registers three noindex contact design directions', async ({ page }) => {
  await page.goto(u('showcases/'), { waitUntil: 'domcontentloaded' });
  const card = page.locator('.sc-card').filter({ hasText: 'İletişim: 3 responsive tasarım yönü' });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('○ ÖNERİ');
  await expect(card.locator('a.sc-open')).toHaveAttribute('href', /showcases\/iletisim-lab$/);

  await page.goto(u(LAB_ROUTE), { waitUntil: 'domcontentloaded' });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.getByTestId('contact-variant-a')).toHaveCount(1);
  await expect(page.getByTestId('contact-variant-b')).toHaveCount(1);
  await expect(page.getByTestId('contact-variant-c')).toHaveCount(1);
  await expect(page.locator('.lab-cap').filter({ hasText: 'B · ROTA ★' })).toContainText('Seçilen aday');
  await expect(page.getByTestId('contact-variant-b')).toHaveCSS('background-image', 'none');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main')).not.toContainText('+90 532 625 68 12');
  await expect(page.locator('main')).not.toContainText(/Çalışma saat|Working hours|Часы работы|ساعات العمل/i);
});

test('all contact proposals use the real channels, address and decision routes', async ({ page }) => {
  await page.goto(u(LAB_ROUTE), { waitUntil: 'domcontentloaded' });

  for (const key of ['a', 'b', 'c']) {
    const variant = page.getByTestId(`contact-variant-${key}`);
    await expect(variant.getByTestId(`contact-${key}-phone`)).toHaveAttribute('href', 'tel:+902163940551');
    await expect(variant.getByTestId(`contact-${key}-email`)).toHaveAttribute('href', 'mailto:info@meykozmetik.com');
    await expect(variant).toContainText(ADDRESS);
    await expect(variant.locator('a[href$="/satilik-daireler"]')).toHaveCount(1);
    await expect(variant.locator('a[href$="/projeler"]')).toHaveCount(1);

    const maps = variant.getByTestId('map-links');
    await expect(maps.getByTestId('map-google')).toHaveAttribute(
      'href',
      `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`
    );
    await expect(maps.getByTestId('map-yandex')).toHaveAttribute(
      'href',
      `https://yandex.com.tr/maps/?text=${MAP_QUERY}`
    );
    await expect(maps.getByTestId('map-apple')).toHaveAttribute(
      'href',
      `https://maps.apple.com/?q=${MAP_QUERY}`
    );
  }
});

test('contact proposals preserve responsive order, targets and image delivery', async ({ page }, testInfo) => {
  await page.goto(u(LAB_ROUTE), { waitUntil: 'domcontentloaded' });
  await expectNoOverflow(page);

  const a = page.getByTestId('contact-variant-a');
  const b = page.getByTestId('contact-variant-b');
  const c = page.getByTestId('contact-variant-c');
  for (const variant of [a, b, c]) {
    await variant.scrollIntoViewIfNeeded();
    await expectTargets(variant.locator('a'));
  }

  const layout = await page.evaluate(() => {
    const rect = (selector: string) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box ? { x: box.x, y: box.y, right: box.right, bottom: box.bottom } : null;
    };
    return {
      aCopy: rect('.ca-copy'),
      aVisual: rect('.ca-visual'),
      bDirect: rect('.cb-direct'),
      bRoutes: rect('.cb-routeboard'),
      cChannels: rect('.ccx-channels'),
      cRoutes: rect('.ccx-routes'),
    };
  });

  if (testInfo.project.name === 'mobile-360') {
    expect(layout.aVisual!.y).toBeGreaterThanOrEqual(layout.aCopy!.bottom - 1);
    expect(layout.bRoutes!.y).toBeGreaterThanOrEqual(layout.bDirect!.bottom - 1);
    expect(layout.cRoutes!.y).toBeGreaterThanOrEqual(layout.cChannels!.bottom - 1);

    await a.scrollIntoViewIfNeeded();
    const facadeWidth = await a.locator('.ca-image').evaluate((image: HTMLImageElement) => image.naturalWidth);
    expect(facadeWidth, 'mobile façade source width').toBeLessThanOrEqual(480);
  } else {
    expect(layout.aVisual!.x).toBeGreaterThanOrEqual(layout.aCopy!.right - 1);
    expect(layout.bRoutes!.x).toBeGreaterThanOrEqual(layout.bDirect!.right - 1);
    expect(layout.cRoutes!.x).toBeGreaterThanOrEqual(layout.cChannels!.right - 1);
  }
});
