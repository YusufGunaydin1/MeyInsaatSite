import { test, expect } from '@playwright/test';
import { u } from './util';

/*
  Header navigation: the Home link (added 2026-07) exists in every locale,
  carries the red level-underline only on the home page, and navigates back
  from inner pages. Desktop nav is hidden on mobile — those cases are covered
  by the mobile-menu test in a11y.spec.ts.
*/

const HOME_LABELS: Record<string, string> = {
  '': 'Ana Sayfa',
  en: 'Home',
  ru: 'Главная',
  ar: 'الرئيسية',
};

test('home link renders in header nav for every locale', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 768, 'desktop nav only');
  for (const [prefix, label] of Object.entries(HOME_LABELS)) {
    await page.goto(u(`/${prefix}`));
    const link = page.locator('header nav a.nav-caps', { hasText: label }).first();
    await expect(link, `home link on /${prefix}`).toBeVisible();
    await expect(link).toHaveAttribute('aria-current', 'page');
  }
});

test('home link is inactive on inner pages and navigates back home', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 768, 'desktop nav only');
  await page.goto(u('/projeler'));
  const home = page.locator('header nav a.nav-caps', { hasText: 'Ana Sayfa' });
  await expect(home).not.toHaveAttribute('aria-current', 'page');
  await home.click();
  await expect(page.locator('h1')).toBeVisible();
  const active = page.locator('header nav a.nav-caps[aria-current="page"]');
  await expect(active).toHaveText(/Ana Sayfa/i);
});

test('mobile menu includes Ana Sayfa', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width > 500, 'mobile only');
  await page.goto(u('/projeler'));
  await page.locator('[data-mobile-menu] summary').click();
  await expect(page.locator('[data-mobile-menu] a', { hasText: 'Ana Sayfa' })).toBeVisible();
});
