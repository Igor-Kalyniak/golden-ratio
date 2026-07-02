---
name: docs-update-after-capability
description: Run standardized documentation maintenance after an OpenSpec change is archived in the ship-capability loop. Repo-specific adaptation of docs-maintenance-after-work that updates this project's living docs (CURRENT_STATE.md, CAPABILITIES.md status, affected feature docs) and applies a quality gate — without depending on external doc sub-agents. Use as the final loop stage, or standalone after any meaningful milestone.
---

Keep this repo's documentation truthful after a capability ships. This is the **docs stage** of the
`ship-capability` loop (runs after archive), adapted for this project — it does **not** depend on the
six `agents/docs/*` sub-agents referenced by the imported `docs-maintenance-after-work` skill (they
are not present here). Do the work directly.

## When to run

- End of a `ship-capability` iteration, after `/opsx:archive` moved the change to `openspec/changes/archive/`.
- After any meaningful milestone (per AGENTS.md, `docs/CURRENT_STATE.md` must be updated every session).

## Inputs

- The archived change id, its `diff` / `changed_files`, and a one-line `work_summary`.
- The change's `review-findings.json` and `trajectory-eval.json` (now under the archived dir) — so docs reflect real coverage and open findings.

## Steps

1. **`docs/CURRENT_STATE.md` (always).** Update the living handoff log with the required fields
   (per AGENTS.md → "Session handoff"): `Last updated` (ISO 8601), `Last action` (what shipped),
   `Status` (what works / in progress / blocked), `Next steps` (the next capability in
   [docs/CAPABILITIES.md](../../docs/CAPABILITIES.md) order), and `Notes` (requirement IDs touched,
   decisions, any open reviewer findings). Convert relative dates to absolute. Link, don't duplicate specs.

2. **`docs/CAPABILITIES.md` status (always).** Mark the shipped capability's state (e.g. `proposed →
   accepted`/done) in §2 / its per-change card. Do not rewrite the plan; just reflect reality.

3. **Feature docs (conditional).** If the change added or changed user-facing behavior or a public
   contract, update the affected doc(s) — the relevant `.agents/skills/*` domain skill notes, `docs/DESIGN.md`
   deltas, or an ADR under `docs/adr/` if a decision was made. Skip if nothing user-facing changed.

4. **QA cross-check (conditional).** Confirm the QA stage already updated `docs/qa/traceability-matrix.md`
   and `docs/qa/test-plans/<id>.md`; if a gap is obvious, note it in CURRENT_STATE `Next steps` rather
   than silently leaving docs stale.

5. **Reusable pattern (conditional).** If a genuinely reusable pattern emerged, capture it where the
   team will find it (a domain skill note or an ADR) — not in a scratch file.

## Documentation quality gate

Before claiming the docs step done, verify every touched doc against these six checks:

1. **Specificity** — concrete names/paths/IDs, not vague prose.
2. **State clarity** — clearly distinguishes *implemented* from *planned*.
3. **Operational usefulness** — the next agent/dev can act on it.
4. **Contract accuracy** — signatures, requirement IDs, and behavior match the code.
5. **Cross-doc consistency** — CURRENT_STATE, CAPABILITIES, PDR, and QA agree.
6. **Signal over noise** — no filler; link to sources instead of restating them.

## Guardrails

- Never skip the CURRENT_STATE.md update on a shipped capability.
- Never delete or rewrite the source-of-truth docs (PDR/DESIGN/PRODUCT-BRIEF); reflect status, don't mutate scope.
- Mark assumptions explicitly when uncertain rather than asserting.
- Docs only — this stage changes no product code.
