# Manual Test Plan — `room-input`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix
> `Status: manual-only`). The room-CRUD reducers (`addRoom`/`removeRoom`/`updateRoom`, incl. the
> last-room guard) and the validity bounds (`isRoomValid`/`isValidDimension`) are automated in
> `lib/app-state.test.ts`; the form-level rendering, the disabled last-remove affordance, and the
> inline-error DOM wiring (FR-ROOM-04) are structural with no React/DOM runner (ADR-0001), so they
> are verified manually here.

- **Change:** `room-input`
- **Owned requirement IDs:** `FR-ROOM-01, FR-ROOM-02, FR-ROOM-03, FR-ROOM-04`
- **Last updated:** `2026-07-03T13:00:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §5.3 (room list) and §5.4
  (inline validation) — layout/behavior source of truth.

## Scope note

This change fills the **room-list slot** in the shell's input column, replacing the dashed
placeholder with `<RoomList>`. It owns the room CRUD, the per-room name/length/width fields, and
their inline validation. Downstream result sections (grid fit, walkways, visualizer) consume these
rooms but are owned by later changes. The room name defaults to the count-based `"Room N"` label
(DESIGN §5.3); a duplicate label after a mid-list removal is cosmetic (review CR-003, acknowledged)
since ids stay unique and the name is user-editable.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: one room `Room 1`, 3000 × 2400 mm), so the room list
  renders with exactly one room and the results region shows on first load.

## Cases

### TC-1 — Add room appends a defaulted room  (reducer AUTOMATED)

- **Requirement(s):** `FR-ROOM-01`
- **Automated coverage:** `lib/app-state.test.ts` — `"addRoom: appends a defaulted room with a
  unique id"`, `"addRoom: successive rooms get distinct ids"`, `"room reducers are pure — do not
  mutate the input state"`. Run `node --test lib/app-state.test.ts`.
- **Steps (manual confirmation of the wired UI):**
  1. On load, confirm the room list shows exactly one card, labelled `R1` / `Room 1`, with
     Length `3000` and Width `2400`.
  2. Confirm a `Rooms 1` header count and an accent `+ Add room` button.
  3. Click `+ Add room`. Confirm a second card appears (`R2` / `Room 2`, 3000 × 2400), the count
     reads `Rooms 2`, and the first room's values are unchanged.
  4. Click `+ Add room` a few more times. Confirm each new card increments and there is no upper
     bound / cap.
- **Expected result:** App starts with one defaulted room; each `+ Add room` appends a
  `{name:"Room N", 3000×2400}` card with a distinct id, leaving prior rooms intact.
- **Result:** `pass` — append + unique-id behavior automated; wired button confirmed by inspection.

### TC-2 — Last-room guard: remove is disabled on the sole room  (reducer AUTOMATED)

- **Requirement(s):** `FR-ROOM-02`
- **Automated coverage:** `lib/app-state.test.ts` — `"removeRoom: removes the room matched by
  id"`, `"removeRoom: is a no-op on the last remaining room"`. The guard is enforced in the
  reducer, not only the UI (confirmed by the code-reviewer).
- **Steps:**
  1. On a fresh load (one room), confirm the per-card remove `×` control is visibly disabled
     (dimmed, `disabled`, `aria-disabled="true"`) and cannot be activated.
  2. Add a second room. Confirm **both** cards now show an enabled remove control.
  3. Remove the first room (`R1`). Confirm it disappears, the other room stays, and the count
     decrements.
  4. Confirm the now-sole remaining room's remove control is disabled again — the list can never be
     emptied.
- **Expected result:** Any room can be removed except the last remaining one; the sole room's
  remove control is disabled and removal is a no-op even if bypassed.
- **Result:** `pass` — remove-by-id + no-op-on-last automated; disabled affordance manual (ADR-0001).

### TC-3 — Per-room fields: bounds + inline error  (bounds AUTOMATED, DOM manual)

- **Requirement(s):** `FR-ROOM-03`, `FR-ROOM-04`
- **Automated coverage:** `lib/app-state.test.ts` — `"isRoomValid: default room is valid"`,
  `"isRoomValid: empty/too-long name is invalid"`, `"isRoomValid: out-of-range dimension is
  invalid"`, `"updateRoom: patches only the matched room"`.
- **Preconditions:** Fresh load (EN); add a second room so per-room isolation is observable.
- **Steps:**
  1. Confirm each card has a visible `<label>` for name, Length, and Width (the name label is
     visible, matching Length/Width — resolved CR-002/SC-001), with `mm` suffix + range hint on the
     dimension fields.
  2. In room 1, clear the name. Confirm the name field border turns `--err` red, a `role="alert"`
     message (`errName`) renders directly below, `aria-invalid="true"` is set, and
     `aria-describedby` references the error id. Confirm room 2's name is unaffected.
  3. Enter a name longer than 50 characters. Confirm the same invalid treatment.
  4. Set Length to `499` (below min) and confirm the invalid treatment with the `errDim` message;
     repeat for `15001` (above max) and a non-integer/blank value (blank coerces to `NaN`, not `0`).
  5. Repeat step 4 for the Width field.
  6. Edit a valid room-1 value and confirm only room 1 changes (per-room patch isolation).
  7. Restore valid values and confirm every error clears and `aria-invalid` is no longer `"true"`.
- **Expected result:** Name is 1–50 trimmed chars (default `Room N`); Length/Width are integers
  500–15000 mm; invalid fields show the red border + localized `role="alert"` message with correct
  ARIA wiring; edits patch only the matched room.
- **Result:** `pass` — bounds + patch-isolation automated via `isRoomValid`/`updateRoom`;
  DOM/rendering + inline-error wiring manual (ADR-0001), a11y re-confirmed by review (CR-002/SC-001
  resolved).

### TC-4 — Keyboard & screen-reader pass over the room list

- **Requirement(s):** `FR-ROOM-04`, `NFR-A11Y-01` (shell-owned, exercised here)
- **Preconditions:** Fresh load (two rooms); keyboard + screen reader.
- **Steps:**
  1. Tab through each card's name → Length → Width and the remove control. Confirm each field has a
     visible focus ring and an associated visible `<label>`.
  2. On an invalid field, confirm the screen reader announces the localized error (`role="alert"`)
     via `aria-describedby`.
  3. Confirm the remove control announces its `removeRoom` label and, on the sole remaining room,
     its disabled (`aria-disabled`) state.
  4. Toggle the language pill to UA and confirm `roomName`, `errName`, `errDim`, and `removeRoom`
     all switch to Ukrainian (key-parity preserved, calc labels untranslated).
- **Expected result:** All room fields are labelled and keyboard-operable; invalid fields announce
  their error; the remove control exposes its label and disabled state; strings are bilingual.
- **Result:** `pass` — manual (ADR-0001); the sr-only name-label deviation was found by two
  reviewers (CR-002 + SC-001) and fixed to a visible label.

### TC-5 — Reactive, no submit button, synchronous recompute

- **Requirement(s):** `FR-ROOM-04` (reactivity clause)
- **Preconditions:** Fresh load; results region visible.
- **Steps:**
  1. Confirm there is no submit / apply button anywhere in the room list.
  2. Edit a room dimension to a valid value and observe the results region update on the same
     frame, with no perceptible async delay.
  3. Make the only valid room invalid (e.g. clear its name) and confirm the results region hides
     (per `showResults` — apartment valid AND at least one valid room).
- **Expected result:** Every valid edit recomputes synchronously through the pure reducers; no
  submit control; results visibility tracks `showResults`.
- **Result:** `pass` — no-submit / synchronous behavior structural (ADR-0001); the pure reducers
  are pinned by the app-state purity test and `showResults` cases.
