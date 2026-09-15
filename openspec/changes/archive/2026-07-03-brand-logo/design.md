## Context

`app-shell` (4) shipped the header with an `aria-hidden` placeholder `<span>` (a bordered box) in
the logo slot, left of the title. DESIGN §7 gives the golden-ratio mark **verbatim** as pure SVG
(nested golden rectangles subdivided φ:1 + three golden-spiral arcs, `currentColor`, transparent).
This change ports it into a component and a favicon. It is the last and simplest capability.

## Goals / Non-Goals

**Goals**
- The DESIGN §7 mark in the header via `currentColor` (inherits accent, inverts in dark), no raster,
  no new dep (`FR-LOGO-01`).
- The same mark as a scalable SVG favicon.

**Non-Goals**
- Any animation, interactivity, or theming beyond `currentColor`.
- Touching the title/subtitle/toggles or any other header element.

## Decisions

### `Logo.tsx` is a Server Component, mark copied verbatim from DESIGN §7
Pure markup, no state/handlers → no `'use client'` (narrowest boundary, per the nextjs-frontend
skill). The SVG paths are the DESIGN §7 export verbatim (nested φ:1 rects + the three spiral arcs),
so the shipped mark matches the frozen design exactly rather than a re-derivation. Props
`width`/`height`/`className` default to the header size (~40×26 over the `0 0 110 70` viewBox);
`aria-hidden="true"` because the adjacent `<h1>` title is the accessible name (avoids a redundant
SR announcement). `currentColor` means the color comes from the CSS `color` of the element — the
header wraps it in `text-accent`, so it resolves to the accent token and inverts with the theme.

### `app/icon.svg` for the favicon — but with an explicit color, not `currentColor`
Next.js auto-registers `app/icon.svg` as the site icon (overriding the default `app/favicon.ico`),
which satisfies "scales to a favicon" with a real vector asset. Caveat: a favicon SVG is rendered
**outside any CSS context**, so `currentColor` has no `color` to inherit and would fall back to
black. The icon file therefore hard-codes the accent color value (the light-theme `--accent`
resolved to a hex/`oklch()` literal) rather than `currentColor`. This is the one intentional
deviation from the header's `currentColor` approach, dictated by how favicons render; documented so
a reviewer doesn't flag the inconsistency. The mark geometry is otherwise identical.

### Keep the default `app/favicon.ico`?
`app/icon.svg` takes precedence in modern browsers; the existing `app/favicon.ico` stays as a
legacy fallback (harmless, and removing it is out of scope). No change to `app/layout.tsx` metadata
is needed — the `app/icon.svg` convention is automatic.

## Risks / Trade-offs

- **Favicon color is static (light-accent) and won't invert for dark-mode browser chrome.** A
  single SVG favicon can't theme to the OS/browser dark chrome without a `<style
  media="(prefers-color-scheme)">` inside the SVG. For a v1 brand mark this is acceptable (the
  favicon reads on both light and dark tab bars given the accent's mid-tone); noted rather than
  over-engineered. The *header* logo does invert correctly via `currentColor`.
- **No React/DOM runner (ADR-0001).** The component is static markup — verified by build + tsc +
  lint + a runtime check that the header renders the SVG (not the placeholder) and the favicon is
  served. Nothing to unit-test (no logic).

## Migration Plan

Additive: a new component + a new icon file, and a one-line placeholder swap in `Shell`. No archived
change, spec, state, or dependency altered. No data migration.

## Open Questions

- None. This closes the backlog.
