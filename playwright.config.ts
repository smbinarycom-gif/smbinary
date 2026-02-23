import { defineConfig, devices } from '@playwright/test';

const DEV_URL = process.env.DEV_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: DEV_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: DEV_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
