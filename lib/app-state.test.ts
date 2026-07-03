import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { suggestModule, suggestModule2D } from './calculations.ts';
import {
  addRoom,
  DEFAULT_STATE,
  isApartmentValid,
  isRoomValid,
  moduleSuggestion,
  removeRoom,
  showResults,
  updateRoom,
  withCeiling,
  withMode,
  withModule,
  withOpening,
  type AppState,
  type Room,
} from './app-state.ts';

const room = (over: Partial<Room> = {}): Room => ({
  id: 'r',
  name: 'Room 1',
  length: 3000,
  width: 2400,
  ...over,
});
const state = (over: Partial<AppState> = {}): AppState => ({ ...DEFAULT_STATE, ...over });

// --- Room validity (FR-ROOM-03 bounds) -------------------------------------

test('isRoomValid: default room is valid', () => {
  assert.equal(isRoomValid(room()), true);
});

test('isRoomValid: empty/too-long name is invalid', () => {
  assert.equal(isRoomValid(room({ name: '   ' })), false);
  assert.equal(isRoomValid(room({ name: 'x'.repeat(51) })), false);
});

test('isRoomValid: out-of-range dimension is invalid', () => {
  assert.equal(isRoomValid(room({ length: 499 })), false);
  assert.equal(isRoomValid(room({ width: 15001 })), false);
});

// --- Apartment validity (FR-APT bounds) ------------------------------------

test('isApartmentValid: default apartment is valid', () => {
  assert.equal(isApartmentValid(DEFAULT_STATE), true);
});

test('isApartmentValid: bad ceiling / opening / module invalidates', () => {
  assert.equal(isApartmentValid(state({ ceiling: 1999 })), false);
  assert.equal(isApartmentValid(state({ opening: 1700 })), false);
  assert.equal(isApartmentValid(state({ opening: 3000, ceiling: 2800 })), false); // opening > ceiling
  assert.equal(isApartmentValid(state({ module: 999 })), false); // not a standard module
});

// --- The results gate (FR-SHELL-04) ----------------------------------------

test('showResults: true for valid default state', () => {
  assert.equal(showResults(DEFAULT_STATE), true);
});

test('showResults: false when apartment invalid', () => {
  assert.equal(showResults(state({ ceiling: 100 })), false);
});

test('showResults: false when no room is valid', () => {
  assert.equal(showResults(state({ rooms: [room({ length: 10 })] })), false);
});

test('showResults: true when at least one of several rooms is valid', () => {
  assert.equal(
    showResults(state({ rooms: [room({ length: 10 }), room({ id: 'r2' })] })),
    true,
  );
});

// --- Apartment reducers (FR-APT-03) -----------------------------------------

test('default state: module is the live suggestion and untouched', () => {
  assert.equal(DEFAULT_STATE.moduleTouched, false);
  assert.equal(
    DEFAULT_STATE.module,
    suggestModule(DEFAULT_STATE.ceiling, DEFAULT_STATE.opening).suggested,
  );
});

test('withCeiling: untouched module follows the new suggestion', () => {
  const next = withCeiling(DEFAULT_STATE, 3500);
  assert.equal(next.ceiling, 3500);
  assert.equal(next.module, suggestModule(3500, DEFAULT_STATE.opening).suggested);
  assert.equal(next.moduleTouched, false);
});

test('withOpening: untouched module follows the new suggestion', () => {
  const next = withOpening(DEFAULT_STATE, 2400);
  assert.equal(next.opening, 2400);
  assert.equal(next.module, suggestModule(DEFAULT_STATE.ceiling, 2400).suggested);
});

test('withModule: sets the value and marks it touched', () => {
  const next = withModule(DEFAULT_STATE, 350);
  assert.equal(next.module, 350);
  assert.equal(next.moduleTouched, true);
});

test('a touched module is sticky across ceiling/opening edits', () => {
  const touched = withModule(DEFAULT_STATE, 350);
  const afterCeiling = withCeiling(touched, 4200);
  assert.equal(afterCeiling.ceiling, 4200);
  assert.equal(afterCeiling.module, 350, 'ceiling edit must not clobber the override');
  assert.equal(afterCeiling.moduleTouched, true);

  const afterOpening = withOpening(afterCeiling, 1900);
  assert.equal(afterOpening.module, 350, 'opening edit must not clobber the override');
});

test('reducers are pure — do not mutate the input state', () => {
  const before = { ...DEFAULT_STATE };
  withCeiling(DEFAULT_STATE, 3000);
  withOpening(DEFAULT_STATE, 2000);
  withModule(DEFAULT_STATE, 600);
  assert.deepEqual(DEFAULT_STATE, before);
});

// --- Room-list reducers (FR-ROOM-01/02/03) ---------------------------------

test('addRoom: appends a defaulted room with a unique id', () => {
  const next = addRoom(DEFAULT_STATE);
  assert.equal(next.rooms.length, DEFAULT_STATE.rooms.length + 1);
  const added = next.rooms[next.rooms.length - 1];
  assert.equal(added.name, `Room ${DEFAULT_STATE.rooms.length + 1}`);
  assert.equal(added.length, 3000);
  assert.equal(added.width, 2400);
  // id is distinct from every existing room's id
  assert.ok(DEFAULT_STATE.rooms.every((r) => r.id !== added.id));
});

test('addRoom: successive rooms get distinct ids', () => {
  const one = addRoom(DEFAULT_STATE);
  const two = addRoom(one);
  const ids = two.rooms.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'all ids unique');
});

test('removeRoom: removes the room matched by id', () => {
  const two = addRoom(DEFAULT_STATE);
  const targetId = two.rooms[0].id;
  const next = removeRoom(two, targetId);
  assert.equal(next.rooms.length, 1);
  assert.ok(next.rooms.every((r) => r.id !== targetId));
});

test('removeRoom: is a no-op on the last remaining room', () => {
  const onlyId = DEFAULT_STATE.rooms[0].id;
  const next = removeRoom(DEFAULT_STATE, onlyId);
  assert.equal(next, DEFAULT_STATE, 'last room cannot be removed (identity returned)');
});

test('updateRoom: patches only the matched room', () => {
  const two = addRoom(DEFAULT_STATE);
  const id = two.rooms[0].id;
  const next = updateRoom(two, id, { name: 'Kitchen', length: 4200 });
  assert.equal(next.rooms[0].name, 'Kitchen');
  assert.equal(next.rooms[0].length, 4200);
  assert.equal(next.rooms[0].width, two.rooms[0].width, 'unpatched field preserved');
  assert.deepEqual(next.rooms[1], two.rooms[1], 'other rooms untouched');
});

test('room reducers are pure — do not mutate the input state', () => {
  const base = addRoom(DEFAULT_STATE); // two rooms
  const snapshot = JSON.parse(JSON.stringify(base));
  addRoom(base);
  removeRoom(base, base.rooms[0].id);
  updateRoom(base, base.rooms[0].id, { name: 'X' });
  assert.deepEqual(base, snapshot);
});

// --- Mode toggle (FR-MODE-01/02/03/04/05) ----------------------------------

test('default mode is 3d', () => {
  assert.equal(DEFAULT_STATE.mode, '3d');
});

test('moduleSuggestion: 3D uses heights, 2D uses room dimensions', () => {
  const in3d = moduleSuggestion(DEFAULT_STATE);
  assert.deepEqual(in3d, suggestModule(DEFAULT_STATE.ceiling, DEFAULT_STATE.opening));
  const in2d = moduleSuggestion(state({ mode: '2d' }));
  assert.deepEqual(in2d, suggestModule2D(DEFAULT_STATE.rooms.filter(isRoomValid)));
});

test('withMode: untouched module re-derives from the new mode’s source', () => {
  // Default room 3000×2400 → gcd 600 → suggested 600 in 2D; heights suggest 700 in 3D.
  const next = withMode(DEFAULT_STATE, '2d');
  assert.equal(next.mode, '2d');
  assert.equal(next.module, suggestModule2D(DEFAULT_STATE.rooms.filter(isRoomValid)).suggested);
  assert.equal(next.moduleTouched, false);
});

test('withMode: a touched module is sticky across a mode switch', () => {
  const touched = withModule(DEFAULT_STATE, 350);
  const next = withMode(touched, '2d');
  assert.equal(next.mode, '2d');
  assert.equal(next.module, 350, 'override survives the switch');
  assert.equal(next.moduleTouched, true);
});

test('withMode: switching preserves rooms and heights (shared state)', () => {
  const next = withMode(DEFAULT_STATE, '2d');
  assert.deepEqual(next.rooms, DEFAULT_STATE.rooms);
  assert.equal(next.ceiling, DEFAULT_STATE.ceiling);
  assert.equal(next.opening, DEFAULT_STATE.opening);
});

test('room edits resync the untouched module in 2D but not in 3D', () => {
  // In 2D, updating a room dimension re-derives the suggestion from rooms.
  const in2d = state({ mode: '2d' });
  const edited2d = updateRoom(in2d, in2d.rooms[0].id, { length: 3500, width: 3500 });
  assert.equal(
    edited2d.module,
    suggestModule2D([{ length: 3500, width: 3500 }]).suggested,
  );
  // In 3D, the same edit leaves the height-derived module unchanged.
  const edited3d = updateRoom(DEFAULT_STATE, DEFAULT_STATE.rooms[0].id, { length: 3500 });
  assert.equal(edited3d.module, DEFAULT_STATE.module);
});

test('isApartmentValid: 2D ignores hidden heights; 3D still checks them', () => {
  // A bad opening is invalid in 3D but irrelevant in 2D.
  assert.equal(isApartmentValid(state({ opening: 1700 })), false); // 3D default
  assert.equal(isApartmentValid(state({ mode: '2d', opening: 1700 })), true); // 2D ignores it
  // A non-standard module is invalid in both modes.
  assert.equal(isApartmentValid(state({ mode: '2d', module: 999 })), false);
});

// --- Purity (no framework imports in lib/app-state.ts) ---------------------

test('lib/app-state.ts imports no framework code', () => {
  const src = readFileSync(fileURLToPath(new URL('./app-state.ts', import.meta.url)), 'utf8');
  assert.ok(!/from\s+['"]react/.test(src), 'must not import react');
  assert.ok(!/from\s+['"]next/.test(src), 'must not import next/*');
  assert.ok(!/\bdocument\b|\bwindow\b/.test(src), 'must not reference DOM globals');
});
