## Context

`calculation-engine` (1) shipped `computeGoldenSplit(length, m)` returning
`{ larger, smaller, largerSnapped, smallerSnapped, snapOffset }`, fully unit-tested. `room-input`
(6) shipped the `rooms: Room[]` state + `isRoomValid`. `module-summary` (7) fixed the active
`state.module`, and `vertical-bands` (8) established the pattern of a result section rendered in the
`showResults`-gated region. This change adds the first **per-room** result block, following the
same logic/presentation split: tiny pure helpers in `lib/calculations.ts` + a presentational
`'use client'` component rendered by `Shell`. DESIGN §6.3 is the visual source of truth.

## Goals / Non-Goals

**Goals**
- Render one card per **valid** room with a header (name + dims + fit badge) and a golden-split
  block (exact, ½M-snapped, offset), per DESIGN §6.3 (`FR-GOLD-01/02/03/04`).
- Make the two caller responsibilities — longer-wall selection (`FR-GOLD-03`) and the
  approximate-fit threshold (`FR-GOLD-04`) — pure and unit-tested, not buried in JSX.
- Establish the per-room card scaffold that grid-fit (10) and walkway (11) extend.

**Non-Goals**
- The grid-fit block (10) and walkway block (11) — separate changes; they add blocks to this card.
- The visualizer (14/15) and the 2D/3D mode toggle (13).
- Any change to `computeGoldenSplit` — reused as-is.

## Decisions

### Two tiny pure helpers carry the caller responsibilities
`computeGoldenSplit` takes a length; the PDR assigns two responsibilities to the caller that this
change owns:
- `longerWall(room: { length: number; width: number }): number` → `Math.max(length, width)`
  (`FR-GOLD-03`).
- `isApproximateFit(snapOffset: number, m: number): boolean` → `snapOffset > m / 4` (`FR-GOLD-04`,
  the ¼M threshold).

Both live in `lib/calculations.ts` so they are unit-tested under `node --test` and the component
stays a thin renderer. This mirrors how the traceability-matrix already records `FR-GOLD-03` as a
"caller responsibility" — now it has a tested home.

### A shared per-room card scaffold, owned here, extended later
DESIGN §6.3 is explicit: one card per valid room, header + **three** stacked blocks (golden, grid,
walkway). This change creates `PerRoomResults` (maps valid rooms → cards, renders the header + fit
badge) and the golden block. Grid-fit (10) and walkway (11) will add their blocks to the same card.
To avoid those later changes having to restructure this one, the card is built as a small
composition: `PerRoomResults` owns the per-room `<article>` + header, and renders
`<GoldenSplitBlock room module />` inside it; changes 10/11 add sibling `<GridFitBlock>` /
`<WalkwayBlock>` components in the same slot. This keeps each block independently ownable and avoids
a monolithic card component that three changes fight over.

### Fit badge lives in the card header, driven by the golden offset
DESIGN §6.3 puts the `clean fit` ✓ / `approximate fit` ≈ badge in the **card header**, and it is
defined by the *golden* snap offset (grid-fit has its own separate `exact/close/poor` quality
badge inside its block). So the header badge is this change's responsibility and reads
`isApproximateFit(goldenSplit.snapOffset, module)`. The badge carries a text label + a glyph
(✓ / ≈), never color alone — consistent with the `NFR-A11Y-02` posture (though that ID is owned by
grid-fit).

### Only valid rooms render
`PerRoomResults` filters `rooms` through `isRoomValid` (the same predicate the `showResults` gate
uses). An invalid room contributes no card — matching DESIGN §6.3 "one per valid room" and the
`FR-SHELL-04` results contract. Because `showResults` already requires ≥1 valid room, the list is
never empty when the results region shows.

## Risks / Trade-offs

- **Floating-point display.** `computeGoldenSplit` returns exact floats (e.g. `2595.6`). The
  component rounds for display (DESIGN shows one decimal for exact, integers for snapped) but the
  helpers/tests assert on the raw engine values with a tolerance, so rounding is a presentation
  concern only. `snapOffset` is shown to one decimal.
- **No React/DOM runner (ADR-0001).** `longerWall`/`isApproximateFit`/`computeGoldenSplit` are
  fully unit-tested; the card rendering, badge, and block layout are verified by
  build+tsc+lint+manual (test plan) — same posture as prior UI capabilities.
- **Card scaffold shared across three changes.** Chosen composition (container owns header, blocks
  are separate components) is the seam that lets 10/11 extend without touching this change's golden
  block. Recorded so those changes follow it rather than rewriting the card.

## Migration Plan

Additive. `Shell` renders `<PerRoomResults>` after `<BandDiagram>` inside the existing
`showResults` gate; no archived change, spec, or state shape is modified. No data migration
(`BC-PRIVACY-01`).

## Open Questions

- None blocking. The `larger`-segment display precision (one decimal vs integer) follows DESIGN
  §6.3; if the SME wants integer-only exact values it is a one-line formatter change.
