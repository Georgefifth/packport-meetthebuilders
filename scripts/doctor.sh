#!/usr/bin/env bash
# Check that the machine can run every stage. Prints what is missing and how to fix it.
#   bash scripts/doctor.sh
ok=0
chk() { # name, command, hint, required(1/0)
  if eval "$2" >/dev/null 2>&1; then printf "  [ok]   %s\n" "$1"; else
    printf "  [%s] %s -> %s\n" "$([ "$4" = 1 ] && echo MISSING || echo optional)" "$1" "$3"; [ "$4" = 1 ] && ok=1; fi
}
echo "Pipeline prerequisites"
chk "node 20+"            'node -e "process.exit(+process.versions.node.split(\".\")[0]>=20?0:1)"' "install Node 20 or newer" 1
chk "python3 3.9+"        'python3 -c "import sys; sys.exit(0 if sys.version_info>=(3,9) else 1)"' "install Python 3.9 or newer" 1
chk "git"                 'git --version' "install git" 1
chk "curl"                'curl --version' "install curl (the Devpost fetch needs it)" 1
chk "opencode (only if you use it)" 'command -v opencode' "https://opencode.ai; not needed in Kiro" 0
chk "playwright package"  'test -d "$(dirname "$0")/browser/node_modules/playwright"' "cd scripts/browser && npm install" 1
chk "chromium for playwright" 'ls "$HOME/.cache/ms-playwright" 2>/dev/null | grep -q chromium' "cd scripts/browser && npx playwright install chromium" 1
chk "ffmpeg (demo stage)" 'command -v ffmpeg' "install ffmpeg before stage 6" 0
chk "gh (GitHub CLI)"     'command -v gh && gh auth status' "gh auth login (needed to create and push the repo)" 0
chk "network to devpost"  'curl -sL -m 15 -o /dev/null -w "%{http_code}" -A "Mozilla/5.0" https://devpost.com | grep -q 200' "check your connection" 0
echo
[ $ok = 0 ] && echo "Ready." || echo "Fix the MISSING items above."
exit $ok
