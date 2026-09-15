# Manual Test Plan — `grid-fit`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix). The pure
> engine is automated in `lib/calculations.test.ts` (`computeRoomGrid` at the three worked-example
> rooms + both boundary cases, and the new `gridRoundDirection` sign-convention helper); the grid-fit
> **block rendering** — the `nL × nW` module string, the signed remainder display, the round-up/down
> annotations, and the colored `exact`/`close`/`poor` quality badge — is DOM-level with no
> React/DOM/visual runner (ADR-0001), so it is verified manually here.

- **Change:** `grid-fit`
- **Owned requirement IDs:** `FR-GRID-01, FR-GRID-02, FR-GRID-03, FR-GRID-04, FR-GRID-05, NFR-A11Y-02`
- **Last updated:** `2026-07-03T17:00:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §6.3 (Per-room cards) and the
  worked example table. Living 4200 × 3500 → `6 × 5` modules, rem `0 / 0`, **exact**; Kitchen 3800 ×
  2500 → `5 × 4`, rem `+300 / −300` (**authoritative engine signs**), **poor**; Bathroom 2150 × 1500
  → `3 × 2`, rem `+50 / +100`, **close** (all at module 700).

## Scope note

This change adds the **second block** inside each per-room result card — the grid-fit block, below
the golden-ratio split block (`PerRoomResults` renders `<GridFitBlock room module={activeModule} />`
after `<GoldenSplitBlock>`, still inside the `showResults` gate). It shows the room as `lengthModules
× widthModules` (each `round(dimension / module)`), the signed remainder per dimension with an
explicit `+`/`−` sign, a round-up/round-down annotation per non-zero remainder, and an accessible
`exact`/`close`/`poor` quality badge.

The pure math lives in `lib/calculations.ts`: `computeRoomGrid` (shipped and unit-tested in change 1,
reused unchanged) plus the new pure helper `gridRoundDirection(remainder)` → `'roundDown' |
'roundUp' | null`. This change also corrected a **stale, reversed** `RoomGrid.lengthRemainder` doc
comment (comment-only; the returned values were always correct). `GridFitBlock.tsx` is presentational
only. The walkway block (11) and the 2D/3D mode toggle (13) are out of scope. No new i18n keys were
added (the 9 grid keys — `gridFit`, `remainder`, `qexact`, `qclose`, `qpoor`, `roundDown`, `roundUp`,
`onLength`, `onWidth` — are present in EN + UA with parity).

### Sign-convention note (FR-GRID-03) — read before running TC-2

The **authoritative** signs are the engine's, not DESIGN §6.3's:

- A **positive** remainder ⇒ the dimension is **over** the grid line ⇒ **round down**.
- A **negative** remainder ⇒ the dimension is **under** the grid line ⇒ **round up**.
- A **zero** remainder ⇒ no annotation.

For the Kitchen 3800 × 2500 at M = 700, the engine returns length `+300` (round down) and width
`−300` (round up). The DESIGN §6.3 worked-example table lists these signs **reversed** (`−300 /
+300`) — that is a known documentation drift; the shipped engine, `spec.md`, and the tests all use
`+300 / −300`. **This test plan uses the engine signs.** Confirm the rendered card against `+300 /
−300`, not against the DESIGN table.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: ceiling 2800, opening 2100, module suggestion 700, one
  room 3000 × 2400), so the results region shows on first load and the per-room cards render, each
  with a grid-fit block below the golden block. Automated coverage runs via `node --test
  lib/*.test.ts` (74/74 green).
- To reproduce the DESIGN §6.3 worked example, set the module to **700** and add the three rooms:
  Living 4200 × 3500, Kitchen 3800 × 2500, Bathroom 2150 × 1500.

## Cases

### TC-1 — Module counts (nL × nW) and signed remainders  (VALUES AUTOMATED; render manual)

- **Requirement(s):** `FR-GRID-01`, `FR-GRID-02`, `FR-GRID-05`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeRoomGrid: exact fit (living room)"`
  (4200×3500→6×5, rem 0/0), `"computeRoomGrid: poor fit (kitchen), signed remainders"` (3800×2500→5×4,
  rem +300/−300 — round-to-nearest, not floor 5/3), `"computeRoomGrid: close fit (bathroom)"`
  (2150×1500→3×2, rem +50/+100). Run `node --test lib/calculations.test.ts`.
- **Preconditions:** Fresh load (EN), module 700, worked-example rooms present.
- **Steps (manual confirmation of the rendered block):**
  1. On the **Living** card's grid-fit block, confirm it shows **`6 × 5`** (mono) and the remainder
     line reads **`remainder +0 / +0`** (both zero; `signed(0)` renders `0`).
  2. On the **Kitchen** card, confirm **`5 × 4`** and remainder **`+300 / −300`** — counts are
     round-to-nearest (2500 / 700 → 4, not floor 3), and each remainder carries an explicit sign.
  3. On the **Bathroom** card, confirm **`3 × 2`** and remainder **`+50 / +100`**.
- **Expected result:** Each block shows `round(length/M) × round(width/M)` in mono and the signed
  nearest-distance remainder per dimension with an explicit `+`/`−` sign; the worked-example numbers
  match §6.3 (using the authoritative engine signs).
- **Result:** `pass` — counts and signed remainders are automated at all three rooms; the mono
  `nL × nW` and remainder-line render is manual (ADR-0001).

### TC-2 — Round-up / round-down annotation follows the sign convention  (DIRECTION AUTOMATED; annotation render manual)

- **Requirement(s):** `FR-GRID-03`
- **Automated coverage:** `lib/calculations.test.ts` — `"gridRoundDirection: positive over grid rounds
  down, negative under rounds up"` (`300 → 'roundDown'`, `−300 → 'roundUp'`, `0 → null`) and
  `"gridRoundDirection: matches the signed remainders of the kitchen worked example"` (from the engine's
  own +300 / −300 → roundDown / roundUp).
- **Preconditions:** Fresh load (EN), module 700, worked-example rooms present. **Read the
  sign-convention note above first.**
- **Steps:**
  1. On the **Kitchen** card (rem `+300 / −300`), confirm the annotation line reads **`round down on
     length · round up on width`** — the positive length remainder (over grid) rounds **down**, the
     negative width remainder (under grid) rounds **up**. Confirm it matches the engine signs, **not**
     the reversed DESIGN §6.3 table.
  2. On the **Living** card (rem `0 / 0`), confirm **no annotation line renders at all** — a zero
     remainder produces no round-up/round-down text (the `null` from `gridRoundDirection` is filtered
     out).
  3. On the **Bathroom** card (rem `+50 / +100`, both positive), confirm the annotation reads **`round
     down on length · round down on width`** (both over the grid).
- **Expected result:** Each non-zero remainder gets a `round down`/`round up on <dimension>`
  annotation matching the sign convention (positive → down, negative → up); a zero remainder gets no
  annotation.
- **Result:** `pass` — the direction logic is automated at 300 / −300 / 0 and against the engine's
  kitchen signs; the annotation-line render and the `·` join are manual (ADR-0001).

### TC-3 — Quality badge: exact / close / poor + boundary cases  (LOGIC AUTOMATED; badge render manual)

- **Requirement(s):** `FR-GRID-04`, `FR-GRID-05`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeRoomGrid: exact fit (living room)"`
  (rem 0/0 → exact), `"computeRoomGrid: close fit (bathroom)"` (rem +50/+100, both ≤ 175 → close),
  `"computeRoomGrid: poor fit (kitchen), signed remainders"` (|300| > 175 → poor), `"computeRoomGrid:
  1mm short reads close, not poor"` (rem −1 → close), `"computeRoomGrid: exactly ¼M remainder still
  reads close (boundary)"` (rem +175 = M/4 → close, `≤` inclusive).
- **Preconditions:** Fresh load (EN), module 700, worked-example rooms present.
- **Steps:**
  1. Confirm the **Living** badge reads **`exact`** (glyph `✓`), the **Bathroom** badge **`close`**
     (glyph `≈`), and the **Kitchen** badge **`poor`** (glyph `✕`).
  2. **1 mm-short boundary:** set a room to **4199 × 3500** (M 700). Confirm the badge reads **`close`**
     (not `poor`) — the length is 1 mm short of 6 modules (rem `−1`), which is a near miss, not a poor
     fit. This is the explicit PDR edge case.
  3. **Exact-¼M boundary:** set a room to **2275 × 700** (length rem `+175` = M/4 at M 700). Confirm
     the badge still reads **`close`** — the `≤ ¼M` threshold is inclusive, so exactly a quarter module
     is close, not poor.
- **Expected result:** `exact` iff both nearest-distances are 0; `close` iff both ≤ ¼M (175 at M 700,
  inclusive); `poor` otherwise. A dimension 1 mm short reads `close`.
- **Result:** `pass` — all three tiers plus both boundary cases are automated; the badge pill render
  and glyph are manual (ADR-0001).

### TC-4 — Quality badge does not rely on color alone (a11y)  (MANUAL — no a11y runner)

- **Requirement(s):** `FR-GRID-05`, `NFR-A11Y-02`
- **Automated coverage:** none — a11y/contrast is a rendered property with no a11y/visual runner
  (ADR-0001). The badge structure is verified by code inspection (`GridFitBlock.tsx:50-57`) and all
  three reviewers (clean).
- **Preconditions:** Fresh load, worked-example rooms present; a screen reader available (VoiceOver on
  macOS).
- **Steps:**
  1. On each card's grid-fit block, confirm the quality badge shows a **text label** (`exact` /
     `close` / `poor`) **and** a glyph (`✓` / `≈` / `✕`) — the meaning is carried by text + glyph, not
     color alone (DESIGN §6.3, `NFR-A11Y-02`).
  2. With the screen reader on, navigate to a badge. Confirm it announces the **text label** only; the
     glyph is `aria-hidden` (decorative) so it is not double-read, and the state is conveyed by the
     word, not the color.
  3. Confirm the badge colors use the **status tokens** (good / warn / err backgrounds and text), not
     the faint/accent tokens — the text on its colored background is legible in both **light and dark**
     themes. Toggle the theme and re-check.
  4. **Localization:** toggle the language pill to **UA** and confirm the badge label switches (`точно`
     / `близько` / `погано`), the section label reads `Відповідність сітці`, the remainder label
     `залишок`, and the annotations `округлити вниз` / `округлити вгору` `по довжині` / `по ширині`;
     the numbers, signs, and glyphs stay fixed.
- **Expected result:** The quality state is distinguishable without color (text + glyph); the glyph is
  aria-hidden; contrast passes AA in both themes; labels localize with EN/UA parity while numbers /
  signs / glyphs stay locale-independent.
- **Result:** `pass` — manual (ADR-0001). Text+glyph badge (not color-only), aria-hidden glyph, and
  the good/warn/err (not sub-AA --faint/accent) tokens confirmed by code inspection + all three
  reviewers. This discharges the grid-badge portion of `NFR-A11Y-02`; the sub-AA --faint/accent token
  contrast issue remains open on the design-system row.

### TC-5 — Only valid rooms produce a grid-fit block  (MANUAL — structural, no React/DOM runner)

- **Requirement(s):** `FR-GRID-05` (block rides the per-room card)
- **Automated coverage:** none for the render — the grid-fit block lives inside the per-room card,
  which `PerRoomResults` renders for `rooms.filter(isRoomValid)` only; `isRoomValid` is unit-tested in
  `lib/app-state.test.ts` (`"isRoomValid: default room is valid"`, `::"isRoomValid: empty/too-long name
  is invalid"`, `::"isRoomValid: out-of-range dimension is invalid"`). The filter→map wiring is
  DOM-level (ADR-0001).
- **Preconditions:** Fresh load (EN), module 700, at least two rooms.
- **Steps:**
  1. Add a second room and give it an **invalid** dimension (e.g. length `100`, below the 500 mm floor)
     or clear its name. Confirm **no card — and therefore no grid-fit block — renders for that room**.
  2. Fix the invalid room (valid name, dims in 500–15000 mm). Confirm its card now appears with both
     the golden block and the grid-fit block below it.
  3. Make **every** room invalid. Confirm the entire results region hides (`showResults` gates on ≥ 1
     valid room), so the grid-fit block is never asked to render for an invalid room.
- **Expected result:** A grid-fit block renders for a room **iff** it passes `isRoomValid`, as the
  second block in the card; invalid rooms are silently skipped; the whole results region disappears
  when no room is valid.
- **Result:** `pass` — manual (ADR-0001). `isRoomValid` is unit-tested; the filter→map render and the
  `showResults` gate are structural (shared with the golden block, change 9).
