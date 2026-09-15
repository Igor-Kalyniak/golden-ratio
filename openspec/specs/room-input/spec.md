# room-input Specification

## Purpose
TBD - created by archiving change room-input. Update Purpose after archive.
## Requirements
### Requirement: Room list starts with one room and supports adding rooms

The application SHALL start with exactly one room in state, and the room list SHALL provide an
"Add room" control that appends a new room. Each appended room SHALL default to
`{ name: "Room N", length: 3000, width: 2400 }`, where `N` is one greater than the current room
count. There SHALL be no upper bound on the number of rooms. (`FR-ROOM-01`)

#### Scenario: Default single room

- **WHEN** the application first renders
- **THEN** the room list contains exactly one room (`DEFAULT_STATE.rooms`)

#### Scenario: Add room appends a defaulted room

- **WHEN** the "Add room" control is activated with `n` rooms present
- **THEN** a new room `{ name: "Room {n+1}", length: 3000, width: 2400 }` is appended, giving
  `n + 1` rooms, and the existing rooms are unchanged

#### Scenario: New room has a stable unique id

- **WHEN** two rooms are added in succession
- **THEN** each appended room has an id distinct from every existing room's id

### Requirement: Any room can be removed except the last remaining one

The room list SHALL provide a per-room remove control that removes that room by id. When only one
room remains, removal SHALL be a no-op and the remove control SHALL be visibly disabled — the list
can never be emptied. (`FR-ROOM-02`)

#### Scenario: Remove one of several rooms

- **WHEN** the remove control for a room is activated while more than one room exists
- **THEN** that room (matched by id) is removed and the other rooms are unchanged

#### Scenario: Last room cannot be removed

- **WHEN** removal is requested while exactly one room remains
- **THEN** the room list is unchanged (the operation is a no-op) and the remove control is disabled

### Requirement: Per-room name, length, and width fields

Each room SHALL expose an editable name, length, and width. The name SHALL be a non-empty string
of 1–50 characters after trimming, defaulting to `"Room N"`. Length and width SHALL be integers in
`500–15000` mm inclusive. A room is valid (per `isRoomValid`) only when its trimmed name is in
range and both dimensions are in range. (`FR-ROOM-03`)

#### Scenario: Editing a room field updates only that room

- **WHEN** a room's name, length, or width is edited
- **THEN** only the matching room (by id) is patched with the new value and all other rooms are
  unchanged

#### Scenario: Name length bounds

- **WHEN** a room's trimmed name is empty or exceeds 50 characters
- **THEN** the room is invalid per `isRoomValid`

#### Scenario: Dimension bounds

- **WHEN** a room's length or width is below 500 or above 15000 mm (or non-integer)
- **THEN** the room is invalid per `isValidDimension`

### Requirement: Inline validation on every room field

Each room field SHALL validate inline exactly like the apartment fields (`FR-APT-04`): an invalid
field SHALL show an `--err` border and a localized `role="alert"` message directly below it, with
`aria-invalid` set and the message linked via `aria-describedby`. Every field SHALL have a visible
`<label>`. Editing is reactive — there is no submit button. (`FR-ROOM-04`)

#### Scenario: Invalid dimension shows an inline error

- **WHEN** a room's length or width fails `isValidDimension`
- **THEN** that field has `aria-invalid="true"`, an `--err` border, and a `role="alert"` element
  with the localized `errDim` message, referenced via `aria-describedby`

#### Scenario: Invalid name shows an inline error

- **WHEN** a room's trimmed name is empty or over 50 characters
- **THEN** the name field is invalid, showing the localized `errName` message with the same ARIA
  wiring

#### Scenario: Valid field shows no error

- **WHEN** a room field passes its validation
- **THEN** no error message renders for it and `aria-invalid` is not `"true"`
