---
name: capability-review
description: Run the parallel multi-agent review of an applied OpenSpec change. Use after /opsx:apply and before /opsx:archive in the ship-capability loop. Dispatches fresh Checker subagents (code-reviewer, spec-compliance-auditor, security-reviewer) in an isolated read-only worktree — Maker≠Checker — then synthesizes their output into a single review-findings.json. Advisory gate: records findings, never blocks archive.
---

Run the review stage of the `ship-capability` engineering loop for one applied OpenSpec change.

## When to use

After `/opsx:apply <id>` has implemented a change (the **Maker** just wrote the code) and before `/opsx:archive`. Invoked by `/ship-capability`, or standalone: "review the applied change `<id>`".

## Core principle — Maker ≠ Checker

The subagent (or session) that wrote the diff **must not** review it. Reviews always run as **freshly dispatched subagents** with clean context that did not participate in implementation. Independence here comes from context isolation + hostile personas (same model). Reviewers are **read-only** (no Edit/Write tools). Do not let the Maker "self-review."

## Steps

1. **Resolve the diff range.** Determine `base_sha` (the change's start point, e.g. the branch point or the commit before apply) and `head_sha` (current). Capture with `git rev-parse`.

2. **Create an isolated read-only worktree** so reviewers inspect a frozen copy without touching the live tree. Prefer the native `EnterWorktree` tool; else reuse `superpowers:using-git-worktrees`:
   ```bash
   git worktree add .worktrees/review-<id> <head_sha>   # .worktrees/ is gitignored
   ```
   (Reviewers may also `git worktree add /tmp/review-<sha> <sha>` per the `superpowers:requesting-code-review` pattern.)

3. **Dispatch the three Checkers IN PARALLEL** (one message, multiple `Agent` calls — see `superpowers:dispatching-parallel-agents`). Give each: the change id, its **owned requirement IDs** (from the CAPABILITIES card), `base_sha..head_sha`, and the worktree path.
   - `code-reviewer` — correctness, quality, reuse, tests.
   - `spec-compliance-auditor` — requirement-ID coverage + `openspec validate --strict`.
   - `security-reviewer` — client-side injection, privacy constraints, deps.
   - *(optional 4th, second opinion)* a native `/code-review` pass, or a second `code-reviewer` under an adversarial persona.

4. **Synthesize** every reviewer's JSON block into one **`review-findings.json`** (schema below) written to `openspec/changes/<id>/review-findings.json` so it travels into the archive. De-duplicate findings; when 2+ reviewers raise the same issue, **promote its severity** one step (per the `adversarial-reviewer` convention) and note the corroboration.

5. **Advisory gate.** Roll findings up into `verdict_advisory` and print a summary. **Always proceed** — never block archive. Surface any `critical`/`high` prominently so a human triages them. (The gate is intentionally advisory; see "Flipping to blocking" below.)

6. **Tear down** the review worktree (`git worktree remove .worktrees/review-<id>`) unless the caller wants it kept.

## review-findings.json schema

Canonical shape (JSON Schema at [docs/pipeline/schemas/review-findings.schema.json](docs/pipeline/schemas/review-findings.schema.json)). Each reviewer emits the `reviewers[]` element; this skill assembles the envelope.

```json
{
  "change": "calculation-engine",
  "generated_at": "2026-07-03T14:30:00+03:00",
  "base_sha": "abc1234",
  "head_sha": "def5678",
  "maker": "opsx-apply (opus)",
  "gate_policy": "advisory",
  "reviewers": [
    {
      "reviewer": "code-reviewer",
      "model": "opus",
      "verdict": "concerns",
      "summary": "one-line rollup",
      "findings": [
        {
          "id": "CR-001",
          "severity": "high",
          "category": "correctness",
          "requirement_ids": ["FR-MODULE-01"],
          "file": "lib/calculations.ts",
          "line": 42,
          "summary": "snap residual not surfaced when suggestion is poor",
          "recommendation": "return and render `residual` from suggestModule",
          "status": "open"
        }
      ]
    }
  ],
  "verdict_advisory": "concerns",
  "counts": { "critical": 0, "high": 1, "medium": 2, "low": 3 }
}
```

Field rules:
- `severity` ∈ `critical | high | medium | low`.
- `category` ∈ `correctness | quality | reuse | test | spec | security | privacy | a11y | perf | docs`.
- `requirement_ids[]` — PDR IDs the finding touches (may be empty for pure quality nits).
- `status` ∈ `open | resolved | wontfix` (starts `open`; humans update later).
- `verdict` / `verdict_advisory` ∈ `clean | concerns | block` — **advisory only**.

## Flipping to blocking later (seam)

The gate is advisory by decision. To make it enforce, change one place: in `/ship-capability`, after synthesis, stop the loop (do not archive) when `counts.critical > 0 || counts.high > 0` or when `openspec validate --strict` failed, and route back to a fix→re-review cycle. No agent or schema change is needed.

## Adding a different-model / external reviewer later (seam)

Checkers are same-model (Opus) today because Codex/OpenAI is unavailable in this environment. To add model diversity, dispatch one Checker with a different `model` (e.g. a Bedrock Sonnet/Haiku via `Agent` `model:` override) or shell out to an external CLI in a fourth reviewer that appends its element to `reviewers[]`. Nothing else changes.

## Guardrails

- Never let the implementer review its own diff.
- Reviewers never modify code; if a reviewer proposes a fix, it stays a finding.
- Always write `review-findings.json` even when clean (empty `findings`, `verdict "clean"`) — the archived evidence must exist.
- Keep the schema stable; downstream QA and humans read it.
