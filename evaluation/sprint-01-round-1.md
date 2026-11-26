# Evaluation: sprint-01 round 1

- contract: sprint-01
- round: 1
- verdict: FAIL
- scores: function=4 clarity=4 design=4 originality=4 craft=3 truth=4
- p0: 0
- p1: 2
- stranger_test: PASS
- builder_model: google-vertex/gemini-4-argon
- evaluator_model: google-vertex/gemini-4-argon

Scores are integers 1-5 using the anchors in `.opencode/skills/browser-verification/references/scoring.md`.
Thresholds: function>=4, clarity>=4, truth>=4, design>=3, originality>=3, craft>=3. PASS only if every threshold is met and p0=p1=0.

## Defects first

1. **P1 | Print-Ready Export Over-Sticker SVG truncates product titles and front-of-pack claims mid-word across all 3 Example SKUs (`Bali Crispy Prawn & Candlenut Samb`, `Saigon Matcha, Roasted Cashew & Se`, `Chiang Mai Golden Mango & Coconut` dropping `Nectar Drink`) and inserts stray spaces inside bolded allergen parentheses** | Open `/` at `1440x900` and inspect the default `Print-Ready Export Over-Sticker (88 mm × 112 mm)` SVG, then click through all 3 Example SKUs and click `Apply All Regulatory Fixes`. In `src/lib/regulatoryEngine.ts:1089`, `s.productName.slice(0, 34)` chops Example 1 (`Bali Crispy Prawn & Candlenut Sambal`, 36 chars) mid-word to `Bali Crispy Prawn & Candlenut Samb`, chops Example 2 (`Chiang Mai Golden Mango & Coconut Nectar Drink`, 46 chars) to `Chiang Mai Golden Mango & Coconut` (dropping `Nectar Drink`), and chops Example 3 (`Saigon Matcha, Roasted Cashew & Sesame Oat Bar`, 46 chars) mid-word to `Saigon Matcha, Roasted Cashew & Se`. On line 1092, `s.compliantClaims[0]?.slice(0, 46)` chops the initial origin/claims line mid-word (`Naturally Low Su`, `Cures Fatigue &`, `Medical Grade Anti-I`). Finally, `wrapRichHtmlToSvgLines()` (`src/lib/regulatoryEngine.ts:960-990`) inserts spaces between `<tspan>` runs inside parentheses: `( Crustacean: Shrimp )`, `( Tree Nut: Candlenut )`, `( Soybean, Wheat )`, and `Sodium Metabisulphite )`. Expected: Wrap the SVG header product title and origin/claims line across 1–2 lines (or size/wrap cleanly at word boundaries without dropping words from the product name) and strip stray spaces adjacent to `(` and `)` in `wrapRichHtmlToSvgLines()`. | `evidence/eval/sprint-01-r1/desktop-fold.png`, `evidence/eval/sprint-01-r1/svg-audit-ex1-remediated.png`, `evidence/eval/sprint-01-r1/svg-audit-ex2-remediated.png`, `evidence/eval/sprint-01-r1/svg-audit-ex3-remediated.png`
2. **P1 | Multi-Corridor Readiness Comparison table displays identical `12%` scores, identical critical/warning counts, and identical top blocker text across Singapore (SFA), Australia (FSANZ), and Japan (CAA) for every SKU, and clicking `Inspect Corridor` wipes out applied regulatory fixes** | Open `/`, scroll to `Multi-Corridor Readiness Comparison (Singapore SFA vs. Australia FSANZ vs. Japan CAA)`: all three corridors (`Singapore (SFA)`, `Australia (FSANZ)`, `Japan (CAA)`) display the exact same `12% (5 critical, 2 warning)` and `Top finding: Prohibited disease-prevention or therapeutic claim on front of pack` (and likewise identical scores/counts across all 3 corridors on Examples 2 and 3). Then click `Apply All Regulatory Fixes (7)` on `Singapore (SFA)` (`Singapore (SFA)` becomes `100%`, while `Australia (FSANZ)` and `Japan (CAA)` stay at `12%` even though the same 7 underlying `finding.id` issues were remediated), and click `Inspect Corridor` on `Australia (FSANZ)`: `handleSwitchCorridor()` (`src/App.tsx:324`) calls `setResolvedIds([])`, erasing all 7 applied fixes so switching back to `Singapore (SFA)` reverts it from `100% Cleared for Export` back to `12% Hold: Relabel Required`. Expected: Differentiate corridor-specific statutory findings/thresholds and top blocker summaries across `SG_SFA`, `AU_FSANZ`, and `JP_CAA` (e.g., Japan CAA high-protein `>=16.2g/100g` vs `10.0g/100g`, Australia FSANZ PEAL `"May contain nuts and dairy"` & mandatory `kJ` column, Singapore SFA local importer / Nutri-Grade beverage rules, and un-clamped or distinct corridor scores), and preserve `resolvedIds` when switching corridors via `Inspect Corridor` (or pass `resolvedIds` into `computeMultiCorridorComparison` so remediations carry across shared findings while highlighting any remaining corridor-specific gap). | `evidence/eval/sprint-01-r1/check-01-corridor-matrix.png`, `evidence/eval/sprint-01-r1/check-03-corridor-after-fixes.png`
3. **P2 | `Sticker Focus` / `Side-by-Side Proof` toggle is buried inside the second proof card below the fold and is a visual no-op on mobile/tablet (`<= 980px`)** | Open `/` at `1440x900`: `.proof-view-bar` (`Sticker Focus` / `Side-by-Side Proof`) is rendered inside `.origin-proof-card` (`Redlined Origin Package Proof`, `src/App.tsx:900-935`) below the 620px-tall SVG sticker (`y ≈ 1150px`), invisible above the fold. When clicked on desktop (`evidence/eval/sprint-01-r1/check-04b-side-by-side-proof.png`), the toggle sits cramped inside the right-hand 345px column header. When clicked on mobile (`390x844`, `evidence/eval/sprint-01-r1/check-06a-mobile-proof-toggle.png`), the `Side-by-Side Proof` button highlights as active navy (`#1D4268`), but `@media (max-width: 980px)` forces `grid-template-columns: 1fr` so nothing on screen changes. Expected: Place the `Sticker Focus` / `Side-by-Side Proof` toggle bar above `.proof-comparison-grid` (next to the section header), and on `< 980px` viewports either hide the desktop-only side-by-side layout toggle or make it switch which panel (`Print-Ready Export Over-Sticker` vs `Redlined Origin Package Proof`) is shown first. | `evidence/eval/sprint-01-r1/desktop-fold.png`, `evidence/eval/sprint-01-r1/check-04b-side-by-side-proof.png`, `evidence/eval/sprint-01-r1/check-06a-mobile-proof-toggle.png`

## Contract checks

- [x] **Check 1 (Multi-Corridor Readiness Comparison table lists all 3 APAC corridors with computed score, verdict, critical/warning counts, top statutory blocker summary, and `Inspect Corridor` / `Active Corridor` badge):** **PASS** (Renders all 3 rows with required fields; note P1 defect on identical `12%` scores/counts across corridors before remediation) — `evidence/eval/sprint-01-r1/check-01-corridor-matrix.png`
- [x] **Check 2 (Clicking `Inspect Corridor` on `Australia (FSANZ)` or `Japan (CAA)` updates left Destination Market selector, switches right dossier findings and SVG over-sticker, and moves `Active Corridor` badge):** **PASS** (`leftMarketAfterAuInspect: "AU_FSANZ"`, `rightHeadingAfterAuInspect: "2. Customs Proof (Australia (FSANZ))"`, `auRowActive: true`, and likewise for `JP_CAA`; note P1 defect on resetting `resolvedIds`) — `evidence/eval/sprint-01-r1/check-02a-inspect-australia.png`, `evidence/eval/sprint-01-r1/check-02b-inspect-japan.png`
- [x] **Check 3 (Clicking `Apply All Regulatory Fixes` updates active corridor's row in Multi-Corridor Readiness Comparison table to `100%` and `Cleared for Export`):** **PASS** (`Singapore (SFA)` row updates to `Cleared for Export` and `100% (0 critical, 0 warning)`) — `evidence/eval/sprint-01-r1/check-03-corridor-after-fixes.png`
- [x] **Check 4 (Clicking `Side-by-Side Proof` / `Sticker Focus` on desktop `1440x900` switches `.proof-comparison-grid` between two-column `345px 345px` and single-column `714px` layout with 0 console errors and 0 horizontal overflow):** **PASS** (`gridTemplateColumns: "345px 345px"` vs `"714px"`, `scrollWidth: 1440`, `consoleErrors: 0`; note P2 defect on toggle placement and mobile behavior) — `evidence/eval/sprint-01-r1/check-04a-sticker-focus.png`, `evidence/eval/sprint-01-r1/check-04b-side-by-side-proof.png`
- [x] **Check 5 (Clicking `Download Customs Report (.txt)` downloads a `.txt` report containing product name, corridor, readiness score, per-100g/100mL nutrient table, itemized statutory findings, and compliant over-sticker copy, and shows `"Downloaded customs inspection report (.txt)."`):** **PASS** (Downloaded `bali-crispy-prawn-candlenut-sambal-sg_sfa-report.txt`, 4,872 bytes, containing all required sections and full untruncated product name) — `evidence/eval/sprint-01-r1/check-05-download-report-txt.png`, `evidence/eval/sprint-01-r1/downloaded-customs-report.txt`
- [x] **Check 6 (Mobile `390x844` `scrollWidth <= 390`, tap targets `>= 44px`, and keyboard-only `Tab`/`Enter` navigation with visible `:focus-visible` outline):** **PASS** (`scrollWidth: 390`, button heights `44px–46px`, `:focus-visible` outline `3px solid rgb(29, 66, 104)`, `Enter` on focused `Inspect Corridor` switches corridor to `AU_FSANZ`) — `evidence/eval/sprint-01-r1/check-06a-mobile-proof-toggle.png`, `evidence/eval/sprint-01-r1/check-06b-mobile-corridor-matrix.png`, `evidence/eval/sprint-01-r1/check-06c-keyboard-focus-corridor.png`
- [x] **Edge Case 1 (`Clear Form` hides Multi-Corridor Readiness Comparison table and proof panels, shows empty-state prompt, and restores cleanly when an Example SKU is loaded):** **PASS** (`matrixCountWhenCleared: 0`, `emptyStateVisible: true`, `matrixVisibleAfterReloadSku: true`) — `evidence/eval/sprint-01-r1/edge-01-clear-form-hides-matrix.png`, `evidence/eval/sprint-01-r1/edge-01b-matrix-restored.png`
- [x] **Edge Case 2 (Invalid serving size `<= 0` or empty `Ingredient List` when clicking `Inspect Corridor` or `Download Customs Report (.txt)` blocks action, displays inline validation error, focuses invalid input, and preserves typed fields):** **PASS** (Tested `-5` and `0` in `#serving-size` and blank `#ingredient-list` against both `Inspect Corridor` and `Download Customs Report (.txt)`; inline error shown and focus moved to `#serving-size` / `#ingredient-list`) — `evidence/eval/sprint-01-r1/edge-02a-invalid-serving-inspect-corridor.png`, `evidence/eval/sprint-01-r1/edge-02b-invalid-serving-download-report.png`, `evidence/eval/sprint-01-r1/edge-02c-empty-ingredient-inspect-corridor.png`
- [x] **Regression on `contracts/slice.md` (First-run load, 3 Example SKUs, custom edit, SVG download, clipboard copy, simulated upstream fallback `?simulateError=1`, reload persistence, huge input + double click):** **PASS** (`loadMs: 2224ms`, all slice checks pass without regression except the SVG header `.slice(0, 34)` truncation noted in P1 #1) — `evidence/eval/sprint-01-r1/slice-reg-fallback.png`, `evidence/eval/sprint-01-r1/slice-reg-huge-input.png`, `evidence/eval/sprint-01-r1/flow-results.json`

## Stranger test

Performed at `1440x900` and `390x844` before inspecting source code:
- **0–5s impression:** *"PackPort is a customs pre-flight inspection workbench for APAC food exporters that checks product labels against Singapore (SFA), Australia (FSANZ), and Japan (CAA) rules and generates a compliant print-ready export over-sticker."*
- **Timeline:**
  - `[+1.5s]` Landed on `/`. Saw the ruled masthead, plain-language pitch, three `Instant Demo SKUs` buttons, `1. Source Label` editor on the left, and `2. Customs Proof (Singapore (SFA))` on the right (`evidence/eval/sprint-01-r1/stranger-1-landing.png`).
  - `[+3.0s]` Immediately noticed that the black header of the `Print-Ready Export Over-Sticker (88 mm × 112 mm)` cut off the product name mid-word as `Bali Crispy Prawn & Candlenut Samb` and the blue subtitle cut off mid-word as `Naturally Low Su` (`evidence/eval/sprint-01-r1/desktop-fold.png`).
  - `[+8.0s]` Scrolled down to `Multi-Corridor Readiness Comparison (Singapore SFA vs. Australia FSANZ vs. Japan CAA)`. Hesitated for ~4 seconds because all three countries (`Singapore (SFA)`, `Australia (FSANZ)`, `Japan (CAA)`) showed the exact same `12% (5 critical, 2 warning)` and the exact same `Top finding: Prohibited disease-prevention or therapeutic claim on front of pack` (`evidence/eval/sprint-01-r1/check-01-corridor-matrix.png`).
  - `[+13.0s]` Clicked `Apply All Regulatory Fixes (7)` and then clicked `Download Customs Report (.txt)`, receiving the `.txt` report and `Cleared for Export (100%)` stamp in under 20 seconds total.
- **Result:** `PASS` (completed core task in under 2 minutes with 1 hesitation on the identical multi-corridor rows, though the P1 defects found during the walkthrough must be fixed).

## Design review

Reviewed against `design/direction.md` (`civic-ledger` — **Customs House Proof Sheet**):
- **What works well:**
  - The warm customs ledger palette (`#FAF7F0` paper surface, `#FFFFFF` cards, `#F2ECE1` headers, `#141413` carbon ink, `#C8281E` Customs Vermilion Red CTA & hold stamp, `#1D4268` Maritime Manifest Navy badges, `#1B6B3A` Port Clearance Emerald cleared stamp) is cohesive and high-contrast (`0` contrast warnings in `latest.json`).
  - Typography (`Newsreader` + `Libre Franklin` + `Azeret Mono` at `1.35%` character share) has zero text below `14px`.
- **Three most generic / flawed visual details:**
  1. **Mid-word character slicing inside the SVG over-sticker (`s.productName.slice(0, 34)` and `s.compliantClaims[0]?.slice(0, 46)`):** Chopping words in half (`"Samb"`, `"& Se"`, `"Low Su"`) on a "Print-Ready Export Over-Sticker" undermines the physical artifact's credibility (`evidence/eval/sprint-01-r1/desktop-fold.png`).
  2. **Buried `Sticker Focus` / `Side-by-Side Proof` toggle:** Putting the layout toggle inside the second proof card below the 620px SVG sticker hides it from desktop users and makes the right column header cramped in `Side-by-Side Proof` mode (`evidence/eval/sprint-01-r1/check-04b-side-by-side-proof.png`).
  3. **Identical rows in `Multi-Corridor Readiness Comparison`:** Showing three stacked cards with identical `12% (5 critical, 2 warning)` and identical `Top finding` text looks like templated repetition rather than a forensic multi-country comparison (`evidence/eval/sprint-01-r1/check-01-corridor-matrix.png`).

## Truth review

- **Example labelling:** All 3 sample SKUs are clearly labelled `Example: ...` in the top strip and badged `Example SKU` in `1. Source Label`.
- **Downloaded `.txt` report:** `buildCustomsReportText()` (`evidence/eval/sprint-01-r1/downloaded-customs-report.txt`) truthfully outputs the full product name, statutory framework, per-serving and per-100g/100mL nutrition basis, itemized findings with statutory citations, and over-sticker copy.
- **Multi-corridor comparison fidelity:** While `computeMultiCorridorComparison()` calls `inspectLabelDeterministic()` for each market, `inspectLabelDeterministic()` currently applies identical boolean conditions for all 3 markets on the sample SKUs (for instance, line 560 checks `per100.proteinG < 10.0` even when `market === 'JP_CAA'` where the citation itself states `>= 16.2g/100g`, and Japan CAA / Australia FSANZ / Singapore SFA all produce the exact same finding count and clamped `12%` score). Making the corridor rules and top-blocker descriptions reflect each market's distinct statutory rules will make the comparison genuinely informative.

## Measurements

From `evidence/eval/sprint-01-r1/latest.json` (`scripts/browser/probe.mjs`):
- **Desktop (`1440x900`):** `loadMs: 3210` (`2224ms` in flow check), `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 1440`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `monoShare: 0.0135` (`1.35%`), `upperShare: 0.104`, `jargonCount: 0`, `smallTargets: 0`, `unnamedInteractive: 0`, `imgsNoAlt: 0`, `wordsAboveFold: 149`, `findings: []` (`0 warnings`).
- **Mobile (`390x844`):** `loadMs: 2611`, `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 390`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `smallTargets: 0`, `wordsAboveFold: 69`, `findings: []` (`0 warnings`).

## What to fix first

1. **Fix mid-word truncation and parenthesis spacing in `buildExportStickerSvgString()` (`src/lib/regulatoryEngine.ts:960-1095`):** Wrap `s.productName` across 1–2 lines in the dark header bar (using `wrapPlainLines(s.productName, 36)` and expanding the header rect height when 2 lines are needed) and wrap the blue `originLine • compliantClaims` line across 1–2 lines instead of slicing at `.slice(0, 34)` / `.slice(0, 46)` so `"Bali Crispy Prawn & Candlenut Sambal"`, `"Chiang Mai Golden Mango & Coconut Nectar Drink"`, and `"Saigon Matcha, Roasted Cashew & Sesame Oat Bar"` render completely without mid-word cutoffs. Also fix `wrapRichHtmlToSvgLines()` so `<tspan>` runs do not insert spaces inside parentheses (`(Crustacean: Shrimp)` instead of `( Crustacean: Shrimp )`).
2. **Differentiate corridors in `computeMultiCorridorComparison()` / `inspectLabelDeterministic()` and preserve `resolvedIds` when switching corridors (`src/lib/regulatoryEngine.ts:466-904`, `src/App.tsx:312-332`):**
   - Pass `resolvedIds` into `computeMultiCorridorComparison()` for all corridors (or keep `resolvedIds` when `handleSwitchCorridor()` is clicked instead of resetting `setResolvedIds([])`) so applying fixes doesn't get wiped out when inspecting another corridor.
   - Ensure each corridor (`SG_SFA`, `AU_FSANZ`, `JP_CAA`) evaluates and surfaces its distinct statutory requirements, readiness scores, and corridor-specific `topBlocker` text (e.g., Japan CAA's `>=16.2g/100g` high-protein threshold & mandatory Salt Equivalent / Japanese additive rules, Australia FSANZ's PEAL summary box & mandatory `kJ` energy column, Singapore SFA's Nutri-Grade / Eighth Schedule sugar cap & local importer rules, and adjust the score formula/floor so 5 vs 6 vs 7 findings produce distinct readiness percentages across corridors rather than clamping all of them to `12%`).
3. **Move `.proof-view-bar` (`Sticker Focus` / `Side-by-Side Proof`) above `.proof-comparison-grid` and handle `< 980px` mobile viewports (`src/App.tsx:875-935`, `src/styles.css:739-747`):** Render the `Sticker Focus` / `Side-by-Side Proof` toggle bar in a shared header row above `.proof-comparison-grid` so it is immediately visible above the sticker, and on `< 980px` screens either hide the desktop side-by-side toggle or make it swap/tab between the sticker and redlined origin proof so tapping it on mobile is never a no-op.

## Evidence

- `evidence/eval/sprint-01-r1/latest.json`
- `evidence/eval/sprint-01-r1/flow-results.json`
- `evidence/eval/sprint-01-r1/desktop-fold.png`
- `evidence/eval/sprint-01-r1/desktop-full.png`
- `evidence/eval/sprint-01-r1/mobile-fold.png`
- `evidence/eval/sprint-01-r1/mobile-full.png`
- `evidence/eval/sprint-01-r1/stranger-1-landing.png`
- `evidence/eval/sprint-01-r1/check-01-corridor-matrix.png`
- `evidence/eval/sprint-01-r1/check-02a-inspect-australia.png`
- `evidence/eval/sprint-01-r1/check-02b-inspect-japan.png`
- `evidence/eval/sprint-01-r1/check-03-corridor-after-fixes.png`
- `evidence/eval/sprint-01-r1/check-04a-sticker-focus.png`
- `evidence/eval/sprint-01-r1/check-04b-side-by-side-proof.png`
- `evidence/eval/sprint-01-r1/check-05-download-report-txt.png`
- `evidence/eval/sprint-01-r1/downloaded-customs-report.txt`
- `evidence/eval/sprint-01-r1/check-06a-mobile-proof-toggle.png`
- `evidence/eval/sprint-01-r1/check-06b-mobile-corridor-matrix.png`
- `evidence/eval/sprint-01-r1/check-06c-keyboard-focus-corridor.png`
- `evidence/eval/sprint-01-r1/edge-01-clear-form-hides-matrix.png`
- `evidence/eval/sprint-01-r1/edge-01b-matrix-restored.png`
- `evidence/eval/sprint-01-r1/edge-02a-invalid-serving-inspect-corridor.png`
- `evidence/eval/sprint-01-r1/edge-02b-invalid-serving-download-report.png`
- `evidence/eval/sprint-01-r1/edge-02c-empty-ingredient-inspect-corridor.png`
- `evidence/eval/sprint-01-r1/svg-audit-ex1-remediated.png`
- `evidence/eval/sprint-01-r1/svg-audit-ex2-remediated.png`
- `evidence/eval/sprint-01-r1/svg-audit-ex3-remediated.png`
- `evidence/eval/sprint-01-r1/slice-reg-fallback.png`
- `evidence/eval/sprint-01-r1/slice-reg-huge-input.png`
