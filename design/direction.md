# Design direction: PackPort

Chosen with `python3 scripts/pick_direction.py`, then adapted. Record the base id: civic-ledger.

## Direction
**Customs House Proof Sheet (`civic-ledger` adapted)** — *tactile, authoritative, forensic*.
In the first 3 seconds, a first-time visitor feels like they are holding an official port-of-entry customs inspection ledger beside a physical die-cut export package label proof—where every redlined violation has a clear statutory rule and one click stamps the label `Cleared for Export`.

## Palette
Real colours, each with a job. At least five. Say where each is used and where it must not be.
- Surface: `#FAF7F0` — Warm unbleached customs ledger paper for the main page background; elevated inspection cards and the adhesive over-sticker proof use crisp label stock `#FFFFFF` with subtle `#F2ECE1` ruled headers. Never use dark/near-black backgrounds or neon gradients.
- Text: `#141413` — Deep archival carbon ink for headlines, body copy, and nutrition table text (`17.8:1` contrast against `#FAF7F0`); muted secondary ink `#4A473E` (`8.4:1` contrast) for captions and statutory clause sub-labels. Never use low-contrast grey text below `#5C584E`.
- Accent (primary action only): `#C8281E` — Customs Vermilion Red reserved strictly for the primary action button (`Run Customs Pre-Flight`), critical hold violation pins, and the `HOLD: RELABEL REQUIRED` rubber stamp border. Must not be used on decorative borders or non-interactive backgrounds.
- Secondary: `#1D4268` — Maritime Manifest Navy used for destination port badges (`Singapore SFA`, `Australia FSANZ`, `Japan CAA`), secondary interactive controls (`Apply All Regulatory Fixes`, sample SKU pills), and regulatory citation links. Must not compete with the primary CTA fill.
- Highlight / success: `#1B6B3A` — Port Clearance Emerald (with `#E8F5ED` tint surface) used exclusively for the `CLEARED FOR EXPORT` stamp, resolved compliance checks, and 100% readiness badges. Amber highlight `#F4E4B2` (with `#7A4F08` text) marks cautionary label warnings.
- Warning / error: `#B42318` — Statutory Hold Crimson on `#FDF2F1` surface for customs detention errors, unpermitted health claims, undeclared allergens, and form validation alerts; paired with `#8A4B08` on `#FEF6E7` for warnings.
- Rule / border: `#D4CEC0` — Crisp 1px ledger hairline rules and `#141413` 2px nutrition-facts box rules that divide the customs dossier columns and frame the die-cut over-sticker proof.

## Fonts
Two or three typefaces. Name each in backticks and say what it is for.
- Display: `Newsreader` — Editorial serif (weights 600, 700, optical size 36–48px) used for the dossier masthead, product SKU title, and customs verdict headline.
- Text: `Libre Franklin` — Clean humanist grotesque (weights 400, 500, 600, 700) used for all UI controls, plain-language violation explanations, buttons, and mandatory statutory nutrition/ingredient copy on the export over-sticker.
- Data (numbers, code only): `Azeret Mono` — Used strictly for tabular per-100g/mL nutrient figures, statutory threshold ratios (`14.5g vs. <=5.0g/100g`), INS additive numbers (`INS 211`, `INS 621`), and millimeter sticker dimension ticks (`88 mm × 112 mm`). Never exceeds 25% of visible page characters.
Size scale: body 16-18px, small 14px, never below 12px. Line height 1.5 for text.

## Layout archetype
**Two-Column Customs Proofing Workbench with Ruled Dateline Masthead.**
At 1440px desktop width, the top masthead spans the page like an official trade manifest with the one-sentence pitch, destination corridor selector, and the **Instant Sample SKU Strip** directly beneath it. Below the masthead rule, the viewport splits into an asymmetric 5:7 ruled ledger grid:
- **Left Column (5 cols — Source Package & Claim Editor):** Holds the product's origin details, ingredient declaration, front-of-pack marketing claims, per-serving nutrition inputs, and the single dominant Vermilion Red primary action button (`Run Customs Pre-Flight`).
- **Right Column (7 cols — Interactive Package Proof, Statutory Audit Ledger & Printable Over-Sticker):** Displays the customs readiness score, the angled rubber verdict stamp (`HOLD: RELABEL REQUIRED` or `CLEARED FOR EXPORT`), a toggleable side-by-side view of the **Redlined Origin Label Proof** (with numbered violation pins `1`, `2`, `3`, `4`) and the **Print-Ready Export Over-Sticker** (complete with millimeter crop marks, mandatory per-100g nutrition table, bolded allergens, and importer block), followed by the itemized Statutory Findings Ledger where each row has a one-click `Apply Fix` button.

## Signature element
**The Die-Cut Export Over-Sticker Proof with Angled Customs Rubber Stamp & Numbered Callout Pins.**
Beside the statutory findings list sits a physical, cream-backed adhesive sticker proof (`88 mm × 112 mm` with hairline dimension ticks and corner crop marks). When violations exist, numbered vermilion pins (`①`, `②`, `③`, `④`) point directly to the offending claim, unbolded allergen, or missing per-100g row on the package label, stamped with an angled `HOLD: RELABEL REQUIRED` customs mark. Clicking **Apply All Regulatory Fixes** animates the sticker into a legally formatted SFA / FSANZ / CAA export over-sticker and stamps it `CLEARED FOR EXPORT` in Port Clearance Emerald.

## Why this fits the user
An APAC food SME founder or export coordinator works on a laptop at a kitchen table, co-packing facility, or freight forwarder's desk under bright daylight. They are anxious about a container getting detained at Singapore Tuas Port, Melbourne, or Tokyo Bay over a technicality in a 90-page PDF regulation. A warm, high-contrast, paper-and-ink customs ledger with a tangible physical sticker proof gives them immediate clarity, trust, and a print-ready artifact they can hand directly to their packaging printer or customs broker.

## What this is not
- **Not a dark-mode AI cyber dashboard:** Rejected near-black `#0B0F19` backgrounds, glowing neon borders, and terminal telemetry logs because food exporters and regulatory inspectors read dense ingredient labels and nutrition tables that belong on daylight paper stock.
- **Not a generic chat wrapper:** Rejected a conversational prompt box where users ask "Is my label legal?" and receive a wall of markdown; customs compliance requires exact per-100g math, structured clause citations, and a formatted physical label layout.
- **Not a multi-tab enterprise ERP:** Rejected sidebars with fake settings, billing tiers, and warehouse tabs; the entire workflow lives on one focused proofing workbench.

## References
Real products studied (captures in `design/references/`):
- **Open Food Facts (`design/references/openfoodfacts/`):** Borrowed the structured decomposition of a physical food product into ingredient tokens, allergen highlights, additive E/INS numbers, and standardized per-100g vs. per-serving nutrition facts table—while fixing Open Food Facts' tiny `<12px` text and cluttered multi-card sprawl.
- **Food Standards Australia New Zealand — PEAL Allergen Labelling (`design/references/fsanz-labelling/`):** Borrowed the Plain English Allergen Labelling (PEAL) inline bolding pattern and separate `Contains:` summary statement required on real ANZ/Singapore export labels.
- **The Pudding (`design/references/pudding-editorial/`):** Borrowed the editorial `Newsreader` + grotesque typographic hierarchy, warm paper ground, hairline column rules, and annotated callout pins that connect narrative explanations directly to a visual artifact.
