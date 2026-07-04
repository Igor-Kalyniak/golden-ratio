## ADDED Requirements

### Requirement: Suggest a module from room dimensions

`suggestModule2D(rooms)` SHALL return `{ rawGcd, suggested, alternatives, residual }` (the same
`ModuleSuggestion` shape as `suggestModule`), where `rawGcd` is the greatest common divisor folded
across **every** room's length and width, `suggested` is `rawGcd` snapped to the nearest
`STANDARD_MODULES` value, `alternatives` are the two nearest other standard modules to `rawGcd`, and
`residual` is `|rawGcd − suggested|` (always surfaced). A single room SHALL yield
`gcd(length, width)`. (`FR-MODULE2D-01`)

#### Scenario: Single room

- **WHEN** `suggestModule2D([{ length: 4200, width: 3500 }])` is called
- **THEN** `rawGcd` is `gcd(4200, 3500) = 700`, `suggested` is `700`, and `residual` is `0`

#### Scenario: Fold across multiple rooms

- **WHEN** `suggestModule2D` is called with rooms `4200×3500`, `3800×2500`, and `2150×1500`
- **THEN** `rawGcd` is `50` (the GCD of all six dimensions) and `suggested` is `100` (nearest
  standard module) with `residual` `50`

#### Scenario: Snapped value is a standard module, never the raw GCD

- **WHEN** the folded `rawGcd` is not itself a standard module
- **THEN** `suggested` is a member of `STANDARD_MODULES` and `residual` is non-zero, so the poor
  snap is visible rather than silent

### Requirement: Active module in 2D mode is user-selectable, never the raw GCD

The value that drives downstream 2D-mode results SHALL be the active module — the user's selection
defaulting to `suggestModule2D(rooms).suggested`, never the raw GCD. `suggested` SHALL always be a
`STANDARD_MODULES` value; the raw GCD SHALL only appear as the traceability input, not as the active
module. (`FR-MODULE2D-02`)

#### Scenario: Default is the snapped suggestion, not the GCD

- **WHEN** the 2D-mode module has not been explicitly overridden
- **THEN** its default value is `suggestModule2D(rooms).suggested` (a standard module), not
  `rawGcd`

#### Scenario: Suggested is always a standard module

- **WHEN** `suggestModule2D` returns for any non-empty set of rooms
- **THEN** `suggested` is one of `STANDARD_MODULES`
