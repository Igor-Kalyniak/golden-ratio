## Why

`module-2d` (12) shipped the pure 2D-mode module derivation but nothing consumes it yet.
`mode-toggle` makes 2D mode real: a segmented **2D ⇄ 3D** toggle in the input column (default 3D)
that switches how the architect works. In 3D mode the module is suggested from ceiling/opening
heights (`suggestModule`, 7); in 2D mode the height fields are hidden and the module is suggested
from room dimensions (`suggestModule2D`, 12). Switching preserves all shared state (rooms, names,
length/width, a user-selected module); only the height fields and the module's suggestion source
change. Mode is in-memory only — never persisted (`BC-PRIVACY-01`). This is the pivot that
reorganizes the input column for Epic B and turns the two module engines into one mode-driven
experience. Capability 13 in [docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md); its prerequisites
`apartment-input` (5), `room-input` (6), `module-summary` (7), and `module-2d` (12) are archived.
Owns `FR-MODE-01/02/03/04/05`, `BC-PRIVACY-01`, `NFR-A11Y-03`.

## What Changes

- **`lib/app-state.ts` extended (pure)**: add a `Mode = '2d' | '3d'` type and `mode: Mode` to
  `AppState` (default `'3d'`, in-memory only — `FR-MODE-05`/`BC-PRIVACY-01`). Add a derived
  `moduleSuggestion(state): ModuleSuggestion` that returns the **mode-appropriate** suggestion —
  `suggestModule(ceiling, opening)` in 3D, `suggestModule2D(validRooms)` in 2D — and a private
  `resyncModule(state)` that re-points an *untouched* module at `moduleSuggestion(state).suggested`.
  Add a `withMode(state, mode)` reducer (switches mode + resyncs). Route the existing
  `withCeiling`/`withOpening` and the room reducers (`addRoom`/`removeRoom`/`updateRoom`) through
  `resyncModule` so the untouched module tracks the current mode's source — behaviour-preserving in
  3D (heights unchanged ⇒ no-op resync), and in 2D the module now follows room-dimension edits.
  `isApartmentValid` becomes mode-aware: in 2D the hidden heights are ignored (validity = a standard
  module + ≥1 valid room), matching what the UI actually gates on.
- **`components/ModeToggle.tsx` (`'use client'`)**: a segmented 2D/3D control (DESIGN §5.1),
  `role="group"` labelled `mode`, two `aria-pressed` buttons with a clear selected state, fully
  keyboard-operable (`FR-MODE-01`, `NFR-A11Y-03`).
- **`components/ApartmentForm.tsx`**: accept `mode` + a `suggested` prop; in 2D **hide the ceiling
  and opening `NumberField`s** (`FR-MODE-02`) while keeping the shared module `<select>`; the
  suggested option is annotated from the passed `suggested` (mode-appropriate) rather than
  recomputed from heights.
- **`components/ModuleSummary.tsx`**: accept `mode` + the `ModuleSuggestion`; the traceability hint
  reads `GCD(ceiling, opening) → …` with `suggested from heights` in 3D, and `GCD(rooms) → …` with
  `suggested from room dimensions` in 2D (both i18n keys already shipped).
- **`components/Shell.tsx`**: render `<ModeToggle>` atop the input column; **gate `<BandDiagram>` on
  `mode === '3d'`** — the vertical bands are a 3D-only result and are hidden in 2D (`FR-MODE-02`,
  and the documented deferral from change 8).
- **`components/Calculator.tsx`**: add `onModeChange`; compute `moduleSuggestion(state)` once and
  flow it to `ApartmentForm`/`ModuleSummary` as props (keeps `Calculator` the single state owner,
  `TC-ARCH-01`).
- **`locales/en.json` + `locales/ua.json`**: add one key — `mode` (the toggle's group label). The
  `2D`/`3D` button text is a universal mode label (not translated); `suggestedFrom`/
  `suggestedFromRooms` already shipped.
- **`lib/app-state.test.ts` extended**: unit tests for `mode` default, `withMode` (resync on switch,
  sticky override across switch), `moduleSuggestion` (3D heights vs 2D rooms), room reducers
  resyncing the untouched module in 2D but not 3D, and `isApartmentValid` ignoring heights in 2D.

Scope note: the **visualizers** (`viz-2d` 14, `viz-3d` 15) are out of scope — "the active
visualizer changes" per `FR-MODE-04` is realized when those ship; this change delivers the mode
state, the input-column reorganization, and the results that already exist reacting to mode.
`room-input` CR-001 (shared `NumberField` extraction) stays deferred: this change adds **no new**
number-field consumer (it conditionally hides existing fields), so the 3rd-consumer trigger still
hasn't occurred.

## Capabilities

### New Capabilities
- `mode-toggle`: the 2D ⇄ 3D calculation-mode toggle — mode state, hiding height fields in 2D,
  switching the module suggestion source, preserving shared state, and keeping mode in-memory only.

### Modified Capabilities
<!-- none — apartment-input/module-summary specs describe behaviour that still holds; mode-awareness
     is additive. The reducer routing through resyncModule is behaviour-preserving in the shipped 3D
     default (existing tests stay green). -->

## Impact

- **Files:** extend `lib/app-state.ts` (+`mode`/`Mode`/`moduleSuggestion`/`withMode`/`resyncModule`,
  mode-aware `isApartmentValid`) + tests; add `components/ModeToggle.tsx`; edit
  `components/ApartmentForm.tsx`, `components/ModuleSummary.tsx`, `components/Shell.tsx`,
  `components/Calculator.tsx`; add 1 key to each `locales/*.json`. No new dependencies.
- **Requirements owned:** `FR-MODE-01/02/03/04/05`, `BC-PRIVACY-01`, `NFR-A11Y-03`.
- **Consumes (shipped):** `suggestModule`/`suggestModule2D`/`ModuleSuggestion` from the engine;
  `AppState`/reducers from earlier changes; `useI18n`.
- **Enables:** `viz-2d` (14) reads `mode` + the 2D active module; `viz-3d` (15) is the 3D visualizer.
