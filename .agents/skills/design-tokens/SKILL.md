---
name: design-tokens
description: The visual foundation for the Apartment Module & Golden Ratio Calculator — design principles, Inter/JetBrains-Mono typography (the "mono-for-numbers" signature rule), the OKLCH light/dark color tokens, motion keyframes, and accessibility rules. Use whenever styling any component, choosing a color/token, setting type, adding animation, or checking contrast/focus/reduced-motion. Distilled from docs/DESIGN.md §1–3, §8–9.
license: Apache-2.0
metadata:
  version: "1.0.0"
  updated: 2026-06-30
  category: design
  source: docs/DESIGN.md
---

# Design Tokens, Type, Color, Motion & A11y

The cross-cutting visual foundation applied to **every** component. When visual scope is
unclear, resolve it against [docs/DESIGN.md](../../../docs/DESIGN.md); behaviour against
[docs/PDR.md](../../../docs/PDR.md).

## When to use

- Styling any component, panel, badge, input, or SVG.
- Picking a color, surface, border, or status token.
- Setting fonts/weights or formatting a numeric value.
- Adding or reviewing animation, focus states, or contrast.

## 1. Design principles

A **precise engineering instrument**, not a marketing page. Numbers first, decoration
last. The user (architect "Maria") distrusts black boxes — **every derived value shows its
origin**, and the module is a *suggestion she can override*, never a verdict. Surface
approximation honestly: residuals, snap offsets, off-grid markers, signed remainders, and
leftover heights are shown, not hidden. Calm, dense, austere, in mm.

## 2. Typography

- **Sans (UI labels, prose):** `'Inter', system-ui, -apple-system, sans-serif` (400/500/600/700).
- **Mono (every numeric / dimension value):** `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace` (400/500/600/700).
- **Mono-for-numbers is the signature rule:** apply mono to *every* measurement — heights,
  mm figures, module counts, multiples, remainders, offsets, ranges, the `M = 700` hero.
- Body sets `font-feature-settings: "tnum" 1, "cv01" 1` (tabular numerals so columns align).
- **Self-host via `next/font`** (the export loaded from Google Fonts; Inter + JetBrains Mono
  is canonical — overrides the brief's "Geist / Geist Mono" suggestion).

## 3. Color tokens

CSS custom properties, verbatim from the export. Accent/status colors are **OKLCH** so they
stay perceptually even across themes. Expose as CSS variables (or Tailwind theme tokens) and
switch on `html[data-theme]`. **Default theme is light.**

### Light (`:root`)
```css
--sans:'Inter',system-ui,-apple-system,sans-serif;
--mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
--bg:#fbfbfa; --panel:#ffffff; --panel2:#f6f6f4; --inset:#f1f1ee;
--fg:#1a1a18; --fg2:#3a3a36; --muted:#73736c; --faint:#9a9a91;
--line:rgba(20,20,16,.10); --line2:rgba(20,20,16,.18); --field:#ffffff;
--accent:oklch(0.55 0.13 248); --accent-fg:#ffffff; --accent-bg:oklch(0.95 0.03 248); --accent-line:oklch(0.80 0.07 248);
--good:oklch(0.52 0.12 150); --good-bg:oklch(0.95 0.04 150);
--warn:oklch(0.58 0.11 70);  --warn-bg:oklch(0.95 0.05 75);
--bad:oklch(0.52 0.17 28);   --bad-bg:oklch(0.95 0.04 28);
--err:oklch(0.52 0.17 28);   --err-bg:oklch(0.96 0.03 28);
```

### Dark (`html[data-theme="dark"]`)
```css
--bg:#0e0e0d; --panel:#161614; --panel2:#1c1c1a; --inset:#222220;
--fg:#ededea; --fg2:#cfcfc9; --muted:#a0a097; --faint:#6f6f67;
--line:rgba(255,255,250,.12); --line2:rgba(255,255,250,.22); --field:#1b1b19;
--accent:oklch(0.74 0.13 248); --accent-fg:#0e0e0d; --accent-bg:oklch(0.30 0.06 248); --accent-line:oklch(0.45 0.09 248);
--good:oklch(0.74 0.13 150); --good-bg:oklch(0.30 0.06 150);
--warn:oklch(0.78 0.12 75);  --warn-bg:oklch(0.32 0.06 75);
--bad:oklch(0.70 0.16 28);   --bad-bg:oklch(0.32 0.07 28);
--err:oklch(0.70 0.16 28);   --err-bg:oklch(0.30 0.06 28);
```

### Semantics
| Token | Meaning |
|---|---|
| `--bg` / `--panel` / `--panel2` / `--inset` | page → card → card-header / sunken fill (deepest) |
| `--fg` / `--fg2` / `--muted` / `--faint` | primary → secondary text → labels → hints/units |
| `--line` / `--line2` | hairline border → stronger border (inputs, dividers) |
| `--field` | input background |
| `--accent` (+ `-fg`/`-bg`/`-line`) | interactive, snapped values, highlighted module, opening line |
| `--good` / `--warn` / `--bad` | grid `exact`/`close`/`poor`; walkway `comfortable`/`acceptable`/`tight` |
| `--err` | invalid field border + inline error text |

**Never color-only:** every quality/rating badge pairs the color with a text label and an
icon (`✓` exact·comfortable, `≈` close·approximate, `✕`/⚠ poor·tight).

## 8. Motion

Keyframes from the export; **all suppressed under reduced-motion**. Motion is decorative —
nothing depends on it.
```css
@keyframes livedot  {0%,100%{opacity:1}50%{opacity:.25}}            /* "updates live" dot */
@keyframes griddraw {from{stroke-dashoffset:240}to{stroke-dashoffset:0}} /* 2D grid draw-in */
@keyframes cellpulse{0%,100%{opacity:.85}50%{opacity:.45}}         /* highlighted module cell/cube */
@keyframes spin3d   {from{transform:rotateX(-22deg) rotateY(0deg)}to{transform:rotateX(-22deg) rotateY(360deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
```
`griddraw` accompanies the 2D visualizer; `spin3d` is the gentle 3D auto-rotate (paused on drag).

## 9. Accessibility

- Every input has a visible `<label>`; validation messages use `role="alert"` tied to their
  field; invalid fields set `aria-invalid`.
- Visible focus styles everywhere: `outline:2px solid var(--accent)`.
- **WCAG-AA contrast in both themes.** Badges legible **without color** (label + icon).
- Results region is `aria-live="polite"`. Decorative SVG uses `aria-hidden`; meaningful SVG
  uses `role="img"` + `aria-label`. `prefers-reduced-motion` disables all animation.
