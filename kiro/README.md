# Kiro port

The same pipeline, running inside Kiro (Web, IDE or CLI) instead of opencode. Use this when the hackathon scores Kiro usage, as Kiroween does.

```bash
bash scripts/install_kiro_port.sh      # from the project root
```

| Piece | Where it goes | What it does |
|---|---|---|
| Skills | `.kiro/skills/*` | Same skills as `.opencode/skills`, names match folders as Kiro requires |
| Evaluator | `.kiro/agents/evaluator.md` | Read-only custom agent. Writes only to `evaluation/` and `evidence/` (agent permission rules). Kiro Web can invoke it as a sub-agent but cannot select it as the primary agent |
| `session-state.json` | `.kiro/hooks/` | SessionStart: prints `STATE.md`, memory and open post-mortems to the agent |
| `guard-gates.json` | `.kiro/hooks/` | PreToolUse on write tools: exit 2 blocks edits to gate scripts, hook scripts, the evaluator, scoring anchors and linter configs |
| `fix-on-save.json` | `.kiro/hooks/` | PostFileSave: runs `fix_commands` from `project/config.json` (for example `vp check --fix`, `cargo fmt`) |
| `clean-code-stop-gate.json` | `.kiro/hooks/` | Stop: runs `quality_commands`; on failure exit 1 sends the agent back to work once per turn |
| `pipeline.md` | `.kiro/steering/` | Always-on steering: live `STATE.md` and how to use Kiro features on purpose |

## What was and was not tested
- Tested here: the four hook scripts with simulated input (guard blocks protected paths and passes normal ones; the Stop gate returns 1 with the failing command's output, 0 when green or unconfigured; fix-on-save runs configured commands; session-start prints state), JSON validity of the hook files, and the installer.
- Not tested: running inside a live Kiro session. The formats follow Kiro's docs for [hooks](https://kiro.dev/docs/hooks/), [custom agents](https://kiro.dev/docs/custom-agents/configuration-reference/), [skills](https://kiro.dev/docs/skills/) and [steering](https://kiro.dev/docs/steering/). The hook event payload's exact key names are not documented in what I read, so `guard_gates.sh` checks every value under any path-like key (`path`, `file_path`, `targetFile`, `file`, `files`). If it does not fire, log one real payload (`cat > /tmp/hook-payload.json`) and adjust the key list in `scripts/hooks/_common.sh`.
- Day-1 check: introduce a deliberate lint error and confirm the Stop hook sends the agent back; ask the agent to edit `scripts/gate.py` and confirm it is blocked. Do this before relying on either.
- Kiro's own guards still apply: writes to `.kiro/hooks`, `.kiro/agents` and `.kiro/workflows` always ask for approval, and an untrusted workspace does not load agents, steering or skills until you trust it.
- On Kiro Web the `permissions.yaml` model does not apply (the agent runs in a sandbox that approves actions by default), so the agent-scoped permission rules in `evaluator.md` may not be enforced there. The guard hook and the evaluator prompt are the backstop, and gate 3 and later require the evaluator's report to cite evidence files that exist.
