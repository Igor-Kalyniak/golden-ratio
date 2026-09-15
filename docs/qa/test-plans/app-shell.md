# Manual Test Plan — `app-shell`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix
> `Status: manual-only | partial`). The gate logic (FR-SHELL-04) and compute-path purity
> (NFR-PERF-01) are automated in `lib/app-state.test.ts`; everything else here is structural /
> rendering behavior with no React/DOM runner (ADR-0001), so it is verified manually.

- **Change:** `app-shell`
- **Owned requirement IDs:** `FR-SHELL-01, FR-SHELL-02, FR-SHELL-03, FR-SHELL-04, TC-CLIENT-01, TC-ARCH-01, NFR-RESP-01, NFR-A11Y-01, NFR-PERF-01`
- **Last updated:** `2026-07-03T03:10:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §4 (page shell & header) — layout source of truth.

## Scope note

The input column and results region are intentionally **empty slots** in this change. Their
contents — apartment fields (change 5), room list (change 6), result sections (changes 7–11),
visualizer (12–15), logo (16) — are owned by later capabilities. These cases verify the shell
*structure, layout, header controls, and validity gate*, not populated inputs/results.

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Default state is valid (`DEFAULT_STATE`), so the results region shows its (placeholder)
  content on first load until an input capability wires real editing.

## Cases

### TC-1 — Single-page shell: input column + live results panel

- **Requirement(s):** `FR-SHELL-01`
- **Preconditions:** Fresh load at the local URL.
- **Steps:**
  1. Observe the page: one sticky header, then a body with an input column and a results region.
  2. Confirm the input column shows the `Inputs` heading with two dashed placeholder slots
     (`apartment`, `rooms`); the results region shows the `Per-room results` placeholder.
  3. Confirm the header shows the animated "updates live" pill (≥ sm width).
- **Expected result:** A single page presents an input column and a live results panel as
  distinct regions (empty slots at this stage). No routing/second page. The live pill confirms
  the reactive-results intent.
- **Result:** `pass` — shell structure present; slots are placeholders per scope note.

### TC-2 — Responsive layout: stacked narrow / side-by-side wide

- **Requirement(s):** `FR-SHELL-02`, `NFR-RESP-01`
- **Preconditions:** Fresh load; DevTools responsive mode available.
- **Steps:**
  1. Set viewport width < 1024px (below `lg`). Confirm input column and results region stack
     vertically (single column), and the header wraps onto two rows if needed.
  2. Set viewport width ≥ 1024px. Confirm the two regions sit side by side
     (`[minmax(320px,400px) | 1fr]`) and the header collapses to a single row.
  3. Scroll the results region at ≥ lg; confirm the input column stays sticky and its top edge
     aligns with the header bottom (offset derived from `--header-h` = 67px, per resolved CR-003).
  4. Sweep widths from ~360px to ~1400px; confirm no overflow/clipping and text stays legible.
- **Expected result:** Layout stacks on small screens and is side-by-side on wide screens; the
  sticky offset tracks header height; content remains legible across the range.
- **Result:** `pass` — band-SVG responsiveness (other half of NFR-RESP-01) is out of this change's scope.

### TC-3 — Language toggle top-right, switches all strings live

- **Requirement(s):** `FR-SHELL-03`
- **Preconditions:** Fresh load (EN default).
- **Steps:**
  1. Confirm the `EN | UA` pill sits in the top-right of the header (after the title block).
  2. Click `UA`. Confirm every visible UI string (title, subtitle, live pill, section headings,
     placeholders, empty-state text, control labels) switches to Ukrainian with no reload.
  3. Click `EN`. Confirm strings switch back. Confirm the active locale button is styled active
     and carries `aria-pressed=true`.
- **Expected result:** The toggle is top-right and flips all UI strings live in place (calculation
  labels are never translated — verified in the i18n plan).
- **Result:** `pass` — placement owned here; live-switch mechanism (FR-I18N-01) shipped by i18n.

### TC-4 — Results gate: shown only when apartment valid AND ≥1 room valid  (AUTOMATED)

- **Requirement(s):** `FR-SHELL-04`
- **Automated coverage:** `lib/app-state.test.ts` — `showResults` true for valid default state;
  false when apartment invalid; false when no room valid; true when at least one of several rooms
  is valid. Run `node --test lib/app-state.test.ts` (10/10 pass).
- **Preconditions:** Manual confirmation of the rendered branch (until inputs are editable in
  changes 5/6, exercise by temporarily editing `DEFAULT_STATE` in a scratch build, or rely on
  the unit tests).
- **Steps:**
  1. With the default (valid) state, confirm the results region renders its content branch.
  2. (Post change 5/6) Make an apartment field or all rooms invalid; confirm the results region
     is replaced by the `fillToSee` empty-state panel.
- **Expected result:** Results render iff `isApartmentValid(state) && state.rooms.some(isRoomValid)`;
  otherwise the empty-state prompt shows. Matches the PDR edge cases (L281–282).
- **Result:** `pass` — gate logic automated; rendered-branch swap confirmed by inspection.

### TC-5 — Header controls a11y + synchronous compute (NFR-PERF-01 partly automated)

- **Requirement(s):** `NFR-A11Y-01`, `NFR-PERF-01`
- **Preconditions:** Fresh load; keyboard only.
- **Steps:**
  1. Tab through the header. Confirm the language group and theme toggle are reachable, have a
     visible focus ring, and expose accessible names (theme button label reads
     "Switch to dark/light theme" and swaps with state; language group is labelled).
  2. Toggle theme and language via Enter/Space; confirm `aria-pressed` reflects the current state.
  3. Confirm the two body regions are landmarks: input `section` labelled `Inputs`, results
     `section` labelled `Results` (generic label per resolved CR-002) with `aria-live=polite`.
  4. Confirm interactions update the UI on the same frame with no visible async delay/flash
     (compute path is a synchronous `useMemo` over a pure function — automated purity test pins
     "no react/next/DOM in the compute path").
- **Expected result:** Header controls are keyboard-operable with visible focus and correct
  accessible names/state; regions are labelled landmarks; updates are synchronous.
- **Result:** `partial` — input-field labels + programmatically-associated validation messages
  are owned by changes 5/6 (no editable inputs in the shell yet).

### TC-6 — Single client boundary; state owned by Calculator, results as props

- **Requirement(s):** `TC-CLIENT-01`, `TC-ARCH-01`
- **Preconditions:** Repo checkout at HEAD `94823a9`.
- **Steps:**
  1. Confirm `app/page.tsx` has no `'use client'` directive and renders only `<Calculator/>`
     (Server Component).
  2. Confirm `components/Calculator.tsx` carries the single `'use client'` entry boundary, holds
     `useState<AppState>(DEFAULT_STATE)`, derives `showResults` via `useMemo`, and passes it to
     `<Shell showResults={...}/>` as a prop.
  3. Confirm the derived result comes from the pure `showResults` in `lib/app-state.ts` (no
     framework imports — automated purity test).
  4. Run `npm run build`, `npx tsc --noEmit`, `npm run lint`; confirm all clean.
- **Expected result:** One `'use client'` boundary at `Calculator.tsx`; `page.tsx` stays a Server
  Component; state lives in `Calculator` and results flow down as props from pure functions.
- **Result:** `pass` — structural; verified by inspection + build/tsc/eslint and the
  spec-compliance-auditor.
