## Why

The app is still create-next-app boilerplate: `app/globals.css` ships placeholder
`--background`/`--foreground` vars and an `Arial` body font; `app/layout.tsx` loads Geist /
Geist Mono. Every UI capability (shell, inputs, the four result sections, the visualizers)
consumes a shared visual foundation — OKLCH color tokens, the Inter / JetBrains-Mono type
system with the mono-for-numbers rule, dark mode, and accessible focus/contrast. Building that
foundation **once, now** (capability 2 in [docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md),
dependency-free) prevents every later change from re-deriving colors and fonts and keeps them
thin. Owns `TC-STACK-02`, `TC-STACK-03`, `NFR-A11Y-02`.

## What Changes

- **Rewrite `app/globals.css`** to the design source of truth ([docs/DESIGN.md](../../../docs/DESIGN.md)
  §1–3, §8–9 / the `design-tokens` skill):
  - `@import "tailwindcss"` (Tailwind 4, utilities only — `TC-STACK-02`).
  - Light tokens on `:root` and dark tokens on `[data-theme="dark"]`: surfaces
    (`--bg/--panel/--panel2/--inset`), text (`--fg/--fg2/--muted/--faint`), lines, `--field`,
    OKLCH `--accent(+-fg/-bg/-line)`, and status `--good/--warn/--bad/--err(+-bg)`.
  - Map tokens into Tailwind's theme via `@theme inline` (`--color-*`, `--font-sans`,
    `--font-mono`) so utilities like `bg-panel`, `text-muted`, `font-mono` resolve.
  - A `@custom-variant dark` bound to `[data-theme="dark"]` so Tailwind `dark:` utilities and
    the token switch share one selector (reconciles `TC-STACK-03`'s "`dark:` variants" with
    DESIGN's `html[data-theme]` switch).
  - Base `body`: `--sans` font, `--bg`/`--fg`, and `font-feature-settings: "tnum" 1, "cv01" 1`
    (tabular numerals).
  - Motion keyframes (`livedot`, `griddraw`, `cellpulse`, `spin3d`) + a global
    `prefers-reduced-motion` suppressor; a visible focus style (`outline: 2px solid var(--accent)`).
  - Remove all create-next-app boilerplate (`--background`/`--foreground`, `Arial`).
- **Update `app/layout.tsx`**: self-host **Inter** (sans) + **JetBrains Mono** (mono) via
  `next/font/google` exposed as `--font-sans`/`--font-mono` (`TC-STACK-03`), drop Geist; set
  `data-theme="light"` (default light) and `suppressHydrationWarning`; replace the placeholder
  title/description metadata.

Foundation only — no page content, components, or strings (those are `app-shell`, the input,
and result capabilities). Default theme is **light**.

## Capabilities

### New Capabilities
- `design-system`: the shared visual foundation — OKLCH light/dark color tokens, the
  Inter/JetBrains-Mono type system (mono-for-numbers), Tailwind 4 token wiring + `dark:`
  variant, base element styles, motion keyframes with reduced-motion, and accessible
  focus/contrast (WCAG AA both themes; no color-only status).

### Modified Capabilities
<!-- none — no existing spec's requirements change -->

## Impact

- **Files:** rewrite `app/globals.css`; edit `app/layout.tsx`. No new dependencies (Inter +
  JetBrains Mono come from `next/font/google`; Tailwind 4 already installed).
- **Requirements owned:** `TC-STACK-02`, `TC-STACK-03`, `NFR-A11Y-02`.
- **Enables:** `app-shell` (4) and every UI capability, which consume these tokens/fonts.
- **No impact on:** `lib/` (the shipped engine), routing, server. Parallel-safe with `i18n` (3).
