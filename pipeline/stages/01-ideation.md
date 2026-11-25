# Stage 1: Idea

Goal: one idea that a judge can understand in one sentence, try in ten seconds, and remember afterwards. Load the `idea-selection` skill first.

## Do

1. Read `project/rubric.md` and the days left. Your constraint is: one core flow, finished and polished, in the time available. Breadth loses to a flow that works and feels good.
2. Research real problems with real people attached. Sources: GitHub issues, subreddit threads, product reviews, forum complaints, public datasets and APIs that are rich but underused, and the hackathon's own theme. For every candidate write down who has the problem, what they do today, and a link that proves it.
3. Write 4 to 6 candidates in `project/ideas.md` (template in `pipeline/templates/ideas.md`). They must differ in user and problem, not in wording.
4. For each candidate, check crowding:
   - `python3 scripts/devpost_search.py "<idea in plain words>"` (all of Devpost)
   - web search for the same idea on GitHub and Product Hunt
   Record how many similar projects exist and whether any won. A crowded idea needs a sharper angle or gets dropped.
5. Try to kill each idea. Fill `Kill criterion`. If you can find evidence that kills it in 10 minutes of searching, it is dead. Keep the corpse in the file with the reason.
6. Score each surviving idea against every rubric criterion (1-5, with a one-line reason using the criterion's own words). Use the weights from the rubric.
7. Prefer ideas where:
   - the user is someone a judge can picture without a technical briefing
   - the core result is visible on screen within 10 seconds, with example data supplied by us
   - the value does not depend on the judge's own data, account, API key or hardware
   - the sponsor tool (if any) is part of how it was built or how it works, not decoration
8. Avoid: "platform for X", dashboards without a user, thin wrappers over a chat model, two apps stitched together unless the track demands it, tools whose only audience is people who already know the jargon.
9. Write the `Recommendation` with the runner-up and the biggest risk. Then stop.

## After the human chooses
Write `project/brief.md` from `pipeline/templates/brief.md`. Keep the pitch to 25 words. List at least 3 things you are NOT building. Show it to the human; they set `human_approved_idea: yes`.

## Gate
`python3 scripts/gate.py 1`. Passes the ideas file automatically, then waits for the human's choice.

## Stop if
Always stop after the recommendation. Do not choose the idea yourself and do not start building.
