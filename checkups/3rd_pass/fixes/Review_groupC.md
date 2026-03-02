## Group C -- 3rd Pass Fix Review

---

### SimplePIR / DoublePIR (4 fixes)

**Fix 1 -- Complexity table DoublePIR upload/download split**

- VERIFIED. Notes line 206-207 now show DoublePIR upload = `313 KB` and download = `32 KB`. PDF Table 8 (p. 13) confirms: DoublePIR online upload = 313 KB, online download = 32 KB. The old value of 345 KB (total per-query communication) has been correctly disaggregated into upload and download.
- Completeness: The "Comparison with Prior Work" table (line 313) still shows DoublePIR "Online communication" as 345 KB. This is NOT an error -- that table reports total online communication (upload + download), and 313 + 32 = 345 KB matches the abstract (p. 1). The Variants table (line 74) also correctly shows 313 KB / 32 KB, consistent with the fix.

**Fix 2 -- Protocol Phases DoublePIR Answer download 345 KB -> 32 KB**

- VERIFIED. Notes line 139 now reads `approximately 32 KB` instead of `approximately 345 KB`. PDF Section 5.1 (p. 8) confirms the download is kappa*(2n+1) elements in Z_q, and Table 8 (p. 13) confirms DoublePIR online download = 32 KB. The mathematical derivation (kappa=4, n=1024, so 4*2049 = 8196 elements * 4 bytes = ~32 KB) is correct.

**Fix 3 -- [^32] footnote citation Section 8 -> Appendix I.1**

- VERIFIED. Notes line 332 now reads: `Appendix I.1 (p.30): "implemented in roughly 1,400 lines of Go code, along with 200 lines of C."` PDF Appendix I.1 (p. 30) confirms this verbatim quote. The body text figure of 1,400 lines matches this appendix reference. The old citation to Section 8 (p. 12) pointed to a different breakdown (1,200 + 210 lines). Fix is correct.

**Fix 4 -- [^41] page range p.9-12 -> p.9-11**

- VERIFIED. Notes line 388 now reads `Sections 6-7 (p.9-11)` instead of `p.9-12`. PDF confirms: Section 6 starts on p. 9 and continues to p. 10; Section 7 spans p. 10-11; Section 8 begins on p. 12. The correct range for Sections 6-7 is p. 9-11.

**Cross-pass persistent issue (345 KB in Complexity and Protocol Phases tables):** PROPERLY FIXED. Both locations that erroneously used 345 KB for individual upload/download metrics have been corrected (Complexity table: 313 KB up / 32 KB down; Protocol Phases: ~32 KB down). The single remaining 345 KB in the Comparison with Prior Work table is correct (total online communication).

---

### VeriSimplePIR (3 fixes)

**Fix 1 -- [^28] citation Section 1.2 (p. 2) -> Abstract (p. 1)**

- VERIFIED. Notes line 155 now reads: `Abstract (p. 1): "any digest, even one produced by a malicious server, is sufficient to commit to some database."` PDF Abstract (p. 1) contains the exact sentence. The old citation to Section 1.2 (p. 2) was incorrect -- that section discusses the same concept but in different words.
- Note: [^5] on line 59 still references "Section 1.2 (p. 2)" with a different quote ("only responses that are exactly correct will pass verification..."). This is a different footnote with a different quote and is not affected by Fix 1.

**Fix 2 -- Definition A.2 page reference p. 17 -> p. 16**

- VERIFIED. Notes line 146 now reads `Definition A.2 (p. 16), Lemma C.2 (p. 18)`. PDF p. 16 confirms: Definition A.2 (Digest Binding) begins on p. 16 with its header and item 1. Item 2 continues at the top of p. 17. The primary page reference is correctly p. 16.
- Completeness: Other "p. 17" references in the notes (Definition A.3 on line 147, Definition A.4 on line 148, [^30] on line 175) all correctly reference p. 17 -- those definitions do appear on p. 17 in the PDF. No stale references remain.

**Fix 3 -- [^29] delta formula attribution (p. 5, eq. 2) -> (p. 5, unnumbered display above eq. 2)**

- VERIFIED. Notes line 163 now reads: `(p. 5, unnumbered display above eq. 2)`. PDF p. 5 confirms: the delta failure-probability formula `delta = 2*exp(-pi*(Delta/(s*sqrt(m)*||D||_inf))^2)` is an unnumbered display equation. What the paper labels eq. (2) is the derived q-lower-bound `q >= p*sigma*||D||_inf*sqrt(2m*ln(2/delta))` that follows from it. The distinction is correct.
- Note: References to "eq. 2" and "eq. (2)" elsewhere in the notes (Correctness condition table on line 112) correctly refer to the q-constraint formula (eq. 2), not the delta formula. No confusion introduced.

---

### BarelyDoublyEfficient (3 fixes)

**Fix 1 -- Theorem 2.1 preprocessing time exponent structure**

- VERIFIED. Notes line 146 now reads: `O(m^{2+epsilon*log|R|})`. PDF Theorem 2.1 (p. 7) states verbatim: "every m x m matrix over R can be processed in O(m^{2+epsilon*log|R|}) time". The exponent is `2 + epsilon*log|R|`, with log|R| inside the exponent. The old value `O(m^{2+epsilon} * |R|)` incorrectly placed |R| as a multiplicative factor outside the power. The footnote [^17] on line 314 also correctly quotes the PDF.
- Completeness: No remaining instances of the old `O(m^{2+epsilon} * |R|)` found in the file.

**Fix 2 -- [^11] LPR10 reduction direction**

- VERIFIED. Notes line 105 now reads: `RLWE enjoys average-case to worst-case reduction`. PDF footnote 1 (p. 2) states verbatim: "While RLWE enjoys an average-case to worst-case reduction due to [LPR10]". The old value had the direction reversed ("worst-case to average-case"). Fix is correct.
- Completeness: No remaining instances of the old reversed direction found in the file.

**Fix 3 -- Extract step "round" -> "floor"**

- VERIFIED. Notes line 130 (Protocol Phases table, Extract row) now reads: `floor(p/q * z[i-hat])`. Footnote [^15] on line 310 now reads: `"Output the k-hat-th bit of floor(p/q * z-tilde[i-hat]) as b."` PDF Fig. 1 (p. 8) and Fig. 2 (p. 10) Extract Step 3 both use the floor bracket notation. The old value "round" was imprecise -- the paper distinguishes floor from its rounding function.
- Completeness: No remaining instances of "round(p/q" found in the file.

---

### IncrementalPIR (6 fixes)

**Fix 1 -- Threshold formula `t` in Core Idea paragraph**

- VERIFIED. Notes line 54 now reads: `t = ceil(n * log q / (log p + log sqrt(N)))`. PDF Section 4.1 (p. 11) states: "Let t = ceil(n log q / (log p + log sqrt(N)))". The old value incorrectly added `+ log sqrt(N)` to the numerator. Fix matches the PDF.

**Fix 2 -- Threshold formula `t` in footnote [^5]**

- VERIFIED. Notes line 60 now reads: `"Let t = ceil(n log q / (log p + log sqrt(N)))."` This matches the PDF verbatim (Section 4.1, p. 11).

**Fix 3 -- Threshold formula `t` in Complexity table (Amortization window)**

- VERIFIED. Notes line 170 now reads: `t = ceil(n log q / (log p + log sqrt(N)))`. Matches the PDF.

**Fix 4 -- Threshold formula `t` in Update Metrics table (Aggregation threshold)**

- VERIFIED. Notes line 186 now reads: `t = ceil(n * log q / (log p + log sqrt(N)))`. Matches the PDF.

**Fix 5 -- Threshold formula `t` in Uncertainties section**

- VERIFIED. Notes line 337 now reads: `t = ceil(n log q / (log p + log sqrt(N)))` and the numerical example shows `ceil((10 * 32) / (log_2(p) + 0.5 * log_2(N)))`. The old value incorrectly had `ceil((10 * 32 + 0.5 * log_2(N)) / ...)`. Fix correctly removes the extra numerator term.

**Fix 6 -- VeriSimplePIR "before combination" operation count in Composability table**

- VERIFIED. Notes line 219 now reads: `VeriSimplePIR [14] (nm+lambda*l -> (n+lambda))`. PDF Table 1 (p. 14) shows VeriSimplePIR [14] Before combination = `(nm + lambda*l)x, (nm + lambda*l)+` and After combination = `(n + lambda)x, (n + lambda)+`. The old value `(n+lambda)(m+lambda)` expanded to `nm + n*lambda + lambda*m + lambda^2`, which is a different expression from `nm + lambda*l` (where `l` is a separate dimension parameter). Fix is correct.
- Completeness: No remaining instances of the old `(n+lambda)(m+lambda)` pattern found in the file.

---

### Completeness Check

**Remaining old wrong values:**

1. **SimplePIR/DoublePIR:** No remaining erroneous 345 KB values. The single instance of 345 KB in the Comparison with Prior Work table (line 313) is correct -- it represents total online communication (upload + download), not a split metric.
2. **VeriSimplePIR:** No remaining instances of old wrong values (Section 1.2 p.2, Definition A.2 p.17, eq. 2 attribution).
3. **BarelyDoublyEfficient:** No remaining instances of old wrong values (exponent error, reversed reduction, "round" notation).
4. **IncrementalPIR:** [^19] on line 190 contains `n log q + log sqrt(N)`, but this is the communication cost of the row-level strategy (quoting the paper), NOT the threshold formula. The `n log q + log sqrt(N)` here refers to communication bits per row-aggregated update, not the threshold t formula. This is correct per the PDF. Similarly, lines 167 and 185 reference `n * log q + log sqrt(N)` in the context of communication per row, which is also correct. These are distinct from the threshold formula and are not errors.

**No regressions detected:** All fixes are surgical and do not introduce new errors. The surrounding text in each notes file remains consistent with the fixed values.

---

### Summary

| Scheme | Fixes Applied | All Verified | Issues Found |
|--------|-------------|-------------|--------------|
| SimplePIR/DoublePIR | 4 | 4/4 | 0 |
| VeriSimplePIR | 3 | 3/3 | 0 |
| BarelyDoublyEfficient | 3 | 3/3 | 0 |
| IncrementalPIR | 6 | 6/6 | 0 |
| **Total** | **16** | **16/16** | **0** |

Cross-pass persistent issue (345 KB): PROPERLY FIXED in both the Complexity table and Protocol Phases table. The remaining 345 KB in the Comparison with Prior Work table is correct (total communication, not split).

### Overall Verdict: PASS

All 16 fixes are verified correct against the source PDFs. No remaining wrong values, no regressions, and the cross-pass persistent issue has been properly resolved.
