# Real-input fixture results

Executed against `https://dimensional-glance-icons-bible.trycloudflare.com/api/inspect-label` using the frozen definitions in `evaluation/fixtures.md`.

| Case | Result | What happened |
|---|---|---|
| case 1 | PASS | HTTP 200 (501ms): Detected Soybean, Wheat / Gluten, Sesame, Added Sulphites (>10 mg/kg); mapped INS 223, INS 621, INS 102; flagged 4 findings (Hold: Relabel Required) and resolved to 100% (Cleared for Export). |
| case 2 | PASS | HTTP 200 (64ms): Computed 12.5g/100mL sugar (exceeding <=2.5g/100mL liquid cap) and 222 kJ/100mL; mapped INS 211, INS 330; flagged 4 Australia FSANZ findings. |
| case 3 | PASS | HTTP 200 (56ms): Detected Tree Nuts (Hazelnut), Soybean, Milk / Dairy and INS 322; flagged High Protein claim (6g/100g vs >=16.2g/100g Japan CAA minimum); computed Salt Equivalent 0.11g/100g. |
| case 4 | PASS | Blank ingredients returned HTTP 400 (field=ingredientList); -10g serving returned HTTP 400 (field=servingSizeAmount); 5109-char payload returned HTTP 200 in 106ms. |
| case 5 | PASS | HTTP 200 (101ms): Returned 0 findings (critical=0, warning=0), readinessScore=100%, verdictStamp="Cleared for Export". |
