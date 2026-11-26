# Demo storyboard

Limit: see project/config.json video_max_seconds (90s). Aim 10 seconds under it (70s total).
Every scene in this storyboard is `live` (100% real product footage).
Open on the problem or the result, not on a logo.

Rows must start with start and end seconds, then the type, so the gate can read them.

| start | end | type | on screen | narration (one idea per line, spoken plainly) |
|---|---|---|---|---|
| 0 | 6 | live | PackPort home screen showing Warung Sari Bali Crispy Prawn Sambal held at 16% readiness with a red Hold: Relabel Required customs stamp | Small food producers across Asia Pacific lose shipments at port when an ingredient label or health claim breaks destination customs rules. |
| 6 | 19 | live | Clicking the 3 samples in the top Demo SKUs strip (Bali Prawn Sambal to Singapore SFA, Chiang Mai Mango Drink to Australia FSANZ, and Saigon Matcha Oat Bar to Japan CAA) | PackPort lets any exporter test a package label in one click with 3 samples preloaded and no login required. |
| 19 | 36 | live | Scrolling the Redlined Origin Package Proof, Multi-Corridor Readiness Comparison table across 3 countries, and itemized Statutory Findings cards (#1 to #7) | For this Indonesian sambal headed to Singapore SFA, PackPort flags an unpermitted immunity claim, a Low Sugar claim over the statutory cap, unbolded shrimp and candlenut allergens, and missing INS additive codes, while comparing readiness across 3 countries. |
| 36 | 56 | live | Clicking Apply All Regulatory Fixes (7), watching the stamp flip to Cleared for Export at 100%, toggling Side-by-Side Proof, and clicking Download Sticker SVG and Download Customs Report (.txt) | One click on Apply All Regulatory Fixes updates the die-cut export over-sticker to 100% Cleared for Export with bolded allergens, INS numbers, and a per-100g nutrition panel ready to download as an SVG sticker or text dossier. |
| 56 | 64 | live | Scrolling to the How Google Gemini & Statutory Rules Checked This Label trace panel (`server/geminiInspector.ts` and `src/lib/regulatoryEngine.ts`) | Under the hood, a Google Gemini 3-agent pipeline using the `@google/genai` SDK works alongside a deterministic statutory rule engine verified by 7 tests and 5 cases. |
| 64 | 70 | live | Returning to the top showing the 100% Cleared for Export over-sticker and masthead | Try PackPort live at the URL in our submission to clear your next APAC export shipment before it leaves port. |
