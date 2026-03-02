## SealPIR (2018) — 3rd Pass Fact-Check

**Notes:** `sealpir_2018_notes.md`
**PDF:** `SealPIR_2017_1142.pdf`
**Claims checked:** 41 | **Issues found:** 5 | **Minor:** 2 | **Incorrect:** 3

---

### INCORRECT Findings

**1. Comparison table — XPIR (d=3) query size wrong database size row**

Notes ("Comparison with Prior Work" table):
> Query size (n=2^20): XPIR (d=3) = 2,560 KB

Figure 9 (p. 11) for XPIR (d=3):
- n=65,536: 1,632 KB
- n=262,144: 2,560 KB
- n=1,048,576: **4,064 KB**

The value 2,560 KB belongs to n=262,144 (2^18), not n=1,048,576 (2^20). The correct figure for n=2^20 is **4,064 KB**.

---

**2. Comparison table — XPIR (d=3) client Query CPU wrong database size row**

Notes ("Comparison with Prior Work" table):
> Client Query CPU: XPIR (d=3) = 8.03 ms

Figure 9 (p. 11) for XPIR (d=3):
- n=262,144: 8.03 ms
- n=1,048,576: **12.74 ms**

The 8.03 ms value is from n=262,144, not n=1,048,576. The correct figure for n=2^20 is **12.74 ms**. This error is consistent with error #1 — multiple XPIR (d=3) values in the comparison table appear to have been read from the n=262,144 row of Figure 9 instead of the n=1,048,576 row.

---

**3. Comparison table — XPIR (d=3) server CPU does not match Figure 9**

Notes ("Comparison with Prior Work" table):
> Server CPU (n=2^20): XPIR (d=3) = 3.68 s

Figure 9 (p. 11) for XPIR (d=3) at n=1,048,576: Setup = 2.32 s + Answer = 2.52 s = **4.84 s** total. The figure 3.68 s does not correspond to any row in Figure 9 for XPIR (d=3). (For XPIR d=2, n=1,048,576: Setup=2.27 + Answer=2.12 = 4.39 s, also not 3.68 s.)

---

### MINOR Issues

**4. [^9] wrong page reference for expansion factor formula**

Notes footnote [^9]:
> Section 3 (FV background preamble), **p. 4**. F = 2 * log(q) / log(t).

The expansion factor formula F = 2log(q)/log(t) and the F ≥ 6.4 security bound appear in the FV background preamble of Section 3 on **p. 3** (left column), not p. 4. Section 3.3 begins on p. 4 but the FV preamble containing this formula is on p. 3.

---

**5. [^8] quote has inverted word order compared to PDF**

Notes footnote [^8] quotes:
> "While plaintext multiplication yields a multiplicative increase in the noise, the factor is always 1 **in EXPAND** (i.e., no noise growth) because it is based on the number of non-zero coefficients in the plaintext [28, Section 6.2]."

Figure 2 caption (p. 3) actually reads:
> "While plaintext multiplication yields a multiplicative increase in the noise, the factor is always 1 (i.e., no noise growth) **in EXPAND** because it is based on the number of non-zero coefficients in the plaintext [28, §6.2]."

The phrase "in EXPAND" appears after "(i.e., no noise growth)" in the PDF, but the notes move it before the parenthetical. The citation format also differs: notes write "Section 6.2" where the PDF uses "§6.2" — minor formatting difference consistent with the notes' style elsewhere.

---

### Reviewer Verdict

**Summary after review:** All 5 findings confirmed. No false positives. Counts stand: **Incorrect: 3 | Minor: 2**.

---

**Finding 1 — XPIR (d=3) query size wrong row: CONFIRMED**

Figure 9 (p. 11) is unambiguous. The XPIR (d=3) network query row reads 1,632 / 2,560 / 4,064 KB for n = 65,536 / 262,144 / 1,048,576 respectively. The notes table entry of 2,560 KB for n=2^20 is the n=2^18 value. The correct figure for n=1,048,576 is **4,064 KB**. Incorrect.

**Finding 2 — XPIR (d=3) client Query CPU wrong row: CONFIRMED**

Figure 9 (p. 11) XPIR (d=3) client QUERY row reads 4.98 / 8.03 / 12.74 ms. The notes table entry of 8.03 ms for n=2^20 is the n=2^18 value. The correct figure for n=1,048,576 is **12.74 ms**. Consistent with Finding 1 — the same off-by-one row error affects multiple XPIR (d=3) entries. Incorrect.

**Finding 3 — XPIR (d=3) server CPU does not match Figure 9: CONFIRMED**

Figure 9 (p. 11) XPIR (d=3) server CPU at n=1,048,576: Setup=2.32 s, Answer=2.52 s, total=4.84 s. The value 3.68 s does not appear anywhere in the XPIR (d=3) column at any database size. It is also not the Answer-only figure (2.52 s) nor any partial sum visible in the table. The notes value is unattested. Incorrect.

**Finding 4 — [^9] page reference p. 4 should be p. 3: CONFIRMED**

The expansion factor formula F = 2log(q)/log(t) and the security bound F ≥ 6.4 appear in the Fan-Vercauteren background preamble on p. 3 (right column), clearly before Section 3.1 "Compressing queries." Section 3.3 begins on p. 4. The footnote citing p. 4 is off by one page. Minor.

**Finding 5 — [^8] "in EXPAND" word order inverted vs PDF: CONFIRMED**

Figure 2 caption (p. 3) reads: "the factor is always 1 (i.e., no noise growth) in EXPAND because..." The notes footnote transposes "in EXPAND" to before the parenthetical. The inverted order is a genuine transcription error. The technical meaning is not materially altered, so Minor classification is appropriate.
