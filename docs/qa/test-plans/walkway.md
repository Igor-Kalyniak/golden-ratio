# Manual Test Plan — `walkway`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix). The pure
> engine is automated in `lib/calculations.test.ts` (`computeWalkways`/`rateWalkway` at the
> worked-example widths + threshold boundaries, and the new `walkwayMeterBars` 3/2/1 helper); the
> walkway **block rendering** — the three preset rows, the mm-clearance display, the 3-bar meter, the
> colored rating label, and the localized guidance sentence — is DOM-level with no
> React/DOM/visual runner (ADR-0001), so it is verified manually here.

- **Change:** `walkway`
- **Owned requirement IDs:** `FR-WALK-01, FR-WALK-02, FR-WALK-03, FR-WALK-04, BC-WALK-01`
- **Last updated:** `2026-07-03T18:00:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §6.3 (Per-room cards). Corridor
  dimension is the **room width**; the three furniture presets are wardrobe/kitchen **600**,
  sofa/bed centre **900**, and between facing 600 units **1200** (`FURNITURE_DEPTHS`). A 3500 mm-wide
  room clears all three comfortably (2900 / 2600 / 2300 mm).

## Scope note

This change adds the **third and final block** inside each per-room result card — the walkway block,
below the grid-fit block (`PerRoomResults` renders `<WalkwayBlock room={room} />` after
`<GridFitBlock>`, still inside the `showResults` gate). It shows three furniture-preset rows; each
row shows the furniture label, the available clearance (`room.width − depth`) in mm, a 3-bar meter
filled by rating (comfortable 3 / acceptable 2 / tight 1), a colored text rating label, and a
localized guidance sentence. Adding this block **completes the per-room card and Epic A**.

The pure math lives in `lib/calculations.ts`: `computeWalkways(roomWidth, furnitureDepth,
oppositeDepth?)` and `rateWalkway` (shipped and unit-tested in change 1, reused unchanged) plus the
new pure helper `walkwayMeterBars(rating)` → `1 | 2 | 3`. `WalkwayBlock.tsx` is presentational only.
No new i18n keys were added (the 12 walkway keys — `walkway`, `comfortable`, `acceptable`, `tight`,
`wardrobe`, `sofa`, `facing`, `recComf`, `recAcc`, `recTight`, plus the shared numeric labels — are
present in EN + UA with parity, `locales/en.json:76-87` / `locales/ua.json:76-87`). The
`oppositeDepth` third argument is intentionally **not wired** into the block (Could / out-of-scope);
the block uses the two-arg preset form only. The 2D/3D mode toggle (13) is out of scope.

### Fixed-mm note (FR-WALK-03 / BC-WALK-01) — read before running TC-2

Walkway comfort is an **absolute human dimension** and its ratings are pinned to **fixed mm
thresholds** that **never scale with the module M**:

- `available ≥ 900` mm ⇒ **comfortable**
- `available ≥ 600` mm ⇒ **acceptable**
- `available < 600` mm ⇒ **tight**

`WalkwayBlock` deliberately takes **no `module` prop** — there is no code path by which M could reach
a rating. Changing the module must leave every walkway rating unchanged. Confirm this in TC-2.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: ceiling 2800, opening 2100, module suggestion 700, one
  room 3000 × 2400), so the results region shows on first load and the per-room cards render, each
  with a walkway block below the grid-fit block. Automated coverage runs via `node --test
  lib/*.test.ts` (77/77 green).
- To reproduce the DESIGN §6.3 worked example, set the module to **700** and add a room **Living
  4200 × 3500** (width 3500). A room with width **1000** exercises the negative-clearance facing
  case.

## Cases

### TC-1 — Three preset rows and clearance = width − depth  (VALUES AUTOMATED; render manual)

- **Requirement(s):** `FR-WALK-01`, `FR-WALK-02`, `FR-WALK-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeWalkways: worked-example ratings"`
  (3500−600=2900), `"walkway preset rows: a 3500-wide room clears all three presets comfortably"`
  (3500−600=2900, 3500−900=2600, 3500−1200=2300, all comfortable),
  `"computeWalkways: opposite depth subtracted"` (three-arg form, not wired into the block). Run
  `node --test lib/calculations.test.ts`.
- **Preconditions:** Fresh load (EN), module 700, a room with width 3500 (e.g. Living 4200 × 3500).
- **Steps (manual confirmation of the rendered block):**
  1. On the room card's walkway block, confirm **exactly three rows** render, labelled `Past
     wardrobe / kitchen (600)`, `Centre past sofa / bed (900)`, and `Between facing 600 units` — the
     three `FURNITURE_DEPTHS` presets (600 / 900 / 1200).
  2. Confirm each row's clearance reads `room.width − depth` in mono mm: **`2900 mm`** (3500−600),
     **`2600 mm`** (3500−900), **`2300 mm`** (3500−1200).
  3. Confirm the corridor dimension is the **width**, not the length (a 4200 × 3500 room uses 3500).
- **Expected result:** Three preset rows over depths 600 / 900 / 1200; each shows the available
  clearance = room width − preset depth in mm. The worked-example numbers match §6.3.
- **Result:** `pass` — the three preset clearances (2900 / 2600 / 2300) are automated; the row layout
  and the mm-clearance render are manual (ADR-0001).

### TC-2 — Fixed-mm ratings, decoupled from the module  (LOGIC AUTOMATED; module-independence structural)

- **Requirement(s):** `FR-WALK-03`, `BC-WALK-01`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeWalkways: thresholds are fixed mm,
  independent of module"` (`rateWalkway` 899→acceptable, 900→comfortable, 599→tight, 600→acceptable
  — pinned at the exact ≥900 / ≥600 boundaries with **no module argument**), `"computeWalkways:
  worked-example ratings"` (600 → acceptable, 300 → tight). **Read the fixed-mm note above first.**
- **Preconditions:** Fresh load (EN), module 700, a room where the ratings span the tiers — e.g. a
  room width **1500** (600 → acceptable at the sofa preset, 300 → tight at the facing preset).
- **Steps:**
  1. On a 1500-wide room, confirm the sofa row (900) reads **`600 mm`** rated **`acceptable`**
     (exactly the ≥ 600 boundary, inclusive) and the facing row (1200) reads **`300 mm`** rated
     **`tight`** (< 600).
  2. **Module-independence (the BC-WALK-01 crux):** change the active module from **700** to
     **350** (edit the module select / heights so the suggestion changes). Confirm **every walkway
     rating and clearance for that room is unchanged** — the mm numbers and the ratings do not move.
     The block takes no module prop, so M cannot reach a rating.
  3. Confirm a comfortable clearance (e.g. the 3500-wide room's 2900 mm) stays `comfortable` before
     and after the module change.
- **Expected result:** Ratings follow the fixed thresholds (≥ 900 comfortable, ≥ 600 acceptable,
  < 600 tight); changing the module changes **nothing** about any walkway row.
- **Result:** `pass` — the threshold boundaries are automated at 899/900/599/600 and the
  module-independence test pins the rating with no module argument; the module-swap observation is
  manual (ADR-0001) but holds by construction (WalkwayBlock has no module prop — confirmed by all 3
  reviewers).

### TC-3 — Rating meter fills by rating (3 / 2 / 1 bars)  (COUNT AUTOMATED; meter render manual)

- **Requirement(s):** `FR-WALK-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"walkwayMeterBars: comfortable 3, acceptable
  2, tight 1"` (the shared meter-fill definition, so the meter cannot drift from the rating).
- **Preconditions:** Fresh load (EN), rooms exercising all three ratings (3500-wide → comfortable
  rows; 1500-wide → an acceptable + a tight row).
- **Steps:**
  1. On a **comfortable** row, confirm the meter shows **3 filled bars** (all three use the
     `bg-good` fill).
  2. On an **acceptable** row (1500-wide, sofa preset, 600 mm), confirm **2 filled bars** (2 filled +
     1 `bg-line2` unfilled, warn color).
  3. On a **tight** row (1500-wide, facing preset, 300 mm), confirm **1 filled bar** (1 filled + 2
     unfilled, err color).
  4. Confirm the meter is `aria-hidden` (decorative) — the rating state is also carried by the text
     label (TC-4), so a screen reader is not asked to interpret the bars.
- **Expected result:** The meter fill count matches the rating (comfortable 3, acceptable 2, tight 1)
  and the meter is decorative (`aria-hidden`), never the sole carrier of meaning.
- **Result:** `pass` — `walkwayMeterBars` 3/2/1 is automated; the 3-bar render and the filled/unfilled
  split are manual (ADR-0001).

### TC-4 — Colored rating label + localized guidance, not color alone  (MANUAL — no a11y runner)

- **Requirement(s):** `FR-WALK-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeWalkways: recommendation is a
  locale-independent key, not English prose"` (`walkway.comfortable` / `.acceptable` / `.tight`) pins
  the engine's recommendation **key**; the key → localized-sentence mapping (`recComf` / `recAcc` /
  `recTight`) and the colored label are DOM-level with no a11y/visual runner (ADR-0001). The
  `RATING_META` / `RECOMMENDATION_I18N` structure is verified by code inspection
  (`WalkwayBlock.tsx:25-36,69,72`) and all three reviewers (clean).
- **Preconditions:** Fresh load, rooms exercising all three ratings; a screen reader available
  (VoiceOver on macOS).
- **Steps:**
  1. On each row, confirm a **text rating label** renders (`comfortable` / `acceptable` / `tight`)
     next to the meter, colored with the status token (good / warn / err) — the meaning is carried by
     the **label + meter**, not color alone (`FR-WALK-04`, DESIGN §6.3).
  2. Confirm the row's **guidance sentence** renders below it and matches the rating: comfortable →
     `Comfortable two-way passing.` (`recComf`), acceptable → `One person passes; furniture doors
     limited.` (`recAcc`), tight → `Below ergonomic minimum — reconsider layout.` (`recTight`).
  3. Confirm the labels use the **status tokens** (good / warn / err text), not the faint/accent
     tokens — legible in both **light and dark** themes. Toggle the theme and re-check.
  4. **Localization:** toggle the language pill to **UA** and confirm the block localizes — section
     label `Прохід`, ratings `комфортно` / `прийнятно` / `тісно`, preset labels `Повз шафу / кухню
     (600)` / `По центру повз диван / ліжко (900)` / `Між двома блоками 600`, and the guidance
     sentences (`Комфортний двосторонній прохід.` etc.). The mm numbers stay fixed and
     locale-independent.
- **Expected result:** The rating is distinguishable without color (colored **text label** + meter);
  the guidance sentence is resolved from the engine's locale-independent recommendation key via
  `t()`; labels + guidance localize with EN/UA parity while the mm clearances stay fixed.
- **Result:** `pass` — manual (ADR-0001). The recommendation **key** is automated; the colored-label
  render, the key→sentence mapping, contrast, and EN/UA parity confirmed by code inspection + all
  three reviewers (clean). `RATING_META` Tailwind classes are written out statically (no dynamic
  `.replace`) so JIT keeps them.

### TC-5 — Negative facing clearance reads tight  (VALUES AUTOMATED; render manual)

- **Requirement(s):** `FR-WALK-02`, `FR-WALK-03`
- **Automated coverage:** `lib/calculations.test.ts` — `"walkway facing preset can go negative and
  reads tight"` (`computeWalkways(1000, 1200)` → available `−200`, rating `tight`, recommendation
  `walkway.tight`).
- **Preconditions:** Fresh load (EN), a room with width **1000** (narrow — two facing 600 units do
  not fit).
- **Steps:**
  1. On the 1000-wide room's walkway block, confirm the **facing** row (1200) reads **`-200 mm`** — a
     negative clearance renders as a negative number (React-escaped text, no crash / NaN).
  2. Confirm that row rates **`tight`** (1 bar, err color) with the `recTight` guidance sentence.
  3. Confirm the wardrobe (600) and sofa (900) rows still show sensible positive clearances
     (`400 mm` tight, `100 mm` tight for width 1000).
- **Expected result:** A clearance that goes negative (furniture wider than the room) renders as a
  negative mm value and is rated `tight` — no crash, no NaN, no clamping.
- **Result:** `pass` — the negative-clearance value and `tight` rating are automated; the negative-mm
  render is manual (ADR-0001) and confirmed safe by the security-reviewer.
