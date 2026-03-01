## XPIR (2014) — 3rd Pass Fact-Check

**Notes:** `xpir_2014_notes.md`
**PDF:** `XPIR_2014_232.pdf`
**Claims checked:** 52 | **Issues found:** 2 | **Minor:** 1 | **Incorrect:** 1

---

### INCORRECT Findings

**[^14] — "~32 KB per ciphertext (bundled)" in FHE-specific metrics table**

Notes text (FHE-specific metrics, "Ciphertext size (alpha)" row):
> "8192 polynomials of degree 16384 with 512-bit coefficients at d=5; ~32 KB per ciphertext (bundled)"

What the PDF actually says (p. 10, Section 6):
> "the query is formed by ℓ = 2^d = 32 ciphertexts each made of Mbytes. By normalizing with ε index retrievals in a single query, per retrieval we are paying about 32 Kbytes."

The discrepancy: The PDF explicitly states each ciphertext is made of *Mbytes* (megabytes). The total query at d=5 is 32 MB (Table 2), and the query contains ℓ = 2^5 = 32 ciphertexts, so one ciphertext ≈ 1 MB. The 32 KB figure is the per-*retrieval* bandwidth after normalizing by ε = 1024, not a per-ciphertext size. The notes incorrectly label the 32 KB figure as "per ciphertext" when it is "per retrieval." This conflates two distinct quantities.

---

### MINOR Issues

**[^4] — dropped reference number "[13]" in paraphrased quote**

Notes footnote [^4] (paraphrasing Section 4, p. 5):
> "We make use of the modified NTRU scheme introduced by Stehle and Steinfeld [12]..."

PDF (p. 5, Section 4) actual text:
> "For this we make use of the modified NTRU scheme [13] introduced by Stehlé and Steinfeld [12]..."

The discrepancy: The PDF distinguishes between [13] (the original NTRU scheme, Hoffstein-Pipher-Silverman) and [12] (Stehlé-Steinfeld's modification). The notes quote silently drops "[13]", making it read as though Stehlé and Steinfeld introduced NTRU itself, rather than introduced a *modification* of the pre-existing NTRU scheme [13]. The notes body does not make a factually wrong claim about the security reduction (which is correctly attributed to [12]/Stehlé-Steinfeld), but the dropped reference slightly misrepresents the sentence structure of the original. This is a minor accuracy issue in a footnote quote, not a factual error in the body.

---

### Reviewer Verdict

**[^14] — "~32 KB per ciphertext (bundled)" — CONFIRMED (INCORRECT)**

Verified against PDF p. 10. The PDF states explicitly: "the query is formed by ℓ = 2^d = 32 ciphertexts each made of Mbytes. By normalizing with ε index retrievals in a single query, per retrieval we are paying about 32 Kbytes." One ciphertext = 1 MB (16384 coefficients × 512 bits / 8 = 1 MB); 32 ciphertexts = 32 MB total query, matching Table 2. The 32 KB figure is per-retrieval after dividing by ε = 1024, not per-ciphertext. The notes FHE-specific metrics table labels this "~32 KB per ciphertext (bundled)" — that label is wrong. Notably, the notes' own Uncertainties section (line on "Ciphertext size alpha units") correctly explains the normalization, making this an internal inconsistency within the notes as well as a mislabeling relative to the PDF. The fact-checker's classification as INCORRECT stands.

**[^4] — dropped "[13]" reference — CONFIRMED (MINOR)**

Verified against PDF p. 5. The PDF text reads: "For this we make use of the modified NTRU scheme [13] introduced by Stehlé and Steinfeld [12]..." The notes footnote [^4] omits [13], writing only "...the modified NTRU scheme introduced by Stehle and Steinfeld [12]..." This drops the citation to the original Hoffstein-Pipher-Silverman NTRU [13], slightly misrepresenting the sentence as crediting Stehlé-Steinfeld with introducing NTRU rather than modifying it. The factual claim about the RLWE security reduction is not wrong (correctly attributed to [12]), so this is a minor accuracy issue in a paraphrased footnote, not an error in the main body. The fact-checker's classification as MINOR stands.

**Summary: both issues confirmed; no false positives. Counts unchanged: Issues found: 2 | Minor: 1 | Incorrect: 1.**
