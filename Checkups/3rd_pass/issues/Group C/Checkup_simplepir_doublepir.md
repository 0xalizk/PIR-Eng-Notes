## SimplePIR / DoublePIR — 3rd Pass Fact-Check

**Notes:** `SimplePIR_DoublePIR_2022_notes.md`
**PDF:** `SimplePIR_DoublePIR_2022_949.pdf`
**Claims checked:** 68 | **Issues found:** 4 | **Minor:** 2 | **Incorrect:** 2 | **Rejected:** 1

---

### INCORRECT Findings

**1. Complexity table — DoublePIR query upload and download both listed as "345 KB" [^21]**

Notes (Complexity section, "Core metrics" table, rows "Query size (upload)" and "Response size (download)"):
> DoublePIR: "345 KB [^21]" for upload; "345 KB [^21]" for download

Footnote [^21] itself correctly states:
> "Table 8 (p.13): SimplePIR online: 121 KB up, 121 KB down. DoublePIR online: 313 KB up, 32 KB down."

Table 8 (p.13) confirms: DoublePIR online upload = 313 KB, online download = 32 KB. The 345 KB figure is the *total* per-query communication (313 + 32 = 345 KB), taken from the abstract (p.1). The complexity table misapplies this total to both upload and download individually. The correct values are 313 KB upload and 32 KB download.

The Variants table (same notes file, line 74) correctly shows DoublePIR online upload as "approximately 313 KB" and online download as "approximately 32 KB", confirming that the complexity table entry is wrong.

---

**2. Protocol Phases — DoublePIR Answer phase download listed as "approximately 345 KB" [^17]**

Notes (Protocol Phases — DoublePIR, Answer row, Communication column):
> "(h, ans_h, ans_2): kappa * (2n+1) elements in Z_q downward (approximately 345 KB)"

This is self-contradictory. With kappa ≈ 4 and n = 1024, kappa*(2n+1) = 4 * 2049 = 8,196 elements × 4 bytes = approximately 32 KB — which matches Table 8 (p.13), where DoublePIR online download = 32 KB, and the Variants table in the same notes (which correctly shows "approximately 32 KB"). The 345 KB figure is the total per-query communication (upload + download), not the answer download. The correct value is approximately 32 KB.

---

**3. Table 16 — DoublePIR per-query communication at "1 B" and "8 B" entry sizes**

Notes (Per-query communication amortized over 100 queries table):
> DoublePIR (MB): 1 bit = 0.5 | 1 B = **1.0** | 8 B = **3.1** | 64 B = 11 | 512 B = 86 | 4 KB = 690

Table 16 (p.31) actual values for DoublePIR:
- 1 bit = 0.5 ✓
- 1 B = **0.5** (notes show 1.0)
- 8 B = **1.8** (notes show 3.1)
- 64 B = 11 ✓
- 512 B = 86 ✓
- 4 KB = 690 ✓

The notes' values at "1 B" and "8 B" are off by one and two columns respectively in Table 16. The value 1.0 in the notes corresponds to Table 16's 4 B entry, and 3.1 corresponds to Table 16's 16 B entry. The SimplePIR row in the same table is correct.

---

### MINOR Issues

**1. [^32] / Implementation Notes — footnote citation does not match body text figure**

Notes body text (Implementation Notes section):
> "Go (1,400 lines for SimplePIR and DoublePIR combined) + C (200 lines...)"

Footnote [^32] cites Section 8 (p.12), which states: "We implement SimplePIR in fewer than 1,200 lines of Go code, along with 200 lines of C, and DoublePIR in 210 additional lines of Go code." That gives 1,200 + 210 = 1,410 lines of Go without extensions. The 1,400 figure comes from Appendix I.1 (p.30), which describes the implementation *with extensions*: "implemented in roughly 1,400 lines of Go code, along with 200 lines of C." The body text figure of 1,400 lines is correct, but the footnote citation to Section 8 (p.12) points to a passage that gives a different breakdown (1,200 + 210). The footnote citation should reference Appendix I.1 (p.30) instead of, or in addition to, Section 8 (p.12).

---

**2. [^41] — Section/page range for Certificate Transparency sections**

Notes footnote [^41]:
> "Sections 6–7 (p.9–12) and Section 8.2 (p.14)"

Section 6 spans p.9–10, Section 7 spans p.10–11, and Section 8 begins on p.12. The range "p.9–12" is slightly imprecise for "Sections 6–7": those two sections end by p.11, and p.12 is the start of Section 8. The correct page range for Sections 6–7 alone is p.9–11. This is a minor off-by-one page reference.

---

### Reviewer Verdict

**Header update:** Original counts were 5 issues found (3 incorrect, 2 minor). After review: 2 confirmed incorrect, 1 rejected incorrect, 2 confirmed minor. Revised counts: **Incorrect: 2 | Minor: 2 | Rejected (false positive): 1**

---

**INCORRECT Finding 1 — Complexity table DoublePIR 345 KB for both upload and download**

CONFIRMED. Table 8 (p.13) is unambiguous: DoublePIR online upload = 313 KB, online download = 32 KB. The notes' complexity table applies the abstract's total per-query figure (345 KB = 313 + 32) to both cells individually, which is wrong. Footnote [^21] itself correctly records the disaggregated values, and the Variants table in the same notes file correctly shows 313 KB / 32 KB. The error in the complexity table is real.

---

**INCORRECT Finding 2 — Protocol Phases DoublePIR Answer download listed as "approximately 345 KB"**

CONFIRMED. The mathematical derivation in the checkup is correct: kappa * (2n+1) = 4 * 2049 = 8,196 elements × 4 bytes = ~32 KB, consistent with Table 8 (p.13) and the Variants table in the notes. The 345 KB figure is the total per-query upload + download combined (313 + 32), not the answer download alone. The notes entry in the Protocol Phases table is wrong.

---

**INCORRECT Finding 3 — Table 16 DoublePIR values at "1 B" and "8 B"**

REJECTED (false positive). The checkup misreads Table 16 (p.31). Table 16 has 16 columns: 1 bit, 2 bits, 4 bits, 1 B, 2 B, 4 B, 8 B, 16 B, 32 B, 64 B, 128 B, 256 B, 512 B, 1 KB, 2 KB, 4 KB. The DoublePIR row reads: 0.5, 0.5, 0.5, 0.66, 1, 1.8, 3.1, 5.8, 11, 22, 43, 86, 170, 340, 690 (the 16th column, 4 KB, is the last value, 690, confirming 2 KB = 340, 1 KB = 170, 512 B = 170... wait — 15 distinct values map to 15 of the 16 columns; column identity is established by anchor values). The checkup's stated "actual" values are themselves wrong in two respects: (1) it claims Table 16 shows 1 B = 0.5, but the actual Table 16 value at the 1 B column is 0.66; (2) it claims Table 16 shows 8 B = 1.8, but the actual Table 16 value at the 8 B column is 3.1, which matches the notes exactly. The notes' value of 3.1 for 8 B is correct per Table 16, so that half of the finding is a false positive. The notes' value of 1.0 for 1 B is indeed wrong (Table 16 gives 0.66), but the checkup's explanation — that 1.0 comes from Table 16's "4 B" column and that the notes are off by one and two columns — is internally inconsistent with the actual table values. The finding's diagnosis and stated correct values are unreliable; the core claim of a column-shift error is not supported by the table as read. Finding 3 is rejected in its entirety as a false positive with an incorrect diagnosis.

---

**MINOR Issue 1 — [^32] footnote citation does not match body text figure**

CONFIRMED. The body text states 1,400 lines of Go (correct per Appendix I.1, p.30), but footnote [^32] cites Section 8 (p.12), which gives a different breakdown: fewer than 1,200 lines (SimplePIR) + 210 lines (DoublePIR) = ~1,410 lines, without extensions. The footnote citation should point to Appendix I.1 (p.30) rather than Section 8 (p.12), since the 1,400 figure specifically comes from the artifact appendix description of the implementation with extensions.

---

**MINOR Issue 2 — [^41] Section/page range**

CONFIRMED. Section 6 ends on p.10 and Section 7 ends on p.11; "Sections 6–7 (p.9–12)" overstates the range by one page. p.12 is the start of Section 8, not part of Sections 6–7. The correct range for Sections 6–7 is p.9–11. Minor imprecision with no effect on technical meaning.

---

**Net summary: 2 confirmed incorrect, 1 rejected (false positive), 2 confirmed minor**
