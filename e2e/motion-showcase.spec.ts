import { test, expect } from '@playwright/test';
import { u } from './util';

test.beforeEach(async ({ page }) => {
  await page.goto(u('showcases/hareket-lab/'), { waitUntil: 'domcontentloaded' });
  const consent = page.getByTestId('consent-reject');
  if (await consent.isVisible()) await consent.click();
});

test('construction frames track scroll, stage choices and keyboard scrub', async ({ page }) => {
  const build = page.getByTestId('motion-build');
  await build.scrollIntoViewIfNeeded();
  await expect(build).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
  const samples: number[] = [];
  for (const progress of [0, 0.3, 0.65, 1]) {
    await build.locator('[data-build-runway]').evaluate((el, p) => {
      const box = el.getBoundingClientRect();
      const stage = el.querySelector<HTMLElement>('[data-build-sticky]')!;
      window.scrollTo(0, window.scrollY + box.top + (box.height - stage.offsetHeight) * p);
    }, progress);
    const expected = Math.round(progress * 16) + 1;
    await expect.poll(async () => Number(await build.getAttribute('data-frame'))).toBe(expected);
    samples.push(Number(await build.getAttribute('data-frame')));
  }
  expect(new Set(samples).size).toBe(4);
  await page.getByTestId('build-stage-1').click();
  await expect(build).toHaveAttribute('data-mode', 'manual');
  await expect(build).toHaveAttribute('data-frame', '7');
  await page.getByTestId('build-frame-range').focus();
  await page.keyboard.press('ArrowRight');
  await expect(build).toHaveAttribute('data-frame', '8');
  await page.keyboard.press('End');
  await expect(build).toHaveAttribute('data-frame', '17');
  const painted = await build.locator('canvas').evaluate((el: HTMLCanvasElement) => {
    const pixels = el.getContext('2d')!.getImageData(0, 0, el.width, el.height).data;
    let visible = 0;
    for (let index = 3; index < pixels.length; index += 400) if (pixels[index] > 0) visible++;
    return visible;
  });
  expect(painted).toBeGreaterThan(50);
  await page.getByTestId('build-reset').click();
  await expect(build).toHaveAttribute('data-frame', '1');
});

test('assembly separates, rotates, explains layers and resets', async ({ page }) => {
  const assembly = page.getByTestId('motion-assembly');
  await assembly.scrollIntoViewIfNeeded();
  await expect(assembly).toHaveAttribute('data-ready', 'true');
  const layer = assembly.locator('[data-model-layer="roof"]');
  const initialTransform = await layer.getAttribute('transform');
  await page.getByTestId('assembly-separation').focus();
  await page.keyboard.press('End');
  await expect(assembly).toHaveAttribute('data-separation', '100');
  await expect(layer).not.toHaveAttribute('transform', initialTransform!);
  const face = assembly.locator('[data-vertices]').first();
  const initialPoints = await face.getAttribute('points');
  await page.getByTestId('assembly-rotation').focus();
  await page.keyboard.press('End');
  await expect(face).not.toHaveAttribute('points', initialPoints!);
  await page.getByTestId('assembly-layer-roof').click();
  await expect(page.getByTestId('assembly-layer-roof')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('assembly-detail')).toContainText(/Çatı/);
  await page.getByTestId('assembly-reset').click();
  await expect(assembly).toHaveAttribute('data-separation', '45');
  await expect(assembly).toHaveAttribute('data-rotation', '0');
  await expect(assembly).toHaveAttribute('data-selected', 'all');
});

test('facade switches daylight, responds to depth controls and resets', async ({ page }) => {
  const facade = page.getByTestId('motion-facade');
  await facade.scrollIntoViewIfNeeded();
  await expect(facade).toHaveAttribute('data-ready', 'true');
  await page.getByTestId('facade-dusk').click();
  await expect(facade).toHaveAttribute('data-scene', 'dusk');
  await expect(page.getByTestId('facade-dusk')).toHaveAttribute('aria-pressed', 'true');
  const dusk = page.getByTestId('facade-dusk-image');
  await expect.poll(() => dusk.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(1000);
  await page.getByTestId('facade-depth').focus();
  await page.keyboard.press('End');
  await expect(page.getByTestId('facade-depth')).toHaveValue('100');
  await page.getByTestId('facade-angle').focus();
  await page.keyboard.press('End');
  await expect(page.getByTestId('facade-angle')).toHaveValue('100');
  await page.getByTestId('facade-motion-toggle').click();
  await expect(page.getByTestId('facade-motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  const viewport = page.getByTestId('facade-viewport');
  await viewport.scrollIntoViewIfNeeded();
  const box = (await viewport.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3);
  await expect.poll(() => facade.getAttribute('data-angle')).toBe('50');
  await expect(facade.locator('[data-facade-camera]')).not.toHaveCSS('transform', 'none');
  await page.getByTestId('facade-angle').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('facade-motion-toggle')).toHaveAttribute('aria-pressed', 'false');
  await page.getByTestId('facade-reset').click();
  await expect(facade).toHaveAttribute('data-scene', 'day');
  await expect(page.getByTestId('facade-depth')).toHaveValue('55');
  await expect(page.getByTestId('facade-angle')).toHaveValue('0');
  await expect(page.getByTestId('facade-motion-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('failed dusk image leaves the daylight facade usable', async ({ page }) => {
  await page.route('**/el-ele-dusk.webp', route => route.abort());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const facade = page.getByTestId('motion-facade');
  await facade.scrollIntoViewIfNeeded();
  await page.getByTestId('facade-dusk').click();
  await expect(facade.locator('[data-facade-status]')).toContainText('yüklenemedi');
  await expect(facade).toHaveAttribute('data-scene', 'day');
  await expect(page.getByTestId('facade-dusk-image')).toHaveCSS('opacity', '0');
  await expect.poll(() => page.getByTestId('facade-day-image').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(1000);
  await page.getByTestId('facade-day').click();
  await expect(facade.locator('[data-facade-status]')).toContainText('Gün ışığı');
});

test('failed construction frame retains the poster and reports the failure', async ({ page }) => {
  await page.route('**/frame-08*.webp', route => route.abort());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const build = page.getByTestId('motion-build');
  await build.scrollIntoViewIfNeeded();
  await expect(build.locator('[data-build-status]')).toContainText('yüklenemedi', { timeout: 20_000 });
  await expect(build.locator('[data-build-poster]')).toBeVisible();
  await expect(page.getByTestId('build-frame-range')).toBeDisabled();
  await expect(build).not.toHaveAttribute('data-ready', 'true');
});

test('reduced motion opens construction at the final frame with manual controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const build = page.getByTestId('motion-build');
  await build.scrollIntoViewIfNeeded();
  await expect(build).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
  await expect(build).toHaveAttribute('data-mode', 'manual');
  await expect(build).toHaveAttribute('data-frame', '17');
  await page.getByTestId('build-stage-0').click();
  await expect(build).toHaveAttribute('data-frame', '1');
});
