# Playwright E2E + Ukrainian Demo Recording — Design

**Date:** 2026-07-04
**Status:** Approved (brainstorming), pending spec review
**Topic:** Integrate Playwright for an assertion-backed e2e suite plus a paced Ukrainian demo video, targeting the production deployment.

## Goal

Add Playwright to the project to serve two purposes at once (option "Both"):

1. **Ongoing e2e test coverage** — assertion-focused specs that verify language switching, calculation correctness, mode toggling, room management, and validation, all against the Ukrainian UI.
2. **A polished Ukrainian demo video** — a separate, paced walkthrough spec whose primary output is a readable `.webm` recording of the main user flow.

## Target

- **Production only.** `baseURL = https://golden-ratio-apartment.vercel.app/`.
- No Playwright `webServer` config; no local dev server is started.
- Trade-off accepted: the suite cannot exercise unmerged local changes and depends on the Vercel deployment being reachable. `retries: 1` smooths transient network flake.

## Constraints

- **No product code changes.** The app currently exposes no `data-testid` attributes. Tests use `getByRole` / `getByLabel` / UA-text selectors sourced from `locales/ua.json` rather than modifying components.
- Chromium only (reliable video recording, light install).
- Additive only: new `e2e/` directory, config, scripts, and `.gitignore` entries.

## Structure & tooling

- **Dependency:** `@playwright/test` (devDependency) + `npx playwright install chromium`.
- **New files:**
  - `playwright.config.ts` — `baseURL` = Vercel URL, no `webServer`, `video: 'on'`, 1920×1080 viewport, single Chromium project, `retries: 1`.
  - `e2e/demo-ua.spec.ts` — the paced demo walkthrough (video artifact).
  - `e2e/golden-ratio.spec.ts` — the assertion-focused e2e suite.
  - `e2e/helpers.ts` — shared locators + a `pace(page, ms)` deliberate-pause helper.
- **`.gitignore`:** add `/test-results/`, `/playwright-report/`, `/playwright/.cache/` so recordings and reports are not committed.
- **`package.json` scripts:**
  - `test:e2e` — run the full suite.
  - `test:e2e:demo` — run only the demo spec (keeps and surfaces the video path).
  - `test:e2e:report` — open the HTML report.

## Demo spec (`demo-ua.spec.ts`)

Single `test('Ukrainian walkthrough demo')`, paced for readability via `pace(page, ms)` (~1200ms default) and smooth `scrollIntoViewIfNeeded`:

1. `goto('/')`, wait for load.
2. Switch language to Ukrainian via `LanguageToggle`; assert a known UA string is visible (confirms the recording is in the right language).
3. Confirm 2D mode; fill ceiling / opening / room L×W with realistic values (e.g. ceiling 2700, opening 2100, room 5000×3500).
4. Add a second room via `RoomList`; fill it.
5. Slow-scroll through results, pausing on each: `ModuleSummary` → `BandDiagram` → `GoldenSplitBlock` → `GridFitBlock` → `WalkwayBlock`.
6. Toggle to 3D mode; wait for the lazy `Viz3D` canvas to render; pause on it.
7. Toggle theme (light → dark); pause.
8. Final pause on the full results view.

Assertions here are minimal — just enough to fail loudly if the page is broken — so the recording stays smooth. Video saved under `test-results/`; `test:e2e:demo` surfaces the path.

## Assertion suite (`golden-ratio.spec.ts`)

Fast pass/fail tests, minimal pacing, against the Ukrainian UI:

1. **Language switch** — toggle to UA, assert header/section labels match `locales/ua.json`; toggle back to EN, assert it flips.
2. **Calculation correctness** — enter the worked-example inputs from `docs/DESIGN.md`; assert the derived module / bands / golden-split / grid-fit values render the expected numbers. Numbers are never translated (i18n rule), so they are stable across languages.
3. **Mode toggle** — 2D→3D mounts the 3D canvas and unmounts the 2D SVG (and back).
4. **Room management** — add a room, assert per-room results appear; remove it, assert they disappear.
5. **Validation** — enter an out-of-bounds value, assert the warning/validation message shows.

Selectors live in `e2e/helpers.ts` (role- and UA-text-based). Exact worked-example numbers are pulled from `docs/DESIGN.md` / the `calculation-logic` skill when writing the spec so assertions match the real algorithm.

## Error handling & testing notes

- Production-only target: tests fail if Vercel is down (accepted). `retries: 1`.
- No product code changes; prefer `getByRole` / `getByLabel` over brittle text where a selector is ambiguous.
- CI is out of scope for this change; scripts are runnable locally.

## Out of scope

- On-screen caption overlays (option "C" in brainstorming was declined in favor of paced capture).
- Local `webServer` auto-start.
- Adding `data-testid` attributes to product components.
- CI wiring.
