## IncPIR (2021) — 3rd Pass Fact-Check

**Notes:** `IncPIR_2021_notes.md`
**PDF:** `IncPIR_2021_1438.pdf`
**Claims checked:** 56 | **Issues found:** 4 | **Minor:** 3 | **Incorrect:** 1

---

### INCORRECT Findings

**1. Response size concrete value — wrong parameter context**

Notes (Complexity, Core metrics table):

> "Response size | O(b) | 2 KB (optimal) | Online"

The column header explicitly states "Concrete (N=2^20, b=32B)". For b=32 bytes, the optimal response is 32 bytes, not 2 KB. The "2 KB" figure comes from the PIR-Tor evaluation scenario where b=2 KB (Tor relay descriptors), not from the microbenchmark scenario the column purports to describe.

PDF (p.13, Section 8.2): "The size of each server's reply is optimal for all three schemes and consists of the size of a data element (2KB)." — this 2 KB figure is specific to the PIR-Tor experiment with 7K Tor relays. The microbenchmark section (p.13, Figure 9) uses b=32 bytes throughout.

The concrete value in the complexity table should be "32 B (optimal)" to match b=32B, or the column header should indicate the PIR-Tor parameters (b=2KB).

---

### MINOR Issues

**1. [^52] — Added word "incremental" in Open Problems quote**

Notes (Open Problems section, "Single-server incremental preprocessing"):

> "designing efficient incremental preprocessing for single-server PIR remains an open question (existing schemes rely on obfuscation)."[^52]

PDF (p.14, Section 9):

> "designing efficient preprocessing for single-server PIR remains an open question (existing schemes rely on obfuscation [15, 18, 23])."

The notes insert the word "incremental" before "preprocessing," which does not appear in the source sentence. The paper says "efficient preprocessing," not "efficient incremental preprocessing." This changes the meaning slightly (the paper's phrasing is about preprocessing in general for single-server PIR, not specifically incremental preprocessing).

---

**2. [^32] — Wrong section reference (correct page)**

Notes [^32]:

> "Section 6.2 (p.14): 'the client can preprocess the database from scratch when the local storage becomes too high.'"

PDF: The quoted sentence appears on p.14, in the analysis of Figure 12b: "Furthermore, the client can preprocess the database from scratch when the local storage becomes too high." This is in Section 8.3 / the Figure 12b discussion, not in Section 6.2. Section 6.2 ("Online query and refresh") is on p.11 and does not contain this sentence. The page number (p.14) is correct but the section citation (Section 6.2) is wrong.

---

**3. Inline reference "p.8" for Definition 4 inconsistent with footnote "p.7-8"**

Notes body (Novel Primitives section, Incremental PRS table, Interface/Operations row):

> "Gen(1^λ, n) -> (k, aux)... (Definition 4, p.8)"

Notes footnote [^9]:

> "Definition 4 (p.7-8): Formal definition of incremental PRS with Gen, Add, Eval."

PDF: Definition 4 begins in the right column of page 7 ("Definition 4. An incremental PRS with set size s consists of the following three algorithms:") and continues onto page 8. The footnote "p.7-8" is correct. The inline citation "p.8" alone is slightly off — the definition begins on p.7. These two references within the same notes file are inconsistent with each other, and the inline one gives the wrong starting page.

---

### Reviewer Verdict

**Summary:** All 4 findings confirmed. No false positives. Original counts stand: 1 Incorrect, 3 Minor.

---

**INCORRECT Finding 1 — Response size "2 KB" in the N=2^20, b=32B concrete column: CONFIRMED**

Verified directly from PDF p.13. Figure 9 (the microbenchmark table) covers only Prep, Query, Refresh, IncPrep timings and communication — it does not include a "Response size" row. The 2 KB figure comes exclusively from the PIR-Tor paragraph on p.13, Section 8.2: "The size of each server's reply is optimal for all three schemes and consists of the size of a data element (2KB)." That sentence is unambiguously about the PIR-Tor experiment where b=2 KB (7K Tor relay descriptors). The notes' Core metrics table column header reads "Concrete (N=2^20, b=32B)". For b=32 bytes the response size is 32 bytes, not 2 KB. The wrong-parameter-context error is real and the magnitude of the discrepancy is 64x (2048 B vs 32 B). Severity: **Incorrect**, confirmed.

---

**MINOR Issue 1 — [^52] inserts "incremental" into the Section 9 quote: CONFIRMED**

Verified from PDF p.14, Section 9. The paper reads: "designing efficient preprocessing for single-server PIR remains an open question (existing schemes rely on obfuscation [15, 18, 23])." The notes render this as "designing efficient incremental preprocessing for single-server PIR." The word "incremental" does not appear in the source sentence. The insertion is not neutral: the paper's statement is about preprocessing in general for single-server PIR, whereas the notes version narrows it to incremental preprocessing specifically. Severity: **Minor**, confirmed.

---

**MINOR Issue 2 — [^32] cites Section 6.2 but sentence is in the Section 8.3 / Figure 12b discussion: CONFIRMED**

Verified from PDF pp.11 and 14. Section 6.2 ("Online query and refresh") occupies p.11 and does not contain the sentence in question. The sentence "Furthermore, the client can preprocess the database from scratch when the local storage becomes too high." appears on p.14 in the Figure 12b analysis paragraph, which is part of Section 8.3 (offline performance and costs). The page number p.14 in the footnote is correct; the section label "Section 6.2" is wrong. Severity: **Minor**, confirmed.

---

**MINOR Issue 3 — Inline citation "(Definition 4, p.8)" inconsistent with footnote [^9] "p.7-8": CONFIRMED**

Verified from PDF p.7. Definition 4 ("An incremental PRS with set size s consists of the following three algorithms:") begins in the right column of p.7 and runs over onto p.8. The footnote [^9] citing "p.7-8" is correct. The inline body citation "(Definition 4, p.8)" gives only the continuation page and omits the starting page, making it a slightly wrong page reference and inconsistent with the correct footnote in the same file. Severity: **Minor**, confirmed.
