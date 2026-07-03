## Context

Epic A's calculator is 3D-only in practice: `AppState` holds `ceiling`/`opening`/`module`/
`moduleTouched`/`rooms`, and the untouched module tracks `suggestModule(ceiling, opening).suggested`
via the `withCeiling`/`withOpening` reducers (change 5). `module-2d` (12) added the pure
`suggestModule2D(rooms)` but nothing consumes it. This change adds the mode dimension: a `mode`
state, a segmented toggle, mode-dependent module suggestion, and hiding the 3D-only inputs/results
in 2D — while keeping `Calculator` the single state owner and the reducers pure and unit-tested.

## Goals / Non-Goals

**Goals**
- `mode: '2d' | '3d'` state (default 3D), in-memory only (`FR-MODE-05`/`BC-PRIVACY-01`).
- One mode-driven module suggestion source; the untouched module follows it, a touched module is
  sticky across switches (`FR-MODE-02/03/04`).
- Hide height fields + vertical bands in 2D; segmented, keyboard-operable toggle (`FR-MODE-01/02`,
  `NFR-A11Y-03`).

**Non-Goals**
- The visualizers (`viz-2d` 14, `viz-3d` 15) — "active visualizer changes" lands with them.
- Editable/optional opening rework — opening stays as apartment-input shipped it.
- Persisting mode or any user choice — explicitly forbidden (`BC-PRIVACY-01`).

## Decisions

### One derived suggestion + a `resyncModule` funnel
Add `moduleSuggestion(state): ModuleSuggestion` returning the mode-appropriate object:
`state.mode === '2d' ? suggestModule2D(state.rooms.filter(isRoomValid)) : suggestModule(ceiling, opening)`.
A private `resyncModule(state)` re-points the module at `moduleSuggestion(state).suggested` **only
when `!moduleTouched`**. Every mutating reducer that can change a suggestion input funnels through
it:
- `withMode(state, mode)` → `resyncModule({ ...state, mode })`
- `withCeiling`/`withOpening` → `resyncModule({ ...state, ceiling|opening })`
- `addRoom`/`removeRoom`/`updateRoom` → `resyncModule(<new state>)`

This is **behaviour-preserving in 3D** (the shipped default): `moduleSuggestion` in 3D reads
`ceiling/opening`, so resyncing after a room edit recomputes the *same* height-derived value — a
no-op — and the existing `withCeiling`/`withOpening` tests still pass. In 2D it means a room-dimension
edit re-derives the untouched module, which is exactly `FR-MODE-02`. Centralizing the rule in one
helper (instead of duplicating the height-only logic that change 5 had) keeps 2D and 3D from
drifting — the same DRY move `module-2d` made with `suggestionFromGcd`.

### `moduleSuggestion` and `ModuleSummary` share the mode-appropriate object
`Calculator` computes `moduleSuggestion(state)` once (memoized) and passes it to `ModuleSummary`
(for the hint: `rawGcd → suggested`, residual, alternatives) and its `.suggested` to `ApartmentForm`
(to annotate the select). `ModuleSummary` also takes `mode` so it renders `GCD(ceiling, opening)`
vs `GCD(rooms)` and the `suggestedFrom` vs `suggestedFromRooms` label. This keeps the suggestion
computed in exactly one place and flowing down as props (`TC-ARCH-01`), not recomputed in leaves.

### `isApartmentValid` becomes mode-aware
In 2D the ceiling/opening are hidden and irrelevant, so requiring `isValidOpening(opening, ceiling)`
would be gating on invisible state. `isApartmentValid` therefore returns, in 2D, just "module is a
standard value"; in 3D it keeps the ceiling + opening + module checks. Because the heights are
frozen at their valid defaults while hidden this is not strictly required for correctness today, but
it makes `showResults` honest about what 2D actually depends on and is unit-tested for both modes.

### Toggle a11y: two `aria-pressed` buttons in a labelled group
`ModeToggle` is a `role="group"` (labelled by the `mode` string) containing two `<button>`s, each
`type="button"` with `aria-pressed={mode === 'this'}` and a visible selected style. Both are
tab-focusable; activation switches mode. This satisfies `NFR-A11Y-03` ("keyboard-operable with a
clear selected state") without the roving-tabindex complexity of a `radiogroup`, and mirrors the
shipped `ThemeToggle` `aria-pressed` pattern. The numeric results remain the source of truth; the
toggle only changes inputs/derivations, never hides a result value that 3D would show except the
band diagram, which is a 3D-only concept.

### Preserve heights across switches (don't reset to defaults)
`withMode` changes only `mode` (+ resync). Ceiling/opening retain their last values while hidden in
2D and reappear unchanged on return to 3D. `FR-MODE-04` requires shared state be preserved; heights
are 3D-only but preserving them is the least-surprising behaviour and avoids destroying user input on
an accidental toggle. (The PDR edge-case table's "reappear with defaults" phrasing is read as
"reappear," i.e. the fields come back populated; a hard reset would violate the "preserve" FR.)

## Risks / Trade-offs

- **Routing shipped reducers through `resyncModule`.** Edits change-5/6 reducers. Mitigated: it is
  behaviour-preserving in the 3D default (proved by the existing tests staying green) and the new 2D
  behaviour is unit-tested; the funnel removes duplicated suggestion logic rather than adding it.
- **Two suggestion engines behind one `moduleSuggestion`.** A wrong-mode suggestion would be a
  correctness bug; guarded by tests asserting 3D uses heights and 2D uses rooms, and by the touched/
  sticky tests.
- **No React/DOM runner (ADR-0001).** All state/reducer logic (`withMode`, `moduleSuggestion`,
  `resyncModule` via the public reducers, mode-aware `isApartmentValid`) is unit-tested; the toggle
  DOM, field-hiding, and band gating are verified by build+tsc+lint+manual (test plan).

## Migration Plan

Additive: a new state field defaulting to `'3d'`, a new component, and mode-aware branches in
existing components. The reducer routing is behaviour-preserving in the default mode. No persistence,
no data migration (`BC-PRIVACY-01`). Existing 3D behaviour and all shipped tests are unchanged.

## Open Questions

- `viz-2d`/`viz-3d` (14/15) will consume `mode`; this change exposes it in `AppState` ready for
  them. No blocker here.
