## Context

`calculation-engine` (1) shipped `computeVerticalBands(ceiling, m, opening?)` returning
`{ bands, topRemainder, openingAligned, openingBand }`, fully unit-tested. `module-summary` (7)
opened the `showResults`-gated results region with `ModuleSummary` as the first section. This
change adds the second result section — the height-band SVG — following the established
logic/presentation split: a pure layout helper in `lib/calculations.ts` (unit-tested) plus a
presentational `'use client'` SVG component rendered by `Shell`. DESIGN §6.2 is the visual source
of truth; the frozen prototype (`prototype.dc.html` `bands()` method) is the reference geometry.

## Goals / Non-Goals

**Goals**
- A pure `layoutBandDiagram` that turns `computeVerticalBands` output into a render-ready layout
  (bands bottom-to-top, partial band, mm marks with condense flag, opening overlay) so
  `FR-VERT-02/03/04/06` get automated coverage rather than living only in JSX.
- A width-responsive `viewBox` SVG (`FR-VERT-05`, `NFR-RESP-01`) with band names + mm labels.
- Band names as locale-independent keys resolved in the UI (engine stays language-agnostic).

**Non-Goals**
- The other result sections (golden 9, grid 10, walkway 11) and per-room cards.
- The 2D/3D mode toggle (13) — the band diagram is a 3D-mode result, but no toggle exists yet.
- Animation/motion — the band diagram is static; the visualizer motion is changes 14/15.

## Decisions

### A pure `layoutBandDiagram` helper carries all geometry-independent logic
`layoutBandDiagram(ceiling, m, opening?)` returns:
```
{
  bands: { index, from, to, span, nameKey, partial, alt }[],  // bottom-to-top, partial last
  marks: { mm, condensedOut: boolean }[],                     // 0..ceiling; condensedOut hides label
  opening: { mm, aligned } | null,
  condensed: boolean,                                         // true when marks.length > 16
}
```
It calls `computeVerticalBands` for the counts, then builds the band array (full bands + a trailing
`partial` band when `topRemainder > 0`), the mark list (`0, m, 2m, …, ceiling`), and the opening
overlay. All values are in **mm space** (0..ceiling); the component maps mm → SVG y with a single
`viewBox`-relative scale, so the helper is resolution-independent and unit-testable. This keeps
`FR-VERT-02/03/04/06` provable in `node --test` and leaves only pixel mapping + SVG markup in the
component.

### Band-name keys, not English prose (engine stays language-agnostic)
The prototype hardcodes `base / plinth`, `work zone`, `door-head zone`, `upper / ceiling`. The
helper instead emits a `nameKey` per band — `'band.basePlinth' | 'band.workZone' | 'band.doorHead'
| 'band.upperCeiling'` — matching the `WalkwayRecommendationKey` pattern. Rule (from the prototype
`names(i)` logic, simplified to 3D mode):
- band 0 → `basePlinth`;
- the top full band when there's no remainder → `upperCeiling`; the partial band (when remainder
  > 0) → `upperCeiling`;
- a band the opening falls in or on (`i·m < opening ≤ (i+1)·m`) → `doorHead`;
- otherwise → `workZone`.
The UI adds `bandBasePlinth`/`bandWorkZone`/`bandDoorHead`/`bandUpperCeiling` i18n keys (EN + UA,
ported from the prototype strings). Labels stay parity-checked by the shipped i18n test.

### viewBox: `0 0 360 470` (DESIGN §6.2), reconciling FR-VERT-05 and FR-VERT-06
There is a documented drift: **PDR `FR-VERT-05` specifies `viewBox="0 0 200 400"`**, while **DESIGN
§6.2 shows `viewBox="0 0 360 470"`**. The first cut used the PDR literal `200 400`, but review
(CR-001, high) showed it is **too narrow**: with bands filling most of the 200-unit width, the
right-side band-name labels (`upper / ceiling`, `door-head zone`) and the opening tag
(`opening · off-grid`, longer still in UA) overflow the viewBox edge and clip — directly failing
`FR-VERT-06` ("band names on the right … stays legible"). DESIGN §6.2's `360 470` with `x:78,
w:150` bands leaves a wide right gutter precisely to fit these labels. Two owned requirements are in
tension and only the wider box satisfies **both**, so the SVG uses `0 0 360 470`. The load-bearing
`FR-VERT-05` contract (a `viewBox` + `preserveAspectRatio` + width-responsive container with no
fixed pixel size) holds either way; the specific dimensions are proportional. The spec text is
updated to record `360 470` as the shipped value and the PDR literal is flagged for a docs-pass
reconciliation. This is the CR-001 resolution.

### The band diagram renders unconditionally for now (no mode toggle yet)
DESIGN §6.2 tags the band diagram "3D mode only". The mode toggle is change 13 and does not exist,
so there is no `mode` state to read; the app is effectively always in 3D mode. `BandDiagram` renders
whenever `showResults` is true. When `mode-toggle` (13) lands it will gate this section on
`mode === '3d'`. This is noted in the component and in the mode-toggle card's scope, not hidden.

## Risks / Trade-offs

- **Label-condense heuristic is a legibility aid, not exact.** `> 16` marks → keep every 4th + the
  last (from the prototype). At 50 bands this yields ~14 labels; bands still render, only their mm
  labels thin. Unit-tested at 2 / 16 / 17 / 50 boundaries so the flag flips where intended.
- **No React/DOM runner (ADR-0001).** `layoutBandDiagram` is fully unit-tested; the SVG rendering,
  responsiveness, and marker placement are verified by build+tsc+lint+manual (test plan), same as
  prior UI capabilities.

## Migration Plan

Additive. `Shell` renders `<BandDiagram>` after `<ModuleSummary>` inside the existing
`showResults` gate; no archived change, spec, or state shape is modified. No data migration
(`BC-PRIVACY-01`).

## Open Questions

- The DESIGN vs PDR `viewBox` drift (`360 470` vs `200 400`) is worth reconciling in a docs pass so
  the two sources agree; it does not affect behavior. Recorded, not blocking.
