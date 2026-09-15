# Manual Test Plan — `design-system`

> The shared visual foundation: OKLCH color tokens, Inter/JetBrains-Mono typography, dark mode,
> motion keyframes, and accessibility. This capability is CSS + font/theme config only — there is
> **no automated a11y/visual/unit test runner** in the repo for it. Ground truth is `npm run build`
> compiling the token theme, `eslint app/` staying clean, and the manual checks below.

- **Change:** `design-system`
- **Owned requirement IDs:** `TC-STACK-02`, `TC-STACK-03`, `NFR-A11Y-02`
- **Last updated:** `2026-07-03T02:15:00+03:00`
- **Applied HEAD:** `0be522a`
- **Implementation:** `app/globals.css` (tokens, `@theme inline`, focus, motion) + `app/layout.tsx` (`next/font` Inter + JetBrains Mono, `data-theme="light"`)
- **Token source of truth:** [docs/DESIGN.md](../../DESIGN.md) §3 (verbatim port) and `.agents/skills/design-tokens/SKILL.md`

## Preconditions (all cases)

- Repo checked out at the applied HEAD; `npm install` complete.
- App running via `npm run dev`; a modern Chromium/Firefox with DevTools open.
- Dark mode is switched by setting `document.documentElement.dataset.theme = 'dark'` in the console
  (there is no toggle UI yet — the language/theme UI ships in a later capability).

## Cases

### TC-1 — WCAG AA contrast matrix, both themes (NFR-A11Y-02, TC-STACK-02)

- **Requirement(s):** `NFR-A11Y-02`, `TC-STACK-02`
- **Preconditions:** Token values as defined in `app/globals.css` (`:root` light, `[data-theme="dark"]` dark). Use a contrast checker (WebAIM, or the computed values below).
- **Steps:**
  1. For each text/surface pair, read the token hex/OKLCH from `app/globals.css` and compute the WCAG contrast ratio against the listed background.
  2. Record pass (≥ 4.5:1 normal text) / fail.
- **Expected result (measured at HEAD):**

  | Pair | Light | Dark | AA (normal text ≥ 4.5) |
  |------|-------|------|------------------------|
  | `--fg` / `--bg` | 16.83:1 | 16.47:1 | PASS both |
  | `--fg` / `--panel` | 17.43:1 | 15.45:1 | PASS both |
  | `--fg2` / `--bg` | 11.03:1 | 12.34:1 | PASS both |
  | `--muted` / `--bg` | 4.61:1 | 7.33:1 | PASS both |
  | `--muted` / `--panel` | 4.78:1 | 6.88:1 | PASS both |
  | `--faint` / `--bg` | **2.74:1** | **3.81:1** | **FAIL both** (see TC-5) |
  | `--accent` / `--bg` | ~3.7:1 | — | **FAIL as normal text** (see TC-5) |

  Body / label / muted copy passes AA in **both** themes. The `--faint` and `--accent`-on-`--bg`
  pairs are below AA and are the tracked constraint in TC-5.
- **Result:** pass — body/label/muted verified ≥ AA both themes; faint/accent sub-AA are known and tracked (CR-001), not consumed by any component at this HEAD.

### TC-2 — Status tokens are not color-alone (NFR-A11Y-02)

- **Requirement(s):** `NFR-A11Y-02` ("quality/rating badges never rely on color alone")
- **Preconditions:** `--good/--warn/--bad/--err` and their `-bg` variants defined in both themes.
- **Steps:**
  1. Confirm the four status hues plus their `-bg` fills are distinct pairs available as `text-*` / `bg-*` utilities via `@theme inline`.
  2. Confirm no result badge/component consumes them yet (this capability is the foundation only).
- **Expected result:** Distinct status token pairs exist for later components to combine with a text label + icon; the color-alone obligation is deferred to the component layer where badges are built. No color-only reliance is introduced by this change.
- **Result:** pass (foundation) — re-evaluate this clause when result badges ship (grid-fit / walkway capabilities).

### TC-3 — Typography: Inter for UI, JetBrains Mono for numbers (TC-STACK-03)

- **Requirement(s):** `TC-STACK-03`
- **Preconditions:** App rendered; DevTools Elements/Computed panel available.
- **Steps:**
  1. Inspect `<html>` — confirm the `--font-sans` and `--font-mono` variable classes from `next/font` are present.
  2. Inspect `body` computed `font-family` — expect an `Inter` (self-hosted `__Inter_*`) family.
  3. Confirm `body` `font-feature-settings` includes `"tnum" 1` (tabular numerals).
  4. Apply the `font-mono` utility to a numeric element and confirm it renders in JetBrains Mono.
  5. In the Network tab, reload and confirm **no** request to `fonts.googleapis.com` / `fonts.gstatic.com` (fonts are self-hosted by `next/font`).
- **Expected result:** UI text resolves to Inter; `font-mono` resolves to JetBrains Mono; tabular figures active on body; zero runtime Google Fonts requests. Per-value application of `font-mono` to every numeric/dimension output is verified in the consuming capabilities (results sections, visualizer).
- **Result:** pass — wiring verified; downstream per-value mono usage tracked in later capabilities.

### TC-4 — Dark-mode token swap (TC-STACK-03)

- **Requirement(s):** `TC-STACK-03` (dark mode via the shared `dark:` / `[data-theme="dark"]` selector)
- **Preconditions:** App in default (light) state.
- **Steps:**
  1. In the console run `document.documentElement.dataset.theme = 'dark'`.
  2. Observe every surface/text/line/status token swap (background darkens to `#0e0e0d`, `--fg` to `#ededea`, etc.).
  3. Confirm a `dark:`-prefixed utility (e.g. add `class="dark:bg-panel"` to a test node) responds to the same `[data-theme="dark"]` selector via the `@custom-variant dark`.
  4. Set `dataset.theme = 'light'` and confirm full revert.
- **Expected result:** All 24 color tokens swap as one unit under `[data-theme="dark"]`; `dark:` utilities and the `html[data-theme]` token switch share a single selector — no split source of truth.
- **Result:** pass.

### TC-5 — Focus visibility + reduced-motion (NFR-A11Y-02)

- **Requirement(s):** `NFR-A11Y-02`
- **Preconditions:** A focusable element present (any link/button; a bare page works with Tab onto browser chrome removed — otherwise re-run in a later capability with a real control).
- **Steps:**
  1. Tab to a focusable element and confirm a visible `2px solid var(--accent)` outline with `2px` offset (`:focus-visible`). Note `--accent` as a **non-text** focus cue clears the 3:1 non-text threshold.
  2. Enable OS "Reduce motion" (or emulate `prefers-reduced-motion: reduce` in DevTools Rendering).
  3. Confirm all animations/transitions are suppressed (`animation: none`, `transition: none`) globally — the `livedot/griddraw/cellpulse/spin3d` keyframes are decorative and must not run.
- **Expected result:** Focus is always visible; motion is fully suppressed under reduced-motion with no loss of information (motion is decorative only).
- **Result:** pass.

### TC-6 — CR-001 downstream constraint watch (NFR-A11Y-02)

- **Requirement(s):** `NFR-A11Y-02`
- **Context:** Review finding **CR-001** (severity low, status **open**). `--faint` (2.74:1 light / 3.81:1 dark) and `--accent`-on-`--bg` (~3.7:1) are below AA for normal text. These are an exact verbatim port of the frozen DESIGN §3 tokens — **not** a porting error — and no component consumes them at this HEAD.
- **Steps (run whenever a consuming component ships):**
  1. Grep new components for `text-faint` / `--faint` and accent-colored text usage.
  2. For any meaningful small copy using them, flag: it must be paired with a **non-color cue** and/or a **larger font size** (AA large-text threshold 3:1), or switched to `--muted`.
  3. Do **not** silently mutate the frozen DESIGN §3 token value here; any recolor is a design-source decision made in `globals.css` only.
- **Expected result:** No shipped component renders meaningful normal-size text in `--faint` or accent-on-`--bg` without a non-color cue / larger size. Until then NFR-A11Y-02 is `partial`, not fully met.
- **Result:** open constraint — carry forward until badges/labels are built.
