# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Handoff

- **Last updated:** 2026-07-03T14:45:00+03:00
- **Last action:** **Shipped capability 8 `vertical-bands`** end-to-end via the `ship-capability`
  advisory loop. The **results region now shows the height-band diagram** below the Module Summary:
  [components/BandDiagram.tsx](../components/BandDiagram.tsx) is a width-responsive `viewBox` SVG —
  `floor(ceiling/m)` full bands bottom-to-top with alternating fills, a dashed partial band for the
  `topRemainder`, mm marks up the left (condensed at high counts), localized band names on the
  right, and the opening as a dashed accent rule tagged on/off-grid.
  [lib/calculations.ts](../lib/calculations.ts) gained the pure `layoutBandDiagram(ceiling,m,opening?)`
  helper (render-ready layout in mm space + band-name keys + mark-condense flag) so
  `FR-VERT-02/03/04/06` are unit-tested; [components/Shell.tsx](../components/Shell.tsx) renders it
  after `ModuleSummary`. **Review caught a real HIGH defect** — the first cut used the PDR
  `FR-VERT-05` literal `viewBox 0 0 200 400`, which clipped the right-side labels (failing
  `FR-VERT-06`); resolved in-loop by adopting DESIGN §6.2's `0 0 360 470`, the only geometry
  satisfying both requirements. Archived to
  [openspec/changes/archive/2026-07-03-vertical-bands/](../openspec/changes/archive/2026-07-03-vertical-bands/);
  requirements synced to `openspec/specs/vertical-bands/spec.md`.
  (Prior: shipped 1 `calculation-engine`, 2 `design-system`, 3 `i18n`, 4 `app-shell`,
  5 `apartment-input`, 6 `room-input`, 7 `module-summary`.)
- **Status:**
  - Done — **`vertical-bands`** (FR-VERT-01/02/03/04/05/06, NFR-RESP-01): height-band SVG + pure
    `layoutBandDiagram`. Suite **69/69** (+8 layout tests), build ✓, tsc ✓, lint ✓. Review found
    **1 high, resolved in-loop** — CR-001: the `200×400` viewBox clipped right-side band-name/
    opening labels; fixed by adopting DESIGN §6.2's **`360×470`** (satisfies both `FR-VERT-05`
    responsive contract and `FR-VERT-06` legibility). security + spec-compliance clean. QA 7/7
    implemented & spec-compliant, 5/7 automated (layout logic; viewBox/responsiveness manual per
    ADR-0001). **Two documented deltas:** (a) shipped `viewBox` is `360×470`, not the PDR
    `FR-VERT-05` literal `200×400` — flagged for a docs-pass reconciliation; (b) the diagram renders
    unconditionally (DESIGN §6.2 marks it "3D-mode only") until `mode-toggle` (13) adds mode state.
  - Done — **`module-summary`** (FR-MODULE-02/03/04/05, BC-MODULE-01): read-only Module Summary
    card + pure `computeModuleRuler`/`moduleWarning`. Suite **61/61** (+5 engine tests), build ✓,
    tsc ✓, lint ✓. Review **all-clean** (0 crit/high/med, 1 low resolved). QA 5/5 implemented &
    spec-compliant, 2/5 automated (ruler + warning **logic**; hero/hint/chips render manual per
    ADR-0001). **Note:** the `FR-MODULE-05` warning banner is **dormant-by-data** — the current
    `STANDARD_MODULES` (100…700) can't reach the `>1000`/`<100` bounds, so it never fires through
    the UI, but the logic is wired + unit-tested at its boundaries and goes live with zero code
    change if the constant is revised (ADR-0002 / OQ-01). A documenting comment on `moduleWarning`
    marks it dormant-by-data, not dead code (review CR-001/SC-001 resolution).
  - Done — **`room-input`** (FR-ROOM-01/02/03/04): dynamic room list (start with one room,
    add/remove-except-last, per-room name 1–50 + length/width 500–15000 mm) wired to `Calculator`
    state via pure CRUD reducers. Suite **56/56** (+6 room-reducer tests), build ✓, tsc ✓, lint ✓.
    Review **clean** (0 crit/high/med, 3 low): **resolved** the room-name label to be visible (was
    `sr-only`, flagged by both code + spec reviewers as CR-002/SC-001); **deferred by design** the
    `NumberField`/`InlineError` dedup between `RoomList` and `ApartmentForm` (CR-001 — YAGNI until a
    3rd field consumer; extracting now would churn the archived apartment-input); **acknowledged
    cosmetic** the duplicate default names after a removal (CR-003 — DESIGN §5.3 count-based
    `Room N`, name is user-editable + validated). QA 4/4 implemented & spec-compliant, 3/4 automated
    (CRUD + bounds via reducers/`isRoomValid`; FR-ROOM-04 form DOM manual per ADR-0001).
  - Done — **`apartment-input`** (FR-APT-01/02/03/04/05, archived 2026-07-03): ceiling/opening/module
    fields + inline validation, wired to `Calculator` via pure reducers. Review **clean** (0
    crit/high/med, 2 low resolved: CR-001 empty-field→NaN coercion, CR-002 hint `aria-describedby`).
    QA 5/5 implemented & spec-compliant, 3/5 automated.
  - Done — **`app-shell`** (archived 2026-07-03): server page + single `Calculator` client
    boundary/state owner, `LanguageProvider` mounted, responsive header + grid, validity-gated
    results region, `ThemeToggle`. NFR-RESP-01 / NFR-A11Y-01 partial (band SVG arrives with later
    capabilities). **Both input slots filled + the results region now shows the Module Summary;**
    bands/per-room/visualizer sections fill the rest (changes 8–15).
  - Done — **`i18n`** (archived 2026-07-03): context + `t()`, flat EN/UA dictionaries, live
    `LanguageToggle`, never-translate calc labels. `LanguageProvider` is mounted by `app-shell`.
  - Done — **`design-system`** (archived 2026-07-03): OKLCH token foundation, Inter/JetBrains
    Mono, dark mode. **NFR-A11Y-02 partial** (see next steps).
  - Done — **`calculation-engine`** (archived 2026-07-03): the pure engine. Runner is
    `node --test lib/*.test.ts` (native TS type-stripping; `tsx` dropped,
    [ADR-0001](adr/0001-test-runner.md) amended).
  - In progress — none.
  - Blocked — none. `OQ-01` still open with the SME (de-risked by ADR-0002).
- **Next steps:** Continue [docs/CAPABILITIES.md](CAPABILITIES.md) §3 order — three **per-room**
  result sections remain, each independent (needs 7 ✓ + 1 ✓ + the room list 6 ✓): **9 `golden-ratio`**
  (per-room longer-wall split, exact/½M-snapped + approximate-fit flag when offset > ¼M —
  `FR-GOLD-*`), **10 `grid-fit`** (modules×modules via `round(dim/m)`, signed remainders,
  `exact`/`close`/`poor` quality badge that never relies on color alone — `FR-GRID-*`,
  `NFR-A11Y-02`), **11 `walkway`** (fixed-mm clearance ratings decoupled from M — `FR-WALK-*`,
  `BC-WALK-01`, `Should`). The engine functions
  (`computeGoldenSplit`/`computeRoomGrid`/`computeWalkways`) already shipped in change 1, so these
  are thin presentation layers that map one card per valid room (DESIGN §6.3). `golden-ratio` (9)
  is the natural next pick. **Likely 3rd field consumer** — none of 9/10/11 add editable number
  fields (they read room state), so `room-input` CR-001 (shared-field extraction) stays deferred
  until the 2D/3D input reorganization (13). **Watch:** `grid-fit` (10) owns `NFR-A11Y-02`
  (partial) — its quality badge must carry a text/icon cue, not color alone, and must avoid
  `--faint`/accent for small meaningful text (see the design-system finding below).
  **Low findings deferred from earlier changes** (in the archived `review-findings.json`s), worth
  folding into a later change rather than a standalone fix:
  - `room-input` **CR-001**: `NumberField`/`InlineError` are duplicated in `RoomList` and
    `ApartmentForm`. Extract a shared field component **when a 3rd consumer appears** — deferred by
    design (YAGNI; avoids churning the archived `apartment-input`). *(module-summary added no new
    number field, so still 2 consumers.)*
  - `module-summary` **CR-001/SC-001** (resolved): the `FR-MODULE-05` warning banner is
    dormant-by-data under the current `STANDARD_MODULES`; a code comment marks it as such. Becomes
    live if `OQ-01` revises the constant to include an out-of-range value — no code change needed.
  - `room-input` **CR-003**: `addRoom` names via `rooms.length + 1`, so default names can repeat
    after a removal (cosmetic; ids stay unique, name is user-editable + validated). Revisit with
    `OQ-04` (default room dims/names) if the SME wants distinct auto-names.
  - **Open low findings for triage** (in the archived `review-findings.json`s):
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
