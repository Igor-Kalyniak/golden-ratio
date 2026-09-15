---
name: qa-traceability
description: Build the QA evidence for an applied OpenSpec change — the requirement traceability matrix, the per-capability manual test plan, and the per-requirement trajectory eval. Use in the ship-capability loop (via the qa-trajectory-evaluator agent) or standalone to refresh QA coverage. Keys everything to PDR requirement IDs.
---

Produce durable, requirement-keyed QA evidence for one applied OpenSpec change. The natural key is the **PDR requirement ID** (`FR-*`/`NFR-*`/`TC-*`/`BC-*`) — the same ID used in specs, tasks, and reviews — so coverage stays traceable end to end.

## Three artifacts

### 1. Traceability matrix — `docs/qa/traceability-matrix.md`

One durable table for the **whole product**; upsert rows per change, never clobber other changes' rows. Columns:

| Requirement ID | Capability | PDR § | Tasks | Automated tests | Manual plan | Status |
|----------------|------------|-------|-------|-----------------|-------------|--------|

- **Requirement ID** — from the PDR.
- **Capability** — the OpenSpec change id that owns it (per [docs/CAPABILITIES.md](docs/CAPABILITIES.md)).
- **PDR §** — section/anchor in [docs/PDR.md](docs/PDR.md).
- **Tasks** — the `tasks.md` item(s) implementing it (e.g. `calculation-engine#3`).
- **Automated tests** — `file::test-name` refs, or `—` if none.
- **Manual plan** — link to the step in `docs/qa/test-plans/<id>.md` (e.g. `<id>.md#tc-3`), or `—`.
- **Status** — `covered` (impl + test), `manual-only` (impl + manual step, no automated test), `partial`, `gap`, or `deferred`.

### 2. Manual test plan — `docs/qa/test-plans/<id>.md`

One file per change, from [docs/qa/test-plans/TEMPLATE.md](docs/qa/test-plans/TEMPLATE.md). Prioritize requirements with **no automated coverage**. Each case: an id (`TC-<n>`), the requirement ID(s) it exercises, preconditions, numbered steps, and the expected result — anchored to the worked example in `docs/DESIGN.md` where one exists.

### 3. Trajectory eval — `openspec/changes/<id>/trajectory-eval.json`

Walk each owned requirement **one-by-one** and record whether it is implemented, tested, and spec-compliant. This is the per-spec, requirement-level evaluation of the implementation's trajectory. Schema at [docs/pipeline/schemas/trajectory-eval.schema.json](docs/pipeline/schemas/trajectory-eval.schema.json):

```json
{
  "change": "calculation-engine",
  "generated_at": "2026-07-03T14:40:00+03:00",
  "requirements": [
    {
      "id": "FR-MODULE-01",
      "pdr_section": "Module engine",
      "implemented": true,
      "tested": true,
      "spec_compliant": true,
      "evidence": ["lib/calculations.ts:suggestModule", "lib/calculations.test.ts::suggestModule snaps to STANDARD_MODULES"],
      "notes": ""
    }
  ],
  "summary": { "total": 12, "implemented": 12, "tested": 11, "spec_compliant": 12 }
}
```

- Booleans reflect **observed** reality (run `npm test`; read the code) — not intent.
- `evidence[]` cites code and test refs; `notes` records caveats and any open reviewer finding that affects the requirement.

## Procedure

1. Gather the owned requirement IDs (CAPABILITIES card × PDR "how to verify" text).
2. Run the suite (`npm test`) and read the diff/tests to establish ground truth.
3. Write `trajectory-eval.json` (one entry per requirement).
4. Upsert the matrix rows for those IDs.
5. Write/refresh `docs/qa/test-plans/<id>.md`, focusing on `tested: false` requirements.
6. Report coverage numbers (implemented / tested / spec_compliant, and the gaps) to the caller.

## Reuse

- Global **`senior-qa`** skill — Jest/RTL + Playwright scaffolding and coverage analysis when you need to suggest new automated tests to close a gap.
- The reviewers' **`review-findings.json`** — reflect open findings in the affected requirement's `notes` and `Status`.

## Guardrails

- Never mark `tested: true` without a real assertion, or `spec_compliant: true` without checking behavior against the PDR wording.
- QA artifacts only — never modify product code.
- Keep the matrix append-safe: other changes' rows stay intact.
