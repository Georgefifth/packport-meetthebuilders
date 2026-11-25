#!/usr/bin/env node
// Browser probe: loads a URL at desktop and mobile sizes and measures objective problems.
//
//   node scripts/browser/probe.mjs <url> [--out evidence/probe] [--wait 1500]
//
// Writes <out>/latest.json plus screenshots. Exit code 1 if any FAIL finding exists.
// These are measurements, not taste. They catch the failures that cost the most points:
// console errors, broken requests, unreadable text, mobile overflow, jargon-style UI strings.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
if (!url) {
  console.error("usage: probe.mjs <url> [--out dir] [--wait ms]");
  process.exit(2);
}
const outDir = opt("out", "evidence/probe");
const extraWait = parseInt(opt("wait", "1500"), 10);
fs.mkdirSync(outDir, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

// Runs inside the page. Keep it dependency-free.
function measure() {
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "svg", "path"]);
  const parseColor = (s) => {
    if (!s) return null;
    let m = s.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = s.match(/color\(srgb ([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[ /]+/).filter(Boolean).map(parseFloat);
      return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = parseColor(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let totalChars = 0, small12 = 0, small14 = 0, mono = 0, lowContrast = 0, upper = 0, letters = 0;
  const families = {};
  const jargon = [];
  const worst = [];
  const words = [];
  let wordsAboveFold = 0;
  const jargonRe = /\b[A-Z0-9]{2,}(?:_[A-Z0-9]+)+\b|^\s*\d{2}\s*\/\/|\[[A-Z_]{3,}\]|\/\/\s*[A-Z_]{4,}/;
  const monoRe = /mono|courier|consolas|menlo|plex mono|jetbrains|space mono|fira code|source code/i;
  while (walker.nextNode()) {
    const n = walker.currentNode;
    const text = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || SKIP.has(el.tagName) || !visible(el)) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const len = text.length;
    totalChars += len;
    if (size < 12) small12 += len;
    if (size < 14) small14 += len;
    const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    families[fam] = (families[fam] || 0) + len;
    if (monoRe.test(cs.fontFamily.split(",")[0])) mono += len;
    const transformed = cs.textTransform === "uppercase" ? text.toUpperCase() : text;
    for (const ch of transformed) {
      if (/[A-Za-z]/.test(ch)) {
        letters++;
        if (ch === ch.toUpperCase()) upper++;
      }
    }
    if (jargonRe.test(text) && jargon.length < 12) jargon.push(text.slice(0, 60));
    const fg = parseColor(cs.color);
    if (fg) {
      const bg = bgOf(el);
      const ratio = contrast(fg, bg);
      if (ratio < 4.5) {
        lowContrast += len;
        if (worst.length < 5) worst.push({ text: text.slice(0, 40), ratio: +ratio.toFixed(2), size });
      }
    }
    const r = el.getBoundingClientRect();
    const w = text.split(" ").length;
    words.push(w);
    if (r.top < innerHeight && r.bottom > 0) wordsAboveFold += w;
  }

  const interactive = [...document.querySelectorAll("a[href],button,input,select,textarea,[role=button],[tabindex]")].filter(visible);
  const smallTargets = interactive.filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width < 40 || r.height < 32;
  }).length;
  const unnamed = interactive.filter((e) => {
    const name = (e.getAttribute("aria-label") || e.innerText || e.value || e.getAttribute("title") || e.getAttribute("placeholder") || "").trim();
    return !name;
  }).length;
  const imgsNoAlt = [...document.images].filter((i) => visible(i) && !i.hasAttribute("alt")).length;

  return {
    title: document.title,
    lang: document.documentElement.lang,
    h1: document.querySelectorAll("h1").length,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    totalChars,
    small12Share: totalChars ? small12 / totalChars : 0,
    small14Share: totalChars ? small14 / totalChars : 0,
    monoShare: totalChars ? mono / totalChars : 0,
    lowContrastShare: totalChars ? lowContrast / totalChars : 0,
    upperShare: letters ? upper / letters : 0,
    families: Object.entries(families).sort((a, b) => b[1] - a[1]).slice(0, 6),
    jargonCount: jargon.length,
    jargonSamples: jargon,
    worstContrast: worst,
    interactiveCount: interactive.length,
    smallTargets,
    unnamedInteractive: unnamed,
    imgsNoAlt,
    wordsAboveFold,
  };
}

const browser = await chromium.launch();
const report = { url, at: new Date().toISOString(), viewports: {}, findings: [] };
const add = (sev, code, msg) => report.findings.push({ sev, code, msg });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const badRequests = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 200)));
  page.on("response", (r) => {
    if (r.status() >= 400 && !/favicon/.test(r.url())) badRequests.push(`${r.status()} ${r.url().slice(0, 120)}`);
  });
  page.on("requestfailed", (r) => badRequests.push(`FAILED ${r.url().slice(0, 120)}`));

  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  } catch (e) {
    add("FAIL", "load", `${vp.name}: page failed to load: ${String(e).slice(0, 120)}`);
    await ctx.close();
    continue;
  }
  await page.waitForTimeout(extraWait);
  const loadMs = Date.now() - t0;
  const m = await page.evaluate(measure);
  await page.screenshot({ path: path.join(outDir, `${vp.name}-fold.png`) });
  await page.screenshot({ path: path.join(outDir, `${vp.name}-full.png`), fullPage: true }).catch(() => {});
  report.viewports[vp.name] = { loadMs, consoleErrors, badRequests, ...m };

  const tag = `${vp.name}`;
  if (m.totalChars < 20) add("FAIL", "blank", `${tag}: almost no visible text (blank or broken render)`);
  if (consoleErrors.length) add("FAIL", "console", `${tag}: ${consoleErrors.length} console/page errors, e.g. ${consoleErrors[0]}`);
  if (badRequests.length) add("FAIL", "requests", `${tag}: ${badRequests.length} failed requests, e.g. ${badRequests[0]}`);
  if (m.overflowX) add(vp.mobile ? "FAIL" : "WARN", "overflow-x", `${tag}: horizontal overflow (content ${m.scrollWidth}px wide)`);
  if (m.small12Share > 0.05) add("FAIL", "tiny-text", `${tag}: ${(m.small12Share * 100).toFixed(0)}% of text is under 12px`);
  else if (m.small14Share > 0.4) add("WARN", "small-text", `${tag}: ${(m.small14Share * 100).toFixed(0)}% of text is under 14px`);
  if (m.lowContrastShare > 0.1) add("FAIL", "contrast", `${tag}: ${(m.lowContrastShare * 100).toFixed(0)}% of text is below 4.5:1 contrast`);
  if (m.upperShare > 0.4) add("FAIL", "all-caps", `${tag}: ${(m.upperShare * 100).toFixed(0)}% of letters are uppercase (reads as a control panel, not a product)`);
  else if (m.upperShare > 0.25) add("WARN", "all-caps", `${tag}: ${(m.upperShare * 100).toFixed(0)}% of letters are uppercase`);
  if (m.jargonCount > 5) add("FAIL", "jargon-ui", `${tag}: ${m.jargonCount} internal-identifier style labels, e.g. "${m.jargonSamples[0]}"`);
  else if (m.jargonCount > 0) add("WARN", "jargon-ui", `${tag}: identifier-style labels such as "${m.jargonSamples[0]}"`);
  if (m.monoShare > 0.5) add("WARN", "mono-heavy", `${tag}: ${(m.monoShare * 100).toFixed(0)}% of text is monospace`);
  if (vp.mobile && m.interactiveCount && m.smallTargets / m.interactiveCount > 0.3) add("WARN", "tap-targets", `${tag}: ${m.smallTargets}/${m.interactiveCount} tap targets are smaller than 40x32px`);
  if (m.unnamedInteractive > 0) add("WARN", "unnamed-controls", `${tag}: ${m.unnamedInteractive} controls have no accessible name`);
  if (!m.title) add("WARN", "title", `${tag}: missing <title>`);
  if (!m.lang) add("WARN", "lang", `${tag}: missing <html lang>`);
  if (m.h1 !== 1) add("WARN", "h1", `${tag}: expected exactly one <h1>, found ${m.h1}`);
  if (m.wordsAboveFold > 150) add("WARN", "wall-of-text", `${tag}: ${m.wordsAboveFold} words above the fold`);
  if (loadMs > 6000) add("WARN", "slow-load", `${tag}: took ${loadMs}ms to settle`);
  await ctx.close();
}
await browser.close();

fs.writeFileSync(path.join(outDir, "latest.json"), JSON.stringify(report, null, 2));
const fails = report.findings.filter((f) => f.sev === "FAIL");
for (const f of report.findings) console.log(`${f.sev.padEnd(4)} ${f.code.padEnd(14)} ${f.msg}`);
console.log(fails.length ? `\nPROBE FAILED: ${fails.length} blocking finding(s). Details: ${path.join(outDir, "latest.json")}` : `\nPROBE OK (${report.findings.length} warnings). Details: ${path.join(outDir, "latest.json")}`);
process.exit(fails.length ? 1 : 0);
