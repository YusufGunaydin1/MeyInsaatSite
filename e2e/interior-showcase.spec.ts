import { test, expect } from '@playwright/test';
import { u } from './util';

test.beforeEach(async ({ page }) => {
  await page.goto(u('showcases/ic-mekan-lab/'), { waitUntil: 'domcontentloaded' });
  const consent = page.getByTestId('consent-reject');
  if (await consent.isVisible()) await consent.click();
});

test('comparison supports keyboard, pointer and both room/style choices', async ({ page }) => {
  const section = page.getByTestId('compare-lab');
  const range = page.getByTestId('comparison-range');
  await section.scrollIntoViewIfNeeded();
  await expect(range).toBeEnabled();
  await range.focus();
  await page.keyboard.press('Home');
  await expect(range).toHaveValue('0');
  await expect(section.locator('.il-compare-furnished')).toHaveCSS('clip-path', 'inset(0px 0px 0px 0%)');
  await page.keyboard.press('End');
  await expect(range).toHaveValue('100');
  await page.getByTestId('compare-room').selectOption('attic');
  await page.getByTestId('compare-style').selectOption('urban');
  const furnished = section.locator('.il-compare-furnished');
  await expect(furnished).toHaveAttribute('src', /attic-urban\.webp$/);
  await expect.poll(() => furnished.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(1000);
  const stage = page.getByTestId('comparison-stage');
  await stage.scrollIntoViewIfNeeded();
  const box = (await stage.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  expect(Number(await range.inputValue())).toBeGreaterThanOrEqual(24);
  expect(Number(await range.inputValue())).toBeLessThanOrEqual(26);
  await expect(section).toContainText('Mobilyalar satış kapsamını göstermez');
});

test('furniture toggle swaps real imagery and retains choices across rooms', async ({ page }) => {
  const section = page.getByTestId('furnishing-lab');
  const toggle = page.getByTestId('furnishing-toggle');
  await section.scrollIntoViewIfNeeded();
  await expect(toggle).toBeEnabled();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(section.locator('.il-furnished-layer')).toHaveCSS('opacity', '1');
  await page.getByTestId('furnishing-style-urban').click();
  await page.getByTestId('furnishing-room-attic').click();
  await expect(section.locator('.il-furnished-layer')).toHaveAttribute('src', /attic-urban\.webp$/);
  await expect(section.locator('.il-furnished-layer')).toHaveCSS('opacity', '1');
  await expect(page.getByTestId('furnishing-style-urban')).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(section.locator('.il-furnished-layer')).toHaveCSS('opacity', '0');
  await expect(page.getByTestId('furnishing-status')).toContainText('gerçek fotoğraf');
});

test('cinematic scene follows scroll and can be controlled manually', async ({ page }) => {
  const cinema = page.getByTestId('interior-cinema');
  const progress = page.getByTestId('cinema-progress');
  await cinema.scrollIntoViewIfNeeded();
  await expect(progress).toBeEnabled();
  await page.getByTestId('cinema-step-3').click();
  await expect(progress).toHaveValue('100');
  await expect(page.getByTestId('cinema-state')).toHaveText('AI dekorasyon önerisi');
  await progress.focus();
  await page.keyboard.press('Home');
  await expect(page.getByTestId('cinema-state')).toHaveText('Orijinal fotoğraf');
  await page.getByTestId('cinema-mode').click();
  await expect(page.getByTestId('cinema-mode')).toHaveAttribute('aria-pressed', 'true');
  await cinema.locator('.il-cinema-track').evaluate(el => {
    const sticky = el.querySelector<HTMLElement>('.il-cinema-sticky')!;
    const box = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + box.top + (box.height - sticky.offsetHeight) * 0.85);
  });
  await expect.poll(async () => Number(await progress.inputValue())).toBeGreaterThan(75);
  await expect(cinema.locator('.il-cinema-layers img').last()).toHaveCSS('opacity', /0\.[89]|1/);
});

test('failed furniture image preserves the real room and explains the failure', async ({ page }) => {
  await page.route('**/living-natural.webp', route => route.abort());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('furnishing-lab').scrollIntoViewIfNeeded();
  await page.getByTestId('furnishing-toggle').click();
  await expect(page.getByTestId('furnishing-status')).toContainText('yüklenemedi');
  const section = page.getByTestId('furnishing-lab');
  await expect(section.locator('.il-furnished-layer')).toHaveCSS('opacity', '0');
  await expect.poll(() => section.locator('.il-config-image img').first().evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(1000);
  await page.getByTestId('furnishing-style-urban').click();
  await expect(section.locator('.il-furnished-layer')).toHaveCSS('opacity', '1');
});

test('reduced motion keeps the room story manually controllable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('interior-cinema').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('cinema-mode')).toBeDisabled();
  await expect(page.getByTestId('cinema-progress')).toBeEnabled();
  await page.getByTestId('cinema-step-1').click();
  await expect(page.getByTestId('cinema-state')).toHaveText('Orijinal fotoğraf');
  await expect(page.locator('.il-cinema-layers')).toHaveCSS('transform', 'none');
});

test('short landscape view keeps the room story manually accessible', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.getByTestId('interior-cinema').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('cinema-progress')).toBeEnabled();
  await expect(page.getByTestId('cinema-mode')).toBeDisabled();
  await page.getByTestId('cinema-step-3').click();
  await expect(page.getByTestId('cinema-state')).toHaveText('AI dekorasyon önerisi');
  await expect(page.locator('.il-cinema-track')).toHaveAttribute('data-scrollable', 'false');
});
