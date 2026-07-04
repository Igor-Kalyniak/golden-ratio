import { defineConfig, devices } from '@playwright/test';

/**
 * Production-only e2e config: every test runs against the live Vercel deployment, so there is
 * no `webServer`. Video is always recorded (the demo spec's artifact); a 1920×1080 viewport
 * makes the recording legible. `retries: 1` absorbs transient network flake against the live site.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://golden-ratio-apartment.vercel.app/',
    video: 'on',
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
