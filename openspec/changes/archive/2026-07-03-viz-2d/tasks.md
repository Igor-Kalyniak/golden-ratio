## 1. Engine: pure 2D layout helper (`lib/calculations.ts`)

- [x] 1.1 Add a `Room2DLayout` interface (`cols`, `rows`, `rightStrip`, `bottomStrip`, `highlight:
  { col, row }`) and `layoutRoom2D(length, width, m): Room2DLayout`.
- [x] 1.2 `cols = floor(length/m)`, `rows = floor(width/m)`; `rightStrip = length − cols·m`,
  `bottomStrip = width − rows·m` (≥ 0, module/mm space); highlight = one M×M cell bottom-left
  (`{ col: 0, row: max(0, rows-1) }`) (`FR-VIZ2D-02/03`).
- [x] 1.3 Keep pure — no framework imports; grid geometry only, reuses no other engine fn.

## 2. UI: 2D visualizer (`components/Viz2D.tsx`, `'use client'`)

- [x] 2.1 Header: `t('visualizer')` + `2D` + a `1 module` accent swatch (`t('oneModule')`) + the
  read-only note `t('vizNote')` (`BC-VALUE-01`).
- [x] 2.2 Compute one shared mm→viewBox scale across all valid rooms (max dimension → target), then
  a wrapping row of per-room SVGs, each a to-scale `--inset` rect with width-responsive `viewBox`,
  no fixed pixel size (`FR-VIZ2D-01`, `NFR-PERF-03`).
- [x] 2.3 Per room: faint M×M grid lines (`--line`) from `layoutRoom2D` cols/rows; a `--warn-bg`
  remainder strip on the right/bottom edge when `rightStrip`/`bottomStrip` > 0 (`FR-VIZ2D-02`); one
  `--accent` highlighted cell with the `cellpulse` animation (`FR-VIZ2D-03/04`). Caption
  `name · L × W · cols×rows`.
- [x] 2.4 Read-only — no event handlers, no inputs, no export control. Reduced-motion is honored by
  the global `globals.css` rule (no per-component code needed — `FR-VIZ2D-05`).

## 3. Shell integration (`components/Shell.tsx`)

- [x] 3.1 Render `<Viz2D rooms={state.rooms} module={state.module} />` in the results region when
  `state.mode === '2d'` (mirrors the `mode === '3d'` gate on `<BandDiagram>`; the 3D scene is
  `viz-3d`, 15).

## 4. i18n

- [x] 4.1 Add `oneModule` (`"1 module"` / `"1 модуль"`) to `locales/en.json` + `locales/ua.json`;
  `visualizer`/`vizNote` already shipped. Key-parity held.

## 5. Tests & verification

- [x] 5.1 Add `lib/calculations.test.ts` cases for `layoutRoom2D`: exact fit (3000×2400, m 600 →
  cols 5, rows 4, no strips); a right/bottom remainder (e.g. 3200×2500, m 600 → cols 5 rightStrip
  200, rows 4 bottomStrip 100); highlight is a single cell at `{col:0,row:rows-1}`; cols/rows =
  floor(dim/m); a room smaller than one module (rows 0 → highlight row 0, no negative strip).
- [x] 5.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
