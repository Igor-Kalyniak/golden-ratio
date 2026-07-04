## Context

Capability 5 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md). `app-shell` (4) shipped
`Calculator` as the state owner with `AppState` (`ceiling`/`opening`/`module`/`rooms`) but no
setter — the apartment slot in `Shell` is a dashed placeholder. `calculation-engine` (1) already
provides `isValidCeiling`/`isValidOpening`/`suggestModule`/`STANDARD_MODULES`. The design source
is [docs/DESIGN.md](../../../../docs/DESIGN.md) §5.2 (apartment card) and §5.4 (validation).

## Goals / Non-Goals

**Goals:**
- Render the three apartment fields with the DESIGN §5.2 layout, mono values, `mm` suffix, and
  right-aligned range hints.
- Implement `FR-APT-03`'s "defaulting to the suggestion, user-overridable" rule precisely: the
  module tracks the live suggestion until the user picks one, then stays put.
- Inline validation per `FR-APT-04`/`NFR-A11Y-01` (already established pattern from `app-shell`'s
  header controls, extended to form fields with `role="alert"` + `aria-describedby`).
- Keep the reducer logic pure and unit-tested, consistent with the engine/i18n/app-state split.

**Non-Goals:**
- No room list (6) — the rooms slot in `Shell` is untouched.
- No module-summary richness (hint trace, alternatives, residual, warning banner) — that is
  `FR-MODULE-03/04/05`, owned by change 7. This change only produces the `module` value.
- No 2D/3D mode toggle (13) — heights are always shown (3D-only fields don't hide yet).

## Decisions

- **`moduleTouched` flag on `AppState`, not component-local state.** The "has the user
  overridden the module" fact must survive across re-renders and is semantically part of the
  apartment state (it changes what a future ceiling/opening edit does), so it belongs in
  `AppState`/`lib/app-state.ts`, not a `useState` local to `ApartmentForm`. This also keeps the
  rule unit-testable without rendering. Alt considered: infer "touched" by comparing
  `module !== suggestModule(ceiling,opening).suggested` — rejected, because a coincidental match
  (user picks the same value the suggestion already shows) would incorrectly read as untouched.
- **Three small pure reducers (`withCeiling`/`withOpening`/`withModule`)** over one generic
  `setState(patch)` — makes the auto-follow rule a single, testable unit instead of duplicated
  inline logic in two `onChange` handlers. `Calculator` calls `setState(prev => withCeiling(prev, v))`.
- **Module select recomputes the suggestion locally for display** (`suggestModule(ceiling,
  opening).suggested`) to label the right `<option>` — no state duplication, since the reducers
  already compute the same value when applying an untouched edit.
- **No `<select>` invalid state.** The dropdown is constrained to `STANDARD_MODULES`, so it is
  always a valid value; only ceiling/opening render `errCeiling`/`errOpening`.
- **Number inputs stay controlled with `Number(e.target.value)`**, including `NaN` for an empty
  field — `isValidCeiling`/`isValidOpening` (which require `Number.isInteger`) then correctly flag
  it invalid rather than the UI needing separate empty-string handling.

## Risks / Trade-offs

- **`moduleTouched` never resets.** Once a user overrides, there is no UI path back to
  "follow the suggestion again" in this change (they'd have to manually pick the suggested
  value). Acceptable for v1; a "reset to suggested" affordance is a future refinement, not
  required by `FR-APT-03`.
- **No React/DOM test runner** → `ApartmentForm` rendering/a11y is verified by build + lint +
  type-check + a manual checklist; only the pure reducers are automated (consistent with
  `app-shell`/`i18n`).
- **Ceiling and opening are coupled** (opening's bound is `≤ ceiling`) → lowering the ceiling
  below the current opening makes the opening field invalid until the user adjusts it; this is
  the documented, correct behavior (`isValidOpening(opening, ceiling)`), not a bug to hide.

## Migration Plan

Extends `lib/app-state.ts`/`lib/app-state.test.ts` (additive field + reducers), edits
`components/Calculator.tsx`/`components/Shell.tsx` (wire props, fill one slot), adds
`components/ApartmentForm.tsx`. No dependency, no routing, no data changes. Reversible by
reverting the four files.

## Open Questions

- None new. `OQ-04` (default heights 2800/2100) stays open with the SME; unaffected by this
  change's UI work.
