---
name: demo-video
description: Plan, record and check a hackathon demo video built from real product footage. Use in stage 6.
---

## What judges say

Devpost's own guidance and its judges agree on the shape: start with the problem you solve, show the working product, tell a story, keep it short, and do not make anyone read slides. For many judges the video is the first thing they watch and sometimes the only thing. Most hackathons cap it at about three minutes and do not require judges to watch beyond that. See `docs/WHY.md`.

## Shape (aim for 2:00 to 2:30 when the cap is 3:00)

| Time | Content | Type |
|---|---|---|
| 0-8s | The problem as one person lives it, or the final result. No logo, no title card. | live |
| 8-20s | Open the product. One sentence on what it is. Click the example. | live |
| 20-90s | The core flow end to end, narrated as what the user does and sees. | live |
| 90-120s | The moment of value: the result and why it matters. One edge case. | live |
| 120-140s | How it was built and which sponsor tools mattered. One diagram or the tools running. | slide or live |
| 140-150s | Close on the product and the URL. | live |

At least 70% of the runtime is real product footage. The gate measures this from `demo/storyboard.md`.

## Writing the narration

- One idea per sentence. Short words. Present tense. "Here I paste a quote. The tool flags the second line as double-billed."
- Say the user and the pain in the first sentence.
- No numbers you cannot prove (they must be in `project/claims.md`).
- No superlatives. Show instead.
- Leave 0.5 seconds of silence at the start and end.

## Recording

1. Write `demo/walkthrough.json` (template in `pipeline/templates/walkthrough.json`). Steps: click, fill, press, scroll, hover, wait, caption.
2. `node scripts/browser/record.mjs demo/walkthrough.json --out demo/raw` drives the live product at 1920x1080 with burned-in captions. It is deterministic, so re-record freely after fixes.
3. Add voice-over (human) or an approved text-to-speech track. Do not use copyrighted music.
4. Convert and trim: `ffmpeg -i demo/raw/<id>.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart submission/assets/demo.mp4`.
5. If the rules require a sponsor tool on screen, record that part separately (a terminal or IDE capture by the human) and splice it in.

## Checking

- `python3 scripts/gate.py 6` checks length, width and live ratio.
- Extract frames: `ffmpeg -i submission/assets/demo.mp4 -vf fps=1/15 evidence/demo-frames/f%02d.png`. Look at each: captions readable at 720p, nothing cut off, no personal data or keys visible.
- Watch it once at 1.5x and once with sound. The human does the second pass.

## Avoid

- Opening with a long title card or an architecture slide.
- Reading the README aloud.
- Showing a feature that is not in the product.
- Faked footage or mockups presented as the product.
- A video that needs the description text to make sense.
