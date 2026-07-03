## 1. State: mode + mode-driven suggestion (`lib/app-state.ts`)

- [x] 1.1 Add `Mode = '2d' | '3d'` and `mode: Mode` to `AppState`; set `DEFAULT_STATE.mode = '3d'`.
- [x] 1.2 Import `suggestModule2D` + `ModuleSuggestion`; add `moduleSuggestion(state): ModuleSuggestion`
  → 3D: `suggestModule(ceiling, opening)`; 2D: `suggestModule2D(rooms.filter(isRoomValid))`.
- [x] 1.3 Add a private `resyncModule(state)` that sets `module = moduleSuggestion(state).suggested`
  only when `!moduleTouched`.
- [x] 1.4 Add `withMode(state, mode)` = `resyncModule({ ...state, mode })` (`FR-MODE-04`).
- [x] 1.5 Route `withCeiling`/`withOpening` and `addRoom`/`removeRoom`/`updateRoom` through
  `resyncModule` (behaviour-preserving in 3D; 2D module tracks room edits — `FR-MODE-02`).
- [x] 1.6 Make `isApartmentValid` mode-aware: 2D → module-only; 3D → ceiling + opening + module.
- [x] 1.7 Keep pure — no framework imports.

## 2. UI: mode toggle (`components/ModeToggle.tsx`, `'use client'`)

- [x] 2.1 `role="group"` labelled `t('mode')`; two `type="button"` segments (`2D`/`3D`), each
  `aria-pressed={mode === seg}`, visible selected style, tab-focusable, `onClick` → `onModeChange`
  (`FR-MODE-01`, `NFR-A11Y-03`).

## 3. UI: mode-aware inputs & results

- [x] 3.1 `ApartmentForm`: add `mode` + `suggested` props; in 2D do not render the ceiling/opening
  `NumberField`s; annotate the module `<select>` from the passed `suggested` (`FR-MODE-02`).
- [x] 3.2 `ModuleSummary`: add `mode` + `suggestion: ModuleSuggestion` props; render
  `GCD(ceiling, opening)` + `suggestedFrom` in 3D, `GCD(rooms)` + `suggestedFromRooms` in 2D.
- [x] 3.3 `Shell`: render `<ModeToggle>` atop the input column; gate `<BandDiagram>` on
  `state.mode === '3d'` (`FR-MODE-02`); pass `mode`/`suggested`/`suggestion` down.
- [x] 3.4 `Calculator`: add `onModeChange` (`withMode`); compute `moduleSuggestion(state)` (memoized)
  and flow it + `mode` to `Shell` (state owner stays single — `TC-ARCH-01`).

## 4. i18n

- [x] 4.1 Add `mode` (`"Mode"` / `"Режим"`) to `locales/en.json` + `locales/ua.json`; `2D`/`3D` are
  untranslated mode labels; `suggestedFrom`/`suggestedFromRooms` already shipped. Key-parity held.

## 5. Tests & verification

- [x] 5.1 Add `lib/app-state.test.ts` cases: default mode `'3d'`; `withMode` resyncs an untouched
  module (3D→2D switches suggestion to the room-derived value) and is sticky when touched;
  `moduleSuggestion` returns the heights suggestion in 3D and the rooms suggestion in 2D; a room
  edit in 2D resyncs the untouched module but in 3D leaves it unchanged; `isApartmentValid` ignores
  heights in 2D (bad opening still valid) but not in 3D; existing `withCeiling`/`withOpening` tests
  still pass (behaviour-preserving).
- [x] 5.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
