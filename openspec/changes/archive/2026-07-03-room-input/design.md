## Context

`app-shell` (4) established `Calculator` as the single `'use client'` boundary and state owner
(`TC-CLIENT-01`/`TC-ARCH-01`), with `lib/app-state.ts` holding the framework-free `AppState`
shape, the `rooms: Room[]` array, and the `isRoomValid`/`ROOM_NAME` predicates already defined
(anticipating this change). `apartment-input` (5) set the pattern this change follows exactly:
pure reducers in `lib/app-state.ts` (unit-tested), setter callbacks wired in `Calculator`, and a
presentational `'use client'` form component rendered by `Shell` with inline `role="alert"`
validation. This change fills the last empty input slot — the room list — with the same layering.

## Goals / Non-Goals

**Goals**
- Add room-list CRUD as pure reducers on `AppState` (`FR-ROOM-01/02`), unit-tested like the
  apartment reducers.
- Render the room list per DESIGN §5.3 with inline validation matching `FR-APT-04` (`FR-ROOM-03/04`).
- Keep the last-room-remove guard in the pure reducer (not just disabled in the UI) so the
  invariant holds regardless of caller.

**Non-Goals**
- Per-room result cards (golden/grid/walkway) — changes 9/10/11 consume this state.
- The 2D room-derived module and any visualizer — changes 12/14/15.
- Reordering or duplicating rooms — not in `FR-ROOM-*`.

## Decisions

### Reducers live in `lib/app-state.ts`, pure and id-stable
Three reducers mirror the `withCeiling`/`withOpening`/`withModule` shape:
- `addRoom(state)` → appends `{ id, name: "Room {n+1}", length: 3000, width: 2400 }`.
- `removeRoom(state, id)` → filters by id, but **returns the state unchanged when
  `state.rooms.length <= 1`** so the last room can never be removed (`FR-ROOM-02`). The invariant
  is enforced in the reducer, not only in the disabled button, so it cannot be bypassed.
- `updateRoom(state, id, patch)` → maps `rooms`, replacing the matching room with `{ ...room,
  ...patch }`. `patch` is `Partial<Pick<Room, 'name' | 'length' | 'width'>>` (never `id`).

All three are pure: they build new arrays/objects and never mutate the input (verified by a
purity test), keeping the synchronous same-frame recompute path (`NFR-PERF-01`).

**Id generation.** New room ids must be unique and stable across re-renders, but scripts/tests
need determinism and `lib/app-state.ts` is framework-free. A single monotonic counter (`let
nextRoomSeq = 2`, since `DEFAULT_STATE` uses `room-1`) minted by a `newRoomId()` helper produces
`room-2`, `room-3`, … — no `Date.now()`/`Math.random()`. This is deterministic enough for tests
that add rooms in sequence and guarantees uniqueness within a session (ids are used only as React
keys and reducer match keys; they are never persisted — `BC-PRIVACY-01`).

> Alternatives considered: (a) `crypto.randomUUID()` — non-deterministic, harder to assert in
> unit tests, and overkill for an in-memory key; (b) deriving the id from the array index —
> unstable across removals (React key reuse bugs). The monotonic counter is the simplest stable
> option.

### `Room N` numbering uses the count, not the max id
`addRoom` names the new room `"Room {rooms.length + 1}"` per DESIGN §5.3. This is a display
default the user can immediately edit; it intentionally does **not** try to find the next unused
number after removals (DESIGN specifies the simple count-based label). The name is validated on
its own merits (1–50 chars), so a duplicate label is not an error.

### UI reuses the `apartment-input` field pattern, not a shared abstraction yet
`RoomList` renders a `NumberField`-style input with the same inline-error wiring as
`ApartmentForm` (`--err` border, `role="alert"` message, `aria-invalid`, `aria-describedby`
combining hint + error ids). Rather than prematurely extracting a shared `NumberField` into a
common module, this change keeps a local field helper in `RoomList` matching `ApartmentForm`'s —
the two are structurally identical but the extraction is deferred until a third consumer appears
(YAGNI; avoids a refactor of the already-archived `apartment-input`). The name field is a text
input with the same error affordances.

### Last-room remove: disabled control + no-op reducer
The remove `×` is rendered `disabled` (opacity .3, `not-allowed`, `aria-disabled`) when
`rooms.length === 1` per DESIGN §5.3, and `removeRoom` is a no-op in that case. Belt-and-braces:
the visible affordance communicates the rule and the reducer enforces it.

### i18n keys
`rooms`, `addRoom`, `length`, `width`, `errDim` already exist. This change adds `roomName` (name
field label), `errName` (name-length error message), and `removeRoom` (accessible label for the
`×` button) to both `locales/en.json` and `locales/ua.json`, keeping the dictionaries key-parity
(enforced by the shipped i18n test). Calculation labels are untouched (never translated,
`FR-I18N-03`).

## Risks / Trade-offs

- **Monotonic module-level counter vs. purity.** `newRoomId()` reads/increments a module-level
  `let`, so `addRoom` is not *referentially* pure across calls (successive calls yield different
  ids). This is an accepted, localized impurity for id minting — the state *transformation* is
  otherwise pure and the purity test asserts the **input state object is never mutated**. Tests
  that assert exact ids account for sequence; most assert uniqueness/inequality instead.
- **No React/DOM test runner (ADR-0001).** The reducers are fully unit-tested; the form
  rendering, disabled-last-remove affordance, and inline-error DOM are verified by
  build+tsc+lint+manual, captured in the manual test plan — same posture as `apartment-input`.

## Migration Plan

Additive only. `Shell` swaps its dashed rooms placeholder for `<RoomList>`; no existing behavior,
spec, or archived change is modified. No data migration (`BC-PRIVACY-01` — nothing persisted).

## Open Questions

- `OQ-04` (default room dimensions) is unresolved with the SME; DESIGN §5.3's `3000 × 2400`
  append default and `DEFAULT_STATE`'s existing `3000 × 2400` room are used and are a one-line
  change if revised. Does not block this change.
