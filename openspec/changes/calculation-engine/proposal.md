## Why

The Apartment Module & Golden Ratio Calculator replaces the proportioning arithmetic an
architect does by hand — GCD module suggestion, golden-ratio wall splits, grid fits, walkway
clearances, and vertical band derivation. All of that is pure math. Building it first, with no
UI, proves the hardest and highest-risk part of the product (`FR-MODULE-01`, `FR-VERT-*`,
`FR-GOLD-*`, `FR-GRID-*`, `FR-WALK-*`) against known worked-example numbers and lets every later
UI capability stay thin. This is capability **1** in [docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md)
and depends on nothing.

## What Changes

- Add `lib/calculations.ts` — a framework-free pure-math module (`NFR-PURE-01`) exporting:
  - `STANDARD_MODULES` — one swappable `const` (`[100,150,200,300,350,600,700]`), the single
    source of truth for snapping ([ADR-0002](../../../docs/adr/0002-standard-modules-swappable-constant.md)).
  - Shared types, validation bounds (ceiling 2000–5000, opening 1800–ceiling, dims 500–15000),
    and warning thresholds (M > 1000, M < 100).
  - Snapping helpers: `gcd`, `nearestStandardModule`, `snap`.
  - `suggestModule(ceiling, opening)` → `{ rawGcd, suggested, alternatives, residual }`
    (`FR-MODULE-01`); `residual` is always computed and returned so a poor snap is never silent.
  - `computeVerticalBands(ceiling, m)` → `{ bands, topRemainder, openingAligned, openingBand }`
    (`FR-VERT-01/02/03/04`).
  - `computeGoldenSplit(length, m)` → `{ larger, smaller, largerSnapped, smallerSnapped, snapOffset }`
    (`FR-GOLD-01/02/03`).
  - `computeRoomGrid(length, width, m)` → `{ lengthModules, widthModules, lengthRemainder, widthRemainder, quality }`
    (`FR-GRID-01/02/03/04`).
  - `computeWalkways(roomWidth, furnitureDepth, oppositeDepth?)` → `{ available, rating, recommendation }`
    with fixed mm thresholds decoupled from M (`FR-WALK-01/02/03`, `BC-WALK-01`).
- Wire the test runner — Node `node:test` + `tsx` ([ADR-0001](../../../docs/adr/0001-test-runner.md)):
  add `tsx` as a dev dependency and a `test` script to `package.json`.
- Add the unit suite (`lib/*.test.ts`) covering normal, boundary, and edge cases and asserting the
  worked-example numbers (`NFR-TEST-01`).

This change is **engine-only** — it delivers no React, no rendering, no strings. Presentation of
these values (Module Summary, band diagram, per-room cards) belongs to later capabilities.

## Capabilities

### New Capabilities
- `calculation-engine`: the pure-math contract for module suggestion, vertical bands, golden
  split, room grid fit, and walkway clearance — function signatures, returned fields, numeric
  correctness, purity, and unit-test coverage.

### Modified Capabilities
<!-- none — this is the first capability; no existing specs change -->

## Impact

- **New code:** `lib/calculations.ts`, `lib/calculations.test.ts`.
- **Tooling:** `package.json` gains a `tsx` dev dependency and a `test` script; no runtime deps.
- **Requirements owned:** `FR-MODULE-01`; `FR-VERT-01/02/03/04` (engine); `FR-GOLD-01/02/03`
  (engine); `FR-GRID-01/02/03/04` (engine); `FR-WALK-01/02/03` (engine); `NFR-PURE-01`,
  `NFR-TEST-01`, `NFR-PERF-01`, `NFR-PERF-02`.
- **No impact on:** `app/` (untouched), routing, server, or any UI capability.
- **Constraints honored:** `TC-DATA-01` (all local/synchronous), `TC-STACK-01` (TS strict).
