## 1. Engine: shared helper + 2D suggestion (`lib/calculations.ts`)

- [x] 1.1 Extract the snap → residual → two-nearest-alternatives tail of `suggestModule` into an
  internal `suggestionFromGcd(rawGcd): ModuleSuggestion`; have `suggestModule` call it with
  `gcd(ceiling, opening)` (behaviour-preserving).
- [x] 1.2 Add an exported `RoomDimensions` interface (`{ length: number; width: number }`).
- [x] 1.3 Add `suggestModule2D(rooms: readonly RoomDimensions[]): ModuleSuggestion` — fold `gcd`
  across every room's `length` and `width`, then `suggestionFromGcd(rawGcd)` (`FR-MODULE2D-01`).
  Empty input folds to `rawGcd = 0` (snaps to the smallest standard module, residual surfaced — no
  `|| 100` magic).
- [x] 1.4 Keep pure — no framework imports; no dependency on `lib/app-state.ts`.

## 2. Tests & verification

- [x] 2.1 Add `lib/calculations.test.ts` cases for `suggestModule2D`: single room →
  `gcd(4200,3500)=700`, suggested 700, residual 0; three-room fold (`4200×3500`, `3800×2500`,
  `2150×1500`) → rawGcd 50, suggested 100, residual 50; a coprime-dims case snaps with a non-zero
  residual and `suggested ∈ STANDARD_MODULES`; empty `[]` → rawGcd 0, suggested 100, residual 100.
- [x] 2.2 Confirm the existing `suggestModule` tests still pass (proves the `suggestionFromGcd`
  extraction is behaviour-preserving).
- [x] 2.3 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
