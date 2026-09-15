# Manual Test Plan — `calculation-engine`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> This capability is a pure-math library (`lib/calculations.ts`) with no UI surface yet, so most
> requirements are verified by the automated suite. Cases below prioritize the requirements with
> **no automated coverage** (`FR-GOLD-03`, `NFR-PERF-01`, `NFR-PERF-02`) and provide reproducible
> harness/observation steps for the rest.

- **Change:** `calculation-engine`
- **Owned requirement IDs:** FR-MODULE-01; FR-VERT-01/02/03/04 (engine); FR-GOLD-01/02/03 (engine); FR-GRID-01/02/03/04 (engine); FR-WALK-01/02/03 (engine); NFR-PURE-01, NFR-TEST-01, NFR-PERF-01, NFR-PERF-02
- **Last updated:** `2026-07-03`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §worked-example and [.agents/skills/calculation-logic/SKILL.md](../../../.agents/skills/calculation-logic/SKILL.md) — module M=700 from 2800/2100; living room 4200×3500, kitchen 3800×2500, bathroom 2150×1500.

## Preconditions (all cases)

- Repo checked out at the reviewed HEAD (`52db5cf` or later).
- Node 22+ (native TypeScript type-stripping; `tsx` is no longer used).
- Run the automated suite from the repo root: `node --test lib/calculations.test.ts` — expect `# pass 25 / # fail 0`.

## Cases

### TC-1 — Module suggestion from heights (worked example + coprime edge)

- **Requirement(s):** FR-MODULE-01
- **Preconditions:** REPL/Node session importing `lib/calculations.ts`.
- **Steps:**
  1. Call `suggestModule(2800, 2100)`.
  2. Call `suggestModule(2801, 2100)` (coprime edge).
- **Expected result:** (1) `{ rawGcd: 700, suggested: 700, residual: 0, alternatives: [600, 350] }`. (2) `rawGcd: 1`, `suggested: 100` (never a literal 1 mm module), `residual: 99` surfaced, `alternatives.length === 2`.
- **Result:** pass — covered by automated suite.

### TC-2 — Vertical bands: variable count, top remainder, opening alignment

- **Requirement(s):** FR-VERT-01, FR-VERT-02, FR-VERT-03, FR-VERT-04
- **Preconditions:** As TC-1.
- **Steps:**
  1. `computeVerticalBands(2850, 700)` → check `bands`/`topRemainder`.
  2. `computeVerticalBands(5000, 100)` and `computeVerticalBands(2000, 700)` → confirm count is derived (50 and 2), never capped.
  3. `computeVerticalBands(2800, 700, 2100)` and `computeVerticalBands(2800, 700, 2050)` → check `openingAligned`/`openingBand`.
- **Expected result:** (1) `bands: 4, topRemainder: 50`. (2) `bands: 50, topRemainder: 0` and `bands: 2, topRemainder: 600`. (3) aligned `true`/band `3`, then `false`. Band count = `floor(ceiling/m)` in all cases (never `round`).
- **Result:** pass — covered by automated suite.
- **Note (doc-drift, not a code defect):** the PDR boundary-conditions table (docs/PDR.md L274) still reads `round(ceiling / m)`; the implementation and the FR-VERT-02 main row use `floor`. Code is correct.

### TC-3 — Golden split, room grid, walkway (worked-example numbers)

- **Requirement(s):** FR-GOLD-01, FR-GOLD-02, FR-GRID-01, FR-GRID-02, FR-GRID-03, FR-GRID-04, FR-WALK-01, FR-WALK-02, FR-WALK-03
- **Preconditions:** As TC-1, module `m = 700`.
- **Steps:**
  1. `computeGoldenSplit(4200, 700)` — larger/smaller/snapped/offset.
  2. `computeRoomGrid(4200, 3500, 700)`, `computeRoomGrid(3800, 2500, 700)`, `computeRoomGrid(2150, 1500, 700)`.
  3. `computeWalkways(3500, 600)`, `computeWalkways(1500, 900)`, `computeWalkways(1500, 1200)`, `computeWalkways(3500, 600, 600)`.
- **Expected result:** (1) larger ≈ 2595.6, smaller ≈ 1604.4, `largerSnapped 2450`, `smallerSnapped 1750`, `snapOffset ≈ 145.6`. (2) living room `exact` (6×5, rem 0/0); kitchen `poor` (5×4, rem +300/−300, signed); bathroom `close` (3×2, rem +50/+100). (3) 2900 comfortable; 600 acceptable (boundary inclusive); 300 tight; opposite-depth 2300.
- **Result:** pass — covered by automated suite.

### TC-4 — Golden split is applied to the LONGER wall (caller contract) — PRIORITY (no automated coverage)

- **Requirement(s):** FR-GOLD-03
- **Preconditions:** As TC-1. The engine `computeGoldenSplit(length, m)` takes a single length; it does **not** itself pick the longer wall — the consumer must pass `max(length, width)`.
- **Steps:**
  1. For the living room (4200 × 3500), compute `longer = Math.max(4200, 3500)` → 4200.
  2. Call `computeGoldenSplit(longer, 700)`.
  3. Confirm the split is computed on 4200 (the longer wall), not 3500.
  4. Repeat for kitchen 3800×2500 (longer 3800) and bathroom 2150×1500 (longer 2150).
- **Expected result:** In each room the split operates on the longer of the two walls, matching TC-3 values. When the consuming UI capability lands, this selection must be re-verified there (the engine cannot pin it in isolation).
- **Result:** manual-only — no engine-level automated test exists (honest gap); to be pinned by the UI capability that selects the wall.

### TC-5 — Recompute latency < 16 ms for ≤ 20 rooms — PRIORITY (no automated coverage)

- **Requirement(s):** NFR-PERF-01, NFR-PERF-02
- **Preconditions:** As TC-1. Benchmark harness (throwaway, not committed to product code — QA observation only).
- **Steps:**
  1. Build a fixed workload of 20 rooms, e.g. an array of `{ length, width }` pairs across the valid dimension range, module `m = 700`.
  2. Warm up: run the full per-room pipeline (`suggestModule` once + `computeVerticalBands` + `computeGoldenSplit` + `computeRoomGrid` + `computeWalkways` per room) ~1000 times.
  3. Measure with `performance.now()` (or `process.hrtime.bigint()`): time a single full recompute pass over all 20 rooms; repeat 1000 iterations and take the p95.
  4. Assert every export is synchronous (no returned Promise, no `await`) — inspect that call results are plain objects, not thenables.
- **Expected result:** p95 single-recompute time is well under 16 ms (expected: microseconds to sub-millisecond — the work is O(rooms) constant-cost arithmetic). All calls return synchronously with no async boundary (NFR-PERF-01).
- **Result:** manual-only — met by construction; not measured in this QA session. Recommend adding a lightweight `node:test` benchmark that fails if p95 ≥ 16 ms to convert this to automated coverage.

### TC-6 — Purity and test coverage

- **Requirement(s):** NFR-PURE-01, NFR-TEST-01
- **Preconditions:** Repo root.
- **Steps:**
  1. Run `node --test lib/calculations.test.ts` and read the summary line.
  2. Grep `lib/calculations.ts` for `from 'next`, `from 'react`, `document`, `window`.
- **Expected result:** (1) `# pass 25 / # fail 0`; every exported function has normal + boundary + edge coverage. (2) No matches — the module imports no framework code and touches no DOM globals.
- **Result:** pass — covered by the `"calculations.ts imports no framework code"` test and the full green suite.
- **Note (open reviewer findings, not blockers):**
  - SEC-001 (low, open): division by `m` is unguarded for `m<=0` (non-reachable — `m` always comes from `nearestStandardModule >= 100` over validated inputs). Defensive-robustness only.
  - CR-003 (low, open): `package.json` lacks `"type": "module"`, so the runner prints a `MODULE_TYPELESS_PACKAGE_JSON` warning; suite still passes. Cosmetic; deferred to avoid destabilizing the Next 16 build.
