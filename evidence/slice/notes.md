# Stage 3 Vertical Slice Evidence Notes — PackPort

Live URL: `https://dimensional-glance-icons-bible.trycloudflare.com`
Local URL: `http://localhost:5173`

## Five Screenshots (Desktop & Mobile)
1. `evidence/slice/01-desktop-landing-sambal.png` — Desktop (`1440x900`) first-run landing state displaying the **Customs House Proof Sheet** masthead, three one-click Example APAC SKUs, the **Run Customs Pre-Flight** primary CTA, and the live redlined dossier for *Bali Crispy Prawn Sambal → Singapore (SFA)* (`12% — 7 fixes needed before export`, `Hold: Relabel Required` stamp).
2. `evidence/slice/02-desktop-remediated-cleared.png` — Desktop (`1440x900`) after clicking **Apply All Regulatory Fixes**, showing the updated **Print-Ready Export Over-Sticker (88 mm × 112 mm)** with inline-bolded allergens, INS additive codes, dual-column per-serving & per-100g nutrition panel, `100% — Ready to print & ship` readiness score, and `Cleared for Export` stamp.
3. `evidence/slice/03-desktop-mango-australia-fsanz.png` — Desktop (`1440x900`) after clicking **Example: Chiang Mai Mango Drink → Australia (FSANZ)**, demonstrating corridor switching, liquid `Per 100mL` conversion, Energy in `kJ`, and FSANZ Standard 1.2.3 PEAL allergen rules.
4. `evidence/slice/04-desktop-validation-error.png` — Desktop (`1440x900`) bad-input edge case showing the inline validation message (`"Please enter at least one ingredient on the label."`) with keyboard focus on the invalid field and all other user inputs preserved.
5. `evidence/slice/05-mobile-390px-view.png` — Mobile (`390x844`) full-page responsive view with zero horizontal overflow (`scrollWidth = 390px`), `44px+` tap targets, and clean single-column stacking.

## What is Real
- **Deterministic APAC Regulatory Rule Engine (`src/lib/regulatoryEngine.ts`):** Real per-serving to `per-100g` / `per-100mL` nutrient density math, kilojoule (`kcal × 4.184`) and Japan CAA Salt Equivalent (`sodiumMg × 2.54 / 1000`) conversions, statutory threshold verification for `"Low Sugar"` (`<= 5.0g/100g` solid, `<= 2.5g/100mL` liquid), `"High Protein"` (`>= 10.0g/100g`), `"Zero Salt"` (`<= 5mg Na/100g`), and `"Preservative Free"`, regional Southeast Asian allergen lexicon (`belacan`, `kemiri`, `kicap manis`, `nam pla`, `cashew`, `sesame`, `oats`, `whey`, `egg`, `sulphites`), and INS additive code mapping (`INS 211`, `INS 202`, `INS 223`, `INS 621`, `INS 102`, `INS 330`, `INS 322`).
- **Google Gemini Multi-Agent Hybrid API (`server/geminiInspector.ts` & `POST /api/inspect-label`):** Real `@google/genai` SDK integration (`gemini-2.5-flash` with `responseSchema`) paired with automatic deterministic statutory fallback when `GEMINI_API_KEY` is absent or offline.
- **Dynamic Vector Export Over-Sticker Generator (`buildExportStickerSvgString`):** Generates a downloadable, print-ready `.svg` die-cut adhesive export over-sticker (`88 mm × 112 mm`) that updates live as individual or batch regulatory fixes are applied.
- **Browser Persistence (`localStorage`):** Preserves user-edited label inputs and resolved findings across page reloads.

## What is Stubbed / Example Data
- The three preloaded APAC export SKUs (*Warung Sari Bali Crispy Prawn Sambal*, *Lanna Orchard Chiang Mai Mango Drink*, and *MeKong Craft Saigon Matcha Oat Bar*) are realistic, explicitly badged **Example SKU** fixtures so a judge can test the core workflow in one click without typing.

## What We Would Change Next (Stage 4 Polish & Hardening)
- Add a side-by-side **Corridor Comparison Matrix** or quick statutory threshold table so an exporter can see at a glance how the same SKU fares across Singapore (SFA), Australia (FSANZ), and Japan (CAA) simultaneously.
- Add real-input text/JSON fixtures in `evidence/fixtures/` and expand automated integration tests for Stage 4/5 gates.

## 3 Honest Weaknesses
1. **Curated allergen & additive dictionary in offline fallback mode:** When running without a live `GEMINI_API_KEY`, the deterministic engine relies on a 15-group APAC allergen lexicon and 7 common INS additive rules; obscure botanical ingredients or rare E-numbers outside those rules require the live Gemini API key for semantic classification.
2. **Fixed 4-line ingredient wrap on the `88 mm × 112 mm` SVG over-sticker:** Very long ingredient lists (>260 characters) are truncated after 4 lines on the visual SVG sticker preview to fit inside the physical `88 mm × 112 mm` die-cut box without dropping below `14px` font size.
3. **English + romanized APAC statutory focus:** While Japan CAA Salt Equivalent (`g`) and Specific Raw Material categories are enforced, the generated over-sticker prints in English (with Japanese statutory terms noted) rather than full vertical/horizontal native kanji typesetting.
