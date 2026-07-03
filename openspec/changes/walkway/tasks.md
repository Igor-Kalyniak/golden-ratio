## 1. Engine: meter-bar helper (`lib/calculations.ts`)

- [ ] 1.1 Add `walkwayMeterBars(rating: WalkwayRating)` → `1 | 2 | 3` (comfortable 3, acceptable 2,
  tight 1) — the meter fill count, one tested definition shared by the component (`FR-WALK-04`).
- [ ] 1.2 Keep pure (no framework imports); `computeWalkways`/`rateWalkway`/`FURNITURE_DEPTHS`
  reused unchanged.

## 2. UI: walkway block (`components/WalkwayBlock.tsx`, `'use client'`)

- [ ] 2.1 Given `room`: render three rows over `FURNITURE_DEPTHS` (wardrobeKitchen 600, sofa 900,
  facingUnits 1200), each calling `computeWalkways(room.width, depth)` (`FR-WALK-01/02/04`).
- [ ] 2.2 Per row: furniture label (`t('wardrobe'|'sofa'|'facing')`), available clearance in mm, a
  3-bar meter filled by `walkwayMeterBars(rating)`, a colored text rating
  (`t('comfortable'|'acceptable'|'tight')`), and the guidance sentence via the `recommendation` key
  → `t('recComf'|'recAcc'|'recTight')`. Meaning carried by label + meter, not color alone
  (`FR-WALK-03/04`, `BC-WALK-01`); use good/warn/bad tokens, not `--faint`/accent.
- [ ] 2.3 Read-only; recomputes synchronously from `room` prop (no submit, no effects). Ratings come
  from the engine's fixed-mm `rateWalkway` — never derived from the module.

## 3. Card integration (`components/PerRoomResults.tsx`)

- [ ] 3.1 Render `<WalkwayBlock room={room} />` as the third block in each per-room card, below
  `<GridFitBlock>`.

## 4. Tests & verification

- [ ] 4.1 Add `lib/calculations.test.ts` cases: `walkwayMeterBars` (comfortable→3, acceptable→2,
  tight→1); worked-example ratings via `computeWalkways(width, depth)` at the three presets
  (e.g. width 3500 → 2900 comfortable / 2600 comfortable / 2300 comfortable; a narrow room where
  facing 1200 goes negative reads `tight`); and the `recommendation` key mapping
  (`walkway.comfortable`/`.acceptable`/`.tight`). (Core threshold cases already exist from change 1
  — add only the meter helper + any missing worked examples.)
- [ ] 4.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
