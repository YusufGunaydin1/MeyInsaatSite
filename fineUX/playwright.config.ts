import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.FINEUX_PORT ?? 4331);
const STATIC_DIR = process.env.FINEUX_STATIC_DIR;

export default defineConfig({
  testDir: './audits',
  testMatch: /.*\.audit\.ts/,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 8_000 },
  outputDir: '../test-results/fineUX/playwright',
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}/`,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: STATIC_DIR
      ? `python3 -m http.server ${PORT} --directory ${JSON.stringify(STATIC_DIR)}`
      : `npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [{ name: 'fineux-sale' }],
});
