# viz-3d-grid Specification

## Purpose
TBD - created by archiving change viz-3d-grid. Update Purpose after archive.
## Requirements

### Requirement: Faint M³ module lattice tiles each room box

A faint M × M × M module lattice SHALL tile each room box in the 3D visualizer, drawn on the module
step along all three axes, so the module's size relative to the whole room volume reads the same way
it does in the 2D visualizer's M × M grid. The lattice SHALL reuse the shared mm→scene scale and stay
inside the lazy `Viz3DScene` chunk (no new dependency, no import in the 2D path). (`FR-VIZ3D-07`,
`NFR-BUNDLE-01`, `TC-STACK-04`)

#### Scenario: Lattice tiles the box on the module step

- **WHEN** the 3D visualizer renders a valid room with module `m`
- **THEN** a faint lattice divides the box into whole M-sized cells along each axis — `floor(l/m)`,
  `floor(w/m)`, `floor(ceiling/m)` guide lines — matching `layoutRoom3D`'s `cols`/`rows`/`layers`
  under one shared scale

#### Scenario: Lattice adds no 3D code to the 2D path

- **WHEN** the app runs in 2D mode (or on first paint)
- **THEN** the lattice geometry is not loaded — it lives only inside `Viz3DScene`, reached solely
  through the `next/dynamic({ ssr:false })` boundary; the pure grid helper in `lib/calculations.ts`
  imports no `@react-three/*` or `three`

### Requirement: Signed grid remainder as partial slabs on the far faces

The signed grid remainder — the leftover past the last whole module along each axis — SHALL render as
a thin partial slab on the corresponding far face of the box, the 3D analogue of the 2D visualizer's
`--warn-bg` remainder edge strip. The remainder per axis SHALL come from a pure, unit-tested helper
(`dim − floor(dim/m)·m`), so it is a data fact rather than a render-time calculation. When a dimension
divides evenly by `m`, no slab renders on that face. (`FR-VIZ3D-07`)

#### Scenario: Off-grid dimension shows a remainder slab

- **WHEN** a room dimension is not an exact multiple of `m` (e.g. 3700 mm at `m` = 600 → 100 mm left)
- **THEN** a thin partial slab renders on that axis's far face, sized to the leftover under the shared
  scale (parity with `Viz2D`'s `rightStrip`/`bottomStrip`)

#### Scenario: Evenly-divisible dimension shows no slab

- **WHEN** a room dimension is an exact multiple of `m`
- **THEN** the remainder for that axis is 0 and no slab renders on that face

### Requirement: Lattice is capped at high room counts and stays read-only

The lattice line/mesh count SHALL be bounded so the frame budget holds at high room counts — past a
threshold the lattice degrades gracefully (fewer guide lines) rather than emitting unbounded geometry
(`NFR-PERF-03`). The lattice SHALL add no interactive control: it is static comprehension geometry,
never edits room geometry, and never exports (`BC-VALUE-01`, `NFR-A11Y-03`). Reduced-motion and
WebGL-fallback behavior are inherited unchanged from `viz-3d`. (`FR-VIZ3D-07`, `NFR-PERF-03`,
`BC-VALUE-01`, `NFR-A11Y-03`)

#### Scenario: Read-only lattice

- **WHEN** the 3D visualizer renders the lattice
- **THEN** it exposes no handler that edits geometry or exports a drawing — the numeric results remain
  the accessible source of truth; camera controls only

#### Scenario: Bounded geometry at high room counts

- **WHEN** many rooms (or a very small module relative to the room) would produce a large number of
  lattice lines
- **THEN** the lattice line count is capped so the render stays within the frame budget rather than
  growing without bound
