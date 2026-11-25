# Evaluation: {{contract}} round {{n}}

- contract: {{slice | sprint-01 | final}}
- round: {{n}}
- verdict: FAIL
- scores: function=0 clarity=0 design=0 originality=0 craft=0 truth=0
- p0: 0
- p1: 0
- stranger_test: n/a
- builder_model: {{model}}
- evaluator_model: {{model}}

Scores are integers 1-5 using the anchors in `.opencode/skills/browser-verification/references/scoring.md`.
Thresholds: function>=4, clarity>=4, truth>=4, design>=3, originality>=3, craft>=3. PASS only if every threshold is met and p0=p1=0.

## Defects first
List every defect before anything positive. Each: severity, what happened, steps to reproduce, evidence file.
1. {{P1 | what | steps | evidence/eval/...png}}

## Contract checks
One line per checkbox in the contract: PASS or FAIL, with the evidence path.

## Stranger test
What the stranger tried, in order, with timestamps. Every hesitation. Every wrong click. Every label they did not understand.

## Design review
Against design/direction.md: what is distinctive, what is generic, what contradicts the direction. Name the three most "AI default" things you see.

## Truth review
Anything on screen or in copy that is simulated, hard-coded, or claims more than the product does.

## Measurements
Probe output summary (evidence/probe/latest.json): console errors, tiny text share, contrast, overflow.

## What to fix first
The three changes that would raise the score most.

## Evidence
List every file you used: evidence/eval/round-N/*.png etc.
