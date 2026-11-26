# Sponsor tool usage log

Only needed when the hackathon requires or rewards using a sponsor tool (see rubric.md "Sponsor requirements").
Append one entry whenever you use a sponsor feature in a way that changed the work. This log becomes the
"how we used it" write-up, and judges can verify it against the repo.

## Plan
Meet the Builders 2026 (Google Cloud Gen AI Academy APAC Edition) requires building a working solution powered by **Google AI / Google Cloud** technologies and submitting **3 bullets on the Google AI tools used**. We use:
1. **Google Gemini API via `@google/genai` SDK (`gemini-2.5-flash`):** Server-side multi-agent structured JSON generation (`responseMimeType: "application/json"` with strict `responseSchema`) in `server/geminiInspector.ts` to parse multilingual APAC ingredient lists (`belacan`, `kemiri`, `gula melaka`, `nam pla`), detect unpermitted therapeutic/health claims, and draft compliant bilingual/English export over-sticker copy.
2. **Agentic Tool-Grounded Regulatory Pipeline (ADK / MCP-style tool architecture):** A 3-agent inspection workflow (*Agent 1: Regional Ingredient & Allergen Lexicon Mapper* → *Agent 2: Statutory Nutrient & Claim Threshold Auditor* → *Agent 3: Export Over-Sticker Rewriter*) grounded against deterministic statutory lookup tools (`src/lib/regulatoryEngine.ts`) for Singapore SFA, Australia FSANZ, and Japan CAA so nutrient math is never hallucinated.
3. **Google Cloud Run-Ready Stateless Container Architecture (`Dockerfile` & `server/api.ts`):** Stateless HTTP API and static asset server following Google Cloud Run and Secret Manager best practices (`process.env.GEMINI_API_KEY`, zero hardcoded secrets, deterministic fallback when offline).

## Entries
- 2026-11-26 | Stage 2 | `@google/genai` multi-agent schema & statutory tool architecture planned | Defined the 3-agent JSON schema and deterministic SFA/FSANZ/CAA regulatory verification pipeline in the spec and slice contract | `project/spec.md`, `contracts/slice.md`
- 2026-11-26 | Stage 3 | Implemented `@google/genai` (`gemini-2.5-flash`) structured output inspector & deterministic statutory engine | Built `server/geminiInspector.ts` using `GoogleGenAI` + `Type.OBJECT` responseSchema alongside `src/lib/regulatoryEngine.ts` and Vite API middleware in `vite.config.ts` | `server/geminiInspector.ts`, `src/lib/regulatoryEngine.ts`, `vite.config.ts`
- 2026-11-26 | Stage 4 | Added Multi-Corridor Readiness Comparison & structured Customs Pre-Flight Report generator | Extended `src/lib/regulatoryEngine.ts` and `src/App.tsx` with simultaneous 3-corridor (`SG_SFA`, `AU_FSANZ`, `JP_CAA`) statutory evaluation and downloadable `.txt` customs dossier | `src/lib/regulatoryEngine.ts`, `src/App.tsx`, `contracts/sprint-01.md`
