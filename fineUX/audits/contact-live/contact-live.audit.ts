import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SHOWCASE_ROUTE = 'showcases/iletisim-lab/';
const SCREENSHOT_ROOT = resolve(
  process.cwd(),
  process.env.FINEUX_CONTACT_LIVE_SCREENSHOT_DIR ?? 'test-results/fineUX/contact-live'
);

type AuditCell = {
  name: string;
  route: string;
  width: number;
  height: number;
  prefix: string;
  dir: 'ltr' | 'rtl';
  compareShowcase?: boolean;
};

const cells: AuditCell[] = [
  { name: 'desktop-1366', route: 'iletisim/', width: 1366, height: 900, prefix: '', dir: 'ltr', compareShowcase: true },
  { name: 'tablet-1024', route: 'iletisim/', width: 1024, height: 768, prefix: '', dir: 'ltr', compareShowcase: true },
  { name: 'mobile-360', route: 'iletisim/', width: 360, height: 740, prefix: '', dir: 'ltr', compareShowcase: true },
  { name: 'mobile-ar-360', route: 'ar/iletisim/', width: 360, height: 740, prefix: '/ar', dir: 'rtl' },
];

type Metric = {
  width: number;
  height: number;
  display: string;
  gridTemplateColumns: string;
  backgroundColor: string;
};

async function settle(page: Page) {
  await expect(page.getByTestId('contact-route-board')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(80);
}

async function capture(board: Locator): Promise<Record<string, Metric>> {
  return board.evaluate((root) => {
    const selectors: Record<string, string> = {
      root: ':scope',
      head: '.cb-head',
      grid: '.cb-grid',
      direct: '.cb-direct',
      routes: '.cb-routeboard',
      office: '.cb-office',
    };
    return Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
      const element = selector === ':scope'
        ? root as HTMLElement
        : root.querySelector<HTMLElement>(selector)!;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return [key, {
        width: box.width,
        height: box.height,
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        backgroundColor: style.backgroundColor,
      }];
    }));
  });
}

async function inspect(page: Page, cell: AuditCell) {
  return page.evaluate(({ width, prefix, dir }) => {
    type Rect = { x: number; y: number; width: number; height: number; right: number; bottom: number };
    const issues: string[] = [];
    const visible = (element: Element | null): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) return false;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
    };
    const rect = (selector: string): Rect | null => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!visible(element)) return null;
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom };
    };
    const rounded = (value: number) => Math.round(value * 10) / 10;
    const html = document.documentElement;
    const board = document.querySelector<HTMLElement>('[data-testid="contact-route-board"]');

    if (!visible(board)) return { issues: ['live contact board is missing'] };
    if (html.scrollWidth > html.clientWidth + 1) issues.push(`horizontal overflow ${html.scrollWidth - html.clientWidth}px`);
    if (html.dir !== dir) issues.push(`document direction ${html.dir}, expected ${dir}`);
    if ([...document.querySelectorAll('main h1')].filter(visible).length !== 1) issues.push('expected exactly one visible h1');
    if (board.querySelector('h2')) issues.push('live board contains a competing h2');
    if (getComputedStyle(board).backgroundImage !== 'none') issues.push('rejected square-grid background returned');
    if (board.querySelector('form, button')) issues.push('dead form or button exists in the contact board');

    const text = board.textContent ?? '';
    if (/Çalışma saat|Working hours|Часы работы|ساعات العمل/i.test(text)) issues.push('working-hours copy is visible');
    if (text.includes('+90 532 625 68 12')) issues.push('sales phone leaked into general contact');
    if (text.includes('Bilgi bekleniyor')) issues.push('verified contact fact regressed to a placeholder');

    const requiredLinks = [
      'a[href="tel:+902163940551"]',
      'a[href="mailto:info@meykozmetik.com"]',
      `a[href$="${prefix}/satilik-daireler"]`,
      `a[href$="${prefix}/projeler"]`,
    ];
    for (const selector of requiredLinks) {
      if (!board.querySelector(selector)) issues.push(`missing action ${selector}`);
    }
    if (board.querySelectorAll('[data-testid="map-links"] a').length !== 3) issues.push('expected three map providers');

    for (const anchor of board.querySelectorAll<HTMLElement>('a')) {
      if (!visible(anchor)) continue;
      const box = anchor.getBoundingClientRect();
      if (box.width < 44 || box.height < 44) {
        issues.push(`small target ${rounded(box.width)}×${rounded(box.height)}: ${anchor.textContent?.trim()}`);
        break;
      }
      if (box.left < -1 || box.right > width + 1) {
        issues.push(`clipped target ${rounded(box.left)}–${rounded(box.right)}`);
        break;
      }
    }

    const headLead = rect('.cb-head > div');
    const headSummary = rect('.cb-head > p');
    const grid = rect('.cb-grid');
    const direct = rect('.cb-direct');
    const routes = rect('.cb-routeboard');
    const office = rect('.cb-office');
    if (!headLead || !headSummary || !grid || !direct || !routes || !office) {
      issues.push('contact board anatomy is incomplete');
    } else {
      const mobile = width <= 700;
      if (mobile) {
        if (headSummary.y < headLead.bottom - 1) issues.push('mobile summary overlaps the heading');
        if (routes.y < direct.bottom - 1) issues.push('mobile topic routes overlap or precede direct channels');
      } else {
        if (dir === 'ltr' && headSummary.x < headLead.right - 1) issues.push('desktop summary overlaps heading');
        if (dir === 'ltr' && routes.x < direct.right - 1) issues.push('desktop topic routes overlap direct channels');
      }
      if (office.y < grid.bottom - 1) issues.push('office band overlaps the decision grid');
    }

    for (const selector of ['.cb-primary', '.cb-route']) {
      const rows = [...board.querySelectorAll<HTMLElement>(selector)].filter(visible);
      for (let index = 1; index < rows.length; index += 1) {
        const previous = rows[index - 1].getBoundingClientRect();
        const current = rows[index].getBoundingClientRect();
        if (current.top < previous.bottom - 1) issues.push(`${selector} rows overlap at ${index}`);
      }
    }

    const shadowed = [...board.querySelectorAll<HTMLElement>('*')]
      .filter(visible)
      .filter((element) => getComputedStyle(element).boxShadow !== 'none');
    if (shadowed.length) issues.push(`${shadowed.length} unapproved shadows`);
    const fixed = [...board.querySelectorAll<HTMLElement>('*')]
      .filter(visible)
      .filter((element) => getComputedStyle(element).position === 'fixed');
    if (fixed.length) issues.push(`${fixed.length} fixed blockers`);

    if (dir === 'rtl') {
      const titleFont = getComputedStyle(board.querySelector<HTMLElement>('.cb-title')!).fontFamily;
      if (!titleFont.includes('IBM Plex Sans Arabic')) issues.push(`Arabic title font drift: ${titleFont}`);
      const routeIcon = board.querySelector<SVGElement>('.cb-route > svg');
      if (!routeIcon || getComputedStyle(routeIcon).transform === 'none') issues.push('RTL route arrow was not mirrored');
    }

    return {
      issues,
      clientWidth: html.clientWidth,
      scrollWidth: html.scrollWidth,
      boardHeight: board.getBoundingClientRect().height,
    };
  }, cell);
}

async function expectActionsUnoccluded(board: Locator) {
  const actions = board.locator('a:visible');
  const count = await actions.count();
  for (let index = 0; index < count; index += 1) {
    const action = actions.nth(index);
    await action.scrollIntoViewIfNeeded();
    const unoccluded = await action.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const stack = document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return stack.some((candidate) => candidate === element || element.contains(candidate));
    });
    expect(unoccluded, `occluded action: ${(await action.textContent())?.trim()}`).toBe(true);
  }
}

test.describe.configure({ mode: 'serial' });

for (const cell of cells) {
  test(`${cell.name}: live B hierarchy, routing, locale and occlusion`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: cell.width, height: cell.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(cell.route, { waitUntil: 'domcontentloaded' });
    await settle(page);
    const board = page.getByTestId('contact-route-board');
    const liveMetrics = await capture(board);
    await expectActionsUnoccluded(board);

    const result = await inspect(page, cell);
    expect(result.issues, `${cell.name}: ${JSON.stringify(result, null, 2)}`).toEqual([]);

    const screenshotPath = resolve(SCREENSHOT_ROOT, `${cell.name}-${cell.width}x${cell.height}.png`);
    mkdirSync(dirname(screenshotPath), { recursive: true });
    await board.screenshot({ path: screenshotPath, animations: 'disabled' });

    if (cell.compareShowcase) {
      await page.goto(SHOWCASE_ROUTE, { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => { await document.fonts.ready; });
      const showcaseMetrics = await capture(page.getByTestId('contact-variant-b'));
      for (const key of Object.keys(liveMetrics)) {
        expect(showcaseMetrics[key].width, `${cell.name} ${key} width drift`).toBeCloseTo(liveMetrics[key].width, 1);
        expect(showcaseMetrics[key].height, `${cell.name} ${key} height drift`).toBeCloseTo(liveMetrics[key].height, 1);
        expect(showcaseMetrics[key].display, `${cell.name} ${key} display drift`).toBe(liveMetrics[key].display);
        expect(showcaseMetrics[key].gridTemplateColumns, `${cell.name} ${key} grid drift`).toBe(liveMetrics[key].gridTemplateColumns);
        expect(showcaseMetrics[key].backgroundColor, `${cell.name} ${key} surface drift`).toBe(liveMetrics[key].backgroundColor);
      }
    }
    await context.close();
  });
}
