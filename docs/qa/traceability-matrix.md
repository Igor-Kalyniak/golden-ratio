# Requirement Traceability Matrix

Maps every PDR requirement ID to the OpenSpec change that owns it, the tasks and tests that
implement and verify it, its manual test steps, and its current QA status. Maintained by the
`qa-traceability` skill (via the `qa-trajectory-evaluator` agent) at the QA stage of the
`ship-capability` loop — see [docs/pipeline/README.md](../pipeline/README.md).

- **Key:** the PDR requirement ID (`FR-*`/`NFR-*`/`TC-*`/`BC-*`) from [docs/PDR.md](../PDR.md).
- **Owner map:** [docs/CAPABILITIES.md](../CAPABILITIES.md) (one capability = one OpenSpec change).
- **Status legend:** `covered` = implemented + automated test · `manual-only` = implemented + manual
  step, no automated test · `partial` = incompletely met · `gap` = owned but not yet met ·
  `deferred` = intentionally out of the current change.

> This table is seeded empty. Each change adds/updates only its own requirement rows as it passes
> through the loop; rows for other changes stay intact.

| Requirement ID | Capability | PDR § | Tasks | Automated tests | Manual plan | Status |
|----------------|------------|-------|-------|-----------------|-------------|--------|
| _(none yet — first row lands when `calculation-engine` ships)_ | | | | | | |
