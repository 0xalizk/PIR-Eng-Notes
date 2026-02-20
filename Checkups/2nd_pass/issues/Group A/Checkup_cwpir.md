## CwPIR (2022) — Footnote Validation

**Notes:** [cwpir_2022_notes.md](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md)
**PDF:** [FastPIR_orig_arxiv_2202.07569.pdf](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/FastPIR_orig_arxiv_2202.07569.pdf)
**Total footnotes:** 51 | **Correct:** 48 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[\[^3\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-3-8f66ef9f854decc097b695556777c513)** — Quote attributed to "(Abstract, p. 1)" reads "Constant-weight keyword PIR is the first practical, single-round solution for single-server keyword PIR." The abstract actually says "constant-weight PIR is the first practical single-round solution to single-server keyword PIR" (no "keyword" after "constant-weight", no comma, "to" not "for"). A separate sentence on p. 2 uses "Constant-weight keyword PIR is the first efficient single-round solution for single-server keyword PIR" (says "efficient" not "practical"). The quoted text blends wording from both locations.

**[\[^2\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-2-8f66ef9f854decc097b695556777c513)** — States "The constant-weight equality operator has multiplicative depth ceil(log_2 k)" without distinguishing plain vs. arithmetic variants. This depth applies only to the plain CW operator (Table 3, p. 9); the arithmetic CW operator has depth 1 + ceil(log_2 k). The core claim that depth depends on k rather than m is correct.

**[\[^21\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-21-8f66ef9f854decc097b695556777c513)** — Cites Section 2, p. 2 and writes the representation size as "O(d-th root of (k! * n))." The PDF at that location consistently uses the variable d throughout the formula: O(d-th-root of d!*n). The footnote substitutes k! for d!, mixing notation from the general formula (p. 2, using d) with the CW-specific parameter k from Section 3 (p. 5). The overall point about sublinear representation size is correct.
