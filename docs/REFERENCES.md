# What other people's pipelines do, and what was borrowed

Read on 2026-11-24 from public repositories. I read each README and file tree, not the full code, and I did not run any of them. Ideas below are paraphrased.

## richard7ao/Hackathon_Tools
[Repo](https://github.com/richard7ao/Hackathon_Tools). A Claude Code setup refined over several hackathons, built around state files, verification tiers and failure recovery.

| Idea | Used here? |
|---|---|
| Every session starts by loading a memory file and a state file before any code | Yes. `STATE.md` (with a Handoff section) and `project/memory.md`, read first in `AGENTS.md` |
| Verification in tiers: build, simplify, unit tests, integration; each must pass before the next | Partly. Gate 4 runs build, tests, probe, lint and claims; the evaluator covers integration in a browser |
| Three-strike rule: same failure three times means write a post-mortem, commit and stop; the next session starts from it | Yes. `pipeline/templates/postmortem.md`, `evidence/postmortems/`, `AGENTS.md` |
| Adversarial review by a fresh subagent with deliberately hostile framing, because polite review is not enough | Yes. The evaluator prompt now treats a defect-free report as suspect |
| Context-pressure rule: when context is nearly spent, write a handoff and stop instead of starting a new stage | Yes. Handoff rule in `AGENTS.md` |
| Skills for brainstorming, planning, design, debugging, review | Already covered by this repo's skills |

## 23f2004742/Hackathon_Agent ("Hackathon Agent OS")
[Repo](https://github.com/23f2004742/Hackathon_Agent). A Python orchestrator with 28 specialist roles in seven teams, a task graph, model planning and token optimisation, ending in packaging and GitHub preparation.

| Idea | Used here? |
|---|---|
| Specialists with artifact contracts and permitted write paths | The evaluator already has write access only to `evaluation/` and `evidence/`, and the gates only read named artifacts. More roles were not added. |
| A final audit and a check of what is safe to push | Covered by the secret scan rule in `AGENTS.md` and gate 7 |
| 28 roles and a planner that selects them | No. Anthropic's harness research says every component encodes an assumption about what the model cannot do, and should be removed if it stops paying for itself. Three roles (builder, evaluator, human) plus scripts are enough to catch the failures seen so far. |

## kzzalews/dev-workflow-agents
[Repo](https://github.com/kzzalews/dev-workflow-agents). Coordinator, Executor, Verifier for Claude Code, Copilot and opencode, with an adaptive fix loop.

| Idea | Used here? |
|---|---|
| The verifier reviews with fresh eyes and without the implementation decisions | Yes. Same principle as the evaluator subagent. The stranger test goes further: the tester knows only the URL and the pitch |
| Different models per role (a cheaper executor, a stronger verifier) | Documented in `docs/MODEL-SELECTION.md`; set `model:` in `.opencode/agents/*.md` |
| A "simple" mode that skips the verifier | Not adopted. For a hackathon the evaluator is cheap compared with a failed submission |

## Others seen, not adopted
- [zxkane/autonomous-dev-team](https://github.com/zxkane/autonomous-dev-team): turns labelled GitHub issues into merged PRs with isolated worktrees. Built for continuous delivery, not a one-shot contest.
- [cmAIdx/headless-claude-automation-template](https://github.com/cmAIdx/headless-claude-automation-template): GitHub Actions plus Linear. Not relevant to a single-person hackathon.
- opencode goal plugins ([ByBrawe](https://github.com/ByBrawe/opencode-goal), [jadmadi](https://github.com/jadmadi/opencode-goal)): gate completion on external evidence or an independent judge model. The principle is the same as `scripts/gate.py`. If you want a second layer, one of these can judge the goal as well.

## What none of them had
I found no public pipeline that (a) extracts the hackathon's own rules and rubric first, (b) audits public claims against the repo, (c) measures readability and jargon in the deployed UI, (d) enforces a live-footage ratio in the demo, or (e) keeps a cross-hackathon history to avoid repeating one look. Those are the parts of this repo that go beyond what I could find. That is a statement about the repos I found, not about everything that exists.
