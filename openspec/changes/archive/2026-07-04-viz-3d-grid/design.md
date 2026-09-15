## Context

`viz-3d` (15) shipped [`Viz3DScene`](../../../components/Viz3DScene.tsx) — a lazy `@react-three/fiber`
canvas with one translucent `RoomBox` per room (box + wireframe + opening band + one highlighted M³
cube), driven by the pure [`layoutRoom3D`](../../../lib/calculations.ts) geometry helper. The 2D
counterpart [`Viz2D`](../../../components/Viz2D.tsx) additionally draws a faint M × M grid and a signed
`--warn-bg` remainder strip via [`layoutRoom2D`](../../../lib/calculations.ts), which returns
`cols/rows/rightStrip/bottomStrip`. This change closes the parity gap: the 3D box gains the same
lattice + remainder story. It touches only the engine helper (pure, tested) and `Viz3DScene` (inside
the already-lazy chunk). No new dependency, no i18n, no state, no reduced-motion/WebGL change.

## Goals / Non-Goals

**Goals**
- A faint M³ lattice inside each room box on the module step, using the existing shared scene scale.
- Signed remainder rendered as thin partial slabs on the far faces (3D analogue of 2D's edge strips).
- The grid geometry comes from a pure, unit-tested helper (parity with `layoutRoom2D`) so
  `FR-VIZ3D-07` is verifiable without a canvas (ADR-0001).
- Three.js stays confined to the lazy `Viz3DScene` chunk (`NFR-BUNDLE-01` re-verified); line count
  capped at high room counts (`NFR-PERF-03`).

**Non-Goals**
- No change to boxes, opening band, the highlighted cube, OrbitControls, auto-rotate, float, fade-in,
  reduced-motion handling, or the WebGL fallback — all inherited from change 15 unchanged.
- No new animation on the lattice (it is static geometry).
- No i18n, no new dependency, no state/reducer change, no export.

## Decisions

### 1. Extend `layoutRoom3D` in place with per-axis remainders (not a separate `layoutGrid3D`)
`layoutRoom3D` already returns `cols/rows/layers` and the box extents; adding three sibling fields
`lengthRemainder`/`widthRemainder`/`heightRemainder` (`dim − floor(dim/m)·m`) keeps a single geometry
source per room and avoids a second helper that could drift from the first. This mirrors
`layoutRoom2D` returning `cols/rows` **and** `rightStrip/bottomStrip` together. The added fields are
purely additive — existing `Viz3DScene` reads are unaffected, existing `layoutRoom3D` tests stay
green. *(Alternative — a standalone `layoutGrid3D` — rejected: needless duplication of the same
`floor`/remainder math the box helper already does.)*

### 2. Lattice as thin line meshes on the M step, reusing the shared `scale`
In `RoomBox`, build the guide lines from the existing `w`/`h`/`d` scene extents and `step = m*scale`:
verticals/horizontals/depth-lines at each whole-module offset that falls strictly inside the box
(same `< bound` filter `Viz2D` uses so a full edge isn't double-drawn). Render as a faint line
material consistent with the existing `#5a6474` wireframe / 2D `--line` token so it reads as a grid,
not chrome. The single highlighted M³ cube already present stays the accent focal point (exactly one
accent element — the lattice is faint/neutral, so `FR-VIZ3D-03`'s "exactly one highlighted" holds).

### 3. Remainder slabs on the far faces, `--warn-bg` analogue
For each axis whose remainder > 0, draw one thin slab occupying the leftover span at the far face
(the analogue of `Viz2D`'s `rightStrip`/`bottomStrip` rects). Color samples the same warn token
family used in 2D (a resolved CSS value or a fixed warn color), kept clearly distinct from the accent
cube. Zero remainder → no slab (a data fact from the helper).

### 4. Cap the lattice line count for the frame budget (`NFR-PERF-03`)
The total lattice line count scales with `Σ(cols+rows+layers)` across rooms. Guard it with a bound:
past a per-scene threshold, skip drawing the lattice (or draw only the coarsest axis) so geometry
stays bounded rather than growing without limit — the 3D analogue of keeping the redraw cheap. The
highlighted cube, box, and remainder slabs (a bounded, ≤3-per-room count) always render. This makes
the acknowledged `viz-3d` "no explicit room cap" note concrete for the lattice specifically.

## Risks / Trade-offs

- **Visual clutter** — a dense lattice on many boxes could read as noise. Mitigation: faint neutral
  line material, the cap in Decision 4, and keeping the single accent cube as the only saturated
  element.
- **`NFR-BUNDLE-01` regression** — must not add any static `@react-three`/`three` import outside
  `Viz3DScene`. Mitigation: the helper stays framework-free (tested), the lattice geometry lives in
  the existing lazy component; re-verify with the production build chunk split.
- **Line-primitive perf** — many thin line segments can be cheaper as a single merged/instanced
  geometry than many `<line>` meshes. Mitigation: acceptable at the capped counts; can merge later if
  a benchmark shows a hit. Kept simple for this additive `Should` change.

## Migration Plan

Additive only. `layoutRoom3D`'s new fields are optional consumers' concern — no caller breaks. No
data migration, no state shape change, no persisted anything. If cut, the 3D view reverts to the
shipped change-15 behavior with no other impact.

## Open Questions

- Exact lattice cap threshold (line count vs room count) — pick a conservative constant during apply
  and document it; tunable later, not blocking.
- Whether to draw all three axes' interior lines or only the two floor-plan axes plus vertical guides
  — resolve during apply toward the clearest read; the helper returns all three counts regardless.
