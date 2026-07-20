import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROUTE = 'showcases/iletisim-lab/';
const SCREENSHOT_ROOT = resolve(
  process.cwd(),
  process.env.FINEUX_CONTACT_SCREENSHOT_DIR ?? 'test-results/fineUX/contact-showcase'
);

type AuditCell = { name: string; width: number; height: number };

const cells: AuditCell[] = [
  { name: 'desktop-1366', width: 1366, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'mobile-360', width: 360, height: 740 },
];

const variants = [
  { key: 'a', selector: '[data-testid="contact-variant-a"]' },
  { key: 'b', selector: '[data-testid="contact-variant-b"]' },
  { key: 'c', selector: '[data-testid="contact-variant-c"]' },
] as const;

async function settleVariant(scope: Locator) {
  await scope.scrollIntoViewIfNeeded();
  for (const image of await scope.locator('img').all()) {
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => (
      element.complete ? element.naturalWidth : 0
    ))).toBeGreaterThan(0);
  }
}

async function inspectPage(page: Page, cell: AuditCell) {
  return page.evaluate(({ width }) => {
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

    if (html.scrollWidth > html.clientWidth + 1) issues.push(`horizontal overflow ${html.scrollWidth - html.clientWidth}px`);
    if ([...document.querySelectorAll('main h1')].filter(visible).length !== 1) issues.push('page must have one visible h1');
    if ([...document.querySelectorAll('main h2')].filter(visible).length !== 3) issues.push('page must have one h2 per direction');
    if (document.querySelector('main form')) issues.push('a non-functional form was introduced');

    const selectedBackground = getComputedStyle(document.querySelector<HTMLElement>('[data-testid="contact-variant-b"]')!).backgroundImage;
    if (selectedBackground !== 'none') issues.push(`selected B direction regained a decorative grid: ${selectedBackground}`);

    const mainText = document.querySelector('main')?.textContent ?? '';
    if (/Çalışma saat|Working hours|Часы работы|ساعات العمل/i.test(mainText)) issues.push('working-hours copy remains visible');
    if (mainText.includes('+90 532 625 68 12')) issues.push('sales phone leaked into general contact designs');

    for (const key of ['a', 'b', 'c']) {
      const scope = document.querySelector<HTMLElement>(`[data-testid="contact-variant-${key}"]`);
      if (!visible(scope)) {
        issues.push(`variant ${key} is missing`);
        continue;
      }

      const scopeBox = scope.getBoundingClientRect();
      if (scopeBox.left < -1 || scopeBox.right > width + 1) {
        issues.push(`variant ${key} escapes viewport: ${rounded(scopeBox.left)}–${rounded(scopeBox.right)}`);
      }
      if (scope.querySelectorAll('h2').length !== 1) issues.push(`variant ${key} heading hierarchy drift`);
      if (!scope.querySelector('a[href="tel:+902163940551"]')) issues.push(`variant ${key} general phone is missing`);
      if (!scope.querySelector('a[href="mailto:info@meykozmetik.com"]')) issues.push(`variant ${key} general email is missing`);
      if (!scope.querySelector('a[href$="/satilik-daireler"]')) issues.push(`variant ${key} sales route is missing`);
      if (!scope.querySelector('a[href$="/projeler"]')) issues.push(`variant ${key} projects route is missing`);

      for (const anchor of scope.querySelectorAll<HTMLElement>('a')) {
        if (!visible(anchor)) continue;
        const box = anchor.getBoundingClientRect();
        if (box.width < 44 || box.height < 44) {
          issues.push(`variant ${key} small target: ${rounded(box.width)}×${rounded(box.height)} ${anchor.textContent?.trim()}`);
          break;
        }
        if (box.left < -1 || box.right > width + 1) {
          issues.push(`variant ${key} clipped target: ${rounded(box.left)}–${rounded(box.right)}`);
          break;
        }
      }

      const shadowed = [...scope.querySelectorAll<HTMLElement>('*')]
        .filter(visible)
        .filter((element) => getComputedStyle(element).boxShadow !== 'none');
      if (shadowed.length) issues.push(`variant ${key} has ${shadowed.length} unapproved shadows`);

      const fixed = [...scope.querySelectorAll<HTMLElement>('*')]
        .filter(visible)
        .filter((element) => getComputedStyle(element).position === 'fixed');
      if (fixed.length) issues.push(`variant ${key} has fixed UI blocking the page`);

      const broken = [...scope.querySelectorAll<HTMLImageElement>('img')]
        .filter((image) => !image.complete || image.naturalWidth === 0);
      if (broken.length) issues.push(`variant ${key} has ${broken.length} broken images`);
    }

    const mobile = width <= 700;
    const pairs = [
      ['A', rect('.ca-copy'), rect('.ca-visual')],
      ['B', rect('.cb-direct'), rect('.cb-routeboard')],
      ['C', rect('.ccx-channels'), rect('.ccx-routes')],
    ] as const;
    for (const [name, first, second] of pairs) {
      if (!first || !second) {
        issues.push(`${name} primary layout anatomy is incomplete`);
        continue;
      }
      if (mobile && second.y < first.bottom - 1) issues.push(`${name} mobile panels overlap or reorder`);
      if (!mobile && second.x < first.right - 1) issues.push(`${name} desktop panels overlap or stack`);
    }

    const aImage = document.querySelector<HTMLImageElement>('.ca-image');
    const cImage = document.querySelector<HTMLImageElement>('.ccx-bg');
    if (mobile && aImage && aImage.naturalWidth > 480) issues.push(`A mobile image source is ${aImage.naturalWidth}px`);
    if (mobile && cImage && cImage.naturalWidth > 480) issues.push(`C mobile image source is ${cImage.naturalWidth}px`);

    return {
      issues,
      clientWidth: html.clientWidth,
      scrollWidth: html.scrollWidth,
      aImageWidth: aImage?.naturalWidth,
      cImageWidth: cImage?.naturalWidth,
    };
  }, cell);
}

async function expectKeyActionsUnoccluded(scope: Locator) {
  const actions = scope.locator('a:visible');
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
  test(`${cell.name}: responsive hierarchy, targets, imagery and occlusion`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: cell.width, height: cell.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => { await document.fonts.ready; });

    for (const variant of variants) {
      const scope = page.locator(variant.selector);
      await settleVariant(scope);
      await expectKeyActionsUnoccluded(scope);
    }

    const result = await inspectPage(page, cell);
    expect(result.issues, `${cell.name}: ${JSON.stringify(result, null, 2)}`).toEqual([]);

    for (const variant of variants) {
      const screenshotPath = resolve(SCREENSHOT_ROOT, `${cell.name}-variant-${variant.key}-${cell.width}x${cell.height}.png`);
      mkdirSync(dirname(screenshotPath), { recursive: true });
      await page.locator(variant.selector).screenshot({
        path: screenshotPath,
        animations: 'disabled',
      });
    }
    await context.close();
  });
}
