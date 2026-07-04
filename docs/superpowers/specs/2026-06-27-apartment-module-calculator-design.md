# Apartment Module & Golden Ratio Calculator — Design Spec

## Overview

A single-page Next.js 16 web application for architects and interior designers that automates apartment proportional planning. The architect inputs ceiling height, opening height, and room dimensions; the app suggests an apartment module (snapping the GCD of the heights to a standard module, user-overridable) and instantly computes vertical height bands, golden ratio zone divisions, grid fit analysis, and walkway recommendations.

**Target user:** Architect / interior designer during the initial proportioning phase of a project.
**Core value:** Replace manual GCD/golden-ratio math with instant, reactive calculations. The architect reads the numbers and applies them in their own CAD tools.

## Decisions

- **Approach:** Single-page reactive calculator. All computation is client-side (pure math). No server actions, no database, no routing.
- **Output:** Numeric tables + SVG vertical band diagram. Data-dense, minimal visuals.
- **Input flow:** Single apartment form — apartment-level fields at top, rooms added below. Results update live.
- **i18n:** Bilingual UA/EN via a React context + JSON dictionaries. No heavy i18n library.
- **No export, no persistence, no floor plan editor** in v1.

## Architecture

```text
app/                          # routes/layouts at the repo root (no src/ wrapper)
├── page.tsx                  # Server Component — renders <Calculator />
├── layout.tsx                # Root layout (Inter/JetBrains-Mono fonts, metadata)
└── globals.css               # Tailwind base
components/
├── Calculator.tsx            # 'use client' — top-level state owner
├── ApartmentForm.tsx         # Ceiling height + opening height inputs
├── RoomList.tsx              # Add/remove rooms (name, length, width)
├── ResultsPanel.tsx          # Orchestrates result sections
├── ModuleSummary.tsx         # Module value + ruler table (¼M → 4M)
├── VerticalBands.tsx         # SVG diagram — 4 height bands with labels
├── RoomResults.tsx           # Per-room: golden ratio, grid fit, walkways
└── LanguageToggle.tsx        # UA ↔ EN switcher button
lib/
├── calculations.ts           # Pure functions (GCD, module, golden ratio, etc.)
└── i18n.tsx                  # LanguageContext provider + useTranslation hook
locales/
├── en.json                   # English UI strings
└── ua.json                   # Ukrainian UI strings
```

**Data flow:** `Calculator` holds `ApartmentInput` state. Every input change triggers synchronous re-computation via pure functions from `calculations.ts`. Results flow down as props. No effects, no async.

**`'use client'` boundary:** Only `Calculator.tsx`. The root `page.tsx` remains a Server Component.

## Input Data Model

### Apartment-level

| Field | Type | Default | Validation |
|---|---|---|---|
| Ceiling height (mm) | integer | 2800 | 2000–5000 |
| Opening height (mm) | integer | 2100 | 1800–ceiling height |
| Module (mm) | integer | suggested from heights | one of `STANDARD_MODULES`, user-overridable |

### Per-room

| Field | Type | Default | Validation |
|---|---|---|---|
| Room name | string | "Room 1" | 1–50 chars, non-empty |
| Length (mm) | integer | — (required) | 500–15000 |
| Width (mm) | integer | — (required) | 500–15000 |

### State shape

```ts
type Room = { id: string; name: string; length: number; width: number };
type ApartmentInput = {
  ceilingHeight: number;
  openingHeight: number;
  module: number;        // active module — defaults to suggestModule(...).suggested
  rooms: Room[];
};
```

**Behavior:**
- Starts with one empty room. Add more with a button. Remove any room except the last.
- Inline validation: red border + localized message below the field.
- Results panel renders only when apartment fields + at least one room are fully valid.

## Calculation Engine (`calculations.ts`)

All pure functions, fully testable.

### 1. Module

The module is **user-selected**, not silently derived. The GCD of ceiling and opening
is offered only as a *suggestion* that is snapped to the nearest standard module, so a
1mm input change can never collapse the whole calculation. The user can always override.

```ts
const STANDARD_MODULES = [100, 150, 200, 300, 350, 600, 700] as const;

gcd(a: number, b: number): number

type ModuleSuggestion = {
  rawGcd: number;          // gcd(ceiling, opening) — raw, may be unstable (e.g. 1, 50)
  suggested: number;       // rawGcd snapped to nearest STANDARD_MODULES value
  alternatives: number[];  // next-best standard candidates, e.g. [350, 100]
  residual: number;        // |rawGcd - suggested|, signals how far the snap moved
};
suggestModule(ceiling: number, opening: number): ModuleSuggestion

// The active module `m` used by every downstream function is the user's selected
// value (defaulting to `suggested`), NOT the raw GCD.
```

The vertical module also drives horizontal (plan) proportioning, so the chosen value
should make sense for room dimensions as well — the UI surfaces the suggestion and
alternatives rather than presenting a single brittle number as truth.

### 2. Ruler

```ts
computeRuler(m: number): { label: string; size: number; usage: string }[]
// ¼M, ½M, M, 1.5M, 2M, 3M, 4M with descriptions
```

### 3. Vertical bands

```ts
type VerticalBands = {
  bands: number;           // count of FULL bands = floor(ceiling / m) — VARIABLE, not fixed at 4
  topRemainder: number;    // ceiling - bands * m — the leftover height above the last full band (>= 0)
  openingAligned: boolean; // does opening fall on a band boundary?
  openingBand: number;     // index of the band the opening line sits in/at
};
computeVerticalBands(ceiling: number, m: number, opening?: number): VerticalBands
```

- Band count is the number of **full** bands, derived as `floor(ceiling / m)` (never hardcoded); when
  `topRemainder > 0` the diagram renders one extra **partial** top band above them (so the layout has
  `floor(ceiling / m) + 1` rows). The renderer must handle 2 bands and 50+ bands alike.
- When the opening does **not** align to a boundary, `openingAligned` is `false` and
  the diagram shows an off-grid marker at the true opening height (no assumption that
  the opening lands on 3M).
- Any leftover height above the last full module is reported as `topRemainder`.

### 4. Golden ratio

```ts
type GoldenSplit = {
  larger: number;         // length × 0.618
  smaller: number;        // length × 0.382
  largerSnapped: number;  // rounded to nearest ½M grid line
  smallerSnapped: number; // remainder
  snapOffset: number;     // how far the snap moved from exact golden point
}
computeGoldenSplit(length: number, m: number): GoldenSplit
```

Applied to the **longer** wall of each room.

### 5. Room grid fit

```ts
type GridFit = {
  lengthModules: number;     // round(length / m) — nearest, not floor
  widthModules: number;
  lengthRemainder: number;   // signed distance to nearest multiple (round up or down)
  widthRemainder: number;
  quality: 'exact' | 'close' | 'poor'
}
computeRoomGrid(length: number, width: number, m: number): GridFit
```

- Remainder is the **distance to the nearest multiple**, not `length mod m`:
  `nearest = min(length % m, m - (length % m))`, signed so the UI can say "round up"
  vs "round down". A dimension 1mm short of a module reads as `close`, not `poor`.
- `exact`: both nearest-distances = 0
- `close`: both nearest-distances ≤ ¼M (e.g. 175 at M=700)
- `poor`: otherwise

### 6. Walkway check

```ts
type WalkwayCheck = {
  available: number;
  rating: 'comfortable' | 'acceptable' | 'tight'
  recommendation: string
}
// `oppositeDepth` optionally accounts for furniture on the opposite wall too.
computeWalkways(roomWidth: number, furnitureDepth: number, oppositeDepth?: number): WalkwayCheck
```

- `available = roomWidth - furnitureDepth - (oppositeDepth ?? 0)`.
- Uses standard furniture depths (600 for wardrobes/kitchens, 900 for sofas).
- Ratings use **fixed ergonomic / building-code thresholds in mm**, decoupled from the
  module (walkway comfort is an absolute human dimension and must not scale with M):
  - ≥ 900: comfortable
  - ≥ 600: acceptable (minimum passable clearance)
  - < 600: tight

### Edge case warnings

- Module > 1000mm → warn "module may be impractically large, check ½M"
- Module < 100mm → warn "inputs may need revision"
- Golden ratio snap offset > ¼M → flag as "approximate fit"

## UI Sections (Results Panel)

### Module Summary

- Module selector (dropdown of `STANDARD_MODULES`), defaulting to the suggested value
- Large display of the active module, e.g. "M = 700 mm"
- "Suggested from heights" hint showing `rawGcd → suggested` plus `alternatives` and `residual`
- Ruler table: ¼M through 4M with sizes and typical uses
- Warning banner if module is impractical

### Vertical Band Diagram

- SVG sized via `viewBox="0 0 200 400"` + `preserveAspectRatio`; the container is
  width-responsive (no fixed pixel size), scales down on mobile
- **N** stacked rectangles where `N = floor(ceiling / m)` full bands (+ a partial top band when
  `topRemainder > 0`) — rendered from `computeVerticalBands`, never hardcoded; label density is
  capped (group/condense) when N is large so 50+ bands stay legible
- mm labels on left, band names on right
- Opening line highlighted with a dashed marker at its true height; if it doesn't fall
  on a band boundary (`openingAligned === false`), it's drawn as an off-grid marker
- Any `topRemainder` above the last full module is shown as a partial band

### Per-Room Results (one card per room)

- Room name + dimensions header
- Golden ratio split: exact values, snapped values, snap offset
- Grid fit: modules × modules + remainder, quality badge
- Walkway estimates for common furniture (wardrobe 600, bed center)

## i18n

- `LanguageContext` with `locale` state (`'en' | 'ua'`) and `t(key)` function.
- `LanguageToggle` button in the top-right corner renders "UA" or "EN".
- Two JSON files: `locales/en.json` and `locales/ua.json` with flat key-value structure.
- All user-facing strings go through `t()`. Calculation labels (¼M, ½M, etc.) are locale-independent.

## Styling

- Tailwind CSS 4 utility classes only. No custom CSS beyond `globals.css`.
- Clean, professional look: white background, subtle borders, monospace for dimensions.
- Geist Sans for UI text, Geist Mono for numeric values.
- Dark mode support via Tailwind `dark:` variants.
- Mobile-responsive: form and results stack vertically on small screens.

## What's NOT in v1

- No export (PDF, CSV, image)
- No persistence / saved projects
- No interactive floor plan or drag-and-drop
- No user accounts
- No API endpoints
