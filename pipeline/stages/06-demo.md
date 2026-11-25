# Stage 6: Demo video

Goal: a video under the limit that shows the real product solving a real problem, so a judge who watches only this still understands and believes it. Load the `demo-video` skill.

Judges often watch the video first and sometimes only the video. Mostly real footage, a clear story, no padding.

## Do

1. Write `demo/storyboard.md` from the template. Rules the gate enforces: timed rows, under the limit, at least 70% `live` footage, no long opening title card.
   Story shape: the problem as a person experiences it (5-10s), the product solving it in one flow (60-90s), the moment of value, how it was built and which sponsor tools mattered (10-20s), and the URL.
2. Every claim spoken in the narration must be in `project/claims.md`. No numbers you cannot prove.
3. Write the real walkthrough as `demo/walkthrough.json` (template provided) and record it:
   `node scripts/browser/record.mjs demo/walkthrough.json --out demo/raw`
   It drives the live product and burns in captions. Re-record as often as needed; it is deterministic.
4. Narration: the human records voice-over, or use a text-to-speech tool the human approves. Keep sentences short and spoken plainly. Do not use copyrighted music.
5. If the rules require showing a sponsor tool, include a short `live` segment of it working (specs, hooks, agent output, whatever the rules name) with the repo path visible.
6. Render to `submission/assets/demo.mp4` (1080p, H.264):
   `ffmpeg -i demo/raw/<file>.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart submission/assets/demo.mp4`
   Add audio and trim with ffmpeg as needed.
7. Extract 8 frames evenly across the video and look at them. Captions readable at 720p? Anything cut off? Fix and re-render.

## Gate
`python3 scripts/gate.py 6`. Then the human watches it with sound and sets `human_approved_demo: yes`.

## Stop if
The product cannot be recorded doing its core flow. Go back to stage 4; do not paper over it with slides.
