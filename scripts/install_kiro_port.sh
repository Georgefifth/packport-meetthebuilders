#!/usr/bin/env bash
# Install the Kiro-native version of the pipeline into the current project's .kiro/ folder.
#
#   bash scripts/install_kiro_port.sh
#
# Creates (never deletes):
#   .kiro/skills/<name>/       the pipeline skills (same SKILL.md files the opencode setup uses)
#   .kiro/agents/evaluator.md  the independent evaluator as a Kiro custom agent
#   .kiro/hooks/*.json         session state, gate guard, auto-fix on save, clean-code Stop gate
#   .kiro/steering/pipeline.md live STATE.md plus Kiro-specific notes
# Run from the project root. Safe to run again.
set -eu
cd "$(dirname "$0")/.."
SRC_SKILLS=".opencode/skills"
[ -d "$SRC_SKILLS" ] || { echo "run this from a project created by new_hackathon.sh"; exit 1; }

mkdir -p .kiro/skills .kiro/agents .kiro/hooks .kiro/steering .kiro/specs
cp -R "$SRC_SKILLS"/. .kiro/skills/
cp kiro/hooks/*.json .kiro/hooks/
cp kiro/steering/*.md .kiro/steering/

python3 - <<'PY'
import re
src = open(".opencode/agents/evaluator.md", encoding="utf-8").read()
m = re.match(r"^---\n(.*?)\n---\n(.*)$", src, re.S)
body = m.group(2).strip() if m else src
desc = "Independent, skeptical evaluator. Tests the running product in a real browser, grades it against a contract and the hackathon rubric, and files bugs. Never fixes anything."
front = f"""---
name: evaluator
description: {desc}
tools: ["read", "write", "shell", "web"]
includeMcpJson: true
includePowers: false
resources:
  - file://project/rubric.md
  - file://project/brief.md
  - file://design/direction.md
  - file://design/ux-contract.md
  - file://taste/**/*.md
  - skill://.kiro/skills/browser-verification/SKILL.md
  - skill://.kiro/skills/customer-clarity/SKILL.md
  - skill://.kiro/skills/design-direction/SKILL.md
permissions:
  rules:
    - capability: fs_write
      match: ["**"]
      exclude: ["evaluation/**", "evidence/**"]
      effect: deny
    - capability: fs_write
      match: ["evaluation/**", "evidence/**"]
      effect: allow
    - capability: shell
      match: ["node *", "python3 scripts/*", "curl *", "npx playwright *", "ls *", "cat *", "git status", "git log *", "git diff *"]
      effect: allow
    - capability: shell
      match: ["rm -rf *", "sudo *", "git push *", "git commit *"]
      effect: deny
---

"""
# the evaluator's own text already refers to skills by name, which Kiro resolves from .kiro/skills
open(".kiro/agents/evaluator.md", "w", encoding="utf-8").write(front + body + "\n")
print("wrote .kiro/agents/evaluator.md")
PY

echo
echo "Installed. Next steps:"
echo " 1. Trust this workspace in Kiro so it loads agents, skills, steering and hooks."
echo " 2. Writes to .kiro/hooks and .kiro/agents always ask for approval; that is expected."
echo " 3. Fill quality_commands and fix_commands in project/config.json after the day-1 spike."
echo " 4. Check it works: start a new session; the session-state hook should print STATE.md."
