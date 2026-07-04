## Context

`calculation-engine` (1) shipped `computeWalkways(roomWidth, furnitureDepth, oppositeDepth?)` →
`{ available, rating, recommendation }`, `rateWalkway`, and the `FURNITURE_DEPTHS`
(`wardrobeKitchen: 600, sofa: 900, facingUnits: 1200`) / `WALKWAY_THRESHOLDS`
(`comfortable: 900, acceptable: 600`) constants — all unit-tested, with `recommendation` a
locale-independent `walkway.<rating>` key. `golden-ratio` (9) built the per-room card scaffold in
`PerRoomResults`; `grid-fit` (10) added the second block. This change adds the third and last block,
following the same pattern (reuse the engine, render a thin `'use client'` block, extend the card).
DESIGN §6.3 is the visual source of truth; the frozen prototype (`prototype.dc.html` walk logic,
`:524-530`, `:671`) is the reference geometry.

## Goals / Non-Goals

**Goals**
- Render the three-preset walkway block per DESIGN §6.3 (`FR-WALK-01/02/04`): clearance, fixed-mm
  rating, bar meter, colored rating, localized guidance.
- Keep ratings from the engine's fixed-mm `rateWalkway` so they never scale with M (`FR-WALK-03`,
  `BC-WALK-01`).
- Complete the per-room card and Epic A.

**Non-Goals**
- `oppositeDepth` opposite-wall accounting — explicit `Could` / out of v1 scope (PDR MoSCoW). The
  two-arg `computeWalkways(width, depth)` form is used.
- Editable furniture depths — `Could`, deferred.
- The visualizer (14/15) and anything in Epic B.

## Decisions

### Reuse the engine constants for the preset depths
The three rows are driven by `FURNITURE_DEPTHS.wardrobeKitchen` (600), `.sofa` (900), and
`.facingUnits` (1200) — not hardcoded literals in the component — so the presets have one source of
truth and match the frozen prototype. Each row calls `computeWalkways(room.width, depth)`.

### Corridor dimension is the room width
The frozen prototype uses room **width** as the corridor dimension (`c: W − depth`, `:528-530`).
This change matches it: `computeWalkways(room.width, depth)`. (Length is the golden/long wall; width
is the cross-room passing dimension.) Documented so the choice is explicit, not incidental.

### A tiny `walkwayMeterBars(rating)` helper for the meter
The 3-bar meter maps `comfortable → 3`, `acceptable → 2`, `tight → 1` (from the prototype `wmeta`
`n`). To keep this mapping unit-tested rather than an inline object in JSX, add a pure
`walkwayMeterBars(rating: WalkwayRating): 1 | 2 | 3` to `lib/calculations.ts`. It is trivial but
gives the meter a tested contract and a single definition the component and tests share.

### Rating meaning carried by label + meter, not color alone
Each row renders the rating **text label** (`t('comfortable'|'acceptable'|'tight')`) and the filled
bar count alongside the color, so meaning survives without color (consistent with the
`golden-ratio`/`grid-fit` badge posture and `NFR-A11Y-02`, though that ID is owned elsewhere). Uses
the good/warn/bad token pairs (AA), avoiding the sub-AA `--faint`/accent tokens for the small rating
text.

### Guidance sentence from the engine's recommendation key
`computeWalkways` already returns `recommendation: 'walkway.<rating>'`. The component maps that key
→ the shipped i18n keys (`recComf`/`recAcc`/`recTight`) via a small record, so the guidance prose is
localized while the engine stays language-agnostic — the same pattern used for band names and grid
round-direction.

## Risks / Trade-offs

- **Three rows × three rooms = visual density.** DESIGN §6.3 accepts this — the walkway block is a
  compact rows list. Kept as designed; the meter + short labels keep each row scannable.
- **`facingUnits` (1200) can go negative** for a narrow room (e.g. width 1000 → −200). `rateWalkway`
  rates anything `< 600` as `tight`, so a negative clearance reads `tight` (correct — two facing
  600 units don't fit). The component shows the signed mm value as-is; no special-casing needed, and
  a test pins the negative case.
- **No React/DOM runner (ADR-0001).** `computeWalkways`/`rateWalkway`/`walkwayMeterBars` are
  unit-tested; the block layout, meter, and rows are verified by build+tsc+lint+manual (test plan).

## Migration Plan

Additive. `PerRoomResults` renders one more block per card; `lib/calculations.ts` gains one tiny
helper. No archived change, spec, or state shape is altered. No data migration (`BC-PRIVACY-01`).

## Open Questions

- `OQ-02` (editable furniture depths) stays open with the SME but does not block this change — the
  presets are the v1 defaults (`A-03`). If depths become editable later it is an additive input, not
  a rework of this block.
