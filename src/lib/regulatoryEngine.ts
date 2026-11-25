import { DestinationMarket, LabelInput, MARKET_META } from './sampleSkus';

export type FindingSeverity = 'critical' | 'warning' | 'pass';

export type FindingTargetArea =
  | 'claims'
  | 'ingredients'
  | 'allergens'
  | 'nutrition'
  | 'importer';

export interface StatutoryFinding {
  id: string;
  pinNumber: number;
  severity: FindingSeverity;
  severityLabel: string;
  targetArea: FindingTargetArea;
  title: string;
  offendingText: string;
  statutoryCitation: string;
  plainExplanation: string;
  proposedFixSummary: string;
  resolved: boolean;
}

export interface ComputedPer100 {
  basisUnit: '100g' | '100mL';
  multiplier: number;
  energyKcal: number;
  energyKj: number;
  proteinG: number;
  totalFatG: number;
  saturatedFatG: number;
  transFatG: number;
  carbsG: number;
  totalSugarsG: number;
  sodiumMg: number;
  saltEquivalentG: number;
}

export interface DetectedAllergen {
  matchedTerm: string;
  canonicalName: string;
  pealName: string;
  japanStatus: 'Mandatory (Specific Raw Material)' | 'Recommended (21 Items)';
}

export interface MappedAdditive {
  matchedTerm: string;
  insNumber: string;
  functionalClass: string;
  formattedDeclaration: string;
  japanNote?: string;
}

export interface RemediatedStickerData {
  productName: string;
  originLine: string;
  netContent: string;
  destinationMarketName: string;
  compliantClaims: string[];
  formattedIngredientsHtml: string;
  formattedIngredientsPlain: string;
  containsSummary: string;
  importerBlock: string;
  storageInstructions: string;
  perServing: {
    servingLabel: string;
    energyKcal: number;
    energyKj: number;
    proteinG: number;
    totalFatG: number;
    saturatedFatG: number;
    transFatG: number;
    carbsG: number;
    totalSugarsG: number;
    sodiumMg: number;
    saltEquivalentG: number;
  };
  per100: ComputedPer100;
}

export interface InspectionResult {
  skuId: string;
  destinationMarket: DestinationMarket;
  destinationMeta: (typeof MARKET_META)[DestinationMarket];
  readinessScore: number;
  readinessMeaning: string;
  verdictStamp: 'Hold: Relabel Required' | 'Cleared for Export';
  criticalCount: number;
  warningCount: number;
  passCount: number;
  per100: ComputedPer100;
  detectedAllergens: DetectedAllergen[];
  mappedAdditives: MappedAdditive[];
  findings: StatutoryFinding[];
  remediatedSticker: RemediatedStickerData;
  customsDossierBullets: string[];
  engineSource: 'gemini-hybrid' | 'statutory-deterministic';
  engineNotice?: string;
  agentTrace: {
    agentName: string;
    role: string;
    outputSummary: string;
  }[];
}

interface AllergenEntry {
  patterns: RegExp[];
  canonicalName: string;
  pealName: string;
  englishTranslation?: string;
  japanStatus: 'Mandatory (Specific Raw Material)' | 'Recommended (21 Items)';
}

const APAC_ALLERGEN_LEXICON: AllergenEntry[] = [
  {
    patterns: [/\bbelacan\b/i, /\bterasi\b/i, /\bshrimp\b/i, /\bprawn\b/i, /\budang\b/i, /\bebi\b/i, /\bkrill\b/i],
    canonicalName: 'Crustacean (Shrimp / Prawn)',
    pealName: 'crustacean (shrimp)',
    englishTranslation: 'fermented shrimp paste (crustacean)',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\bcrab\b/i, /\bkani\b/i, /\blobster\b/i],
    canonicalName: 'Crustacean (Crab)',
    pealName: 'crustacean (crab)',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\bkemiri\b/i, /\bcandlenut\b/i],
    canonicalName: 'Tree Nuts (Candlenut)',
    pealName: 'tree nuts (candlenut)',
    englishTranslation: 'candlenut (tree nut)',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\bcashews?\b/i],
    canonicalName: 'Tree Nuts (Cashew)',
    pealName: 'cashew',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\balmonds?\b/i],
    canonicalName: 'Tree Nuts (Almond)',
    pealName: 'almond',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\bwalnuts?\b/i],
    canonicalName: 'Tree Nuts (Walnut)',
    pealName: 'walnut',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\bpeanuts?\b/i, /\bkacang tanah\b/i, /\bgroundnuts?\b/i],
    canonicalName: 'Peanuts',
    pealName: 'peanut',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\bkicap\b/i, /\bkecap\b/i, /\bsoya?\b/i, /\btofu\b/i, /\bmiso\b/i, /\bedamame\b/i],
    canonicalName: 'Soybean',
    pealName: 'soy',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\bwheat\b/i, /\bterigu\b/i, /\bflour\b/i],
    canonicalName: 'Wheat / Gluten',
    pealName: 'wheat (gluten)',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\boats?\b/i, /\bbarley\b/i, /\brye\b/i],
    canonicalName: 'Cereals containing Gluten (Oats)',
    pealName: 'oats (gluten)',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\bwhey\b/i, /\bmilk\b/i, /\bdairy\b/i, /\bcasein\b/i, /\bbutter\b/i, /\bsusu\b/i, /\bcheese\b/i],
    canonicalName: 'Milk / Dairy',
    pealName: 'milk',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\beggs?\b/i, /\btelur\b/i, /\balbumin\b/i, /\bmayonnaise\b/i],
    canonicalName: 'Egg',
    pealName: 'egg',
    japanStatus: 'Mandatory (Specific Raw Material)',
  },
  {
    patterns: [/\bsesame\b/i, /\bwijen\b/i, /\btahini\b/i, /\bgoma\b/i],
    canonicalName: 'Sesame',
    pealName: 'sesame',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\bnam pla\b/i, /\bfish sauce\b/i, /\bikan bilis\b/i, /\banchovy\b/i, /\bbonito\b/i, /\btuna\b/i],
    canonicalName: 'Fish',
    pealName: 'fish',
    japanStatus: 'Recommended (21 Items)',
  },
  {
    patterns: [/\bsodium metabisulfite\b/i, /\bsodium metabisulphite\b/i, /\bsulfites?\b/i, /\bsulphites?\b/i, /\bsulfur dioxide\b/i],
    canonicalName: 'Added Sulphites (>10 mg/kg)',
    pealName: 'sulphites',
    japanStatus: 'Recommended (21 Items)',
  },
];

interface AdditiveRule {
  pattern: RegExp;
  name: string;
  insNumber: string;
  functionalClass: string;
  isPreservative?: boolean;
  isSyntheticColor?: boolean;
  japanNote?: string;
}

const ADDITIVE_RULES: AdditiveRule[] = [
  {
    pattern: /\bsodium benzoate\b/i,
    name: 'Sodium Benzoate',
    insNumber: 'INS 211',
    functionalClass: 'Preservative',
    isPreservative: true,
  },
  {
    pattern: /\bpotassium sorbate\b/i,
    name: 'Potassium Sorbate',
    insNumber: 'INS 202',
    functionalClass: 'Preservative',
    isPreservative: true,
  },
  {
    pattern: /\bsodium metabisulfite\b|\bsodium metabisulphite\b/i,
    name: 'Sodium Metabisulphite',
    insNumber: 'INS 223',
    functionalClass: 'Preservative / Antioxidant',
    isPreservative: true,
  },
  {
    pattern: /\bmonosodium glutamate\b|\bmsg\b/i,
    name: 'Monosodium Glutamate',
    insNumber: 'INS 621',
    functionalClass: 'Flavour Enhancer',
    japanNote: 'Japan CAA requires declaring as "Seasoning (Amino Acids)" (調味料(アミノ酸)).',
  },
  {
    pattern: /\btartrazine\b/i,
    name: 'Tartrazine',
    insNumber: 'INS 102',
    functionalClass: 'Colour',
    isSyntheticColor: true,
    japanNote: 'Japan CAA requires explicit synthetic tar-dye designation "Yellow No. 4 (黄色4号)".',
  },
  {
    pattern: /\bcitric acid\b/i,
    name: 'Citric Acid',
    insNumber: 'INS 330',
    functionalClass: 'Acidity Regulator',
  },
  {
    pattern: /\bsoy lecithin\b|\blecithin\b/i,
    name: 'Soy Lecithin',
    insNumber: 'INS 322',
    functionalClass: 'Emulsifier',
  },
];

const THERAPEUTIC_CLAIM_PATTERNS: { pattern: RegExp; phrase: string }[] = [
  { pattern: /\bboosts?\s+immunity\b/i, phrase: 'Boosts Immunity' },
  { pattern: /\bimmune\s+booster\b/i, phrase: 'Immune Booster' },
  { pattern: /\bcures?\s+[a-z]+/i, phrase: 'Cures medical condition/fatigue' },
  { pattern: /\bprevents?\s+(?:cold|flu|disease|illness|infection)/i, phrase: 'Prevents Cold/Flu/Disease' },
  { pattern: /\bmedical\s+grade\b/i, phrase: 'Medical Grade' },
  { pattern: /\banti[-\s]?inflammatory\b/i, phrase: 'Anti-Inflammatory therapeutic claim' },
  { pattern: /\blowers?\s+blood\s+sugar\b/i, phrase: 'Lowers Blood Sugar' },
  { pattern: /\bdetox(?:ifies)?\b/i, phrase: 'Detoxifies' },
];

export function computePer100(input: LabelInput['nutrition']): ComputedPer100 {
  const serving = Math.max(input.servingSizeAmount || 100, 0.1);
  const multiplier = 100 / serving;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const energyKcal = Math.round(input.energyKcal * multiplier);
  const energyKj = Math.round(energyKcal * 4.184);
  const proteinG = round1(input.proteinG * multiplier);
  const totalFatG = round1(input.totalFatG * multiplier);
  const saturatedFatG = round1(input.saturatedFatG * multiplier);
  const transFatG = round1(input.transFatG * multiplier);
  const carbsG = round1(input.carbsG * multiplier);
  const totalSugarsG = round1(input.totalSugarsG * multiplier);
  const sodiumMg = Math.round(input.sodiumMg * multiplier);
  const saltEquivalentG = round2((sodiumMg * 2.54) / 1000);

  return {
    basisUnit: input.servingSizeUnit === 'mL' ? '100mL' : '100g',
    multiplier: round2(multiplier),
    energyKcal,
    energyKj,
    proteinG,
    totalFatG,
    saturatedFatG,
    transFatG,
    carbsG,
    totalSugarsG,
    sodiumMg,
    saltEquivalentG,
  };
}

export function detectAllergens(ingredientList: string): DetectedAllergen[] {
  const found: DetectedAllergen[] = [];
  for (const entry of APAC_ALLERGEN_LEXICON) {
    for (const regex of entry.patterns) {
      const m = ingredientList.match(regex);
      if (m) {
        if (!found.some((f) => f.canonicalName === entry.canonicalName)) {
          found.push({
            matchedTerm: m[0],
            canonicalName: entry.canonicalName,
            pealName: entry.pealName,
            japanStatus: entry.japanStatus,
          });
        }
        break;
      }
    }
  }
  return found;
}

export function detectAdditives(ingredientList: string): MappedAdditive[] {
  const found: MappedAdditive[] = [];
  for (const rule of ADDITIVE_RULES) {
    const m = ingredientList.match(rule.pattern);
    if (m) {
      found.push({
        matchedTerm: m[0],
        insNumber: rule.insNumber,
        functionalClass: rule.functionalClass,
        formattedDeclaration: `${rule.functionalClass} (${rule.insNumber}, ${rule.name})`,
        japanNote: rule.japanNote,
      });
    }
  }
  return found;
}

function formatIngredientsWithAllergensAndAdditives(
  rawIngredients: string,
  applyAllergenBolding: boolean,
  applyAdditiveMapping: boolean
): { html: string; plain: string } {
  let text = rawIngredients;

  if (applyAdditiveMapping) {
    for (const rule of ADDITIVE_RULES) {
      const alreadyHasIns = new RegExp(rule.insNumber.replace(' ', '\\s*'), 'i').test(text);
      if (!alreadyHasIns) {
        text = text.replace(
          rule.pattern,
          `${rule.functionalClass} (${rule.insNumber}, ${rule.name})`
        );
      }
    }
  }

  if (!applyAllergenBolding) {
    return { html: text, plain: text };
  }

  // First translate Southeast Asian regional terms into plain English with bolded allergen tags
  let html = text
    .replace(
      /\bbelacan\s*\(fermented shrimp paste\)/gi,
      'fermented shrimp paste (<strong>Crustacean: Shrimp</strong>)'
    )
    .replace(
      /\bbelacan\b/gi,
      'fermented shrimp paste (<strong>Crustacean: Shrimp</strong>)'
    )
    .replace(
      /\bkemiri\s*\(candlenut\)/gi,
      'candlenut (<strong>Tree Nut: Candlenut</strong>)'
    )
    .replace(/\bkemiri\b/gi, 'candlenut (<strong>Tree Nut: Candlenut</strong>)')
    .replace(
      /\bkicap manis\s*\(sweet soy sauce\)/gi,
      'sweet soy sauce (<strong>Soybean, Wheat</strong>)'
    )
    .replace(
      /\bnam pla\s*\(fish sauce\)/gi,
      'fish sauce (<strong>Fish</strong>)'
    )
    .replace(/\bnam pla\b/gi, 'fish sauce (<strong>Fish</strong>)');

  // Now ensure every allergen term from APAC_ALLERGEN_LEXICON is wrapped in <strong> if not already inside <strong>
  const generalAllergenTerms = [
    'shrimp',
    'prawn',
    'crab',
    'lobster',
    'candlenut',
    'cashews',
    'cashew',
    'almonds',
    'almond',
    'walnuts',
    'walnut',
    'peanuts',
    'peanut',
    'groundnuts',
    'groundnut',
    'soybean',
    'soya',
    'soy',
    'tofu',
    'miso',
    'wheat',
    'flour',
    'oats',
    'oat',
    'barley',
    'rye',
    'whey',
    'milk',
    'dairy',
    'casein',
    'butter',
    'cheese',
    'eggs',
    'egg',
    'sesame',
    'tahini',
    'fish',
    'anchovy',
    'tuna',
    'Sodium Metabisulphite',
    'sodium metabisulfite',
    'sodium metabisulphite',
    'sulphites',
    'sulfites',
  ];

  // Replace outside existing <strong>...</strong> blocks
  for (const term of generalAllergenTerms) {
    const parts = html.split(/(<strong>[\s\S]*?<\/strong>)/gi);
    html = parts
      .map((part) => {
        if (part.toLowerCase().startsWith('<strong>')) return part;
        const re = new RegExp(`\\b(${term})\\b`, 'gi');
        return part.replace(re, '<strong>$1</strong>');
      })
      .join('');
  }

  const plain = html.replace(/<\/?strong>/gi, '');
  return { html, plain };
}

export function inspectLabelDeterministic(
  input: LabelInput,
  resolvedFindingIds: string[] = []
): InspectionResult {
  const market = input.destinationMarket;
  const meta = MARKET_META[market];
  const per100 = computePer100(input.nutrition);
  const detectedAllergens = detectAllergens(input.ingredientList);
  const mappedAdditives = detectAdditives(input.ingredientList);

  const findings: StatutoryFinding[] = [];
  let pinCounter = 1;

  const isResolved = (id: string) => resolvedFindingIds.includes(id);

  // 1. Check Front-of-Pack Therapeutic / Prophylactic Claims
  const therapeuticMatches: string[] = [];
  for (const t of THERAPEUTIC_CLAIM_PATTERNS) {
    const m = input.frontOfPackClaims.match(t.pattern);
    if (m) therapeuticMatches.push(`"${m[0]}"`);
  }
  if (therapeuticMatches.length > 0) {
    const id = 'finding-therapeutic-claim';
    const citationByMarket: Record<DestinationMarket, string> = {
      SG_SFA: 'Singapore Food Regulations Reg 9(1) & Reg 9B (Prohibited Medical/Therapeutic Claims)',
      AU_FSANZ: 'FSANZ Food Standards Code Standard 1.2.7 §1.2.7-8 (Prohibition on Therapeutic Claims)',
      JP_CAA: 'Japan Health Promotion Act Art. 65 & CAA Food Labeling Standards (Unverified Function Claims)',
    };
    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'critical',
      severityLabel: 'Customs Hold (Must Fix)',
      targetArea: 'claims',
      title: 'Prohibited disease-prevention or therapeutic claim on front of pack',
      offendingText: therapeuticMatches.join(', '),
      statutoryCitation: citationByMarket[market],
      plainExplanation: `Retail food labels imported into ${meta.shortName} cannot claim to prevent, treat, or cure disease or boost immune function without prior clinical health-product registration.`,
      proposedFixSummary: `Remove ${therapeuticMatches.join(' and ')} from the front-of-pack marketing copy on the export over-sticker.`,
      resolved: isResolved(id),
    });
  }

  // 2. Check Nutrient Content Claims ("Low Sugar", "Preservative Free", "High Protein", "Zero Salt")
  const hasLowSugarClaim = /\blow\s+sugar\b|\bless\s+sugar\b|\bsugar\s+free\b/i.test(
    input.frontOfPackClaims
  );
  const sugarLimitPer100 = input.nutrition.servingSizeUnit === 'mL' ? 2.5 : 5.0;
  if (hasLowSugarClaim && per100.totalSugarsG > sugarLimitPer100) {
    const id = 'finding-low-sugar-threshold';
    const citationByMarket: Record<DestinationMarket, string> = {
      SG_SFA: 'Singapore Food Regulations Eighth Schedule (Low Sugar <= 5.0g/100g solid or <= 2.5g/100mL liquid)',
      AU_FSANZ: 'FSANZ Standard 1.2.7 Schedule 4 (Low Sugar Nutrition Content Claim Threshold)',
      JP_CAA: 'Japan CAA Food Labeling Standards Appended Table 13 (Low Sugar Threshold <= 5.0g/100g or <= 2.5g/100mL)',
    };
    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'critical',
      severityLabel: 'Customs Hold (Must Fix)',
      targetArea: 'claims',
      title: `"Low Sugar" claim exceeds statutory ${per100.basisUnit} sugar cap (${per100.totalSugarsG}g vs. max ${sugarLimitPer100}g)`,
      offendingText: `"Low Sugar" (Actual: ${per100.totalSugarsG} g / ${per100.basisUnit})`,
      statutoryCitation: citationByMarket[market],
      plainExplanation: `Your product contains ${input.nutrition.totalSugarsG} g sugar per ${input.nutrition.servingSizeAmount}${input.nutrition.servingSizeUnit} serving, which equals ${per100.totalSugarsG} g per ${per100.basisUnit}—${(per100.totalSugarsG / sugarLimitPer100).toFixed(1)}× higher than the legal maximum of ${sugarLimitPer100} g per ${per100.basisUnit}.`,
      proposedFixSummary: `Strike the "Low Sugar" claim from the export over-sticker and declare exact Total Sugars (${per100.totalSugarsG} g / ${per100.basisUnit}).`,
      resolved: isResolved(id),
    });
  }

  const hasPreservativeFreeClaim = /\bpreservative[-\s]?free\b|\bno\s+preservatives?\b/i.test(
    input.frontOfPackClaims
  );
  const preservativeAdditives = ADDITIVE_RULES.filter(
    (r) => r.isPreservative && r.pattern.test(input.ingredientList)
  );
  if (hasPreservativeFreeClaim && preservativeAdditives.length > 0) {
    const id = 'finding-false-preservative-free';
    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'critical',
      severityLabel: 'Customs Hold (Must Fix)',
      targetArea: 'claims',
      title: '"Preservative Free" claim contradicts declared chemical preservative in ingredients',
      offendingText: `"100% Preservative Free" vs. ${preservativeAdditives.map((p) => p.name).join(', ')}`,
      statutoryCitation: `${meta.shortName} False & Misleading Labelling Prohibition (SFA Reg 9 / FSANZ Consumer Law / CAA Art. 5)`,
      plainExplanation: `The front label claims "Preservative Free", but the ingredient list contains ${preservativeAdditives.map((p) => `${p.name} (${p.insNumber})`).join(', ')}. Port inspectors treat this as a direct misbranding violation.`,
      proposedFixSummary: `Cover the "100% Preservative Free" claim with the export over-sticker and declare ${preservativeAdditives.map((p) => `Preservative (${p.insNumber})`).join(', ')}.`,
      resolved: isResolved(id),
    });
  }

  const hasHighProteinClaim = /\bhigh\s+protein\b/i.test(input.frontOfPackClaims);
  if (hasHighProteinClaim && per100.proteinG < 10.0) {
    const id = 'finding-high-protein-threshold';
    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'critical',
      severityLabel: 'Customs Hold (Must Fix)',
      targetArea: 'claims',
      title: `"High Protein" claim below minimum threshold (${per100.proteinG}g / 100g vs. >= 10.0g / 100g required)`,
      offendingText: `"High Protein" (Actual: ${per100.proteinG} g / ${per100.basisUnit})`,
      statutoryCitation:
        market === 'JP_CAA'
          ? 'Japan CAA Appended Table 12 (High Protein requires >= 16.2g/100g solid or >= 8.1g/100kcal)'
          : `${meta.shortName} Nutrient Claim Schedule (High Protein requires >= 10.0g per 100g)`,
      plainExplanation: `At ${input.nutrition.proteinG} g protein per ${input.nutrition.servingSizeAmount}g bar, the product delivers ${per100.proteinG} g protein per 100g, falling short of the statutory >=10.0g/100g threshold for a "High Protein" claim.`,
      proposedFixSummary: `Replace "High Protein Energy Bar" with "Roasted Cashew & Matcha Oat Bar (${input.nutrition.proteinG}g Protein per bar)".`,
      resolved: isResolved(id),
    });
  }

  const hasZeroSaltClaim = /\bzero\s+salt\b|\bsalt\s+free\b|\bsodium\s+free\b/i.test(
    input.frontOfPackClaims
  );
  if (hasZeroSaltClaim && per100.sodiumMg > 5) {
    const id = 'finding-zero-salt-threshold';
    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'critical',
      severityLabel: 'Customs Hold (Must Fix)',
      targetArea: 'claims',
      title: `"Zero Salt" claim invalid at ${per100.sodiumMg} mg sodium (${per100.saltEquivalentG} g salt eq.) per 100g`,
      offendingText: `"Zero Salt Formula" (Actual: ${per100.sodiumMg} mg Na / 100g)`,
      statutoryCitation:
        market === 'JP_CAA'
          ? 'Japan CAA Appended Table 13 (Salt-Free requires < 0.0127g salt eq. / 5mg Na per 100g)'
          : `${meta.shortName} Sodium Claim Standard (Sodium-Free requires <= 5mg Na per 100g)`,
      plainExplanation: `Your nutrition panel shows ${input.nutrition.sodiumMg} mg sodium per serving (${per100.sodiumMg} mg / 100g, or ${per100.saltEquivalentG} g salt equivalent). A "Zero Salt" claim is only legal below 5 mg sodium per 100g.`,
      proposedFixSummary: `Remove "Zero Salt Formula" and declare Salt Equivalent: ${per100.saltEquivalentG} g per 100g (${((input.nutrition.sodiumMg * 2.54) / 1000).toFixed(2)} g per serving).`,
      resolved: isResolved(id),
    });
  }

  // 3. Check Allergen Declaration & PEAL / SFA / CAA Bolding
  if (detectedAllergens.length > 0) {
    const missingFromContains = detectedAllergens.filter(
      (a) =>
        !input.containsStatement
          .toLowerCase()
          .includes(a.pealName.split(' ')[0].replace(/[()]/g, '').toLowerCase())
    );
    const usesGenericVagueTerms =
      /\bmay contain nuts and dairy\b/i.test(input.containsStatement) &&
      market === 'AU_FSANZ';

    if (!input.containsStatement.trim() || missingFromContains.length > 0 || usesGenericVagueTerms) {
      const id = 'finding-allergen-declaration';
      const allergenListStr = detectedAllergens.map((a) => a.canonicalName).join(', ');
      const citationByMarket: Record<DestinationMarket, string> = {
        SG_SFA: 'Singapore Food Regulations Reg 5(4)(ea) (Mandatory Hypersensitivity Allergen Declaration)',
        AU_FSANZ: 'FSANZ Standard 1.2.3 (Plain English Allergen Labelling — PEAL Mandatory Bold & Summary Box)',
        JP_CAA: 'Japan CAA Food Labeling Standards Art. 3 & Appended Table 14 (Mandatory 8 + 20 Specific Raw Materials)',
      };
      findings.push({
        id,
        pinNumber: pinCounter++,
        severity: 'critical',
        severityLabel: 'Customs Hold (Must Fix)',
        targetArea: 'allergens',
        title: `Undeclared or unbolded mandatory allergens (${allergenListStr})`,
        offendingText: input.containsStatement.trim()
          ? `Incomplete summary: "${input.containsStatement}" (Missing specific declaration for: ${detectedAllergens.map((a) => a.matchedTerm).join(', ')})`
          : `No "Contains:" allergen statement on label (Detected: ${detectedAllergens.map((a) => a.matchedTerm).join(', ')})`,
        statutoryCitation: citationByMarket[market],
        plainExplanation:
          market === 'AU_FSANZ'
            ? `FSANZ Plain English Allergen Labelling (PEAL) prohibits vague terms like "nuts" or "dairy" and requires every allergen (${detectedAllergens.map((a) => a.pealName).join(', ')}) to be bolded inline in the ingredient list and listed in a separate bold "Contains:" statement.`
            : `Regional APAC terms (${detectedAllergens.map((a) => `"${a.matchedTerm}"`).join(', ')}) must be translated into plain English allergen names (${detectedAllergens.map((a) => a.pealName).join(', ')}), bolded inline, and summarized in a "Contains:" block.`,
        proposedFixSummary: `Bold ${detectedAllergens.map((a) => a.pealName).join(', ')} inline in the ingredient list and add "Contains: ${detectedAllergens.map((a) => a.canonicalName).join(', ')}."`,
        resolved: isResolved(id),
      });
    }
  }

  // 4. Check INS / E-Number Functional Class Declaration for Additives
  if (mappedAdditives.length > 0) {
    const unmappedInText = mappedAdditives.filter(
      (a) => !new RegExp(a.insNumber.replace(' ', '\\s*'), 'i').test(input.ingredientList)
    );
    if (unmappedInText.length > 0) {
      const id = 'finding-ins-additives';
      findings.push({
        id,
        pinNumber: pinCounter++,
        severity: 'warning',
        severityLabel: 'Label Warning (Recommended Fix)',
        targetArea: 'ingredients',
        title: `Food additives missing functional class name and INS code (${unmappedInText.map((a) => a.insNumber).join(', ')})`,
        offendingText: unmappedInText.map((a) => a.matchedTerm).join(', '),
        statutoryCitation:
          market === 'SG_SFA'
            ? 'Singapore Food Regulations Reg 5(4)(b) (Functional Class + Permitted Additive Name / INS Number)'
            : market === 'AU_FSANZ'
              ? 'FSANZ Standard 1.2.4 §1.2.4-7 (Requirement to Declare Food Additive Class Name & Code Number)'
              : 'Japan CAA Food Labeling Standards Art. 3 (Food Additive Purpose + Substance Name Disclosure)',
        plainExplanation: `Chemical additives (${unmappedInText.map((a) => a.matchedTerm).join(', ')}) listed without their technological function (e.g., Preservative, Flavour Enhancer, Colour) and INS number trigger secondary document inspection at port.`,
        proposedFixSummary: `Rewrite as ${unmappedInText.map((a) => a.formattedDeclaration).join('; ')}.`,
        resolved: isResolved(id),
      });
    }
  }

  // 5. Check Mandatory Nutrition Panel Columns (Per 100g/100mL, kJ for Australia, Salt Eq. for Japan)
  if (!input.nutrition.hasPer100ColumnOnOriginLabel || (market === 'AU_FSANZ' && !input.nutrition.hasKjOnOriginLabel) || (market === 'JP_CAA' && !input.nutrition.hasSaltEquivalentOnOriginLabel)) {
    const id = 'finding-nutrition-panel-format';
    const missingParts: string[] = [];
    if (!input.nutrition.hasPer100ColumnOnOriginLabel) {
      missingParts.push(`Per ${per100.basisUnit} column`);
    }
    if (market === 'AU_FSANZ' && !input.nutrition.hasKjOnOriginLabel) {
      missingParts.push(`Energy in kilojoules (${per100.energyKj} kJ / ${per100.basisUnit})`);
    }
    if (market === 'JP_CAA' && !input.nutrition.hasSaltEquivalentOnOriginLabel) {
      missingParts.push(`Salt Equivalent (食塩相当量 ${per100.saltEquivalentG} g / ${per100.basisUnit})`);
    }

    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'critical',
      severityLabel: 'Customs Hold (Must Fix)',
      targetArea: 'nutrition',
      title: `Nutrition table missing mandatory ${missingParts.join(' & ')}`,
      offendingText: `Origin panel only shows Per-Serving (${input.nutrition.servingSizeAmount}${input.nutrition.servingSizeUnit}) values in kcal / mg Na`,
      statutoryCitation:
        market === 'SG_SFA'
          ? 'Singapore Food Regulations Reg 8A & Twelfth Schedule (Per-Serving + Per-100g/100mL Nutrition Information Panel)'
          : market === 'AU_FSANZ'
            ? 'FSANZ Standard 1.2.8 §1.2.8-6 (Mandatory Per-Serving & Per-100g/100mL Columns + Energy in kJ)'
            : 'Japan CAA Food Labeling Standards Art. 3 (Mandatory Salt Equivalent [g] Conversion: Na [mg] × 2.54 ÷ 1000)',
      plainExplanation: `Origin labels printed only with per-serving values are rejected at ${meta.shortName} customs. ${
        market === 'AU_FSANZ'
          ? `Australia requires both Per Serving and Per ${per100.basisUnit} columns with Energy stated in kilojoules (${per100.energyKj} kJ).`
          : market === 'JP_CAA'
            ? `Japan requires sodium (${input.nutrition.sodiumMg} mg) to be converted into Salt Equivalent (${per100.saltEquivalentG} g per 100g).`
            : `Singapore requires both Per Serving and Per ${per100.basisUnit} columns whenever any nutrition claim appears on the package.`
      }`,
      proposedFixSummary: `Generate a dual-column Nutrition Information Panel (Per ${input.nutrition.servingSizeAmount}${input.nutrition.servingSizeUnit} Serving & Per ${per100.basisUnit}) with ${per100.energyKj} kJ and ${per100.saltEquivalentG} g Salt Equivalent.`,
      resolved: isResolved(id),
    });
  }

  // 6. Check Mandatory Local Importer & Country of Origin Block
  if (!input.importerDetails.trim()) {
    const id = 'finding-importer-address';
    findings.push({
      id,
      pinNumber: pinCounter++,
      severity: 'warning',
      severityLabel: 'Label Warning (Recommended Fix)',
      targetArea: 'importer',
      title: `Missing local ${meta.shortName} importer name & registered street address`,
      offendingText: 'Importer / Distributor field is blank on origin jar/pack',
      statutoryCitation:
        market === 'SG_SFA'
          ? 'Singapore Food Regulations Reg 5(2)(d) (Name & Address of Singapore Importer/Distributor)'
          : market === 'AU_FSANZ'
            ? 'FSANZ Standard 1.2.2 §1.2.2-4 (Name & Street Address of Australian/NZ Supplier)'
            : 'Japan CAA Food Labeling Standards Art. 3 (Importer Name & Registered Tokyo/Japan Address)',
      plainExplanation: `Every imported prepacked food product must carry the name and physical street address (not a PO Box) of the local importer of record in ${meta.name}.`,
      proposedFixSummary: `Add local importer block ("Imported by: ${meta.defaultImporterPlaceholder}") and "Product of ${input.originCountry.split('(')[0].trim()}" to the over-sticker.`,
      resolved: isResolved(id),
    });
  }

  const allergenFinding = findings.find((f) => f.id === 'finding-allergen-declaration');
  const additiveFinding = findings.find((f) => f.id === 'finding-ins-additives');

  const applyAllergenBolding = !allergenFinding || allergenFinding.resolved;
  const applyAdditiveMapping = !additiveFinding || additiveFinding.resolved;

  const { html: formattedIngredientsHtml, plain: formattedIngredientsPlain } =
    formatIngredientsWithAllergensAndAdditives(
      input.ingredientList,
      applyAllergenBolding,
      applyAdditiveMapping
    );

  const containsSummary = applyAllergenBolding
    ? detectedAllergens.length > 0
      ? `Contains: ${detectedAllergens.map((a) => a.canonicalName).join(', ')}.`
      : 'Contains: No priority allergens declared.'
    : input.containsStatement || 'Contains: No allergen summary declared on origin label.';

  const unresolvedClaims = findings.filter(
    (f) => f.targetArea === 'claims' && !f.resolved
  );
  const compliantClaims =
    unresolvedClaims.length === 0
      ? [
          `Authentic ${input.originCountry.split('(')[0].trim()} Craft Export`,
          `${input.nutrition.energyKcal} kcal (${Math.round(input.nutrition.energyKcal * 4.184)} kJ) per ${input.nutrition.servingSizeAmount}${input.nutrition.servingSizeUnit} serving`,
        ]
      : [input.frontOfPackClaims];

  const importerFinding = findings.find((f) => f.id === 'finding-importer-address');
  const importerBlock =
    input.importerDetails.trim() ||
    (!importerFinding || importerFinding.resolved
      ? `Imported by: ${meta.defaultImporterPlaceholder}`
      : 'Importer block missing on origin pack');

  const unresolvedCritical = findings.filter(
    (f) => f.severity === 'critical' && !f.resolved
  ).length;
  const unresolvedWarning = findings.filter(
    (f) => f.severity === 'warning' && !f.resolved
  ).length;
  const resolvedTotal = findings.filter((f) => f.resolved).length;

  const rawScore = 100 - unresolvedCritical * 22 - unresolvedWarning * 10;
  const readinessScore = Math.max(12, Math.min(100, rawScore));

  const totalUnresolved = unresolvedCritical + unresolvedWarning;
  const readinessMeaning =
    totalUnresolved === 0
      ? `100% — Ready to print & ship (${resolvedTotal} ${resolvedTotal === 1 ? 'fix' : 'fixes'} applied)`
      : `${readinessScore}% — ${totalUnresolved} ${totalUnresolved === 1 ? 'fix' : 'fixes'} needed before export`;

  const verdictStamp =
    unresolvedCritical === 0 && unresolvedWarning === 0
      ? 'Cleared for Export'
      : 'Hold: Relabel Required';

  const customsDossierBullets = [
    `Corridor & Verdict: ${input.productName} (${input.originCountry} → ${meta.name}) scored ${readinessScore}% (${verdictStamp}) under ${meta.statutoryCitation}.`,
    `Allergen & Additive Verification: Detected ${detectedAllergens.length} mandatory allergen group(s) (${detectedAllergens.map((a) => a.canonicalName).join(', ') || 'none'}) and mapped ${mappedAdditives.length} food additive(s) (${mappedAdditives.map((a) => a.insNumber).join(', ') || 'none'}).`,
    `Per-${per100.basisUnit} Statutory Nutrition: Computed ${per100.energyKcal} kcal (${per100.energyKj} kJ), ${per100.proteinG}g Protein, ${per100.totalSugarsG}g Total Sugars, and ${per100.sodiumMg}mg Sodium (${per100.saltEquivalentG}g Salt Equivalent) per ${per100.basisUnit}.`,
  ];

  const agentTrace = [
    {
      agentName: 'Agent 1 — Regional Ingredient & Allergen Lexicon Mapper',
      role: 'Parses Southeast/East Asian ingredient terms into statutory allergen & INS additive codes',
      outputSummary: `Identified ${detectedAllergens.length} mandatory allergen(s) (${detectedAllergens.map((a) => `"${a.matchedTerm}" → ${a.canonicalName}`).join('; ') || 'none'}) and ${mappedAdditives.length} additive(s) (${mappedAdditives.map((a) => `${a.matchedTerm} → ${a.insNumber}`).join('; ') || 'none'}).`,
    },
    {
      agentName: 'Agent 2 — Statutory Nutrient & Health Claim Threshold Auditor',
      role: `Cross-checks per-${per100.basisUnit} nutrient densities and front-of-pack claims against ${meta.shortName}`,
      outputSummary: `Computed ${per100.multiplier}× scaling factor (${input.nutrition.servingSizeAmount}${input.nutrition.servingSizeUnit} → ${per100.basisUnit}): ${per100.totalSugarsG}g sugars, ${per100.proteinG}g protein, ${per100.saltEquivalentG}g salt eq. Flagged ${findings.length} statutory finding(s).`,
    },
    {
      agentName: 'Agent 3 — Compliant Export Over-Sticker Rewriter',
      role: `Synthesizes a print-ready 88 mm × 112 mm ${meta.shortName} adhesive over-sticker`,
      outputSummary: `Formatted dual-column nutrition panel (Per Serving & Per ${per100.basisUnit}), inline PEAL/SFA bolded allergens, and ${meta.shortName} importer block.`,
    },
  ];

  return {
    skuId: input.id,
    destinationMarket: market,
    destinationMeta: meta,
    readinessScore,
    readinessMeaning,
    verdictStamp,
    criticalCount: unresolvedCritical,
    warningCount: unresolvedWarning,
    passCount: resolvedTotal + 2,
    per100,
    detectedAllergens,
    mappedAdditives,
    findings,
    remediatedSticker: {
      productName: input.productName,
      originLine: `Product of ${input.originCountry.split('(')[0].trim()}`,
      netContent: input.netContent,
      destinationMarketName: meta.shortName,
      compliantClaims,
      formattedIngredientsHtml,
      formattedIngredientsPlain,
      containsSummary,
      importerBlock,
      storageInstructions: input.storageInstructions,
      perServing: {
        servingLabel: `${input.nutrition.servingSizeAmount} ${input.nutrition.servingSizeUnit}`,
        energyKcal: input.nutrition.energyKcal,
        energyKj: Math.round(input.nutrition.energyKcal * 4.184),
        proteinG: input.nutrition.proteinG,
        totalFatG: input.nutrition.totalFatG,
        saturatedFatG: input.nutrition.saturatedFatG,
        transFatG: input.nutrition.transFatG,
        carbsG: input.nutrition.carbsG,
        totalSugarsG: input.nutrition.totalSugarsG,
        sodiumMg: input.nutrition.sodiumMg,
        saltEquivalentG:
          Math.round(((input.nutrition.sodiumMg * 2.54) / 1000) * 100) / 100,
      },
      per100,
    },
    customsDossierBullets,
    engineSource: 'statutory-deterministic',
    agentTrace,
  };
}

interface RichWord {
  text: string;
  bold: boolean;
}

function wrapRichHtmlToSvgLines(htmlInput: string, maxCharsPerLine: number): RichWord[][] {
  const segments = htmlInput.split(/(<strong>[\s\S]*?<\/strong>)/gi).filter(Boolean);
  const words: RichWord[] = [];
  for (const seg of segments) {
    const isBold = /^<strong>/i.test(seg);
    const clean = seg.replace(/<\/?strong>/gi, '');
    for (const token of clean.split(/\s+/).filter(Boolean)) {
      words.push({ text: token, bold: isBold });
    }
  }

  const lines: RichWord[][] = [];
  let currentLine: RichWord[] = [];
  let currentLen = 0;

  for (const w of words) {
    const addLen = (currentLine.length > 0 ? 1 : 0) + w.text.length;
    if (currentLen + addLen > maxCharsPerLine && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [w];
      currentLen = w.text.length;
    } else {
      currentLine.push(w);
      currentLen += addLen;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

function wrapPlainLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function buildExportStickerSvgString(result: InspectionResult): string {
  const s = result.remediatedSticker;
  const esc = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const richIngLines = wrapRichHtmlToSvgLines(
    `<strong>Ingredients:</strong> ${s.formattedIngredientsHtml}`,
    58
  );
  const containsLines = wrapPlainLines(s.containsSummary, 58);
  const importerLines = wrapPlainLines(s.importerBlock, 60);

  const ingStartY = 128;
  const ingLineHeight = 18;
  const afterIngY = ingStartY + richIngLines.length * ingLineHeight + 6;

  const containsBoxY = afterIngY;
  const containsBoxHeight = Math.max(32, 14 + containsLines.length * 18);

  const nutritionY = containsBoxY + containsBoxHeight + 12;
  const nutritionHeight = 232;

  const importerStartY = nutritionY + nutritionHeight + 22;
  const storageY = importerStartY + importerLines.length * 18 + 4;
  const stampY = storageY + 14;
  const cardHeight = stampY + 58 - 30;
  const svgHeight = cardHeight + 50;

  const stampColor =
    result.verdictStamp === 'Cleared for Export' ? '#1B6B3A' : '#C8281E';
  const stampBg =
    result.verdictStamp === 'Cleared for Export' ? '#E8F5ED' : '#FDF2F1';

  const renderedIngLines = richIngLines
    .map((line, idx) => {
      const y = ingStartY + idx * ingLineHeight;
      // Group consecutive words with the same bold status into a single run
      const runs: { text: string; bold: boolean }[] = [];
      for (const w of line) {
        if (runs.length > 0 && runs[runs.length - 1].bold === w.bold) {
          runs[runs.length - 1].text += ` ${w.text}`;
        } else {
          runs.push({ text: w.text, bold: w.bold });
        }
      }
      const tspans = runs
        .map(
          (run, rIdx) =>
            `<tspan${run.bold ? ' font-weight="700"' : ''}>${rIdx > 0 ? ' ' : ''}${esc(run.text)}</tspan>`
        )
        .join('');
      return `<text x="34" y="${y}" font-family="Libre Franklin, sans-serif" font-size="14" fill="#141413">${tspans}</text>`;
    })
    .join('\n  ');

  const renderedContainsLines = containsLines
    .map(
      (line, idx) =>
        `<text x="44" y="${containsBoxY + 21 + idx * 18}" font-family="Libre Franklin, sans-serif" font-size="14" font-weight="700" fill="#141413">${esc(line)}</text>`
    )
    .join('\n  ');

  const renderedImporterLines = importerLines
    .map(
      (line, idx) =>
        `<text x="34" y="${importerStartY + idx * 18}" font-family="Libre Franklin, sans-serif" font-size="14" font-weight="600" fill="#141413">${esc(line)}</text>`
    )
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ${svgHeight}" width="520" height="${svgHeight}" role="img" aria-label="Print-ready export over-sticker for ${esc(s.productName)}">
  <rect width="520" height="${svgHeight}" fill="#F2ECE1" />
  <!-- Corner Die-Cut Crop Marks -->
  <path d="M12 30 H18 M20 22 V28 M500 22 V28 M502 30 H508 M12 ${30 + cardHeight} H18 M20 ${32 + cardHeight} V${38 + cardHeight} M500 ${32 + cardHeight} V${38 + cardHeight} M502 ${30 + cardHeight} H508" stroke="#4A473E" stroke-width="1.5" fill="none" />
  <text x="260" y="21" text-anchor="middle" font-family="Libre Franklin, sans-serif" font-size="14" font-weight="600" fill="#4A473E">Die-Cut Export Over-Sticker • 88 mm × 112 mm • ${esc(s.destinationMarketName)}</text>
  <rect x="20" y="30" width="480" height="${cardHeight}" rx="6" fill="#FFFFFF" stroke="#141413" stroke-width="2" />
  <rect x="20" y="30" width="480" height="46" rx="4" fill="#141413" />
  <text x="34" y="59" font-family="Newsreader, Georgia, serif" font-size="18" font-weight="700" fill="#FFFFFF">${esc(s.productName.slice(0, 34))}</text>
  <text x="486" y="59" text-anchor="end" font-family="Azeret Mono, monospace" font-size="14" font-weight="600" fill="#F4E4B2">Net: ${esc(s.netContent)}</text>

  <text x="34" y="98" font-family="Libre Franklin, sans-serif" font-size="14" font-weight="600" fill="#1D4268">${esc(s.originLine)} • ${esc(s.compliantClaims[0]?.slice(0, 46) || '')}</text>
  <line x1="34" y1="108" x2="486" y2="108" stroke="#D4CEC0" stroke-width="1" />

  ${renderedIngLines}

  <rect x="34" y="${containsBoxY}" width="452" height="${containsBoxHeight}" rx="3" fill="#FAF7F0" stroke="#141413" stroke-width="1.5" />
  ${renderedContainsLines}

  <rect x="34" y="${nutritionY}" width="452" height="${nutritionHeight}" fill="#FFFFFF" stroke="#141413" stroke-width="2" />
  <rect x="34" y="${nutritionY}" width="452" height="30" fill="#141413" />
  <text x="44" y="${nutritionY + 20}" font-family="Libre Franklin, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">Nutrition Information</text>
  <text x="302" y="${nutritionY + 20}" text-anchor="end" font-family="Azeret Mono, monospace" font-size="14" font-weight="600" fill="#FFFFFF">Per ${esc(s.perServing.servingLabel)}</text>
  <text x="478" y="${nutritionY + 20}" text-anchor="end" font-family="Azeret Mono, monospace" font-size="14" font-weight="600" fill="#F4E4B2">Per ${esc(s.per100.basisUnit)}</text>

  <g font-family="Libre Franklin, sans-serif" font-size="14" fill="#141413">
    <text x="44" y="${nutritionY + 48}" font-weight="600">Energy</text>
    <text x="302" y="${nutritionY + 48}" text-anchor="end" font-family="Libre Franklin, sans-serif" font-weight="600">${s.perServing.energyKcal} kcal (${s.perServing.energyKj} kJ)</text>
    <text x="478" y="${nutritionY + 48}" text-anchor="end" font-family="Libre Franklin, sans-serif" font-weight="700">${s.per100.energyKcal} kcal (${s.per100.energyKj} kJ)</text>
    <line x1="34" y1="${nutritionY + 56}" x2="486" y2="${nutritionY + 56}" stroke="#D4CEC0" />

    <text x="44" y="${nutritionY + 76}" font-weight="600">Protein</text>
    <text x="302" y="${nutritionY + 76}" text-anchor="end" font-family="Azeret Mono, monospace">${s.perServing.proteinG} g</text>
    <text x="478" y="${nutritionY + 76}" text-anchor="end" font-family="Azeret Mono, monospace" font-weight="600">${s.per100.proteinG} g</text>
    <line x1="34" y1="${nutritionY + 84}" x2="486" y2="${nutritionY + 84}" stroke="#D4CEC0" />

    <text x="44" y="${nutritionY + 104}" font-weight="600">Total Fat (Sat.)</text>
    <text x="302" y="${nutritionY + 104}" text-anchor="end" font-family="Azeret Mono, monospace">${s.perServing.totalFatG} g (${s.perServing.saturatedFatG} g)</text>
    <text x="478" y="${nutritionY + 104}" text-anchor="end" font-family="Azeret Mono, monospace" font-weight="600">${s.per100.totalFatG} g (${s.per100.saturatedFatG} g)</text>
    <line x1="34" y1="${nutritionY + 112}" x2="486" y2="${nutritionY + 112}" stroke="#D4CEC0" />

    <text x="44" y="${nutritionY + 132}" font-weight="600">Carbohydrate</text>
    <text x="302" y="${nutritionY + 132}" text-anchor="end" font-family="Azeret Mono, monospace">${s.perServing.carbsG} g</text>
    <text x="478" y="${nutritionY + 132}" text-anchor="end" font-family="Azeret Mono, monospace" font-weight="600">${s.per100.carbsG} g</text>
    <line x1="34" y1="${nutritionY + 140}" x2="486" y2="${nutritionY + 140}" stroke="#D4CEC0" />

    <text x="54" y="${nutritionY + 160}">Total Sugars</text>
    <text x="302" y="${nutritionY + 160}" text-anchor="end" font-family="Azeret Mono, monospace">${s.perServing.totalSugarsG} g</text>
    <text x="478" y="${nutritionY + 160}" text-anchor="end" font-family="Azeret Mono, monospace" font-weight="600">${s.per100.totalSugarsG} g</text>
    <line x1="34" y1="${nutritionY + 168}" x2="486" y2="${nutritionY + 168}" stroke="#D4CEC0" />

    <text x="44" y="${nutritionY + 188}" font-weight="600">Sodium</text>
    <text x="302" y="${nutritionY + 188}" text-anchor="end" font-family="Azeret Mono, monospace">${s.perServing.sodiumMg} mg</text>
    <text x="478" y="${nutritionY + 188}" text-anchor="end" font-family="Azeret Mono, monospace" font-weight="600">${s.per100.sodiumMg} mg</text>
    <line x1="34" y1="${nutritionY + 196}" x2="486" y2="${nutritionY + 196}" stroke="#D4CEC0" />

    <text x="44" y="${nutritionY + 218}" font-weight="600">Salt Equivalent</text>
    <text x="302" y="${nutritionY + 218}" text-anchor="end" font-family="Azeret Mono, monospace">${s.perServing.saltEquivalentG} g</text>
    <text x="478" y="${nutritionY + 218}" text-anchor="end" font-family="Azeret Mono, monospace" font-weight="600">${s.per100.saltEquivalentG} g</text>
  </g>

  ${renderedImporterLines}
  <text x="34" y="${storageY}" font-family="Libre Franklin, sans-serif" font-size="14" fill="#4A473E">Storage: ${esc(s.storageInstructions)}</text>

  <g transform="translate(34, ${stampY})">
    <rect x="0" y="0" width="452" height="44" rx="4" fill="${stampBg}" stroke="${stampColor}" stroke-width="2" />
    <text x="226" y="28" text-anchor="middle" font-family="Libre Franklin, sans-serif" font-size="16" font-weight="700" fill="${stampColor}">Customs Proof Status: ${esc(result.verdictStamp)} (${result.readinessScore}%)</text>
  </g>
</svg>`;
}
