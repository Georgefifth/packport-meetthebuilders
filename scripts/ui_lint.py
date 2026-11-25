#!/usr/bin/env python3
"""UI slop lint: deterministic checks for the design failures AI builders repeat.

    python3 scripts/ui_lint.py                scan source files
    python3 scripts/ui_lint.py --design-only  check design/direction.md only (used by gate 2)
    python3 scripts/ui_lint.py --root path    scan another project folder

FAIL lines block the gate. WARN lines are advisory. Heuristics, not taste: they catch the cheap
failures so the human and the evaluator can spend attention on the real design questions.
Standard library only.
"""
import colorsys
import json
import os
import re
import sys

ROOT = os.getcwd()
if "--root" in sys.argv:
    ROOT = os.path.abspath(sys.argv[sys.argv.index("--root") + 1])

SKIP = {"node_modules", ".git", "dist", "build", ".next", ".nuxt", "target", "evidence", "submission", "docs", "demo",
        "taste", "design", "project", "contracts", "evaluation", "pipeline", "scripts", ".opencode", ".kiro", "__pycache__"}
EXT = {".css", ".scss", ".tsx", ".jsx", ".vue", ".svelte", ".html", ".js", ".ts", ".mjs"}
# Fonts that appear in most AI-generated UIs. Using them is not forbidden, but a project that uses
# only these has made no typographic decision.
AI_FONTS = {"inter", "roboto", "arial", "open sans", "lato", "system-ui", "-apple-system", "segoe ui", "helvetica",
            "helvetica neue", "poppins", "montserrat", "space grotesk", "syne", "ibm plex mono", "ibm plex sans",
            "jetbrains mono", "sans-serif", "monospace", "ui-monospace", "sf mono", "fira code", "space mono"}

fails, warns = [], []


def p(*a):
    return os.path.join(ROOT, *a)


def read(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read()
    except OSError:
        return ""


def hsl(hexcol):
    h = hexcol.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in (r, g, b)]
    lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
    return hh * 360, ss, ll, lum


def section(text, heading):
    m = re.search(r"^##\s+" + re.escape(heading) + r".*$", text, re.I | re.M)
    if not m:
        return None
    rest = text[m.end():]
    n = re.search(r"^##\s+", rest, re.M)
    return rest[: n.start()] if n else rest


# ----------------------------------------------------------------------------- design doc


def lint_design():
    d = read(p("design", "direction.md"))
    if not d:
        fails.append("design/direction.md is missing")
        return
    fonts_txt = section(d, "Fonts") or ""
    names = re.findall(r"\*\*([^*]+)\*\*|`([^`]+)`", fonts_txt)
    fonts = {next(x for x in n if x).strip().lower() for n in names if any(n)}
    fonts = {f for f in fonts if len(f) < 32 and "{{" not in f and not re.fullmatch(r"[\d.px% -]+", f)}
    if len(fonts) < 2:
        fails.append("Fonts: name at least two typefaces (a display face and a text face), in backticks or bold")
    elif fonts <= AI_FONTS:
        fails.append(f"Fonts: every font chosen ({', '.join(sorted(fonts))}) is an AI default. Pick at least one distinctive typeface")
    elif fonts & AI_FONTS:
        warns.append(f"Fonts: {', '.join(sorted(fonts & AI_FONTS))} is a common AI default; make sure it is a deliberate choice")

    pal = section(d, "Palette") or ""
    cols = [hsl(c) for c in dict.fromkeys(re.findall(r"#[0-9a-fA-F]{6}\b", pal))]
    surface = None
    for ln in pal.splitlines():
        m = re.search(r"#[0-9a-fA-F]{6}\b", ln)
        if m and re.search(r"surface|background|\bbg\b|paper|canvas", ln, re.I):
            surface = hsl(m.group(0))
            break
    if surface is None and cols:
        surface = cols[0]
    dark_bg = bool(surface) and surface[3] < 0.06
    neon = any(0.6 <= s and 165 <= h <= 200 and 0.4 <= ll <= 0.65 for h, s, ll, _ in cols)
    purple = any(s > 0.35 and 255 <= h <= 295 for h, s, ll, _ in cols)
    why_dark = section(d, "Why dark") or ""
    if dark_bg and (neon or purple) and len(why_dark.split()) < 30:
        fails.append("Palette: near-black background with a cyan/purple accent is the default AI look. Choose another direction, "
                     "or add a '## Why dark' section (30+ words) explaining why this user in this context needs it")
    elif dark_bg and len(why_dark.split()) < 30:
        warns.append("Palette: dark theme without a '## Why dark' justification")
    if re.search(r"gradient", d, re.I) and re.search(r"purple|violet|indigo", d, re.I):
        fails.append("Direction mentions a purple/indigo gradient")
    arche = (section(d, "Layout archetype") or "").lower()
    if re.search(r"kpi cards?|three[- ]column features?|sidebar (?:\+|and|with) cards|hero (?:\+|with) 3|glass", arche):
        fails.append("Layout archetype reads as a generic SaaS/dashboard template (KPI cards, three columns, glass). Describe a layout specific to this product")
    nots = section(d, "What this is not") or ""
    if len(re.findall(r"^\s*[-*]\s+\S", nots, re.M)) < 2:
        fails.append("'What this is not' needs at least 2 bullet points naming looks you are rejecting")
    sig = section(d, "Signature element") or ""
    if len(sig.split()) < 8:
        fails.append("Signature element is too vague: describe the one thing a viewer will remember")


# ----------------------------------------------------------------------------- source


def source_files():
    out = []
    cfg = {}
    try:
        cfg = json.loads(read(p("project", "config.json")) or "{}")
    except json.JSONDecodeError:
        pass
    roots = [cfg.get("app_dir", ".")]
    for r in roots:
        base = p(r)
        for dp, dn, fn in os.walk(base):
            dn[:] = [d for d in dn if d not in SKIP]
            for f in fn:
                if os.path.splitext(f)[1].lower() in EXT:
                    full = os.path.join(dp, f)
                    try:
                        if os.path.getsize(full) < 300_000:
                            out.append(full)
                    except OSError:
                        pass
    return out


JARGON = re.compile(r"(?<![=\-])>\s*[^<>{}()\n]*?\b[A-Z0-9]{2,}(?:_[A-Z0-9]+)+\b|['\"`]\s*\d{2}\s*//\s*[A-Z]|\[[A-Z_]{3,}\]\s")
EMOJI = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF]")
NEON = re.compile(r"#(?:00f0ff|0ff|00ffff|39ff14|ff00ff|ff3366|00ff41|7df9ff)\b", re.I)


def lint_source():
    files = source_files()
    if not files:
        warns.append("no UI source files found to lint (set app_dir in project/config.json)")
        return
    tiny = glass = purple_grad = upper = jarg = emoji = neon = placeholder = 0
    families = {}
    tiny_ex, jarg_ex = [], []
    for f in files:
        t = read(f)
        rel = os.path.relpath(f, ROOT)
        for m in re.finditer(r"font-size:\s*(\d+(?:\.\d+)?)px", t):
            if float(m.group(1)) < 12:
                tiny += 1
                tiny_ex.append(rel)
        for m in re.finditer(r"text-\[(\d+(?:\.\d+)?)px\]", t):
            if float(m.group(1)) < 12:
                tiny += 1
                tiny_ex.append(rel)
        for m in re.finditer(r"fontSize:\s*['\"]?(\d+(?:\.\d+)?)(?:px)?['\"]?", t):
            if float(m.group(1)) < 12:
                tiny += 1
                tiny_ex.append(rel)
        glass += len(re.findall(r"backdrop-filter:\s*blur|backdrop-blur|backdropFilter", t))
        for m in re.finditer(r"(?:linear|radial|conic)-gradient\(([^;{}]*)\)", t):
            for c in re.findall(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", m.group(1)):
                h, s, ll, _ = hsl(c)
                if s > 0.35 and 255 <= h <= 295:
                    purple_grad += 1
        purple_grad += len(re.findall(r"\b(?:from|via|to)-(?:purple|violet|indigo|fuchsia)-\d{3}", t))
        upper += len(re.findall(r"text-transform:\s*uppercase|\buppercase\b", t))
        if os.path.splitext(f)[1] in {".tsx", ".jsx", ".html", ".vue", ".svelte"}:
            hits = JARGON.findall(t)
            jarg += len(hits)
            jarg_ex += [h.strip()[:50] for h in hits[:2]]
            emoji += len(EMOJI.findall(t))
        neon += len(NEON.findall(t))
        placeholder += len(re.findall(r"lorem ipsum|your (?:text|title|description) here|feature (?:one|two|three)\b", t, re.I))
        for m in re.finditer(r"font-family:\s*([^;}{]+)", t):
            first = m.group(1).split(",")[0].strip().strip("'\"").lower()
            if first and not first.startswith("var("):
                families[first] = families.get(first, 0) + 1
        for m in re.finditer(r"fontFamily:\s*['\"]([^'\"]+)['\"]", t):
            first = m.group(1).split(",")[0].strip().strip("'\"").lower()
            families[first] = families.get(first, 0) + 1

    if tiny > 3:
        fails.append(f"{tiny} font sizes under 12px (e.g. {tiny_ex[0]}). Body text must be at least 14px, labels at least 12px")
    if glass > 2:
        fails.append(f"{glass} backdrop-blur/glass effects. Glassmorphism is a default AI tell; keep at most 2 with a reason")
    if purple_grad:
        fails.append(f"{purple_grad} purple/indigo gradient(s)")
    if jarg > 5:
        fails.append(f"{jarg} identifier-style UI labels such as {jarg_ex[:2]}. Write labels in plain words a first-time user understands")
    elif jarg:
        warns.append(f"{jarg} identifier-style UI label(s): {jarg_ex[:2]}")
    if placeholder:
        fails.append(f"{placeholder} placeholder text instance(s)")
    if upper > 12:
        warns.append(f"{upper} uppercase style uses; all-caps labels everywhere read as a control panel")
    if emoji > 3:
        warns.append(f"{emoji} emoji in UI text; use a real icon set or none")
    if neon > 3:
        warns.append(f"{neon} neon accent colours (cyan/magenta/green on dark is the stock 'hacker' look)")
    if families and set(families) <= AI_FONTS:
        fails.append(f"all fonts in use are AI defaults: {sorted(families)}. Load at least one distinctive typeface")


def main():
    if "--design-only" in sys.argv:
        lint_design()
    else:
        lint_source()
        if os.path.exists(p("design", "direction.md")):
            lint_design()
    for w in warns:
        print("WARN", w)
    for f in fails:
        print("FAIL", f)
    if fails:
        print(f"\nUI LINT FAILED ({len(fails)})")
        return 1
    print(f"UI LINT OK ({len(warns)} warnings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
