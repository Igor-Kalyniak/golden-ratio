## Why

`viz-2d` (14) shipped the read-only plan visualizer and — critically — the WebGL-unavailable
fallback target this change needs. `viz-3d` completes the visualizer pair: in 3D mode, a
`@react-three/fiber` canvas draws each room as a to-scale box (length × width × ceiling), marks the
opening as a band on a wall, and highlights exactly one M³ module cube so the architect sees the
module's volume relative to the room. It is the **heaviest, riskiest** change in the plan — the only
one using the Three.js stack — so it is built last and **lazy-loaded**: `next/dynamic({ ssr:false })`
keeps Three.js out of the 2D path and first paint (`NFR-BUNDLE-01`, `TC-STACK-04`), a loading state
covers the chunk fetch, `prefers-reduced-motion` disables the motion, and when WebGL is unavailable
the view **degrades to the shipped `<Viz2D>`** (`FR-VIZ3D-06`). Read-only throughout (`BC-VALUE-01`);
the numeric results remain the accessible source of truth (`NFR-A11Y-03`). Capability 15 in
[docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md); its prerequisites `viz-2d` (14) and
`mode-toggle` (13) are archived, and `@react-three/fiber@9`/`@react-three/drei@10`/`three@0.185` are
already installed. Owns `FR-VIZ3D-01/02/03/04/05/06`, `NFR-BUNDLE-01`, `NFR-PERF-03`, `TC-STACK-04`,
`NFR-A11Y-03`.

## What Changes

- **`lib/calculations.ts` extended (pure)**: add `layoutRoom3D(length, width, ceiling, m, opening?)`
  returning the framework-free box geometry in **module/mm space** — the box extents
  `{ l, w, h }`, the `cols/rows/layers = floor(dim/m)` module counts, the highlighted M³ cube
  origin (a room corner), and the opening-band height `openingY` (only when an opening is given and
  ≤ ceiling; null otherwise, so `FR-VIZ3D-02`'s "omitted when blank" is a data fact). The component
  maps these to Three.js units with one shared scale. Unit-tested like the rest of the engine.
- **`components/Viz3DScene.tsx` (`'use client'`, the heavy chunk)**: the actual R3F scene — a
  `<Canvas>` with one `<mesh><boxGeometry>` per room (l×w×ceiling) arranged along the x-axis, an
  accent opening band plane when `openingY` is set (`FR-VIZ3D-02`), exactly one accent M³
  `<mesh>` cube (`FR-VIZ3D-03`), `<OrbitControls>` (rotate/zoom/pan) + a gentle auto-rotate,
  highlight float/pulse, and room fade-in on mount (`FR-VIZ3D-04`). All motion is gated on a
  `prefers-reduced-motion` check — disabled when reduced (`FR-VIZ3D-05`). This module imports
  `@react-three/*` and is **never statically imported** anywhere.
- **`components/Viz3D.tsx` (`'use client'`, the thin lazy wrapper)**: detects WebGL support; if
  present, renders the scene via `dynamic(() => import('./Viz3DScene'), { ssr: false, loading: … })`
  so Three.js is a separate lazily-fetched chunk (`NFR-BUNDLE-01`, `TC-STACK-04`) with a loading
  placeholder while it downloads (`FR-VIZ3D-05`); if WebGL is unavailable, renders a graceful
  `webgl` message + the shipped `<Viz2D>` fallback (`FR-VIZ3D-06`). Read-only — no geometry editing,
  no export (`BC-VALUE-01`).
- **`components/Shell.tsx`**: in the `mode === '3d'` branch, render `<Viz3D>` after the band diagram
  (the 3D visualizer slot). 2D mode keeps `<Viz2D>`.
- **`lib/calculations.test.ts` extended**: unit tests for `layoutRoom3D` — box extents = dims;
  `cols/rows/layers = floor(dim/m)`; the cube is one M³ at a room corner; `openingY` set for a valid
  opening and **null when omitted or > ceiling**.
- **No i18n changes** — `visualizer`, `vizNote`, `webgl` already shipped; the `3D` label is a
  universal mode name.

Scope: the 3D visualizer only. The header logo (`brand-logo`, 16) is the last remaining change.
`prefers-reduced-motion` also benefits from the shipped global `globals.css` reset, but 3D motion is
JS-driven (auto-rotate/float in the R3F frame loop), so this change **explicitly** checks the media
query and disables those loops rather than relying on the CSS reset. Bundle discipline is the
load-bearing constraint: a purity/structure test (or the build output) confirms the 2D path carries
no `@react-three` import.

## Capabilities

### New Capabilities
- `viz-3d`: the lazy-loaded read-only 3D module visualizer — per-room boxes to scale, an opening
  band, one highlighted M³ cube, OrbitControls + reduced-motion-aware motion, a loading state, and a
  WebGL-unavailable fallback to the 2D visualizer, with Three.js kept out of the 2D/first-paint
  bundle.

### Modified Capabilities
<!-- none — viz-2d/mode-toggle specs are unchanged; viz-2d is reused as the fallback. -->

## Impact

- **Files:** extend `lib/calculations.ts` (`layoutRoom3D` + types) + tests; add
  `components/Viz3DScene.tsx` (heavy, lazy) + `components/Viz3D.tsx` (thin wrapper); edit
  `components/Shell.tsx`. **No new dependency** — the R3F stack is already installed; this change
  makes it *lazy*.
- **Requirements owned:** `FR-VIZ3D-01/02/03/04/05/06`, `NFR-BUNDLE-01`, `NFR-PERF-03`,
  `TC-STACK-04`, `NFR-A11Y-03`.
- **Consumes (shipped):** `state.rooms`/`state.mode`/`ceiling`/`opening`/active `module`;
  `<Viz2D>` from change 14 (fallback); `useI18n`; `webgl`/`visualizer`/`vizNote` i18n keys.
- **Enables:** completes the visualizer pair; only `brand-logo` (16) remains in the backlog.
