## Group X (Extensions) — 3rd Pass Fixes Applied

### KeywordPIR (2019) — 9 fixes applied

---

**Fix 1 — Cross-Paradigm Comparison table: ElGamal and Damgard-Jurik upload/download/cost values swapped**
- Issue ref: Checkup Incorrect Finding 1
- Location: Cross-Paradigm Comparison table (Section 3), ElGamal and Damgard-Jurik rows
- What changed: Swapped upload, download, and server cost values to match PDF Table 5 (p. 13)
- ElGamal Upload: 1,480 kB → 280 kB
- ElGamal Download: 0.6 kB → 8 kB
- Damgard-Jurik Upload: 280 kB → 1,480 kB
- Damgard-Jurik Download: 280 kB → 0.6 kB

---

**Fix 2 — Comparison with Prior Work table: ElGamal and Damgard-Jurik upload/download/total values corrected**
- Issue ref: Checkup Incorrect Finding 2
- Location: Comparison with Prior Work table (Section 10), ElGamal and Damgard-Jurik columns
- What changed: Corrected upload and download values to match PDF Table 5 (p. 13), 1MB section
- ElGamal Upload: 1,480 kB → 280 kB
- ElGamal Download: 283 kB → 8 kB
- ElGamal Total comm.: 1,763 kB → 288 kB
- Damgard-Jurik Upload: 0.6 kB → 1,480 kB
- Damgard-Jurik Download: 614 kB → 0.6 kB
- Damgard-Jurik Total comm.: 614.6 kB → 1,480.6 kB

---

**Fix 3 — Performance Benchmarks table: SealPIR Server Expand shifted by one column**
- Issue ref: Checkup Incorrect Finding 3
- Location: SealPIR vs MulPIR table (Section 7), SealPIR Server Expand row
- What changed: Corrected column-shifted values to match PDF Table 3 (p. 12)
- n=1,048,576: 590 → 294
- n=4,194,304: 12,891 → 590

---

**Fix 4 — Performance Benchmarks table: SealPIR Server Cost at n=262,144**
- Issue ref: Checkup Incorrect Finding 4
- Location: SealPIR vs MulPIR table (Section 7), SealPIR Server Cost row, n=262,144 column
- What changed: Corrected to match PDF Table 3 (p. 12) n=262,144 value
- Old: 0.0040 → New: 0.0033

---

**Fix 5 — Performance Benchmarks table: SealPIR Server Cost at n=4,194,304**
- Issue ref: Checkup Incorrect Finding 5
- Location: SealPIR vs MulPIR table (Section 7), SealPIR Server Cost row, n=4,194,304 column
- What changed: Corrected to match PDF Table 3 (p. 12) SealPIR d=2 value (was using d=3 value)
- Old: 0.017 → New: 0.0067

---

**Fix 6 — MulPIR Download (kB) listed as 122 instead of 119 (holistic fix across all tables)**
- Issue ref: Checkup Incorrect Finding 6
- Location: Three tables affected — Performance Benchmarks (Section 7), Complexity core metrics (Section 6), and derived total communication
- What changed: Corrected MulPIR download from 122 to 119 per PDF Table 3 (p. 12) in all occurrences
- Performance Benchmarks table: Download row 122 | 122 | 122 → 119 | 119 | 119
- Complexity table: MulPIR Download size 122 kB → 119 kB
- Complexity table: MulPIR Total communication 244 kB → 241 kB (recalculated: 122 upload + 119 download)

---

**Fix 7 — Complexity table: SealPIR Server Cost at n=262,144 (holistic propagation of Fix 4)**
- Issue ref: Checkup Incorrect Finding 4 / Minor Finding C (propagated to Complexity section)
- Location: Complexity core metrics table (Section 6), SealPIR Server Cost row
- What changed: Corrected to match the actual n=262,144 value from PDF Table 3
- Old: 0.0040 → New: 0.0033

---

**Fix 8 — GR complexity table: C.Setup and S.Setup column labels swapped**
- Issue ref: Checkup Minor Finding A
- Location: Core metrics — Gentry-Ramzan table (Section 6), row labels
- What changed: Corrected labels to match PDF Table 5 (p. 13) column headers
- "C.Setup (ms)" (values 1,532 / 1,540 / 1,594 / 1,796) → "S.Setup (ms)"
- "S.Setup (ms)" (values 3,294 / 2,688 / 3,966 / 7,980) → "C.Create (ms)"

---

**Fix 9 — [^4] footnote: missing qualifier "for some parameter sets"**
- Issue ref: Checkup Minor Finding B
- Location: Footnote [^4]
- What changed: Added "for some parameter sets" at the end of point (3) to match PDF Section 1.1 (p. 2)
- Old: "...which can further halve the upload communication."
- New: "...which can further halve the upload communication for some parameter sets."

---

**Fix 10 — [^26] inline text: imprecise column description**
- Issue ref: Checkup Minor Finding C
- Location: Inline text below Complexity core metrics table
- What changed: Corrected "closest to 2^18" to "= 2^18" since n=262,144 is exactly 2^18
- Old: "n = 262,144 column (closest to 2^18)"
- New: "n = 262,144 (= 2^18) column"

---

### DistributionalPIR (2025) — 3 fixes applied

---

**Fix 1 — Compiler Interface table and [^22]: SimplePIR performance improvement attributed to wrong comparison baseline**
- Issue ref: Checkup Incorrect Finding (confirmed)
- Location: Compiler Interface table (Section 4), SimplePIR row; Footnote [^22]
- What changed: The notes mixed two baselines — the 5-77x figure (vs. batch codes) was paired with the 4.8-9.7x figure (vs. no batching) and attributed to "vs. no batching." Corrected to separate the two comparisons per PDF p. 11, Section 7.2.1.
- Table cell old: "5-77x less server work, 4.8-9.7x less communication vs. no batching; 8x total cost reduction"
- Table cell new: "10-195x more queries/sec, 4.8-9.7x less communication vs. no batching; 5.1-77x more queries/sec, 8.1-95x less communication vs. batch codes; 8x total cost reduction"
- [^22] old: "Server work and communication improvements (5-77x less server work, 4.8-9.7x less communication) from Section 7.2.1"
- [^22] new: "vs. no batching: 10-195x more queries/sec, 4.8-9.7x less communication; vs. batch codes: 5.1-77x more queries/sec, 8.1-95x less communication (Section 7.2.1)"

---

**Fix 2 — [^38]: Off-by-one page reference for Section 3**
- Issue ref: Checkup Minor Finding (confirmed)
- Location: Footnote [^38]
- What changed: Section 3 ("Constructing distributional PIR") begins on p. 4, not p. 3
- Old: "Section 3 / Section 4.1 (p. 3, 6)"
- New: "Section 3 / Section 4.1 (p. 4, 6)"

---

### Summary

| Scheme | Incorrect fixes | Minor fixes | Total fixes |
|--------|----------------|-------------|-------------|
| KeywordPIR | 7 (Fixes 1-7) | 3 (Fixes 8-10) | 10 |
| DistributionalPIR | 1 (Fix 1, two locations) | 1 (Fix 2) | 3* |

*DistributionalPIR Fix 1 touched two locations (table cell + footnote) for the same issue.

**Total fixes applied: 13 discrete edits across 2 schemes.**
