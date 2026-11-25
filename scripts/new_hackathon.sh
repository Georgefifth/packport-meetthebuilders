#!/usr/bin/env bash
# Create a new hackathon folder from this pipeline.
#
#   bash scripts/new_hackathon.sh <folder-name> <devpost-url> [extra-folder ...]
#   bash scripts/new_hackathon.sh --into <existing-repo-dir> <devpost-url> [extra-folder ...]
#
# --into copies the pipeline into a repository you already cloned (for example inside a Kiro Web
# session, where the project repo was created on GitHub first). Existing files are never overwritten
# except by the pipeline's own paths; README.md and LICENSE are left alone; .gitignore is appended to.
#
# Extra folders (for example kiroween-2026) are copied from this repo into the new project.
#
# Run it from the pipeline repo. The new folder is created next to the repo (your hackathons
# root), so ../.direction-history is shared across projects.
set -eu
INTO=""
if [ "${1:-}" = "--into" ]; then INTO="${2:?usage: new_hackathon.sh --into <dir> <devpost-url> [extra-folder ...]}"; shift 2; fi
if [ -n "$INTO" ]; then NAME="$(basename "$(cd "$INTO" && pwd)")"; else NAME="${1:?usage: new_hackathon.sh <folder-name> <devpost-url> [extra-folder ...]}"; shift 1; fi
URL="${1:?usage: new_hackathon.sh <folder-name|--into dir> <devpost-url> [extra-folder ...]}"
shift 1
SRC="$(cd "$(dirname "$0")/.." && pwd)"
if [ -n "$INTO" ]; then DEST="$(cd "$INTO" && pwd)"; else DEST="$(dirname "$SRC")/$NAME"; [ -e "$DEST" ] && { echo "$DEST already exists"; exit 1; }; fi

mkdir -p "$DEST"
# pipeline machinery
cp -R "$SRC/.opencode" "$SRC/pipeline" "$SRC/scripts" "$SRC/kiro" "$SRC/docs" "$SRC/integrations" "$SRC/AGENTS.md" "$SRC/opencode.jsonc" "$DEST/"
rm -f "$DEST/docs/DIAGNOSIS.md"
for extra in "$@"; do [ -d "$SRC/$extra" ] && cp -R "$SRC/$extra" "$DEST/" || echo "note: no folder $extra in the pipeline repo"; done
mkdir -p "$DEST"/{project,design/references,contracts,evaluation,evidence,demo,submission/assets,taste/good,taste/bad}
cp -R "$SRC/taste/." "$DEST/taste/" 2>/dev/null || true

T="$DEST/pipeline/templates"
put() { [ -e "$2" ] && { echo "keeping existing $2"; return; }; mkdir -p "$(dirname "$2")"; cp "$1" "$2"; }
NEW_STATE=0; [ -e "$DEST/STATE.md" ] || NEW_STATE=1
put "$T/STATE.md" "$DEST/STATE.md"
put "$T/config.json" "$DEST/project/config.json"
put "$T/claims.md" "$DEST/project/claims.md"
put "$T/memory.md" "$DEST/project/memory.md"
mkdir -p "$DEST/evidence/postmortems"
put "$T/bugs.md" "$DEST/evaluation/bugs.md"
if [ -e "$DEST/.gitignore" ]; then
  # append only the lines that are not already there
  while IFS= read -r line; do grep -qxF -- "$line" "$DEST/.gitignore" || echo "$line" >> "$DEST/.gitignore"; done < "$T/gitignore"
else
  cp "$T/gitignore" "$DEST/.gitignore"
fi

python3 - "$DEST" "$URL" "$NAME" <<'PY'
import json, sys
dest, url, name = sys.argv[1:]
p = f"{dest}/project/config.json"
c = json.load(open(p))
if not c.get("devpost_url"): c["devpost_url"] = url
if not c.get("hackathon_name"): c["hackathon_name"] = name
json.dump(c, open(p, "w"), indent=2)
s = open(f"{dest}/STATE.md").read().replace("{{name}}", name).replace("{{url}}", url)
open(f"{dest}/STATE.md", "w").write(s)
PY

[ -d "$DEST/scripts/browser/node_modules/playwright" ] || (cd "$DEST/scripts/browser" && npm install --no-audit --no-fund --silent)
ls "$HOME/.cache/ms-playwright" 2>/dev/null | grep -q chromium || (cd "$DEST/scripts/browser" && npx --yes playwright install chromium >/dev/null 2>&1 || echo "note: run 'npm install && npx playwright install chromium' in scripts/browser")
(cd "$DEST" && { [ -d .git ] || git init -q; } && git add -A && git commit -qm "chore: start $NAME from hackathon-pipeline" || true)

echo
echo "Created $DEST"
echo "Next:"
echo "  cd $DEST"
echo "  opencode          # then paste:  /goal <contents of pipeline/GOAL.txt>"
echo "  or, in Kiro:      bash scripts/install_kiro_port.sh   (then see kiro/README.md)"
