import { test, expect } from '@playwright/test';
import { u } from './util';

test('keyboard focus is visible (2px red outline)', async ({ page }) => {
  await page.goto(u('/'));
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // logo link
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { width: s.outlineWidth, color: s.outlineColor, tag: el.tagName };
  });
  expect(outline.tag).toBe('A');
  expect(outline.width).toBe('2px');
  expect(outline.color).toBe('rgb(181, 35, 35)'); // --mey-red
});

test('skip link jumps to main content', async ({ page }) => {
  await page.goto(u('/'));
  await page.keyboard.press('Tab');
  const text = await page.evaluate(() => (document.activeElement as HTMLElement).textContent?.trim());
  expect(text).toBe('İçeriğe geç');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('every visible image has alt text', async ({ page }) => {
  for (const path of ['/', '/kurumsal', '/projeler/ornek-proje']) {
    await page.goto(u(path));
    const missing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'))
        .filter((i) => !i.hasAttribute('alt'))
        .map((i) => i.src)
    );
    expect(missing, `images without alt on ${path}`).toEqual([]);
  }
});

test('heading order is sane on home', async ({ page }) => {
  await page.goto(u('/'));
  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main h1, main h2, main h3')).map((h) =>
      Number(h.tagName[1])
    )
  );
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1).length).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `no skipped level at heading ${i}`).toBeLessThanOrEqual(1);
  }
});

test('mobile menu opens and navigates', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'mobile only');
  await page.goto(u('/'));
  await page.locator('[data-mobile-menu] summary').click();
  const link = page.locator('[data-mobile-menu] a', { hasText: 'Kurumsal' });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/kurumsal\/?$/);
});

test('no horizontal overflow at 360px', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'mobile only');
  for (const path of ['/', '/kurumsal', '/hizmetler', '/projeler', '/iletisim', '/ar']) {
    await page.goto(u(path));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});
