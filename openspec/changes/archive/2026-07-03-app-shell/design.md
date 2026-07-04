## Context

Capability 4 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md). Prerequisites `design-system`
(2) and `i18n` (3) are archived; the engine (1) provides validation bounds. The design source is
[docs/DESIGN.md](../../../../docs/DESIGN.md) §4 (layout & shell, header) and the
`design-layout-components` skill. This change builds the empty, responsive shell that later
capabilities populate — it renders no real inputs or results, only their slots and the validity
gate.

## Goals / Non-Goals

**Goals:**
- Keep `page.tsx` a Server Component; make `Calculator.tsx` the single `'use client'` boundary and
  state owner (`TC-CLIENT-01`, `TC-ARCH-01`).
- Mount the shipped `LanguageProvider`; place `LanguageToggle` top-right (`FR-SHELL-03`).
- Responsive two-column grid that stacks on small screens (`FR-SHELL-01/02`, `NFR-RESP-01`).
- Gate the results region on a pure, synchronous validity predicate (`FR-SHELL-04`, `NFR-PERF-01`),
  with `aria-live` and accessible header controls (`NFR-A11Y-01`).

**Non-Goals:**
- No apartment fields (5), room list CRUD (6), module summary (7), or result sections (8–11) — only
  their slots.
- No 2D/3D mode toggle (13) and no vertical bands (8) — `AppState` omits `mode` for now.
- No real logo (16) — a small aria-hidden placeholder mark stands in.
- No locale/theme persistence (BC-PRIVACY-01) — in-memory only.

## Decisions

- **Provider mounted inside the `Calculator` boundary, not in `page.tsx`.** `page.tsx` renders only
  `<Calculator />` so it stays the sole Server→Client transition (`TC-CLIENT-01`). `Calculator`
  owns state and renders `<LanguageProvider><Shell …/></LanguageProvider>`; the string-consuming UI
  lives in `Shell` (a descendant of the provider, so it can call `useI18n`). This keeps exactly one
  stateful client boundary while letting the shell use `t()`. Alt considered: mounting the provider
  in `page.tsx` — rejected to keep a single client entry point.
- **State lives in `Calculator`; the shell is presentational.** `Calculator` holds
  `useState<AppState>` and passes `state` + `setState` down (`TC-ARCH-01`); `showResults` is derived
  with `useMemo(() => showResults(state), [state])` — synchronous, no `useEffect` in the compute
  path (`NFR-PERF-01`).
- **Validity is a pure module (`lib/app-state.ts`).** `isRoomValid`/`isApartmentValid`/`showResults`
  compose the engine's `isValid*` bounds, so the gate (`FR-SHELL-04`) is unit-tested by `node:test`
  without rendering — matching how the engine and i18n split pure logic from React.
- **Layout via Tailwind grid utilities** over the design tokens (`bg-bg/panel`, `text-fg/muted`,
  `border-line`): `grid-cols-1` stacked, `lg:grid-cols-[minmax(320px,400px)_1fr]` side by side,
  centered `max-w-[1400px]`. No fixed pixel widths (`NFR-RESP-01`).
- **Theme toggle included as header furniture.** DESIGN §4 header item 3; no numbered FR owns it and
  no other capability card does, so the shell carries the minimal `☾/☀` toggle over `html[data-theme]`
  to exercise the shipped dark tokens. Documented as design-driven, not scope creep.
- **Default state is valid** (`ceiling 2800`, `opening 2100`, `module 700`, one room
  `Room 1` 3000×2400) so the shell shows the results region by default; the empty-state path is
  proven by the pure gate test until inputs (5/6) can drive invalidity.

## Risks / Trade-offs

- **Slots vs. real content** → The input column and results region are placeholders; a reviewer
  might read them as unfinished. Mitigation: they are explicitly labelled slots owned by later
  capabilities; the shell's own contract (boundary, layout, gate, toggle) is complete and tested.
- **No React/DOM test runner** → `FR-SHELL-01/02/03` (rendering/layout/toggle) are verified by
  build + lint + type-check + a manual checklist; only the pure gate (`FR-SHELL-04`) is automated.
  Consistent with ADR-0001 (a UI runner is a future decision).
- **`Calculator` renders the provider yet also owns state** → It does not call `useI18n` itself
  (only `Shell`, a child, does), avoiding the "use context in the component that provides it" bug.
- **Theme toggle hydration** → `<html data-theme>` is server-set to `light` with
  `suppressHydrationWarning`; the toggle mutates the attribute on click and reads it on mount, so no
  hydration mismatch.

## Migration Plan

Rewrite `app/page.tsx`; add the four component/state files + one test. Additive otherwise; no deps,
no routing, no data. Reversible by restoring `page.tsx` and deleting the new files.

## Open Questions

- Whether the theme toggle should persist or follow `prefers-color-scheme` initially — deferred;
  currently defaults to light with an in-memory manual toggle.
- Final input/results content arrives with changes 5–11; this shell fixes only their arrangement.
