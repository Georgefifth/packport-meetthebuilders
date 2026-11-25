# Contract: {{name}}

Written by the builder, reviewed by the evaluator BEFORE any code is written. Agree on what "done" means.
Each line is a behaviour the evaluator can check in a real browser or with a command. Use Given / When / Then.
Tick a box only when the evaluator's report says the behaviour passed.

## Scope
{{what this contract covers, in two sentences}}

## Checks
- [ ] Given {{a first-time visitor on the landing page}}, when {{they click the example}}, then {{the result appears within 10 seconds with a plain-language explanation}}.
- [ ] Given {{...}}, when {{...}}, then {{...}}.

## Edge cases
- [ ] Given {{empty input}}, when {{submit}}, then {{a message says what to enter and the cursor is in the field}}.
- [ ] Given {{a server error}}, when {{...}}, then {{...}}.

## Not in this contract
- {{explicitly excluded}}
