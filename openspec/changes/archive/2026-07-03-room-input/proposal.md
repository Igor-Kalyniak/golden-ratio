## Why

`app-shell` (4) left a dashed placeholder where the room list belongs, and `apartment-input`
(5) filled only the apartment slot beside it. `room-input` fills the remaining input slot: a
dynamic list of rooms, each with a name, length, and width, that the architect edits inline.
This produces the per-room state that every downstream result section — golden split (9), grid
fit (10), walkway (11) — reads, and that the 2D module suggestion (12) folds a GCD across.
Capability 6 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md); its prerequisite
`app-shell` (4) is archived. Owns `FR-ROOM-01/02/03/04`.

## What Changes

- **`lib/app-state.ts` extended**: three pure, framework-free room-CRUD reducers over the
  existing `rooms: Room[]` — `addRoom` (appends `{name: "Room N", length: 3000, width: 2400}`,
  where `N` is `rooms.length + 1`, per DESIGN §5.3), `removeRoom(id)` (removes by id but is a
  **no-op when only one room remains**, `FR-ROOM-02`), and `updateRoom(id, patch)` (patches a
  single room's `name`/`length`/`width`). A stable id generator (a monotonic counter, not
  `Date.now`/`Math.random`, so the reducers stay pure and testable) mints new room ids. Reducers
  are unit-tested (append, last-room-guard, field patch, purity).
- **`components/Calculator.tsx`**: adds the room setter wiring — `onAddRoom`, `onRemoveRoom(id)`,
  `onRoomChange(id, patch)` callbacks built over the new reducers, passed down to `Shell`.
- **`components/RoomList.tsx` (`'use client'`)**: the room list (DESIGN §5.3) — a header row
  (`Rooms <count>` + accent **`+ Add room`** button) over one panel card per room. Each card
  shows an `R1`/`R2`… mono tag, an inline-editable **name** field (default `Room N`), and
  **Length** + **Width** number fields in a responsive grid (`mm` suffix, range hint). A per-card
  **remove (`×`)** button is **disabled on the last remaining room** (`FR-ROOM-02`). Every field
  validates inline exactly like the apartment fields — `--err` border + localized `role="alert"`
  message + `aria-invalid`/`aria-describedby` (`FR-ROOM-04`, reusing the `FR-APT-04` pattern). No
  submit button; edits recompute synchronously.
- **`components/Shell.tsx`**: the rooms slot renders `<RoomList>` (wired to the new props) in
  place of its dashed placeholder; the apartment slot and results region are unchanged.
- **`locales/en.json` + `locales/ua.json`**: add the few room-field strings not already present
  — `roomName` (name label), `errName` (name-length error), and `removeRoom` (the `×` button's
  accessible label). `rooms`, `addRoom`, `length`, `width`, `errDim` already shipped.
- **`lib/app-state.test.ts` extended**: unit tests for the three room reducers.

Scope stays the room list only. The per-room **result** cards (golden/grid/walkway — 9/10/11),
the 2D-mode room-derived module (12), and any visualizer (14/15) are out of scope; they consume
the room state this change produces. `Room`/`isRoomValid`/`ROOM_NAME` already exist in
`lib/app-state.ts` (added with `app-shell`); this change adds only the CRUD reducers + UI.

## Capabilities

### New Capabilities
- `room-input`: the dynamic room list — start with one room, add/remove (never the last),
  per-room name (1–50, default `Room N`) + length/width (500–15000 mm) with inline validation.

### Modified Capabilities
<!-- none — app-shell's spec (results gate, layout) is unchanged; this only fills its rooms slot -->

## Impact

- **Files:** extend `lib/app-state.ts` (+tests); edit `components/Calculator.tsx`,
  `components/Shell.tsx`; add `components/RoomList.tsx`; add 3 keys to each `locales/*.json`. No
  new dependencies.
- **Requirements owned:** `FR-ROOM-01/02/03/04`.
- **Consumes (shipped):** `Room`/`isRoomValid`/`ROOM_NAME`/`DEFAULT_STATE` from
  `lib/app-state.ts`; `isValidDimension`/`BOUNDS` from `lib/calculations.ts`; `Shell`/`Calculator`
  from `app-shell`; `useI18n` from `i18n`.
- **Enables:** `golden-ratio` (9), `grid-fit` (10), `walkway` (11), and `module-2d`/`viz` (12/14)
  read the resulting `rooms` state.
