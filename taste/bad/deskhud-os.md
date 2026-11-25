# Bad example: DESKHUD_OS (Kiroween 2026 entry built by the old pipeline)

Screens: a force-graph "code health" view, a 3D size comparator, and a "camera rig" diagram, all in one dark shell.

What is wrong, in order of how much it hurts a first-time visitor:

1. **No idea what to do.** The first screen has no sentence saying what the product is for and no obvious first action. Three tabs, a voice pill, a hotkey badge and a "Heal via Kiro hook" button compete.
2. **Unreadable text.** 98% of the characters render under 12px, all monospace. Labels such as `CYCLES: 3  DEAD_EXPORTS: 3  CLIPPY_UNWRAP: 1` and `FALLOW 52/100` mean nothing to a person who has not read the README.
3. **Control-panel costume.** ALL-CAPS identifiers, `01 //` numbering, corner brackets, neon cyan on near-black, a footer of simulated telemetry (`WIRE_BUS [RX] ...`). It reads as decoration, and the footer is not real.
4. **Three products in one.** Code hygiene, shopping size comparison and an architecture tour share a shell. A judge cannot say in one sentence what this is.
5. **Presentation inside the product.** The "camera rig" tab explains the architecture to the viewer. That belongs in the video.
6. **Claims the code does not back.** The README says Tauri, Rust, Oxlint and Fallow; none are in the repo. The lint results and scores shown are simulated.

What a good version of the same material would do: pick one of the two apps; state the job in a sentence ("See whether this will fit before you buy it"); one input, one example button; the result as a large, explained comparison; light or warm surface, 16px text, a real display typeface; delete every number that is not computed.
