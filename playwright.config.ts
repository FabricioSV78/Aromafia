import { defineConfig, devices } from '@playwright/test';

const requestedPort = process.env['AROMAFIA_TEST_PORT'];
const testPort = Number(requestedPort ?? '4322');
if (
  (requestedPort !== undefined && !/^\d+$/.test(requestedPort)) ||
  !Number.isInteger(testPort) ||
  testPort < 1024 ||
  testPort > 65535
) {
  throw new Error('AROMAFIA_TEST_PORT must be an integer between 1024 and 65535.');
}
const testBaseUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: testBaseUrl,
    channel: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `node scripts/astro.mjs preview --host 127.0.0.1 --port ${testPort} --ignore-lock`,
    url: testBaseUrl,
    reuseExistingServer: requestedPort === undefined && !process.env['CI'],
    timeout: 30000,
  },
});
