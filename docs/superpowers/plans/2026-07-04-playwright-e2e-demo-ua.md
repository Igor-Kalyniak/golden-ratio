# Playwright E2E + Ukrainian Demo Recording Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Playwright with an assertion-backed e2e suite plus a paced Ukrainian demo-recording spec, both targeting the production Vercel deployment.

**Architecture:** Playwright is configured with `baseURL` pointed at the live Vercel URL and no `webServer` (production-only). All specs live under `e2e/`. A shared `e2e/helpers.ts` provides role/label/id-based locators (no product code changes — the app has no `data-testid`) and a `pace()` helper for deliberate video pauses. Two specs: `golden-ratio.spec.ts` (fast assertions) and `demo-ua.spec.ts` (paced walkthrough whose artifact is a 1920×1080 `.webm`).

**Tech Stack:** `@playwright/test` (Chromium only), TypeScript. The existing `node --test` unit suite (`npm test`) is untouched; e2e runs via separate `test:e2e*` scripts.

## Global Constraints

- **Target is production only:** `baseURL = https://golden-ratio-apartment.vercel.app/`. No Playwright `webServer`; no local dev server is started.
- **Chromium only.** No Firefox/WebKit projects.
- **No product code changes.** Locate elements via `getByRole` / `getByLabel` / element `id` (from `components/*`), never by adding `data-testid`.
- **`retries: 1`** to smooth transient network flake against the live site.
- **UA strings are canonical** and come verbatim from `locales/ua.json`.
- **Numbers are never translated** (i18n rule) — calculation assertions are locale-independent.
- Additive only: new `e2e/`, `playwright.config.ts`, `package.json` scripts, `.gitignore` + `tsconfig.json` edits.

### Reference facts (from the codebase — do not re-derive)

- **Default app state** (`lib/app-state.ts`): `mode: '3d'`, `ceiling: 2800`, `opening: 2100`, `module: 700`, one room `#room-1` `"Room 1"` `3000×2400`. Results are visible on load (state is valid). Default locale is `en`.
- **Room ids** are minted monotonically per page load: the first added room is `#room-2` (fields `#room-2-length`, `#room-2-width`), defaulting to `3000×2400`, name `"Room 2"`.
- **Selectors:**
  - Language pill: buttons with exact accessible name `EN` / `UA`.
  - Mode toggle: buttons with exact accessible name `3D` / `2D`.
  - Theme toggle button accessible name (UA): `Перемкнути на темну тему` (when currently light) / `Перемкнути на світлу тему` (when currently dark).
  - Ceiling input `#apt-ceiling`, opening `#apt-opening`, module `<select>` `#apt-module` (visible only in 3D mode).
  - Room fields `#room-1-length`, `#room-1-width`, etc.
  - Add-room button accessible name matches `/Додати кімнату/`; remove-room button aria-label `Видалити кімнату`.
  - Page title `<h1>` (UA): `Модуль квартири та золотий перетин`; (EN): `Apartment Module & Golden Ratio`.
  - Result section headings (UA): `Зведення модуля` (module summary), `Діаграма вертикальних смуг` (band diagram, 3D only), `Результати по кімнатах` (per-room).
  - Ceiling error text (UA): `Ціле число від 2000 до 5000 мм.`
- **Worked example** (`docs/DESIGN.md §10`), inputs ceiling 2800 / opening 2100 / M=700, Living room **4200 × 3500**:
  - Golden split exact `2595.6 / 1604.4`, snapped `2450 / 1750`, offset `145.6 mm`.
  - Grid `6 × 5`, remainder `0 / 0`, quality badge `точно`.
  - Module summary hero renders `M = 700`.

---

### Task 1: Playwright tooling scaffold + production smoke test

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`
- Modify: `package.json` (scripts)
- Modify: `.gitignore`
- Modify: `tsconfig.json` (exclude e2e from the Next typecheck)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a runnable Playwright harness against production; the `test:e2e` / `test:e2e:demo` / `test:e2e:report` scripts; config exporting `baseURL`, `video: 'on'`, `viewport 1920×1080`, `retries: 1`, `testDir: './e2e'`, a single `chromium` project.

- [ ] **Step 1: Install Playwright and the Chromium browser**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Expected: `@playwright/test` added under devDependencies; Chromium downloaded.

- [ ] **Step 2: Create the Playwright config**

Create `playwright.config.ts`:

```ts
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
```

- [ ] **Step 3: Add the e2e scripts to package.json**

In `package.json`, add to the `"scripts"` block (keep the existing `test` script untouched):

```json
    "test:e2e": "playwright test",
    "test:e2e:demo": "playwright test demo-ua",
    "test:e2e:report": "playwright show-report"
```

- [ ] **Step 4: Ignore Playwright artifacts**

Append to `.gitignore`:

```gitignore

# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

- [ ] **Step 5: Exclude e2e from the Next typecheck**

In `tsconfig.json`, change the `"exclude"` array so the Next build/typecheck ignores Playwright files (Playwright transpiles them itself):

```json
  "exclude": ["node_modules", "e2e", "playwright.config.ts"]
```

- [ ] **Step 6: Write the smoke test**

Create `e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('production home page loads with the app title', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Apartment Module & Golden Ratio' }),
  ).toBeVisible();
});
```

- [ ] **Step 7: Run the smoke test against production**

Run: `npm run test:e2e -- smoke`
Expected: PASS (1 passed). This proves the harness reaches the live deployment. If it fails on network, the deployment may be down — confirm the URL loads in a browser before proceeding.

- [ ] **Step 8: Commit**

```bash
git add playwright.config.ts e2e/smoke.spec.ts package.json package-lock.json .gitignore tsconfig.json
git commit -m "test(e2e): scaffold Playwright against production + smoke test"
```

---

### Task 2: Assertion suite (`golden-ratio.spec.ts`) + shared helpers

**Files:**
- Create: `e2e/helpers.ts`
- Create: `e2e/golden-ratio.spec.ts`

**Interfaces:**
- Consumes: the Playwright harness and config from Task 1.
- Produces: `e2e/helpers.ts` exporting:
  - `pace(page: Page, ms?: number): Promise<void>` — waits `ms` (default 1200) for paced video.
  - `setLanguage(page: Page, lang: 'EN' | 'UA'): Promise<void>` — clicks the language pill.
  - `setMode(page: Page, mode: '2D' | '3D'): Promise<void>` — clicks the mode toggle.
  - `fill(page: Page, id: string, value: number | string): Promise<void>` — fills an input by id.

- [ ] **Step 1: Write the shared helpers**

Create `e2e/helpers.ts`:

```ts
import { type Page } from '@playwright/test';

/** Deliberate pause so recorded interactions are readable on video (demo spec only). */
export async function pace(page: Page, ms = 1200): Promise<void> {
  await page.waitForTimeout(ms);
}

/** Switch the UI language via the header `EN | UA` pill. */
export async function setLanguage(page: Page, lang: 'EN' | 'UA'): Promise<void> {
  await page.getByRole('button', { name: lang, exact: true }).click();
}

/** Switch calculation mode via the segmented `3D | 2D` toggle. */
export async function setMode(page: Page, mode: '2D' | '3D'): Promise<void> {
  await page.getByRole('button', { name: mode, exact: true }).click();
}

/** Replace the value of a numeric/text input located by its element id. */
export async function fill(page: Page, id: string, value: number | string): Promise<void> {
  await page.locator(`#${id}`).fill(String(value));
}
```

- [ ] **Step 2: Write the assertion suite**

Create `e2e/golden-ratio.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { setLanguage, setMode, fill } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('language pill switches every UI string live', async ({ page }) => {
  // Loads in EN by default.
  await expect(
    page.getByRole('heading', { name: 'Apartment Module & Golden Ratio' }),
  ).toBeVisible();

  await setLanguage(page, 'UA');
  await expect(
    page.getByRole('heading', { name: 'Модуль квартири та золотий перетин' }),
  ).toBeVisible();

  await setLanguage(page, 'EN');
  await expect(
    page.getByRole('heading', { name: 'Apartment Module & Golden Ratio' }),
  ).toBeVisible();
});

test('worked-example inputs render the canonical derived numbers (UA)', async ({ page }) => {
  await setLanguage(page, 'UA');
  // Default mode is 3D; heights are visible and default to 2800 / 2100 → module 700.
  await fill(page, 'apt-ceiling', 2800);
  await fill(page, 'apt-opening', 2100);
  // Living-room worked example.
  await fill(page, 'room-1-length', 4200);
  await fill(page, 'room-1-width', 3500);

  // Module summary hero.
  await expect(page.getByText('M = 700')).toBeVisible();
  // Golden split (exact / snapped / offset).
  await expect(page.getByText('2595.6 / 1604.4')).toBeVisible();
  await expect(page.getByText('2450 / 1750')).toBeVisible();
  await expect(page.getByText('145.6 mm')).toBeVisible();
  // Grid fit + quality badge.
  await expect(page.getByText('6 × 5')).toBeVisible();
  await expect(page.getByText('точно')).toBeVisible();
});

test('mode toggle hides height fields in 2D (FR-MODE-02)', async ({ page }) => {
  await setLanguage(page, 'UA');
  // 3D default: ceiling field present.
  await expect(page.locator('#apt-ceiling')).toBeVisible();

  await setMode(page, '2D');
  await expect(page.locator('#apt-ceiling')).toHaveCount(0);

  await setMode(page, '3D');
  await expect(page.locator('#apt-ceiling')).toBeVisible();
});

test('adding and removing a room adds/removes its inputs', async ({ page }) => {
  await setLanguage(page, 'UA');
  await expect(page.locator('#room-2-length')).toHaveCount(0);

  await page.getByRole('button', { name: /Додати кімнату/ }).click();
  await expect(page.locator('#room-2-length')).toBeVisible();

  // Remove the second room via its labelled remove button (the last one in DOM order).
  await page.getByRole('button', { name: 'Видалити кімнату' }).last().click();
  await expect(page.locator('#room-2-length')).toHaveCount(0);
});

test('out-of-range ceiling shows the validation error (UA)', async ({ page }) => {
  await setLanguage(page, 'UA');
  await fill(page, 'apt-ceiling', 100);
  await expect(page.getByText('Ціле число від 2000 до 5000 мм.')).toBeVisible();
});
```

- [ ] **Step 3: Run the assertion suite**

Run: `npm run test:e2e -- golden-ratio`
Expected: PASS (5 passed). If a `getByText` for a number fails, open the HTML report (`npm run test:e2e:report`) and confirm the rendered string exactly (watch the `×` U+00D7 glyph and decimal formatting).

- [ ] **Step 4: Commit**

```bash
git add e2e/helpers.ts e2e/golden-ratio.spec.ts
git commit -m "test(e2e): Ukrainian assertion suite — i18n, calc, mode, rooms, validation"
```

---

### Task 3: Paced Ukrainian demo recording (`demo-ua.spec.ts`)

**Files:**
- Create: `e2e/demo-ua.spec.ts`

**Interfaces:**
- Consumes: `pace`, `setLanguage`, `setMode`, `fill` from `e2e/helpers.ts` (Task 2); the `video: 'on'`, 1920×1080 config from Task 1.
- Produces: a single paced test whose recorded `.webm` (under `test-results/`) is the demo artifact.

- [ ] **Step 1: Write the demo spec**

Create `e2e/demo-ua.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { pace, setLanguage, setMode, fill } from './helpers';

/**
 * Paced Ukrainian walkthrough. Its purpose is the recorded video (config `video: 'on'`,
 * 1920×1080), so steps are deliberately slowed and results are scrolled into view. Assertions
 * are minimal — just enough to fail loudly if the live page is broken.
 */
test('Ukrainian walkthrough demo', async ({ page }) => {
  test.slow(); // triple the timeout — this test is intentionally unhurried.

  // 1. Load the live site (loads EN, 3D by default).
  await page.goto('/');
  await pace(page);

  // 2. Switch to Ukrainian — every string re-labels live.
  await setLanguage(page, 'UA');
  await expect(
    page.getByRole('heading', { name: 'Модуль квартири та золотий перетин' }),
  ).toBeVisible();
  await pace(page);

  // 3. Fill apartment heights (3D mode shows ceiling + opening).
  await fill(page, 'apt-ceiling', 2800);
  await pace(page, 600);
  await fill(page, 'apt-opening', 2100);
  await pace(page);

  // 4. Enter the first room (the worked-example living room).
  await fill(page, 'room-1-length', 4200);
  await pace(page, 600);
  await fill(page, 'room-1-width', 3500);
  await pace(page);

  // 5. Add and fill a second room.
  await page.getByRole('button', { name: /Додати кімнату/ }).click();
  await expect(page.locator('#room-2-length')).toBeVisible();
  await fill(page, 'room-2-length', 3800);
  await fill(page, 'room-2-width', 2500);
  await pace(page);

  // 6. Slow-scroll through the derived results, pausing on each.
  for (const name of [
    'Зведення модуля', // module summary
    'Діаграма вертикальних смуг', // band diagram (3D)
    'Результати по кімнатах', // per-room results
  ]) {
    await page.getByText(name, { exact: false }).first().scrollIntoViewIfNeeded();
    await pace(page);
  }

  // 7. Switch to 2D mode — heights hide, the 2D SVG visualizer shows.
  await setMode(page, '2D');
  await expect(page.locator('#apt-ceiling')).toHaveCount(0);
  await page.getByText('Візуалізатор модуля').first().scrollIntoViewIfNeeded();
  await pace(page);

  // 8. Back to 3D — let the lazy 3D canvas render.
  await setMode(page, '3D');
  await page.getByText('Візуалізатор модуля').first().scrollIntoViewIfNeeded();
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  await pace(page);

  // 9. Toggle to the dark theme for a final flourish.
  await page.getByRole('button', { name: 'Перемкнути на темну тему' }).click();
  await pace(page);

  // 10. Rest on the finished view.
  await pace(page, 2000);
});
```

- [ ] **Step 2: Run the demo spec and produce the video**

Run: `npm run test:e2e:demo`
Expected: PASS (1 passed). Playwright writes the recording under `test-results/…/video.webm`.

- [ ] **Step 3: Confirm the video artifact exists**

Run: `find test-results -name '*.webm'`
Expected: at least one `.webm` path printed (the demo recording).

- [ ] **Step 4: Commit**

```bash
git add e2e/demo-ua.spec.ts
git commit -m "test(e2e): paced Ukrainian demo walkthrough recording"
```

---

## Notes for the implementer

- The `canvas` wait in Task 3 Step 1 is wrapped in `.catch(() => {})` so the demo never fails if headless Chromium can't initialize WebGL — the mode toggle itself is already asserted in the suite. The 3D visualizer still renders under Playwright's Chromium in the common case.
- If a numeric `getByText` assertion is flaky because a value appears in more than one place, scope it (e.g. `.first()`), but first confirm via the HTML report that the string is what the component renders.
- Do not point `baseURL` at localhost — production-only is a deliberate spec decision.
