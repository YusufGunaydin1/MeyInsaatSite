import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = 'showcases/satilik-daireler';
const SCREENSHOT_ROOT = resolve(
  process.cwd(),
  process.env.FINEUX_SCREENSHOT_DIR ?? 'test-results/fineUX/screenshots/satilik-daireler'
);

type AuditCase = {
  name: string;
  path: string;
  width: number;
  height: number;
};

const cases: AuditCase[] = [
  { name: 'comparison-wide', path: ROOT, width: 1440, height: 900 },
  { name: 'comparison-mobile', path: ROOT, width: 390, height: 844 },
  { name: 'editoryal-wide', path: `${ROOT}/editoryal`, width: 1440, height: 900 },
  { name: 'editoryal-laptop', path: `${ROOT}/editoryal`, width: 1366, height: 768 },
  { name: 'editoryal-tablet', path: `${ROOT}/editoryal`, width: 1024, height: 768 },
  { name: 'editoryal-mobile', path: `${ROOT}/editoryal`, width: 390, height: 844 },
  { name: 'mimari-wide', path: `${ROOT}/mimari`, width: 1440, height: 900 },
  { name: 'mimari-mobile', path: `${ROOT}/mimari`, width: 390, height: 844 },
  { name: 'monolit-wide', path: `${ROOT}/monolit`, width: 1440, height: 900 },
  { name: 'monolit-mobile', path: `${ROOT}/monolit`, width: 390, height: 844 },
  { name: 'daire-1-desktop', path: `${ROOT}/editoryal/daire-1`, width: 1366, height: 900 },
  { name: 'daire-1-mobile', path: `${ROOT}/editoryal/daire-1`, width: 390, height: 844 },
  { name: 'daire-2-desktop', path: `${ROOT}/mimari/daire-2`, width: 1366, height: 900 },
  { name: 'daire-2-mobile', path: `${ROOT}/mimari/daire-2`, width: 390, height: 844 },
  { name: 'gallery-tablet', path: `${ROOT}/monolit/galeri`, width: 1024, height: 768 },
  { name: 'gallery-mobile', path: `${ROOT}/monolit/galeri`, width: 390, height: 844 },
  { name: 'contact-tablet', path: `${ROOT}/editoryal/iletisim`, width: 1024, height: 768 },
  { name: 'contact-mobile', path: `${ROOT}/editoryal/iletisim`, width: 390, height: 844 },
  { name: 'building-tablet', path: `${ROOT}/monolit/el-ele-apartmani`, width: 1024, height: 768 },
  { name: 'building-mobile', path: `${ROOT}/monolit/el-ele-apartmani`, width: 390, height: 844 },
];

async function settlePhotographs(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(500, Math.floor(window.innerHeight * 0.8));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolvePromise) => window.setTimeout(resolvePromise, 12));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(120);
}

async function inspectGeometry(page: Page, width: number) {
  return page.evaluate((viewportWidth) => {
    const visible = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const rounded = (value: number) => Math.round(value * 10) / 10;
    const issues: string[] = [];
    const html = document.documentElement;

    if (html.scrollWidth > html.clientWidth + 1) {
      issues.push(`horizontal overflow ${html.scrollWidth - html.clientWidth}px`);
    }

    const h1s = [...document.querySelectorAll('main h1')].filter(visible);
    if (h1s.length !== 1) issues.push(`expected one visible main h1, found ${h1s.length}`);
    for (const h1 of h1s) {
      const rect = h1.getBoundingClientRect();
      if (rect.left < -1 || rect.right > viewportWidth + 1) issues.push('main h1 is clipped horizontally');
    }

    const bodyFont = getComputedStyle(document.body).fontFamily;
    if (!bodyFont.includes('DM Sans')) issues.push(`body font drift: ${bodyFont}`);

    const missingAlt = [...document.images]
      .filter((image) => !image.hasAttribute('alt'))
      .map((image) => image.currentSrc || image.src);
    if (missingAlt.length) issues.push(`${missingAlt.length} images have no alt attribute`);

    const brokenImages = [...document.images]
      .filter((image) => visible(image) && (!image.complete || image.naturalWidth === 0))
      .map((image) => image.currentSrc || image.src);
    if (brokenImages.length) issues.push(`${brokenImages.length} visible images did not load`);

    const duplicateTestIds = [...document.querySelectorAll('[data-testid]')]
      .filter(visible)
      .reduce<Record<string, number>>((counts, element) => {
        const key = element.getAttribute('data-testid') ?? '';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {});
    for (const [key, count] of Object.entries(duplicateTestIds)) {
      if (count > 1) issues.push(`duplicate visible layer [data-testid="${key}"] × ${count}`);
    }

    const brand = document.querySelector('.sale-brand');
    if (brand && visible(brand)) {
      const visibleLogos = [...brand.querySelectorAll('.sale-brand-logo')].filter(visible);
      if (visibleLogos.length !== 1) issues.push(`expected one visible brand logo, found ${visibleLogos.length}`);
    }

    const darkChromeExpected = Boolean(
      document.querySelector('.sale-comparison, .sale-theme-mimari, .sale-theme-monolit')
    );
    const chrome = document.querySelector<HTMLElement>('.sale-review-header, .sale-header');
    if (darkChromeExpected && chrome && visible(chrome)) {
      const parseRgb = (value: string) =>
        (value.match(/[\d.]+/g) ?? []).slice(0, 3).map((part) => Number.parseFloat(part));
      const background = parseRgb(getComputedStyle(chrome).backgroundColor);
      const foreground = parseRgb(getComputedStyle(chrome).color);
      if (background.length !== 3 || background.reduce((sum, channel) => sum + channel, 0) / 3 > 64) {
        issues.push(`reference chrome drift: expected dark header, found ${getComputedStyle(chrome).backgroundColor}`);
      }
      if (foreground.length !== 3 || foreground.reduce((sum, channel) => sum + channel, 0) / 3 < 180) {
        issues.push(`reference chrome drift: expected light header text, found ${getComputedStyle(chrome).color}`);
      }
    }

    const controls = [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea')].filter(visible);
    for (const control of controls) {
      const rect = control.getBoundingClientRect();
      const insideScrollableRail = Boolean(control.closest('.sale-gallery-filters, .sale-breadcrumb'));
      if (!insideScrollableRail && (rect.left < -1 || rect.right > viewportWidth + 1)) {
        issues.push(`${control.tagName.toLowerCase()} control clipped at ${rounded(rect.left)}–${rounded(rect.right)}`);
        break;
      }
    }

    const fixedLayers = [...document.querySelectorAll<HTMLElement>('body *')].filter((element) => {
      if (!visible(element)) return false;
      const position = getComputedStyle(element).position;
      return position === 'fixed';
    });
    for (const layer of fixedLayers) {
      if (!layer.matches('.sale-sticky-cta, .sale-skip-link') && !layer.closest('dialog[open]')) {
        issues.push(`unexpected fixed layer: ${layer.className || layer.tagName}`);
      }
    }

    for (const button of document.querySelectorAll<HTMLElement>('.sale-button')) {
      if (!visible(button)) continue;
      const radius = Number.parseFloat(getComputedStyle(button).borderTopLeftRadius);
      if (radius > 2.1) issues.push(`button radius drift: ${radius}px`);
    }

    if (viewportWidth <= 500) {
      if (fixedLayers.some((layer) => layer.matches('.sale-sticky-cta'))) {
        issues.push('mobile sticky CTA occludes the content viewport');
      }
      const touchTargets = [...document.querySelectorAll<HTMLElement>('[data-sale-menu-toggle], .sale-button, [data-gallery-filter], .sale-gallery-open')].filter(visible);
      for (const target of touchTargets) {
        const rect = target.getBoundingClientRect();
        if (rect.width < 42 || rect.height < 42) {
          issues.push(`small touch target ${target.tagName.toLowerCase()} ${rounded(rect.width)}×${rounded(rect.height)}`);
          break;
        }
      }
    }

    const comparisonCards = [...document.querySelectorAll<HTMLElement>('.sale-direction-card')].filter(visible);
    for (const card of comparisonCards) {
      const media = card.querySelector<HTMLElement>('.sale-direction-media');
      const copy = card.querySelector<HTMLElement>('.sale-direction-copy');
      if (!media || !copy || !visible(media) || !visible(copy)) continue;
      const mediaRect = media.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      const overlapWidth = Math.min(mediaRect.right, copyRect.right) - Math.max(mediaRect.left, copyRect.left);
      const overlapHeight = Math.min(mediaRect.bottom, copyRect.bottom) - Math.max(mediaRect.top, copyRect.top);
      if (overlapWidth > 1 && overlapHeight > 1) issues.push('comparison card media and copy overlap');
    }

    return {
      issues,
      bodyFont,
      imageCount: document.images.length,
      fixedLayerCount: fixedLayers.length,
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
    };
  }, width);
}

test.describe.configure({ mode: 'serial' });

for (const auditCase of cases) {
  test(`${auditCase.name}: composition, geometry, tokens and screenshot`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: auditCase.width, height: auditCase.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(auditCase.path);
    await settlePhotographs(page);

    if (/\/(galeri|iletisim)$/.test(auditCase.path)) {
      await expect(page.locator('.sale-sticky-cta')).toHaveCount(0);
    }

    const result = await inspectGeometry(page, auditCase.width);
    expect(result.issues, `${auditCase.name}: ${JSON.stringify(result, null, 2)}`).toEqual([]);

    const screenshotPath = resolve(SCREENSHOT_ROOT, `${auditCase.name}-${auditCase.width}x${auditCase.height}.png`);
    mkdirSync(dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    await context.close();
  });
}
