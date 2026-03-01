## WhisPIR (2024) — 3rd Pass Fact-Check

**Notes:** `WhisPIR_2024_notes.md`
**PDF:** `WhisPIR_2024_266.pdf`
**Claims checked:** 62 | **Issues found:** 2 | **Minor:** 2 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[^23] — Wrong variable name for switching-key noise bound**

Notes (footnote 23, correctness table row "Key switching"):
> "The size of the resulting noise term is `||e'|| <= gamma_R * B_chi * B * w`. where B_chi is bound on noise in switching key."

PDF (p.5, Section 2.2.1):
> "Let B_Y be the bound on the output of χ, which is the bound on the noise terms in the switching key swk_π. Each tuple in swk_π is multiplied by digits of c_1^(π) of size at most B. Therefore, the size of the resulting noise term is `||e|| ≤ γ_R · B_Y · B · w`."

The paper uses B_Y for the switching-key noise bound; the notes introduce B_chi as if it is the paper's symbol. The formula structure is otherwise correct.

---

**[^48] — Dropped qualifying clause from quoted statement**

Notes (footnote 48, Deployment Considerations):
> "WhisPIR does not require any offline phase to update any client or server parameters, regardless of any database updates."

PDF (p.3, Section 1.2):
> "WhisPIR does not require any offline phase to update any client or server parameters, regardless of any database updates (excluding significant changes in the database size)."

The parenthetical qualifier "(excluding significant changes in the database size)" is present in the paper but absent from the footnote quote. The notes do separately acknowledge this caveat in the Setup row of the Protocol Phases table ("Once (or when DB size changes significantly)"), so the overall section is not misleading, but the footnoted quote is incomplete.

---

### Reviewer Verdict

**Summary:** Both issues confirmed. No false positives. Counts stand: 2 Minor, 0 Incorrect.

---

**[^23] — CONFIRMED (Minor)**

Verified against PDF p.5, Section 2.2.1. The paper defines the variable as **B_Y** ("Let B_Y be the bound on the output of χ, which is the bound on the noise terms in the switching key swk_π") and writes the bound as `||e|| ≤ γ_R · B_Y · B · w`. The notes substitute **B_chi** for B_Y without noting that this is a rename, presenting it as if B_chi is the paper's own symbol. The noise term label also shifts from ||e|| (PDF) to ||e'|| (notes), though this is a minor notational variant that does not change the meaning. The core issue — an undisclosed variable rename that could mislead a reader cross-referencing the paper — is genuine. Severity is correctly classified as Minor: the formula structure and all numeric relationships are right; only the symbol name is non-standard relative to the source.

---

**[^48] — CONFIRMED (Minor)**

Verified against PDF p.3, Section 1.2. The full sentence in the paper reads: "WhisPIR does not require any offline phase to update any client or server parameters, regardless of any database updates **(excluding significant changes in the database size)**." The parenthetical is unambiguously present in the source and absent from the footnote quote. The fact-checker's mitigating observation is also accurate: the Protocol Phases table in the notes does record "Once (or when DB size changes significantly)" for the Setup phase, so the section as a whole is not misleading. Severity is correctly classified as Minor: the omission makes the direct quote incomplete and technically imprecise, but the caveat is preserved elsewhere in the same notes file.
