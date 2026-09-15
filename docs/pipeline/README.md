# Full-Loop Engineering Pipeline

An automated, multi-agent cycle for shipping the 16 OpenSpec capabilities in
[docs/CAPABILITIES.md](../CAPABILITIES.md) **one at a time**, each with consistent review and QA
evidence. It wraps the existing `opsx` skills with the review, QA, and docs stages that the raw
`propose → apply → archive` flow is missing.

## The loop

```
select → propose → validate(--strict) → apply(MAKER) → review(CHECKERS, parallel)
   → synthesize review-findings.json → QA + trajectory eval → archive → docs → next
```

Driven by the **`/ship-capability [<id>]`** command (`.claude/commands/ship-capability.md`). With no
id it picks the next unstarted capability in CAPABILITIES §3 order (first: `calculation-engine`); with
`all`/`autonomous` it loops through the whole backlog.

| Stage | Runs | Produces |
|-------|------|----------|
| Propose | `openspec-propose` (`/opsx:propose`) | `openspec/changes/<id>/{proposal,design,tasks}.md` |
| Validate | `openspec validate <id> --strict` | recorded result (advisory) |
| Apply · **Maker** | `openspec-apply-change` (`/opsx:apply`) | implemented code, tasks checked |
| Review · **Checkers** | `capability-review` skill → `code-reviewer` + `spec-compliance-auditor` + `security-reviewer` (parallel, fresh, read-only) | `openspec/changes/<id>/review-findings.json` |
| QA / eval | `qa-trajectory-evaluator` agent → `qa-traceability` skill | `trajectory-eval.json`, `docs/qa/traceability-matrix.md`, `docs/qa/test-plans/<id>.md` |
| Archive | `openspec-archive-change` (`/opsx:archive`) + `openspec-sync-specs` | `openspec/changes/archive/<date>-<id>/…` (findings travel with it) + updated `openspec/specs/` |
| Docs | `docs-update-after-capability` skill | `docs/CURRENT_STATE.md`, `docs/CAPABILITIES.md` status |

## Two principles

- **Maker ≠ Checker.** The session/subagent that writes the code (the Maker) never reviews it. Reviews
  run as **freshly dispatched subagents** with clean context and **read-only** tools, in an isolated
  worktree. Independence is by context isolation + hostile personas (same model — Codex/OpenAI isn't
  available in this Bedrock environment; see the seams below to add model diversity later).
- **Advisory gate.** Every stage records findings; the loop **always proceeds** to archive. Humans triage
  `review-findings.json` afterward. `openspec validate --strict` is surfaced, not enforced.

## Artifacts & schemas

- `review-findings.json` — [schema](schemas/review-findings.schema.json). Synthesized reviewer findings;
  archived with the change at `openspec/changes/archive/<date>-<id>/review-findings.json`.
- `trajectory-eval.json` — [schema](schemas/trajectory-eval.schema.json). Per-requirement
  implemented/tested/spec_compliant walk.
- `docs/qa/traceability-matrix.md` — requirement ID → capability → tasks → tests → manual plan → status.
- `docs/qa/test-plans/<id>.md` — manual test plan per capability (from `test-plans/TEMPLATE.md`).

## Running it

```
/ship-capability                     # next unstarted capability
/ship-capability calculation-engine  # a specific capability
/ship-capability all                 # autonomous: loop the whole backlog, one at a time
```

The master prompt for kicking this off (and an autonomous variant) is in
[MASTER-PROMPT.md](MASTER-PROMPT.md).

## Optional hands-off autopilot (opt-in)

A `Stop` hook (`.claude/hooks/after-propose-continue.sh`, wired in `.claude/settings.json`) can auto-continue
the loop for an in-flight change — i.e. keep going automatically after `/opsx:propose`. It is **inert by
default** and only activates when a flag file exists:

```
touch .claude/.pipeline-autopilot   # enable hands-off runs (flag is gitignored)
rm    .claude/.pipeline-autopilot   # disable
```

The `/ship-capability` command is the reliable path; the hook is a convenience for unattended runs and is
deliberately conservative (it won't re-fire inside a forced continuation, and stops nudging once a change
is reviewed).

## Components

- Command: `.claude/commands/ship-capability.md`
- Skills: `.claude/skills/{capability-review,qa-traceability,docs-update-after-capability}/SKILL.md`
- Agents: `.claude/agents/{code-reviewer,spec-compliance-auditor,security-reviewer,qa-trajectory-evaluator}.md`
- Hook: `.claude/hooks/after-propose-continue.sh`
- Schemas: `docs/pipeline/schemas/*.schema.json`

## Extending later (built-in seams)

- **Blocking gate:** in `/ship-capability`, stop before archive when `counts.critical|high > 0` or strict
  validation failed, and loop back to fix→re-review. No agent/schema change needed.
- **Different-model / external (Codex) reviewer:** dispatch one Checker with a different `model`, or add a
  4th reviewer that shells out to an external CLI and appends its element to `reviewers[]`. Nothing else changes.

See the plan of record at `.claude/plans/i-would-like-to-vivid-tulip.md` for rationale.
