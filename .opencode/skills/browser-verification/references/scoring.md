# Scoring anchors

Integers 1 to 5. Score what you observed. When unsure between two scores, give the lower one.
PASS thresholds: function>=4, clarity>=4, truth>=4, design>=3, originality>=3, craft>=3.

## function: does it work?
1. The core flow fails or loses data.
2. The happy path works; any variation breaks or shows raw errors.
3. Core flow works; some contract checks fail or stubs are visible.
4. Every contract check and listed edge case passes; errors are handled; reload keeps data.
5. As 4, plus holds up under hostile input, slow network and mobile; fast and stable.

## clarity: can a stranger use it?
1. A stranger cannot say what it is after 30 seconds.
2. They understand only after reading documentation.
3. They understand in about 30 seconds and hesitate repeatedly.
4. They understand in 5 seconds, finish the task, at most one hesitation, results are explained.
5. No hesitation at all; labels use the user's words; every result says what it means and what to do next.

## design: is it a coherent whole?
1. Broken layout, unreadable.
2. Inconsistent or default-template look.
3. Coherent and follows the direction file, but generic in places.
4. Clearly intentional: strong hierarchy, consistent system, every visible state designed.
5. Memorable; the signature element lands; a designer would not change much.

## originality: custom decisions or defaults?
1. Stock template, library defaults, obvious AI patterns.
2. A template with new colours.
3. Some custom decisions; type and layout still mostly defaults.
4. A recognisable point of view in layout, type and detail, specific to this product.
5. A choice that is surprising and still right for the user.

## craft: technical execution
1. Overflow, text under 12px, poor contrast, broken at 390px.
2. Several spacing, type or alignment inconsistencies.
3. Competent; minor inconsistencies.
4. Consistent type and spacing scales, passes contrast, works at 390px, visible focus.
5. Fine detail: states, motion feedback, alignment to the pixel.

## truth: is everything real?
1. Core features are simulated or claims are false.
2. Several overstatements or unlabeled simulated values.
3. Minor overstatement or an unlabeled example.
4. Everything shown is real or clearly labelled as example.
5. As 4, and every public claim is backed by `project/claims.md` with a passing check.

## Calibration examples

Case: a "DESKHUD_OS" web app that was submitted as a desktop HUD toolkit. 98% of text under 12px, 99% monospace, 18 identifier-style labels such as `WIRE_BUS`, cyan on near-black, three unrelated apps in one shell, a tab that is an architecture diagram, simulated lint results and a fake health score of 52/100, README claiming Tauri, Rust and Oxlint that are not in the repo. Honest scores: function 3, clarity 1, design 2, originality 2, craft 1, truth 1. Verdict FAIL.

Case: a single-purpose quote checker with a warm light palette, a 16px reading face, a plain headline ("Is this repair quote fair?"), an "Try an example" button that returns a real computed verdict with an explanation, honest labels, and a README with a working ledger. Plausible scores: function 4, clarity 5, design 4, originality 3 to 4, craft 4, truth 5. Verdict PASS.
