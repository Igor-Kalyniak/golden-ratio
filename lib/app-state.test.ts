import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { suggestModule } from './calculations.ts';
import {
  DEFAULT_STATE,
  isApartmentValid,
  isRoomValid,
  showResults,
  withCeiling,
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

// --- Purity (no framework imports in lib/app-state.ts) ---------------------

test('lib/app-state.ts imports no framework code', () => {
  const src = readFileSync(fileURLToPath(new URL('./app-state.ts', import.meta.url)), 'utf8');
  assert.ok(!/from\s+['"]react/.test(src), 'must not import react');
  assert.ok(!/from\s+['"]next/.test(src), 'must not import next/*');
  assert.ok(!/\bdocument\b|\bwindow\b/.test(src), 'must not reference DOM globals');
});
