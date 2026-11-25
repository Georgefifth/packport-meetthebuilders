# Variant: prototype round (several candidates, pick the best)

Use this between stage 2 and stage 3 when the team wants to try several candidates before committing. It replaces "build one slice" with "build N thin slices, compare them with evidence, let the human pick". Do not use it to avoid choosing: the round has a fixed length and a fixed number of candidates.

## Preconditions
- Stage 1 produced `project/ideas.md` and the human approved 2 to 4 candidates to prototype (write the ids in `STATE.md` under Log).
- The shared pieces (skeleton, stack, deployment) are decided or spiked. Prototypes consume them; they do not rewrite them.

## Rules
1. At most 4 candidates. Each gets at most 36 hours of wall-clock time. At the deadline the prototype is evaluated as it stands.
2. Each candidate lives in `prototypes/<id>/` with its own deployed URL (its own Vercel project, same team). Record URLs in `prototypes/COMPARISON.md`.
3. Each candidate has: one hook sentence, one named user, one core flow, an instant demo path (result in under 10 seconds with no account), and at most 6 contract checks in `prototypes/<id>/contract.md` (Given/When/Then).
4. Candidates may add files only inside their own folder. Shared code (skeleton, core, tooling) is read-only during the round. When a candidate needs something from the shared code, it writes it to `prototypes/<id>/SKELETON_NEEDS.md` with the reason. These files become the real requirements for the skeleton.
5. Each candidate picks its own design direction (`python3 scripts/pick_direction.py`), and the directions must differ from each other.
6. Run each candidate through the evaluator (`/hack-review prototype-<id>`, in Kiro: the `evaluator` sub-agent with `Evaluate: prototype-<id>`). The report is `evaluation/prototype-<id>-round-1.md` with `- contract: prototype-<id>`. One round only; fixing happens after selection.
7. The builder may not argue with a score. Disagreements go to the human.

## Comparison
Create `prototypes/COMPARISON.md`:

| id | hook | user | URL | function | clarity | design | originality | craft | truth | probe FAILs | Kiro features used (with paths) | days to finish | needs from skeleton |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Below the table, list for each candidate the three things a judge would complain about first.

## Selection (human gate)
Stop after the table. Recommend, do not choose. Order of reasons:
1. Clarity and function: can it reach 4 or more on both within one day of fixes?
2. The hook: would a stranger repeat it?
3. Distinctness: when more than one is needed, pick candidates that look and behave differently but share the same skeleton.
4. Overlap in `SKELETON_NEEDS.md`: shared needs are cheap, unique needs are expensive.
5. Kiro depth: which candidate gives specs, hooks, steering and agents real work to do.

## Cleanup
Losing candidates move to a branch `archive/prototype-<id>` and are removed from `main` and from the deployment list before the submission. Their lessons go into `project/memory.md`. Nothing from a losing candidate may be mentioned in public copy.
