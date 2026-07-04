# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-04T20:30:00+03:00
- **Last action:** **Added Playwright e2e + Ukrainian demo recording** (brainstorm → spec → plan →
  subagent-driven execution → review). New `e2e/` suite targets the **production Vercel deployment
  only** (`baseURL` = `https://golden-ratio-apartment.vercel.app/`, no `webServer`, Chromium-only,
  `retries: 1`, `video: 'on'`, 1920×1080): [playwright.config.ts](../playwright.config.ts),
  [e2e/helpers.ts](../e2e/helpers.ts) (`pace`/`setLanguage`/`setMode`/`fill`),
  [e2e/golden-ratio.spec.ts](../e2e/golden-ratio.spec.ts) (5 UA assertions — i18n switch, canonical
  worked-example numbers, mode toggle, room CRUD, validation), [e2e/smoke.spec.ts](../e2e/smoke.spec.ts),
  and [e2e/demo-ua.spec.ts](../e2e/demo-ua.spec.ts) (paced UA walkthrough → `.webm` under
  `test-results/`). **No product code changed** (role/label/id selectors; no `data-testid`). Scripts
  `test:e2e` / `test:e2e:demo` / `test:e2e:report`; existing `npm test` (node --test) untouched;
  `e2e`/`playwright.config.ts` excluded from the Next typecheck. Unit **107/107**, e2e **7/7** green.
  Final whole-branch review: **ready to merge** (no crit/important). Commits `243d565..96d65ce` on
  branch **`dev`**, kept as-is (not merged/pushed). Design & plan in
  [docs/superpowers/specs/2026-07-04-playwright-e2e-demo-ua-design.md](superpowers/specs/2026-07-04-playwright-e2e-demo-ua-design.md)
  / [docs/superpowers/plans/2026-07-04-playwright-e2e-demo-ua.md](superpowers/plans/2026-07-04-playwright-e2e-demo-ua.md).
  Out of scope (backlog): CI wiring; localhost target; on-screen captions.
- **Prior action:** **Shipped capability 17 `viz-3d-grid`** (iteration 3) end-to-end via the
  `ship-capability` advisory loop — the 3D **module-lattice + remainder-slab** parity with the 2D
  visualizer. [components/Viz3DScene.tsx](../components/Viz3DScene.tsx) now draws a faint M³ lattice
  on the floor + two corner faces (via `<lineSegments>`) and thin warn-tone remainder slabs on the
  off-grid far faces; [lib/calculations.ts](../lib/calculations.ts) gained per-axis remainders on
  `layoutRoom3D` (`lengthRemainder`/`widthRemainder`/`heightRemainder`) + a shared pure
  `interiorModuleLines(dimension, m)` helper (one tested rule for both the 2D grid and 3D lattice).
  Line count capped by `MAX_LATTICE_DIVISIONS = 40` (NFR-PERF-03). Added **`FR-VIZ3D-07`** to
  [docs/PDR.md](PDR.md). Suite **107/107**, build ✓, tsc ✓, lint clean. Review **all-clean** (0
  crit/high/med; 1 low CR-001 coverage **resolved in-loop** by the `interiorModuleLines` extraction +
  5 tests). QA 1/1 implemented, tested & spec-compliant (canvas render manual per ADR-0001).
  **NFR-BUNDLE-01 re-verified**: `@react-three`/`three` still imported only in `Viz3DScene.tsx`; no
  new dependency. Archived to
  [openspec/changes/archive/2026-07-04-viz-3d-grid/](../openspec/changes/archive/2026-07-04-viz-3d-grid/);
  spec synced to `openspec/specs/viz-3d-grid/spec.md` (17/17 specs valid).
  (Prior: shipped 16 `brand-logo` — **the full 16-capability iteration-2 backlog.**)
- **Superseded — the 2026-07-03 "Shipped capability 16 `brand-logo`" note below.**
  [components/Logo.tsx](../components/Logo.tsx) is a Server Component rendering the DESIGN §7
  golden-ratio mark verbatim (nested φ:1 rects + golden-spiral arcs, `currentColor`, transparent,
  `aria-hidden`); [components/Shell.tsx](../components/Shell.tsx) swaps the header placeholder for
  `<Logo className="shrink-0 text-accent">` (so `currentColor` resolves to `--accent` and inverts in
  dark); [app/icon.svg](../app/icon.svg) is the auto-registered favicon (same mark, explicit accent
  hex since `currentColor` has no CSS context in a favicon). No new dependency; no engine/state/i18n
  change. Runtime-verified: the header renders the SVG (placeholder gone) and `/icon.svg` serves 200
  with `<link rel="icon">` auto-injected. Archived to
  [openspec/changes/archive/2026-07-03-brand-logo/](../openspec/changes/archive/2026-07-03-brand-logo/);
  requirements synced to `openspec/specs/brand-logo/spec.md`.
  (Prior: shipped 1–11 **Epic A complete**, 12–15 Epic B visualizers/mode.)
- **Status: 🎉 ALL 17 CAPABILITIES SHIPPED — the full backlog (Epic A + Epic B iter 2 + iter 3) is
  complete.** Every change in [docs/CAPABILITIES.md](CAPABILITIES.md) §3 is archived under
  `openspec/changes/archive/` with its spec synced to `openspec/specs/` (17/17 specs valid); suite
  **107/107**, build ✓, tsc ✓, lint ✓. Per-capability detail below.
  - Done — **`viz-3d-grid`** (FR-VIZ3D-07; re-verifies NFR-BUNDLE-01/TC-STACK-04/NFR-PERF-03/
    NFR-A11Y-03/BC-VALUE-01): faint M³ lattice + signed remainder slabs in the 3D scene, for 2D↔3D
    parity. `layoutRoom3D` per-axis remainders + shared pure `interiorModuleLines`; `Viz3DScene`
    `<lineSegments>` lattice (floor + 2 corner faces) + far-face slabs, capped at
    `MAX_LATTICE_DIVISIONS = 40`. Suite **107/107** (+8 tests), build ✓, tsc ✓, lint clean. Review
    **all-clean** from all 3 fresh Checkers (0 crit/high/med); 1 low (CR-001, coverage) **resolved
    in-loop** by extracting `interiorModuleLines` (+5 tests). QA 1/1 implemented, tested (pure grid
    math) & spec-compliant; canvas render manual per ADR-0001. NFR-BUNDLE-01 re-verified — three.js
    still confined to the lazy `Viz3DScene` chunk; no new dependency.
  - Done — **`brand-logo`** (FR-LOGO-01): golden-ratio header mark (`Logo.tsx`, `currentColor`) +
    `app/icon.svg` favicon. Suite 99/99 (no engine change), build ✓, tsc ✓, lint ✓. Review
    **all-clean (0 findings)**. QA 1/1 implemented & spec-compliant, 0/1 automated (static SVG —
    no unit test possible, ADR-0001; runtime-verified). No new dependency.
  - Done — **`viz-3d`** (FR-VIZ3D-01/02/03/04/05/06, NFR-BUNDLE-01, NFR-PERF-03, TC-STACK-04,
    NFR-A11Y-03): lazy 3D visualizer + WebGL fallback + pure `layoutRoom3D`. Suite **99/99** (+5
    tests), build ✓, tsc ✓, lint ✓. Review **1 medium + 5 low (0 crit/high)** — **3 resolved
    in-loop**, 2 acknowledged. QA 10/10 implemented & spec-compliant, 3/10 automated (geometry;
    canvas/controls/fallback manual per ADR-0001). **Review catch (CR-001, medium):** the 3D
    highlight was a hardcoded **orange** contradicting the blue `--accent` + the 2D viz — fresh
    Checkers caught what my build check missed; **resolved** by sampling the resolved `--accent`
    from CSS (re-samples on theme). Also fixed: cube-clamp for sub-module rooms (CR-003), dead
    fade-in ref (CR-002/SC-001). **Acknowledged (low):** `NFR-PERF-03` has no explicit room cap — a
    hard cap belongs in `room-input`/app-state (documented). `NFR-BUNDLE-01` proven by the build
    chunk split; the R3F deps were pre-installed (no dependency added).
  - Done — **`viz-2d`** (FR-VIZ2D-01/02/03/04/05, NFR-PERF-03, BC-VALUE-01): read-only 2D SVG
    visualizer + pure `layoutRoom2D`. Suite **94/94** (+5 tests), build ✓, tsc ✓, lint ✓. Review
    **clean** (0 crit/high/med, 1 low resolved — a doc-accuracy note that `griddraw` was claimed but
    only `cellpulse` is applied). QA 7/7 implemented & spec-compliant, 3/7 automated (`layoutRoom2D`;
    SVG/animation/responsiveness manual per ADR-0001, runtime-verified). **Notes:** the visualizer
    tiles `floor(dim/m)` whole cells (spec-mandated by `FR-VIZ2D-02`'s text — distinct from
    grid-fit's `round`); `FR-VIZ2D-04`'s tween/animate-in are unimplemented `MAY` clauses (a `Should`
    met by `cellpulse`). Rendered in 2D mode only; the 3D scene is `viz-3d` (15).
  - Done — **`mode-toggle`** (FR-MODE-01/02/03/04/05, BC-PRIVACY-01, NFR-A11Y-03): 2D⇄3D toggle +
    mode-driven module suggestion + `resyncModule` funnel. Suite **89/89** (+7 tests), build ✓, tsc
    ✓, lint ✓. Review **all-clean (0 findings)** from all three Checkers. QA 7/7 implemented &
    spec-compliant, 4/7 automated (state logic; toggle DOM/field-hiding/a11y manual per ADR-0001 —
    runtime-verified both surfaces). **Note:** the QA subagent hit a session limit before writing
    artifacts; all three (trajectory-eval + matrix rows + test plan) were completed by the main loop
    (same recovery as apartment-input). The band diagram is now gated on `mode === '3d'`. The
    "active visualizer changes" clause of FR-MODE-04 lands with `viz-2d`/`viz-3d` (14/15).
  - Done — **`module-2d`** (FR-MODULE2D-01/02, first of Epic B): pure `suggestModule2D(rooms)` +
    the shared `suggestionFromGcd` extraction. Suite **82/82** (+5 tests), build ✓, tsc ✓, lint ✓.
    Review **all-clean (0 findings)** from all three Checkers. QA 2/2 implemented, tested &
    spec-compliant (pure engine, fully automated — no UI). `FR-MODULE2D-02`'s selection/mode wiring
    is honestly deferred to `mode-toggle` (13); the data-contract half is delivered + tested here.
    Nothing imports `suggestModule2D` yet, so the change is inert at runtime until 13.
  - Done — **`walkway`** (FR-WALK-01/02/03/04, BC-WALK-01): per-room walkway-clearance block +
    `walkwayMeterBars`. Suite **77/77** (+3 tests), build ✓, tsc ✓, lint ✓. Review **all-clean
    (0 findings)** from all three Checkers. QA 5/5 implemented & spec-compliant, 4/5 automated
    (`computeWalkways`/`rateWalkway`/`walkwayMeterBars` + a module-independence test; block DOM
    manual per ADR-0001). `oppositeDepth` (a `Could`) intentionally not wired. **This is the last
    per-room block — Epic A is complete.**
  - Done — **`grid-fit`** (FR-GRID-01/02/03/04/05, NFR-A11Y-02): per-room grid-fit block +
    `gridRoundDirection`. Suite **74/74** (+2 tests), build ✓, tsc ✓, lint ✓. Review **all-clean
    (0 findings)** from all three Checkers. QA 6/6 implemented & spec-compliant, 4/6 automated
    (`computeRoomGrid` + `gridRoundDirection`; block DOM + badge a11y manual per ADR-0001). **Notes:**
    (a) corrected a reversed `RoomGrid` doc comment vs `FR-GRID-03` (comment-only; values unchanged);
    (b) shipped kitchen signs are the engine's authoritative `+300 / −300` — DESIGN §6.3's table
    lists them reversed (flagged for a docs-pass). The quality badge discharges the grid-badge part
    of `NFR-A11Y-02` (label+glyph); the sub-AA `--faint`/accent token issue from `design-system`
    stays the open part.
  - Done — **`golden-ratio`** (FR-GOLD-01/02/03/04): per-room card scaffold + golden-split block.
    Suite **72/72** (+3 tests), build ✓, tsc ✓, lint ✓. Review **all-clean** (0 crit/high/med, 1
    low resolved — golden split computed once in `PerRoomResults` and passed to `GoldenSplitBlock`
    as props, single source of truth). QA 4/4 implemented, tested & spec-compliant (`longerWall`/
    `isApproximateFit`/`computeGoldenSplit` unit-tested — `FR-GOLD-03` now has a tested home,
    closing change 1's manual-only gap; card DOM manual per ADR-0001). The per-room card is the
    shared scaffold for grid-fit (10) + walkway (11).
  - Done — **`vertical-bands`** (FR-VERT-01/02/03/04/05/06, NFR-RESP-01): height-band SVG + pure
    `layoutBandDiagram`. Suite **69/69** (+8 layout tests), build ✓, tsc ✓, lint ✓. Review found
    **1 high, resolved in-loop** — CR-001: the `200×400` viewBox clipped right-side band-name/
    opening labels; fixed by adopting DESIGN §6.2's **`360×470`** (satisfies both `FR-VERT-05`
    responsive contract and `FR-VERT-06` legibility). security + spec-compliance clean. QA 7/7
    implemented & spec-compliant, 5/7 automated (layout logic; viewBox/responsiveness manual per
    ADR-0001). **Two documented deltas:** (a) shipped `viewBox` is `360×470`, not the PDR
    `FR-VERT-05` literal `200×400` — flagged for a docs-pass reconciliation; (b) the diagram renders
    unconditionally (DESIGN §6.2 marks it "3D-mode only") until `mode-toggle` (13) adds mode state.
  - Done — **`module-summary`** (FR-MODULE-02/03/04/05, BC-MODULE-01): read-only Module Summary
    card + pure `computeModuleRuler`/`moduleWarning`. Suite **61/61** (+5 engine tests), build ✓,
    tsc ✓, lint ✓. Review **all-clean** (0 crit/high/med, 1 low resolved). QA 5/5 implemented &
    spec-compliant, 2/5 automated (ruler + warning **logic**; hero/hint/chips render manual per
    ADR-0001). **Note:** the `FR-MODULE-05` warning banner is **dormant-by-data** — the current
    `STANDARD_MODULES` (100…700) can't reach the `>1000`/`<100` bounds, so it never fires through
    the UI, but the logic is wired + unit-tested at its boundaries and goes live with zero code
    change if the constant is revised (ADR-0002 / OQ-01). A documenting comment on `moduleWarning`
    marks it dormant-by-data, not dead code (review CR-001/SC-001 resolution).
  - Done — **`room-input`** (FR-ROOM-01/02/03/04): dynamic room list (start with one room,
    add/remove-except-last, per-room name 1–50 + length/width 500–15000 mm) wired to `Calculator`
    state via pure CRUD reducers. Suite **56/56** (+6 room-reducer tests), build ✓, tsc ✓, lint ✓.
    Review **clean** (0 crit/high/med, 3 low): **resolved** the room-name label to be visible (was
    `sr-only`, flagged by both code + spec reviewers as CR-002/SC-001); **deferred by design** the
    `NumberField`/`InlineError` dedup between `RoomList` and `ApartmentForm` (CR-001 — YAGNI until a
    3rd field consumer; extracting now would churn the archived apartment-input); **acknowledged
    cosmetic** the duplicate default names after a removal (CR-003 — DESIGN §5.3 count-based
    `Room N`, name is user-editable + validated). QA 4/4 implemented & spec-compliant, 3/4 automated
    (CRUD + bounds via reducers/`isRoomValid`; FR-ROOM-04 form DOM manual per ADR-0001).
  - Done — **`apartment-input`** (FR-APT-01/02/03/04/05, archived 2026-07-03): ceiling/opening/module
    fields + inline validation, wired to `Calculator` via pure reducers. Review **clean** (0
    crit/high/med, 2 low resolved: CR-001 empty-field→NaN coercion, CR-002 hint `aria-describedby`).
    QA 5/5 implemented & spec-compliant, 3/5 automated.
  - Done — **`app-shell`** (archived 2026-07-03): server page + single `Calculator` client
    boundary/state owner, `LanguageProvider` mounted, responsive header + grid, validity-gated
    results region, `ThemeToggle`. NFR-RESP-01 / NFR-A11Y-01 partial (band SVG arrives with later
    capabilities). **Both input slots filled + the results region now shows the Module Summary;**
    bands/per-room/visualizer sections fill the rest (changes 8–15).
  - Done — **`i18n`** (archived 2026-07-03): context + `t()`, flat EN/UA dictionaries, live
    `LanguageToggle`, never-translate calc labels. `LanguageProvider` is mounted by `app-shell`.
  - Done — **`design-system`** (archived 2026-07-03): OKLCH token foundation, Inter/JetBrains
    Mono, dark mode. **NFR-A11Y-02 partial** (see next steps).
  - Done — **`calculation-engine`** (archived 2026-07-03): the pure engine. Runner is
    `node --test lib/*.test.ts` (native TS type-stripping; `tsx` dropped,
    [ADR-0001](adr/0001-test-runner.md) amended).
  - In progress — none.
  - Blocked — none. `OQ-01` still open with the SME (de-risked by ADR-0002).
- **Next steps:** **🎉 The full 17-capability backlog is shipped** — Epic A (trustworthy bilingual
  calculator: inputs → module summary → bands + per-room golden/grid/walkway) + Epic B iter 2 (2D⇄3D
  mode, both read-only visualizers, brand logo) + iter 3 (`viz-3d-grid`: 3D module lattice for 2D↔3D
  parity). No capabilities remain in [docs/CAPABILITIES.md](CAPABILITIES.md) §3. Every change passed
  the advisory `ship-capability` loop; suite 107/107, build ✓, tsc ✓, lint ✓. **What's left is
  optional/triage-only, none blocking:**
  - **SME open questions** (gate content/constants, not code): `OQ-01` authoritative
    `STANDARD_MODULES` (de-risked by ADR-0002 — one-line change), `OQ-02` editable furniture depths,
    `OQ-04` default room dims/names. Revisit with the SME; each is an additive constant/input edit.
  - **`room-input` CR-001 — closed (won't-extract):** no change ever added a 3rd editable
    number-field consumer, so the shared-`NumberField` extraction stays intentionally un-done (only
    `ApartmentForm` + `RoomList`). Drop unless a future feature adds a numeric input.
  - **`viz-3d` NFR-PERF-03 (acknowledged low):** no explicit room cap on the 3D scene; a hard cap
    belongs in `room-input`/app-state if a room-count ceiling is ever exercised.
  - **Possible follow-ups** (not in scope, would be new changes): an automated a11y/visual/DOM test
    layer (ADR-0001 left all component rendering manual), and resolving the `design-system`
    NFR-A11Y-02 sub-AA token finding below (a design-source decision).
  **Low findings deferred from earlier changes** (in the archived `review-findings.json`s), for
  triage — none block the shipped product:
  - `room-input` **CR-001**: `NumberField`/`InlineError` are duplicated in `RoomList` and
    `ApartmentForm`. Extract a shared field component **when a 3rd consumer appears** — deferred by
    design (YAGNI; avoids churning the archived `apartment-input`). *(module-summary added no new
    number field, so still 2 consumers.)*
  - `module-summary` **CR-001/SC-001** (resolved): the `FR-MODULE-05` warning banner is
    dormant-by-data under the current `STANDARD_MODULES`; a code comment marks it as such. Becomes
    live if `OQ-01` revises the constant to include an out-of-range value — no code change needed.
  - `room-input` **CR-003**: `addRoom` names via `rooms.length + 1`, so default names can repeat
    after a removal (cosmetic; ids stay unique, name is user-editable + validated). Revisit with
    `OQ-04` (default room dims/names) if the SME wants distinct auto-names.
  - **Open low findings for triage** (in the archived `review-findings.json`s):
  - `design-system` **CR-001 → NFR-A11Y-02 partial**: `--faint` (~2.7:1) and
    `--accent`-on-`--bg` (~3.7:1) are **sub-AA** — a verbatim port of the frozen DESIGN §3
    tokens. Body/label/muted text passes AA in both themes. **Constraint:** downstream
    components must not use `--faint`/accent for meaningful small text without a non-color
    cue or larger size; a real fix is a **design-source decision** (recolor the token in
    DESIGN §3 + `globals.css`), not something to mutate silently. See
    [docs/qa/test-plans/design-system.md](qa/test-plans/design-system.md).
  - `calculation-engine`: **CR-003** (`"type":"module"` to silence the `node --test`
    warning), **SEC-001** (optional `m > 0` guard), and an unwritten **NFR-PERF-02** <16 ms
    benchmark test ([docs/qa/test-plans/calculation-engine.md](qa/test-plans/calculation-engine.md)).
- **Notes:** design-system reconciled DESIGN's `html[data-theme]` switch with TC-STACK-03's
  "Tailwind `dark:` variants" via `@custom-variant dark ([data-theme="dark"] &)` — one
  selector drives both the token swap and `dark:` utilities. Fonts self-host through
  `next/font` (no runtime Google Fonts request — BC-PRIVACY-01 clean).
  PDR reconciled to match the shipped (correct) engine and DESIGN/SKILL:
  **FR-VERT-02** `round → floor(ceiling/m)` (round yields a negative `topRemainder`);
  **FR-GRID-03** to the signed nearest-distance formula `d − round(d/m)·m`; fixed a
  kitchen-row sign typo in the `calculation-logic` skill. `recommendation` from
  `computeWalkways` is now a **locale-independent key** (`walkway.<rating>`), not English
  prose, so the pure engine stays language-agnostic for the bilingual UI (resolves review
  CR-001). `moduleRuler` (FR-MODULE-04) was removed as scope leak — it belongs to change 7
  `module-summary`. Open tangent still parked: soft "suggestion is N mm off" hint when
  `residual` > ¼M (possible FR-MODULE-05 refinement, decide with SME alongside OQ-01).

## Source Of Truth

1. `AGENTS.md` — project agent rules.
2. `docs/CURRENT_STATE.md` — this handoff.
3. `docs/PDR.md` — canonical FR/NFR/TC/BC requirements.
4. `docs/PRODUCT-BRIEF.md` — product narrative.
4a. `docs/superpowers/specs/` — design specs (apartment calculator; 2D/3D mode + logo).
5. `docs/CAPABILITIES.md` — OpenSpec change sequence and order.
6. `openspec/project.md` + `openspec/specs/` — accepted behavior.
7. `docs/adr/` — architecture decisions.
8. `docs/qa/` — QA proof pack and recordings.
