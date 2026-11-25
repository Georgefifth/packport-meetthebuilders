#!/usr/bin/env bash
# Fresh-clone test: do what a judge does. Clone the repo into an empty folder, follow the
# install and build steps from project/config.json, optionally start it and probe it.
# Writes evidence/fresh-clone.json. Gate 5 requires status "ok" on the current commit.
#
#   bash scripts/fresh_clone_test.sh
#
# Uses config.repo_url when set (what judges see, so push first); otherwise clones the local
# repo (committed files only, so uncommitted work cannot hide a missing file).
set -u
ROOT="$(pwd)"
cfg() { python3 -c "import json,sys; c=json.load(open('project/config.json')); print(c.get('$1',''))" 2>/dev/null; }

REPO_URL="$(cfg repo_url)"
APP_DIR="$(cfg app_dir)"; APP_DIR="${APP_DIR:-.}"
INSTALL="$(cfg install)"
BUILD="$(cfg build)"
START="$(cfg start)"
LOCAL_URL="$(cfg local_url)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; [ -n "${SRV_PID:-}" ] && kill "$SRV_PID" 2>/dev/null' EXIT
SRC="${REPO_URL:-$ROOT}"
STEPS=()
STATUS="ok"
note() { STEPS+=("$1"); echo "$1"; }

echo "== cloning $SRC"
if ! git clone --quiet --depth 1 "$SRC" "$TMP/repo" 2>"$TMP/clone.err"; then
  note "clone: FAIL $(head -c 200 "$TMP/clone.err")"; STATUS="fail"
fi

COMMIT=""
if [ "$STATUS" = "ok" ]; then
  COMMIT="$(git -C "$TMP/repo" rev-parse HEAD)"
  cd "$TMP/repo/$APP_DIR" || { note "app_dir '$APP_DIR' not found in clone"; STATUS="fail"; }
fi

run_step() {
  local name="$1" cmd="$2"
  [ -z "$cmd" ] && { note "$name: skipped (not configured)"; return 0; }
  echo "== $name: $cmd"
  if timeout 900 bash -c "$cmd" >"$TMP/$name.log" 2>&1; then note "$name: ok"; else
    note "$name: FAIL (last lines: $(tail -n 5 "$TMP/$name.log" | tr '\n' ' ' | head -c 300))"; STATUS="fail"; return 1
  fi
}

if [ "$STATUS" = "ok" ]; then
  [ -f README.md ] || { note "README.md missing at app root: judges will not know how to run it"; STATUS="fail"; }
  run_step install "$INSTALL" && run_step build "$BUILD"
fi

if [ "$STATUS" = "ok" ] && [ -n "$START" ] && [ -n "$LOCAL_URL" ]; then
  echo "== start: $START"
  (bash -c "$START" >"$TMP/start.log" 2>&1 &) ; sleep 1
  SRV_PID="$(pgrep -f "$START" | head -1)"
  UP=0
  for _ in $(seq 1 60); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' "$LOCAL_URL")" = "200" ]; then UP=1; break; fi; sleep 1
  done
  if [ "$UP" = "1" ]; then
    note "start: ok ($LOCAL_URL answers 200)"
    PROBE="$ROOT/scripts/browser/probe.mjs"
    if (cd "$ROOT/scripts/browser" && node "$PROBE" "$LOCAL_URL" --out "$ROOT/evidence/probe-fresh" >"$TMP/probe.log" 2>&1); then note "probe: ok"; else
      note "probe: FAIL $(tail -n 3 "$TMP/probe.log" | tr '\n' ' ' | head -c 300)"; STATUS="fail"; fi
  else
    note "start: FAIL ($LOCAL_URL never answered)"; STATUS="fail"
  fi
fi

cd "$ROOT" || exit 1
mkdir -p evidence
python3 - "$STATUS" "$COMMIT" "$SRC" "${STEPS[@]}" <<'PY'
import json, sys, datetime
status, commit, src, *steps = sys.argv[1:]
json.dump({"status": status, "commit": commit, "source": src, "steps": steps,
           "at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")},
          open("evidence/fresh-clone.json", "w"), indent=2)
PY
echo; echo "FRESH CLONE: $STATUS (commit ${COMMIT:0:8})"
[ "$STATUS" = "ok" ]
