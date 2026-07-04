## Why

The per-room card shows the golden split (9) and grid fit (10); `walkway` adds the **third and
final** block, completing the per-room card and Epic A (the MVP calculator). It estimates the
walkway clearance left past common furniture in each room — wardrobe/kitchen (600 mm), sofa/bed
centre (900 mm), and between two facing 600 mm units (1200 mm) — and rates each against **fixed
ergonomic mm thresholds that never scale with the module** (`≥900` comfortable, `≥600` acceptable,
`<600` tight). This is the "honest about ergonomics" promise: comfort is an absolute human
dimension, not a proportional one (`BC-WALK-01`). The pure `computeWalkways`/`rateWalkway` functions
and the `FURNITURE_DEPTHS`/`WALKWAY_THRESHOLDS` constants already shipped (change 1); this is their
presentation. Capability 11 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md); its
prerequisites `room-input` (6) and `calculation-engine` (1) are archived, and the per-room card
scaffold from `golden-ratio` (9) is in place. Owns `FR-WALK-01/02/03/04` and `BC-WALK-01`
(`FR-WALK-01/02/03`'s functions shipped with change 1).

## What Changes

- **`components/WalkwayBlock.tsx` (`'use client'`)**: the walkway block (DESIGN §6.3), given a room.
  Renders three rows — wardrobe/kitchen (`FURNITURE_DEPTHS.wardrobeKitchen`), sofa/bed
  (`FURNITURE_DEPTHS.sofa`), facing units (`FURNITURE_DEPTHS.facingUnits`) — each calling
  `computeWalkways(room.width, depth)`; the clearance dimension is the room **width** (the corridor
  dimension, matching the frozen prototype). Each row shows the furniture label (`wardrobe`/`sofa`/
  `facing`), the available clearance in mm, a **3-bar meter** filled by rating (3 comfortable / 2
  acceptable / 1 tight) plus a colored text rating (`comfortable`/`acceptable`/`tight`), and the
  localized guidance sentence from the engine's `recommendation` key (`recComf`/`recAcc`/`recTight`).
  Ratings come straight from the engine's fixed-mm `rateWalkway` — never derived from M (`BC-WALK-01`).
- **`components/PerRoomResults.tsx`**: render `<WalkwayBlock room />` as the third block in each
  per-room card, below `<GridFitBlock>` — extending the shared card scaffold to its full DESIGN §6.3
  form (golden / grid / walkway).
- **`lib/calculations.test.ts` extended**: assert the meter-bar mapping (a tiny pure helper or an
  inline-tested mapping: comfortable→3, acceptable→2, tight→1) and re-pin the worked-example
  ratings via `computeWalkways` at the three preset depths for a representative room, plus the
  recommendation-key mapping. (The core `computeWalkways`/`rateWalkway` threshold cases already
  shipped in change 1.)

Scope note: **`oppositeDepth` (opposite-wall accounting) is explicitly a `Could` and out of v1
scope** (PDR MoSCoW — "Could"), so this change uses the two-argument `computeWalkways(width, depth)`
form only. Editable furniture depths are also `Could` and deferred. This is the last per-room block;
the visualizer (14/15) is Epic B. No new i18n keys — `walkway`, `clearance`, `furniture`,
`comfortable`, `acceptable`, `tight`, `wardrobe`, `sofa`, `facing`, `recComf`, `recAcc`, `recTight`
all shipped with earlier changes.

## Capabilities

### New Capabilities
- `walkway`: the per-room walkway-clearance block — three furniture-preset rows, each with the
  available clearance, a fixed-mm comfort rating, a bar meter, and localized guidance.

### Modified Capabilities
<!-- none — the golden-ratio per-room card is extended, not respecified. -->

## Impact

- **Files:** add `components/WalkwayBlock.tsx`; edit `components/PerRoomResults.tsx`; extend
  `lib/calculations.test.ts` (+ a small meter-bar helper in `lib/calculations.ts` if used). No new
  dependencies; no new i18n keys.
- **Requirements owned:** `FR-WALK-01/02/03/04`, `BC-WALK-01`.
- **Consumes (shipped):** `computeWalkways`/`rateWalkway`/`FURNITURE_DEPTHS`/`WALKWAY_THRESHOLDS`
  from the engine; `Room` from `lib/app-state.ts`; `state.rooms` via `PerRoomResults`; `useI18n`.
- **Enables:** completes the per-room card and **Epic A (the core calculator)**; Epic B (visualizers
  + logo, 12–16) follows.
