## 1. Logo component (`components/Logo.tsx`)

- [ ] 1.1 Add a Server Component `Logo` rendering the DESIGN §7 mark verbatim (nested φ:1 rects +
  the three golden-spiral arc paths) over `viewBox="0 0 110 70"`, `stroke="currentColor"`,
  transparent ground, `aria-hidden="true"`, no raster (`FR-LOGO-01`).
- [ ] 1.2 Accept optional `width`/`height`/`className` (default ~40×26 for the header); no
  `'use client'` (pure markup).

## 2. Header integration (`components/Shell.tsx`)

- [ ] 2.1 Replace the placeholder `<span className="h-6 w-6 … border-2 border-accent" />` with
  `<Logo className="shrink-0 text-accent" />` so `currentColor` resolves to the accent token (and
  inverts in dark). Left of the title, unchanged layout.

## 3. Favicon (`app/icon.svg`)

- [ ] 3.1 Add `app/icon.svg` — the same mark, but with an explicit accent color value (not
  `currentColor`, which has no CSS context in a favicon) on a transparent ground, readable at small
  size. Next.js auto-registers it as the site icon; no `layout.tsx` change needed (`FR-LOGO-01`).

## 4. Verification

- [ ] 4.1 Run `node --test lib/*.test.ts` (unchanged 99/99 — no engine change), `npm run lint`,
  `npm run build` (tsc) — all green; confirm `app/icon.svg` is picked up (build emits the icon
  route) and the header renders `<Logo>` in place of the placeholder.
