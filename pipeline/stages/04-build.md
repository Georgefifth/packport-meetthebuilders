# Stage 4: Build-out

Goal: add the features that move the judging criteria, one contract at a time, each independently verified. A smaller product where everything works beats a larger one with stubs.

## Loop (repeat per contract)

1. Pick the next item from `project/spec.md` by value: what will appear in the video, what the highest-weighted criterion rewards, what reduces the chance of a judge getting stuck. Reliability before breadth.
2. Write `contracts/sprint-NN.md` from `pipeline/templates/contract.md`. Run `/hack-review contract sprint-NN` so the evaluator tightens the checks before you build.
3. Build it. Keep to the design direction and the glossary. New screens obey one-primary-action.
4. Self-check: `node scripts/browser/probe.mjs <live_url> --out evidence/probe` and `python3 scripts/ui_lint.py`. Deploy.
5. Run `/hack-review sprint-NN`. Fix findings. Maximum 3 rounds per contract.
6. If it still fails after 3 rounds, cut the feature: remove it from the product, the README, the claims and the storyboard. Record it under "Out of scope" in `project/brief.md`. A half-built feature is worse than none.
7. Tick the contract boxes only from the evaluator's report.

## Always
- Update `project/claims.md` when you add anything you will mention in public: every number, benchmark and "works with X".
- Append to `project/sponsor-usage.md` when a sponsor tool changes the work. Include the repo path that proves it.
- Keep `README.md` current: what it is, how a judge tries it in 10 seconds (the instant demo path), how to run it locally in 3 commands, what is real and what is simulated.
- Commit small and often with clear messages. Push after each passing contract.
- Respect the feature freeze date from the rubric. After it, only fix bugs and polish.

## Gate
`python3 scripts/gate.py 4`. Needs every contract evaluated and passing, the build and tests green, a clean probe, clean lint and a clean claims audit.

## Stop if
Two contracts in a row are cut. The scope is wrong; report to the human.
