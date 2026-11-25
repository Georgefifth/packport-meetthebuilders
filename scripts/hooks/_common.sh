#!/usr/bin/env bash
# Shared helpers for Kiro hook scripts. Source this file.

root() { git rev-parse --show-toplevel 2>/dev/null || pwd; }

# cfg_list <python-expr over config c>  -> prints one command per line
cfg_list() {
  python3 - "$1" <<'PY' 2>/dev/null
import json, sys
try:
    c = json.load(open("project/config.json"))
    for item in eval(sys.argv[1], {"c": c}) or []:
        print(item)
except Exception:
    pass
PY
}

# paths_in_stdin  -> prints every value of keys that look like file paths in the JSON on stdin
paths_in_stdin() {
  python3 -c '
import json, sys
KEYS = {"path", "file_path", "filepath", "targetfile", "file", "filename", "paths", "files"}
def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k.lower() in KEYS:
                if isinstance(v, str): print(v)
                elif isinstance(v, list):
                    for i in v:
                        if isinstance(i, str): print(i)
            walk(v)
    elif isinstance(o, list):
        for i in o: walk(i)
try:
    walk(json.load(sys.stdin))
except Exception:
    pass
'
}
