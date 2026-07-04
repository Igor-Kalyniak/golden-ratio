## ADDED Requirements

### Requirement: Standard modules constant and snapping helpers

The engine SHALL export `STANDARD_MODULES` as a single swappable constant — the provisional v1
value `[100, 150, 200, 300, 350, 600, 700]` (mm) — and all snapping to a standard module SHALL go
through one helper (`nearestStandardModule`) that reads only that constant. The engine SHALL also
export a `gcd(a, b)` helper (integer, absolute-valued) and a `snap(value, step)` helper
(`round(value / step) * step`). No standard-module list literal SHALL be duplicated elsewhere.
(`FR-MODULE-01`, [ADR-0002])

#### Scenario: Nearest standard module snaps to closest value

- **WHEN** `nearestStandardModule(500)` is called
- **THEN** it returns `600` (the nearest value in `STANDARD_MODULES`, resolving the 250 mm gap);
  an exact tie (e.g. `475`) resolves stably to the lower value (`350`)

#### Scenario: GCD of two heights

- **WHEN** `gcd(2800, 2100)` is called
- **THEN** it returns `700`

#### Scenario: Snap to an arbitrary step

- **WHEN** `snap(2595.6, 350)` is called
- **THEN** it returns `2450`

### Requirement: Suggest module from ceiling and opening

`suggestModule(ceiling, opening)` SHALL return `{ rawGcd, suggested, alternatives, residual }`
where `rawGcd = gcd(ceiling, opening)`, `suggested = nearestStandardModule(rawGcd)`,
`residual = |rawGcd − suggested|`, and `alternatives` is the two nearest other standard-module
values. `residual` SHALL always be computed and returned so a poor snap is visible, never silent.
(`FR-MODULE-01`, [ADR-0002])

#### Scenario: Worked example — clean divisor

- **WHEN** `suggestModule(2800, 2100)` is called
- **THEN** `rawGcd` is `700`, `suggested` is `700`, `residual` is `0`, and `alternatives` contains
  `600` and `350`

#### Scenario: Coprime heights snap to a standard module

- **WHEN** `suggestModule(2801, 2100)` yields `rawGcd = 1`
- **THEN** `suggested` snaps to the nearest standard module (`100`) and `residual` reflects the full
  distance rather than returning a literal 1 mm module

### Requirement: Compute vertical bands

`computeVerticalBands(ceiling, m)` SHALL return `{ bands, topRemainder, openingAligned, openingBand }`.
The number of full bands SHALL be `floor(ceiling / m)`; `topRemainder = ceiling − full × m` and SHALL
be reported as a partial band when greater than zero. `openingAligned` SHALL be true only when the
opening lands on a band boundary; the returned value SHALL support variable band counts (2 to 50+)
without hardcoding. (`FR-VERT-01/02/03/04`)

#### Scenario: Ceiling not divisible by module leaves a top remainder

- **WHEN** `computeVerticalBands(2850, 700)` is called
- **THEN** there are `4` full bands and `topRemainder` is `50`

#### Scenario: Opening off a band boundary is flagged

- **WHEN** vertical bands are computed with a module of `700` and an opening height of `2100`
- **THEN** `openingAligned` is `true` because `2100` is a multiple of `700`; for an opening of `2050`
  `openingAligned` is `false` and the true opening height is preserved for an off-grid marker

#### Scenario: Large band count stays derived

- **WHEN** `computeVerticalBands(5000, 100)` is called
- **THEN** it derives `50` bands from `floor(5000 / 100)` with no hardcoded cap

### Requirement: Compute golden-ratio wall split

`computeGoldenSplit(length, m)` SHALL return `{ larger, smaller, largerSnapped, smallerSnapped, snapOffset }`
where `larger = length × 0.618`, `smaller = length × 0.382`, `largerSnapped = snap(larger, m / 2)`
(nearest ½M grid line), `smallerSnapped = length − largerSnapped`, and
`snapOffset = |larger − largerSnapped|`. The caller applies this to the longer wall of a room; an
offset greater than ¼M (`m / 4`) SHALL be detectable as an "approximate fit". (`FR-GOLD-01/02/03`)

#### Scenario: Worked example — living room longer wall

- **WHEN** `computeGoldenSplit(4200, 700)` is called
- **THEN** `larger ≈ 2595.6`, `smaller ≈ 1604.4`, `largerSnapped` is `2450`, `smallerSnapped` is
  `1750`, and `snapOffset ≈ 145.6`

#### Scenario: Large snap offset is surfaced

- **WHEN** a golden split produces a `snapOffset` greater than `m / 4`
- **THEN** the returned `snapOffset` exposes the distance so the caller can flag "approximate fit"

### Requirement: Compute room grid fit

`computeRoomGrid(length, width, m)` SHALL return
`{ lengthModules, widthModules, lengthRemainder, widthRemainder, quality }`. Module counts SHALL use
`round(dimension / m)` (nearest, not floor). Each remainder SHALL be the signed distance to the
nearest multiple (`dimension − round(dimension / m) × m`) so the UI can say "round up" vs
"round down". `quality` SHALL be `exact` when both nearest-distances are 0, `close` when both
absolute remainders are ≤ ¼M (`m / 4`), and `poor` otherwise — so a dimension 1 mm short of a module
reads `close`, not `poor`. (`FR-GRID-01/02/03/04`)

#### Scenario: Worked example — exact fit

- **WHEN** `computeRoomGrid(4200, 3500, 700)` is called
- **THEN** `lengthModules` is `6`, `widthModules` is `5`, both remainders are `0`, and `quality` is
  `exact`

#### Scenario: Worked example — poor fit

- **WHEN** `computeRoomGrid(3800, 2500, 700)` is called
- **THEN** `lengthModules` is `5`, `widthModules` is `4`, `lengthRemainder` is `+300`,
  `widthRemainder` is `−300`, and `quality` is `poor`

#### Scenario: One millimetre short reads close, not poor

- **WHEN** `computeRoomGrid(4199, 3500, 700)` is called
- **THEN** the length remainder is `−1` (nearest distance) and `quality` is `close`, never `poor`

### Requirement: Compute walkway clearance

`computeWalkways(roomWidth, furnitureDepth, oppositeDepth?)` SHALL return
`{ available, rating, recommendation }` where
`available = roomWidth − furnitureDepth − (oppositeDepth ?? 0)`. `rating` SHALL use fixed ergonomic
thresholds in millimetres, decoupled from the module M: `available ≥ 900` → `comfortable`,
`available ≥ 600` → `acceptable`, `available < 600` → `tight`. The `recommendation` SHALL be phrased
as guidance, not code compliance. (`FR-WALK-01/02/03`, `BC-WALK-01`)

#### Scenario: Standard wardrobe clearance is comfortable

- **WHEN** `computeWalkways(3500, 600)` is called
- **THEN** `available` is `2900` and `rating` is `comfortable`

#### Scenario: Below 600 mm is tight regardless of module

- **WHEN** `computeWalkways(1500, 900)` is called
- **THEN** `available` is `600` rated `acceptable`; with `computeWalkways(1200, 900)` the available
  `300` is rated `tight`, and the thresholds do not change when the module M changes

#### Scenario: Opposite wall depth is subtracted when supplied

- **WHEN** `computeWalkways(3500, 600, 600)` is called
- **THEN** `available` is `2300`

### Requirement: Engine is framework-free and pure

`lib/calculations.ts` SHALL contain only pure functions over numbers and plain objects, with no
imports of `next/*`, no `react`, and no DOM globals, so it is 100% unit-testable and its results are
deterministic and synchronous. (`NFR-PURE-01`, `NFR-PERF-01`)

#### Scenario: No framework imports

- **WHEN** the source of `lib/calculations.ts` is inspected
- **THEN** it contains no import of `next`, `react`, `react-dom`, or any DOM global (`window`,
  `document`)

#### Scenario: Deterministic synchronous results

- **WHEN** any exported function is called twice with identical arguments
- **THEN** it returns identical results with no promises, timers, or side effects

### Requirement: Unit test coverage of the engine

Every calculation function SHALL have unit tests, run by Node `node:test` with native TypeScript
type-stripping — `node --test lib/*.test.ts` (`tsx` loader dropped; [ADR-0001] amended) —
covering normal, boundary, and edge-case inputs — variable band counts, off-grid openings, coprime
heights, 1 mm-short dimensions, and snap residuals — and asserting the documented worked-example
numbers. A `test` script SHALL exist in `package.json` and the suite SHALL pass. Recomputation for a
realistic apartment (≤ 20 rooms) SHALL be well within a 16 ms budget. (`NFR-TEST-01`, `NFR-PERF-02`)

#### Scenario: Suite runs green

- **WHEN** `npm test` is run
- **THEN** the `node:test` suite executes the engine tests and exits successfully with no failures

#### Scenario: Worked example is asserted

- **WHEN** the test suite runs
- **THEN** it asserts the living-room / kitchen / bathroom worked-example numbers (golden split, grid
  fit, quality badges, walkway ratings) from the reference calculation logic
