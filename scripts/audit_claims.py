#!/usr/bin/env python3
"""Claims audit: every technology, number and result in public copy needs evidence.

    python3 scripts/audit_claims.py [--root .] [--verbose]

Public copy = README.md, submission/fields.md, demo/storyboard.md.

Checks
  1. Technology claims. A named technology (Tauri, Oxlint, Supabase, Whisper, ...) must show up
     as a real dependency, an import, a config file/dir, or an API call. A mention inside a
     UI string or a comment does not count. Lines about future work are exempt.
  2. Number claims ("250 seeds", "18 tests", "98%", "12ms") must appear in project/claims.md.
  3. The ledger (project/claims.md): each row's evidence is run or checked
        | Claim | Evidence | Kind |   Kind = cmd (exit 0), file (exists), url (HTTP 200)
Exit 1 if anything is unsupported. Standard library only.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.getcwd()
if "--root" in sys.argv:
    ROOT = os.path.abspath(sys.argv[sys.argv.index("--root") + 1])
VERBOSE = "--verbose" in sys.argv

PUBLIC = ["README.md", "submission/fields.md", "demo/storyboard.md"]
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".nuxt", "target", "evidence", "submission", "docs",
             "demo", "taste", "design", "project", "contracts", "evaluation", "pipeline", "scripts", ".opencode",
             "__pycache__", ".venv", "venv", "coverage", ".turbo", "public"}
CODE_EXT = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".rs", ".go", ".rb", ".java", ".kt", ".swift",
            ".dart", ".vue", ".svelte", ".php", ".cs", ".cpp", ".c", ".h"}
MANIFESTS = {"package.json", "requirements.txt", "pyproject.toml", "Cargo.toml", "go.mod", "Gemfile", "pubspec.yaml",
             "build.gradle", "build.gradle.kts", "Package.swift", "composer.json", "pom.xml", "Pipfile", "environment.yml"}

# display name: (mention regex, case_sensitive, evidence)
# evidence keys: deps (names in manifests), imports (module names), paths (substring of a repo path),
#                code (literal API usage in code files)
T = {
    "Tauri": (r"\bTauri\b", False, dict(deps=["tauri", "@tauri-apps"], paths=["src-tauri/", "tauri.conf"])),
    "Electron": (r"\bElectron\b", True, dict(deps=["electron"])),
    "Rust": (r"\bRust\b", True, dict(paths=["Cargo.toml"])),
    "Oxlint": (r"\bOxlint\b", False, dict(deps=["oxlint"], paths=[".oxlintrc", "oxlint"])),
    "Fallow": (r"\bFallow\b", True, dict(deps=["fallow"], paths=["fallow."])),
    "Specta": (r"\bSpecta\b", True, dict(deps=["specta"])),
    "React": (r"\bReact\b(?! Native)", True, dict(deps=["react", "react-dom"])),
    "React Native": (r"React Native", True, dict(deps=["react-native"])),
    "Vue": (r"\bVue(?:\.js)?\b", True, dict(deps=["vue"])),
    "Svelte": (r"\bSvelte(?:Kit)?\b", True, dict(deps=["svelte", "@sveltejs/kit"])),
    "Next.js": (r"\bNext\.js\b", False, dict(deps=["next"])),
    "Vite": (r"\bVite\b(?!\+)", True, dict(deps=["vite"])),
    "Tailwind": (r"\bTailwind(?:CSS| CSS)?\b", False, dict(deps=["tailwindcss", "@tailwindcss/vite"])),
    "TypeScript": (r"\bTypeScript\b", True, dict(deps=["typescript"], paths=[".ts", "tsconfig"])),
    "Three.js": (r"\bThree\.?js\b", False, dict(deps=["three", "@react-three/fiber"])),
    "WebGL": (r"\bWebGL\b", True, dict(deps=["three", "@react-three/fiber", "pixi.js", "ogl", "regl", "babylonjs", "@babylonjs/core"], code=["getContext('webgl", 'getContext("webgl', "WebGLRenderer"])),
    "D3": (r"\bD3(?:\.js)?\b", True, dict(deps=["d3"])),
    "Chart.js": (r"\bChart\.js\b", False, dict(deps=["chart.js", "react-chartjs-2"])),
    "Leaflet": (r"\bLeaflet\b", True, dict(deps=["leaflet", "react-leaflet"])),
    "Mapbox": (r"\bMapbox\b", True, dict(deps=["mapbox-gl", "react-map-gl"])),
    "MapLibre": (r"\bMapLibre\b", True, dict(deps=["maplibre-gl"])),
    "Python": (r"\bPython\b", True, dict(paths=[".py", "requirements.txt", "pyproject.toml"])),
    "FastAPI": (r"\bFastAPI\b", True, dict(deps=["fastapi"])),
    "Flask": (r"\bFlask\b", True, dict(deps=["flask"])),
    "Django": (r"\bDjango\b", True, dict(deps=["django"])),
    "Express": (r"\bExpress(?:\.js)?\b(?= (?:server|app|API|backend))", True, dict(deps=["express"])),
    "Node.js": (r"\bNode\.js\b", False, dict(paths=["package.json"])),
    "PostgreSQL": (r"\bPostgre(?:SQL|s)\b", False, dict(deps=["pg", "postgres", "psycopg2", "psycopg", "asyncpg", "@supabase/supabase-js", "prisma", "drizzle-orm", "sqlalchemy"], paths=["docker-compose"])),
    "SQLite": (r"\bSQLite\b", False, dict(deps=["better-sqlite3", "sqlite3", "sql.js", "@libsql/client"], imports=["sqlite3"])),
    "MongoDB": (r"\bMongo(?:DB)?\b", True, dict(deps=["mongodb", "mongoose", "pymongo"])),
    "Redis": (r"\bRedis\b", True, dict(deps=["redis", "ioredis"])),
    "Supabase": (r"\bSupabase\b", False, dict(deps=["@supabase/supabase-js", "supabase"], paths=["supabase/"], code=["supabase.co"])),
    "Firebase": (r"\bFirebase\b", False, dict(deps=["firebase", "firebase-admin"], paths=["firebase.json"])),
    "Vercel": (r"\bVercel\b", True, dict(paths=["vercel.json", ".vercel"], deps=["vercel", "@vercel/analytics"])),
    "Netlify": (r"\bNetlify\b", True, dict(paths=["netlify.toml"])),
    "Cloudflare": (r"\bCloudflare\b", True, dict(paths=["wrangler.toml", "wrangler.json"], deps=["wrangler"])),
    "Docker": (r"\bDocker\b", True, dict(paths=["Dockerfile", "docker-compose"])),
    "GraphQL": (r"\bGraphQL\b", True, dict(deps=["graphql", "@apollo/client", "urql", "graphql-request", "gql"], code=["graphql"])),
    "WebSocket": (r"\bWeb[ -]?Sockets?\b", False, dict(deps=["ws", "socket.io", "socket.io-client", "websockets"], code=["new WebSocket(", "WebSocket("])),
    "WebAssembly": (r"\b(?:WebAssembly|WASM)\b", False, dict(paths=[".wasm"], code=["WebAssembly."], deps=["wasm-pack", "@wasm-tool/wasm-pack-plugin"])),
    "OpenAI": (r"\bOpenAI\b", True, dict(deps=["openai", "@ai-sdk/openai"], code=["api.openai.com"])),
    "Anthropic": (r"\b(?:Anthropic|Claude)\b", True, dict(deps=["anthropic", "@anthropic-ai/sdk", "@ai-sdk/anthropic"], code=["api.anthropic.com"])),
    "Gemini": (r"\bGemini\b", True, dict(deps=["@google/generative-ai", "@google/genai", "google-generativeai", "google-genai", "@ai-sdk/google"], code=["generativelanguage.googleapis.com"])),
    "Whisper": (r"\bWhisper\b", True, dict(deps=["openai-whisper", "faster-whisper", "whisper-rs", "@xenova/transformers", "@huggingface/transformers", "whisper"], code=["whisper"])),
    "Ollama": (r"\bOllama\b", True, dict(deps=["ollama"], code=["localhost:11434"])),
    "LangChain": (r"\bLangChain\b", True, dict(deps=["langchain", "@langchain/core"])),
    "Transformers.js": (r"\bTransformers\.js\b", False, dict(deps=["@xenova/transformers", "@huggingface/transformers"])),
    "ONNX": (r"\bONNX\b", True, dict(deps=["onnxruntime-web", "onnxruntime", "onnxruntime-node"])),
    "TensorFlow": (r"\bTensorFlow(?:\.js)?\b", True, dict(deps=["@tensorflow/tfjs", "tensorflow"])),
    "PyTorch": (r"\bPyTorch\b", True, dict(deps=["torch", "pytorch"])),
    "scikit-learn": (r"\bscikit-learn\b", False, dict(deps=["scikit-learn", "sklearn"])),
    "OpenCV": (r"\bOpenCV\b", True, dict(deps=["opencv-python", "opencv-python-headless", "opencv-js", "@techstark/opencv-js"])),
    "MediaPipe": (r"\bMediaPipe\b", True, dict(deps=["mediapipe", "@mediapipe/tasks-vision"])),
    "Pandas": (r"\bpandas\b", True, dict(deps=["pandas"])),
    "NumPy": (r"\bNumPy\b", True, dict(deps=["numpy"])),
    "Stripe": (r"\bStripe\b", True, dict(deps=["stripe", "@stripe/stripe-js"])),
    "Twilio": (r"\bTwilio\b", True, dict(deps=["twilio"])),
    "Playwright": (r"\bPlaywright\b", True, dict(deps=["playwright", "@playwright/test"])),
    "Vitest": (r"\bVitest\b", True, dict(deps=["vitest"])),
    "Jest": (r"\bJest\b", True, dict(deps=["jest"])),
    "pytest": (r"\bpytest\b", True, dict(deps=["pytest"])),
    "Flutter": (r"\bFlutter\b", True, dict(paths=["pubspec.yaml"])),
    "SwiftUI": (r"\bSwiftUI\b", True, dict(paths=[".swift"])),
    "Kotlin": (r"\bKotlin\b", True, dict(paths=[".kt", "build.gradle.kts"])),
    "Kiro": (r"\bKiro\b", True, dict(paths=[".kiro/"])),
    "Momen": (r"\bMomen\b", True, dict(code=["momen", "villa.momen.app"], paths=["momen"])),
    "ESLint": (r"\bESLint\b", True, dict(deps=["eslint"], paths=["eslint.config", ".eslintrc"])),
    "Prettier": (r"\bPrettier\b", True, dict(deps=["prettier"])),
    "Zustand": (r"\bZustand\b", True, dict(deps=["zustand"])),
    "Redux": (r"\bRedux\b", True, dict(deps=["redux", "@reduxjs/toolkit"])),
    "Framer Motion": (r"\bFramer Motion\b", False, dict(deps=["framer-motion", "motion"])),
    "GSAP": (r"\bGSAP\b", True, dict(deps=["gsap"])),
    "Tone.js": (r"\bTone\.js\b", False, dict(deps=["tone"])),
}

FUTURE = re.compile(r"\b(planned|roadmap|future|next steps?|what'?s next|coming soon|not (?:yet )?implemented|stretch goal|would|could|might|todo|idea:)\b", re.I)
NUM = re.compile(
    r"(?<![\w.#/-])(\d[\d,]*(?:\.\d+)?)(?:(%|ms\b|fps\b|MB\b|GB\b|x\b)|[- ]?"
    r"((?:seeds?|tests?|test cases?|cases?|benchmarks?|samples?|datasets?|rows|users?|countries|languages|checks?|scenarios?|records?)\b))",
    re.I,
)


def p(*parts):
    return os.path.join(ROOT, *parts)


def read(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read()
    except OSError:
        return ""


def walk_repo():
    files = []
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP_DIRS or (d == ".kiro")]
        rel_dir = os.path.relpath(dp, ROOT)
        for f in fn:
            files.append(os.path.normpath(os.path.join(rel_dir, f)))
    return files


def build_evidence():
    files = walk_repo()
    manifest_text = ""
    code_text = ""
    for rel in files:
        base = os.path.basename(rel)
        ext = os.path.splitext(base)[1].lower()
        if base in MANIFESTS:
            manifest_text += "\n" + read(p(rel)).lower()
        elif ext in CODE_EXT:
            try:
                if os.path.getsize(p(rel)) < 400_000:
                    code_text += "\n" + read(p(rel)).lower()
            except OSError:
                pass
    # dependency names only (keys of package.json deps) to avoid description text
    deps = set()
    for rel in files:
        if os.path.basename(rel) == "package.json":
            try:
                j = json.loads(read(p(rel)))
                for k in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
                    deps |= {d.lower() for d in (j.get(k) or {})}
            except json.JSONDecodeError:
                pass
    return files, manifest_text, code_text, deps


def imported(code_text, mod):
    m = re.escape(mod.lower())
    return bool(re.search(rf"(?:from|import|require\()\s*['\"]{m}(?:/[^'\"]*)?['\"]|^\s*(?:import|from)\s+{m}\b|use\s+{m}::", code_text, re.M))


def has_evidence(ev, files, manifest_text, code_text, deps):
    for d in ev.get("deps", []):
        dl = d.lower()
        if dl in deps or re.search(rf"(?<![\w@/-]){re.escape(dl)}(?![\w-])", manifest_text):
            return True
    for m in ev.get("imports", []):
        if imported(code_text, m):
            return True
    for pth in ev.get("paths", []):
        pl = pth.lower()
        if any(pl in f.lower() for f in files):
            return True
    for c in ev.get("code", []):
        if c.lower() in code_text:
            return True
    return False


def public_lines():
    for rel in PUBLIC:
        txt = read(p(rel))
        in_future = False
        for i, line in enumerate(txt.splitlines(), 1):
            if re.match(r"^#{1,4}\s", line):
                in_future = bool(re.search(r"next|roadmap|future|what'?s next|planned", line, re.I))
            yield rel, i, line, in_future


def main():
    problems = []
    files, manifest_text, code_text, deps = build_evidence()
    ledger_path = p("project", "claims.md")
    ledger = read(ledger_path)
    if not ledger:
        problems.append("project/claims.md is missing. Create it from pipeline/templates/claims.md (it may have an empty table).")

    # 1. technology claims
    seen = set()
    for rel, i, line, in_future in public_lines():
        if in_future or FUTURE.search(line):
            continue
        for name, (rx, cs, ev) in T.items():
            if (name, rel) in seen:
                continue
            if re.search(rx, line, 0 if cs else re.I):
                if not has_evidence(ev, files, manifest_text, code_text, deps):
                    seen.add((name, rel))
                    problems.append(f"{rel}:{i}: claims '{name}' but no dependency, import, config or API call for it exists in the repo")
                elif VERBOSE:
                    print(f"ok   {name} ({rel}:{i})")

    # 2. number claims must be in the ledger
    led = re.sub(r"\s+", "", ledger.lower())
    flagged = set()
    for rel, i, line, in_future in public_lines():
        if in_future:
            continue
        for m in NUM.finditer(line):
            token = re.sub(r"\s+", "", (m.group(1) + (m.group(2) or m.group(3) or "")).lower())
            if token not in led and (rel, token) not in flagged:
                flagged.add((rel, token))
                problems.append(f"{rel}:{i}: number claim '{m.group(0).strip()}' is not in project/claims.md")

    # 3. ledger rows
    rows = [ln for ln in ledger.splitlines() if ln.strip().startswith("|")]
    for ln in rows[2:]:
        cols = [c.strip() for c in ln.strip().strip("|").split("|")]
        if len(cols) < 3 or not cols[0] or cols[0].startswith("{{") or set(cols[0]) <= set("-: "):
            continue
        claim, evidence, kind = cols[0], cols[1].strip("`"), cols[2].lower()
        if kind == "cmd":
            r = subprocess.run(evidence, shell=True, cwd=ROOT, capture_output=True, text=True, timeout=300)
            if r.returncode != 0:
                problems.append(f"ledger: '{claim}' evidence command failed (exit {r.returncode}): {evidence}")
        elif kind == "file":
            if not os.path.exists(p(evidence)):
                problems.append(f"ledger: '{claim}' evidence file missing: {evidence}")
        elif kind == "url":
            r = subprocess.run(["curl", "-sL", "-m", "25", "-o", "/dev/null", "-w", "%{http_code}", evidence], capture_output=True, text=True)
            if r.stdout.strip() != "200":
                problems.append(f"ledger: '{claim}' url returned {r.stdout.strip()}: {evidence}")
        else:
            problems.append(f"ledger: '{claim}' has unknown kind '{kind}' (use cmd, file or url)")

    if problems:
        print("CLAIMS AUDIT FAILED")
        for pr in problems:
            print(" -", pr)
        print("\nFix by building the thing, removing the claim, or moving it under a 'Next steps' heading. Never by weakening the check.")
        return 1
    print("CLAIMS AUDIT OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
