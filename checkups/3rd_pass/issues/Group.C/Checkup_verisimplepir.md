## VeriSimplePIR — 3rd Pass Fact-Check

**Notes:** `VeriSimplePIR_2024_notes.md`
**PDF:** `VeriSimplePIR_2024_341.pdf`
**Claims checked:** 47 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

**[^9] — Wrong formula transcription for eq. (6)**

Notes (Novel Primitives / Correctness definition, VLHE table):
> "The ciphertext modulus must satisfy q >= 2*sigma*m*ell*p^2 * sqrt(2*ell * ln(2/delta)) (eq. 6, p. 9)."

PDF eq. (6), p. 9:
> q ≥ 2σℓp² √(2ℓm ln(2/δ))

The notes incorrectly pull `m` out of the square root and place it as a standalone factor alongside `ℓ`, while dropping `m` from inside the sqrt. The correct formula has `m` inside the sqrt alongside `ℓ` (i.e., √(2ℓm·ln(2/δ))), with no standalone `m` factor outside. Specifically:

- Notes write: `2 · σ · m · ℓ · p² · √(2ℓ · ln(2/δ))`
- PDF has: `2 · σ · ℓ · p² · √(2ℓm · ln(2/δ))`

These are not equal. The same formula is referenced again in the Cryptographic Foundation table ([^20]), but there the notes reproduce it correctly from eq. (6) prose rather than the formula itself, so that instance is fine. The error is only in [^9].

---

### MINOR Issues

**1. [^28] — Incorrect section/page attribution for "any digest" quote**

Notes (Extractability row, Formal Security Properties):
> "[^28]: Section 1.2 (p. 2): 'any digest, even one produced by a malicious server, is sufficient to commit to some database.'"

PDF: The verbatim quote "any digest, even one produced by a malicious server, is sufficient to commit to some database" appears in the **Abstract (p. 1)**, not in Section 1.2 (p. 2). Section 1.2 discusses the same idea in different words but does not contain this exact sentence.

---

**2. [^25] — Off-by-one page reference for Definition A.2**

Notes (Digest Binding row, Formal Security Properties):
> "Definition A.2 (p. 17), Lemma C.2 (p. 18)"

PDF: Definition A.2 (Digest Binding) **begins on p. 16** (its header and item 1 appear on p. 16, in the same column as Definition A.1), and continues with item 2 at the top of p. 17. The correct primary page is p. 16, not p. 17.

---

**3. [^29] — Delta formula incorrectly attributed to eq. (2)**

Notes (Correctness Analysis):
> "The probability of decryption failure is bounded by delta = 2*exp(-pi * (Delta / (s * sqrt(m) * ||D||_inf))^2) (p. 5, eq. 2)."

PDF (p. 4–5): The delta formula `δ = 2exp(−π(Δ/(s√m·||D||_inf))²)` is an **unnumbered display** on p. 5. Equation (2) is the derived lower bound on `q` that follows from it: `q ≥ p · σ · ||D||_inf · √(2m ln(2/δ))`. The notes cite eq. (2) for the failure-probability formula, but eq. (2) is the q-constraint formula, not the delta formula.

---

### Reviewer Verdict

**[^9] — REJECTED (false positive)**

The fact-checker describes the PDF formula as `2 · σ · ℓ · p² · √(2ℓm · ln(2/δ))` and says the notes wrongly place `m` outside the sqrt. However, equation (6) on p. 9 is typeset as a two-sided equality:

> q ≥ 2σmℓp² √(2ℓ ln(2/δ)) = (√mℓ) · 2σℓp² √(2m ln(2/δ))

The left side of that equality is `2σmℓp²√(2ℓ ln(2/δ))` — which is precisely what the notes write (`2*sigma*m*ell*p^2 * sqrt(2*ell * ln(2/delta))`). Both sides of the PDF equality are mathematically equivalent; the notes reproduce the left-hand form verbatim and correctly. The fact-checker mistook one side of a two-sided equality for the sole authoritative form. This is not an error in the notes.

---

**[^28] — CONFIRMED (Minor)**

Verified against p. 1 and p. 2 of the PDF. The exact sentence "any digest, even one produced by a malicious server, is sufficient to commit to some database" appears in the Abstract on p. 1. Section 1.2 on p. 2 discusses the same concept but uses different wording ("remove the assumption that the digest is well-formed" and related phrasing). The notes cite this as `Section 1.2 (p. 2)`, which is wrong for a verbatim quote. Attribution should be Abstract (p. 1). Severity remains Minor — the underlying claim is correct, only the source location is misattributed.

---

**[^25] — CONFIRMED (Minor)**

Verified against pp. 16–17 of the PDF. Definition A.2 (Digest Binding) is introduced with its header and item 1 on p. 16 (same page as Definition A.1). Item 2 of Definition A.2 continues at the top of p. 17. The notes cite "p. 17" as the primary page for Definition A.2, but the definition opens on p. 16. Severity remains Minor — off-by-one page reference, core content is correct.

---

**[^29] — CONFIRMED (Minor)**

Verified against p. 5 of the PDF. The failure-probability formula `δ = 2exp(−π(Δ/(s√m·||D||_inf))²)` appears as an unnumbered display equation above eq. (2). What the paper labels eq. (2) is the derived q-lower-bound: `q ≥ p · σ · ||D||_inf · √(2m ln(2/δ))`. The notes write "(p. 5, eq. 2)" after the delta formula, incorrectly attaching the equation number to the wrong formula. Severity remains Minor — the formula itself is transcribed correctly; only the equation number citation is wrong.

---

**Summary after review:** 1 finding REJECTED (false positive), 3 findings CONFIRMED. Corrected totals: Issues found: 3 | Minor: 3 | Incorrect: 0.
