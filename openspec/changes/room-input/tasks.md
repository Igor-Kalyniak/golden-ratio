## 1. State: room-CRUD reducers (`lib/app-state.ts`)

- [ ] 1.1 Add a stable id minter `newRoomId()` backed by a module-level monotonic counter
  (starting after `DEFAULT_STATE`'s `room-1`); no `Date.now`/`Math.random`.
- [ ] 1.2 Add `addRoom(state)` — appends `{ id: newRoomId(), name: "Room {rooms.length+1}",
  length: 3000, width: 2400 }`; existing rooms unchanged (`FR-ROOM-01`).
- [ ] 1.3 Add `removeRoom(state, id)` — removes the room with `id`, but returns state unchanged
  when `rooms.length <= 1` (last-room guard, `FR-ROOM-02`).
- [ ] 1.4 Add `updateRoom(state, id, patch)` — replaces the matching room with `{ ...room,
  ...patch }`; `patch` is `Partial<Pick<Room, 'name' | 'length' | 'width'>>` (`FR-ROOM-03`).
- [ ] 1.5 Keep all three pure (new arrays/objects, never mutate the input state).

## 2. Wiring (`components/Calculator.tsx`)

- [ ] 2.1 Add `onAddRoom`, `onRemoveRoom(id)`, `onRoomChange(id, patch)` `useCallback`s over the
  new reducers (`setState(prev => …)`).
- [ ] 2.2 Pass the three room handlers to `Shell`.

## 3. UI: room list (`components/RoomList.tsx`, `'use client'`)

- [ ] 3.1 Header row: `Rooms {count}` label + accent `+ Add room` button wired to `onAddRoom`
  (DESIGN §5.3).
- [ ] 3.2 One panel card per room: `R{n}` mono tag, editable name field (default `Room N`),
  Length + Width number fields in a responsive grid with `mm` suffix + range hint (`FR-ROOM-03`).
- [ ] 3.3 Per-card remove `×` button wired to `onRemoveRoom(room.id)`; `disabled` +
  `aria-disabled` + dimmed when `rooms.length === 1` (`FR-ROOM-02`).
- [ ] 3.4 Inline validation on every field: `--err` border, `role="alert"` message (`errName` for
  the name, `errDim` for dimensions), `aria-invalid`, `aria-describedby` combining hint + error
  ids; empty numeric input coerces to `NaN` (not `0`); visible `<label>` per field (`FR-ROOM-04`).
- [ ] 3.5 No submit button — each `onChange` calls the matching handler so edits recompute
  synchronously.

## 4. Shell integration (`components/Shell.tsx`)

- [ ] 4.1 Replace the dashed rooms placeholder with `<RoomList>`, wired to `state.rooms` and the
  three room handlers; apartment slot + results region unchanged.

## 5. i18n

- [ ] 5.1 Add `roomName`, `errName`, `removeRoom` to `locales/en.json` and `locales/ua.json`
  (key-parity preserved; calc labels untouched).

## 6. Tests & verification

- [ ] 6.1 Add `lib/app-state.test.ts` cases: `addRoom` appends a defaulted room with a unique id;
  `removeRoom` removes by id; `removeRoom` is a no-op on the last room; `updateRoom` patches only
  the matched room; reducers do not mutate the input state.
- [ ] 6.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
