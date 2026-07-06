import { defineConfig, devices } from '@playwright/test';

/** Tests run against the production build served by `astro preview` (base /MeyInsaatSite). */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    // Trailing slash matters: specs use RELATIVE paths ('kurumsal', 'ar/') so the
    // /MeyInsaatSite base survives URL resolution (a leading '/' would drop it).
    baseURL: 'http://localhost:4321/MeyInsaatSite/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321/MeyInsaatSite',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-360',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        contextOptions: { reducedMotion: 'reduce' },
      },
      testMatch: /signature\.spec\.ts/,
    },
  ],
});
