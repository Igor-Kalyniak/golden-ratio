# PRD — Apartment Module & Golden Ratio Calculator

Last updated: 2026-06-28

This document is the **single source of truth** for what the product does and
what constraints govern it. Every requirement has a stable ID. Specs, tests,
PRs, and recordings reference these IDs to keep traceability intact.

Refer to [docs/PRODUCT-BRIEF.md](PRODUCT-BRIEF.md) for narrative context, and to
[docs/superpowers/specs/2026-06-27-apartment-module-calculator-design.md](superpowers/specs/2026-06-27-apartment-module-calculator-design.md)
for the originating design spec.

## Goals & success metrics

### Goals

1. **Replace manual proportioning arithmetic with instant, trustworthy calculation** — the architect reads correct numbers immediately instead of computing GCDs, golden splits, and grid fits by hand.
2. **Keep the module decision legible and reversible** — the architect always understands where the suggested module came from and can override it without breaking the calculation.
3. **Be usable bilingually (UA/EN) with no learning curve** — an architect productive in one language is equally productive in the other.

### Success metrics

This is a keyless, analytics-free, client-side tool (BC-PRIVACY-01, see below), so there is **no runtime telemetry in v1**. Metrics are validated pre-launch via timed usability sessions with target architects and the automated test suite, not dashboards.

| Metric | Baseline (by hand) | Target | How measured |
| ------ | ------------------ | ------ | ------------ |
| Time to a full proportioning result for one apartment (3 rooms) | ~10–15 min | < 2 min | timed usability session, n ≥ 5 architects |
| Calculation discrepancy vs hand-check | unknown | 0 in unit suite; ≤ ±1 mm rounding only | NFR-TEST-01 suite + spot hand-checks |
| Recompute latency, p95 (≤ 20 rooms) | n/a | < 16 ms | local benchmark harness (NFR-PERF-02) |
| Task success rate (architect completes proportioning unaided) | n/a | ≥ 90% | usability session observation |
| Module-suggestion comprehension (user can explain the suggested value) | n/a | ≥ 80% | post-task interview |

### Non-goals (outcomes we are explicitly not pursuing)

- **Not a CAD or drawing tool** — it outputs numbers the architect applies elsewhere, never geometry or drawings.
- **Not a building-code authority** — walkway ratings and module advice are guidance, not certification or compliance sign-off.
- **Not a collaboration or storage platform** — no projects, sharing, or history.
- **Not a general units/area calculator** — it does one job (module-based proportioning), not arbitrary measurement.

## ID conventions

| Prefix   | Meaning                    | Example                                        |
| -------- | -------------------------- | ---------------------------------------------- |
| `FR-*`   | Functional Requirement     | `FR-MODULE-01` — suggest module from heights   |
| `NFR-*`  | Non-Functional Requirement | `NFR-PERF-01` — recompute synchronously        |
| `TC-*`   | Technical Constraint       | `TC-STACK-01` — Next.js 16 App Router          |
| `BC-*`   | Business / UX Constraint   | `BC-SCOPE-01` — no export in v1                |

Status values: `proposed` · `accepted` · `shipped` · `dropped`.

## Functional requirements

### Shell & layout

| ID          | Description                                                                                                 | Status   |
| ----------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| FR-SHELL-01 | Single-page app: input column (apartment fields + room list) and a live results panel                       | proposed |
| FR-SHELL-02 | Layout stacks vertically on small screens; form and results sit side by side on wide screens                | proposed |
| FR-SHELL-03 | A language toggle (UA ↔ EN) sits in the top-right corner and switches all UI strings live                   | proposed |
| FR-SHELL-04 | Results panel renders only when apartment fields and at least one room are fully valid                      | proposed |

### Apartment input (capability `apartment-input`)

| ID          | Description                                                                                                 | Status   |
| ----------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| FR-APT-01   | Ceiling height (mm) input: integer, default 2800, valid 2000–5000                                           | proposed |
| FR-APT-02   | Opening height (mm) input: integer, default 2100, valid 1800–ceiling height                                 | proposed |
| FR-APT-03   | Module (mm) selector: dropdown of `STANDARD_MODULES`, defaulting to the suggested value, user-overridable   | proposed |
| FR-APT-04   | Inline validation: invalid field shows a red border and a localized message below it                       | proposed |
| FR-APT-05   | Inputs are reactive — any valid change recomputes all results synchronously, with no submit button          | proposed |

### Room input (capability `room-input`)

| ID          | Description                                                                                                 | Status   |
| ----------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| FR-ROOM-01  | App starts with one empty room; an "Add room" button appends more                                           | proposed |
| FR-ROOM-02  | Any room can be removed except the last remaining one                                                       | proposed |
| FR-ROOM-03  | Per room: name (1–50 chars, non-empty, default "Room 1"), length (mm) and width (mm), both 500–15000        | proposed |
| FR-ROOM-04  | Each room field validates inline like apartment fields (FR-APT-04)                                          | proposed |

### Module engine (capability `module`)

| ID            | Description                                                                                                                  | Status   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-MODULE-01  | `suggestModule(ceiling, opening)` returns `{ rawGcd, suggested, alternatives, residual }`; `suggested` is `rawGcd` snapped to the nearest `STANDARD_MODULES` value | proposed |
| FR-MODULE-02  | The active module used by every downstream calculation is the user's selected value (defaulting to `suggested`), never the raw GCD | proposed |
| FR-MODULE-03  | Module Summary displays the active module large (e.g. "M = 700 mm") plus a "suggested from heights" hint showing `rawGcd → suggested`, `alternatives`, and `residual` | proposed |
| FR-MODULE-04  | A ruler table lists ¼M, ½M, M, 1.5M, 2M, 3M, 4M with each size and a typical-use description                                | proposed |
| FR-MODULE-05  | Warning banner when module > 1000 mm ("module may be impractically large, check ½M") or < 100 mm ("inputs may need revision") | proposed |

### Vertical bands (capability `vertical-bands`)

| ID          | Description                                                                                                              | Status   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| FR-VERT-01  | `computeVerticalBands(ceiling, m)` returns `{ bands, topRemainder, openingAligned, openingBand }`                        | proposed |
| FR-VERT-02  | Band count is derived as `round(ceiling / m)` — variable, never hardcoded; the renderer handles 2 bands and 50+ alike   | proposed |
| FR-VERT-03  | Leftover height above the last full module is reported and drawn as a partial band (`topRemainder`)                     | proposed |
| FR-VERT-04  | When the opening does not land on a band boundary, `openingAligned` is false and an off-grid marker is drawn at its true height | proposed |
| FR-VERT-05  | SVG diagram uses `viewBox="0 0 200 400"` + `preserveAspectRatio`; container is width-responsive with no fixed pixel size  | proposed |
| FR-VERT-06  | mm labels on the left, band names on the right; label density is capped/condensed when band count is large so it stays legible | proposed |

### Golden ratio (capability `golden-ratio`)

| ID           | Description                                                                                                             | Status   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-GOLD-01   | `computeGoldenSplit(length, m)` returns `{ larger, smaller, largerSnapped, smallerSnapped, snapOffset }`                | proposed |
| FR-GOLD-02   | `larger = length × 0.618`, `smaller = length × 0.382`; `largerSnapped` rounds to the nearest ½M grid line, `smallerSnapped` is the remainder | proposed |
| FR-GOLD-03   | The golden split is applied to the **longer** wall of each room                                                         | proposed |
| FR-GOLD-04   | Per-room results show exact values, snapped values, and `snapOffset`; an offset > ¼M is flagged "approximate fit"       | proposed |

### Room grid fit (capability `grid-fit`)

| ID          | Description                                                                                                              | Status   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| FR-GRID-01  | `computeRoomGrid(length, width, m)` returns `{ lengthModules, widthModules, lengthRemainder, widthRemainder, quality }` | proposed |
| FR-GRID-02  | Module counts use `round(dimension / m)` (nearest), not floor                                                           | proposed |
| FR-GRID-03  | Remainder is the signed distance to the nearest multiple — `min(d % m, m - (d % m))` — so the UI can say "round up" vs "round down" | proposed |
| FR-GRID-04  | Quality: `exact` when both nearest-distances are 0; `close` when both ≤ ¼M; `poor` otherwise (a dimension 1 mm short reads `close`, not `poor`) | proposed |
| FR-GRID-05  | Per-room results show modules × modules, the remainders, and a colored quality badge                                    | proposed |

### Walkway check (capability `walkway`)

| ID          | Description                                                                                                              | Status   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| FR-WALK-01  | `computeWalkways(roomWidth, furnitureDepth, oppositeDepth?)` returns `{ available, rating, recommendation }`            | proposed |
| FR-WALK-02  | `available = roomWidth - furnitureDepth - (oppositeDepth ?? 0)`; standard depths are 600 mm (wardrobe/kitchen), 900 mm (sofa) | proposed |
| FR-WALK-03  | Ratings use fixed ergonomic thresholds in mm, decoupled from M: ≥ 900 comfortable, ≥ 600 acceptable, < 600 tight        | proposed |
| FR-WALK-04  | Per-room results show walkway estimates for common furniture (wardrobe 600, bed center)                                 | proposed |

### Internationalisation (capability `i18n`)

| ID          | Description                                                                                                              | Status   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| FR-I18N-01  | `LanguageContext` holds `locale` (`'en' \| 'ua'`) and a `t(key)` function; `LanguageToggle` switches it live            | proposed |
| FR-I18N-02  | All user-facing strings resolve through `t()`; two flat JSON dictionaries live in `locales/en.json` and `locales/ua.json` | proposed |
| FR-I18N-03  | Calculation labels (¼M, ½M, M, etc.) are locale-independent and not translated                                          | proposed |

## Requirement prioritization (MoSCoW)

The MVP is deliberately tight, so most requirements are **Must**. The split below
calls out what can ship in a thin first cut versus what refines it, so scope can be
cut under time pressure without producing an incoherent product.

| Priority | Requirements | Rationale |
| -------- | ------------ | --------- |
| **Must** | FR-SHELL-01/02/04, FR-APT-01/02/03/04/05, FR-ROOM-01/02/03/04, FR-MODULE-01/02/03/04, FR-VERT-01/02/03/05, FR-GOLD-01/02/03, FR-GRID-01/02/03/04, FR-WALK-01/02/03, FR-I18N-01/02/03 | Without any one of these the core loop — input → module → bands + per-room results — is broken or untrustworthy. |
| **Should** | FR-SHELL-03 (language toggle UI), FR-MODULE-05 (impractical-module warnings), FR-VERT-04 (off-grid opening marker), FR-VERT-06 (label condensing at high band counts), FR-GOLD-04 (snap-offset / "approximate fit" flag), FR-GRID-05 (quality badge), FR-WALK-04 (furniture presets) | These deliver the "honest about approximation" promise and polish; the tool computes correctly without them but is less legible. |
| **Could** | `oppositeDepth` opposite-wall accounting in FR-WALK-02, per-room editable furniture depths | Useful refinements that can wait for a second iteration. |
| **Won't (v1)** | Everything in *Out of scope* below | Deferred by explicit decision. |

> Note: i18n (FR-I18N-*) is **Must** because the product is bilingual UA/EN by
> definition (TC-I18N-01); only the toggle's UI placement is downgradable.

## Non-functional requirements

| ID            | Description                                                                                                            | Status   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| NFR-PERF-01   | All computation is synchronous and client-side; results update on the same frame as input changes, with no async or effects | proposed |
| NFR-PERF-02   | Recomputation on any single input change is imperceptible (< 16 ms) for a realistic apartment (≤ 20 rooms)            | proposed |
| NFR-PURE-01   | `lib/calculations.ts` is framework-free pure functions: no `next/*`, no `react`, no DOM globals — 100% unit-testable  | proposed |
| NFR-TEST-01   | Every calculation function has unit tests covering normal, boundary, and edge-case inputs (variable band counts, off-grid openings, 1 mm-short dimensions, snap residuals) | proposed |
| NFR-A11Y-01   | All inputs have accessible labels and visible focus styles; validation messages are programmatically associated with their fields | proposed |
| NFR-A11Y-02   | Color palette meets WCAG AA contrast in both light and dark themes; quality/rating badges never rely on color alone   | proposed |
| NFR-RESP-01   | Vertical band SVG and the form/results layout are fully responsive and legible from mobile to desktop                 | proposed |
| NFR-OBS-01    | Console is silent at runtime (no warnings, no errors) on a healthy session                                            | proposed |

## Technical constraints

| ID            | Description                                                                                                            | Status   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| TC-STACK-01   | Next.js 16 App Router; TypeScript strict; React 19                                                                     | accepted |
| TC-STACK-02   | Tailwind CSS 4 utility classes only; no custom CSS beyond `globals.css`                                                | accepted |
| TC-STACK-03   | Geist Sans for UI text, Geist Mono for numeric/dimension values; dark mode via Tailwind `dark:` variants              | accepted |
| TC-CLIENT-01  | Single `'use client'` boundary at `Calculator.tsx`; `page.tsx` stays a Server Component                                | accepted |
| TC-ARCH-01    | `Calculator` owns `ApartmentInput` state; results flow down as props from pure functions in `calculations.ts`         | accepted |
| TC-I18N-01    | Bilingual UA/EN via a React context + JSON dictionaries; no heavy i18n library                                        | accepted |
| TC-DATA-01    | No server actions, no database, no routing, no API endpoints — all computation is local and synchronous               | accepted |

## Business / UX constraints

| ID            | Description                                                                                                            | Status   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| BC-USER-01    | Target user is an architect / interior designer in the initial proportioning phase; the app outputs numbers they apply in their own CAD tools | accepted |
| BC-VALUE-01   | Core value is replacing manual GCD / golden-ratio math with instant reactive calculation; output is data-dense, minimal visuals | accepted |
| BC-MODULE-01  | The module is surfaced as a user-selected value with a suggestion and alternatives — never a single brittle silently-derived number | accepted |
| BC-WALK-01    | Walkway comfort is an absolute human dimension expressed in fixed mm thresholds and must never scale with the module M | accepted |
| BC-SCOPE-01   | v1 ships no export, no persistence, no floor-plan editor, no accounts                                                  | accepted |
| BC-PRIVACY-01 | No analytics, trackers, fingerprinting, accounts, or application-set cookies; all input stays in the browser            | accepted |

## Out of scope (v1)

- Export of any kind (PDF, CSV, image)
- Persistence or saved projects
- Interactive floor plan or drag-and-drop editing
- User accounts and authentication
- API endpoints, server actions, or a database
- Localisation beyond UA + EN labels
- Native mobile app

## Assumptions

These are believed true and underpin the design; if one proves false, revisit the linked requirements.

- **A-01** Target architects work in millimetres and recognise standard module values — no unit conversion or onboarding is needed (BC-USER-01).
- **A-02** The `STANDARD_MODULES` set `[100, 150, 200, 300, 350, 600, 700]` reflects the proportioning practice this tool serves (FR-MODULE-01). *See OQ-01.*
- **A-03** Standard furniture depths of 600 mm (wardrobe/kitchen) and 900 mm (sofa) are acceptable defaults for the target market (FR-WALK-02).
- **A-04** Architects transcribe results into their own CAD tools immediately, so no save/export is needed in v1 (BC-SCOPE-01).
- **A-05** The default ceiling (2800 mm) and opening (2100 mm) heights are representative starting points (FR-APT-01/02).

## Edge cases

Explicit behaviours for the boundary conditions the engine must handle. These are testable (NFR-TEST-01).

| Scenario | Expected behavior | Ref |
| -------- | ----------------- | --- |
| Ceiling and opening are coprime (`rawGcd = 1`) | Suggestion snaps to nearest standard module; UI shows residual and alternatives rather than a literal 1 mm module | FR-MODULE-01/03 |
| Ceiling not divisible by module | Last partial band shown as `topRemainder`; band count is `round(ceiling / m)` | FR-VERT-02/03 |
| Opening height does not fall on a band boundary | `openingAligned = false`; off-grid dashed marker at true height | FR-VERT-04 |
| Very large band count (50+) | Labels condensed/grouped; SVG stays legible and responsive | FR-VERT-05/06 |
| Room dimension 1 mm short of a module | Reads `close`, not `poor` (nearest-distance, not modulo) | FR-GRID-03/04 |
| Golden split lands far from a ½M line (offset > ¼M) | Flagged "approximate fit"; exact and snapped values both shown | FR-GOLD-04 |
| Module chosen > 1000 mm or < 100 mm | Warning banner; calculation still proceeds | FR-MODULE-05 |
| Walkway clearance below 600 mm | Rated `tight` against fixed mm threshold, independent of module | FR-WALK-03 |
| User removes rooms down to one | Last room cannot be removed; results still render | FR-ROOM-02, FR-SHELL-04 |
| Any apartment or room field invalid | Results panel hidden; offending field shows localized inline error | FR-SHELL-04, FR-APT-04 |

## Dependencies & risks

### Dependencies

| Dependency | Owner | Status | Impact if unmet |
| ---------- | ----- | ------ | --------------- |
| Authoritative `STANDARD_MODULES` list for the target market | Architecture SME | open (OQ-01) | Suggestions feel wrong; erodes trust in the core feature |
| UA + EN string translations | PM / translator | not started | Bilingual promise (TC-I18N-01) unmet |
| Next.js 16 / React 19 / Tailwind 4 toolchain | Eng | accepted (TC-STACK-01/02) | Blocks all build work |

### Risks

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Suggested module is unstable/surprising for coprime heights | M | M | Snap to standard module, show `residual` + `alternatives`, warn on extremes (FR-MODULE-01/05) |
| 50+ band diagram becomes unreadable on mobile | M | M | Label condensing + responsive `viewBox` SVG (FR-VERT-05/06) |
| Walkway ratings mistaken for code compliance | M | H | Stated non-goal; phrase as guidance in `recommendation` text (FR-WALK-01) |
| No telemetry means no post-launch signal on adoption or quality | H | M | Validate via pre-launch usability sessions; revisit privacy stance only if a real need emerges |
| Golden-ratio ½M snap misleads when offset is large | M | M | Surface `snapOffset` and "approximate fit" flag (FR-GOLD-04) |

## Open questions

- [ ] **OQ-01** Which `STANDARD_MODULES` values are authoritative for the target (UA) market? — Owner: Architecture SME
- [ ] **OQ-02** Should furniture depths be editable per room, or are the 600/900 mm defaults sufficient for v1? — Owner: PM
- [ ] **OQ-03** Do architects need a print-friendly results view even without PDF export? — Owner: PM
- [ ] **OQ-04** Are the default ceiling (2800) and opening (2100) heights right for the target market? — Owner: Architecture SME

## Revision history

| Version | Date       | Author | Changes |
| ------- | ---------- | ------ | ------- |
| 1.0     | 2026-06-28 | PM     | Initial PRD derived from the design spec |
| 1.1     | 2026-06-28 | PM     | Added goals & success metrics, non-goals, MoSCoW prioritization, assumptions, edge-case catalog, dependencies & risks, open questions |
