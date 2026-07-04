## Why

`viz-3d` (15) shipped the read-only 3D module visualizer: a translucent room box, an outer wireframe,
an opening band, and exactly one highlighted M³ cube. But it stops short of the **module grid** that
makes the 2D visualizer legible. In 2D, [`Viz2D`](../../../components/Viz2D.tsx) tiles each room with
a faint M × M grid, marks the signed remainder as a thin `--warn-bg` edge strip, and highlights one
accent cell — so the module's size relative to the room reads at a glance. In 3D there is no lattice
at all, so the single cube floats in an empty box and the "how many modules fit" story the 2D view
tells is missing. This change brings the **3D** visualizer to **visual parity** with the 2D one by
drawing an **M × M × M module lattice inside each room box**, plus thin partial "remainder slabs" on
the far faces (the 3D analogue of 2D's edge strips).

It is purely **additive polish** on a shipped view — `Should`, iteration 3, cuttable without breaking
anything. The grid math mirrors the already-shipped `layoutRoom2D`, so risk is low. The load-bearing
constraints are re-verified, not newly introduced: the lattice stays **inside the lazy
`Viz3DScene` chunk** so Three.js never reaches the 2D path or first paint (`NFR-BUNDLE-01`,
`TC-STACK-04`); the line/mesh count is **capped at high room counts** (`NFR-PERF-03`); the view stays
**read-only** (`BC-VALUE-01`); and the numeric results remain the accessible source of truth
(`NFR-A11Y-03`). Capability 17 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md); its sole
prerequisite `viz-3d` (15) is archived. Owns a **new `FR-VIZ3D-07`** (added to
[docs/PDR.md](../../../../docs/PDR.md), mirroring `FR-VIZ2D-02` in 3D) and re-verifies `NFR-BUNDLE-01`,
`TC-STACK-04`, `NFR-PERF-03`, `NFR-A11Y-03`, `BC-VALUE-01`.

## What Changes

- **`lib/calculations.ts` extended (pure)**: add a pure, framework-free helper that returns the
  per-axis whole-module counts **and** the signed remainder per axis for a room box — the 3D parity
  of `layoutRoom2D`'s `cols/rows/rightStrip/bottomStrip`. `layoutRoom3D` already returns
  `cols/rows/layers`; this change adds the three **remainders** (`lengthRemainder`, `widthRemainder`,
  `heightRemainder = dim − floor(dim/m)·m`) so the far-face partial slabs are a data fact, not a
  render-time calculation. Extended in place (or via a small `layoutGrid3D`) and unit-tested like the
  rest of the engine, so `FR-VIZ3D-07` is testable without a canvas (ADR-0001).
- **`components/Viz3DScene.tsx` (the heavy lazy chunk)**: inside each `RoomBox`, draw a faint 3D
  module lattice on the M step — grid lines (or instanced edges) spanning the box on each axis — and
  render the signed remainder as thin partial slabs on the far faces (the 3D `--warn-bg` analogue).
  Reuses the existing shared mm→scene `scale` and the already-present highlighted M³ cube. The
  lattice line count is **capped**: past a threshold room/line count the lattice degrades (e.g. draws
  fewer guide lines or omits the finest step) so the frame budget holds (`NFR-PERF-03`).
- **`lib/calculations.test.ts` extended**: unit tests for the new remainders — evenly-divisible dims
  give zero remainder; a 1 mm-short / off-grid dim gives the expected signed leftover; parity with
  `layoutRoom2D`'s strips on the shared length/width axes.
- **No new dependency, no i18n changes** — the R3F stack is already installed and confined to
  `Viz3DScene`; the lattice adds only geometry to the existing scene. `visualizer`/`vizNote`/`3D`
  labels already ship.

Scope: the 3D lattice only. Reduced-motion + WebGL-fallback behavior is **unchanged** — inherited
from `viz-3d` (15): the lattice is static geometry (no new animation), WebGL-off still falls back to
`Viz2D`. Bundle discipline stays the load-bearing constraint: the new geometry lives entirely in the
already-lazy `Viz3DScene`, and the engine helper stays framework-free, so the 2D path carries no
`@react-three` import.

## Capabilities

### New Capabilities
- `viz-3d-grid`: a faint M³ module lattice tiling each 3D room box, with the signed grid remainder
  rendered as thin partial slabs on the far faces — bringing the 3D visualizer to visual parity with
  the 2D module grid, kept inside the lazy Three.js chunk and capped at high room counts.

### Modified Capabilities
<!-- none — the viz-3d spec's boxes/opening/cube/orbit/reduced-motion/fallback requirements are
     unchanged; this change only adds the lattice. -->

## Impact

- **Files:** extend `lib/calculations.ts` (`layoutRoom3D` remainders / `layoutGrid3D`) + tests; edit
  `components/Viz3DScene.tsx` (lattice + remainder slabs inside `RoomBox`). Add `FR-VIZ3D-07` to
  `docs/PDR.md`. **No new dependency.**
- **Requirements owned:** `FR-VIZ3D-07` (new); re-verifies `NFR-BUNDLE-01`, `TC-STACK-04`,
  `NFR-PERF-03`, `NFR-A11Y-03`, `BC-VALUE-01`.
- **Consumes (shipped):** `layoutRoom3D` + the shared scene `scale` and `RoomBox` from change 15;
  `state.rooms`/active `module`/`ceiling`/`opening`.
- **Enables:** closes the 2D↔3D visual-parity gap; no capabilities remain after this in the backlog.
