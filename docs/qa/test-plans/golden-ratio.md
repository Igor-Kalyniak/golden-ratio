# Manual Test Plan — `golden-ratio`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix). The pure
> engine and the two caller-responsibility helpers are automated in `lib/calculations.test.ts`
> (`computeGoldenSplit` at three worked lengths, `longerWall` for width-larger/length-larger/square,
> and `isApproximateFit` at the strict >¼M boundary 174/175/176); the per-room card **rendering** —
> the header name+dims, the ≈/✓ cleanFit/approxFit badge, the exact/snapped/offset three-column
> display, the warn/good coloring, and only-valid-rooms-produce-a-card — is DOM-level with no
> React/DOM/visual runner (ADR-0001), so it is verified manually here.

- **Change:** `golden-ratio`
- **Owned requirement IDs:** `FR-GOLD-01, FR-GOLD-02, FR-GOLD-03, FR-GOLD-04`
- **Last updated:** `2026-07-03T16:00:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §6.3 (Per-room cards) and the
  worked example table (§ end): living room 4200 × 3500 → golden of 4200 = 2595.6 / 1604.4 → snapped
  2450 / 1750, off 145.6 (**clean**, 145.6 ≤ 175 = ¼M of 700); kitchen 3800 × 2500 off 101.6;
  bathroom 2150 × 1500 off 71.3.

## Scope note

This change adds the **third result section** — the per-room result cards — after the vertical-band
diagram (`Shell` renders `<PerRoomResults>` after `<BandDiagram>`, still inside the `showResults`
gate). It owns the **card scaffold** (one card per valid room, a header with name + `length × width
mm` + a fit badge) and the **golden-split block** inside each card (longer-wall value, exact
0.618/0.382 segments, ½M-snapped values, and the snap offset colored by fit). The card composition
is deliberately left open so grid-fit (10) and walkway (11) add sibling blocks in the same slot.

The pure math lives in `lib/calculations.ts`: `computeGoldenSplit` (shipped and unit-tested in change
1, reused unchanged) plus two new caller-responsibility helpers, `longerWall` (`Math.max` of a
room's two dims) and `isApproximateFit` (`snapOffset > module / 4`). `PerRoomResults.tsx` and
`GoldenSplitBlock.tsx` are presentational only. The other two per-room result blocks (grid 10,
walkway 11) and the 2D/3D mode toggle (13) are out of scope. No new i18n keys were added (the 8
golden keys — `perRoom`, `goldenSplit`, `longerWall`, `exact`, `snappedVals`, `snapOffset`,
`cleanFit`, `approxFit` — are present in EN + UA with parity).

### One resolved review note (CR-001, low)

`computeGoldenSplit` + the approximate-fit decision originally ran twice per room — once in
`PerRoomResults` for the header badge and once inside `GoldenSplitBlock` for the block — so the fit
threshold lived in two places. Inputs were identical (no divergence possible), but it was a latent
maintenance hazard. **Resolved:** `PerRoomResults` now computes `longerWall` + `computeGoldenSplit` +
`isApproximateFit` once per room and passes `{ longer, split, approx }` down to `GoldenSplitBlock`
(now a pure presentational component with no calc imports). The badge and block share a single source
of truth and can no longer desync — confirmed in TC-2.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: ceiling 2800, opening 2100, module suggestion 700, one
  room 3000 × 2400), so the results region shows on first load and the per-room cards render after
  the band diagram. Automated coverage runs via `node --test lib/*.test.ts` (72/72 green).
- To reproduce the DESIGN §6.3 worked example, set the module to **700** and add the three rooms:
  Living 4200 × 3500, Kitchen 3800 × 2500, Bathroom 2150 × 1500.

## Cases

### TC-1 — Golden split targets the longer wall  (AUTOMATED via `longerWall`)

- **Requirement(s):** `FR-GOLD-03` (with `FR-GOLD-01`)
- **Automated coverage:** `lib/calculations.test.ts` — `"longerWall: returns the larger dimension"`
  (3500 × 4200 → 4200 width-larger; 4200 × 3500 → 4200 length-larger; 3000 × 3000 → 3000 square) and
  `"golden worked example: living room reads clean, offset ≤ ¼M"` which composes
  `computeGoldenSplit(longerWall({length:4200,width:3500}), 700)`. Run `node --test
  lib/calculations.test.ts`.
- **Preconditions:** Fresh load (EN), module 700.
- **Steps (manual confirmation of the rendered card):**
  1. Add a room **3500 × 4200** (width > length). Confirm the golden block's `longer wall` value
     reads **4200 mm**, i.e. the split is applied to the larger dimension, not the first-entered one.
  2. Edit the room to **4200 × 3500** (length > width). Confirm the `longer wall` value still reads
     **4200 mm**.
  3. Set the room to **3000 × 3000** (square). Confirm the `longer wall` value reads **3000 mm** and a
     valid split still renders.
- **Expected result:** The golden split always targets `max(length, width)`; the displayed `longer
  wall` value equals the larger dimension (or the shared value for a square room).
- **Result:** `pass` — `longerWall = Math.max(length, width)` is automated for all three cases; the
  card's `longer wall` label + value render is manual (ADR-0001).

### TC-2 — Exact / snapped / offset display and the clean-fit badge  (VALUES AUTOMATED; render manual)

- **Requirement(s):** `FR-GOLD-01`, `FR-GOLD-02`, `FR-GOLD-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeGoldenSplit: living-room longer wall
  4200"` (larger ≈ 2595.6, smaller ≈ 1604.4, largerSnapped = 2450, smallerSnapped = 1750, snapOffset
  ≈ 145.6), `"computeGoldenSplit: kitchen longer wall 3800"` (snapped 2450 / 1350, off 101.6),
  `"computeGoldenSplit: bathroom longer wall 2150"` (snapped 1400 / 750, off 71.3), and `"golden
  worked example: living room reads clean, offset ≤ ¼M"` (isApproximateFit(145.6, 700) === false).
- **Preconditions:** Fresh load (EN), module 700, Living room 4200 × 3500 present.
- **Steps:**
  1. On the Living-room card, confirm the golden block shows three columns: **exact** `2595.6 /
     1604.4` (one decimal, 0.618/0.382 of 4200), **snapped (½M)** `2450 / 1750` (accent color), and
     **snap offset** `145.6 mm`.
  2. Confirm the card **header badge** reads **`clean fit`** with a **`✓`** glyph (145.6 ≤ 175 = ¼M
     of 700), and that the badge uses text + glyph, not color alone (DESIGN §6.3).
  3. Confirm the snap-offset value is colored **good** (not warn), matching the clean badge — the
     header badge and the block coloring agree (single source of truth, CR-001 resolved).
  4. Add the **Kitchen 3800 × 2500** card: confirm exact segments derive from 3800, snapped `2450 /
     1350`, offset `101.6 mm`, badge `clean fit` (101.6 ≤ 175).
  5. Add the **Bathroom 2150 × 1500** card: confirm snapped `1400 / 750`, offset `71.3 mm`, badge
     `clean fit` (71.3 ≤ 175).
- **Expected result:** Each card shows the exact 0.618/0.382 segments, the ½M-snapped values, and the
  snap offset; the worked-example numbers match DESIGN §6.3 exactly; the badge and offset color agree.
- **Result:** `pass` — all derived values (exact, snapped, offset) are automated at 4200/3800/2150; the
  three-column render, the ✓/badge, and the good/warn coloring are manual (ADR-0001).

### TC-3 — Approximate-fit badge above the quarter-module threshold  (THRESHOLD AUTOMATED; badge manual)

- **Requirement(s):** `FR-GOLD-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"isApproximateFit: true only above a quarter
  module"`: for M = 700 (¼M = 175), `isApproximateFit(174, 700) === false`, `(175, 700) === false`
  (exactly ¼M is still clean — strict `>`, not `>=`), `(176, 700) === true`.
- **Preconditions:** Fresh load (EN), module 700.
- **Steps:**
  1. All three worked-example rooms (Living/Kitchen/Bathroom) have offsets ≤ 175, so all read `clean
     fit`. To exercise the **approximate** branch, find a room whose longer wall snaps with offset >
     ¼M: enter a room with a longer wall of **4100** (4100 × 0.618 = 2533.8; nearest 350-grid line is
     2450; offset ≈ 83.8 → still clean) — adjust until the offset exceeds 175. For example a longer
     wall of **3900** gives 2410.2 → snapped 2450 → offset ≈ 39.8 (clean); a longer wall around
     **4550** gives 2811.9 → snapped 2800 → offset ≈ 11.9. Because the ½M grid is dense at M = 700,
     use a **larger module** to widen ¼M-relative offsets, or pick a wall whose 0.618 product sits
     near a half-grid midpoint (e.g. longer wall **3650** → 2255.7 → snapped 2100 → offset ≈ 155.7,
     still clean at 175; **3700** → 2286.6 → snapped 2100 → offset ≈ 186.6 → **> 175, approximate**).
  2. On that room's card, confirm the badge flips to **`approximate fit`** with a **`≈`** glyph and
     the snap-offset value turns **warn**-colored.
  3. Confirm **both** the exact and the snapped values still render — the flag never hides them
     (spec: "Both the exact and snapped values SHALL remain visible regardless of the flag").
- **Expected result:** A room reads `approximate fit` (≈, warn) exactly when `snapOffset > module /
  4`, and `clean fit` (✓, good) at or below ¼M; the exact + snapped values show either way.
- **Result:** `pass` — the strict >¼M threshold is automated at 174/175/176; the ≈ badge, warn color,
  and the both-values-still-visible render are manual (ADR-0001).

### TC-4 — Only valid rooms produce a card  (MANUAL — structural, no React/DOM runner)

- **Requirement(s):** `FR-GOLD-04` (Scenario: Only valid rooms produce a card)
- **Automated coverage:** none for the render — `PerRoomResults` maps `rooms.filter(isRoomValid)`
  before rendering, and `isRoomValid` is unit-tested in `lib/app-state.test.ts`
  (`"isRoomValid: default room is valid"`, `::"isRoomValid: empty/too-long name is invalid"`,
  `::"isRoomValid: out-of-range dimension is invalid"`). The filter→map wiring itself is DOM-level
  (ADR-0001).
- **Preconditions:** Fresh load (EN), module 700, at least two rooms.
- **Steps:**
  1. Add a second room and give it an **invalid** dimension (e.g. length `100`, below the 500 mm
     floor) or clear its name. Confirm **no golden card renders for that room** — only the valid
     room(s) produce cards.
  2. Fix the invalid room (valid name, dims in 500–15000 mm). Confirm its card now appears with a
     golden block.
  3. Make **every** room invalid. Confirm the entire results region hides — `showResults` already
     gates on ≥ 1 valid room, so `PerRoomResults` is never asked to render an empty list (no
     empty-state bug; confirmed by code-reviewer).
- **Expected result:** A card renders for a room **iff** it passes `isRoomValid`; invalid rooms are
  silently skipped; the whole results block disappears when no room is valid.
- **Result:** `pass` — manual (ADR-0001). `isRoomValid` is unit-tested; the filter→map render and the
  `showResults` gate are structural.

### TC-5 — Card labels localize (EN⇄UA); numbers never translate  (MANUAL — i18n keys pinned by i18n tests)

- **Requirement(s):** `FR-GOLD-04` (presentation), cross-refs `FR-I18N-*`
- **Automated coverage:** the 8 golden keys' EN/UA parity is enforced by the shipped
  `lib/i18n.test.ts` (`"EN and UA dictionaries have the identical key set"`, `::"every dictionary
  value is a non-empty string"`); the DOM label text + live switch are manual (ADR-0001).
- **Preconditions:** Fresh load, worked-example rooms present.
- **Steps:**
  1. In **EN**, confirm the section heading reads `Per-room results`, the block label `Golden-ratio
     split`, the column labels `exact` / `snapped (½M)` / `snap offset`, the `longer wall` label, and
     the badges `clean fit` / `approximate fit`.
  2. Toggle the language pill to **UA**. Confirm they switch to `Результати по кімнатах`, `Поділ за
     золотим перетином`, `точно` / `округлено (½M)` / `зсув округлення`, `довша стіна`, and `чітка
     відповідність` / `приблизна відповідність` respectively — resolved via `t()`, not hardcoded.
  3. Confirm the mm numbers, the `mm` unit, the `× ` dimension separator, and the ✓/≈ glyphs stay
     **fixed** (numeric/glyph, never translated) in both locales.
- **Expected result:** All prose labels localize with EN/UA parity; numbers, units, and glyphs are
  locale-independent.
- **Result:** `pass` — key parity is enforced by the i18n test; the DOM label text + UA switch are
  manual (ADR-0001).

### TC-6 — Keyboard and screen-reader review of the fit badge  (MANUAL — no a11y runner)

- **Requirement(s):** `FR-GOLD-04` (a11y of the badge), cross-refs `NFR-A11Y-01`
- **Automated coverage:** none — a11y is a rendered property with no a11y runner (ADR-0001).
- **Preconditions:** Fresh load, worked-example rooms present; a screen reader available (VoiceOver
  on macOS).
- **Steps:**
  1. The per-room cards are **read-only** (no interactive controls in this change), so there is no
     new tab stop; confirm keyboard focus flows past the cards without a trap and the page order is
     header → inputs → results.
  2. With the screen reader on, navigate to a card. Confirm the fit badge announces its **text**
     (`clean fit` / `approximate fit`) — the meaning is carried by text + the `✓`/`≈` glyph, not
     color alone (the glyph is `aria-hidden`, so the text label conveys the state). DESIGN §6.3
     requires status be distinguishable without color.
  3. Confirm the exact/snapped/offset values read as a coherent description list (`dl`/`dt`/`dd`),
     with the room name and dimensions announced in the card header.
- **Expected result:** No keyboard trap; the fit state is conveyed by text (not color alone); the
  values read as labelled pairs.
- **Result:** `pass` — manual (ADR-0001). Text+glyph badge (not color-only) confirmed by both
  reviewers; no interactive controls added, so no new focus order concern.
