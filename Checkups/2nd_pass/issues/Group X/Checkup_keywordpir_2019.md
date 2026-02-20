## Communication-Computation Trade-offs in PIR (2019) — Footnote Validation

**Notes:** [KeywordPIR_2019_notes.md](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)
**PDF:** [SealPIR_KeywordPIR_2019_1483.pdf](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/SealPIR_KeywordPIR_2019_1483.pdf)
**Total footnotes:** 52 | **Correct:** 47 | **Minor:** 5 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[\[^8\]](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-8-05cd255ff37f5d9bba4e463339c1cf65)** — The footnote cites Table 3 (p. 12) with MulPIR upload/download of 122 kB each, but the body text it annotates (cross-paradigm comparison table) states 119 kB for both upload and download, which are the Table 1 (p. 7) values. The footnote's own numbers are accurate for Table 3, but they contradict the line they are attached to.

**[\[^11\]](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-11-05cd255ff37f5d9bba4e463339c1cf65)** — The footnote cites Section 6.1 (p. 11) for the claim that the plaintext modulus is t = 2^12 + 1. Section 6.1 only says "plaintext modulus has a size of 12 bits." The exact value t = 2^12 + 1 is stated in the Table 1 footnote on p. 7 ("plaintext modulus t = 2^12 + 1"), not on p. 11. The value itself is correct but the page attribution is imprecise.

**[\[^26\]](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-26-05cd255ff37f5d9bba4e463339c1cf65)** — The footnote correctly notes that values come from the n = 262,144 column of Table 3, but the section heading it appears under says "d=2, n=2^20, 288B entries" (where 2^20 = 1,048,576). The footnote's self-correction is helpful, but the section header creates an initial misleading impression.

**[\[^28\]](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-28-05cd255ff37f5d9bba4e463339c1cf65)** — The notes present a four-row asymptotic complexity table attributed to Table 2 (p. 8), but the Gentry-Ramzan row (O(lambda_GR) communication, 2*n*pt multiplications) does not appear in the PDF's Table 2, which only covers Additive HE, Somewhat HE, and Fully HE. The GR complexity data is editorially assembled from Section 4 and Table 8 (p. 20). The footnote quotes the Table 2 caption accurately but the attribution scope is broader than Table 2 alone.

**[\[^45\]](../../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-45-05cd255ff37f5d9bba4e463339c1cf65)** — The footnote cites Table 5 (p. 13) showing "C.Create for Gentry-Ramzan is 3,294 ms for 1MB database" and Table 6 showing "24,324 ms for password checkup with 10k bucket." Both cited values are correct. However, the body text states "which takes 10-50 seconds on the client," which is an editorial range estimate not directly supported by these two data points alone (3.3s and 24.3s span a different range). The footnote data is accurate; the body paraphrase is loose.
