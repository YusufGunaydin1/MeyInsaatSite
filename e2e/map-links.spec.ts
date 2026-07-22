import { test, expect, type Locator, type Page } from '@playwright/test';
import { u } from './util';

type ExactPoint = { lat: string; lng: string; name: string };

const PROJECTS: Array<ExactPoint & { slug: string }> = [
  { slug: 'el-ele-apartmani', name: 'El Ele Apartmanı', lat: '40.875102', lng: '29.227424' },
  { slug: 'masuk-apartmani', name: 'Maşuk Apartmanı', lat: '40.874297', lng: '29.229697' },
  { slug: 'camoglu-apartmani', name: 'Çamoğlu Apartmanı', lat: '40.882302', lng: '29.226140' },
];

function exactMapUrls(point: ExactPoint) {
  const latLng = encodeURIComponent(`${point.lat},${point.lng}`);
  const lngLat = encodeURIComponent(`${point.lng},${point.lat}`);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    yandex: `https://yandex.com.tr/maps/?pt=${lngLat}&z=18&l=map`,
    apple: `https://maps.apple.com/?ll=${latLng}&q=${encodeURIComponent(point.name)}`,
  };
}

async function expectExactProviderLinks(links: Locator, point: ExactPoint) {
  const urls = exactMapUrls(point);
  await expect(links.getByTestId('map-google')).toHaveAttribute('href', urls.google);
  await expect(links.getByTestId('map-yandex')).toHaveAttribute('href', urls.yandex);
  await expect(links.getByTestId('map-apple')).toHaveAttribute('href', urls.apple);
  await expect(links.locator('a')).toHaveCount(3);
  await expect(links.locator('a').first()).toHaveAttribute('target', '_blank');
}

async function openDesktopDossier(page: Page, slug: string) {
  await page.goto(u(`/projeler/${slug}`));
  const root = page.getByTestId('pd-stage');
  await root.scrollIntoViewIfNeeded();
  await page.locator('[data-pd-next]').dispatchEvent('click');
  await page.locator('[data-pd-next]').dispatchEvent('click');
  return page.getByTestId('pd-frame-kunye').getByTestId('map-links');
}

test('all three project dossiers open exact verified coordinate pins', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'desktop staged dossier');

  for (const project of PROJECTS) {
    const links = await openDesktopDossier(page, project.slug);
    await expect(links).toBeVisible();
    await expect(links).toContainText('HARİTADA AÇ');
    await expectExactProviderLinks(links, project);
  }
});

test('RU locale keeps Yandex first without losing the exact pin', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'desktop staged dossier');
  const point = PROJECTS[1];
  await page.goto(u('/ru/projeler/masuk-apartmani'));
  const root = page.getByTestId('pd-stage');
  await root.scrollIntoViewIfNeeded();
  await page.locator('[data-pd-next]').dispatchEvent('click');
  await page.locator('[data-pd-next]').dispatchEvent('click');

  const links = page.getByTestId('pd-frame-kunye').getByTestId('map-links');
  await expect(links).toContainText('ОТКРЫТЬ НА КАРТЕ');
  await expect(links.locator('a').first()).toHaveText('Yandex');
  await expect(links.locator('a').first()).toHaveAttribute('href', exactMapUrls(point).yandex);
});

test('mobile project dossier exposes the same exact provider links', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-360', 'mobile project dossier');
  const point = PROJECTS[1];
  await page.goto(u('/projeler/masuk-apartmani'));
  const links = page.getByTestId('pd-mobile').getByTestId('map-links');
  await links.scrollIntoViewIfNeeded();
  await expect(links).toBeVisible();
  await expectExactProviderLinks(links, point);
});

test('for-sale apartment location panel opens the exact El Ele pin', async ({ page }) => {
  const point = PROJECTS[0];
  await page.goto(u('/satilik-daireler/daire-1'));
  const panel = page.getByTestId('kc-map');
  await panel.scrollIntoViewIfNeeded();

  // primary segment: Google directions to the exact El Ele coordinate
  const primary = panel.getByTestId('kc-loc-directions-primary');
  await expect(primary).toHaveAttribute(
    'href',
    new RegExp(`google\\.com/maps/dir/\\?api=1&destination=${point.lat}`),
  );
  await expect(primary).toHaveAttribute('target', '_blank');

  // disclosure exposes all three providers at the same exact pin
  const toggle = panel.getByTestId('kc-loc-directions-toggle');
  const google = panel.getByTestId('kc-loc-directions-google');
  await expect(async () => {
    await toggle.click();
    await expect(google).toBeVisible({ timeout: 700 });
  }).toPass();
  await expect(google).toHaveAttribute('href', /google\.com\/maps\/dir/);
  await expect(panel.getByTestId('kc-loc-directions-yandex')).toHaveAttribute('href', new RegExp(point.lng));
  await expect(panel.getByTestId('kc-loc-directions-apple')).toHaveAttribute('href', /maps\.apple\.com/);
});
