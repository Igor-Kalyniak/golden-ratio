# mode-toggle Specification

## Purpose
TBD - created by archiving change mode-toggle. Update Purpose after archive.
## Requirements

### Requirement: Segmented 2D ⇄ 3D mode toggle, default 3D

The input column SHALL provide a segmented 2D ⇄ 3D toggle that switches calculation mode. The
default mode SHALL be 3D. The toggle SHALL be keyboard-operable with a clear selected state, and the
numeric results SHALL remain the accessible source of truth. (`FR-MODE-01`, `NFR-A11Y-03`)

#### Scenario: Default mode is 3D

- **WHEN** the application first renders
- **THEN** `DEFAULT_STATE.mode` is `'3d'` and the 3D segment is shown selected

#### Scenario: Toggle is keyboard-operable with a selected state

- **WHEN** the toggle renders
- **THEN** each segment is a focusable control exposing its selected state (`aria-pressed`), so a
  keyboard user can switch mode and perceive which is active

### Requirement: 2D mode hides height fields and suggests the module from room dimensions

In 2D mode the ceiling and opening fields SHALL be hidden, and the module suggestion SHALL come from
`suggestModule2D` over the valid rooms (`FR-MODULE2D-01`). The vertical band diagram (a 3D-only
result) SHALL be hidden in 2D. (`FR-MODE-02`)

#### Scenario: Height fields hidden in 2D

- **WHEN** the mode is `'2d'`
- **THEN** the ceiling and opening inputs are not rendered, and the module `<select>` remains

#### Scenario: 2D module suggestion comes from room dimensions

- **WHEN** the mode is `'2d'` and the module is untouched
- **THEN** the active module tracks `suggestModule2D(validRooms).suggested`, and the Module Summary
  hint reads `GCD(rooms) → snapped …` with the `suggested from room dimensions` label

#### Scenario: Vertical bands hidden in 2D

- **WHEN** the mode is `'2d'`
- **THEN** the vertical band diagram is not rendered

### Requirement: 3D mode uses heights and suggests the module from them

In 3D mode the inputs SHALL be ceiling, opening, and per-room length/width, and the module
suggestion SHALL come from `suggestModule(ceiling, opening)` (`FR-MODULE-01`). (`FR-MODE-03`)

#### Scenario: 3D module suggestion comes from heights

- **WHEN** the mode is `'3d'` and the module is untouched
- **THEN** the active module tracks `suggestModule(ceiling, opening).suggested`, and the Module
  Summary hint reads `GCD(ceiling, opening) → snapped …` with the `suggested from heights` label

### Requirement: Switching modes preserves shared state

Switching between 2D and 3D SHALL preserve the shared state — rooms, their names, length/width, and
a user-selected (touched) module. Only the height fields' visibility and the module's suggestion
source SHALL change. (`FR-MODE-04`)

#### Scenario: Rooms preserved across a switch

- **WHEN** the mode changes from 3D to 2D and back
- **THEN** the rooms array (ids, names, dimensions) is unchanged

#### Scenario: A user-selected module survives a switch

- **WHEN** the user has explicitly selected a module (`moduleTouched`) and then switches mode
- **THEN** the selected module value is preserved (it is not replaced by the new mode's suggestion)

#### Scenario: An untouched module re-derives on switch

- **WHEN** the module is untouched and the mode switches
- **THEN** the module updates to the new mode's `suggested` value

### Requirement: Mode is in-memory only

The mode SHALL be in-memory application state only — never written to `localStorage`, cookies, a
server, or any persistent store. (`FR-MODE-05`, `BC-PRIVACY-01`)

#### Scenario: Mode is not persisted

- **WHEN** the mode changes
- **THEN** no persistence API is called; on reload the mode returns to the `'3d'` default
