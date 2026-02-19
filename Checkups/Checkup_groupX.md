## Group X — Footnote Validation Checkup

### Summary

| Paper | Footnotes | Issues |
|-------|-----------|--------|
| KeywordPIR (2019) | 52 | 2 issues |
| DistributionalPIR (2025) | 47 | 2 issues |
| **Total** | **99** | **4 issues** |

All 4 issues are minor:

1. **KeywordPIR [^31]** — likely column misalignment when transcribing Table 3's dense layout (n=2^20 vs n=2^22 values)
2. **KeywordPIR [^45]** — minor: "client prime generation" is notes' interpretation, not the exact "C.Create" column label
3. **DistributionalPIR [^10]** — says "six routines" but the paper defines five
4. **DistributionalPIR [^34]** — stateless/stateful decrypt-time labels are swapped

---

### Paper 1: KeywordPIR (2019)

**File:** `Schemes/Group X - Extensions/keywordpir_2019/KeywordPIR_2019_notes.md`
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

### Paper 2: DistributionalPIR (2025)

**File:** `Schemes/Group X - Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md`
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
