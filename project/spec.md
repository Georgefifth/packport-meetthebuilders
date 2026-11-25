# Spec: PackPort

## Users and stories
For each story: who, what, why, and an acceptance line the evaluator can check.
- As an **APAC food or beverage SME founder (or first-time visitor)**, I can **click a preloaded APAC export SKU sample (such as "Bali Crispy Prawn Sambal → Singapore (SFA)") on the home screen** so that **I can see how customs label pre-flight inspection works in under 10 seconds without typing or signing up**. Accepted when clicking the sample button populates the source label fields, runs the inspection pipeline within 5 seconds, displays the customs verdict stamp (`Hold: Relabel Required` or `Cleared for Export`), lists specific statutory findings with regulatory citations, and renders a print-ready compliant export over-sticker.
- As an **APAC food exporter preparing a shipment**, I can **choose a destination market (`Singapore (SFA)`, `Australia (FSANZ)`, or `Japan (CAA)`), enter or edit my product name, net weight, serving size, ingredient list, front-of-pack claims, and nutrition values, and click "Run Customs Pre-Flight"** so that **I know every label violation before printing packaging or shipping to port**. Accepted when the inspection returns a readiness score (`0–100%`), severity-tagged findings (`Critical Hold`, `Warning`, `Verified Pass`) citing the exact destination clause (e.g., SFA Food Regulations Reg 5 / Eighth Schedule, FSANZ Standard 1.2.3 PEAL, or Japan CAA Food Labeling Standards), and numbered callout pins on the visual package proof.
- As a **packaging coordinator**, I can **click "Apply Fix to Over-Sticker" on individual flagged violations (or "Apply All Regulatory Fixes")** so that **the live export over-sticker automatically updates with bolded PEAL/SFA allergens, INS additive numbers, compliant per-100g/mL nutrition tables, and scrubbed/qualified claims, and flips the customs stamp to `Cleared for Export`**. Accepted when clicking the fix button updates the over-sticker preview in place, marks the finding as resolved, recalculates the readiness score to `100%`, and enables downloading the print-ready SVG over-sticker and copying the 3-bullet customs dossier.
- As a **user who submits incomplete or invalid label data**, I can **see a clear inline message explaining what is missing while keeping everything I already typed** so that **I can fix my input without losing work**. Accepted when submitting an empty ingredient list or negative nutrition value shows a plain-language field error, focuses the invalid input, and preserves all other entered fields.

## Core flow
1. Pick a preloaded APAC export SKU sample (e.g., *Bali Crispy Prawn Sambal → Singapore (SFA)*, *Chiang Mai Mango Sticky Rice Drink → Australia (FSANZ)*, or *Saigon Matcha Oat Bar → Japan (CAA)*) or paste your own product label details (ingredients, nutrition facts, and front-of-pack claims) and destination market.
2. Click **Run Customs Pre-Flight** to execute the hybrid inspection pipeline: deterministic regulatory math (per-100g conversions, SFA/FSANZ/CAA nutrient claim thresholds, mandatory allergen & INS additive scanner) combined with the Google Gemini (`@google/genai`) multi-agent structured analysis.
3. Inspect the ruled customs dossier and interactive package proof showing the customs stamp, numbered violation pins, statutory clause citations, and plain-language explanations of what fails at port.
4. Click **Apply All Regulatory Fixes** (or resolve individual findings) to watch the die-cut adhesive export over-sticker update in real time with compliant allergen declarations, INS numbers, per-100g nutrition rows, and importer block, then download the print-ready SVG sticker or copy the customs clearance summary.

## Architecture
Smallest stack that works, with a reason for each piece. Mark each piece: runs in the browser / our server / third party.
- **React 19 + TypeScript + Vite Front End (runs in the browser):** Renders the ruled Civic Ledger customs workbench, interactive package label proof with numbered callout pins, live SVG adhesive export over-sticker generator (with millimeter ruler ticks), and instant sample loader.
- **Deterministic APAC Regulatory Rule Engine (`src/lib/regulatoryEngine.ts`, runs in the browser and our server):** Performs exact, repeatable statutory math and dictionary checks for **Singapore (SFA Food Regulations & Eighth Schedule)**, **Australia/New Zealand (FSANZ Standard 1.2.3 PEAL & Standard 1.2.8/1.2.7)**, and **Japan (CAA Food Labeling Standards)** — including per-serving to per-100g/100mL conversion, sugar/sodium/fat health-claim threshold checks, regional APAC ingredient translation (`belacan`, `terasi`, `kemiri`/candlenut, `gula melaka`, `ebi`, `nam pla`), INS additive code mapping, and mandatory allergen bolding verification.
- **Node/Vite API Middleware + Cloud Run Server (`server/api.ts`, runs on our server):** Exposes `POST /api/inspect-label` and `GET /api/health`. Orchestrates the 3-stage multi-agent inspection pipeline (1. *Ingredient & Allergen Taxonomy Agent*, 2. *Statutory Claim & Nutrition Threshold Agent*, 3. *Compliant Export Over-Sticker & Customs Dossier Agent*) and merges deterministic statutory checks with Google Gemini structured JSON reasoning.
- **Google Gemini API via `@google/genai` SDK (`gemini-2.5-flash`, third party):** Called server-side with `responseMimeType: "application/json"` and strict `responseSchema` to parse complex multilingual APAC ingredient lists, explain subtle front-of-pack therapeutic/health claim violations in plain language, and draft compliant bilingual/English export over-sticker copy.

## Judge-runnability
- **Public URL, no login:** Deployed as a public web application with zero login wall, zero account creation, and zero client-side API key prompt. One click on **Try Sample: Bali Crispy Prawn Sambal → Singapore (SFA)** runs immediately.
- **Local run:**
  1. `npm install`
  2. `npm run build`
  3. `npm run dev` (opens at `http://localhost:5173`)
- **External services, their quotas and the fallback if they fail:** The server calls Google Gemini (`gemini-2.5-flash`) via `@google/genai` when `GEMINI_API_KEY` is present on the server. If `GEMINI_API_KEY` is absent, rate-limited, or unreachable during judging, `/api/inspect-label` automatically falls back to the deterministic APAC Regulatory Rule Engine (`src/lib/regulatoryEngine.ts`), which computes 100% real statutory threshold math, allergen/additive parsing, and compliant over-sticker generation in under 150ms with zero degradation of core functionality.

## Data
- **Stored in browser (`localStorage`):** Recent label inspections and custom edits are persisted locally under `packport_history_v1` so the user can switch between inspected SKUs or reload the page without losing work.
- **Computed on every inspection:** Per-100g / per-100mL nutrient densities (energy kcal/kJ, protein, total fat, saturated fat, carbohydrate, total sugars, sodium in mg and salt-equivalent g), nutrient claim threshold ratios (e.g., `14.5g sugar / 100g` vs. SFA `5.0g / 100g` "Low Sugar" legal maximum), mandatory allergen token extraction, INS additive code mapping, customs readiness score (`0–100%`), and the SVG export over-sticker layout.
- **Example data and labelling:** Three real-world APAC export SKU fixtures are included and explicitly badged **"Example SKU"** in the UI selector and dossier header:
  1. **Example 1:** *Warung Sari — Bali Crispy Prawn Sambal (Indonesia → Singapore SFA)*
  2. **Example 2:** *Lanna Orchard — Chiang Mai Mango Coconut Drink (Thailand → Australia FSANZ)*
  3. **Example 3:** *MeKong Craft — Saigon Matcha Cashew Oat Bar (Vietnam → Japan CAA)*

## Risks
| Risk | Likelihood | Mitigation | Cut line |
|---|---|---|---|
| Judge tests without `GEMINI_API_KEY` or Gemini quota is exhausted | Medium | Deterministic APAC Regulatory Rule Engine runs the full SFA/FSANZ/CAA statutory checks and generates the compliant over-sticker locally and via `/api/inspect-label` fallback | Never block inspection on external network availability |
| Physical label & over-sticker preview overflows on 390px mobile screens | Low | Responsive single-column layout at 390px with scalable SVG viewBox (`0 0 420 520`) and stacked dossier cards | Drop side-by-side ruler chrome on <480px viewports while keeping the full SVG over-sticker |
| Regulatory terminology feels dense to a first-time visitor | Low | Every statutory citation (`SFA Reg 5(4)(b)`) is paired with a one-sentence plain-language explanation and a one-click "Apply Fix" button | Cut raw legal appendix paragraphs; show only the actionable rule and fix |

## Sponsor tool plan
We use **Google Gemini API (`@google/genai` SDK with `gemini-2.5-flash`)** as the core multi-agent reasoning engine inside `server/geminiInspector.ts` and `src/lib/regulatoryEngine.ts`, structured around the Google Cloud Gen AI Academy APAC Edition tracks:
1. **Multi-Agent Structured Output Pipeline (`@google/genai` `Type.OBJECT` schema):** Three specialized agent roles (Ingredient & Regional APAC Allergen Lexicon Agent, Statutory Nutrient & Health Claim Auditor, and Export Over-Sticker Rewriter) produce strict JSON outputs that map directly to visual package proof pins and the compliant over-sticker.
2. **Tool-Augmented Regulatory Grounding (MCP-style tool context):** Deterministic statutory tables for Singapore SFA (Eighth Schedule), Australia FSANZ (PEAL Standard 1.2.3), and Japan CAA are injected as structured tool verification context so Gemini never hallucinates nutrient limits.
3. **Cloud Run-Ready Stateless HTTP API (`/api/inspect-label`):** Container-ready Node/Vite server architecture following Google Cloud Run best practices (environment-based secret injection, zero hardcoded keys, deterministic health check).

## Out of scope
- User accounts, login walls, or multi-tenant organization billing management.
- Laboratory chemical spectroscopy or wet-lab nutritional assay calculation from raw recipes.
- Automated freight booking, customs brokerage EDI filing, or live ERP warehouse integration.
- Mobile native iOS/Android app wrapper (shipping as a responsive 1440px/390px web application).
