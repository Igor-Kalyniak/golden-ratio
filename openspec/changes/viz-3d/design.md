## Context

`mode-toggle` (13) gates the visualizer by mode; `viz-2d` (14) shipped the 2D SVG visualizer and is
the fallback target this change requires. DESIGN §6.4's build note is explicit: production 3D uses
`@react-three/fiber` + `@react-three/drei`, **lazy-loaded via `next/dynamic({ ssr:false })`**, with a
real WebGL-unavailable fallback to the 2D visualizer and `prefers-reduced-motion` honored. The R3F
stack is already installed. This is the plan's heaviest change and its only Three.js consumer, so
the whole design is organized around **keeping Three.js out of every path except an interactive 3D
canvas**.

## Goals / Non-Goals

**Goals**
- Per-room to-scale boxes, an opening band, one highlighted M³ cube (`FR-VIZ3D-01/02/03`).
- OrbitControls + reduced-motion-aware idle motion + a loading state (`FR-VIZ3D-04/05`).
- WebGL-off → graceful message + `<Viz2D>` fallback (`FR-VIZ3D-06`).
- Three.js lazy-loaded, absent from the 2D path and first paint (`NFR-BUNDLE-01`, `TC-STACK-04`).

**Non-Goals**
- The header logo (`brand-logo`, 16).
- Any editing/export — read-only (`BC-VALUE-01`); camera controls only.
- Making the 3D view the source of truth — numeric results remain authoritative (`NFR-A11Y-03`).

## Decisions

### Three components: pure geometry / heavy scene / thin lazy wrapper
- **`layoutRoom3D` (pure, in `lib/calculations.ts`)** — box extents `{ l, w, h }`, module counts
  `floor(dim/m)`, the M³ cube origin (a room corner), and `openingY` (null when no opening or
  opening > ceiling). Framework-free, unit-tested; the "opening omitted when blank" rule
  (`FR-VIZ3D-02`) is a data fact here, not a JSX conditional buried in the scene.
- **`Viz3DScene.tsx` (heavy, lazy-only)** — the `<Canvas>`, meshes, `<OrbitControls>`, and frame-loop
  motion. It is the ONLY module importing `@react-three/*`, and is **never** statically imported —
  reached solely through the wrapper's `dynamic()`. This is what keeps Three.js in its own chunk.
- **`Viz3D.tsx` (thin wrapper)** — WebGL detection + `dynamic(() => import('./Viz3DScene'),
  { ssr:false, loading })` + the fallback branch. Small, statically importable by `Shell` with no
  Three.js cost (the import of the scene is deferred to the dynamic call).

### `ssr: false` + client boundary is mandatory, not stylistic
Three.js touches `window`/WebGL and cannot server-render. `dynamic(import, { ssr:false })` both (a)
splits the chunk so first paint / the 2D path never download it (`NFR-BUNDLE-01`) and (b) avoids an
SSR crash. The wrapper is `'use client'`; `Shell` (already a client component) renders `<Viz3D>`
only in the `mode === '3d'` branch, so even mounting the wrapper is mode-gated.

### WebGL detection drives the fallback (FR-VIZ3D-06)
The wrapper probes WebGL once (create a canvas, request `webgl`/`experimental-webgl`; on failure or
exception → unsupported). Unsupported → render the `webgl` message + `<Viz2D rooms module />` (the
shipped 2D visualizer, reused verbatim). Supported → the dynamic scene. The probe is cheap and
client-only. This makes the fallback a real degradation path, not a thrown error.

### Reduced-motion is checked in JS, not left to CSS
The 2D visualizer's motion is CSS keyframes suppressed by the global `globals.css` reduced-motion
reset. 3D motion is **JS-driven** (auto-rotate + float in the R3F `useFrame` loop, `OrbitControls
autoRotate`), which the CSS reset cannot stop. So the scene reads `matchMedia('(prefers-reduced-
motion: reduce)')` and, when set, disables `autoRotate` and the pulse/float (the scene renders
static; OrbitControls drag still works — reduced-motion suppresses *idle* motion, not interaction).
`FR-VIZ3D-05`.

### Bundle discipline is verified, not assumed
`NFR-BUNDLE-01`/`TC-STACK-04` are the load-bearing constraints. Guarding them: (a) `Viz3DScene` is
the sole `@react-three` importer and is only reached via `dynamic`; (b) a structural check — grep/
purity assertion that no statically-imported module (`Shell`, `Viz3D`, `lib/*`) imports
`@react-three` or `three`; (c) the production `npm run build` output shows the 3D scene as a
separate chunk. `lib/calculations.ts` stays pure (no R3F), so `layoutRoom3D` adds no bundle weight to
the 2D path.

### Geometry: boxes along x, cube at a corner, opening band on a wall
One shared scale (max room dimension → a target extent) maps mm → Three.js units so rooms are
comparable. Each room is a `boxGeometry` (l × w × ceiling) placed along x with a gap; the M³ cube
sits at a fixed room corner (bottom-front-left) so its size reads against the whole; the opening
band is a thin accent plane on a wall face at `openingY`. This mirrors DESIGN §6.4 (the prototype's
CSS-3D faked this; production uses real meshes).

## Risks / Trade-offs

- **Heaviest change; hardest to unit-test.** R3F renders to a WebGL canvas with no DOM/React-tree a
  `node:test` runner can assert (ADR-0001). Mitigation: all *geometry* is in the pure, unit-tested
  `layoutRoom3D`; the scene/wrapper (canvas, controls, lazy-load, WebGL probe, reduced-motion) are
  verified by build (chunk split) + tsc + lint + manual + a runtime check that 3D mode mounts and 2D
  mode ships no Three.js. This is the widest manual surface of any change; the test plan enumerates
  it.
- **`ssr:false` correctness.** If the scene were ever statically imported, the chunk-split guarantee
  breaks silently. The structural no-static-import check is the guard; called out for reviewers as
  the thing most worth verifying.
- **`Should`-tier motion.** `FR-VIZ3D-04/05/06` are `Should`; the core `Must` is boxes + opening +
  cube (`FR-VIZ3D-01/02/03`). Motion/fallback are implemented but are the acceptable cut line if a
  problem surfaces.

## Migration Plan

Additive. `Shell` renders `<Viz3D>` in the existing `mode === '3d'` branch; `lib/calculations.ts`
gains one pure helper; two new components. No archived change, spec, state shape, or dependency list
altered (the R3F deps were installed at scaffold). No data migration (`BC-PRIVACY-01`).

## Open Questions

- None blocking. High room counts (`NFR-PERF-03`) are guarded by the same validated bounds (rooms
  are few in practice); if a cap is ever needed it is an additive guard in the scene, not a rework.
