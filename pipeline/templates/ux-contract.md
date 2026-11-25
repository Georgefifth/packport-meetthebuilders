# UX contract: {{product}}

This is the acceptance contract for the front end. The evaluator grades the product against it.

## Screens
One row per screen. Every screen has exactly one primary action.

| Screen | Purpose in a sentence | Primary action (verb phrase) | Reached from |
|---|---|---|---|
| {{Home}} | {{...}} | {{Check my quote}} | {{landing}} |

## First 30 seconds
Describe, second by second, what a stranger sees and does from landing to the first useful result.
- 0-5s: they see {{...}} and understand {{...}}.
- 5-15s: they click {{...}} (the instant demo path, no account, no data of their own).
- 15-30s: they see {{result}} and know what it means because {{plain explanation on screen}}.

## Plain-language glossary
Every label a user will read, written the way they would say it. No internal names, no snake_case, no codes.

| Internal concept | What the UI says | Where |
|---|---|---|
| {{dedupe_pass}} | {{Duplicate lines removed}} | {{results header}} |

## States
For each screen that loads data or accepts input: what the user sees when it is empty, loading (over 1s), succeeded, failed, and given bad input. Each error says what happened and what to do next.

| Screen | Empty | Loading | Success | Error / bad input |
|---|---|---|---|---|
| {{Home}} | {{...}} | {{...}} | {{...}} | {{...}} |

## Mobile (390px)
{{What changes. The primary action stays reachable with one thumb.}}

## Stranger test
The evaluator receives ONLY the live URL and the one-sentence pitch. Task: {{the core task in the user's words}}.
Pass = completes it in under {{N}} minutes with no more than 1 hesitation (a pause over 5 seconds or a wrong click).
