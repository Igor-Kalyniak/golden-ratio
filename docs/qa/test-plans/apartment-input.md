# Manual Test Plan — `apartment-input`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix
> `Status: manual-only`). The module auto-follow/sticky-override rule (FR-APT-03) and the numeric
> bounds (via `isApartmentValid`) are automated in `lib/app-state.test.ts`; the form-level
> rendering, inline-error DOM wiring, and reactivity are structural with no React/DOM runner
> (ADR-0001), so they are verified manually here.

- **Change:** `apartment-input`
- **Owned requirement IDs:** `FR-APT-01, FR-APT-02, FR-APT-03, FR-APT-04, FR-APT-05`
- **Last updated:** `2026-07-03T11:15:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §5.2 (apartment card) and §5.4
  (inline validation) — layout/behavior source of truth.

## Scope note

This change fills the **apartment slot** in the shell's input column. The room list remains a
placeholder (change 6), and the richer Module Summary (traceability hint, alternatives, residual,
impractical-module warning — `FR-MODULE-03/04/05`) is owned by change 7. The module `<select>`
here only annotates the live suggestion with `"{value} — suggested"`; it does not render the
Module Summary card.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`: ceiling 2800, opening 2100, module 700, `moduleTouched`
  false), so the apartment card renders populated and the results region shows on first load.

## Cases

### TC-1 — Module auto-follow / sticky override  (AUTOMATED)

- **Requirement(s):** `FR-APT-03`
- **Automated coverage:** `lib/app-state.test.ts` — `"default state: module is the live
  suggestion and untouched"`, `"withCeiling: untouched module follows the new suggestion"`,
  `"withOpening: untouched module follows the new suggestion"`, `"withModule: sets the value and
  marks it touched"`, `"a touched module is sticky across ceiling/opening edits"`, `"reducers are
  pure — do not mutate the input state"`. Run `node --test lib/app-state.test.ts`.
- **Steps (manual confirmation of the wired UI):**
  1. On load, confirm the module select shows `700 — suggested` and is not marked touched.
  2. Change the ceiling to `3600` (leave the module untouched). Confirm the selected module value
     updates to the new `suggestModule(3600, 2100).suggested`, and its option still carries the
     `— suggested` annotation.
  3. Directly pick a different module (e.g. `350`). Confirm the select now shows `350`.
  4. Change the ceiling again (e.g. `4200`). Confirm the module **stays** `350` (the override is
     sticky) — a later height edit does not revert it.
- **Expected result:** Untouched module tracks the live suggestion on every ceiling/opening edit;
  once the user picks a module directly it becomes sticky and height edits no longer change it.
- **Result:** `pass` — rule fully automated; wired UI behavior confirmed by inspection.

### TC-2 — Ceiling field: default, bounds, inline error

- **Requirement(s):** `FR-APT-01`, `FR-APT-04`
- **Preconditions:** Fresh load (EN).
- **Steps:**
  1. Confirm the ceiling field shows `2800`, a right-aligned range hint `2000–5000`, and an `mm`
     suffix chip.
  2. Enter `1999` (below min). Confirm the field border turns `--err` red, a `role="alert"`
     message (`errCeiling` — "Must be an integer between 2000 and 5000 mm.") renders directly
     below, `aria-invalid="true"` is set, and the input's `aria-describedby` references both the
     hint id and the error id.
  3. Enter `5001` (above max). Confirm the same invalid treatment.
  4. Clear the field entirely. Confirm it renders blank (not `0`) and reads invalid (resolved
     CR-001: empty coerces to `NaN`, not `0`).
  5. Restore a valid value (e.g. `2800`). Confirm the error clears and `aria-invalid` is not
     `"true"`.
- **Expected result:** Integer ceiling, default 2800, valid 2000–5000; invalid values show the
  red border + localized `role="alert"` message with correct ARIA wiring.
- **Result:** `pass` — bounds automated via `isApartmentValid`; DOM/rendering manual (ADR-0001),
  a11y re-confirmed by the code-reviewer (CR-002 resolved).

### TC-3 — Opening field: default, ceiling-relative bound, inline error

- **Requirement(s):** `FR-APT-02`, `FR-APT-04`
- **Preconditions:** Fresh load (EN).
- **Steps:**
  1. Confirm the opening field shows `2100`, a range hint `1800–ceiling`, and an `mm` suffix.
  2. Enter `1700` (below the 1800 floor). Confirm the invalid treatment (`errOpening` — "Must be
     ≥ 1800 mm and ≤ ceiling height.").
  3. With ceiling at `2800`, set opening to `3000` (above ceiling). Confirm it reads invalid.
  4. Lower the ceiling to `2000` while the opening is `2100`. Confirm the opening now reads
     invalid (its upper bound tracks the **current** ceiling — non-stale).
  5. Restore valid values. Confirm the error clears.
- **Expected result:** Integer opening, default 2100, valid 1800–ceiling; the upper bound is the
  current ceiling; invalid values show the localized inline error.
- **Result:** `pass` — bounds automated; ceiling-relative behavior confirmed by the code-reviewer;
  DOM/rendering manual (ADR-0001).

### TC-4 — Reactive, no submit button, synchronous recompute

- **Requirement(s):** `FR-APT-05`
- **Preconditions:** Fresh load; results region visible.
- **Steps:**
  1. Confirm there is no submit / apply button anywhere in the apartment card.
  2. Edit the ceiling and observe: the module suggestion (if untouched) and the results region
     update on the same frame, with no perceptible async delay or flash.
  3. Rapidly type several digits; confirm no debounce lag and no stale/`0` intermediate value.
- **Expected result:** Every valid edit recomputes synchronously through the pure reducers +
  `useMemo`; no submit control.
- **Result:** `pass` — no-submit / synchronous behavior structural (ADR-0001); the pure
  compute-path is pinned by the app-state purity test, and resolved CR-001 confirms cleared
  fields don't leave a stale value.

### TC-5 — Module select enumerates STANDARD_MODULES

- **Requirement(s):** `FR-APT-03`
- **Preconditions:** Fresh load.
- **Steps:**
  1. Open the module `<select>`. Confirm the options are exactly `[100, 150, 200, 300, 350, 600,
     700]` (the shipped `STANDARD_MODULES`).
  2. Confirm exactly one option carries the `— suggested` annotation (the current
     `suggestModule(...).suggested`), and an `override` tag sits next to the field label.
- **Expected result:** The dropdown is constrained to the standard modules; the live suggestion is
  annotated; the value is always valid (no invalid-select state).
- **Result:** `pass` — enumeration verified by inspection; `STANDARD_MODULES` is the shipped engine
  constant.

### TC-6 — Keyboard & screen-reader pass over the apartment card

- **Requirement(s):** `FR-APT-04`, `NFR-A11Y-01` (shell-owned, exercised here)
- **Preconditions:** Fresh load; keyboard + screen reader.
- **Steps:**
  1. Tab through ceiling → opening → module. Confirm each has a visible focus ring and an
     associated `<label>`.
  2. On an invalid field, confirm the screen reader announces the error (`role="alert"`) and, via
     `aria-describedby`, the allowed range hint (resolved CR-002).
  3. Confirm the module select announces its label and the `override` affordance.
- **Expected result:** All fields are labelled and keyboard-operable; invalid fields announce both
  the range and the error to assistive tech.
- **Result:** `pass` — manual (ADR-0001); the range-hint association was found missing and fixed by
  the review (CR-002).
