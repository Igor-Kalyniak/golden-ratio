# grid-fit Specification

## Purpose

Per-room fit of length × width to the module grid — module counts and signed nearest-grid
remainders with an exact/close/poor quality rating (`FR-GRID-01`–`FR-GRID-05`).

## Requirements

### Requirement: Per-room grid fit shows module counts and signed remainders

Each valid room's grid-fit block SHALL show the room as `lengthModules × widthModules` (each
`round(dimension / module)`) and the signed remainder to the nearest grid line per dimension, from
`computeRoomGrid(length, width, module)`. Remainders SHALL be displayed with an explicit sign.
(`FR-GRID-01`, `FR-GRID-02`, `FR-GRID-03`, `FR-GRID-05`)

#### Scenario: Exact fit

- **WHEN** a room is 4200 × 3500 with module 700
- **THEN** the block shows `6 × 5` modules with remainders `0 / 0`

#### Scenario: Signed remainders

- **WHEN** a room is 3800 × 2500 with module 700
- **THEN** the block shows `5 × 4` modules with remainders `+300` (length, `3800 − 5·700`) and
  `−300` (width, `2500 − 4·700`)

### Requirement: Round-up / round-down annotation follows the sign convention

For each non-zero remainder, the block SHALL annotate the direction to reach the grid: a
**positive** remainder (dimension over the grid) reads **"round down"**, a **negative** remainder
(under the grid) reads **"round up"**, on the corresponding dimension. A zero remainder SHALL
produce no annotation. (`FR-GRID-03`)

#### Scenario: Positive remainder rounds down

- **WHEN** the length remainder is `+300` (dimension over the grid)
- **THEN** the annotation reads `round down on length`

#### Scenario: Negative remainder rounds up

- **WHEN** the width remainder is `−300` (dimension under the grid)
- **THEN** the annotation reads `round up on width`

#### Scenario: Zero remainder has no annotation

- **WHEN** a remainder is `0`
- **THEN** no round-up/round-down annotation is shown for that dimension

### Requirement: Accessible quality badge

The block SHALL show a quality badge — `exact` / `close` / `poor` from `computeRoomGrid` — whose
meaning is conveyed by a text label **and** a glyph (not color alone), satisfying `NFR-A11Y-02`.
Quality is `exact` when both nearest-distances are 0, `close` when both ≤ ¼M, `poor` otherwise; a
dimension 1 mm short of a module SHALL read `close`, not `poor`. (`FR-GRID-04`, `FR-GRID-05`,
`NFR-A11Y-02`)

#### Scenario: Close, not poor, for a near miss

- **WHEN** a room is 2150 × 1500 with module 700 (remainders +50 / +100, both ≤ 175)
- **THEN** the quality badge reads `close`

#### Scenario: Poor when a remainder exceeds a quarter module

- **WHEN** a room is 3800 × 2500 with module 700 (remainders +300 / −300, magnitude 300 > ¼M = 175)
- **THEN** the quality badge reads `poor`

#### Scenario: Badge does not rely on color alone

- **WHEN** the quality badge renders
- **THEN** it includes a text label and a glyph (`✓` / `≈` / `✕`), not color as the sole cue
