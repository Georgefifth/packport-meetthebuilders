import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = 'https://dimensional-glance-icons-bible.trycloudflare.com';
const OUT_DIR = 'evidence/eval/slice-r2';

async function getDecodedSvg(page) {
  const src = await page.locator('[data-testid="export-over-sticker"] img').getAttribute('src');
  if (!src) return '';
  const prefix = 'data:image/svg+xml;charset=utf-8,';
  return src.startsWith(prefix) ? decodeURIComponent(src.slice(prefix.length)) : src;
}

function normalizeSvgText(svgMarkup) {
  return svgMarkup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const report = {
    url: URL,
    checks: {},
    defectsRecheck: {},
    edgeProbes: {},
    consoleErrors: [],
    badRequests: [],
  };

  try {
    // 1. Stranger Test & Check 1 (First-run landing at 1440x900)
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

      await page.screenshot({ path: path.join(OUT_DIR, 'check-01-landing.png'), fullPage: false });
      await page.screenshot({ path: path.join(OUT_DIR, 'stranger-1-loaded.png'), fullPage: false });

      report.checks.check1 = {
        pass: loadMs <= 4500 && pitchVisible && skuButtonsCount === 3 && primaryCtaVisible && defaultScoreText.includes('12%') && stampText.includes('Hold: Relabel Required') && report.consoleErrors.length === 0 && report.badRequests.length === 0,
        loadMs,
        pitchVisible,
        skuButtonsCount,
        primaryCtaVisible,
        defaultScoreText,
        stampText,
        consoleErrorsCount: report.consoleErrors.length,
        badRequestsCount: report.badRequests.length,
      };

      // Check localStorage key name on initial load (Defect 4 recheck)
      const storageKeys = await page.evaluate(() => Object.keys(window.localStorage));
      const fieldsetMarginTop = await page.locator('.nutrition-fieldset').evaluate((el) => getComputedStyle(el).marginTop);
      report.defectsRecheck.defect4_storageKey = {
        storageKeys,
        hasPackportHistoryV1: storageKeys.includes('packport_history_v1'),
        hasOldPackportStateV1: storageKeys.includes('packport_state_v1'),
        pass: storageKeys.includes('packport_history_v1') && !storageKeys.includes('packport_state_v1'),
      };
      report.defectsRecheck.defect3_fieldsetMargin = {
        fieldsetMarginTop,
        pass: fieldsetMarginTop !== '120px' && parseInt(fieldsetMarginTop, 10) <= 24,
      };

      // Check 3: Statutory Findings list on Example 1
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
      await page.locator('.findings-section-title').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-03-statutory-findings.png'), fullPage: false });

      report.checks.check3 = {
        pass: findingsDetails.length === 7 && findingsDetails.every(f => f.hasSeverityBadge && f.hasRegulation && f.hasFlaggedText && f.hasApplyBtn),
        count: findingsDetails.length,
        findingsDetails,
      };

      // Check 4: Apply single fix first, then Apply All Regulatory Fixes on Example 1 (Singapore SFA)
      await page.locator('.finding-card button:has-text("Apply Fix")').first().click();
      const scoreAfterOneFix = await page.locator('.readiness-number-row').innerText();
      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-04a-single-fix.png'), fullPage: false });

      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      const scoreAfterAllFixes = await page.locator('.readiness-number-row').innerText();
      const stampAfterAllFixes = await page.locator('.rubber-stamp').innerText();
      const svgMarkupEx1 = await getDecodedSvg(page);

      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-04-remediated-sticker.png'), fullPage: false });
      await page.screenshot({ path: path.join(OUT_DIR, 'stranger-2-remediated.png'), fullPage: false });

      // Detailed SVG inspection for Example 1 (Defect 1 recheck)
      const svgPlainEx1 = normalizeSvgText(svgMarkupEx1);
      const ex1HasTspanBold = svgMarkupEx1.includes('<tspan font-weight="700">');
      const ex1HasIns621 = svgPlainEx1.includes('INS 621');
      const ex1HasIns211 = svgPlainEx1.includes('INS 211');
      const ex1HasCompleteContains = svgPlainEx1.includes('Contains: Crustacean (Shrimp / Prawn), Tree Nuts (Candlenut), Soybean.');
      const ex1HasCompleteImporter = svgPlainEx1.includes('Imported by: Straits Pantry Imports Pte. Ltd., 14 Fishery Port Rd, Singapore 619736');
      const ex1HasCropMarks = svgMarkupEx1.includes('M12 30 H18 M20 22 V28');

      // Check 2 & SVG verification on Example 2 (Australia FSANZ) & Example 3 (Japan CAA)
      const [resAu] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/inspect-label')),
        page.locator('.sample-strip .sample-btn').nth(1).click(),
      ]);
      const auStatus = resAu.status();
      await page.waitForTimeout(300);
      const auScoreBefore = await page.locator('.readiness-number-row').innerText();
      const auStampBefore = await page.locator('.rubber-stamp').innerText();
      const auPinsCount = await page.locator('.origin-proof-card .violation-pin').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-02-example-australia.png'), fullPage: false });

      // Apply all fixes on Example 2 (Australia) and check SVG completeness
      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      const svgMarkupEx2 = await getDecodedSvg(page);
      const svgPlainEx2 = normalizeSvgText(svgMarkupEx2);
      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-04b-australia-sticker.png'), fullPage: false });

      const ex2HasIns223 = svgPlainEx2.includes('INS 223');
      const ex2HasIns102 = svgPlainEx2.includes('INS 102');
      const ex2HasCompleteContains = svgPlainEx2.includes('Contains: Tree Nuts (Cashew), Milk / Dairy, Added Sulphites (>10 mg/kg).');
      const ex2HasTspanBold = svgMarkupEx2.includes('<tspan font-weight="700">');
      const ex2HasCompleteImporter = svgPlainEx2.includes('Imported by: Southern Cross Fine Foods Pty Ltd, 88 Docklands Hwy, Melbourne VIC 3008, Australia');

      // Click Example 3 (Japan CAA)
      const [resJp] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/inspect-label')),
        page.locator('.sample-strip .sample-btn').nth(2).click(),
      ]);
      const jpStatus = resJp.status();
      await page.waitForTimeout(300);
      const jpScoreBefore = await page.locator('.readiness-number-row').innerText();
      const jpStampBefore = await page.locator('.rubber-stamp').innerText();
      const jpPinsCount = await page.locator('.origin-proof-card .violation-pin').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-02-example-japan.png'), fullPage: false });

      // Apply all fixes on Example 3 (Japan) and check SVG completeness
      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      const svgMarkupEx3 = await getDecodedSvg(page);
      const svgPlainEx3 = normalizeSvgText(svgMarkupEx3);
      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-04c-japan-sticker.png'), fullPage: false });

      const ex3HasCompleteContains = svgPlainEx3.includes('Contains: Tree Nuts (Cashew), Soybean, Cereals containing Gluten (Oats), Egg, Sesame.');
      const ex3HasTspanBold = svgMarkupEx3.includes('<tspan font-weight="700">');
      const ex3HasCompleteImporter = svgPlainEx3.includes('Imported by: Minato Mirai Trading K.K., 2-4-1 Kaigan, Minato-ku, Tokyo 105-0022, Japan');

      report.checks.check2 = {
        pass: auStatus === 200 && jpStatus === 200 && auStampBefore.includes('Hold: Relabel Required') && jpStampBefore.includes('Hold: Relabel Required') && auPinsCount >= 4 && jpPinsCount >= 4,
        auStatus,
        auScoreBefore,
        auPinsCount,
        jpStatus,
        jpScoreBefore,
        jpPinsCount,
      };

      report.checks.check4 = {
        pass: scoreAfterAllFixes.includes('100%') &&
              scoreAfterAllFixes.includes('Ready to print & ship') &&
              stampAfterAllFixes.includes('Cleared for Export') &&
              ex1HasTspanBold && ex1HasIns621 && ex1HasIns211 && ex1HasCompleteContains && ex1HasCompleteImporter && ex1HasCropMarks &&
              ex2HasIns223 && ex2HasIns102 && ex2HasCompleteContains && ex2HasTspanBold && ex2HasCompleteImporter &&
              ex3HasCompleteContains && ex3HasTspanBold && ex3HasCompleteImporter,
        scoreAfterOneFix,
        scoreAfterAllFixes,
        stampAfterAllFixes,
        ex1: { ex1HasTspanBold, ex1HasIns621, ex1HasIns211, ex1HasCompleteContains, ex1HasCompleteImporter, ex1HasCropMarks },
        ex2: { ex2HasIns223, ex2HasIns102, ex2HasCompleteContains, ex2HasTspanBold, ex2HasCompleteImporter },
        ex3: { ex3HasCompleteContains, ex3HasTspanBold, ex3HasCompleteImporter },
      };

      report.defectsRecheck.defect1_svg = report.checks.check4;

      // Check 5: Custom edit of Destination Market, Ingredient List, and Total Sugars
      await page.locator('.sample-strip .sample-btn').nth(0).click();
      await page.waitForTimeout(300);
      await page.selectOption('#destination-market', 'AU_FSANZ');
      await page.fill('#ingredient-list', 'Roasted peanuts (65%), coconut sugar, wheat flour, sodium metabisulfite, tartrazine.');
      await page.fill('#total-sugars-g', '12.0');
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(500);

      const customProofText = await page.locator('.origin-proof-card').innerText();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-05-custom-edit.png'), fullPage: false });

      // Apply all fixes on custom edit to verify dynamic allergen bolding on non-sample ingredients!
      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      const customSvgMarkup = await getDecodedSvg(page);
      await page.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-05b-custom-remediated-sticker.png'), fullPage: false });

      report.checks.check5 = {
        pass: customProofText.includes('60 g') && customSvgMarkup.includes('<tspan font-weight="700">') && customSvgMarkup.includes('INS 223') && customSvgMarkup.includes('INS 102') && customSvgMarkup.includes('Peanut') && customSvgMarkup.includes('Wheat / Gluten'),
        has60gSugarPer100g: customProofText.includes('60 g'),
        customSvgHasBoldTspan: customSvgMarkup.includes('<tspan font-weight="700">'),
        customSvgHasIns223: customSvgMarkup.includes('INS 223'),
        customSvgHasIns102: customSvgMarkup.includes('INS 102'),
      };

      // Check 6: Download Sticker SVG and Copy Customs Dossier
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button:has-text("Download Sticker SVG")').click(),
      ]);
      const downloadFilename = download.suggestedFilename();
      const downloadBanner = await page.locator('[role="status"]').first().innerText();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-06-download-copy.png'), fullPage: false });

      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.locator('button:has-text("Copy Customs Dossier")').click();
      await page.waitForTimeout(200);
      const copyBanner = await page.locator('[role="status"]').first().innerText();
      await page.screenshot({ path: path.join(OUT_DIR, 'check-06b-copied-dossier.png'), fullPage: false });

      report.checks.check6 = {
        pass: downloadFilename.endsWith('.svg') && downloadBanner.includes('Downloaded compliant over-sticker SVG') && copyBanner.includes('Copied customs dossier to clipboard'),
        downloadFilename,
        downloadBanner,
        copyBanner,
      };

      // Edge Case 1 & Defect 3 header sync: Clear Form
      // First switch to Australia FSANZ, then click Clear Form
      await page.locator('.sample-strip .sample-btn').nth(1).click();
      await page.waitForTimeout(300);
      await page.locator('button.clear-btn').click();
      const emptyStateVisible = await page.locator('.empty-state-box').isVisible();
      const emptyStateText = await page.locator('.empty-state-box').innerText();
      const rightPanelHeadingAfterClear = await page.locator('.ledger-panel').nth(1).locator('.panel-heading').innerText();
      const leftMarketAfterClear = await page.locator('#destination-market').inputValue();
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-01-empty-state.png'), fullPage: false });

      report.checks.edge1 = {
        pass: emptyStateVisible &&
              emptyStateText.includes("Enter your product's ingredients and nutrition values on the left, or click one of the 3 Example APAC SKUs above to run an instant inspection") &&
              rightPanelHeadingAfterClear.includes('Singapore (SFA)') &&
              leftMarketAfterClear === 'SG_SFA',
        emptyStateVisible,
        emptyStateText,
        rightPanelHeadingAfterClear,
        leftMarketAfterClear,
      };
      report.defectsRecheck.defect3_clearFormHeader = {
        rightPanelHeadingAfterClear,
        leftMarketAfterClear,
        pass: rightPanelHeadingAfterClear.includes('Singapore (SFA)'),
      };

      // Edge Case 2 & Defect 2 recheck: Blank Ingredient List, <= 0 Serving Size, localStorage persistence, and Apply All Fixes guard
      await page.locator('.sample-strip .sample-btn').nth(0).click();
      await page.waitForTimeout(300);

      // 2a: Blank Ingredient List
      await page.fill('#ingredient-list', '   ');
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(100);
      const ingredientErrorText = await page.locator('.field-error').innerText();
      const activeIdAfterIngredientError = await page.evaluate(() => document.activeElement?.id);
      const productNamePreserved = await page.locator('#product-name').inputValue();
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-02a-bad-ingredient.png'), fullPage: false });

      // 2b: Serving Size = -5 -> test Apply All Regulatory Fixes, Apply Fix, Run Customs Pre-Flight, and Page Reload
      await page.locator('.sample-strip .sample-btn').nth(0).click();
      await page.waitForTimeout(300);
      await page.fill('#serving-size', '-5');

      // Test clicking Apply All Regulatory Fixes while serving size is -5
      await page.locator('button:has-text("Apply All Regulatory Fixes")').click();
      await page.waitForTimeout(100);
      const servingErrorOnApplyAll = await page.locator('.field-error').innerText();
      const activeIdOnApplyAll = await page.evaluate(() => document.activeElement?.id);
      const scoreWhileInvalid = await page.locator('.readiness-number-row').innerText();
      const stickerMarkupWhileInvalid = await getDecodedSvg(page);
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-02b-bad-serving.png'), fullPage: false });

      // Clear error by typing -5 again and test clicking single Apply Fix while serving size is -5
      await page.fill('#serving-size', '-3');
      await page.locator('.finding-card button:has-text("Apply Fix")').first().click();
      await page.waitForTimeout(100);
      const servingErrorOnSingleApply = await page.locator('.field-error').innerText();

      // Test clicking Run Customs Pre-Flight while serving size is 0
      await page.fill('#serving-size', '0');
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(100);
      const servingErrorOnRunZero = await page.locator('.field-error').innerText();
      const activeIdOnRunZero = await page.evaluate(() => document.activeElement?.id);

      // Test reloading page after typing -5 into serving size (verify -5 was NOT persisted to localStorage)
      await page.fill('#serving-size', '-5');
      await page.waitForTimeout(200);
      const savedServingInStorage = await page.evaluate(() => {
        const raw = window.localStorage.getItem('packport_history_v1');
        return raw ? JSON.parse(raw)?.label?.nutrition?.servingSizeAmount : null;
      });
      await page.reload({ waitUntil: 'networkidle' });
      const servingAfterReload = await page.locator('#serving-size').inputValue();
      const stickerMarkupAfterReload = await getDecodedSvg(page);
      await page.screenshot({ path: path.join(OUT_DIR, 'defect-p1-recheck-reload-serving.png'), fullPage: false });

      report.checks.edge2 = {
        pass: ingredientErrorText.includes('Please enter at least one ingredient on the label') &&
              activeIdAfterIngredientError === 'ingredient-list' &&
              productNamePreserved.includes('Bali Crispy Prawn') &&
              servingErrorOnApplyAll.includes('Serving size must be greater than 0') &&
              activeIdOnApplyAll === 'serving-size' &&
              !scoreWhileInvalid.includes('100%') &&
              !stickerMarkupWhileInvalid.includes('68000 kcal') &&
              servingErrorOnSingleApply.includes('Serving size must be greater than 0') &&
              servingErrorOnRunZero.includes('Serving size must be greater than 0') &&
              activeIdOnRunZero === 'serving-size' &&
              Number(savedServingInStorage) > 0 &&
              Number(servingAfterReload) > 0 &&
              !stickerMarkupAfterReload.includes('Per -5'),
        ingredientErrorText,
        activeIdAfterIngredientError,
        productNamePreserved,
        servingErrorOnApplyAll,
        activeIdOnApplyAll,
        scoreWhileInvalid,
        servingErrorOnSingleApply,
        servingErrorOnRunZero,
        activeIdOnRunZero,
        savedServingInStorage,
        servingAfterReload,
      };
      report.defectsRecheck.defect2_invalidServing = report.checks.edge2;

      // Edge Case 3: Simulated upstream fallback (?simulateError=1)
      await page.goto(`${URL}/?simulateError=1`, { waitUntil: 'networkidle' });
      await page.locator('button.primary-cta').click();
      await page.waitForTimeout(500);
      const fallbackBanner = await page.locator('.status-banner').first().innerText();
      const fallbackFindingsCount = await page.locator('.finding-card').count();
      await page.screenshot({ path: path.join(OUT_DIR, 'edge-03-clean-fallback.png'), fullPage: false });

      report.checks.edge3 = {
        pass: fallbackBanner.includes('Completed inspection using the built-in statutory rule engine so your work is safe') && fallbackFindingsCount >= 5,
        fallbackBanner,
        fallbackFindingsCount,
      };

      await context.close();
    }

    // 2. Check 7: Mobile 390x844 layout & flow
    {
      const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
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
          svgWidth: svgRect ? svgRect.width : 0,
          svgFitsViewport: svgRect ? svgRect.right <= 390 && svgRect.left >= 0 : false,
        };
      });
      await mobilePage.locator('[data-testid="export-over-sticker"]').scrollIntoViewIfNeeded();
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'check-07-mobile-390.png'), fullPage: false });

      report.checks.check7 = {
        pass: mobileMetrics.scrollWidth <= 390 && mobileMetrics.svgFitsViewport && mobileMetrics.svgWidth > 250,
        ...mobileMetrics,
      };
      await mobileContext.close();
    }

    // 3. Check 8: Keyboard-only navigation & focus ring
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
            outlineColor: cs.outlineColor,
          };
        });
        tabStops.push(info);
      }
      await kbPage.screenshot({ path: path.join(OUT_DIR, 'check-08-keyboard-focus.png'), fullPage: false });

      // Focus the Australia SKU pill and press Enter
      await kbPage.locator('.sample-strip .sample-btn').nth(1).focus();
      await kbPage.keyboard.press('Enter');
      await kbPage.waitForTimeout(500);
      const marketAfterEnter = await kbPage.locator('#destination-market').inputValue();

      report.checks.check8 = {
        pass: tabStops.length > 0 && tabStops.every(t => t && parseInt(t.outlineWidth, 10) >= 2 && t.outlineStyle !== 'none') && marketAfterEnter === 'AU_FSANZ',
        tabStops,
        marketAfterEnter,
      };
      await kbContext.close();
    }

    // 4. Additional Edge Probes: Huge input, double click submit, persistence across reload
    {
      const edgeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const edgePage = await edgeContext.newPage();
      await edgePage.goto(URL, { waitUntil: 'networkidle' });

      // Persistence check with valid custom edit
      await edgePage.fill('#product-name', 'Surabaya Artisanal Tempeh Chips');
      await edgePage.fill('#serving-size', '30');
      await edgePage.locator('button.primary-cta').click();
      await edgePage.waitForTimeout(400);
      await edgePage.reload({ waitUntil: 'networkidle' });
      const persistedName = await edgePage.locator('#product-name').inputValue();
      const persistedServing = await edgePage.locator('#serving-size').inputValue();
      await edgePage.screenshot({ path: path.join(OUT_DIR, 'edge-persistence-reload.png'), fullPage: false });

      // Huge input + double click on Run Customs Pre-Flight
      const longIngredients = 'Red chili peppers (42%), shallots, palm olein, belacan (fermented shrimp paste), kemiri (candlenut), kicap manis (sweet soy sauce, soybean, wheat), monosodium glutamate, sodium benzoate, ' + 'turmeric, galangal, lemongrass, kaffir lime leaf, tamarind paste, palm sugar, sea salt, garlic powder, onion powder, coriander seed, cumin, fennel, star anise, cinnamon, clove, nutmeg, cardamom, white pepper, black pepper, '.repeat(4);
      await edgePage.fill('#ingredient-list', longIngredients);
      await edgePage.locator('button.primary-cta').dblclick();
      await edgePage.waitForTimeout(600);
      const overflowAfterHuge = await edgePage.evaluate(() => document.documentElement.scrollWidth > 1440);
      await edgePage.locator('button:has-text("Apply All Regulatory Fixes")').click();
      await edgePage.waitForTimeout(300);
      await edgePage.screenshot({ path: path.join(OUT_DIR, 'edge-huge-input-dblclick.png'), fullPage: false });

      report.edgeProbes = {
        persistencePass: persistedName === 'Surabaya Artisanal Tempeh Chips' && persistedServing === '30',
        persistedName,
        persistedServing,
        hugeInputOverflow: overflowAfterHuge,
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
