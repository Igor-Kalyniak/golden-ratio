# Manual Test Plan — `module-2d`

> Written/refreshed by the `qa-traceability` skill at the QA stage of the `ship-capability` loop.
> Prioritizes requirements with **no automated coverage** (see the traceability matrix). This change
> is a **pure engine extension** — `suggestModule2D` in `lib/calculations.ts` — with **no UI, no
> i18n, no state**. Every clause of `FR-MODULE2D-01` and the delivered data-contract half of
> `FR-MODULE2D-02` is therefore **fully automated** in `lib/calculations.test.ts`; there are **no
> manual DOM cases** for this change. The cases below are runnable-assertion cases (execute the
> named unit tests) plus a scope note recording what is deferred to change 13.

- **Change:** `module-2d` (capability 12 — first change of Epic B)
- **Owned requirement IDs:** `FR-MODULE2D-01, FR-MODULE2D-02`
- **Last updated:** `2026-07-03T18:45:00+03:00`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §10 / the spec at
  [openspec/specs/module-2d/spec.md](../../../openspec/specs/module-2d/spec.md).
  A single room `4200 × 3500` yields `gcd = 700` (a standard module, residual 0); the three-room set
  `4200×3500`, `3800×2500`, `2150×1500` folds to `rawGcd = 50` → `suggested = 100`, `residual = 50`.

## Scope note

`suggestModule2D(rooms: readonly RoomDimensions[]): ModuleSuggestion` folds `gcd` across **every**
room's `length` and `width` (seed `0`, so `gcd(0, x) = x`; a single room degenerates to
`gcd(length, width)`), then reuses the shared `suggestionFromGcd(rawGcd)` tail to snap to the
nearest `STANDARD_MODULES` value, surface the residual `|rawGcd − suggested|` (always, never hidden
as 0), and offer the two nearest other standard modules. `suggestionFromGcd` was **extracted
verbatim** from `suggestModule` (behaviour-preserving DRY lift) so the 2D and 3D suggestion paths
cannot drift; the pre-existing change-1 `suggestModule` tests still pass, so there is **no
requirement regression**. `RoomDimensions` is a structural `{ length, width }` subset of `Room`, so
the engine takes **no dependency on `lib/app-state.ts`** (`NFR-PURE-01` held, no import cycle).

The diff is confined to `lib/calculations.ts` + `lib/calculations.test.ts` (+ `tasks.md`
checkmarks): **no UI, no i18n, no state, no new dependency**. The **active-module selection + 2D/3D
mode wiring** described by the second half of `FR-MODULE2D-02` (the user-selected active module that
drives golden split, grid fit, and the 2D visualizer) is intentionally **out of scope here and is
owned/completed by `mode-toggle` (change 13)** — see TC-2 and the CAPABILITIES card #12.

### Automated coverage note (read before running)

All cases are exercised by `node --test lib/calculations.test.ts` (part of the full
`node --test lib/*.test.ts` suite — **82/82 green**). The five `suggestModule2D` cases are all under
the `suggestModule2D:` name prefix.

## Cases

### TC-1 — `suggestModule2D` folds a GCD-derived, standard-snapped module  (FULLY AUTOMATED)

- **Requirement(s):** `FR-MODULE2D-01`
- **Automated coverage:** `lib/calculations.test.ts` —
  - `"suggestModule2D: single room → gcd(length, width)"` — a single room `4200 × 3500` →
    `rawGcd = gcd(4200, 3500) = 700`, `suggested = 700`, `residual = 0` (single-room degenerate case).
  - `"suggestModule2D: folds the GCD across every room’s length & width"` — the three-room worked
    example (`4200×3500`, `3800×2500`, `2150×1500`) → `rawGcd = 50` (GCD of all six dimensions),
    `suggested = 100` (nearest standard module), `residual = 50` (surfaced, not silent).
  - `"suggestModule2D: fold is order-independent (GCD associativity)"` — reordering the rooms and
    swapping each room's `length ⇄ width` folds to the **identical** `rawGcd` (the fold is
    commutative/associative, so input order never changes the suggestion).
  - `"suggestModule2D: non-standard GCD snaps to a standard module, residual surfaced"` — a room
    `1250 × 1250` (`gcd = 1250`, not a standard module) → `suggested ∈ STANDARD_MODULES`,
    `suggested ≠ rawGcd`, `residual > 0` (the poor snap is visible, not silent).
  - `"suggestModule2D: empty list folds to rawGcd 0, snaps to smallest module (residual surfaced)"` —
    `suggestModule2D([])` → `rawGcd = 0`, `suggested = 100` (`nearestStandardModule(0)`, no `|| 100`
    magic), `residual = 100` (honest, not hidden as 0). Degenerate case; UI-gated to ≥1 valid room.
- **Preconditions:** Repo checked out at the reviewed head; `node --test lib/calculations.test.ts`.
- **Steps:**
  1. Run `node --test lib/calculations.test.ts` and confirm the five `suggestModule2D:` subtests
     above all pass.
  2. Confirm the returned object has the full `ModuleSuggestion` shape
     `{ rawGcd, suggested, alternatives, residual }` (same shape as `suggestModule`), with
     `suggested` a member of `STANDARD_MODULES = [100,150,200,300,350,600,700]` in every case.
- **Expected result:** `rawGcd` is the GCD folded over every room's length & width (single room →
  `gcd(length, width)`); `suggested` is that GCD snapped to the nearest standard module; `residual`
  is always surfaced. All five subtests green.
- **Result:** `pass` — FULLY AUTOMATED. Pure engine, no UI/i18n/state, so no manual DOM step.

### TC-2 — `suggested` is always a standard module, never the raw GCD  (DATA CONTRACT AUTOMATED; mode/selection wiring deferred to change 13)

- **Requirement(s):** `FR-MODULE2D-02`
- **Automated coverage:** `lib/calculations.test.ts` —
  - `"suggestModule2D: non-standard GCD snaps to a standard module, residual surfaced"` — pins
    `suggested ∈ STANDARD_MODULES` **and** `suggested ≠ rawGcd` (the raw GCD is never leaked as the
    active-module default).
  - `"suggestModule2D: empty list folds to rawGcd 0, snaps to smallest module (residual surfaced)"` —
    even the degenerate fold yields a standard `suggested = 100`, never `rawGcd = 0`.
  - `"suggestModule2D: single room → gcd(length, width)"` — `suggested = 700 ∈ STANDARD_MODULES`.
- **Preconditions:** `node --test lib/calculations.test.ts`.
- **Steps:**
  1. Run the suite; confirm the three subtests above pass — the DATA-CONTRACT half of
     `FR-MODULE2D-02` (the value the UI defaults the active module to is `suggested`, always a
     standard module, never the raw GCD) holds.
  2. **Deferred half — verified in change 13, not here.** The **active-module selection** (the
     user-selectable value defaulting to `suggested`) and the **2D/3D mode wiring** that makes the
     active module **drive golden split, grid fit, and the 2D visualizer** are **not part of this
     pure-engine change**. They are owned and completed by `mode-toggle` (change 13), matching
     CAPABILITIES card #12 and the dependency graph. Do **not** expect any UI, state, or downstream
     wiring to exist in this change — its diff is `lib/calculations.ts` + test only.
- **Expected result:** For any non-empty set of rooms, `suggested` is one of `STANDARD_MODULES` and
  is the value the active module defaults to; `rawGcd` appears only as the traceability input, never
  as the active module. The selection + mode-drive behaviour is verified by change 13's test plan.
- **Result:** `pass` (data contract) — AUTOMATED. The active-module selection + mode wiring is
  **deferred to `mode-toggle` (13)**; the deferral was judged honest and correctly scoped by all
  three fresh reviewers (0 findings). Traceability status for `FR-MODULE2D-02` is therefore
  `partial` until change 13 lands the wiring.
</content>
