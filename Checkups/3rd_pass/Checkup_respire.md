## Respire (2024) — 3rd Pass Fact-Check

**Notes:** `Respire_2024_notes.md`
**PDF:** `Respire_2024_1165.pdf`
**Claims checked:** 47 | **Issues found:** 4 | **Minor:** 3 | **Incorrect:** 1 | **Rejected:** 1

---

### INCORRECT Findings

**[^6] / Cryptographic Foundation table — Correctness condition formula**

Notes (table row):
> "Pr[fail] <= 1 - 2\*d2\*n_vec \* exp(-pi\*(q3/(2p) - B_final)^2 / sigma_resp^2)"

The formula "1 - 2\*d2\*n_vec \* exp(...)" is the **success probability lower bound**, not the failure probability upper bound. Eq. D.5 (p.49) bounds success:

> Pr[∀k ∈ [T] : resp_k = r_{α_k,β_k,γ_k}] ≥ 1 − 2d₂ n_vec exp(−π(q₃/(2p) − B_final)² / σ²_resp)

So the failure probability is:

> Pr[fail] ≤ 2\*d2\*n_vec \* exp(−π(q3/(2p) − B_final)² / σ²_resp)

The notes themselves correctly state this in the Correctness Analysis section bullet point (without the erroneous leading "1 -"), which confirms the table entry is wrong. The "1 -" should not appear in the failure bound formula.

---

### MINOR Issues

**1. [^14] — Quote location mis-attributed to Section 4.2 (p.18)**

Notes footnote:
> Section 4.2 (p.18): "Notably, in Respire, the total communication is smaller than the size of even a single RLWE ciphertext in previous schemes."

The exact phrasing "smaller than the size of even a single RLWE ciphertext in previous schemes" does not appear on p.18. Page 18 says: "the *total* online communication in Respire is smaller than the size of a single element of R_{d₁,q₁}." The verbatim phrasing quoted in the footnote appears on p.2: "the *total* communication is smaller than the size of even a single RLWE ciphertext in previous schemes." The footnote should cite p.2 (or the introduction) rather than Section 4.2 (p.18).

**2. [^28] — Remark 3.5 page reference off by one**

Notes footnote:
> Section 3.2 (p.12-13) and Remark 3.5 (p.16)

Remark 3.5 begins on p.15 of the PDF (not p.16). Its heading and opening text appear at the bottom of p.15, continuing onto p.16.

**3. [^31] — Quoted text is on p.2, not p.1**

Notes footnote:
> Section 1 (p.1) and Remark 2.2 (p.4): "Respire is well-suited for applications where the client is making a handful of queries simultaneously (e.g., blocklist lookup or DNS queries)."

The exact phrase "handful of queries simultaneously (e.g., blocklist lookup or DNS queries)" appears in the Batch queries paragraph on p.2 (under Section 1.1 or the batch discussion), not on p.1. Remark 2.2 on p.4 defines Batch PIR but does not contain this phrase. The page reference should be p.2.

**4. Total pages breakdown — "31 pages of appendices A-E" is inaccurate**

Notes header table:
> Total pages: 54 (23 main body + 31 pages of appendices A-E)

Appendix A begins on p.28 and Appendix E ends on p.54, giving 27 pages of appendices (pp.28–54). References occupy pp.23–27 (5 pages). The arithmetic 23 + 31 = 54 suggests "31 pages" is meant to cover references + appendices together, but labelling that block "appendices A-E" is inaccurate. The correct breakdown is: 23 pages main body + 5 pages references + 27 pages appendices A–E = 55 pages total, or (if p.23 is split) 54 total — but in any case, "31 pages of appendices A-E" overcounts the appendices alone by 4 pages.

---

### Reviewer Verdict

**Updated counts after review: Issues found: 4 | Minor: 3 | Incorrect: 1** (one minor issue rejected as false positive — see issue 2 below)

---

**INCORRECT — [^6] Correctness condition formula: CONFIRMED**

Verified directly against Eq. D.5 on p.50. The equation is a success probability lower bound written as:

> Pr[∀k ∈ [T] : resp_k = r_{α_k,β_k,γ_k}] ≤ 1 − 2d₂n_vec exp(−π(q₃/2p − B_final)²/σ²_resp)

The correct failure upper bound omits the "1 −" prefix entirely: Pr[fail] ≤ 2·d₂·n_vec·exp(…). The notes' own Correctness Analysis section (line citing Eq. D.5) states it correctly without the "1 −", confirming the table entry has the wrong form. Severity: INCORRECT, confirmed.

---

**MINOR 1 — [^14] Quote mis-attributed to p.18: CONFIRMED**

Verified p.18 text from the PDF. Page 18 reads "the *total* online communication in Respire is smaller than the size of a single element of R_{d₁,q₁}" — no mention of "even a single RLWE ciphertext in previous schemes." The verbatim phrase from the footnote appears on p.2 in the introductory discussion. The page citation in [^14] is wrong; should be p.2 not p.18. Severity: MINOR, confirmed.

---

**MINOR 2 — [^28] Remark 3.5 page reference: REJECTED (false positive)**

The fact-checker claims Remark 3.5 begins at the bottom of p.15. This is incorrect. The PDF images show that p.15 ends in the middle of the Construction 3.3 bullet list (the Extract bullet). Page 16 opens with a transitional sentence ("We describe how to instantiate the underlying parameters…"), then Remark 3.4, then Remark 3.5 in full. Remark 3.5 is entirely on p.16. The notes' citation of p.16 is correct. The fact-checker's "off by one" finding is a false positive.

---

**MINOR 3 — [^31] Quoted text on p.2, not p.1: CONFIRMED**

Verified against the PDF. The phrase "Respire is well-suited for applications where the client is making a handful of queries simultaneously (e.g., blocklist lookup or DNS queries)" appears in the "Batch queries" paragraph on p.2, not p.1. The notes cite "Section 1 (p.1)" which is one page off. Severity: MINOR, confirmed.

---

**MINOR 4 — "31 pages of appendices A-E" is inaccurate: CONFIRMED**

Verified page structure from the PDF. References run pp.23–27 (5 pages). Appendix A begins on p.28 and the document ends on p.54, so appendices A–E span 27 pages, not 31. The label "31 pages of appendices A-E" overcounts by 4 pages; the 31-page figure actually covers references + appendices combined. Severity: MINOR, confirmed.
