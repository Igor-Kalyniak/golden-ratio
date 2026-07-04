## Why

Epic A shipped the full 3D-mode calculator (heights → module → results). Epic B adds a 2D ⇄ 3D
mode toggle and read-only visualizers; `module-2d` is its first, lowest-risk change: the **pure
engine extension** that derives a module from *room dimensions* instead of heights, for 2D mode.
In 2D mode the architect works from plan dimensions (length × width) with no ceiling/opening, so
the module is suggested from the GCD folded across every room's length and width. This is
100% unit-testable with no UI, so it de-risks 2D mode before the toggle (13) and visualizers
(14/15) consume it — exactly like `calculation-engine` (1) de-risked 3D. Capability 12 in
[docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md); its only prerequisite `calculation-engine`
(1) is archived. Owns `FR-MODULE2D-01` (the function) and the data-contract half of `FR-MODULE2D-02`.

## What Changes

- **`lib/calculations.ts` extended (pure)**: add `suggestModule2D(rooms)` returning the same
  `ModuleSuggestion` shape (`{ rawGcd, suggested, alternatives, residual }`) as `suggestModule`,
  where `rawGcd` is the GCD folded across **every room's length and width** (single room →
  `gcd(length, width)`; identical to the frozen prototype's per-room-then-fold, since GCD is
  associative). `suggested` is `rawGcd` snapped to the nearest `STANDARD_MODULES`; `residual` is
  always surfaced (ADR-0002). Takes a minimal structural `RoomDimensions` (`{ length, width }`) so
  the engine stays framework-free and independent of `lib/app-state.ts` (`Room` satisfies it
  structurally); the caller passes the valid rooms.
- **`lib/calculations.ts` refactor (DRY, no behavior change)**: extract the shared
  snap → residual → two-nearest-alternatives tail of `suggestModule` into one internal
  `suggestionFromGcd(rawGcd)` helper, and have both `suggestModule` (3D) and `suggestModule2D` (2D)
  call it. This removes duplication and gives the 2D path the exact same suggestion semantics as
  3D. `suggestModule`'s existing unit tests confirm the extraction is behavior-preserving.
- **`lib/calculations.test.ts` extended**: unit tests for `suggestModule2D` — single room
  (`gcd(l, w)`), multi-room fold, snapped-vs-raw with a surfaced residual, coprime-dims edge, and
  the empty/degenerate case (rawGcd 0 → snaps to the smallest standard module, residual surfaced).

Scope stays the **pure function only**. The 2D/3D toggle, hiding height fields, and switching the
active-module *source* between `suggestModule` and `suggestModule2D` are `mode-toggle` (13); the
visualizers are 14/15. No component, no i18n, no state changes here. `FR-MODULE2D-02`'s "active
module is the user selection (default `suggested`), never the raw GCD" is realized structurally the
same way as `FR-MODULE-02` (the returned `suggested` is always a `STANDARD_MODULES` value, never the
raw GCD; user override via the existing `module`/`moduleTouched` state) and is **fully wired in
change 13** — this change delivers the data contract, not the mode wiring.

## Capabilities

### New Capabilities
- `module-2d`: the pure 2D-mode module derivation — `suggestModule2D(rooms)`, GCD folded across all
  rooms' length & width, snapped to a standard module with alternatives and a surfaced residual.

### Modified Capabilities
<!-- none — the calculation-engine spec's suggestModule is unchanged behaviourally; the internal
     suggestionFromGcd extraction is a non-behavioural refactor, not a requirement change. -->

## Impact

- **Files:** extend `lib/calculations.ts` (`suggestModule2D` + `RoomDimensions` + internal
  `suggestionFromGcd` refactor) and `lib/calculations.test.ts`. No new dependencies; no UI; no i18n.
- **Requirements owned:** `FR-MODULE2D-01`, `FR-MODULE2D-02` (data contract; mode wiring in 13).
- **Consumes (shipped):** `gcd`, `nearestStandardModule`, `STANDARD_MODULES`, `ModuleSuggestion`
  from the engine.
- **Enables:** `mode-toggle` (13) selects `suggestModule2D` in 2D mode; `viz-2d` (14) draws its
  module; golden split + grid fit reuse the resulting active module in 2D.
