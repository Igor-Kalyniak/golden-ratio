## Context

`calculation-engine` (1) shipped `computeRoomGrid(length, width, m)` returning
`{ lengthModules, widthModules, lengthRemainder, widthRemainder, quality }`, fully unit-tested
(exact/close/poor, signed remainders, the 1 mm-short boundary). `golden-ratio` (9) established the
per-room card scaffold in `PerRoomResults` — one card per valid room, header + a stack of blocks,
with `GoldenSplitBlock` as the first. This change adds the second block, following the same
pattern: reuse the pure engine function, render a thin presentational `'use client'` block, extend
the shared card. DESIGN §6.3 is the visual source of truth.

## Goals / Non-Goals

**Goals**
- Render the grid-fit block per DESIGN §6.3: `nL × nW`, signed remainders, round-direction
  annotation, and an accessible quality badge (`FR-GRID-01/02/03/04/05`, `NFR-A11Y-02`).
- Make the round-up/round-down *direction* (the `FR-GRID-03` sign convention) a pure, unit-tested
  helper rather than an inline ternary, and fix the stale engine comment that contradicts it.

**Non-Goals**
- The walkway block (11) — the last per-room block, separate change.
- Any change to `computeRoomGrid`'s returned values — reused as-is (only its doc comment is fixed).
- The visualizer's grid overlay (14) — that reuses these values later.

## Decisions

### `gridRoundDirection(remainder)` — one tested home for the sign convention
`FR-GRID-03` fixes the convention: the remainder is `d − round(d/m)·m`, so a **positive** remainder
means the dimension sits **over** the nearest grid line (round *down* to reach it) and a
**negative** remainder means it sits **under** (round *up*). The frozen prototype encodes exactly
this (`R.remL > 0 ? roundDown : roundUp`, `prototype.dc.html:677`). To keep this out of JSX and
under `node --test`, add:
```
export function gridRoundDirection(remainder: number): 'roundDown' | 'roundUp' | null {
  if (remainder > 0) return 'roundDown';
  if (remainder < 0) return 'roundUp';
  return null;
}
```
It returns a locale-independent key the UI maps via `t()` (same pattern as `WalkwayRecommendationKey`
/ band names). A unit test pins all three branches so the direction can never silently invert.

### Fix the stale `RoomGrid` comment (value already correct)
The `RoomGrid.lengthRemainder` doc comment in `lib/calculations.ts` currently reads
`"negative ⇒ round down, positive ⇒ round up"` — the **reverse** of `FR-GRID-03`, DESIGN §6.3, and
the shipped prototype. The *returned number* is already correct (change 1's tests pin the signed
values, e.g. kitchen +300/−300), so no behavior changes; this is a comment-only correction so the
source stops contradicting the spec. Flagged explicitly for the reviewers as an intentional in-scope
doc fix, not silent drift.

### Quality badge carries text + glyph (NFR-A11Y-02)
The badge renders `t('q' + quality)` (`qexact`/`qclose`/`qpoor`) plus a glyph `✓` / `≈` / `✕`
(`aria-hidden`), colored good/warn/bad. Meaning is conveyed by the label and glyph, never color
alone — reusing the exact fit-badge pattern shipped in `golden-ratio` (9). This is the concrete
discharge of `NFR-A11Y-02` for this block. It also avoids `--faint`/accent for the small badge text
(the sub-AA tokens flagged in `design-system` CR-001), using the good/warn/bad token pairs which
pass AA.

### Extends the golden-ratio card, no restructure
`PerRoomResults` already maps valid rooms to cards and renders `<GoldenSplitBlock>`; this change
renders `<GridFitBlock room module />` as the next sibling in the same card. `GridFitBlock` takes
`room` + `module` and calls `computeRoomGrid` itself (a single call per block; no cross-block
duplication like the golden badge had, since the grid quality is self-contained in this block — the
card header badge stays golden-driven per DESIGN §6.3).

## Risks / Trade-offs

- **Two badges per card could confuse.** DESIGN §6.3 is explicit: the *header* badge is the golden
  fit (`clean`/`approximate`), and the grid block has its *own* `exact`/`close`/`poor` quality
  badge. They measure different things; labels + distinct glyphs keep them distinguishable. Kept as
  designed.
- **No React/DOM runner (ADR-0001).** `computeRoomGrid` + `gridRoundDirection` are unit-tested; the
  block layout, badge, and annotation rendering are verified by build+tsc+lint+manual (test plan).

## Migration Plan

Additive. `PerRoomResults` renders one more block per card; `lib/calculations.ts` gains a helper and
a corrected comment. No archived change, spec, or state shape is altered (the corrected comment is
in the live engine file, whose behavior is unchanged). No data migration (`BC-PRIVACY-01`).

## Open Questions

- None blocking. Remainder display precision is integer mm (remainders are always integers when
  dimensions and module are integers), so no rounding decision is needed.
