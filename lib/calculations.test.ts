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
  suggestModule2D,
  computeModuleRuler,
  moduleWarning,
  computeVerticalBands,
  layoutBandDiagram,
  computeGoldenSplit,
  longerWall,
  isApproximateFit,
  computeRoomGrid,
  gridRoundDirection,
  computeWalkways,
  rateWalkway,
  walkwayMeterBars,
  layoutRoom2D,
  layoutRoom3D,
  isValidCeiling,
  isValidOpening,
  isValidDimension,
} from './calculations.ts';
import { CALC_LABELS } from './i18n.ts';

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

// --- suggestModule2D (FR-MODULE2D-01/02) -----------------------------------

test('suggestModule2D: single room → gcd(length, width)', () => {
  const s = suggestModule2D([{ length: 4200, width: 3500 }]);
  assert.equal(s.rawGcd, 700); // gcd(4200, 3500)
  assert.equal(s.suggested, 700);
  assert.equal(s.residual, 0);
});

test('suggestModule2D: folds the GCD across every room’s length & width', () => {
  const s = suggestModule2D([
    { length: 4200, width: 3500 },
    { length: 3800, width: 2500 },
    { length: 2150, width: 1500 },
  ]);
  assert.equal(s.rawGcd, 50); // gcd of all six dimensions
  assert.equal(s.suggested, 100); // nearest standard module to 50
  assert.equal(s.residual, 50); // surfaced, not silent
});

test('suggestModule2D: fold is order-independent (GCD associativity)', () => {
  const a = suggestModule2D([
    { length: 4200, width: 3500 },
    { length: 3800, width: 2500 },
  ]);
  const b = suggestModule2D([
    { length: 2500, width: 3800 },
    { length: 3500, width: 4200 },
  ]);
  assert.equal(a.rawGcd, b.rawGcd);
});

test('suggestModule2D: non-standard GCD snaps to a standard module, residual surfaced', () => {
  const s = suggestModule2D([{ length: 1250, width: 1250 }]); // gcd = 1250
  assert.ok((STANDARD_MODULES as readonly number[]).includes(s.suggested));
  assert.notEqual(s.suggested, s.rawGcd);
  assert.ok(s.residual > 0);
});

test('suggestModule2D: empty list folds to rawGcd 0, snaps to smallest module (residual surfaced)', () => {
  const s = suggestModule2D([]);
  assert.equal(s.rawGcd, 0);
  assert.equal(s.suggested, 100); // nearestStandardModule(0) — no "|| 100" magic
  assert.equal(s.residual, 100); // honest, not hidden as 0
});

// --- computeModuleRuler (FR-MODULE-04) -------------------------------------

test('computeModuleRuler: sizes at M=700', () => {
  const rows = computeModuleRuler(700);
  assert.deepEqual(
    rows.map((r) => r.size),
    [175, 350, 700, 1050, 1400, 2100, 2800],
  );
});

test('computeModuleRuler: labels equal CALC_LABELS (never translated)', () => {
  const rows = computeModuleRuler(700);
  assert.deepEqual(
    rows.map((r) => r.label),
    [...CALC_LABELS],
  );
});

test('computeModuleRuler: fractional module rounds each size', () => {
  const rows = computeModuleRuler(150);
  assert.equal(rows[0].size, 38); // round(150 * 0.25) = round(37.5) = 38
  assert.equal(rows[1].size, 75); // round(150 * 0.5)
});

// --- moduleWarning (FR-MODULE-05) ------------------------------------------

test('moduleWarning: none within the practical range', () => {
  assert.equal(moduleWarning(700), null);
  assert.equal(moduleWarning(1000), null); // boundary inclusive
  assert.equal(moduleWarning(100), null); // boundary inclusive
});

test('moduleWarning: large above 1000, small below 100', () => {
  assert.equal(moduleWarning(1001), 'large');
  assert.equal(moduleWarning(99), 'small');
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

// --- layoutBandDiagram (FR-VERT-02/03/04/06) -------------------------------

test('layoutBandDiagram: divisible ceiling → full bands, no partial', () => {
  const l = layoutBandDiagram(2800, 700);
  assert.equal(l.bands.length, 4);
  assert.equal(l.bands.some((b) => b.partial), false);
});

test('layoutBandDiagram: non-divisible ceiling → trailing partial band', () => {
  const l = layoutBandDiagram(3000, 700); // floor=4, remainder 200
  assert.equal(l.bands.length, 5);
  const partial = l.bands[l.bands.length - 1];
  assert.equal(partial.partial, true);
  assert.equal(partial.span, 200);
  assert.equal(partial.from, 2800);
  assert.equal(partial.to, 3000);
});

test('layoutBandDiagram: large band count is derived, not capped', () => {
  const l = layoutBandDiagram(5000, 100);
  assert.equal(l.bands.length, 50);
});

test('layoutBandDiagram: opening on a boundary is aligned', () => {
  const l = layoutBandDiagram(2800, 700, 2100);
  assert.deepEqual(l.opening, { mm: 2100, aligned: true });
});

test('layoutBandDiagram: off-grid opening at its true height', () => {
  const l = layoutBandDiagram(2800, 400, 2100); // 2100 % 400 !== 0
  assert.equal(l.opening?.aligned, false);
  assert.equal(l.opening?.mm, 2100);
});

test('layoutBandDiagram: no opening → null overlay', () => {
  assert.equal(layoutBandDiagram(2800, 700).opening, null);
});

test('layoutBandDiagram: band-name key sequence (3D rule)', () => {
  const keys = layoutBandDiagram(2800, 700, 2100).bands.map((b) => b.nameKey);
  // base at bottom, door-head where the opening (2100) falls (band index 2: 1400..2100),
  // upper/ceiling at top; the rest work-zone.
  assert.equal(keys[0], 'band.basePlinth');
  assert.equal(keys[keys.length - 1], 'band.upperCeiling');
  assert.equal(keys[2], 'band.doorHead'); // 1400 < 2100 <= 2100
});

test('layoutBandDiagram: mark labels condense only above the density threshold', () => {
  // Sparse: 4 bands → 5 marks (≤16) → no condensing, every label kept.
  const sparse = layoutBandDiagram(2800, 700);
  assert.equal(sparse.condensed, false);
  assert.ok(sparse.marks.every((m) => !m.condensedOut));

  // 15 full bands → 16 marks (== threshold, not >) → still not condensed.
  assert.equal(layoutBandDiagram(1500, 100).marks.length, 16);
  assert.equal(layoutBandDiagram(1500, 100).condensed, false);

  // 16 full bands → 17 marks (> 16) → condensed; the last label is always kept.
  const dense = layoutBandDiagram(1600, 100);
  assert.equal(dense.marks.length, 17);
  assert.equal(dense.condensed, true);
  assert.equal(dense.marks[dense.marks.length - 1].condensedOut, false);
  assert.equal(dense.marks[0].condensedOut, false); // index 0 kept (i % 4 === 0)
  assert.equal(dense.marks[1].condensedOut, true); // index 1 hidden
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

// --- longerWall / isApproximateFit (FR-GOLD-03/04) -------------------------

test('longerWall: returns the larger dimension', () => {
  assert.equal(longerWall({ length: 3500, width: 4200 }), 4200); // width larger
  assert.equal(longerWall({ length: 4200, width: 3500 }), 4200); // length larger
  assert.equal(longerWall({ length: 3000, width: 3000 }), 3000); // square
});

test('isApproximateFit: true only above a quarter module', () => {
  // ¼M for M=700 is 175.
  assert.equal(isApproximateFit(174, 700), false);
  assert.equal(isApproximateFit(175, 700), false); // exactly ¼M is still clean (not >)
  assert.equal(isApproximateFit(176, 700), true);
});

test('golden worked example: living room reads clean, offset ≤ ¼M', () => {
  const g = computeGoldenSplit(longerWall({ length: 4200, width: 3500 }), 700);
  near(g.larger, 2595.6, 1e-1);
  assert.equal(g.largerSnapped, 2450);
  near(g.snapOffset, 145.6, 1e-1);
  assert.equal(isApproximateFit(g.snapOffset, 700), false); // 145.6 ≤ 175
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

// --- gridRoundDirection (FR-GRID-03 sign convention) -----------------------

test('gridRoundDirection: positive over grid rounds down, negative under rounds up', () => {
  assert.equal(gridRoundDirection(300), 'roundDown'); // over the grid line
  assert.equal(gridRoundDirection(-300), 'roundUp'); // under the grid line
  assert.equal(gridRoundDirection(0), null); // exact — no rounding
});

test('gridRoundDirection: matches the signed remainders of the kitchen worked example', () => {
  const r = computeRoomGrid(3800, 2500, 700); // engine: length +300, width −300
  assert.equal(gridRoundDirection(r.lengthRemainder), 'roundDown'); // +300 (over grid) → down
  assert.equal(gridRoundDirection(r.widthRemainder), 'roundUp'); // −300 (under grid) → up
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

// --- walkwayMeterBars + preset rows (FR-WALK-04) ---------------------------

test('walkwayMeterBars: comfortable 3, acceptable 2, tight 1', () => {
  assert.equal(walkwayMeterBars('comfortable'), 3);
  assert.equal(walkwayMeterBars('acceptable'), 2);
  assert.equal(walkwayMeterBars('tight'), 1);
});

test('walkway preset rows: a 3500-wide room clears all three presets comfortably', () => {
  assert.equal(computeWalkways(3500, 600).available, 2900); // wardrobe/kitchen
  assert.equal(computeWalkways(3500, 900).available, 2600); // sofa/bed
  assert.equal(computeWalkways(3500, 1200).available, 2300); // facing units
  for (const d of [600, 900, 1200]) {
    assert.equal(computeWalkways(3500, d).rating, 'comfortable');
  }
});

test('walkway facing preset can go negative and reads tight', () => {
  const w = computeWalkways(1000, 1200); // two facing 600 units don't fit
  assert.equal(w.available, -200);
  assert.equal(w.rating, 'tight');
  assert.equal(w.recommendation, 'walkway.tight');
});

// --- layoutRoom2D (FR-VIZ2D-02/03) -----------------------------------------

test('layoutRoom2D: exact fit → whole cells, no strips', () => {
  const l = layoutRoom2D(3000, 2400, 600); // 5 × 4 exact
  assert.equal(l.cols, 5);
  assert.equal(l.rows, 4);
  assert.equal(l.rightStrip, 0);
  assert.equal(l.bottomStrip, 0);
});

test('layoutRoom2D: remainders surface as edge strips', () => {
  const l = layoutRoom2D(3200, 2500, 600); // floor 5 (rem 200) × floor 4 (rem 100)
  assert.equal(l.cols, 5);
  assert.equal(l.rows, 4);
  assert.equal(l.rightStrip, 200);
  assert.equal(l.bottomStrip, 100);
});

test('layoutRoom2D: cols/rows are floor(dim/m), not round', () => {
  // 3599/600 = 5.998 → floor 5 (round would give 6); the visualizer tiles whole cells inside.
  const l = layoutRoom2D(3599, 3599, 600);
  assert.equal(l.cols, 5);
  assert.equal(l.rows, 5);
  assert.equal(l.rightStrip, 599);
});

test('layoutRoom2D: exactly one highlighted cell, bottom-left', () => {
  const l = layoutRoom2D(3000, 2400, 600);
  assert.deepEqual(l.highlight, { col: 0, row: 3 }); // rows-1
});

test('layoutRoom2D: room smaller than a module → rows 0, highlight row 0, no negative strip', () => {
  const l = layoutRoom2D(500, 500, 600); // smaller than one module
  assert.equal(l.cols, 0);
  assert.equal(l.rows, 0);
  assert.deepEqual(l.highlight, { col: 0, row: 0 }); // max(0, rows-1)
  assert.equal(l.rightStrip, 500);
  assert.equal(l.bottomStrip, 500);
});

// --- layoutRoom3D (FR-VIZ3D-01/02/03) --------------------------------------

test('layoutRoom3D: box extents equal the room dimensions', () => {
  const l = layoutRoom3D(4200, 3500, 2800, 700, 2100);
  assert.equal(l.l, 4200);
  assert.equal(l.w, 3500);
  assert.equal(l.h, 2800);
});

test('layoutRoom3D: cols/rows/layers are floor(dim/m)', () => {
  const l = layoutRoom3D(4200, 3500, 2800, 700, 2100);
  assert.equal(l.cols, 6); // 4200/700
  assert.equal(l.rows, 5); // 3500/700
  assert.equal(l.layers, 4); // 2800/700
});

test('layoutRoom3D: exactly one M³ cube at the room corner', () => {
  const l = layoutRoom3D(4200, 3500, 2800, 700);
  assert.deepEqual(l.cube, { x: 0, y: 0, z: 0 });
});

test('layoutRoom3D: openingY set for a valid opening', () => {
  assert.equal(layoutRoom3D(4200, 3500, 2800, 700, 2100).openingY, 2100);
});

test('layoutRoom3D: openingY null when omitted or above the ceiling (FR-VIZ3D-02)', () => {
  assert.equal(layoutRoom3D(4200, 3500, 2800, 700).openingY, null); // omitted
  assert.equal(layoutRoom3D(4200, 3500, 2800, 700, 3000).openingY, null); // > ceiling
  assert.equal(layoutRoom3D(4200, 3500, 2800, 700, 2800).openingY, 2800); // == ceiling is valid
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
