# Master Prompt — Full-Loop OpenSpec Engineering Pipeline

Reusable prompts for the pipeline in [README.md](README.md). Three of them:

1. **Runner** — ship one capability through the whole loop.
2. **Autonomous loop** — ship the entire backlog, one capability at a time.
3. **Builder** — (re)create the pipeline machinery from scratch. This is the "prompt for creating this."

All of it keys off [docs/CAPABILITIES.md](../CAPABILITIES.md) (order + owned requirement IDs) and
[docs/PDR.md](../PDR.md) (requirement definitions). Two principles hold throughout: **Maker ≠ Checker**
(the implementer never reviews its own diff; reviews are fresh, read-only subagents) and an **advisory
gate** (findings are recorded, never block archive).

---

## 1. Runner prompt — one capability

> Paste this to ship a single capability. Replace `<CAPABILITY_ID>` or delete that line to take the next
> unstarted capability in CAPABILITIES order.

```
Run the full ship-capability loop for <CAPABILITY_ID>.

Use the /ship-capability command and follow its stages exactly:
  1. Select — read the capability's CAPABILITIES.md card and its owned PDR requirement IDs; confirm
     its dependencies are already archived.
  2. Propose — /opsx:propose to scaffold proposal.md → design.md → tasks.md.
  3. Validate — `openspec validate <id> --strict --json`; record the result (advisory, do not stop).
  4. Apply (MAKER) — /opsx:apply to implement the tasks; capture base_sha/head_sha; run lint + tests.
  5. Review (CHECKERS) — invoke the capability-review skill: dispatch code-reviewer,
     spec-compliance-auditor, and security-reviewer IN PARALLEL as fresh, read-only subagents in an
     isolated worktree (Maker ≠ Checker), then synthesize openspec/changes/<id>/review-findings.json.
  6. QA — dispatch the qa-trajectory-evaluator: write trajectory-eval.json, upsert
     docs/qa/traceability-matrix.md, and write docs/qa/test-plans/<id>.md.
  7. Archive — ensure the two JSON artifacts are in the change dir, then /opsx:archive (syncs specs).
  8. Docs — run docs-update-after-capability (CURRENT_STATE.md + CAPABILITIES status + quality gate).
  9. Report the summary and name the next capability.

Gate is advisory: proceed even with open findings, but surface any critical/high clearly.
Pause and ask only on a real blocker or ambiguity in propose/apply.
```

---

## 2. Autonomous loop prompt — the whole backlog

> Paste this to run the entire sequence hands-off. (For a fully unattended run you can also enable the
> Stop-hook autopilot: `touch .claude/.pipeline-autopilot` — see README.)

```
Ship every capability in docs/CAPABILITIES.md §3 order, one at a time, using /ship-capability all.

For each capability, run the full loop (propose → validate --strict → apply [MAKER] → parallel review
[CHECKERS] → synthesize review-findings.json → QA/trajectory eval → archive → docs). Respect the
dependency graph — never start a change before its prerequisites are archived. Keep only one active
change at a time unless two same-indent items are genuinely independent.

After each capability, print a checkpoint (validate result, review counts, QA coverage, archive path)
and continue to the next unstarted one. The gate is advisory, so a capability with open findings still
archives — they are recorded in its review-findings.json for later human triage.

Stop when all 16 are archived, on an unrecoverable error, or when I interrupt. Update
docs/CURRENT_STATE.md after every capability.
```

---

## 3. Builder prompt — (re)create the pipeline machinery

> One-time. Use this to regenerate the pipeline in a fresh clone, or to explain to a new agent exactly
> what the machinery is and how it fits together. It reproduces what already exists in this repo.

```
Build an automated, multi-agent full-loop engineering pipeline that ships OpenSpec capabilities one at a
time. Read docs/CAPABILITIES.md and docs/PDR.md first. Honor two principles everywhere: Maker ≠ Checker
(the implementer never reviews its own code; reviewers are freshly dispatched, read-only subagents in an
isolated worktree) and an ADVISORY gate (record findings in review-findings.json; always proceed to
archive; run `openspec validate --strict` and surface — do not enforce — it).

Create exactly these components (reuse the existing opsx skills — openspec-propose / -apply-change /
-archive-change / -sync-specs — as the propose/apply/archive stages; do not reinvent them):

A) Four subagents in .claude/agents/*.md (frontmatter: name, description, model: opus, read-only tools,
   color). All Checkers get NO Edit/Write except the QA one:
   - code-reviewer — correctness/quality/reuse/tests; wraps the global code-reviewer skill + adversarial
     personas; read-only.
   - spec-compliance-auditor — walks the change's owned PDR requirement IDs, runs openspec validate
     --strict, flags gaps and scope drift; read-only.
   - security-reviewer — client-side web risks (SVG/3D injection, deps) and the privacy constraints
     BC-PRIVACY-01 / TC-DATA-01 / BC-SCOPE-01 (no network, no persistence, no analytics); read-only.
   - qa-trajectory-evaluator — writes QA evidence ONLY (docs/qa/** and the change's trajectory-eval.json);
     never touches product code.

B) Three skills in .claude/skills/<name>/SKILL.md (frontmatter: name + description):
   - capability-review — the parallel Checker fan-out, Maker≠Checker rule, worktree isolation, synthesis
     into review-findings.json, and the advisory gate + the canonical review-findings.json schema.
   - qa-traceability — the traceability-matrix format, manual-test-plan template, and the trajectory-eval
     schema; keys everything to PDR requirement IDs; reuses the global senior-qa skill for test scaffolding.
   - docs-update-after-capability — repo-specific docs maintenance (CURRENT_STATE.md + CAPABILITIES status
     + a 6-check quality gate) that does NOT depend on external doc sub-agents.

C) Orchestrator command .claude/commands/ship-capability.md (/ship-capability [<id>]) chaining the loop:
   select → /opsx:propose → validate --strict → /opsx:apply (Maker) → capability-review (Checkers) →
   qa-trajectory-evaluator → /opsx:archive → docs-update-after-capability → report. No id = next unstarted
   capability; "all" = autonomous loop through CAPABILITIES §3 order, respecting the dependency graph.

D) Opt-in Stop hook .claude/hooks/after-propose-continue.sh wired in .claude/settings.json. INERT unless
   .claude/.pipeline-autopilot exists; when enabled it nudges the session to continue the loop for an
   in-flight, not-yet-reviewed change ("automatic after opsx propose"). Guard against infinite loops via
   stop_hook_active. Gitignore /.worktrees/ and .claude/.pipeline-autopilot.

E) JSON Schemas in docs/pipeline/schemas/ for review-findings and trajectory-eval, QA templates under
   docs/qa/ (traceability-matrix.md seed + test-plans/TEMPLATE.md), and docs/pipeline/README.md.

Leave clearly-marked seams to later (i) flip the gate to blocking and (ii) add a different-model / external
(Codex) reviewer, without redesign. Verify: agent/skill frontmatter loads, /ship-capability appears in the
command list, a sample review-findings.json validates against its schema, and the hook is inert while the
flag file is absent.
```

---

### Notes

- **Environment:** Bedrock-only (no Codex/OpenAI, no MCP). Checkers are same-model (Opus) fresh subagents;
  the review skill documents how to add model diversity later.
- **CLI:** `openspec` is global (v1.5.0), not a package dependency — ensure it's on PATH.
- **Source of truth:** the plan of record is `.claude/plans/i-would-like-to-vivid-tulip.md`; requirement IDs
  live in [docs/PDR.md](../PDR.md); order + ownership in [docs/CAPABILITIES.md](../CAPABILITIES.md).
