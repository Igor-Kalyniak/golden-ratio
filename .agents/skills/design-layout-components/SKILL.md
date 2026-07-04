---
name: design-layout-components
description: The structural build spec for the Apartment Module & Golden Ratio Calculator UI — page shell & header, the 2D/3D mode toggle, input column (apartment card, room list, inline validation), the four results sections (module summary, vertical band diagram, per-room cards, read-only visualizer), and the golden-ratio SVG logo. Use whenever building, laying out, or reviewing any page section, panel, header, input, results block, or the logo/visualizer. Distilled from docs/DESIGN.md §4–7.
license: Apache-2.0
metadata:
  version: "1.0.0"
  updated: 2026-06-30
  category: design
  source: docs/DESIGN.md
---

# Layout, Shell & Components

The structural/component spec. Pairs with [design-tokens](../design-tokens/SKILL.md) for
visuals, [calculation-logic](../calculation-logic/SKILL.md) for the numbers each block
shows, and [i18n-strings](../i18n-strings/SKILL.md) for labels. Behaviour resolves against
[docs/PDR.md](../../../docs/PDR.md) (`FR-*`).

## When to use

- Building or laying out the header, input column, or results column.
- Implementing the 2D/3D mode toggle, apartment card, room list, or validation.
- Building the module summary, band diagram, per-room cards, or visualizer.
- Rendering the logo.

## 4. Layout & shell

- **Single page.** Sticky **header**, then a CSS grid
  `grid-template-columns: minmax(320px,400px) 1fr` — left **input column** (sticky `top:67px`),
  right **results column**. `max-width:1400px; margin:0 auto`.
- **Responsive:** below the breakpoint columns **stack vertically** (inputs on top). Header
  wraps. Band SVG and visualizer are `viewBox`-based — no fixed pixel widths.
- **No submit button** — reactive; results recompute on every keystroke. A `livedot` "updates
  live" pill in the header conveys this.
- **Results render only** once apartment fields are valid **and** ≥1 room is valid
  (`showResults`); otherwise a dashed empty-state card shows `s.fillToSee`.
  `aria-live="polite"` on results.

### Header (left → right)
1. **Logo** (accent `currentColor`) + **title** (`s.title`, 15px/600) + **subtitle** (`s.subtitle`, 11.5px muted).
2. **"updates live" pill** — 6px `--good` dot, `livedot` pulse, `s.live` label.
3. **Theme toggle** — 34×30 button, `☾` (light) / `☀` (dark); sets `html[data-theme]`.
4. **Language pill** — `EN | UA` segmented, mono, accent fill on the active side.

## 5. Input column

### 5.1 Mode toggle (`2D | 3D`)
Segmented control top-right of inputs header. **Default `3D`.** Drives `showHeights`:
- **3D** — show ceiling + opening fields and the vertical band diagram; module suggested from
  heights (`GCD(ceiling, opening)`).
- **2D** — **hide** height fields and band diagram; module suggested from room dimensions
  (`GCD` across all valid rooms' L&W, snapped). Everything else still shows.

### 5.2 Apartment card
White panel, 12px radius, fields stack with 14px gaps:
- **Ceiling height (mm)** — number, default `2800`, valid `2000–5000`. Range hint right-aligned
  in label (mono/faint). `mm` suffix chip.
- **Opening height (mm)** — number, default `2100`, valid `1800–ceiling`. (3D only.)
- **Module (mm)** — `<select>` over `[100,150,200,300,350,600,700]`; suggested value labelled
  `"700 — suggested"`. User-overridable; label carries an accent `override` tag.
- Inputs: `--field` bg, `--line2` border, mono 15px value, focus ring `outline:2px solid var(--accent)`.

### 5.3 Room list
- Header row: `Rooms <count>` + accent **`+ Add room`** button (`--accent-bg`/`--accent-line`).
- Each room is a panel card: `R1`/`R2`… mono tag, inline-editable **name** (default `Room N`,
  underline-on-focus), then **Length** and **Width** in an `auto-fit minmax(118px,1fr)` grid,
  both valid `500–15000` mm, `mm` suffix.
- **Remove (`×`)** per card, **disabled on the last remaining room** (opacity .3, `not-allowed`).
  `addRoom` appends `{name:'Room N', length:3000, width:2400}`.

### 5.4 Validation (inline)
Invalid field → border `--err`; a `role="alert"` message renders directly below with a bold `!`
glyph. Messages: `errCeiling`, `errOpening`, `errDim`. `aria-invalid` set on the input. Every
input has a visible `<label>` and focus ring.

## 6. Results column

Four stacked sections, 22px gap.

### 6.1 Module Summary
- Two-pane card. Left pane (`--panel2`): label `active module` + hero **`M = {value}`** mono
  34px, `mm` underneath.
- Right pane — **traceability hint**: `GCD(2800, 2100) = 700 → snapped to 700`, then
  `residual 0 mm` (good chip) and `alternatives` chips (`600`, `350`). In 2D the line reads
  `GCD(rooms) → snapped …` with `suggested from room dimensions`.
- **Warning banner** (`--warn-bg`, `role="alert"`) only when `M > 1000` (`warnLarge`) or
  `M < 100` (`warnSmall`). At M=700 none.
- **Module ruler** table — 3 cols `Label | Size | Typical use`, rows ¼M…4M as `round(M × k)`
  for `k ∈ {0.25,0.5,1,1.5,2,3,4}`. Labels (`¼M`,`½M`,`M`,…) are mono accent and **never
  translated**; "typical use" prose is localized.

### 6.2 Vertical Band Diagram (3D mode only)
- Width-responsive `viewBox="0 0 360 470"` SVG, `max-width:520px`.
- `N = floor(ceiling / module)` full bands bottom-to-top, mm marks up the left edge
  (`0,700,…`), band names on the right (`base / plinth`, `work zone`, `door-head zone`,
  `upper / ceiling`). Alternating bands `--inset` / `--panel2`.
- **Opening line**: dashed `--accent` rule + dot at true height, tagged `on grid` when
  `opening % module === 0` else `off-grid`.
- **Top remainder** (`ceiling − N·module > 0`) renders as a shorter **partial band**
  (`--accent-bg`, dashed) tagged `partial · {span} mm`. At M=700 it's 0.
- Dense counts (>16 marks) thin labels (`i % 4` + last). Legible from ~2 to 50+ bands.

### 6.3 Per-room cards (one per valid room)
Header: room name + `length × width mm` (mono) + a **fit badge** — `clean fit` (good, ✓) or
`approximate fit` (warn, ≈) when the golden snap offset > ¼M. Three blocks:
- **Golden split** of the longer wall: `exact (.618/.382)`, `snapped (½M)` in accent, and
  `snap offset` colored by fit.
- **Grid fit:** `nL × nW` modules (mono 19px) + signed `remainder L/W`, with a **quality badge**
  `exact` (good ✓) / `close` (warn ≈) / `poor` (bad ✕). Annotation in warn italic:
  `round up/down on length/width` (round **down** when remainder > 0).
- **Walkway clearance:** rows for `wardrobe/kitchen (600)`, `sofa/bed centre (900)`, and
  `between facing 600 units (1200)`; clearance = `width − depth`. **Fixed ergonomic thresholds**
  (never scale with module): `≥900 comfortable · ≥600 acceptable · <600 tight`. Each row shows a
  3-bar meter (filled by rating) + a colored text rating.

> See [calculation-logic](../calculation-logic/SKILL.md) for the formulas behind these blocks.

### 6.4 Module Visualizer (read-only)
Header: `Module visualizer {mode}` + a `1 module` swatch + note `vizNote`. It never edits
geometry; no walls/adjacency/export — a comprehension aid only.
- **2D (`mode==='2d'`):** each room a scaled plan rectangle (`--inset`), faint M×M grid,
  signed-remainder strip (`--warn-bg`) on the far edge, **one module cell highlighted**
  `--accent` with `cellpulse`. Caption: `name · dims · nL×nW`.
- **3D (`mode==='3d'`):** each room a box to scale (`L×W×ceiling`) along an axis, opening as an
  **accent band** on a wall (omitted when blank), **one M×M×M cube highlighted** `--accent` with
  `cellpulse`. Auto-rotate (`spin3d`), drag-to-orbit. Footer note + `webgl` fallback line.

> **Build note:** the prototype fakes 3D with CSS `preserve-3d` + pointer math. **Production 3D
> uses `@react-three/fiber` + `@react-three/drei`, lazy-loaded via `next/dynamic({ssr:false})`**
> (`TC-STACK-04`, `NFR-BUNDLE-01`), with a real WebGL-unavailable fallback to the 2D visualizer
> (`FR-VIZ3D-06`) and `prefers-reduced-motion` honored. 2D rendering stays pure SVG (Tailwind
> utilities only) — no extra dependency.

## 7. Logo

A golden-ratio mark: nested golden rectangles subdivided φ:1 with the golden-spiral arc sweeping
through. Single accent color via `currentColor` (inverts in dark), transparent background, pure
SVG, readable at favicon size. Verbatim from the export:
```html
<svg width="40" height="26" viewBox="0 0 110 70" fill="none" aria-hidden="true">
  <rect x="1" y="1" width="108" height="68" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
  <line x1="68" y1="1"  x2="68"  y2="69" stroke="currentColor" stroke-width="1.1" opacity=".55"/>
  <line x1="68" y1="43" x2="110" y2="43" stroke="currentColor" stroke-width="1.1" opacity=".55"/>
  <line x1="93" y1="43" x2="93"  y2="69" stroke="currentColor" stroke-width="1.1" opacity=".4"/>
  <line x1="68" y1="59" x2="93"  y2="59" stroke="currentColor" stroke-width="1.1" opacity=".4"/>
  <path d="M1 1 A67 67 0 0 1 68 69"    stroke="currentColor" stroke-width="1.8" fill="none"/>
  <path d="M68 69 A42 42 0 0 1 110 43" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <path d="M110 43 A26 26 0 0 1 93 69" stroke="currentColor" stroke-width="1.8" fill="none" opacity=".8"/>
</svg>
```
