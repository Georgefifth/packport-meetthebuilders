---
description: Do the current pipeline stage, then run its gate
---

Current state:

!`cat STATE.md`

Work on the stage named in `stage:` above.

1. Read `pipeline/stages/0<stage>-*.md` (only that file) and load the skills it names.
2. Do the stage's work.
3. Run `python3 scripts/gate.py <stage>` and act on the exit code exactly as AGENTS.md says: 0 move on, 1 fix and re-run, 10 stop and tell the human what to do.

$ARGUMENTS
