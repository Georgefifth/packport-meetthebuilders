# Model selection

This file gives a way to measure model quality for your pipeline, because a ranking written today would be stale and could not be checked here.

## What each role needs

| Role | Needs | Notes |
|---|---|---|
| Builder | Strong coding, long-task coherence, follows a long instruction set | Cost matters; this role uses most tokens |
| Evaluator | Skeptical, reads images, drives a browser, writes honest reports | Use a different model from the builder when you can. A model grading its own family's output tends to be lenient. If it cannot read images, the visual review is degraded; the probe still runs. |
| Researcher (stage 0 and 1) | Web search, reading long pages, citing | A cheaper model is often enough |
| Copywriter (stage 7) | Plain, specific, restrained | Review against the claims ledger |

Anthropic's harness research found that the evaluator is worth its cost when the task sits at the edge of what the builder can do reliably on its own, and becomes overhead when the builder handles the task well. Re-test this each time you change builder models.

## Is it the model, the pipeline, or your taste?

Run a bake-off. It takes about half a day and gives numbers.

1. Pick one real contract: the slice contract of a hackathon you care about.
2. Freeze everything else: the same `design/direction.md`, the same `contracts/slice.md`, the same evaluator model and prompt.
3. Run stages 3 to completion with 2 or 3 builder models on separate branches, same time limit.
4. For each, record in a table: evaluator scores (6 criteria), number of review rounds to pass, probe failures, P0/P1 counts, tokens or cost, wall-clock time.
5. Score each result yourself blind (hide the model names): function, clarity, design, originality, craft, truth, 1 to 5.
6. Compare your scores to the evaluator's. The gap between evaluator and you measures evaluator calibration. The gap between models under the same evaluator measures model quality.

Reading the result:
- Models differ little but scores are low everywhere: the pipeline or the idea is the limit.
- One model clearly better under the same evaluator: model quality matters here; use it for the builder.
- You and the evaluator disagree consistently: your taste differs from its anchors. Add examples to `taste/` and adjust `scoring.md` anchors.
- All models score well but you dislike the result: your taste is the limit; write what you dislike into `taste/bad/` and the direction library.

Template to copy:

| Model | Rounds to pass | P0/P1 left | design | originality | clarity | My design | My clarity | Cost | Time |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

## One model per role

Other pipelines split roles across models, for example a stronger planner and verifier with a cheaper executor (see `docs/REFERENCES.md`). Here, set `model:` in the frontmatter of `.opencode/agents/evaluator.md`, and choose the builder model in the session. Start with the best model you have for the evaluator; a lenient grader costs more than an expensive one.

## Settings

- Give the builder the full `AGENTS.md` and let it load skills on demand; a long always-on context hurts long runs.
- Compaction is fine within a stage. Between stages, the files (`STATE.md`, rubric, brief, contracts) carry the state, so a fresh session can resume.
- Use the same model for `/hack-review contract` and `/hack-review slice` so the contract is read in the same way it is later graded.
