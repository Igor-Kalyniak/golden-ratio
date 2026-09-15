# ADR 0002 — `STANDARD_MODULES` as a single swappable constant; `residual` always surfaced

- **Status:** Accepted (structure). The *values* remain open — see `OQ-01`.
- **Date:** 2026-07-02
- **Deciders:** Eng (structure); Architecture SME owns the values
- **Related:** `calculation-engine` (change 1), `module-2d` (change 12),
  `FR-MODULE-01`, `FR-MODULE-03`, `FR-MODULE2D-01`, `OQ-01`, assumption A-02

## Context

Every module suggestion snaps a raw GCD to the nearest value in one list:

```
STANDARD_MODULES = [100, 150, 200, 300, 350, 600, 700]
                              step 50       gap 250 ↑      step 100
```

`OQ-01` flags this list as **not yet authoritative** for the target (UA) market, and
the PDR risk register names the cost of getting it wrong: *"suggestions feel wrong;
erodes trust in the core feature."* Two structural facts sharpen the risk:

1. The list is **irregular** — a 250 mm gap between 350 and 600. A raw GCD landing in
   that dead zone (e.g. 475) snaps a long way from its true value, and such a snap does
   **not** trip the existing `> 1000` / `< 100` impractical-module warnings
   (`FR-MODULE-05`).
2. `CAPABILITIES.md` §7 says OQ-01 *refines constants, it does not block starting* — but
   that only holds if a later value change stays cheap and a poor snap stays visible.

## Decision

Build the engine so that **being wrong about the numbers costs almost nothing**:

1. **Single source of truth.** `STANDARD_MODULES` is one exported `const` in
   `lib/calculations.ts`. The provisional v1 value is `[100, 150, 200, 300, 350, 600, 700]`.
2. **One snap path.** All snapping goes through a single helper (e.g.
   `nearestStandardModule`) that reads only that constant — no list literal is duplicated
   anywhere else in the engine or UI.
3. **`residual` is always computed and always surfaced.** `suggestModule` /
   `suggestModule2D` always return `residual` (distance `rawGcd → suggested`), and the
   Module Summary always shows it (`FR-MODULE-03`). A mediocre suggestion is therefore
   **visible, never silent**.
4. **OQ-01 stays open but non-blocking.** Revising the list later is a one-line constant
   edit plus updating the worked-example fixtures; no algorithm or UI change.

## Rationale

Isolating the list and always exposing `residual` decouples the *value* question (SME's,
still open) from the *build* (Eng's, can start now). The SME can hand over a corrected
list at any time and the change is trivial and fully test-covered; meanwhile users always
see how far a suggestion sits from their inputs, which directly mitigates the OQ-01 trust
risk.

## Consequences

- **+** SME can revise `STANDARD_MODULES` without touching logic or tests beyond the
  constant and the expected fixture numbers.
- **+** `residual` visibility protects trust independent of whether the values are perfect.
- **−** Worked-example unit fixtures are tied to the provisional list; changing values
  means updating expected numbers — that is exactly what fixtures are for.
- **Open (not committed here):** whether to add a *soft* "suggestion is N mm off" hint
  when `residual` exceeds a threshold (e.g. `> ¼M`) even though the `> 1000` / `< 100`
  warnings do not fire. Captured as a possible `FR-MODULE-05` refinement, to be decided
  with the SME alongside `OQ-01`; not part of this ADR.

## Revisit when

- The Architecture SME closes `OQ-01` with an authoritative list → update the constant
  and fixtures (no new ADR needed; this ADR already anticipates it).
- We decide to add the soft-residual hint → that is an `FR-MODULE-05` change, tracked in
  the PDR, not here.
