# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-03T13:45:00+03:00
- **Last action:** **Shipped capability 7 `module-summary`** end-to-end via the `ship-capability`
  advisory loop. The **results region now opens with the Module Summary** — the linchpin that
  surfaces the *active module* every downstream result reads (`FR-MODULE-02`, `BC-MODULE-01`):
  [components/ModuleSummary.tsx](../components/ModuleSummary.tsx) renders a two-pane card (hero
  `M = {state.module}` + `GCD(ceiling,opening) = rawGcd → snapped` hint with `residual`/
  `alternatives` chips), a `role="alert"` warning banner, and the ¼M…4M ruler table (labels never
  translated, use prose localized). It is **read-only** — the module `<select>` stays in
  `ApartmentForm`. [lib/calculations.ts](../lib/calculations.ts) gained pure
  `computeModuleRuler(m)`/`moduleWarning(m)` + `RULER_FACTORS`;
  [components/Shell.tsx](../components/Shell.tsx) renders it as the first result section. Archived
  to [openspec/changes/archive/2026-07-03-module-summary/](../openspec/changes/archive/2026-07-03-module-summary/);
  4 requirements synced to `openspec/specs/module-summary/spec.md`.
  (Prior: shipped 1 `calculation-engine`, 2 `design-system`, 3 `i18n`, 4 `app-shell`,
  5 `apartment-input`, 6 `room-input`.)
- **Status:**
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
- **Next steps:** Continue [docs/CAPABILITIES.md](CAPABILITIES.md) §3 order — the four result
  sections now **fan out in parallel** (each needs 7 ✓ + 1 ✓): **8 `vertical-bands`** (height-band
  SVG, `floor(ceiling/m)` bands + `topRemainder` + off-grid opening marker — `FR-VERT-*`,
  `NFR-RESP-01`), **9 `golden-ratio`** (per-room longer-wall split, exact/½M-snapped + approximate-
  fit flag — `FR-GOLD-*`), **10 `grid-fit`** (modules×modules, signed remainders, quality badge —
  `FR-GRID-*`, `NFR-A11Y-02`), **11 `walkway`** (fixed-mm clearance ratings — `FR-WALK-*`,
  `BC-WALK-01`). 9/10/11 also read the room list; the engine functions
  (`computeVerticalBands`/`computeGoldenSplit`/`computeRoomGrid`/`computeWalkways`) already shipped
  in change 1, so these are thin presentation layers. `vertical-bands` (8) is the natural next pick
  (3D-only, ceiling-driven, no room dependency).
  **Low findings deferred from earlier changes** (in the archived `review-findings.json`s), worth
  folding into a later change rather than a standalone fix:
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
