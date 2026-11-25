---
name: customer-clarity
description: Make a product understandable and usable by a first-time visitor in ten seconds. Covers plain-language labels, the instant demo path, states, accessibility basics and the stranger test. Use when specifying, building or evaluating any user-facing flow.
---

## The standard

A judge opens your link between other submissions. They know nothing about you. In ten seconds they must know what the product is for, who it is for, and what to click. In thirty they must have seen a real result and understood what it means. If they have to read documentation, sign up, find their own data or decode labels, most will leave.

## Rules

**First screen**
1. One sentence saying what the product does in the user's words ("Check whether a repair quote is fair"). Not a slogan, not a category.
2. One primary action, visually dominant. A secondary "Try an example" if the primary needs the user's own input.
3. No navigation to features that do not exist yet. No tabs that explain the product.

**Instant demo path**
4. A judge with no data and no account reaches the core result in one click and under ten seconds. The example is real input (clearly labelled "Example"), processed by the real logic.
5. No login wall. If an account is truly needed, offer a demo mode and put credentials in the private Devpost field.

**Words**
6. Write labels as a person would say them. Verbs for buttons ("Check quote", "Download report"), plain nouns for sections.
7. No `UPPER_SNAKE_CASE`, no codenames, no numbering like `01 //`, no abbreviations the user does not use. If a term is unavoidable, explain it where it appears.
8. Every number has a unit and a meaning: "$340 (about 2x the usual price for this job)", not "2.04".
9. Every result says what it means and what to do next. A score alone is not a result.

**States**
10. Empty: say what goes here and offer the next action (or the example).
11. Loading over 1 second: show progress or what is happening. Over 8 seconds: say so and offer cancel.
12. Error: say what happened in plain words, whether the user's work is safe, and one way forward. Never show a raw stack trace or status code alone.
13. Bad input: point at the field, say what is expected, keep what the user typed.
14. Success: confirm what changed and how to undo or continue.

**Craft that users feel**
15. Text at least 16px for reading, labels at least 12px, contrast at least 4.5:1.
16. Tap targets at least 44px. Everything works at 390px wide without sideways scrolling.
17. Keyboard: tab order follows the visual order, focus is visible, Enter submits.
18. Inputs have labels. Images have alt text. Do not use colour alone for meaning.
19. Remove choices: sensible defaults beat settings. If a setting needs explaining, it probably should not exist.

**Honesty**
20. Example data is labelled. Computed values are computed. No decorative numbers, no fake "live" feeds.
21. Presentation material (architecture diagrams, "how it works" tours) belongs in the video and README, not inside the product.

## Stranger test protocol

Used by the evaluator. Give the tester only the URL and the one-sentence pitch.
1. Open the page. After 5 seconds, write one sentence: what is this? Compare to the real pitch.
2. Attempt the core task from `design/ux-contract.md`. Record each pause over 5 seconds, each wrong click, each word not understood.
3. Pass: correct understanding at 5 seconds, task completed in the time budget, at most 1 hesitation.
4. Run it again at 390px width.
Record the timeline in the evaluation report. A stranger who completes the task but wrongly describes the product still fails.

## Label review

List every visible string (`document.body.innerText` from the page, or the strings in the components). Read them aloud as the target user. Rewrite any that a friend who does not know the project would not understand.
