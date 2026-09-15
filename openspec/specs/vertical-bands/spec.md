# vertical-bands Specification

## Purpose
TBD - created by archiving change vertical-bands. Update Purpose after archive.
## Requirements

### Requirement: Band layout derives full and partial bands from the engine

The band diagram SHALL derive its layout from `computeVerticalBands(ceiling, m)`: `floor(ceiling / m)`
full module bands ordered bottom-to-top, plus one trailing **partial** band when
`topRemainder = ceiling − bands·m > 0`. The band count SHALL be computed, never hardcoded, and the
layout SHALL render correctly from 2 bands to 50+. (`FR-VERT-01`, `FR-VERT-02`, `FR-VERT-03`)

#### Scenario: Ceiling divisible by module — no partial band

- **WHEN** ceiling is 2800 and module is 700
- **THEN** the layout has 4 full bands and no partial band (`topRemainder = 0`)

#### Scenario: Ceiling not divisible — trailing partial band

- **WHEN** ceiling is 3000 and module is 700
- **THEN** the layout has 4 full bands (`floor(3000/700) = 4`) plus one partial band spanning the
  leftover `200` mm, flagged `partial`

#### Scenario: Large band count stays derived

- **WHEN** ceiling is 5000 and module is 100
- **THEN** the layout has 50 bands, derived from `floor(5000/100)`, not a capped constant

### Requirement: Opening marker with on/off-grid state

When an opening height is provided, the band diagram SHALL mark it at its true height and flag
whether it lands on a band boundary. `aligned` SHALL be true only when `opening` is an exact
multiple of the module; otherwise the marker SHALL be drawn off-grid at the true height.
(`FR-VERT-04`)

#### Scenario: Opening on a band boundary

- **WHEN** opening is 2100 and module is 700
- **THEN** the opening overlay is present with `aligned = true` (2100 is a multiple of 700)

#### Scenario: Opening off the grid

- **WHEN** opening is 2100 and module is 400
- **THEN** the opening overlay is present with `aligned = false` and the marker sits at the true
  height 2100

### Requirement: Responsive viewBox SVG

The band diagram SHALL be an SVG using a `viewBox` with `preserveAspectRatio`, in a
width-responsive container with no fixed pixel width, so it scales down on small screens. The
`viewBox` SHALL be sized so band-name and opening labels fit without clipping in both locales
(`0 0 360 470`, per DESIGN §6.2; the `FR-VERT-05` literal `200 400` was too narrow for the
right-side labels). (`FR-VERT-05`, `FR-VERT-06`, `NFR-RESP-01`)

#### Scenario: Scales without a fixed width

- **WHEN** the diagram renders in a narrow container
- **THEN** the SVG scales via its `viewBox`/`preserveAspectRatio` with no hardcoded pixel width or
  height on the element

### Requirement: mm labels, band names, and label condensing

The band diagram SHALL show mm marks up the left edge and band names on the right. Band names SHALL
come from locale-independent keys mapped through `t()` (never hardcoded prose in the engine). When
the mark count is large (more than 16), labels SHALL be condensed — keep every fourth mark plus the
last — so the diagram stays legible at high band counts. (`FR-VERT-06`)

#### Scenario: Sparse marks shown in full

- **WHEN** the diagram has 4 bands (5 marks)
- **THEN** every mm mark label is shown (no condensing)

#### Scenario: Dense marks condensed

- **WHEN** the diagram has 50 bands (51 marks, > 16)
- **THEN** the marks are condensed to every fourth plus the last, and each band still resolves a
  localized name

#### Scenario: Band names are localized keys

- **WHEN** the layout is built
- **THEN** each band carries a name key (`band.basePlinth` / `band.workZone` / `band.doorHead` /
  `band.upperCeiling`), which the UI resolves via `t()` — the engine emits no English prose
