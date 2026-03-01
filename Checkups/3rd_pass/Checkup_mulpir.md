## MulPIR (2019) — 3rd Pass Fact-Check

**Notes:** `mulpir_2019_notes.md`
**PDF:** `MulPIR_2019_733.pdf`
**Claims checked:** 62 | **Issues found:** 2 | **Minor:** 1 | **Incorrect:** 1

---

### INCORRECT Findings

**[^12] — Wrong base in G_2 description for Section 5.2**

Notes text (in footnote [^12], Section 5.2 portion):
> "G_2 has m'_2 = n'_1 * ceil(log_{2^{51}} Q) = 3 * 2 = 6 columns"

PDF p. 19 (Section 5.2) says:
> "a somewhat rectangular (3-by-6) matrix G_2 ∈ Z^{n'_1 × m'_2}, where m'_2 = n'_1⌈log_{2^{53}}(Q)⌉ = 3 · 2 = 6."

The base in the logarithm for G_2 in Section 5.2 is **2^{53}**, not 2^{51}. The notes use 2^{51}, which is the base for G_2 in Appendix A.3 (p. 28: "G_2 = (1, 2^{51}) ⊗ I_3"), not Section 5.2. The Appendix A.3 part of the same footnote correctly states 2^{51}, but the Section 5.2 part incorrectly copies that base instead of using 2^{53}. The arithmetic result (3 · 2 = 6) is the same either way, but the base parameter is wrong for the Section 5.2 description.

---

### MINOR Issues

**[^17] — Off-by-one page reference for the 522 ring elements quote**

Notes text:
> "[^17]: Appendix A.3, p. 29: 'a total of 522 ring elements over R_Q, or roughly 26MB.'"

PDF: The sentence "for a total of 522 ring elements in R_Q, or roughly 26MB" appears on **p. 28** (within section A.3, under "Encrypting the Index i"), not p. 29. Page 29 covers "Processing the first index i_1" and subsequent steps. The citation should read p. 28.

---

### Reviewer Verdict

**[^12] — CONFIRMED (INCORRECT)**

The fact-checker is correct. PDF p.19 (Section 5.2, final bullet) uses exactly log_{2^{53}}(Q) for G_2: "a somewhat rectangular (3-by-6) matrix G_2 ∈ Z^{n'_1 × m'_2}, where m'_2 = n'_1⌈log_{2^{53}}(Q)⌉ = 3 · 2 = 6." The notes write 2^{51} for the Section 5.2 portion of [^12], which is the Appendix A.3 base (confirmed on p.28: "G_2 = (1, 2^{51}) ⊗ I_3"). The two bases are distinct parameters belonging to different variants, and the notes incorrectly apply the Appendix A.3 base to the Section 5.2 description. The arithmetic result (6 columns) is the same either way, but the parameter value is factually wrong for Section 5.2. Severity INCORRECT stands.

**[^17] — REJECTED (FALSE POSITIVE)**

The fact-checker's claim that the 522-element sentence appears on p.28 is wrong. The "Encrypting the Index i" subsection begins on p.28 but the totaling sentence — "They consists of n'_1 · m'_1 = 306 ring elements for C_1 and D · n'_1 · m'_2 = 12 · 3 · 6 = 216 elements for all the other C_j's, for a total of 522 ring elements in R_Q, or roughly 26MB" — appears at the top of p.29. The notes' citation of p.29 is correct. This finding is a false positive and is rejected.

**Updated summary:** Claims checked: 62 | Issues found: 1 | Minor: 0 | Incorrect: 1
