# app-shell Specification

## Purpose
TBD - created by archiving change app-shell. Update Purpose after archive.
## Requirements
### Requirement: Single-page shell with input and results columns

The app SHALL render a single page with an input column (apartment fields + room list slots) and a
live results panel. `app/page.tsx` SHALL remain a Server Component that renders the single
`Calculator` client component; `Calculator` SHALL be the only `'use client'` state boundary and
SHALL own the application state (`ceiling`, `opening`, `module`, `rooms`), with results flowing
down as props. (`FR-SHELL-01`, `TC-CLIENT-01`, `TC-ARCH-01`)

#### Scenario: Server page, single client boundary

- **WHEN** `app/page.tsx` is inspected
- **THEN** it has no `'use client'` directive and renders `<Calculator />`, which is the single
  client boundary that owns the state via `useState`

#### Scenario: Both columns present

- **WHEN** the shell renders with valid default state
- **THEN** an input column and a results region are both present in the layout

### Requirement: Responsive stacking layout

The layout SHALL place the input and results columns side by side on wide screens (a CSS grid
`minmax(320px,400px) 1fr`) and SHALL stack them vertically (inputs above results) below the
two-column breakpoint. The header SHALL wrap. No fixed pixel widths SHALL prevent the layout from
scaling. (`FR-SHELL-02`, `NFR-RESP-01`)

#### Scenario: Wide screen is two columns

- **WHEN** the viewport is wide
- **THEN** inputs and results sit side by side within a centered `max-width` container

#### Scenario: Narrow screen stacks

- **WHEN** the viewport is below the breakpoint
- **THEN** the columns stack vertically with inputs above results and the header wraps

### Requirement: Language toggle in the header

A language toggle (`EN | UA`) SHALL sit in the top-right of the header and switch all UI strings
live. The shell SHALL mount the `LanguageProvider` so the toggle and every string resolve through
`t()`. (`FR-SHELL-03`)

#### Scenario: Toggle placed and live

- **WHEN** the header renders
- **THEN** the `LanguageToggle` is in the top-right, and activating the other language re-renders
  all shell strings without a reload

### Requirement: Results gated on full input validity

The results region SHALL render only when the apartment fields are valid AND at least one room is
valid; otherwise it SHALL show a dashed empty-state card with the localized `fillToSee` message.
The validity predicate SHALL be a pure function composed from the engine's bounds
(`isValidCeiling`/`isValidOpening`/`isValidDimension`) and SHALL be computed synchronously with no
async or effects in the compute path. The results region SHALL be `aria-live="polite"`.
(`FR-SHELL-04`, `NFR-PERF-01`, `NFR-A11Y-01`)

#### Scenario: Valid input shows results

- **WHEN** the apartment fields are valid and at least one room is valid
- **THEN** `showResults` is true and the results region renders (not the empty state)

#### Scenario: Invalid input hides results

- **WHEN** the ceiling is out of bounds, or no room is valid
- **THEN** `showResults` is false and the dashed empty-state card with `fillToSee` renders instead

#### Scenario: Gate is synchronous and pure

- **WHEN** `showResults(state)` is evaluated
- **THEN** it returns deterministically from pure bound checks with no promises, timers, or effects

### Requirement: Accessible header controls and synchronous reactivity

There SHALL be no submit button — the shell is reactive and recomputes on state change on the same
frame (`NFR-PERF-01`). Header controls (theme toggle, language toggle) SHALL have accessible labels
and visible focus, and interactive state SHALL be conveyed without relying on color alone.
(`NFR-A11Y-01`, `FR-SHELL-01`)

#### Scenario: No submit button

- **WHEN** the shell renders
- **THEN** there is no submit/apply button; state changes recompute `showResults` synchronously

#### Scenario: Header controls are labelled and focusable

- **WHEN** a keyboard user tabs to the theme or language control
- **THEN** each exposes an accessible name and shows a visible focus outline

