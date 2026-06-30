---
name: calculation-logic
description: The canonical pure-math algorithms for the Apartment Module & Golden Ratio Calculator — GCD module suggestion, nearest-standard snapping, golden-ratio wall split, grid-fit with signed remainders, walkway clearance ratings, vertical band derivation, validation bounds, warnings, and the worked-example numbers to verify against. Use whenever implementing or reviewing lib/calculations.ts or any derived value (module, golden split, grid fit, walkway, bands, residuals). Distilled from docs/DESIGN.md §10, §12–13.
license: Apache-2.0
metadata:
  version: "1.0.0"
  updated: 2026-06-30
  category: calculation
  source: docs/DESIGN.md
---

# Reference Calculation Logic

The prototype's pure helpers are the **canonical algorithms** for the build's
`lib/calculations.ts`. Pairs with [design-layout-components](../design-layout-components/SKILL.md)
(which results block shows each value). Behaviour traces to [docs/PDR.md](../../../docs/PDR.md)
(`FR-*`).

## When to use

- Implementing or reviewing `lib/calculations.ts`.
- Computing the suggested module, golden split, grid fit, walkway rating, or bands.
- Adding validation bounds or warning thresholds.
- Verifying output against known numbers.

## Helpers (verbatim from the export)
```js
gcd(a,b){ a=Math.abs(Math.round(a)); b=Math.abs(Math.round(b)); while(b){ [a,b]=[b,a%b]; } return a; }
nearestStd(v){ return STD.reduce((p,c)=> Math.abs(c-v)<Math.abs(p-v)?c:p, STD[0]); } // STD=[100,150,200,300,350,600,700]
snap(v,step){ return Math.round(v/step)*step; }
```

## Module suggestion
- **3D mode:** `g = gcd(ceiling, opening)`.
- **2D mode:** `g = gcd` folded across all valid rooms' L & W.
- `snapped = nearestStd(g)`; `residual = |g − snapped|`; `alts` = the two nearest other STD values.

## Per room, given module M
```
longer = max(L, W);  largerExact = longer*0.618;  smallerExact = longer*0.382
snappedLarger = snap(largerExact, M/2);  snappedSmaller = longer − snappedLarger
offset = |largerExact − snappedLarger|;   approx-fit when offset > M/4
nL = round(L/M), nW = round(W/M);  remL = L − nL*M, remW = W − nW*M   (signed)
quality: max|rem| === 0 → exact;  ≤ M/4 → close;  else poor
walkway clearance = dim − depth for depths {600, 900, 1200}
  ≥900 comfortable · ≥600 acceptable · <600 tight   (FIXED — never scale with M)
```
Module ruler rows: `round(M × k)` for `k ∈ {0.25,0.5,1,1.5,2,3,4}` (¼M…4M).

## Vertical bands (3D)
`full = floor(ceiling / M)`; `rem = ceiling − full*M` → partial band when `rem > 0`.
Opening tagged `on grid` when `opening % M === 0`, else `off-grid`.

## Validation bounds (all integers, mm)
- Ceiling `2000–5000` → `errCeiling`
- Opening `1800–ceiling` → `errOpening`
- Room L/W `500–15000` → `errDim`

## Warnings
- `M > 1000` → `warnLarge`
- `M < 100` → `warnSmall`
- At M=700 neither warning fires.

## Worked example (verify exact numbers)
Apartment: **ceiling 2800, opening 2100, M = 700** (suggested; alts `600, 350`; residual 0).
Default state: 3D mode, light theme, EN, all three rooms valid.

| Room | Dims | Golden (exact → snapped, offset) | Grid | Badge | Walkway |
|---|---|---|---|---|---|
| **Living room** | 4200 × 3500 | 2595.6 / 1604.4 → 2450 / 1750, off 145.6 | 6 × 5, rem 0 / 0 | **exact** | 2900 comf · 2600 comf |
| **Kitchen** | 3800 × 2500 | 2348.4 / 1451.6 → 2450 / 1350, off 101.6 | 5 × 4, rem −300 / +300 | **poor** | 1900 comf |
| **Bathroom** | 2150 × 1500 | 1328.7 / 821.3 → 1400 / 750, off 71.3 | 3 × 2, rem +50 / +100 | **close** | 600 acceptable · 300 tight |

Across the three: grid `exact / close / poor`; walkway `comfortable / acceptable / tight`.

## Build deviations to keep
- **Port, don't copy markup** — lift these helpers into pure `lib/calculations.ts`; the export
  is Claude Design `x-dc`, not React.
- **Walkway third row** (`between facing 600 units (1200)`) is beyond the brief's
  wardrobe/sofa pair — keep it.
- Calculation labels (`¼M`,`½M`,`M`,`1.5M`,`2M`,`3M`,`4M`) are **never translated** — see
  [i18n-strings](../i18n-strings/SKILL.md).
