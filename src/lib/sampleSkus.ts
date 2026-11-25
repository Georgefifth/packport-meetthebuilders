export type DestinationMarket = 'SG_SFA' | 'AU_FSANZ' | 'JP_CAA';

export interface NutritionInput {
  servingSizeAmount: number;
  servingSizeUnit: 'g' | 'mL';
  servingsPerPackage: number;
  energyKcal: number;
  proteinG: number;
  totalFatG: number;
  saturatedFatG: number;
  transFatG: number;
  carbsG: number;
  totalSugarsG: number;
  sodiumMg: number;
  hasPer100ColumnOnOriginLabel: boolean;
  hasKjOnOriginLabel: boolean;
  hasSaltEquivalentOnOriginLabel: boolean;
}

export interface LabelInput {
  id: string;
  isExample: boolean;
  exampleBadgeLabel?: string;
  productName: string;
  brandName: string;
  originCountry: string;
  destinationMarket: DestinationMarket;
  netContent: string;
  ingredientList: string;
  containsStatement: string;
  frontOfPackClaims: string;
  importerDetails: string;
  storageInstructions: string;
  nutrition: NutritionInput;
}

export const MARKET_META: Record<
  DestinationMarket,
  {
    name: string;
    shortName: string;
    agency: string;
    portName: string;
    currency: string;
    statutoryCitation: string;
    defaultImporterPlaceholder: string;
  }
> = {
  SG_SFA: {
    name: 'Singapore (SFA)',
    shortName: 'Singapore SFA',
    agency: 'Singapore Food Agency (SFA)',
    portName: 'Tuas Mega Port / Pasir Panjang, Singapore',
    currency: 'SGD',
    statutoryCitation: 'Sale of Food Act — Singapore Food Regulations (Reg 5, Reg 9 & Eighth Schedule)',
    defaultImporterPlaceholder: 'Straits Pantry Imports Pte. Ltd., 14 Fishery Port Rd, Singapore 619736',
  },
  AU_FSANZ: {
    name: 'Australia (FSANZ)',
    shortName: 'Australia FSANZ',
    agency: 'Food Standards Australia New Zealand (FSANZ)',
    portName: 'Port of Melbourne / Sydney Botany, Australia',
    currency: 'AUD',
    statutoryCitation: 'Australia New Zealand Food Standards Code (Standards 1.2.2, 1.2.3 PEAL, 1.2.7 & 1.2.8)',
    defaultImporterPlaceholder: 'Southern Cross Fine Foods Pty Ltd, 88 Docklands Hwy, Melbourne VIC 3008, Australia',
  },
  JP_CAA: {
    name: 'Japan (CAA)',
    shortName: 'Japan CAA',
    agency: 'Consumer Affairs Agency of Japan (CAA)',
    portName: 'Port of Tokyo / Yokohama Customs, Japan',
    currency: 'JPY',
    statutoryCitation: 'Food Labeling Act (Act No. 70) & CAA Food Labeling Standards (Cabinet Office Ordinance No. 10)',
    defaultImporterPlaceholder: 'Minato Mirai Trading K.K., 2-4-1 Kaigan, Minato-ku, Tokyo 105-0022, Japan',
  },
};

export const SAMPLE_SKUS: LabelInput[] = [
  {
    id: 'sku-bali-sambal-sg',
    isExample: true,
    exampleBadgeLabel: 'Example: Bali Crispy Prawn Sambal → Singapore (SFA)',
    productName: 'Bali Crispy Prawn & Candlenut Sambal',
    brandName: 'Warung Sari Artisan',
    originCountry: 'Indonesia (Denpasar, Bali)',
    destinationMarket: 'SG_SFA',
    netContent: '180 g',
    ingredientList:
      'Red chili peppers (42%), shallots, palm olein, belacan (fermented shrimp paste), kemiri (candlenut), gula melaka (palm sugar), garlic, kicap manis (sweet soy sauce), monosodium glutamate, sodium benzoate.',
    containsStatement: '',
    frontOfPackClaims:
      'Traditional Balinese Recipe • Naturally Low Sugar • Boosts Immunity & Digestive Wellness • 100% Preservative Free',
    importerDetails: '',
    storageInstructions: 'Store in a cool dry place. Refrigerate after opening.',
    nutrition: {
      servingSizeAmount: 20,
      servingSizeUnit: 'g',
      servingsPerPackage: 9,
      energyKcal: 68,
      proteinG: 1.8,
      totalFatG: 4.6,
      saturatedFatG: 1.9,
      transFatG: 0,
      carbsG: 4.8,
      totalSugarsG: 3.4,
      sodiumMg: 310,
      hasPer100ColumnOnOriginLabel: false,
      hasKjOnOriginLabel: false,
      hasSaltEquivalentOnOriginLabel: false,
    },
  },
  {
    id: 'sku-chiangmai-mango-au',
    isExample: true,
    exampleBadgeLabel: 'Example: Chiang Mai Mango Drink → Australia (FSANZ)',
    productName: 'Chiang Mai Golden Mango & Coconut Nectar Drink',
    brandName: 'Lanna Orchard Co.',
    originCountry: 'Thailand (Chiang Mai)',
    destinationMarket: 'AU_FSANZ',
    netContent: '330 mL',
    ingredientList:
      'Water, Nam Dok Mai mango puree (28%), coconut cream (14%), cane sugar, cashew milk paste, whey protein isolate, citric acid, tartrazine, sodium metabisulfite.',
    containsStatement: 'May contain nuts and dairy.',
    frontOfPackClaims:
      'Low Sugar Tropical Refresher • Cures Fatigue & Prevents Cold Flu • Rich in Natural Vitamins',
    importerDetails: '',
    storageInstructions: 'Keep chilled between 2°C and 4°C. Shake well before drinking.',
    nutrition: {
      servingSizeAmount: 250,
      servingSizeUnit: 'mL',
      servingsPerPackage: 1.3,
      energyKcal: 165,
      proteinG: 2.5,
      totalFatG: 4.2,
      saturatedFatG: 3.5,
      transFatG: 0,
      carbsG: 29.5,
      totalSugarsG: 24.5,
      sodiumMg: 85,
      hasPer100ColumnOnOriginLabel: false,
      hasKjOnOriginLabel: false,
      hasSaltEquivalentOnOriginLabel: false,
    },
  },
  {
    id: 'sku-saigon-oatbar-jp',
    isExample: true,
    exampleBadgeLabel: 'Example: Saigon Matcha Oat Bar → Japan (CAA)',
    productName: 'Saigon Matcha, Roasted Cashew & Sesame Oat Bar',
    brandName: 'MeKong Craft Roasters',
    originCountry: 'Vietnam (Ho Chi Minh City)',
    destinationMarket: 'JP_CAA',
    netContent: '45 g',
    ingredientList:
      'Rolled oats (38%), Binh Phuoc roasted cashews (22%), honey, black sesame seeds, coconut oil, Uji matcha powder (4%), soy lecithin, egg white powder, potassium sorbate.',
    containsStatement: '',
    frontOfPackClaims:
      'High Protein Energy Bar • Medical Grade Anti-Inflammatory Superfood • Zero Salt Formula',
    importerDetails: '',
    storageInstructions: 'Keep away from direct sunlight and high humidity.',
    nutrition: {
      servingSizeAmount: 45,
      servingSizeUnit: 'g',
      servingsPerPackage: 1,
      energyKcal: 198,
      proteinG: 3.1,
      totalFatG: 9.4,
      saturatedFatG: 3.2,
      transFatG: 0,
      carbsG: 25.2,
      totalSugarsG: 11.2,
      sodiumMg: 140,
      hasPer100ColumnOnOriginLabel: false,
      hasKjOnOriginLabel: false,
      hasSaltEquivalentOnOriginLabel: false,
    },
  },
];
