# ADR 0001 — Test runner: Node built-in `node:test` + `tsx`

- **Status:** Accepted
- **Date:** 2026-07-02
- **Deciders:** Eng
- **Related:** `calculation-engine` (CAPABILITIES change 1), `module-2d` (change 12),
  `NFR-TEST-01`, `NFR-PURE-01`, `TC-DATA-01`, `TC-STACK-01`

## Context

Change 1 (`calculation-engine`) is "done when the suite is green," but the repo has
no test runner — no `test` script, no test dependency in `package.json`. Proposing
change 1 therefore forces a testing-stack choice.

The test target is unusually narrow: `NFR-PURE-01` requires `lib/calculations.ts` to
have **zero framework imports** — no `next/*`, no `react`, no DOM. Every unit under
test is a pure function over numbers and plain objects. There is (in Epic A) nothing
to render, no jsdom, no JSX transform needed to test the math.

Options considered:

| Option | Added deps | Fit for pure-math suite |
| ------ | ---------- | ----------------------- |
| **`node:test` + `tsx`** | one tiny dev dep (`tsx`) | Native runner, zero runtime deps, TS run directly |
| Vitest | a multi-package tree | Excellent DX/watch/coverage, but heavy for pure functions |
| Jest | heaviest tree + ts config | Most ceremony, least reason here |

## Decision

Use **Node's built-in test runner (`node:test`)** to run the engine's unit suite,
with **`tsx`** as the dev-only loader that executes the TypeScript directly.

- Tests live beside the code as `lib/*.test.ts`, importing from `lib/calculations.ts`.
- A `test` script (roughly `tsx --test "lib/**/*.test.ts"`, exact form pinned when
  change 1 is implemented) is added to `package.json` **at implementation time**, not
  now — this ADR records the decision, `/opsx:apply` for `calculation-engine` wires it.
- Coverage, if wanted, uses `node --experimental-test-coverage` — no extra dependency.

## Rationale

- **Matches the project's dependency ethos.** Only `@react-three/fiber` is a
  sanctioned heavy dependency (`TC-STACK-04`); the test stack should not quietly become
  the second-largest thing in `node_modules`. `node:test` ships with Node; `tsx` is one
  small dev dependency.
- **The math needs nothing more.** No DOM, no component rendering, no snapshot infra is
  required to verify `suggestModule`, `computeGoldenSplit`, `computeRoomGrid`, etc.
- **Keeps `NFR-PURE-01` honest.** A framework-free runner makes it structurally awkward
  to accidentally pull `react`/`next` into the tested module.

## Consequences

- **+** Minimal dev-dependency surface; fast startup; native, stable API (Node 20+).
- **+** Same runner covers `module-2d` (change 12), which is another pure-engine change.
- **−** No fancy watch UI / built-in mocking library. Acceptable: the engine is pure, so
  there is nothing to mock.
- **−** Component/DOM tests (e.g. React Testing Library for the input fields) are **out
  of scope** for this decision. If we later want them, that is a *new* decision — see
  "Revisit when."

## Revisit when

- We need to test rendered components / DOM behavior (inputs, validation, visualizers).
  At that point weigh adopting **Vitest** (jsdom, RTL integration) for the UI layer while
  keeping `node:test` for the pure engine — or consolidating on one runner. Record it as
  a superseding ADR.
