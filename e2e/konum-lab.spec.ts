import { test, expect } from '@playwright/test';

const PATH = '/showcases/konum-lab';

test.describe('Konum Lab — unified directions control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PATH);
  });

  test('all five location variants render', async ({ page }) => {
    await expect(page.getByTestId('location-variant-a')).toBeVisible();
    await expect(page.getByTestId('location-variant-b')).toBeVisible();
    await expect(page.getByTestId('location-variant-c')).toBeVisible();
    await expect(page.getByTestId('location-variant-d').first()).toBeVisible();
    await expect(page.getByTestId('location-variant-e').first()).toBeVisible();
  });

  test('A · split — primary opens Google directions in one tap', async ({ page }) => {
    const primary = page.getByTestId('location-a-directions-primary');
    await expect(primary).toHaveAttribute('href', /google\.com\/maps\/dir/);
    await expect(primary).toHaveAttribute('target', '_blank');
  });

  test('A · one caret tap discloses all three providers', async ({ page }) => {
    const wrap = page.getByTestId('location-a-directions');
    const toggle = page.getByTestId('location-a-directions-toggle');
    const google = page.getByTestId('location-a-directions-google');

    await expect(wrap).toHaveAttribute('data-open', 'false');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(google).toBeHidden();

    await toggle.click();

    await expect(wrap).toHaveAttribute('data-open', 'true');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(google).toBeVisible();
    await expect(google).toHaveAttribute('href', /google\.com\/maps\/dir/);
    await expect(page.getByTestId('location-a-directions-yandex')).toHaveAttribute('href', /yandex/);
    await expect(page.getByTestId('location-a-directions-apple')).toHaveAttribute('href', /maps\.apple\.com/);
    for (const name of ['google', 'yandex', 'apple']) {
      await expect(page.getByTestId(`location-a-directions-${name}`)).toHaveAttribute('target', '_blank');
    }
  });

  test('A · Escape and outside-click both close the menu', async ({ page }) => {
    const wrap = page.getByTestId('location-a-directions');
    const toggle = page.getByTestId('location-a-directions-toggle');

    await toggle.click();
    await expect(wrap).toHaveAttribute('data-open', 'true');
    await page.keyboard.press('Escape');
    await expect(wrap).toHaveAttribute('data-open', 'false');

    await toggle.click();
    await expect(wrap).toHaveAttribute('data-open', 'true');
    await page.getByRole('heading', { level: 2 }).first().click();
    await expect(wrap).toHaveAttribute('data-open', 'false');
  });

  test('D · compact sale card — single-button menu reveals providers', async ({ page }) => {
    const card = page.getByTestId('location-variant-d').first();
    await card.scrollIntoViewIfNeeded();
    const toggle = card.getByTestId('location-d-directions-toggle');
    const google = card.getByTestId('location-d-directions-google');

    // client:visible island — retry click until React has hydrated.
    await expect(async () => {
      await toggle.click();
      await expect(google).toBeVisible({ timeout: 700 });
    }).toPass();
    await expect(google).toHaveAttribute('href', /google/);
    await expect(card.locator('iframe')).toHaveCount(1);
  });

  test('D · expand opens the enlarged map modal with big map + directions', async ({ page }) => {
    const card = page.getByTestId('location-variant-d').first();
    await card.scrollIntoViewIfNeeded();
    const expand = card.getByTestId('location-d-expand');
    const modal = page.getByTestId('location-d-modal');

    await expect(async () => {
      await expand.click();
      await expect(modal).toBeVisible({ timeout: 700 });
    }).toPass();

    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal.locator('iframe')).toHaveCount(1);
    await expect(modal.getByTestId('location-d-modal-directions-primary')).toHaveAttribute(
      'href',
      /google\.com\/maps\/dir/,
    );
  });

  test('D · modal closes via ×, Escape, and backdrop — Escape returns focus', async ({ page }) => {
    const card = page.getByTestId('location-variant-d').first();
    await card.scrollIntoViewIfNeeded();
    const expand = card.getByTestId('location-d-expand');
    const modal = page.getByTestId('location-d-modal');
    const open = async () => {
      await expect(async () => {
        await expand.click();
        await expect(modal).toBeVisible({ timeout: 700 });
      }).toPass();
    };

    await open();
    await page.getByTestId('location-d-modal-close').click();
    await expect(modal).toBeHidden();

    await open();
    await page.locator('.km-mapmodal').click({ position: { x: 6, y: 6 } });
    await expect(modal).toBeHidden();

    await open();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(expand).toBeFocused();
  });

  test('E · strip carries zero map iframes but keeps the directions menu', async ({ page }) => {
    const strip = page.getByTestId('location-variant-e').first();
    await strip.scrollIntoViewIfNeeded();
    await expect(strip.locator('iframe')).toHaveCount(0);
    await expect(strip.getByTestId('location-e-directions-toggle')).toBeVisible();
  });

  test('F · Leaflet card self-renders the map — no iframe, compact ⓘ attribution', async ({ page }) => {
    const card = page.getByTestId('location-variant-f').first();
    await card.scrollIntoViewIfNeeded();

    await expect(card.getByTestId('location-f-leaflet')).toBeVisible();
    await expect(card.locator('iframe')).toHaveCount(0);

    const toggle = card.locator('.km-attrib-toggle');
    const credit = card.locator('.km-attrib-credit');
    await expect(toggle).toBeVisible();
    await expect(credit.locator('a')).toHaveAttribute('href', /openstreetmap\.org\/copyright/);
    await toggle.click();
    await expect(credit).toBeVisible();
  });

  test('G · daire-page block: Leaflet map + amenity list + single directions (no iframe)', async ({ page }) => {
    const block = page.getByTestId('location-variant-g');
    await block.scrollIntoViewIfNeeded();

    await expect(block.getByTestId('location-g-leaflet')).toBeVisible();
    await expect(block.locator('iframe')).toHaveCount(0);
    await expect(block.locator('.km-block-amen li')).toHaveCount(6);
    await expect(block.getByTestId('location-g-directions-primary')).toHaveAttribute(
      'href',
      /google\.com\/maps\/dir/,
    );
  });

  for (const v of ['h', 'i', 'j']) {
    test(`${v.toUpperCase()} · compact daire-block variant renders Leaflet + directions (no iframe)`, async ({ page }) => {
      const block = page.getByTestId(`location-variant-${v}`);
      await block.scrollIntoViewIfNeeded();
      await expect(block.getByTestId(`location-${v}-leaflet`)).toBeVisible();
      await expect(block.locator('iframe')).toHaveCount(0);
      await expect(block.getByTestId(`location-${v}-directions-primary`)).toHaveAttribute(
        'href',
        /google\.com\/maps\/dir/,
      );
    });
  }

  test('F · Leaflet expand opens a Leaflet modal (no iframe) with directions', async ({ page }) => {
    const card = page.getByTestId('location-variant-f').first();
    await card.scrollIntoViewIfNeeded();
    const expand = card.getByTestId('location-f-expand');
    const modal = page.getByTestId('location-f-modal');

    await expect(async () => {
      await expand.click();
      await expect(modal).toBeVisible({ timeout: 800 });
    }).toPass();

    await expect(modal.getByTestId('location-f-modal-leaflet')).toBeVisible();
    await expect(modal.locator('iframe')).toHaveCount(0);
    await expect(modal.getByTestId('location-f-modal-directions-primary')).toHaveAttribute(
      'href',
      /google\.com\/maps\/dir/,
    );
  });
});
