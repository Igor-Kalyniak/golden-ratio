## ADDED Requirements

### Requirement: Per-room to-scale plan rectangles in a responsive SVG

The 2D visualizer SHALL draw each valid room as a plan rectangle (length × width) to scale, laid
out in a simple row that wraps — not a floor plan (no walls, adjacency, or positioning). It SHALL
use a width-responsive `viewBox` with no fixed pixel size, and SHALL render only when the mode is
2D. (`FR-VIZ2D-01`, `NFR-PERF-03`)

#### Scenario: Rooms drawn to scale

- **WHEN** the mode is 2D with rooms of different sizes
- **THEN** each room is an independent rectangle whose width:height ratio matches its length:width,
  scaled by a shared factor, laid out in a wrapping row

#### Scenario: Responsive, not a floor plan

- **WHEN** the container narrows
- **THEN** each room SVG scales via its `viewBox` with no hardcoded pixel width, and rooms are not
  positioned relative to one another as a plan

### Requirement: Faint module grid with a signed-remainder edge strip

Each room SHALL be tiled with a faint M × M module grid. The signed grid remainder — the leftover
after `floor(dimension / m)` whole modules — SHALL render as a thin partial strip at the far edge
(right for length, bottom for width), shown only when that remainder is greater than zero.
(`FR-VIZ2D-02`)

#### Scenario: Exact fit — no strip

- **WHEN** a room's length and width are exact multiples of the module
- **THEN** the grid tiles the whole rectangle and no remainder strip renders

#### Scenario: Remainder strip on the far edge

- **WHEN** a room's length is not a multiple of the module (leftover > 0)
- **THEN** a thin strip renders at the right edge spanning the leftover width; likewise a
  bottom strip for a width remainder

### Requirement: Exactly one highlighted module cell

Exactly one module cell SHALL be highlighted in the accent color to convey the module's size
relative to the whole room. The highlight SHALL be a single M × M cell. (`FR-VIZ2D-03`)

#### Scenario: One accent cell

- **WHEN** the visualizer renders a room
- **THEN** precisely one M × M cell is filled in the accent color (not zero, not many)

### Requirement: Motion honors reduced-motion

The visualizer SHALL honor `prefers-reduced-motion`: when `reduce` is set, its animations SHALL
snap rather than play (rendering in their final state immediately). Absent that preference, grid
lines MAY animate in, the highlighted cell MAY pulse, and the rectangles/grid MAY tween on input
change. (`FR-VIZ2D-04`, `FR-VIZ2D-05`)

#### Scenario: Reduced motion snaps

- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** the grid/cell animations do not play (they render in their final state immediately)

### Requirement: Read-only comprehension aid

The visualizer SHALL be strictly read-only — it conveys the module's scale and never lets the user
edit geometry, lay out a floor plan, or export a drawing. Numeric results remain the source of
truth. (`BC-VALUE-01`)

#### Scenario: No editing affordance

- **WHEN** the visualizer renders
- **THEN** it exposes no control that edits room geometry or exports a drawing — it is display-only
