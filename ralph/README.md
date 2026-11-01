# Ralph loop

`ralph/ralph.sh [max]` runs one fresh `claude -p` session per iteration, each reading `PROMPT.md`.
Written fresh from the idea in the public quickstart (github.com/coleam00/ralph-loop-quickstart, reviewed
2026-10-31, no license file, so no code copied; its permissive `settings.json` was not adopted).

Limits (lean mode): 6 iterations by default, hard cap 10, 3 `/goal` turns each, about 40 minutes per task.
Stops on the completion marker, on an iteration with no new commit and no `prd.md` change (escalate to Opus), or at the limit.
Reaching the limit is not completion. Logs go to `ralph/logs/` (gitignored). Permissions: `.claude/settings.local.json`.

Never run it for T002 (needs the owner at the Mac with the Apple TV).
