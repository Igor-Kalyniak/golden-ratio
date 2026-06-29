# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

The **Apartment Module & Golden Ratio Calculator** — a single-page, client-side web app that automates the proportional planning an architect does at the start of a project. The architect enters a ceiling height, an opening height, and room dimensions; the app proposes an apartment module and derives height bands, golden-ratio zone divisions, grid-fit analysis, and walkway recommendations.

A **2D ⇄ 3D mode toggle** switches between plan inputs (length × width) and volume inputs (adding ceiling and optional opening height), and a **read-only module visualizer** (2D SVG plan / lazy-loaded 3D `@react-three/fiber`) draws each room to scale and highlights one module unit so its size relative to the room is visible. A **golden-ratio SVG logo** anchors the header. The visualizer is a comprehension aid only — it never edits geometry and nothing is exported.

Everything is pure client-side math: no accounts, no database, no server round-trips, no export. The interface is bilingual (UA/EN). See **Product docs** below for the full spec.

## Setup & commands

```bash
npm install      # install dependencies
npm run dev      # start the dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

## Project structure

- `app/` — application routes, layouts, and pages
- `public/` — static assets served at the root
- `docs/` — product documentation (see below)
- `.agents/skills/` — agent skills (see below)
- root config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`

## Rendering & dependencies

- **2D rendering stays pure SVG** (Tailwind utilities only) — no extra dependency for the vertical bands or the 2D module visualizer.
- **3D rendering uses `@react-three/fiber` + `@react-three/drei`** — the only permitted heavy dependency. It **must be lazy-loaded** via `next/dynamic` with `ssr: false` so the 2D path and first paint carry no 3D code (`TC-STACK-04`, `NFR-BUNDLE-01`). Always provide a WebGL-unavailable fallback to the 2D visualizer (`FR-VIZ3D-06`) and honor `prefers-reduced-motion`. A dedicated `three-3d` skill may be added under `.agents/skills/` when 3D work begins; until then, follow these constraints and the design spec.

## Product docs

Before planning or implementing features, read the docs in **`docs/`**:

- **[docs/PDR.md](docs/PDR.md)** — numbered requirements (`FR-*`, `NFR-*`, `TC-*`, `BC-*`); the traceable source of truth for what to build and how to verify it.
- **[docs/PRODUCT-BRIEF.md](docs/PRODUCT-BRIEF.md)** — business narrative, audience, and UX intent behind the requirements.
- **[docs/superpowers/specs/](docs/superpowers/specs/)** — originating design specs, including the [2D/3D mode + module visualizer + logo spec](docs/superpowers/specs/2026-06-29-2d-3d-mode-and-logo-design.md).

When scope is unclear, resolve it against `PDR.md` first. Use the product brief for tone, priorities, and "why," not as a substitute for requirement IDs.

## Session handoff

Maintain **[docs/CURRENT_STATE.md](docs/CURRENT_STATE.md)** as a living handoff log. Update it at the **end of every agent session** (or after any meaningful milestone) so the next run knows where things stand.

Each update must include:

- **Last updated** — ISO 8601 timestamp (e.g. `2026-06-25T14:30:00+03:00`)
- **Last action** — one-line summary of what was just done
- **Status** — what works, what is in progress, what is blocked
- **Next steps** — concrete tasks for the next session
- **Notes** — decisions, open questions, or requirement IDs touched (optional but encouraged)

Do not duplicate full specs here; link to `PDR.md` / `PRODUCT-BRIEF.md` and record only session-specific deltas.

## Skills

Detailed, task-specific guidance lives in `.agents/skills/`. Load the relevant skill before working in its area:

- **`nextjs-frontend`** — all framework guidance for this app: the read-docs-first rule, Server vs Client Components, data fetching, Cache Components, Server Actions, routing conventions, streaming, Route Handlers, error handling, and performance. Apply it whenever writing, reviewing, or refactoring code under `app/`. See [.agents/skills/nextjs-frontend/SKILL.md](.agents/skills/nextjs-frontend/SKILL.md).

Browse [.agents/skills/](.agents/skills/) for the full catalog of available skills.
