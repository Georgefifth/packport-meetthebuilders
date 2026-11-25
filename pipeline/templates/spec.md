# Spec: {{product}}

## Users and stories
For each story: who, what, why, and an acceptance line the evaluator can check.
- As {{user}}, I {{do something}} so that {{outcome}}. Accepted when {{observable result}}.

## Core flow
{{numbered steps from landing to the useful result, matching project/brief.md}}

## Architecture
Smallest stack that works, with a reason for each piece. Mark each piece: runs in the browser / our server / third party.
- {{piece}}: {{why}}

## Judge-runnability
- Public URL, no login: {{how}}
- Local run: {{3 commands}}
- External services, their quotas and the fallback if they fail: {{...}}

## Data
{{what is stored, where, what is computed, what is example data and how it is labelled}}

## Risks
| Risk | Likelihood | Mitigation | Cut line |
|---|---|---|---|
| {{...}} | {{...}} | {{...}} | {{what we drop if it bites}} |

## Sponsor tool plan
{{or "none"}}

## Out of scope
{{copy from brief.md}}
