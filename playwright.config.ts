import { defineConfig, devices } from '@playwright/test';

/**
 * Production-only e2e config: every test runs against the live Vercel deployment, so there is
 * no `webServer`. The functional specs only keep a recording on failure; the always-on full
 * 1920×1080 video is scoped to the `demo` project below (that recording is the demo artifact),
 * so smoke/golden-ratio runs don't write full-size video every time. `retries: 1` absorbs
 * transient network flake against the live site.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://golden-ratio-apartment.vercel.app/',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      // The narrated 1080p demo artifact — always record at full viewport size (Playwright
      // otherwise downscales to ~800px, so `video.size` is set explicitly to match the viewport).
      name: 'demo',
      testMatch: /demo-ua\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        video: { mode: 'on', size: { width: 1920, height: 1080 } },
      },
    },
    {
      name: 'chromium',
      testIgnore: /demo-ua\.spec\.ts/,
      // Re-set viewport AFTER the spread: devices['Desktop Chrome'] carries its own 1280×720,
      // and project `use` merges over top-level `use`, so this override is required to hold 1920×1080.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
