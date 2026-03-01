## NPIR (2026) — 3rd Pass Fact-Check

**Notes:** `NPIR_2026_notes.md`
**PDF:** `NPIR_2026_2257.pdf`
**Claims checked:** 35 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[^29] Wrong page reference**

Notes text: "Section 1.1 (p.4): 'Limitation: query size in communication. ... it is 2.16 times greater than Spiral, primarily due to a query size that is 5.25 times larger, whereas the response size is only 1.78 times larger.'"

PDF: The entire Limitation subsection — including the quoted sentence — appears on p.3, not p.4. The Limitation heading and its full text ("Our solution requires more online communication: it is 2.16 times greater than Spiral, primarily due to a query size that is 5.25 times larger, whereas the response size is only 1.78 times larger. The large query size is particularly the result of NTRU-based GSW-like encryption...") are all on p.3, still within Section 1.1. Section 1.2 begins at the bottom of p.3.

Correction: `Section 1.1 (p.3)`.

---

**[^34] Wrong page reference**

Notes text: "Section 1.1 (p.4): Limitation discussion of query size."

PDF: The quoted open-problem text — "The large query size is particularly the result of NTRU-based GSW-like encryption consisting of a vector of NTRU encodings, and reducing the size of this encryption or the entire query message deserves further exploration" — is the concluding sentence of the Limitation subsection, which is entirely on p.3. This footnote references the same passage as [^29] and carries the same wrong page number.

Correction: `Section 1.1 (p.3)`.

---

**[^16] Inaccurate quotation**

Notes text (footnote): "Section 4.1 (p.12): 'the server converts the database format (polynomial encoding + NTT conversion).'"

PDF (Section 4.1, p.12): "the server performs database setup (polynomial encoding + NTT conversion)."

The quoted text replaces "performs database setup" with "converts the database format." The parenthetical "(polynomial encoding + NTT conversion)" is verbatim, but the surrounding words do not match. The page reference (p.12) and section (4.1) are correct.

Correction: Replace the quotation with the actual PDF wording: 'the server performs database setup (polynomial encoding + NTT conversion).'

---

### Reviewer Verdict

**[\[^29\]](../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md#user-content-fn-29) — CONFIRMED**

The "Limitation: query size in communication" subsection — containing the sentence "it is 2.16 times greater than Spiral, primarily due to a query size that is 5.25 times larger, whereas the response size is only 1.78 times larger" — appears in full on PDF p.3. Section 1.2 begins at the bottom of that same page. The notes cite p.4, which is wrong. Severity: Minor (correct section, wrong page number).

**[\[^34\]](../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md#user-content-fn-34) — CONFIRMED**

The concluding sentence of the Limitation subsection ("The large query size is particularly the result of NTRU-based GSW-like encryption consisting of a vector of NTRU encodings, and reducing the size of this encryption or the entire query message deserves further exploration") is on p.3, not p.4. The footnote body cites p.4. Same wrong-page error as [^29], referencing the same passage. Severity: Minor (correct section, wrong page number).

**[\[^16\]](../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md#user-content-fn-16) — CONFIRMED**

PDF p.12 (Section 4.1, "Explicit overhead") reads verbatim: "the server performs database setup (polynomial encoding + NTT conversion)." The notes footnote renders this as "the server converts the database format (polynomial encoding + NTT conversion)" — substituting "performs database setup" with "converts the database format." The parenthetical is exact but the surrounding prose is a paraphrase, not a quotation. Page and section references are correct. Severity: Minor (paraphrase presented as direct quote; technical meaning is close but wording does not match).

---

**Updated summary:** 3 issues reviewed — 3 CONFIRMED, 0 REJECTED. All three are Minor; original counts stand (Minor: 3, Incorrect: 0).
