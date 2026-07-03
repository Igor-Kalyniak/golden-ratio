## Context

`mode-toggle` (13) added `mode: '2d' | '3d'` and gates results by mode (the band diagram is 3D-only).
2D mode currently renders only the numeric results. DESIGN §6.4 specifies a read-only module
visualizer: in 2D, each room is a scaled plan rectangle with a faint M×M grid, a signed-remainder
strip, and one highlighted accent cell. The frozen prototype (`prototype.dc.html` `viz2D()`,
`:564-586`) is the reference geometry. This change follows the established logic/presentation split
— a pure layout helper in `lib/calculations.ts` (unit-tested) + a presentational `'use client'` SVG
component rendered by `Shell` when `mode === '2d'`.

## Goals / Non-Goals

**Goals**
- Per-room to-scale SVG rectangles, faint M×M grid, signed-remainder edge strip, exactly one accent
  cell, width-responsive (`FR-VIZ2D-01/02/03`, `NFR-PERF-03`).
- Reuse the shipped `cellpulse` keyframe on the highlighted cell; reduced-motion honored
  (`FR-VIZ2D-04/05`). The animate-in/tween clauses of FR-VIZ2D-04 are `MAY` (a `Should` req),
  satisfied by the pulse; `griddraw` is available but intentionally not applied to the grid lines.
- Read-only — no geometry editing, no export (`BC-VALUE-01`).

**Non-Goals**
- The 3D scene and its WebGL fallback — `viz-3d` (15).
- Any new module math — reuses the shipped module; `layoutRoom2D` is grid geometry only.
- Editing/positioning rooms as a floor plan — explicitly forbidden (`BC-VALUE-01`).

## Decisions

### A pure `layoutRoom2D(length, width, m)` in module-space
Returns `{ cols, rows, rightStrip, bottomStrip, highlight }` where `cols = floor(length/m)`,
`rows = floor(width/m)` (whole cells that fit), `rightStrip = length − cols·m` and
`bottomStrip = width − rows·m` (the signed remainders, ≥ 0, surfaced only when > 0), and `highlight`
is the single M×M cell position (bottom-left: `{ col: 0, row: rows-1 }`, or `{col:0,row:0}` when
`rows === 0`). All values are in **module/mm space**, not pixels — the component multiplies by one
shared scale factor to map to the `viewBox`. This keeps `FR-VIZ2D-02` (grid + remainder) and
`FR-VIZ2D-03` (one cell) unit-testable and leaves only the pixel mapping + SVG markup in the leaf.

### `floor`-based tiling, deliberately distinct from `computeRoomGrid`
The grid-fit result (change 10) uses `round(dim/m)` — the *nearest* module count, for "how well does
this fit" quality. The visualizer instead tiles `floor(dim/m)` *whole cells that actually fit inside
the rectangle*, with the leftover shown as a strip — matching the prototype and the physical "how
many whole modules span this wall" reading. These are different questions; using `floor` here is
correct and not a divergence from change 10. The caption shows `cols×rows` (the floor counts), and
design.md records the distinction so a reviewer doesn't flag it as an inconsistency with grid-fit.

### Scale: one shared factor across all rooms
Like the prototype's `vizScale`, a single factor `scale = TARGET / maxDimensionAcrossRooms` maps mm
→ viewBox units for every room, so rooms are comparable in size at a glance (a big room draws bigger
than a small one). Each room's SVG `viewBox` is sized to its own rectangle + padding; the shared
scale is what makes cross-room comparison honest. This is a component concern (pixel space), not in
the pure helper.

### Reduced-motion is already free
`FR-VIZ2D-05` needs no new code: `app/globals.css` ships
`@media (prefers-reduced-motion: reduce) { *,::before,::after { animation: none !important } }`, so
the `cellpulse` animation snaps automatically. The component just applies the keyframe;
the global rule suppresses them. Documented so it isn't re-implemented per-component.

### Read-only by construction (BC-VALUE-01)
`Viz2D` takes `rooms` + `module` (+ `mode` gating in Shell) and renders SVG. It has **no** event
handlers, no inputs, no export button — there is no code path to edit geometry. The header carries
the DESIGN §6.4 read-only note (`vizNote`, already shipped) so the intent is on-screen.

### Gated on `mode === '2d'` in Shell
Mirrors the `mode === '3d'` gate on `<BandDiagram>`. In 3D the visualizer slot will be `viz-3d` (15);
until then 3D shows no visualizer (only the band diagram), which is correct — the 2D plan view is a
2D-mode concept.

## Risks / Trade-offs

- **`floor` vs `round` cell count could look inconsistent with the grid-fit badge.** e.g. a room
  1 mm short of 6 modules shows `5×…` cells + a near-full strip here, but grid-fit reads `6 close`.
  This is intended (fit-inside vs nearest); the caption and the strip make the leftover visible.
  Flagged for reviewers so it isn't mistaken for a bug.
- **No React/DOM runner (ADR-0001).** `layoutRoom2D` is unit-tested; the SVG rendering,
  responsiveness, animation, and reduced-motion are verified by build+tsc+lint+manual (test plan)
  and a runtime observation of the 2D surface.

## Migration Plan

Additive. `Shell` renders `<Viz2D>` in the 2D branch of the results region; `lib/calculations.ts`
gains one pure helper. No archived change, spec, or state shape altered. No data migration
(`BC-PRIVACY-01`). No new dependency.

## Open Questions

- None blocking. `viz-3d` (15) will add the 3D scene + WebGL fallback that reuses this component;
  this change exposes nothing it needs beyond the shipped `mode` state.
