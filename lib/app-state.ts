/**
 * Application state shape and the pure validity gate for the shell (FR-SHELL-04).
 *
 * Framework-free (no `react`/`next`/DOM) so the results gate is unit-testable. The React
 * state owner is `components/Calculator.tsx`; this module only defines the shape and the
 * synchronous predicates it derives from the engine's validation bounds (NFR-PERF-01).
 *
 * The apartment fields (change 5) and room-list CRUD (change 6) extend how this state is
 * edited; here it is only defined, defaulted, and validated.
 */

import {
  STANDARD_MODULES,
  isValidCeiling,
  isValidDimension,
  isValidOpening,
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
  rooms: Room[];
}

/** Valid starting state so the shell shows the results region by default. */
export const DEFAULT_STATE: AppState = {
  ceiling: 2800,
  opening: 2100,
  module: 700,
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
