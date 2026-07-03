import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  STANDARD_MODULES,
  gcd,
  nearestStandardModule,
  snap,
  suggestModule,
  computeVerticalBands,
  computeGoldenSplit,
  computeRoomGrid,
  computeWalkways,
  rateWalkway,
  isValidCeiling,
  isValidOpening,
  isValidDimension,
} from './calculations.ts';

/** Assert two floats are equal within a small tolerance. */
function near(actual: number, expected: number, eps = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= eps, `expected ${actual} ≈ ${expected}`);
}

// --- Helpers ---------------------------------------------------------------

test('gcd: normal and edge cases', () => {
  assert.equal(gcd(2800, 2100), 700);
  assert.equal(gcd(2100, 2800), 700); // order-independent
  assert.equal(gcd(2801, 2100), 1); // coprime
  assert.equal(gcd(700, 0), 700); // zero
  assert.equal(gcd(-2800, 2100), 700); // absolute-valued
});

test('nearestStandardModule: snaps to nearest, resolves the 250mm gap', () => {
  assert.equal(nearestStandardModule(700), 700);
  assert.equal(nearestStandardModule(500), 600); // in the 350–600 gap, nearer 600
  assert.equal(nearestStandardModule(470), 350); // in the gap, nearer 350
  assert.equal(nearestStandardModule(475), 350); // exact tie → keeps the lower (stable)
  assert.equal(nearestStandardModule(1), 100);
  assert.equal(nearestStandardModule(10000), 700); // beyond the list clamps to max
});

test('snap: rounds to nearest step', () => {
  assert.equal(snap(2595.6, 350), 2450);
  assert.equal(snap(2348.4, 350), 2450);
  assert.equal(snap(0, 350), 0);
});

// --- suggestModule (FR-MODULE-01) ------------------------------------------

test('suggestModule: worked example 2800/2100 → M=700', () => {
  const s = suggestModule(2800, 2100);
  assert.equal(s.rawGcd, 700);
  assert.equal(s.suggested, 700);
  assert.equal(s.residual, 0);
  assert.deepEqual(s.alternatives, [600, 350]);
});

test('suggestModule: coprime heights snap to a standard module, residual surfaced', () => {
  const s = suggestModule(2801, 2100);
  assert.equal(s.rawGcd, 1);
  assert.equal(s.suggested, 100); // not a literal 1mm module
  assert.equal(s.residual, 99); // full distance, always visible
  assert.equal(s.alternatives.length, 2);
});

// --- computeVerticalBands (FR-VERT-01/02/03/04) ----------------------------

test('computeVerticalBands: ceiling not divisible leaves top remainder', () => {
  const b = computeVerticalBands(2850, 700);
  assert.equal(b.bands, 4);
  assert.equal(b.topRemainder, 50);
});

test('computeVerticalBands: opening alignment', () => {
  assert.equal(computeVerticalBands(2800, 700, 2100).openingAligned, true);
  assert.equal(computeVerticalBands(2800, 700, 2100).openingBand, 3);
  assert.equal(computeVerticalBands(2800, 700, 2050).openingAligned, false);
});

test('computeVerticalBands: no opening → not aligned, null band', () => {
  const b = computeVerticalBands(2800, 700);
  assert.equal(b.openingAligned, false);
  assert.equal(b.openingBand, null);
});

test('computeVerticalBands: large band count derived, not capped', () => {
  const b = computeVerticalBands(5000, 100);
  assert.equal(b.bands, 50);
  assert.equal(b.topRemainder, 0);
});

test('computeVerticalBands: minimal 2-band case', () => {
  const b = computeVerticalBands(2000, 700); // floor(2000/700)=2
  assert.equal(b.bands, 2);
  assert.equal(b.topRemainder, 600);
});

// --- computeGoldenSplit (FR-GOLD-01/02/03) ---------------------------------

test('computeGoldenSplit: living-room longer wall 4200', () => {
  const g = computeGoldenSplit(4200, 700);
  near(g.larger, 2595.6);
  near(g.smaller, 1604.4);
  assert.equal(g.largerSnapped, 2450);
  assert.equal(g.smallerSnapped, 1750);
  near(g.snapOffset, 145.6, 1e-4);
});

test('computeGoldenSplit: kitchen longer wall 3800', () => {
  const g = computeGoldenSplit(3800, 700);
  assert.equal(g.largerSnapped, 2450);
  assert.equal(g.smallerSnapped, 1350);
  near(g.snapOffset, 101.6, 1e-4);
});

test('computeGoldenSplit: bathroom longer wall 2150', () => {
  const g = computeGoldenSplit(2150, 700);
  assert.equal(g.largerSnapped, 1400);
  assert.equal(g.smallerSnapped, 750);
  near(g.snapOffset, 71.3, 1e-4);
});

// --- computeRoomGrid (FR-GRID-01/02/03/04) ---------------------------------

test('computeRoomGrid: exact fit (living room)', () => {
  const r = computeRoomGrid(4200, 3500, 700);
  assert.equal(r.lengthModules, 6);
  assert.equal(r.widthModules, 5);
  assert.equal(r.lengthRemainder, 0);
  assert.equal(r.widthRemainder, 0);
  assert.equal(r.quality, 'exact');
});

test('computeRoomGrid: poor fit (kitchen), signed remainders', () => {
  const r = computeRoomGrid(3800, 2500, 700);
  assert.equal(r.lengthModules, 5);
  assert.equal(r.widthModules, 4);
  assert.equal(r.lengthRemainder, 300); // 3800 − 5·700
  assert.equal(r.widthRemainder, -300); // 2500 − 4·700
  assert.equal(r.quality, 'poor');
});

test('computeRoomGrid: close fit (bathroom)', () => {
  const r = computeRoomGrid(2150, 1500, 700);
  assert.equal(r.lengthModules, 3);
  assert.equal(r.widthModules, 2);
  assert.equal(r.lengthRemainder, 50);
  assert.equal(r.widthRemainder, 100);
  assert.equal(r.quality, 'close');
});

test('computeRoomGrid: 1mm short reads close, not poor', () => {
  const r = computeRoomGrid(4199, 3500, 700);
  assert.equal(r.lengthModules, 6);
  assert.equal(r.lengthRemainder, -1); // nearest distance, not modulo
  assert.equal(r.quality, 'close');
});

test('computeRoomGrid: exactly ¼M remainder still reads close (boundary)', () => {
  const r = computeRoomGrid(2100 + 175, 700, 700); // length rem = +175 = M/4
  assert.equal(r.lengthRemainder, 175);
  assert.equal(r.quality, 'close');
});

// --- computeWalkways (FR-WALK-01/02/03, BC-WALK-01) ------------------------

test('computeWalkways: worked-example ratings', () => {
  assert.equal(computeWalkways(3500, 600).available, 2900);
  assert.equal(computeWalkways(3500, 600).rating, 'comfortable');
  assert.equal(computeWalkways(3500, 900).rating, 'comfortable'); // 2600
  assert.equal(computeWalkways(2500, 600).rating, 'comfortable'); // 1900
  assert.equal(computeWalkways(1500, 900).available, 600);
  assert.equal(computeWalkways(1500, 900).rating, 'acceptable'); // exactly 600
  assert.equal(computeWalkways(1500, 1200).available, 300);
  assert.equal(computeWalkways(1500, 1200).rating, 'tight'); // < 600
});

test('computeWalkways: opposite depth subtracted', () => {
  assert.equal(computeWalkways(3500, 600, 600).available, 2300);
});

test('computeWalkways: recommendation is a locale-independent key, not English prose', () => {
  assert.equal(computeWalkways(3500, 600).recommendation, 'walkway.comfortable');
  assert.equal(computeWalkways(1500, 900).recommendation, 'walkway.acceptable');
  assert.equal(computeWalkways(1500, 1200).recommendation, 'walkway.tight');
});

test('computeWalkways: thresholds are fixed mm, independent of module', () => {
  // Same 550mm clearance is "tight" regardless of what M might be.
  assert.equal(rateWalkway(899), 'acceptable');
  assert.equal(rateWalkway(900), 'comfortable');
  assert.equal(rateWalkway(599), 'tight');
  assert.equal(rateWalkway(600), 'acceptable');
});

// --- Validation bounds -----------------------------------------------------

test('validation bounds', () => {
  assert.equal(isValidCeiling(2800), true);
  assert.equal(isValidCeiling(1999), false);
  assert.equal(isValidCeiling(5001), false);
  assert.equal(isValidCeiling(2800.5), false);
  assert.equal(isValidOpening(2100, 2800), true);
  assert.equal(isValidOpening(1799, 2800), false);
  assert.equal(isValidOpening(2900, 2800), false); // above ceiling
  assert.equal(isValidDimension(500), true);
  assert.equal(isValidDimension(499), false);
  assert.equal(isValidDimension(15001), false);
});

// --- Purity (NFR-PURE-01) --------------------------------------------------

test('calculations.ts imports no framework code', () => {
  const src = readFileSync(fileURLToPath(new URL('./calculations.ts', import.meta.url)), 'utf8');
  assert.ok(!/from\s+['"]next/.test(src), 'must not import next/*');
  assert.ok(!/from\s+['"]react/.test(src), 'must not import react');
  assert.ok(!/\bdocument\b|\bwindow\b/.test(src), 'must not reference DOM globals');
});

test('STANDARD_MODULES is the provisional v1 list', () => {
  assert.deepEqual([...STANDARD_MODULES], [100, 150, 200, 300, 350, 600, 700]);
});
