# Evaluation: slice round 1

- contract: slice
- round: 1
- verdict: FAIL
- scores: function=3 clarity=4 design=4 originality=4 craft=3 truth=4
- p0: 0
- p1: 2
- stranger_test: PASS
- builder_model: google-vertex/gemini-4-argon
- evaluator_model: google-vertex/gemini-4-argon

Scores are integers 1-5 using the anchors in `.opencode/skills/browser-verification/references/scoring.md`.
Thresholds: function>=4, clarity>=4, truth>=4, design>=3, originality>=3, craft>=3. PASS only if every threshold is met and p0=p1=0.

## Defects first

1. **P1 | Print-Ready Export Over-Sticker SVG truncates mandatory allergens (`Contains:` summary), cuts off INS additive codes (`INS 621`, `INS 211`), and omits inline allergen bolding (Check 4 failure)** | Open `https://dimensional-glance-icons-bible.trycloudflare.com`, click **Example: Bali Crispy Prawn Sambal → Singapore (SFA)**, click **Apply All Regulatory Fixes (7)**, and inspect the **Print-Ready Export Over-Sticker (88 mm × 112 mm)** SVG. (a) `buildExportStickerSvgString()` (`src/lib/regulatoryEngine.ts:801`) slices wrapped ingredients at 4 lines (`lines.slice(0, 4)`), cutting off line 4 at `...sweet soy sauce (Soybean, Wheat), Flavour Enhancer` and completely dropping `(INS 621, Monosodium Glutamate), Preservative (INS 211, Sodium Benzoate).` so no INS codes appear in the sticker SVG. (b) Line 830 (`s.containsSummary.slice(0, 58)`) truncates the `Contains:` box mid-word to `Contains: Crustacean (Shrimp / Prawn), Tree Nuts (Candlenu` (omitting `), Soybean.` on Example 1, cutting off at `Added Sulphite` on Example 2, and dropping `Gluten (Oats), Milk / Dairy, Egg, Sesame` on Example 3). (c) Line 874 (`.slice(0, 62)`) truncates the Singapore importer street address mid-line at `14 Fishery Port`. (d) `formattedIngredientsPlain` strips all `<strong>` tags and renders plain `<text>` without `<tspan font-weight="700">`, and `formattedIngredientsHtml` only matches hardcoded sample strings rather than all detected allergens in `APAC_ALLERGEN_LEXICON`. | `evidence/eval/slice-r1/check-04-remediated-sticker.png`
2. **P1 | Invalid or negative Serving Size (`<= 0`) is saved to `localStorage` on keystroke and bypasses validation on page reload and `Apply Fix` / `Apply All Regulatory Fixes`, generating a `100% Cleared for Export` sticker with `Per -5 g` and `68000 kcal`** | Open `/`, type `-5` into **Serving Size (g)**, and either reload the page or click **Apply All Regulatory Fixes (7)**. Because `useEffect` (`src/App.tsx:94-105`) persists `label` to `localStorage` even when `servingSizeAmount <= 0`, and both initial state hydration (`src/App.tsx:87`) and `handleApplyFix` / `handleApplyAllFixes` (`src/App.tsx:200-218`) call `inspectLabelDeterministic()` without validating `label`, `computePer100()` clamps `-5` to `0.1g` (`1000×` multiplier) and stamps the sticker `Cleared for Export (100%)` with `Per -5 g`, `68000 kcal (284512 kJ)`, `1800 g` protein, and `3400 g` sugar per 100g. | `evidence/eval/slice-r1/defect-p1-negative-serving-persisted-reload.png`, `evidence/eval/slice-r1/defect-p1-apply-fixes-on-invalid-serving.png`
3. **P2 | 120px blank whitespace gap inside the Source Label form (`.nutrition-fieldset { margin-top: 120px }`) and stale right-column header after clicking `Clear Form`** | Open `/` at `1440x900` or `390x844` and look directly below the red **Run Customs Pre-Flight** button: `src/styles.css:325` sets `margin-top: 120px` on `.nutrition-fieldset`, leaving a large empty white gap inside the form card. Additionally, click **Example: Chiang Mai Mango Drink → Australia (FSANZ)** and then click **Clear Form**: the left form resets **Destination Market** to `Singapore (SFA)`, while the right panel header remains `2. Customs Proof (Australia (FSANZ))`. | `evidence/eval/slice-r1/desktop-full.png`, `evidence/eval/slice-r1/edge-01-empty-state.png`
4. **P2 | `localStorage` key name mismatch between `project/spec.md` (`packport_history_v1`) and `src/App.tsx` (`packport_state_v1`)** | Compare `project/spec.md` line 32 (*"persisted locally under `packport_history_v1`"*) with `src/App.tsx:14` (`const STORAGE_KEY = 'packport_state_v1'`). | `evidence/eval/slice-r1/edge-persistence-reload.png`

## Contract checks

- [x] **Check 1 (First-run landing at `1440x900` within 3s, pitch, 3 Example SKU buttons, primary CTA, preloaded Bali Crispy Prawn Sambal dossier, 0 console/network errors):** **PASS** (`loadMs: 2330ms` in Playwright check, `0` console errors, `0` failed requests) — `evidence/eval/slice-r1/check-01-landing.png`, `evidence/eval/slice-r1/latest.json`
- [x] **Check 2 (Clicking Example 2 Australia FSANZ & Example 3 Japan CAA returns 200 OK from `/api/inspect-label`, populates left form, updates readiness score, Hold stamp, and numbered pins):** **PASS** (`POST /api/inspect-label` returned `200 OK` in `<400ms` for both `AU_FSANZ` and `JP_CAA`) — `evidence/eval/slice-r1/check-02-example-australia.png`, `evidence/eval/slice-r1/check-02-example-japan.png`
- [x] **Check 3 (Statutory Findings list displays plain-language severity badge, offending text, destination regulation clause, plain-language port failure explanation, and `Apply Fix` button):** **PASS** (All 7 findings on Example 1 display `Customs Hold (Must Fix)` or `Label Warning (Recommended Fix)`, `Regulation: ...`, `Flagged on origin pack: ...`, explanation, and `Apply Fix`) — `evidence/eval/slice-r1/check-03-statutory-findings.png`
- [ ] **Check 4 (Clicking `Apply All Regulatory Fixes` updates the live Print-Ready Export Over-Sticker SVG with inline-bolded allergens, `Contains:` summary line, international INS additive codes, computed `Per 100g / 100mL` column, compliant copy, `100% — Ready to print & ship`, and `Cleared for Export` stamp):** **FAIL** (Readiness score and `Cleared for Export` stamp update, but the SVG sticker truncates ingredients after line 4—dropping `INS 621` and `INS 211` on Example 1—truncates the `Contains:` summary mid-word at 58 chars across all 3 examples, and strips `<strong>` tags so no allergens are bolded inline in the SVG) — `evidence/eval/slice-r1/check-04-remediated-sticker.png`
- [x] **Check 5 (Custom edit of Destination Market, Ingredient List, and Total Sugars recalculates per-100g values and refreshes Statutory Findings and SVG):** **PASS** (Editing to `AU_FSANZ`, `Roasted peanuts (65%), coconut sugar, wheat flour, sodium metabisulfite, tartrazine`, and `12.0g` sugar per `20g` serving recalculated `60 g` sugar per `100g` and flagged Peanuts, Wheat/Gluten, Sulphites `INS 223`, and Tartrazine `INS 102`) — `evidence/eval/slice-r1/check-05-custom-edit.png`
- [x] **Check 6 (Clicking `Download Sticker SVG` triggers `.svg` file download and `Copy Customs Dossier` shows confirmation status):** **PASS** (Triggered download `bali-crispy-prawn-candlenut-sambal-au_fsanz.svg` with banner `"Downloaded compliant over-sticker SVG."` and `"Copied customs dossier to clipboard."`) — `evidence/eval/slice-r1/check-06-download-copy.png`, `evidence/eval/slice-r1/check-06b-copied-dossier.png`
- [x] **Check 7 (Mobile `390x844` layout has `scrollWidth <= 390`, tap targets `>= 44px`, readable text sizes, and unclipped SVG viewBox container):** **PASS** (`scrollWidth: 390`, `smallTargets: 0`, `small12Share: 0`, `small14Share: 0`) — `evidence/eval/slice-r1/check-07-mobile-390.png`, `evidence/eval/slice-r1/mobile-full.png`
- [x] **Check 8 (Keyboard-only `Tab` order, visible `:focus-visible` outline `>= 2px`, and `Enter` triggers inspection):** **PASS** (`outline: 3px solid rgb(29, 66, 104)`, sequential visual tab order, pressing `Enter` on focused control triggers inspection) — `evidence/eval/slice-r1/check-08-keyboard-focus.png`
- [x] **Edge Case 1 (`Clear Form` displays empty-state prompt and quick-start buttons):** **PASS** (Renders exact prompt and 3 `Load Example: ...` buttons; minor P2 header mismatch noted above) — `evidence/eval/slice-r1/edge-01-empty-state.png`
- [ ] **Edge Case 2 (Blank `Ingredient List` or `<= 0` `Serving Size` shows inline error, focuses field, and preserves typed work):** **FAIL** (Clicking `Run Customs Pre-Flight` shows the inline error and focuses the invalid input, but typing `-5` persists the invalid value to `localStorage` and allows `Apply All Regulatory Fixes` or page reload to compute `Per -5 g` / `68000 kcal` on the sticker) — `evidence/eval/slice-r1/edge-02a-bad-ingredient.png`, `evidence/eval/slice-r1/edge-02b-bad-serving.png`, `evidence/eval/slice-r1/defect-p1-negative-serving-persisted-reload.png`
- [x] **Edge Case 3 (Simulated upstream error `POST /api/inspect-label?simulateError=1` completes via deterministic statutory engine and shows plain-language notice):** **PASS** (Displays `"Completed inspection using the built-in statutory rule engine so your work is safe (simulated upstream fallback)."` and renders full findings and SVG) — `evidence/eval/slice-r1/edge-03-clean-fallback.png`

## Stranger test

Performed at `1440x900` and `390x844` before reading source code or `contracts/slice.md`:
- **0–5s impression:** *"This is PackPort, a pre-flight customs label inspector for APAC food exporters that checks ingredient and nutrition labels against Singapore (SFA), Australia (FSANZ), and Japan (CAA) import regulations and generates a compliant export over-sticker."* Matches the one-sentence pitch in `project/brief.md`.
- **Timeline:**
  - `[+1.4s]` Landed on `/`. Saw the ruled masthead (`PackPort`), plain-language pitch, three `Instant Demo SKUs` buttons, `1. Source Label` on the left, and `2. Customs Proof (Singapore (SFA))` on the right.
  - `[+1.5s]` Clicked `Example: Bali Crispy Prawn Sambal → Singapore (SFA)`.
  - `[+1.6s]` Observed `Customs Readiness Score: 12% — 7 fixes needed before export`, red angled stamp `Hold: Relabel Required`, numbered red pins `#1`–`#6` on the `Redlined Origin Package Proof`, and 7 itemized `Statutory Findings` cards explaining why customs would detain the shipment.
  - `[+1.6s]` Clicked `Apply All Regulatory Fixes (7)`.
  - `[+2.0s]` Observed confirmation banner `Applied all 7 regulatory fixes — Export over-sticker is now Cleared for Export (100%).`, green angled stamp `Cleared for Export`, and updated `Print-Ready Export Over-Sticker (88 mm × 112 mm)`.
- **Hesitations / wrong clicks / confusing labels:** `0` wrong clicks, `0` pauses over 5 seconds, `0` jargon labels (`jargonCount: 0` in `latest.json`).
- **Result:** `PASS` (completed in `< 10` seconds, well under the 2-minute budget).

## Design review

Reviewed against `design/direction.md` (`civic-ledger` — **Customs House Proof Sheet**):
- **What is distinctive and faithful to direction:**
  - Warm unbleached paper ground (`#FAF7F0`), crisp white proof cards (`#FFFFFF`), ruled buff headers (`#F2ECE1`), carbon ink text (`#141413`), Customs Vermilion Red (`#C8281E`) primary CTA and hold stamp, Maritime Manifest Navy (`#1D4268`) secondary buttons, and Port Clearance Emerald (`#1B6B3A`) cleared stamp match `design/direction.md` exactly.
  - Typography (`Newsreader` display serif, `Libre Franklin` UI/body, `Azeret Mono` for tabular numbers at `0.4%` share) is legible with `0%` text under `14px` and `0` contrast failures.
  - The angled rubber verdict stamp (`Hold: Relabel Required` / `Cleared for Export`) and numbered callout pins (`#1`–`#7`) linking the `Redlined Origin Package Proof` to the `Statutory Findings` cards land the signature concept well.
- **What contradicts the direction or looks generic / broken (3 items):**
  1. **120px artificial whitespace gap inside the left form (`.nutrition-fieldset { margin-top: 120px }`):** Breaks the visual rhythm of the `1. Source Label` panel on both desktop and mobile (`evidence/eval/slice-r1/desktop-full.png`).
  2. **Hard-sliced text inside the SVG Export Over-Sticker:** Using fixed character/line slices (`.slice(0, 58)`, `lines.slice(0, 4)`, `.slice(0, 62)`) instead of proper multi-line SVG wrapping + dynamic box height causes visibly truncated words (`Tree Nuts (Candlenu`) and missing INS codes on the centerpiece artifact (`evidence/eval/slice-r1/check-04-remediated-sticker.png`).
  3. **Stacked proof layout instead of toggleable or side-by-side comparison:** `design/direction.md` describes a toggleable or side-by-side view with millimeter crop marks and corner ticks, whereas `.proof-comparison-grid` uses a single-column stack (`grid-template-columns: 1fr`) and the SVG lacks corner crop marks.

## Truth review

- **Example labelling:** All three preloaded SKUs are clearly labelled `Example: ...` in the top strip and badged `Example SKU` in the `1. Source Label` panel header (`src/App.tsx:306-308`).
- **Real computation & Gemini integration:** `src/lib/regulatoryEngine.ts` performs real per-100g/100mL scaling, sugar/protein/sodium threshold checks, allergen lexicon matching, and INS additive mapping. `server/geminiInspector.ts` calls `@google/genai` (`gemini-2.5-flash`) with a strict `Type.OBJECT` `responseSchema` when `GEMINI_API_KEY` is configured and transparently displays the notice `"Completed inspection using the built-in statutory rule engine so your work is safe."` when falling back to the deterministic engine.
- **Discrepancies found:**
  1. The remediated Finding #4 card and `Agent 3` trace claim *"Formatted dual-column nutrition panel (Per Serving & Per 100g), inline PEAL/SFA bolded allergens, and Singapore SFA importer block"*, and Finding #5 claims *"Rewrite as Preservative (INS 211, Sodium Benzoate); Flavour Enhancer (INS 621, Monosodium Glutamate)"*, but the actual SVG sticker strips `<strong>` tags (no inline bolding), cuts off `INS 621` and `INS 211` after line 4, and truncates `Contains:` mid-word.
  2. `project/spec.md` states local persistence uses `packport_history_v1`, while `src/App.tsx` uses `packport_state_v1`.

## Measurements

From `evidence/eval/slice-r1/latest.json` (`scripts/browser/probe.mjs`):
- **Desktop (`1440x900`):** `loadMs: 3445`, `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 1440`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `monoShare: 0.0042` (`0.42%`), `upperShare: 0.103`, `jargonCount: 0`, `smallTargets: 0`, `unnamedInteractive: 0`, `imgsNoAlt: 0`, `wordsAboveFold: 150`.
- **Mobile (`390x844`):** `loadMs: 2798`, `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 390`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `smallTargets: 0`, `wordsAboveFold: 72`.

## What to fix first

1. **Fix the Export Over-Sticker SVG (`src/lib/regulatoryEngine.ts` `buildExportStickerSvgString` & ingredient formatter):**
   - Never truncate `Contains:`, `Ingredients:`, or `Imported by:` with `.slice(0, 58)` or `lines.slice(0, 4)`. Wrap `Ingredients:`, `Contains:`, and `Imported by:` across enough lines (and expand the SVG `viewBox` height dynamically or allocate sufficient vertical space) so every ingredient, every mapped `INS` code (`INS 211`, `INS 621`, etc.), the full `Contains:` allergen summary (`Soybean`, `Gluten (Oats)`, etc.), and the full importer address are rendered completely in the SVG across all 3 Example SKUs and custom inputs.
   - Render inline-bolded allergens inside the SVG `<text>` lines using `<tspan font-weight="700">...</tspan>` (converting `<strong>...</strong>` tokens into `<tspan font-weight="700">` instead of stripping them), and ensure all detected allergens from `APAC_ALLERGEN_LEXICON` (not just the 3 sample SKUs' hardcoded phrases) are bolded inline when the allergen fix is applied.
2. **Prevent invalid form state (`servingSizeAmount <= 0` or empty `ingredientList`) from persisting to `localStorage` or running in `handleApplyFix` / `handleApplyAllFixes` / initial hydration (`src/App.tsx`):**
   - In `useEffect` (`src/App.tsx:94`), only save to `localStorage` when `label.ingredientList.trim()` is non-empty AND `Number(label.nutrition.servingSizeAmount) > 0`.
   - When loading from `localStorage` in `useState` (`src/App.tsx:48`), validate that `parsed.label.ingredientList?.trim()` is non-empty and `Number(parsed.label.nutrition?.servingSizeAmount) > 0`; otherwise fall back to `SAMPLE_SKUS[0]`.
   - In `handleApplyFix` and `handleApplyAllFixes`, validate `label` (or sanitize `servingSizeAmount`) before recomputing `inspectLabelDeterministic` so a user with `-5` in Serving Size sees the validation error instead of a `100% Cleared for Export` sticker with `Per -5 g` and `68000 kcal`.
3. **Remove `margin-top: 120px` on `.nutrition-fieldset` (`src/styles.css:325`), reset `result` in `handleClearForm`, and align the `localStorage` key:**
   - Change `.nutrition-fieldset { margin-top: 120px; }` to `margin-top: 16px;` (and if needed to keep `wordsAboveFold` / `interactiveCount` clean, adjust spacing naturally rather than leaving a 120px hole inside the form).
   - In `handleClearForm()`, also reset `setResult(inspectLabelDeterministic(SAMPLE_SKUS[0], []))` (or display a neutral header `2. Customs Proof` when `isCleared` is true) so the right panel header matches the reset `Singapore (SFA)` selector.
   - Use `packport_history_v1` in `src/App.tsx` to match `project/spec.md`.

## Evidence

- `evidence/eval/slice-r1/latest.json`
- `evidence/eval/slice-r1/desktop-fold.png`
- `evidence/eval/slice-r1/desktop-full.png`
- `evidence/eval/slice-r1/mobile-fold.png`
- `evidence/eval/slice-r1/mobile-full.png`
- `evidence/eval/slice-r1/stranger-1-loaded.png`
- `evidence/eval/slice-r1/stranger-2-remediated.png`
- `evidence/eval/slice-r1/check-01-landing.png`
- `evidence/eval/slice-r1/check-02-example-australia.png`
- `evidence/eval/slice-r1/check-02-example-japan.png`
- `evidence/eval/slice-r1/check-03-statutory-findings.png`
- `evidence/eval/slice-r1/check-04a-single-fix.png`
- `evidence/eval/slice-r1/check-04-remediated-sticker.png`
- `evidence/eval/slice-r1/check-05-custom-edit.png`
- `evidence/eval/slice-r1/check-06-download-copy.png`
- `evidence/eval/slice-r1/check-06b-copied-dossier.png`
- `evidence/eval/slice-r1/check-07-mobile-390.png`
- `evidence/eval/slice-r1/check-08-keyboard-focus.png`
- `evidence/eval/slice-r1/edge-01-empty-state.png`
- `evidence/eval/slice-r1/edge-02a-bad-ingredient.png`
- `evidence/eval/slice-r1/edge-02b-bad-serving.png`
- `evidence/eval/slice-r1/edge-03-clean-fallback.png`
- `evidence/eval/slice-r1/edge-persistence-reload.png`
- `evidence/eval/slice-r1/edge-huge-input-dblclick.png`
- `evidence/eval/slice-r1/defect-p1-negative-serving-persisted-reload.png`
- `evidence/eval/slice-r1/defect-p1-apply-fixes-on-invalid-serving.png`
