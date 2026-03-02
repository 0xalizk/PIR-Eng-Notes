## InsPIRe (2025) — 3rd Pass Fact-Check

**Notes:** `InsPIRe_2025_notes.md`
**PDF:** `InsPIRe_2025_1352.pdf`
**Claims checked:** 68 | **Issues found:** 5 | **Minor:** 1 | **Incorrect:** 4

---

### INCORRECT Findings

**1. Notes Table 2 (1-bit entries): Comparison-scheme rows are from the 8 GB database, not 1 GB**

The notes label their Table 2 as: "Table 2: 1-bit entries (selected rows, 1 GB database = 2^33 x 1 bit)."

However, the YPIR, SimpleYPIR, KSPIR, and HintlessPIR values shown come from the **8 GB (2^36 × 1-bit)** block of PDF Table 2, not the 1 GB block. The InsPIRe-family values are from the correct 1 GB block.

Comparison (PDF Table 2, p.21):

| Metric | Notes "1 GB" | PDF 1 GB block | PDF 8 GB block |
|--------|-------------|----------------|----------------|
| YPIR Upload (Query) | 1024 KB | 384 KB | 1024 KB |
| YPIR Total Comm | 1498 KB | 858 KB | 1498 KB |
| YPIR Server Time | 830 ms | ~340 ms | 830 ms |
| YPIR Throughput | 8930 MB/s | — | matches 8 GB |
| SimpleYPIR Server Time | 830 ms | — | 1850 ms (8 GB) |
| KSPIR Server Time | 5910 ms | 780 ms (1 GB) | 5910 ms |
| KSPIR Throughput | 1390 MB/s | — | 1390 MB/s |
| HintlessPIR Total Comm | 4188 KB | — | 4188 KB |
| HintlessPIR Server Time | 2000 ms | — | 2030 ms |
| HintlessPIR Throughput | 4040 MB/s | — | 4040 MB/s |

The InsPIRe values (Keys=84 KB, Query=140 KB, Download=12 KB, Total=236 KB, Server=280 ms, Throughput=3620 MB/s) do match the 1 GB row (1024 MB / 280 ms ≈ 3657 MB/s ≈ 3620 MB/s).

The table as presented is internally inconsistent: comparison schemes are drawn from the 8 GB database row while InsPIRe is drawn from the 1 GB row.

Additionally, the notes show **KSPIR Upload (Keys) = 462 KB** in Table 2. PDF Table 2 shows KSPIR Upload (Keys) = 2352 KB (1 GB block) and 2668 KB (8 GB block). The value 462 KB matches YPIR's key material, not KSPIR's. No row in PDF Table 2 shows KSPIR keys at 462 KB.

---

**2. Communication Breakdown table: incorrect source table cited**

Notes, Communication Breakdown section:

> "**Total** -- **292 KB** -- From Table 2 (1 GB, 64 B entry)"

The PDF's Table 2 covers **1-bit entries** only. The 64 B entry benchmarks are in **Table 3** of the PDF (p.21). Citing Table 2 for 64 B entries is incorrect; the source should be Table 3.

---

### MINOR Issues

**1. [^6] Page reference off by one**

Notes cite: "Section 3.2 (p.12): 'Beyond RLWE hardness, our packing scheme relies on the standard circular security assumption, as key-switching matrices encrypt (scaled) automorphic images of the secret key.'"

The PDF's Section 3.2 ("Packing with Two Key-switching Matrices") spans pp. 8–11. The Security paragraph containing this quote is on **p.11**, and Theorems 1–2 are also on p.11. Section 3.3 ("Partial Packing with One Key-switching Matrix") begins on p.12. The cited page p.12 is therefore off; the correct page is p.11.

---

**2. [^16] Dropped qualifier in quote**

Notes cite Section 2.1 (p.7) and quote: "Under this assumption, we fix the random components of the LWE/RLWE ciphertexts, and this scheme remains secure as long as fresh secret keys are generated for each query."

PDF p.7 (Section 2.1) reads: "Under this assumption, we fix the random components of the LWE/RLWE ciphertexts, and this scheme remains secure as long as fresh secret keys are generated for each query (with multiplicative security loss proportional to the number of queries)."

The parenthetical qualifier "(with multiplicative security loss proportional to the number of queries)" is dropped from the quoted text in the notes. The notes do address this separately in the Deployment Considerations section ("Security degrades multiplicatively with number of queries Q"), so the substance is not lost, but the quote as presented is incomplete.

---

**3. Notes Table 3 (64 B entries): KSPIR and HintlessPIR Upload (Keys) values require verification**

Notes Table 3 shows for 1 GB (2^24 × 64 B):
- KSPIR Upload (Keys) = 360 KB
- HintlessPIR Upload (Keys) = 128 KB

PDF Table 3 (p.21) for the 1 GB block shows HintlessPIR Upload (Keys) = 360 KB. KSPIR Upload (Keys) in Table 3 appears to be substantially larger than 360 KB (KSPIR consistently carries large key material across all tables in the PDF). The value 360 KB in the notes for KSPIR matches HintlessPIR's key size from the 1-bit table, suggesting a possible column swap between KSPIR and HintlessPIR in the notes' Table 3. Note that the total arithmetic is internally consistent for each column as noted (360+14+224=598 for KSPIR; 128+128+1748=2004 for HintlessPIR), so this is a values-level issue rather than arithmetic. This could not be conclusively confirmed from the table image alone and is flagged as a minor concern for review.

---

### Reviewer Verdict

**Net summary: 5 confirmed, 0 rejected. Minor #3 severity upgraded from MINOR to INCORRECT.**

Updated counts: **Issues found:** 5 | **Minor:** 1 | **Incorrect:** 4

---

#### INCORRECT #1 — CONFIRMED

PDF Table 2 (p.21) is unambiguous. The 1 GB (2^33 x 1-bit) block shows YPIR: Upload (Query) = 384 KB, Total = 858 KB, Server Time = 340 ms, Throughput = 7420 MB/s. The notes show 1024 KB / 1498 KB / 830 ms / 8930 MB/s — values that match the 8 GB (2^36 x 1-bit) block exactly. The same wrong-block sourcing applies to SimpleYPIR, KSPIR, and HintlessPIR rows. The InsPIRe-family values (Keys=84 KB, Query=140 KB, Download=12 KB, Total=236 KB, Server=280 ms, Throughput=3620 MB/s) do correctly match the 1 GB block, confirming the internal inconsistency.

The KSPIR keys sub-claim is independently confirmed: PDF Table 2 shows KSPIR Upload (Keys) = 2352 KB (1 GB block) and 2668 KB (8 GB block). The 462 KB shown in the notes for KSPIR matches YPIR's key value, not KSPIR's. This is a distinct error on top of the wrong-block sourcing.

**Verdict: CONFIRMED INCORRECT.**

---

#### INCORRECT #2 — CONFIRMED

PDF Table 2 is explicitly titled "PIR performance metrics for different database sizes with 1-bit entries" — it contains no 64 B entry data. The 64 B entry benchmarks are in PDF Table 3 ("PIR performance metrics for different database sizes with 64 B entries"). The notes' Communication Breakdown table cites "From Table 2 (1 GB, 64 B entry)" for the 292 KB total. The 292 KB figure itself is correct (it appears in Table 3 under InsPIRe, 1 GB block); only the table citation is wrong.

**Verdict: CONFIRMED INCORRECT.** The note should cite Table 3, not Table 2.

---

#### Minor #1 — CONFIRMED

PDF Section 3.2 ("Packing with Two Key-switching Matrices") runs from p.8 to p.11. The Security paragraph containing the exact quoted sentence — "Beyond RLWE hardness, our packing scheme relies on the standard circular security assumption, as key-switching matrices encrypt (scaled) automorphic images of the secret key" — appears on p.11, immediately after Theorem 2. Section 3.3 begins on p.12. The footnote cites p.12, which is one page too late.

**Verdict: CONFIRMED MINOR.** Correct page is p.11.

---

#### Minor #2 — CONFIRMED

PDF p.7, Section 2.1 reads in full: "Under this assumption, we fix the random components of the LWE/RLWE ciphertexts, and this scheme remains secure as long as fresh secret keys are generated for each query (with multiplicative security loss proportional to the number of queries)." The notes quote ends at "for each query" without an ellipsis, omitting the parenthetical qualifier. The substance is addressed separately in the Deployment Considerations section of the notes, but the footnote presents a truncated string as a complete direct quote.

**Verdict: CONFIRMED MINOR.** Quote is incomplete; the dropped qualifier changes the precision of the security claim as cited.

---

#### Minor #3 — CONFIRMED, severity upgraded to INCORRECT

PDF Table 3 (64 B entries), 1 GB (2^24 x 64B) block:
- KSPIR Upload (Keys) = **2352 KB**
- HintlessPIR Upload (Keys) = **360 KB**

Notes Table 3 shows KSPIR = 360 KB and HintlessPIR = 128 KB. The KSPIR value in the notes (360 KB) is actually HintlessPIR's PDF value; the HintlessPIR value (128 KB) does not appear in any 1 GB row of PDF Table 3. The error for KSPIR is 2352 vs 360 — a factor of ~6.5x, far above the 2x threshold for INCORRECT under the SKILL rubric. The arithmetic self-consistency noted by the checker (360+14+224=598 for KSPIR; 128+128+1748=2004 for HintlessPIR) confirms the totals are internally consistent with the wrong values, indicating a coherent column swap rather than a transcription slip.

**Verdict: CONFIRMED, severity upgraded from MINOR to INCORRECT.** KSPIR keys should be 2352 KB; HintlessPIR keys should be 360 KB for the 1 GB / 64 B block in PDF Table 3.
