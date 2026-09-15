# Manual Test Plan — `<change-id>`

> Copy this file to `docs/qa/test-plans/<change-id>.md` and fill it in. Written/refreshed by the
> `qa-traceability` skill at the QA stage of the `ship-capability` loop. Prioritize requirements
> that have **no automated coverage** (see the traceability matrix `Status: manual-only | gap`).

- **Change:** `<change-id>`
- **Owned requirement IDs:** `<FR-…, NFR-…>` (from the CAPABILITIES card)
- **Last updated:** `<ISO 8601>`
- **Worked example reference:** [docs/DESIGN.md](../../DESIGN.md) §worked-example (use its numbers as expected values where applicable)

## Preconditions (all cases)

- App running via `npm run dev`; browser open at the local URL.
- Locale and mode noted per case (UA/EN; 2D/3D) where relevant.

## Cases

### TC-1 — `<short title>`

- **Requirement(s):** `<FR-…>`
- **Preconditions:** `<state to set up>`
- **Steps:**
  1. `<action>`
  2. `<action>`
- **Expected result:** `<observable outcome tied to the requirement's "how to verify" wording>`
- **Result:** `<pass | fail | blocked>` — `<note>`

### TC-2 — `<short title>`

- **Requirement(s):** `<NFR-…>`
- **Preconditions:** …
- **Steps:**
  1. …
- **Expected result:** …
- **Result:** …

<!-- Add one TC per uncovered requirement; keep TC ids stable so the matrix can link to them. -->
