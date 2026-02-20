## Group B Footnote Validation Report

**Date:** 2026-02-19
**Scope:** All 8 engineering notes in Group B (Stateless Single-Server PIR)
**Method:** Each footnote's cited location was checked against the source PDF to verify correctness of the claim, quote, page number, and section reference.

---

### Summary

| # | Paper | Notes File | Total FN | Correct | Minor | Incorrect |
|---|-------|-----------|----------|---------|-------|-----------|
| 1 | HintlessPIR (2023) | `hintlesspir_2023/HintlessPIR_2023_notes.md` | 45 | 42 | 3 | 0 |
| 2 | YPIR (2024) | `ypir_2024/YPIR_2024_notes.md` | 45 | 38 | 5 | 2 |
| 3 | WhisPIR (2024) | `whispir_2024/WhisPIR_2024_notes.md` | 62 | 55 | 6 | 1 |
| 4 | Respire (2024) | `respire_2024/Respire_2024_notes.md` | 37 | 29 | 5 | 3 |
| 5 | NPIR (2025) | `npir_2025/NPIR_2025_notes.md` | 35 | 27 | 5 | 3 |
| 6 | InsPIRe (2025) | `inspire_2025/InsPIRe_2025_notes.md` | 35 | 28 | 6 | 1 |
| 7 | Pirouette (2025) | `pirouette_2025/Pirouette_2025_notes.md` | 45 | 36 | 6 | 3 |
| 8 | VIA (2025) | `via_2025/VIA_2025_notes.md` | 41 | 32 | 7 | 2 |
| | **TOTALS** | | **345** | **287** | **43** | **15** |

**Accuracy rate:** 287/345 = **83.2%** fully correct, 330/345 = **95.7%** correct or minor, 15/345 = **4.3%** incorrect

The most common error types were: swapped/misattributed numbers from tables (YPIR, WhisPIR, VIA), conflating parameter sets (InsPIRe, NPIR), and fabricated claims at cited locations (VIA, Pirouette). A full
summary of all 15 incorrect findings is included at the bottom of the report.

---

### 1. HintlessPIR (2023)

**Notes file:** `hintlesspir_2023/HintlessPIR_2023_notes.md`
**PDF:** `HintlessPIR_2023_1733.pdf`
**Total footnotes:** 45 | **Correct:** 42 | **Minor:** 3 | **Incorrect:** 0

#### Incorrect findings

None.

#### Minor issues

- **[^2]:** The quoted sentence is substantively correct and appears on p.9, but the quote is truncated -- the actual sentence continues with "than HintlessPIR, while also being slower by constant factors." The truncation does not change the meaning but the quote marks suggest a verbatim extraction.

- **[^19]:** The notes transcribe the three correctness conditions from Lemma 19 (p.46) but omit the "1+" inside the logarithm in conditions (2) and (3). The PDF has `ln(1 + k(n_rows+n)/(delta/3))` and `ln(1 + kn*ceil(n_rows/n)/(delta/3))` while the notes drop the "1+". Minor transcription error that does not materially affect meaning.

- **[^33]:** The footnote cites "Appendix B, after Lemma 11 (p.40)" but the specific sentence about "kappa = omega(log n)" for NTTlessPIR appears on p.42 in Appendix E, not in Appendix B. The general kappa framework is introduced after Lemma 11 on p.40, but the NTTlessPIR-specific instantiation is in a different appendix.

---

### 2. YPIR (2024)

**Notes file:** `ypir_2024/YPIR_2024_notes.md`
**PDF:** `YPIR_2024_270.pdf`
**Total footnotes:** 45 | **Correct:** 38 | **Minor:** 5 | **Incorrect:** 2

#### Incorrect findings

- **[^4]:**
  - **Statement in notes:** "Table 7 (p.28): YPIR+SP achieves 444 KB download vs. 3.2 MB for HintlessPIR at 32 GB x 64 KB records."
  - **Cited location:** Table 7 (p.28)
  - **What the PDF actually says:** Table 7 at the 2^19 x 64 KB (32 GB) row shows YPIR+SP download = 444 KB and HintlessPIR download = 724 KB (not 3.2 MB). The 3.2 MB figure for HintlessPIR comes from Table 2 (p.20) for 32 GB with single-bit records, a completely different configuration.
  - **Problem:** The HintlessPIR download figure is wrong for the cited table and configuration. The actual ratio at 32 GB x 64 KB is ~1.6x (not 7--14x as the body text claims). The 7--14x ratio applies to smaller database sizes with 32 KB records.

- **[^14]:**
  - **Statement in notes:** "Table 2 (p.20): At 32 GB, YPIR achieves 724 KB upload, 32 MB download (but only 12 KB for DoublePIR's small response), 2.64 s server time, 12.1 GB/s throughput."
  - **Cited location:** Table 2 (p.20)
  - **What the PDF actually says:** Table 2 at 32 GB for YPIR shows: Upload = 2.5 MB, Download = 12 KB, Server Time = 2.64 s, Throughput = 12.1 GB/s.
  - **Problem:** The footnote incorrectly states YPIR's upload as 724 KB (this is SimplePIR's value) and download as 32 MB (this is DoublePIR's value). The parenthetical also inverts the attribution by calling 12 KB "DoublePIR's small response" when 12 KB is actually YPIR's download. Server time and throughput are correct.

#### Minor issues

- **[^16]:** The footnote quotes the asymptotic improvement as "n/log n" but the paper uses "d/log d" (where d is the lattice dimension). Same mathematical concept, different variable name.

- **[^43]:** The footnote is factually accurate about Remark 4.1's content (ring-based SimplePIR incurs 3.6x throughput reduction), but is cited in the notes body text under "Memory bandwidth bound" to support a claim about YPIR being bounded by memory bandwidth. Remark 4.1 is actually about why YPIR does NOT use ring-based SimplePIR -- slightly misleading contextual use of an otherwise accurate citation.

- **[^15]:** States "Section 4.4 (p.21)" but the relevant preprocessing cost text spans the bottom of p.21 into p.22.

- **Body text referencing [^4]:** The body text claims "7--14x smaller responses" for YPIR+SP vs HintlessPIR, but this ratio only holds for 1 GB and 8 GB databases with 32 KB records, not for the 32 GB x 64 KB configuration cited in the footnote.

- **Body text referencing [^33]:** The body text says "1.4--1.7x effective throughput improvement" but the paper says "1.5--1.7x." The lower bound in the body text (1.4) does not match the paper (1.5).

---

### 3. WhisPIR (2024)

**Notes file:** `whispir_2024/WhisPIR_2024_notes.md`
**PDF:** `WhisPIR_2024_266.pdf`
**Total footnotes:** 62 | **Correct:** 55 | **Minor:** 6 | **Incorrect:** 1

#### Incorrect findings

- **[^29]:**
  - **Statement in notes:** "For n=2^12, d=2048, optimal generator gives 113,664 total rotations vs 386,048 for naive (3.4x improvement). For d=128, optimal gives 448 vs naive thousands."
  - **Cited location:** Table 1 (p.7)
  - **What the PDF actually says:** Table 1 shows that for n=2^12, d=2048 the optimal generator g=2269 yields 386,048 total rotations (this is the optimal for that d value, not the naive). The value 113,664 is for d=1024 (with g=5513), not d=2048. For d=128, the n=2^12 table gives 2,496 rotations, not 448. The value 448 appears for n=2^13, d=128.
  - **Problem:** The notes incorrectly attribute the 113,664 rotation count to d=2048 when it belongs to d=1024. They also claim d=128 yields 448 rotations, but that is the n=2^13 table value; n=2^12 gives 2,496. The "386,048 for naive" framing is also misleading -- 386,048 is the optimal generator result for d=2048, not a naive baseline.

#### Minor issues

- **[^8]:** Content about the correctness condition is accurate but appears at top of p.5, not p.4 as cited.

- **[^19]:** The relinearization description is from Section 2.2 (p.4), not Section 3.3 (p.8) as cited. Content is substantively correct; section/page citation is wrong.

- **[^22]:** Remark A.2 content is accurate but located on p.15, not p.14 as cited.

- **[^25]:** Same as [^8] -- the correctness condition text is on p.5, not p.4 as cited.

- **[^27]:** The footnote quotes "each multiplication reduces the dimension of the database by one," but the PDF (p.6) actually says "reduces the dimension of the remaining database by a factor of l." Conceptually equivalent but the quoted text does not match verbatim.

- **[^44]:** The blocklist database description is cited as Section 5 (p.12), but the specific text about "2^24 entries... 32-byte hash... roughly 1 GB" appears on p.13, not p.12.

---

### 4. Respire (2024)

**Notes file:** `respire_2024/Respire_2024_notes.md`
**PDF:** `Respire_2024_1165.pdf`
**Total footnotes:** 37 | **Correct:** 29 | **Minor:** 5 | **Incorrect:** 3

#### Incorrect findings

- **[^4]:**
  - **Statement in notes:** "Three RLWE assumptions with different parameters. Main ring uses uniform secret in [-7,7], Gaussian error with sigma=9.9. Small ring uses Gaussian secret and error with sigma=253.6."
  - **Cited location:** Section 4.1 (p.16-17)
  - **What the PDF actually says:** The PDF describes three RLWE assumptions, but the footnote only describes two (main ring and small ring), completely omitting the second assumption over the main ring R_{d1,q1} for vectorization, where both secret and error use discrete Gaussian with width sigma'_1 = 9.9.
  - **Problem:** The footnote claims to summarize "Three RLWE assumptions" but only describes two, omitting the vectorization instantiation entirely. Materially incomplete characterization.

- **[^16]:**
  - **Statement in notes:** "Pr[fail] <= 1 - 2*d2*n_vec * exp(...) <= 2^{-40}"
  - **Cited location:** Appendix D.1, Eq. D.5 (p.49)
  - **What the PDF actually says:** Eq. D.5 gives a lower bound on the success probability: Pr[success] >= 1 - 2*d2*n_vec * exp(-pi*(q3/(2p) - B_final)^2 / sigma_resp^2). The failure probability is upper-bounded by 2*d2*n_vec * exp(...), not by "1 - 2*d2*n_vec * exp(...)".
  - **Problem:** The inequality direction/meaning is inverted. The expression "1 - 2*d2*n_vec * exp(...)" is a lower bound on success probability, not an upper bound on failure probability.

- **[^35]:**
  - **Statement in notes:** "Compared to protocols like SimplePIR, HintlessPIR, and YPIR, the Respire protocol is up to 27x smaller on the 8 GB database."
  - **Cited location:** Table 1 (p.19) and Section 4.2 (p.19)
  - **What the PDF actually says:** The quoted text is about communication size ("27x smaller"), but the notes body uses this citation to support a claim that Respire is "27--50x slower" (computation speed).
  - **Problem:** The cited source says "27x smaller" (communication), but the notes body interprets this footnote as supporting "27--50x slower" (computation), conflating two different metrics.

#### Minor issues

- **[^2]:** Footnote quote is accurate ("reduce the query size from 14 KB to 4 KB"). Notes body adds "~" before "4 KB" not present in the original.

- **[^5]:** Notation is slightly simplified but substance is correct. External product formula matches.

- **[^22]:** Reduction ratios are approximately correct; "8.5x" should be ~8.6x (minor rounding).

- **[^34]:** Footnote quote is accurate ("26% slower"), but actual Table 1 numbers yield ~35% slower (20.84s vs 15.44s). The notes faithfully reproduce the paper's own approximation.

- **[^33]:** Footnote quote is accurate. Notes body interprets the paper's "a few KB" as "~2 KB" -- reasonable but imprecise paraphrase.

---

### 5. NPIR (2025)

**Notes file:** `npir_2025/NPIR_2025_notes.md`
**PDF:** `NPIR_2025_2257.pdf`
**Total footnotes:** 35 | **Correct:** 27 | **Minor:** 5 | **Incorrect:** 3

#### Incorrect findings

- **[^5]:**
  - **Statement in notes:** "NPIR achieves 1.50--2.84x better server throughput than Spiral and 1.77--2.55x better than NTRUPIR for 1--32 GB databases with 32 KB records, while matching Spiral's communication rate of 0.250."
  - **Cited location:** Table 1 (p.15) and Section 5.2 (p.16-17)
  - **What the PDF actually says:** Table 1 shows Spiral's rate is **0.390** and NPIR's rate is **0.250**. The throughput improvement ranges are correct, but the rates do not match.
  - **Problem:** The claim that NPIR matches "Spiral's communication rate of 0.250" is factually wrong. Spiral's rate is 0.390. NPIR's rate of 0.250 is lower (worse). The notes' own benchmark table correctly shows Spiral's rate as 0.390, contradicting this claim.

- **[^15]:**
  - **Statement in notes:** "the client downloads a response of size N*phi*log_2(q_1). For N=2048, phi=16, q_1 approx 2^32: 2048*16*32/8 = 128 KB."
  - **Cited location:** Section 4.1 (p.12)
  - **What the PDF actually says:** The formula is correct per Section 4.1, but Section 5.1 (p.16) defines q_1 = 11 * 2^21 + 1, which is approximately 2^24.5. The notes claim "q_1 approx 2^32" which is off by a factor of ~2^7.5.
  - **Problem:** The notes fabricate q_1 ~ 2^32 to force the arithmetic to yield 128 KB. The actual q_1 ~ 2^24.5. The 128 KB result is correct per Table 1 (likely due to 32-bit aligned storage), but the derivation uses a wrong value for q_1.

- **[^23]:**
  - **Statement in notes:** "Communication rate: log_2(p) / log_2(q_1) = 0.250 (= 8/32)"
  - **Cited location:** Section 1.1 (p.3) and Footnote 1 (p.3)
  - **What the PDF actually says:** The rate 0.250 is stated in the paper. Footnote 1 explicitly warns: "q must be aligned during communication, and the rate is not exactly equal to the scaling factor." The mathematical log_2(q_1) is ~24.5, so 8/24.5 ~ 0.327, not 0.250.
  - **Problem:** The formula is mathematically incorrect. The rate 0.250 arises from practical byte-alignment (8 bits per 32-bit aligned coefficient), not from the raw formula log_2(p)/log_2(q_1). The paper's own footnote acknowledges this distinction.

#### Minor issues

- **[^2]:** Quote is accurate; location "Section 5.1 (p.16)" is correct but could be more precisely attributed to the "Parameter selection" paragraph.

- **[^14]:** The shown arithmetic 2048*54*6/8 yields ~81 KB, not the claimed 84 KB. The table value of 84 KB is correct; the discrepancy is due to byte-alignment.

- **[^17]:** Faithfully reproduces the paper's slightly imprecise language about record size ("multiplied by the modulus").

- **[^24]:** Table 2 values (4.61 s total, 0.288 s amortized) are confirmed, but the notes' explanation "because packing keys are reused" is an inaccurate interpretation of why the cost is amortized.

- **[^33]:** The paper says "with larger batch sizes" NPIR_b becomes less efficient than PIRANA. The notes add a specific threshold of ">= 32" not explicitly stated in the paper.

---

### 6. InsPIRe (2025)

**Notes file:** `inspire_2025/InsPIRe_2025_notes.md`
**PDF:** `InsPIRe_2025_1352.pdf`
**Total footnotes:** 35 | **Correct:** 28 | **Minor:** 6 | **Incorrect:** 1

#### Incorrect findings

- **[^8]:**
  - **Statement in notes:** "InspiRING requires 84 KB key material vs 462 KB (CDKS) and 360 KB (HintlessPIR). Online runtime is 16 ms vs 56 ms (CDKS), though offline is slower (2.4 s vs 2.0 s for HintlessPIR)."
  - **Cited location:** Section 7.4, Table 5 (p.21-22)
  - **What the PDF actually says:** Table 5 has two distinct InspiRING parameter sets. InspiRING with log_2 d=10 has Key Material=60 KB, Offline=2.4 s, Online=16 ms. InspiRING with log_2 d=11 has Key Material=84 KB, Offline=36 s, Online=40 ms.
  - **Problem:** The notes conflate the two InspiRING parameter sets, quoting 84 KB key material (from d=11) alongside 16 ms online runtime and 2.4 s offline time (both from d=10). The actual d=11 configuration has 40 ms online and 36 s offline -- not the favorable numbers presented.

#### Minor issues

- **[^3]:** Inline claim that InsPIRe_0 "only supports small entry sizes (e.g., 1 bit)" overstates the cited Section 4 (p.12) text, which says "useful when the entry size is small." The stronger "only supports" claim appears on p.18, not p.12.

- **[^4]:** Inline claim that InsPIRe^(2) "lacks the polynomial evaluation technique" is the notes' own characterization not found at cited Section 5 (p.12).

- **[^23]:** Notes say "All runtimes averaged over 5 runs (standard deviation < 5%)." The PDF actually distinguishes: offline runtimes measured once, only online runtimes averaged over 5 runs.

- **[^24]:** Notes say "Built on RLWE building blocks from spiral-rs (YPIR implementation)." The PDF distinguishes spiral-rs (a separate RLWE library) from the YPIR implementation (a distinct codebase). The parenthetical conflates them.

- **[^26]:** Footnote quote is verbatim correct, but the inline summary preceding it misassigns the percentage comparisons between HintlessPIR and CDKS targets.

- **[^26] (continued):** Inline "28% faster online time than CDKS" comes from the d=11 parameter set (40 ms vs 56 ms), continuing the pattern of mixing d=10 and d=11 figures seen in [^8].

---

### 7. Pirouette (2025)

**Notes file:** `pirouette_2025/Pirouette_2025_notes.md`
**PDF:** `Pirouette_2025_680.pdf`
**Total footnotes:** 45 | **Correct:** 36 | **Minor:** 6 | **Incorrect:** 3

#### Incorrect findings

- **[^2]:**
  - **Statement in notes:** The Core Idea paragraph states the server homomorphically bit-decomposes the LWE query, "converting it into ceil(log_2 N) RGSW ciphertexts that encrypt individual index bits." The footnote quotes Section 1.1 (p.2): "The server first performs a homomorphic bit decomposition to the LWE query LWE(idx), and outputs ceil(log_2 N) LWE ciphertexts, each encrypting a single bit idx_l."
  - **Cited location:** Section 1.1 (p.2)
  - **What the PDF actually says:** The bit decomposition "outputs ceil(log_2 N) **LWE** ciphertexts." The LWE-to-RGSW conversion is a subsequent, separate step.
  - **Problem:** The footnote's own quoted text contradicts the statement it supports. The notes claim the bit decomposition produces RGSW ciphertexts, but the cited text says LWE ciphertexts. The two-step process (BitDecomp -> LWE, then LWEtoRGSW -> RGSW) is conflated.

- **[^10]:**
  - **Statement in notes:** "Bit decomposition via blind rotation requires q = 2N (i.e., q_in = 2 * 2^11 for the blind rotation step)."
  - **Cited location:** Table 3 (p.10)
  - **What the PDF actually says:** Table 3 shows log_2(q_in) = 32, not q = 2N. The q = 2N requirement is stated in Section 3.1 (p.6), not Table 3.
  - **Problem:** Wrong cited location. Table 3 does not contain the q = 2N claim. Furthermore, the notes imply q_in = 2 * 2^11 = 4096 for the blind rotation, but Table 3 shows q_in = 2^32 (the input LWE query modulus, not the internal blind rotation modulus).

- **[^24]:**
  - **Statement in notes:** "Table 7 (p.11): All values are exact transcriptions."
  - **Cited location:** Table 7 (p.11)
  - **What the PDF actually says:** The notes' parallel execution table lists "91 MB" in the T-Respire computation rows for all three database sizes, but 91 MB is the offline communication figure, not computation time.
  - **Problem:** The claim "All values are exact transcriptions" is false. The parallel table has a transcription error where offline communication (91 MB) is placed in the computation rows for T-Respire.

#### Minor issues

- **[^3]:** The 420x figure is from the abstract and is an approximation; 14.8 KB / 36 B = 410x, not 420x. The notes faithfully reproduce the paper's rounded value.

- **[^5]:** The quote "from 36 B to 60 B" is accurate for the 2^25 case. Table 7 shows variation across database sizes (55--60 B), which the notes use elsewhere.

- **[^12]:** The notes quote "2^{v_3} records" but the PDF text uses "N/N_1 records" (mathematically equivalent but not a direct quote).

- **[^18]:** The quoted text says "around 3 KB" while Table 7 shows 2 KB. The notes use "~2 KB" as the primary figure while quoting "around 3 KB." Acknowledged in the Uncertainties section.

- **[^22]:** The "LWEtoRGSW dominates Phase 0 time" characterization of Figure 3 is directionally correct but slightly overstated -- LWEtoRGSW is the largest component but not overwhelmingly dominant.

- **[^25]:** The quoted passage describes BasicBitDecomp reducing to "just one" BlindRotate, while the notes claim "3 * ceil(k/v)" which comes from a different part of Section 3.1. Minor attribution imprecision.

---

### 8. VIA (2025)

**Notes file:** `via_2025/VIA_2025_notes.md`
**PDF:** `VIA_2025_2074.pdf`
**Total footnotes:** 41 | **Correct:** 32 | **Minor:** 7 | **Incorrect:** 2

#### Incorrect findings

- **[^1]:**
  - **Statement in notes:** "VIA achieves O_lambda(log N) online communication complexity, the first practical PIR protocol without offline communication to do so."
  - **Cited location:** Abstract (p.1)
  - **What the PDF actually says:** The abstract says: "we propose VIA, a single-server PIR scheme that eliminates offline communication while achieving O_lambda(log N) online communication complexity." It does NOT say VIA is "the first practical PIR protocol without offline communication to do so." A related primacy claim appears on p.20, not in the abstract, and uses different terminology (O_tilde_lambda(1), not O_lambda(log N)).
  - **Problem:** The primacy claim ("the first practical PIR protocol without offline communication to do so") is fabricated for the cited abstract location. A thematically related but differently worded claim exists on p.20 (not cited).

- **[^4]:**
  - **Statement in notes:** "VIA achieves 690.25 KB total online communication for 32 GB, vs. YPIR's 2572 KB and HintlessPIR's 10578 KB."
  - **Cited location:** Table 1 (p.18)
  - **What the PDF actually says:** Table 1 at 32 GB shows HintlessPIR query = 1064 KB, response = 17514 KB, total = 18578 KB.
  - **Problem:** HintlessPIR's total is 18578 KB, not 10578 KB. A leading digit "1" was dropped, producing an 8000 KB discrepancy.

#### Minor issues

- **[^3]:** The formula "l*log(IJn_1/n_2) = l*log N" is cited as Section 1.1 (p.4), but the exact formula appears on p.13 (Section 4.2). Page 4 has only the general O(log N) statement.

- **[^7]:** The DMux formula notation (c - C box c) is from the 1-to-2 DMux definition, not explicitly restated in Algorithm 2 as cited.

- **[^13]:** The two listed q_{1,1} factors for VIA both appear identical (268369921) in the PDF, which would give ~2^56 not ~2^57 as claimed. Likely a PDF rendering artifact; the notes faithfully reproduce the PDF's values.

- **[^17]:** Content correct but cited as Section 4.2 (p.13); the query compression details span p.12-13.

- **[^22]:** States "VIA-C adds CRot (step 6) and response compression (step 7)" but omits that VIA-C also adds query decompression (step 1). Incomplete characterization of the differences.

- **[^25]:** Content about first-dimension dominance is correct but the characterization is slightly simplified compared to the PDF's discussion of the 2x cost difference stemming from modulus sizes.

- **[^31]:** The 3.5x query and 127x response reductions are numerically correct from Table 2, but the PDF attributes these to "tiny record databases" generically, not specifically "1 GB at T=256" as the notes imply.

---

### INCORRECT Findings Summary (15 total)

These are factual errors that misrepresent what the cited paper says.

| # | Paper | FN | Description |
|---|-------|----|-------------|
| 1 | YPIR | [^4] | HintlessPIR download claimed as 3.2 MB at 32 GB x 64 KB; actual Table 7 value is 724 KB |
| 2 | YPIR | [^14] | YPIR upload/download figures swapped with SimplePIR's and DoublePIR's values |
| 3 | WhisPIR | [^29] | Table 1 rotation counts misattributed across rows (d=1024 value assigned to d=2048) |
| 4 | Respire | [^4] | Omits one of three RLWE assumptions while claiming to summarize all three |
| 5 | Respire | [^16] | Correctness bound inequality direction inverted (success lower bound presented as failure upper bound) |
| 6 | Respire | [^35] | Citation about communication size ("27x smaller") used to support computation speed claim ("27--50x slower") |
| 7 | NPIR | [^5] | Claims NPIR matches Spiral's rate of 0.250; Spiral's actual rate is 0.390 |
| 8 | NPIR | [^15] | Claims q_1 ~ 2^32; actual q_1 = 11*2^21+1 ~ 2^24.5 |
| 9 | NPIR | [^23] | Formula log_2(p)/log_2(q_1) = 8/32 is wrong; log_2(q_1) ~ 24.5, not 32 |
| 10 | InsPIRe | [^8] | Conflates two InspiRING parameter sets (d=10 and d=11), mixing favorable numbers |
| 11 | Pirouette | [^2] | Footnote quotes "LWE ciphertexts" but body text claims these are "RGSW ciphertexts" |
| 12 | Pirouette | [^10] | Cites Table 3 for the q=2N claim; Table 3 does not contain this -- it is in Section 3.1 |
| 13 | Pirouette | [^24] | Claims "exact transcriptions" but parallel table has offline comm (91 MB) in computation rows |
| 14 | VIA | [^1] | Fabricated primacy claim not present in the cited abstract |
| 15 | VIA | [^4] | HintlessPIR total is 18578 KB, not 10578 KB (dropped leading digit) |
