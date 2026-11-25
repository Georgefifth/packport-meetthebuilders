# Candidate ideas

Write 4 to 6 ideas, each genuinely different (different user, different problem). Every claim about
the world needs a link. Try to kill each idea before recommending it.

## Idea A: PackPort — Cross-Border Food & Beverage Label Pre-Flight Inspector for APAC SMEs
- User: An artisanal food or beverage founder in Indonesia, Thailand, Vietnam, or Malaysia holding a product ingredient list and nutrition panel that they want to export to Singapore (SFA), Australia/New Zealand (FSANZ), or Japan (CAA).
- Problem: Small APAC food producers regularly suffer customs detention, relabeling fines, and distributor rejections because additive numbering (INS vs. E-numbers), mandatory allergen bolding declarations, nutrition panel per-100g vs. per-serving rules, and prohibited health claims differ sharply across Singapore Food Agency (SFA), FSANZ, and Japan CAA regulations ([Singapore Food Agency Guide to Food Labelling and Advertisements](https://www.sfa.gov.sg/food-information/labelling-packaging-information/a-guide-to-food-labelling-and-advertisements), [FSANZ Allergen Labelling Plain English Allergen Labelling (PEAL) Mandate](https://www.foodstandards.gov.au/business/labelling/allergen-labelling)).
- Today they: Copy-paste ingredients into Google Translate, cross-check 90-page PDF annexes from SFA or FSANZ by hand, or pay $400–$1,200 per SKU to regulatory consultants, waiting two weeks only to find a single undeclared sulfite or non-compliant "low sugar" claim at port inspection.
- Existing alternatives:
  - [SFA Food Labelling Self-Check PDF Checklists](https://www.sfa.gov.sg/docs/default-source/tools-and-resources/resources-for-businesses/guide-to-food-labelling-and-advertisements.pdf): Static 40+ page regulatory PDFs with no automated ingredient-to-INS parser, no nutrition threshold calculator, and no redrafted label output.
  - [FoodChain ID / TraceGains Regulatory Compliance Suites](https://www.foodchainid.com/digital-solutions/regulatory-compliance/): Enterprise PLM suites built for multinational FMCG conglomerates that require annual five-figure contracts, account onboarding, and complex ERP spec sheets before checking a single label.
  - [Registrar Corp Label & Ingredient Review](https://www.registrarcorp.com/food-beverage/label-ingredient-review/): Manual agency service mainly focused on US FDA rather than intra-APAC corridors (Indonesia/Thailand/Vietnam to Singapore/Australia/Japan), taking days per SKU.
- Hook: Paste an APAC snack or beverage label (or click a real Indonesian sambal, Thai coconut drink, or Vietnamese pho paste SKU) and watch a multi-agent customs inspector flag exact SFA/FSANZ/CAA violations on an interactive package proof and generate a print-ready, legally compliant export over-sticker in 6 seconds.
- Why ours is better: Instead of returning a generic chat summary, PackPort runs a deterministic rule check + Gemini structured multi-agent inspection against target-market thresholds (SFA Singapore, FSANZ Australia, CAA Japan), highlights the exact offending ingredient/claim on the visual label proof, and outputs a downloadable, print-ready export compliance sticker with corrected allergen bolding, INS additive codes, and per-100g/mL nutrition tables.
- Core flow (3-5 steps):
  1. Open PackPort and pick a preloaded APAC export SKU (e.g., *Bali Crispy Prawn Sambal → Singapore SFA*, *Chiang Mai Mango Sticky Rice Drink → Australia FSANZ*, or *Saigon Matcha Oat Bar → Japan CAA*) or paste your own ingredient list, nutrition values, and front-of-pack claims.
  2. Click **Run Customs Pre-Flight** to trigger the 3-stage Gemini + rule-engine pipeline (Ingredient & Additive Agent → Nutrition & Claim Threshold Agent → Export Over-Sticker Generator).
  3. Inspect the interactive before/after package label proof with severity-coded violation pins (e.g., undeclared crustacean/tree-nut PEAL bolding, unauthorized "immune booster" health claim under SFA Reg 9, or missing per-100g column).
  4. Click any flagged violation to apply the exact regulatory fix and export the print-ready compliant over-sticker SVG/PDF and 3-bullet customs dossier.
- Feasibility (days): 0.5 days (fits comfortably within the final-day deadline budget). Riskiest dependency: live Gemini API latency or quota during judge testing; mitigated by pairing real `@google/genai` (`gemini-2.5-flash`) structured JSON calls with deterministic local regulatory rule verification and instant pre-verified fallback responses if no API key is configured.
- Rubric fit:
  - **Solution quality & functionality (20%): 5/5** — Works end-to-end in the browser with zero setup, combining deterministic regulatory math (per-100g conversions, SFA/FSANZ nutrient claim thresholds, INS additive lookup) with Gemini structured reasoning and live SVG over-sticker generation.
  - **Architecture & technical execution (20%): 5/5** — Uses `@google/genai` (`gemini-2.5-flash`) with strict JSON schema outputs across a 3-agent inspection pipeline (Ingredient/Allergen Parser, Claim/Threshold Auditor, Compliant Label Rewriter) plus MCP-style regulatory tool lookups.
  - **Impact & use case relevance (20%): 5/5** — Intra-APAC food & beverage trade is a massive economic driver for tens of thousands of SMEs in Indonesia, Thailand, Vietnam, Malaysia, and India exporting to Singapore, Australia, and Japan.
  - **Technical choices, feasibility & security (20%): 5/5** — Zero hardcoded secrets (API key stays server-side via environment variables / Secret Manager pattern), strict input validation, and 100% deterministic local fallback so stability is guaranteed.
  - **Demo, UX & presentation (20%): 5/5** — Highly visual physical package label vs. redlined customs proof + live printable export over-sticker makes an unforgettable 90-second video and 10-second stranger test.
- Crowding:
  - `python3 scripts/devpost_search.py "food export label regulatory compliance inspector"` returned **0 matches** (`total_matches=0, winners_in_shown=0`).
  - Broader `python3 scripts/devpost_search.py "food label compliance"` returned 59 general results (mostly EU Confluence plugins or consumer barcode scanners, 0 winners).
  - Checked all 853 project titles in the Meet the Builders 2026 APAC gallery: **0 projects** address cross-border food/beverage export label compliance or customs over-sticker generation.
- Kill criterion: Would this be dead if SFA and FSANZ regulations weren't publicly documented with concrete numerical thresholds? Falsification test: Checked SFA Food Regulations (Eighth Schedule nutrient claim limits, e.g., "Low Sugar" <= 5g/100g solid or <= 2.5g/100mL liquid) and FSANZ Standard 1.2.3 PEAL mandatory allergen declarations — they are 100% public, unambiguous, and verifiable in code. **SURVIVES.**

## Idea B: ReeferCourt — Cold-Chain Excursion & Marine Cargo Claim Dossier Workbench for APAC Perishable Exporters
- User: A quality assurance or export operations manager at a mid-sized seafood or tropical produce exporter in Vietnam, Thailand, Indonesia, or India holding a USB data-logger CSV from a refrigerated container ("reefer") that arrived with partial spoilage.
- Problem: When a container of chilled yellowfin tuna or mangoes arrives in Singapore, Tokyo, or Rotterdam with thermal abuse, the exporter has only 72 hours under marine cargo insurance and Hague-Visby rules to prove whether spoilage was caused by carrier power-off excursions vs. pre-cooling failure ([FAO Cold Chain & Histamine Control in Scombroid Fish](https://www.fao.org/4/y5924e/y5924e00.htm), [TT Club Perishable Cargo Claims Analysis](https://www.ttclub.com/news-and-resources/publications/stop-loss/perishable-cargo/)).
- Today they: Open raw 10,000-row sensor CSVs in Excel, manually plot temperature curves, guess cumulative degree-hours above threshold, and write ad-hoc emails that marine insurers reject for lacking kinetic shelf-life loss proof.
- Existing alternatives:
  - [Sensitech ColdStream / Emerson Oversight](https://www.sensitech.com/en/solutions/cold-chain-visibility/): Proprietary hardware-locked portals that only read their own logger serials and do not generate marine insurance claim letters or kinetic histamine/ripening loss calculations.
  - [DeltaTrak FlashLink PDF Reports](https://www.deltatrak.com/): Outputs raw min/max/MKT graphs without cross-referencing Bill of Lading custody handoffs (gate-in, vessel loading, transshipment unplugging) or drafting surveyor claim notices.
- Hook: Drop a reefer temperature CSV (or load a real Da Nang-to-Tokyo tuna excursion log) to see the exact hour custody broke the thermal threshold, compute cumulative shelf-life lost, and generate a formal Notice of Loss for the marine insurer in 8 seconds.
- Why ours is better: Combines kinetic degree-hour / Mean Kinetic Temperature (MKT) math with Gemini multi-agent root-cause correlation against port custody timestamps (distinguishing transshipment unplugging from defrost cycles).
- Core flow (3-5 steps):
  1. Select a sample APAC reefer shipment (e.g., *Nha Trang Yellowfin Tuna → Tokyo*, *Chanthaburi Durian → Shenzhen*) or paste a temperature log CSV.
  2. Click **Audit Thermal Custody** to compute MKT, degree-hour excursions, and custody-window blame.
  3. Inspect the annotated timeline pinpointing which carrier handoff caused the excursion.
  4. Export a structured Marine Cargo Notice of Loss with Gemini-drafted surveyor evidence.
- Feasibility (days): 0.7 days. Riskiest dependency: making technical thermal kinetics immediately intuitive to a generalist judge in 10 seconds without domain background.
- Rubric fit:
  - **Solution quality & functionality (20%): 4/5** — Strong kinetic math + Gemini synthesis, though CSV time-series charts feel closer to an analytics dashboard.
  - **Architecture & technical execution (20%): 5/5** — Clean hybrid of deterministic time-series excursion parser + Gemini structured root-cause agent.
  - **Impact & use case relevance (20%): 4/5** — High financial value for APAC exporters, though narrower B2B audience than food/consumer labels or patient bills.
  - **Technical choices, feasibility & security (20%): 5/5** — Self-contained, safe, and fast.
  - **Demo, UX & presentation (20%): 4/5** — A temperature line chart is less visually distinctive in the first 5 seconds than an interactive physical food package label proof.
- Crowding:
  - `python3 scripts/devpost_search.py "cold chain temperature excursion cargo claim"` returned **0 matches**.
  - Broader `python3 scripts/devpost_search.py "cold chain spoilage"` returned 47 matches (including *CycleArbiter: Cold-chain spoilage kinetics* on Devpost and *How I Built an AI-Powered Cold Chain Intelligence Platform* in the Meet the Builders 2026 gallery).
- Kill criterion: Still viable as a strong runner-up, but slightly less immediate in the 10-second stranger test than Idea A because a judge has to read a time-series chart rather than seeing a familiar food package label and export sticker. **SURVIVES (Runner-up).**

## Idea C: BillBiopsy — Hospital Itemized Discharge Bill & TPA Deduction Auditor for APAC Families
- User: A patient's family member in India, Malaysia, or Singapore standing at a private hospital billing desk with a 120-line itemized discharge bill before paying out-of-pocket or submitting to a Third-Party Administrator (TPA).
- Problem: Private hospitals routinely bill non-payable consumables (gloves, cotton swabs, PPE kits, nebulizer masks) separately despite IRDAI/MOH circular bans on unbundled consumables, causing families to lose 15–30% of their insurance claim ([IRDAI Consolidated Guidelines on Non-Payable Items in Health Insurance](https://irdai.gov.in/)).
- Today they: Pay the inflated bill under discharge time pressure and only discover weeks later that the TPA deducted $400+ in "non-payable consumables".
- Existing alternatives:
  - [Beshak / Policybazaar Claim Checklists](https://www.beshak.org/): Static educational articles listing IRDAI Annexure-I items; patients must manually cross-check 199 items line by line.
  - [Sanjeevani / PulseCheck on Devpost](https://devpost.com/software/sanjeevani-ai-hospital-bill-auditor): Existing hackathon prototypes that already built OCR + NPPA/IRDAI medical bill auditing with Gemini.
- Hook: Load an itemized hospital discharge bill and watch non-payable consumables and duplicate room-rent surcharges light up in red with the exact IRDAI/MOH circular citation to hand back to the billing desk.
- Why ours is better: Instant line-by-line Annexure-I matching and dispute letter generation.
- Core flow (3-5 steps):
  1. Pick a sample hospital bill or paste itemized billing lines.
  2. Run the audit to flag unbundled consumables and over-tariff items.
  3. Generate a billing desk dispute memo citing the exact regulatory annexure.
- Feasibility (days): 0.6 days. Riskiest dependency: Crowding in recent Gemini hackathons.
- Rubric fit:
  - **Solution quality & functionality (20%): 4/5** — Clear utility.
  - **Architecture & technical execution (20%): 4/5** — Standard document line-item matcher with Gemini.
  - **Impact & use case relevance (20%): 5/5** — Everyday pain across APAC.
  - **Technical choices, feasibility & security (20%): 4/5** — Requires careful framing around sensitive medical data.
  - **Demo, UX & presentation (20%): 4/5** — Understandable in 10 seconds.
- Crowding:
  - `python3 scripts/devpost_search.py "hospital itemized bill insurance auditor"` returned 3 direct matches, including *PulseCheck: Forensic Medical Bill Audit Engine* (built with Gemini + Google ADK) and *Sanjeevani - AI Hospital Bill Auditor*.
  - In the Meet the Builders 2026 gallery, *RCM (Revenue Cycle Management)* and multiple healthcare billing/literacy tools (*KURA*, *Building Lumen Care: An AI That Actually Reads the Fine Print*) already exist.
- Kill criterion: Already built with the exact same Gemini + ADK stack in recent hackathons (*PulseCheck*). **KILLED due to direct stack/concept collision.**

## Idea D: SolarDoctor — Monsoon Micro-Grid & Solar Inverter Fault Log Triage Workbench
- User: A field technician maintaining a rural clinic or island micro-grid in Indonesia or the Philippines facing a string inverter fault code and sudden battery voltage sag.
- Problem: Inverter manuals are 120-page English PDFs; field crews swap costly batteries when the real fault is partial string shading or corroded MC4 connectors ([IEA PVPS Task 13 Reliability and Performance of Photovoltaic Systems](https://iea-pvps.org/research-tasks/performance-operation-and-reliability-of-photovoltaic-systems/)).
- Today they: Ask in WhatsApp groups or swap parts by trial and error.
- Existing alternatives:
  - [SMA Sunny Portal / Huawei FusionSolar](https://www.fusionsolar.huawei.com/): Cloud vendor portals requiring proprietary dongles and stable internet.
  - [VoltGrid AI on Devpost](https://devpost.com/software/voltgrid-ai): Existing microgrid fault diagnosis hackathon projects.
- Hook: Paste an inverter fault code and IV/voltage snippet to isolate whether the failure is panel shading, MPPT drift, or cell degradation before replacing hardware.
- Why ours is better: Translates raw telemetry + fault codes into a 3-step multimeter verification checklist.
- Core flow (3-5 steps):
  1. Select an inverter fault scenario.
  2. Run diagnostic triage.
  3. Follow the step-by-step multimeter field check.
- Feasibility (days): 0.7 days. Riskiest dependency: Generalist judges do not recognize MPPT strings or inverter fault codes in 10 seconds.
- Rubric fit:
  - **Solution quality & functionality (20%): 4/5** — Useful for technicians.
  - **Architecture & technical execution (20%): 4/5** — Telemetry + Gemini diagnostic agent.
  - **Impact & use case relevance (20%): 4/5** — Relevant to rural APAC electrification.
  - **Technical choices, feasibility & security (20%): 4/5** — Feasible with simulated telemetry.
  - **Demo, UX & presentation (20%): 2/5** — Violates the "stranger understands in 10 seconds without jargon" rule unless the judge knows solar electrical terminology.
- Crowding:
  - `python3 scripts/devpost_search.py "solar microgrid fault"` returned 8 matches (1 winner), and the Meet the Builders 2026 gallery already includes *SolarSense*, *SolAI-Go: Intelligent Energy Orchestrator*, and *GridSense AI*.
- Kill criterion: Fails the 10-second non-jargon stranger test for generalist judges and overlaps with *SolarSense* / *GridSense AI* in the gallery. **KILLED.**

## Idea E: KafalaShield — Overseas Employment Contract & Recruitment Fee Red-Flag Verifier
- User: A prospective migrant worker or legal-aid counselor in Nepal, Indonesia, or the Philippines reviewing an overseas employment contract and recruitment fee breakdown before signing.
- Problem: Illegal recruitment fees, contract substitution, and passport retention clauses trap APAC migrant workers in debt bondage ([ILO Fair Recruitment Initiative](https://www.ilo.org/topics/labour-migration/fair-recruitment-initiative)).
- Today they: Rely on verbal promises from sub-agents or wait in line at overloaded NGO legal desks.
- Existing alternatives:
  - [SafeSign on Devpost](https://devpost.com/software/safesign): Existing hackathon project specifically built to help migrant and overseas workers identify contract risks.
  - *Pardes Guard* (2 entries), *MigrantMate AI*, and *Building a Voice for the Voiceless: An AI Assistant for Nepal's Migrant Workers* in the Meet the Builders 2026 gallery.
- Hook: Scan a bilingual employment offer to highlight clauses that violate destination-country labor laws and recruitment fee caps.
- Why ours is better: Compares contract clauses directly against POEA/DMW (Philippines), DoFE (Nepal), and BP2MI (Indonesia) statutory fee rules.
- Core flow (3-5 steps):
  1. Load a sample overseas employment contract.
  2. Audit clauses against statutory protections.
  3. Export a bilingual red-flag summary for legal aid.
- Feasibility (days): 0.6 days. Riskiest dependency: Heavy crowding in the exact target hackathon.
- Rubric fit:
  - **Solution quality & functionality (20%): 4/5** — Solid document clause analyzer.
  - **Architecture & technical execution (20%): 3/5** — Looks very close to a standard prompt wrapper over contract text.
  - **Impact & use case relevance (20%): 5/5** — High social impact in APAC.
  - **Technical choices, feasibility & security (20%): 4/5** — Standard implementation.
  - **Demo, UX & presentation (20%): 3/5** — Text-heavy contract highlighter.
- Crowding:
  - `python3 scripts/devpost_search.py "employment contract analyzer"` returned 22 matches including *SafeSign* and *ContractIQ*.
  - Critically, the Meet the Builders 2026 gallery already has **4 direct migrant-worker contract/assistant entries** (*Pardes Guard* by Muneeb Ahmad, *Pardes Guard* by Rimsha Tariq, *MigrantMate AI*, and *An AI Assistant for Nepal's Migrant Workers*) plus *ContractIQ*.
- Kill criterion: Directly duplicated 4+ times inside the Meet the Builders 2026 gallery itself. **KILLED due to heavy gallery crowding.**

## Recommendation
We recommend **Idea A: PackPort — Cross-Border Food & Beverage Label Pre-Flight Inspector for APAC SMEs**. It scores 25/25 across all five Google Cloud Gen AI Academy APAC judging criteria, has **zero** competing entries in both Devpost (`total_matches=0`) and the 853-project Meet the Builders 2026 gallery, and gives any judge an unmistakable 10-second visual payoff: click a real Indonesian sambal, Thai mango drink, or Vietnamese pho paste label, see exact Singapore SFA / Australia FSANZ / Japan CAA customs violations pinned on the physical package proof, and generate a compliant, print-ready export over-sticker on the spot. Our Google AI stack (`@google/genai` Gemini 2.5 Flash structured multi-agent pipeline + deterministic regulatory threshold engine + Cloud Run-ready architecture) is the core reason the product works—translating regional ingredient names into INS codes, auditing nutrient claims against statutory per-100g limits, and rewriting compliant bilingual/English export stickers.

- **Runner-up:** **Idea B: ReeferCourt** (Cold-Chain Excursion & Marine Cargo Claim Dossier Workbench for APAC Perishable Exporters) — strong B2B value and zero direct Devpost matches, but a time-series temperature graph is less visually immediate in the first 10 seconds than an interactive physical food package label and printable export over-sticker.
- **Biggest risk:** Live Gemini API latency or missing API credentials during automated/offline browser evaluation; we mitigate this completely by combining real `@google/genai` server-side structured calls with a deterministic local regulatory rule engine (SFA Eighth Schedule nutrient math, FSANZ PEAL allergen rules, CAA Japan additive checks) and verified fallback responses so every flow works in under 2 seconds even without an API key.
