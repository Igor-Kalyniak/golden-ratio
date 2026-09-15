## Why

The engine (1), design tokens (2), and i18n (3) are shipped but nothing renders them —
`app/page.tsx` is still create-next-app boilerplate. `app-shell` is the container every input
and result plugs into: it establishes the single `'use client'` boundary (`Calculator.tsx`,
`TC-CLIENT-01`), makes `Calculator` the state owner (`TC-ARCH-01`), mounts the shipped
`LanguageProvider`, lays out the responsive input/results two-column grid (`FR-SHELL-01/02`),
places the language toggle top-right (`FR-SHELL-03`), and gates the results panel on full input
validity (`FR-SHELL-04`). Capability 4 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md);
its prerequisites `design-system` and `i18n` are archived. Owns `FR-SHELL-01/02/03/04`,
`TC-CLIENT-01`, `TC-ARCH-01`, `NFR-RESP-01`, `NFR-A11Y-01`, `NFR-PERF-01`.

## What Changes

- **`app/page.tsx` → Server Component** rendering only `<Calculator />` (removes all boilerplate;
  keeps `page.tsx` server-only, `TC-CLIENT-01`).
- **`components/Calculator.tsx` (`'use client'`)** — the single client boundary and **state owner**
  (`TC-ARCH-01`): holds `AppState` (`ceiling`, `opening`, `module`, `rooms`) in `useState` with
  valid defaults; derives `showResults` **synchronously** via `useMemo` (no effects in the compute
  path, `NFR-PERF-01`); mounts `<LanguageProvider>` and renders `<Shell>` with state + setters as
  props (results flow down as props).
- **`components/Shell.tsx` (`'use client'`)** — the presentational shell (consumes `useI18n`):
  sticky **header** (logo slot + `title`/`subtitle` + a `livedot` "updates live" pill + theme
  toggle + `<LanguageToggle>` top-right, `FR-SHELL-03`) and a responsive CSS-grid body —
  `minmax(320px,400px) 1fr` side-by-side on wide screens, **stacked** below the breakpoint
  (`FR-SHELL-01/02`, `NFR-RESP-01`). Left = **input column** slot (apartment + rooms placeholders
  that changes 5/6 fill); right = **results region** that renders results only when `showResults`,
  else a dashed empty-state card showing `fillToSee` (`FR-SHELL-04`); results region is
  `aria-live="polite"` (`NFR-A11Y-01`).
- **`components/ThemeToggle.tsx` (`'use client'`)** — a small `☾/☀` button toggling
  `html[data-theme]` (DESIGN §4 header furniture; exercises the shipped dark tokens). Accessible
  label + focus.
- **`lib/app-state.ts` (pure)** — `Room`/`AppState` types, `DEFAULT_STATE`, and the validity
  predicates `isRoomValid`, `isApartmentValid`, `showResults` — composed from the engine's
  `isValidCeiling`/`isValidOpening`/`isValidDimension`. Pure so `FR-SHELL-04`'s gate is
  unit-testable.
- **`lib/app-state.test.ts`** — node:test for the gate: valid defaults → results shown; invalid
  ceiling / no valid room → hidden.

Container only — the apartment fields (5), room list (6), module summary (7), and result sections
(8–11) fill the input/results slots later; the 2D/3D mode toggle is change 13.

## Capabilities

### New Capabilities
- `app-shell`: the page shell — server `page.tsx`, the single `Calculator` client boundary and
  state owner, the `LanguageProvider` mount, the responsive header + two-column layout, the
  top-right language toggle, and the validity-gated results region.

### Modified Capabilities
<!-- none — no existing spec's requirements change -->

## Impact

- **Files:** rewrite `app/page.tsx`; add `components/Calculator.tsx`, `components/Shell.tsx`,
  `components/ThemeToggle.tsx`, `lib/app-state.ts`, `lib/app-state.test.ts`. No new dependencies.
- **Requirements owned:** `FR-SHELL-01/02/03/04`, `TC-CLIENT-01`, `TC-ARCH-01`, `NFR-RESP-01`,
  `NFR-A11Y-01`, `NFR-PERF-01`.
- **Consumes (shipped):** `lib/i18n-context.tsx`, `components/LanguageToggle.tsx` (change 3);
  design tokens/utilities (change 2); `isValid*` from `lib/calculations.ts` (change 1).
- **Enables:** `apartment-input` (5) and `room-input` (6) fill the input slots; result sections
  (7–11) fill the results region.
