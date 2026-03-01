## YPIR (2024) — 3rd Pass Fact-Check

**Notes:** `YPIR_2024_notes.md`
**PDF:** `YPIR_2024_270.pdf`
**Claims checked:** 45 | **Issues found:** 4 | **Minor:** 2 | **Incorrect:** 2

---

### INCORRECT Findings

**1. Complexity table: YPIR response size listed as 32 MB instead of 12 KB**

Notes (Complexity section, "Core metrics" table):
> `| Response size | O(d^2 * kappa * log q-hat / d2) | 32 MB (download) | Online |`

PDF Table 2 (p.20): At 32 GB, YPIR Download = **12 KB**. The 32 MB figure is DoublePIR's download at 32 GB, not YPIR's. This error is internally contradicted by the same note's own [^14]: "Table 2 (p.20): At 32 GB, YPIR achieves 2.5 MB upload, **12 KB download**..." YPIR's download is fixed at 12 KB regardless of database size (it is independent of DB size by construction). The value 32 MB should be 12 KB.

---

**2. Complexity table: YPIR query size listed as 724 KB instead of 2.5 MB for 32 GB**

Notes (Complexity section, "Core metrics" table):
> `| Query size | O(sqrt(N) * log q / log p + d * log d * log q) | 724 KB (upload) | Online |`

The table header specifies "Concrete (32 GB, 1-bit records)." PDF Table 2 (p.20): YPIR upload at 32 GB = **2.5 MB**. The value 724 KB does not match YPIR at any database size in Table 2 (YPIR: 1 GB = 846 KB, 8 GB = 1.5 MB, 32 GB = 2.5 MB). The value 724 KB is SimplePIR's upload at 32 GB (and also SimplePIR's offline hint download). This is a wrong-scheme attribution. The concrete value should be 2.5 MB. This error is also contradicted by [^14] in the same notes.

---

### MINOR Issues

**3. [^17] Page reference off by one: "p.5" should be "p.4"**

Notes [^17]:
> `Section 1.2 (p.5): "RLWE decreases the expansion factor from (n+1)*log q/log p to 2*log q/log p. For concrete values of n ~ 2^{10}, this is a 1000x reduction."`

PDF: This text appears in the "Packing the DoublePIR responses" subsection of Section 1.2 on **p.4**, not p.5. Section 1.2 ("Overview of YPIR") begins on p.4, and the quoted passage is within the first column of p.4. Page 5 begins with a different topic ("Supporting large records"). The section label "Section 1.2" is correct; the page number should be p.4.

---

**4. [^42] Section reference wrong: "Section 3" should be "Section 2.1"**

Notes [^42]:
> `Section 3 (p.10): "Pseudorandomness thus relies on a 'circular security' assumption."`

PDF: This sentence appears on p.10 in the **"Security"** paragraph that follows Construction 2.8 and Theorem 2.9, which is within **Section 2.1** ("LWE-to-RLWE Packing"), a subsection of Section 2 ("Preliminaries"). Section 3 ("The YPIR Protocol") does not begin until p.11. The page number p.10 is correct; the section label should be Section 2.1 (or Section 2).

---

### Reviewer Verdict

**Issue 1 — CONFIRMED (Incorrect)**

Table 2 (p.20) is unambiguous: at 32 GB, the YPIR Download row reads **12 KB**. The 32 MB figure is DoublePIR's download at 32 GB — an adjacent row in the same table. The notes' own [^14] states "12 KB download" for YPIR at 32 GB, making the complexity table internally self-contradicting. This is a genuine table row misattribution. No false positive.

**Issue 2 — CONFIRMED (Incorrect)**

Table 2 (p.20) at 32 GB: YPIR Upload = **2.5 MB**. The 724 KB figure in the notes' complexity table is SimplePIR's upload at 32 GB (confirmed by the same Table 2 row). The notes' own [^14] gives the correct figure of 2.5 MB. Wrong-scheme attribution, internally contradicted. No false positive.

**Issue 3 — CONFIRMED (Minor)**

PDF p.4 (Section 1.2, "Packing the DoublePIR responses" subsection) contains the quoted sentence about the 1000x ciphertext expansion factor reduction: "RLWE decreases the expansion factor from (n+1) log q/ log p to 2 log q/ log p. For concrete values of n ≈ 2^{10}, this is a 1000× reduction in ciphertext expansion factor." Page 5 opens with "2 Preliminaries" — a completely different topic. The notes cite p.5; the correct page is p.4. Off-by-one page error, section label "Section 1.2" is correct. Severity remains Minor.

**Issue 4 — CONFIRMED (Minor)**

PDF p.10: the sentence "Pseudorandomness thus relies on a 'circular security' assumption." appears in the "Security." paragraph immediately following Theorem 2.9, which is within **Section 2.1** ("LWE-to-RLWE Packing"). Section 3 ("The YPIR Protocol") begins on p.11. The page number p.10 is correct; the section label is wrong. Severity remains Minor — the page is right and the reader can find the text, but the section attribution is incorrect.

**Summary (unchanged):** 4 issues confirmed, 0 rejected. Final counts: Incorrect: 2, Minor: 2.
