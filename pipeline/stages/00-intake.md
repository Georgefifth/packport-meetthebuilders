# Stage 0: Intake

Goal: turn the Devpost pages into a rubric that every later stage is held to. A project that ignores one stated requirement loses to a worse project that satisfied it. Judges check requirements before they check quality.

## Do

1. Read `STATE.md` for the hackathon URL. Run:
   `python3 scripts/devpost_intake.py <url>`
   If it fails, ask the human to paste the page text into `project/devpost/overview.txt` and `rules.txt`, then continue.
2. Read `project/devpost/rules.txt` completely, not a skim. Rules pages are long and the disqualifiers sit in the middle. Then read `overview.txt`, `resources.txt` and `updates.txt` (updates often change rules or add bonus prizes).
3. Write `project/rubric.md` from `pipeline/templates/rubric.md`. Fill every section. Quote rule text where wording matters. Hunt specifically for:
   - eligibility: excluded countries, age, team size, student-only prizes
   - the cutoff date for "new projects only"
   - exact required artifacts (public repo, licence, required folders such as `.kiro/`, number of images, video length and host, text fields)
   - sponsor tool requirements and what proof they want ("write-up on how you used X")
   - every sentence containing "disqualified", "ineligible", "will not be judged"
   - bonus prizes and what each demands (blog post, social post with a hashtag, startup/student proof)
   - the judging criteria, their weights, and the question each one asks
   - who the judges are (their roles tell you what they value)
4. Fill `project/config.json`: `deadline_iso` (ISO 8601 with the timezone from the rules), `video_max_seconds`, `required_paths`, `sponsor_tech`. Leave build commands for stage 2.
5. Compute days left. Write the feature-freeze date (deadline minus 3 days) and the video date (deadline minus 2 days) into the rubric. If fewer than 4 days remain, say so and propose a smaller scope.
6. Use web search to look at past winners of this hackathon or its previous edition. Write 5 lines in the rubric "Chosen track" section: what winners had in common that is not just polish (clear user, real data, working demo, sponsor tool used well). Do not copy their ideas.
7. List every eligibility restriction for the human and ask them to confirm. Never set `human_confirmed_eligible` yourself.

## Output files
`project/devpost/*`, `project/rubric.md`, `project/config.json`

## Gate
`python3 scripts/gate.py 0`. Passes when the rubric is complete and parseable. It then waits for the human to confirm eligibility.

## Stop if
- The page cannot be fetched and the human has not pasted it.
- The rules are ambiguous on a requirement that affects the build. Ask one precise question rather than guessing.
