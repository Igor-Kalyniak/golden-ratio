#!/usr/bin/env bash
# Opt-in autopilot for the ship-capability loop.
#
# INERT by default. It only does anything when the flag file
#   .claude/.pipeline-autopilot           (gitignored, per-checkout)
# exists. Enable hands-off runs with:     touch .claude/.pipeline-autopilot
# Disable with:                           rm .claude/.pipeline-autopilot
#
# When enabled, this Stop hook nudges the session to continue the pipeline for an
# in-flight OpenSpec change that has been proposed/applied but not yet reviewed —
# i.e. "automatic after opsx propose". The reliable path is still the /ship-capability
# command; this is a convenience for unattended runs. See docs/pipeline/README.md.
set -euo pipefail

payload="$(cat || true)"

repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
flag="$repo_root/.claude/.pipeline-autopilot"

# 1. Disabled unless the flag file is present.
[ -f "$flag" ] || exit 0

# 2. Never re-fire inside an already-forced continuation (prevents infinite loops).
case "$payload" in
  *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;;
esac

# 3. Is there an in-flight (non-archived) change not yet reviewed?
changes_dir="$repo_root/openspec/changes"
active="$(find "$changes_dir" -maxdepth 1 -mindepth 1 -type d ! -name archive 2>/dev/null | head -n1 || true)"
[ -n "$active" ] || exit 0                        # nothing in flight -> allow stop
[ -f "$active/review-findings.json" ] && exit 0   # already reviewed -> let the command finish

id="$(basename "$active")"

# 4. Force the session to continue the loop for this capability.
printf '{"decision":"block","reason":"Autopilot: OpenSpec change \\"%s\\" is in flight and not yet reviewed/archived. Continue the pipeline now by running /ship-capability %s (Maker != Checker; advisory gate). To stop autopilot, delete .claude/.pipeline-autopilot."}\n' "$id" "$id"
exit 0
