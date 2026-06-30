# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-06-30T12:30:00+03:00
- **Last action:** Aligned typography naming to the canonical **Inter + JetBrains Mono**
  across docs and skills — fixed `docs/CAPABILITIES.md`, `docs/PDR.md` (`TC-STACK-03`), and
  the `nextjs-frontend` skill (each had a stale "Geist"); added `docs/CAPABILITIES.md` to the
  AGENTS.md docs index; renamed stale `capability-plan.md` references to `CAPABILITIES.md`.
  (Prior: split `docs/PDR.md` into 16 OpenSpec capability changes with a fixed implementation
  order — see [docs/CAPABILITIES.md](CAPABILITIES.md): capability→change map, ordered build
  sequence, dependency graph, per-change cards, constraint coverage.)
- **Status:**
  - Done — design spec
    [2026-06-29-2d-3d-mode-and-logo-design.md](superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md);
    PDR (FR-MODE-*, FR-MODULE2D-*, FR-VIZ2D-*, FR-VIZ3D-*, FR-LOGO-*, NFR-BUNDLE-01,
    NFR-PERF-03, NFR-A11Y-03, TC-STACK-04), PRODUCT-BRIEF, DESIGN, and AGENTS updated.
  - In progress — none; awaiting user review of the spec before planning.
  - Blocked — none.
- **Next steps:** Start change **1 `calculation-engine`** from
  [docs/CAPABILITIES.md](CAPABILITIES.md) — scaffold it with `openspec new change
  calculation-engine` (or `/opsx:propose`), then proceed in the documented order. Epic A
  (changes 1–11) ships the core calculator before Epic B (mode toggle + visualizers + logo).
- **Notes:** Decisions — additive (not a pivot); 3D via `@react-three/fiber`
  lazy-loaded; 2D module = GCD across all room dims snapped; one shared module across
  rooms; default mode 3D; mode/camera not persisted (BC-PRIVACY-01). The "not a CAD
  tool" non-goal and BC-VALUE-01 were reworded to permit read-only visualization.

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
