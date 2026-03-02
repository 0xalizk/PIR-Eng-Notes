## DistributionalPIR (2025) — 3rd Pass Fact-Check

**Notes:** `DistributionalPIR_2025_notes.md`
**PDF:** `DistributionalPIR_2025_132.pdf`
**Claims checked:** 47 | **Issues found:** 3 | **Minor:** 2 | **Incorrect:** 1 | **Rejected (false positives):** 1 | **Confirmed issues:** 2

---

### INCORRECT Findings

**[^22] — SimplePIR performance improvement attributed to wrong comparison baseline**

Notes text (Compiler Interface table and footnote):
> "5-77x less server work, 4.8-9.7x less communication vs. no batching"

PDF p. 11 (Section 7.2.1, Performance results):
> "our construction increases the queries-per-second by 10–195× and reduces communication by 4.8–9.7× compared to the baseline that doesn't use batch codes. Compared against batch codes, our construction increases the queries-per-second by 5.1–77× and reduces communication by 8.1–95×."

The 5.1–77x figure is the improvement vs. batch codes, not vs. no batching. The vs.-no-batching figures are 10–195x (queries/sec) and 4.8–9.7x (communication). The notes mix these two comparisons: they pair the 5-77x number (which is vs. batch codes) with the 4.8–9.7x number (which is vs. no batching), and attribute the combined pair to the "vs. no batching" baseline. This is factually incorrect. Footnote [^32] gives the correct vs.-no-batching figures (10-195x, 4.8-9.7x) but the Compiler Interface table and [^22] still contain the wrong attribution for the 5-77x number.

---

### MINOR Issues

**[^38] — Off-by-one page reference for Section 3**

Notes text:
> "Section 3 / Section 4.1 (p. 3, 6)"

PDF: Section 3 ("Constructing distributional PIR") begins on p. 4 (right column), not p. 3. Section 4.1 is correctly cited at p. 6. The "p. 3" reference is one page off.

---

**Deployment Strategies table — "Construction 3.2 (download top-k)" conflates two distinct rows**

Notes text (Section 12, Deployment Strategies table):
> First row labelled "Construction 3.2 (download top-k)"

PDF Table 1 (p. 7): "Construction 3.2" and "Download Top-k" are two separate rows with different parameter sizes, per-query communication, and per-query server runtime. The table caption clarifies that "Download Top-k" refers to the construction with the optimization from Theorem 3.4, which is distinct from base Construction 3.2. The notes' parenthetical "(download top-k)" implies they are the same entry, which is incorrect — the notes' table collapses what the PDF presents as two separate rows into one.

---

### Reviewer Verdict

**Updated counts after review: 1 INCORRECT confirmed | 1 MINOR confirmed | 1 REJECTED (false positive)**

---

**[^22] — SimplePIR performance improvement attributed to wrong comparison baseline**

CONFIRMED — INCORRECT.

The PDF p. 11 gives two separate comparisons: "10–195x queries/sec and 4.8–9.7x communication vs. no batching" and "5.1–77x queries/sec and 8.1–95x communication vs. batch codes." The notes table (Compiler Interface, Instantiations row for SimplePIR) and footnote [^22] pair the 5-77x figure (which belongs to the vs.-batch-codes comparison) with the 4.8–9.7x figure (which belongs to the vs.-no-batching comparison), and the table cell labels the combined pair as "vs. no batching." This is a genuine mixed-baseline error. Footnote [^32] correctly records the vs.-no-batching pair (10–195x, 4.8–9.7x), but [^22] and the Compiler Interface table still contain the incorrect pairing. Severity: INCORRECT, as reported.

---

**[^38] — Off-by-one page reference for Section 3**

CONFIRMED — MINOR.

The PDF confirms that Section 3 "Constructing distributional PIR" begins at the top of p. 4 (right column), not p. 3. Page 3 ends with Section 2.1 content (correctness definitions). The footnote's "p. 3, 6" citation for "Section 3 / Section 4.1" is one page off for the Section 3 reference; p. 6 for Section 4.1 is correct. Severity: MINOR, as reported.

---

**Deployment Strategies table — "Construction 3.2 (download top-k)" conflates two distinct rows**

REJECTED — FALSE POSITIVE.

The fact-checker claims the notes collapse "Construction 3.2" and "Download Top-k" into a single row. This is incorrect. The notes table (Section 12) contains all four rows from PDF Table 1, each with distinct values: "Construction 3.2 (download top-k)" has params `log N * cdf_P^{-1}(...)`, comm Q, runtime R; "Download top-k" has params `(log N + l) * cdf_P^{-1}(...)`, comm `Q - (1-kappa_worst)*C(...)`, runtime `R - (1-kappa_worst)*l*cdf_P^{-1}(...)`. The values match the PDF and the rows are not merged. The only issue is the imprecise parenthetical label "(download top-k)" appended to the Construction 3.2 row name, which is an annotation quirk but does not constitute a structural conflation. No data is missing or merged. This finding should be removed from the report; the MINOR and INCORRECT counts are unaffected.
