/**
 * Application state shape, the pure validity gate for the shell (FR-SHELL-04), and the
 * apartment-field reducers (FR-APT-03).
 *
 * Framework-free (no `react`/`next`/DOM) so the gate and reducers are unit-testable. The
 * React state owner is `components/Calculator.tsx`; this module only defines the shape and
 * the synchronous predicates/reducers it derives from the engine's validation bounds
 * (NFR-PERF-01).
 *
 * The room-list CRUD (change 6) further extends how this state is edited.
 */

import {
  STANDARD_MODULES,
  isValidCeiling,
  isValidDimension,
  isValidOpening,
  suggestModule,
  suggestModule2D,
  type ModuleSuggestion,
} from './calculations.ts';

/** Room name bounds (FR-ROOM-03). */
export const ROOM_NAME = { min: 1, max: 50 } as const;

/** Calculation mode (FR-MODE-01): `3d` uses heights, `2d` uses room dimensions. */
export type Mode = '2d' | '3d';

export interface Room {
  id: string;
  name: string;
  /** mm; valid 500–15000 (FR-ROOM-03). */
  length: number;
  /** mm; valid 500–15000 (FR-ROOM-03). */
  width: number;
}

export interface AppState {
  /** Calculation mode; in-memory only, never persisted (FR-MODE-05, BC-PRIVACY-01). */
  mode: Mode;
  /** mm; valid 2000–5000 (FR-APT-01). Used in 3D mode; hidden in 2D. */
  ceiling: number;
  /** mm; valid 1800–ceiling (FR-APT-02). Used in 3D mode; hidden in 2D. */
  opening: number;
  /** mm; one of STANDARD_MODULES (FR-APT-03). */
  module: number;
  /**
   * Whether the user has explicitly picked `module` (vs. it still following the live
   * suggestion). Drives the auto-follow rule in the reducers (FR-APT-03, FR-MODE-04).
   */
  moduleTouched: boolean;
  rooms: Room[];
}

/** Valid starting state so the shell shows the results region by default. Default mode 3D. */
export const DEFAULT_STATE: AppState = {
  mode: '3d',
  ceiling: 2800,
  opening: 2100,
  module: 700,
  moduleTouched: false,
  rooms: [{ id: 'room-1', name: 'Room 1', length: 3000, width: 2400 }],
};

/** A room is valid when its (trimmed) name is 1–50 chars and both dimensions are in range. */
export function isRoomValid(room: Room): boolean {
  const name = room.name.trim();
  return (
    name.length >= ROOM_NAME.min &&
    name.length <= ROOM_NAME.max &&
    isValidDimension(room.length) &&
    isValidDimension(room.width)
  );
}

/**
 * Apartment validity, mode-aware (FR-MODE-02/03). The module must always be a standard value; in
 * 3D the ceiling and opening must also be in range, but in 2D those fields are hidden and
 * irrelevant, so only the module is required.
 */
export function isApartmentValid(state: AppState): boolean {
  const moduleOk = (STANDARD_MODULES as readonly number[]).includes(state.module);
  if (state.mode === '2d') return moduleOk;
  return isValidCeiling(state.ceiling) && isValidOpening(state.opening, state.ceiling) && moduleOk;
}

/**
 * The mode-appropriate module suggestion (FR-MODE-02/03): from ceiling & opening heights in 3D,
 * from the GCD folded across the valid rooms' dimensions in 2D. The single source the untouched
 * module tracks and the Module Summary hint renders.
 */
export function moduleSuggestion(state: AppState): ModuleSuggestion {
  if (state.mode === '2d') {
    return suggestModule2D(state.rooms.filter(isRoomValid));
  }
  return suggestModule(state.ceiling, state.opening);
}

/**
 * Results render only when the apartment fields are valid AND at least one room is valid
 * (FR-SHELL-04). Pure and synchronous — no async, no effects (NFR-PERF-01).
 */
export function showResults(state: AppState): boolean {
  return isApartmentValid(state) && state.rooms.some(isRoomValid);
}

// ---------------------------------------------------------------------------
// Apartment-field & mode reducers (FR-APT-03, FR-MODE-02/03/04) — pure, synchronous.
//
// The module tracks the mode-appropriate `moduleSuggestion(state).suggested` while
// `moduleTouched` is false. Selecting a module directly sets `moduleTouched = true`, after
// which suggestion-input edits (heights in 3D, room dims in 2D, or a mode switch) no longer
// change it — the override is sticky. Every mutating reducer funnels through `resyncModule`
// so the rule lives in one place and 2D/3D cannot drift.
// ---------------------------------------------------------------------------

/** Re-point an untouched module at the current mode's suggestion; a touched module is left alone. */
function resyncModule(state: AppState): AppState {
  if (state.moduleTouched) return state;
  return { ...state, module: moduleSuggestion(state).suggested };
}

/** Switch calculation mode; re-suggests the module from the new mode's source if untouched. */
export function withMode(state: AppState, mode: Mode): AppState {
  return resyncModule({ ...state, mode });
}

/** Update the ceiling; re-suggests the module only while it hasn't been overridden. */
export function withCeiling(state: AppState, ceiling: number): AppState {
  return resyncModule({ ...state, ceiling });
}

/** Update the opening; re-suggests the module only while it hasn't been overridden. */
export function withOpening(state: AppState, opening: number): AppState {
  return resyncModule({ ...state, opening });
}

/** Set the module directly; marks it as user-touched so it stops auto-following. */
export function withModule(state: AppState, module: number): AppState {
  return { ...state, module, moduleTouched: true };
}

// ---------------------------------------------------------------------------
// Room-list CRUD reducers (FR-ROOM-01/02/03) — pure, synchronous (NFR-PERF-01).
//
// Ids are minted by a module-level monotonic counter (never Date.now/Math.random),
// so ids are unique within a session and reducers stay deterministic for tests. Ids
// are React keys / reducer match keys only — never persisted (BC-PRIVACY-01).
// ---------------------------------------------------------------------------

/** Next room sequence — starts after DEFAULT_STATE's `room-1`. */
let nextRoomSeq = 2;

/** Mint a unique, stable room id (`room-2`, `room-3`, …). */
export function newRoomId(): string {
  return `room-${nextRoomSeq++}`;
}

// Room reducers funnel through `resyncModule` so an untouched module tracks the 2D room-dimension
// suggestion (FR-MODE-02); in 3D the suggestion reads heights, so the resync is a no-op.

/** Append a defaulted room; existing rooms unchanged (FR-ROOM-01, DESIGN §5.3). */
export function addRoom(state: AppState): AppState {
  // Name from the same monotonic sequence as the id, not `rooms.length + 1`, so deleting a room and
  // adding another can't reuse an existing name (e.g. delete Room 1 from [Room 1, Room 2] → next add
  // would otherwise be "Room 2" again).
  const id = newRoomId();
  const room: Room = {
    id,
    name: `Room ${id.slice(id.indexOf('-') + 1)}`,
    length: 3000,
    width: 2400,
  };
  return resyncModule({ ...state, rooms: [...state.rooms, room] });
}

/**
 * Remove the room with `id`. No-op when only one room remains, so the list can never
 * be emptied (FR-ROOM-02) — the invariant is enforced here, not only in the disabled UI.
 */
export function removeRoom(state: AppState, id: string): AppState {
  if (state.rooms.length <= 1) return state;
  return resyncModule({ ...state, rooms: state.rooms.filter((room) => room.id !== id) });
}

/** Patch a single room's editable fields, matched by id (FR-ROOM-03). */
export function updateRoom(
  state: AppState,
  id: string,
  patch: Partial<Pick<Room, 'name' | 'length' | 'width'>>,
): AppState {
  return resyncModule({
    ...state,
    rooms: state.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)),
  });
}
