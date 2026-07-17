import { test, expect } from '@playwright/test';
import { u } from './util';

const ROOT = 'showcases/satilik-daireler';
const variations = ['editoryal', 'mimari', 'monolit'] as const;
const nested = ['daireler', 'daire-1', 'daire-2', 'el-ele-apartmani', 'galeri', 'iletisim'] as const;

test.describe('Satılık Daireler — route ailesi', () => {
  test('karşılaştırma sayfası üç tamamlanmış yönü açar', async ({ page }) => {
    await page.goto(u(ROOT));
    await expect(page.getByTestId('sale-comparison-hub')).toBeVisible();
    await expect(page.locator('h1')).toContainText('üç tamamlanmış');

    for (const variation of variations) {
      const card = page.getByTestId(`direction-${variation}`);
      await expect(card).toBeVisible();
      await expect(card.getByRole('link', { name: /Tam yönü aç/ })).toHaveAttribute(
        'href',
        new RegExp(`/showcases/satilik-daireler/${variation}$`)
      );
    }
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  });

  test('22 yön ve alt sayfa statik olarak erişilebilir', async ({ request, baseURL }) => {
    const routes = [
      ROOT,
      ...variations.flatMap((variation) => [
        `${ROOT}/${variation}`,
        ...nested.map((page) => `${ROOT}/${variation}/${page}`),
      ]),
    ];
    expect(routes).toHaveLength(22);

    for (const route of routes) {
      const response = await request.get(new URL(route, baseURL).toString());
      expect(response.ok(), `${route} should render`).toBe(true);
      expect(await response.text(), `${route} should be noindex`).toContain('noindex,nofollow');
    }
  });

  for (const variation of variations) {
    test(`${variation}: ana sayfa, yalnız iki daire ve anlamlı linkler`, async ({ page }) => {
      await page.goto(u(`${ROOT}/${variation}`));
      await expect(page.getByTestId(`sale-home-${variation}`)).toBeVisible();
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.getByRole('heading', { name: /Müteahhitten sıfır 3\+2 dubleks/ })).toBeVisible();

      const visibleImages = page.locator('main img:visible');
      expect(await visibleImages.count()).toBeGreaterThan(1);
      for (let index = 0; index < Math.min(await visibleImages.count(), 4); index += 1) {
        await expect.poll(() => visibleImages.nth(index).evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }

      const emptyLinks = await page.locator('a:visible').evaluateAll((links) =>
        links
          .filter((link) => !link.getAttribute('href')?.trim())
          .map((link) => link.textContent?.trim())
      );
      expect(emptyLinks).toEqual([]);

      await page.goto(u(`${ROOT}/${variation}/daireler`));
      const overview = page.getByTestId('apartments-overview');
      await expect(overview.getByRole('heading', { name: 'Daire 1', exact: true })).toHaveCount(1);
      await expect(overview.getByRole('heading', { name: 'Daire 2', exact: true })).toHaveCount(1);
      await expect(overview).toContainText('3+2');
      await expect(overview).toContainText('Fiyat bilgisi için bize ulaşın');
    });
  }

  test('yayınlanan üç yönde filigranlı kaynak hiçbir zaman render edilmez', async ({ page }) => {
    for (const variation of variations) {
      await page.goto(u(`${ROOT}/${variation}/galeri`));
      await expect(page.locator('[data-media-id*="cevre-deniz"]')).toHaveCount(0);
      expect((await page.content()).includes('cevre-deniz.png')).toBe(false);
    }
  });
});

