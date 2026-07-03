## 1. Fonts & layout (TC-STACK-03)

- [ ] 1.1 In `app/layout.tsx`, replace Geist/Geist_Mono with `Inter` and `JetBrains_Mono` from `next/font/google` (weights 400/500/600/700, `display: swap`), exposed as `--font-sans` / `--font-mono`
- [ ] 1.2 Set `data-theme="light"` and `suppressHydrationWarning` on `<html>`; keep the font variable classes
- [ ] 1.3 Replace the placeholder `metadata` title/description with the app's name

## 2. Color tokens (TC-STACK-03, DESIGN §3)

- [ ] 2.1 Rewrite `app/globals.css`: `@import "tailwindcss"`; remove all create-next-app boilerplate
- [ ] 2.2 Define light tokens on `:root` (surfaces, text, lines, `--field`, OKLCH accent + status, with `-bg`) verbatim from DESIGN §3
- [ ] 2.3 Define dark tokens on `[data-theme="dark"]` verbatim from DESIGN §3
- [ ] 2.4 Add `@custom-variant dark` bound to `[data-theme="dark"]` so `dark:` utilities share the selector

## 3. Theme wiring (TC-STACK-02)

- [ ] 3.1 Map tokens into Tailwind via `@theme inline` — `--color-*` for each surface/text/line/status token, plus `--font-sans` / `--font-mono`
- [ ] 3.2 Base `body`: apply `--sans`, `--bg`/`--fg`, and `font-feature-settings: "tnum" 1, "cv01" 1`
- [ ] 3.3 Confirm utilities resolve (`bg-panel`, `text-muted`, `border-line`, `font-mono`)

## 4. Motion & focus (DESIGN §8, NFR-A11Y-02)

- [ ] 4.1 Add keyframes `livedot`, `griddraw`, `cellpulse`, `spin3d`
- [ ] 4.2 Add `@media (prefers-reduced-motion: reduce)` global animation suppressor
- [ ] 4.3 Add a visible focus style: `outline: 2px solid var(--accent)` with offset

## 5. Accessibility & contrast (NFR-A11Y-02)

- [ ] 5.1 Verify WCAG AA (≥ 4.5:1 normal text) for `--fg/--bg`, `--fg/--panel`, `--muted/--bg` in BOTH themes
- [ ] 5.2 Confirm the `--good/--warn/--bad/--err` + `-bg` tokens are distinct enough to pair with label+icon at the component layer (no color-only reliance)

## 6. Verify

- [ ] 6.1 `npm run build` succeeds (Tailwind compiles the token theme; fonts resolve)
- [ ] 6.2 `npm run lint` is clean for `app/`
- [ ] 6.3 `npm test` still green (engine suite unaffected)
- [ ] 6.4 Manual: toggling `data-theme="dark"` on `<html>` swaps every surface/text/status token
