import { expect, test, type Locator, type Page } from '@playwright/test';
import { u } from './util';

const CONTACT_ROUTE = 'iletisim/';
const ADDRESS = 'Orhanlı, Vakum Sk. No:26, 34956 Tuzla/İstanbul';
const MAP_QUERY = encodeURIComponent(ADDRESS.replace('/', ' '));

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(0);
}

async function expectTargets(locator: Locator, minimum = 44) {
  const boxes = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  );
  expect(boxes.length).toBeGreaterThan(0);
  expect(boxes.every((box) => box.width >= minimum && box.height >= minimum)).toBe(true);
}

test('live contact page contains only verified general contact facts', async ({ page }) => {
  await page.goto(u(CONTACT_ROUTE), { waitUntil: 'domcontentloaded' });

  const board = page.getByTestId('contact-route-board');
  await expect(board).toBeVisible();
  await expect(board.locator('h1')).toHaveText(/Sorunuz için\s+en kısa yol\./);
  await expect(board).toHaveCSS('background-image', 'none');
  await expect(board.getByTestId('contact-live-phone')).toHaveAttribute('href', 'tel:+902163940551');
  await expect(board.getByTestId('contact-live-email')).toHaveAttribute('href', 'mailto:info@meykozmetik.com');
  await expect(board.getByTestId('contact-live-route-sale')).toHaveAttribute('href', /\/satilik-daireler\/$/);
  await expect(board.getByTestId('contact-live-route-projects')).toHaveAttribute('href', /\/projeler\/$/);
  await expect(board.getByTestId('contact-live-route-corporate')).toHaveAttribute('href', 'mailto:info@meykozmetik.com');
  await expect(board).toContainText('+90 (0216) 394 05 51');
  await expect(board).toContainText('info@meykozmetik.com');
  await expect(board).toContainText(ADDRESS);
  await expect(board).not.toContainText('+90 532 625 68 12');
  await expect(board).not.toContainText(/Çalışma saat|Working hours|Часы работы|ساعات العمل/i);
  await expect(board).not.toContainText('Bilgi bekleniyor');

  const maps = board.getByTestId('map-links');
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
  await expectTargets(board.locator('a'));
  await expectNoOverflow(page);
});

test('every localized live contact route renders the approved responsive design', async ({ page }) => {
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
    await expect(board.getByTestId('contact-live-route-sale')).toHaveAttribute(
      'href',
      new RegExp(`${locale.prefix}/satilik-daireler/$`)
    );
    await expect(board.getByTestId('contact-live-route-projects')).toHaveAttribute(
      'href',
      new RegExp(`${locale.prefix}/projeler/$`)
    );
    await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
    await expect(board, locale.route).not.toContainText(/Çalışma saat|Working hours|Часы работы|ساعات العمل/i);
    await expectNoOverflow(page);
  }
});

test('approved contact design keeps its desktop split and mobile stack', async ({ page }, testInfo) => {
  await page.goto(u(CONTACT_ROUTE), { waitUntil: 'domcontentloaded' });
  const board = page.getByTestId('contact-route-board');
  const layout = await board.evaluate((root) => {
    const rect = (selector: string) => {
      const box = root.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      return { x: box.x, y: box.y, right: box.right, bottom: box.bottom };
    };
    return {
      direct: rect('.cb-direct'),
      routes: rect('.cb-routeboard'),
    };
  });

  if (testInfo.project.name === 'mobile-360') {
    expect(layout.routes.y).toBeGreaterThanOrEqual(layout.direct.bottom - 1);
  } else {
    expect(layout.routes.x).toBeGreaterThanOrEqual(layout.direct.right - 1);
  }
  await expectTargets(board.locator('a'));
  await expectNoOverflow(page);
});
