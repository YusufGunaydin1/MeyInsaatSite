import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROUTE = 'showcases/satilik-mobile-kompakt/';
const LIVE_ROUTE = 'satilik-daireler/';
const SCREENSHOT_ROOT = resolve(
  process.cwd(),
  process.env.FINEUX_SCREENSHOT_DIR ?? 'test-results/fineUX/satilik-mobile-showcase'
);

type AuditCell = {
  name: string;
  width: number;
  height: number;
  filtersOpen?: boolean;
};

type LayoutEntry = {
  rect: { x: number; y: number; width: number; height: number };
  style: Record<string, string>;
};

const cells: AuditCell[] = [
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'boundary-641', width: 641, height: 740 },
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-filters-open-360', width: 360, height: 740, filtersOpen: true },
];

const paritySelectors: Record<string, string> = {
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

async function settle(page: Page) {
  await expect(page.getByTestId('kl-card').first()).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  const island = page.locator('astro-island[component-url*="SaleListing"]');
  await expect.poll(() => island.evaluate((element) => element.hasAttribute('ssr'))).toBe(false);
  await expect.poll(() => page.locator('.ks-hero-img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.waitForTimeout(100);
}

async function captureLayout(page: Page): Promise<Record<string, LayoutEntry | null>> {
  return page.evaluate((selectors) => Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return [key, null];
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return [key, {
        rect: { x: box.x, y: box.y, width: box.width, height: box.height },
        style: {
          display: style.display,
          position: style.position,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderTopWidth: style.borderTopWidth,
          paddingTop: style.paddingTop,
          paddingRight: style.paddingRight,
          gridTemplateColumns: style.gridTemplateColumns,
          gap: style.gap,
        },
      }];
    })
  ), paritySelectors) as Promise<Record<string, LayoutEntry | null>>;
}

function expectDesktopParity(
  live: Record<string, LayoutEntry | null>,
  proposal: Record<string, LayoutEntry | null>,
  cell: AuditCell
) {
  for (const key of Object.keys(paritySelectors)) {
    expect(live[key], `${cell.name} live ${key}`).not.toBeNull();
    expect(proposal[key], `${cell.name} proposal ${key}`).not.toBeNull();
    for (const metric of ['x', 'y', 'width', 'height'] as const) {
      expect(
        Math.abs((proposal[key]?.rect[metric] ?? 0) - (live[key]?.rect[metric] ?? 0)),
        `${cell.name} ${key}.${metric} changed above the mobile breakpoint`
      ).toBeLessThanOrEqual(0.5);
    }
    expect(proposal[key]?.style, `${cell.name} ${key} computed-style drift`).toEqual(live[key]?.style);
  }
}

async function inspect(page: Page, cell: AuditCell) {
  return page.evaluate(({ width, filtersOpen }) => {
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
    const inside = (child: Rect, parent: Rect, tolerance = 1) =>
      child.x >= parent.x - tolerance && child.y >= parent.y - tolerance &&
      child.right <= parent.right + tolerance && child.bottom <= parent.bottom + tolerance;
    const rounded = (value: number) => Math.round(value * 10) / 10;

    const html = document.documentElement;
    if (html.scrollWidth > html.clientWidth + 1) issues.push(`horizontal overflow ${html.scrollWidth - html.clientWidth}px`);

    const visibleH1s = [...document.querySelectorAll('main h1')].filter(visible);
    if (visibleH1s.length !== 1) issues.push(`expected one visible h1, found ${visibleH1s.length}`);

    const mobile = width <= 640;
    const mobileHero = rect('[data-testid="smp-mobile-hero"]');
    const originalHeroCopy = rect('.ks-hero-left');
    const originalHelp = rect('.ks-hero-help');
    const mobileControls = rect('[data-testid="klm-controls"]');
    const originalTabs = rect('.kl-tabs-row');
    const originalFilters = rect('.kl-filters');

    if (mobile) {
      if (!mobileHero || !mobileControls) issues.push('mobile-only hero or controls are missing');
      if (originalHeroCopy || originalHelp) issues.push('original hero composition remains visible on mobile');
      if (originalTabs || originalFilters) issues.push('desktop filter composition remains visible on mobile');
    } else {
      if (mobileHero || mobileControls) issues.push('mobile-only composition leaked above 640px');
      if (!originalHeroCopy || !originalHelp || !originalTabs || !originalFilters) {
        issues.push('live desktop/tablet composition is incomplete');
      }
    }

    const hero = rect('[data-testid="smp-hero"]');
    const listing = rect('.ks-listing');
    const firstCard = rect('[data-testid="kl-card"]');

    if (hero && listing && Math.abs(listing.y - hero.bottom) > 1) {
      issues.push(`hero/listing gap ${rounded(listing.y - hero.bottom)}px`);
    }

    if (mobile && hero && mobileHero && mobileControls && firstCard) {
      const status = rect('.smp-mobile-status');
      const title = rect('.smp-mobile-hero h1');
      const sub = rect('.smp-mobile-sub');
      const actions = rect('.smp-mobile-actions');
      const tabs = rect('.klm-tabs');
      const command = rect('.klm-command-row');

      if (!status || !title || !sub || !actions || !tabs || !command) {
        issues.push('mobile proposal anatomy is incomplete');
      } else {
        for (const [name, child] of [['status', status], ['title', title], ['sub', sub], ['actions', actions]] as const) {
          if (!inside(child, mobileHero)) issues.push(`${name} escapes the mobile hero`);
        }
        if (status.bottom > title.y + 1) issues.push('availability status overlaps title');
        if (title.bottom > sub.y + 1) issues.push('hero title overlaps property summary');
        if (sub.bottom > actions.y + 1) issues.push('property summary overlaps contact actions');
        if (tabs.bottom > command.y + 1) issues.push('category tabs overlap the command row');
      }

      const titleColor = getComputedStyle(document.querySelector<HTMLElement>('.smp-mobile-hero h1')!).color;
      if (titleColor !== 'rgb(255, 255, 255)') issues.push(`mobile hero title contrast drift: ${titleColor}`);
      if (hero.height > 160) issues.push(`mobile hero too tall: ${rounded(hero.height)}px`);
      if (!filtersOpen && mobileControls.height > 108) issues.push(`closed mobile controls too tall: ${rounded(mobileControls.height)}px`);
      if (!filtersOpen && firstCard.y > 370) issues.push(`first card starts too low: ${rounded(firstCard.y)}px`);

      const tabWidths = [...document.querySelectorAll<HTMLElement>('.klm-tab')]
        .filter(visible)
        .map((tab) => tab.getBoundingClientRect().width);
      if (tabWidths.length !== 3) issues.push(`expected three mobile tabs, found ${tabWidths.length}`);
      if (tabWidths.length && Math.max(...tabWidths) - Math.min(...tabWidths) > 1) {
        issues.push(`mobile tab width drift ${rounded(Math.max(...tabWidths) - Math.min(...tabWidths))}px`);
      }

      const targetSelectors = [
        '.smp-mobile-actions a',
        '.klm-tab',
        '[data-testid="klm-filter-toggle"]',
        '.klm-sort',
        ...(filtersOpen ? ['.klm-field select', '.klm-clear', '.klm-apply'] : []),
      ];
      for (const selector of targetSelectors) {
        for (const target of document.querySelectorAll<HTMLElement>(selector)) {
          if (!visible(target)) continue;
          const box = target.getBoundingClientRect();
          if (box.width < 44 || box.height < 44) {
            issues.push(`small touch target ${selector}: ${rounded(box.width)}×${rounded(box.height)}`);
            break;
          }
          if (box.x < -1 || box.right > width + 1) {
            issues.push(`clipped control ${selector}: ${rounded(box.x)}–${rounded(box.right)}`);
            break;
          }
        }
      }

      if (filtersOpen) {
        const panel = rect('[data-testid="klm-filter-panel"]');
        if (!panel) issues.push('open mobile filter panel is missing');
        if (panel && !inside(panel, mobileControls, 1)) issues.push('mobile filter panel escapes its control surface');
      } else if (document.querySelector('[data-testid="klm-filter-panel"]')) {
        issues.push('closed mobile filter panel remains in the DOM');
      }
    }

    const firstVisibleCard = document.querySelector<HTMLElement>('[data-testid="kl-card"]');
    if (visible(firstVisibleCard)) {
      const card = firstVisibleCard.getBoundingClientRect();
      const media = firstVisibleCard.querySelector<HTMLElement>('.kl-card-media')?.getBoundingClientRect();
      const body = firstVisibleCard.querySelector<HTMLElement>('.kl-card-body')?.getBoundingClientRect();
      if (!media || !body) issues.push('listing card anatomy is incomplete');
      if (media && (media.left < card.left - 1 || media.right > card.right + 1 || media.top < card.top - 1)) {
        issues.push('listing card media escapes its unchanged card');
      }
      if (media && body && media.bottom > body.top + 1) issues.push('listing card media overlaps its body');
    }

    const brokenImages = [...document.images]
      .filter((image) => {
        if (!visible(image)) return false;
        const box = image.getBoundingClientRect();
        return box.bottom > 0 && box.top < window.innerHeight && (!image.complete || image.naturalWidth === 0);
      });
    if (brokenImages.length) issues.push(`${brokenImages.length} visible images failed to load`);

    const heroImage = document.querySelector<HTMLImageElement>('.ks-hero-img');
    if (mobile && heroImage && heroImage.naturalWidth > 480) {
      issues.push(`oversized mobile hero source: ${heroImage.naturalWidth}px`);
    }

    const occlusionSelectors = mobile
      ? ['[data-testid="smp-mobile-hero"]', '[data-testid="klm-controls"]', '[data-testid="kl-card"]']
      : ['.ks-hero-in', '.kl-tabs-row', '[data-testid="kl-card"]'];
    for (const selector of occlusionSelectors) {
      const target = document.querySelector<HTMLElement>(selector);
      if (!visible(target)) continue;
      const box = target.getBoundingClientRect();
      for (const xRatio of [0.2, 0.5, 0.8]) {
        for (const yRatio of [0.2, 0.5, 0.8]) {
          const x = box.left + box.width * xRatio;
          const y = box.top + box.height * yRatio;
          if (y < 0 || y > window.innerHeight) continue;
          const top = document.elementsFromPoint(x, y)[0];
          if (top && top !== target && !target.contains(top)) {
            issues.push(`external occlusion over ${selector} at ${rounded(x)},${rounded(y)}`);
            break;
          }
        }
      }
    }

    const shadowed = [...document.querySelectorAll<HTMLElement>('.klm-controls, .klm-filter-panel, .kl-card')]
      .filter(visible)
      .filter((element) => getComputedStyle(element).boxShadow !== 'none');
    if (shadowed.length) issues.push(`${shadowed.length} proposal surfaces use an unapproved shadow`);

    return {
      issues,
      mobile,
      heroHeight: hero?.height,
      controlsHeight: mobileControls?.height,
      firstCardY: firstCard?.y,
      firstCardWidth: firstCard?.width,
      firstCardHeight: firstCard?.height,
      clientWidth: html.clientWidth,
      scrollWidth: html.scrollWidth,
    };
  }, cell);
}

test.describe.configure({ mode: 'serial' });

for (const cell of cells) {
  test(`${cell.name}: mobile-only scope, composition and occlusion`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: cell.width, height: cell.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    await page.goto(LIVE_ROUTE, { waitUntil: 'domcontentloaded' });
    await settle(page);
    const liveLayout = await captureLayout(page);

    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    await settle(page);
    if (cell.filtersOpen) {
      await page.getByTestId('klm-filter-toggle').click();
      await expect(page.getByTestId('klm-filter-panel')).toBeVisible();
    }

    const proposalLayout = await captureLayout(page);
    if (cell.width > 640) expectDesktopParity(liveLayout, proposalLayout, cell);
    if (cell.width <= 640) {
      expect(proposalLayout.firstCard?.rect.width, `${cell.name} card width changed`).toBeCloseTo(liveLayout.firstCard?.rect.width ?? 0, 1);
      expect(proposalLayout.firstCard?.rect.height, `${cell.name} card height changed`).toBeCloseTo(liveLayout.firstCard?.rect.height ?? 0, 1);
    }

    const result = await inspect(page, cell);
    expect(result.issues, `${cell.name}: ${JSON.stringify(result, null, 2)}`).toEqual([]);

    const screenshotPath = resolve(SCREENSHOT_ROOT, `${cell.name}-${cell.width}x${cell.height}.png`);
    mkdirSync(dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' });
    await context.close();
  });
}
