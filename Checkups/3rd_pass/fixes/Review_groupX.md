## Group X (Extensions) — 3rd Pass Fix Review

Reviewer: Independent verification against source PDFs.
Date: 2026-03-02

---

### KeywordPIR (2019) — Fix-by-Fix Verification

**Source PDF:** `SealPIR_KeywordPIR_2019_1483.pdf`, Tables 3 (p. 12) and 5 (p. 13).

---

**Fix 1 — Cross-Paradigm Comparison table: ElGamal and Damgard-Jurik upload/download/cost values swapped**

PDF Table 5 (p. 13), 1MB database section:
- ElGamal: upload=280, download=8, Server Cost=0.0091
- Damgard-Jurik (s=1): upload=1,480, download=0.6, Server Cost=0.0382

Notes now show (line 74): ElGamal | 280 | 8 | 0.0091
Notes now show (line 75): Damgard-Jurik (s=1) | 1,480 | 0.6 | 0.0382

All six values match the PDF exactly.

**VERIFIED**

---

**Fix 2 — Comparison with Prior Work table: ElGamal and Damgard-Jurik upload/download/total values corrected**

PDF Table 5 (p. 13), 1MB database section:
- ElGamal: upload=280, download=8
- Damgard-Jurik (s=1): upload=1,480, download=0.6

Notes now show (lines 340-342):
- ElGamal: Upload=280, Download=8, Total comm.=288
- Damgard-Jurik: Upload=1,480, Download=0.6, Total comm.=1,480.6

All values match the PDF. Total communication values are correctly computed (280+8=288; 1,480+0.6=1,480.6).

**VERIFIED**

---

**Fix 3 — Performance Benchmarks table: SealPIR Server Expand shifted by one column**

PDF Table 3 (p. 12), SealPIR (d=2), Server Expand row:
- n=262,144: 145
- n=1,048,576: 294
- n=4,194,304: 590

Notes now show (line 244): Server Expand (ms) | 145 | 294 | 590

All three values match the PDF exactly. The old shifted values (590 | 12,891) are gone.

**VERIFIED**

---

**Fix 4 — Performance Benchmarks table: SealPIR Server Cost at n=262,144**

PDF Table 3 (p. 12), SealPIR (d=2), Server Cost row:
- n=262,144: 0.0033

Notes now show (line 248): Server Cost (US cents) | 0.0033 | ...

Matches the PDF exactly. The old wrong value (0.0040) is gone from this cell.

**VERIFIED**

---

**Fix 5 — Performance Benchmarks table: SealPIR Server Cost at n=4,194,304**

PDF Table 3 (p. 12), SealPIR (d=2), Server Cost row:
- n=4,194,304: 0.0067

Notes now show (line 248): ... | 0.0067

Matches the PDF exactly. The old wrong value (0.017, from the d=3 row) is gone.

**VERIFIED**

---

**Fix 6 — MulPIR Download (kB) corrected from 122 to 119 across all tables**

PDF Table 3 (p. 12), MulPIR (d=2), Download row:
- n=262,144: 119
- n=1,048,576: 119
- n=4,194,304: 119

Notes Performance Benchmarks table (line 254): Download (kB) | 119 | 119 | 119
Notes Complexity table (line 180): Download size | 119 kB
Notes Complexity table (line 181): Total communication | 241 kB (= 122 upload + 119 download)

All three locations corrected. The old value of 122 no longer appears in any download cell. Remaining occurrences of "122" in the notes are all in the Upload row (lines 179, 253), which is correct per PDF Table 3 (Upload=122 kB for MulPIR d=2).

**VERIFIED**

---

**Fix 7 — Complexity table: SealPIR Server Cost at n=262,144 (propagation of Fix 4)**

PDF Table 3 (p. 12), SealPIR (d=2), Server Cost at n=262,144: 0.0033

Notes Complexity table (line 185): Server Cost (US cents) | 0.0033 | ...

Matches the PDF. Consistent with Fix 4 in the Performance Benchmarks table.

**VERIFIED**

---

**Fix 8 — GR complexity table: C.Setup and S.Setup column labels swapped**

PDF Table 5 (p. 13) column headers for GR rows:
- S.Setup column: values 1,532 / 1,540 / 1,594 / 1,796
- C.Create column: values 3,294 / 2,688 / 3,966 / 7,980

Notes Complexity table (lines 195-196):
- S.Setup (ms) | 1,532 | 1,540 | 1,594 | 1,796
- C.Create (ms) | 3,294 | 2,688 | 3,966 | 7,980

Labels now match the PDF column headers exactly. Values are unchanged and correct.

**VERIFIED**

---

**Fix 9 — [^4] footnote: missing qualifier "for some parameter sets"**

PDF Section 1.1 (p. 2): "(3) introducing a new oblivious expansion algorithm which can further halve the upload communication for some parameter sets."

Notes [^4] (line 420): "...which can further halve the upload communication for some parameter sets."

The qualifier is now present and matches the PDF verbatim.

**VERIFIED**

---

**Fix 10 — [^26] inline text: imprecise column description**

The notes [^26] footnote text was changed from "n = 262,144 column (closest to 2^18)" to "n = 262,144 (= 2^18) column" (line 187). Since 262,144 = 2^18 exactly, the new text is mathematically correct and removes the misleading "closest to" phrasing.

**VERIFIED**

---

### Cross-Pass Persistent Issue: SealPIR Table 3 Column Shift

The column-shift error in SealPIR Table 3 data affected three rows in the original notes:
1. **Server Expand** — values were shifted right by one column (Fix 3)
2. **Server Cost at n=262,144** — had the n=1,048,576 value instead (Fix 4 + Fix 7)
3. **Server Cost at n=4,194,304** — had the d=3 value instead of d=2 (Fix 5)

Post-fix verification of the entire SealPIR (d=2) block in the Performance Benchmarks table (lines 242-248):

| Row | n=262,144 | n=1,048,576 | n=4,194,304 | PDF Match? |
|-----|-----------|-------------|-------------|------------|
| Client Query (ms) | 19 | 19 | 19 | Yes |
| Server Expand (ms) | 145 | 294 | 590 | Yes |
| Server Response (ms) | 1,020 | 3,520 | 12,891 | Yes |
| Upload (kB) | 61.4 | 61.4 | 61.4 | Yes |
| Download (kB) | 307 | 307 | 307 | Yes |
| Server Cost (US cents) | 0.0033 | 0.0040 | 0.0067 | Yes |

All 18 SealPIR cells now match PDF Table 3 exactly. The column-shift issue is fully resolved.

Note: The remaining 0.0040 in the SealPIR row at n=1,048,576 is correct per the PDF (Table 3 shows SealPIR d=2 Server Cost = 0.0040 at n=1,048,576). The 0.0040 in the Cross-Paradigm Comparison table (line 69) also correctly references the n=2^20 value for SealPIR, consistent with the table's header note "Server costs from Table 3 (p. 12) for 288B entries with n=2^20 use recursion d=2."

**ALL COLUMN-SHIFT CELLS FIXED**

---

### DistributionalPIR (2025) — Fix-by-Fix Verification

**Source PDF:** `DistributionalPIR_2025_132.pdf`

---

**Fix 1 — Compiler Interface table and [^22]: SimplePIR performance improvement attributed to wrong comparison baseline**

PDF Section 7.2.1 (p. 11):
> "our construction increases the queries-per-second by 10-195x and reduces communication by 4.8-9.7x compared to the baseline that doesn't use batch codes. Compared against batch codes, our construction increases the queries-per-second by 5.1-77x and reduces communication by 8.1-95x."

Notes Compiler Interface table (line 128) now reads:
> "10-195x more queries/sec, 4.8-9.7x less communication vs. no batching; 5.1-77x more queries/sec, 8.1-95x less communication vs. batch codes; 8x total cost reduction"

Notes [^22] (line 360) now reads:
> "vs. no batching: 10-195x more queries/sec, 4.8-9.7x less communication; vs. batch codes: 5.1-77x more queries/sec, 8.1-95x less communication (Section 7.2.1). 8x total cost reduction ($0.0057 vs. $0.046) from Table 12."

Both locations now correctly separate the two baselines with matching figures from the PDF. The old mixed-baseline error ("5-77x less server work, 4.8-9.7x less communication vs. no batching") is gone.

**VERIFIED**

---

**Fix 2 — [^38]: Off-by-one page reference for Section 3**

PDF page 4 (right column heading): "3 Constructing distributional PIR" appears at the top of p. 4. Page 3 ends with Section 2.1 content (correctness definitions, efficiency metrics).

Notes [^38] (line 376) now reads: "Section 3 / Section 4.1 (p. 4, 6)"

The old "p. 3" is corrected to "p. 4", which matches the PDF. The "p. 6" for Section 4.1 was already correct and is unchanged.

**VERIFIED**

---

### Completeness Check

#### KeywordPIR — Residual wrong values scan

| Search target | Occurrences | Status |
|---------------|-------------|--------|
| MulPIR Download = 122 | 0 | Clean (all download cells now show 119) |
| SealPIR Server Cost 0.017 | 0 | Clean |
| Server Expand 12,891 in wrong row | 0 (12,891 appears only in Server Response row, which is correct) | Clean |
| "C.Setup" as GR label | 0 | Clean |
| "closest to 2^18" | 0 | Clean |
| "122" remaining | 2 occurrences — both in MulPIR Upload rows (lines 179, 253), which is correct per PDF | Clean |
| "0.0040" remaining | 3 occurrences — (1) SealPIR Cross-Paradigm table at n=2^20, correct; (2) SealPIR Performance Benchmarks at n=1,048,576, correct; (3) [^31] footnote referencing n=2^20, correct | Clean |

#### DistributionalPIR — Residual wrong values scan

| Search target | Occurrences | Status |
|---------------|-------------|--------|
| "5-77x" with wrong baseline attribution | 0 | Clean (5.1-77x now correctly attributed to vs. batch codes) |
| "p. 3" for Section 3 in [^38] | 0 in [^38] | Clean (other "p. 3" references are for Section 2/2.1, which is correct) |

---

### Regression Check

No regressions detected. Specifically:
- No new values were introduced that contradict the PDF
- All footnote references remain internally consistent
- Total communication values were correctly recomputed after download corrections (e.g., MulPIR total: 122 + 119 = 241 kB)
- The fix to [^22] in DistributionalPIR is consistent with [^32], which already had the correct vs.-no-batching figures (10-195x, 4.8-9.7x)

---

### Summary

| Fix | Scheme | Verdict |
|-----|--------|---------|
| Fix 1 | KeywordPIR | VERIFIED |
| Fix 2 | KeywordPIR | VERIFIED |
| Fix 3 | KeywordPIR | VERIFIED |
| Fix 4 | KeywordPIR | VERIFIED |
| Fix 5 | KeywordPIR | VERIFIED |
| Fix 6 | KeywordPIR | VERIFIED |
| Fix 7 | KeywordPIR | VERIFIED |
| Fix 8 | KeywordPIR | VERIFIED |
| Fix 9 | KeywordPIR | VERIFIED |
| Fix 10 | KeywordPIR | VERIFIED |
| Fix 1 | DistributionalPIR | VERIFIED |
| Fix 2 | DistributionalPIR | VERIFIED |
| Column-shift persistent issue | KeywordPIR | ALL CELLS FIXED |

**Overall Verdict: PASS**

All 12 fixes (13 discrete edits) are correct, complete, and introduce no regressions. The cross-pass persistent column-shift issue in SealPIR Table 3 data is fully resolved across both the Performance Benchmarks and Complexity tables.
