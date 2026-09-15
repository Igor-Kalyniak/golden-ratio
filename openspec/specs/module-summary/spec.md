# module-summary Specification

## Purpose
TBD - created by archiving change module-summary. Update Purpose after archive.
## Requirements
### Requirement: Active module is the user-selected value

Every downstream calculation SHALL use the *active module* — the value held in application state,
which is the user's selection defaulting to `suggestModule(ceiling, opening).suggested` and never
the raw GCD. The Module Summary SHALL display this same active value; it SHALL NOT re-derive or
override it. (`FR-MODULE-02`, `BC-MODULE-01`)

#### Scenario: Summary reflects the active state module

- **WHEN** the Module Summary renders for a given application state
- **THEN** the hero value equals `state.module` (not `rawGcd` and not a freshly recomputed value)

#### Scenario: Overriding the module updates the summary

- **WHEN** the user selects a different module in the apartment card
- **THEN** the Module Summary hero value and ruler update to that selected module, and the
  suggestion hint still shows the engine's `rawGcd → suggested` for the current heights

### Requirement: Module Summary shows the active module and its traceability hint

The Module Summary SHALL display the active module large (e.g. `M = 700` with an `mm` unit) and a
traceability hint that shows `GCD(ceiling, opening) = {rawGcd}` snapped to `{suggested}`, the
`residual` (`|rawGcd − suggested|` in mm), and the two nearest alternative standard modules.
(`FR-MODULE-03`)

#### Scenario: Worked example at M = 700

- **WHEN** ceiling is 2800 and opening is 2100 with the module at its default
- **THEN** the hero shows `M = 700`, the hint shows `GCD = 700 → snapped to 700`, `residual 0 mm`,
  and alternative chips drawn from `suggestModule(2800, 2100).alternatives`

#### Scenario: Coprime heights surface a non-zero residual

- **WHEN** the heights are coprime so `rawGcd` is far from any standard module
- **THEN** the hint still shows the snapped suggestion and a non-zero `residual`, making the poor
  snap visible rather than silent

### Requirement: Module ruler table

The Module Summary SHALL include a ruler table with three columns — label, size, and typical use —
listing the rows ¼M, ½M, M, 1.5M, 2M, 3M, 4M. Each size SHALL be `round(module × k)` for
`k ∈ {0.25, 0.5, 1, 1.5, 2, 3, 4}`. The label cells (`¼M`…`4M`) SHALL come from the fixed
`CALC_LABELS` and SHALL NOT be translated; the typical-use prose SHALL be localized. (`FR-MODULE-04`)

#### Scenario: Ruler sizes at M = 700

- **WHEN** the active module is 700
- **THEN** the ruler rows show sizes `175, 350, 700, 1050, 1400, 2100, 2800` for
  `¼M, ½M, M, 1.5M, 2M, 3M, 4M` respectively

#### Scenario: Fractional rounding

- **WHEN** the active module does not divide evenly by 4 (e.g. 150 → ¼M = 37.5)
- **THEN** each size is rounded to the nearest integer (`round(150 × 0.25) = 38`)

#### Scenario: Labels are never translated

- **WHEN** the locale is UA
- **THEN** the ruler label cells still render `¼M`…`4M` verbatim while the typical-use column is in
  Ukrainian

### Requirement: Impractical-module warning banner

The Module Summary SHALL show a `role="alert"` warning banner only when the active module is
outside the practical range: greater than 1000 mm (`warnLarge` — "may be impractically large") or
less than 100 mm (`warnSmall` — "inputs may need revision"). Within `100–1000` mm inclusive no
banner SHALL render, and the calculation SHALL proceed regardless. (`FR-MODULE-05`)

#### Scenario: No banner at M = 700

- **WHEN** the active module is 700
- **THEN** no warning banner renders

#### Scenario: Large-module warning

- **WHEN** the active module is greater than 1000 mm
- **THEN** the `warnLarge` banner renders with `role="alert"`

#### Scenario: Small-module warning

- **WHEN** the active module is less than 100 mm
- **THEN** the `warnSmall` banner renders with `role="alert"`
