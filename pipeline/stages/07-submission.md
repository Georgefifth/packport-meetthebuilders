# Stage 7: Submission package

Goal: the human opens Devpost, pastes, uploads, clicks Submit. You never register, log in, fill the form or submit. Load skills `submission-pack` and `truthful-copy`.

## Do

1. Read `project/rubric.md` "Required artifacts", "Sponsor requirements" and "Bonus". The form fields differ per hackathon. Mirror the real form in `submission/fields.md` (template provided), in the form's order, one final value per field.
2. Write the copy from facts in the repo. Every technology named must be in the repo. Every number must be in `project/claims.md`. Future work goes only under "What's next".
3. If the rules ask how the sponsor tool was used, write the section from `project/sponsor-usage.md`: 150+ words, specific features, specific effects, links to repo paths. Judges grade depth of understanding.
4. Assets in `submission/assets/`: `demo.mp4`, `thumbnail.png` (generated, not cropped, 3:2), and 4 to 6 gallery images with captions under 150 characters. Compose the gallery like the placed Kiroween 2025 entries: the product at its best, the product in real use (a photo or recording of a person using it, if it is not a web page), and one image of the sponsor tool at work (specs, hooks, steering, agent log with the repo path visible). No mockups, no stock art.
5. Required repo state: public repo with a licence file detectable at the top of the repo page, every required folder present and not ignored by `.gitignore`, README with run instructions, instant demo path described.
6. Bonus items: draft each one the rules reward cheaply (blog post, social post with the exact hashtag, startup/student proof checklist). Put drafts in `submission/bonus/`. The human publishes them.
7. Write `submission/checklist.md` (template provided) with the real track, bonus items and deadline filled in. Recommend submitting 24 hours before the deadline.
8. Open every URL you list. Verify the live URL and repo URL return 200 in a private session.

## Gate
`python3 scripts/gate.py 7`. Passes automatically, then reports what the human must do: any `TODO(human)` items, the YouTube upload and submit click. The human sets `human_submitted: yes`.

## After submission
If the public page is reachable, check the video, images, links and rendering. Report problems to the human. Do not edit the submitted entry.
