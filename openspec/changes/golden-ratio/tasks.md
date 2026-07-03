## 1. Engine: caller-responsibility helpers (`lib/calculations.ts`)

- [ ] 1.1 Add `longerWall(room: { length: number; width: number })` → `Math.max(length, width)`
  (`FR-GOLD-03`).
- [ ] 1.2 Add `isApproximateFit(snapOffset: number, m: number)` → `snapOffset > m / 4` (`FR-GOLD-04`).
- [ ] 1.3 Keep both pure (no framework imports); `computeGoldenSplit` reused unchanged.

## 2. UI: per-room card scaffold + golden block (`components/PerRoomResults.tsx` + `GoldenSplitBlock.tsx`, `'use client'`)

- [ ] 2.1 `PerRoomResults` maps `rooms.filter(isRoomValid)` → one card each; card header shows room
  name + `length × width mm` (mono) + a fit badge `cleanFit` (✓) / `approxFit` (≈) driven by
  `isApproximateFit(goldenSplit.snapOffset, module)` — text + glyph, not color alone (DESIGN §6.3).
- [ ] 2.2 `GoldenSplitBlock` (given `room` + `module`): compute `longer = longerWall(room)` and
  `computeGoldenSplit(longer, module)`; show the `longerWall` value, exact `larger / smaller`
  (0.618/0.382, one decimal), ½M-snapped `largerSnapped / smallerSnapped` (accent), and `snapOffset`
  colored by fit (`FR-GOLD-01/02/04`).
- [ ] 2.3 Render `GoldenSplitBlock` inside the card as the first block; leave the card composition
  open so grid-fit (10) / walkway (11) add sibling blocks in the same slot.
- [ ] 2.4 Read-only; recomputes synchronously from props (no submit, no effects).

## 3. Shell integration (`components/Shell.tsx`)

- [ ] 3.1 Render `<PerRoomResults rooms={state.rooms} module={state.module} />` after
  `<BandDiagram>` in the `showResults`-gated results region.

## 4. Tests & verification

- [ ] 4.1 Add `lib/calculations.test.ts` cases: `longerWall` (length ≥ width, width > length,
  square); `isApproximateFit` (offset below / equal to / above `m/4`); and a worked-example
  assertion — living room longer wall 4200, m 700 → `larger ≈ 2595.6`, `largerSnapped = 2450`,
  `snapOffset ≈ 145.6`, `isApproximateFit(145.6, 700) === false` (145.6 ≤ 175); bathroom 2150 →
  `snapOffset ≈ 71.3`.
- [ ] 4.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
