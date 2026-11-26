# Contract: sprint-01

Written by the builder, reviewed by the evaluator BEFORE any code is written. Agree on what "done" means.
Each line is a behaviour the evaluator can check in a real browser or with a command. Use Given / When / Then.
Tick a box only when the evaluator's report says the behaviour passed.

## Scope
This contract covers **Sprint 01: Multi-Corridor Readiness Comparison, Proof View Toggle, and Customs Report Export** inside the main Customs Pre-Flight Workbench screen. It allows an APAC food exporter to see how their current product label performs across all three APAC import corridors (`Singapore (SFA)`, `Australia (FSANZ)`, `Japan (CAA)`) simultaneously, switch between a **Side-by-Side Proof** and **Sticker Focus** layout, and download a structured plain-text customs inspection report alongside the SVG over-sticker.

## Checks
- [x] Given an inspected SKU on the Customs Pre-Flight Workbench (`/`), when the user views the **Multi-Corridor Readiness Comparison** table inside the right-hand dossier, then all three APAC destination corridors (`Singapore (SFA)`, `Australia (FSANZ)`, and `Japan (CAA)`) are listed with their computed readiness score (`%`), customs verdict (`Hold: Relabel Required` or `Cleared for Export`), critical hold / warning counts, top statutory blocker summary, and an **Inspect Corridor** button (or `Active Corridor` badge for the currently selected destination).
- [x] Given a user viewing the **Multi-Corridor Readiness Comparison** table while `Singapore (SFA)` is the active destination, when they click **Inspect Corridor** on the `Australia (FSANZ)` or `Japan (CAA)` row, then the left-hand **Destination Market** selector updates to that corridor, the right-hand dossier switches to that corridor's statutory findings and **Print-Ready Export Over-Sticker**, and that row shows the `Active Corridor` badge.
- [x] Given a user viewing an inspected SKU with flagged violations, when they click **Apply All Regulatory Fixes**, then the active corridor's row in the **Multi-Corridor Readiness Comparison** table updates its readiness score to `100%` and its verdict to `Cleared for Export`.
- [x] Given a user viewing the **Customs Proof** section on desktop (`1440x900`), when they click the **Side-by-Side Proof** toggle button (or switch back to **Sticker Focus**), then the **Print-Ready Export Over-Sticker** and **Redlined Origin Package Proof** switch between a two-column side-by-side comparison (`grid-template-columns: 1fr 1fr`) and a single-column stacked focus view without any console errors or horizontal overflow.
- [x] Given a user viewing the dossier action bar, when they click **Download Customs Report (.txt)**, then the browser downloads a `.txt` customs pre-flight inspection report containing the product name, origin/destination corridor, readiness score, per-100g/100mL nutrient table, itemized statutory findings, and compliant over-sticker text, and displays a confirmation status banner (`"Downloaded customs inspection report (.txt)."`).
- [x] Given a user on a mobile viewport (`390x844`) or using keyboard-only `Tab`/`Enter` navigation, when they interact with the **Multi-Corridor Readiness Comparison** table, the **Side-by-Side Proof / Sticker Focus** toggle, and **Download Customs Report (.txt)**, then `document.documentElement.scrollWidth` remains `<= 390` on mobile, all interactive buttons meet `>= 44px` tap target height (or `>= 40x32px` per probe), and every focused button shows a visible `:focus-visible` outline.

## Edge cases
- [x] Given a user clicks **Clear Form** to enter the empty state, when the workbench is cleared, then the **Multi-Corridor Readiness Comparison** table is hidden along with the proof panels and replaced by the empty-state prompt, and re-appears cleanly as soon as an Example SKU is loaded or valid custom data is submitted.
- [x] Given a user enters an invalid serving size (`<= 0`) or clears the **Ingredient List**, when they click **Inspect Corridor** in the **Multi-Corridor Readiness Comparison** table (or click **Download Customs Report (.txt)**), then `validateLabelInput()` blocks the action, displays the inline field validation error message, and moves keyboard focus to the invalid input while preserving all other typed fields.

## Not in this contract
- Adding a fourth country regulation outside Singapore (SFA), Australia (FSANZ), and Japan (CAA).
- Multi-user cloud database sync or account login.
