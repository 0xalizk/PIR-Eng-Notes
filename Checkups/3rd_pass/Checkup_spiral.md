## Spiral (2022) — 3rd Pass Fact-Check

**Notes:** `spiral_2022_notes.md`
**PDF:** `Spiral_stream_2022_368.pdf`
**Claims checked:** 58 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0 | **Rejected:** 1

---

### INCORRECT Findings

**1. Core Contribution — "1.5x in rate" should be "1.5x reduction in response size"**

Notes (Core Contribution, first paragraph, no footnote):
> "simultaneously improving over OnionPIR (the prior state-of-the-art) by 4.5x in query size, **1.5x in rate**, and 2x in throughput"

PDF Abstract (p.1):
> "the basic version of Spiral *simultaneously* achieves at least a 4.5× reduction in query size, **1.5× reduction in response size**, and 2× increase in server throughput compared to previous systems."

The notes substitute "1.5x in rate" for the paper's "1.5x reduction in response size." Rate and response size are distinct metrics; rate is the ratio of record size to response size, while response size is the absolute size of the server reply. The paper's claim is about response size, not rate. This also affects [^2], which cites "Abstract and Table 2 (p.29)" for these improvements — the improvement values themselves are misquoted.

---

### MINOR Issues

**1. [^12] — Claim attributed to "Theorem 3.2" is in the Section 3.2 prose, not the theorem statement**

Notes ([^12]):
> Theorem 3.2 (p.14): "The noise introduced by the encoding conversion step depends only on the decomposition base z_conv and not on the decomposition base z_GSW associated with the GSW encodings."

PDF: This sentence appears in the *introductory prose* of Section 3.2 (p.14), before Theorem 3.2 is stated. Theorem 3.2 itself is the formal noise bound for RegevToGSW; it does not contain this sentence. The correct attribution is "Section 3.2 (p.14)" or "Section 3.2, introductory paragraph (p.14)."

---

**2. Variants table — SpiralStream public parameter upper bound is 3 MB, not 5 MB**

Notes (Variants table, SpiralStream row):
> Public Params: **344 KB--5 MB**

PDF p.2:
> "In Spiral, they range from 14 to 18 MB and for SpiralStream, they range from **344 KB to 3 MB**."

Table 2 (p.29) confirms: SpiralStream Param. Size = "**344 KB–3 MB**". The value "5 MB" does not appear anywhere in the paper for SpiralStream public parameters. Note that the notes' own [^26] and Key Tradeoffs section correctly state "344 KB to 3 MB," creating an internal inconsistency with the Variants table.

---

**3. Comparison with Prior Work table — Spiral server computation time uses Table 3 value, not Table 2**

Notes (Comparison with Prior Work table, 2^18 x 30KB row):
> Server time: **24.52 s**

PDF Table 2 (p.29), Spiral, 2^18 x 30KB, Computation: **24.46 s**
PDF Table 3 (p.30), Spiral, 2^18 x 30KB, Computation: **24.52 s**

The Comparison with Prior Work section is a head-to-head comparison against SealPIR, FastPIR, and OnionPIR — which corresponds to Table 2 in the paper. The value 24.52 s comes from Table 3 (the four-Spiral-variant comparison), not Table 2. The discrepancy is small (24.46 vs 24.52 s) but the value is drawn from the wrong source table. The same cross-table mixing affects the throughput for Spiral in that row: Table 2 shows 322 MB/s while Table 3 shows 321 MB/s; the notes' Variants benchmark table (sourced from Table 3) shows 321 MB/s, consistent with Table 3, so the Comparison table's 322 MB/s is consistent with Table 2 for throughput. The inconsistency is only in the computation time (24.52 from Table 3 vs 24.46 in Table 2).

---

### Reviewer Verdict

**INCORRECT Finding 1 — REJECTED (false positive)**

The checkup claims the notes write "1.5x in rate" when the paper says "1.5× reduction in response size," and treats this as an error. However, the checkup only checked the Abstract (p.1). The paper's own body text on p.2 ("This work." paragraph) states explicitly: "The basic instantiation of Spiral simultaneously achieves a 4.5× reduction in query size, **a 1.5× increase in the rate**, and a 2× increase in the server throughput compared to OnionPIR." The notes' phrasing "1.5x in rate" directly matches the body text on p.2. The Abstract and the body text use different framings for the same result (response size vs rate are related but the paper uses both formulations in different places). The notes are consistent with the paper's own introductory body text and are not incorrect.

**MINOR Issue 1 — CONFIRMED**

The quoted sentence ("The noise introduced by the encoding conversion step depends only on the decomposition base z_conv and not on the decomposition base z_GSW associated with the GSW encodings.") appears in the introductory prose of Section 3.2 (p.14), not in the statement of Theorem 3.2 itself. Theorem 3.2 is the formal noise bound for RegevToGSW. The attribution to "Theorem 3.2" is therefore slightly imprecise; the correct citation is "Section 3.2, introductory paragraph (p.14)."

**MINOR Issue 2 — CONFIRMED**

Table 3 (p.30) and the p.2 prose both give the SpiralStream public parameter range as 344 KB to 3 MB. The Variants table in the notes shows "344 KB--5 MB," which is wrong. The value 5 MB does not appear anywhere in the paper for SpiralStream. The notes' own [^26] and Key Tradeoffs section correctly state 3 MB, creating an internal inconsistency that confirms the Variants table entry is erroneous.

**MINOR Issue 3 — CONFIRMED**

Table 2 (p.29) gives Spiral's computation time for the 2^18 x 30KB configuration as 24.46 s. The notes' Comparison with Prior Work table shows 24.52 s, which is the value from Table 3 (p.30). The Comparison with Prior Work section corresponds to Table 2 (head-to-head against SealPIR, FastPIR, OnionPIR), so the correct source value is 24.46 s, and the notes have drawn from the wrong table.

---

**Net summary: 3 confirmed, 1 rejected**

The header counts should be updated: **Issues found: 3 | Minor: 3 | Incorrect: 0**
