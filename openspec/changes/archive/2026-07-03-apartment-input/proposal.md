## Why

`app-shell` (4) shipped a real, responsive shell, but its input column has only a dashed
placeholder where the apartment fields belong — `Calculator` currently owns state with no
setter. `apartment-input` fills that slot: ceiling height, opening height, and a module
selector defaulting to the engine's suggestion, all reactive with inline validation. This
produces the apartment-level state every downstream result (module summary, bands, golden
split, grid fit) reads. Capability 5 in
[docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md); its prerequisites `app-shell` (4) and
`calculation-engine` (1) are archived. Owns `FR-APT-01/02/03/04/05`.

## What Changes

- **`lib/app-state.ts` extended**: `AppState` gains `moduleTouched: boolean` (default `false`)
  so the module selector can distinguish "still following the suggestion" from "user picked a
  value" (`FR-APT-03`). Three pure reducers — `withCeiling`, `withOpening`, `withModule` — encode
  the rule: editing ceiling/opening re-suggests the module **only while untouched**; selecting a
  module directly sets it and marks it touched (never reverts on a later height edit). Reducers
  are framework-free and unit-tested.
- **`components/Calculator.tsx`**: adds the setter wiring — `onCeilingChange`/`onOpeningChange`/
  `onModuleChange` callbacks built over the new reducers, passed down to `Shell`.
- **`components/ApartmentForm.tsx` (`'use client'`)**: the apartment card (DESIGN §5.2) —
  ceiling and opening number fields (range hint right-aligned in the label, `mm` suffix, inline
  `role="alert"` error + `aria-invalid`/`aria-describedby` on invalid, `FR-APT-04`) and a module
  `<select>` over `STANDARD_MODULES` with the suggested option labelled `"{value} — suggested"`
  and an `override` affordance tag next to the label. No submit button; every change recomputes
  synchronously (`FR-APT-05`).
- **`components/Shell.tsx`**: the apartment slot renders `<ApartmentForm>` (wired to the new
  props) in place of its dashed placeholder; the room-list slot is untouched (`room-input`, 6).
- **`lib/app-state.test.ts` extended**: unit tests for the three reducers (auto-follow while
  untouched, sticky once touched, ceiling/opening edits don't clobber an override).

Scope stays the apartment card only — the room list (6), module summary richness (hint,
alternatives, residual — 7), and the 2D/3D mode toggle (13) are out of scope.

## Capabilities

### New Capabilities
- `apartment-input`: the apartment fields — ceiling height, opening height, and the
  module selector defaulting to the suggested value with the auto-follow-until-overridden
  behavior, plus their inline validation.

### Modified Capabilities
<!-- none — app-shell's spec (results gate, layout) is unchanged; this only fills its slot -->

## Impact

- **Files:** extend `lib/app-state.ts` (+tests); edit `components/Calculator.tsx`,
  `components/Shell.tsx`; add `components/ApartmentForm.tsx`. No new dependencies; no new i18n
  keys (`ceiling`/`opening`/`module`/`rngCeiling`/`rngOpening`/`overridable`/`errCeiling`/
  `errOpening`/`suggested` already shipped in `locales/`).
- **Requirements owned:** `FR-APT-01/02/03/04/05`.
- **Consumes (shipped):** `isValidCeiling`/`isValidOpening`/`suggestModule`/`STANDARD_MODULES`
  from `lib/calculations.ts`; `Calculator`/`Shell` from `app-shell`; `useI18n` from `i18n`.
- **Enables:** `module-summary` (7) reads the resulting `ceiling`/`opening`/`module` state.
