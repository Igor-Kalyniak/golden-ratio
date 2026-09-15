# Manual Test Plan — `vertical-bands`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix
> `Status: manual-only`). The pure layout helper `layoutBandDiagram` is automated in
> `lib/calculations.test.ts` (band count & partial band, opening on/off-grid, band-name key
> sequence, and the mark-condense flag at the 5 / 16 / 17 boundaries); the SVG rendering itself —
> responsive `viewBox` scaling, the drawn partial band, the opening rule/dot, label legibility at
> high band counts, and EN/UA band-name switching — is structural with no React/DOM/visual runner
> (ADR-0001), so it is verified manually here.

- **Change:** `vertical-bands`
- **Owned requirement IDs:** `FR-VERT-01, FR-VERT-02, FR-VERT-03, FR-VERT-04, FR-VERT-05,
  FR-VERT-06, NFR-RESP-01`
- **Last updated:** `2026-07-03T15:00:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §6.2 (Vertical band diagram) and
  the worked example (ceiling 2800, module 700, opening 2100 → 4 full bands, opening on grid at
  band 3) — layout/geometry source of truth. The frozen prototype (`prototype.dc.html` `bands()` /
  `names()`) is the reference geometry.

## Scope note

This change adds the **second result section** — the height-band SVG — after the Module Summary
card (`Shell` renders `<BandDiagram>` after `<ModuleSummary>`, still inside the `showResults` gate).
It owns the band layout (full bands bottom-to-top + a trailing partial leftover band), the mm marks
up the left edge with label condensing at high counts, the localized band names on the right, and
the opening's on/off-grid marker at its true height, all in a width-responsive `viewBox` SVG. The
pure geometry lives in `layoutBandDiagram` (`lib/calculations.ts`, unit-tested); `BandDiagram.tsx`
is presentational only. The other three result sections (golden 9, grid 10, walkway 11), the
per-room cards, and the 2D/3D mode toggle (13) are out of scope.

### Two deferrals recorded honestly

- **`viewBox` PDR-literal drift.** `FR-VERT-05` specifies `viewBox="0 0 200 400"`, but the shipped
  SVG uses **`0 0 360 470`** (DESIGN §6.2). The 200-wide box was tried first and clipped the
  right-side band-name and opening labels (review CR-001, high, resolved); the wider DESIGN box is
  the only geometry that satisfies **both** `FR-VERT-05` (responsive `viewBox` contract) and
  `FR-VERT-06` (labels legible). The load-bearing `FR-VERT-05` contract holds either way. The PDR
  literal is flagged for a docs-pass reconciliation (`design.md` Open Questions) — see TC-6.
- **Unconditional render (no mode toggle yet).** DESIGN §6.2 marks the band diagram "3D mode only",
  but the 2D/3D mode toggle is change 13 and does not exist yet, so `BandDiagram` renders whenever
  `showResults` is true. When `mode-toggle` (13) lands it will gate this section on `mode === '3d'`.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: ceiling 2800, opening 2100, module suggestion 700, one
  room 3000 × 2400), so the results region shows on first load and the band diagram renders after
  the Module Summary card. Automated coverage runs via `node --test lib/*.test.ts` (69/69 green).

## Cases

### TC-1 — Band count and partial leftover band  (AUTOMATED via `layoutBandDiagram`)

- **Requirement(s):** `FR-VERT-01`, `FR-VERT-02`, `FR-VERT-03`
- **Automated coverage:** `lib/calculations.test.ts` — `"layoutBandDiagram: divisible ceiling → full
  bands, no partial"` (2800/700 → 4 bands, no partial), `"layoutBandDiagram: non-divisible ceiling →
  trailing partial band"` (3000/700 → 4 full + partial span 200, from 2800 to 3000), `"layoutBandDiagram:
  large band count is derived, not capped"` (5000/100 → 50 bands), plus the engine-level
  `"computeVerticalBands: minimal 2-band case"` (2000/700 → 2). Run `node --test lib/calculations.test.ts`.
- **Steps (manual confirmation of the rendered diagram):**
  1. On load (ceiling 2800, module 700), confirm the band diagram draws **4 full bands** stacked
     bottom-to-top with alternating fills, and the section heading shows `… 4 bands`. No partial
     band appears (2800 is divisible by 700).
  2. Change the ceiling to `3000` (module still 700). Confirm the diagram now shows **4 full bands
     plus one dashed partial band** at the top, tagged `partial · 200 mm` (`3000 − 4·700`).
  3. Set ceiling `5000` and module `100`. Confirm the count is **derived** — 50 thin bands render
     from `floor(5000/100)`, not a capped constant, and the diagram still lays out cleanly.
- **Expected result:** Band count = `floor(ceiling/m)` full bands, variable from 2 to 50+; a
  trailing dashed partial band with its `{span} mm` tag appears exactly when `topRemainder > 0`.
- **Result:** `pass` — count/partial geometry automated via `layoutBandDiagram`/`computeVerticalBands`;
  the drawn bands + partial dash/tag are manual (ADR-0001).

### TC-2 — Opening marker: on-grid vs off-grid at true height  (AUTOMATED via `layoutBandDiagram`)

- **Requirement(s):** `FR-VERT-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"layoutBandDiagram: opening on a boundary is
  aligned"` (2800/700/2100 → `{ mm:2100, aligned:true }`), `"layoutBandDiagram: off-grid opening at
  its true height"` (2800/400/2100 → `aligned:false`, `mm:2100`), `"layoutBandDiagram: no opening →
  null overlay"`, and `"computeVerticalBands: opening alignment"`.
- **Preconditions:** Fresh load (EN), ceiling 2800, opening 2100.
- **Steps:**
  1. At module 700, opening 2100, confirm the opening is drawn as a dashed accent rule + dot at the
     2100 mm height (which coincides with a band boundary), tagged `opening · on grid`.
  2. Change the module to `400` (opening still 2100; 2100 is not a multiple of 400). Confirm the
     marker stays at the **true height 2100 mm** (between boundaries, not snapped) and the tag flips
     to `opening · off-grid`.
  3. Confirm the marker's vertical position tracks the true mm height as the opening value changes.
- **Expected result:** `aligned` is true only when `opening` is an exact module multiple; otherwise
  the marker sits at the true height and reads `off-grid`. No opening → no marker.
- **Result:** `pass` — alignment + true-height logic automated; the dashed rule/dot + tag render is
  manual (ADR-0001). The right-gutter tag legibility is the CR-001 concern, resolved by TC-6's box.

### TC-3 — Responsive viewBox SVG, no fixed pixel size  (MANUAL — no visual runner, ADR-0001)

- **Requirement(s):** `FR-VERT-05`, `NFR-RESP-01`
- **Automated coverage:** none — `viewBox`/`preserveAspectRatio`/responsive scaling is a rendered
  property with no React/DOM/visual runner (ADR-0001). Structural: `npm run build` + `tsc` + `npm
  run lint` compile the component; behavior is confirmed manually here.
- **Preconditions:** Fresh load (EN), default state.
- **Steps:**
  1. Inspect the `<svg>` element: confirm it carries `viewBox="0 0 360 470"` and
     `preserveAspectRatio="xMidYMid meet"`, with **no** fixed pixel `width`/`height` attribute — it
     uses `class="h-auto w-full"` inside a `w-full max-w-[520px]` wrapper.
  2. Resize the browser from a wide desktop width down to a narrow mobile width (~360 px). Confirm
     the diagram scales down proportionally (never overflows horizontally, never gets a fixed pixel
     cap that clips it), and stays legible at the smallest width.
  3. Toggle the OS/browser to a mobile viewport (device emulation). Confirm the whole results
     column — Module Summary + band diagram — reflows responsively (`NFR-RESP-01`; the form/results
     layout half is owned by `app-shell`).
- **Expected result:** The SVG scales purely via its `viewBox`/`preserveAspectRatio` with no
  hardcoded pixel size; the diagram is legible from mobile to desktop.
- **Result:** `pass` — manual (ADR-0001). Note the shipped `viewBox` is `0 0 360 470`, not the PDR
  literal `0 0 200 400` — see TC-6 and the scope note.

### TC-4 — mm-mark label condensing at high band counts  (LOGIC AUTOMATED; legibility manual)

- **Requirement(s):** `FR-VERT-06`
- **Automated coverage:** `lib/calculations.test.ts` — `"layoutBandDiagram: mark labels condense
  only above the density threshold"`: 5 marks → `condensed:false` (every label kept); 16 marks
  (`==` threshold) → `condensed:false`; 17 marks (`> 16`) → `condensed:true` with `marks[0]` and the
  last mark kept and `marks[1]` hidden (keep every 4th + last). `BAND_MARK_DENSITY = 16`.
- **Preconditions:** Fresh load (EN).
- **Steps:**
  1. At ceiling 2800, module 700 (5 marks), confirm **every** mm mark on the left edge shows its
     label (`0, 700, 1400, 2100, 2800`) — no condensing.
  2. Set ceiling `5000`, module `100` (**50 bands, 51 marks**). Confirm the mm-mark **ticks** all
     still draw up the left edge, but the **labels** thin out (roughly every 4th plus the topmost
     `5000` label), so the axis stays legible rather than becoming an unreadable stack.
  3. Confirm the band **names** on the right still resolve for every band (no blank right-side
     labels), even at 50 bands.
- **Expected result:** Below/at 16 marks every label shows; above 16 the labels condense to every
  fourth plus the last while all ticks still render; band names always resolve.
- **Result:** `pass` — the condense flag + threshold are automated at the 5/16/17 boundaries; the
  actual visual thinning at 50 bands and label legibility are manual (ADR-0001).

### TC-5 — Band-name localization (never-translate keys, EN⇄UA)  (KEY SEQUENCE AUTOMATED)

- **Requirement(s):** `FR-VERT-06`
- **Automated coverage:** `lib/calculations.test.ts` — `"layoutBandDiagram: band-name key sequence
  (3D rule)"`: `bands[0].nameKey = band.basePlinth`, the band the opening (2100) falls in →
  `band.doorHead`, top band → `band.upperCeiling`, the rest `band.workZone`. The engine emits
  locale-independent **keys**, never prose.
- **Preconditions:** Fresh load (EN), ceiling 2800, opening 2100, module 700.
- **Steps:**
  1. Confirm the right-side band names read (bottom→top): `base / plinth`, `work zone`, `door-head
     zone` (the band containing the 2100 opening), `upper / ceiling`.
  2. Toggle the language pill to **UA**. Confirm the names switch to `база / цоколь`, `робоча зона`,
     `зона над прорізом`, `верх / стеля` respectively — resolved via `t()` from the four i18n keys
     (`bandBasePlinth`/`bandWorkZone`/`bandDoorHead`/`bandUpperCeiling`), not hardcoded.
  3. Confirm the mm numbers and `mm` unit stay fixed (numeric, never translated).
- **Expected result:** Each band carries a `nameKey` mapped through the dictionary; EN and UA both
  render localized names with parity, while the engine ships no English prose. Numbers stay fixed.
- **Result:** `pass` — the name-key sequence (3D rule) is automated; the DOM label text + UA switch
  are manual (ADR-0001); EN/UA key parity is enforced by the shipped i18n test.

### TC-6 — viewBox 360×470 label-fit / PDR-literal drift note  (MANUAL — CR-001 resolution)

- **Requirement(s):** `FR-VERT-05`, `FR-VERT-06`
- **Automated coverage:** none — label-fit is a visual property (ADR-0001). This case documents the
  CR-001 resolution and the PDR drift for the docs-pass.
- **Background:** The first cut used the `FR-VERT-05` PDR literal `viewBox="0 0 200 400"`. Review
  CR-001 (high) found it too narrow — with bands filling most of the 200-unit width, the right-side
  band names (`upper / ceiling`, `door-head zone`) and the opening tag (`opening · off-grid`, longer
  in UA) overflowed the viewBox edge and were **clipped** by the SVG's default `overflow:hidden`,
  failing `FR-VERT-06` legibility. DESIGN §6.2's `0 0 360 470` (`BAND_X=78`, `BAND_W=150`) leaves a
  wide right gutter precisely to fit these labels, satisfying **both** owned requirements.
- **Steps:**
  1. Confirm the shipped `<svg>` uses `viewBox="0 0 360 470"` — bands end at `x = 228`, leaving
     ~126 units of right gutter.
  2. In **EN** and again in **UA**, confirm the full band names and the opening tag
     (`opening · on grid` / `opening · off-grid` and the longer UA equivalents) render **without
     clipping** at the right edge.
  3. Record the drift: the PDR (`FR-VERT-05`, L101) still specifies `0 0 200 400`; the shipped value
     is `0 0 360 470` per DESIGN §6.2. This is a documented drift flagged for a docs-pass
     reconciliation (`design.md` Open Questions; `spec.md` records 360×470 as shipped). Behavior is
     unaffected — both are `viewBox`-based and width-responsive.
- **Expected result:** No right-side label clipping in either locale under `viewBox="0 0 360 470"`;
  the PDR-literal drift is a docs-pass item, not a behavioral defect.
- **Result:** `pass` — manual (ADR-0001). CR-001 resolved by adopting the DESIGN box; the numeric
  drift from the PDR literal is recorded here and in the traceability matrix for reconciliation.
