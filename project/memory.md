# Project memory

Durable facts a fresh session needs. Read at session start. Keep it short and current.

## Decisions
- 2026-11-25 Target event: Meet the Builders 2026 (Google Cloud Gen AI Academy APAC Edition) on Hack2skill (`https://hack2skill.com/event/meetthebuilders2026/dashboard/roadmap?utm_source=hack2skill&utm_medium=homepage`).
- 2026-11-25 Target submission path: Path 02 — Hall of Fame Submissions (requires public GitHub repo URL, <= 90s demo video under 15 MB, 3 bullets on Google AI tools used, and `#Meetthebuilders` social post link).

## Gotchas
- Hack2skill frontend is a Vite SPA; public event data is served from `https://hack2skill.com/api/v1/event/meetthebuilders2026/event-details` and `/event-tnc`, plus the APAC Academy bundle `https://hack2skill.com/assets/index-1786a537.js`.
- Video max length is strictly 90 seconds (`video_max_seconds: 90` in `project/config.json`) and under 15 MB.

## Commands that work
- `python3 scripts/gate.py 0` (exited 0)
- `python3 scripts/gate.py 1` (automated checks passed; exited 10 awaiting `human_approved_idea: yes`)
- `python3 scripts/devpost_search.py "<query>"`
