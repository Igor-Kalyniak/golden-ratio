## Context

This is capability 1 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md) and the foundation of
the whole app: pure proportioning math with no UI. The repo is a scaffolded Next.js 16 / React 19 /
TS-strict app with an empty `lib/` and no test runner wired. Two decisions were pre-resolved as ADRs:
the test runner ([ADR-0001](../../../../docs/adr/0001-test-runner.md), Node `node:test` + `tsx`) and the
`STANDARD_MODULES` structure ([ADR-0002](../../../../docs/adr/0002-standard-modules-swappable-constant.md),
one swappable constant with `residual` always surfaced). The canonical algorithms are frozen in the
`calculation-logic` skill (distilled from `DESIGN.md` §10, §12–13), including the worked-example
numbers this change must reproduce.

## Goals / Non-Goals

**Goals:**
- Deliver `lib/calculations.ts` with the exact function contracts the PDR names, returning the
  documented fields and the worked-example numbers.
- Keep the module framework-free and 100% unit-tested (`NFR-PURE-01`, `NFR-TEST-01`).
- Wire the `node:test` + `tsx` runner and a `test` script so "done = suite green" is checkable.
- Isolate `STANDARD_MODULES` as one swappable constant behind a single snap helper; always compute
  and return `residual`.

**Non-Goals:**
- No React, rendering, SVG, strings, or i18n — those belong to later capabilities.
- No 2D-mode `suggestModule2D` — that is capability 12 (`module-2d`), a separate change.
- No answer to `OQ-01` (authoritative module list); the provisional list is deliberate and cheap to
  revise.

## Decisions

- **One file, named pure exports.** All helpers and `compute*`/`suggest*` functions live in
  `lib/calculations.ts` with shared TypeScript types (`ModuleSuggestion`, `VerticalBands`,
  `GoldenSplit`, `RoomGrid`, `Walkway`, `GridQuality`, `WalkwayRating`). Alternative — splitting into
  per-concern files — was rejected as premature for one cohesive math module.
- **Single snap path.** `nearestStandardModule` is the only function that reads `STANDARD_MODULES`;
  `suggestModule` composes `gcd` → `nearestStandardModule` and derives `alternatives`/`residual`.
  This makes an OQ-01 revision a one-line constant edit ([ADR-0002]).
- **Signed nearest-distance remainders.** Grid remainders use `dimension − round(dimension/m)×m`
  (signed) rather than modulo, so a 1 mm-short dimension reads `close`, not `poor` (`FR-GRID-03/04`).
- **Fixed walkway thresholds.** Ratings are hardcoded mm bands (`≥900/≥600/<600`) and never reference
  M (`BC-WALK-01`). Standard depths 600/900 (and the reference third row 1200) are exposed as
  constants for the UI to consume.
- **Test runner = `node:test`, native type-stripping.** Tests are `lib/*.test.ts` beside the code;
  the `test` script is `node --test lib/*.test.ts`. Node ≥ 22.18 (repo pins 22.22) strips TS types
  natively, so the `tsx` loader from [ADR-0001] is redundant and **dropped** — no test dependency is
  added (ADR-0001 amended 2026-07-03). This strengthens the ADR's zero-dep intent. No jsdom/JSX
  needed for pure math.
- **Rounding contract.** Exact golden values are kept as floats; snapped values go through `snap`.
  Tests assert exact integers for snapped fields and use tolerance (`≈`) only on the raw float
  fields (`larger`/`smaller`/`snapOffset`).

## Risks / Trade-offs

- **Provisional `STANDARD_MODULES` may be wrong for the market (OQ-01)** → Mitigated structurally:
  one constant, one snap path, `residual` always surfaced; a revision is a one-line + fixture edit.
- **Float precision in golden-split assertions** → Mitigated by asserting snapped integer fields
  exactly and applying a small tolerance to the raw float fields.
- **Runner choice can't test DOM/components** → Accepted and explicitly deferred; a future UI test
  runner is a separate, superseding decision ([ADR-0001] "Revisit when").
- **`round` half-to-even vs half-up ambiguity at exact .5 boundaries** → Use `Math.round`
  (half-up) consistently and cover a boundary case in tests so behavior is pinned.

## Migration Plan

Additive only — new `lib/` files plus a `package.json` devDependency and script. No existing code
changes, no runtime dependency, no rollback concern. `app/` is untouched. If reverted, only the new
files and the `test` script are removed.

## Open Questions

- **OQ-01** (authoritative `STANDARD_MODULES` values) — owned by the Architecture SME; stays open by
  design and does not block this change.
- Whether to add a soft "suggestion is N mm off" hint when `residual > ¼M` — captured as a possible
  future `FR-MODULE-05` refinement, out of scope here.
