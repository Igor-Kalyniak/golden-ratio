## Why

`module-summary` (7) opened the results region and fixed the active module every result reads.
`vertical-bands` is the first of the four fan-out result sections: it renders the height-band
diagram — the visual that shows how the ceiling divides into `floor(ceiling / M)` full module
bands plus a leftover partial band, with the opening height marked and flagged on- or off-grid.
The pure `computeVerticalBands` function already shipped (change 1); this change is its
presentation layer — a width-responsive SVG plus a small pure layout helper so the band geometry,
names, and label-condensing stay unit-testable. Capability 8 in
[docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md); its prerequisites `module-summary` (7) and
`calculation-engine` (1) are archived. Owns `FR-VERT-01/02/03/04/05/06` and `NFR-RESP-01`
(`FR-VERT-01`'s function shipped with change 1).

## What Changes

- **`lib/calculations.ts` extended (pure)**: add `layoutBandDiagram(ceiling, m, opening?)` that
  builds the render-ready, framework-free band layout from `computeVerticalBands` — an array of
  band rows `{ from, to, span, name, partial, alt }` (bottom-to-top, the leftover `topRemainder`
  as a trailing `partial` band, `FR-VERT-02/03`), the mm marks with a **condense flag** at high
  counts (`>16` marks → keep every 4th + the last, `FR-VERT-06`), and the opening overlay
  `{ mm, aligned }` when an opening is given (`FR-VERT-04`). Band `name` is a locale-independent
  key (`band.basePlinth`/`band.workZone`/`band.doorHead`/`band.upperCeiling`) — the engine stays
  language-agnostic, the UI maps it via `t()` (same pattern as `WalkwayRecommendationKey`). Pure
  and unit-tested (`NFR-PURE-01`/`NFR-TEST-01`).
- **`components/BandDiagram.tsx` (`'use client'`)**: the height-band SVG (DESIGN §6.2) — a
  width-responsive `viewBox` diagram with `preserveAspectRatio` and no fixed pixel width
  (`FR-VERT-05`, `NFR-RESP-01`); full bands bottom-to-top with alternating fills, the partial band
  dashed and tagged `partial · {span} mm`, mm marks up the left edge (condensed at high counts) and
  band names on the right (`FR-VERT-06`), and the opening as a dashed accent rule + dot tagged
  `on grid` / `off-grid` (`FR-VERT-04`). Read-only; recomputes synchronously from props.
- **`components/Shell.tsx`**: the results region renders `<BandDiagram>` after `<ModuleSummary>`
  (still gated on `showResults`). Per DESIGN §6.2 the band diagram is a 3D-mode result; the mode
  toggle (change 13) is not built yet, so it renders unconditionally for now (the app is
  effectively in 3D mode until then) — noted for the mode-toggle change to gate it.
- **`locales/en.json` + `locales/ua.json`**: add the four band-name keys (`bandBasePlinth`,
  `bandWorkZone`, `bandDoorHead`, `bandUpperCeiling`); `bandDiagram`, `openingLine`, `aligned`,
  `offGrid`, `partial`, `leftover`, `bands` already shipped.
- **`lib/calculations.test.ts` extended**: unit tests for `layoutBandDiagram` — band count &
  partial band (divisible vs not), opening alignment on/off a boundary, band-name key sequence, and
  the mark-condense flag at 2 / ~16 / 50+ bands.

Scope stays the vertical-band diagram only. The other three result sections (golden 9, grid 10,
walkway 11), the per-room cards, and the 2D/3D mode toggle (13) are out of scope. `viewBox`
dimensions follow the owned requirement `FR-VERT-05` literal `0 0 200 400` (see design.md — DESIGN
§6.2's `360 470` is a prototype-specific value; both are `viewBox`-based and width-responsive, so
the requirement's contract is met either way).

## Capabilities

### New Capabilities
- `vertical-bands`: the height-band diagram — full bands + partial leftover band, mm marks and
  band-name labels with condensing at high counts, the opening's on/off-grid marker, all in a
  width-responsive `viewBox` SVG.

### Modified Capabilities
<!-- none — module-summary / app-shell specs are unchanged; this adds a new result section. -->

## Impact

- **Files:** extend `lib/calculations.ts` (+tests); add `components/BandDiagram.tsx`; edit
  `components/Shell.tsx`; add 4 keys to each `locales/*.json`. No new dependencies (pure SVG, no 3D).
- **Requirements owned:** `FR-VERT-01/02/03/04/05/06`, `NFR-RESP-01`.
- **Consumes (shipped):** `computeVerticalBands` from the engine; `state.ceiling`/`opening`/`module`
  from `Calculator`; `Shell` results slot; `useI18n`.
- **Enables:** completes the ceiling-side result; `golden-ratio`/`grid-fit`/`walkway` (9–11) fan
  out beside it.
