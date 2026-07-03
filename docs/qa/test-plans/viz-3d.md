# Manual Test Plan — `viz-3d`

> Written/refreshed at the QA stage of the `ship-capability` loop. Prioritizes requirements with
> **no automated coverage** — the R3F canvas render + single-axis layout (FR-VIZ3D-01), the orbit +
> idle motion + reduced-motion (FR-VIZ3D-04/05), the WebGL-unavailable fallback (FR-VIZ3D-06), the
> accessible/supplementary posture (NFR-A11Y-03), and above all the **bundle discipline**
> (NFR-BUNDLE-01 / TC-STACK-04) and the 3D frame budget (NFR-PERF-03). The **layout math** —
> box extents, floor-based cols/rows/layers, the single corner cube, and `openingY` — is automated
> in `lib/calculations.test.ts` (`layoutRoom3D`, 99/99 green); the WebGL/canvas/animation/bundle
> facts are structural with no React/WebGL/visual/bundle runner (ADR-0001), so they are verified
> manually here (and, for the bundle, by grep + the production build chunk split).

- **Change:** `viz-3d`
- **Owned requirement IDs:** `FR-VIZ3D-01, FR-VIZ3D-02, FR-VIZ3D-03, FR-VIZ3D-04, FR-VIZ3D-05,
  FR-VIZ3D-06, NFR-BUNDLE-01, NFR-PERF-03, TC-STACK-04, NFR-A11Y-03`
- **Last updated:** `2026-07-03T22:00:00+03:00`
- **Source of truth:** [docs/DESIGN.md](../../DESIGN.md) §7 (read-only visualizer) /
  [docs/superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md](../../superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md);
  [docs/PDR.md](../../PDR.md) L171–176, L219–221, L234.

## Preconditions (all cases)

- App running via `npm run dev`; browser at the local URL.
- Mode toggle in **3D** (the default state, owned by `mode-toggle`). In 3D the ceiling/opening
  fields and the vertical band diagram are shown, and the 3D visualizer renders below the results
  once the Three.js chunk loads.
- Default rooms are valid, so the 3D canvas renders on entering 3D. WebGL is available in the test
  browser unless a case says to disable it.

## Cases

### TC-1 — Per-room boxes to scale in a 3D canvas  (FR-VIZ3D-01)

- **Automated (support):** the box geometry is pinned by
  `lib/calculations.test.ts::"layoutRoom3D: box extents equal the room dimensions"`,
  `::"layoutRoom3D: cols/rows/layers are floor(dim/m)"`; the canvas render + single-axis layout are
  manual (ADR-0001).
- **Steps:**
  1. In 3D, set two rooms to clearly different sizes (e.g. 4200×3500 and 2000×2000 at ceiling 2800).
     Confirm each room is drawn as its **own box** whose length × width × height extents are
     proportional to its dimensions under **one shared scale** (the bigger room is visibly bigger),
     laid out along a **single axis** for scale comparison — not stacked or overlapping.
  2. Confirm the boxes render **only** in 3D (switch to 2D → the 3D canvas is gone and the pure-SVG
     2D visualizer renders instead).
- **Expected:** `n` valid rooms → `n` boxes, each to scale under a shared factor, along one axis;
  present only in 3D.
- **Result:** `pass` — box-extent + shared-scale geometry automated (`layoutRoom3D`); the R3F canvas
  render + single-axis layout are manual (ADR-0001), verified by code inspection + all 3 reviewers.

### TC-2 — Opening band on when provided, off when blank/over-ceiling  (FR-VIZ3D-02)

- **Automated:** `lib/calculations.test.ts::"layoutRoom3D: openingY set for a valid opening"`,
  `::"layoutRoom3D: openingY null when omitted or above the ceiling (FR-VIZ3D-02)"`.
- **Steps:**
  1. With a **valid opening** height set (e.g. 2100 under ceiling 2800), confirm an **accent-colored
     band/plane** renders on a wall face at that height on each room box.
  2. **Clear** the opening field. Confirm the band **disappears** on every box (no plane rendered).
  3. Set the opening **above the ceiling** (e.g. 3000 with ceiling 2800). Confirm **no** band
     renders (and note that this is also caught as invalid apartment input upstream).
- **Expected:** an accent band at the opening height when valid; no band when blank or above the
  ceiling.
- **Result:** `pass` — the `openingY` gate (non-null for valid, null when blank/over-ceiling) is
  fully automated for both scenarios; the band-plane render is manual (ADR-0001). The band samples
  the resolved `var(--accent)` after CR-001 was resolved, so it matches the cube + 2D viz.

### TC-3 — Exactly one highlighted module cube  (FR-VIZ3D-03)

- **Automated:** `lib/calculations.test.ts::"layoutRoom3D: exactly one M³ cube at the room corner"`.
- **Steps:**
  1. On any rendered room box, confirm **precisely one** M×M×M cube is highlighted in the **accent**
     color (not zero, not many), positioned at a **room corner within the box volume**, to convey
     the module's size relative to the room.
  2. **(CR-001 regression check — color)** Confirm the cube's accent color is the **blue** design
     `--accent`, matching the **2D visualizer** and the legend swatch — **not** a stray orange.
     Toggle **dark mode** and confirm the cube re-samples and still matches the resolved `--accent`
     in the dark theme.
  3. **(CR-003 regression check — clamp)** Set a room **smaller than one module** (e.g. 500×500 with
     a larger M). Confirm the cube is **clamped to the box** (`min(w,h,d)`) and does **not** poke
     through the room walls.
- **Expected:** exactly one accent cube at a room corner; color equals the blue `--accent` in both
  themes; clamped inside sub-module rooms.
- **Result:** `pass` — the single-cube contract is automated; the accent-fill render is manual
  (ADR-0001). CR-001 (medium, resolved): the cube now samples the resolved `var(--accent)` via a
  probe re-sampling on theme change, so 3D matches 2D + the legend. CR-003 (low, resolved):
  `cellS = min(m*scale, w, h, d)` clamps the cube inside sub-module rooms.

### TC-4 — Orbit controls; idle motion; reduced-motion; supplementary a11y  (FR-VIZ3D-04, FR-VIZ3D-05, NFR-A11Y-03)

- **Steps:**
  1. **Orbit (FR-VIZ3D-04):** drag on the canvas → the camera **orbits**; scroll/pinch → **zooms**;
     right-drag/two-finger → **pans**. Confirm a gentle **auto-rotate** and a **highlight float** on
     the cube are present. Per the resolved CR-002/SC-001, the **room fade-in on mount is a MAY
     clause intentionally not implemented** — its absence is not a defect.
  2. **Reduced-motion (FR-VIZ3D-05):** enable `prefers-reduced-motion: reduce` (OS setting or
     devtools "Emulate CSS prefers-reduced-motion"). Reload / re-enter 3D. Confirm the **auto-rotate
     and highlight pulse do not play** — the scene is **static until interacted with** (orbit drag
     still works). Note this is driven by `matchMedia`, the correct mechanism for the imperative R3F
     frame loop (not the CSS `globals.css` reset).
  3. **Supplementary a11y (NFR-A11Y-03):** confirm the **numeric results** above remain the complete,
     accessible source of truth — the 3D view adds no information not present numerically, and
     exposes **camera controls only** (no geometry-editing / export). (The keyboard-operable mode
     toggle with a clear selected state is owned + tested by `mode-toggle`.)
- **Expected:** orbit/zoom/pan work; auto-rotate + float by default; both suppressed under
  reduced-motion (scene static, orbit still works); numeric results remain the a11y source of truth.
- **Result:** `pass` — manual/visual (ADR-0001). FR-VIZ3D-04 is a **Should**, met by OrbitControls +
  auto-rotate + highlight float (the fade-in MAY clause is descoped; CR-002/SC-001 resolved by
  removing a dead `group` ref + correcting the wording). FR-VIZ3D-05 reduced-motion via `matchMedia`
  and NFR-A11Y-03's supplementary posture verified by code inspection + all 3 reviewers.

### TC-5 — Loading state, then WebGL-unavailable fallback to 2D  (FR-VIZ3D-05, FR-VIZ3D-06, NFR-A11Y-03)

- **Steps:**
  1. **Loading state (FR-VIZ3D-05):** with the network throttled (devtools "Slow 3G") reload in 3D
     mode. Confirm a **loading placeholder** shows in the visualizer slot **while the ~880K Three.js
     chunk fetches**, then the canvas appears once it loads.
  2. **WebGL-off fallback (FR-VIZ3D-06):** disable WebGL (Chrome: `chrome://flags` → disable WebGL,
     or devtools → block the WebGL context / a browser without it). Reload in 3D mode. Confirm a
     **localized `webgl` message** is shown **and the pure-SVG `Viz2D` visualizer renders in place**
     of the 3D canvas — the app **does not fail / show a blank canvas / throw**.
  3. Confirm **no hydration mismatch** warning in the console on load in either case (the WebGL probe
     via `useSyncExternalStore` returns null on the server and caches its result).
- **Expected:** a loading placeholder during the chunk fetch; when WebGL is unavailable, a localized
  message + the 2D visualizer render instead of failing; no hydration warning.
- **Result:** `pass` — manual (ADR-0001): the async chunk fetch + a real/absent WebGL context need a
  DOM + WebGL the node runner can't provide. Verified by code inspection (`dynamic` ssr:false +
  `loading`; `useSyncExternalStore` WebGL probe → `t('webgl')` message + `Viz2D`) and all 3
  reviewers; security-reviewer confirmed the probe is in-memory only (no fingerprint transmission).

### TC-6 — Bundle discipline: Three.js in a separate chunk, absent from the 2D/first-paint path  (NFR-BUNDLE-01, TC-STACK-04, NFR-PERF-03)

- **Steps:**
  1. **Sole importer (structural):** grep the tree for `@react-three` / `from 'three'`. Confirm the
     only runtime importer is **`components/Viz3DScene.tsx`** (the `import type { Mesh }` there is a
     type-only import erased by `tsc`), and that **`components/Viz3D.tsx`** loads it **only** via
     `dynamic(() => import('./Viz3DScene'), { ssr: false })` — no static 3D import anywhere in the
     `Shell → Viz3D` chain.

     ```
     grep -rn "@react-three\|from 'three'" app components lib   # → only Viz3DScene.tsx
     ```
  2. **Chunk split (build):** run `npm run build` and inspect the output. Confirm Three.js lands in a
     **separate ~880K chunk** that is **absent from the first-load JS** (the 2D path / first paint do
     not pull it in).
  3. **2D path is Three-free (runtime):** in **2D mode** (or on first paint before entering 3D),
     confirm via the devtools Network/coverage panel that **no `@react-three/*` or `three` chunk is
     fetched** — the 3D scene module loads only after switching to 3D with WebGL available.
  4. **No new dependency (TC-STACK-04):** confirm **`package.json` / `package-lock.json` are
     unchanged** by this change (R3F was pre-installed at scaffold), and that **2D rendering stays
     pure SVG** (`Viz2D` imports no 3D code).
  5. **3D frame budget (NFR-PERF-03):** while orbiting a few rooms, confirm interaction stays smooth;
     note that `useFrame` mutates a ref (one `sin` + one assignment per frame, no per-frame
     allocation/`setState`). **Known documented gap:** there is **no explicit room cap** (CR-004 /
     SC-002, low, acknowledged) — validated 500–15000 mm bounds keep rooms few in practice; a hard
     cap is an additive guard deferred to `room-input`/`app-state`.
- **Expected:** Three.js is imported only by `Viz3DScene`, reached only through a `dynamic` ssr:false
  boundary, and ships in a separate chunk absent from the 2D/first-paint bundle; no new dependency;
  2D stays pure SVG; 3D interaction is smooth.
- **Result:** `pass` — STRUCTURAL / build-artifact (ADR-0001), the load-bearing constraint of this
  change. Verified faithful by grep + the production build chunk split + all 3 reviewers + the Maker:
  sole importer, dynamic ssr:false, type-only `three` import erased by tsc, ~880K chunk absent from
  first-load JS, `package.json`/lockfile unchanged. NFR-PERF-03's 3D frame budget is met-by-
  construction (ref-mutating `useFrame`, bounded geometry); the missing room cap is an accepted,
  documented decision, not a blocker.
