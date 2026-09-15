# Claude Design export — frozen reference

This folder is the **raw, unedited export** from [claude.ai/design](https://claude.ai/design)
for the *Apartment Module & Golden Ratio Calculator*. It is kept verbatim as a
visual reference. **It is not the source of truth** — that is
[../../DESIGN.md](../../DESIGN.md), which distills this export into a buildable spec
and reconciles it with [../../PDR.md](../../PDR.md).

## Contents

- `prototype.dc.html` — the generated single-file prototype. It uses Claude Design's
  `x-dc` component runtime (`support.js`), **not** React/Next. The `<script type="text/x-dc">`
  block at the bottom is the component: state, the **reference calculation logic**
  (GCD module suggestion, golden split, grid fit, walkway, bands), the EN/UA string
  dictionaries, and the inline-styled markup. Read it for exact values, tokens, and states.
- `support.js` — the Claude Design runtime that renders `.dc.html`. Third-party; do not edit.
- `thumbnail.webp` — preview thumbnail of the rendered design.
- `screenshots/` — rendered captures of the 3D module visualizer (CSS-transform mock;
  production uses `@react-three/fiber`, see DESIGN.md).

## How to view

Open `prototype.dc.html` in a browser (it loads `support.js` from the same folder).
Toggle light/dark with the ☾ button, EN/UA with the pill, and 2D/3D with the segmented
control. The worked-example data (three rooms, M = 700) is baked in.

## What to take from it vs. rebuild

- **Take verbatim:** color tokens, typography rules, the logo SVG, animation keyframes,
  layout structure, component states, worked-example numbers, EN/UA strings, and the
  pure calculation helpers (they map 1:1 to `lib/calculations.ts` in the build).
- **Rebuild, don't copy:** the markup (it's `x-dc`, port to React/Next Client Components),
  and the 3D scene (the prototype fakes 3D with CSS `transform-style: preserve-3d`;
  production uses lazy-loaded `@react-three/fiber` per `TC-STACK-04`).
