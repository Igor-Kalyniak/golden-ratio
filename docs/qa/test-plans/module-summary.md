# Manual Test Plan — `module-summary`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix
> `Status: manual-only`). The two pure helpers `computeModuleRuler` and `moduleWarning` are
> automated in `lib/calculations.test.ts` (ruler sizes/labels/rounding + warning boundaries); the
> card rendering — hero value, traceability hint, ruler table, and warning banner presence — is
> structural with no React/DOM runner (ADR-0001), so it is verified manually here.

- **Change:** `module-summary`
- **Owned requirement IDs:** `FR-MODULE-02, FR-MODULE-03, FR-MODULE-04, FR-MODULE-05, BC-MODULE-01`
- **Last updated:** `2026-07-03T14:00:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §6.1 (Module Summary card) and the
  worked example (ceiling 2800, opening 2100 → M = 700) — layout/behavior source of truth.

## Scope note

This change opens the **results column** with a read-only Module Summary card as the first result
section (`Shell` swaps the `perRoom` placeholder for `<ModuleSummary>`; the `showResults` gate,
empty-state card, and `aria-live` are unchanged). It owns the hero active-module value, the
`GCD → snapped` traceability hint (residual + alternatives), the ¼M…4M ruler, and the
impractical-module warning banner. The module `<select>` stays in the apartment card (input
column); the summary only **displays** `state.module` — it never edits geometry (`BC-MODULE-01`).
Result sections that consume the module (bands, golden-ratio, grid-fit, walkways, visualizer) are
owned by later changes (8–15).

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: ceiling 2800, opening 2100, one room 3000 × 2400), so
  the module defaults to the suggestion `suggestModule(2800, 2100).suggested = 700` and the results
  region — with the Module Summary card at the top — shows on first load.

## Cases

### TC-1 — Hero reflects `state.module` + updates on override  (reducers AUTOMATED, render manual)

- **Requirement(s):** `FR-MODULE-02`, `BC-MODULE-01`, `FR-MODULE-03` (hint)
- **Automated coverage:** `lib/app-state.test.ts` — `"default state: module is the live suggestion
  and untouched"`, `"withModule: sets the value and marks it touched"`, `"a touched module is
  sticky across ceiling/opening edits"`, `"withCeiling: untouched module follows the new
  suggestion"`. Run `node --test lib/app-state.test.ts`.
- **Steps (manual confirmation of the wired, read-only card):**
  1. On load, confirm the results column opens with a **Module Summary** card (heading
     `module summary`). The left pane shows the hero `M = 700` (mono, large) with an `mm` unit and
     an `active module` label.
  2. Confirm the card contains **no** input control for the module — it is read-only; the module
     `<select>` lives only in the apartment card (input column).
  3. In the apartment card, change the module `<select>` to a different standard value (e.g. `600`).
     Confirm the hero updates to `M = 600` on the same frame and the ruler sizes recompute (TC-3),
     while the traceability hint still shows the engine's `GCD → snapped` for the current heights.
  4. Change the ceiling (e.g. to 3000) **without** having overridden the module. Confirm the hero
     follows the new suggestion (untouched module auto-follows).
- **Expected result:** The hero equals `state.module` verbatim (never `rawGcd`, never a fresh
  recompute); selecting a different module updates the hero + ruler; an untouched module follows the
  heights. The summary never edits state.
- **Result:** `pass` — active-module reducer contract automated; the read-only hero render + prop
  flow are manual (ADR-0001); confirmed read-only by both reviewers.

### TC-2 — Traceability hint: GCD → snapped, residual, alternatives  (source AUTOMATED, render manual)

- **Requirement(s):** `FR-MODULE-03`
- **Automated coverage:** `lib/calculations.test.ts` — `"suggestModule: worked example 2800/2100 →
  M=700"` (pins `rawGcd`, `suggested`, `residual`, `alternatives` the hint renders).
- **Preconditions:** Fresh load (EN), default heights 2800 / 2100.
- **Steps:**
  1. In the right pane, confirm the hint reads `GCD(2800, 2100) = 700 → snapped to 700` (mono for
     the numbers).
  2. Confirm a `residual 0 mm` chip renders in the **good** (green) style at the worked example.
  3. Confirm `alternatives:` is followed by chips drawn from `suggestModule(2800, 2100)
     .alternatives` (the two nearest standard modules).
  4. Set the heights to a coprime-ish pair that does **not** snap cleanly (e.g. ceiling 2810,
     opening 2110). Confirm the hint still shows `GCD → snapped to {suggested}` and the residual
     chip now shows a **non-zero** value in the **warn** (amber) style — the poor snap is visible,
     not silent.
- **Expected result:** The hint surfaces the raw GCD, the snapped suggestion, a residual chip
  (green at 0, amber when non-zero), and the alternative-module chips; numbers are mono.
- **Result:** `pass` — the underlying `suggestModule` output is automated (worked example); the
  hint's DOM rendering + chip styling are manual (ADR-0001).

### TC-3 — Module ruler: sizes, never-translated labels, localized use  (sizes/labels AUTOMATED)

- **Requirement(s):** `FR-MODULE-04`
- **Automated coverage:** `lib/calculations.test.ts` — `"computeModuleRuler: sizes at M=700"`,
  `"computeModuleRuler: labels equal CALC_LABELS (never translated)"`, `"computeModuleRuler:
  fractional module rounds each size"`.
- **Preconditions:** Fresh load (EN), module 700.
- **Steps:**
  1. Confirm the ruler `<table>` has three columns — `label` / `size` / `typical use` — and seven
     rows.
  2. At M = 700, confirm the sizes read `175, 350, 700, 1050, 1400, 2100, 2800` for rows
     `¼M, ½M, M, 1.5M, 2M, 3M, 4M`. Confirm the label and size cells are mono (labels accent-colored).
  3. Confirm the `typical use` column shows the seven EN strings (e.g. `¼M` → "trim, reveals, small
     offsets"; `M` → "base planning unit, door width"; `4M` → "ceiling height").
  4. Toggle the language pill to **UA**. Confirm the label cells still render `¼M`…`4M` **verbatim**
     (never translated) while the `typical use` column switches to Ukrainian.
  5. Change the module to a value that does not divide evenly by 4 to confirm rounding is applied
     per row (the ¼M size is `round(module × 0.25)`, e.g. module 150 → ¼M = 38).
- **Expected result:** Sizes are `round(module × k)` for `k ∈ {0.25,0.5,1,1.5,2,3,4}`; label cells
  come from the fixed `CALC_LABELS` and are never translated; only the typical-use prose is
  localized.
- **Result:** `pass` — sizes, labels, and rounding automated via `computeModuleRuler`; the table DOM
  + mono-accent styling + UA use-string switch are manual (ADR-0001); EN/UA parity 88/88 confirmed.

### TC-4 — Impractical-module warning banner  (logic AUTOMATED; banner needs a temporary constant edit)

- **Requirement(s):** `FR-MODULE-05`
- **Automated coverage:** `lib/calculations.test.ts` — `"moduleWarning: none within the practical
  range"` (700/1000/100 → `null`, boundaries inclusive), `"moduleWarning: large above 1000, small
  below 100"` (1001 → `'large'`, 99 → `'small'`).
- **IMPORTANT — the banner is UI-unreachable by data:** with the shipped
  `STANDARD_MODULES = [100, 150, 200, 300, 350, 600, 700]`, the module `<select>` can never produce
  a value `> 1000` or `< 100`, so `moduleWarning(state.module)` is **always `null`** and the banner
  never renders from a valid selection. This is deliberate (dormant-by-data, **not** dead code —
  `FR-MODULE-05` is a `Should` + spec contract, gated on the swappable `STANDARD_MODULES` per
  [ADR-0002](../../adr/0002-standard-modules-swappable-constant.md) / OQ-01), disclosed in
  `design.md` Risks/Trade-offs and accepted by both reviewers (CR-001 / SC-001, resolved). The
  logic is proven by the unit tests above independent of the current module set.
- **Steps (default state — banner absent):**
  1. On a fresh load (module 700, within `100–1000`), confirm **no** warning banner renders and the
     ruler + hint still show — the calculation proceeds regardless.
- **Steps (observing the banner — requires a TEMPORARY constant edit, then revert):**
  2. Temporarily edit `lib/calculations.ts` `STANDARD_MODULES` to include an out-of-range value
     (e.g. add `1200`), restart `npm run dev`, and select `1200` in the apartment card. Confirm a
     `role="alert"` banner renders in the `--warn-bg` style with the `warnLarge` text ("Module may
     be impractically large …").
  3. Temporarily add a small value (e.g. `50`) and select it. Confirm the banner renders with the
     `warnSmall` text ("Module is very small — inputs may need revision.").
  4. Toggle to UA and confirm both banner strings are localized.
  5. **Revert** the `STANDARD_MODULES` edit and confirm `node --test lib/*.test.ts` is still 61/61.
- **Expected result:** No banner within `100–1000` mm inclusive; a `role="alert"` `warnLarge` banner
  for `> 1000` and `warnSmall` for `< 100`; the calculation proceeds either way. Under the shipped
  constant the banner is correctly dormant.
- **Result:** `pass` — `moduleWarning` logic automated at boundaries; the live banner is observable
  only via a temporary `STANDARD_MODULES` edit (documented above), acknowledged by CR-001/SC-001.

### TC-5 — Keyboard & screen-reader pass over the Module Summary

- **Requirement(s):** `FR-MODULE-03`, `FR-MODULE-04`, `FR-MODULE-05`, `NFR-A11Y-01` (shell-owned,
  exercised here)
- **Preconditions:** Fresh load (EN); keyboard + screen reader.
- **Steps:**
  1. Confirm the card is read-only: tabbing through the results region does **not** land on any
     module control inside the summary (the only module `<select>` is in the apartment card).
  2. Confirm the ruler `<table>` is announced as a table with a header row `label / size / typical
     use` and seven data rows; the mono label/size cells read their values.
  3. If a warning banner is present (see TC-4), confirm the screen reader announces it via
     `role="alert"` when it appears.
  4. Confirm the results region is announced via its `aria-live="polite"` landmark when values
     change (shell-owned), with no perceptible async delay after an apartment edit.
  5. Toggle the language pill and confirm the card headings and use-column strings switch locale
     while the module labels (`¼M`…`4M`) and numeric values stay fixed.
- **Expected result:** The summary is fully read-only and keyboard-inert (no editable controls); the
  ruler is a properly-structured table; the warning banner (when reachable) announces politely; the
  card is bilingual with calc labels never translated.
- **Result:** `pass` — manual (ADR-0001); read-only + auto-escaped numeric/text nodes confirmed by
  the security-reviewer (no HTML sink).
