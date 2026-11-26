import React, { useEffect, useRef, useState } from 'react';
import {
  DestinationMarket,
  LabelInput,
  MARKET_META,
  SAMPLE_SKUS,
} from './lib/sampleSkus';
import {
  ALL_KNOWN_FINDING_IDS,
  buildCustomsReportText,
  buildExportStickerSvgString,
  computeMultiCorridorComparison,
  InspectionResult,
  inspectLabelDeterministic,
} from './lib/regulatoryEngine';

const STORAGE_KEY = 'packport_history_v1';

const EMPTY_LABEL: LabelInput = {
  id: 'custom-sku',
  isExample: false,
  productName: '',
  brandName: '',
  originCountry: 'Indonesia',
  destinationMarket: 'SG_SFA',
  netContent: '200 g',
  ingredientList: '',
  containsStatement: '',
  frontOfPackClaims: '',
  importerDetails: '',
  storageInstructions: 'Store in a cool dry place.',
  nutrition: {
    servingSizeAmount: 25,
    servingSizeUnit: 'g',
    servingsPerPackage: 8,
    energyKcal: 90,
    proteinG: 2.0,
    totalFatG: 3.5,
    saturatedFatG: 1.2,
    transFatG: 0,
    carbsG: 12.0,
    totalSugarsG: 4.0,
    sodiumMg: 180,
    hasPer100ColumnOnOriginLabel: false,
    hasKjOnOriginLabel: false,
    hasSaltEquivalentOnOriginLabel: false,
  },
};

function validateLabelInput(targetLabel: LabelInput | null | undefined): {
  field: 'ingredientList' | 'servingSizeAmount';
  message: string;
} | null {
  if (!targetLabel || !targetLabel.ingredientList?.trim()) {
    return {
      field: 'ingredientList',
      message: 'Please enter at least one ingredient on the label.',
    };
  }
  const serving = Number(targetLabel.nutrition?.servingSizeAmount);
  if (!Number.isFinite(serving) || serving <= 0) {
    return {
      field: 'servingSizeAmount',
      message: 'Serving size must be greater than 0g.',
    };
  }
  return null;
}

export function App() {
  const [label, setLabel] = useState<LabelInput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.label &&
          parsed.label.productName &&
          validateLabelInput(parsed.label) === null
        ) {
          return parsed.label;
        }
      }
    } catch {
      // ignore storage errors
    }
    return SAMPLE_SKUS[0];
  });

  const [resolvedIds, setResolvedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.label &&
          validateLabelInput(parsed.label) === null &&
          Array.isArray(parsed.resolvedIds)
        ) {
          return parsed.resolvedIds;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<{
    field: 'ingredientList' | 'servingSizeAmount' | null;
    message: string;
  }>({ field: null, message: '' });
  const [actionConfirmation, setActionConfirmation] = useState<string>('');
  const [engineNotice, setEngineNotice] = useState<string>('');
  const [proofViewMode, setProofViewMode] = useState<
    'sticker-focus' | 'side-by-side'
  >('sticker-focus');

  const [result, setResult] = useState<InspectionResult>(() =>
    inspectLabelDeterministic(label, resolvedIds)
  );

  const ingredientInputRef = useRef<HTMLTextAreaElement | null>(null);
  const servingSizeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isCleared && validateLabelInput(label) === null) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ label, resolvedIds })
        );
      } catch {
        // ignore quota errors
      }
    }
  }, [label, resolvedIds, isCleared]);

  const focusInvalidField = (field: 'ingredientList' | 'servingSizeAmount') => {
    setTimeout(() => {
      if (field === 'ingredientList') {
        ingredientInputRef.current?.focus();
      } else {
        servingSizeInputRef.current?.focus();
      }
    }, 20);
  };

  const executeInspection = async (
    targetLabel: LabelInput,
    targetResolvedIds: string[]
  ) => {
    setFieldError({ field: null, message: '' });
    setActionConfirmation('');

    const validationError = validateLabelInput(targetLabel);
    if (validationError) {
      setFieldError(validationError);
      focusInvalidField(validationError.field);
      return;
    }

    setIsCleared(false);
    setIsLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const simulateError = urlParams.get('simulateError') === '1';

    try {
      const response = await fetch(
        `/api/inspect-label${simulateError ? '?simulateError=1' : ''}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: targetLabel,
            resolvedFindingIds: targetResolvedIds,
            simulateError,
          }),
        }
      );

      if (response.ok) {
        const data: InspectionResult = await response.json();
        setResult(data);
        setEngineNotice(data.engineNotice || '');
      } else {
        const localFallback = inspectLabelDeterministic(
          targetLabel,
          targetResolvedIds
        );
        setResult(localFallback);
        setEngineNotice(
          'Completed inspection using the built-in statutory rule engine so your work is safe.'
        );
      }
    } catch {
      const localFallback = inspectLabelDeterministic(
        targetLabel,
        targetResolvedIds
      );
      setResult(localFallback);
      setEngineNotice(
        'Completed inspection using the built-in statutory rule engine so your work is safe.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sku: LabelInput) => {
    setLabel(sku);
    setResolvedIds([]);
    setIsCleared(false);
    setFieldError({ field: null, message: '' });
    void executeInspection(sku, []);
  };

  const handleClearForm = () => {
    setLabel(EMPTY_LABEL);
    setResolvedIds([]);
    setIsCleared(true);
    setResult(inspectLabelDeterministic(SAMPLE_SKUS[0], []));
    setFieldError({ field: null, message: '' });
    setActionConfirmation('');
    setEngineNotice('');
  };

  const handleApplyFix = (findingId: string) => {
    const validationError = validateLabelInput(label);
    if (validationError) {
      setFieldError(validationError);
      focusInvalidField(validationError.field);
      return;
    }
    const nextResolved = resolvedIds.includes(findingId)
      ? resolvedIds
      : [...resolvedIds, findingId];
    setResolvedIds(nextResolved);
    const updated = inspectLabelDeterministic(label, nextResolved);
    setResult(updated);
    setActionConfirmation('Applied regulatory fix to the export over-sticker.');
  };

  const handleApplyAllFixes = () => {
    const validationError = validateLabelInput(label);
    if (validationError) {
      setFieldError(validationError);
      focusInvalidField(validationError.field);
      return;
    }
    const allIds = Array.from(
      new Set([...ALL_KNOWN_FINDING_IDS, ...result.findings.map((f) => f.id)])
    );
    setResolvedIds(allIds);
    const updated = inspectLabelDeterministic(label, allIds);
    setResult(updated);
    setActionConfirmation(
      `Applied all ${result.findings.length} regulatory fixes — Export over-sticker is now Cleared for Export (100%).`
    );
  };

  const handleDownloadStickerSvg = () => {
    const svgString = buildExportStickerSvgString(result);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeSlug = (label.productName || 'packport-sticker')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.download = `${safeSlug}-${label.destinationMarket.toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionConfirmation('Downloaded compliant over-sticker SVG.');
  };

  const handleCopyDossier = async () => {
    const text = result.customsDossierBullets.map((b) => `• ${b}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback if clipboard permission denied in headless browser
    }
    setActionConfirmation('Copied customs dossier to clipboard.');
  };

  const handleDownloadReportTxt = () => {
    const validationError = validateLabelInput(label);
    if (validationError) {
      setFieldError(validationError);
      focusInvalidField(validationError.field);
      return;
    }
    const reportText = buildCustomsReportText(label, result);
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeSlug = (label.productName || 'packport-report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.download = `${safeSlug}-${label.destinationMarket.toLowerCase()}-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionConfirmation('Downloaded customs inspection report (.txt).');
  };

  const handleSwitchCorridor = (nextMarket: DestinationMarket) => {
    const validationError = validateLabelInput(label);
    if (validationError) {
      setFieldError(validationError);
      focusInvalidField(validationError.field);
      return;
    }
    const nextLabel: LabelInput = {
      ...label,
      destinationMarket: nextMarket,
    };
    setLabel(nextLabel);
    void executeInspection(nextLabel, resolvedIds);
  };

  const corridorRows = computeMultiCorridorComparison(
    label,
    label.destinationMarket,
    resolvedIds
  );

  const stickerSvgMarkup = buildExportStickerSvgString(result);

  const claimFindings = result.findings.filter(
    (f) => f.targetArea === 'claims'
  );
  const allergenAndIngredientFindings = result.findings.filter(
    (f) => f.targetArea === 'allergens' || f.targetArea === 'ingredients'
  );
  const nutritionFindings = result.findings.filter(
    (f) => f.targetArea === 'nutrition'
  );

  const activeMarketName = isCleared
    ? MARKET_META[label.destinationMarket].name
    : result.destinationMeta.name;

  return (
    <div className="page-shell">
      <header className="masthead">
        <div className="masthead-dateline">
          <span>APAC Export Ledger</span>
          <span>SFA · FSANZ · CAA</span>
        </div>
        <div className="masthead-title-row">
          <div>
            <h1 className="masthead-title">PackPort</h1>
            <p className="masthead-pitch">
              Catch customs label violations and generate a print-ready Singapore,
              Australia, or Japan export over-sticker before your shipment leaves
              port.
            </p>
          </div>
        </div>
      </header>

      <section className="sample-strip" aria-label="Example APAC export SKUs">
        <p className="sample-strip-label">Demo SKUs:</p>
        <div className="sample-buttons-row">
          {SAMPLE_SKUS.map((sku) => (
            <button
              key={sku.id}
              type="button"
              className={`sample-btn ${!isCleared && label.id === sku.id ? 'active' : ''}`}
              onClick={() => handleSelectSample(sku)}
            >
              {sku.exampleBadgeLabel}
            </button>
          ))}
          <button
            type="button"
            className="clear-btn"
            onClick={handleClearForm}
          >
            Clear Form
          </button>
        </div>
      </section>

      <main className="workbench-grid">
        {/* Left Column: Source Package & Claim Editor */}
        <section className="ledger-panel" aria-label="Source Package Label Input">
          <div className="panel-header">
            <h2 className="panel-heading">1. Source Label</h2>
            {label.isExample && !isCleared && (
              <span className="example-badge">Example SKU</span>
            )}
          </div>
          <div className="panel-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void executeInspection(label, resolvedIds);
              }}
              noValidate
            >
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="destination-market">
                    Destination Market
                  </label>
                  <select
                    id="destination-market"
                    className="form-select"
                    value={label.destinationMarket}
                    onChange={(e) => {
                      const nextMarket = e.target.value as DestinationMarket;
                      const nextLabel: LabelInput = {
                        ...label,
                        isExample: false,
                        destinationMarket: nextMarket,
                      };
                      setLabel(nextLabel);
                      if (!isCleared && validateLabelInput(nextLabel) === null) {
                        void executeInspection(nextLabel, resolvedIds);
                      }
                    }}
                  >
                    <option value="SG_SFA">Singapore (SFA)</option>
                    <option value="AU_FSANZ">Australia (FSANZ)</option>
                    <option value="JP_CAA">Japan (CAA)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="origin-country">
                    Origin Country
                  </label>
                  <input
                    id="origin-country"
                    type="text"
                    className="form-input"
                    value={label.originCountry}
                    onChange={(e) =>
                      setLabel({
                        ...label,
                        isExample: false,
                        originCountry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="product-name">
                    Product Name
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bali Crispy Prawn Sambal"
                    value={label.productName}
                    onChange={(e) =>
                      setLabel({
                        ...label,
                        isExample: false,
                        productName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="net-content">
                    Net Weight
                  </label>
                  <input
                    id="net-content"
                    type="text"
                    className="form-input"
                    value={label.netContent}
                    onChange={(e) =>
                      setLabel({
                        ...label,
                        isExample: false,
                        netContent: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ingredient-list">
                  Ingredient List
                </label>
                <textarea
                  id="ingredient-list"
                  ref={ingredientInputRef}
                  className={`form-textarea ${fieldError.field === 'ingredientList' ? 'invalid' : ''}`}
                  placeholder="Paste ingredients including regional names (belacan, kemiri, kicap manis) and food additives..."
                  value={label.ingredientList}
                  onChange={(e) => {
                    setLabel({
                      ...label,
                      isExample: false,
                      ingredientList: e.target.value,
                    });
                    if (fieldError.field === 'ingredientList') {
                      setFieldError({ field: null, message: '' });
                    }
                  }}
                />
                {fieldError.field === 'ingredientList' && (
                  <div className="field-error" role="alert">
                    {fieldError.message}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="front-claims">
                  Front-of-Pack Claims
                </label>
                <input
                  id="front-claims"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Low Sugar • Boosts Immunity • 100% Preservative Free"
                  value={label.frontOfPackClaims}
                  onChange={(e) =>
                    setLabel({
                      ...label,
                      isExample: false,
                      frontOfPackClaims: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <button
                  type="submit"
                  className="primary-cta"
                  disabled={isLoading}
                >
                  {isLoading
                    ? `Checking ${MARKET_META[label.destinationMarket].shortName} rules...`
                    : 'Run Customs Pre-Flight'}
                </button>
              </div>

              <fieldset className="nutrition-fieldset">
                <legend className="nutrition-legend">
                  Per-Serving Nutrition
                </legend>
                <div className="nutrition-grid-inputs">
                  <div>
                    <label className="form-label" htmlFor="serving-size">
                      Serving ({label.nutrition.servingSizeUnit})
                    </label>
                    <input
                      id="serving-size"
                      ref={servingSizeInputRef}
                      type="number"
                      step="any"
                      className={`form-input ${fieldError.field === 'servingSizeAmount' ? 'invalid' : ''}`}
                      value={label.nutrition.servingSizeAmount}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        const numVal = rawVal === '' ? 0 : parseFloat(rawVal);
                        setLabel({
                          ...label,
                          isExample: false,
                          nutrition: {
                            ...label.nutrition,
                            servingSizeAmount: Number.isNaN(numVal) ? 0 : numVal,
                          },
                        });
                        if (fieldError.field === 'servingSizeAmount') {
                          setFieldError({ field: null, message: '' });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="energy-kcal">
                      Energy (kcal)
                    </label>
                    <input
                      id="energy-kcal"
                      type="number"
                      step="any"
                      className="form-input"
                      value={label.nutrition.energyKcal}
                      onChange={(e) =>
                        setLabel({
                          ...label,
                          isExample: false,
                          nutrition: {
                            ...label.nutrition,
                            energyKcal: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="protein-g">
                      Protein (g)
                    </label>
                    <input
                      id="protein-g"
                      type="number"
                      step="any"
                      className="form-input"
                      value={label.nutrition.proteinG}
                      onChange={(e) =>
                        setLabel({
                          ...label,
                          isExample: false,
                          nutrition: {
                            ...label.nutrition,
                            proteinG: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="total-fat-g">
                      Fat (g)
                    </label>
                    <input
                      id="total-fat-g"
                      type="number"
                      step="any"
                      className="form-input"
                      value={label.nutrition.totalFatG}
                      onChange={(e) =>
                        setLabel({
                          ...label,
                          isExample: false,
                          nutrition: {
                            ...label.nutrition,
                            totalFatG: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="total-sugars-g">
                      Sugars (g)
                    </label>
                    <input
                      id="total-sugars-g"
                      type="number"
                      step="any"
                      className="form-input"
                      value={label.nutrition.totalSugarsG}
                      onChange={(e) =>
                        setLabel({
                          ...label,
                          isExample: false,
                          nutrition: {
                            ...label.nutrition,
                            totalSugarsG: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="sodium-mg">
                      Sodium (mg)
                    </label>
                    <input
                      id="sodium-mg"
                      type="number"
                      step="any"
                      className="form-input"
                      value={label.nutrition.sodiumMg}
                      onChange={(e) =>
                        setLabel({
                          ...label,
                          isExample: false,
                          nutrition: {
                            ...label.nutrition,
                            sodiumMg: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                {fieldError.field === 'servingSizeAmount' && (
                  <div className="field-error" role="alert">
                    {fieldError.message}
                  </div>
                )}
              </fieldset>

              <div className="form-group">
                <label className="form-label" htmlFor="contains-statement">
                  Origin &quot;Contains:&quot; Line
                </label>
                <input
                  id="contains-statement"
                  type="text"
                  className="form-input"
                  placeholder="Leave blank if missing on origin pack"
                  value={label.containsStatement}
                  onChange={(e) =>
                    setLabel({
                      ...label,
                      isExample: false,
                      containsStatement: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="importer-details">
                  Local Importer Address
                </label>
                <input
                  id="importer-details"
                  type="text"
                  className="form-input"
                  placeholder={
                    MARKET_META[label.destinationMarket].defaultImporterPlaceholder
                  }
                  value={label.importerDetails}
                  onChange={(e) =>
                    setLabel({
                      ...label,
                      isExample: false,
                      importerDetails: e.target.value,
                    })
                  }
                />
              </div>
            </form>
          </div>
        </section>

        {/* Right Column: Interactive Package Proof, Verdict Stamp & Over-Sticker */}
        <section
          className="ledger-panel"
          aria-label="Customs Inspection Dossier and Export Over-Sticker"
        >
          <div className="panel-header">
            <h2 className="panel-heading">
              2. Customs Proof ({activeMarketName})
            </h2>
          </div>

          {isCleared ? (
            <div className="panel-body">
              <div className="empty-state-box">
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    marginTop: 0,
                  }}
                >
                  Workbench Ready for Label Inspection
                </h3>
                <p style={{ fontSize: '16px', maxWidth: '540px', margin: '0 auto 18px' }}>
                  Enter your product&apos;s ingredients and nutrition values on the
                  left, or click one of the 3 Example APAC SKUs above to run an
                  instant inspection.
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                  }}
                >
                  {SAMPLE_SKUS.map((sku) => (
                    <button
                      key={sku.id}
                      type="button"
                      className="sample-btn"
                      onClick={() => handleSelectSample(sku)}
                    >
                      Load {sku.exampleBadgeLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="verdict-summary-bar">
                <div className="readiness-score-block">
                  <p className="readiness-eyebrow">Readiness Score</p>
                  <div className="readiness-number-row">
                    <span className="readiness-big-num">
                      {result.readinessScore}%
                    </span>
                    <span className="readiness-meaning">
                      {result.readinessMeaning.replace(/^\d+%\s*/, '')}
                    </span>
                  </div>
                </div>
                <div
                  className={`rubber-stamp ${result.verdictStamp === 'Cleared for Export' ? 'cleared' : 'hold'}`}
                  aria-label={`Customs verdict: ${result.verdictStamp}`}
                >
                  {result.verdictStamp}
                </div>
              </div>

              <div className="dossier-action-bar">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleApplyAllFixes}
                >
                  Apply All Regulatory Fixes ({result.findings.length})
                </button>
                <button
                  type="button"
                  className="secondary-btn outline"
                  onClick={handleDownloadStickerSvg}
                >
                  Download Sticker SVG
                </button>
                <button
                  type="button"
                  className="secondary-btn outline"
                  onClick={handleDownloadReportTxt}
                >
                  Download Customs Report (.txt)
                </button>
                <button
                  type="button"
                  className="secondary-btn outline"
                  onClick={handleCopyDossier}
                >
                  Copy Customs Dossier
                </button>
              </div>

              <div className="panel-body">
                {actionConfirmation && (
                  <div className="status-banner success" role="status">
                    {actionConfirmation}
                  </div>
                )}

                {engineNotice && (
                  <div className="status-banner" role="status">
                    {engineNotice}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--rule)',
                  }}
                >
                  <h3
                    className="origin-proof-title"
                    style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}
                  >
                    Print-Ready Export Over-Sticker (88×112 mm)
                  </h3>
                  <div className="proof-view-bar" style={{ marginBottom: 0 }}>
                    <button
                      type="button"
                      className={`sample-btn ${proofViewMode === 'sticker-focus' ? 'active' : ''}`}
                      onClick={() => setProofViewMode('sticker-focus')}
                    >
                      Sticker Focus
                    </button>
                    <button
                      type="button"
                      className={`sample-btn ${proofViewMode === 'side-by-side' ? 'active' : ''}`}
                      onClick={() => setProofViewMode('side-by-side')}
                    >
                      Side-by-Side Proof
                    </button>
                  </div>
                </div>

                <div
                  className={`proof-comparison-grid ${proofViewMode === 'side-by-side' ? 'side-by-side' : ''}`}
                >
                  {/* Live Print-Ready Export Over-Sticker (Signature Element First) */}
                  <div
                    data-testid="export-over-sticker"
                    data-sticker-verdict={result.verdictStamp}
                    data-sticker-contains={result.remediatedSticker.containsSummary}
                  >
                    <div
                      className="sticker-svg-wrapper"
                      style={{ maxWidth: '520px', margin: '0 auto' }}
                    >
                      <img
                        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(stickerSvgMarkup)}`}
                        alt={`Print-ready ${result.destinationMeta.shortName} export over-sticker for ${label.productName} — ${result.verdictStamp}`}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  </div>

                  {/* Redlined Origin Label Proof */}
                  <div className="origin-proof-card">
                    <h3 className="origin-proof-title">
                      Redlined Origin Package Proof
                    </h3>

                    <div
                      className={`origin-proof-section ${claimFindings.some((f) => !f.resolved) ? 'flagged' : ''}`}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                        {claimFindings.map((f) => (
                          <span
                            key={f.id}
                            className={`violation-pin ${f.resolved ? 'resolved' : ''}`}
                          >
                            #{f.pinNumber}
                          </span>
                        ))}
                        Front-of-Pack Claims
                      </div>
                      <div style={{ fontSize: '15px' }}>
                        {label.frontOfPackClaims || 'No marketing claims entered'}
                      </div>
                    </div>

                    <div
                      className={`origin-proof-section ${allergenAndIngredientFindings.some((f) => !f.resolved) ? 'flagged' : ''}`}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                        {allergenAndIngredientFindings.map((f) => (
                          <span
                            key={f.id}
                            className={`violation-pin ${f.resolved ? 'resolved' : ''}`}
                          >
                            #{f.pinNumber}
                          </span>
                        ))}
                        Ingredients &amp; Allergen Declaration
                      </div>
                      <div style={{ fontSize: '15px', marginBottom: '6px' }}>
                        {label.ingredientList}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                        }}
                      >
                        Origin &quot;Contains:&quot; line:{' '}
                        {label.containsStatement || 'Missing on origin label'}
                      </div>
                    </div>

                    <div
                      className={`origin-proof-section ${nutritionFindings.some((f) => !f.resolved) ? 'flagged' : ''}`}
                      style={{ marginBottom: 0 }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                        {nutritionFindings.map((f) => (
                          <span
                            key={f.id}
                            className={`violation-pin ${f.resolved ? 'resolved' : ''}`}
                          >
                            #{f.pinNumber}
                          </span>
                        ))}
                        Computed Per-{result.per100.basisUnit} Statutory Basis
                      </div>
                      <div style={{ fontSize: '15px' }}>
                        {result.per100.energyKcal} kcal ({result.per100.energyKj}{' '}
                        kJ) • Sugars: {result.per100.totalSugarsG} g • Protein:{' '}
                        {result.per100.proteinG} g • Sodium:{' '}
                        {result.per100.sodiumMg} mg (Salt eq.{' '}
                        {result.per100.saltEquivalentG} g)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multi-Corridor Readiness Comparison Table */}
                <section
                  className="corridor-comparison-box"
                  data-testid="corridor-comparison-table"
                  aria-label="Multi-Corridor Readiness Comparison"
                >
                  <h3 className="findings-section-title" style={{ marginTop: 0 }}>
                    Multi-Corridor Readiness Comparison (Singapore SFA vs. Australia FSANZ vs. Japan CAA)
                  </h3>
                  <div className="corridor-cards-list">
                    {corridorRows.map((row) => (
                      <div
                        key={row.market}
                        className={`corridor-row-card ${row.isActive ? 'active' : ''}`}
                        data-testid={`corridor-row-${row.market}`}
                      >
                        <div className="corridor-row-main">
                          <div className="corridor-row-header">
                            <strong style={{ fontSize: '16px' }}>
                              {row.marketName}
                            </strong>
                            <span
                              className={`severity-badge ${row.verdictStamp === 'Cleared for Export' ? 'resolved' : 'critical'}`}
                            >
                              {row.verdictStamp}
                            </span>
                            <span className="corridor-score-pill">
                              {row.readinessScore}% ({row.criticalCount} critical,{' '}
                              {row.warningCount} warning)
                            </span>
                          </div>
                          <div className="corridor-blocker-text">
                            Top finding: {row.topBlocker}
                          </div>
                        </div>
                        <div className="corridor-row-action">
                          {row.isActive ? (
                            <span className="active-corridor-badge">
                              Active Corridor
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="secondary-btn outline"
                              onClick={() => handleSwitchCorridor(row.market)}
                            >
                              Inspect Corridor
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Itemized Statutory Findings */}
                <h3 className="findings-section-title">
                  Statutory Findings ({result.findings.length})
                </h3>
                {result.findings.map((finding) => (
                  <article
                    key={finding.id}
                    className={`finding-card ${finding.resolved ? 'resolved' : finding.severity}`}
                  >
                    <div className="finding-header-row">
                      <div>
                        <span
                          className={`violation-pin ${finding.resolved ? 'resolved' : ''}`}
                        >
                          #{finding.pinNumber}
                        </span>
                        <span
                          className={`severity-badge ${finding.resolved ? 'resolved' : finding.severity}`}
                        >
                          {finding.resolved
                            ? 'Resolved on Over-Sticker'
                            : finding.severityLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="secondary-btn outline"
                        onClick={() => handleApplyFix(finding.id)}
                      >
                        {finding.resolved ? 'Fix Applied ✓' : 'Apply Fix'}
                      </button>
                    </div>
                    <h4 className="finding-title">{finding.title}</h4>
                    <p className="finding-citation">
                      Regulation: {finding.statutoryCitation}
                    </p>
                    <div className="finding-offending">
                      <strong>Flagged on origin pack:</strong>{' '}
                      {finding.offendingText}
                    </div>
                    <p className="finding-explanation">
                      {finding.plainExplanation}
                    </p>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        margin: 0,
                        color: 'var(--success)',
                      }}
                    >
                      Over-sticker remediation: {finding.proposedFixSummary}
                    </p>
                  </article>
                ))}

                {/* Multi-Agent Trace */}
                <div className="agent-trace-box">
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '19px',
                      margin: '0 0 10px 0',
                    }}
                  >
                    How Google Gemini &amp; Statutory Rules Checked This Label
                  </h3>
                  {result.agentTrace.map((step) => (
                    <div key={step.agentName} className="agent-trace-item">
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>
                        {step.agentName}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          color: 'var(--text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        {step.role}
                      </div>
                      <div style={{ fontSize: '15px' }}>
                        {step.outputSummary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
