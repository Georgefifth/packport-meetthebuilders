# PackPort — Cross-Border Food & Beverage Label Pre-Flight Inspector for APAC SMEs

PackPort helps APAC food and beverage exporters catch customs label violations against **Singapore (SFA)**, **Australia/New Zealand (FSANZ)**, and **Japan (CAA)** import rules and generate a compliant, print-ready export over-sticker before their shipment leaves port.

- **Live URL:** `https://dimensional-glance-icons-bible.trycloudflare.com`
- **Repository:** `https://github.com/Georgefifth/packport-meetthebuilders`

## Try It in 10 Seconds (Instant Demo Path)

1. Open the live URL (`https://dimensional-glance-icons-bible.trycloudflare.com`) — no account, no login, and no API key required.
2. Click any of the **3 samples** in the top **Instant Demo SKUs** strip (*Example: Bali Crispy Prawn Sambal → Singapore (SFA)*, *Example: Chiang Mai Mango Drink → Australia (FSANZ)*, or *Example: Saigon Matcha Oat Bar → Japan (CAA)*) and click **Run Customs Pre-Flight**.
3. Inspect the flagged statutory violations, compare how the product scores across all **3 countries** in the **Multi-Corridor Readiness Comparison** table, and click **Apply All Regulatory Fixes** to watch the **Print-Ready Export Over-Sticker** reach **100%** (`Cleared for Export`).
4. Click **Download Sticker SVG** or **Download Customs Report (.txt)** to export the print-ready die-cut sticker and written customs dossier.

## Run Locally in 3 Commands

```bash
npm install
npm run build
npm run dev
```

Then open `http://localhost:5173`. Run the automated test suite (`7 tests`) with:

```bash
npm test
```

## What Is Real vs. Example Data

- **Real Statutory & Nutrient Engine (`src/lib/regulatoryEngine.ts`):** Computes exact `per-100g` and `per-100mL` nutrient densities, kilojoule (`kcal × 4.184`) and Japan CAA Salt Equivalent (`sodiumMg × 2.54 ÷ 1000`) conversions, statutory claim thresholds (`"Low Sugar"`, `"High Protein"`, `"Zero Salt"`, `"Preservative Free"`, and prohibited therapeutic claims), Southeast Asian allergen lexicon matching (`belacan`, `kemiri`, `kicap manis`, `nam pla`, `cashew`, `sesame`, `oats`, `whey`, `egg`, `sulphites`), and INS additive code mapping (`INS 211`, `INS 202`, `INS 223`, `INS 621`, `INS 102`, `INS 330`, `INS 322`).
- **Real Google Gemini Multi-Agent API (`server/geminiInspector.ts`):** Uses the official `@google/genai` SDK (`gemini-2.5-flash`) with a strict `Type.OBJECT` `responseSchema` on `POST /api/inspect-label`. When `GEMINI_API_KEY` is not set on the server, `/api/inspect-label` automatically falls back to the built-in deterministic statutory engine so every check runs reliably offline.
- **Labelled Example Data (`src/lib/sampleSkus.ts`):** The **3 samples** preloaded in the top strip are realistic APAC food & beverage export SKUs explicitly badged `Example SKU` in the UI.

## Google AI Tools Used (`#Meetthebuilders`)

- **Google Gemini API (`@google/genai` SDK, `gemini-2.5-flash`):** Server-side multi-agent structured JSON generation (`responseSchema`) in `server/geminiInspector.ts` that parses regional APAC ingredient lists, audits front-of-pack health claims, and drafts compliant over-sticker copy.
- **Tool-Grounded Multi-Agent Regulatory Pipeline:** Three specialized inspection agent stages grounded against deterministic statutory lookup tables (`src/lib/regulatoryEngine.ts`) for Singapore SFA, Australia FSANZ, and Japan CAA so nutrient math is never hallucinated.
- **Stateless HTTP API (`/api/inspect-label`):** Built with React, TypeScript, Vite, and Node.js with environment-based secret management (`process.env.GEMINI_API_KEY`) and automatic deterministic fallback.
