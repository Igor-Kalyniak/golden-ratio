## Context

Capability 2 in [docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md), dependency-free. The repo
is scaffolded Next.js 16 / React 19 / Tailwind 4 with default create-next-app styling. The design
source of truth is [docs/DESIGN.md](../../../docs/DESIGN.md) §1–3 (principles, typography, color
tokens), §8 (motion), §9 (accessibility), distilled into the `design-tokens` skill. The tokens are
frozen verbatim from the Claude Design export; this change ports them into a Tailwind 4 stylesheet
and swaps the font wiring. No component markup exists yet — this is pure foundation.

## Goals / Non-Goals

**Goals:**
- Port the DESIGN §3 light/dark token set verbatim into `app/globals.css`.
- Wire Inter (sans) + JetBrains Mono (mono) via `next/font/google`; enforce the mono-for-numbers
  rule structurally by exposing `--font-mono` for a `font-mono` utility.
- Make Tailwind `dark:` utilities and the token switch share one `[data-theme="dark"]` selector.
- Provide motion keyframes + reduced-motion suppression and a visible focus style.
- Meet WCAG AA contrast in both themes; keep status legible without color (token layer).

**Non-Goals:**
- No page shell, header, inputs, results, or visualizer markup (later capabilities).
- No theme-toggle UI or persistence (BC-PRIVACY-01) — this change only defines the tokens and
  defaults to light; a toggle, if any, is a later concern.
- No i18n strings (capability 3).

## Decisions

- **Tokens live as CSS custom properties, mapped into Tailwind via `@theme inline`.** Keeps the
  DESIGN values as the single source and still lets components use utilities (`bg-panel`,
  `text-muted`, `border-line`, `font-mono`) — satisfying `TC-STACK-02` (utilities only). Alt
  considered: raw CSS classes — rejected (violates utilities-only).
- **One dark selector via `@custom-variant dark ([data-theme="dark"] &)`.** DESIGN switches on
  `html[data-theme="dark"]`; `TC-STACK-03` says "Tailwind `dark:` variants". Tailwind 4's
  `@custom-variant` binds the `dark:` variant to the same attribute, so both are true with one
  mechanism. Alt: Tailwind's default `prefers-color-scheme` — rejected (DESIGN mandates an explicit
  attribute so a future toggle can override the OS setting).
- **Self-host fonts through `next/font/google`.** Inter + JetBrains Mono, `display: swap`, exposed
  as CSS variables on `<html>`. Overrides the brief's Geist suggestion per DESIGN §2. Weights
  400/500/600/700.
- **Default theme light**, set as `data-theme="light"` on `<html>` with
  `suppressHydrationWarning` (so a later client toggle can flip it without a mismatch warning).
- **Verbatim token values.** Colors are copied exactly from DESIGN §3 (hex surfaces/text, OKLCH
  accent/status) so contrast and worked-example rendering stay faithful; no re-derivation.

## Risks / Trade-offs

- **AA contrast must actually hold for the ported values** → Verified against the DESIGN palette
  during apply and recorded in the QA test plan (the pairs `--fg/--bg`, `--fg/--panel`,
  `--muted/--bg` in both themes); if any pair falls short it is a token-tuning fix, isolated to
  `globals.css`.
- **Tailwind 4 `@theme inline` + `@custom-variant` syntax is version-sensitive** → Pinned to the
  installed Tailwind 4; verified by `npm run build`/lint at apply time.
- **`next/font` requires network at build to fetch fonts** → Known constraint in this environment;
  fonts are cached by Next after first fetch. If the initial fetch is blocked, the CSS variable
  stack still degrades to the system fallbacks in the token (`system-ui`, `ui-monospace`).
- **No automated visual/contrast test runner** → This capability adds no `lib` unit tests; it is
  verified by build + lint + a manual contrast/QA checklist (documented in the test plan).

## Migration Plan

Rewrite `app/globals.css` and edit `app/layout.tsx`. Additive/replacement only; no data, no
routing, no dependency changes. Reversible by restoring the two files. `app/` currently renders
default boilerplate, so no user-facing regression.

## Open Questions

- Whether a light/dark **toggle** ships in v1 and where it lives — deferred to a later shell/UX
  decision; this change only makes dark mode *possible* and defaults to light.
- A print-friendly theme (`OQ-03`) — out of scope here.
