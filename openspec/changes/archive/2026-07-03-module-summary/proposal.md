## Why

The calculator's full input surface is live (apartment fields + room list), and `AppState.module`
already holds the active module (user selection defaulting to the engine's `suggested`, via the
`apartment-input` reducers). But nothing yet **surfaces** that module or proves the contract that
every downstream result reads it. `module-summary` is the linchpin (capability 7): it opens the
results column with a read-only Module Summary card — the active module rendered large, the
traceability hint (`GCD → snapped`, residual, alternatives) that earns the architect's trust, a
¼M…4M ruler, and an impractical-module warning banner. This establishes the *active module*
(`FR-MODULE-02`) that vertical-bands (8), golden-ratio (9), and grid-fit (10) will each consume.
Its prerequisites `apartment-input` (5) and `calculation-engine` (1) are archived. Owns
`FR-MODULE-02/03/04/05` and `BC-MODULE-01` (`FR-MODULE-01`'s `suggestModule` function shipped with
change 1).

## What Changes

- **`lib/calculations.ts` extended (pure)**: add `computeModuleRuler(m)` returning the seven ruler
  rows `{ label, k, size }` for `k ∈ {0.25, 0.5, 1, 1.5, 2, 3, 4}` with `size = round(m·k)` and
  `label` from the frozen `CALC_LABELS` (`¼M`…`4M`), and `moduleWarning(m)` returning
  `'large' | 'small' | null` against the shipped `MODULE_WARNING` bounds (`>1000` / `<100`). Both
  are framework-free and unit-tested (`NFR-PURE-01`/`NFR-TEST-01`). The engine stays
  language-agnostic — the ruler's "typical use" prose is localized in the UI, keyed off the
  never-translated `label`.
- **`components/ModuleSummary.tsx` (`'use client'`)**: the two-pane Module Summary card (DESIGN
  §6.1) — left pane the hero `M = {module}` (mono, `mm`), right pane the traceability hint
  `GCD(ceiling, opening) = {rawGcd} → snapped to {suggested}` with a `residual {n} mm` chip and
  `alternatives` chips; a `role="alert"` warning banner shown only when `moduleWarning(module)` is
  non-null (`warnLarge`/`warnSmall`); and the module ruler `<table>` (`Label | Size | Typical use`)
  whose label cells are mono-accent and **never translated** while the use prose is localized
  (`FR-MODULE-03/04/05`). Read-only — it displays state, never edits it.
- **`components/Shell.tsx`**: the results region renders `<ModuleSummary>` as the first result
  section (still gated on `showResults`), replacing the `perRoom` placeholder text; the empty-state
  card is unchanged. The module `<select>` stays in `ApartmentForm` (input column) — the summary is
  a read-only display of the same `state.module` (`FR-MODULE-02`, `BC-MODULE-01`).
- **`locales/en.json` + `locales/ua.json`**: add the seven ruler "typical use" strings (keyed off
  the module labels, e.g. `useQuarterM`…`use4M`) and `snappedTo` usage; `moduleSummary`,
  `activeModule`, `suggestedFrom`, `residual`, `alternatives`, `ruler`, `colLabel/colSize/colUse`,
  `warnLarge`, `warnSmall` already shipped. `suggestedFromRooms` (2D) stays unused until change 13.
- **`lib/calculations.test.ts` extended**: unit tests for `computeModuleRuler` (sizes at M=700 and a
  fractional-rounding module) and `moduleWarning` (large/small/none boundaries).

Scope stays the module summary only. The active-module **state + selector** already shipped
(`apartment-input`); the 2D room-derived module (`FR-MODULE2D-*`, change 12) and the result sections
that consume the module (8–11) are out of scope. `suggestModule` is reused as-is, not modified.

## Capabilities

### New Capabilities
- `module-summary`: surfaces the active module — the hero value, the `GCD → snapped` traceability
  hint with residual + alternatives, the ¼M…4M ruler, and the impractical-module warning — and
  fixes the contract that downstream results read the user-selected module, never the raw GCD.

### Modified Capabilities
<!-- none — apartment-input's spec (the module <select> + auto-follow reducers) is unchanged; this
     adds a read-only display of the same state and the ruler/warning helpers. -->

## Impact

- **Files:** extend `lib/calculations.ts` (+tests); add `components/ModuleSummary.tsx`; edit
  `components/Shell.tsx`; add 7–8 keys to each `locales/*.json`. No new dependencies.
- **Requirements owned:** `FR-MODULE-02/03/04/05`, `BC-MODULE-01`.
- **Consumes (shipped):** `suggestModule`/`MODULE_WARNING`/`CALC_LABELS`/`nearestStandardModule`
  from the engine; `state.module`/`ceiling`/`opening` from `Calculator`; `Shell` results slot;
  `useI18n`.
- **Enables:** `vertical-bands` (8), `golden-ratio` (9), `grid-fit` (10) each read the active
  `state.module` this card surfaces.
