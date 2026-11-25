#!/usr/bin/env bash
# Kiro Stop hook: keep the agent working while the clean-code gates fail.
#
# Runs every command in project/config.json "quality_commands" (for example
#   ["vp check", "npx --no-install fallow", "cargo clippy --all-targets -- -D warnings", "cargo test"]).
# Exit 0: all green or nothing configured. Exit 1 with the failures on stderr: Kiro sends the agent back to work.
# Stop hooks fire once per turn, so this cannot loop forever.
#
# The exact commands are decided by the day-1 spike and written to config.json, so no tool flag is assumed here.
cd "$(dirname "$0")/../.." || exit 0
# shellcheck source=_common.sh
. scripts/hooks/_common.sh
cd "$(root)" || exit 0

mapfile -t CMDS < <(cfg_list 'c.get("quality_commands")')
[ "${#CMDS[@]}" -eq 0 ] && exit 0

failed=0
report=""
for cmd in "${CMDS[@]}"; do
  [ -z "$cmd" ] && continue
  out=$(timeout 300 bash -c "$cmd" 2>&1); rc=$?
  if [ $rc -ne 0 ]; then
    failed=1
    report+=$'\n'"== FAILED: $cmd (exit $rc)"$'\n'"$(printf '%s' "$out" | tail -n 30)"$'\n'
  fi
done

if [ $failed -eq 1 ]; then
  {
    echo "Quality gates failed. Fix the causes below, then finish. Do not loosen lint, fallow or clippy configuration to make them pass."
    printf '%s\n' "$report"
  } >&2
  exit 1
fi
exit 0
