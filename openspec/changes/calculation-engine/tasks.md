## 1. Test runner wiring (ADR-0001)

- [ ] 1.1 Add `tsx` as a devDependency in `package.json`
- [ ] 1.2 Add a `test` script running `node:test` via `tsx` over `lib/*.test.ts`
- [ ] 1.3 Verify `npm test` runs the runner (empty/failing suite is fine at this point)

## 2. Constants, types, and helpers (FR-MODULE-01, NFR-PURE-01, ADR-0002)

- [ ] 2.1 Create `lib/calculations.ts` with no `next`/`react`/DOM imports
- [ ] 2.2 Export `STANDARD_MODULES = [100,150,200,300,350,600,700]` as the single swappable constant
- [ ] 2.3 Define shared types: `ModuleSuggestion`, `VerticalBands`, `GoldenSplit`, `RoomGrid`, `Walkway`, `GridQuality`, `WalkwayRating`
- [ ] 2.4 Implement `gcd(a, b)`, `nearestStandardModule(v)` (only reader of `STANDARD_MODULES`), and `snap(value, step)`
- [ ] 2.5 Export validation bounds (ceiling 2000–5000, opening 1800–ceiling, dim 500–15000) and warning thresholds (M>1000, M<100) and standard furniture depths (600/900/1200)

## 3. Module suggestion (FR-MODULE-01)

- [ ] 3.1 Implement `suggestModule(ceiling, opening)` → `{ rawGcd, suggested, alternatives, residual }`
- [ ] 3.2 Always compute/return `residual = |rawGcd − suggested|`; `alternatives` = two nearest other standard values

## 4. Vertical bands (FR-VERT-01/02/03/04)

- [ ] 4.1 Implement `computeVerticalBands(ceiling, m)` → `{ bands, topRemainder, openingAligned, openingBand }`
- [ ] 4.2 Derive band count as `floor(ceiling / m)`, report `topRemainder`, and support 2…50+ bands with no hardcoded cap
- [ ] 4.3 Set `openingAligned` from opening-on-boundary; preserve true opening height for the off-grid marker

## 5. Golden split (FR-GOLD-01/02/03)

- [ ] 5.1 Implement `computeGoldenSplit(length, m)` → `{ larger, smaller, largerSnapped, smallerSnapped, snapOffset }`
- [ ] 5.2 `larger = length×0.618`, `smaller = length×0.382`, `largerSnapped = snap(larger, m/2)`, `smallerSnapped = length − largerSnapped`, `snapOffset = |larger − largerSnapped|`

## 6. Room grid fit (FR-GRID-01/02/03/04)

- [ ] 6.1 Implement `computeRoomGrid(length, width, m)` → `{ lengthModules, widthModules, lengthRemainder, widthRemainder, quality }`
- [ ] 6.2 Use `round(dimension/m)` counts and signed nearest-distance remainders
- [ ] 6.3 Quality: `exact` (both 0), `close` (both ≤ ¼M), else `poor` — 1 mm short reads `close`

## 7. Walkway clearance (FR-WALK-01/02/03, BC-WALK-01)

- [ ] 7.1 Implement `computeWalkways(roomWidth, furnitureDepth, oppositeDepth?)` → `{ available, rating, recommendation }`
- [ ] 7.2 `available = roomWidth − furnitureDepth − (oppositeDepth ?? 0)`; fixed mm ratings ≥900/≥600/<600, never scaling with M; guidance-phrased recommendation

## 8. Unit suite (NFR-TEST-01, NFR-PERF-02)

- [ ] 8.1 Create `lib/calculations.test.ts` with `node:test`
- [ ] 8.2 Cover helpers + each `compute*`/`suggest*` with normal, boundary, and edge cases (coprime heights, off-grid opening, 50+ bands, 1 mm-short dim, snap residuals)
- [ ] 8.3 Assert the living-room / kitchen / bathroom worked-example numbers (golden, grid, quality, walkway)
- [ ] 8.4 Add a purity assertion/check that the module imports no framework code

## 9. Verify

- [ ] 9.1 `npm test` passes green
- [ ] 9.2 `npm run lint` is clean
- [ ] 9.3 `npx tsc --noEmit` (or build) type-checks under strict mode
