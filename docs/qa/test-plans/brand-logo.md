# Manual Test Plan — `brand-logo`

> Written at the QA stage of the `ship-capability` loop for the **final** change of the
> 16-capability backlog. FR-LOGO-01 is **pure static SVG markup** — there is **no automated
> coverage possible** for hand-authored markup under the node `--test` runner (ADR-0001), so the
> whole requirement is verified **manually / structurally** here (and, at build time, by the 99/99
> unchanged test suite + clean lint, since no engine code changed). Everything below is a manual
> visual/structural check.

- **Change:** `brand-logo`
- **Owned requirement IDs:** `FR-LOGO-01`
- **Last updated:** `2026-07-03T22:30:00+03:00`
- **Source of truth:** [docs/DESIGN.md](../../DESIGN.md) §7 (logo mark) /
  [docs/superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md](../../superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md);
  [docs/PDR.md](../../PDR.md) L182.

## Preconditions (all cases)

- App running via `npm run dev`; browser at the local URL.
- The header renders at the top of the page with the app title. In light theme by default; a dark
  theme is available via the OS/browser `prefers-color-scheme` (or the app's theme mechanism).

## Cases

### TC-1 — Golden-ratio mark renders left of the title, in the accent color  (FR-LOGO-01)

- **Automated (support):** none — static SVG markup, no unit test possible (ADR-0001). Build 99/99
  tests unchanged + lint clean confirm no regression.
- **Steps:**
  1. Load the app. Confirm a **golden-ratio SVG mark** — nested φ:1 rectangles with a golden-spiral
     arc — appears in the header **left of the title**, drawn in the **accent** color (blue), on a
     **transparent** background (no box/fill behind it).
  2. Inspect the header in devtools. Confirm the mark is an **inline `<svg>`** (from
     `components/Logo.tsx`) with `viewBox="0 0 110 70"`, `stroke="currentColor"`, `fill="none"`, and
     `aria-hidden="true"` — and that the **old `border-2 border-accent` placeholder span is gone**.
  3. Confirm the SVG is **not** an `<img>` and pulls **no raster asset** (no `.png`/`.jpg`).
- **Expected:** the golden-ratio SVG sits left of the title, accent-colored via `currentColor`,
  transparent ground, `aria-hidden` (the title carries the accessible name), no raster.
- **Result:** `pass` — manual/structural (ADR-0001). Verified by all 3 reviewers (Logo.tsx matches
  DESIGN §7 verbatim as a Server Component) and RUNTIME-VERIFIED by the Maker (header renders the SVG,
  viewBox 0 0 110 70 present, placeholder removed).

### TC-2 — Mark inverts with the theme  (FR-LOGO-01)

- **Steps:**
  1. In **light** theme, note the mark's accent color.
  2. Switch to **dark** theme (OS/browser `prefers-color-scheme: dark` or the app's toggle). Confirm
     the mark's color **follows the accent token** and inverts appropriately with the theme — driven
     by `currentColor` inheriting `text-accent` (→ `color: var(--accent)`), **with no separate
     asset** swapped in.
- **Expected:** the mark recolors with the theme via `currentColor` / the accent token; a single
  asset serves both themes.
- **Result:** `pass` — manual (ADR-0001). Shell's `text-accent` maps via `@theme`
  (`--color-accent: var(--accent)`) to `color: var(--accent)`, feeding `currentColor` and inverting
  in dark; confirmed by the code-reviewer.

### TC-3 — Same mark serves as a legible SVG favicon  (FR-LOGO-01)

- **Steps:**
  1. Confirm the **browser tab** shows the golden-ratio mark as the **favicon** (not the framework
     default), legible at small size — the padded square `app/icon.svg` (`viewBox -13 -33 136 136`)
     keeps the mark from being clipped/squished at 32×32.
  2. Open the page source / devtools `<head>` and confirm Next auto-injected
     `<link rel="icon" type="image/svg+xml" ...>` pointing at `/icon.svg`.
  3. Navigate directly to **`/icon.svg`**. Confirm it serves **HTTP 200** as an SVG with an explicit
     hex fill/stroke **`#3f6fb5`** (a same-hue-248 approximation of `--accent oklch(0.55 0.13 248)` —
     justified because a favicon has **no CSS context**, so `currentColor` would fall back to black),
     and contains **no raster** and no `<script>`/`<foreignObject>`/`<use>`/external `url()`.
  4. Confirm **`package.json` / `package-lock.json` are unchanged** by this change — **no new
     dependency** was added and **no raster asset** introduced.
- **Expected:** the SVG favicon is registered, renders legibly at favicon size, uses an explicit
  accent-hue hex, carries no raster and no new dependency.
- **Result:** `pass` — manual/structural (ADR-0001). RUNTIME-VERIFIED by the Maker (/icon.svg → HTTP
  200 with `#3f6fb5`, `<link rel="icon" type="image/svg+xml">` auto-injected in `<head>`); the
  no-new-dep / no-raster facts confirmed by all 3 reviewers (package.json/lock unchanged); the
  security-reviewer confirmed the favicon is a local static asset, not a tracking pixel.
