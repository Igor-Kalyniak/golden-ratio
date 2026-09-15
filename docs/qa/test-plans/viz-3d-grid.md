# Manual Test Plan — `viz-3d-grid`

> Written at the QA stage of the `ship-capability` loop. Prioritizes the aspects with **no automated
> coverage** — the R3F canvas render of the faint M³ **lattice** and the signed **remainder slabs**,
> the single-accent-cube read they must preserve, the per-room **lattice cap** for tiny modules, and
> the inherited WebGL-off fallback + reduced-motion. The **grid math** — the per-axis signed
> remainders (`dim − floor(dim/m)·m`) and the shared interior-line rule (`interiorModuleLines`) — is
> automated in `lib/calculations.test.ts` (`layoutRoom3D` + `interiorModuleLines`, 107/107 green,
> incl. 8 new tests: 3 remainder + 5 interior-line). The WebGL/canvas facts are structural with no
> React/WebGL/visual runner (ADR-0001), so they are verified manually here (and, for the bundle, by
> grep + the production build chunk split).

- **Change:** `viz-3d-grid`
- **Owned requirement ID:** `FR-VIZ3D-07`
- **Re-verified (owned elsewhere):** `NFR-BUNDLE-01`, `TC-STACK-04` (viz-3d) · `NFR-PERF-03`
  (viz-2d/viz-3d) · `NFR-A11Y-03` (viz-3d/mode-toggle) · `BC-VALUE-01` (viz-2d)
- **Last updated:** `2026-07-04T01:20:00+03:00`
- **Source of truth:** [openspec/changes/viz-3d-grid/specs/viz-3d-grid/spec.md](../../../openspec/changes/viz-3d-grid/specs/viz-3d-grid/spec.md)
  (six scenarios) / [design.md](../../../openspec/changes/viz-3d-grid/design.md);
  [docs/PDR.md](../../PDR.md) L177 (FR-VIZ3D-07), mirroring FR-VIZ2D-02 (L162) in 3D;
  [docs/DESIGN.md](../../DESIGN.md) §7 (read-only visualizer).

## Preconditions (all cases)

- App running via `npm run dev`; browser at the local URL.
- Mode toggle in **3D** (the default state). In 3D the ceiling/opening fields and the vertical band
  diagram are shown, and the 3D visualizer renders below the results once the Three.js chunk loads.
- Default rooms are valid, so the 3D canvas renders on entering 3D. WebGL is available in the test
  browser unless a case says to disable it.
- Compare side-by-side with the **2D visualizer** (switch to 2D) where a case calls for parity — the
  3D lattice + remainder slabs are the 3D analogue of the 2D M × M grid + `--warn-bg` edge strip.

## Cases

### TC-1 — Faint M³ lattice tiles each box on the module step  (FR-VIZ3D-07)

- **Automated (support):** the interior-line rule and per-axis cell counts are pinned by
  `lib/calculations.test.ts::"interiorModuleLines: exact fit drops the coincident far-edge line"`
  (3000/600 → [600,1200,1800,2400]),
  `::"interiorModuleLines: count parity with layoutRoom3D per-axis cells"` (line count = floor(dim/m)
  per axis); the canvas render is manual (ADR-0001).
- **Steps:**
  1. On a rendered room box, confirm a **faint neutral lattice** subdivides the box into **whole
     M-sized cells** along each visible axis — drawn on the **floor** (the 2D plan grid) and the two
     **corner wall faces** (front + left), so the "how many modules fit" story reads the same way it
     does in 2D.
  2. Count the interior divisions on the floor against `floor(length/m)` × `floor(width/m)`. For the
     default worked example (4200 × 3500, M = 700) the floor should read **6 × 5** whole cells; the
     front wall should tile **6 wide × floor(2800/700) = 4 high**.
  3. Confirm the lattice is **faint** (a thin neutral line, consistent with the existing `#5a6474`
     wireframe / 2D `--line` token) — it reads as a guide grid, **not** chrome, and does **not**
     compete with the accent cube.
  4. **Parity check:** switch to **2D** and confirm the same room's M × M grid shows the same
     whole-cell division (6 × 5) — the two visualizers agree because both consume the shared,
     tested `interiorModuleLines` rule.
- **Expected:** a faint M-step lattice tiling floor + two corner walls, whole-cell counts equal to
  `floor(dim/m)` per axis, matching the 2D grid under one shared scale.
- **Result:** `pass` — the interior-line count rule + per-axis parity are automated
  (`interiorModuleLines`, `layoutRoom3D`); the `<lineSegments>` canvas render is manual (ADR-0001),
  verified by code inspection (`components/Viz3DScene.tsx` `buildLatticeSegments` +
  `interiorModuleLines` feed) + all 3 reviewers clean.

### TC-2 — Signed remainder slabs on off-grid far faces; none on exact fit  (FR-VIZ3D-07)

- **Automated:** `lib/calculations.test.ts::"layoutRoom3D: off-grid dims surface signed remainder per
  axis (FR-VIZ3D-07)"` (3700/2500/2900 @ 600 → 100/100/500),
  `::"layoutRoom3D: even dims → zero remainder on every axis (FR-VIZ3D-07)"`,
  `::"layoutRoom3D: length/width remainders match layoutRoom2D strips (parity, FR-VIZ3D-07)"`.
- **Steps:**
  1. **Off-grid → slab appears.** Set a room whose dimensions are **not** exact multiples of M (e.g.
     3700 × 2500 at ceiling 2900 with M = 600 → leftovers 100 / 100 / 500). Confirm a **thin partial
     slab** in the **warn tone** (distinct from the accent cube) renders on the **far face** of each
     axis with a nonzero remainder — the 3D analogue of the 2D `--warn-bg` far-edge strip. Confirm
     the slab thickness is **proportional to the leftover** (the 500 mm height leftover is a visibly
     thicker slab than the 100 mm ones) under the shared scale.
  2. **Exact fit → no slab.** Set a room that divides evenly (e.g. 4200 × 3500 at ceiling 2800, M =
     700 → 6 × 5 × 4 exact). Confirm **no** remainder slab renders on **any** face — the box is
     cleanly tiled.
  3. **Parity check:** for the off-grid room, switch to **2D** and confirm the far-edge `--warn-bg`
     strip on length/width matches the 3D slab (same leftover) — the tested parity assertion made
     visible.
- **Expected:** a warn-tone partial slab on each off-grid far face, sized to the signed leftover;
  no slab on any evenly-divisible axis.
- **Result:** `pass` — the per-axis signed remainders (and 2D-strip parity) are fully automated; the
  `<mesh>` slab render gated on `rem > EPS` is manual (ADR-0001), verified by code inspection
  (`Viz3DScene.tsx` `remL`/`remW`/`remH` → boxGeometry, `REMAINDER_COLOR` `#d97706`) + all 3
  reviewers clean.

### TC-3 — Exactly one accent element preserved; lattice/slabs stay faint  (FR-VIZ3D-07, FR-VIZ3D-03)

- **Steps:**
  1. On any rendered box, confirm the **single highlighted M³ cube** remains the **only saturated
     accent element** — the newly added lattice (faint neutral) and remainder slabs (translucent
     warn tone, opacity ~0.16) do **not** read as accent and do **not** introduce a second focal
     point. FR-VIZ3D-03's "exactly one highlighted" still holds.
  2. Toggle **dark mode** and confirm the cube still re-samples the resolved blue `var(--accent)`
     (inherited from viz-3d) while the lattice/slabs stay neutral/warn in both themes.
- **Expected:** exactly one accent cube; the lattice and slabs are visibly subordinate guide
  geometry, not a competing accent.
- **Result:** `pass` — manual/visual (ADR-0001). Lattice `lineBasicMaterial` opacity 0.4 neutral +
  slab `meshBasicMaterial` opacity 0.16 warn are subordinate by construction; verified by code
  inspection + all 3 reviewers clean (spec-auditor confirmed FR-VIZ3D-03 preserved).

### TC-4 — Lattice cap for tiny-module rooms; read-only; inherited fallback/reduced-motion  (FR-VIZ3D-07, NFR-PERF-03, BC-VALUE-01, NFR-A11Y-03, FR-VIZ3D-06, FR-VIZ3D-05)

- **Automated (support):** the per-room division count that the cap gates on is
  `interiorModuleLines(...).length` per axis (pinned by the count-parity test); the `> 40` cutoff
  itself (`MAX_LATTICE_DIVISIONS`) is a render-time guard, verified by code inspection.
- **Steps:**
  1. **Cap engages (NFR-PERF-03).** Set a room with a **large dimension and a small module** so the
     summed interior divisions exceed the cap (e.g. a 15000 × 15000 room while the active module is
     small — `xs.length + ys.length + zs.length > MAX_LATTICE_DIVISIONS = 40`). Confirm the **faint
     lattice is skipped** (degrades gracefully) while the **box, wireframe, remainder slabs, and the
     highlighted cube still render** — the scene never emits unbounded line geometry.
  2. **Below the cap the lattice returns.** Reduce to a normal room / larger module and confirm the
     lattice reappears — the cutoff is not a permanent off switch.
  3. **Read-only (BC-VALUE-01, NFR-A11Y-03).** Confirm the lattice and slabs expose **no handler**
     that edits geometry and **no export/download** control — they are static comprehension geometry;
     the **numeric results remain the accessible source of truth** (camera controls only).
  4. **WebGL-off fallback (FR-VIZ3D-06, inherited).** Disable WebGL (Chrome `chrome://flags`, or
     devtools block the WebGL context). Reload in 3D. Confirm the app falls back to the localized
     `webgl` message + the pure-SVG **`Viz2D`** (which shows the 2D grid + strip) rather than failing
     — the lattice is confined to the 3D chunk and never blocks the fallback.
  5. **Reduced-motion (FR-VIZ3D-05, inherited).** Enable `prefers-reduced-motion: reduce`. Confirm
     the lattice adds **no animation** (it is static geometry) — the only idle motion remains the
     inherited auto-rotate/float, which stays suppressed under reduced-motion.
- **Expected:** the lattice degrades past the cap while box/cube/slabs persist; nothing is editable
  or exportable; WebGL-off falls back to Viz2D; the lattice introduces no new motion.
- **Result:** `pass` — STRUCTURAL / manual (ADR-0001). The cap (`buildLatticeSegments` returns null
  when `xs+ys+zs > 40`), the read-only posture (no edit/export handler), and the framework-free helper
  (grep: `components/Viz3DScene.tsx` is the SOLE `@react-three`/`three` importer, reached only via
  `next/dynamic({ ssr:false })` — NFR-BUNDLE-01 / TC-STACK-04 re-verified) were confirmed by code
  inspection + the production build chunk split + all 3 fresh Checkers clean (security-reviewer
  confirmed no injection sink, no new deps/lockfile change). The WebGL fallback + reduced-motion are
  inherited unchanged from `viz-3d`.
