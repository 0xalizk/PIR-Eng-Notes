## Group A Footnote Validation Report

**Date:** 2026-02-19
**Scope:** All 11 engineering notes in Group A (FHE-Based PIR)
**Method:** Each footnote's cited location was checked against the source PDF to verify correctness of the claim, quote, page number, and section reference.

---

### Summary

| # | Paper | Notes File | Total FN | Correct | Minor | Incorrect |
|---|-------|-----------|----------|---------|-------|-----------|
| 1 | SealPIR (2018) | `sealpir_2018/SealPIR_2018_notes.md` | 41 | 33 | 7 | 1 |
| 2 | XPIR (2014) | `xpir_2014/XPIR_2014_notes.md` | 25 | 21 | 4 | 0 |
| 3 | XPIR (2016) | `xpir_2016/XPIR_2016_notes.md` | 57 | 53 | 3 | 1 |
| 4 | MulPIR (2019) | `mulpir_2019/MulPIR_2019_notes.md` | 31 | 27 | 4 | 0 |
| 5 | OnionPIR (2021) | `onionpir_2021/OnionPIR_2021_notes.md` | 62 | 55 | 7 | 0 |
| 6 | OnionPIRv2 (2025) | `onionpirv2_2025/OnionPIRv2_2025_notes.md` | 37 | 36 | 1 | 0 |
| 7 | Addra/FastPIR (2021) | `addra_2021/Addra_2021_notes.md` | 43 | 38 | 3 | 1 |
| 8 | CwPIR (2022) | `cwpir_2022/CwPIR_2022_notes.md` | 51 | 42 | 8 | 1 |
| 9 | Spiral (2022) | `spiral_2022/Spiral_2022_notes.md` | 27 | 23 | 4 | 0 |
| 10 | FrodoPIR (2022) | `frodopir_2022/FrodoPIR_2022_notes.md` | 56 | 53 | 3 | 0 |
| 11 | ThorPIR (2024) | `thorpir_2024/ThorPIR_2024_notes.md` | 23 | 20 | 1 | 1 |
| | **TOTALS** | | **453** | **401** | **45** | **5** |

**Accuracy rate:** 401/453 = **88.5%** fully correct, 446/453 = **98.4%** correct or minor, 5/453 = **1.1%** incorrect

---

### INCORRECT Findings (5 total)

These are factual errors that misrepresent what the cited paper says.

#### 1. SealPIR — [^36]: Cites external document, not the SealPIR paper

- **Statement in notes:** "Oblivious expansion (Expand): The core technique of using substitution/automorphism operations to expand a single ciphertext into a selection vector. Adopted by OnionPIR, Spiral, YPIR, WhisPIR, NPIR, and essentially all subsequent FHE-based PIR schemes."
- **Cited location:** "Section 7.5 of SKILL taxonomy"
- **What the PDF actually says:** The SealPIR paper has no Section 7.5. The paper's sections go from 7.4 (Case study: Pung) to Section 8 (Discussion). The paper was published in 2018 and could not reference OnionPIR (2021), Spiral (2022), WhisPIR, YPIR, or NPIR.
- **Problem:** The footnote cites a "SKILL taxonomy" document that is external to the SealPIR paper. This is not a valid citation to the PDF under review. The adoption claim is editorially reasonable but cannot be sourced to a 2018 paper.

#### 2. XPIR-2016 — [^44]: Fabricated data point for Netflix use-case

- **Statement in notes:** "720p at 30fps (400 Kbit/s needed): User can hide choice among 35,000 movies. 720p at 60fps (800 Kbit/s needed): Hide choice among ~8,000 movies. 1024p at 60fps (2 Mbit/s needed): Hide choice among ~8,000 movies with higher quality."
- **Cited location:** p. 15, Section 4.1, "The Netflix Use-case"
- **What the PDF actually says:** The paper provides exactly **two** data points: (1) 35K movies at 720p-30fps, and (2) 8K movies at **1024p-60fps**. The paper says: "hiding his choice among just 8K movies (as in [46]) he can get a stream at 1024p-60fps."
- **Problem:** The notes insert a fabricated middle row "720p at 60fps (800 Kbit/s): ~8,000 movies" that does not appear in the paper. The paper only maps 8K movies to 1024p-60fps, not 720p-60fps. Three scenarios are presented when the paper only provides two.

#### 3. Addra/FastPIR — [^24]: Wrong query time attributed to FastPIR

- **Statement in notes:** "Client Query time: 1.4 ms" (in the Core Metrics table for FastPIR at n=32,768, m=96B)
- **Cited location:** Paper p.13, Figure 10
- **What the PDF actually says:** Figure 10 shows that FastPIR (F, d=1) Query CPU time at n=32,768 is **21.3 ms**, not 1.4 ms. The value 1.4 ms belongs to **SealPIR (d=2)**.
- **Problem:** The notes attribute SealPIR's query time (1.4 ms) to FastPIR. The correct value is 21.3 ms — a 15x discrepancy. Notably, the notes themselves correctly report 21.3 ms in the detailed benchmark table further down, creating an internal inconsistency.

#### 4. CwPIR — [^30]: "10x speedup" claim contradicted by cited numbers

- **Statement in notes:** "The constant-weight operator with small k achieves up to 10x speedup over folklore (e.g., n=2^16: 0.038s vs 0.54s for k=1/8 log_2 n at N=8192)."
- **Cited location:** Table 4, p. 9
- **What the PDF actually says:** Table 4 shows Plain Folklore at N=8192, n=2^16 has runtime 0.54s. Plain CW with k=1/8 log_2 n at N=8192 has runtime 0.038s. The ratio is 0.54/0.038 = **~14x**.
- **Problem:** The notes claim "up to 10x speedup" but the specific example cited actually demonstrates ~14x. The "10x" figure comes from the abstract's general claim, but when paired with this particular data point it becomes inconsistent. The cited numbers are correct; the summary characterization is wrong.

#### 5. ThorPIR — [^10]: Bits/bytes unit error causes ~8x bandwidth discrepancy

- **Statement in notes:** "Online bandwidth is dominated by the Q = 1024 partition indices and Q returned elements. Each element is 360 bits = 45 bytes."
- **Cited location:** Table 2 (p.27)
- **What the PDF actually says:** Table 2 states "2^30 elements of 360 **bytes** each" and reports online bandwidth as 389 KB. Elements are 360 bytes, not 360 bits.
- **Problem:** The footnote claims each element is "360 bits = 45 bytes," deriving bandwidth as Q * 45 bytes = ~45 KB. The correct figure is 360 bytes per element, giving Q * 360 = ~360 KB — consistent with the paper's 389 KB. This is a propagated bits-vs-bytes error that causes an ~8x discrepancy.

---

### MINOR Issues by Paper

#### SealPIR (2018) — 7 minor issues

**[^3]** — Wrong page number. Figure 2 appears on page 3, not page 4. Values and noise characterizations are correct.

**[^8]** — Truncated quote omits qualifier "in EXPAND." The paper says the factor-of-1 claim applies specifically to the Expand algorithm (where plaintexts are monomials with coefficient 1), not to plaintext multiplication in general.

**[^9]** — Wrong section reference. The formula F = 2 log(q)/log(t) is in the FV background preamble of Section 3, not Section 3.1 ("Compressing queries").

**[^19]** — Wrong page number. The quote "One issue with EXPAND is that despite each operation being inexpensive, O(n) operations are needed..." appears at the bottom of page 4, not page 5.

**[^22]** — Wrong section and page. The quote "values of d > 3 in XPIR lead to responses that are so large..." is from Section 3 introduction (page 3), not Section 3.4 (page 5).

**[^26]** — Row attribution error. The footnote claims to cite "row n = 262,144" but lists values (Extract 1.69, Setup 4.26, Answer 2.01) from the n = 1,048,576 column. The actual n = 262,144 values are Extract 1.39, Setup 1.04, Answer 0.5.

**[^40]** — Wrong page number. The text about "the difference becomes less prominent" is on page 11, not page 12.

---

#### XPIR-2014 (2014) — 4 minor issues

**[^1]** — Variable transcription error. The footnote quotes the exponent as c^{2^**i**} but the paper uses c^{2^**d**}. The notes body text is correct; only the footnote quote has the wrong variable.

**[^9]** — Wrong section cited. The explicit matrix M formulation ("Bob stores D in a matrix M of size 2^{h/2} x 2^{h/2}") appears in Section 2.1 (p. 3), not Section 3 (pp. 4-5).

**[^17]** — Wrong section number. The quote about "depth 5 or 6 circuit" appears in Section 4 ("Picking the SWHE Scheme"), not Section 3.

**[^22]** — Imprecise comparison factor. The notes state "1000x smaller than K-O" but the paper states the bundled query is 3072x smaller than Kushilevitz-Ostrovsky. The "1000x" figure appears to come from the abstract's general claim rather than the specific comparison.

---

#### XPIR-2016 (2016) — 3 minor issues

**[^36]** — Page imprecision. The 60-bit performance numbers (700 Mbit/s query generation, 5 Gbit/s decryption) appear on p. 11, not p. 12. The 120-bit numbers are on p. 12.

**[^37]** — Overstated qualifier. The notes say "Trivial PIR is 10-200x slower than cPIR for most database sizes" but Figure 6 shows cPIR only beats trivial PIR for small n values. For large n (n >= ~1000 in d=1), trivial PIR is actually faster.

**[^38]** — Wrong page for detail. The "10 Gbit" RAM limit is discussed on p. 15 ("Medium Access Issues"), not p. 13 as cited.

---

#### MulPIR (2019) — 4 minor issues

**[^6]** — Dimension notation error. The notes write H dimensions as "n_0(t-1) x n_0*t" but since n_0 = r(t-1), this expands to r(t-1)^2 x r(t-1)*t — not what the paper describes. The correct dimensions are simply n_0 x n_2 (equivalently r(t-1) x rt). The rate conclusion "(t-1)/t" is correct.

**[^12]** — Wrong parameter name. The notes attribute m'_1 = n'_1 * floor(log_4(Q)) = 2 * 51 = 102, but the paper uses n'_0 (which equals 2), not n'_1 (which equals 3). The numerical result is correct only because n'_0 happens to equal 2.

**[^15]** — Arithmetic error. The notes compute "9 * 46 * 2^{12} bits ≈ 27 KB per block" but 9 * 46 * 4096 = 1,695,744 bits = ~207 KB, not ~27 KB. The rate calculation of 4/9 is correct (it depends on ratios, not absolute sizes).

**[^6] (additional)** — The paper uses base-case r=1 where H is (t-1) x t, yielding rate (t-1)/t. The notes' general notation conflates r with n_0.

---

#### OnionPIR (2021) — 7 minor issues

**[^circular]** — Imprecise line reference. Only Algorithm 2 line 13 uses A = RGSW(-s); line 12 is a plain assignment. Additionally, circular security is an editorial inference — the paper never explicitly mentions it.

**[^whatchanged]** — Truncated quote. The paper says "with the help of recent advances in homomorphic encryption schemes" after the quoted text, which is omitted without ellipsis.

**[^coreidea]** — Inserted word. The notes quote "response **size** overhead" but the abstract says "response overhead" (without "size").

**[^querypacking]** — Wrong section number. The text about packing 256 values and 386 total is in Section 4.4 (OnionPIR Full Protocol), not Section 4.3 (Query Compression).

**[^fhe_d]** — Self-contradictory calculation. The formula d = 1 + ceil(log_4(N/128)) with N = 10^6 gives d = 8, not 5. The notes claim "the paper states d = 5" but the paper does not make this explicit statement for N = 10^6.

**[^tradeoff_security]** — Editorial commentary mixed with citation. The notes say parameters are "below the typical 128-bit target" but the paper never mentions a 128-bit target — this is the notes author's editorial interpretation.

**[^concurrent2]** — Quote omits "of server computation" after "around 900 seconds," and elides substantial intervening text about Ali et al.'s technique.

---

#### OnionPIRv2 (2025) — 1 minor issue

**[^10]** — Omitted qualifier. The paper says the database "becomes larger by **roughly** a factor of log q / log t" but the footnote omits "roughly."

---

#### Addra/FastPIR (2021) — 3 minor issues

**[^3]** — Wrong page and section. The quoted text about per-hop latency appears on p. 1 (Introduction), not p. 2 Section 2.1.

**[^10]** — Wrong page number. The rotation key text (128 KiB per key, 256 MiB total) appears on p. 6, not p. 7.

**[^32]** — Wrong page number. "Microsoft SEAL library v3.5" is mentioned on p. 8, not p. 9.

---

#### CwPIR (2022) — 8 minor issues

**[^1]** — Imprecise attribution. The notes attribute "extra rounds of communication" to both Chor et al. and Ali et al., but the Ali et al. hashing approach does not necessarily require extra rounds.

**[^2]** — Conflated operators. The notes say "the folklore binary equality operator" has depth 1 + ceil(log_2 l), but this depth belongs to the **arithmetic** folklore operator. The **plain** folklore operator has depth ceil(log_2 l).

**[^5]** — Notation mischaracterization. The notes say "where M = number of multiplications" but M in Table 3 is a unit label (one homomorphic multiplication), not a count variable.

**[^6]** — Footnote is correct per the paper, but the notes' main text introduces a pM distinction from Table 3 that creates a slight inconsistency with the footnote's simpler "m + k multiplications" wording.

**[^9]** — Wrong location. The four operations are listed in Section 2.1.1 on page 2, but their noise growth types are in Table 1 on page 3.

**[^18]** — Cross-reference needed. Table 7 is cited for claims that partially require text from outside the table (SealPIR's N=4096 comes from p. 11 text, not Table 7).

**[^31]** — Section boundary. The parallelization text is at the boundary between Sections 4.2 and 5, not squarely within Section 4.2.

**[^7]** — Initially flagged for capitalization (pM vs PM) but withdrawn on review — formatting choice only.

---

#### Spiral (2022) — 4 minor issues

**[^2]** — "Broad range" slightly overstated. The abstract uses "broad range" but Table 2 only shows three specific configurations.

**[^14]** — Omitted factor. The noise bound should be d * ||mu||_inf * ||E_Regev||_inf + ... (Theorem 2.19), but the notes omit the leading factor of d.

**[^15]** — Wrong section number. The quote about Gentry-Halevi's 30 MB query estimate appears in the Section 1 introduction (before Section 1.2), not in Section 1.2 as cited.

**[^17]** — Omitted qualifications. The paper says the 2^9 limit applies specifically to "Spiral and SpiralPack" (not SpiralStream) and adds "(without moving to a larger set of lattice parameters)." Both omissions overstate the rigidity of the constraint.

---

#### FrodoPIR (2022) — 3 minor issues

**[^ci]** — Wrong page for quote. The quote "the offline phase of the protocol is performed by the server alone, completely independent of the number of clients or queries" appears on p. 2, not Section 2.3 p. 7 as cited.

**[^open1]** — Misleading direction. The notes say DoublePIR could "reduce hint download from ~6 MB to ~16 MB" — going from 6 to 16 is an **increase**, not a reduction. The 16 MB figure comes from DoublePIR's application to SimplePIR (reducing 124 MB to 16 MB), not FrodoPIR.

**[^safebrowsing]** — Unsupported figure. The notes claim "browser stores ~2.5 MB Bloom-filter-like structure" but this figure does not appear in the cited appendix. The paper says the local structure is "8x smaller" than the >90 MB blocklist, implying >11 MB.

---

#### ThorPIR (2024) — 1 minor issue

**[^8]** — Bits/bytes unit confusion. The footnote writes "360 bits = 2880 bits" which is mathematically incoherent. The correct statement is "360 **bytes** = 2880 bits." The downstream calculation (2880/3 = 960 ciphertexts) is correct, confirming the intended value. This same error appears in the notes metadata table.

---

### Issue Distribution

| Category | Count | Examples |
|----------|-------|---------|
| Wrong page number | 12 | SealPIR [^3], [^19], [^40]; XPIR-2016 [^36], [^38]; Addra [^3], [^10], [^32]; etc. |
| Wrong section reference | 8 | SealPIR [^9], [^22]; XPIR-2014 [^9], [^17]; OnionPIR [^querypacking]; Spiral [^15]; etc. |
| Truncated/modified quotes | 5 | SealPIR [^8]; OnionPIR [^whatchanged], [^coreidea], [^concurrent2]; OnionPIRv2 [^10] |
| Incorrect values/facts | 5 | SealPIR [^36]; XPIR-2016 [^44]; Addra [^24]; CwPIR [^30]; ThorPIR [^10] |
| Notation/math errors | 4 | MulPIR [^6], [^12], [^15]; Spiral [^14] |
| Imprecise characterization | 4 | XPIR-2014 [^22]; XPIR-2016 [^37]; CwPIR [^1], [^5] |
| Conflated concepts | 3 | CwPIR [^2]; OnionPIR [^fhe_d]; FrodoPIR [^open1] |
| Unit errors | 2 | ThorPIR [^8], [^10] |
| Editorial content as citation | 2 | SealPIR [^36]; OnionPIR [^tradeoff_security] |
| Unsupported figures | 1 | FrodoPIR [^safebrowsing] |

---

### Recommendations

**Priority fixes (INCORRECT — 5 items):**
1. SealPIR [^36]: Replace SKILL taxonomy citation with a paper-sourced reference or mark as editorial
2. XPIR-2016 [^44]: Remove the fabricated "720p at 60fps: ~8,000 movies" row
3. Addra/FastPIR [^24]: Change Client Query time from 1.4 ms to 21.3 ms
4. CwPIR [^30]: Change "up to 10x speedup" to "up to ~14x speedup" or align with the cited example
5. ThorPIR [^10]: Change "360 bits = 45 bytes" to "360 bytes" throughout (also fix metadata table and [^8])

**Batch fix (MINOR — page/section errors, 20 items):**
Most minor issues are wrong page numbers or section references. These can be corrected by updating the location string in the footnote without changing the substance of the claim.
