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
} from './calculations.ts';

/** Room name bounds (FR-ROOM-03). */
export const ROOM_NAME = { min: 1, max: 50 } as const;

export interface Room {
  id: string;
  name: string;
  /** mm; valid 500–15000 (FR-ROOM-03). */
  length: number;
  /** mm; valid 500–15000 (FR-ROOM-03). */
  width: number;
}

export interface AppState {
  /** mm; valid 2000–5000 (FR-APT-01). */
  ceiling: number;
  /** mm; valid 1800–ceiling (FR-APT-02). */
  opening: number;
  /** mm; one of STANDARD_MODULES (FR-APT-03). */
  module: number;
  /**
   * Whether the user has explicitly picked `module` (vs. it still following the live
   * suggestion). Drives the auto-follow rule in `withCeiling`/`withOpening` (FR-APT-03).
   */
  moduleTouched: boolean;
  rooms: Room[];
}

/** Valid starting state so the shell shows the results region by default. */
export const DEFAULT_STATE: AppState = {
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

/** The apartment fields are valid when ceiling, opening, and module are all in range. */
export function isApartmentValid(state: AppState): boolean {
  return (
    isValidCeiling(state.ceiling) &&
    isValidOpening(state.opening, state.ceiling) &&
    (STANDARD_MODULES as readonly number[]).includes(state.module)
  );
}

/**
 * Results render only when the apartment fields are valid AND at least one room is valid
 * (FR-SHELL-04). Pure and synchronous — no async, no effects (NFR-PERF-01).
 */
export function showResults(state: AppState): boolean {
  return isApartmentValid(state) && state.rooms.some(isRoomValid);
}

// ---------------------------------------------------------------------------
// Apartment-field reducers (FR-APT-03) — pure, synchronous (FR-APT-05).
//
// The module tracks `suggestModule(ceiling, opening).suggested` while `moduleTouched`
// is false. Selecting a module directly sets `moduleTouched = true`, after which
// ceiling/opening edits no longer change it — the override is sticky.
// ---------------------------------------------------------------------------

/** Update the ceiling; re-suggests the module only while it hasn't been overridden. */
export function withCeiling(state: AppState, ceiling: number): AppState {
  const next = { ...state, ceiling };
  if (state.moduleTouched) return next;
  return { ...next, module: suggestModule(ceiling, next.opening).suggested };
}

/** Update the opening; re-suggests the module only while it hasn't been overridden. */
export function withOpening(state: AppState, opening: number): AppState {
  const next = { ...state, opening };
  if (state.moduleTouched) return next;
  return { ...next, module: suggestModule(next.ceiling, opening).suggested };
}

/** Set the module directly; marks it as user-touched so it stops auto-following. */
export function withModule(state: AppState, module: number): AppState {
  return { ...state, module, moduleTouched: true };
}
