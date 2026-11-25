---
name: truthful-copy
description: Write README, Devpost text and video narration that make only claims the repo can prove. Maintain the claims ledger. Use whenever writing anything public, and before every gate 4, 5 and 7.
---

## Rule

If it is not true in the repo today, it does not appear as a present-tense claim. A judge who opens the code and finds that a named tool is absent, a number is invented or a feature is simulated will distrust everything else in the entry.

## The ledger

`project/claims.md` is a table: claim as written, evidence, kind (`cmd`, `file`, `url`). `scripts/audit_claims.py` runs it and also checks:
- every named technology has a dependency, import, config file or API call in the repo (a mention in a UI string or comment does not count)
- every number in public copy appears in the ledger

Make the ledger as you write, not at the end. Examples:

| Claim | Evidence | Kind |
|---|---|---|
| 42 tests pass | `npm test` | cmd |
| Handles files up to 50 MB | `node tests/large-file.mjs` | cmd |
| Live at the URL in the README | `https://example.app` | url |
| Verdict accuracy 19/22 on public fixtures | `evaluation/fixture-results.md` | file |

## Writing patterns

- **Verbs for things that exist.** "Flags double-billed lines" not "will flag". If it does not do it yet, it goes under "What's next".
- **Name what is simulated.** "Example data from <source>" and "Demo mode uses a recorded sample" are fine and build trust.
- **Numbers come from commands.** Say how you measured: "median 180 ms over 50 runs on a laptop", not "blazing fast".
- **No superlatives.** Delete "first", "only", "revolutionary", "seamless", "100%", "zero-bloat" unless the ledger proves them.
- **Do not borrow credibility.** Do not list tools, standards or datasets you did not use. Do not imply partnerships.
- **Say what it does not do.** One honest limitation is more convincing than none.
- **Hosted services count as dependencies.** If the product needs a hosted backend, say so and say what happens when it is down.

## Sponsor tool write-ups

Specific beats enthusiastic. Name the feature, when you used it, what it changed, and point to a file that shows it. "A spec in `.kiro/specs/quote-check/` fixed the three states the evaluator later tested" is evidence. "Kiro was amazing" is not.

## Before publishing

1. `python3 scripts/audit_claims.py`
2. Read the text once as a skeptical judge with the repo open. Every sentence: where would I check this?
3. Remove or move anything unproven.
