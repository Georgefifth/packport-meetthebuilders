# UI slop catalog

Each tell is a prompt to decide, not an automatic ban. If you keep one, write why in `design/direction.md`.
`scripts/ui_lint.py` and `scripts/browser/probe.mjs` catch the measurable ones.

## "Hacker HUD" tells (the pattern this pipeline produced most)
| Tell | Why it fails | Instead |
|---|---|---|
| Near-black background with cyan, magenta or green accents | The most common AI look; says nothing about the product | Choose a palette from the product's world (see directions.json) |
| Monospace for everything | Slow to read, signals "tool for engineers" even when the user is not | Real text face for text, mono only for code and aligned data |
| ALL-CAPS labels and `UPPER_SNAKE_CASE` strings | Reads as an internal console; users do not know the words | Sentence case, plain words |
| Numbering like `01 // SCALE STAGE`, `[RX]`, `WIRE_BUS` | Decoration pretending to be information | Delete, or use real headings |
| Fake telemetry footer, fake health scores, "SYSTEM ONLINE" | Dishonest and noisy | Show only real, computed values |
| Corner reticles, scanlines, glow borders, grid backgrounds everywhere | Style over function | One signature element, used with restraint |
| 10-11px text | Unreadable on any real screen | 14px minimum for reading, 12px for labels |
| An icon rail with no labels | The user guesses | Labelled navigation |
| A "camera rig" or "architecture" tab inside the product | Presentation material inside the product | Move to the video and README |
| Several apps crammed into one shell | No single job, no single primary action | One product, one flow |

## Typography
- Inter / Roboto / Arial / system-ui only
- Headline and body in the same weight and similar size
- Centered paragraphs of body copy
- Tiny grey helper text under every control
- Emoji used as icons

## Colour
- Purple or indigo gradients, especially on white
- Rainbow chart palettes
- Pastel gradient blobs behind the hero
- Grey on grey text
- Colour as the only status signal

## Layout
- Centered hero, headline, subhead, two buttons, then three feature cards
- Dashboard of equal KPI tiles with a sidebar
- Everything in rounded cards with the same shadow
- Icon-in-a-circle bullet lists
- Infinite scroll of sections with alternating backgrounds
- Fixed-height panels with empty space inside them

## Components
- Glassmorphism (frosted blur panels)
- Pill badges and chips on everything
- Chevron arrows on every call to action
- Hover-only interactions (broken on touch)
- Modals for things that should be inline

## Content
- Lorem ipsum, "Feature one", "Your text here"
- Superlatives with no evidence ("revolutionary", "seamless", "next-generation")
- Stock avatars, fake testimonials, fake logos
- Marketing copy where the user needs instructions or results

## What good looks like
- A first screen that states the job in the user's words and offers one action
- A real result with an explanation next to it
- Consistent spacing and type scale
- One memorable signature element tied to the product
- Every state (empty, loading, error) designed
- Honest labels: example data is marked as example
