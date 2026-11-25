---
name: submission-pack
description: Build a complete, requirement-checked Devpost submission package that a human can paste and submit. Use in stage 7.
---

## Why this matters

Judges screen for the required items before they judge quality, and a missing requirement can disqualify an otherwise strong project. The package is a checklist you can prove, not a hope.

## Build the package from the rules

1. Open `project/rubric.md`. List every item under "Required artifacts", "Sponsor requirements", "Video requirements" and "Bonus". The Devpost form fields differ per hackathon, so mirror the real ones. Typical set: name, tagline (often 200 characters), about text, built-with tags, try-it links, video link, images, thumbnail, repository link, extra write-ups.
2. Write `submission/fields.md` in form order, one final value per field. Where only a human can supply something write `TODO(human): what is needed`.
3. Repository requirements usually include: public, an open-source licence file visible on the repository page, all source and assets, run instructions, and any sponsor-mandated folders. Check each against the rules and against `project/config.json` `required_paths`. Make sure `.gitignore` does not exclude a required folder.
4. Images: 4 to 6, 3:2 where possible, under the size limit, each with a caption of at most 150 characters. Mix: the product at its best (real screenshots), the product in real use (a photo or recording of a person using it), and one image of the sponsor tool at work (specs, hooks, steering, agent log; Seance and InteractionKit both did this). A generated thumbnail (not a crop) in 3:2. See `taste/good/README.md`.
5. About text sections: inspiration, what it does, how it was built, challenges, accomplishments, what was learned, what is next. Technology named must exist in the repo; numbers must be in the claims ledger; future ideas go only under "What's next".
6. Sponsor write-up: 150+ words naming features used, at which stage, what they changed, and repo paths that prove it. Source: `project/sponsor-usage.md`.
7. Bonus items: draft each in `submission/bonus/` (blog post, social post with the required hashtag at the start, student or startup proof list). The human publishes and pastes the URL.
8. Judge instructions: how to try it in ten seconds, test credentials if any, known limits.

## Verify

- Every URL opens in a private window and returns 200.
- Fresh clone test passes on the commit you are submitting.
- The video plays, is public, and is within the length limit.
- `python3 scripts/audit_claims.py` passes.
- `python3 scripts/gate.py 7` shows only human steps remaining.

## Human steps (never yours)

Registering, logging in, entering the form, uploading to YouTube, publishing posts, clicking Submit. Give the human `submission/checklist.md` and a time to submit that leaves a day of margin.
