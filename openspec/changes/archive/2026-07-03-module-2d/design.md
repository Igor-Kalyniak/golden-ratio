## Context

`calculation-engine` (1) shipped `gcd`, `nearestStandardModule`, `STANDARD_MODULES`, the
`ModuleSuggestion` type, and `suggestModule(ceiling, opening)` (3D-mode module from heights), all
unit-tested. Epic B's mode toggle (13) will, in 2D mode, derive the module from room dimensions
instead of heights. This change adds that pure derivation now, ahead of the UI, so it is
fully unit-tested before any component depends on it — the same logic-first strategy that de-risked
3D. The frozen prototype (`prototype.dc.html:503`) is the reference: over valid rooms,
`gcd(length, width)` per room folded across rooms.

## Goals / Non-Goals

**Goals**
- Add a pure, unit-tested `suggestModule2D(rooms)` with the exact `ModuleSuggestion` contract of
  `suggestModule` (`FR-MODULE2D-01`).
- Guarantee the data half of `FR-MODULE2D-02`: `suggested` is always a standard module (never the
  raw GCD); `residual` always surfaced.
- Keep the 2D and 3D suggestion semantics identical by sharing one internal helper.

**Non-Goals**
- The 2D/3D toggle, hiding height fields, and switching the active-module source — `mode-toggle`
  (13).
- Any visualizer — `viz-2d` (14) / `viz-3d` (15).
- Validity filtering inside the engine — the caller passes valid rooms (see below).

## Decisions

### Flat GCD fold, equivalent to the prototype's per-room fold
`suggestModule2D` collects every room's `length` and `width` into one sequence and folds `gcd`
across it. Because GCD is associative and commutative, `gcd(gcd(l₁,w₁), gcd(l₂,w₂), …)` (the
prototype's per-room-then-fold) equals `gcd(l₁, w₁, l₂, w₂, …)` (the flat fold). The flat fold is
the simplest expression; a unit test pins the 3-room worked example against the prototype result
(`rawGcd = 50`) so the equivalence is proven, not assumed.

### Extract a shared `suggestionFromGcd(rawGcd)` — DRY, behaviour-preserving
`suggestModule` currently inlines the snap → residual → two-nearest-alternatives tail. This change
lifts that tail verbatim into an internal `suggestionFromGcd(rawGcd): ModuleSuggestion` and has both
`suggestModule` (passing `gcd(ceiling, opening)`) and `suggestModule2D` (passing the folded GCD)
call it. Benefits: one definition of the suggestion semantics, so 2D and 3D cannot drift; less code.
Risk is low and contained — it is a pure extraction of existing lines, and `suggestModule`'s shipped
unit tests (worked example 2800/2100 → 700, coprime → snapped with residual) still pass unchanged,
proving no behaviour change. Flagged to reviewers as an intentional refactor of change-1 code.

### Engine stays app-state-independent via a structural `RoomDimensions`
`Room` lives in `lib/app-state.ts`, which imports `lib/calculations.ts` (not the reverse) to keep
the engine framework-free. So `suggestModule2D` cannot take `Room`. It takes a minimal
`readonly RoomDimensions[]` where `RoomDimensions = { length: number; width: number }` — `Room`
satisfies this structurally, so the caller passes `state.rooms` (or the valid subset) directly with
no adapter. Validity filtering is the **caller's** job (mode-toggle 13 passes valid rooms, matching
the prototype's `filter(roomOK)`); the engine folds over whatever it is given, keeping it pure and
single-responsibility.

### Empty / degenerate input: honest residual, no magic fallback
The prototype uses `… || 100` to floor an empty fold at 100. This change does **not** replicate that
cosmetic fallback: an empty `rooms` array folds to `rawGcd = 0`, and `nearestStandardModule(0)`
already returns `100` (0 is nearest to the smallest standard module), so `suggested = 100` with
`residual = 100`. That surfaces the degenerate case honestly (a large residual) instead of hiding it
as `residual 0` — consistent with ADR-0002 ("residual always surfaced, never silent") and with how
`suggestModule` avoids magic fallbacks. In practice the UI only computes 2D results when ≥1 valid
room exists (the `showResults` gate), so empty never reaches a user; the honest definition is for
the function's own correctness and is unit-tested.

## Risks / Trade-offs

- **Touching the shipped `suggestModule`.** The `suggestionFromGcd` extraction edits a change-1
  function. Mitigated by: it is a pure lift of existing lines, covered by existing tests that must
  stay green, and reviewed by fresh Checkers. The alternative (duplicating four lines) was rejected
  as it would let 2D and 3D suggestion logic drift.
- **`NFR-TEST-01` / `NFR-PURE-01`.** `suggestModule2D` is pure (no framework imports) and fully
  unit-tested, upholding both — the same bar as the rest of the engine.

## Migration Plan

Additive plus a behaviour-preserving internal refactor. No component, state, spec (behaviourally),
or dependency changes. No data migration (`BC-PRIVACY-01`). `mode-toggle` (13) will import
`suggestModule2D`; nothing imports it yet, so this change is inert at runtime until then.

## Open Questions

- `OQ-01` (authoritative `STANDARD_MODULES`) touches this function the same way it touches
  `suggestModule` — a one-constant change, structurally de-risked by ADR-0002. Does not block.
