## 1. Engine: pure band-layout helper (`lib/calculations.ts`)

- [ ] 1.1 Add a `BandNameKey` type (`'band.basePlinth' | 'band.workZone' | 'band.doorHead' |
  'band.upperCeiling'`) and a `BandDiagramLayout` interface (bands, marks, opening, condensed).
- [ ] 1.2 Add `layoutBandDiagram(ceiling, m, opening?)` that calls `computeVerticalBands`, builds
  the full bands bottom-to-top + a trailing `partial` band when `topRemainder > 0`
  (`FR-VERT-02/03`), assigns each band a `nameKey` per the 3D-mode rule, builds the mm marks
  `0..ceiling`, sets `condensed = marks.length > 16` with a per-mark `condensedOut` flag (keep
  every 4th + last, `FR-VERT-06`), and the opening overlay `{ mm, aligned }` when given
  (`FR-VERT-04`).
- [ ] 1.3 Keep it pure (all mm-space values; no framework imports, no DOM).

## 2. i18n

- [ ] 2.1 Add `bandBasePlinth`, `bandWorkZone`, `bandDoorHead`, `bandUpperCeiling` to
  `locales/en.json` and `locales/ua.json` (ported from the frozen prototype; key-parity preserved).

## 3. UI: band diagram (`components/BandDiagram.tsx`, `'use client'`)

- [ ] 3.1 Width-responsive SVG `viewBox="0 0 200 400"` + `preserveAspectRatio`, no fixed pixel
  width/height on the element (`FR-VERT-05`, `NFR-RESP-01`).
- [ ] 3.2 Render full bands bottom-to-top with alternating fills (`--inset`/`--panel2`); the
  partial band dashed (`--accent-bg`) tagged `partial · {span} mm` (`FR-VERT-03`).
- [ ] 3.3 mm marks up the left edge (hide labels flagged `condensedOut`); band names on the right
  resolved via `t(nameKey→key)` (`FR-VERT-06`).
- [ ] 3.4 Opening overlay: dashed accent rule + dot at the true height, tagged `aligned`
  (`on grid`) or `offGrid` (`off-grid`) (`FR-VERT-04`).
- [ ] 3.5 Read-only; recomputes synchronously from `ceiling`/`opening`/`module` props (no submit,
  no effects).

## 4. Shell integration (`components/Shell.tsx`)

- [ ] 4.1 Render `<BandDiagram>` after `<ModuleSummary>` in the `showResults`-gated results region;
  note in a comment that `mode-toggle` (13) will later gate it on 3D mode.

## 5. Tests & verification

- [ ] 5.1 Add `lib/calculations.test.ts` cases for `layoutBandDiagram`: 2800/700 → 4 bands, no
  partial; 3000/700 → 4 bands + partial span 200; 5000/100 → 50 bands (derived); opening 2100/700
  → aligned true; opening 2100/400 → aligned false at true height; name-key sequence for a small
  case; `condensed` false at ≤16 marks, true at >16 (2 / 16 / 17 / 50 boundaries).
- [ ] 5.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
