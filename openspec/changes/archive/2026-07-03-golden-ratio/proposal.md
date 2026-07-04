## Why

The results region shows the module summary and the height-band diagram; the per-room results —
the payoff the architect enters rooms for — are still empty. `golden-ratio` adds the first of the
three per-room result blocks: the golden-ratio split of each valid room's longer wall, showing the
exact 0.618/0.382 division, the ½M-snapped values, and the snap offset, with an "approximate fit"
flag when the offset exceeds ¼M. It introduces the **per-room card** (DESIGN §6.3) — one card per
valid room, header + a stack of result blocks — that `grid-fit` (10) and `walkway` (11) will extend
with their own blocks. The pure `computeGoldenSplit` function already shipped (change 1); this is
its presentation, plus the longer-wall selection (`FR-GOLD-03`) and the fit flag (`FR-GOLD-04`).
Capability 9 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md); its prerequisites
`module-summary` (7), `room-input` (6), and `calculation-engine` (1) are archived. Owns
`FR-GOLD-01/02/03/04` (`FR-GOLD-01/02`'s function shipped with change 1).

## What Changes

- **`lib/calculations.ts` extended (pure)**: add two tiny helpers so the caller responsibilities in
  `FR-GOLD-03/04` are unit-testable rather than living in JSX — `longerWall(room)` returns
  `max(length, width)` (`FR-GOLD-03`), and `isApproximateFit(snapOffset, m)` returns
  `snapOffset > m / 4` (the ¼M "approximate fit" threshold, `FR-GOLD-04`). `computeGoldenSplit` is
  reused unchanged.
- **`components/PerRoomResults.tsx` (`'use client'`)**: the per-room results container (DESIGN
  §6.3) — maps the **valid** rooms (`isRoomValid`) to one card each; each card has a header (room
  name + `length × width mm` in mono + a fit badge: `clean fit` ✓ / `approximate fit` ≈) and a
  **Golden split** block showing the longer wall, the exact `larger / smaller` (0.618/0.382), the
  ½M-snapped `largerSnapped / smallerSnapped` in accent, and the `snapOffset` colored by fit. The
  card is the shared scaffold; grid-fit (10) and walkway (11) add blocks below the golden block.
- **`components/GoldenSplitBlock.tsx` (`'use client'`)** *(or a section within `PerRoomResults`)*:
  the golden-split block itself, given a room + module. Read-only; recomputes synchronously.
- **`components/Shell.tsx`**: the results region renders `<PerRoomResults>` after `<BandDiagram>`
  (still gated on `showResults`), passing `state.rooms` and `state.module`.
- **`lib/calculations.test.ts` extended**: unit tests for `longerWall` (length ≥ width and width >
  length) and `isApproximateFit` (offset below / at / above ¼M), plus a worked-example assertion of
  `computeGoldenSplit` against the DESIGN table (living room 4200 → 2595.6/1604.4 → 2450/1750,
  offset 145.6 → approximate; bathroom 2150 → offset 71.3).

Scope stays the golden-split block + the per-room card scaffold. The grid-fit block (10), walkway
block (11), and the visualizer (14/15) are out of scope; they extend the same card. No new i18n
keys — `perRoom`, `goldenSplit`, `longerWall`, `exact`, `snappedVals`, `snapOffset`, `approxFit`,
`cleanFit` all shipped with earlier changes.

## Capabilities

### New Capabilities
- `golden-ratio`: the per-room golden-ratio split — longer-wall selection, exact + ½M-snapped
  values, snap offset, and the "approximate fit" flag — rendered as the first block of the per-room
  result card.

### Modified Capabilities
<!-- none — module-summary / vertical-bands / room-input specs are unchanged; this adds a new
     result section that reads existing state. -->

## Impact

- **Files:** extend `lib/calculations.ts` (+tests); add `components/PerRoomResults.tsx` (+ golden
  block); edit `components/Shell.tsx`. No new dependencies; no new i18n keys.
- **Requirements owned:** `FR-GOLD-01/02/03/04`.
- **Consumes (shipped):** `computeGoldenSplit` from the engine; `Room`/`isRoomValid` from
  `lib/app-state.ts`; `state.rooms`/`state.module` from `Calculator`; `Shell` results slot;
  `useI18n`.
- **Enables:** the per-room card scaffold that `grid-fit` (10) and `walkway` (11) extend.
