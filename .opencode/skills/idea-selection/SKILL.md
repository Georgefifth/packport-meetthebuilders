---
name: idea-selection
description: Find, test and choose a hackathon idea that a judge can grasp in one sentence and try in ten seconds. Use in stage 1.
---

## What wins and what loses

Devpost judges describe the same pattern in their own words: they check requirements first, then look for a clear problem, a finished product they would want to use, and evidence of care. They mark down ideas that already exist, ideas bent to fit the contest, products that are all backend or all front end, and submissions that look thin once they open the repo. See `docs/WHY.md` for sources.

## Method

1. **Start from a person.** Name one user in one situation. "A car owner holding a $1,800 repair quote" beats "drivers". If you cannot name them, you do not have an idea.
2. **Find proof of pain.** Look for people complaining or working around the problem:
   - GitHub issues and discussions on tools in the area ("this should…", "is there any way to…")
   - Reddit and forum threads ("is there a tool that…", "how do you deal with…")
   - Ask HN threads, product reviews with 2-3 star ratings, support forums
   - Public datasets or APIs that are rich but have no friendly front end
   Save links. An idea with no link has no evidence.
3. **Map existing solutions** (at least two, with links). Say specifically what they lack for this user. "Worse UX" is not specific. "Needs an account and a CSV upload before showing anything" is.
4. **Check crowding.** `python3 scripts/devpost_search.py "<plain-words description>"` searches all of Devpost. Also search GitHub and Product Hunt. Many near-identical entries mean you need a sharper user or angle, or a different idea.
5. **Define the core flow** in 3 to 5 steps and the instant demo path (result in under 10 seconds from the example, no account).
6. **Estimate honestly.** Days left minus 25% for deployment, video and submission. Name the riskiest dependency and what you drop if it fails.
7. **Kill it.** Write one assumption that, if false, ends the idea, then spend ten minutes trying to falsify it with a search. Keep dead ideas in the file with the cause of death.
8. **Score** each survivor against every rubric criterion, 1 to 5, using the criterion's own wording and a one-line reason. Weight by the rubric.

## The hook

Every placed Kiroween 2025 entry in `taste/good/` has a sentence a stranger can repeat: "a rental site that turns into a horror escape room when you toggle dark mode", "cleaning up cloud identities is an 8-bit zombie game", "gesture-controlled games from one template". Write the hook for each idea. It must be surprising, short, and visible in the product itself. If the hook only exists in the pitch text, it is a slogan, not an idea. Ideas with a flat hook ("a dashboard for X") are weak even when useful.

## Good shapes

- A tool that replaces a tedious, high-stakes manual check (reading a contract, comparing quotes, sanitising a file before sharing).
- A friendlier front end to open data or a public API with real stakes.
- A privacy-first or offline-first version of something people currently upload to a stranger's server.
- A small utility for one profession's daily task, with real example inputs ready to try.
- Something where the sponsor technology is why it is possible, not a logo on the footer.

## Bad shapes

- "Platform", "ecosystem", "hub", "OS" for a vague audience.
- A dashboard of metrics nobody asked for.
- A chat box in front of a language model with no specific input, output or user.
- Two or more unrelated apps stitched together to look big (unless the track explicitly requires it, like a template with two apps).
- Anything that needs the judge's own data, API key, hardware or login to show value.
- A developer tool whose only audience is developers, unless the hackathon is about developer tools.
- An idea that needs a feature you cannot finish and test in the time left.

## Output

`project/ideas.md` per the template, ending with a Recommendation (the pick, the runner-up, the biggest risk). Then stop for the human.
