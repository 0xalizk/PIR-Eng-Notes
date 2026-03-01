## BarelyDoublyEfficient (2025) — 3rd Pass Fact-Check

**Notes:** `BarelyDoublyEfficient_2025_notes.md`
**PDF:** `BarelyDoublyEfficient_2025_1305.pdf`
**Claims checked:** 47 | **Issues found:** 3 | **Minor:** 1 | **Incorrect:** 2

---

### INCORRECT Findings

**1. Theorem 2.1 preprocessing time — wrong exponent structure**

Notes body text (Section "Williams' Fast Matrix-Vector Multiplication"):

> "any m x m matrix over R can be preprocessed in O(m^{2+epsilon} * |R|) time"

PDF Theorem 2.1 (p. 7):

> "every m × m matrix over R can be processed in O(m^{2+ε·log|R|}) time"

The notes express the bound as `O(m^{2+epsilon}) * |R|` (i.e., |R| as a multiplicative factor outside the exponent), whereas the PDF gives `O(m^{2+ε·log|R|})` (i.e., ε·log|R| is added to the exponent 2, making the exponent itself dependent on |R|). These are materially different expressions. The footnote [^17] does not reproduce the preprocessing time formula explicitly, so the error is confined to the body text.

---

**2. [^11] — LPR10 reduction direction reversed**

Notes (Cryptographic Foundation table, "Why plain LWE matters"):

> "RLWE enjoys worst-case to average-case reduction due to [LPR10]"

PDF footnote 1 (p. 2):

> "While RLWE enjoys an average-case to worst-case reduction due to [LPR10], the reduction is to lattice problems over ideal lattices..."

The reduction goes from average-case to worst-case (i.e., breaking the average-case problem is as hard as breaking a worst-case lattice problem). The notes have the direction reversed, stating it as worst-case to average-case.

---

### MINOR Issues

**3. Extract step — "round" vs floor**

Notes (Protocol Phases table, Extract row) and [^15]:

> "Output the k-hat-th bit of round(p/q * z-tilde[i-hat])"

PDF Fig. 2 (p. 10), Extract Step 3:

> "Output the k̂-th bit of ⌊(p/q) · z̃[î]⌋ as b."

The paper uses the standard floor bracket ⌊·⌋ in the figure. The notes use "round." The paper does define a separate rounding function ⌊·⌉ = ⌊x + 1/2⌋ (p. 4, Section 2.1), which is distinct from plain floor. The figure consistently uses ⌊·⌋ (floor) for the final extraction step, not the rounding notation. The same floor is used in the SimplePIR Fig. 1 Extract step. Using "round" in the notes is imprecise relative to the paper's own notation, though in practice the distinction may be minor for correctness.

---

### Reviewer Verdict

**Issue 1 — Theorem 2.1 preprocessing time: CONFIRMED (INCORRECT)**

PDF p. 7 Theorem 2.1 reads verbatim: "every m × m matrix over R can be processed in O(m^{2+ε log|R|}) time". The exponent is `2 + ε·log|R|` — log|R| is inside the exponent added to 2. The notes body text writes `O(m^{2+epsilon} * |R|)`, placing |R| as a multiplicative factor outside the power entirely, which is a materially different and incorrect expression. The footnote [^17] correctly quotes the PDF, so the error is isolated to the body text of the Williams section. Finding is valid.

**Issue 2 — [^11] LPR10 reduction direction: CONFIRMED (INCORRECT)**

PDF p. 2 footnote 1 reads verbatim: "While RLWE enjoys an average-case to worst-case reduction due to [LPR10]...". The notes table entry states "RLWE enjoys worst-case to average-case reduction due to [LPR10]" — the direction is reversed relative to the PDF's exact wording. The fact-checker's identification of the reversal is correct. Finding is valid.

**Issue 3 — Extract step "round" vs floor: CONFIRMED (MINOR)**

PDF Fig. 2 (p. 10) Extract Step 3 uses ⌊(p/q) · z̃[î]⌋, a plain floor operator. The notes write "round(p/q * z-tilde[i-hat])". Since the paper explicitly defines a distinct nearest-integer rounding function ⌊·⌉ elsewhere (p. 4), using the word "round" in the notes is imprecise — it could be misread as that rounding function rather than floor. The imprecision is real but does not change the structural correctness of the protocol description. Finding is valid as MINOR.

**Updated summary:** All 3 issues confirmed. No false positives. Counts stand: 2 INCORRECT, 1 MINOR.
