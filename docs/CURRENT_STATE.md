# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-02T00:00:00+03:00
- **Last action:** Design-explore resolved the two decisions that change 1 was quietly
  forcing, and recorded them in the repo as ADRs (new `docs/adr/` — the source-of-truth #7
  slot that had no directory yet). **[ADR-0001](adr/0001-test-runner.md)** — test runner is
  Node `node:test` + `tsx` (no heavier framework; the engine is pure so nothing to mock).
  **[ADR-0002](adr/0002-standard-modules-swappable-constant.md)** — `STANDARD_MODULES` is a
  single swappable constant and `residual` is always surfaced, so `OQ-01` (authoritative
  values) is de-risked without being answered. Threaded both into `docs/CAPABILITIES.md`
  (change-1 card + scope note + §7), `docs/PDR.md` (OQ-01, dependency/risk rows, rev 1.3).
  (Prior: aligned typography naming to Inter + JetBrains Mono across docs and skills.)
- **Status:**
  - Done — design spec
    [2026-06-29-2d-3d-mode-and-logo-design.md](superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md);
    PDR (FR-MODE-*, FR-MODULE2D-*, FR-VIZ2D-*, FR-VIZ3D-*, FR-LOGO-*, NFR-BUNDLE-01,
    NFR-PERF-03, NFR-A11Y-03, TC-STACK-04), PRODUCT-BRIEF, DESIGN, and AGENTS updated.
    Pre-change-1 decisions recorded — ADR-0001 (test runner), ADR-0002 (`STANDARD_MODULES`).
  - In progress — none; change 1 not yet proposed.
  - Blocked — none. `OQ-01` remains open with the Architecture SME but no longer blocks
    change 1 (de-risked by ADR-0002).
- **Next steps:** Propose change **1 `calculation-engine`** from
  [docs/CAPABILITIES.md](CAPABILITIES.md) — `openspec new change calculation-engine` (or
  `/opsx:propose`), implementing per **ADR-0001** (wire the `node:test` + `tsx` `test`
  script) and **ADR-0002** (one swappable `STANDARD_MODULES` + `residual` surfaced). Then
  proceed in the documented order. Epic A (changes 1–11) ships the core calculator before
  Epic B (mode toggle + visualizers + logo).
- **Notes:** Decisions — additive (not a pivot); 3D via `@react-three/fiber`
  lazy-loaded; 2D module = GCD across all room dims snapped; one shared module across
  rooms; default mode 3D; mode/camera not persisted (BC-PRIVACY-01). The "not a CAD
  tool" non-goal and BC-VALUE-01 were reworded to permit read-only visualization.
  New: test runner = `node:test` + `tsx` (ADR-0001); `STANDARD_MODULES` provisional
  `[100,150,200,300,350,600,700]`, swappable, `residual` always shown (ADR-0002). Open
  tangent for later: a soft "suggestion is N mm off" hint when `residual` > ¼M
  (possible FR-MODULE-05 refinement, decide with SME alongside OQ-01).

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
