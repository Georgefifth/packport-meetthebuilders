# Evaluation: slice round 2

- contract: slice
- round: 2
- verdict: PASS
- scores: function=5 clarity=5 design=4 originality=4 craft=4 truth=4
- p0: 0
- p1: 0
- stranger_test: PASS
- builder_model: google-vertex/gemini-4-argon
- evaluator_model: google-vertex/gemini-4-argon

Scores are integers 1-5 using the anchors in `.opencode/skills/browser-verification/references/scoring.md`.
Thresholds: function>=4, clarity>=4, truth>=4, design>=3, originality>=3, craft>=3. PASS only if every threshold is met and p0=p1=0.

## Defects first

No P0, P1, or P2 defects remain. All four defects from Round 1 have been verified as resolved in a real browser against `https://dimensional-glance-icons-bible.trycloudflare.com`:
- **Resolved (was P1):** `buildExportStickerSvgString()` (`src/lib/regulatoryEngine.ts:918-1070`) now wraps `Ingredients:`, `Contains:`, and `Imported by:` across dynamic multi-line SVG `<text>` nodes, expands `viewBox` height dynamically, renders `<tspan font-weight="700">` inline bolding across all detected allergens in `APAC_ALLERGEN_LEXICON` (both sample SKUs and custom user inputs), includes all mapped `INS` additive codes (`INS 621`, `INS 211`, `INS 223`, `INS 102`, `INS 330`, `INS 322`, `INS 202`), renders the complete `Contains:` allergen summary and full local importer street address without truncation, and draws corner die-cut crop marks (`evidence/eval/slice-r2/check-04-remediated-sticker.png`, `evidence/eval/slice-r2/check-04b-australia-sticker.png`, `evidence/eval/slice-r2/check-04c-japan-sticker.png`, `evidence/eval/slice-r2/check-05b-custom-remediated-sticker.png`).
- **Resolved (was P1):** `validateLabelInput()` (`src/App.tsx:47-65`) gates `localStorage` persistence, initial state hydration, `executeInspection()`, `handleApplyFix()`, and `handleApplyAllFixes()`. Typing `-5` or `0` in **Serving (g)** does not overwrite `packport_history_v1` in `localStorage` (reloading restores the valid `20`g serving size), and clicking **Apply All Regulatory Fixes**, **Apply Fix**, or **Run Customs Pre-Flight** with `-5` or `0` immediately shows `"Serving size must be greater than 0g."` and focuses `#serving-size` without generating an invalid sticker (`evidence/eval/slice-r2/edge-02b-bad-serving.png`, `evidence/eval/slice-r2/defect-p1-recheck-reload-serving.png`).
- **Resolved (was P2):** `.nutrition-fieldset` now uses `margin-top: 16px` (`evidence/eval/slice-r2/desktop-full.png`), and `handleClearForm()` synchronizes the right-hand panel header to `2. Customs Proof (Singapore (SFA))` matching the reset left-hand selector (`evidence/eval/slice-r2/edge-01-empty-state.png`).
- **Resolved (was P2):** `src/App.tsx:14` uses `packport_history_v1`, matching `project/spec.md` (`evidence/eval/slice-r2/flow-results.json`).

**Minor P3 polish observations:**
1. **P3 | Long product names (`> 38` chars) in the Export Over-Sticker SVG title bar can touch the right-aligned `Net:` weight badge** | On Example 2 (`Chiang Mai Golden Mango & Coconut Nectar Drink`), `s.productName.slice(0, 42)` renders `Chiang Mai Golden Mango & Coconut Nectar D` at `x="34"` in `18px` `Newsreader`, which slightly touches the `N` of `Net: 330 mL` at `x="486"` (`src/lib/regulatoryEngine.ts:999-1000`). Slicing or wrapping the SVG header title at `34` characters would leave clean breathing room. | `evidence/eval/slice-r2/check-04b-australia-sticker.png`
2. **P3 | `.proof-comparison-grid` stacks the Export Over-Sticker and Redlined Origin Package Proof vertically on wide desktop screens** | While the vertical stack keeps the 520px SVG large and legible, adding a compact jump link or tab toggle between the over-sticker and the redlined origin proof would reduce scrolling on 1440×900 viewports. | `evidence/eval/slice-r2/desktop-full.png`

## Contract checks

- [x] **Check 1 (First-run landing at `1440x900` within 3s, pitch, 3 Example SKU buttons, primary CTA, preloaded Bali Crispy Prawn Sambal dossier, 0 console/network errors):** **PASS** (`loadMs: 2555ms`, pitch visible, 3 Example SKU buttons, `Run Customs Pre-Flight` visible, default `12% — 7 fixes needed before export` & `Hold: Relabel Required` visible, `0` console errors, `0` failed requests) — `evidence/eval/slice-r2/check-01-landing.png`, `evidence/eval/slice-r2/latest.json`
- [x] **Check 2 (Clicking Example 2 Australia FSANZ & Example 3 Japan CAA returns 200 OK from `/api/inspect-label`, populates left form, updates readiness score, Hold stamp, and numbered pins):** **PASS** (`POST /api/inspect-label` returned `200 OK` for both `AU_FSANZ` and `JP_CAA`, populated form inputs, updated market badge, readiness score, `Hold: Relabel Required` stamp, and `5` / `6` numbered pins) — `evidence/eval/slice-r2/check-02-example-australia.png`, `evidence/eval/slice-r2/check-02-example-japan.png`
- [x] **Check 3 (Statutory Findings list displays plain-language severity badge, offending text, destination regulation clause, plain-language port failure explanation, and `Apply Fix` button):** **PASS** (All 7 findings on Example 1 display `Customs Hold (Must Fix)` or `Label Warning (Recommended Fix)`, `Regulation: ...`, `Flagged on origin pack: ...`, explanation, and `Apply Fix`) — `evidence/eval/slice-r2/check-03-statutory-findings.png`
- [x] **Check 4 (Clicking `Apply All Regulatory Fixes` updates the live Print-Ready Export Over-Sticker SVG with inline-bolded allergens, `Contains:` summary line, international INS additive codes, computed `Per 100g / 100mL` column, compliant copy, `100% — Ready to print & ship`, and `Cleared for Export` stamp):** **PASS** (Verified across all 3 Example SKUs: SVG renders `<tspan font-weight="700">` inline allergen bolding, complete `Contains:` allergen summary without truncation, `INS 621`/`INS 211`/`INS 223`/`INS 102`/`INS 330`/`INS 322`/`INS 202` codes, dual `Per Serving` & `Per 100g/100mL` column, complete importer street address, corner crop marks, `100% — Ready to print & ship`, and `Cleared for Export` stamp) — `evidence/eval/slice-r2/check-04a-single-fix.png`, `evidence/eval/slice-r2/check-04-remediated-sticker.png`, `evidence/eval/slice-r2/check-04b-australia-sticker.png`, `evidence/eval/slice-r2/check-04c-japan-sticker.png`
- [x] **Check 5 (Custom edit of Destination Market, Ingredient List, and Total Sugars recalculates per-100g values and refreshes Statutory Findings and SVG):** **PASS** (Editing to `AU_FSANZ`, `Roasted peanuts (65%), coconut sugar, wheat flour, sodium metabisulfite, tartrazine.`, and `12.0`g sugars per `20`g serving recalculated `60 g` sugar per `100g` and dynamically bolded `peanuts`, `wheat flour`, and `Sodium Metabisulphite` with `INS 223` and `INS 102` in the SVG) — `evidence/eval/slice-r2/check-05-custom-edit.png`, `evidence/eval/slice-r2/check-05b-custom-remediated-sticker.png`
- [x] **Check 6 (Clicking `Download Sticker SVG` triggers `.svg` file download and `Copy Customs Dossier` shows confirmation status):** **PASS** (Downloaded `bali-crispy-prawn-candlenut-sambal-au_fsanz.svg` with status banner `"Downloaded compliant over-sticker SVG."` and copied dossier with banner `"Copied customs dossier to clipboard."`) — `evidence/eval/slice-r2/check-06-download-copy.png`, `evidence/eval/slice-r2/check-06b-copied-dossier.png`
- [x] **Check 7 (Mobile `390x844` layout has `scrollWidth <= 390`, tap targets `>= 44px`, readable text sizes, and unclipped SVG viewBox container):** **PASS** (`scrollWidth: 390`, `svgWidth: 334`, `svgFitsViewport: true`, `smallTargets: 0`, `small12Share: 0`, `small14Share: 0`) — `evidence/eval/slice-r2/check-07-mobile-390.png`, `evidence/eval/slice-r2/mobile-full.png`
- [x] **Check 8 (Keyboard-only `Tab` order, visible `:focus-visible` outline `>= 2px`, and `Enter` triggers inspection):** **PASS** (`outline: 3px solid rgb(29, 66, 104)` across all interactive controls in visual reading order; pressing `Enter` on focused Example 2 button triggered inspection and switched market to `AU_FSANZ`) — `evidence/eval/slice-r2/check-08-keyboard-focus.png`
- [x] **Edge Case 1 (`Clear Form` displays empty-state prompt and quick-start buttons):** **PASS** (Renders `"Enter your product's ingredients and nutrition values on the left, or click one of the 3 Example APAC SKUs above to run an instant inspection."` with 3 `Load Example: ...` buttons and synchronizes right-column header to `2. Customs Proof (Singapore (SFA))`) — `evidence/eval/slice-r2/edge-01-empty-state.png`
- [x] **Edge Case 2 (Blank `Ingredient List` or `<= 0` `Serving Size` shows inline error, focuses field, preserves typed work, and blocks invalid `Apply Fix` / `localStorage` persistence):** **PASS** (Blank ingredients shows `"Please enter at least one ingredient on the label."` and focuses `#ingredient-list`; `-5` or `0` in `#serving-size` shows `"Serving size must be greater than 0g."` and focuses `#serving-size` on `Run Customs Pre-Flight`, `Apply All Regulatory Fixes`, and `Apply Fix`, while keeping `20`g in `packport_history_v1` across reload) — `evidence/eval/slice-r2/edge-02a-bad-ingredient.png`, `evidence/eval/slice-r2/edge-02b-bad-serving.png`, `evidence/eval/slice-r2/defect-p1-recheck-reload-serving.png`
- [x] **Edge Case 3 (Simulated upstream error `POST /api/inspect-label?simulateError=1` completes via deterministic statutory engine and shows plain-language notice):** **PASS** (Displays `"Completed inspection using the built-in statutory rule engine so your work is safe (simulated upstream fallback)."` and renders all 7 findings and SVG over-sticker) — `evidence/eval/slice-r2/edge-03-clean-fallback.png`

## Stranger test

Re-verified at `1440x900` and `390x844`:
- **0–5s impression:** *"PackPort is a customs pre-flight label inspector for APAC food exporters that checks product ingredients, nutrition facts, and front-of-pack claims against Singapore (SFA), Australia (FSANZ), and Japan (CAA) regulations and generates a compliant print-ready export over-sticker."*
- **Timeline:**
  - `[+1.2s]` Opened `/`. Immediately saw the ruled masthead (`PackPort`), plain-language one-sentence pitch, three `Instant Demo SKUs` buttons, `1. Source Label` editor on the left (with natural `16px` fieldset spacing), and `2. Customs Proof (Singapore (SFA))` on the right.
  - `[+2.5s]` Inspected the default Bali Crispy Prawn Sambal proof (`12% — 7 fixes needed before export`, `Hold: Relabel Required` stamp, redlined origin proof pins `#1`–`#6`, and 7 itemized statutory findings).
  - `[+4.0s]` Clicked `Apply All Regulatory Fixes (7)`.
  - `[+4.3s]` Observed confirmation banner `"Applied all 7 regulatory fixes — Export over-sticker is now Cleared for Export (100%)."`, green `Cleared for Export` stamp, and the updated `Print-Ready Export Over-Sticker (88 mm × 112 mm)` with bolded allergens (`shrimp`, `Crustacean: Shrimp`, `candlenut`, `Tree Nut: Candlenut`, `soy`, `Soybean, Wheat`), `INS 621` & `INS 211`, complete `Contains: Crustacean (Shrimp / Prawn), Tree Nuts (Candlenut), Soybean.` box, dual-column nutrition panel, and complete Singapore importer address.
- **Hesitations / wrong clicks / confusing labels:** `0` wrong clicks, `0` pauses over 5 seconds, `0` jargon strings (`jargonCount: 0` in `latest.json`).
- **Result:** `PASS`.

## Design review

Reviewed against `design/direction.md` (`civic-ledger` — **Customs House Proof Sheet**):
- **Distinctive & faithful elements:**
  - Warm archival ledger palette (`#FAF7F0` paper surface, `#FFFFFF` proof cards, `#F2ECE1` buff headers, `#141413` carbon ink text, `#C8281E` Customs Vermilion Red primary CTA & hold stamp, `#1D4268` Maritime Manifest Navy badges/pills, and `#1B6B3A` Port Clearance Emerald cleared stamp).
  - Editorial typography (`Newsreader` display serif + `Libre Franklin` UI/body + `Azeret Mono` tabular numbers at `0.42%` character share) with `0%` text below `14px` and `0` low-contrast elements.
  - The die-cut `Print-Ready Export Over-Sticker (88 mm × 112 mm)` now includes corner crop marks (`M12 30 H18 M20 22 V28...`), dynamic multi-line wrapping for ingredients/allergens/importer details, and inline `<tspan font-weight="700">` allergen bolding.
  - The 120px artificial whitespace gap inside `.nutrition-fieldset` from Round 1 is gone (`margin-top: 16px`).
- **Three most generic / improvable visual details:**
  1. Long product titles (`> 38` chars, e.g., Example 2) in the black SVG sticker header bar come right up against `Net: 330 mL` (`evidence/eval/slice-r2/check-04b-australia-sticker.png`).
  2. The `Print-Ready Export Over-Sticker` and `Redlined Origin Package Proof` stack in a single column (`grid-template-columns: 1fr`) rather than offering a side-by-side or tabbed comparison on wide screens.
  3. Form text inputs use standard uniform bordered boxes that could optionally highlight which specific input field corresponds to a hovered violation pin.

## Truth review

- **Example labelling:** All three sample SKUs are explicitly labelled `Example: ...` in the top strip and badged `Example SKU` in the `1. Source Label` header.
- **Real computation & Gemini integration:** `src/lib/regulatoryEngine.ts` computes real per-100g/100mL nutrient scaling, statutory sugar/protein/sodium thresholds, lexicon allergen detection, and INS additive mapping. `server/geminiInspector.ts` integrates `@google/genai` (`gemini-2.5-flash`) with a strict `Type.OBJECT` `responseSchema` and transparently surfaces the fallback notice (`"Completed inspection using the built-in statutory rule engine so your work is safe."`) when `GEMINI_API_KEY` is absent or unreachable.
- **Claims vs. rendered output:** Unlike Round 1, every claim made in the Statutory Findings cards and `Agent 3` trace (inline-bolded allergens, `Contains:` summary statement, `INS 211`/`INS 621` additive codes, dual-column nutrition panel, and local importer street address) is now truthfully and completely rendered inside the exported SVG sticker (`evidence/eval/slice-r2/check-04-remediated-sticker.png`). And `localStorage` now uses `packport_history_v1` as documented in `project/spec.md`.

## Measurements

From `evidence/eval/slice-r2/latest.json` (`scripts/browser/probe.mjs`):
- **Desktop (`1440x900`):** `loadMs: 3839` (`2555ms` in flow check), `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 1440`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `monoShare: 0.0042` (`0.42%`), `upperShare: 0.103`, `jargonCount: 0`, `smallTargets: 0`, `unnamedInteractive: 0`, `imgsNoAlt: 0`, `wordsAboveFold: 150`, `findings: []` (`0 warnings`).
- **Mobile (`390x844`):** `loadMs: 2666`, `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 390`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `smallTargets: 0`, `wordsAboveFold: 70`, `findings: []` (`0 warnings`).

## What to fix first

1. **(Optional P3 polish)** Shorten the SVG header title slice in `buildExportStickerSvgString()` (`src/lib/regulatoryEngine.ts:999`) from `.slice(0, 42)` to `.slice(0, 34)` (or wrap long product names) so long titles like `Chiang Mai Golden Mango & Coconut Nectar Drink` never touch `Net: 330 mL` on the right side of the dark header bar.
2. **(Optional P3 polish)** Consider a compact jump link or side-by-side toggle between `Print-Ready Export Over-Sticker` and `Redlined Origin Package Proof` on wide desktop screens.
3. **(Optional P3 polish)** Highlight the corresponding left-hand form field when hovering a Statutory Finding card.

## Evidence

- `evidence/eval/slice-r2/latest.json`
- `evidence/eval/slice-r2/flow-results.json`
- `evidence/eval/slice-r2/desktop-fold.png`
- `evidence/eval/slice-r2/desktop-full.png`
- `evidence/eval/slice-r2/mobile-fold.png`
- `evidence/eval/slice-r2/mobile-full.png`
- `evidence/eval/slice-r2/stranger-1-loaded.png`
- `evidence/eval/slice-r2/stranger-2-remediated.png`
- `evidence/eval/slice-r2/check-01-landing.png`
- `evidence/eval/slice-r2/check-02-example-australia.png`
- `evidence/eval/slice-r2/check-02-example-japan.png`
- `evidence/eval/slice-r2/check-03-statutory-findings.png`
- `evidence/eval/slice-r2/check-04a-single-fix.png`
- `evidence/eval/slice-r2/check-04-remediated-sticker.png`
- `evidence/eval/slice-r2/check-04b-australia-sticker.png`
- `evidence/eval/slice-r2/check-04c-japan-sticker.png`
- `evidence/eval/slice-r2/check-05-custom-edit.png`
- `evidence/eval/slice-r2/check-05b-custom-remediated-sticker.png`
- `evidence/eval/slice-r2/check-06-download-copy.png`
- `evidence/eval/slice-r2/check-06b-copied-dossier.png`
- `evidence/eval/slice-r2/check-07-mobile-390.png`
- `evidence/eval/slice-r2/check-08-keyboard-focus.png`
- `evidence/eval/slice-r2/edge-01-empty-state.png`
- `evidence/eval/slice-r2/edge-02a-bad-ingredient.png`
- `evidence/eval/slice-r2/edge-02b-bad-serving.png`
- `evidence/eval/slice-r2/edge-03-clean-fallback.png`
- `evidence/eval/slice-r2/defect-p1-recheck-reload-serving.png`
- `evidence/eval/slice-r2/edge-persistence-reload.png`
- `evidence/eval/slice-r2/edge-huge-input-dblclick.png`
