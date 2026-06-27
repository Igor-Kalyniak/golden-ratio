# Product Brief — Apartment Module & Golden Ratio Calculator

> Companion to [docs/PDR.md](PDR.md). The PRD is the numbered, traceable source
> of truth; this brief is the business narrative behind it. The originating
> design spec is
> [docs/superpowers/specs/2026-06-27-apartment-module-calculator-design.md](superpowers/specs/2026-06-27-apartment-module-calculator-design.md).

## What this is

The Apartment Module & Golden Ratio Calculator is a single-page web app that
automates the proportional planning an architect does at the very start of a
project. The architect enters a ceiling height, an opening height, and a few
room dimensions; the app proposes an **apartment module** — the snapped GCD of
the heights, offered as a suggestion the architect can override — and instantly
derives vertical height bands, golden-ratio zone divisions, grid-fit analysis,
and walkway recommendations.

Everything is computed client-side as pure math. There are no accounts, no
database, no server round-trips, and no export. The architect reads the numbers
on screen and applies them in their own CAD tools. The interface is bilingual
(Ukrainian and English) and deliberately data-dense: numeric tables plus one SVG
vertical-band diagram, not decoration.

## Who it is for

The single actor is an **architect or interior designer** working through the
initial proportioning phase of an apartment. There are no roles, no sign-in, and
no stored profile. The user opens the page, types dimensions, reads results, and
moves on; nothing is persisted. Anyone who can open the URL is a full user.

**Persona snapshot — "Maria, the proportioning architect."** Mid-career, works in
millimetres, fluent in standard modules and the golden ratio, and lives in CAD all
day. At the very start of a project she sketches proportions on paper or in her
head before committing geometry. She is precise, skeptical of black boxes, and
will not trust a number she cannot trace back to its inputs.

**Job to be done.** *When I begin proportioning a new apartment, I want to turn a
ceiling height, an opening height, and rough room sizes into a defensible module
and the proportions it implies, so I can start drawing in CAD with confidence
instead of doing brittle arithmetic by hand.* The functional dimension is fast,
correct math; the emotional dimension is **confidence and control** — she needs to
see *why* the module was suggested and stay free to override it.

## The pain it addresses

Proportional planning at the start of a project means a pile of small, error-prone
arithmetic: finding a sensible module from the ceiling and opening heights,
dividing walls by the golden ratio, checking whether room dimensions sit cleanly
on that module, and confirming that walkways clear standard furniture. Done by
hand, this is slow, easy to get wrong, and brittle — a single off-by-one on a GCD
can collapse a whole scheme.

This product reduces that to one reactive screen. The architect enters a handful
of numbers and immediately sees a defensible module, the height bands it implies,
where each room lands on the grid, and whether the walkways work — recomputed live
on every keystroke.

## What success looks like

Success is the architect getting a trustworthy proportioning result in **under two
minutes** instead of ten to fifteen by hand, and trusting it enough to start
drawing — without ever wondering where a number came from. Concretely, we are
aiming for a task-success rate of **≥ 90%** unaided, **≥ 80%** of users able to
explain the suggested module in their own words, and **zero** calculation
discrepancies against hand-checks beyond ±1 mm rounding. Because the product is
analytics-free by design, these are validated through timed usability sessions and
the automated test suite before launch, not dashboards afterward. The full metric
table and how each is measured live in [docs/PDR.md](PDR.md#goals--success-metrics).

## End-to-end usage

1. **Open.** The app loads with sensible defaults: a 2800 mm ceiling, a 2100 mm
   opening, and one empty room. A language toggle sits in the top-right corner
   (FR-SHELL-03). The results panel stays hidden until the apartment fields and at
   least one room are valid (FR-SHELL-04).
2. **Set the apartment.** The architect adjusts ceiling height (2000–5000 mm) and
   opening height (1800 mm–ceiling) (FR-APT-01/02). From these the app computes a
   module suggestion: the raw GCD snapped to the nearest standard module, with
   alternatives and the snap residual shown alongside (FR-MODULE-01/03). The module
   is a dropdown the architect can override; whatever they choose drives every
   downstream calculation, never the raw GCD (FR-APT-03, FR-MODULE-02).
3. **Add rooms.** Starting from one room, the architect names each room and enters
   its length and width (500–15000 mm), adding and removing rooms as needed — the
   last room can't be removed (FR-ROOM-01/02/03). Every field validates inline with
   a red border and a localized message (FR-APT-04, FR-ROOM-04).
4. **Read the module summary.** The active module is shown large (e.g. "M = 700
   mm") with a "suggested from heights" hint, and a ruler table lists ¼M through 4M
   with typical uses (FR-MODULE-03/04). If the module is impractically large or
   small, a warning banner explains why (FR-MODULE-05).
5. **Read the vertical bands.** A responsive SVG diagram stacks `round(ceiling / m)`
   height bands — variable, never hardcoded — with mm labels on the left and band
   names on the right (FR-VERT-01/02/05/06). The opening line is highlighted; when
   it doesn't fall on a band boundary it's drawn as an honest off-grid marker, and
   any leftover height above the last full module shows as a partial band
   (FR-VERT-03/04).
6. **Read each room.** One card per room shows the golden-ratio split of its longer
   wall — exact values, values snapped to the nearest ½M, and the snap offset, with
   offsets over ¼M flagged "approximate fit" (FR-GOLD-01/03/04). It shows grid fit
   as modules × modules with signed remainders and an `exact` / `close` / `poor`
   quality badge (FR-GRID-01/03/04/05). And it shows walkway estimates for common
   furniture against fixed ergonomic thresholds — ≥ 900 comfortable, ≥ 600
   acceptable, < 600 tight (FR-WALK-01/03/04).
7. **Switch language.** At any point the architect flips the toggle and all UI
   strings switch between Ukrainian and English; calculation labels like ¼M stay
   the same in both (FR-I18N-01/02/03).

## Key workflows in prose

- **Find a defensible module.** Enter the ceiling and opening heights, read the
  suggested module with its alternatives and residual, and either accept it or pick
  a better standard value from the dropdown. This is the decision the whole tool is
  built around, and it is deliberately a suggestion, not an automatic verdict.
- **Proportion a room.** Add a room, enter its dimensions, and read the golden-ratio
  split, the grid-fit quality, and the walkway clearances in one card — then adjust
  the dimensions and watch all three update live.
- **Sanity-check the section.** Read the vertical-band diagram to see how the
  chosen module divides the ceiling, where the opening lands relative to the grid,
  and how much height is left over at the top.

## MVP vs Future boundary

**In the MVP:** the reactive single-page shell with side-by-side input and
results; the apartment and room input forms with inline validation; the module
engine with suggestion, alternatives, residual, override, ruler table, and
impractical-module warnings; the variable-count vertical-band SVG with off-grid
opening marker and top remainder; the per-room golden-ratio split, grid-fit
quality, and walkway checks; and the bilingual UA/EN toggle — all client-side,
all synchronous.

**Future (deferred):** the PRD's out-of-scope list, none of which is built —
export (PDF, CSV, image); persistence or saved projects; an interactive
floor-plan or drag-and-drop editor; user accounts; any API, server action, or
database; localisation beyond UA + EN; and a native mobile app.

## Operating principles

- **Pure and instant.** All math lives in framework-free pure functions and runs
  synchronously on every input change; there are no effects, no async, and no
  server round-trips (NFR-PERF-01, NFR-PURE-01).
- **Honest about approximation.** The module is a suggestion the architect owns,
  not a silently-derived truth; snaps, residuals, off-grid openings, and top
  remainders are surfaced rather than hidden (BC-MODULE-01, FR-VERT-03/04,
  FR-GOLD-04).
- **Human dimensions stay human.** Walkway comfort is expressed in fixed millimetre
  thresholds and never scales with the module (BC-WALK-01, FR-WALK-03).
- **Data-dense and calm.** A white, professional layout with monospace dimensions,
  dark-mode support, and bilingual UA/EN strings — numbers first, decoration last
  (TC-STACK-02/03, BC-VALUE-01).

## What we're betting on (and what could prove us wrong)

The product rests on a few assumptions worth stating plainly; the full list and the
risks they create are tracked in [docs/PDR.md](PDR.md#assumptions).

- We assume the standard module set and default furniture depths match how target
  architects actually work. If the suggested modules feel wrong, trust in the core
  feature collapses — so the module is always shown as a traceable suggestion with
  alternatives, never an opaque verdict (open question OQ-01).
- We assume architects transcribe results into CAD immediately and so need no save
  or export in v1. If sessions show people losing work or wanting to share results,
  persistence or a print view moves up the roadmap (OQ-03).
- We assume analytics-free is the right call. The cost is no post-launch signal on
  adoption or quality; we accept that for v1 and lean on pre-launch usability
  sessions, revisiting only if a concrete need emerges.
