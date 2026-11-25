// Template for an evaluator flow script. Copy to evaluation/scripts/<name>.mjs and edit.
// Run from the project root:  node evaluation/scripts/<name>.mjs
import { chromium } from "../../scripts/browser/node_modules/playwright/index.mjs";
import fs from "node:fs";

const URL = JSON.parse(fs.readFileSync("project/config.json", "utf8")).live_url;
const OUT = "evidence/eval/slice-r1";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const results = [];
const check = async (name, fn) => {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t0 });
  } catch (e) {
    results.push({ name, ok: false, ms: Date.now() - t0, error: String(e).slice(0, 300) });
    await page.screenshot({ path: `${OUT}/${name}-FAIL.png` }).catch(() => {});
  }
};

await page.goto(URL, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/00-landing.png` });

await check("example-path-under-10s", async () => {
  const t0 = Date.now();
  await page.getByRole("button", { name: /example/i }).click();
  await page.getByText(/verdict|result/i).first().waitFor({ timeout: 10000 });
  if (Date.now() - t0 > 10000) throw new Error("took longer than 10s");
  await page.screenshot({ path: `${OUT}/01-result.png` });
});

await check("result-survives-reload", async () => {
  await page.reload({ waitUntil: "networkidle" });
  // assert the business outcome, not just that something rendered
});

await check("empty-input-message", async () => {
  // submit empty, expect a helpful message and focus in the field
});

results.push({ name: "console-clean", ok: errors.length === 0, error: errors[0] });
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
console.table(results.map(({ name, ok, ms }) => ({ name, ok, ms })));
await browser.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
