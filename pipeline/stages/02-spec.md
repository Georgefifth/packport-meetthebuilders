# Stage 2: Spec, design direction, contract

Goal: decide what "good" means before building. The contract written here is what the independent evaluator will grade against. Load skills `design-direction` and `customer-clarity`.

## Do

1. **Spec.** Write `project/spec.md` (template: `pipeline/templates/spec.md`): user stories with acceptance, architecture, data, risks, and the stack. Choose boring tech a judge can run. Rules for the stack:
   - Anything the judge must open works from a public URL with no login, no API key and no install.
   - `npm install && npm run dev` (or the equivalent) works on a clean machine.
   - No hosted service on the critical path that depends on free credits or a quota that could run out during judging. If you use a hosted backend, say why it is needed and record a fallback.
   - Decide `processes_user_input` in `project/config.json`. If true, gate 5 will demand real-input fixtures.
2. **Design direction.**
   - Run `python3 scripts/pick_direction.py --domain "<product domain words>" --seed <project-name>`.
   - Choose one of the three. Adapt it; do not paste it. If you choose a dark direction you must write `## Why dark`.
   - Find 2 to 3 real products that solve a similar problem or have a layout you want to borrow from. Capture each into `design/references/` (screenshot with `node scripts/browser/probe.mjs <url> --out design/references/<name>` for public pages, plus a note on what you take: layout, flow or state handling).
   - Write `design/direction.md` from the template. Run `python3 scripts/ui_lint.py --design-only` until it passes.
   - Record the direction: `python3 scripts/pick_direction.py --record <id>`.
3. **UX contract.** Write `design/ux-contract.md`: screens with one primary action each, the first 30 seconds, the plain-language glossary, every state (empty, loading, success, error, bad input), 390px layout, the stranger test.
4. **Slice contract.** Write `contracts/slice.md` from `pipeline/templates/contract.md`. It covers only the core flow: landing, the instant demo path, the result and its explanation, one error path. At least 6 checks in Given/When/Then form.
5. **Review the contract.** Run `/hack-review contract slice`. The evaluator checks that every line is testable and that nothing in the UX contract is missing. Fix and re-run until it approves. Do not start building before this.
6. **Sponsor tool plan.** If `sponsor_tech` is not empty, write the plan section of `project/sponsor-usage.md`: which features you will use, where, and what each will change. Use them for real work (specs for contracts, hooks for gates, steering for design rules), not as decoration.
7. **Config.** Fill `install`, `build`, `start`, `local_url`, `app_dir` in `project/config.json`.

## Gate
`python3 scripts/gate.py 2`

## Stop if
The evaluator rejects the contract twice for the same reason. Report the disagreement to the human.
