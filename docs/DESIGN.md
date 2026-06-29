# Claude Design — prompt for the Golden Ratio Calculator

Paste the block below into a new project at **[claude.ai/design](https://claude.ai/design)**.
It is a self-contained design brief; the design agent will render a working React
prototype from it. Calculation logic does **not** need to be real in the prototype —
the worked numbers are pre-computed and given inline so the screen renders correct,
trustworthy values. Sources: [PDR.md](PDR.md), [PRODUCT-BRIEF.md](PRODUCT-BRIEF.md),
[design spec](superpowers/specs/2026-06-27-apartment-module-calculator-design.md).

---

## THE PROMPT

> Design a single-page web app: **"Apartment Module & Golden Ratio Calculator"** — a
> proportional-planning tool for architects and interior designers. It is data-dense,
> calm, and professional: numbers first, decoration last. Think "precise engineering
> instrument," not "marketing landing page."
>
> ### Who it's for & the feeling
> The user is a mid-career architect ("Maria") who works in **millimetres**, knows
> standard modules and the golden ratio cold, and is **skeptical of black boxes** — she
> will not trust a number she can't trace back to its inputs. The emotional target is
> **confidence and control**: every derived value shows its origin, and the key
> decision (the module) is a *suggestion she can override*, never an opaque verdict.
> Honesty about approximation is a feature — snapped values, residuals, off-grid
> markers, and leftover heights are surfaced, not hidden.

> ### Layout & shell
> - **Single page, two columns on wide screens:** a left **input column** and a right
>   **live results panel**. On narrow/mobile screens they **stack vertically** (input on
>   top, results below).
> - A **language toggle (UA ↔ EN)** sits in the **top-right corner**, rendered as a small
>   "UA / EN" pill button. Flipping it switches every UI label live. Show the prototype
>   in **EN** but include the toggle prominently.
> - The **results panel only appears once** the apartment fields and at least one room
>   are valid. Show it populated (valid state) by default.
> - There is **no submit button** — everything is reactive; results recompute on every
>   keystroke. Convey this with a subtle "updates live" affordance, not a button.
>
> ### Visual system
> - **Light background (white / near-white), subtle hairline borders, generous
>   whitespace.** Full **dark-mode** variant too (show both if the tool supports it).
> - **Two typefaces:** a clean sans (Geist Sans / Inter-like) for UI labels and prose;
>   a **monospace (Geist Mono / JetBrains Mono)** for **every numeric / dimension value**
>   (heights, mm figures, module counts, remainders). This mono-for-numbers rule is the
>   signature of the whole interface — apply it everywhere a measurement appears.
> - One restrained accent color for interactive elements and the highlighted opening
>   line. **Quality and rating badges must never rely on color alone** — pair each with a
>   text label and/or icon (accessibility requirement).
> - Units are always **mm**. Keep it austere and instrument-like.

> ### Left column — INPUTS
> **Apartment fields (top):**
> - **Ceiling height (mm)** — integer, default **2800**, valid 2000–5000.
> - **Opening height (mm)** — integer, default **2100**, valid 1800 up to the ceiling
>   height.
> - **Module (mm)** — a **dropdown** of standard modules `[100, 150, 200, 300, 350, 600,
>   700]`, defaulting to the *suggested* value (700 here) but user-overridable. Mark the
>   suggested option subtly (e.g. "700 — suggested").
> - **Inline validation:** an invalid field gets a **red border** and a short localized
>   **error message directly below it**. Every input has a visible label and a clear focus
>   ring. Show one field in an error state somewhere as a demonstration (e.g. opening
>   height "must be ≤ ceiling height").
>
> **Room list (below apartment fields):**
> - Starts with **one room**; an **"Add room"** button appends more. Each room can be
>   removed **except the last** (the remove control on the final remaining room is
>   disabled/hidden).
> - **Per room:** a **name** (default "Room 1"), a **length (mm)** and a **width (mm)**,
>   both valid 500–15000. Lay each room out as a compact row/card with name on top and
>   length × width side by side.
> - Show **2–3 rooms** populated in the prototype (data below) so the results panel is rich.

> ### Right column — RESULTS PANEL
> Four stacked sections, in this order:
>
> **1. Module Summary**
> - The active module shown **large and prominent**, monospace: **`M = 700 mm`**.
> - A **"suggested from heights"** hint line showing the derivation: `GCD(2800, 2100) =
>   700 → snapped to 700` with **residual 0 mm** and **alternatives: 600, 350**. (The
>   suggestion is traceable — this hint is what earns Maria's trust.)
> - A **ruler table** listing the module multiples with size and a typical-use note:
>   | Label | Size | Typical use |
>   |---|---|---|
>   | ¼M | 175 mm | trim, reveals, small offsets |
>   | ½M | 350 mm | sills, steps, counter depth |
>   | M | 700 mm | base planning unit, door width |
>   | 1.5M | 1050 mm | corridor width |
>   | 2M | 1400 mm | window band, furniture runs |
>   | 3M | 2100 mm | door/opening height |
>   | 4M | 2800 mm | ceiling height |
> - A **warning banner** appears only when the module is impractical: > 1000 mm
>   ("module may be impractically large, check ½M") or < 100 mm ("inputs may need
>   revision"). At M=700 **no banner shows** — but design the banner style and note when
>   it appears.
>
> **2. Vertical Band Diagram (SVG)**
> - A **width-responsive SVG** (viewBox-based, scales down on mobile — no fixed pixel
>   size) showing **N stacked horizontal bands** where **N = round(ceiling / module)**.
>   For the defaults that's **4 bands** of 700 mm each (0–700, 700–1400, 1400–2100,
>   2100–2800). The count is **variable** — design it so it would also stay legible at
>   **2 bands or 50+ bands** (at high counts, condense/group the labels).
> - **mm labels run up the left edge** (0, 700, 1400, 2100, 2800); **band names on the
>   right** (e.g. "base / plinth", "work zone", "door-head zone", "upper / ceiling").
> - The **opening line (2100 mm) is highlighted** with a dashed marker. Here it lands
>   exactly on a band boundary (aligned). **Also show the off-grid variant**: when the
>   opening does *not* sit on a boundary, the dashed marker floats at its true height
>   with an "off-grid" tag — design this honest state too.
> - Any **leftover height above the last full module** (`topRemainder`) is drawn as a
>   shorter **partial band** at the top. At M=700 the remainder is 0; show how a partial
>   band would render (e.g. with a ceiling of 2900 → a 100 mm sliver on top).

> **3. Per-Room Results — one card per room**
> Each card has a **header** (room name + "length × width mm") and three result blocks:
> - **Golden-ratio split** of the room's **longer wall**: show the **exact** values
>   (`larger = length × 0.618`, `smaller = length × 0.382`), the **values snapped to the
>   nearest ½M grid line**, and the **snap offset**. When the offset exceeds ¼M, flag the
>   card **"approximate fit"**; otherwise it reads as a clean fit.
> - **Grid fit:** show it as **modules × modules** with the **signed remainder** for each
>   dimension (so the UI can say "round up" vs "round down"), and a **quality badge** —
>   **`exact`** (green), **`close`** (amber), or **`poor`** (red) — each badge carrying a
>   text label, not color alone.
> - **Walkway estimates:** for common furniture, show available clearance and a rating
>   against **fixed ergonomic thresholds** (these never scale with the module):
>   **≥ 900 mm comfortable · ≥ 600 mm acceptable · < 600 mm tight.** Show rows for a
>   **wardrobe/kitchen (600 mm depth)** and a **sofa/bed-center (900 mm depth)**. Render a
>   short plain-language recommendation per row (it's guidance, not code compliance).
>
> **4. (toggle, already placed top-right) Language UA ↔ EN** switches all UI strings
> live; **calculation labels (¼M, ½M, M, …) stay identical in both languages** and are
> never translated.

> ### Logo (top-left)
> - A small **golden-ratio mark** sits left of the title: **nested golden rectangles**
>   subdivided φ:1 with the **golden-spiral arc** sweeping through them. Single accent
>   color (use `currentColor` so it inverts in dark mode), transparent background, pure
>   SVG. It should read cleanly at favicon size too.
>
> ### Calculation-mode toggle
> - A **segmented "2D / 3D" control** in the input column, near the top of the apartment
>   fields. **Default to 3D** in the prototype.
> - **3D mode** shows ceiling height, **optional** opening height, and per-room
>   length/width — and the full results (module summary, vertical bands, per-room cards,
>   3D visualizer).
> - **2D mode** **hides the height fields** (ceiling, opening) and the **vertical-band
>   diagram**; the module is now suggested from the **room dimensions**
>   (`GCD(length, width)` snapped to a standard module). Everything else — module summary,
>   golden split, grid fit, walkway, and the 2D visualizer — still shows. Render both
>   states if possible (3D primary).
>
> ### Module Visualizer (new results section, above or beside the per-room cards)
> A **read-only** drawing that shows the module's size relative to each room — it is a
> comprehension aid, never an editable floor plan (no walls, no adjacency, no export).
> - **2D variant (SVG):** each room drawn as a **plan rectangle to scale** (length ×
>   width), in a simple row/wrap. A **faint M × M grid** tiles each room, the **signed
>   remainder** shows as a thin partial strip at the far edge, and **exactly one module
>   cell is highlighted in the accent color**. Suggest a subtle "grid draws in + cell
>   pulses" animation (respecting reduced-motion).
> - **3D variant:** each room as a **box to scale** (length × width × ceiling height),
>   arranged along an axis for comparison, with the **opening height** marked as a band on
>   a wall face (omit when blank) and **one M × M × M module cube highlighted in the accent
>   color**. Orbit/rotate/zoom; gentle auto-rotate and a floating/pulsing highlight.
> - Show a **"3D unavailable → 2D fallback"** note for the WebGL-off case.
>
> ### Worked example data — render these exact numbers
> Apartment: **ceiling 2800 mm, opening 2100 mm, module M = 700 mm** (suggested; alts
> 600, 350; residual 0). Use **three rooms** so all badge states are visible:
>
> **Room 1 — "Living room", 4200 × 3500 mm**
> - Golden split (longer wall 4200): exact larger **2595.6**, smaller **1604.4**; snapped
>   **2450 / 1750**; offset **145.6 mm** → clean fit (within ¼M).
> - Grid fit: **6 × 5 modules**, remainders **0 / 0** → badge **`exact`**.
> - Walkway: width 3500 − 600 wardrobe = **2900 mm → comfortable**; 3500 − 900 sofa =
>   **2600 mm → comfortable**.
>
> **Room 2 — "Kitchen", 3800 × 2500 mm**
> - Golden split (3800): exact **2348.4 / 1451.6**; snapped **2450 / 1350**; offset
>   **101.6 mm** → clean fit.
> - Grid fit: **5 × 4 modules**, remainders **−300 / +300** (both > ¼M=175) → badge
>   **`poor`**; annotate "round down on length, round up on width".
> - Walkway: 2500 − 600 = **1900 mm → comfortable**.
>
> **Room 3 — "Bathroom", 2150 × 1500 mm** (demonstrates the tighter states)
> - Golden split (2150): exact **1328.7 / 821.3**; snapped **1400 / 750**; offset
>   **71.3 mm** → clean fit.
> - Grid fit: **3 × 2 modules**, remainders **+50 / +100** (both ≤ ¼M) → badge **`close`**.
> - Walkway: 1500 − 900 sofa = **600 mm → acceptable**; 1500 − 600 wardrobe − 600
>   opposite wall = **300 mm → tight**. (Shows `acceptable` and `tight` ratings.)
>
> So across the three cards every state appears: grid `exact` / `close` / `poor`, and
> walkway `comfortable` / `acceptable` / `tight`.
>
> ### Quality bar
> - **Accessibility:** every input labelled, visible focus styles, validation messages
>   tied to their fields, WCAG-AA contrast in both themes, badges legible without color.
> - **Responsive:** the two-column layout and the band SVG must read cleanly from mobile
>   to desktop.
> - **Tone:** professional, dense, calm — a precise instrument an architect trusts. Show
>   it in **both light and dark mode** if possible, populated with the data above.

---

## After you have a design you like

Bring the generated React/JSX back into this repo and I'll wire it up for real:
the calculation logic (`lib/calculations.ts` pure functions), the `'use client'`
boundary at `Calculator.tsx`, and the UA/EN dictionaries — all traceable to the
`FR-*` IDs in [PDR.md](PDR.md). The prototype's job is the *look and the states*;
the math and i18n plumbing are the build step.

