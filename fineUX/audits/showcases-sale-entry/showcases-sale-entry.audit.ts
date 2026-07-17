import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const cases = [
  { name: 'desktop', width: 1366, height: 768, columns: 3 },
  { name: 'tablet', width: 1024, height: 768, columns: 3 },
  { name: 'mobile', width: 390, height: 844, columns: 1 },
] as const;

const screenshotRoot = resolve(
  process.cwd(),
  process.env.FINEUX_SCREENSHOT_DIR ?? 'fineUX/evidence/showcases-sale-entry',
);

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.getByTestId('showcases-sale-entry').scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
}

test.describe.configure({ mode: 'serial' });

for (const auditCase of cases) {
  test(`${auditCase.name}: route grid composition and screenshot`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: auditCase.width, height: auditCase.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('showcases/', { waitUntil: 'domcontentloaded' });
    await settle(page);

    const result = await page.getByTestId('showcases-sale-entry').evaluate((section, expectedColumns) => {
      const links = [...section.querySelectorAll<HTMLElement>('[data-sale-route]')];
      const cards = [...section.querySelectorAll<HTMLElement>('.showcases-sale-entry__link')];
      const sectionRect = section.getBoundingClientRect();
      const heading = section.querySelector<HTMLElement>('h2');
      const headingRect = heading?.getBoundingClientRect();
      const inner = section.querySelector<HTMLElement>('.showcases-sale-entry__inner');
      const innerStyle = inner ? getComputedStyle(inner) : null;
      const cardRects = cards.map((card) => card.getBoundingClientRect());
      const issues: string[] = [];

      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
        issues.push('horizontal overflow');
      }
      if (links.length !== 6) issues.push(`expected 6 route links, found ${links.length}`);
      if (sectionRect.left < -1 || sectionRect.right > document.documentElement.clientWidth + 1) {
        issues.push('section clipped horizontally');
      }
      if (!headingRect || headingRect.left < 0 || headingRect.right > document.documentElement.clientWidth) {
        issues.push('heading clipped horizontally');
      }
      if (!innerStyle || innerStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
        issues.push('feature panel has no surface color');
      }

      for (const link of links) {
        const rect = link.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) issues.push('route link is smaller than 44px');
        if (rect.left < 0 || rect.right > document.documentElement.clientWidth) {
          issues.push('route link clipped horizontally');
        }
        const hit = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)[0];
        if (hit && hit !== link && !link.contains(hit)) issues.push('route link externally occluded');
      }

      for (let first = 0; first < cardRects.length; first += 1) {
        for (let second = first + 1; second < cardRects.length; second += 1) {
          const a = cardRects[first];
          const b = cardRects[second];
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapX > 1 && overlapY > 1) issues.push('route cards overlap');
        }
      }

      const firstRowTops = [...new Set(cardRects.map((rect) => Math.round(rect.top)))];
      const firstRowCount = cardRects.filter((rect) => Math.abs(rect.top - cardRects[0].top) <= 1).length;
      if (firstRowCount !== Math.min(expectedColumns, cards.length)) {
        issues.push(`expected ${expectedColumns} columns, found ${firstRowCount}`);
      }
      if (firstRowTops.length < Math.ceil(cards.length / expectedColumns)) {
        issues.push('route grid row rhythm collapsed');
      }

      return { issues, linkCount: links.length, firstRowCount };
    }, auditCase.columns);

    expect(result.issues, JSON.stringify(result, null, 2)).toEqual([]);

    const screenshotPath = resolve(
      screenshotRoot,
      `showcases-sale-entry-${auditCase.width}x${auditCase.height}.png`,
    );
    mkdirSync(dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    await context.close();
  });
}
