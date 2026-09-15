# apartment-input Specification

## Purpose
TBD - created by archiving change apartment-input. Update Purpose after archive.
## Requirements
### Requirement: Ceiling height input

The apartment card SHALL provide a ceiling height field (mm, integer), defaulting to `2800`,
valid in `2000–5000` inclusive. The field SHALL show a right-aligned range hint in its label and
an `mm` suffix. (`FR-APT-01`)

#### Scenario: Default value

- **WHEN** the apartment card first renders
- **THEN** the ceiling field shows `2800`

#### Scenario: Out-of-range ceiling is invalid

- **WHEN** the ceiling is set to `1999` or `5001`
- **THEN** the field is invalid per `isValidCeiling`

### Requirement: Opening height input

The apartment card SHALL provide an opening height field (mm, integer), defaulting to `2100`,
valid in `1800`–ceiling inclusive (never exceeding the current ceiling). (`FR-APT-02`)

#### Scenario: Default value

- **WHEN** the apartment card first renders
- **THEN** the opening field shows `2100`

#### Scenario: Opening cannot exceed ceiling

- **WHEN** the opening is set above the current ceiling value
- **THEN** the field is invalid per `isValidOpening`

### Requirement: Module selector defaults to the suggestion and is user-overridable

The apartment card SHALL provide a module `<select>` over `STANDARD_MODULES`. While the user has
not explicitly chosen a module, its value SHALL track `suggestModule(ceiling, opening).suggested`
as ceiling/opening change. Once the user selects a module directly, that becomes the active value
and SHALL NOT be silently reverted by a later ceiling/opening edit — the module stays
user-controlled from that point on. The suggested option SHALL be labelled `"{value} — suggested"`.
(`FR-APT-03`)

#### Scenario: Untouched module follows the suggestion

- **WHEN** the ceiling or opening changes and the module has not been explicitly selected
- **THEN** the module value updates to the new `suggestModule(...).suggested`

#### Scenario: User selection is sticky

- **WHEN** the user selects a module value directly
- **THEN** that value becomes active and a subsequent ceiling/opening edit does not change it

#### Scenario: Default is the suggested value

- **WHEN** the apartment card first renders with default ceiling/opening
- **THEN** the module field shows `700` (the suggestion for `2800`/`2100`) and is not marked
  as user-touched

### Requirement: Inline validation

An invalid ceiling or opening field SHALL show a red (`--err`) border and a localized
`role="alert"` message directly below it (`errCeiling` / `errOpening`), with `aria-invalid` set
and the message linked via `aria-describedby`. Every field SHALL have a visible `<label>`.
(`FR-APT-04`)

#### Scenario: Invalid ceiling shows an inline error

- **WHEN** the ceiling value fails `isValidCeiling`
- **THEN** the field has `aria-invalid="true"`, an `--err` border, and a `role="alert"` element
  with the localized `errCeiling` message, referenced via `aria-describedby`

#### Scenario: Valid field shows no error

- **WHEN** the ceiling value passes `isValidCeiling`
- **THEN** no error message renders and `aria-invalid` is not `"true"`

### Requirement: Reactive, submit-free recomputation

There SHALL be no submit button. Any valid change to ceiling, opening, or module SHALL recompute
downstream state synchronously, on the same render — no debounce, no async. (`FR-APT-05`)

#### Scenario: No submit button

- **WHEN** the apartment card renders
- **THEN** there is no submit/apply control

#### Scenario: Edits recompute synchronously

- **WHEN** a valid ceiling/opening/module change is made
- **THEN** the resulting `AppState` update and its derived `showResults` are synchronous, with
  no async gap between the change and the recomputed value

