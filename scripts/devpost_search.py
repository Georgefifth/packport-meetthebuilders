#!/usr/bin/env python3
"""Search Devpost-wide for projects similar to an idea (novelty and crowding check).

    python3 scripts/devpost_search.py "offline repair quote auditor" [--pages 2]

Prints name, tagline, tags, winner flag and URL for each hit, then a short summary
(how many hits, how many winners). Use it during ideation to find out whether an idea
is already common. The search covers all of Devpost, not one hackathon.
Standard library only.
"""
import html
import json
import sys
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"


def search(query: str, page: int):
    url = "https://devpost.com/software/search?" + urllib.parse.urlencode({"query": query, "page": page})
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    query = args[0]
    pages = 1
    if "--pages" in sys.argv:
        pages = int(sys.argv[sys.argv.index("--pages") + 1])
    hits, total = [], 0
    for p in range(1, pages + 1):
        data = search(query, p)
        total = data.get("total_count", total)
        hits += data.get("software", [])
    winners = sum(1 for h in hits if h.get("winner"))
    for h in hits:
        tag = "WINNER " if h.get("winner") else ""
        print(f"- {tag}{html.unescape(h['name'])}: {html.unescape(h.get('tagline', ''))[:110]}")
        print(f"    {h['url']}  tags={','.join(h.get('tags', [])[:6])}")
    print(f"\nquery={query!r} total_matches={total} shown={len(hits)} winners_in_shown={winners}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
