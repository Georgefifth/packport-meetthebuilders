import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = 'https://dimensional-glance-icons-bible.trycloudflare.com';
const OUT_DIR = 'evidence/eval/sprint-01-r2';

async function getDecodedSvg(page) {
  const src = await page.locator('[data-testid="export-over-sticker"] img').getAttribute('src');
  if (!src) return '';
  const prefix = 'data:image/svg+xml;charset=utf-8,';
  return src.startsWith(prefix) ? decodeURIComponent(src.slice(prefix.length)) : src;
}

function extractSvgTextNodes(svgMarkup) {
  return Array.from(svgMarkup.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map((m) =>
    m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  );
}

function normalizeSvgText(svgMarkup) {
  return extractSvgTextNodes(svgMarkup).join(' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const report = {
    url: URL,
    sprint01Checks: {},
    sprint01Edges: {},
    bugReverifications: {},
    sliceRegression: {},
    svgTextAudit: {},
    consoleErrors: [],
    badRequests: [],
  };

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => report.consoleErrors.push(String(e)));
    page.on('requestfailed', (req) => report.badRequests.push({ url: req.url(), reason: req.failure()?.errorText }));
    page.on('response', (res) => { if (res.status() >= 400) report.badRequests.push({ url: res.url(), status: res.status() }); });

    const t0 = Date.now();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    const loadMs = Date.now() - t0;

    await page.screenshot({ path: path.join(OUT_DIR, 'stranger-1-landing.png'), fullPage: false });

    // SPRINT-01 CHECK 1: Multi-Corridor Readiness Comparison table
    const matrixLoc = page.locator('[data-testid="corridor-comparison-table"]');
    await matrixLoc.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-01-corridor-matrix.png'), fullPage: false });

    const rows = await matrixLoc.locator('.corridor-row-card').all();
    const rowData = [];
    for (const r of rows) {
      const text = await r.innerText();
      const hasInspectBtn = await r.locator('button:has-text("Inspect Corridor")').isVisible();
      const hasActiveBadge = await r.locator('.active-corridor-badge').isVisible();
      rowData.push({ text, hasInspectBtn, hasActiveBadge });
    }

    const distinctScoresEx1 = new Set(
      rowData.map((r) => {
        const m = r.text.match(/(\d+)%/);
        return m ? m[1] : '';
      })
    );
    const distinctTopFindingsEx1 = new Set(
      rowData.map((r) => {
        const m = r.text.match(/Top finding:\s*(.+)/);
        return m ? m[1].trim() : '';
      })
    );

    report.sprint01Checks.check1 = {
      pass:
        rows.length === 3 &&
        rowData[0].text.includes('Singapore (SFA)') &&
        rowData[0].hasActiveBadge &&
        rowData[1].text.includes('Australia (FSANZ)') &&
        rowData[1].hasInspectBtn &&
        rowData[2].text.includes('Japan (CAA)') &&
        rowData[2].hasInspectBtn &&
        rowData.every((r) => r.text.includes('%') && (r.text.includes('Hold: Relabel Required') || r.text.includes('Cleared for Export')) && r.text.includes('Top finding:')) &&
        distinctScoresEx1.size === 3 &&
        distinctTopFindingsEx1.size === 3,
      rowCount: rows.length,
      distinctScores: Array.from(distinctScoresEx1),
      distinctTopFindings: Array.from(distinctTopFindingsEx1),
      rowData,
    };

    // SPRINT-01 CHECK 2: Click Inspect Corridor on Australia (FSANZ) and Japan (CAA)
    await matrixLoc.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(500);
    const leftMarketAfterAuInspect = await page.locator('#destination-market').inputValue();
    const rightHeadingAfterAuInspect = await page.locator('.ledger-panel').nth(1).locator('.panel-heading').innerText();
    const auRowActive = await matrixLoc.locator('[data-testid="corridor-row-AU_FSANZ"] .active-corridor-badge').isVisible();
    const sgRowInspectBtn = await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"] button:has-text("Inspect Corridor")').isVisible();
    const auStickerSvg = await getDecodedSvg(page);
    await matrixLoc.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-02a-inspect-australia.png'), fullPage: false });

    await matrixLoc.locator('[data-testid="corridor-row-JP_CAA"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(500);
    const leftMarketAfterJpInspect = await page.locator('#destination-market').inputValue();
    const rightHeadingAfterJpInspect = await page.locator('.ledger-panel').nth(1).locator('.panel-heading').innerText();
    const jpRowActive = await matrixLoc.locator('[data-testid="corridor-row-JP_CAA"] .active-corridor-badge').isVisible();
    const jpStickerSvg = await getDecodedSvg(page);
    await matrixLoc.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-02b-inspect-japan.png'), fullPage: false });

    report.sprint01Checks.check2 = {
      pass:
        leftMarketAfterAuInspect === 'AU_FSANZ' &&
        rightHeadingAfterAuInspect.includes('Australia (FSANZ)') &&
        auRowActive &&
        sgRowInspectBtn &&
        auStickerSvg.includes('Australia FSANZ') &&
        leftMarketAfterJpInspect === 'JP_CAA' &&
        rightHeadingAfterJpInspect.includes('Japan (CAA)') &&
        jpRowActive &&
        jpStickerSvg.includes('Japan CAA'),
      leftMarketAfterAuInspect,
      rightHeadingAfterAuInspect,
      auRowActive,
      sgRowInspectBtn,
      leftMarketAfterJpInspect,
      rightHeadingAfterJpInspect,
      jpRowActive,
    };

    // Switch back to Singapore (SFA) via Inspect Corridor and run Check 3 + Bug 2 preservation check
    await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(500);

    // SPRINT-01 CHECK 3: Apply All Regulatory Fixes updates active corridor row in Multi-Corridor Readiness Comparison table to 100% and Cleared for Export
    await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
    await page.waitForTimeout(300);
    const sgRowTextAfterFix = await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"]').innerText();
    const auRowTextAfterSgFix = await matrixLoc.locator('[data-testid="corridor-row-AU_FSANZ"]').innerText();
    const jpRowTextAfterSgFix = await matrixLoc.locator('[data-testid="corridor-row-JP_CAA"]').innerText();
    await matrixLoc.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-03-corridor-after-fixes.png'), fullPage: false });

    // BUG 2 Re-verification: Click Inspect Corridor on Australia (FSANZ) AFTER Apply All Regulatory Fixes, then switch back to Singapore (SFA)
    await matrixLoc.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(500);
    const auScoreAfterSwitchWithFixes = await page.locator('.readiness-big-num').innerText();
    const sgRowWhileViewingAu = await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"]').innerText();
    await matrixLoc.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-03b-preserve-fixes-across-corridors.png'), fullPage: false });

    await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(500);
    const sgScoreAfterSwitchBack = await page.locator('.readiness-big-num').innerText();
    const sgVerdictAfterSwitchBack = await page.locator('.rubber-stamp').innerText();

    report.sprint01Checks.check3 = {
      pass:
        sgRowTextAfterFix.includes('100%') &&
        sgRowTextAfterFix.includes('Cleared for Export') &&
        sgRowWhileViewingAu.includes('100%') &&
        sgScoreAfterSwitchBack.includes('100%') &&
        sgVerdictAfterSwitchBack.includes('Cleared for Export'),
      sgRowTextAfterFix,
      auRowTextAfterSgFix,
      jpRowTextAfterSgFix,
      auScoreAfterSwitchWithFixes,
      sgRowWhileViewingAu,
      sgScoreAfterSwitchBack,
      sgVerdictAfterSwitchBack,
    };

    // SPRINT-01 CHECK 4 & BUG 3 Re-verification on desktop (1440x900): Side-by-Side Proof vs Sticker Focus toggle above .proof-comparison-grid
    const toggleContainer = page.locator('.proof-view-bar');
    await toggleContainer.scrollIntoViewIfNeeded();
    const desktopTogglePlacement = await page.evaluate(() => {
      const bar = document.querySelector('.proof-view-bar');
      const grid = document.querySelector('.proof-comparison-grid');
      const barRect = bar.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      return {
        barTop: Math.round(barRect.top),
        barBottom: Math.round(barRect.bottom),
        gridTop: Math.round(gridRect.top),
        isAboveGrid: barRect.bottom <= gridRect.top + 8,
      };
    });

    const gridBeforeToggle = await page.locator('.proof-comparison-grid').evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        className: el.className,
        gridTemplateColumns: cs.gridTemplateColumns,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    await page.screenshot({ path: path.join(OUT_DIR, 'check-04a-sticker-focus.png'), fullPage: false });

    await toggleContainer.locator('button:has-text("Side-by-Side Proof")').click();
    await page.waitForTimeout(200);
    const gridAfterSideBySide = await page.locator('.proof-comparison-grid').evaluate((el) => {
      const cs = getComputedStyle(el);
      const children = Array.from(el.children).map((c) => c.getBoundingClientRect());
      return {
        className: el.className,
        gridTemplateColumns: cs.gridTemplateColumns,
        scrollWidth: document.documentElement.scrollWidth,
        childrenRects: children,
      };
    });
    await page.locator('.proof-comparison-grid').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-04b-side-by-side-proof.png'), fullPage: false });

    await toggleContainer.locator('button:has-text("Sticker Focus")').click();
    await page.waitForTimeout(200);
    const gridAfterBackToFocus = await page.locator('.proof-comparison-grid').evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        className: el.className,
        gridTemplateColumns: cs.gridTemplateColumns,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    const sideBySideCols = gridAfterSideBySide.gridTemplateColumns.split(' ').filter(Boolean);
    const focusCols = gridAfterBackToFocus.gridTemplateColumns.split(' ').filter(Boolean);

    report.sprint01Checks.check4 = {
      pass:
        desktopTogglePlacement.isAboveGrid &&
        sideBySideCols.length === 2 &&
        focusCols.length === 1 &&
        gridAfterSideBySide.scrollWidth <= 1440 &&
        gridAfterBackToFocus.scrollWidth <= 1440 &&
        report.consoleErrors.length === 0,
      desktopTogglePlacement,
      gridBeforeToggle,
      gridAfterSideBySide,
      gridAfterBackToFocus,
    };

    // SPRINT-01 CHECK 5: Download Customs Report (.txt)
    const [reportDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("Download Customs Report (.txt)")').click(),
    ]);
    const reportFilename = reportDownload.suggestedFilename();
    const reportPath = await reportDownload.path();
    const reportTxtContent = reportPath ? await fs.readFile(reportPath, 'utf8') : '';
    await fs.writeFile(path.join(OUT_DIR, 'downloaded-customs-report.txt'), reportTxtContent, 'utf8');
    const reportStatusBanner = await page.locator('[role="status"]').first().innerText();
    await page.locator('.dossier-action-bar').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT_DIR, 'check-05-download-report-txt.png'), fullPage: false });

    report.sprint01Checks.check5 = {
      pass:
        reportFilename.endsWith('.txt') &&
        reportStatusBanner.includes('Downloaded customs inspection report (.txt).') &&
        reportTxtContent.includes('Bali Crispy Prawn & Candlenut Sambal') &&
        reportTxtContent.includes('Singapore (SFA)') &&
        reportTxtContent.includes('100%') &&
        reportTxtContent.includes('PER 100G') &&
        reportTxtContent.includes('ITEMIZED STATUTORY FINDINGS') &&
        reportTxtContent.includes('PRINT-READY EXPORT OVER-STICKER COPY'),
      reportFilename,
      reportStatusBanner,
      reportTxtLength: reportTxtContent.length,
      reportTxtPreview: reportTxtContent.slice(0, 600),
    };

    // SPRINT-01 EDGE CASE 1: Clear Form hides Multi-Corridor Readiness Comparison table and proof panels, then re-appears on loading Example SKU
    await page.locator('button.clear-btn').click();
    await page.waitForTimeout(200);
    const matrixCountWhenCleared = await page.locator('[data-testid="corridor-comparison-table"]').count();
    const emptyStateVisible = await page.locator('.empty-state-box').isVisible();
    await page.screenshot({ path: path.join(OUT_DIR, 'edge-01-clear-form-hides-matrix.png'), fullPage: false });

    await page.locator('.sample-strip .sample-btn').nth(0).click();
    await page.waitForTimeout(400);
    const matrixVisibleAfterReloadSku = await page.locator('[data-testid="corridor-comparison-table"]').isVisible();
    await page.screenshot({ path: path.join(OUT_DIR, 'edge-01b-matrix-restored.png'), fullPage: false });

    report.sprint01Edges.edge1 = {
      pass: matrixCountWhenCleared === 0 && emptyStateVisible && matrixVisibleAfterReloadSku,
      matrixCountWhenCleared,
      emptyStateVisible,
      matrixVisibleAfterReloadSku,
    };

    // SPRINT-01 EDGE CASE 2: Invalid serving size (<= 0) or empty Ingredient List when clicking Inspect Corridor or Download Customs Report (.txt)
    await page.fill('#serving-size', '-5');
    await page.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(150);
    const errOnInspectCorridorServing = await page.locator('.field-error').innerText();
    const focusOnInspectCorridorServing = await page.evaluate(() => document.activeElement?.id);
    const marketStayedSg = await page.locator('#destination-market').inputValue();
    await page.screenshot({ path: path.join(OUT_DIR, 'edge-02a-invalid-serving-inspect-corridor.png'), fullPage: false });

    await page.fill('#serving-size', '0');
    await page.locator('button:has-text("Download Customs Report (.txt)")').click();
    await page.waitForTimeout(150);
    const errOnDownloadReportServing = await page.locator('.field-error').innerText();
    const focusOnDownloadReportServing = await page.evaluate(() => document.activeElement?.id);
    await page.screenshot({ path: path.join(OUT_DIR, 'edge-02b-invalid-serving-download-report.png'), fullPage: false });

    await page.fill('#serving-size', '20');
    await page.fill('#ingredient-list', '   ');
    await page.locator('[data-testid="corridor-row-JP_CAA"] button:has-text("Inspect Corridor")').click();
    await page.waitForTimeout(150);
    const errOnInspectCorridorIngredients = await page.locator('.field-error').innerText();
    const focusOnInspectCorridorIngredients = await page.evaluate(() => document.activeElement?.id);
    const preservedProductName = await page.locator('#product-name').inputValue();
    await page.screenshot({ path: path.join(OUT_DIR, 'edge-02c-empty-ingredient-inspect-corridor.png'), fullPage: false });

    await page.fill('#ingredient-list', '');
    await page.locator('button:has-text("Download Customs Report (.txt)")').click();
    await page.waitForTimeout(150);
    const errOnDownloadReportIngredients = await page.locator('.field-error').innerText();
    const focusOnDownloadReportIngredients = await page.evaluate(() => document.activeElement?.id);

    report.sprint01Edges.edge2 = {
      pass:
        errOnInspectCorridorServing.includes('Serving size must be greater than 0') &&
        focusOnInspectCorridorServing === 'serving-size' &&
        marketStayedSg === 'SG_SFA' &&
        errOnDownloadReportServing.includes('Serving size must be greater than 0') &&
        focusOnDownloadReportServing === 'serving-size' &&
        errOnInspectCorridorIngredients.includes('Please enter at least one ingredient on the label') &&
        focusOnInspectCorridorIngredients === 'ingredient-list' &&
        preservedProductName.includes('Bali Crispy Prawn') &&
        errOnDownloadReportIngredients.includes('Please enter at least one ingredient on the label') &&
        focusOnDownloadReportIngredients === 'ingredient-list',
      errOnInspectCorridorServing,
      focusOnInspectCorridorServing,
      marketStayedSg,
      errOnDownloadReportServing,
      focusOnDownloadReportServing,
      errOnInspectCorridorIngredients,
      focusOnInspectCorridorIngredients,
      preservedProductName,
      errOnDownloadReportIngredients,
      focusOnDownloadReportIngredients,
    };

    // BUG 1 & BUG 2 Re-verification across all 3 Example SKUs (both initial and remediated)
    const expectedProductNames = [
      'Bali Crispy Prawn & Candlenut Sambal',
      'Chiang Mai Golden Mango & Coconut Nectar Drink',
      'Saigon Matcha, Roasted Cashew & Sesame Oat Bar',
    ];

    for (let idx = 0; idx < 3; idx++) {
      await page.locator('.sample-strip .sample-btn').nth(idx).click();
      await page.waitForTimeout(450);

      // Capture corridor comparison rows before fix for each SKU
      const skuCorridorRows = await page.locator('[data-testid="corridor-comparison-table"] .corridor-row-card').allInnerTexts();
      const beforeSvg = await getDecodedSvg(page);
      const beforeNodes = extractSvgTextNodes(beforeSvg);
      const beforeNormalized = normalizeSvgText(beforeSvg);

      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      await page.waitForTimeout(300);
      const afterSvg = await getDecodedSvg(page);
      const afterNodes = extractSvgTextNodes(afterSvg);
      const afterNormalized = normalizeSvgText(afterSvg);

      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, `svg-audit-ex${idx + 1}-remediated.png`), fullPage: false });

      const hasFullProductNameBefore = beforeNormalized.includes(expectedProductNames[idx]);
      const hasFullProductNameAfter = afterNormalized.includes(expectedProductNames[idx]);
      const hasStrayParenSpaceAfter = afterNormalized.includes('( ') || afterNormalized.includes(' )');

      report.svgTextAudit[`ex${idx + 1}`] = {
        expectedProductName: expectedProductNames[idx],
        hasFullProductNameBefore,
        hasFullProductNameAfter,
        hasStrayParenSpaceAfter,
        skuCorridorRows,
        beforeRawTextNodes: beforeNodes,
        afterRawTextNodes: afterNodes,
      };
    }

    report.bugReverifications.bug1_svgWrappingAndParens = {
      pass:
        report.svgTextAudit.ex1.hasFullProductNameBefore &&
        report.svgTextAudit.ex1.hasFullProductNameAfter &&
        !report.svgTextAudit.ex1.hasStrayParenSpaceAfter &&
        report.svgTextAudit.ex1.afterNormalized !== undefined
          ? true
          : (
              report.svgTextAudit.ex1.hasFullProductNameBefore &&
              report.svgTextAudit.ex1.hasFullProductNameAfter &&
              !report.svgTextAudit.ex1.hasStrayParenSpaceAfter &&
              report.svgTextAudit.ex2.hasFullProductNameBefore &&
              report.svgTextAudit.ex2.hasFullProductNameAfter &&
              !report.svgTextAudit.ex2.hasStrayParenSpaceAfter &&
              report.svgTextAudit.ex3.hasFullProductNameBefore &&
              report.svgTextAudit.ex3.hasFullProductNameAfter &&
              !report.svgTextAudit.ex3.hasStrayParenSpaceAfter &&
              report.svgTextAudit.ex1.afterRawTextNodes.some((n) => n.includes('(Crustacean: Shrimp)'))
            ),
    };

    // Slice regression checks: Custom edit, Download Sticker SVG, Copy Dossier, Simulated Error fallback, Persistence, Huge Input + Double Click
    await page.locator('.sample-strip .sample-btn').nth(0).click();
    await page.waitForTimeout(300);
    await page.selectOption('#destination-market', 'AU_FSANZ');
    await page.fill('#ingredient-list', 'Roasted peanuts (65%), coconut sugar, wheat flour, sodium metabisulfite, tartrazine.');
    await page.fill('#total-sugars-g', '12.0');
    await page.locator('button.primary-cta').click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
    await page.waitForTimeout(200);
    const customSvg = await getDecodedSvg(page);

    const [svgDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("Download Sticker SVG")').click(),
    ]);
    const svgDownloadFilename = svgDownload.suggestedFilename();

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('button:has-text("Copy Customs Dossier")').click();
    await page.waitForTimeout(150);
    const copyDossierStatus = await page.locator('[role="status"]').first().innerText();

    // Simulated upstream error fallback
    await page.goto(`${URL}/?simulateError=1`, { waitUntil: 'networkidle' });
    await page.locator('button.primary-cta').click();
    await page.waitForTimeout(400);
    const fallbackBanner = await page.locator('.status-banner').first().innerText();
    await page.screenshot({ path: path.join(OUT_DIR, 'slice-reg-fallback.png'), fullPage: false });

    // Persistence across reload & huge input + double click
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.fill('#product-name', 'Surabaya Artisanal Tempeh Chips');
    await page.fill('#serving-size', '30');
    await page.locator('button.primary-cta').click();
    await page.waitForTimeout(300);
    await page.reload({ waitUntil: 'networkidle' });
    const persistedName = await page.locator('#product-name').inputValue();
    const persistedServing = await page.locator('#serving-size').inputValue();

    const longIngredients = 'Red chili peppers (42%), shallots, palm olein, belacan (fermented shrimp paste), kemiri (candlenut), kicap manis (sweet soy sauce, soybean, wheat), monosodium glutamate, sodium benzoate, ' + 'turmeric, galangal, lemongrass, kaffir lime leaf, tamarind paste, palm sugar, sea salt, garlic powder, '.repeat(4);
    await page.fill('#ingredient-list', longIngredients);
    await page.locator('button.primary-cta').dblclick();
    await page.waitForTimeout(500);
    const hugeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > 1440);
    await page.screenshot({ path: path.join(OUT_DIR, 'slice-reg-huge-input.png'), fullPage: false });

    report.sliceRegression = {
      loadMs,
      customEditPass: customSvg.includes('INS 223') && customSvg.includes('INS 102') && customSvg.includes('<tspan font-weight="700">'),
      svgDownloadPass: svgDownloadFilename.endsWith('.svg'),
      copyDossierPass: copyDossierStatus.includes('Copied customs dossier to clipboard.'),
      fallbackPass: fallbackBanner.includes('Completed inspection using the built-in statutory rule engine so your work is safe'),
      persistencePass: persistedName === 'Surabaya Artisanal Tempeh Chips' && persistedServing === '30',
      hugeInputNoOverflow: !hugeOverflow,
    };

    await context.close();

    // SPRINT-01 CHECK 6 & BUG 3 Re-verification on Mobile (390x844) & Keyboard-only Tab/Enter navigation
    {
      const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto(URL, { waitUntil: 'networkidle' });

      const mobileTargetMetrics = await mobilePage.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const findBtn = (txt) => btns.find((b) => (b.innerText || '').includes(txt));
        const targets = {};
        for (const label of ['Download Customs Report (.txt)', 'Sticker Focus', 'Side-by-Side Proof', 'Inspect Corridor']) {
          const el = findBtn(label);
          if (el) {
            const r = el.getBoundingClientRect();
            targets[label] = { width: Math.round(r.width), height: Math.round(r.height) };
          }
        }
        const stickerCard = document.querySelector('[data-testid="export-over-sticker"]');
        const originCard = document.querySelector('.origin-proof-card');
        return {
          scrollWidthInitial: document.documentElement.scrollWidth,
          targets,
          stickerTopBeforeToggle: Math.round(stickerCard.getBoundingClientRect().top),
          originTopBeforeToggle: Math.round(originCard.getBoundingClientRect().top),
        };
      });

      // Click Side-by-Side Proof on mobile 390x844 and verify Redlined Origin Package Proof switches to the top (order: -1)
      await mobilePage.locator('.proof-view-bar button:has-text("Side-by-Side Proof")').click();
      await mobilePage.waitForTimeout(200);
      const mobileAfterToggle = await mobilePage.evaluate(() => {
        const stickerCard = document.querySelector('[data-testid="export-over-sticker"]');
        const originCard = document.querySelector('.origin-proof-card');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          originOrder: getComputedStyle(originCard).order,
          stickerTopAfterToggle: Math.round(stickerCard.getBoundingClientRect().top),
          originTopAfterToggle: Math.round(originCard.getBoundingClientRect().top),
        };
      });
      await mobilePage.locator('.proof-view-bar').scrollIntoViewIfNeeded();
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'check-06a-mobile-proof-toggle.png'), fullPage: false });

      // Click Inspect Corridor on mobile 390x844
      const mobileCorridorBtn = mobilePage.locator('[data-testid="corridor-comparison-table"] button:has-text("Inspect Corridor")').first();
      await mobileCorridorBtn.scrollIntoViewIfNeeded();
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'check-06b-mobile-corridor-matrix.png'), fullPage: false });
      await mobileCorridorBtn.click();
      await mobilePage.waitForTimeout(400);
      const scrollWidthMobileAfterCorridor = await mobilePage.evaluate(() => document.documentElement.scrollWidth);

      await mobileContext.close();

      // Keyboard navigation check on desktop (1440x900) for Sprint-01 controls
      const kbContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
      const kbPage = await kbContext.newPage();
      await kbPage.goto(URL, { waitUntil: 'networkidle' });

      const sprintControls = [
        { name: 'Download Customs Report (.txt)', locator: kbPage.locator('button:has-text("Download Customs Report (.txt)")') },
        { name: 'Side-by-Side Proof', locator: kbPage.locator('.proof-view-bar button:has-text("Side-by-Side Proof")') },
        { name: 'Inspect Corridor (Australia)', locator: kbPage.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")') },
      ];

      const focusResults = [];
      for (const ctrl of sprintControls) {
        await ctrl.locator.focus();
        await kbPage.keyboard.press('Shift+Tab');
        await kbPage.keyboard.press('Tab');
        const info = await kbPage.evaluate(() => {
          const el = document.activeElement;
          if (!el) return null;
          const cs = getComputedStyle(el);
          return {
            text: (el.innerText || '').trim(),
            outlineStyle: cs.outlineStyle,
            outlineWidth: cs.outlineWidth,
            outlineColor: cs.outlineColor,
          };
        });
        focusResults.push({ control: ctrl.name, ...info });
      }
      await kbPage.locator('[data-testid="corridor-comparison-table"]').scrollIntoViewIfNeeded();
      await kbPage.screenshot({ path: path.join(OUT_DIR, 'check-06c-keyboard-focus-corridor.png'), fullPage: false });

      // Press Enter on the focused Inspect Corridor (Australia) button
      await kbPage.keyboard.press('Enter');
      await kbPage.waitForTimeout(500);
      const marketAfterKbEnter = await kbPage.locator('#destination-market').inputValue();

      await kbContext.close();

      report.sprint01Checks.check6 = {
        pass:
          mobileTargetMetrics.scrollWidthInitial <= 390 &&
          mobileAfterToggle.scrollWidth <= 390 &&
          mobileTargetMetrics.stickerTopBeforeToggle < mobileTargetMetrics.originTopBeforeToggle &&
          mobileAfterToggle.originOrder === '-1' &&
          mobileAfterToggle.originTopAfterToggle < mobileAfterToggle.stickerTopAfterToggle &&
          scrollWidthMobileAfterCorridor <= 390 &&
          Object.values(mobileTargetMetrics.targets).every((t) => t.height >= 44 && t.width >= 44) &&
          focusResults.every((f) => parseInt(f.outlineWidth, 10) >= 2 && f.outlineStyle !== 'none') &&
          marketAfterKbEnter === 'AU_FSANZ',
        mobileTargetMetrics,
        mobileAfterToggle,
        scrollWidthMobileAfterCorridor,
        focusResults,
        marketAfterKbEnter,
      };
    }

  } finally {
    await browser.close();
  }

  await fs.writeFile(path.join(OUT_DIR, 'flow-results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
