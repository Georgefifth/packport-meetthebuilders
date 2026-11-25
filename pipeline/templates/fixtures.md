# Real-input fixtures

Only for products that process user input (files, text, URLs, images). Written and frozen BEFORE running them.
Use public, licensed sources the builder did not author. Include cases the product should reject or flag nothing on.

- Case 1 (typical): source {{url}} | licence {{...}} | expected {{what the product should output}}
- Case 2 (typical): source {{url}} | licence {{...}} | expected {{...}}
- Case 3 (hard): source {{url}} | licence {{...}} | expected {{...}}
- Case 4 (edge: empty, huge, malformed): source {{url or "constructed: why"}} | expected {{...}}
- Case 5 (negative: should produce no finding): source {{url}} | expected {{...}}
