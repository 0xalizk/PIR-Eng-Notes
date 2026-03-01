## SinglePass (2024) — 3rd Pass Fact-Check

**Notes:** `SinglePass_2024_notes.md`
**PDF:** `SinglePass_2024_303.pdf`
**Claims checked:** 60 | **Issues found:** 2 | **Minor:** 2 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[^15] — Wrong page reference for Theorem 3.1**

Notes text (Key Data Structures):
> `[^15]: Theorem 3.1 (p.9 and p.16): "The client stores a state with O(N log N + (N/Q) * w) bits."`

PDF: Theorem 3.1 is stated on **p.8** (Section 3.2, "Our Scheme"), not p.9. The exact bullet reads: "The client stores a state with O(N log N + (N/Q)·w) bits." Page 9 contains only Figure 3 (the scheme pseudocode), which does not include this complexity statement. The Appendix A restatement is correctly on p.16.

Correction: should read `Theorem 3.1 (p.8 and p.16)`.

---

**[^29] — Wrong page reference for Theorem 3.1**

Notes text (Preprocessing metrics table):
> `[^29]: Theorem 3.1 (p.9): "The server stores only DB."`

PDF: As above, Theorem 3.1 is on **p.8**, not p.9. The bullet "The server stores only DB." appears in the Theorem 3.1 statement on p.8, and is restated in Appendix A on p.16.

Correction: should read `Theorem 3.1 (p.8)` (or `p.8 and p.16` if including the Appendix restatement).

---

### Reviewer Verdict

**Summary:** Both reported issues are CONFIRMED. No false positives. Summary counts stand as stated (2 minor, 0 incorrect).

---

**[^15] — CONFIRMED**

The PDF (p.8, Section 3.2) shows Theorem 3.1 beginning near the bottom of the page, with its bullet points — including the client storage complexity — present there. Page 9 is entirely occupied by Figure 3's pseudocode box and its caption ("Figure 3: Our main scheme."); no Theorem 3.1 text appears on p.9. The notes cite `p.9 and p.16` but the correct primary citation is `p.8 and p.16`. The error is a genuine off-by-one page reference. The technical content of the claim is correct. Severity: Minor.

**[^29] — CONFIRMED**

Same underlying error. The notes cite `Theorem 3.1 (p.9)` for the bullet "The server stores only DB." but Theorem 3.1 — including this bullet — is on p.8, not p.9. This is internally inconsistent with footnote [^4] in the same notes file, which correctly cites `Theorem 3.1 (p.8–9)` (spanning both pages only because the theorem begins at the bottom of p.8 and Figure 3, referenced within the theorem statement, appears on p.9). The "server stores only DB" bullet itself is on p.8. Severity: Minor.
