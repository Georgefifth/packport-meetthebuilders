---
name: browser-verification
description: Test a running web product the way a judge does, with a real browser, and write evidence. Covers the probe script, driving flows with Playwright, edge probes, scoring and bug filing. Use for every evaluation and for self-checks before asking for one.
---

## Principle

A page that renders is not a product that works. Verify behaviour and business results in a real browser against the deployed URL. Reading code and checking that an element exists proves nothing about whether a user can finish the task.

## Tools

- `node scripts/browser/probe.mjs <url> --out <dir>` loads desktop (1440x900) and mobile (390x844), captures screenshots and measures: console errors, failed requests, horizontal overflow, share of text under 12px and under 14px, low contrast, all-caps share, identifier-style labels, monospace share, tap targets, missing title/lang/h1, words above the fold. Exit 1 means a blocking finding. Output: `<dir>/latest.json` and PNGs.
- Your own Playwright scripts in `evaluation/scripts/` for flows. Start from `references/flow-template.mjs`.
- The Playwright MCP server, if enabled in `opencode.jsonc`.
- `scripts/browser/record.mjs` records a scripted flow to video.

## Method

1. **Measure first.** Run the probe. Any FAIL is a defect to report, with the number.
2. **Stranger test.** Follow the protocol in the `customer-clarity` skill before looking at code.
3. **Walk the contract.** For each check: perform the action with real clicks and typing, wait for the result, assert the business outcome (the right number, the right text, data still there after reload), and save a screenshot named `evidence/eval/<contract>-r<N>/<check>.png`.
4. **Persistence.** If the product saves anything, reload the page (and open a fresh context) and confirm it is still there.
5. **Edge probes.** Empty input. Very long input. Wrong file type. Double click on submit. Refresh mid-action. Back button. Offline or slow network. Keyboard only. 390px width. Browser zoom 200%.
6. **Console and network.** Zero uncaught errors, zero failed requests during the core flow.
7. **Regression.** After fixes, re-run every earlier check, not just the one that failed.
8. **Flake rule.** If a check fails once, retry once. Failed twice means it fails. Passed on retry means log it as flaky (P2).

## Reporting

- Write defects first, with severity: P0 core flow broken or data lost; P1 a first-time user gets stuck or misled; P2 rough edge; P3 polish.
- Each defect: what happened, exact steps, expected result, evidence path.
- Say "not tested" for anything you did not test. Never write "should work".
- Scores use the anchors in `references/scoring.md`. Cite the evidence for any score above 3.
- A report with fewer than 3 existing evidence files is invalid.

## Vision

If your model can read images, open the screenshots and look at them: overlap, clipping, hierarchy, whether the primary action stands out. If it cannot, say so in the report and rely on the probe measurements plus DOM checks, and tell the builder the visual review needs a vision-capable model.

## Not your job

Fixing the product. Rewriting the contract. Raising a score because the effort was large.
