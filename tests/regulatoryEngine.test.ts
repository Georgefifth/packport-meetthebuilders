import { describe, expect, it } from 'vitest';
import {
  buildCustomsReportText,
  buildExportStickerSvgString,
  computeMultiCorridorComparison,
  computePer100,
  detectAdditives,
  detectAllergens,
  inspectLabelDeterministic,
} from '../src/lib/regulatoryEngine';
import { SAMPLE_SKUS } from '../src/lib/sampleSkus';

describe('PackPort APAC Regulatory Rule Engine', () => {
  it('computes exact per-100g / per-100mL nutrient densities and salt equivalent', () => {
    const sambal = SAMPLE_SKUS[0];
    const per100 = computePer100(sambal.nutrition);
    expect(per100.basisUnit).toBe('100g');
    expect(per100.multiplier).toBe(5);
    expect(per100.energyKcal).toBe(340);
    expect(per100.totalSugarsG).toBe(17);
    expect(per100.sodiumMg).toBe(1550);
    expect(per100.saltEquivalentG).toBeCloseTo(3.94, 2);
  });

  it('detects regional Southeast Asian allergens (belacan, kemiri, kicap manis)', () => {
    const sambal = SAMPLE_SKUS[0];
    const allergens = detectAllergens(sambal.ingredientList);
    const names = allergens.map((a) => a.canonicalName);
    expect(names).toContain('Crustacean (Shrimp / Prawn)');
    expect(names).toContain('Tree Nuts (Candlenut)');
    expect(names).toContain('Soybean');
  });

  it('maps food additives to INS numbers and functional classes', () => {
    const sambal = SAMPLE_SKUS[0];
    const additives = detectAdditives(sambal.ingredientList);
    expect(additives.map((a) => a.insNumber)).toEqual(['INS 211', 'INS 621']);
  });

  it('flags customs holds on Bali Crispy Prawn Sambal for Singapore SFA and resolves to 100% when fixed', () => {
    const sambal = SAMPLE_SKUS[0];
    const initial = inspectLabelDeterministic(sambal, []);
    expect(initial.verdictStamp).toBe('Hold: Relabel Required');
    expect(initial.readinessScore).toBeLessThan(100);
    expect(initial.findings.length).toBeGreaterThanOrEqual(4);

    const allIds = initial.findings.map((f) => f.id);
    const resolved = inspectLabelDeterministic(sambal, allIds);
    expect(resolved.verdictStamp).toBe('Cleared for Export');
    expect(resolved.readinessScore).toBe(100);
    const svg = buildExportStickerSvgString(resolved);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Cleared for Export');
    expect(svg).toContain('INS 211');
    expect(svg).toContain('INS 621');
    expect(svg).toContain('Soybean');
    expect(svg).toContain('Singapore 619736');
    expect(svg).toContain('<tspan font-weight="700">');
  });

  it('flags Australia FSANZ PEAL allergen and Low Sugar violations on Chiang Mai Mango Drink', () => {
    const mango = SAMPLE_SKUS[1];
    const res = inspectLabelDeterministic(mango, []);
    expect(res.destinationMarket).toBe('AU_FSANZ');
    expect(res.verdictStamp).toBe('Hold: Relabel Required');
    expect(res.findings.some((f) => f.id === 'finding-allergen-declaration')).toBe(true);
    expect(res.findings.some((f) => f.id === 'finding-low-sugar-threshold')).toBe(true);
  });

  it('flags Japan CAA High Protein and Zero Salt violations on Saigon Matcha Oat Bar', () => {
    const oatBar = SAMPLE_SKUS[2];
    const res = inspectLabelDeterministic(oatBar, []);
    expect(res.destinationMarket).toBe('JP_CAA');
    expect(res.verdictStamp).toBe('Hold: Relabel Required');
    expect(res.findings.some((f) => f.id === 'finding-high-protein-threshold')).toBe(true);
    expect(res.findings.some((f) => f.id === 'finding-zero-salt-threshold')).toBe(true);
  });

  it('computes multi-corridor comparison across SG_SFA, AU_FSANZ, and JP_CAA and builds plain-text customs report', () => {
    const sambal = SAMPLE_SKUS[0];
    const initial = inspectLabelDeterministic(sambal, []);
    const rowsBefore = computeMultiCorridorComparison(sambal, 'SG_SFA', []);
    expect(rowsBefore).toHaveLength(3);
    expect(rowsBefore[0].marketName).toBe('Singapore (SFA)');
    expect(rowsBefore[0].isActive).toBe(true);
    expect(rowsBefore[0].verdictStamp).toBe('Hold: Relabel Required');

    const allIds = initial.findings.map((f) => f.id);
    const rowsAfter = computeMultiCorridorComparison(sambal, 'SG_SFA', allIds);
    expect(rowsAfter[0].readinessScore).toBe(100);
    expect(rowsAfter[0].verdictStamp).toBe('Cleared for Export');

    const reportTxt = buildCustomsReportText(sambal, inspectLabelDeterministic(sambal, allIds));
    expect(reportTxt).toContain('PACKPORT — APAC EXPORT CUSTOMS PRE-FLIGHT INSPECTION REPORT');
    expect(reportTxt).toContain('Bali Crispy Prawn & Candlenut Sambal');
    expect(reportTxt).toContain('Cleared for Export');
  });
});
