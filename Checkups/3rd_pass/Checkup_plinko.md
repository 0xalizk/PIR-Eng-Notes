## Plinko (2024) — 3rd Pass Fact-Check

**Notes:** `Plinko_2024_notes.md`
**PDF:** `Plinko_2024_318.pdf`
**Claims checked:** 54 | **Issues found:** 2 | **Minor:** 2 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[^7] — Page reference off by one**

Notes text: Definition 4.1 (p.10): "...We also observe that this definition is strictly stronger than the PRF security definition."

PDF: Definition 4.1 is stated on p.10, but the sentence "We also observe that this definition is strictly stronger than the PRF security definition." appears at the top of p.11, in the paragraph immediately following the definition's formal statement. The definition itself ends on p.10; the observation is on p.11.

Discrepancy: The footnote cites "(p.10)" but the quoted sentence is on p.11.

---

**[^43] — Incomplete figure citation for the benchmarks table**

Notes text: The Performance Benchmarks section presents a single table with both query columns (Crypto Assumption, Client Storage, Query Time, Query Comm.) and update columns (Update Time worst-case/amortized, Update Comm. worst-case/amortized), with footnote [^43] citing only "Figure 1 (p.3): Comparison table of amortized query time and query communication for existing single-server offline/online PIR schemes."

PDF: Figure 1 (p.3) covers only query metrics (Crypto Assumption, Client Storage, Query Time, Query Comm.). The update columns (Update Time and Update Comm., worst-case and amortized) appear in a separate table, Figure 2 (p.3). The notes table merges both figures into one, but the single footnote [^43] attributes the entire table to Figure 1 only, leaving the update columns without a citation.

Discrepancy: The update metric columns in the notes table come from Figure 2 (p.3), not Figure 1 (p.3). The footnote should cite both Figure 1 and Figure 2.

---

### Reviewer Verdict

**[^7] — Page reference off by one: CONFIRMED**

PDF p.10 ends with the closing line of Definition 4.1's security definition ("We call a iPRF iF secure if for all efficient A, Adv^iprf_iF(λ, A) ≤ negl(λ)."). The sentence "We also observe that this definition is strictly stronger than the PRF security definition." is the opening sentence of p.11, not p.10. The footnote cites "(p.10)" for this quote. The finding is a genuine off-by-one page error. Severity: Minor — confirmed as flagged.

**[^43] — Incomplete figure citation for the benchmarks table: CONFIRMED**

PDF p.3 contains two entirely separate tables. Figure 1 covers query metrics only (Crypto Assumption, Client Storage, Query Time, Query Comm.). Figure 2 covers update metrics only (Update Time worst-case/amortized, Update Comm. worst-case/amortized). The notes merge both into a single table but [^43] cites only "Figure 1 (p.3)". The update columns in the merged table are sourced from Figure 2, which goes uncited in [^43]. Severity: Minor — confirmed as flagged.

**Summary (updated):** 2 issues found, both confirmed. No issues rejected. Counts unchanged: Minor: 2 | Incorrect: 0.
