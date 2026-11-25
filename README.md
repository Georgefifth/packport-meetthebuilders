# PackPort — Cross-Border Food & Beverage Label Pre-Flight Inspector for APAC SMEs

PackPort helps APAC food and beverage exporters catch customs label violations against **Singapore (SFA)**, **Australia/New Zealand (FSANZ)**, and **Japan (CAA)** import rules and generate a compliant, print-ready export over-sticker before their shipment leaves port.

## Quick Start

```bash
npm install
npm run build
npm run dev
```

Open `http://localhost:5173` and click any of the three **Example SKU** buttons (or enter your own product ingredients, nutrition facts, and package claims) and click **Run Customs Pre-Flight**.

## Google AI Tools Used (`#Meetthebuilders`)
1. **Google Gemini API (`@google/genai` SDK, `gemini-2.5-flash`):** Server-side multi-agent structured JSON generation (`responseSchema`) that translates regional APAC ingredients (`belacan`, `kemiri`, `gula melaka`, `nam pla`), detects prohibited therapeutic claims, and rewrites compliant export over-sticker copy.
2. **Tool-Grounded Multi-Agent Regulatory Pipeline:** Combines three specialized inspection agents with a deterministic statutory threshold engine (`src/lib/regulatoryEngine.ts`) for Singapore SFA (Eighth Schedule), Australia FSANZ (PEAL Standard 1.2.3), and Japan CAA so per-100g/100mL nutrient math is exact and repeatable.
3. **Google Cloud Run-Ready Stateless API (`/api/inspect-label`):** Stateless HTTP endpoint with environment-managed secrets (`GEMINI_API_KEY`) and automatic deterministic statutory fallback when offline.
