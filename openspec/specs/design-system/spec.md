# design-system Specification

## Purpose
TBD - created by archiving change design-system. Update Purpose after archive.
## Requirements
### Requirement: Tailwind 4 utilities with token theme wiring

The stylesheet SHALL use Tailwind CSS 4 via `@import "tailwindcss"` and expose the design
tokens to utilities through `@theme inline` (color tokens as `--color-*`, plus `--font-sans`
and `--font-mono`). No custom CSS SHALL be added beyond `app/globals.css` — components use
Tailwind utility classes only. (`TC-STACK-02`)

#### Scenario: Utilities resolve from tokens

- **WHEN** a component uses a utility such as `bg-panel`, `text-muted`, or `font-mono`
- **THEN** it resolves to the corresponding CSS custom property defined in `globals.css`, with
  no per-component custom stylesheet

#### Scenario: Boilerplate removed

- **WHEN** `app/globals.css` is inspected
- **THEN** the create-next-app `--background`/`--foreground` variables and the `Arial` body
  font are gone, replaced by the design tokens

### Requirement: Inter and JetBrains Mono typography

UI text SHALL use Inter and every numeric / dimension value SHALL use JetBrains Mono, both
self-hosted via `next/font/google` and exposed as `--font-sans` / `--font-mono`. The body SHALL
set tabular numerals (`font-feature-settings: "tnum" 1, "cv01" 1`) so numeric columns align.
Geist / Geist Mono SHALL be removed. (`TC-STACK-03`)

#### Scenario: Fonts wired through next/font

- **WHEN** `app/layout.tsx` is inspected
- **THEN** it imports `Inter` and `JetBrains_Mono` from `next/font/google`, binds them to
  `--font-sans` and `--font-mono`, and no longer imports Geist

#### Scenario: Numbers render in mono

- **WHEN** a numeric value is rendered with the `font-mono` utility
- **THEN** it uses the JetBrains Mono stack with tabular numerals active

### Requirement: OKLCH light and dark color tokens

`globals.css` SHALL define the full token set — surfaces (`--bg`, `--panel`, `--panel2`,
`--inset`), text (`--fg`, `--fg2`, `--muted`, `--faint`), lines (`--line`, `--line2`), `--field`,
the OKLCH accent (`--accent`, `--accent-fg`, `--accent-bg`, `--accent-line`), and OKLCH status
tokens (`--good`, `--warn`, `--bad`, `--err`, each with a `-bg`) — with the light values on
`:root` and the dark values on `[data-theme="dark"]`. Accent and status colors SHALL be OKLCH.
The default theme SHALL be light. (`TC-STACK-03`, DESIGN §3)

#### Scenario: Light is the default

- **WHEN** the document loads without a theme override
- **THEN** `data-theme` is `light` and the `:root` light token values are in effect

#### Scenario: Dark theme swaps tokens on one selector

- **WHEN** `data-theme="dark"` is set on `<html>`
- **THEN** the dark token values apply AND Tailwind `dark:` utilities activate off the same
  `[data-theme="dark"]` selector (via `@custom-variant dark`)

### Requirement: WCAG AA contrast and non-color-only status

The palette SHALL meet WCAG AA contrast in both light and dark themes for body text and UI
labels. Status meaning (grid `exact/close/poor`; walkway `comfortable/acceptable/tight`; invalid
fields) SHALL never be conveyed by color alone — the token system SHALL be paired with a text
label and an icon at the component layer, and this foundation SHALL provide the `--good/--warn/--bad/--err`
tokens plus distinct `-bg` fills that keep the pairing legible. Focus styles SHALL be visible
(`outline: 2px solid var(--accent)`). (`NFR-A11Y-02`)

#### Scenario: Body text meets AA in both themes

- **WHEN** `--fg` on `--bg` (and `--fg` on `--panel`) contrast is measured in light and in dark
- **THEN** the ratio is at least 4.5:1 for normal text in both themes

#### Scenario: Focus is always visible

- **WHEN** any focusable element receives keyboard focus
- **THEN** a `2px solid var(--accent)` outline is shown

### Requirement: Motion keyframes with reduced-motion suppression

`globals.css` SHALL define the shared animation keyframes (`livedot`, `griddraw`, `cellpulse`,
`spin3d`) for later capabilities to consume, and SHALL globally disable all animation under
`@media (prefers-reduced-motion: reduce)`. Motion is decorative — nothing depends on it. (DESIGN §8)

#### Scenario: Keyframes available

- **WHEN** a later component applies `animation: cellpulse ...` or `griddraw ...`
- **THEN** the keyframes are defined in `globals.css`

#### Scenario: Reduced motion snaps

- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** all animations are suppressed (`animation: none`)

