# Evaluation: sprint-01 round 2

- contract: sprint-01
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

No P0, P1, or P2 defects found in Round 2. All 3 defects reported in `evaluation/sprint-01-round-1.md` have been verified as resolved:

1. **Resolved (was P1) | Print-Ready Export Over-Sticker SVG wraps product titles and front-of-pack claims across 1–3 lines without mid-word truncation across all 3 Example SKUs and eliminates stray spaces inside allergen parentheses** — Verified across all 3 Example SKUs (`Bali Crispy Prawn & Candlenut Sambal`, `Chiang Mai Golden Mango & Coconut Nectar Drink`, `Saigon Matcha, Roasted Cashew & Sesame Oat Bar`) before and after clicking `Apply All Regulatory Fixes`. Long product names wrap cleanly onto 2 lines inside an expanded header bar (`Chiang Mai Golden Mango & Coconut` / `Nectar Drink` and `Saigon Matcha, Roasted Cashew &` / `Sesame Oat Bar`), origin/claims lines wrap across up to 3 lines without mid-word cutoffs, and `wrapRichHtmlToSvgLines()` renders `(Crustacean: Shrimp)`, `(Tree Nut: Candlenut)`, and `(Soybean, Wheat)` with zero stray spaces inside parentheses (`evidence/eval/sprint-01-r2/svg-audit-ex1-remediated.png`, `evidence/eval/sprint-01-r2/svg-audit-ex2-remediated.png`, `evidence/eval/sprint-01-r2/svg-audit-ex3-remediated.png`).
2. **Resolved (was P1) | Multi-Corridor Readiness Comparison displays distinct readiness scores (`%`), distinct critical/warning counts, and corridor-specific `Top finding` summaries across `Singapore (SFA)`, `Australia (FSANZ)`, and `Japan (CAA)`, and preserves `resolvedIds` when switching corridors via `Inspect Corridor`** — Verified across all 3 Example SKUs (`16% (5 critical, 2 warning)` for `Singapore (SFA)`, `14% (6 critical, 1 warning)` for `Australia (FSANZ)`, `22% (6 critical, 1 warning)` for `Japan (CAA)` on Example 1; `16%`, `19%`, `22%` on Example 2; `16%`, `14%`, `22%` on Example 3, each with corridor-specific top findings such as Singapore Nutri-Grade Grade C, Australia FSANZ PEAL generic `"nuts"`/`"dairy"` prohibition, and Japan CAA `"Yellow No. 4 (黄色4号)"` / `>= 16.2g / 100g` high-protein rule). Clicking `Apply All Regulatory Fixes` and then clicking `Inspect Corridor` on `Australia (FSANZ)` and back to `Singapore (SFA)` preserves all applied fixes (`100% Cleared for Export`) instead of wiping `resolvedIds` (`evidence/eval/sprint-01-r2/check-01-corridor-matrix.png`, `evidence/eval/sprint-01-r2/check-03-corridor-after-fixes.png`, `evidence/eval/sprint-01-r2/check-03b-preserve-fixes-across-corridors.png`).
3. **Resolved (was P2) | `Sticker Focus` / `Side-by-Side Proof` toggle sits above `.proof-comparison-grid` above the fold on desktop and brings `Redlined Origin Package Proof` to the top (`order: -1`) when tapped on `< 980px` mobile viewports** — Verified on desktop (`1440x900`: `.proof-view-bar` sits at `y: 428–472px` directly above `.proof-comparison-grid` at `y: 493px`) and on mobile (`390x844`: tapping `Side-by-Side Proof` applies `order: -1` to `.origin-proof-card`, moving `Redlined Origin Package Proof` above `Print-Ready Export Over-Sticker` at `y: 465px` vs `y: 1161px`) (`evidence/eval/sprint-01-r2/desktop-fold.png`, `evidence/eval/sprint-01-r2/check-04a-sticker-focus.png`, `evidence/eval/sprint-01-r2/check-04b-side-by-side-proof.png`, `evidence/eval/sprint-01-r2/check-06a-mobile-proof-toggle.png`).

## Contract checks

- [x] **Check 1 (Multi-Corridor Readiness Comparison table lists all 3 APAC corridors with computed score, verdict, critical/warning counts, top statutory blocker summary, and `Inspect Corridor` / `Active Corridor` badge):** **PASS** (All 3 rows render with distinct scores `16%`, `14%`, `22%`, distinct critical/warning counts, and corridor-specific `Top finding` summaries) — `evidence/eval/sprint-01-r2/check-01-corridor-matrix.png`
- [x] **Check 2 (Clicking `Inspect Corridor` on `Australia (FSANZ)` or `Japan (CAA)` updates left Destination Market selector, switches right dossier findings and SVG over-sticker, and moves `Active Corridor` badge):** **PASS** (`leftMarketAfterAuInspect: "AU_FSANZ"`, `rightHeadingAfterAuInspect: "2. Customs Proof (Australia (FSANZ))"`, `auRowActive: true`, and likewise for `JP_CAA`) — `evidence/eval/sprint-01-r2/check-02a-inspect-australia.png`, `evidence/eval/sprint-01-r2/check-02b-inspect-japan.png`
- [x] **Check 3 (Clicking `Apply All Regulatory Fixes` updates active corridor's row in Multi-Corridor Readiness Comparison table to `100%` and `Cleared for Export`, and preserves fixes across corridor switches):** **PASS** (`Singapore (SFA)` updates to `100% (0 critical, 0 warning)` and `Cleared for Export`, and switching via `Inspect Corridor` preserves applied fixes) — `evidence/eval/sprint-01-r2/check-03-corridor-after-fixes.png`, `evidence/eval/sprint-01-r2/check-03b-preserve-fixes-across-corridors.png`
- [x] **Check 4 (Clicking `Side-by-Side Proof` / `Sticker Focus` on desktop `1440x900` switches `.proof-comparison-grid` between two-column `345px 345px` and single-column `714px` layout with 0 console errors and 0 horizontal overflow):** **PASS** (`isAboveGrid: true`, `gridTemplateColumns: "345px 345px"` vs `"714px"`, `scrollWidth: 1440`, `consoleErrors: 0`) — `evidence/eval/sprint-01-r2/check-04a-sticker-focus.png`, `evidence/eval/sprint-01-r2/check-04b-side-by-side-proof.png`
- [x] **Check 5 (Clicking `Download Customs Report (.txt)` downloads a `.txt` report containing product name, corridor, readiness score, per-100g/100mL nutrient table, itemized statutory findings, and compliant over-sticker copy, and shows `"Downloaded customs inspection report (.txt)."`):** **PASS** (Downloaded `bali-crispy-prawn-candlenut-sambal-sg_sfa-report.txt`, 4,889 bytes, containing all required sections) — `evidence/eval/sprint-01-r2/check-05-download-report-txt.png`, `evidence/eval/sprint-01-r2/downloaded-customs-report.txt`
- [x] **Check 6 (Mobile `390x844` `scrollWidth <= 390`, tap targets `>= 44px`, mobile proof toggle brings `Redlined Origin Package Proof` to top, and keyboard-only `Tab`/`Enter` navigation with visible `:focus-visible` outline):** **PASS** (`scrollWidth: 390`, button heights `44px–46px`, `originOrder: "-1"` on mobile `Side-by-Side Proof`, `:focus-visible` outline `3px solid rgb(29, 66, 104)`, `Enter` on focused `Inspect Corridor` switches corridor to `AU_FSANZ`) — `evidence/eval/sprint-01-r2/check-06a-mobile-proof-toggle.png`, `evidence/eval/sprint-01-r2/check-06b-mobile-corridor-matrix.png`, `evidence/eval/sprint-01-r2/check-06c-keyboard-focus-corridor.png`
- [x] **Edge Case 1 (`Clear Form` hides Multi-Corridor Readiness Comparison table and proof panels, shows empty-state prompt, and restores cleanly when an Example SKU is loaded):** **PASS** (`matrixCountWhenCleared: 0`, `emptyStateVisible: true`, `matrixVisibleAfterReloadSku: true`) — `evidence/eval/sprint-01-r2/edge-01-clear-form-hides-matrix.png`, `evidence/eval/sprint-01-r2/edge-01b-matrix-restored.png`
- [x] **Edge Case 2 (Invalid serving size `<= 0` or empty `Ingredient List` when clicking `Inspect Corridor` or `Download Customs Report (.txt)` blocks action, displays inline validation error, focuses invalid input, and preserves typed fields):** **PASS** (Tested `-5` and `0` in `#serving-size` and blank `#ingredient-list` against both `Inspect Corridor` and `Download Customs Report (.txt)`; inline error shown and focus moved to `#serving-size` / `#ingredient-list`) — `evidence/eval/sprint-01-r2/edge-02a-invalid-serving-inspect-corridor.png`, `evidence/eval/sprint-01-r2/edge-02b-invalid-serving-download-report.png`, `evidence/eval/sprint-01-r2/edge-02c-empty-ingredient-inspect-corridor.png`
- [x] **Regression on `contracts/slice.md` (First-run load `1612ms`, 3 Example SKUs, custom edit, SVG download, clipboard copy, simulated upstream fallback `?simulateError=1`, reload persistence, huge input + double click):** **PASS** (All checks pass with zero console errors and zero failed requests) — `evidence/eval/sprint-01-r2/slice-reg-fallback.png`, `evidence/eval/sprint-01-r2/slice-reg-huge-input.png`, `evidence/eval/sprint-01-r2/flow-results.json`

## Stranger test

Performed at `1440x900` and `390x844`:
- **0–5s impression:** *"PackPort is a customs pre-flight inspection workbench for APAC food exporters that checks product labels against Singapore (SFA), Australia (FSANZ), and Japan (CAA) rules and generates a compliant print-ready export over-sticker."*
- **Timeline:**
  - `[+1.5s]` Landed on `/`. Saw the ruled masthead, plain-language pitch, three `Demo SKUs` buttons, `1. Source Label` editor on the left, and `2. Customs Proof (Singapore (SFA))` on the right (`evidence/eval/sprint-01-r2/stranger-1-landing.png`).
  - `[+3.5s]` Inspected the `Print-Ready Export Over-Sticker (88×112 mm)` above the fold: the full product title (`Bali Crispy Prawn & Candlenut Sambal`) and multi-line origin/claims header are legible with the `Sticker Focus` / `Side-by-Side Proof` toggle immediately visible at the top right of the proof section (`evidence/eval/sprint-01-r2/desktop-fold.png`).
  - `[+8.0s]` Scrolled to `Multi-Corridor Readiness Comparison (Singapore SFA vs. Australia FSANZ vs. Japan CAA)` and saw distinct readiness scores and corridor-specific top blockers (`16%` Singapore SFA therapeutic claim hold, `14%` Australia FSANZ allergen declaration hold, `22%` Japan CAA per-100g & Salt Equivalent `食塩相当量` hold) (`evidence/eval/sprint-01-r2/check-01-corridor-matrix.png`).
  - `[+14.0s]` Clicked `Apply All Regulatory Fixes (7)`, verified `100% — Ready to print & ship` across corridors, and clicked `Download Customs Report (.txt)` (`evidence/eval/sprint-01-r2/check-03-corridor-after-fixes.png`, `evidence/eval/sprint-01-r2/check-05-download-report-txt.png`).
- **Result:** `PASS` (zero hesitations, zero wrong clicks, completed in under 20 seconds on both desktop and mobile).

## Design review

Reviewed against `design/direction.md` (`civic-ledger` — **Customs House Proof Sheet**):
- **What is distinctive and well-crafted:**
  - The warm customs ledger palette (`#FAF7F0` paper surface, `#FFFFFF` cards, `#F2ECE1` headers, `#141413` carbon ink, `#C8281E` Customs Vermilion Red primary CTA & hold stamp, `#1D4268` Maritime Manifest Navy badges, `#1B6B3A` Port Clearance Emerald cleared stamp) is cohesive and passes every contrast check (`0` contrast warnings in `latest.json`).
  - Placing `.proof-view-bar` (`Sticker Focus` / `Side-by-Side Proof`) directly in the `Print-Ready Export Over-Sticker (88×112 mm)` header row keeps both the sticker proof and the side-by-side comparison discoverable above the fold on desktop and functional on mobile (`390x844`).
  - The dynamic multi-line header and claim wrapping in `buildExportStickerSvgString()` makes the die-cut `88 mm × 112 mm` over-sticker look like a genuine customs label proof across all 3 APAC SKUs.
- **Three most generic visual details (non-blocking polish notes):**
  1. Left-column text inputs (`#product-name`, `#front-of-pack-claims`, `#local-importer-address`) are single-line `<input type="text">` controls that visually clip long values inside the form column even though the full string is preserved and rendered in the right-hand proof.
  2. The `Multi-Corridor Readiness Comparison` cards use a stacked full-width horizontal row layout rather than a compact 3-column tabular ledger grid on desktop.
  3. The expandable verification footer (`How Google Gemini & Statutory Rules Checked This Label`) uses uniform white sub-cards without visual timeline connectors between Agent 1, Agent 2, and Agent 3.

## Truth review

- **Example labelling:** All 3 sample SKUs are clearly labelled `Example: ...` in the top strip and badged `Example SKU` in `1. Source Label`.
- **Multi-corridor statutory differentiation:** Each corridor (`SG_SFA`, `AU_FSANZ`, `JP_CAA`) runs corridor-specific statutory checks and surfaces accurate regulatory citations (`Singapore SFA Nutri-Grade Grade C`, `FSANZ Standard 1.2.3 PEAL` generic `"nuts"`/`"dairy"` prohibition, `Japan CAA` `Yellow No. 4 (黄色4号)` tar-dye disclosure and `>= 16.2g / 100g` high-protein threshold).
- **Downloaded `.txt` report:** `buildCustomsReportText()` (`evidence/eval/sprint-01-r2/downloaded-customs-report.txt`) truthfully outputs the full product name, statutory framework, per-serving and per-100g/100mL nutrition basis, itemized findings with statutory citations, and over-sticker copy.

## Measurements

From `evidence/eval/sprint-01-r2/latest.json` (`scripts/browser/probe.mjs`):
- **Desktop (`1440x900`):** `loadMs: 2626` (`1612ms` in flow check), `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 1440`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `monoShare: 0.0135` (`1.35%`), `upperShare: 0.108`, `jargonCount: 0`, `smallTargets: 0`, `unnamedInteractive: 0`, `imgsNoAlt: 0`, `wordsAboveFold: 149`, `findings: []` (`0 warnings`).
- **Mobile (`390x844`):** `loadMs: 2718`, `consoleErrors: 0`, `badRequests: 0`, `overflowX: false` (`scrollWidth: 390`), `small12Share: 0`, `small14Share: 0`, `lowContrastShare: 0`, `smallTargets: 0`, `wordsAboveFold: 67`, `findings: []` (`0 warnings`).

## What to fix first

No blocking defects remain for `sprint-01`. Optional polish for future stages:
1. Consider making `#front-of-pack-claims` and `#local-importer-address` auto-wrapping `<textarea rows={2}>` inputs so long claims and importer street addresses don't clip horizontally inside the left-hand form inputs.

## Evidence

- `evidence/eval/sprint-01-r2/latest.json`
- `evidence/eval/sprint-01-r2/flow-results.json`
- `evidence/eval/sprint-01-r2/desktop-fold.png`
- `evidence/eval/sprint-01-r2/desktop-full.png`
- `evidence/eval/sprint-01-r2/mobile-fold.png`
- `evidence/eval/sprint-01-r2/mobile-full.png`
- `evidence/eval/sprint-01-r2/stranger-1-landing.png`
- `evidence/eval/sprint-01-r2/check-01-corridor-matrix.png`
- `evidence/eval/sprint-01-r2/check-02a-inspect-australia.png`
- `evidence/eval/sprint-01-r2/check-02b-inspect-japan.png`
- `evidence/eval/sprint-01-r2/check-03-corridor-after-fixes.png`
- `evidence/eval/sprint-01-r2/check-03b-preserve-fixes-across-corridors.png`
- `evidence/eval/sprint-01-r2/check-04a-sticker-focus.png`
- `evidence/eval/sprint-01-r2/check-04b-side-by-side-proof.png`
- `evidence/eval/sprint-01-r2/check-05-download-report-txt.png`
- `evidence/eval/sprint-01-r2/downloaded-customs-report.txt`
- `evidence/eval/sprint-01-r2/check-06a-mobile-proof-toggle.png`
- `evidence/eval/sprint-01-r2/check-06b-mobile-corridor-matrix.png`
- `evidence/eval/sprint-01-r2/check-06c-keyboard-focus-corridor.png`
- `evidence/eval/sprint-01-r2/edge-01-clear-form-hides-matrix.png`
- `evidence/eval/sprint-01-r2/edge-01b-matrix-restored.png`
- `evidence/eval/sprint-01-r2/edge-02a-invalid-serving-inspect-corridor.png`
- `evidence/eval/sprint-01-r2/edge-02b-invalid-serving-download-report.png`
- `evidence/eval/sprint-01-r2/edge-02c-empty-ingredient-inspect-corridor.png`
- `evidence/eval/sprint-01-r2/svg-audit-ex1-remediated.png`
- `evidence/eval/sprint-01-r2/svg-audit-ex2-remediated.png`
- `evidence/eval/sprint-01-r2/svg-audit-ex3-remediated.png`
- `evidence/eval/sprint-01-r2/slice-reg-fallback.png`
- `evidence/eval/sprint-01-r2/slice-reg-huge-input.png`
