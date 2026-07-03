# Requirement Traceability Matrix

Maps every PDR requirement ID to the OpenSpec change that owns it, the tasks and tests that
implement and verify it, its manual test steps, and its current QA status. Maintained by the
`qa-traceability` skill (via the `qa-trajectory-evaluator` agent) at the QA stage of the
`ship-capability` loop — see [docs/pipeline/README.md](../pipeline/README.md).

- **Key:** the PDR requirement ID (`FR-*`/`NFR-*`/`TC-*`/`BC-*`) from [docs/PDR.md](../PDR.md).
- **Owner map:** [docs/CAPABILITIES.md](../CAPABILITIES.md) (one capability = one OpenSpec change).
- **Status legend:** `covered` = implemented + automated test · `manual-only` = implemented + manual
  step, no automated test · `partial` = incompletely met · `gap` = owned but not yet met ·
  `deferred` = intentionally out of the current change.

> This table is seeded empty. Each change adds/updates only its own requirement rows as it passes
> through the loop; rows for other changes stay intact.

| Requirement ID | Capability | PDR § | Tasks | Automated tests | Manual plan | Status |
|----------------|------------|-------|-------|-----------------|-------------|--------|
| FR-MODULE-01 | calculation-engine | PDR §Module engine (L87) | calculation-engine#tasks | `lib/calculations.test.ts::"suggestModule: worked example 2800/2100 → M=700"`, `::"suggestModule: coprime heights snap to a standard module, residual surfaced"` | [calculation-engine.md#tc-1](test-plans/calculation-engine.md#tc-1) | covered |
| FR-VERT-01 | calculation-engine | PDR §Vertical bands (L97) | calculation-engine#tasks | `lib/calculations.test.ts::"computeVerticalBands: ceiling not divisible leaves top remainder"`, `::"computeVerticalBands: opening alignment"` | [calculation-engine.md#tc-2](test-plans/calculation-engine.md#tc-2) | covered |
| FR-VERT-02 | calculation-engine | PDR §Vertical bands (L98) | calculation-engine#tasks | `lib/calculations.test.ts::"computeVerticalBands: large band count derived, not capped"`, `::"computeVerticalBands: minimal 2-band case"` | [calculation-engine.md#tc-2](test-plans/calculation-engine.md#tc-2) | covered |
| FR-VERT-03 | calculation-engine | PDR §Vertical bands (L99) | calculation-engine#tasks | `lib/calculations.test.ts::"computeVerticalBands: ceiling not divisible leaves top remainder"` | [calculation-engine.md#tc-2](test-plans/calculation-engine.md#tc-2) | covered |
| FR-VERT-04 | calculation-engine | PDR §Vertical bands (L100) | calculation-engine#tasks | `lib/calculations.test.ts::"computeVerticalBands: opening alignment"`, `::"computeVerticalBands: no opening → not aligned, null band"` | [calculation-engine.md#tc-2](test-plans/calculation-engine.md#tc-2) | covered |
| FR-GOLD-01 | calculation-engine | PDR §Golden split (L108) | calculation-engine#tasks | `lib/calculations.test.ts::"computeGoldenSplit: living-room longer wall 4200"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-GOLD-02 | calculation-engine | PDR §Golden split (L109) | calculation-engine#tasks | `lib/calculations.test.ts::"computeGoldenSplit: living-room longer wall 4200"`, `::"computeGoldenSplit: kitchen longer wall 3800"`, `::"computeGoldenSplit: bathroom longer wall 2150"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-GOLD-03 | calculation-engine | PDR §Golden split (L110) | calculation-engine#tasks | — (engine takes a length; longer-wall selection is a caller responsibility) | [calculation-engine.md#tc-4](test-plans/calculation-engine.md#tc-4) | manual-only |
| FR-GRID-01 | calculation-engine | PDR §Room grid fit (L117) | calculation-engine#tasks | `lib/calculations.test.ts::"computeRoomGrid: exact fit (living room)"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-GRID-02 | calculation-engine | PDR §Room grid fit (L118) | calculation-engine#tasks | `lib/calculations.test.ts::"computeRoomGrid: poor fit (kitchen), signed remainders"`, `::"computeRoomGrid: 1mm short reads close, not poor"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-GRID-03 | calculation-engine | PDR §Room grid fit (L119) | calculation-engine#tasks | `lib/calculations.test.ts::"computeRoomGrid: poor fit (kitchen), signed remainders"`, `::"computeRoomGrid: 1mm short reads close, not poor"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-GRID-04 | calculation-engine | PDR §Room grid fit (L120) | calculation-engine#tasks | `lib/calculations.test.ts::"computeRoomGrid: close fit (bathroom)"`, `::"computeRoomGrid: exactly ¼M remainder still reads close (boundary)"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-WALK-01 | calculation-engine | PDR §Walkway clearance (L127) | calculation-engine#tasks | `lib/calculations.test.ts::"computeWalkways: worked-example ratings"`, `::"computeWalkways: recommendation is a locale-independent key, not English prose"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-WALK-02 | calculation-engine | PDR §Walkway clearance (L128) | calculation-engine#tasks | `lib/calculations.test.ts::"computeWalkways: worked-example ratings"`, `::"computeWalkways: opposite depth subtracted"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| FR-WALK-03 | calculation-engine | PDR §Walkway clearance (L129) | calculation-engine#tasks | `lib/calculations.test.ts::"computeWalkways: thresholds are fixed mm, independent of module"` | [calculation-engine.md#tc-3](test-plans/calculation-engine.md#tc-3) | covered |
| NFR-PURE-01 | calculation-engine | PDR §NFR (L213) | calculation-engine#tasks | `lib/calculations.test.ts::"calculations.ts imports no framework code"` | [calculation-engine.md#tc-6](test-plans/calculation-engine.md#tc-6) | covered |
| NFR-TEST-01 | calculation-engine | PDR §NFR (L214) | calculation-engine#tasks | `lib/calculations.test.ts` (25 cases, all green) | [calculation-engine.md#tc-6](test-plans/calculation-engine.md#tc-6) | covered |
| NFR-PERF-01 | calculation-engine | PDR §NFR (L211) | calculation-engine#tasks | — (synchronous purity is structural; same-frame update is a UI-integration property) | [calculation-engine.md#tc-5](test-plans/calculation-engine.md#tc-5) | manual-only |
| NFR-PERF-02 | calculation-engine | PDR §NFR (L212) | calculation-engine#tasks | — (no asserting <16 ms benchmark; met by construction, O(rooms) arithmetic) | [calculation-engine.md#tc-5](test-plans/calculation-engine.md#tc-5) | manual-only |
