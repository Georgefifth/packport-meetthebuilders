#!/usr/bin/env bash
# Kiro PostFileSave hook: run the auto-fixers for the kind of file that was saved.
#   bash scripts/hooks/fix_on_save.sh js|rust
# Commands come from project/config.json "fix_commands": {"js": ["vp check --fix"], "rust": ["cargo fmt"]}.
# Never fails the turn: formatting is a convenience, the Stop hook is the gate.
cd "$(dirname "$0")/../.." || exit 0
# shellcheck source=_common.sh
. scripts/hooks/_common.sh
cd "$(root)" || exit 0
kind="${1:-js}"
cat >/dev/null  # discard the event JSON
mapfile -t CMDS < <(cfg_list "c.get('fix_commands', {}).get('$kind')")
for cmd in "${CMDS[@]}"; do
  [ -z "$cmd" ] && continue
  timeout 120 bash -c "$cmd" >/dev/null 2>&1 || true
done
exit 0
