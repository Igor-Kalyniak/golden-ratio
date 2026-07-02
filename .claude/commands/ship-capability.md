---
name: "Ship Capability"
description: Run the full engineering loop for one OpenSpec capability — propose → validate → apply (Maker) → parallel review (Checkers) → QA/trajectory eval → archive → docs. Advisory gate.
category: Workflow
tags: [workflow, openspec, review, qa, orchestrator]
---

Run the **full-loop engineering cycle** for a single OpenSpec capability, end to end, coordinating the
existing `opsx` skills with the review, QA, and docs stages. One capability = one OpenSpec change.

**Argument:** an optional capability id (e.g. `/ship-capability calculation-engine`). If omitted, pick the
**next unstarted** capability in [docs/CAPABILITIES.md](docs/CAPABILITIES.md) §3 order (respecting
dependencies; the first is `calculation-engine`). If the user says "all" / "loop" / "autonomous", run the
loop repeatedly through the CAPABILITIES order until done or interrupted (see **Autonomous mode**).

Announce the chosen capability and that this runs the advisory pipeline. Track the stages below with a todo list.

---

## The loop (one capability)

### 1. Select
Read the capability's card in [docs/CAPABILITIES.md](docs/CAPABILITIES.md) and its **owned requirement IDs**;
open those IDs' definitions in [docs/PDR.md](docs/PDR.md). Confirm its dependencies already shipped (archived).
Carry the id + owned requirement IDs through every later stage.

### 2. Propose
Invoke the **`openspec-propose`** skill (`/opsx:propose <id>`) to scaffold the change and write
`proposal.md` → `design.md` → `tasks.md` under `openspec/changes/<id>/`.

### 3. Validate (advisory gate)
```bash
openspec validate <id> --strict --json
```
Record the result. **Advisory** — surface errors/warnings prominently but do **not** stop. (Note: `opsx`
does not validate on its own; this stage adds the strict check the plan calls for.)

### 4. Apply — the **Maker**
Invoke the **`openspec-apply-change`** skill (`/opsx:apply <id>`) to implement the tasks, flipping
`- [ ]` → `- [x]`. **This session/subagent is the Maker.** Capture `base_sha` (pre-apply) and `head_sha`
(post-apply) with `git rev-parse` for the reviewers. Run `npm run lint` and `npm test` and note results.

### 5. Review — the **Checkers** (Maker ≠ Checker)
Invoke the **`capability-review`** skill. It:
- creates an isolated **read-only** worktree at `head_sha` (`.worktrees/review-<id>`, gitignored; or native `EnterWorktree`);
- dispatches **in parallel** three FRESH subagents that did **not** write the code — `code-reviewer`,
  `spec-compliance-auditor`, `security-reviewer` (optionally a 4th native `/code-review` second opinion) —
  each given the id, owned requirement IDs, and `base_sha..head_sha`;
- synthesizes their findings into `openspec/changes/<id>/review-findings.json`
  ([schema](docs/pipeline/schemas/review-findings.schema.json)), promoting severity when 2+ reviewers agree.

**Never let the Maker review its own diff.** The gate is **advisory**: continue regardless, but print any
`critical`/`high` findings clearly for human triage. (To make it blocking, see the seam in the
`capability-review` skill.)

### 6. QA / trajectory eval
Dispatch the **`qa-trajectory-evaluator`** agent (uses the **`qa-traceability`** skill) to:
- walk each owned requirement ID one-by-one → `openspec/changes/<id>/trajectory-eval.json`
  ([schema](docs/pipeline/schemas/trajectory-eval.schema.json));
- upsert `docs/qa/traceability-matrix.md`;
- write/refresh `docs/qa/test-plans/<id>.md` (prioritizing untested requirements).

### 7. Archive
Ensure `review-findings.json` and `trajectory-eval.json` sit inside `openspec/changes/<id>/` (so they
travel with the change), then invoke the **`openspec-archive-change`** skill (`/opsx:archive`), which moves
the change to `openspec/changes/archive/<YYYY-MM-DD>-<id>/` and syncs `openspec/specs/` (via
`openspec-sync-specs`). Result: findings land at
`openspec/changes/archive/<YYYY-MM-DD>-<id>/review-findings.json`.

### 8. Docs
Invoke the **`docs-update-after-capability`** skill: update `docs/CURRENT_STATE.md`, mark the capability's
status in `docs/CAPABILITIES.md`, refresh any affected feature docs, and apply the doc quality gate.

### 9. Report
Print a one-screen summary: capability, `--strict` result, tasks done, review counts
(`critical/high/medium/low`) + advisory verdict, QA coverage (implemented/tested/spec_compliant), archive
path, docs updated. Then name the next capability.

---

## Autonomous mode

If asked to run the whole backlog: repeat stages 1–9 for each capability in CAPABILITIES §3 order,
**one at a time** (keep a single active change unless two same-indent items are genuinely parallel). After
each iteration, checkpoint (the report in stage 9) and continue to the next unstarted capability. Stop when
all are archived, on an unrecoverable error, or when the user interrupts. Because the gate is advisory, a
capability with open findings still archives — they are recorded in its `review-findings.json` for later triage.

## Guardrails

- **Maker ≠ Checker** is absolute: reviewers are always fresh subagents with read-only tools; the implementer never reviews itself.
- Reuse the existing skills (`openspec-propose/-apply-change/-archive-change/-sync-specs`, `capability-review`, `qa-traceability`, `docs-update-after-capability`) — do not reinvent their steps here.
- Always produce `review-findings.json` and `trajectory-eval.json`, even when clean.
- Respect dependencies from CAPABILITIES §3/§4 — never ship a change before its prerequisites are archived.
- Pause and ask if propose/apply hits an ambiguity or a real blocker; don't guess through it.
