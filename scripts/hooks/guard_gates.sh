#!/usr/bin/env bash
# Kiro PreToolUse hook: stop the agent from editing the files that judge it.
# Exit 2 blocks the tool call and returns stderr to the agent.
# The event JSON arrives on stdin; every value under a path-like key is checked.
cd "$(dirname "$0")/../.." || exit 0
# shellcheck source=_common.sh
. scripts/hooks/_common.sh

PROTECTED_RE='(^|/)(scripts/(gate\.py|audit_claims\.py|ui_lint\.py|hooks/[^/]+|browser/probe\.mjs)|\.kiro/hooks/[^/]+|\.kiro/agents/evaluator\.md|\.opencode/agents/evaluator\.md|.*/references/scoring\.md|\.fallowrc[^/]*|fallow\.(json|toml)|\.oxlintrc[^/]*|clippy\.toml)$'

while IFS= read -r p; do
  [ -z "$p" ] && continue
  if printf '%s' "$p" | grep -Eq "$PROTECTED_RE"; then
    echo "Blocked: $p is a gate or a linter configuration. Fix the product, not the judge. If a check is wrong, tell the human and keep the check." >&2
    exit 2
  fi
done < <(paths_in_stdin)
exit 0
