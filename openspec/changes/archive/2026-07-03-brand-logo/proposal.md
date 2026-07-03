## Why

Every capability is shipped except the header's brand mark — `app-shell` (4) left an `aria-hidden`
bordered-`<span>` placeholder where the logo belongs. `brand-logo` replaces it with the actual
golden-ratio SVG mark (nested φ:1 rectangles + a golden-spiral arc), tying the app's identity to the
proportional idea it computes. It also delivers a matching favicon so the mark "scales to a
favicon" per the requirement. This is the smallest, lowest-risk change in the plan and its
**final** one — shipping it completes the full 16-capability backlog. Capability 16 in
[docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md); its only prerequisite `app-shell` (4) is
archived. Owns `FR-LOGO-01`.

## What Changes

- **`components/Logo.tsx`**: a pure presentational SVG component — the DESIGN §7 verbatim mark
  (nested golden rectangles subdivided φ:1 with the golden-spiral arc sweeping through them), a
  single color via `currentColor` (so it inherits the header's accent and inverts correctly in dark
  mode), transparent ground, no raster assets. Accepts optional `width`/`height`/`className` so it
  serves both the header and any future placement. `aria-hidden` (the adjacent `<h1>` title is the
  accessible name). It is a Server Component (no `'use client'` — pure markup, no interactivity).
- **`components/Shell.tsx`**: replace the placeholder `<span>` (the `h-6 w-6 rounded-sm
  border-2 border-accent` box) with `<Logo />`, sized to the header (~40×26 at the `viewBox`'s
  ratio) and colored `text-accent` so `currentColor` resolves to the accent token.
- **`app/icon.svg`**: the same mark as a Next.js convention-based favicon (`app/icon.svg`
  auto-registers as the site icon, overriding the default `app/favicon.ico`), with an explicit
  color (the SVG file has no CSS context, so `currentColor` won't resolve — the file uses the
  accent hex/`#…` value directly) on a transparent ground, readable at favicon size (the `110×70`
  viewBox scales down cleanly). No raster assets, no new dependency.

Scope is the logo only. No behavior, state, calculation, or i18n changes — the title/subtitle text
already renders via `t()`. No new dependency (pure inline SVG, `FR-LOGO-01`'s "no new deps").

## Capabilities

### New Capabilities
- `brand-logo`: the golden-ratio SVG brand mark in the header (`currentColor`, transparent,
  favicon-scalable) plus a matching `app/icon.svg` favicon.

### Modified Capabilities
<!-- none — app-shell's spec (header structure) is unchanged; this fills its logo slot. -->

## Impact

- **Files:** add `components/Logo.tsx` + `app/icon.svg`; edit `components/Shell.tsx` (swap the
  placeholder). No new dependency; no i18n; no state.
- **Requirements owned:** `FR-LOGO-01`.
- **Consumes (shipped):** the header slot + `--accent` token from `app-shell`/`design-system`.
- **Enables:** completes the backlog — Epic A (1–11) + Epic B (12–16) all shipped.
