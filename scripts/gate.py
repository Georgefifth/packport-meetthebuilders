#!/usr/bin/env python3
"""Stage gates. A stage is finished when its gate exits 0, not when the agent says so.

    python3 scripts/gate.py <stage>        run one gate (0..7)
    python3 scripts/gate.py status         run all gates, print a table
    python3 scripts/gate.py <stage> --json machine-readable output

Exit codes:
    0   all checks passed
    1   at least one check failed (the output says exactly which and why)
    10  automated checks passed, waiting on a human decision (see STATE.md)

Run from the hackathon project folder. Standard library only.
"""
import json
import os
import re
import struct
import subprocess
import sys
import time
from datetime import datetime, timezone

ROOT = os.getcwd()
QUICK = False  # set by `status`: skip builds, probes and command evidence
HERE = os.path.dirname(os.path.abspath(__file__))
PLACEHOLDER = re.compile(r"\{\{|\bTBD\b|\bTODO\b(?!\(human\))|lorem ipsum|<fill[ -]?in>", re.I)

# ----------------------------------------------------------------------------- helpers


def p(*parts):
    return os.path.join(ROOT, *parts)


def read(path, default=""):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read()
    except OSError:
        return default


def config():
    try:
        return json.loads(read(p("project", "config.json"), "{}") or "{}")
    except json.JSONDecodeError:
        return {}


def kv(text):
    """Parse `- key: value` or `key: value` lines into a lowercase dict."""
    out = {}
    for line in text.splitlines():
        m = re.match(r"^\s*(?:[-*]\s*)?([A-Za-z][A-Za-z0-9 _/()-]{1,40}?)\s*:\s*(.*)$", line)
        if m:
            out.setdefault(m.group(1).strip().lower(), m.group(2).strip())
    return out


def section(text, heading):
    """Body of the first `## heading` (prefix match, case-insensitive) up to the next `## `."""
    pat = re.compile(r"^##\s+" + re.escape(heading) + r".*$", re.I | re.M)
    m = pat.search(text)
    if not m:
        return None
    rest = text[m.end():]
    n = re.search(r"^##\s+", rest, re.M)
    return rest[: n.start()] if n else rest


def state():
    return kv(read(p("STATE.md")))


class Gate:
    def __init__(self, stage, title):
        self.stage, self.title = stage, title
        self.checks = []  # (ok, name, detail)
        self.human = []  # pending human decisions

    def check(self, ok, name, detail=""):
        self.checks.append((bool(ok), name, detail if not ok else (detail or "")))
        return bool(ok)

    def need_human(self, ok, what):
        if not ok:
            self.human.append(what)

    def exists(self, rel, min_chars=1):
        txt = read(p(rel))
        return self.check(len(txt.strip()) >= min_chars, f"{rel} exists", f"missing or shorter than {min_chars} chars")

    def clean(self, rel):
        txt = read(p(rel))
        bad = PLACEHOLDER.search(txt)
        return self.check(not bad, f"{rel} has no placeholders", f"found '{bad.group(0)}'" if bad else "")

    @property
    def failed(self):
        return [c for c in self.checks if not c[0]]

    def exit_code(self):
        if self.failed:
            return 1
        return 10 if self.human else 0


def run(cmd, timeout=600, cwd=None):
    try:
        r = subprocess.run(cmd, shell=True, cwd=cwd or ROOT, capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout + r.stderr)[-1500:]
    except subprocess.TimeoutExpired:
        return 124, "timed out"


def http_ok(url):
    code, out = run(f'curl -sL -m 25 -o /dev/null -w "%{{http_code}}" -A "Mozilla/5.0" "{url}"', 40)
    return out.strip() == "200", out.strip()


def mp4_info(path):
    """Duration (s) and size (w,h) of an MP4 via its moov/mvhd + tkhd boxes. No ffprobe needed."""
    try:
        data = open(path, "rb").read()
    except OSError:
        return None

    def boxes(buf, start=0, end=None):
        end = len(buf) if end is None else end
        i = start
        while i + 8 <= end:
            size, typ = struct.unpack(">I4s", buf[i : i + 8])
            hdr = 8
            if size == 1:
                size = struct.unpack(">Q", buf[i + 8 : i + 16])[0]
                hdr = 16
            elif size == 0:
                size = end - i
            if size < hdr:
                return
            yield typ.decode("latin1"), i + hdr, i + size
            i += size

    dur = w = h = None
    for t, s, e in boxes(data):
        if t != "moov":
            continue
        for t2, s2, e2 in boxes(data, s, e):
            if t2 == "mvhd":
                ver = data[s2]
                if ver == 1:
                    ts, d = struct.unpack(">IQ", data[s2 + 20 : s2 + 32])
                else:
                    ts, d = struct.unpack(">II", data[s2 + 12 : s2 + 20])
                dur = d / ts if ts else None
            elif t2 == "trak":
                for t3, s3, e3 in boxes(data, s2, e2):
                    if t3 == "tkhd":
                        ver = data[s3]
                        off = s3 + (88 if ver == 1 else 76)
                        tw, th = struct.unpack(">II", data[off : off + 8])
                        if (tw >> 16) and (th >> 16):
                            w, h = tw >> 16, th >> 16
    return {"duration": dur, "width": w, "height": h, "bytes": len(data)}


def evaluations():
    """Parse evaluation/*.md reports into dicts."""
    d = p("evaluation")
    out = []
    if not os.path.isdir(d):
        return out
    for name in sorted(os.listdir(d)):
        if not name.endswith(".md") or name in ("bugs.md", "fixtures.md", "fixture-results.md"):
            continue
        txt = read(os.path.join(d, name))
        meta = kv(txt[:2500])
        scores = {k: int(v) for k, v in re.findall(r"(\w+)\s*=\s*(\d)", meta.get("scores", ""))}
        evid = [x for x in re.findall(r"[\w./-]+\.(?:png|jpg|jpeg|webm|json|mp4|txt)", txt) if os.path.exists(p(x))]
        out.append(
            {
                "file": name,
                "contract": meta.get("contract", ""),
                "verdict": meta.get("verdict", "").upper(),
                "scores": scores,
                "p0": int(re.sub(r"\D", "", meta.get("p0", "") or "") or 99),
                "p1": int(re.sub(r"\D", "", meta.get("p1", "") or "") or 99),
                "stranger": meta.get("stranger_test", "").upper(),
                "builder": meta.get("builder_model", ""),
                "evaluator": meta.get("evaluator_model", ""),
                "evidence": sorted(set(evid)),
                "mtime": os.path.getmtime(os.path.join(d, name)),
            }
        )
    return out


MIN_SCORES = {"function": 4, "clarity": 4, "truth": 4, "design": 3, "originality": 3, "craft": 3}


def eval_passes(g, ev, label):
    ok = ev["verdict"] == "PASS"
    g.check(ok, f"{label}: evaluator verdict is PASS", f"{ev['file']} says '{ev['verdict'] or 'missing'}'")
    low = {k: ev["scores"].get(k, 0) for k, v in MIN_SCORES.items() if ev["scores"].get(k, 0) < v}
    g.check(not low, f"{label}: scores meet thresholds {MIN_SCORES}", f"below threshold: {low}")
    g.check(ev["p0"] == 0 and ev["p1"] == 0, f"{label}: zero open P0/P1 bugs", f"p0={ev['p0']} p1={ev['p1']}")
    g.check(len(ev["evidence"]) >= 3, f"{label}: report cites at least 3 existing evidence files", f"found {len(ev['evidence'])}")


# ----------------------------------------------------------------------------- gates

RUBRIC_SECTIONS = [
    "Hackathon", "Deadline", "Eligibility", "Tracks", "Judging criteria", "Required artifacts",
    "Sponsor requirements", "Video requirements", "Disqualifiers", "Bonus", "Chosen track",
]


def gate0():
    g = Gate(0, "Intake: rules and rubric")
    g.exists("project/devpost/overview.txt", 1500)
    g.exists("project/devpost/rules.txt", 1500)
    rub = read(p("project", "rubric.md"))
    g.check(len(rub) > 800, "project/rubric.md written", "missing or too short")
    for s in RUBRIC_SECTIONS:
        body = section(rub, s)
        g.check(body is not None and len(body.strip()) >= 20, f"rubric section '{s}'", "missing or empty")
    crit = section(rub, "Judging criteria") or ""
    n = len(re.findall(r"^\s*(?:[-*]|\d+\.|\|)", crit, re.M))
    g.check(n >= 3, "rubric lists at least 3 judging criteria", f"found {n}")
    g.clean("project/rubric.md")
    cfg = config()
    g.check(bool(cfg.get("deadline_iso")), "project/config.json has deadline_iso", "fill it from the rubric")
    try:
        datetime.fromisoformat(cfg.get("deadline_iso", "").replace("Z", "+00:00"))
        g.check(True, "deadline_iso parses")
    except ValueError:
        g.check(False, "deadline_iso parses", f"got {cfg.get('deadline_iso')!r}, use ISO 8601 with timezone")
    g.check(isinstance(cfg.get("required_paths"), list), "config.required_paths is a list", "e.g. [\"LICENSE\", \".kiro\"]")
    g.check(bool(cfg.get("video_max_seconds")), "config.video_max_seconds set")
    g.need_human(state().get("human_confirmed_eligible") == "yes", "Confirm you are eligible (country, age, team rules). Set `human_confirmed_eligible: yes` in STATE.md.")
    return g


def gate1():
    g = Gate(1, "Idea selection")
    ideas = read(p("project", "ideas.md"))
    blocks = re.split(r"^##\s+Idea\b.*$", ideas, flags=re.M | re.I)[1:]
    g.check(len(blocks) >= 3, "ideas.md has at least 3 candidate ideas", f"found {len(blocks)}")
    need = ["user", "problem", "today they", "existing alternatives", "hook", "why ours is better", "core flow",
            "feasibility", "rubric fit", "crowding", "kill criterion"]
    for i, b in enumerate(blocks, 1):
        keys = " ".join(kv(b).keys())
        miss = [n for n in need if n not in keys]
        g.check(not miss, f"idea {i} has all fields", f"missing: {', '.join(miss)}")
        g.check(bool(re.search(r"https?://", b)), f"idea {i} cites at least one URL")
    g.check(section(ideas, "Recommendation") is not None, "ideas.md has a Recommendation")
    g.clean("project/ideas.md")
    st = state()
    chosen = st.get("human_approved_idea") == "yes"
    g.need_human(chosen, "Pick one idea. Write it to project/brief.md and set `human_approved_idea: yes` in STATE.md.")
    if chosen:
        b = kv(read(p("project", "brief.md")))
        pitch = b.get("one-sentence pitch", "")
        g.check(0 < len(pitch.split()) <= 25, "brief: one-sentence pitch is 1-25 words", f"{len(pitch.split())} words")
        for k in ("primary user", "problem", "core flow", "instant demo path"):
            g.check(bool(b.get(k)), f"brief: '{k}' filled")
        oos = section(read(p("project", "brief.md")), "Out of scope") or ""
        g.check(len(re.findall(r"^\s*[-*]", oos, re.M)) >= 3, "brief: at least 3 out-of-scope items", "cut scope in writing")
        g.clean("project/brief.md")
    return g


def gate2():
    g = Gate(2, "Spec, design direction and slice contract")
    g.exists("project/spec.md", 600)
    d = read(p("design", "direction.md"))
    g.check(len(d) > 500, "design/direction.md written")
    for s in ("Direction", "Palette", "Fonts", "Layout archetype", "Signature element", "Why this fits", "What this is not"):
        body = section(d, s)
        g.check(body is not None and len(body.strip()) >= 15, f"direction section '{s}'", "missing or empty")
    pal = re.findall(r"#[0-9a-fA-F]{6}\b", section(d, "Palette") or "")
    g.check(len(set(pal)) >= 5, "palette has at least 5 distinct hex colours", f"found {len(set(pal))}")
    g.check(os.path.isdir(p("design", "references")) and len(os.listdir(p("design", "references"))) >= 2,
            "design/references has at least 2 reference captures", "save screenshots or notes of 2+ real products")
    code, out = run(f'python3 "{os.path.join(HERE, "ui_lint.py")}" --design-only', 60)
    g.check(code == 0, "design direction passes the slop lint", out.strip()[-600:])
    ux = read(p("design", "ux-contract.md"))
    for s in ("Screens", "First 30 seconds", "Plain-language glossary", "States", "Stranger test"):
        body = section(ux, s)
        g.check(body is not None and len(body.strip()) >= 30, f"ux-contract section '{s}'", "missing or empty")
    g.clean("design/ux-contract.md")
    sc = read(p("contracts", "slice.md"))
    boxes = re.findall(r"^\s*- \[[ x]\] .{12,}", sc, re.M)
    g.check(len(boxes) >= 6, "contracts/slice.md has at least 6 testable checks", f"found {len(boxes)}")
    g.check("given" in sc.lower() and "then" in sc.lower(), "slice contract phrased as Given/When/Then")
    cfg = config()
    if cfg.get("sponsor_tech"):
        g.exists("project/sponsor-usage.md", 200)
    g.clean("contracts/slice.md")
    return g


def probe_live(g, label="live URL"):
    cfg = config()
    url = cfg.get("live_url", "")
    if not g.check(bool(url), "config.live_url is set", "deploy first and record the public URL"):
        return
    if QUICK:
        return
    ok, code = http_ok(url)
    g.check(ok, f"{label} returns HTTP 200", f"got {code}")
    if ok:
        rc, out = run(f'node "{os.path.join(HERE, "browser", "probe.mjs")}" "{url}" --out evidence/probe', 180)
        g.check(rc == 0, "browser probe passes (no console errors, readable text, no mobile overflow)", out.strip()[-900:])


def lint(g):
    code, out = run(f'python3 "{os.path.join(HERE, "ui_lint.py")}"', 120)
    g.check(code == 0 and "no UI source files" not in out, "UI slop lint passes", out.strip()[-900:])


def claims(g):
    if QUICK:
        return
    code, out = run(f'python3 "{os.path.join(HERE, "audit_claims.py")}"', 300)
    g.check(code == 0, "claims audit passes (every public claim has evidence)", out.strip()[-1200:])


def gate3():
    g = Gate(3, "Vertical slice")
    probe_live(g)
    lint(g)
    evs = [e for e in evaluations() if e["contract"] == "slice"]
    if g.check(bool(evs), "an independent evaluation of the slice exists", "run /hack-review slice"):
        eval_passes(g, evs[-1], "slice evaluation")
    g.exists("evidence/slice/notes.md", 100)
    g.need_human(state().get("human_approved_slice") == "yes",
                 "Open the live URL yourself. If you would not show it to a friend, say what is wrong. Otherwise set `human_approved_slice: yes` in STATE.md.")
    return g


def gate4():
    g = Gate(4, "Build-out")
    cfg = config()
    contracts = [f for f in sorted(os.listdir(p("contracts"))) if f.endswith(".md")] if os.path.isdir(p("contracts")) else []
    g.check(len(contracts) >= 1, "contracts/ has at least one contract")
    evs = evaluations()
    for c in contracts:
        stem = c[:-3]
        mine = [e for e in evs if e["contract"] == stem]
        if g.check(bool(mine), f"contract '{stem}' has an evaluation", "not evaluated yet"):
            eval_passes(g, mine[-1], f"contract '{stem}'")
        txt = read(p("contracts", c))
        open_boxes = re.findall(r"^\s*- \[ \] .+", txt, re.M)
        g.check(not open_boxes, f"contract '{stem}' has no unchecked items", f"{len(open_boxes)} open: {open_boxes[:2]}")
    if cfg.get("build") and not QUICK:
        rc, out = run(cfg["build"], 900, cwd=p(cfg.get("app_dir", ".")))
        g.check(rc == 0, f"build passes ({cfg['build']})", out[-600:])
    if cfg.get("test") and not QUICK:
        rc, out = run(cfg["test"], 900, cwd=p(cfg.get("app_dir", ".")))
        g.check(rc == 0, f"tests pass ({cfg['test']})", out[-600:])
    probe_live(g)
    lint(g)
    claims(g)
    return g


def gate5():
    g = Gate(5, "Independent review")
    evs = [e for e in evaluations() if e["contract"] == "final"]
    if g.check(bool(evs), "a final evaluation exists", "run /hack-review final in a fresh session"):
        e = evs[-1]
        eval_passes(g, e, "final evaluation")
        g.check(e["stranger"] == "PASS", "stranger test PASS", f"got '{e['stranger'] or 'missing'}'")
        if e["builder"] and e["evaluator"] and e["builder"] == e["evaluator"]:
            g.check(True, "NOTE: evaluator and builder used the same model", "consider a different model for the final review")
    bugs = read(p("evaluation", "bugs.md"))
    open_hi = re.findall(r"^\s*- \[ \]\s*(P0|P1)\b.*$", bugs, re.M)
    g.check(not open_hi, "no open P0/P1 in evaluation/bugs.md", f"{len(open_hi)} open")
    fc = {}
    try:
        fc = json.loads(read(p("evidence", "fresh-clone.json"), "{}") or "{}")
    except json.JSONDecodeError:
        pass
    head = run("git rev-parse HEAD")[1].strip()
    g.check(fc.get("status") == "ok", "fresh-clone test passed", "run scripts/fresh_clone_test.sh")
    g.check(fc.get("commit") == head and bool(head), "fresh-clone test ran on the current commit", f"tested {fc.get('commit', 'none')[:8]}, HEAD is {head[:8]}")
    if config().get("processes_user_input"):
        fx = read(p("evaluation", "fixtures.md"))
        n = len(re.findall(r"^\s*(?:[-*]|\d+\.)\s*\*?\*?case", fx, re.M | re.I))
        g.check(n >= 5, "at least 5 real-input fixtures defined", f"found {n}")
        g.check("negative" in fx.lower() or "edge" in fx.lower(), "fixtures include a negative or edge case")
        g.check(bool(re.search(r"https?://", fx)), "fixtures cite public sources")
        res = read(p("evaluation", "fixture-results.md"))
        rows = len(re.findall(r"^\|\s*case", res, re.M | re.I))
        g.check(rows == n and n > 0, "every fixture has a recorded result (failures included)", f"{rows} results for {n} fixtures")
    claims(g)
    lint(g)
    return g


def gate6():
    g = Gate(6, "Demo video")
    cfg = config()
    mx = int(cfg.get("video_max_seconds") or 180)
    sb = read(p("demo", "storyboard.md"))
    rows = []
    for m in re.finditer(r"^\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(live|slide|title)\s*\|", sb, re.M | re.I):
        rows.append((float(m.group(1)), float(m.group(2)), m.group(3).lower()))
    g.check(len(rows) >= 5, "storyboard has at least 5 timed rows (| start | end | live/slide/title | ...)", f"found {len(rows)}")
    if rows:
        total = max(r[1] for r in rows)
        live = sum(r[1] - r[0] for r in rows if r[2] == "live")
        g.check(total <= mx, f"storyboard fits the {mx}s limit", f"{total:.0f}s")
        g.check(total > 0 and live / total >= 0.7, "at least 70% of the video shows the real product (live)", f"{live / total * 100:.0f}% live")
        g.check(rows[0][2] != "title" or rows[0][1] <= 6, "video does not open with a long title card", "state the problem in the first seconds")
    v = p("submission", "assets", "demo.mp4")
    info = mp4_info(v)
    if g.check(info is not None, "submission/assets/demo.mp4 exists and parses", "render the video"):
        g.check(info["duration"] is not None and info["duration"] <= mx, f"video length <= {mx}s", f"{info['duration']}")
        g.check((info["width"] or 0) >= 1280, "video is at least 1280px wide", f"{info['width']}x{info['height']}")
        g.check(info["bytes"] < 1_900_000_000, "video file under 1.9 GB")
    g.need_human(state().get("human_approved_demo") == "yes", "Watch the video once with sound. Set `human_approved_demo: yes` in STATE.md.")
    return g


def gate7():
    g = Gate(7, "Submission package")
    cfg = config()
    f = read(p("submission", "fields.md"))
    for s in ("Project name", "Elevator pitch", "About the project", "Built with", "Try it out", "Video", "Image gallery"):
        body = section(f, s)
        g.check(body is not None and len(body.strip()) >= 5, f"fields: '{s}'", "missing or empty")
    pitch = (section(f, "Elevator pitch") or "").strip()
    g.check(0 < len(pitch) <= 200, "elevator pitch <= 200 characters", f"{len(pitch)}")
    if cfg.get("sponsor_tech"):
        body = section(f, "How we used") or ""
        g.check(len(body.split()) >= 150, "sponsor-tool usage write-up (>=150 words)", f"{len(body.split())} words")
    if cfg.get("sponsor_tech"):
        gal = (section(f, "Image gallery") or "").lower()
        g.check(any(t.lower() in gal or "spec" in gal or "hook" in gal or "steering" in gal for t in cfg["sponsor_tech"]),
                "gallery includes at least one image that shows the sponsor tool in use (caption names it)",
                "winners show the tool's specs, hooks or logs in the gallery, not only the product")
    g.exists("submission/checklist.md", 100)
    for rel in cfg.get("required_paths", []):
        g.check(os.path.exists(p(rel)), f"required path exists: {rel}", "the rules require it")
    g.check(os.path.exists(p("LICENSE")) or os.path.exists(p("LICENSE.md")), "open-source LICENSE file at repo root")
    if cfg.get("live_url"):
        ok, code = http_ok(cfg["live_url"])
        g.check(ok, "live URL reachable", code)
    if cfg.get("repo_url"):
        ok, code = http_ok(cfg["repo_url"])
        g.check(ok, "repo URL is public and reachable", code)
    g.check(len(os.listdir(p("submission", "assets"))) >= 4 if os.path.isdir(p("submission", "assets")) else False,
            "submission/assets has video, thumbnail and gallery images")
    claims(g)
    todo = re.findall(r"TODO\(human\)[^\n]*", f)
    g.need_human(not todo, f"{len(todo)} TODO(human) item(s) left in fields.md: {todo[:2]}")
    g.need_human(state().get("human_submitted") == "yes", "A human submits on Devpost, then sets `human_submitted: yes` in STATE.md.")
    return g


GATES = {0: gate0, 1: gate1, 2: gate2, 3: gate3, 4: gate4, 5: gate5, 6: gate6, 7: gate7}


def report(g, as_json):
    code = g.exit_code()
    os.makedirs(p("evidence", "gates"), exist_ok=True)
    rec = {
        "stage": g.stage, "title": g.title, "exit": code,
        "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "failed": [{"check": n, "detail": d} for ok, n, d in g.failed],
        "human": g.human,
    }
    with open(p("evidence", "gates", f"stage-{g.stage}.json"), "w") as fh:
        json.dump(rec, fh, indent=2)
    if as_json:
        print(json.dumps(rec, indent=2))
        return code
    print(f"== Gate {g.stage}: {g.title}")
    for ok, name, detail in g.checks:
        print(f"  [{'ok' if ok else 'FAIL'}] {name}" + (f"\n         -> {detail}" if (not ok and detail) else ""))
    if g.failed:
        print(f"\nGATE {g.stage} FAILED ({len(g.failed)} check(s)). Fix these, then run the gate again. Do not move on.")
    elif g.human:
        print(f"\nGATE {g.stage}: automated checks passed. WAITING ON HUMAN:")
        for h in g.human:
            print(f"  - {h}")
        print("Stop here and tell the human what to do. Do not start the next stage.")
    else:
        print(f"\nGATE {g.stage} PASSED. Update STATE.md (stage: {g.stage + 1}) and read the next stage file.")
    return code


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv
    if not args:
        print(__doc__)
        return 2
    if args[0] == "status":
        global QUICK
        QUICK = True
        for n in sorted(GATES):
            g = GATES[n]()
            c = g.exit_code()
            label = {0: "PASS", 1: "FAIL", 10: "HUMAN"}[c]
            first = g.failed[0][1] if g.failed else (g.human[0][:70] if g.human else "")
            print(f"stage {n} {g.title:<42} {label:<6} {first}")
        return 0
    try:
        n = int(args[0])
    except ValueError:
        print(__doc__)
        return 2
    if n not in GATES:
        print("stage must be 0..7")
        return 2
    return report(GATES[n](), as_json)


if __name__ == "__main__":
    sys.exit(main())
