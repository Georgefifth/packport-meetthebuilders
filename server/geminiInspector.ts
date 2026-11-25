import { GoogleGenAI, Type } from '@google/genai';
import {
  InspectionResult,
  inspectLabelDeterministic,
} from '../src/lib/regulatoryEngine';
import { LabelInput } from '../src/lib/sampleSkus';

export async function runHybridLabelInspection(
  input: LabelInput,
  resolvedFindingIds: string[] = [],
  options: { simulateError?: boolean } = {}
): Promise<InspectionResult> {
  // Always compute the deterministic statutory ground-truth first
  const baseResult = inspectLabelDeterministic(input, resolvedFindingIds);

  if (options.simulateError) {
    return {
      ...baseResult,
      engineSource: 'statutory-deterministic',
      engineNotice:
        'Completed inspection using the built-in statutory rule engine so your work is safe (simulated upstream fallback).',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ...baseResult,
      engineSource: 'statutory-deterministic',
      engineNotice:
        'Completed inspection using the built-in statutory rule engine so your work is safe.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a 3-agent APAC Food & Beverage Export Label Compliance Inspector for ${baseResult.destinationMeta.name} (${baseResult.destinationMeta.statutoryCitation}).
Product: ${input.productName} (Origin: ${input.originCountry})
Ingredients: ${input.ingredientList}
Contains Statement: ${input.containsStatement || '(blank)'}
Front-of-pack Claims: ${input.frontOfPackClaims}
Computed Per-${baseResult.per100.basisUnit} Nutrition: ${baseResult.per100.energyKcal} kcal (${baseResult.per100.energyKj} kJ), ${baseResult.per100.proteinG}g protein, ${baseResult.per100.totalSugarsG}g sugars, ${baseResult.per100.sodiumMg}mg sodium (${baseResult.per100.saltEquivalentG}g salt equivalent).

Return concise JSON summaries for the 3-agent trace and 1 compliant front-of-pack tagline without any prohibited medical/therapeutic claims.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            compliantTagline: {
              type: Type.STRING,
              description: 'Compliant front-of-pack description without illegal health claims',
            },
            agent1Summary: {
              type: Type.STRING,
              description: 'Ingredient & Allergen Lexicon Mapper output summary',
            },
            agent2Summary: {
              type: Type.STRING,
              description: 'Statutory Nutrient & Claim Threshold Auditor output summary',
            },
            agent3Summary: {
              type: Type.STRING,
              description: 'Compliant Export Over-Sticker Rewriter output summary',
            },
          },
          required: ['compliantTagline', 'agent1Summary', 'agent2Summary', 'agent3Summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...baseResult,
      engineSource: 'gemini-hybrid',
      remediatedSticker: {
        ...baseResult.remediatedSticker,
        compliantClaims: parsed.compliantTagline
          ? [parsed.compliantTagline, ...baseResult.remediatedSticker.compliantClaims.slice(1)]
          : baseResult.remediatedSticker.compliantClaims,
      },
      agentTrace: [
        {
          ...baseResult.agentTrace[0],
          outputSummary: parsed.agent1Summary || baseResult.agentTrace[0].outputSummary,
        },
        {
          ...baseResult.agentTrace[1],
          outputSummary: parsed.agent2Summary || baseResult.agentTrace[1].outputSummary,
        },
        {
          ...baseResult.agentTrace[2],
          outputSummary: parsed.agent3Summary || baseResult.agentTrace[2].outputSummary,
        },
      ],
    };
  } catch {
    return {
      ...baseResult,
      engineSource: 'statutory-deterministic',
      engineNotice:
        'Completed inspection using the built-in statutory rule engine so your work is safe.',
    };
  }
}
