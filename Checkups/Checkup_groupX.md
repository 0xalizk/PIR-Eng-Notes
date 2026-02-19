## Group X — Footnote Validation Checkup

### Summary

| Paper | Footnotes | Issues |
|-------|-----------|--------|
| CGKS Survey (2004) | 20 | 3 issues |
| KeywordPIR (2019) | 52 | 2 issues |
| DistributionalPIR (2025) | 47 | 2 issues |
| **Total** | **119** | **7 issues** |

All 7 issues are minor:

1. **CGKS [^14]** — page off by one (p.12 → p.13)
2. **CGKS [^18]** — page off by one (p.15 → p.16)
3. **CGKS [^19]** — Naor-Pinkas reference attributed to Section 5.2/p.15 instead of Section 7.2/p.21
4. **KeywordPIR [^31]** — likely column misalignment when transcribing Table 3's dense layout (n=2^20 vs n=2^22 values)
5. **KeywordPIR [^45]** — minor: "client prime generation" is notes' interpretation, not the exact "C.Create" column label
6. **DistributionalPIR [^10]** — says "six routines" but the paper defines five
7. **DistributionalPIR [^34]** — stateless/stateful decrypt-time labels are swapped

---

### Paper 1: CGKS Survey (2004)

**File:** `Schemes/Group X - Keyword Symmetric Distributional PIR/cgks_survey_2004/CGKS_Survey_2004_notes.md`
**Total footnotes:** 20

#### Verified Correct

[^1], [^2], [^3], [^4], [^5], [^6], [^7], [^8], [^9], [^10], [^11], [^12], [^13], [^15], [^16], [^17], [^20]

#### Issues Found

**[^14] — Incorrect page number**
- **Notes claim:** "Theorem 4.5 and KEY IDEA (p. 12)"
- **Paper says:** Theorem 4.5 and its KEY IDEA ("Alice does the O(n^{1/3})-bit scheme from theorem 3.3 on each row, but she sends short seed instead of long message.") appear on p. 13 of the PDF. Section 4.2 begins at the bottom of p. 12, but Theorem 4.5 itself and the KEY IDEA text are on p. 13.

**[^18] — Incorrect page number**
- **Notes claim:** "Section 5.2 (p. 15): Summary of implication chains."
- **Paper says:** Section 5.2 ("Summary of What is Known about Computational PIR") begins on p. 16, not p. 15. The implication chain summary is on p. 16.

**[^19] — Incorrect section and page for Naor-Pinkas reference**
- **Notes claim:** "Section 5.2 (p. 15) also notes that Naor and Pinkas [53] provide a general PIR-to-SPIR transformation using a logarithmic number of oblivious transfers."
- **Paper says:** The Naor-Pinkas PIR-to-SPIR transformation via a logarithmic number of oblivious transfers is discussed in Section 7.2 (p. 21), not Section 5.2 (p. 15). The relevant passage reads: "The above Theorem follows more generally (and under weaker assumptions) from a general PIR to SPIR transformation by Naor and Pinkas [53]. This transformation takes any PIR scheme and, using a logarithmic number of oblivious transfers, turns it into a (computational) SPIR scheme." The first part of footnote [^19] about Theorem 5.1 (p. 14) and the (n/2)-bit PIR threshold is correct.

---

### Paper 2: KeywordPIR (2019)

**File:** `Schemes/Group X - Keyword Symmetric Distributional PIR/keywordpir_2019/KeywordPIR_2019_notes.md`
**Total footnotes:** 52

#### Verified Correct

[^1], [^2], [^3], [^4], [^5], [^6], [^7], [^8], [^9], [^10], [^11], [^12], [^13], [^14], [^15], [^16], [^17], [^18], [^19], [^20], [^21], [^22], [^23], [^24], [^25], [^26], [^27], [^28], [^29], [^30], [^32], [^33], [^34], [^35], [^36], [^37], [^38], [^39], [^40], [^41], [^42], [^43], [^44], [^46], [^47], [^48], [^49], [^50], [^51], [^52]

#### Issues Found

**[^31] — Possible column misalignment in Table 3 transcription**
- **Notes claim:** "Table 3 (p. 12): MulPIR server cost 0.0036 vs SealPIR 0.0067 at n=2^20 with 288B entries."
- **Paper says:** Table 3 lists SealPIR (d=2) Server Cost values across three columns for n=262,144 / 1,048,576 / 4,194,304. The value 0.0067 appears to correspond to n=4,194,304 (2^22) rather than n=1,048,576 (2^20), with the true n=2^20 SealPIR cost being 0.0040. Supporting evidence: the notes' body table also shows Server Expand = 590 ms for SealPIR at n=1,048,576, but 590 ms is more consistent with the n=4,194,304 column (145 ms at n=262K scaling ~2x per 4x data increase gives ~290 at n=1M and ~580 at n=4M). This suggests the notes may have shifted one column when transcribing from Table 3's dense multi-column layout.

**[^45] — Minor characterization of column label**
- **Notes claim:** "Table 5 (p. 13): C.Create (client prime generation) for Gentry-Ramzan is 3,294 ms for 1MB database"
- **Paper says:** Table 5's column header is "C.Create", not "client prime generation." The value 3,294 ms in the C.Create column for Gentry-Ramzan (1 generator) on the 1MB database row is correct. The parenthetical "(client prime generation)" is the notes' interpretation — a reasonable paraphrase since C.Create for GR does include prime generation as its dominant cost, but it is not the exact column label.

---

### Paper 3: DistributionalPIR (2025)

**File:** `Schemes/Group X - Keyword Symmetric Distributional PIR/distributionalpir_2025/DistributionalPIR_2025_notes.md`
**Total footnotes:** 47

#### Verified Correct

[^1], [^2], [^3], [^4], [^5], [^6], [^7], [^8], [^9], [^11], [^12], [^13], [^14], [^15], [^16], [^17], [^18], [^19], [^20], [^21], [^22], [^23], [^24], [^25], [^26], [^27], [^28], [^29], [^30], [^31], [^32], [^33], [^35], [^36], [^37], [^38], [^39], [^40], [^41], [^42], [^43], [^44], [^45], [^46], [^47]

#### Issues Found

**[^10] — Incorrect routine count**
- **Notes claim:** "Syntax definition listing all six routines with their signatures" (and body text says "consists of six routines")
- **Paper says:** Section 2.1 (p. 3) lists exactly five routines: Dist.Setup, Dist.Encode, Dist.Query, Dist.Answer, Dist.Recover. The notes' own table also lists only 5 routines, making this an internal inconsistency as well. The word "six" should be "five."

**[^34] — Stateless/stateful labels reversed**
- **Notes claim:** "Section 6 achieves 0.004 s encrypt and 0.004 s decrypt (stateful) or 0.7 s decrypt (stateless)"
- **Paper says:** Table 2 (p. 8) shows the "Section 6" row has Decrypt = 0.7 with Stateless Client = X (i.e., stateful/not stateless), and the "Section 6 [68, 78]" row has Decrypt = 0.004 with Stateless Client = checkmark (i.e., stateless). So 0.7 s decrypt corresponds to the stateful variant and 0.004 s decrypt corresponds to the stateless variant — the opposite of what the notes claim.

---
