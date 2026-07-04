import { defineConfig, devices } from '@playwright/test';

/**
 * Production-only e2e config: every test runs against the live Vercel deployment, so there is
 * no `webServer`. Video is always recorded (the demo spec's artifact) at the full 1920×1080 —
 * Playwright otherwise downscales recordings to ~800px, so `video.size` is set explicitly to
 * match the viewport. `retries: 1` absorbs transient network flake against the live site.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://golden-ratio-apartment.vercel.app/',
    video: { mode: 'on', size: { width: 1920, height: 1080 } },
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      // Re-set viewport AFTER the spread: devices['Desktop Chrome'] carries its own 1280×720,
      // and project `use` merges over top-level `use`, so this override is required to hold 1920×1080.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
