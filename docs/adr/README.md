# Architecture Decision Records

Short, numbered records of decisions that shape *how* we build, distinct from
*what* we build (that lives in [../PDR.md](../PDR.md)) and the order we build it
(that lives in [../CAPABILITIES.md](../CAPABILITIES.md)).

Each ADR is immutable once accepted; to change a decision, add a new ADR that
supersedes the old one and update the `Status` line of both.

| # | Title | Status | Touches |
|---|-------|--------|---------|
| [0001](0001-test-runner.md) | Test runner: Node `node:test` + `tsx` | Accepted | `calculation-engine`, NFR-TEST-01, NFR-PURE-01 |
| [0002](0002-standard-modules-swappable-constant.md) | `STANDARD_MODULES` as a single swappable constant; `residual` always surfaced | Accepted | `calculation-engine`, `module-2d`, OQ-01, FR-MODULE-01/03 |

> These two records resolve the design-explore threads **A** (test tooling) and
> **B** (the engine's seed constant) that surfaced before change 1 was proposed.
