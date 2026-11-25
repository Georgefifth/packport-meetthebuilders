#!/usr/bin/env node
// Record real-product footage from a scripted walkthrough, with on-screen captions.
//
//   node scripts/browser/record.mjs demo/walkthrough.json [--out demo/raw]
//
// walkthrough.json:
// {
//   "url": "https://your-app.example",
//   "viewport": { "width": 1920, "height": 1080 },
//   "steps": [
//     { "caption": "Paste a repair quote", "wait": 1200 },
//     { "click": "text=Try an example" },
//     { "fill": ["#quote", "Brake pads x2 $340"] },
//     { "press": "Enter" },
//     { "scroll": 600 },
//     { "hover": ".verdict" },
//     { "wait": 2000 },
//     { "screenshot": "result.png" }
//   ]
// }
// Writes <out>/<name>.webm (Playwright video) and step screenshots. Convert to mp4 with:
//   ffmpeg -i demo/raw/<name>.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart submission/assets/demo.mp4
// Real footage with captions beats slides: judges want to see the product work.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const outIdx = args.indexOf("--out");
const out = outIdx >= 0 ? args[outIdx + 1] : "demo/raw";
if (!file) {
  console.error("usage: record.mjs <walkthrough.json> [--out dir]");
  process.exit(2);
}
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const vp = plan.viewport || { width: 1920, height: 1080 };
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: vp,
  recordVideo: { dir: out, size: vp },
});
const page = await ctx.newPage();

const caption = (text) =>
  page.evaluate((t) => {
    let el = document.getElementById("__demo_caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "__demo_caption";
      el.style.cssText =
        "position:fixed;left:50%;bottom:48px;transform:translateX(-50%);max-width:70%;padding:14px 26px;" +
        "background:rgba(20,20,20,.88);color:#fff;font:600 28px/1.3 system-ui,sans-serif;border-radius:10px;" +
        "z-index:2147483647;text-align:center;pointer-events:none;transition:opacity .2s";
      document.body.appendChild(el);
    }
    el.textContent = t;
    el.style.opacity = t ? "1" : "0";
  }, text);

await page.goto(plan.url, { waitUntil: "load" });
await page.waitForLoadState("networkidle").catch(() => {});
let i = 0;
for (const step of plan.steps) {
  i++;
  try {
    if (step.caption !== undefined) await caption(step.caption);
    if (step.click) await page.click(step.click, { timeout: 8000 });
    if (step.fill) await page.fill(step.fill[0], step.fill[1], { timeout: 8000 });
    if (step.type) await page.keyboard.type(step.type, { delay: 60 });
    if (step.press) await page.keyboard.press(step.press);
    if (step.hover) await page.hover(step.hover, { timeout: 8000 });
    if (step.scroll) await page.mouse.wheel(0, step.scroll);
    if (step.goto) await page.goto(step.goto, { waitUntil: "load" });
    if (step.screenshot) await page.screenshot({ path: path.join(out, step.screenshot) });
    await page.waitForTimeout(step.wait ?? 800);
  } catch (e) {
    console.error(`step ${i} failed (${JSON.stringify(step)}): ${String(e).slice(0, 160)}`);
    await ctx.close();
    await browser.close();
    process.exit(1);
  }
}
const video = page.video();
await ctx.close();
await browser.close();
console.log(`video: ${await video.path()}`);
