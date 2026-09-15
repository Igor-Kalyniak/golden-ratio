# DESIGN.md — Design source of truth

The authoritative design spec for the **Apartment Module & Golden Ratio Calculator**.
It distills the rendered Claude Design export into a buildable system: tokens,
typography, layout, components, states, motion, accessibility, the worked example, and
the EN/UA strings. When visual scope is unclear, resolve it here; when behavioural or
requirement scope is unclear, resolve it against [PDR.md](PDR.md).

- **Frozen reference export:** [design/export/](design/export/) — the raw
  `prototype.dc.html` + `support.js` + screenshots from [claude.ai/design](https://claude.ai/design).
  Read the `<script type="text/x-dc">` block in the prototype for exact values.
- **Originating specs:** [superpowers/specs/2026-06-27-apartment-module-calculator-design.md](superpowers/specs/2026-06-27-apartment-module-calculator-design.md),
  [superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md](superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md).
- **Requirements:** [PDR.md](PDR.md) (`FR-*`, `NFR-*`, `TC-*`, `BC-*`). **Why:** [PRODUCT-BRIEF.md](PRODUCT-BRIEF.md).

> The prior version of this file was the *prompt* used to generate the design. That
> prompt is preserved as [design/PROMPT.md](design/PROMPT.md). This file is now the
> design that came back, made canonical.

---

## 1. Design principles

A **precise engineering instrument**, not a marketing page. Numbers first, decoration
last. The user (architect "Maria") is skeptical of black boxes — **every derived value
shows its origin**, and the module is a *suggestion she can override*, never a verdict.
Approximation is surfaced honestly: residuals, snap offsets, off-grid markers, signed
remainders, and leftover heights are shown, not hidden. Calm, dense, austere, in mm.

---

## 2. Typography

- **Sans (UI labels, prose):** `Inter`, weights 400/500/600/700 →
  `'Inter', system-ui, -apple-system, sans-serif`.
- **Mono (every numeric / dimension value):** `JetBrains Mono`, weights 400/500/600/700 →
  `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace`.
- **Mono-for-numbers is the signature rule:** apply mono to *every* measurement — heights,
  mm figures, module counts, multiples, remainders, offsets, ranges, the `M = 700` hero.
- Body sets `font-feature-settings: "tnum" 1, "cv01" 1` (tabular numerals so columns align).
- Both load from Google Fonts in the prototype; in the Next build, self-host via `next/font`.

---

## 3. Color tokens

CSS custom properties, copied verbatim from the export. The accent and status colors are
**OKLCH** so they stay perceptually even across light/dark. The build should expose these
as CSS variables (or Tailwind theme tokens) and switch on `html[data-theme]`.

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
| `--good` / `--warn` / `--bad` | grid `exact` / `close` / `poor`; walkway `comfortable` / `acceptable` / `tight` |
| `--err` | invalid field border + inline error text |

**Never color-only:** every quality/rating badge pairs the color with a text label and an
icon (`✓` exact·comfortable, `≈` close·approximate, `✕`/⚠ poor·tight). Default theme is **light**.

---

## 4. Layout & shell

- **Single page.** Sticky **header**, then a CSS grid:
  `grid-template-columns: minmax(320px,400px) 1fr` — left **input column** (sticky,
  `top:67px`), right **results column**. `max-width:1400px; margin:0 auto`.
- **Responsive:** below the two-column breakpoint the columns **stack vertically**
  (inputs on top, results below). The header wraps. The band SVG and visualizer are
  `viewBox`-based and scale down — no fixed pixel widths.
- **No submit button** — everything is reactive; results recompute on every keystroke.
  A `livedot`-animated "updates live" pill in the header conveys this.
- The **results column only renders** once apartment fields are valid **and** at least
  one room is valid (`showResults`). Otherwise a dashed empty-state card shows
  `s.fillToSee`. `aria-live="polite"` on the results section.

### Header (left → right)

1. **Logo** (accent `currentColor`) + **title** (`s.title`, 15px/600) and **subtitle**
   (`s.subtitle`, 11.5px muted).
2. **"updates live" pill** — 6px `--good` dot, `livedot` pulse, `s.live` label.
3. **Theme toggle** — 34×30 button, `☾` (light) / `☀` (dark); sets `html[data-theme]`.
4. **Language pill** — `EN | UA` segmented, mono, accent fill on the active side.

---

## 5. Input column

### 5.1 Mode toggle (`2D | 3D`)
Segmented control top-right of the inputs header. **Default `3D`.** Drives `showHeights`:
- **3D** — show ceiling + opening fields and the vertical band diagram; module suggested
  from heights (`GCD(ceiling, opening)`).
- **2D** — **hide** the height fields and the band diagram; module suggested from room
  dimensions (`GCD` across all valid rooms' length & width, snapped). Everything else
  (module summary, golden split, grid fit, walkway, visualizer) still shows.

### 5.2 Apartment card
White panel, 12px radius. Fields stack with 14px gaps:
- **Ceiling height (mm)** — number, default `2800`, valid `2000–5000`. Range hint
  (`2000–5000`) sits right-aligned in the label, mono/faint. `mm` suffix chip.
- **Opening height (mm)** — number, default `2100`, valid `1800–ceiling`. (3D only.)
- **Module (mm)** — `<select>` over `[100,150,200,300,350,600,700]`; the suggested value
  is labelled `"700 — suggested"`. User-overridable; label carries an accent `override` tag.
- Inputs: `--field` bg, `--line2` border, mono 15px value, focus ring `outline:2px solid var(--accent)`.

### 5.3 Room list
- Header row: `Rooms <count>` + accent **`+ Add room`** button (`--accent-bg`/`--accent-line`).
- Each room is a panel card: a `R1`/`R2`… mono tag, an inline-editable **name**
  (default `Room N`, underline-on-focus), then **Length** and **Width** in an
  `auto-fit minmax(118px,1fr)` grid, both valid `500–15000` mm, `mm` suffix.
- **Remove (`×`)** per card, **disabled on the last remaining room** (opacity .3,
  `not-allowed`). `addRoom` appends `{name:'Room N', length:3000, width:2400}`.

### 5.4 Validation (`FR` — inline)
Invalid field → border switches to `--err`; a `role="alert"` message renders directly
below it with a bold `!` glyph. Messages: `errCeiling`, `errOpening`, `errDim` (see §11).
`aria-invalid` is set on the input. Every input has a visible `<label>` and focus ring.

---

## 6. Results column

Four stacked sections, 22px gap.

### 6.1 Module Summary
- Two-pane card. Left pane (`--panel2`): label `active module` + hero
  **`M = {value}`** in mono 34px, `mm` underneath.
- Right pane — the **traceability hint** that earns trust:
  `GCD(2800, 2100) = 700 → snapped to 700`, then `residual 0 mm` (good chip) and
  `alternatives` chips (`600`, `350`). In 2D the line reads `GCD(rooms) → snapped …`
  with the `suggested from room dimensions` label.
- **Warning banner** (`--warn-bg`, `role="alert"`) only when `M > 1000` (`warnLarge`) or
  `M < 100` (`warnSmall`). At M=700 no banner.
- **Module ruler** table — 3 cols `Label | Size | Typical use`, rows ¼M…4M computed as
  `round(M × k)` for `k ∈ {0.25,0.5,1,1.5,2,3,4}`. Labels (`¼M`,`½M`,`M`,…) are mono accent
  and **never translated**; the "typical use" prose is localized.

### 6.2 Vertical Band Diagram (3D mode only)
- Width-responsive `viewBox="0 0 360 470"` SVG, `max-width:520px`.
- `N = floor(ceiling / module)` full bands bottom-to-top, mm marks up the left edge
  (`0,700,…`), band names on the right (`base / plinth`, `work zone`, `door-head zone`,
  `upper / ceiling`). Alternating bands use `--inset` / `--panel2`.
- **Opening line** highlighted: dashed `--accent` rule + dot at the true height, tagged
  `on grid` when `opening % module === 0`, else `off-grid`.
- **Top remainder** (`ceiling − N·module > 0`) renders as a shorter **partial band**
  (`--accent-bg`, dashed) tagged `partial · {span} mm`. At M=700 the remainder is 0.
- Dense counts (>16 marks) thin the labels (`i % 4` + last). Designed to stay legible
  from ~2 to 50+ bands.

### 6.3 Per-room cards (one per valid room)
Header: room name + `length × width mm` (mono) + a **fit badge** —
`clean fit` (good, ✓) or `approximate fit` (warn, ≈) when the golden snap offset > ¼M.
Three blocks:
- **Golden split** of the longer wall: `exact (.618/.382)`, `snapped (½M)` in accent, and
  `snap offset` colored by fit. `snappedLarger = round(exact/½M)·½M`, `snappedSmaller = longer − snappedLarger`.
- **Grid fit:** `nL × nW` modules (mono 19px) + signed `remainder L/W`, with a **quality
  badge** `exact` (good ✓) / `close` (warn ≈) / `poor` (bad ✕). Annotation in warn italic:
  `round up/down on length/width` (round **down** when remainder > 0).
- **Walkway clearance:** rows for `wardrobe/kitchen (600)`, `sofa/bed centre (900)`, and
  `between facing 600 units (1200)`; clearance = `width − depth`. **Fixed ergonomic
  thresholds** (never scale with module): `≥900 comfortable · ≥600 acceptable · <600 tight`.
  Each row shows a 3-bar meter (filled by rating) + a colored text rating.

### 6.4 Module Visualizer (read-only)
Header: `Module visualizer {mode}` + a `1 module` swatch + the note
`Read-only — comprehension aid, to scale. Not a floor plan.` It never edits geometry,
has no walls/adjacency/export.
- **2D (`mode==='2d'`):** each room a scaled plan rectangle (`--inset`), faint M×M grid,
  signed-remainder strip (`--warn-bg`) on the far edge, **one module cell highlighted**
  `--accent` with `cellpulse`. Caption: `name · dims · nL×nW`.
- **3D (`mode==='3d'`):** each room a box to scale (`L×W×ceiling`), arranged along an axis,
  opening shown as an **accent band** on a wall (omitted when blank), **one M×M×M cube
  highlighted** `--accent` with `cellpulse`. Auto-rotate (`spin3d`), drag-to-orbit.
  Footer note + `webgl` fallback line: *"3D unavailable on this device — showing 2D plan."*

> **Build note:** the prototype fakes 3D with CSS `transform-style: preserve-3d` + manual
> pointer math (see screenshots in `design/export/screenshots/`). **Production 3D uses
> `@react-three/fiber` + `@react-three/drei`, lazy-loaded via `next/dynamic({ ssr:false })`**
> (`TC-STACK-04`, `NFR-BUNDLE-01`), with a real WebGL-unavailable fallback to the 2D
> visualizer (`FR-VIZ3D-06`) and `prefers-reduced-motion` honored.

---

## 7. Logo

A golden-ratio mark: nested golden rectangles subdivided φ:1 with the golden-spiral arc
sweeping through them. Single accent color via `currentColor` (inverts in dark mode),
transparent background, pure SVG, readable at favicon size. Verbatim from the export:

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

---

## 8. Motion

Keyframes from the export; all suppressed under reduced-motion:

```css
@keyframes livedot  {0%,100%{opacity:1}50%{opacity:.25}}            /* "updates live" dot */
@keyframes griddraw {from{stroke-dashoffset:240}to{stroke-dashoffset:0}} /* 2D grid draw-in */
@keyframes cellpulse{0%,100%{opacity:.85}50%{opacity:.45}}         /* highlighted module cell/cube */
@keyframes spin3d   {from{transform:rotateX(-22deg) rotateY(0deg)}to{transform:rotateX(-22deg) rotateY(360deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
```

`griddraw` accompanies the 2D visualizer ("grid draws in + cell pulses"); `spin3d` is the
gentle 3D auto-rotate (paused on drag). Motion is decorative — nothing depends on it.

---

## 9. Accessibility

- Every input has a visible `<label>`; validation messages use `role="alert"` and are tied
  to their field; invalid fields set `aria-invalid`.
- Visible focus styles everywhere (`outline:2px solid var(--accent)`).
- **WCAG-AA contrast in both themes.** Badges legible **without color** (label + icon).
- Results region is `aria-live="polite"`. Decorative SVG bits use `aria-hidden`; meaningful
  SVGs use `role="img"` + `aria-label`. `prefers-reduced-motion` disables all animation.

---

## 10. Worked example (render these exact numbers)

Apartment: **ceiling 2800, opening 2100, M = 700** (suggested; alts `600, 350`; residual 0).
Three rooms so every badge state appears.

| Room | Dims | Golden (exact → snapped, offset) | Grid | Badge | Walkway |
|---|---|---|---|---|---|
| **Living room** | 4200 × 3500 | 2595.6 / 1604.4 → 2450 / 1750, off 145.6 | 6 × 5, rem 0 / 0 | **exact** | 2900 comf · 2600 comf |
| **Kitchen** | 3800 × 2500 | 2348.4 / 1451.6 → 2450 / 1350, off 101.6 | 5 × 4, rem −300 / +300 | **poor** | 1900 comf |
| **Bathroom** | 2150 × 1500 | 1328.7 / 821.3 → 1400 / 750, off 71.3 | 3 × 2, rem +50 / +100 | **close** | 600 acceptable · 300 tight |

Across the three: grid `exact / close / poor`; walkway `comfortable / acceptable / tight`.
Default state: 3D mode, light theme, EN, all three rooms valid (results populated).

---

## 11. Internationalization (UA ⇄ EN)

The language pill swaps **every UI string** live. **Calculation labels (`¼M`, `½M`, `M`,
`1.5M`, `2M`, `3M`, `4M`) are never translated.** The full EN/UA dictionaries live in the
export (`STR` object, `prototype.dc.html` lines ~392–459) and are the canonical strings to
port into the build's dictionaries. Key entries:

| Key | EN | UA |
|---|---|---|
| `title` | Apartment Module & Golden Ratio | Модуль квартири та золотий перетин |
| `subtitle` | Proportional planning instrument · all values in mm | Інструмент пропорційного планування · усі значення в мм |
| `live` | updates live | оновлюється наживо |
| `ceiling` / `opening` / `module` | Ceiling height / Opening height / Module | Висота стелі / Висота прорізу / Модуль |
| `errCeiling` | Must be an integer between 2000 and 5000 mm. | Ціле число від 2000 до 5000 мм. |
| `errOpening` | Must be ≥ 1800 mm and ≤ ceiling height. | Має бути ≥ 1800 мм та ≤ висоти стелі. |
| `errDim` | Must be between 500 and 15000 mm. | Має бути від 500 до 15000 мм. |
| `suggestedFrom` / `suggestedFromRooms` | suggested from heights / from room dimensions | рекомендовано з висот / з розмірів кімнат |
| grid quality | exact / close / poor | точно / близько / погано |
| walkway rating | comfortable / acceptable / tight | комфортно / прийнятно / тісно |
| `vizNote` | Read-only — comprehension aid, to scale. Not a floor plan. | Лише для перегляду — допоміжна схема в масштабі. Не план поверху. |
| `webgl` | 3D unavailable on this device — showing 2D plan instead. | 3D недоступне — показано 2D-план. |

---

## 12. Reference calculation logic

The prototype's pure helpers are the canonical algorithms for the build's
`lib/calculations.ts`. Verbatim from the export (`prototype.dc.html`):

```js
gcd(a,b){ a=Math.abs(Math.round(a)); b=Math.abs(Math.round(b)); while(b){ [a,b]=[b,a%b]; } return a; }
nearestStd(v){ return STD.reduce((p,c)=> Math.abs(c-v)<Math.abs(p-v)?c:p, STD[0]); } // STD=[100,150,200,300,350,600,700]
snap(v,step){ return Math.round(v/step)*step; }

// module suggestion: 3D → gcd(ceiling, opening); 2D → gcd folded across all valid rooms' L&W
//   snapped = nearestStd(g);  residual = |g − snapped|;  alts = two nearest other STD values

// per room, given module M:
//   longer = max(L,W);  largerExact = longer*0.618;  smallerExact = longer*0.382
//   snappedLarger = snap(largerExact, M/2);  snappedSmaller = longer − snappedLarger
//   offset = |largerExact − snappedLarger|;  approx-fit when offset > M/4
//   nL = round(L/M), nW = round(W/M);  remL = L − nL*M, remW = W − nW*M  (signed)
//   quality: max|rem| === 0 → exact;  ≤ M/4 → close;  else poor
//   walkway clearance = dim − depth for depths {600, 900, 1200};
//     ≥900 comfortable · ≥600 acceptable · <600 tight   (FIXED — never scale with M)

// vertical bands (3D): full = floor(ceiling/M), rem = ceiling − full*M (partial band if >0)
```

Validation bounds: ceiling `2000–5000`, opening `1800–ceiling`, room L/W `500–15000`, all
integers (mm). Warnings: `M > 1000` → `warnLarge`; `M < 100` → `warnSmall`.

---

## 13. Build mapping & deviations

- **Port, don't copy markup.** The export is Claude Design `x-dc`, not React. Rebuild as
  Next.js Client Components behind a `'use client'` boundary at `Calculator.tsx`; lift the
  helpers above into pure `lib/calculations.ts`; wire EN/UA dictionaries — all traceable to
  `FR-*` in [PDR.md](PDR.md).
- **3D is the one heavy dependency.** The prototype's CSS-transform 3D is a *look* reference
  only; ship `@react-three/fiber` + `@react-three/drei`, lazy via `next/dynamic({ssr:false})`,
  with a 2D fallback (`TC-STACK-04`, `NFR-BUNDLE-01`, `FR-VIZ3D-06`).
- **Fonts:** the brief said "Geist / Geist Mono (or Inter / JetBrains)"; the export chose
  **Inter + JetBrains Mono** — that is now canonical. Self-host with `next/font`.
- **Walkway third row:** the export adds a `between facing 600 units (1200)` row beyond the
  brief's wardrobe/sofa pair — keep it.
