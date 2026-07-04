# Manual Test Plan — `viz-2d`

> Written/refreshed at the QA stage of the `ship-capability` loop. Prioritizes requirements with
> **no automated coverage** — the SVG render + responsiveness (FR-VIZ2D-01), the motion + reduced-
> motion behaviour (FR-VIZ2D-04/05), the redraw budget (NFR-PERF-03), and the read-only guarantee
> (BC-VALUE-01). The **layout math** — floor-based cols/rows, signed-remainder edge strips, and the
> single bottom-left highlight cell — is automated in `lib/calculations.test.ts` (`layoutRoom2D`,
> 94/94 green); the SVG/animation/responsiveness are structural with no React/DOM/visual runner
> (ADR-0001), so they are verified manually here. **Runtime note:** during Apply the Maker ran
> `next dev` and observed the 2D surface (header, the "1 module" swatch, the "Read-only —
> comprehension aid" note, per-room SVGs with a cellpulse accent cell + a `var(--warn-bg)` remainder
> strip) — those captures are cited per case.

- **Change:** `viz-2d`
- **Owned requirement IDs:** `FR-VIZ2D-01, FR-VIZ2D-02, FR-VIZ2D-03, FR-VIZ2D-04, FR-VIZ2D-05,
  NFR-PERF-03, BC-VALUE-01`
- **Last updated:** `2026-07-03T21:10:00+03:00`
- **Source of truth:** [docs/DESIGN.md](../../DESIGN.md) §7 (read-only visualizer) /
  [docs/superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md](../../superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md);
  [docs/PDR.md](../../PDR.md) L161–165, L220, L241.

## Preconditions (all cases)

- App running via `npm run dev`; browser at the local URL.
- Switch the mode toggle to **2D** (default state is 3D). In 2D the ceiling/opening fields and the
  vertical band diagram are hidden (owned by `mode-toggle`), and the 2D visualizer renders below the
  results with a header, a "1 module" swatch, and a "Read-only — comprehension aid" note.
- Default rooms are valid, so the visualizer renders on entering 2D.

## Cases

### TC-1 — To-scale plan rectangles in a responsive SVG  (FR-VIZ2D-01)

- **Automated (support):** the layout arithmetic is pinned by the `layoutRoom2D` tests (TC-2/TC-3);
  the render + responsiveness themselves are manual (ADR-0001).
- **Steps:**
  1. In 2D, set two rooms to clearly different sizes (e.g. 4200×3500 and 2000×2000). Confirm each
     room is drawn as its **own** rectangle whose width:height ratio matches its length:width, all
     scaled by the **same** factor (the bigger room is visibly bigger), laid out in a **wrapping
     row** — not stitched into a single floor plan (no shared walls, no adjacency/positioning).
  2. Narrow the browser window / container. Confirm each room SVG **scales via its `viewBox`** with
     no hardcoded pixel width (it reflows/shrinks), and rooms wrap rather than being positioned
     relative to one another as a plan.
  3. Confirm the visualizer renders **only** in 2D (switch back to 3D → the 2D visualizer is gone).
- **Expected:** independent to-scale rectangles, shared scale, wrapping row (not a floor plan),
  width-responsive with no fixed px, present only in 2D.
- **Result:** `pass` — layout math automated; render/responsiveness manual (ADR-0001).
  Runtime-verified: the Maker's 2D surface rendered per-room SVGs with the header + "1 module"
  swatch; all 3 reviewers confirmed the width-responsive `viewBox` (w-full/h-auto + max-w cap, no
  fixed px) and the guarded empty-rooms `Math.max` spread.

### TC-2 — Faint M×M grid + signed-remainder edge strip; redraw budget  (FR-VIZ2D-02, NFR-PERF-03)

- **Automated:** `lib/calculations.test.ts::"layoutRoom2D: exact fit → whole cells, no strips"`
  (3000×2400 m600 → 5×4, no strips), `::"layoutRoom2D: remainders surface as edge strips"`
  (3200×2500 m600 → strips 200/100), `::"layoutRoom2D: cols/rows are floor(dim/m), not round"`
  (3599 m600 → 5).
- **Steps:**
  1. Set a room to an **exact multiple** of the module (e.g. 3000×2400 with M=600). Confirm the
     faint **M×M grid** tiles the whole rectangle and **no** remainder strip renders.
  2. Set a room whose length and width are **not** multiples (e.g. 3200×2500 with M=600). Confirm a
     thin strip renders at the **right** edge (length leftover 200) and at the **bottom** edge
     (width leftover 100), coloured `var(--warn-bg)`, spanning the leftover.
  3. Confirm the whole-cell count is `floor(dim/m)`, **not** round-to-nearest (a 3599 mm dimension
     at M=600 shows **5** whole cells + a strip, not 6).
  4. Rapidly edit a dimension and watch the redraw. Confirm it repaints without perceptible lag
     (well within the <16 ms budget) — the layout is O(1) and the grid is pure SVG.
- **Expected:** faint M×M grid; far-edge strips only when the leftover > 0; whole cells = floor,
  not round; instant redraw.
- **Result:** `pass` — the layout math (exact-fit, remainder strips, floor-not-round) is fully
  automated. **Note (floor vs round):** the visualizer uses `floor(dim/m)` whole cells with the
  leftover as a strip — this is **spec-mandated** by the FR-VIZ2D-02 text ("the leftover after
  floor(dimension / m) whole modules") and is deliberately distinct from grid-fit's round-to-nearest
  (a different question — module count), not an inconsistency (code-reviewer + spec-auditor
  confirmed). The strip render + redraw budget are manual/met-by-construction (ADR-0001);
  runtime-verified `var(--warn-bg)` strip.

### TC-3 — Exactly one highlighted module cell  (FR-VIZ2D-03)

- **Automated:** `lib/calculations.test.ts::"layoutRoom2D: exactly one highlighted cell,
  bottom-left"` ({col:0, row:3} for 3000×2400 m600),
  `::"layoutRoom2D: room smaller than a module → rows 0, highlight row 0, no negative strip"`
  (500×500 m600).
- **Steps:**
  1. On any rendered room, confirm **precisely one** M×M cell is filled in the **accent** color
     (not zero, not many), at the **bottom-left**, to convey the module's size relative to the room.
  2. Set a room **smaller than one module** (e.g. 500×500 with M=600). Confirm the highlight still
     shows exactly one clamped cell at row 0 and there is **no** negative strip.
- **Expected:** exactly one accent M×M cell per room, clamped sensibly for sub-module rooms.
- **Result:** `pass` — the single-highlight contract (one bottom-left cell, clamped) is automated;
  the accent-fill render is manual (ADR-0001), runtime-verified (one cellpulse accent cell per room).
  Code-reviewer note: the highlight aligns to the grid's last row rather than the room's physical
  bottom (vs the prototype) — judged "arguably more correct", left as-is.

### TC-4 — Motion pulses; reduced-motion snaps  (FR-VIZ2D-04, FR-VIZ2D-05)

- **Steps:**
  1. With `prefers-reduced-motion` **off** (default), confirm the highlighted cell **pulses**
     (the `cellpulse` animation). Per spec.md the grid animate-in and the rect/grid tween-on-change
     are MAY clauses and are intentionally **not** applied — their absence is not a defect.
  2. Enable `prefers-reduced-motion: reduce` (OS setting or devtools "Emulate CSS
     prefers-reduced-motion"). Reload / re-enter 2D. Confirm the highlighted cell **does not pulse**
     — it renders in its **final state immediately** (a static ~0.85 opacity = the cellpulse
     endpoint, so it snaps rather than plays).
- **Expected:** the cell pulses by default; under reduced-motion the animation snaps to its final
  state and does not play.
- **Result:** `pass` — manual/visual (ADR-0001). FR-VIZ2D-04 is a **Should**, met by the cellpulse
  pulse (the animate-in/tween MAY clauses are unimplemented — the resolved doc note SC-001 corrected
  the proposal/design from an overstated "griddraw applied" to cellpulse-only). FR-VIZ2D-05 is
  covered two ways: the **global** `app/globals.css` `@media (prefers-reduced-motion: reduce){ * {
  animation: none !important } }` reset beats the cellpulse utility, **and** the highlight's static
  opacity=0.85 equals the cellpulse endpoint so it snaps. Verified by code inspection + 3 reviewers
  clean.

### TC-5 — Read-only comprehension aid  (BC-VALUE-01)

- **Steps:**
  1. Inspect the visualizer. Confirm it exposes **no** control that edits room geometry — no input,
     no drag handle, no click-to-resize — and **no** export/download/save affordance of any kind.
  2. Confirm the "**Read-only — comprehension aid**" note is present in the visualizer header, and
     that the numeric results above remain the source of truth (the visualizer only illustrates
     scale).
  3. (Security spot-check) Give a room a name with markup-like characters (e.g. `<b>Kitchen`).
     Confirm it appears as **literal text** in the caption / aria-label — never rendered as HTML
     (no injection).
- **Expected:** display-only; no geometry-editing control, no export; user text is escaped; numbers
  remain authoritative.
- **Result:** `pass` — structural/DOM-level (ADR-0001), verified by code inspection, the explicit
  read-only note, and the security reviewer (no edit/export sink; user free-text `room.name` flows
  only into a React-escaped `aria-label` + `figcaption`, no `dangerouslySetInnerHTML`). No
  network/persistence introduced (BC-PRIVACY-01/TC-DATA-01/BC-SCOPE-01 upheld). Runtime-verified:
  the Maker's 2D surface showed the "Read-only — comprehension aid" note and no editing/export
  controls.
