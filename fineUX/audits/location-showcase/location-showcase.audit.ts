import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROUTE = 'showcases/konum-lab/';
const SCREENSHOT_ROOT = resolve(
  process.cwd(),
  process.env.FINEUX_LOCATION_SCREENSHOT_DIR ?? 'test-results/fineUX/location-showcase'
);

const cells = [
  { name: 'desktop-1366', width: 1366, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'mobile-360', width: 360, height: 740 },
] as const;

async function settle(page: Page) {
  await expect(page.getByTestId('location-variant-a')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.getByTestId('location-a-select-el-ele-apartmani')).toBeVisible();
  await page.getByTestId('location-a-select-masuk-apartmani').click();
  await expect(page.locator('.km-active-address')).toContainText('40.874297° N · 29.229697° E');
  await page.waitForTimeout(100);
}

async function expectActionsUnoccluded(variant: Locator) {
  const actions = variant.locator('a:visible, button:visible');
  const count = await actions.count();
  for (let index = 0; index < count; index += 1) {
    const action = actions.nth(index);
    await action.scrollIntoViewIfNeeded();
    const result = await action.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const stack = document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        width: box.width,
        height: box.height,
        left: box.left,
        right: box.right,
        viewport: document.documentElement.clientWidth,
        unoccluded: stack.some((candidate) => candidate === element || element.contains(candidate)),
      };
    });
    expect(result.width, `narrow action: ${(await action.textContent())?.trim()}`).toBeGreaterThanOrEqual(44);
    expect(result.height, `short action: ${(await action.textContent())?.trim()}`).toBeGreaterThanOrEqual(44);
    expect(result.left).toBeGreaterThanOrEqual(-1);
    expect(result.right).toBeLessThanOrEqual(result.viewport + 1);
    expect(result.unoccluded, `occluded action: ${(await action.textContent())?.trim()}`).toBe(true);
  }
}

async function inspect(page: Page, width: number) {
  return page.evaluate((viewportWidth) => {
    const issues: string[] = [];
    const visible = (element: Element | null): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) return false;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
    };
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!visible(element)) return null;
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };

    const html = document.documentElement;
    if (html.scrollWidth > html.clientWidth + 1) issues.push(`horizontal overflow ${html.scrollWidth - html.clientWidth}px`);
    if ([...document.querySelectorAll('main h1')].filter(visible).length !== 1) issues.push('expected one visible h1');
    if (document.querySelectorAll('[data-testid^="location-variant-"]').length !== 3) issues.push('expected three variants');

    const selectedMap = document.querySelector<HTMLIFrameElement>('[data-testid="location-a-map"] iframe');
    if (!selectedMap?.src.includes('marker=40.874297%2C29.229697')) issues.push('A map did not follow the selected exact pin');
    if (!document.querySelector('[data-testid="location-a-yandex"]')?.getAttribute('href')?.includes('29.229697%2C40.874297')) {
      issues.push('A Yandex action did not follow the selected exact pin');
    }
    if (document.querySelectorAll('.km-osm-link').length !== 2) issues.push('real maps are missing visible OSM attribution');
    if (!document.querySelector('.km-atlas-note')?.textContent?.includes('YOL AĞI DEĞİLDİR')) {
      issues.push('B does not disclose its schematic nature');
    }
    if (document.querySelector('.km-atlas-gridlines')) issues.push('rejected square-grid background returned');

    const aMap = rect('.km-map-frame');
    const aPanel = rect('.km-explorer-panel');
    const bPlot = rect('.km-atlas-plot');
    const bList = rect('.km-atlas-list');
    const cMap = rect('.km-dossier-map');
    const cCopy = rect('.km-dossier-copy');
    if (!aMap || !aPanel || !bPlot || !bList || !cMap || !cCopy) {
      issues.push('variant anatomy is incomplete');
    } else if (viewportWidth <= 900) {
      if (aPanel.y < aMap.bottom - 1) issues.push('A mobile/tablet panels overlap');
      if (bList.y < bPlot.bottom - 1) issues.push('B mobile/tablet panels overlap');
      if (cCopy.y < cMap.bottom - 1) issues.push('C mobile/tablet panels overlap');
    } else {
      if (aPanel.x < aMap.right - 1) issues.push('A desktop panels overlap');
      if (bList.x < bPlot.right - 1) issues.push('B desktop panels overlap');
      if (cCopy.x < cMap.right - 1) issues.push('C desktop panels overlap');
    }

    const plot = document.querySelector<HTMLElement>('.km-atlas-plot')?.getBoundingClientRect();
    if (plot) {
      for (const pin of document.querySelectorAll<HTMLElement>('.km-atlas-pin')) {
        const box = pin.getBoundingClientRect();
        if (box.left < plot.left - 1 || box.right > plot.right + 1 || box.top < plot.top - 1 || box.bottom > plot.bottom + 1) {
          issues.push(`atlas pin clipped: ${pin.textContent?.trim()}`);
        }
      }
    }

    for (const variant of document.querySelectorAll<HTMLElement>('[data-testid^="location-variant-"]')) {
      const box = variant.getBoundingClientRect();
      if (box.left < -1 || box.right > html.clientWidth + 1) issues.push(`variant clipped at ${box.left}–${box.right}`);
      const shadowed = [...variant.querySelectorAll<HTMLElement>('*')]
        .filter(visible)
        .filter((element) => getComputedStyle(element).boxShadow !== 'none');
      if (shadowed.length) issues.push(`${shadowed.length} unapproved shadows`);
      const fixed = [...variant.querySelectorAll<HTMLElement>('*')]
        .filter(visible)
        .filter((element) => getComputedStyle(element).position === 'fixed');
      if (fixed.length) issues.push(`${fixed.length} fixed blockers`);
    }

    return { issues, clientWidth: html.clientWidth, scrollWidth: html.scrollWidth };
  }, width);
}

test.describe.configure({ mode: 'serial' });

for (const cell of cells) {
  test(`${cell.name}: responsive composition, exact-pin state and visual integrity`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: cell.width, height: cell.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    await settle(page);

    for (const key of ['a', 'b', 'c']) {
      await expectActionsUnoccluded(page.getByTestId(`location-variant-${key}`));
    }
    const result = await inspect(page, cell.width);
    expect(result.issues, `${cell.name}: ${JSON.stringify(result, null, 2)}`).toEqual([]);

    for (const key of ['a', 'b', 'c']) {
      const variant = page.getByTestId(`location-variant-${key}`);
      await variant.scrollIntoViewIfNeeded();
      const screenshotPath = resolve(SCREENSHOT_ROOT, `${cell.name}-variant-${key}.png`);
      mkdirSync(dirname(screenshotPath), { recursive: true });
      await variant.screenshot({ path: screenshotPath, animations: 'disabled' });
    }
    await context.close();
  });
}
