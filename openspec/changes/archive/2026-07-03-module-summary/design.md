## Context

The active-module *state* already exists: `apartment-input` (5) added `AppState.module` +
`moduleTouched` and the `withCeiling`/`withOpening`/`withModule` reducers, so `state.module` is the
user's selection defaulting to `suggestModule(...).suggested`. `ApartmentForm` renders the module
`<select>` in the input column. `calculation-engine` (1) shipped `suggestModule`, `MODULE_WARNING`
(`{ large: 1000, small: 100 }`), and `CALC_LABELS` (`['¼M','½M','M','1.5M','2M','3M','4M']`). This
change adds the read-only presentation (the Module Summary card) plus two small pure helpers, and
opens the results column. It follows the established layering: pure helpers in `lib/calculations.ts`
(unit-tested), presentational `'use client'` component rendered by `Shell`.

## Goals / Non-Goals

**Goals**
- Prove and surface `FR-MODULE-02`/`BC-MODULE-01`: the summary is a read-only *display* of
  `state.module`, never a second derivation.
- Add pure `computeModuleRuler(m)` and `moduleWarning(m)` helpers, unit-tested.
- Render the two-pane card, traceability hint, ruler table, and warning banner per DESIGN §6.1
  (`FR-MODULE-03/04/05`).

**Non-Goals**
- The module selector and auto-follow rule — already shipped in `apartment-input`; not touched.
- The 2D room-derived module (`suggestModule2D`, `suggestedFromRooms` label) — change 12/13.
- Any result section that consumes the module (bands/golden/grid/walkway) — changes 8–11.

## Decisions

### Two pure helpers on the engine, prose stays in the UI
`computeModuleRuler(m)` returns `{ label: CalcLabel, k: number, size: number }[]` for the seven
`k` factors, `size = Math.round(m * k)`, `label` from `CALC_LABELS` (index-aligned to the factor
list). `moduleWarning(m)` returns `'large' | 'small' | null` from `MODULE_WARNING`. Both are
framework-free so they stay in the unit-tested engine (`NFR-PURE-01`). The ruler's "typical use"
prose is **not** in the engine — the component maps each never-translated `label` to a localized
`use*` i18n key, keeping the engine language-agnostic (consistent with how `computeWalkways`
returns a locale-independent key).

### The summary is read-only; the selector stays in the input column
Per `BC-MODULE-01` and DESIGN §5.2/§6.1, the module is *selected* in the apartment card and
*displayed* in the results card. `ModuleSummary` takes `module`, `ceiling`, `opening` as props and
calls `suggestModule(ceiling, opening)` only to render the **hint** (`rawGcd → suggested`,
residual, alternatives) — it never calls a setter. The hero value is `props.module` verbatim
(`FR-MODULE-02`: display the active value, don't recompute it). This keeps `Calculator` the single
state owner (`TC-ARCH-01`).

### Ruler factor/label alignment
The factor list `[0.25, 0.5, 1, 1.5, 2, 3, 4]` is defined once in the engine alongside
`CALC_LABELS` (same order), so `computeModuleRuler` zips them without a second source of truth. A
unit test pins the M=700 sizes `[175, 350, 700, 1050, 1400, 2100, 2800]` and a fractional case
(150 → ¼M rounds to 38) so the rounding is locked.

### i18n keys for ruler prose
Add seven `use*` keys to both dictionaries, ported verbatim from the frozen prototype export
(`prototype.dc.html` line 666–667), EN + UA:
`¼M` → "trim, reveals, small offsets"; `½M` → "sills, steps, counter depth"; `M` → "base planning
unit, door width"; `1.5M` → "corridor width"; `2M` → "window band, furniture runs"; `3M` → "door /
opening height"; `4M` → "ceiling height". Key-parity is preserved (shipped i18n test enforces it).

## Risks / Trade-offs

### The warning banner cannot trigger with the current `STANDARD_MODULES` — kept intentionally
`MODULE_WARNING` bounds are `> 1000` (large) and `< 100` (small), but the module `<select>` is
constrained to `STANDARD_MODULES = [100, 150, 200, 300, 350, 600, 700]`. So with today's constant,
`moduleWarning(state.module)` is **always `null`** — no banner ever shows from a valid selection.
This is deliberate, not dead code:
- `FR-MODULE-05` is a `Should` requirement and an explicit spec contract; implementing it now keeps
  the summary complete and correct *by construction*.
- `STANDARD_MODULES` is a swappable constant ([ADR-0002](../../../../docs/adr/0002-standard-modules-swappable-constant.md));
  `OQ-01` may revise it to include values outside `100–1000`, at which point the banner becomes
  live with zero further work.
- `moduleWarning` is still fully unit-tested at its boundaries (999/1000/1001, 99/100/101) so the
  logic is proven independent of the current module set.

This tension is recorded here (and will be surfaced to the reviewers) rather than hidden: the
banner is wired and tested but currently unreachable through the UI. The QA test plan notes it as a
manual case that requires a temporary constant edit to observe.

### No React/DOM test runner (ADR-0001)
The two helpers are fully unit-tested; the card rendering, hint text, ruler table, and banner
presence are verified by build+tsc+lint+manual, captured in the manual test plan — same posture as
prior UI capabilities.

## Migration Plan

Additive. `Shell` swaps the `perRoom` placeholder text in the results region for `<ModuleSummary>`;
the `showResults` gate, empty-state card, and `aria-live` are unchanged. No archived change is
modified; no data migration (`BC-PRIVACY-01`).

## Open Questions

- `OQ-01` (authoritative `STANDARD_MODULES`) — if revised to include out-of-range values, the
  warning banner becomes reachable; no code change needed. Does not block this change.
