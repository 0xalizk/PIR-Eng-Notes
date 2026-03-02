## Group C — 3rd Pass Fixes Applied

---

### SimplePIR / DoublePIR (4 fixes)

**Fix 1 — INCORRECT: Complexity table DoublePIR upload and download both listed as 345 KB**

- Issue ref: Checkup INCORRECT Finding 1
- Location: Complexity section, "Core metrics" table, rows "Query size (upload)" and "Response size (download)", DoublePIR column
- Old value: Upload = `345 KB`, Download = `345 KB`
- New value: Upload = `313 KB`, Download = `32 KB`
- Rationale: 345 KB is the total per-query communication (313 + 32). Table 8 (p.13) gives the disaggregated values: 313 KB upload, 32 KB download. Footnote [^21] in the same file correctly records these values.

**Fix 2 — INCORRECT: Protocol Phases DoublePIR Answer download listed as approximately 345 KB**

- Issue ref: Checkup INCORRECT Finding 2
- Location: Protocol Phases -- DoublePIR table, Answer row, Communication column
- Old value: `(h, ans_h, ans_2): kappa * (2n+1) elements in Z_q downward (approximately 345 KB)`
- New value: `(h, ans_h, ans_2): kappa * (2n+1) elements in Z_q downward (approximately 32 KB)`
- Rationale: kappa*(2n+1) = 4*2049 = 8196 elements * 4 bytes = ~32 KB, matching Table 8. The 345 KB figure was the total upload+download, not the download alone.

**Fix 3 — MINOR: [^32] footnote citation points to Section 8 instead of Appendix I.1**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^32]
- Old value: `Section 8 (p.12): "We implement SimplePIR in fewer than 1,200 lines of Go code, along with 200 lines of C, and DoublePIR in 210 additional lines of Go code."`
- New value: `Appendix I.1 (p.30): "implemented in roughly 1,400 lines of Go code, along with 200 lines of C."`
- Rationale: The body text figure of 1,400 lines comes from Appendix I.1 (p.30), which describes the implementation with extensions. Section 8 (p.12) gives a different breakdown (1,200 + 210 = 1,410 lines without extensions).

**Fix 4 — MINOR: [^41] page range p.9-12 should be p.9-11**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^41]
- Old value: `Sections 6-7 (p.9-12)`
- New value: `Sections 6-7 (p.9-11)`
- Rationale: Sections 6-7 span p.9-11. Page 12 is the start of Section 8, not part of Sections 6-7.

---

### VeriSimplePIR (3 fixes)

**Fix 1 — MINOR: [^28] cites Section 1.2 (p. 2) instead of Abstract (p. 1)**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^28]
- Old value: `Section 1.2 (p. 2): "any digest, even one produced by a malicious server, is sufficient to commit to some database."`
- New value: `Abstract (p. 1): "any digest, even one produced by a malicious server, is sufficient to commit to some database."`
- Rationale: The verbatim quote appears in the Abstract on p. 1, not in Section 1.2 on p. 2.

**Fix 2 — MINOR: [^25] Definition A.2 page reference off by one**

- Issue ref: Checkup MINOR Issue 2
- Location: Formal Security Properties table, Digest Binding row, "Proved Where" column
- Old value: `Definition A.2 (p. 17), Lemma C.2 (p. 18)`
- New value: `Definition A.2 (p. 16), Lemma C.2 (p. 18)`
- Rationale: Definition A.2 begins on p. 16 (header and item 1), with item 2 continuing on p. 17.

**Fix 3 — MINOR: [^29] delta formula incorrectly attributed to eq. (2)**

- Issue ref: Checkup MINOR Issue 3
- Location: Correctness Analysis section, Option D paragraph
- Old value: `(p. 5, eq. 2)`
- New value: `(p. 5, unnumbered display above eq. 2)`
- Rationale: The delta failure-probability formula is an unnumbered display equation on p. 5. What the paper labels eq. (2) is the derived q-lower-bound that follows from it.

---

### BarelyDoublyEfficient (3 fixes)

**Fix 1 — INCORRECT: Theorem 2.1 preprocessing time has wrong exponent structure**

- Issue ref: Checkup INCORRECT Finding 1
- Location: Williams' Fast Matrix-Vector Multiplication section, body text
- Old value: `O(m^{2+epsilon} * |R|)`
- New value: `O(m^{2+epsilon*log|R|})`
- Rationale: PDF Theorem 2.1 (p. 7) gives the exponent as `2 + epsilon*log|R|` (log|R| inside the exponent). The notes incorrectly placed |R| as a multiplicative factor outside the power.

**Fix 2 — INCORRECT: [^11] LPR10 reduction direction reversed**

- Issue ref: Checkup INCORRECT Finding 2
- Location: Cryptographic Foundation table, "Why plain LWE matters" row
- Old value: `RLWE enjoys worst-case to average-case reduction`
- New value: `RLWE enjoys average-case to worst-case reduction`
- Rationale: PDF footnote 1 (p. 2) states "RLWE enjoys an average-case to worst-case reduction due to [LPR10]." The notes had the direction reversed.

**Fix 3 — MINOR: Extract step uses "round" instead of floor**

- Issue ref: Checkup MINOR Finding 3
- Location: Protocol Phases table, Extract row + footnote [^15]
- Old value (table): `Output the k-hat-th bit of round(p/q * z[i-hat])`
- New value (table): `Output the k-hat-th bit of floor(p/q * z[i-hat])`
- Old value ([^15]): `"Output the k-hat-th bit of round(p/q * z-tilde[i-hat]) as b."`
- New value ([^15]): `"Output the k-hat-th bit of floor(p/q * z-tilde[i-hat]) as b."`
- Rationale: PDF Fig. 2 (p. 10) Extract Step 3 uses the floor bracket, not the rounding notation.

---

### IncrementalPIR (6 fixes)

**Fix 1 — INCORRECT: Threshold formula `t` has extra term in numerator (Core Idea paragraph)**

- Issue ref: Checkup INCORRECT Finding 1 (location 1 of 5)
- Location: Core Idea section, body text
- Old value: `t = ceil((n * log q + log sqrt(N)) / (log p + log sqrt(N)))`
- New value: `t = ceil(n * log q / (log p + log sqrt(N)))`
- Rationale: PDF Section 4.1 (p. 11) gives `t = ceil(n log q / (log p + log sqrt(N)))`. The notes incorrectly added `+ log sqrt(N)` to the numerator.

**Fix 2 — INCORRECT: Threshold formula `t` in footnote [^5]**

- Issue ref: Checkup INCORRECT Finding 1 (location 2 of 5)
- Location: Footnote [^5]
- Old value: `"Let t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N)))."`
- New value: `"Let t = ceil(n log q / (log p + log sqrt(N)))."`

**Fix 3 — INCORRECT: Threshold formula `t` in Complexity table**

- Issue ref: Checkup INCORRECT Finding 1 (location 3 of 5)
- Location: Complexity section, Preprocessing metrics table, Amortization window row
- Old value: `t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N)))`
- New value: `t = ceil(n log q / (log p + log sqrt(N)))`

**Fix 4 — INCORRECT: Threshold formula `t` in Update Metrics table**

- Issue ref: Checkup INCORRECT Finding 1 (location 4 of 5)
- Location: Update Metrics table, Aggregation threshold t row
- Old value: `t = ceil((n * log q + log sqrt(N)) / (log p + log sqrt(N)))`
- New value: `t = ceil(n * log q / (log p + log sqrt(N)))`

**Fix 5 — INCORRECT: Threshold formula `t` in Uncertainties section**

- Issue ref: Checkup INCORRECT Finding 1 (location 5 of 5)
- Location: Uncertainties section, first bullet
- Old value: `t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N)))` and `ceil((10 * 32 + 0.5 * log_2(N)) / ...)`
- New value: `t = ceil(n log q / (log p + log sqrt(N)))` and `ceil((10 * 32) / ...)`

**Fix 6 — INCORRECT: VeriSimplePIR "before combination" operation count in Composability table**

- Issue ref: Checkup INCORRECT Finding 2
- Location: Composability table, Compatible schemes row, VeriSimplePIR entry
- Old value: `VeriSimplePIR [14] ((n+lambda)(m+lambda) -> (n+lambda))`
- New value: `VeriSimplePIR [14] (nm+lambda*l -> (n+lambda))`
- Rationale: PDF Table 1 (p. 14) shows VeriSimplePIR "before combination" as `nm + lambda*l`, where `l` is a separate dimension parameter. The notes incorrectly wrote `(n+lambda)(m+lambda)` which expands to a different expression.

---

### Summary

| Scheme | INCORRECT fixes | MINOR fixes | Total fixes |
|--------|----------------|-------------|-------------|
| SimplePIR/DoublePIR | 2 | 2 | 4 |
| VeriSimplePIR | 0 | 3 | 3 |
| BarelyDoublyEfficient | 2 | 1 | 3 |
| IncrementalPIR | 6 | 0 | 6 |
| **Total** | **10** | **6** | **16** |

Note: IncrementalPIR INCORRECT Finding 1 (threshold formula) was replicated across 5 distinct locations in the notes, counting as 5 individual fixes. The MINOR issue in the IncrementalPIR checkup ([^5] ellipsis without markers) was not fixed because the existing text already contains `...` ellipsis markers between "differences" and "and sums," which adequately signals the omission.
