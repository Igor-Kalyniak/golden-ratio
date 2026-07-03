# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-03T00:30:00+03:00
- **Last action:** **Shipped capability 1 `calculation-engine`** end-to-end via the
  `ship-capability` advisory loop (propose → validate → apply → parallel review → QA →
  archive → docs). Delivered [lib/calculations.ts](../lib/calculations.ts) — framework-free
  pure math — and [lib/calculations.test.ts](../lib/calculations.test.ts) (25 `node:test`
  cases, all green). Archived to
  [openspec/changes/archive/2026-07-03-calculation-engine/](../openspec/changes/archive/2026-07-03-calculation-engine/);
  8 requirements synced to `openspec/specs/calculation-engine/spec.md`.
- **Status:**
  - Done — `calculation-engine`: `STANDARD_MODULES` (one swappable const), `gcd` /
    `nearestStandardModule` / `snap`, `suggestModule`, `computeVerticalBands`,
    `computeGoldenSplit`, `computeRoomGrid`, `computeWalkways`, validation bounds +
    warning thresholds. Runner wired: `node:test` via **native TS type-stripping**
    (`node --test lib/*.test.ts`) — `tsx` loader dropped as redundant on Node 22.22
    ([ADR-0001](adr/0001-test-runner.md) **amended 2026-07-03**). Review: 0 critical /
    0 high (2 medium, 6 low — 6 resolved inline, 2 low deferred). QA: 19/19 implemented &
    spec-compliant, 16/19 automated-tested.
  - In progress — none.
  - Blocked — none. `OQ-01` still open with the SME (de-risked by ADR-0002).
- **Next steps:** Ship the next capabilities in [docs/CAPABILITIES.md](CAPABILITIES.md) §3
  order — **2 `design-system`** and **3 `i18n`** are both dependency-free and parallel with
  what's done; **4 `app-shell`** needs 2 + 3. Then Phase 1 inputs (5 `apartment-input`
  needs 4 + 1; 6 `room-input` needs 4). Two low reviewer findings remain open for triage
  (in the archived `review-findings.json`): **CR-003** — add `"type":"module"` to silence
  the `node --test` MODULE_TYPELESS warning (verify against Next 16 build first);
  **SEC-001** — optional `m > 0` guard in the divide-by-`m` helpers (non-reachable today).
  QA test plan flags an unwritten **NFR-PERF-02** <16 ms benchmark test (see
  [docs/qa/test-plans/calculation-engine.md](qa/test-plans/calculation-engine.md)).
- **Notes:** PDR reconciled to match the shipped (correct) engine and DESIGN/SKILL:
  **FR-VERT-02** `round → floor(ceiling/m)` (round yields a negative `topRemainder`);
  **FR-GRID-03** to the signed nearest-distance formula `d − round(d/m)·m`; fixed a
  kitchen-row sign typo in the `calculation-logic` skill. `recommendation` from
  `computeWalkways` is now a **locale-independent key** (`walkway.<rating>`), not English
  prose, so the pure engine stays language-agnostic for the bilingual UI (resolves review
  CR-001). `moduleRuler` (FR-MODULE-04) was removed as scope leak — it belongs to change 7
  `module-summary`. Open tangent still parked: soft "suggestion is N mm off" hint when
  `residual` > ¼M (possible FR-MODULE-05 refinement, decide with SME alongside OQ-01).

## Source Of Truth

1. `AGENTS.md` — project agent rules.
2. `docs/CURRENT_STATE.md` — this handoff.
3. `docs/PDR.md` — canonical FR/NFR/TC/BC requirements.
4. `docs/PRODUCT-BRIEF.md` — product narrative.
4a. `docs/superpowers/specs/` — design specs (apartment calculator; 2D/3D mode + logo).
5. `docs/CAPABILITIES.md` — OpenSpec change sequence and order.
6. `openspec/project.md` + `openspec/specs/` — accepted behavior.
7. `docs/adr/` — architecture decisions.
8. `docs/qa/` — QA proof pack and recordings.
