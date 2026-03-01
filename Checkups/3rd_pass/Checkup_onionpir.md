## OnionPIR — 3rd Pass Fact-Check

**Notes:** `onionpir_2021_notes.md`
**PDF:** `OnionPIR_2021_1081.pdf`
**Claims checked:** 41 | **Issues found:** 1 | **Minor:** 1 | **Incorrect:** 0

---

### INCORRECT Findings

**[^cmp_ali_req] — Ali et al. request size: 119 KB vs. 64 KB**

Notes text (comparison table, cited to Section 7, p.12):
> "119 KB request size."

PDF Section 7 (p.12) states:
> "Concretely, to retrieve 60 KB entry from a database with one million entries requires around 900 seconds of server computation, 357 KB response size, and 64 KB request size."

The PDF gives Ali et al.'s request size as **64 KB**, not 119 KB. The figure 119 KB does not appear anywhere in the paper. The notes' comparison table rows for Ali et al. shows `Request size (KB): 119` with footnote `[^cmp_ali_req]` pointing to Section 7, p.12 — this is directly contradicted by the source. The correct value is **64 KB**.

---

### MINOR Issues

**[^impl_avx] — Body text says "AVX" but PDF and footnote say "AVX2"**

Notes body text (Implementation Notes section):
> "**SIMD / vectorization:** AVX (via NFLLib integration)."

The footnote [^impl_avx] correctly quotes the PDF as "AVX2 specialization," and the PDF Section 6.1 states:
> "NFLLib, an efficient library that uses several arithmetic optimizations and AVX2 specialization for arithmetic operations over polynomials."

The body text in the Implementation Notes section says "AVX" while both the PDF and the notes' own footnote [^impl_avx] say "AVX2." The body text is imprecise. (Note: the hardware description "8 CPU cores with AVX enabled" is correct — that refers to the EC2 instance hardware capability, while NFLLib's vectorization uses the narrower AVX2 instruction set specifically.)

---

### Reviewer Verdict

**[^cmp_ali_req] — REJECTED (false positive)**

The fact-checker misread the PDF. Page 12 contains two consecutive figures for the same benchmark scenario: Ali et al.'s numbers, then OnionPIR's numbers for comparison. The full sentence reads: "...requires around 900 seconds of server computation, 357 KB response size, and **119 KB request size**. In comparison, for the same setting, OnionPIR requires 800 seconds of computation, 256 KB response size, and **64 KB request size**." The fact-checker attributed OnionPIR's 64 KB figure to Ali et al., reversing the two values. The notes' value of 119 KB for Ali et al. is correct and directly supported by the PDF. No fix needed.

**[^impl_avx] — CONFIRMED (minor)**

The PDF (Section 6.1, p.10) states NFLLib uses "AVX2 specialization." The notes' own footnote [^impl_avx] correctly quotes "AVX2 specialization." The body text line "SIMD / vectorization: AVX (via NFLLib integration)" says "AVX" where it should say "AVX2." The distinction is technically meaningful (AVX2 is a specific instruction set extension, not a synonym for AVX). The hardware context note — "8 CPU cores with AVX enabled" referring to EC2 instance capability — is separately correct and does not resolve the imprecision in the SIMD bullet. Severity: minor.

**Updated summary:** 1 issue confirmed (minor), 1 issue rejected. Incorrect count corrected from 1 to 0.
