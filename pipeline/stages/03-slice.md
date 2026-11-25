# Stage 3: Vertical slice

Goal: one core flow, working end to end with real logic, deployed at a public URL, looking the way the design direction says. This is the cheapest moment to find out the idea or the look is wrong. Nothing outside the slice contract gets built until a human approves.

## Do

If the team wants several candidates instead of one slice, run `pipeline/variants/prototype-round.md` first and come back here for the winner.

1. Initialise the repo, commit, and push (private is fine until stage 7). Add a `LICENSE` now. Add every folder the rules require (see `config.required_paths`) and make sure `.gitignore` does not exclude them.
2. Build only what `contracts/slice.md` lists:
   - The core logic is real. Mocking is allowed only for the labelled example the instant demo path loads.
   - The first screen shows what the product does in plain words and one primary action. Apply `design/direction.md` and `design/ux-contract.md`, including the glossary and the states.
   - No tabs or panels that explain the product to the viewer. Explanations belong in the video and README.
   - No simulated telemetry, fake status lines, or fake scores. If a number is shown, it is computed.
3. Deploy to a public URL (static host or serverless; whatever the spec chose). Put it in `project/config.json` as `live_url`.
4. Self-check, then fix what fails:
   - `node scripts/browser/probe.mjs <live_url> --out evidence/probe`
   - `python3 scripts/ui_lint.py`
5. Run `/hack-review slice`. The evaluator works in a fresh context, tests the live URL, runs the stranger test, and writes `evaluation/slice-round-N.md`. Fix every P0/P1 and any score below its threshold, then run it again. Maximum 3 rounds. When a round passes, tick the boxes in `contracts/slice.md` that the report shows as passing. If a criterion still fails after 3, stop and tell the human which one and what you would cut.
6. Write `evidence/slice/notes.md`: five screenshots (desktop and mobile), what is real, what is stubbed, what you would change, and 3 honest weaknesses.
7. Run the gate, then stop and ask the human to open the URL themselves.

## Gate
`python3 scripts/gate.py 3`. Needs the live URL, a clean probe, a clean lint, a passing evaluation, then the human's approval.

## Stop if
The human has not approved the slice. Do not start stage 4. If they reject it, write down exactly what they disliked in `STATE.md` and revise the direction, not just the code.
