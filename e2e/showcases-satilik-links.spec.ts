import { expect, test } from '@playwright/test';
import { u } from './util';

const HUB = 'showcases/';
const SALE_ROOT = '/showcases/satilik-daireler';
const expectedRoutes = [
  SALE_ROOT,
  `${SALE_ROOT}/daire-1`,
  `${SALE_ROOT}/daire-2`,
  `${SALE_ROOT}/el-ele-apartmani`,
  `${SALE_ROOT}/galeri`,
  `${SALE_ROOT}/iletisim`,
];

test.describe('/showcases Satılık Daireler geçişleri', () => {
  test('altı final sayfayı listeler ve genel deneyime gider', async ({ page }) => {
    await page.goto(u(HUB), { waitUntil: 'domcontentloaded' });

    const entry = page.getByTestId('showcases-sale-entry');
    await expect(entry).toBeVisible();
    await expect(entry.getByRole('heading', { name: 'Satılık Daireler · El Ele Apartmanı' })).toBeVisible();

    const routes = entry.locator('[data-sale-route]');
    await expect(routes).toHaveCount(expectedRoutes.length);
    const paths = await routes.evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).pathname.replace(/\/$/, '')),
    );
    expect(paths).toEqual(expectedRoutes);

    await entry.getByRole('link', { name: /Genel sayfayı aç/ }).click();
    await expect(page).toHaveURL(new RegExp(`${SALE_ROOT}/?$`));
    await expect(page.getByTestId('sd-sale-home')).toBeVisible();
  });

  test('mobilde bağlantılar dokunulabilir ve yatay taşma üretmez', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-360', 'mobil geometri 360×740 projesinde ölçülür');
    await page.goto(u(HUB), { waitUntil: 'domcontentloaded' });

    const entry = page.getByTestId('showcases-sale-entry');
    const geometry = await entry.locator('[data-sale-route]').evaluateAll((links) => ({
      targets: links.map((link) => {
        const rect = link.getBoundingClientRect();
        return { width: rect.width, height: rect.height, left: rect.left, right: rect.right };
      }),
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(geometry.targets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);
    expect(geometry.targets.every((target) => target.left >= 0 && target.right <= geometry.clientWidth)).toBe(true);
  });

  test('bölüm üretim ana sayfasına sızmaz', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'rota izolasyonu masaüstünde bir kez doğrulanır');
    await page.goto(u('/'), { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('showcases-sale-entry')).toHaveCount(0);
  });
});
