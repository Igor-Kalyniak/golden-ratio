## 1. Pure state + gate (FR-SHELL-04, NFR-PERF-01)

- [x] 1.1 Create `lib/app-state.ts`: `Room` + `AppState` types, `DEFAULT_STATE` (ceiling 2800, opening 2100, module 700, one room `Room 1` 3000×2400)
- [x] 1.2 `isRoomValid(room)` (name 1–50, length/width via `isValidDimension`) and `isApartmentValid(state)` (via `isValidCeiling`/`isValidOpening`, module ∈ STANDARD_MODULES)
- [x] 1.3 `showResults(state) = isApartmentValid && rooms.some(isRoomValid)` — pure, synchronous
- [x] 1.4 Create `lib/app-state.test.ts`: valid defaults → true; bad ceiling → false; no valid room → false

## 2. Client boundary + state owner (TC-CLIENT-01, TC-ARCH-01)

- [x] 2.1 Create `components/Calculator.tsx` (`'use client'`): `useState<AppState>(DEFAULT_STATE)`
- [x] 2.2 Derive `showResults` with `useMemo` (no effects in the compute path, NFR-PERF-01)
- [x] 2.3 Render `<LanguageProvider><Shell state setState showResults/></LanguageProvider>`; Calculator does NOT call `useI18n`

## 3. Page (TC-CLIENT-01)

- [x] 3.1 Rewrite `app/page.tsx` as a Server Component rendering only `<Calculator />`; remove all create-next-app boilerplate

## 4. Shell layout + header (FR-SHELL-01/02/03, NFR-RESP-01)

- [x] 4.1 Create `components/Shell.tsx` (`'use client'`, uses `useI18n`): sticky header
- [x] 4.2 Header: logo placeholder (aria-hidden) + `title`/`subtitle` via `t()`; `livedot` "updates live" pill (`t('live')`); `ThemeToggle`; `LanguageToggle` top-right (FR-SHELL-03)
- [x] 4.3 Body grid: `grid-cols-1` stacked, `lg:grid-cols-[minmax(320px,400px)_1fr]` side-by-side, centered `max-w-[1400px]`; header wraps (NFR-RESP-01)
- [x] 4.4 Left: input column slot (apartment + rooms placeholders labelled for changes 5/6)

## 5. Results gate region (FR-SHELL-04, NFR-A11Y-01)

- [x] 5.1 Right: results region `aria-live="polite"`
- [x] 5.2 When `showResults` → results placeholder slot (sections owned by 7–11); else dashed empty-state card with `t('fillToSee')`

## 6. Theme toggle (DESIGN §4, NFR-A11Y-01)

- [x] 6.1 Create `components/ThemeToggle.tsx` (`'use client'`): `☾/☀` button toggling `html[data-theme]`, accessible label + focus, aria-hidden icon
- [x] 6.2 Initialize from the current attribute on mount without a hydration mismatch

## 7. Verify

- [x] 7.1 `npm test` green (app-state gate + engine + i18n)
- [x] 7.2 `npm run build` succeeds
- [x] 7.3 `npm run lint` clean for new files
- [x] 7.4 `npx tsc --noEmit` type-checks under strict mode
- [x] 7.5 Manual: wide = two columns, narrow = stacked; EN⇄UA switches strings live; results region shows (valid defaults)
