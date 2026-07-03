## Why

The per-room card (shipped with `golden-ratio`, 9) shows the golden split as its first block;
`grid-fit` adds the second block: how each room's dimensions fit the module grid. It shows the
room as `nL × nW` modules (`round(dimension / m)`), the signed remainder to the nearest grid line
per dimension, a round-up/round-down annotation, and a colored `exact` / `close` / `poor` quality
badge that carries a text + glyph cue (never color alone). The pure `computeRoomGrid` function
already shipped (change 1); this is its presentation. Capability 10 in
[docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md); its prerequisites `module-summary` (7),
`room-input` (6), and `calculation-engine` (1) are archived, and the per-room card scaffold from
`golden-ratio` (9) is in place. Owns `FR-GRID-01/02/03/04/05` and `NFR-A11Y-02` (`FR-GRID-01/02/03/04`'s
function shipped with change 1).

## What Changes

- **`components/GridFitBlock.tsx` (`'use client'`)**: the grid-fit block (DESIGN §6.3), given a
  room + module. Calls `computeRoomGrid(length, width, m)` and shows: `nL × nW` modules (mono), the
  signed `remainder L / W` (with an explicit `+`/`−` sign), a warn-italic annotation
  `round up / round down on length / width` per non-zero remainder (**positive remainder ⇒ round
  down**, dimension over grid; **negative ⇒ round up**, under grid — per `FR-GRID-03` and the frozen
  prototype), and a **quality badge** `exact` (good, ✓) / `close` (warn, ≈) / `poor` (bad, ✕) whose
  meaning is carried by the label + glyph, not color alone (`FR-GRID-05`, `NFR-A11Y-02`).
- **`components/PerRoomResults.tsx`**: render `<GridFitBlock room module />` as the second block in
  each per-room card, below `<GoldenSplitBlock>` — extending the shared card scaffold exactly as its
  `golden-ratio` design anticipated (sibling block in the same slot).
- **`lib/calculations.test.ts` extended**: assert the round-up/round-down annotation *direction*
  against the sign convention (a helper or inline mapping tested), plus the DESIGN §6.3 worked
  examples — living room 4200×3500 → 6×5, rem 0/0, `exact`; kitchen 3800×2500 → 5×4, rem −300/+300,
  `poor`; bathroom 2150×1500 → 3×2, rem +50/+100, `close`; and the 1 mm-short boundary reads `close`.

To keep the round-up/round-down direction unit-testable (not buried in JSX) and to fix a latent
trap, this change adds one tiny pure helper:

- **`lib/calculations.ts`**: `gridRoundDirection(remainder)` → `'roundDown' | 'roundUp' | null`
  (`> 0 → roundDown`, `< 0 → roundUp`, `0 → null`), a locale-independent key the UI maps via `t()`.
  This encodes the `FR-GRID-03` sign convention in one tested place. **It also corrects a stale
  inline comment** on the `RoomGrid` type in `lib/calculations.ts` (the comment reads "negative ⇒
  round down, positive ⇒ round up", the reverse of `FR-GRID-03`, DESIGN §6.3, and the shipped
  prototype); the returned numeric value is already correct, so this is a comment-only fix plus the
  new helper that makes the direction explicit and tested.

Scope stays the grid-fit block. The walkway block (11) is the last per-room block and is out of
scope. No new i18n keys — `gridFit`, `remainder`, `quality`, `roundUp`, `roundDown`, `onLength`,
`onWidth`, `qexact`, `qclose`, `qpoor` all shipped with earlier changes.

## Capabilities

### New Capabilities
- `grid-fit`: the per-room grid-fit block — modules × modules, signed remainders with a
  round-up/round-down annotation, and an accessible `exact`/`close`/`poor` quality badge.

### Modified Capabilities
<!-- none — golden-ratio's per-room card is extended, not respecified; its spec is unchanged. -->

## Impact

- **Files:** add `components/GridFitBlock.tsx`; edit `components/PerRoomResults.tsx`; extend
  `lib/calculations.ts` (`gridRoundDirection` + comment fix) and `lib/calculations.test.ts`. No new
  dependencies; no new i18n keys.
- **Requirements owned:** `FR-GRID-01/02/03/04/05`, `NFR-A11Y-02`.
- **Consumes (shipped):** `computeRoomGrid` from the engine; `Room` from `lib/app-state.ts`;
  `state.rooms`/`state.module` via `PerRoomResults`; `useI18n`.
- **Enables:** leaves only the walkway block (11) to complete the per-room card.
