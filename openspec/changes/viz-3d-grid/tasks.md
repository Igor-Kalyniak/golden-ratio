## 1. Engine — per-axis remainders (pure, tested)

- [ ] 1.1 Extend `Room3DLayout` in [lib/calculations.ts](../../../lib/calculations.ts) with
  `lengthRemainder`, `widthRemainder`, `heightRemainder` (`dim − floor(dim/m)·m`), documented as the
  3D analogue of `layoutRoom2D`'s `rightStrip`/`bottomStrip`.
- [ ] 1.2 Populate the three fields in `layoutRoom3D` (keeping `cols/rows/layers` and all existing
  fields unchanged); no `@react-three/*`/`three` import (`NFR-BUNDLE-01`).
- [ ] 1.3 Add unit tests in [lib/calculations.test.ts](../../../lib/calculations.test.ts): even dims →
  0 remainder; off-grid dims (e.g. 3700 @ 600 → 100) → expected signed leftover; parity with
  `layoutRoom2D`'s strips on the length/width axes; ceiling remainder on the height axis.

## 2. Scene — lattice + remainder slabs

- [ ] 2.1 In [components/Viz3DScene.tsx](../../../components/Viz3DScene.tsx) `RoomBox`, draw a faint
  M-step lattice from the existing scene extents (`w`/`h`/`d`) and `step = m*scale` — interior guide
  lines only (strict `< bound` filter, matching `Viz2D`), a faint neutral material consistent with
  the existing wireframe (`FR-VIZ3D-07`).
- [ ] 2.2 Render the signed remainder as thin partial slabs on the far faces for each axis whose
  remainder > 0, using a warn-token color distinct from the accent cube (the 3D analogue of `Viz2D`'s
  `--warn-bg` strips); zero remainder → no slab.
- [ ] 2.3 Keep exactly one accent element (the existing highlighted M³ cube); the lattice/slabs are
  faint/neutral so `FR-VIZ3D-03` still holds. Read-only — no handlers, no export (`BC-VALUE-01`).
- [ ] 2.4 Cap the lattice line count: past a documented per-scene threshold, skip/degrade the lattice
  so geometry stays bounded (`NFR-PERF-03`); box, cube, and remainder slabs always render.

## 3. Requirement + docs

- [ ] 3.1 Add **`FR-VIZ3D-07`** to the 3D-visualizer table in [docs/PDR.md](../../../docs/PDR.md)
  (mirroring `FR-VIZ2D-02` in 3D: "A faint M³ module lattice tiles each room box; the signed grid
  remainder reads as a thin partial slab on the far faces"), status `proposed`.

## 4. Verify

- [ ] 4.1 `npm run lint` clean; `node --test lib/*.test.ts` green (new remainder tests included).
- [ ] 4.2 `npm run build` succeeds and the production chunk split still isolates `@react-three`/`three`
  to the lazy `Viz3DScene` chunk — `@react-three`/`three` imported **only** in `Viz3DScene.tsx`
  (`NFR-BUNDLE-01`, `TC-STACK-04` re-verified).
- [ ] 4.3 Runtime-check 3D mode: the lattice tiles each box on the M step, remainder slabs show on
  off-grid far faces, the single accent cube still reads, WebGL-off still falls back to `Viz2D`
  (inherited).
