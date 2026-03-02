## Pirouette (2025) — 3rd Pass Fact-Check

**Notes:** `Pirouette_2025_notes.md`
**PDF:** `Pirouette_2025_680.pdf`
**Claims checked:** 52 | **Issues found:** 6 | **Minor:** 4 | **Incorrect:** 2

---

### INCORRECT Findings

**1. Correctness Analysis table — LWEtoRGSW noise formula (no footnote; Correctness Analysis section, table row "After LWEtoRGSW (Phase 0)")**

Notes state:
> "sigma^2_C <= N * (L^2/4) * (sigma^2_br + sigma^2_cext + sigma^2_sq)"

Theorem A.13 (p.21) states:
> "sigma^2_C <= N · (||s||_inf^2 / 4) · (sigma^2_br + sigma^2_cext) + sigma^2_sq"

Two errors in the table entry: (a) the coefficient is ||s||_inf^2/4, not L^2/4 (L is the gadget basis, ||s||_inf is the infinity norm of the secret key); (b) sigma^2_sq is an additive term outside the product, not a third term inside the parentheses being multiplied by N·||s||_inf^2/4.

Note: the LWEtoRGSW section further down in the same notes file correctly states the formula as "N * (||s||_inf^2 / 4) * (sigma^2_br + sigma^2_cext) + sigma^2_sq (Theorem A.13, p.21)" (footnote [^29]). The Correctness Analysis table is internally inconsistent with the LWEtoRGSW section and wrong relative to Theorem A.13.

---

**2. Table 7 (reproduced) — T-Respire query size at 2^20 x 256 B**

Notes table (sequential execution, 2^20 x 256 B row) states T-Respire Query Size as:
> "55 B"

Table 7 (p.11) shows T-Respire query size at 2^20 x 256 B as:
> "144 B"

The value 55 B belongs to Pirouette^H at the same database size, not to T-Respire. The T-Respire column for 2^20 has been given the Pirouette^H value.

---

### MINOR Issues

**3. [^7] — Theorem A.22 page reference**

Notes state:
> "Definition A.21 (p.25) and Theorem A.22 (p.25--26)"

Theorem A.22 (Security of Pirouette) is on p.26 only; it does not begin on p.25. The correct reference is p.26.

---

**4. [^42] — Theorem A.22 page reference**

Notes state:
> "Theorem A.22 (p.25)"

Theorem A.22 is on p.26, not p.25. (Same error as [^7], appearing independently in a second footnote.)

---

**5. [^41] — Section 5.3 page reference**

Notes state:
> "Section 5.3 (p.13): 'Pirouette shares the same theoretical objective as transciphering to reduce client-to-server communication, and does not consider the server-to-client direction.'"

This passage appears on p.12 (in the "Asymmetric online communication" subsection of Section 5.3 "Comparison with Respire and T-Respire"), not p.13. Section 5.3 spans pp.10--12; the cited sentence is on p.12.

---

**6. [^5] — Source location of "increases the query size from 36 B to 60 B"**

Notes attribute to "Section 4.2 (p.9)" the phrasing:
> "This increases the query size from 36 B to 60 B."

This exact sentence appears in Section 1.1 (p.2), not Section 4.2. Section 4.2 (p.9) does discuss the Pirouette^H query construction and confirms the (n+1)-th components are transmitted with a PRG seed, but the "36 B to 60 B" formulation is in Section 1.1.

---

### Reviewer Verdict

**Summary after review:** All 6 findings are confirmed. No false positives. Counts unchanged: 2 Incorrect, 4 Minor.

---

**Issue 1 — LWEtoRGSW noise formula in Correctness Analysis table: CONFIRMED INCORRECT**

Theorem A.13 (p.21) is unambiguous. The theorem statement reads:

> sigma^2_C <= N · (||s||_inf^2 / 4) · (sigma^2_br + sigma^2_cext) + sigma^2_sq

The notes table ("After LWEtoRGSW (Phase 0)" row) writes L^2/4 in place of ||s||_inf^2/4, and places sigma^2_sq inside the parentheses as a third addend multiplied by N·(L^2/4), rather than as a standalone additive term outside the product. Both errors are present and clear from the theorem image. The LWEtoRGSW section lower in the same notes file gives the correct formula (footnote [^29]), confirming the table entry is internally inconsistent and wrong relative to the PDF.

---

**Issue 2 — T-Respire query size at 2^20 x 256 B: CONFIRMED INCORRECT**

Table 7 (p.11) shows T-Respire query size at 2^20 x 256 B as 144 B. The notes table records 55 B for that cell. 55 B is the Pirouette^H query size at 2^20 x 256 B — the T-Respire and Pirouette^H values have been swapped in the notes for that row. The correct T-Respire value (144 B) appears in the adjacent column of Table 7.

---

**Issue 3 — [^7] Theorem A.22 page reference "p.25--26": CONFIRMED MINOR**

Footnote [^7] cites "Definition A.21 (p.25) and Theorem A.22 (p.25--26)". Definition A.21 is on p.25 (confirmed). Theorem A.22 begins at the very top of p.26 and is entirely contained on p.26; it does not appear on p.25. The range "p.25--26" for Theorem A.22 is inaccurate. The correct reference is p.26 only. Severity is minor because the combined range already covers the right page — p.26 is included — but the implication that the theorem spans or starts on p.25 is wrong.

---

**Issue 4 — [^42] Theorem A.22 page reference "p.25": CONFIRMED MINOR**

Footnote [^42] cites "Theorem A.22 (p.25)". Theorem A.22 is on p.26, not p.25. Off-by-one confirmed independently of Issue 3.

---

**Issue 5 — [^41] Section 5.3 page reference "p.13": CONFIRMED MINOR**

The sentence "Pirouette shares the same theoretical objective as transciphering to reduce client-to-server communication, and does not consider the server-to-client direction" appears in the "Asymmetric online communication" subsection of Section 5.3 on p.12 of the PDF, not p.13. P.13 contains Section 5.4 ("Holistic performance comparison") and Section 6 ("Conclusion"). The off-by-one is confirmed.

---

**Issue 6 — [^5] source location "Section 4.2 (p.9)": CONFIRMED MINOR**

The exact sentence "This increases the query size from 36 B to 60 B" appears on p.2 in Section 1.1 ("Technical overview"), confirmed from the PDF image. Section 4.2 discusses Pirouette^H query construction but does not contain this specific formulation. The notes correctly quote the sentence but misattribute it to Section 4.2 (p.9) instead of Section 1.1 (p.2).
