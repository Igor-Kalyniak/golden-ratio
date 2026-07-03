# viz-3d Specification

## Purpose
TBD - created by archiving change viz-3d. Update Purpose after archive.
## Requirements

### Requirement: Per-room boxes to scale in a 3D canvas

A `@react-three/fiber` canvas SHALL draw one box per room, sized length × width × ceiling height to
scale, arranged along an axis for scale comparison. It SHALL render only in 3D mode. (`FR-VIZ3D-01`)

#### Scenario: One box per room

- **WHEN** the 3D visualizer renders with `n` valid rooms
- **THEN** the canvas contains `n` room boxes, each with extents proportional to its
  length × width × ceiling under one shared scale, laid out along a single axis

### Requirement: Opening band when provided

When an opening height is provided, it SHALL render as a marked band/plane on a wall face at the
opening's height; when the opening is blank or exceeds the ceiling, no band SHALL render.
(`FR-VIZ3D-02`)

#### Scenario: Opening band shown

- **WHEN** a valid opening height is set in 3D mode
- **THEN** an accent band renders on a wall face at that height (`layoutRoom3D.openingY` is non-null)

#### Scenario: No opening band when blank

- **WHEN** no opening is provided (or it exceeds the ceiling)
- **THEN** no opening band renders (`layoutRoom3D.openingY` is null)

### Requirement: Exactly one highlighted module cube

Exactly one module unit — an M × M × M cube — SHALL be highlighted in the accent color within the
room volume, to convey the module's size relative to the room. (`FR-VIZ3D-03`)

#### Scenario: One accent cube

- **WHEN** the 3D visualizer renders a room
- **THEN** precisely one M³ cube is drawn in the accent color, positioned at a room corner within
  the box volume

### Requirement: Orbit controls and mount/idle motion

The visualizer SHALL provide OrbitControls (rotate, zoom, pan). It MAY add a gentle auto-rotate, a
highlight float/pulse, and a room fade-in on mount. (`FR-VIZ3D-04`)

#### Scenario: Orbit interaction

- **WHEN** the user drags on the canvas
- **THEN** the camera orbits the scene (and supports zoom/pan)

### Requirement: Reduced-motion and loading state

The visualizer SHALL honor `prefers-reduced-motion`: when `reduce` is set, auto-rotate and pulsing
SHALL be disabled. While the Three.js chunk is loading, a loading state SHALL be shown. (`FR-VIZ3D-05`,
`NFR-BUNDLE-01`)

#### Scenario: Reduced motion disables idle animation

- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** auto-rotate and the highlight pulse do not play (the scene is static until interacted
  with)

#### Scenario: Loading state during chunk fetch

- **WHEN** the 3D scene chunk has not yet loaded
- **THEN** a loading placeholder is shown in the visualizer slot

### Requirement: WebGL-unavailable fallback to the 2D visualizer

When WebGL is unavailable, the visualizer SHALL show a graceful message and fall back to the 2D
visualizer rather than failing. (`FR-VIZ3D-06`)

#### Scenario: WebGL unavailable

- **WHEN** the browser reports no WebGL support in 3D mode
- **THEN** a localized message (`webgl`) is shown and the 2D visualizer (`Viz2D`) renders in place of
  the 3D canvas

### Requirement: Three.js is lazy-loaded, out of the 2D and first-paint bundle

The `@react-three/fiber` / `@react-three/drei` code SHALL be loaded only via `next/dynamic` with
`ssr: false`, so the 2D path and first paint carry no 3D dependency. 2D rendering SHALL remain pure
SVG with no 3D import. (`NFR-BUNDLE-01`, `TC-STACK-04`)

#### Scenario: 2D path carries no Three.js

- **WHEN** the app runs in 2D mode (or on first paint)
- **THEN** no `@react-three/*` or `three` module is loaded — the 3D scene module is imported only
  through the dynamic, client-only boundary reached in 3D mode

#### Scenario: Read-only

- **WHEN** the 3D visualizer renders
- **THEN** it exposes no control that edits room geometry or exports a drawing — camera controls
  only (`BC-VALUE-01`)
