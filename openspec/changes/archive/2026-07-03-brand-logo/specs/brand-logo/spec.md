## ADDED Requirements

### Requirement: Golden-ratio SVG brand mark in the header

The header SHALL display a golden-ratio SVG logo — nested φ:1 rectangles with a golden-spiral arc —
positioned left of the title. It SHALL use a single color via `currentColor` (inheriting the
accent, inverting in dark mode) on a transparent ground, contain no raster assets, and add no new
dependency. It SHALL be `aria-hidden` (the title provides the accessible name). (`FR-LOGO-01`)

#### Scenario: Logo renders left of the title

- **WHEN** the app header renders
- **THEN** the golden-ratio SVG mark appears left of the title, drawn in the accent color via
  `currentColor`, with a transparent background and no `<img>`/raster asset

#### Scenario: Inverts with the theme

- **WHEN** the theme switches between light and dark
- **THEN** the mark's color follows `currentColor` (the accent token) without a separate asset

### Requirement: Mark scales to a favicon

The same mark SHALL serve as the site favicon, readable at favicon size, with no raster asset.
(`FR-LOGO-01`)

#### Scenario: Favicon registered

- **WHEN** the site loads
- **THEN** an SVG favicon (`app/icon.svg`, the same golden-ratio mark) is registered as the site
  icon and renders legibly at small size
