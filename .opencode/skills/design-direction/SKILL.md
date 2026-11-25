---
name: design-direction
description: Choose and execute a distinctive, readable visual direction for a hackathon product. Use in stage 2 (choosing the direction) and whenever building or reviewing UI.
---

## Why this skill exists

Left alone, models converge on the most common look in their training data. For this pipeline that look is: near-black background, cyan or purple accent, monospace type, ALL-CAPS labels, glowing borders, fake status lines. Anthropic's own harness research found the same pattern in default output, and that the fix is concrete: commit to a specific direction, grade against written criteria, and have a separate evaluator push for originality. See `docs/WHY.md`.

## Procedure

1. **Pick.** Run `python3 scripts/pick_direction.py --domain "<product domain>" --seed <project>`. It offers three directions from `references/directions.json` and prefers ones you have not used in earlier hackathons. Choose one and adapt it. A direction is a starting point: change the palette, the signature element and the layout to fit this product.
2. **Study real references.** Find 2 to 3 shipped products with a similar job or a layout worth borrowing. Capture them into `design/references/` and write what you take from each: layout, flow or state handling. Never copy brand, copy or illustration.
3. **Write tokens, not adjectives.** Palette with hex values and jobs, type scale with sizes, spacing scale (4/8/12/16/24/32/48), radii, border style, shadow policy. Put them in CSS variables from day one.
4. **Build a style sheet first.** One static page that shows the product's real content (not lorem ipsum) in the chosen type and colours: headline, result card, form, error, empty state, button states. Screenshot it, critique it against the references, fix it, then build screens.
5. **Critique loop.** After the slice exists, grade it against the four criteria below. Up to 3 rounds. If scores are flat after two rounds, change the direction (type, layout, signature), not the details.

## Four grading criteria (used by the evaluator)

- **Design quality:** do colour, type, layout and detail form one coherent whole with a distinct mood?
- **Originality:** are there custom decisions, or template layouts, library defaults and AI patterns? A human designer should see deliberate choices.
- **Craft:** type hierarchy, spacing consistency, contrast, alignment. Competence, not creativity.
- **Function:** can a user find the primary action and finish the task without guessing?
Weigh design quality and originality more heavily; models already do craft and function fairly well.

## Type

- Two or three families: one with character for headlines, one for reading, optional mono for data only.
- Body 16 to 18px, line height 1.5, line length 55 to 75 characters. Never below 14px for readable text, 12px for labels.
- Big contrast in size and weight (a headline 3x the body, weight 700 against 400), not 1.2x.
- Numbers that line up use tabular figures.
- Load fonts from Google Fonts or `@fontsource`. Avoid Inter, Roboto, Arial and system-ui as the only faces. Space Grotesk, Syne and IBM Plex Mono are also now defaults, so use them only on purpose.

## Colour

- One dominant surface, one ink colour, one accent reserved for the primary action, plus semantic colours for success, warning and error.
- Contrast 4.5:1 for text, 3:1 for large text and UI edges.
- Never rely on colour alone for status.
- Dark themes need a written reason ("Why dark"): the user works in a dim room, on a long session, or the product is a media viewer. "It looks techy" is not a reason.

## Layout

- One primary action per screen, visibly dominant.
- Hierarchy through size, weight and spacing before boxes, borders and cards.
- Density matches the user: consumers get space and big targets, analysts get tables.
- The product fills the viewport sensibly at 1440px and 390px. No fixed-height panels leaving dead space.

## Motion

Only to give feedback (press, load, success) or to explain a change of state. No ambient animation, no scanlines, no glow pulses.

## Themed hackathons

When the event has a theme (for example Halloween), express it through content, tone, colour story and one signature illustration or interaction. Do not reach for clichés (dripping fonts, pumpkin emoji, neon green). A theme should change what the product says and feels like, not just its skin.

## What the winners did (see `taste/good/`)

- Carried the theme with one interaction or metaphor (a dark-mode toggle that changes the story, a map with pumpkin markers), not with a colour skin.
- Executed a familiar pattern faithfully, then let one twist do the work.
- Used real imagery: photography, custom illustration, a recurring mascot, a photo of a person using the product.
- Put personality in the headline type and kept body text plain and large.
- Used a light ground for explanatory slides; used dark only where the theme or the tool demands it, with a warm palette (orange on charcoal or black, not cyan).
- Gave one accent colour one job (selection and primary action), and designed generated output in the same palette as the tool.
- Showed the idea on real hardware or in real use (a real flip phone, a hand in front of a laptop).
- Kept chrome minimal when the content is the product (a full-viewport 3D scan with one helpful toast).

Counter-examples in the same gallery: dark admin pages with tiny dim text, emoji-only buttons, an input bar overlapping the content above it. Winning a bonus prize is not evidence of good design.

## Tests

- **Swap test:** put the first-screen screenshot in any other product. If it fits, the design has no direction. Start again.
- **Squint test:** blur the screenshot. The primary action and the result must still stand out.
- **Catalog test:** read `references/slop-catalog.md` against the screenshot. Each tell is a defect to fix or to justify in writing.
