## ADDED Requirements

### Requirement: Per-room walkway clearances for common furniture presets

Each valid room's walkway block SHALL show clearance estimates for three furniture presets —
wardrobe/kitchen (600 mm depth), sofa/bed centre (900 mm depth), and between facing 600 mm units
(1200 mm combined depth) — each computed by `computeWalkways(roomWidth, depth)` where the corridor
dimension is the room width. Each row SHALL show the available clearance in mm. (`FR-WALK-01`,
`FR-WALK-02`, `FR-WALK-04`)

#### Scenario: Three preset rows

- **WHEN** a room's walkway block renders
- **THEN** it shows three rows for depths 600, 900, and 1200 mm

#### Scenario: Clearance is width minus depth

- **WHEN** a room is 3500 mm wide and the preset depth is 600
- **THEN** the available clearance is `2900` mm (`3500 − 600`)

### Requirement: Fixed ergonomic ratings decoupled from the module

Each clearance SHALL be rated against **fixed mm thresholds** that never scale with the module M:
`≥ 900` comfortable, `≥ 600` acceptable, `< 600` tight (via `rateWalkway`). Changing the module
SHALL NOT change any walkway rating. (`FR-WALK-03`, `BC-WALK-01`)

#### Scenario: Threshold boundaries

- **WHEN** the available clearance is 2900 / 600 / 300 mm
- **THEN** the ratings are `comfortable` / `acceptable` / `tight` respectively

#### Scenario: Ratings do not depend on the module

- **WHEN** the active module changes from 700 to 350 with the room unchanged
- **THEN** every walkway rating for that room is unchanged (thresholds are absolute mm)

### Requirement: Rating meter, colored rating, and localized guidance

Each row SHALL show a bar meter filled by rating (comfortable = 3 bars, acceptable = 2, tight = 1),
a colored text rating label, and the localized guidance sentence resolved from the engine's
locale-independent `recommendation` key (`walkway.comfortable` → `recComf`, `walkway.acceptable` →
`recAcc`, `walkway.tight` → `recTight`). The rating meaning SHALL be carried by the label and meter,
not color alone. (`FR-WALK-04`)

#### Scenario: Comfortable row

- **WHEN** a clearance rates `comfortable`
- **THEN** the meter shows 3 filled bars, the rating label reads `comfortable`, and the guidance is
  the localized `recComf` sentence

#### Scenario: Tight row

- **WHEN** a clearance rates `tight`
- **THEN** the meter shows 1 filled bar, the rating label reads `tight`, and the guidance is the
  localized `recTight` sentence
