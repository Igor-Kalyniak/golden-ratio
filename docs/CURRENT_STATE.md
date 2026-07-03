# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-03T01:45:00+03:00
- **Last action:** **Shipped capability 3 `i18n`** end-to-end via the `ship-capability`
  advisory loop. Added the bilingual UA/EN layer: [locales/en.json](../locales/en.json) +
  [locales/ua.json](../locales/ua.json) (flat, verbatim from the export `STR`), pure
  [lib/i18n.ts](../lib/i18n.ts) (types, generic `createTranslator`, `CALC_LABELS`,
  `missingKeys`), the `'use client'` [lib/i18n-context.tsx](../lib/i18n-context.tsx)
  (`LanguageProvider` + `useI18n`), and [components/LanguageToggle.tsx](../components/LanguageToggle.tsx).
  Archived to [openspec/changes/archive/2026-07-03-i18n/](../openspec/changes/archive/2026-07-03-i18n/);
  4 requirements synced to `openspec/specs/i18n/spec.md`.
  (Prior: shipped 1 `calculation-engine` and 2 `design-system`.)
- **Status:**
  - Done — **`i18n`** (FR-I18N-01/02/03, TC-I18N-01): context + `t()`, flat EN/UA
    dictionaries (75 keys, identical set), live `LanguageToggle`, never-translate calc
    labels. Suite now **34/34** (25 engine + 9 i18n), build ✓, tsc ✓, lint ✓. Review
    **clean** (0 crit/high/med, 2 low both resolved). QA 4/4 implemented & spec-compliant,
    2/4 automated-tested (FR-I18N-01 live re-render + TC-I18N-01 "no heavy lib" are
    manual/structural — no React test runner). No page mounts the provider yet — placement
    is `app-shell`.
  - Done — **`design-system`** (archived 2026-07-03): OKLCH token foundation, Inter/JetBrains
    Mono, dark mode. **NFR-A11Y-02 partial** (see next steps).
  - Done — **`calculation-engine`** (archived 2026-07-03): the pure engine. Runner is
    `node --test lib/*.test.ts` (native TS type-stripping; `tsx` dropped,
    [ADR-0001](adr/0001-test-runner.md) amended).
  - In progress — none.
  - Blocked — none. `OQ-01` still open with the SME (de-risked by ADR-0002).
- **Next steps:** Continue [docs/CAPABILITIES.md](CAPABILITIES.md) §3 order — **4 `app-shell`**
  is next and now **unblocked** (needs 2 ✓ + 3 ✓): it establishes the single `'use client'`
  boundary (`Calculator.tsx`), **mounts `LanguageProvider`**, places the toggle top-right
  (`FR-SHELL-03`), and gates the results panel on validity. Then Phase 1 inputs (5
  `apartment-input` needs 4 + 1 ✓; 6 `room-input` needs 4). **Open low findings for triage**
  (in the archived `review-findings.json`s):
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
