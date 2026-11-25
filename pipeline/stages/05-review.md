# Stage 5: Independent review

Goal: find out what a judge will find before the judge does. Run this in a fresh session, ideally with a different model than the one that built the product.

## Do

1. **Fresh clone.** Push first, then run `bash scripts/fresh_clone_test.sh`. It clones into an empty folder, runs install and build, starts the app and probes it. The gate requires it to pass on the current commit.
2. **Pre-mortem.** List ten ways a judge could fail to get value: slow cold start, a service quota, a missing env var, CORS, a browser difference, no touch support, an expired deploy, a missing example, a login wall, an unclear first screen. Test every one that can be tested and fix the ones that fail.
3. **Real-input fixtures** (only if `processes_user_input` is true). Write `evaluation/fixtures.md` from the template BEFORE running anything. Use public, licensed inputs the builder did not write, including edge and negative cases. Run every case. Record every result in `evaluation/fixture-results.md` with a table row per case (`| case 1 | pass/fail | what happened |`), failures included. Never delete or soften a failing case after seeing the result.
4. **Final evaluation.** Run `/hack-review final`. The evaluator:
   - runs the stranger test on the live URL with only the one-sentence pitch
   - scores the product against the real hackathon rubric, criterion by criterion, with the weights
   - lists the three biggest weaknesses a judge will notice
   - writes `evaluation/final-round-N.md`
5. **Fix** the three weaknesses and any P0/P1 in `evaluation/bugs.md`. One more final evaluation round if the first failed.
6. Re-run the claims audit and the lint. Remove any claim you cannot prove.

## Gate
`python3 scripts/gate.py 5`

## Stop if
The stranger test fails twice. The product is not clear enough to submit. Report what confused the stranger and propose cuts.
