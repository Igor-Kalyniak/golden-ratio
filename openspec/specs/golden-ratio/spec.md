# golden-ratio Specification

## Purpose
TBD - created by archiving change golden-ratio. Update Purpose after archive.
## Requirements

### Requirement: Golden split of each room's longer wall

Each valid room's golden-ratio split SHALL be computed on its **longer** wall —
`max(length, width)` — via `computeGoldenSplit(longerWall, module)`. The split SHALL divide the
wall as `larger = length × 0.618` and `smaller = length × 0.382`. (`FR-GOLD-01`, `FR-GOLD-02`,
`FR-GOLD-03`)

#### Scenario: Longer wall is chosen

- **WHEN** a room is 3500 × 4200
- **THEN** the golden split is applied to 4200 (the longer wall), not 3500

#### Scenario: Square room uses the shared dimension

- **WHEN** a room is 3000 × 3000
- **THEN** the golden split is applied to 3000

#### Scenario: Exact split fractions

- **WHEN** the longer wall is 4200
- **THEN** `larger ≈ 2595.6` (4200 × 0.618) and `smaller ≈ 1604.4` (4200 × 0.382)

### Requirement: Snapped values and snap offset shown

Each room's golden block SHALL show the exact larger/smaller segments, the ½M-snapped values
(`largerSnapped` rounded to the nearest `module / 2` grid line, `smallerSnapped = longerWall −
largerSnapped`), and the `snapOffset` (`|larger − largerSnapped|`). (`FR-GOLD-02`, `FR-GOLD-04`)

#### Scenario: Snapped to the half-module grid

- **WHEN** the longer wall is 4200 and the module is 700 (½M = 350)
- **THEN** `largerSnapped = 2450` (2595.6 snapped to the nearest 350), `smallerSnapped = 1750`, and
  `snapOffset ≈ 145.6`

### Requirement: Approximate-fit flag when the offset exceeds a quarter module

A room's golden result SHALL be flagged **"approximate fit"** when its `snapOffset` is greater than
a quarter module (`module / 4`); otherwise it SHALL read **"clean fit"**. Both the exact and snapped
values SHALL remain visible regardless of the flag. (`FR-GOLD-04`)

#### Scenario: Large offset flagged approximate

- **WHEN** the longer wall is 4200 and the module is 700 (¼M = 175), giving `snapOffset ≈ 145.6`
- **THEN** the result reads `clean fit` (145.6 ≤ 175)

#### Scenario: Offset above the quarter-module threshold

- **WHEN** a room's `snapOffset` exceeds `module / 4`
- **THEN** the result is flagged `approximate fit` and both exact and snapped values still show

#### Scenario: Only valid rooms produce a card

- **WHEN** the room list contains an invalid room (failing `isRoomValid`)
- **THEN** no golden card is rendered for that room; only valid rooms produce results
