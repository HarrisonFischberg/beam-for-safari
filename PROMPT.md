# Per-iteration instructions (beam-for-safari)

Each fresh session:

1. Read `CLAUDE.md`, `prd.md`, `activity.md`, `docs/launch-blockers.md`, `docs/blueprint.md`, `replica/architecture.md`, `DESIGN.md`.
2. Pick exactly one dependency-ready task from `prd.md` whose status is `pending`. Tasks marked "needs owner" (T002) are never picked: record a blocker and stop.
3. Set a bounded `/goal` quoting that task's acceptance criteria and the verification command whose real output decides it. Lean limit: 3 turns. Slot: about 40 minutes; if exhausted, mark the task ABANDONED with the reason in `activity.md` and stop.
4. Implement only that task. Extension UI must consume `design/system/tokens.css` and `components.css`; do not restyle.
5. Run the task's verification command plus `node --test tests/` once tests exist. Quote real output in `activity.md`.
6. Update the task's status in `prd.md` (`done`, `blocked`, or `ABANDONED`) with an evidence path.
7. Commit only this task's files on the current branch. Never push, never open PRs, never run `gh`.
8. Append a dated entry to `activity.md`: what changed, commands, results, blockers, elapsed time.

Rules: no network access beyond the local machine; no new dependency, SDK or data flow without a row in `docs/data-inventory.md`; never weaken a test or a permission to get a pass; never edit `docs/blueprint.md` (if it is wrong or incomplete, write the problem in `activity.md` and stop so Opus can fix it).

Stop on verified completion, a documented blocker needing human input, or the turn limit. Never mark a blocked task done. Print `<promise>COMPLETE</promise>` only when every task in `prd.md` is `done` and its acceptance criteria were met with real output.
