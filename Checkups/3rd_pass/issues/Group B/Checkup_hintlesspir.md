## HintlessPIR (2023) — 3rd Pass Fact-Check

**Notes:** `HintlessPIR_2023_notes.md`
**PDF:** `HintlessPIR_2023_1733.pdf`
**Claims checked:** 68 | **Issues found:** 1 | **Minor:** 0 | **Incorrect:** 1 | **Rejected (false positives):** 1

---

### INCORRECT Findings

**1. Table 1 — Tiptoe PIR Query Size for 2^18 × 32KB database**

Notes (Table 1, "Table 1: Communication costs"):
> HintlessPIR Query ... | 1502 KB
> ...
> (Tiptoe PIR row implied from comparison section, and copied into Table 1 structure)

The notes reproduce Table 1 from the paper and show Tiptoe PIR Query Size for the rightmost column (2^18 × 32KB, 8.59GB) as **23MB**.

PDF Table 1 (p.28), Tiptoe PIR row, Query Size, rightmost column: **24MB**

All four left columns are correctly 23MB; only the 2^18 × 32KB column differs. The notes incorrectly carry 23MB across all five columns rather than reading the actual value of 24MB for the largest database.

---

**2. [^19] — Lemma 19 Correctness Condition 2 formula transcription error**

Notes ([^19], Cryptographic Foundation section):
> (2) q > sqrt(ln(1 + k(n_rows+n)/(delta/3))) * max_j **sqrt(ell * N)** * n * sigma * gamma * p_j^2

PDF (p.46, Lemma 19), Condition 2:
> q > √(ln(1 + k(n_rows + n)/(δ/3))) · max_j **√ℓ · N** · n · σ · γ · p_j²

The notes render the factor as √(ℓ·N) (square root of the entire product ℓN), but the PDF has √ℓ · N (square root of ℓ alone, multiplied by N without a square root). These are mathematically distinct: √(ℓN) ≠ √ℓ · N. Conditions 1 and 3 are transcribed correctly.

---

### MINOR Issues

None.

---

### Reviewer Verdict

**Finding 1 — Table 1, Tiptoe PIR Query Size (2^18 × 32KB): REJECTED**

The checkup's premise is incorrect. The notes' Table 1 does not contain a Tiptoe PIR row at all. Inspecting the notes' "Table 1: Communication costs" section, the rows reproduced are: HintlessPIR Query, HintlessPIR Response, SimplePIR Hint, SimplePIR Query, SimplePIR Response, Spiral Params, Spiral Query, and Spiral Response. Tiptoe PIR and DoublePIR rows are absent entirely. The checkup claims "The notes reproduce Table 1 from the paper and show Tiptoe PIR Query Size for the rightmost column (2^18 × 32KB, 8.59GB) as 23MB" — this is a false positive: there is no Tiptoe PIR row in the notes' table to contain any error. The underlying PDF value (24MB for the 2^18 × 32KB column, vs 23MB for all other columns) is itself correct per Table 1 on p.28, but the claimed error location does not exist in the notes.

**Finding 2 — [^19], Lemma 19 Condition 2, sqrt(ell * N) vs sqrt(ell) * N: CONFIRMED**

The PDF (p.46, Lemma 19, Condition 2) writes the factor as `√ℓ · N · n · σ · γ · p_j²`, meaning the square root applies only to ℓ, and N is outside the radical. The notes write `sqrt(ell * N) * n * sigma * gamma * p_j^2`, which renders as √(ℓN) — square root of the entire product ℓN. These are mathematically distinct: √ℓ · N ≠ √(ℓN). The transcription error in the notes is real and confirmed against the PDF.

**Net summary: 1 confirmed, 1 rejected**
