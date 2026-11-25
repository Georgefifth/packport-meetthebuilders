#!/usr/bin/env bash
# Kiro SessionStart hook: stdout goes to the agent. Gives a fresh session the project's state and open post-mortems.
cd "$(dirname "$0")/../.." || exit 0
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0
cat >/dev/null
echo "== STATE.md"; cat STATE.md 2>/dev/null || echo "(no STATE.md yet)"
echo; echo "== project/memory.md"; cat project/memory.md 2>/dev/null || echo "(none)"
open=$(grep -l "^- status: open" evidence/postmortems/*.md 2>/dev/null)
if [ -n "$open" ]; then echo; echo "== OPEN POST-MORTEMS (read before touching code):"; echo "$open"; fi
echo; echo "Next: read pipeline/stages/ for the current stage only, then run python3 scripts/gate.py <stage>."
exit 0
