import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = 'showcases/satilik-daireler';
const SCREENSHOT_ROOT = resolve(
  process.cwd(),
  process.env.FINEUX_SCREENSHOT_DIR ?? 'fineUX/evidence/satilik-daireler-final',
);

type AuditCase = { name: string; path: string; width: number; height: number };

const cases: AuditCase[] = [
  { name: 'home-wide', path: ROOT, width: 1440, height: 900 },
  { name: 'home-laptop', path: ROOT, width: 1366, height: 768 },
  { name: 'home-tablet', path: ROOT, width: 1024, height: 768 },
  { name: 'home-mobile-390', path: ROOT, width: 390, height: 844 },
  { name: 'home-mobile-360', path: ROOT, width: 360, height: 740 },
  { name: 'daire-1-desktop', path: `${ROOT}/daire-1`, width: 1366, height: 768 },
  { name: 'daire-1-mobile', path: `${ROOT}/daire-1`, width: 390, height: 844 },
  { name: 'daire-2-desktop', path: `${ROOT}/daire-2`, width: 1366, height: 768 },
  { name: 'daire-2-mobile', path: `${ROOT}/daire-2`, width: 390, height: 844 },
  { name: 'building-tablet', path: `${ROOT}/el-ele-apartmani`, width: 1024, height: 768 },
  { name: 'building-mobile', path: `${ROOT}/el-ele-apartmani`, width: 390, height: 844 },
  { name: 'gallery-tablet', path: `${ROOT}/galeri`, width: 1024, height: 768 },
  { name: 'gallery-mobile', path: `${ROOT}/galeri`, width: 390, height: 844 },
  { name: 'contact-tablet', path: `${ROOT}/iletisim`, width: 1024, height: 768 },
  { name: 'contact-mobile', path: `${ROOT}/iletisim`, width: 390, height: 844 },
];

async function settlePage(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = [...document.images];
    images.forEach((image) => { image.loading = 'eager'; });
    const step = Math.max(480, Math.floor(window.innerHeight * 0.78));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolvePromise) => window.setTimeout(resolvePromise, 70));
    }
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolvePromise) => {
          const done = () => resolvePromise();
          image.addEventListener('load', done, { once: true });
          image.addEventListener('error', done, { once: true });
          window.setTimeout(done, 4_000);
        });
      }
      await image.decode().catch(() => undefined);
    }));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(140);
}

async function inspectGeometry(page: Page, auditCase: AuditCase) {
  return page.evaluate(({ width, height, isHome }) => {
    const issues: string[] = [];
    const html = document.documentElement;
    const rounded = (value: number) => Math.round(value * 10) / 10;
    const visible = (element: Element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };

    if (html.scrollWidth > html.clientWidth + 1) issues.push(`horizontal overflow ${html.scrollWidth - html.clientWidth}px`);

    const header = document.querySelector<HTMLElement>('.sd-header');
    if (!header || !visible(header)) {
      issues.push('compact global header is missing');
    } else {
      const headerHeight = header.getBoundingClientRect().height;
      if (headerHeight < 56 || headerHeight > 72) issues.push(`header height ${rounded(headerHeight)}px`);
    }

    const h1s = [...document.querySelectorAll<HTMLElement>('main h1')].filter(visible);
    if (h1s.length !== 1) issues.push(`expected one visible main h1, found ${h1s.length}`);
    for (const heading of h1s) {
      const rect = heading.getBoundingClientRect();
      const size = Number.parseFloat(getComputedStyle(heading).fontSize);
      if (rect.left < -1 || rect.right > width + 1) issues.push('main h1 is clipped horizontally');
      if (width > 500 && size > 58.1) issues.push(`desktop h1 is ${rounded(size)}px`);
      if (width <= 500 && size > 40.1) issues.push(`mobile h1 is ${rounded(size)}px`);
    }

    const bodyFont = getComputedStyle(document.body).fontFamily;
    if (!bodyFont.includes('DM Sans')) issues.push(`body font drift: ${bodyFont}`);

    const missingAlt = [...document.images].filter((image) => !image.hasAttribute('alt'));
    if (missingAlt.length) issues.push(`${missingAlt.length} images have no alt attribute`);
    const brokenImages = [...document.images].filter((image) => visible(image) && (!image.complete || image.naturalWidth === 0));
    if (brokenImages.length) issues.push(`${brokenImages.length} visible images did not load`);
    const watermarked = [...document.images].filter((image) => (image.currentSrc || image.src).includes('cevre-deniz'));
    if (watermarked.length) issues.push('watermarked cevre-deniz source is rendered');

    const clipped = [...document.querySelectorAll<HTMLElement>('h1, h2, h3, a[href], button, input, select, textarea')]
      .filter(visible)
      .find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > width + 1;
      });
    if (clipped) {
      const rect = clipped.getBoundingClientRect();
      issues.push(`${clipped.tagName.toLowerCase()} clipped at ${rounded(rect.left)}–${rounded(rect.right)}`);
    }

    const fixedLayers = [...document.querySelectorAll<HTMLElement>('body *')].filter((element) => {
      return visible(element) && getComputedStyle(element).position === 'fixed';
    });
    for (const layer of fixedLayers) {
      if (!layer.matches('.sd-skip-link') && !layer.closest('.sd-lightbox-overlay')) {
        issues.push(`unexpected fixed layer: ${layer.className || layer.tagName}`);
      }
    }

    const oversizedImage = [...document.querySelectorAll<HTMLElement>('main .sd-photo, main .sd-gallery-image')]
      .filter(visible)
      .find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width >= width - 2 || rect.height > Math.max(470, height * 0.72);
      });
    if (oversizedImage) issues.push('ordinary content image fills the canvas');

    if (width >= 1200) {
      const container = document.querySelector<HTMLElement>('main .sd-container');
      const containerWidth = container?.getBoundingClientRect().width ?? 0;
      if (containerWidth < 1120 || containerWidth > 1240) issues.push(`desktop container width ${rounded(containerWidth)}px`);
    }

    if (width <= 500) {
      const touchTargets = [...document.querySelectorAll<HTMLElement>(
        '.sd-menu-toggle, .sd-button, .sd-text-link, .sd-mobile-main-link, .sd-mobile-buyer-links a, [data-gallery-filter], [data-gallery-item]',
      )].filter(visible);
      const smallTarget = touchTargets.find((target) => {
        const rect = target.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      });
      if (smallTarget) {
        const rect = smallTarget.getBoundingClientRect();
        issues.push(`small touch target ${smallTarget.tagName.toLowerCase()} ${rounded(rect.width)}×${rounded(rect.height)}`);
      }
    }

    const viewportTargets = [...document.querySelectorAll<HTMLElement>('main h1, main h2, main a[href], main button')]
      .filter(visible)
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= height && rect.left >= 0 && rect.right <= width;
      });
    const occluded = viewportTargets.find((target) => {
      const rect = target.getBoundingClientRect();
      const top = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)[0];
      return Boolean(top && top !== target && !target.contains(top));
    });
    if (occluded) issues.push(`viewport target occluded: ${occluded.tagName.toLowerCase()}.${occluded.className}`);

    if (isHome && width >= 1200) {
      const hero = document.querySelector<HTMLElement>('.sd-home-hero');
      const heroHeight = hero?.getBoundingClientRect().height ?? 0;
      if (heroHeight < 320 || heroHeight > 420) issues.push(`home hero height ${rounded(heroHeight)}px`);
      const cards = [...document.querySelectorAll<HTMLElement>('.sd-apartment-card')].filter(visible);
      if (cards.length !== 2) issues.push(`expected two apartment cards, found ${cards.length}`);
      if (width === 1440 && cards.some((card) => card.getBoundingClientRect().bottom > height + 1)) {
        issues.push('both apartment cards are not complete in the 1440×900 first viewport');
      }
    }

    return {
      issues,
      bodyFont,
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      imageCount: document.images.length,
      fixedLayerCount: fixedLayers.length,
    };
  }, { width: auditCase.width, height: auditCase.height, isHome: auditCase.path === ROOT });
}

test.describe.configure({ mode: 'serial' });

for (const auditCase of cases) {
  test(`${auditCase.name}: compact composition, geometry and screenshot`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: auditCase.width, height: auditCase.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(auditCase.path);
    await settlePage(page);

    const result = await inspectGeometry(page, auditCase);
    expect(result.issues, `${auditCase.name}: ${JSON.stringify(result, null, 2)}`).toEqual([]);

    const screenshotPath = resolve(SCREENSHOT_ROOT, `${auditCase.name}-${auditCase.width}x${auditCase.height}.png`);
    mkdirSync(dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    await context.close();
  });
}
