#!/usr/bin/env python3
"""Offer design directions for a product, and keep hackathons from all looking alike.

    python3 scripts/pick_direction.py --domain "car repair quotes" --seed my-project [--history ../.direction-history]

Prints 3 candidate directions: two that fit the domain and one wildcard from outside it, ordered so
that directions you already used in earlier hackathons come last. The agent chooses one, adapts it,
and records it with --record <id>. The history file lives next to your hackathon folders, so it
spans projects.
Standard library only.
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, "..", ".opencode", "skills", "design-direction", "references", "directions.json")


def arg(name, default=None):
    if f"--{name}" in sys.argv:
        i = sys.argv.index(f"--{name}")
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def main():
    lib = json.load(open(LIB))["directions"]
    history_path = arg("history", os.path.join(os.getcwd(), "..", ".direction-history"))
    used = []
    if os.path.exists(history_path):
        used = [ln.strip() for ln in open(history_path) if ln.strip()]

    rec = arg("record")
    if rec:
        if rec not in {d["id"] for d in lib}:
            print(f"unknown direction id: {rec}")
            return 2
        with open(history_path, "a") as f:
            f.write(rec + "\n")
        print(f"recorded {rec} in {history_path}")
        return 0

    domain = (arg("domain", "") or "").lower()
    seed = arg("seed", domain or "x")
    words = set(re.findall(r"[a-z]+", domain))

    def match(a, b):
        return len(a) >= 4 and len(b) >= 4 and (a.startswith(b[:5]) or b.startswith(a[:5]))

    def theme_score(d):
        s = 0
        for t in d["themes"]:
            for tw in re.findall(r"[a-z]+", t):
                if any(match(tw, w) for w in words):
                    s += 2
        return s

    def tie(d):
        return hashlib.sha256((seed + d["id"]).encode()).hexdigest()

    def rank(d):
        return (-(theme_score(d) - 3 * used.count(d["id"])), tie(d))

    matched = sorted([d for d in lib if theme_score(d) > 0], key=rank)
    # neutral fillers: light directions that are not restricted to one audience
    fillers = sorted([d for d in lib if d not in matched and not d.get("requires_why_dark")], key=rank)
    fit = (matched + fillers)[:2]
    pool = [d for d in lib if d not in fit and d["id"] not in used and not d.get("requires_why_dark")] or [d for d in lib if d not in fit]
    wild = sorted(pool, key=tie)[0]
    picks = fit + [wild]

    print(f"domain={domain!r} seed={seed!r} used_before={used or 'none'}\n")
    for label, d in zip(("FIT", "FIT", "WILDCARD"), picks):
        print(f"[{label}] {d['id']}: {d['name']} ({d['mode']}, {', '.join(d['mood'])})")
        print(f"   palette:   " + "  ".join(f"{k} {v}" for k, v in d["palette"].items()))
        print(f"   fonts:     display {d['fonts']['display']} | text {d['fonts']['text']} | data {d['fonts']['data']}")
        print(f"   layout:    {d['layout']}")
        print(f"   signature: {d['signature']}")
        print(f"   avoid:     {d['avoid']}")
        print(f"   look up:   {', '.join(d['references'])}\n")
    print("Choose one, adapt it to this product, and write design/direction.md. Then run with --record <id>.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
