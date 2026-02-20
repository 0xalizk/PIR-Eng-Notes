## YPIR (2024) — Footnote Validation

**Notes:** [YPIR_2024_notes.md](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md)
**PDF:** [YPIR_2024_270.pdf](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_270.pdf)
**Total footnotes:** 45 | **Correct:** 43 | **Minor:** 1 | **Incorrect:** 1

---

### INCORRECT Findings

#### [\[^4\]](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md#user-content-fn-4-3043694a5bacd65536b72bf7bb0d5ca8): HintlessPIR download value misattributed from SimplePIR

- **Statement in notes:** "Table 7 (p.28): YPIR+SP achieves 444 KB download vs. 724 KB for HintlessPIR at 32 GB x 64 KB records."
- **Cited location:** Table 7 (p.28), row for 2^19 x 64 KB (32 GB) database
- **What the PDF actually says:** Table 7 shows YPIR+SP download = 444 KB, HintlessPIR download = 3.2 MB, and SimplePIR download = 724 KB. The 724 KB figure belongs to SimplePIR, not HintlessPIR.
- **Problem:** The footnote attributes SimplePIR's 724 KB download value to HintlessPIR. The actual YPIR+SP vs. HintlessPIR comparison is 444 KB vs. 3.2 MB (a ~7.4x improvement), which is consistent with the body text's "7--14x smaller responses" claim but contradicts the specific numbers stated in the footnote.

---

### MINOR Issues

**[\[^27\]](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md#user-content-fn-27-3043694a5bacd65536b72bf7bb0d5ca8)** — The footnote says "2.7x faster total computation" but the PDF (p.25) says "computation time (by a factor of 2.7x)" without the word "total." The 2.7x factor applies to online computation time only (HintlessPIR 141 ms vs. CDKS 52 ms); the total including offline is closer to 2.0x (2153 ms vs. 1081 ms). Adding "total" is misleading.
