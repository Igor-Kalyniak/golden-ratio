Automated Multi-Agent OpenSpec Engineering Loop
Context
The repo (golden-ratio) has a fully-specced product: 16 capabilities in docs/CAPABILITIES.md, each mapped one-to-one onto an OpenSpec change and owning specific PDR requirement IDs. The opsx skills already handle propose → apply → archive → sync, but the loop is incomplete for a production cycle: /opsx:propose and /opsx:apply never run openspec validate --strict, /opsx:apply ends with no review or QA step, and there is no Maker≠Checker separation, no structured review record, no traceability/QA artifacts, and no docs-update step wired to run afterward.

This change builds the missing full-loop engineering pipeline: a per-capability cycle of propose → validate → apply (Maker) → parallel review (fresh Checkers) → QA/trajectory eval → archive → docs update, driven by an orchestrator command (plus an opt-in hands-off hook), so the team can ship the 16 capabilities one-by-one with consistent review and QA evidence. The deliverable also includes a reusable master prompt that kicks the loop off per capability.

Decisions (from clarification)
Deliverable: build the reusable machinery now (agents, review/QA skills, schema, orchestrator, opt-in hook, docs-update skill) plus the master prompt. Do not run it against a real capability this session.
Automation: both — an orchestrator command as the reliable path, plus an opt-in Stop/PostToolUse hook for hands-off runs (there is no native "after opsx propose" event, so the command is primary).
Model diversity: same model, fresh context. Checkers are separately-dispatched fresh subagents (Opus) that did not write the code; independence comes from context isolation + adversarial personas, not a different model. (Codex/OpenAI is unavailable here — Bedrock-only, no MCP.)
Gate policy: advisory. Every step records findings into review-findings.json; the loop always proceeds to archive. Humans triage later. openspec validate --strict is run and surfaced, not enforced.
The loop (one capability = one OpenSpec change)
Orchestrated by /ship-capability <id> (defaults to the next unstarted capability in CAPABILITIES order; first is calculation-engine):

Select — read the capability card in CAPABILITIES.md + owned requirement IDs from PDR.md.
Propose — /opsx:propose <id> → writes openspec/changes/<id>/{proposal,design,tasks}.md.
Validate (advisory) — openspec validate <id> --strict --json; record result, don't hard-stop.
Apply (Maker) — /opsx:apply <id> implements tasks, flips - [ ]→- [x]. This subagent is the Maker.
Review fan-out (Checkers, parallel, fresh, read-only — Maker≠Checker) — dispatch in parallel, each in an isolated read-only worktree, none having written the code:
code-reviewer — correctness, quality, SOLID, reuse (wraps the global code-reviewer skill + adversarial-reviewer personas).
spec-compliance-auditor — walks tasks.md + delta specs against the owned PDR IDs; runs openspec validate --strict; confirms each requirement ID is implemented and covered.
security-reviewer — client-side risks: SVG/3D injection, dependency posture, BC-PRIVACY-01 (no network/secrets), input-bound validation.
(optional) a native /code-review cloud pass as a second opinion.
Synthesize — orchestrator merges all reviewer output into one review-findings.json (schema below).
QA / trajectory eval — via qa-trajectory-evaluator:
update docs/qa/traceability-matrix.md (requirement ID → change → tasks → tests → manual plan → status);
write/refresh docs/qa/test-plans/<id>.md (manual test plan);
trajectory eval — walk each owned requirement ID one-by-one → trajectory-eval.json (implemented / tested / spec_compliant / notes).
Archive — write review-findings.json + trajectory-eval.json into the change dir, then /opsx:archive (spec sync) so they travel into openspec/changes/archive/<YYYY-MM-DD>-<id>/review-findings.json (matches the requested location).
Docs update — docs-update-after-capability skill: refresh docs/CURRENT_STATE.md, mark the capability status in docs/CAPABILITIES.md, update affected feature docs, run the doc quality gate.
Loop to the next capability.
Maker≠Checker is a hard rule in the orchestrator + review skill: the subagent that wrote the diff never reviews it; reviews always run as newly-dispatched subagents against a read-only worktree (EnterWorktree / git worktree add, reusing superpowers:using-git-worktrees).

Files to create
Subagents — .claude/agents/*.md (frontmatter name/description/model: opus/tools read-only/color):

code-reviewer.md, spec-compliance-auditor.md, security-reviewer.md, qa-trajectory-evaluator.md. Reviewer agents get read-only tools only (no Edit/Write) to enforce the checker role.
Skills — .claude/skills/<name>/SKILL.md (repo frontmatter style: name + description):

capability-review/ — the fan-out procedure, Maker≠Checker rule, worktree isolation, the review-findings.json schema, synthesis, advisory gate. Cross-links the reviewer agents and reuses superpowers:dispatching-parallel-agents + requesting-code-review read-only pattern.
qa-traceability/ — traceability-matrix format, manual-test-plan template, trajectory-eval procedure + schema. Reuses the global senior-qa skill for test scaffolding and PDR IDs as the traceability key.
docs-update-after-capability/ — repo-specific adaptation of docs-maintenance-after-work that does not depend on the six missing doc sub-agents; updates CURRENT_STATE.md + CAPABILITIES status + runs the doc quality gate.
Orchestrator — .claude/commands/ship-capability.md (/ship-capability [<id>]): runs the full loop for one capability; supports next-capability mode and an autonomous multi-capability loop. Calls the existing opsx skills — does not reinvent them.

Opt-in hook — .claude/hooks/after-propose-continue.sh wired via a Stop hook in .claude/settings.json (default off, documented enable step). Detects a just-proposed change with no downstream review and injects context to continue the loop. Requires adding .worktrees/ to .gitignore.

Schema & QA templates:

review-findings.json — top-level { change, generated_at, maker, reviewers[], verdict_advisory } where each finding is { id, reviewer, severity: critical|high|medium|low, category, requirement_ids[], file, line, summary, recommendation, status: open|resolved|wontfix }.
docs/qa/traceability-matrix.md — table: Requirement ID | Capability | PDR § | Tasks | Automated tests | Manual plan | Status.
docs/qa/test-plans/TEMPLATE.md + per-capability plans.
trajectory-eval.json — per requirement ID: implemented / tested / spec_compliant / notes.
Docs / master prompt:

docs/pipeline/README.md — the loop overview + how Maker≠Checker and the advisory gate work.
docs/pipeline/MASTER-PROMPT.md — the reusable prompt: a short runner prompt to kick off /ship-capability <id> per capability, an autonomous-loop variant for all 16 in order, and a one-time builder section documenting how the machinery was assembled (for regeneration/onboarding).
Reuse (do not rebuild)
opsx skills (openspec-propose/-apply-change/-archive-change/-sync-specs) — called by the orchestrator.
Global code-reviewer skill scripts + adversarial-reviewer personas — wrapped by the code-reviewer agent.
superpowers:dispatching-parallel-agents, requesting-code-review (read-only worktree template), using-git-worktrees / native EnterWorktree — isolation + fan-out.
senior-qa skill — Jest/Playwright/coverage scaffolding inside the QA agent.
.claude/skills/brainstorming/spec-document-reviewer-prompt.md — pattern for the spec-compliance-auditor.
PDR requirement IDs — the natural key for the traceability matrix and trajectory eval.
Verification
Static: openspec validate --strict runs clean on a scratch change; the four agent files and three SKILL.md files load (valid frontmatter); /ship-capability appears in the slash-command list.
Dry-run of the loop (no capability shipped this session): invoke /ship-capability calculation-engine in a throwaway worktree only far enough to confirm it proposes, validates, dispatches the three review subagents in parallel, and produces a well-formed review-findings.json + trajectory-eval.json — then discard, since the decision was "don't ship a real capability yet."
Hook: confirm the Stop hook is present but inert while disabled, and that enabling it continues after a propose.
Schema: validate a sample review-findings.json against the documented shape; confirm the archive step lands it at openspec/changes/archive/<date>-<id>/review-findings.json.
Notes / open items
openspec CLI is global-only (v1.5.0, not in package.json); the pipeline assumes it's on PATH.
docs-maintenance-after-work references six doc sub-agents absent from this repo — hence the new repo-specific docs-update-after-capability skill rather than depending on it.
Advisory gate + same-model checkers were chosen for speed; the review skill will leave clearly-marked seams to later flip the gate to blocking or add a different-model/Codex reviewer without redesign.