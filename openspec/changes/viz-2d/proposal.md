## Why

`mode-toggle` (13) made 2D mode real, but 2D mode currently shows only numbers — the *point* of 2D
mode is the read-only visual that conveys how big the module is relative to each room. `viz-2d`
adds that: a width-responsive SVG that draws each room as a to-scale plan rectangle, tiles it with a
faint M×M grid, marks the signed grid remainder as a thin edge strip, and **highlights exactly one
module cell** in the accent color so the architect sees the module's size at a glance. It is a
**comprehension aid, read-only** — never a floor-plan editor, never exported (`BC-VALUE-01`). This
is the first of the two visualizers; it must land before `viz-3d` (15) because the 2D view is also
the 3D WebGL fallback (`FR-VIZ3D-06`). Capability 14 in
[docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md); its prerequisites `mode-toggle` (13),
`module-2d` (12), and `calculation-engine` (1) are archived. Owns `FR-VIZ2D-01/02/03/04/05`,
`NFR-PERF-03`, `BC-VALUE-01`.

## What Changes

- **`lib/calculations.ts` extended (pure)**: add `layoutRoom2D(length, width, m)` returning the
  render-ready, framework-free 2D layout in **module-space** — `cols = floor(length/m)`,
  `rows = floor(width/m)` full cells; the signed remainder strips (`rightStrip = length − cols·m`,
  `bottomStrip = width − rows·m`, each surfaced only when > 0); and the highlighted-cell position
  (bottom-left, one M×M cell). The mm→pixel scale stays in the component; this helper holds the
  cell/strip counts so `FR-VIZ2D-02` is unit-testable. (Note: the visualizer tiles `floor(dim/m)`
  full cells — a *fit-to-grid* view — distinct from `computeRoomGrid`'s `round`-based module count
  used for the grid-fit result; the two measure different things and both are correct.)
- **`components/Viz2D.tsx` (`'use client'`)**: the 2D module visualizer (DESIGN §6.4). A header
  (`Module visualizer 2D` + a `1 module` accent swatch + the read-only note), then a row/wrap of
  per-room SVGs — each a to-scale `--inset` rectangle (`FR-VIZ2D-01`), a faint M×M grid
  (`--line`), a `--warn-bg` remainder strip on the far right/bottom edge (`FR-VIZ2D-02`), and
  exactly one `--accent` highlighted cell with the shipped `cellpulse` animation (`FR-VIZ2D-03/04`).
  Each room captioned `name · L × W · cols×rows`. Width-responsive `viewBox`, no fixed pixel size
  (`FR-VIZ2D-01`, `NFR-PERF-03`). Read-only — no handlers, no export (`BC-VALUE-01`).
- **`components/Shell.tsx`**: render `<Viz2D>` in the results region **when `mode === '2d'`**
  (mirroring how `<BandDiagram>` is gated to 3D). Per DESIGN §6.4 the visualizer is mode-specific;
  the 3D scene is `viz-3d` (15).
- **`locales/en.json` + `locales/ua.json`**: add `oneModule` (the "1 module" swatch label);
  `visualizer`, `vizNote` already shipped.
- **`lib/calculations.test.ts` extended**: unit tests for `layoutRoom2D` — exact fit (no strips),
  a remainder on one/both axes, the highlighted cell is a single M×M cell at the expected corner,
  and `cols`/`rows` = `floor(dim/m)`.

Motion (`FR-VIZ2D-04`, a `Should` whose animate-in/tween clauses are `MAY`) uses the shipped
`cellpulse` keyframe on the highlighted cell; **reduced-motion
(`FR-VIZ2D-05`) is already honored globally** — `app/globals.css` has
`@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important } }`,
so animations snap for free. Scope stays the **2D** visualizer; `viz-3d` (15), the WebGL fallback,
and the header logo (16) are out of scope. The visualizer is supplementary — the numeric results
remain the accessible source of truth (`NFR-A11Y-03`, owned by 13).

## Capabilities

### New Capabilities
- `viz-2d`: the read-only 2D SVG module visualizer — per-room to-scale plan rectangles, a faint M×M
  grid with a signed-remainder edge strip, and exactly one highlighted accent module cell,
  width-responsive and reduced-motion-safe.

### Modified Capabilities
<!-- none — mode-toggle's spec is unchanged; this adds a new 2D-mode result section. -->

## Impact

- **Files:** extend `lib/calculations.ts` (`layoutRoom2D` + types) + tests; add
  `components/Viz2D.tsx`; edit `components/Shell.tsx`; add 1 key to each `locales/*.json`. **No new
  dependency** — pure SVG + Tailwind (the `@react-three/*` deps are for `viz-3d`, 15).
- **Requirements owned:** `FR-VIZ2D-01/02/03/04/05`, `NFR-PERF-03`, `BC-VALUE-01`.
- **Consumes (shipped):** `state.rooms`/`state.mode`/active `module` from `Calculator`; `isRoomValid`
  from `lib/app-state.ts`; the `cellpulse` keyframe + reduced-motion from `design-system`;
  `useI18n`.
- **Enables:** `viz-3d` (15) reuses this as the WebGL-unavailable fallback (`FR-VIZ3D-06`).
