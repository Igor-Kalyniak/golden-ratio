# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-03T01:10:00+03:00
- **Last action:** **Shipped capability 2 `design-system`** end-to-end via the
  `ship-capability` advisory loop. Rewrote [app/globals.css](../app/globals.css) to the
  DESIGN §3 OKLCH token system (light `:root` / dark `[data-theme="dark"]`, `@theme inline`
  Tailwind wiring, `@custom-variant dark`, motion keyframes + reduced-motion, focus) and
  [app/layout.tsx](../app/layout.tsx) to self-host **Inter + JetBrains Mono** via
  `next/font` (dropping Geist). Archived to
  [openspec/changes/archive/2026-07-03-design-system/](../openspec/changes/archive/2026-07-03-design-system/);
  5 requirements synced to `openspec/specs/design-system/spec.md`.
  (Prior: shipped capability 1 `calculation-engine` — pure math engine + 25-case suite.)
- **Status:**
  - Done — **`design-system`** (TC-STACK-02/03, NFR-A11Y-02): token foundation, fonts, dark
    mode, motion, focus. `npm run build` ✓, `eslint app/` ✓, engine suite still 25/25 ✓.
    Review **clean** (0 crit/high/med, 1 low). QA 3/3 implemented, 2/3 spec-compliant —
    **NFR-A11Y-02 partial** (see next steps). Default theme light; dark mode ready but no
    toggle UI yet.
  - Done — **`calculation-engine`** (archived 2026-07-03): the pure engine. Runner is
    `node --test lib/*.test.ts` (native TS type-stripping; `tsx` dropped,
    [ADR-0001](adr/0001-test-runner.md) amended).
  - In progress — none.
  - Blocked — none. `OQ-01` still open with the SME (de-risked by ADR-0002).
- **Next steps:** Continue [docs/CAPABILITIES.md](CAPABILITIES.md) §3 order — **3 `i18n`**
  is dependency-free and next; then **4 `app-shell`** (needs 2 ✓ + 3). Then Phase 1 inputs
  (5 `apartment-input` needs 4 + 1 ✓; 6 `room-input` needs 4). **Open low findings for
  triage** (in the archived `review-findings.json`s):
  - `design-system` **CR-001 → NFR-A11Y-02 partial**: `--faint` (~2.7:1) and
    `--accent`-on-`--bg` (~3.7:1) are **sub-AA** — a verbatim port of the frozen DESIGN §3
    tokens. Body/label/muted text passes AA in both themes. **Constraint:** downstream
    components must not use `--faint`/accent for meaningful small text without a non-color
    cue or larger size; a real fix is a **design-source decision** (recolor the token in
    DESIGN §3 + `globals.css`), not something to mutate silently. See
    [docs/qa/test-plans/design-system.md](qa/test-plans/design-system.md).
  - `calculation-engine`: **CR-003** (`"type":"module"` to silence the `node --test`
    warning), **SEC-001** (optional `m > 0` guard), and an unwritten **NFR-PERF-02** <16 ms
    benchmark test ([docs/qa/test-plans/calculation-engine.md](qa/test-plans/calculation-engine.md)).
- **Notes:** design-system reconciled DESIGN's `html[data-theme]` switch with TC-STACK-03's
  "Tailwind `dark:` variants" via `@custom-variant dark ([data-theme="dark"] &)` — one
  selector drives both the token swap and `dark:` utilities. Fonts self-host through
  `next/font` (no runtime Google Fonts request — BC-PRIVACY-01 clean).
  PDR reconciled to match the shipped (correct) engine and DESIGN/SKILL:
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
