# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-03T02:20:00+03:00
- **Last action:** **Shipped capability 4 `app-shell`** end-to-end via the `ship-capability`
  advisory loop. The app now renders a real shell: [app/page.tsx](../app/page.tsx) is a
  Server Component rendering the single [components/Calculator.tsx](../components/Calculator.tsx)
  client boundary (owns `AppState`, mounts `LanguageProvider`, derives `showResults` via
  `useMemo`); [components/Shell.tsx](../components/Shell.tsx) is the sticky header + responsive
  two-column layout with the top-right language toggle, a theme toggle, and the
  validity-gated results region; [components/ThemeToggle.tsx](../components/ThemeToggle.tsx)
  flips `html[data-theme]`; pure [lib/app-state.ts](../lib/app-state.ts) holds the
  `showResults` gate. Archived to
  [openspec/changes/archive/2026-07-03-app-shell/](../openspec/changes/archive/2026-07-03-app-shell/);
  5 requirements synced to `openspec/specs/app-shell/spec.md`.
  (Prior: shipped 1 `calculation-engine`, 2 `design-system`, 3 `i18n`.)
- **Status:**
  - Done — **`app-shell`** (FR-SHELL-01/02/03/04, TC-CLIENT-01, TC-ARCH-01, NFR-RESP-01,
    NFR-A11Y-01, NFR-PERF-01): server page + single `Calculator` client boundary/state owner,
    `LanguageProvider` mounted, responsive header + `minmax(320,400) 1fr` grid, validity-gated
    `aria-live` results region, `ThemeToggle`. Suite **44/44** (25 engine + 9 i18n + 10
    app-state), build ✓, tsc ✓, lint ✓. Review **clean** (0 crit/high/med, 3 low all
    resolved). QA 9/9 implemented & spec-compliant, 2/9 automated (gate + purity; the rest
    structural). Input column + results region are **empty slots** for changes 5–11. Added
    i18n keys `results`/`themeLight`/`themeDark` and a `--header-h` token.
  - Done — **`i18n`** (archived 2026-07-03): context + `t()`, flat EN/UA dictionaries, live
    `LanguageToggle`, never-translate calc labels. `LanguageProvider` is now mounted by
    `app-shell`.
  - Done — **`design-system`** (archived 2026-07-03): OKLCH token foundation, Inter/JetBrains
    Mono, dark mode. **NFR-A11Y-02 partial** (see next steps).
  - Done — **`calculation-engine`** (archived 2026-07-03): the pure engine. Runner is
    `node --test lib/*.test.ts` (native TS type-stripping; `tsx` dropped,
    [ADR-0001](adr/0001-test-runner.md) amended).
  - In progress — none.
  - Blocked — none. `OQ-01` still open with the SME (de-risked by ADR-0002).
- **Next steps:** Continue [docs/CAPABILITIES.md](CAPABILITIES.md) §3 order — **Phase 1
  inputs** fill the shell's slots: **5 `apartment-input`** (needs 4 ✓ + 1 ✓ — ceiling/opening/
  module fields + inline validation, feeding `AppState`) and **6 `room-input`** (needs 4 ✓ —
  room list add/remove + per-room name/length/width). Both wire the `setState` the shell
  intentionally left out. Then **7 `module-summary`** (the linchpin). **Open low findings for
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
