## 1. Engine: pure 3D layout helper (`lib/calculations.ts`)

- [x] 1.1 Add a `Room3DLayout` interface (`l`, `w`, `h` box extents in mm; `cols`, `rows`, `layers`
  = floor(dim/m); `cube: { x, y, z }` corner origin of the M³ highlight; `openingY: number | null`)
  and `layoutRoom3D(length, width, ceiling, m, opening?): Room3DLayout`.
- [x] 1.2 `cols/rows/layers = floor(l/m | w/m | ceiling/m)`; cube at a fixed room corner (one M³);
  `openingY = opening` when `opening` is given AND `0 < opening ≤ ceiling`, else `null` (`FR-VIZ3D-02`).
- [x] 1.3 Keep pure — no framework/R3F imports; module/mm space only.

## 2. UI: heavy R3F scene (`components/Viz3DScene.tsx`, `'use client'`, lazy-only)

- [x] 2.1 `<Canvas>` with one `<mesh><boxGeometry>` per valid room (l×w×ceiling via `layoutRoom3D`,
  one shared scale), laid out along the x-axis (`FR-VIZ3D-01`).
- [x] 2.2 Accent opening band (thin plane) on a wall face at `openingY` when non-null (`FR-VIZ3D-02`);
  exactly one accent M³ cube mesh at the room corner (`FR-VIZ3D-03`).
- [x] 2.3 `<OrbitControls>` (rotate/zoom/pan); gentle auto-rotate + highlight float (`FR-VIZ3D-04` —
  room fade-in is a descoped MAY, the Should is met by auto-rotate + float), gated on a
  `prefers-reduced-motion` check → disabled when reduced (`FR-VIZ3D-05`). The M³ cube + opening band
  use the resolved `--accent` (sampled from CSS, re-sampled on theme change). This is the ONLY
  module importing `@react-three/*`.

## 3. UI: thin lazy wrapper (`components/Viz3D.tsx`, `'use client'`)

- [x] 3.1 Detect WebGL support (probe a canvas `getContext('webgl'|'experimental-webgl')`).
- [x] 3.2 Supported → `dynamic(() => import('./Viz3DScene'), { ssr: false, loading: <placeholder> })`
  so Three.js is a separate lazily-fetched chunk with a loading state (`NFR-BUNDLE-01`, `FR-VIZ3D-05`,
  `TC-STACK-04`).
- [x] 3.3 Unsupported → render the localized `webgl` message + the shipped `<Viz2D rooms module />`
  fallback (`FR-VIZ3D-06`). Read-only — no editing/export controls (`BC-VALUE-01`).

## 4. Shell integration (`components/Shell.tsx`)

- [x] 4.1 In the `mode === '3d'` branch, render `<Viz3D>` (after the band diagram). 2D mode keeps
  `<Viz2D>`. `Viz3D` (thin wrapper) is statically importable — the Three.js cost is deferred to its
  internal `dynamic()`.

## 5. Tests & verification

- [x] 5.1 Add `lib/calculations.test.ts` cases for `layoutRoom3D`: box extents = dims; cols/rows/
  layers = floor(dim/m); one M³ cube at the expected corner; `openingY` = opening for a valid
  opening (2100 ≤ 2800), and `null` when opening omitted or > ceiling.
- [x] 5.2 Confirm no statically-imported module pulls in `@react-three`/`three`: `Viz3DScene` is the
  sole importer and is referenced only inside `dynamic()` in `Viz3D`; grep `Shell`/`Viz3D`/`lib/*`.
- [x] 5.3 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green; confirm
  the build emits the 3D scene as a **separate chunk** (Three.js not in the main/first-load JS).
