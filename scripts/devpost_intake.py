#!/usr/bin/env python3
"""Fetch a Devpost hackathon's public pages as plain text for the intake stage.

    python3 scripts/devpost_intake.py https://<slug>.devpost.com/ [--out project/devpost]

Saves overview.txt, rules.txt, resources.txt, updates.txt (when reachable) and meta.json.
If Devpost blocks the request, it tells you to paste the page text into the file by hand.
Standard library only.
"""
import html
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
PAGES = {"overview": "", "rules": "rules", "resources": "resources", "updates": "updates"}


def fetch(url: str) -> str:
    """Devpost hackathon subdomains sit behind Cloudflare, which rejects Python's TLS
    fingerprint but accepts curl. Try curl first, then urllib."""
    try:
        r = subprocess.run(
            ["curl", "-sL", "-m", "30", "-A", UA, "-w", "\n%{http_code}", url],
            capture_output=True, text=True, timeout=40,
        )
        body, _, code = r.stdout.rpartition("\n")
        if code.strip() == "200" and len(body) > 500:
            return body
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")


def to_text(raw: str) -> str:
    raw = re.sub(r"<(script|style|noscript)[\s\S]*?</\1>", "", raw, flags=re.I)
    raw = re.sub(r"<(br|/p|/div|/li|/h[1-6]|/tr)[^>]*>", "\n", raw, flags=re.I)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    lines = [re.sub(r"[ \t\u00a0]+", " ", ln).strip() for ln in raw.splitlines()]
    out, blank = [], 0
    for ln in lines:
        if not ln:
            blank += 1
            if blank > 1:
                continue
        else:
            blank = 0
        out.append(ln)
    return "\n".join(out).strip()


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    base = args[0].split("?")[0].rstrip("/") + "/"
    out = "project/devpost"
    if "--out" in sys.argv:
        out = sys.argv[sys.argv.index("--out") + 1]
    os.makedirs(out, exist_ok=True)

    meta = {"url": base, "fetched": {}, "missing": []}
    for name, suffix in PAGES.items():
        url = base + suffix
        try:
            raw = fetch(url)
            text = to_text(raw)
            with open(os.path.join(out, f"{name}.txt"), "w", encoding="utf-8") as f:
                f.write(text + "\n")
            meta["fetched"][name] = len(text)
            if name == "overview":
                m = re.search(r"<title>([^<]+)</title>", raw)
                meta["title"] = html.unescape(m.group(1)).strip() if m else ""
                m = re.search(r"Deadline:\s*([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}[^\n<]{0,30})", text)
                meta["deadline_text"] = m.group(1).strip() if m else ""
        except (urllib.error.URLError, TimeoutError) as e:
            meta["missing"].append({"page": name, "url": url, "error": str(e)})
            print(f"! could not fetch {url}: {e}", file=sys.stderr)

    with open(os.path.join(out, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    ok = meta["fetched"].get("overview", 0) > 1500 and meta["fetched"].get("rules", 0) > 1500
    print(json.dumps(meta, indent=2))
    if not ok:
        print(
            "\nIntake incomplete. Open the page in a browser, copy the text, and paste it into "
            f"{out}/overview.txt and {out}/rules.txt, then continue.",
            file=sys.stderr,
        )
        return 1
    print(f"\nSaved to {out}/. Next: write project/rubric.md from these files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
