---
inclusion: always
---

# Pipeline state and Kiro usage

The rules are in `AGENTS.md` at the repo root (Kiro loads it automatically). This file adds live state and how to use Kiro's own features inside the pipeline.

## Current state
#[[file:STATE.md]]

## Using Kiro features on purpose
Judges score how well Kiro was used, and "insufficient use of Kiro" can disqualify. Use each feature where it genuinely helps, and log every use in `project/sponsor-usage.md` with the repo path that proves it.

- **Specs.** One spec per skeleton or app feature in `.kiro/specs/<name>/` (requirements, design, tasks). Write the spec first, then derive `contracts/<name>.md` (the testable Given/When/Then subset) from its acceptance criteria. Run tasks from the spec rather than ad hoc prompts.
- **Steering.** Foundation files (`product.md`, `tech.md`, `structure.md`) generated in the spike, plus `fileMatch` steering for Rust (`**/*.rs`) and for TS (`**/*.ts`, `**/*.tsx`) holding the clean-code rules.
- **Hooks.** Installed from `kiro/hooks/`: state at session start, a guard on gates and lint configs, auto-fix on save, and a clean-code gate at the end of each turn. Describe the effect each one had in the write-up.
- **Custom agents.** `evaluator` (read-only reviewer). Add others only when they earn a place (for example a `rust-core` agent with Rust steering and clippy permissions).
- **Skills.** The pipeline skills are in `.kiro/skills/`; they activate by description or with `/<name>`.
- **MCP / Powers.** Use them only for something real (for example Fallow's MCP server, which gives the agent codebase analysis). Record what it made possible.
- **Property-based tests.** Kiro's built-in correctness/PBT feature is IDE-only per the docs; the Rust core's invariants can use `proptest` in the repo for tests that run anywhere. Be exact in the write-up about which one you used.

## Evaluate
`/hack-review X` in the stage files means: invoke the `evaluator` custom agent as a sub-agent with the prompt `Evaluate: X`. Never evaluate your own work.
