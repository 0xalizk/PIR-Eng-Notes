## NPIR (2026) — Footnote Validation

**Notes:** [NPIR_2026_notes.md](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md)
**PDF:** [NPIR_2026_2257.pdf](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_2257.pdf)
**Total footnotes:** 35 | **Correct:** 34 | **Minor:** 1 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[\[^14\]](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md#user-content-fn-14-8666f3bece67187c417e6b79b4bfc251)** — Arithmetic example is wrong: 2048 * 54 * (1+5) / 8 = 82,944 bytes = 81 KB, not 84 KB as written. The final value of 84 KB is correct per Table 1 (the discrepancy arises because q is not exactly 2^54, so log_2(q) is not exactly 54), but the shown calculation does not produce 84 KB.
