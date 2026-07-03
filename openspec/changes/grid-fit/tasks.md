## 1. Engine: round-direction helper + comment fix (`lib/calculations.ts`)

- [ ] 1.1 Add `gridRoundDirection(remainder)` → `'roundDown' | 'roundUp' | null` (`> 0` roundDown,
  `< 0` roundUp, `0` null) — the `FR-GRID-03` sign convention as a locale-independent key.
- [ ] 1.2 Correct the stale `RoomGrid.lengthRemainder` doc comment ("negative ⇒ round down,
  positive ⇒ round up") to match `FR-GRID-03` (positive ⇒ round down / over grid, negative ⇒ round
  up / under grid). Comment-only; returned values unchanged.
- [ ] 1.3 Keep pure (no framework imports); `computeRoomGrid` reused unchanged.

## 2. UI: grid-fit block (`components/GridFitBlock.tsx`, `'use client'`)

- [ ] 2.1 Given `room` + `module`: call `computeRoomGrid(length, width, module)`; show
  `lengthModules × widthModules` (mono) and the signed `remainder L / W` with explicit sign
  (`FR-GRID-01/02/03/05`).
- [ ] 2.2 Per non-zero remainder, render a warn annotation `t(gridRoundDirection(rem)) t('onLength'|
  'onWidth')` (e.g. `round down on width`); no annotation when the remainder is 0 (`FR-GRID-03`).
- [ ] 2.3 Quality badge `t('q'+quality)` (`qexact`/`qclose`/`qpoor`) + glyph `✓`/`≈`/`✕`
  (`aria-hidden`), colored good/warn/bad — label + glyph carry the meaning, not color alone
  (`FR-GRID-04/05`, `NFR-A11Y-02`). Avoid `--faint`/accent for the badge text.

## 3. Card integration (`components/PerRoomResults.tsx`)

- [ ] 3.1 Render `<GridFitBlock room={room} module={activeModule} />` as the second block in each
  per-room card, below `<GoldenSplitBlock>`.

## 4. Tests & verification

- [ ] 4.1 Add `lib/calculations.test.ts` cases: `gridRoundDirection` (positive→roundDown,
  negative→roundUp, zero→null); and worked-example assertions via `computeRoomGrid` — living
  4200×3500 → 6×5, rem 0/0, `exact`; kitchen 3800×2500 → 5×4, rem −300/+300, `poor`; bathroom
  2150×1500 → 3×2, rem +50/+100, `close`; a 1 mm-short dimension reads `close`. (Some
  `computeRoomGrid` cases may already exist from change 1 — add only the missing ones + the
  direction helper.)
- [ ] 4.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
