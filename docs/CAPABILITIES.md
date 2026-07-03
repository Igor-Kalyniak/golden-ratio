# Capability Plan — OpenSpec change sequence

Last updated: 2026-07-03

This document splits [docs/PDR.md](PDR.md) into **capabilities**, each implemented as
one **OpenSpec change**, and fixes the **order of implementation**. It is the bridge
between the requirement IDs in the PDR and the changes you scaffold with
`openspec new change`.

- **PDR** = *what* to build and *how to verify it* (the `FR-*`/`NFR-*`/`TC-*`/`BC-*` IDs).
- **This plan** = *in what order* and *as which OpenSpec change*.
- **Each OpenSpec change** = proposal + design + tasks for one capability, traced back
  to the PDR IDs listed in its card below.

> Scope note: **Changes 1 `calculation-engine`, 2 `design-system`, 3 `i18n`, 4 `app-shell`,
> 5 `apartment-input`, 6 `room-input`, 7 `module-summary`, 8 `vertical-bands`, 9 `golden-ratio`, 10 `grid-fit`, and 11 `walkway` are shipped — **Epic A (the core calculator, changes 1–11) is complete**; **Epic B is underway — 12 `module-2d` + 13 `mode-toggle` + 14 `viz-2d` + 15 `viz-3d` shipped; only 16 `brand-logo` remains** (2026-07-03). Change 1: [lib/calculations.ts](../lib/calculations.ts)
> + its `node:test` suite; runner is `node --test lib/*.test.ts` (Node **native TS
> type-stripping** — the `tsx` loader from [ADR-0001](adr/0001-test-runner.md) was **dropped
> as redundant** on Node 22.22, ADR amended 2026-07-03). Change 2:
> [app/globals.css](../app/globals.css) — DESIGN §3 OKLCH token system (light/dark, `@theme
> inline`, motion, focus, `--header-h`) and [app/layout.tsx](../app/layout.tsx) self-hosts
> Inter + JetBrains Mono via `next/font`. Change 3:
> [locales/en.json](../locales/en.json)+[ua.json](../locales/ua.json), pure
> [lib/i18n.ts](../lib/i18n.ts), [lib/i18n-context.tsx](../lib/i18n-context.tsx)
> (`LanguageProvider`/`useI18n`), [components/LanguageToggle.tsx](../components/LanguageToggle.tsx).
> Change 4: [app/page.tsx](../app/page.tsx) (Server) → [components/Calculator.tsx](../components/Calculator.tsx)
> (single client boundary + state owner, mounts the provider) → [components/Shell.tsx](../components/Shell.tsx)
> (responsive header + two-column layout + validity-gated results) + [components/ThemeToggle.tsx](../components/ThemeToggle.tsx)
> + pure [lib/app-state.ts](../lib/app-state.ts). Change 5:
> [components/ApartmentForm.tsx](../components/ApartmentForm.tsx) fills the apartment slot
> (ceiling/opening/module + inline validation) and `lib/app-state.ts` gained `moduleTouched`
> + the `withCeiling`/`withOpening`/`withModule` reducers (module follows the suggestion until
> overridden). Change 6: [components/RoomList.tsx](../components/RoomList.tsx) fills the rooms
> slot (add/remove/edit rooms + inline validation) and `lib/app-state.ts` gained the
> `addRoom`/`removeRoom`/`updateRoom` reducers + `newRoomId`. Change 7:
> [components/ModuleSummary.tsx](../components/ModuleSummary.tsx) opens the results region (hero
> `M = value` + `GCD → snapped` hint + ¼M…4M ruler + dormant warning banner) and
> `lib/calculations.ts` gained `computeModuleRuler`/`moduleWarning` + `RULER_FACTORS`. Change 8:
> [components/BandDiagram.tsx](../components/BandDiagram.tsx) adds the height-band SVG (responsive
> `viewBox 0 0 360 470`, full + partial bands, mm marks, band names, opening on/off-grid marker)
> and `lib/calculations.ts` gained the pure `layoutBandDiagram` + band-layout types. Change 9:
> [components/PerRoomResults.tsx](../components/PerRoomResults.tsx) +
> [components/GoldenSplitBlock.tsx](../components/GoldenSplitBlock.tsx) add the per-room card
> scaffold + golden-split block, and `lib/calculations.ts` gained `longerWall`/`isApproximateFit`.
> Change 10:
> [components/GridFitBlock.tsx](../components/GridFitBlock.tsx) adds the grid-fit block (nL×nW,
> signed remainders + round-direction annotation, accessible quality badge) as the per-room card's
> second block, and `lib/calculations.ts` gained `gridRoundDirection`. The **results region now
> shows the Module Summary + band diagram + per-room golden split + grid fit**. Change 11:
> [components/WalkwayBlock.tsx](../components/WalkwayBlock.tsx) adds the walkway-clearance block
> (three furniture presets, fixed-mm ratings + bar meter) as the per-room card's third block, and
> `lib/calculations.ts` gained `walkwayMeterBars`. **The per-room card and Epic A (the core
> calculator) are now complete** — full input surface + module summary + band diagram + per-room
> golden/grid/walkway results. **Epic B** (iteration 2 — visualizers + logo) is underway: change 12
> [`suggestModule2D`](../lib/calculations.ts) (the pure 2D-mode module derivation) is shipped, and
> change 13 [components/ModeToggle.tsx](../components/ModeToggle.tsx) wires the 2D⇄3D toggle — 2D
> hides the height fields + band diagram and sources the module from room dims via
> `moduleSuggestion`/`withMode` in [lib/app-state.ts](../lib/app-state.ts). Change 14:
> [components/Viz2D.tsx](../components/Viz2D.tsx) adds the read-only 2D SVG plan visualizer
> (to-scale room rects, faint M×M grid, remainder strip, one highlighted `cellpulse` cell) rendered
> in 2D mode, and `lib/calculations.ts` gained the pure `layoutRoom2D`. Change 15:
> [components/Viz3DScene.tsx](../components/Viz3DScene.tsx) (the heavy `@react-three/fiber` canvas —
> boxes per room, opening band, one M³ cube, OrbitControls) + [components/Viz3D.tsx](../components/Viz3D.tsx)
> (thin wrapper: WebGL detect + `dynamic({ssr:false})` + `Viz2D` fallback) add the lazy 3D
> visualizer; `lib/calculations.ts` gained the pure `layoutRoom3D`. **Three.js is confined to the
> lazy `Viz3DScene` chunk** — the 2D path + first paint carry no 3D dep (NFR-BUNDLE-01 verified).
> **Only 16 `brand-logo` remains.** `TC-STACK-01` is `accepted`; changes 1–15 are `shipped`;
> only 16 is `proposed`.

---

## 1. How this maps to OpenSpec

One **capability = one OpenSpec change**. When you pick up a change, run the proposal
flow (`/opsx:propose` or `openspec new change <id>`) using the **kickoff** line in its
card, then implement with `/opsx:apply`, then `/opsx:archive`.

Two decomposition rules keep the mapping clean:

1. **Logic vs. presentation split.** The pure math lives in one foundational change
   (`calculation-engine`) that owns the **function contracts** (`suggest*`/`compute*`
   signatures, returned fields, numeric correctness, `NFR-PURE-01`/`NFR-TEST-01`). Each
   later capability change owns the **presentation/interaction** of those values. Where a
   single `FR-*` spans both, its card annotates `(engine)` vs `(ui)`.
2. **Cross-cutting constraints are not standalone changes.** `NFR-*`, `TC-*`, and `BC-*`
   are verified *inside* the capability changes they touch — see the coverage matrix in
   §6.

---

## 2. Capability → change map

| # | OpenSpec change id | Capability (PDR) | Epic | MoSCoW |
|---|--------------------|------------------|------|--------|
| 1 | `calculation-engine` | (cross-capability pure math) | A · Core | Must |
| 2 | `design-system` | (shell foundation) | A · Core | Must |
| 3 | `i18n` | `i18n` | A · Core | Must |
| 4 | `app-shell` | Shell & layout | A · Core | Must |
| 5 | `apartment-input` | `apartment-input` | A · Core | Must |
| 6 | `room-input` | `room-input` | A · Core | Must |
| 7 | `module-summary` | `module` | A · Core | Must |
| 8 | `vertical-bands` | `vertical-bands` | A · Core | Must |
| 9 | `golden-ratio` | `golden-ratio` | A · Core | Must |
| 10 | `grid-fit` | `grid-fit` | A · Core | Must |
| 11 | `walkway` | `walkway` | A · Core | Should |
| 12 | `module-2d` | `module-2d` | B · Visualization | Must (iter 2) |
| 13 | `mode-toggle` | `mode-toggle` | B · Visualization | Must (iter 2) |
| 14 | `viz-2d` | `viz-2d` | B · Visualization | Must (iter 2) |
| 15 | `viz-3d` | `viz-3d` | B · Visualization | Should (iter 2) |
| 16 | `brand-logo` | `brand` | B · Visualization | Must (iter 2) · parallelizable |

---

## 3. Recommended implementation order

This is the headline answer. Build **top to bottom**; items at the same indent are
independent and may be parallelized.

```
Epic A — Core Calculator (MVP)
  Phase 0 · Foundations        1. calculation-engine ─┐ (parallel)
                               2. design-system       │
                               3. i18n               ─┘
                               4. app-shell           (needs 2 + 3)
  Phase 1 · Inputs             5. apartment-input      (needs 4 + 1)
                               6. room-input           (needs 4)
  Phase 2 · Module linchpin    7. module-summary       (needs 5 + 1)
  Phase 3 · Result sections    8. vertical-bands  ─┐
                               9. golden-ratio     │ (parallel, each needs 7 + 1)
                              10. grid-fit         │
                              11. walkway         ─┘ (needs 6 + 1)

Epic B — Mode toggle + Visualizers + Logo (iteration 2)
                              12. module-2d            (needs 1)
                              13. mode-toggle          (needs 5 + 6 + 7 + 12)
                              14. viz-2d               (needs 13 + 12)
                              15. viz-3d               (needs 14)
                              16. brand-logo           (needs 4 — parallelizable any time)
```

**Why this order**

- **Pure math first (1).** `calculation-engine` has no UI and is 100% unit-testable
  (`NFR-PURE-01`/`NFR-TEST-01`). Proving the hardest part — GCD module suggestion,
  golden split, grid fit, bands — before any pixels exist de-risks everything downstream
  and lets the UI changes stay thin.
- **Frame before content (2–4).** Nothing renders a string without `i18n`, and nothing
  renders legibly without `design-system`; both feed `app-shell`, which establishes the
  single `'use client'` boundary (`TC-CLIENT-01`) and the state owner (`TC-ARCH-01`).
- **Inputs before results (5–6).** Results only render when inputs are valid
  (`FR-SHELL-04`); the inputs produce the state that every result reads.
- **Module is the linchpin (7).** Every downstream result uses the *active module*
  (`FR-MODULE-02`), so it must exist and be selectable before bands/golden/grid render.
- **Result sections fan out (8–11).** Once the active module + inputs exist, the four
  result sections are mutually independent and can be built in any order or in parallel.
- **Visualization is additive (12–16).** Iteration 2 layers a mode toggle and read-only
  visualizers on top of a working calculator. `module-2d` is a pure engine extension;
  `viz-2d` must precede `viz-3d` because the 2D view is the 3D fallback
  (`FR-VIZ3D-06`/`NFR-BUNDLE-01`). `brand-logo` depends only on the header slot and can
  land any time after `app-shell`.

---

## 4. Dependency graph

```mermaid
graph TD
  CE[1 calculation-engine]
  DS[2 design-system]
  I18N[3 i18n]
  SH[4 app-shell]
  AI[5 apartment-input]
  RI[6 room-input]
  MS[7 module-summary]
  VB[8 vertical-bands]
  GR[9 golden-ratio]
  GF[10 grid-fit]
  WK[11 walkway]
  M2[12 module-2d]
  MT[13 mode-toggle]
  V2[14 viz-2d]
  V3[15 viz-3d]
  LOGO[16 brand-logo]

  DS --> SH
  I18N --> SH
  SH --> AI
  SH --> RI
  AI --> MS
  CE --> MS
  CE --> AI
  MS --> VB
  MS --> GR
  MS --> GF
  RI --> GR
  RI --> GF
  RI --> WK
  CE --> VB
  CE --> GR
  CE --> GF
  CE --> WK
  CE --> M2
  AI --> MT
  RI --> MT
  MS --> MT
  M2 --> MT
  MT --> V2
  M2 --> V2
  V2 --> V3
  SH --> LOGO
```

---

## 5. Per-change cards

Each card lists the PDR IDs the change is accountable for, its dependencies, the reason
for its slot in the order, the signal that it's done, and the OpenSpec kickoff command.

### Epic A — Core Calculator (MVP)

#### 1. `calculation-engine` — pure proportioning math *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-calculation-engine/](../openspec/changes/archive/2026-07-03-calculation-engine/);
  spec synced to `openspec/specs/calculation-engine/spec.md`. 25 `node:test` cases green;
  review 0 critical/0 high; QA 19/19 implemented & spec-compliant, 16/19 auto-tested.
- **Covers:** `FR-MODULE-01`, `FR-VERT-01/02/03/04` (engine), `FR-GOLD-01/02/03` (engine),
  `FR-GRID-01/02/03/04` (engine), `FR-WALK-01/02/03` (engine); `NFR-PURE-01`,
  `NFR-TEST-01`, `NFR-PERF-01`, `NFR-PERF-02`.
- **Delivers:** `lib/calculations.ts` — `STANDARD_MODULES`, shared types, validation
  bounds, snapping helpers, `suggestModule`, `computeVerticalBands`,
  `computeGoldenSplit`, `computeRoomGrid`, `computeWalkways`; plus the test runner
  (Node `node:test`, native TS type-stripping — `tsx` dropped, [ADR-0001](adr/0001-test-runner.md)
  amended) and the unit suite (normal, boundary, edge cases: coprime heights, variable band
  counts, off-grid openings, 1 mm-short dimensions, snap residuals).
- **Decisions baked in (from design-explore):**
  - **Test runner** — Node `node:test` run directly via native TS type-stripping
    (`node --test lib/*.test.ts`); the `tsx` loader was dropped as redundant on Node 22.22
    ([ADR-0001](adr/0001-test-runner.md) amended 2026-07-03). No test dependency added.
  - **`STANDARD_MODULES` is one swappable constant** and every snap goes through a single
    helper; `residual` is always returned and always surfaced so a poor suggestion is
    visible, never silent ([ADR-0002](adr/0002-standard-modules-swappable-constant.md)).
    `OQ-01` (the authoritative values) stays open but does **not** block this change —
    a later revision is a one-line constant + fixture edit.
- **Depends on:** nothing.
- **Why here:** highest-leverage, lowest-risk, no UI — proves the numbers first. Maps to
  the `calculation-logic` skill and `DESIGN.md` §10/§12/§13.
- **Done when:** every function returns the worked-example numbers and the suite is green;
  zero framework imports in the file (`NFR-PURE-01`); `STANDARD_MODULES` defined once and
  `residual` surfaced ([ADR-0002](adr/0002-standard-modules-swappable-constant.md)).
- **Kickoff:** `openspec new change calculation-engine`

#### 2. `design-system` — visual foundation *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-design-system/](../openspec/changes/archive/2026-07-03-design-system/);
  spec synced to `openspec/specs/design-system/spec.md`. Build ✓, `eslint app/` ✓; review
  clean (0 crit/high/med, 1 low). **Caveat:** NFR-A11Y-02 is *partial* — body/label/muted
  text passes AA in both themes, but the frozen `--faint` / `--accent`-on-`--bg` tokens are
  sub-AA (CR-001), tracked as a downstream token-usage constraint.
- **Covers:** `TC-STACK-02`, `TC-STACK-03`, `NFR-A11Y-02`.
- **Delivers:** rewrite `app/globals.css` with the OKLCH light/dark tokens, Inter /
  JetBrains Mono wiring (mono-for-numbers rule), dark-mode variants, base type scale;
  removes create-next-app boilerplate. Maps to the `design-tokens` skill, `DESIGN.md`
  §1–3/§8–9.
- **Depends on:** nothing (parallel with 1, 3).
- **Why here:** every UI change consumes these tokens; building them once avoids churn.
- **Done when:** AA contrast holds in both themes; numeric values render in mono.
- **Kickoff:** `openspec new change design-system`

#### 3. `i18n` — bilingual UA/EN plumbing *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-i18n/](../openspec/changes/archive/2026-07-03-i18n/);
  spec synced to `openspec/specs/i18n/spec.md`. Suite 34/34, build ✓, tsc ✓, lint ✓; review
  clean (0 crit/high/med, 2 low resolved). QA 4/4 implemented & spec-compliant. The
  `LanguageProvider` is not yet mounted — `app-shell` (4) mounts it and places the toggle
  (`FR-SHELL-03`).
- **Covers:** `FR-I18N-01/02/03`, `TC-I18N-01`.
- **Delivers:** `LanguageContext` (`locale` + `t(key)`), `locales/en.json` +
  `locales/ua.json` (flat dictionaries), the never-translate rule for calc labels
  (¼M, ½M, M…). Maps to the `i18n-strings` skill, `DESIGN.md` §11.
- **Depends on:** nothing (parallel with 1, 2).
- **Why here:** no user-facing string renders without `t()`; the shell needs it.
- **Done when:** all strings resolve through `t()`; switching locale re-renders live.
- **Kickoff:** `openspec new change i18n`

#### 4. `app-shell` — page shell, client boundary, layout *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-app-shell/](../openspec/changes/archive/2026-07-03-app-shell/);
  spec synced to `openspec/specs/app-shell/spec.md`. Suite 44/44, build ✓, tsc ✓, lint ✓;
  review clean (0 crit/high/med, 3 low resolved). QA 9/9 implemented & spec-compliant.
  Input column + results region are **empty slots** for changes 5–11; NFR-RESP-01 / NFR-A11Y-01
  are partial (band SVG and editable-field labels arrive with later capabilities).
- **Covers:** `FR-SHELL-01/02/03/04`, `TC-CLIENT-01`, `TC-ARCH-01`, `NFR-RESP-01`,
  `NFR-A11Y-01`, `NFR-PERF-01`.
- **Delivers:** `page.tsx` stays a Server Component; `Calculator.tsx` is the single
  `'use client'` boundary owning `ApartmentInput` state; input column + live results
  panel; responsive stacking → side-by-side; results gated on full validity
  (`FR-SHELL-04`); language toggle slot top-right. Maps to `design-layout-components`,
  `DESIGN.md` §4.
- **Depends on:** `design-system`, `i18n`.
- **Why here:** the container every input and result plugs into; defines state ownership.
- **Done when:** empty shell renders responsively in both locales; results panel hidden
  until inputs valid.
- **Kickoff:** `openspec new change app-shell`

#### 5. `apartment-input` — ceiling / opening / module fields *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-apartment-input/](../openspec/changes/archive/2026-07-03-apartment-input/);
  spec synced to `openspec/specs/apartment-input/spec.md`. Suite 50/50, build ✓, tsc ✓, lint ✓;
  review clean (0 crit/high/med, 2 low resolved). QA 5/5 implemented & spec-compliant, 3/5
  automated. `FR-APT-03`'s "module follows the suggestion until overridden, then sticky" rule is
  a pure, fully-tested reducer set (`moduleTouched` + `withCeiling`/`withOpening`/`withModule`).
- **Covers:** `FR-APT-01/02/03/04/05`.
- **Delivers:** ceiling (int, 2800, 2000–5000), opening (int, 2100, 1800–ceiling),
  module dropdown over `STANDARD_MODULES` defaulting to suggested; inline red-border +
  localized message; reactive recompute, no submit button.
- **Depends on:** `app-shell`, `calculation-engine` (bounds, `STANDARD_MODULES`).
- **Why here:** produces the apartment-level state the module engine consumes.
- **Done when:** invalid values block results and show inline errors; valid edits
  recompute synchronously.
- **Kickoff:** `openspec new change apartment-input`

#### 6. `room-input` — room list *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-room-input/](../openspec/changes/archive/2026-07-03-room-input/);
  spec synced to `openspec/specs/room-input/spec.md`. Suite 56/56, build ✓, tsc ✓, lint ✓; review
  **clean** (0 crit/high/med, 3 low — 1 resolved [visible name label], 1 deferred by design [field
  dedup, YAGNI until a 3rd consumer], 1 acknowledged cosmetic [duplicate default names after
  removal]). QA 4/4 implemented & spec-compliant, 3/4 automated (CRUD + bounds via reducers;
  FR-ROOM-04 form DOM manual per ADR-0001). Last-room-remove guard is enforced in the pure
  `removeRoom` reducer, not only the disabled UI.
- **Covers:** `FR-ROOM-01/02/03/04`.
- **Delivers:** starts with one room; "Add room" appends `{name:"Room N", length:3000,
  width:2400}`; remove any except the last; per-room name (1–50, default "Room N"), length + width
  (500–15000); inline validation matching `FR-APT-04`.
- **Depends on:** `app-shell`.
- **Why here:** produces per-room state for golden/grid/walkway; independent of inputs (5).
- **Done when:** last room cannot be removed; each field validates inline.
- **Kickoff:** `openspec new change room-input`

#### 7. `module-summary` — active module + suggestion display *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-module-summary/](../openspec/changes/archive/2026-07-03-module-summary/);
  spec synced to `openspec/specs/module-summary/spec.md`. Suite 61/61, build ✓, tsc ✓, lint ✓;
  review **clean** (0 crit/high/med, 1 low resolved). QA 5/5 implemented & spec-compliant, 2/5
  automated (ruler + warning **logic** via `computeModuleRuler`/`moduleWarning`; the hero/hint/
  chips render is manual per ADR-0001). **Note:** the `FR-MODULE-05` warning banner is
  *dormant-by-data* — with the current `STANDARD_MODULES` (100…700) a valid selection can't reach
  the `>1000`/`<100` bounds, so the banner never fires through the UI, but the logic is wired +
  unit-tested at its boundaries and goes live with zero code change if the constant is revised
  (ADR-0002 / OQ-01). The module `<select>` stays in `ApartmentForm`; this card is a read-only
  display of the same `state.module`.
- **Covers:** `FR-MODULE-02/03/04/05`, `BC-MODULE-01`. *(`FR-MODULE-01` fn from change 1.)*
- **Delivers:** active module = user selection (default `suggested`, overridable, never raw GCD);
  Module Summary (M large + `GCD → suggested` hint + `alternatives` + `residual`); ¼M…4M ruler
  table (labels never translated, use prose localized); impractical-module warning banner
  (> 1000 / < 100 mm).
- **Depends on:** `apartment-input`, `calculation-engine`.
- **Why here:** the linchpin — establishes the *active module* every result reads
  (`FR-MODULE-02`). Must precede all result sections.
- **Done when:** changing the dropdown re-derives all downstream results; suggestion hint
  and warnings show correctly.
- **Kickoff:** `openspec new change module-summary`

#### 8. `vertical-bands` — height-band diagram *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-vertical-bands/](../openspec/changes/archive/2026-07-03-vertical-bands/);
  spec synced to `openspec/specs/vertical-bands/spec.md`. Suite 69/69, build ✓, tsc ✓, lint ✓;
  review found **1 high, resolved in-loop** (see below), 0 crit/med/low. QA 7/7 implemented &
  spec-compliant, 5/7 automated (layout logic via `layoutBandDiagram`; viewBox/responsiveness
  manual per ADR-0001). **viewBox reconciled to `0 0 360 470`** (DESIGN §6.2), *not* the PDR
  `FR-VERT-05` literal `0 0 200 400`: the code-reviewer (CR-001, high) found the narrow box clipped
  the right-side band-name/opening labels, failing `FR-VERT-06` legibility; the wider DESIGN box is
  the only geometry satisfying both requirements. The PDR literal is flagged for a docs-pass
  reconciliation. Renders unconditionally for now — `mode-toggle` (13) will gate it on 3D mode.
- **Covers:** `FR-VERT-01/02/03/04/05/06`, `NFR-RESP-01`.
- **Delivers:** width-responsive `viewBox` SVG + `preserveAspectRatio`; band count
  `floor(ceiling / m)`; `topRemainder` partial band; off-grid opening marker when `openingAligned`
  is false; mm labels left / localized band names right; label condensing at high band counts. A
  pure `layoutBandDiagram` helper carries the geometry so `FR-VERT-02/03/04/06` are unit-tested.
- **Depends on:** `module-summary`, `calculation-engine`.
- **Why here:** consumes active module + ceiling; first of the fan-out result sections.
- **Done when:** 2-band and 50+-band cases both render legibly and responsively.
- **Kickoff:** `openspec new change vertical-bands`

#### 9. `golden-ratio` — per-room golden split *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-golden-ratio/](../openspec/changes/archive/2026-07-03-golden-ratio/);
  spec synced to `openspec/specs/golden-ratio/spec.md`. Suite 72/72, build ✓, tsc ✓, lint ✓; review
  **all-clean** (0 crit/high/med, 1 low resolved — golden split now computed once in
  `PerRoomResults` and passed to `GoldenSplitBlock`, single source of truth). QA 4/4 implemented,
  tested & spec-compliant (`longerWall`/`isApproximateFit`/`computeGoldenSplit` unit-tested; card
  DOM manual per ADR-0001). Introduces the **per-room card scaffold** (DESIGN §6.3, one card per
  valid room) that `grid-fit` (10) and `walkway` (11) extend with their blocks.
- **Covers:** `FR-GOLD-01/02/03/04`.
- **Delivers:** golden split applied to the **longer** wall (`longerWall = max(l,w)`); shows exact
  (0.618/0.382), ½M-snapped, and `snapOffset`; flags "approximate fit" (`isApproximateFit`:
  offset > ¼M, strict) via a text+glyph header badge.
- **Depends on:** `module-summary`, `room-input`, `calculation-engine`.
- **Why here:** independent result section; parallel with 8/10.
- **Done when:** exact + snapped values shown per room; large-offset rooms flagged.
- **Kickoff:** `openspec new change golden-ratio`

#### 10. `grid-fit` — room grid fit *(Must)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-grid-fit/](../openspec/changes/archive/2026-07-03-grid-fit/);
  spec synced to `openspec/specs/grid-fit/spec.md`. Suite 74/74, build ✓, tsc ✓, lint ✓; review
  **all-clean (0 findings)** from all three Checkers. QA 6/6 implemented & spec-compliant, 4/6
  automated (`computeRoomGrid` + `gridRoundDirection`; block DOM + badge a11y manual per ADR-0001).
  Adds the second per-room block below the golden split. **Two notes:** (a) added
  `gridRoundDirection(remainder)` and **corrected a stale `RoomGrid` doc comment** in
  `lib/calculations.ts` that had the round-direction reversed vs `FR-GRID-03` (value was always
  correct); (b) the shipped kitchen signs are the engine's authoritative `+300 / −300` — DESIGN
  §6.3's example table lists them reversed (flagged for a docs-pass).
- **Covers:** `FR-GRID-01/02/03/04/05`, `NFR-A11Y-02`.
- **Delivers:** modules × modules via `round(dimension / m)`; signed nearest-distance remainders
  with a "round up"/"round down" annotation (positive ⇒ over grid ⇒ round down); quality
  `exact`/`close`/`poor`; a quality badge carrying a text label + glyph (✓/≈/✕), never color alone.
- **Depends on:** `module-summary`, `room-input`, `calculation-engine`.
- **Why here:** independent result section; parallel with 8/9.
- **Done when:** a 1 mm-short dimension reads `close`, not `poor`; badge has a text/icon
  cue.
- **Kickoff:** `openspec new change grid-fit`

#### 11. `walkway` — clearance check *(Should)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-walkway/](../openspec/changes/archive/2026-07-03-walkway/);
  spec synced to `openspec/specs/walkway/spec.md`. Suite 77/77, build ✓, tsc ✓, lint ✓; review
  **all-clean (0 findings)** from all three Checkers. QA 5/5 implemented & spec-compliant, 4/5
  automated (`computeWalkways`/`rateWalkway`/`walkwayMeterBars` + module-independence test; block
  DOM manual per ADR-0001). The third/final per-room block — **completes the per-room card and
  Epic A**. `oppositeDepth` (a `Could`) intentionally not wired; the two-arg
  `computeWalkways(width, depth)` form is used. `BC-WALK-01` is structurally airtight:
  `WalkwayBlock` takes **no module prop**, so no code path can let M reach a rating.
- **Covers:** `FR-WALK-01/02/03/04`, `BC-WALK-01`.
- **Delivers:** three furniture-preset rows over room width — wardrobe/kitchen (600), sofa/bed
  (900), facing units (1200); `available = width − depth`; fixed mm ratings (≥ 900 comfortable,
  ≥ 600 acceptable, < 600 tight) decoupled from M; a 3-bar meter + colored rating (label+meter, not
  color alone) + guidance-phrased recommendation from the engine's locale-independent key.
- **Depends on:** `room-input`, `calculation-engine`.
- **Why here:** independent; `Should`, so first to cut under time pressure.
- **Done when:** ratings never scale with M; sub-600 mm reads `tight`.
- **Kickoff:** `openspec new change walkway`

### Epic B — Mode toggle + Visualizers + Logo (iteration 2)

#### 12. `module-2d` — module from room dimensions *(Must, iter 2)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-module-2d/](../openspec/changes/archive/2026-07-03-module-2d/);
  spec synced to `openspec/specs/module-2d/spec.md`. Suite 82/82, build ✓, tsc ✓, lint ✓; review
  **all-clean (0 findings)** from all three Checkers. QA 2/2 implemented, tested & spec-compliant
  (pure engine, fully automated). First change of **Epic B**. Also extracted a shared internal
  `suggestionFromGcd` so `suggestModule` (3D) and `suggestModule2D` (2D) can't drift — a
  behaviour-preserving refactor (existing `suggestModule` tests still green). `FR-MODULE2D-02`'s
  data contract (suggested is always a `STANDARD_MODULES` value, never the raw GCD) ships here; its
  active-module **selection + 2D/3D mode wiring is `mode-toggle` (13)**.
- **Covers:** `FR-MODULE2D-01/02`.
- **Delivers:** `suggestModule2D(rooms)` — GCD folded over every room's length & width (single
  room → `gcd(l, w)`, empty → 0 → smallest module with surfaced residual), snapped to
  `STANDARD_MODULES`, with `alternatives`/`residual`; the 2D-mode module source that will drive
  golden split, grid fit, and the 2D visualizer. Takes a structural `RoomDimensions` so the engine
  stays app-state-independent.
- **Depends on:** `calculation-engine`.
- **Why here:** pure engine extension; prerequisite for 2D-mode calculations.
- **Done when:** unit-tested like the rest of the engine; matches worked examples.
- **Kickoff:** `openspec new change module-2d`

#### 13. `mode-toggle` — 2D ⇄ 3D calculation mode *(Must, iter 2)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-mode-toggle/](../openspec/changes/archive/2026-07-03-mode-toggle/);
  spec synced to `openspec/specs/mode-toggle/spec.md`. Suite 89/89, build ✓, tsc ✓, lint ✓; review
  **all-clean (0 findings)** from all three Checkers. QA 7/7 implemented & spec-compliant, 4/7
  automated (state logic; toggle DOM/field-hiding/a11y manual per ADR-0001 — **runtime-verified**
  both surfaces via the `verify` skill). **Note:** QA subagent hit a session limit before writing
  artifacts; all three were completed by the main loop (same recovery as apartment-input).
  Key design: a private `resyncModule` funnel routes every mutating reducer — behaviour-preserving
  in the 3D default, mode-aware in 2D — and a touched module is sticky across a switch. The band
  diagram is now gated on `mode === '3d'` (completing the change-8 deferral). `room-input` CR-001
  stayed deferred (this change hid existing fields, added no new number-field consumer).
- **Covers:** `FR-MODE-01/02/03/04/05`, `BC-PRIVACY-01`, `NFR-A11Y-03`.
- **Delivers:** segmented toggle (default 3D); 2D hides height fields + the band diagram and
  suggests the module from room dims (change 12); 3D uses heights (change 7); shared state (rooms,
  names, dims, selected module) preserved across switches; mode is in-memory only, never persisted;
  keyboard-operable with a clear selected state.
- **Depends on:** `apartment-input`, `room-input`, `module-summary`, `module-2d`.
- **Why here:** reorganizes the input column; both visualizers hang off it.
- **Done when:** switching modes preserves rooms and reveals/hides height fields; no
  persistence.
- **Kickoff:** `openspec new change mode-toggle`

#### 14. `viz-2d` — read-only SVG plan visualizer *(Must, iter 2)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-viz-2d/](../openspec/changes/archive/2026-07-03-viz-2d/);
  spec synced to `openspec/specs/viz-2d/spec.md`. Suite 94/94, build ✓, tsc ✓, lint ✓; review
  **clean** (0 crit/high/med, 1 low resolved — a doc-accuracy note on `griddraw`). QA 7/7
  implemented & spec-compliant, 3/7 automated (`layoutRoom2D`; SVG/animation/responsiveness manual
  per ADR-0001 — **runtime-verified** the 2D surface). Rendered in 2D mode only (mirrors the band
  diagram's 3D gate). **Notes:** the visualizer tiles `floor(dim/m)` whole cells (spec-mandated by
  `FR-VIZ2D-02`'s text — intentionally distinct from grid-fit's `round`); reduced-motion
  (`FR-VIZ2D-05`) is covered by the shipped global `globals.css` reset + a static highlight opacity
  = the `cellpulse` endpoint; `FR-VIZ2D-04`'s tween/animate-in are unimplemented `MAY` clauses (a
  `Should` met by `cellpulse`).
- **Covers:** `FR-VIZ2D-01/02/03/04/05`, `NFR-PERF-03`, `BC-VALUE-01`.
- **Delivers:** width-responsive `viewBox` SVG; each room a to-scale rectangle in a row/wrap (not a
  floor plan); faint M × M grid; signed remainder as a thin `--warn-bg` edge strip; exactly one
  highlighted accent module cell (`cellpulse`); `prefers-reduced-motion` snaps instead of plays.
  Read-only — no handlers, never edits geometry, never exports. A pure `layoutRoom2D` helper carries
  the grid geometry so `FR-VIZ2D-02/03` are unit-tested.
- **Depends on:** `mode-toggle`, `module-2d`, `calculation-engine`.
- **Why here:** the 2D view is also the 3D fallback, so it must exist before 3D.
- **Done when:** redraw stays within the < 16 ms budget; reduced-motion respected.
- **Kickoff:** `openspec new change viz-2d`

#### 15. `viz-3d` — lazy 3D module visualizer *(Should, iter 2)* — ✅ **shipped 2026-07-03**
- **Shipped:** archived at
  [openspec/changes/archive/2026-07-03-viz-3d/](../openspec/changes/archive/2026-07-03-viz-3d/);
  spec synced to `openspec/specs/viz-3d/spec.md`. Suite 99/99, build ✓, tsc ✓, lint ✓; review
  found **1 medium + 5 low (0 crit/high)** — 3 resolved in-loop, 2 acknowledged. QA 10/10
  implemented & spec-compliant, 3/10 automated (`layoutRoom3D`; canvas/controls/fallback manual per
  ADR-0001). **NFR-BUNDLE-01 verified**: `@react-three`/`three` is imported **only** in
  `components/Viz3DScene.tsx` (the sole importer), loaded via `dynamic(() => import, {ssr:false})`
  from the thin `Viz3D` wrapper; the production build splits Three into a separate ~880K chunk
  absent from first-load JS; `package.json` unchanged. **Review catch (CR-001, medium, resolved):**
  the 3D highlight was a hardcoded orange that contradicted the blue `--accent` and the 2D viz — now
  samples the resolved `--accent` from CSS (re-samples on theme change). **Acknowledged (low):**
  `NFR-PERF-03`'s "capped at high room counts" has no explicit cap — a hard room cap belongs in
  `room-input`/app-state, deferred (documented).
- **Covers:** `FR-VIZ3D-01/02/03/04/05/06`, `NFR-BUNDLE-01`, `NFR-PERF-03`,
  `TC-STACK-04`, `NFR-A11Y-03`.
- **Delivers:** `@react-three/fiber` canvas lazy-loaded via `next/dynamic`
  (`ssr: false`); one box per room (l × w × ceiling) to scale; opening band when
  provided; one highlighted M³ cube; OrbitControls + gentle auto-rotate + float/fade-in;
  reduced-motion disables auto-rotate/pulse; loading state while the chunk loads; WebGL
  unavailable → graceful message + fallback to `viz-2d`. First paint and the 2D path
  carry no 3D dependency.
- **Depends on:** `viz-2d` (fallback target), `mode-toggle`.
- **Why here:** heaviest, riskiest, and `Should`; degrades gracefully to a shipped 2D view.
- **Done when:** the 2D path's bundle contains no Three.js; WebGL-off devices fall back
  cleanly.
- **Kickoff:** `openspec new change viz-3d`

#### 16. `brand-logo` — golden-ratio SVG logo *(Must, iter 2 · parallelizable)*
- **Covers:** `FR-LOGO-01`.
- **Delivers:** an SVG logo (nested φ:1 rectangles + golden-spiral arc, `currentColor`,
  transparent ground) left of the header title, scaling to a favicon; no raster assets,
  no new dependencies.
- **Depends on:** `app-shell` (header slot) only.
- **Why here:** standalone and tiny — schedule any time after the shell; grouped with
  iteration 2 for narrative, not dependency.
- **Kickoff:** `openspec new change brand-logo`

---

## 6. Cross-cutting constraint coverage

These are verified inside the capability changes, not built separately.

| Constraint | Verified in | Note |
|-----------|-------------|------|
| `NFR-PERF-01` synchronous recompute | app-shell, all inputs/results | no async/effects in the compute path |
| `NFR-PERF-02` < 16 ms recompute | calculation-engine | local benchmark harness |
| `NFR-PERF-03` 2D/3D frame budget | viz-2d, viz-3d | 3D capped at high room counts |
| `NFR-PURE-01` pure functions | calculation-engine | no `next/*`/`react`/DOM |
| `NFR-TEST-01` unit coverage | calculation-engine, module-2d | every fn + edge cases |
| `NFR-A11Y-01` labels/focus/assoc | app-shell, apartment-input, room-input | |
| `NFR-A11Y-02` AA contrast, no color-only | design-system, grid-fit, walkway | badges carry text/icon |
| `NFR-A11Y-03` keyboard toggle, results as truth | mode-toggle, viz-3d | viz is supplementary |
| `NFR-RESP-01` responsive layout/SVG | app-shell, vertical-bands | |
| `NFR-OBS-01` silent console | every change | acceptance gate |
| `NFR-BUNDLE-01` lazy 3D | viz-3d | `next/dynamic`, `ssr: false` |
| `TC-STACK-01` Next 16 / React 19 / TS strict | (accepted — scaffold) | |
| `TC-STACK-02/03` Tailwind 4, Inter + JetBrains Mono | design-system | |
| `TC-STACK-04` r3f only heavy dep, lazy | viz-3d | 2D stays pure SVG |
| `TC-CLIENT-01` single client boundary | app-shell | `Calculator.tsx` |
| `TC-ARCH-01` Calculator owns state | app-shell | results flow as props |
| `TC-I18N-01` context + JSON dicts | i18n | no heavy i18n lib |
| `TC-DATA-01` no server/db/api | every change | all local/synchronous |
| `BC-MODULE-01` module is selected, not silent | module-summary | |
| `BC-WALK-01` fixed mm thresholds | walkway | never scale with M |
| `BC-VALUE-01` numbers-first, read-only viz | viz-2d, viz-3d | never an editor |
| `BC-SCOPE-01` no export/persistence/accounts | every change | |
| `BC-PRIVACY-01` no analytics/persistence | every change, esp. mode-toggle | mode in-memory only |
| `BC-USER-01` architect transcribes elsewhere | (product framing) | informs all UI |

---

## 7. Scope levers & open questions

- **Thin first cut.** The `Must` rows of Epic A (changes 1–10) are the minimum coherent
  product. `walkway` (11) is `Should` — cut first under time pressure. See the MoSCoW
  tables in [docs/PDR.md](PDR.md#requirement-prioritization-moscow).
- **Stop-after-Epic-A.** Epic A alone ships a complete, trustworthy calculator. Epic B
  (12–16) is additive and can slip without breaking the core loop.
- **`viz-3d` is the natural cut line in Epic B** — it is `Should`, and `viz-2d` already
  conveys the module-size idea and serves as the fallback.
- **Open questions that gate content, not order:** `OQ-01` (authoritative
  `STANDARD_MODULES`) touches `calculation-engine`/`module-2d` — structurally de-risked by
  [ADR-0002](adr/0002-standard-modules-swappable-constant.md) (one swappable constant,
  `residual` always surfaced), so the value question stays open with the SME without
  blocking the build; `OQ-04` (default heights) touches `apartment-input`; `OQ-02`
  (editable furniture depths) touches `walkway`. None block starting the changes; they
  refine constants and defaults.

---

## 8. Working agreement

- Implement **one change at a time** in the order above; keep only one active OpenSpec
  change unless two same-indent items are genuinely parallel.
- Each change traces back to the PDR IDs in its card — keep those IDs in the proposal so
  specs, tasks, tests, and PRs stay linked.
- Update [docs/CURRENT_STATE.md](CURRENT_STATE.md) at the end of each session with which
  change is active and what's next.
