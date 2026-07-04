# 2D/3D Mode Toggle, Module Visualizer & Golden-Ratio Logo — Design Spec

> Extends the original
> [2026-06-27 apartment module calculator design](2026-06-27-apartment-module-calculator-design.md).
> Source of truth for requirements remains [docs/PDR.md](../../PDR.md); narrative in
> [docs/PRODUCT-BRIEF.md](../../PRODUCT-BRIEF.md).

## Overview

Three additions to the calculator:

1. A **golden-ratio logo** in the header — an SVG mark built from the golden-ratio construction itself.
2. A **2D ⇄ 3D mode toggle** that reshapes the inputs and the visualization.
3. A **Module Visualizer** panel that draws each room to scale and highlights one module
   unit in the accent color, so the architect *sees* the module's size relative to the
   whole room — in 2D (SVG plan) or 3D (orbitable boxes).

These are an **additive comprehension layer**. The existing numeric engine (module
summary, vertical bands, golden split, grid fit, walkway) is unchanged; the visualizer
never edits geometry and nothing is exported. The product remains numbers-first and
read-only — it is still **not** a CAD editor.

**Target user & core value** are unchanged from the original spec.

## Decisions

- **Positioning:** additive. Keep the numbers-first core; the visualizer is a supporting
  panel. The original "never geometry or drawings" non-goal and `BC-VALUE-01` ("minimal
  visuals") are reworded to permit *read-only, non-editable* visualization (no editing,
  no export).
- **3D tech:** `@react-three/fiber` + `@react-three/drei`, **dynamically imported** so
  Three.js never loads in 2D mode or on first paint. 2D stays pure SVG (no new dep).
- **2D module:** derived from room dimensions via `suggestModule2D` (GCD of all room
  length/width values, snapped to a standard module) — same shape as the height-based
  `suggestModule`.
- **Default mode:** 3D — it maps to today's flow (ceiling + opening + rooms) and keeps
  the full result set.
- **Mode state:** in-memory React state only — no persistence (honors `BC-PRIVACY-01`).
- **Rooms are shown for scale, not laid out as a floor plan** — no walls, adjacency, or
  drag-and-drop. That would be CAD and is out of scope.

## Architecture (delta)

New files; existing files unchanged unless noted.

```text
src/
├── components/
│   ├── Calculator.tsx        # +mode state ('2d' | '3d'); gates inputs/results by mode
│   ├── ApartmentForm.tsx     # height fields hidden in 2D; opening height now optional
│   ├── ModeToggle.tsx        # NEW — segmented 2D / 3D control
│   ├── ResultsPanel.tsx      # +renders the visualizer; hides vertical bands in 2D
│   ├── ModuleVisualizer2D.tsx# NEW — SVG plan view + module-cell highlight
│   ├── ModuleVisualizer3D.tsx# NEW — dynamic()-imported r3f canvas
│   └── Logo.tsx              # NEW — golden-ratio SVG mark
├── lib/
│   ├── calculations.ts       # +suggestModule2D; +visualizer geometry helpers
│   └── viz.ts                # NEW — pure scaling/layout math for both visualizers
└── (app/layout.tsx)          # logo in header; favicon
```

**`'use client'` boundary:** still only `Calculator.tsx`. `ModuleVisualizer3D` is
client-only and lazy via `next/dynamic({ ssr: false })`.

**Data flow:** unchanged — `Calculator` owns state; pure functions in `calculations.ts`
/ `viz.ts` derive everything; results flow down as props; no effects, no async math.

## Input model by mode (capability `mode-toggle`)

| Field | 2D | 3D |
|---|---|---|
| Ceiling height (mm) | hidden | shown, 2000–5000, default 2800 |
| Opening height (mm) | hidden | **optional**, 1800–ceiling; blank → no opening marker |
| Per-room length / width (mm) | shown, 500–15000 | shown, 500–15000 |
| Module (mm) | suggested from rooms | suggested from heights |

Switching modes preserves shared state (rooms, names, length/width, selected module);
only height fields and the active visualizer change. (`FR-MODE-01..04`)

## Calculation engine additions (`calculations.ts`)

### 2D module (capability `module-2d`)

```ts
// Apartment-level: one module across all rooms (consistent with FR-MODULE-02).
// rawGcd = gcd over every room's length AND width. Single room → gcd(length, width).
suggestModule2D(rooms: Room[]): ModuleSuggestion   // same shape as suggestModule
```

- `suggested` = `rawGcd` snapped to nearest `STANDARD_MODULES`; `alternatives` +
  `residual` exactly as the height path.
- The active module (user-overridable, defaulting to `suggested`) drives golden split,
  grid fit, and the visualizer — never the raw GCD. (`FR-MODULE2D-01..02`)

### Visualizer geometry (`viz.ts`)

Pure, framework-free, unit-tested independently of any canvas/DOM:

```ts
// Module cells across a room dimension, plus the partial edge strip.
moduleGridForRoom(length: number, width: number, m: number):
  { cols: number; rows: number; cellRemainderX: number; cellRemainderY: number }

// Scale real mm to a target viewport box, preserving aspect ratio.
scaleToViewport(dims: number[], box: { w: number; h: number }): number  // scale factor
```

These reuse the existing grid-fit semantics (nearest, signed remainder).

## 2D visualizer (capability `viz-2d`)

Pure **SVG**, `viewBox`-based and width-responsive (same approach as the vertical-band
diagram).

- One **plan rectangle per room** (length × width to scale), laid out in a simple
  row/wrap — not a floor-plan layout.
- A faint **module grid** (M × M) tiles each room; the **signed grid remainder** shows
  as a thin partial strip at the far edge.
- **One module cell highlighted in the accent color** — the literal "highlight the
  module relative to the apartment."
- **Animation:** grid lines draw in and the highlighted cell pulses (CSS
  keyframes/transitions); on input change, rects/grid tween to new dimensions. Honors
  `prefers-reduced-motion` (snaps instead of animating). (`FR-VIZ2D-01..05`)

## 3D visualizer (capability `viz-3d`)

`@react-three/fiber` + `@react-three/drei`, dynamically imported (`ssr: false`).

- One **box per room** (length × width × ceiling height), scaled, arranged along an axis
  for scale comparison.
- The **opening height**, when provided, renders as a marked band/plane on a wall face;
  omitted when blank.
- **One module unit highlighted in the accent color** — an M × M × M cube seated in the
  room volume — showing module-vs-volume scale.
- **OrbitControls** (rotate/zoom/pan); gentle auto-rotate + float/pulse on the highlight;
  rooms fade in on mount. `prefers-reduced-motion` disables auto-rotate and pulsing.
- A lightweight loading state shows while the Three chunk loads.
- **WebGL unavailable →** graceful message and fall back to the 2D visualizer.
  (`FR-VIZ3D-01..06`)

## Golden-ratio logo (capability `brand`)

- SVG mark constructed from the golden ratio: nested golden rectangles subdivided φ:1
  with the Fibonacci/golden-spiral arc sweeping through them.
- Drawn in the single accent color via `currentColor`; transparent ground; works in
  light/dark; scales to a favicon. No raster assets, no new deps.
- Placed left of the title in the header. (`FR-LOGO-01`)

## Per-mode result adaptation

| Result block | 2D | 3D |
|---|---|---|
| Module summary | from `suggestModule2D` | from `suggestModule` (today) |
| Vertical bands | hidden (no heights) | shown (today) |
| Golden split / grid fit / walkway | shown | shown |
| Visualizer | 2D SVG | 3D canvas |

Nothing is removed from the engine; mode only gates which blocks render and which module
source feeds the summary.

## Testing

- `suggestModule2D` gets the same normal / boundary / edge coverage as `suggestModule`
  (`NFR-TEST-01`): single room, multiple rooms, coprime dims (`rawGcd = 1`), all-equal
  dims, snap residuals.
- `viz.ts` geometry (grid counts, signed remainders, scale factor) is unit-tested
  separately from any canvas.
- Visualizer components are thin renderers over pure derivations; the math is tested, the
  canvas is not.

## Non-functional

- **`NFR-BUNDLE-01`:** the Three.js chunk is lazy-loaded; the 2D path and first paint
  carry no 3D dependency.
- **`NFR-PERF-03`:** 2D recompute/redraw stays within the existing < 16 ms budget;
  3D targets a smooth interactive frame rate and is capped/guarded at high room counts
  (treated like the band-count concern).
- **Accessibility:** the mode toggle is keyboard-operable with a clear selected state;
  the visualizer is decorative-supplementary, so numeric results remain the accessible
  source of truth; reduced-motion respected.

## Edge cases

| Scenario | Expected behavior |
|---|---|
| No rooms entered yet | Visualizer shows an empty/placeholder state; results gated as today |
| 3D mode, opening height blank | No opening marker; everything else renders |
| `prefers-reduced-motion` | Animations snap; 3D auto-rotate/pulse disabled |
| WebGL unavailable | Message + automatic 2D fallback |
| Many rooms in 3D | Layout caps/guards to keep frame rate acceptable |
| Switching 2D→3D | Shared state preserved; height fields reappear with defaults |

## What's NOT in scope

- No floor-plan layout (walls, adjacency, drag-and-drop) — rooms shown for scale only.
- No export of the visualization (image/GLTF) — still no export of any kind.
- No persistence of mode or camera state.
- No new units, no localisation beyond UA + EN.
