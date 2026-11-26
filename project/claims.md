# Claims ledger

Every number, benchmark, accuracy figure or "works with X" statement in the README, the Devpost text
or the video narration must have a row here. `python3 scripts/audit_claims.py` runs the evidence.
If you cannot write a row, you cannot make the claim.

Kind is one of: `cmd` (command that must exit 0), `file` (path that must exist), `url` (must return 200).

| Claim (exactly as written in public copy) | Evidence | Kind |
|---|---|---|
| Live at https://dimensional-glance-icons-bible.trycloudflare.com | `https://dimensional-glance-icons-bible.trycloudflare.com` | url |
| 3 samples in the Instant Demo SKUs strip | `src/lib/sampleSkus.ts` | file |
| 3 countries in the Multi-Corridor Readiness Comparison table (Singapore SFA, Australia FSANZ, Japan CAA) | `src/lib/regulatoryEngine.ts` | file |
| 100% Cleared for Export readiness score after applying all regulatory fixes | `npm test` | cmd |
| 7 tests pass in the regulatory engine test suite | `npm test` | cmd |
| 11 checks in contracts/slice.md and 8 checks in contracts/sprint-01.md | `contracts/slice.md` | file |
