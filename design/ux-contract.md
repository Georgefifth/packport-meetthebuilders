# UX contract: PackPort

This is the acceptance contract for the front end. The evaluator grades the product against it.

## Screens
One row per screen. Every screen has exactly one primary action.

| Screen | Purpose in a sentence | Primary action (verb phrase) | Reached from |
|---|---|---|---|
| **Customs Pre-Flight Workbench (Home)** | Inspect an APAC food or beverage package label against Singapore (SFA), Australia (FSANZ), or Japan (CAA) import rules and generate a compliant, print-ready export over-sticker. | **Run Customs Pre-Flight** | Landing URL (`/`) |

## First 30 seconds
Describe, second by second, what a stranger sees and does from landing to the first useful result.
- 0-5s: They see the ruled Customs House masthead with the plain-language pitch (*"Catch customs label violations and generate a print-ready Singapore, Australia, or Japan export over-sticker before your shipment leaves port"*), three one-click **Example SKU** buttons at the top, the source label editor on the left, and the live **Bali Crispy Prawn Sambal → Singapore (SFA)** customs proof on the right.
- 5-15s: They click one of the example SKU buttons (e.g., **Example: Bali Crispy Prawn Sambal → Singapore (SFA)** or **Example: Chiang Mai Mango Drink → Australia (FSANZ)**) or click **Run Customs Pre-Flight** (no account, no API key, no file upload required).
- 15-30s: They see the customs verdict stamp (`Hold: Relabel Required` with `4 Customs Violations Found`), numbered pins (`1`–`4`) on the package proof showing what failed in plain words (such as an illegal *"Boosts Immunity"* claim, unbolded *shrimp paste / candlenut* allergens, unmapped *sodium benzoate* additive code, and missing *per-100g* nutrition column), and click **Apply All Regulatory Fixes** to watch the print-ready export over-sticker turn `Cleared for Export (100%)`.

## Plain-language glossary
Every label a user will read, written the way they would say it. No internal names, no snake_case, no codes.

| Internal concept | What the UI says | Where |
|---|---|---|
| `target_market_code` | **Destination Market** (`Singapore (SFA)`, `Australia (FSANZ)`, `Japan (CAA)`) | Source form header & proof stamp |
| `readiness_score_pct` | **Customs Readiness Score** (`52% — 4 fixes needed before export` or `100% — Ready to print & ship`) | Dossier summary bar |
| `severity_critical` | **Customs Hold (Must Fix)** | Finding card badge |
| `severity_warning` | **Label Warning (Recommended Fix)** | Finding card badge |
| `severity_pass` | **Passed Rule** | Finding card badge |
| `peal_allergen_bolding` | **Bold mandatory allergens in ingredient list & add "Contains:" summary** | Finding action & over-sticker |
| `per_100g_conversion` | **Per 100g / 100mL column (required alongside per-serving values)** | Nutrition facts table |
| `ins_additive_mapping` | **Add international additive code (e.g., Preservative INS 211)** | Ingredient finding card |
| `remediated_svg_sticker` | **Print-Ready Export Over-Sticker (88 mm × 112 mm)** | Right-column proof tab & download button |
| `agent_pipeline_trace` | **How Google Gemini & Statutory Rules Checked This Label** | Expandable verification footer |

## States
For each screen that loads data or accepts input: what the user sees when it is empty, loading (over 1s), succeeded, failed, and given bad input. Each error says what happened and what to do next.

| Screen | Empty | Loading | Success | Error / bad input |
|---|---|---|---|---|
| **Customs Pre-Flight Workbench (Home)** | If the user clears the form ("Clear Form"), the right panel shows an illustrated customs stamp outline saying *"Enter your product's ingredients and nutrition values on the left, or click one of the 3 Example APAC SKUs above to run an instant inspection."* | Button shows *"Checking SFA / FSANZ / CAA rules..."* with a step indicator (*1. Parsing regional ingredients & allergens → 2. Auditing nutrient & health claims → 3. Drafting compliant over-sticker*). | Displays the customs verdict stamp (`Hold: Relabel Required` or `Cleared for Export`), readiness score with meaning, numbered pins on the package proof, itemized findings with statutory citations and `Apply Fix` buttons, and the downloadable print-ready SVG over-sticker. | **Bad input:** Inline red alert next to the field (e.g., *"Please enter at least one ingredient on the label"* or *"Serving size must be greater than 0g"*), focuses the field, and keeps all typed values intact. **Server/network error:** Plain banner (*"Live Gemini API was unreachable; completed inspection using the built-in statutory rule engine so your work is safe."*) |

## Mobile (390px)
At `390px` viewport width, the two-column desktop grid stacks cleanly into a single vertical flow with zero horizontal overflow (`scrollWidth <= 390px`):
1. Compact masthead and horizontally scrollable/wrapped **Example SKU** buttons (each `>= 44px` tall).
2. The primary action button (**Run Customs Pre-Flight**, `48px` height, full width) sits immediately accessible at the bottom of the concise label summary or sticky action bar reachable with one thumb.
3. The **Package Proof & Export Over-Sticker** renders in a responsive `viewBox` SVG that scales cleanly to `100%` container width without clipping text, followed by full-width Statutory Finding cards with `44px+` **Apply Fix** buttons.

## Stranger test
The evaluator receives ONLY the live URL and the one-sentence pitch. Task: **Inspect an Indonesian, Thai, or Vietnamese food product label for export to Singapore, Australia, or Japan, identify why customs would hold it, and generate a compliant export over-sticker.**
Pass = completes it in under **2** minutes with no more than 1 hesitation (a pause over 5 seconds or a wrong click).
