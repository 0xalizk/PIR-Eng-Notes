## Distributional PIR (2025) — Footnote Validation

**Notes:** [DistributionalPIR_2025_notes.md](../../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md)
**PDF:** [DistributionalPIR_2025_132.pdf](../../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_132.pdf)
**Total footnotes:** 47 | **Correct:** 44 | **Minor:** 2 | **Incorrect:** 1

---

### INCORRECT Findings

#### [\[^16\]](../../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#user-content-fn-16-102913e3e89d3210db40673add8a52ab): Correctness ordering justification misquoted

- **Statement in notes:** "We always have that kappa_worst <= kappa_avg <= kappa_exp since an explicit correctness failure is also an average-case correctness failure, and an average-case correctness failure is also a worst-case correctness failure."
- **Cited location:** Section 2.1 (p. 4)
- **What the PDF actually says:** "We always have that kappa_worst <= kappa_avg <= kappa_exp since an explicit correctness failure is also a worst-case correctness failure, and a worst-case correctness failure is also an average-case correctness failure."
- **Problem:** The reasoning chain is reversed. The PDF says explicit failure implies worst-case failure, and worst-case failure implies average-case failure (explicit -> worst-case -> average-case). The notes swap this to explicit -> average-case -> worst-case, which inverts the logical dependency chain. While the ordering inequality itself is stated correctly, the quoted justification is not verbatim-accurate and reverses the implication direction in the explanation.

---

### MINOR Issues

**[\[^22\]](../../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#user-content-fn-22-102913e3e89d3210db40673add8a52ab)** — The footnote cites only "Section 9.1, Table 12 (p. 14)" for the claims "5-77x less server work, 4.8-9.7x less communication vs. no batching; 8x total cost reduction." Table 12 only supports the 8x total cost reduction ($0.0057 vs $0.046). The "5-77x less server work" and "4.8-9.7x less communication" figures come from Section 7.2.1 (p. 11, SimplePIR benchmarks), not from Table 12. The source attribution should reference both locations.

**[\[^45\]](../../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#user-content-fn-45-102913e3e89d3210db40673add8a52ab)** — The footnote paraphrases Theorem E.1 as "for any linear utility function and batch size 1, average-case utility reduces to average-case correctness." The actual theorem statement (p. 27) is more nuanced: "for any linear utility function U, there exists a distribution P' such that Pi achieves average-case utility kappa_avg on P and P'." The footnote simplifies by omitting the role of the modified distribution P', which is central to the theorem's construction.
