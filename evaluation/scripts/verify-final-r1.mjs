import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = 'https://dimensional-glance-icons-bible.trycloudflare.com';
const OUT_DIR = 'evidence/eval/final-r1';

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
    sliceChecks: {},
    sliceEdges: {},
    sprint01Checks: {},
    sprint01Edges: {},
    extraEdgeProbes: {},
    consoleErrors: [],
    badRequests: [],
  };

  try {
    // 1. Desktop 1440x900: Slice Checks 1-6, Slice Edges 1-3, Sprint-01 Checks 1-5, Sprint-01 Edges 1-2
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
      const page = await context.newPage();
      page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
      page.on('pageerror', (e) => report.consoleErrors.push(String(e)));
      page.on('requestfailed', (req) => report.badRequests.push({ url: req.url(), reason: req.failure()?.errorText }));
      page.on('response', (res) => { if (res.status() >= 400) report.badRequests.push({ url: res.url(), status: res.status() }); });

      const t0 = Date.now();
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      const loadMs = Date.now() - t0;

      const bodyText = await page.innerText('body');
      const pitchVisible = bodyText.includes('Catch customs label violations and generate a print-ready Singapore, Australia, or Japan export over-sticker before your shipment leaves port');
      const skuButtonsCount = await page.locator('.sample-strip .sample-btn').count();
      const primaryCtaVisible = await page.locator('button.primary-cta').isVisible();
      const defaultScoreText = await page.locator('.readiness-number-row').innerText();
      const stampText = await page.locator('.rubber-stamp').innerText();

      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-01-landing.png'), fullPage: false });

      report.sliceChecks.check1 = {
        pass: loadMs <= 4500 && pitchVisible && skuButtonsCount === 3 && primaryCtaVisible && defaultScoreText.includes('16%') && stampText.includes('Hold: Relabel Required') && report.consoleErrors.length === 0 && report.badRequests.length === 0,
        loadMs,
        pitchVisible,
        skuButtonsCount,
        primaryCtaVisible,
        defaultScoreText,
        stampText,
      };

      // Slice Check 3: Statutory Findings list on Example 1
      const findingsCards = await page.locator('.finding-card').all();
      const findingsDetails = [];
      for (const card of findingsCards) {
        const text = await card.innerText();
        const hasApplyBtn = await card.locator('button:has-text("Apply Fix")').isVisible();
        findingsDetails.push({
          hasSeverityBadge: text.includes('Customs Hold (Must Fix)') || text.includes('Label Warning (Recommended Fix)'),
          hasRegulation: text.includes('Regulation:'),
          hasFlaggedText: text.includes('Flagged on origin pack:'),
          hasApplyBtn,
        });
      }
      await page.locator('.findings-section-title').last().scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-03-findings.png'), fullPage: false });

      report.sliceChecks.check3 = {
        pass: findingsDetails.length === 7 && findingsDetails.every((f) => f.hasSeverityBadge && f.hasRegulation && f.hasFlaggedText && f.hasApplyBtn),
        count: findingsDetails.length,
      };

      // Sprint-01 Check 1: Multi-Corridor Readiness Comparison table
      const matrixLoc = page.locator('[data-testid="corridor-comparison-table"]');
      await matrixLoc.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'sprint01-check-01-corridor-matrix.png'), fullPage: false });
      const rows = await matrixLoc.locator('.corridor-row-card').all();
      const rowData = [];
      for (const r of rows) {
        const text = await r.innerText();
        const hasInspectBtn = await r.locator('button:has-text("Inspect Corridor")').isVisible();
        const hasActiveBadge = await r.locator('.active-corridor-badge').isVisible();
        rowData.push({ text, hasInspectBtn, hasActiveBadge });
      }
      const distinctScoresEx1 = new Set(rowData.map((r) => (r.text.match(/(\d+)%/) || [])[1] || ''));
      const distinctTopFindingsEx1 = new Set(rowData.map((r) => (r.text.match(/Top finding:\s*(.+)/) || [])[1]?.trim() || ''));

      report.sprint01Checks.check1 = {
        pass:
          rows.length === 3 &&
          rowData[0].text.includes('Singapore (SFA)') &&
          rowData[0].hasActiveBadge &&
          rowData[1].text.includes('Australia (FSANZ)') &&
          rowData[1].hasInspectBtn &&
          rowData[2].text.includes('Japan (CAA)') &&
          rowData[2].hasInspectBtn &&
          distinctScoresEx1.size === 3 &&
          distinctTopFindingsEx1.size === 3,
        distinctScores: Array.from(distinctScoresEx1),
        distinctTopFindings: Array.from(distinctTopFindingsEx1),
      };

      // Sprint-01 Check 2: Click Inspect Corridor on Australia (FSANZ) and Japan (CAA)
      await matrixLoc.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")').click();
      await page.waitForTimeout(450);
      const leftMarketAfterAuInspect = await page.locator('#destination-market').inputValue();
      const rightHeadingAfterAuInspect = await page.locator('.ledger-panel').nth(1).locator('.panel-heading').innerText();
      const auRowActive = await matrixLoc.locator('[data-testid="corridor-row-AU_FSANZ"] .active-corridor-badge').isVisible();
      const auStickerSvg = await getDecodedSvg(page);
      await page.screenshot({ path: path.join(OUT_DIR, 'sprint01-check-02a-inspect-au.png'), fullPage: false });

      await matrixLoc.locator('[data-testid="corridor-row-JP_CAA"] button:has-text("Inspect Corridor")').click();
      await page.waitForTimeout(450);
      const leftMarketAfterJpInspect = await page.locator('#destination-market').inputValue();
      const rightHeadingAfterJpInspect = await page.locator('.ledger-panel').nth(1).locator('.panel-heading').innerText();
      const jpRowActive = await matrixLoc.locator('[data-testid="corridor-row-JP_CAA"] .active-corridor-badge').isVisible();
      const jpStickerSvg = await getDecodedSvg(page);
      await page.screenshot({ path: path.join(OUT_DIR, 'sprint01-check-02b-inspect-jp.png'), fullPage: false });

      report.sprint01Checks.check2 = {
        pass:
          leftMarketAfterAuInspect === 'AU_FSANZ' &&
          rightHeadingAfterAuInspect.includes('Australia (FSANZ)') &&
          auRowActive &&
          auStickerSvg.includes('Australia FSANZ') &&
          leftMarketAfterJpInspect === 'JP_CAA' &&
          rightHeadingAfterJpInspect.includes('Japan (CAA)') &&
          jpRowActive &&
          jpStickerSvg.includes('Japan CAA'),
      };

      // Switch back to Singapore (SFA) and test Slice Check 4 & Sprint-01 Check 3
      await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"] button:has-text("Inspect Corridor")').click();
      await page.waitForTimeout(450);

      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      await page.waitForTimeout(300);
      const scoreAfterAllFixes = await page.locator('.readiness-number-row').innerText();
      const stampAfterAllFixes = await page.locator('.rubber-stamp').innerText();
      const svgMarkupEx1 = await getDecodedSvg(page);
      const svgPlainEx1 = normalizeSvgText(svgMarkupEx1);
      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-04-remediated-sticker.png'), fullPage: false });

      const sgRowTextAfterFix = await matrixLoc.locator('[data-testid="corridor-row-SG_SFA"]').innerText();
      await matrixLoc.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'sprint01-check-03-corridor-100pct.png'), fullPage: false });

      report.sliceChecks.check4 = {
        pass:
          scoreAfterAllFixes.includes('100%') &&
          scoreAfterAllFixes.includes('Ready to print & ship') &&
          stampAfterAllFixes.includes('Cleared for Export') &&
          svgMarkupEx1.includes('<tspan font-weight="700">') &&
          svgPlainEx1.includes('INS 621') &&
          svgPlainEx1.includes('INS 211') &&
          svgPlainEx1.includes('Contains: Crustacean (Shrimp / Prawn), Tree Nuts (Candlenut), Soybean.'),
        scoreAfterAllFixes,
        stampAfterAllFixes,
      };

      report.sprint01Checks.check3 = {
        pass: sgRowTextAfterFix.includes('100%') && sgRowTextAfterFix.includes('Cleared for Export'),
        sgRowTextAfterFix,
      };

      // Sprint-01 Check 4: Side-by-Side Proof vs Sticker Focus toggle on desktop
      const toggleContainer = page.locator('.proof-view-bar');
      await toggleContainer.scrollIntoViewIfNeeded();
      await toggleContainer.locator('button:has-text("Side-by-Side Proof")').click();
      await page.waitForTimeout(200);
      const gridAfterSideBySide = await page.locator('.proof-comparison-grid').evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          gridTemplateColumns: cs.gridTemplateColumns,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });
      await page.screenshot({ path: path.join(OUT_DIR, 'sprint01-check-04-side-by-side.png'), fullPage: false });

      await toggleContainer.locator('button:has-text("Sticker Focus")').click();
      await page.waitForTimeout(200);
      const gridAfterFocus = await page.locator('.proof-comparison-grid').evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          gridTemplateColumns: cs.gridTemplateColumns,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      report.sprint01Checks.check4 = {
        pass:
          gridAfterSideBySide.gridTemplateColumns.split(' ').filter(Boolean).length === 2 &&
          gridAfterFocus.gridTemplateColumns.split(' ').filter(Boolean).length === 1 &&
          gridAfterSideBySide.scrollWidth <= 1440 &&
          gridAfterFocus.scrollWidth <= 1440,
        gridAfterSideBySide,
        gridAfterFocus,
      };

      // Slice Check 6 & Sprint-01 Check 5: Download Sticker SVG, Copy Customs Dossier, Download Customs Report (.txt)
      const [svgDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button:has-text("Download Sticker SVG")').click(),
      ]);
      const svgFilename = svgDownload.suggestedFilename();
      const svgBanner = await page.locator('[role="status"]').first().innerText();

      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.locator('button:has-text("Copy Customs Dossier")').click();
      await page.waitForTimeout(150);
      const copyBanner = await page.locator('[role="status"]').first().innerText();

      const [txtDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button:has-text("Download Customs Report (.txt)")').click(),
      ]);
      const txtFilename = txtDownload.suggestedFilename();
      const txtPath = await txtDownload.path();
      const txtContent = txtPath ? await fs.readFile(txtPath, 'utf8') : '';
      const txtBanner = await page.locator('[role="status"]').first().innerText();
      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-06-sprint01-check-05-exports.png'), fullPage: false });

      report.sliceChecks.check6 = {
        pass: svgFilename.endsWith('.svg') && svgBanner.includes('Downloaded compliant over-sticker SVG') && copyBanner.includes('Copied customs dossier to clipboard'),
        svgFilename,
        svgBanner,
        copyBanner,
      };

      report.sprint01Checks.check5 = {
        pass:
          txtFilename.endsWith('.txt') &&
          txtBanner.includes('Downloaded customs inspection report (.txt).') &&
          txtContent.includes('Bali Crispy Prawn & Candlenut Sambal') &&
          txtContent.includes('PER 100G') &&
          txtContent.includes('ITEMIZED STATUTORY FINDINGS'),
        txtFilename,
        txtBanner,
        txtLength: txtContent.length,
      };

      // Slice Check 2: Switch across Example 2 (Australia) & Example 3 (Japan)
      const [resAu] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/inspect-label')),
        page.locator('.sample-strip .sample-btn').nth(1).click(),
      ]);
      await page.waitForTimeout(300);
      const auStampBefore = await page.locator('.rubber-stamp').innerText();
      const auPinsCount = await page.locator('.origin-proof-card .violation-pin').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-02a-example-australia.png'), fullPage: false });

      const [resJp] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/inspect-label')),
        page.locator('.sample-strip .sample-btn').nth(2).click(),
      ]);
      await page.waitForTimeout(300);
      const jpStampBefore = await page.locator('.rubber-stamp').innerText();
      const jpPinsCount = await page.locator('.origin-proof-card .violation-pin').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-02b-example-japan.png'), fullPage: false });

      report.sliceChecks.check2 = {
        pass: resAu.status() === 200 && resJp.status() === 200 && auStampBefore.includes('Hold: Relabel Required') && jpStampBefore.includes('Hold: Relabel Required') && auPinsCount >= 4 && jpPinsCount >= 4,
        auStatus: resAu.status(),
        jpStatus: resJp.status(),
        auPinsCount,
        jpPinsCount,
      };

      // Slice Check 5: Custom edit of Destination Market, Ingredient List, Total Sugars
      await page.locator('.sample-strip .sample-btn').nth(0).click();
      await page.waitForTimeout(300);
      await page.selectOption('#destination-market', 'AU_FSANZ');
      await page.fill('#ingredient-list', 'Roasted peanuts (65%), coconut sugar, wheat flour, sodium metabisulfite, tartrazine.');
      await page.fill('#total-sugars-g', '12.0');
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(450);
      const customProofText = await page.locator('.origin-proof-card').innerText();
      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      await page.waitForTimeout(250);
      const customSvg = await getDecodedSvg(page);
      await page.screenshot({ path: path.join(OUT_DIR, 'slice-check-05-custom-edit.png'), fullPage: false });

      report.sliceChecks.check5 = {
        pass: customProofText.includes('60 g') && customSvg.includes('<tspan font-weight="700">') && customSvg.includes('INS 223') && customSvg.includes('INS 102'),
        has60gSugarPer100g: customProofText.includes('60 g'),
      };

      // Slice Edge 1 & Sprint-01 Edge 1: Clear Form empty state
      await page.locator('button.clear-btn').click();
      await page.waitForTimeout(200);
      const emptyStateVisible = await page.locator('.empty-state-box').isVisible();
      const emptyStateText = await page.locator('.empty-state-box').innerText();
      const matrixCountWhenCleared = await page.locator('[data-testid="corridor-comparison-table"]').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-01-clear-form-empty-state.png'), fullPage: false });

      await page.locator('.sample-strip .sample-btn').nth(0).click();
      await page.waitForTimeout(400);
      const matrixVisibleAfterReloadSku = await page.locator('[data-testid="corridor-comparison-table"]').isVisible();

      report.sliceEdges.edge1 = {
        pass: emptyStateVisible && emptyStateText.includes("Enter your product's ingredients and nutrition values on the left, or click one of the 3 Example APAC SKUs above to run an instant inspection"),
        emptyStateVisible,
      };
      report.sprint01Edges.edge1 = {
        pass: matrixCountWhenCleared === 0 && emptyStateVisible && matrixVisibleAfterReloadSku,
        matrixCountWhenCleared,
        matrixVisibleAfterReloadSku,
      };

      // Slice Edge 2 & Sprint-01 Edge 2: Blank ingredient list & invalid serving size (<= 0)
      await page.fill('#ingredient-list', '   ');
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(150);
      const ingredientErrorText = await page.locator('.field-error').innerText();
      const focusAfterIngredientError = await page.evaluate(() => document.activeElement?.id);
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-02a-blank-ingredient-error.png'), fullPage: false });

      await page.locator('.sample-strip .sample-btn').nth(0).click();
      await page.waitForTimeout(350);
      await page.fill('#serving-size', '-5');
      await page.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")').click();
      await page.waitForTimeout(150);
      const servingErrorOnInspectCorridor = await page.locator('.field-error').innerText();
      const focusAfterServingError = await page.evaluate(() => document.activeElement?.id);

      await page.fill('#serving-size', '0');
      await page.locator('button:has-text("Download Customs Report (.txt)")').click();
      await page.waitForTimeout(150);
      const servingErrorOnDownloadReport = await page.locator('.field-error').innerText();
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-02b-invalid-serving-error.png'), fullPage: false });

      report.sliceEdges.edge2 = {
        pass:
          ingredientErrorText.includes('Please enter at least one ingredient on the label') &&
          focusAfterIngredientError === 'ingredient-list' &&
          servingErrorOnInspectCorridor.includes('Serving size must be greater than 0') &&
          focusAfterServingError === 'serving-size',
        ingredientErrorText,
        servingErrorOnInspectCorridor,
      };
      report.sprint01Edges.edge2 = {
        pass:
          servingErrorOnInspectCorridor.includes('Serving size must be greater than 0') &&
          servingErrorOnDownloadReport.includes('Serving size must be greater than 0'),
      };

      // Slice Edge 3: Simulated upstream error fallback (?simulateError=1)
      await page.goto(`${URL}/?simulateError=1`, { waitUntil: 'networkidle' });
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(450);
      const fallbackBanner = await page.locator('.status-banner').first().innerText();
      const fallbackFindingsCount = await page.locator('.finding-card').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-03-upstream-fallback.png'), fullPage: false });

      report.sliceEdges.edge3 = {
        pass: fallbackBanner.includes('Completed inspection using the built-in statutory rule engine so your work is safe') && fallbackFindingsCount >= 5,
        fallbackBanner,
        fallbackFindingsCount,
      };

      await context.close();
    }

    // 2. Mobile 390x844: Slice Check 7 & Sprint-01 Check 6
    {
      const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto(URL, { waitUntil: 'networkidle' });
      await mobilePage.locator('button:has-text("Apply All Regulatory Fixes")').click();
      await mobilePage.waitForTimeout(300);

      const mobileMetrics = await mobilePage.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const svgEl = document.querySelector('[data-testid="export-over-sticker"] img');
        const svgRect = svgEl ? svgEl.getBoundingClientRect() : null;
        return {
          scrollWidth,
          svgWidth: svgRect ? Math.round(svgRect.width) : 0,
          svgFitsViewport: svgRect ? svgRect.right <= 390 && svgRect.left >= 0 : false,
        };
      });
      await mobilePage.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'slice-check-07-mobile-390.png'), fullPage: false });

      // Toggle Side-by-Side Proof on mobile
      await mobilePage.locator('.proof-view-bar button:has-text("Side-by-Side Proof")').click();
      await mobilePage.waitForTimeout(200);
      const mobileToggleMetrics = await mobilePage.evaluate(() => {
        const originCard = document.querySelector('.origin-proof-card');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          originOrder: getComputedStyle(originCard).order,
        };
      });
      await mobilePage.locator('.proof-view-bar').scrollIntoViewIfNeeded();
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'sprint01-check-06-mobile-toggle.png'), fullPage: false });

      report.sliceChecks.check7 = {
        pass: mobileMetrics.scrollWidth <= 390 && mobileMetrics.svgFitsViewport && mobileMetrics.svgWidth > 250,
        ...mobileMetrics,
      };
      report.sprint01Checks.check6_mobile = {
        pass: mobileToggleMetrics.scrollWidth <= 390 && mobileToggleMetrics.originOrder === '-1',
        ...mobileToggleMetrics,
      };

      await mobileContext.close();
    }

    // 3. Keyboard-only navigation: Slice Check 8 & Sprint-01 Check 6
    {
      const kbContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const kbPage = await kbContext.newPage();
      await kbPage.goto(URL, { waitUntil: 'networkidle' });

      const tabStops = [];
      for (let i = 0; i < 6; i++) {
        await kbPage.keyboard.press('Tab');
        const info = await kbPage.evaluate(() => {
          const el = document.activeElement;
          if (!el) return null;
          const cs = getComputedStyle(el);
          return {
            tag: el.tagName,
            text: (el.innerText || el.getAttribute('aria-label') || el.id || '').slice(0, 50),
            outlineStyle: cs.outlineStyle,
            outlineWidth: cs.outlineWidth,
          };
        });
        tabStops.push(info);
      }
      await kbPage.screenshot({ path: path.join(OUT_DIR, 'slice-check-08-keyboard-focus.png'), fullPage: false });

      await kbPage.locator('[data-testid="corridor-row-AU_FSANZ"] button:has-text("Inspect Corridor")').focus();
      await kbPage.keyboard.press('Enter');
      await kbPage.waitForTimeout(450);
      const marketAfterKbEnter = await kbPage.locator('#destination-market').inputValue();

      report.sliceChecks.check8 = {
        pass: tabStops.every((t) => t && parseInt(t.outlineWidth, 10) >= 2 && t.outlineStyle !== 'none') && marketAfterKbEnter === 'AU_FSANZ',
        tabStops,
        marketAfterKbEnter,
      };
      report.sprint01Checks.check6 = {
        pass: report.sprint01Checks.check6_mobile.pass && report.sliceChecks.check8.pass,
      };
      await kbContext.close();
    }

    // 4. Extra Edge Probes: Huge input, double click, refresh mid-action / persistence, back button, slow network, 200% zoom
    {
      const edgeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const edgePage = await edgeContext.newPage();
      await edgePage.goto(URL, { waitUntil: 'networkidle' });

      // Persistence across reload
      await edgePage.fill('#product-name', 'Bandung Artisanal Sambal Roa');
      await edgePage.fill('#serving-size', '25');
      await edgePage.locator('button.primary-cta').click();
      await edgePage.waitForTimeout(400);
      await edgePage.reload({ waitUntil: 'networkidle' });
      const persistedName = await edgePage.locator('#product-name').inputValue();
      const persistedServing = await edgePage.locator('#serving-size').inputValue();

      // Huge input + double click
      const longIngredients = 'Red chili peppers (42%), shallots, palm olein, belacan (fermented shrimp paste), kemiri (candlenut), kicap manis (sweet soy sauce, soybean, wheat), monosodium glutamate, sodium benzoate, ' + 'turmeric, galangal, lemongrass, kaffir lime leaf, tamarind paste, palm sugar, sea salt, garlic powder, '.repeat(5);
      await edgePage.fill('#ingredient-list', longIngredients);
      await edgePage.locator('button.primary-cta').dblclick();
      await edgePage.waitForTimeout(500);
      const hugeOverflow = await edgePage.evaluate(() => document.documentElement.scrollWidth > 1440);
      await edgePage.screenshot({ path: path.join(OUT_DIR, 'edge-probe-huge-input-dblclick.png'), fullPage: false });

      // Browser zoom 200% (simulated via 720x450 viewport + deviceScaleFactor 2)
      await edgePage.setViewportSize({ width: 720, height: 450 });
      await edgePage.waitForTimeout(200);
      const zoom200Overflow = await edgePage.evaluate(() => document.documentElement.scrollWidth > 720);
      await edgePage.screenshot({ path: path.join(OUT_DIR, 'edge-probe-zoom-200pct.png'), fullPage: false });

      // Slow network (300ms latency on /api/inspect-label) + Back button
      await edgePage.setViewportSize({ width: 1440, height: 900 });
      await edgePage.route('**/api/inspect-label**', async (route) => {
        await new Promise((r) => setTimeout(r, 400));
        await route.continue();
      });
      const clickPromise = edgePage.locator('.sample-strip .sample-btn').nth(2).click();
      await edgePage.waitForTimeout(100);
      const loadingBtnText = await edgePage.locator('button.primary-cta').innerText();
      await clickPromise;
      await edgePage.waitForTimeout(500);

      report.extraEdgeProbes = {
        persistencePass: persistedName === 'Bandung Artisanal Sambal Roa' && persistedServing === '25',
        hugeInputNoOverflow: !hugeOverflow,
        zoom200NoOverflow: !zoom200Overflow,
        slowNetworkLoadingStateText: loadingBtnText,
      };
      await edgeContext.close();
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
