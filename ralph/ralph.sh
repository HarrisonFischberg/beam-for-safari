#!/bin/bash
# Fresh-context loop for beam-for-safari: one `claude -p` session per iteration, each reading PROMPT.md.
# Usage: ralph/ralph.sh [max_iterations]   (lean mode default 6; never more than 10)
# Stops on the completion marker, on a stalled iteration (no new commit and no prd.md change), or at the limit.
# Reaching the limit is not completion. Permissions come from .claude/settings.local.json; this script never
# passes --dangerously-skip-permissions.
set -u
cd "$(dirname "$0")/.." || exit 1

MAX=${1:-6}
[ "$MAX" -gt 10 ] && { echo "refusing more than 10 iterations per approved run"; exit 2; }
[ -f PROMPT.md ] && [ -f prd.md ] && [ -f activity.md ] || { echo "PROMPT.md, prd.md and activity.md must exist"; exit 2; }
command -v claude >/dev/null || { echo "claude CLI not found"; exit 2; }
mkdir -p ralph/logs

fingerprint() { printf '%s %s' "$(git rev-parse HEAD)" "$(shasum prd.md | cut -d' ' -f1)"; }

for ((i = 1; i <= MAX; i++)); do
  before=$(fingerprint)
  log="ralph/logs/iteration-$i-$(date +%Y%m%d-%H%M%S).log"
  echo "== iteration $i of $MAX (log: $log)"
  claude -p "$(cat PROMPT.md)" --model claude-sonnet-5-5 --output-format text >"$log" 2>&1
  tail -n 20 "$log"

  if grep -q '<promise>COMPLETE</promise>' "$log"; then
    echo "== completion marker seen after $i iteration(s). Verify against prd.md before believing it."
    exit 0
  fi
  if [ "$(fingerprint)" = "$before" ]; then
    echo "== iteration $i made no progress (no commit, prd.md unchanged). Stopping: escalate to Opus with $log and activity.md."
    exit 3
  fi
done
echo "== reached $MAX iterations without the completion marker. Check prd.md for what remains."
exit 1
