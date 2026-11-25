# Why the pipeline is built this way

Sources are linked. The text below is paraphrased, not quoted. Content was rephrased for compliance with licensing restrictions.

## Separate the builder from the evaluator

Anthropic's engineering write-up [Harness design for long-running apps](https://www.anthropic.com/research/harness-design-long-running-apps) reports that agents asked to judge their own work tend to praise it, even when the quality is plainly mediocre, and that this is worst for subjective work such as design. A standalone evaluator is still lenient toward model-written output, but tuning it to be skeptical is far easier than making the builder self-critical. Their evaluator used Playwright to click through the running app, graded each sprint against criteria with hard thresholds, and failed the sprint if any one fell below. They also found that, out of the box, the model was a poor QA agent: it found real issues and then talked itself out of them, and it tested superficially. They tuned it by reading its logs and correcting where it diverged from their judgement.

How it is applied: `.opencode/agents/evaluator.md` (skeptical, cannot edit the product, must cite evidence), `scripts/gate.py` thresholds, and the instruction to read early reports and tune the evaluator prompt.

## Sprint contracts

The same write-up has the builder and evaluator agree on what "done" means, in testable terms, before code is written. Applied as `contracts/*.md` and `/hack-review contract <name>`.

## Grade design with written criteria

The harness article gives four design criteria (design quality, originality, craft, functionality), weights the first two more because models are already competent at the last two, and calibrates the evaluator with worked examples. It also notes that the wording of the criteria itself steers the output. Applied in `.opencode/skills/design-direction/SKILL.md`, `browser-verification/references/scoring.md` (anchors and calibration cases) and `taste/`.

## Models drift toward generic design

Anthropic's [prompting for frontend aesthetics cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics) describes models converging on common, "on distribution" output, which users call AI slop, and the [frontend-design skill](https://github.com/HOYALIM/Anthropic-skills/blob/main/frontend-design/SKILL.md) tells the model to commit to a bold, specific direction and choose distinctive type. Community catalogs such as [no-ai-slop-design](https://github.com/NathanAdev/no-ai-slop-design) list the common tells. Applied in `directions.json`, `slop-catalog.md` and `scripts/ui_lint.py`.

## What judges check

[Devpost's interviews with five judges](https://info.devpost.com/blog/hackathon-judging-tips) say that:
- many submissions fail the basic requirements, and judges check requirements first
- storytelling and the video carry a lot of weight
- judges want a finished product they would want to use
- projects that balance all judging criteria beat ones that over-index on one
- rehashed ideas, submissions that look thin once the code is opened, and backend-heavy projects with no UI lose points
- a first screen of "does it install and work at all" often decides whether a project advances

Applied in stage 0 (rubric extraction), stage 1 (crowding and balance), gate 5 (fresh clone), stage 6 (video) and the claims audit.

[Devpost's demo video tips](https://info.devpost.com/blog/6-tips-for-making-a-hackathon-demo-video) say to start from a compelling problem and make that the story. Applied in the storyboard template and gate.

## opencode features used

- Agents as markdown files with `mode: subagent`, `model`, and ordered `permissions` where the last matching rule wins: [opencode agents](https://opencode.ai/docs/agents/). Subagents run in a fresh child context.
- Commands as markdown files with `agent`, `subagent`, and shell injection: [opencode commands](https://opencode.ai/docs/commands/).
- Skills as `SKILL.md` folders loaded on demand through the `skill` tool: [opencode skills](https://opencode.ai/docs/skills/).
- MCP servers under `mcp.servers`: [opencode MCP](https://opencode.ai/docs/mcp-servers/).
- `/goal`: opencode 2.2.1 and later include a built-in `/goal`, per the [goal plugin readme](https://github.com/william-ricchiuti/OpenCode-goal-plugin). Several plugins gate completion on external evidence rather than the agent's own statement, for example [ByBrawe/opencode-goal](https://github.com/ByBrawe/opencode-goal). `pipeline/GOAL.txt` is written so that completion evidence is the gate output.

## Keep the harness lean

The harness article also stresses that each component encodes an assumption about what the model cannot do alone, and that these assumptions should be re-tested as models improve. The evaluator was worth its cost when the task sat at the edge of what the builder does reliably. Treat the gates, the evaluator and each skill the same way: if a component never catches anything over several hackathons, remove it.
