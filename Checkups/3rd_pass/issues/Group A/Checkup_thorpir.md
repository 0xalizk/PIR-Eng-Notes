## ThorPIR (2024) — 3rd Pass Fact-Check

**Notes:** `thorpir_2024_notes.md`
**PDF:** `FHEPIR_2024_482.pdf`
**Claims checked:** 74 | **Issues found:** 6 | **Minor:** 3 | **Incorrect:** 3

---

### INCORRECT Findings

**1. Theorem 3.2 "prior bound" formula is a garbled mix of two different parameterizations**

Notes (Novel Primitives section, "Improvement over prior" row for Theorem 3.2):
> "Reduces the number of required rounds by ~2.5x compared to Morris et al. [72], which had advantage bound (2q(n+t)/(n+1)) * (2qn/N)^{t/(2(n+1))}. The improvement comes from the exponent changing from t/(2n) to approximately t/(4n) and the base from (4q*logN/N)^{1/2} to (2q*logN/N)."

The PDF presents the Morris et al. [72] bound in two places.

Section 1 (p.5), where r is the number of "meta-rounds" and the shuffle runs for 2r log N levels total:
> (2q / (r+1)) · (4q log N / N)^{r/2}

Section 8, end of proof (p.40), CCA-adapted final bound with t = (r+1)·n substituted:
> q(2n + t + 2) / (n+1) · (2qn/N)^{t/(2(n+1))}

The notes' formula — (2q(n+t)/(n+1)) · (2qn/N)^{t/(2(n+1))} — uses the exponent structure of the CCA form but changes the numerator from (2n+t+2) to (n+t). Neither (n+t) nor "2q(n+t)" appears for the Morris et al. bound anywhere in the paper. The notes' description of the change in the base ("from (4q*logN/N)^{1/2} to (2q*logN/N)") correctly matches the Section 1 presentation, but this is inconsistently mixed with the CCA-form denominator from the proof. **INCORRECT** — the prior bound numerator factor is wrong.

---

**2. [^7] — 750 bits mischaracterized as what bootstrapping "yields" for conjectured params**

Notes ([^7]):
> "Each relaxed bootstrapping yields ~400 bits of noise budget (proven params) or ~750 bits (conjectured params), allowing 8 levels of Thorp shuffle before the next bootstrapping. Total bootstrappings: ceil(480/8) = 55 (proven) or 0 (conjectured -- no bootstrapping needed since depth is only 45)."

PDF (p.29–30, conjectured security discussion):
> "In total, there are 45 levels of Thorp shuffle, requiring about 2250 bits of noise budget. Then, the PRG requires about 750 bits of noise budget. In total, about 3000 bits of noise budget is needed."

The 750 bits is the noise *consumed by the PRG* in the conjectured parameter setting — it is a budget *requirement*, not what bootstrapping yields. The notes present 750 bits as a bootstrapping yield figure parallel to the proven-params figure of 400 bits. This is doubly wrong: (a) the conjectured params use no bootstrapping at all (as the notes correctly note in the same sentence: "0 (conjectured -- no bootstrapping needed)"), making "yield per bootstrapping" meaningless in that context; (b) the 750 bits is the PRG noise consumption, not a bootstrapping output. **INCORRECT.**

---

**3. [^15] — 0.86s/op presented without GPU context, directly contradicting the BFV table in Section 11 of the same notes**

Notes ([^15]):
> "With relaxed bootstrapping at 0.86s/op, the minimum serial time is 2^30/13 * 0.86s = 19,731 hours"

PDF (p.29):
> "which means at least 2^30/13 bootstrapping operations are needed, each taking 0.86 seconds on a GPU, which results in 19,731 hours."

The paper derives 0.86s as the GPU-accelerated bootstrapping time: the CPU single-thread time is 43 seconds (confirmed in the BFV operations table, PDF p.27–28), and the GPU speedup is ~50× (from [76]), giving 43/50 ≈ 0.86s. The notes' own BFV operation costs table (Section 11) correctly lists relaxed bootstrapping at **43 seconds** (single-thread CPU). But [^15] then states "relaxed bootstrapping at 0.86s/op" with no qualification, creating a direct contradiction with the 43s figure in the notes' own Section 11. The notes do not explain that 0.86s is a GPU-derived figure (43s / 50), leaving a reader with an unexplained 50× discrepancy between Section 11 and [^15]. **INCORRECT** — the 0.86s figure should be identified as a GPU-accelerated estimate, not a bare bootstrapping cost.

---

### MINOR Issues

**1. Conjectured Security table — "Total noise budget ~7600 bits (with bootstrapping)" for proven params has no source in the paper**

Notes (Conjectured Security Variant table):
> "Total noise budget | ~7600 bits (with bootstrapping) | 3000 bits (raw)"

PDF: The paper does not state a "total noise budget" of ~7600 bits for the proven security params anywhere. The paper states: each relaxed bootstrapping gives ~400 bits of noise budget remaining, allowing 8 levels before the next bootstrapping. The ciphertext modulus is 860 bits. The 3000 bits figure for conjectured params appears explicitly on p.30. The 7600 figure appears to be an editorial derivation (perhaps 55 bootstrappings × some figure, or 400 × some count), but it is not stated in the paper and the arithmetic does not obviously produce 7600. This is a derived figure presented without attribution as though from the paper. MINOR: it should be flagged as editorially derived rather than a direct paper claim.

---

**2. [^16] — LP benchmark reference is [55] in the footnote but [53] in the Concrete Benchmarks table, reflecting the paper's own internal inconsistency**

Notes ([^16]):
> "The 3.6ms online time is validated by benchmarking on Amazon EC2 t2.large instance against PIANO [91], MIR [73], and LP [55] implementations"

Notes (Concrete Benchmarks table): The row is labeled "LP [53]."

PDF: The benchmarking prose (Section 5.1, p.29) says "LP [55]" while Table 2 (p.27) labels the row "LP [53]." Reference [55] is Lazzaretti-Papamanthou USENIX Security 2024 (single-pass scheme); [53] is Lazzaretti-Papamanthou TCC 2023 (near-optimal scheme). The notes propagate the paper's own internal inconsistency by using [55] in [^16] (matching the Section 5.1 text) and [53] in the Concrete Benchmarks table (matching Table 2). MINOR: the discrepancy originates in the paper itself, but the notes' two usages should be consistent with each other.

---

**3. MINOR: PRG "purpose" row — random bits formula uses r but bfvThorp loop runs for r+1 rounds**

Notes (Novel Primitives table, Purpose row):
> "Generate the N * r * log(N) random bits needed for the Thorp shuffle under FHE"

PDF (Algorithm 6, p.23, line 12): "Let m = N log(N) r"
PDF (Algorithm 6, line 13) generates indices i ∈ [(r+1) log(N)], j ∈ [N/D/2], implying (r+1)·log(N)·(N/2) bits of randomness total.
PDF (Algorithm 5, bfvThorp, line 26): the outer loop runs "for t in [1, ..., r+1]."
PDF (Section 5.1, p.28): "To compute 480 levels of Thorp shuffle..."

The paper uses both r and r+1 in different places for the shuffle depth. Algorithm 6 line 12 uses r (matching the notes), but the actual loop in bfvThorp uses r+1. The notes reproduce one of the paper's own usages. MINOR: the discrepancy is in the paper's notation, not introduced by the notes.

---

### Reviewer Verdict

All 6 findings verified against the PDF. Net summary: **6 confirmed, 0 rejected.**

---

**INCORRECT Finding 1 — CONFIRMED**

The Morris et al. [72] prior CCA bound is stated explicitly in Section 2.5 (p.11) of the PDF as:

> 2q(4n+t)/(4n-4) · (4qn/N)^{t/(4(n-2))}

The notes' formula `(2q(n+t)/(n+1)) * (2qn/N)^{t/(2(n+1))}` matches neither this form nor the Section 1 meta-rounds form `(2q/(r+1)) * (4q log N / N)^{r/2}`. The numerator factor `(n+t)` and denominator `(n+1)` do not appear in any correct statement of the Morris et al. prior bound anywhere in the paper.

One clarification on the checkup's description: the formula `q(2n+t+2)/(n+1) * (2qn/N)^{t/(2(n+1))}` shown at the end of Section 8 (p.40) is ThorPIR's own new CCA-security result after applying Maurer et al. [64], not a re-statement of the Morris et al. prior bound. The checkup's identification of this as "CCA-adapted Morris et al." is imprecise, but this does not affect the validity of the finding — the notes' prior-bound formula is still wrong, and the error is confirmed.

---

**INCORRECT Finding 2 — CONFIRMED**

Verified against p.29-30 of the PDF. The paper states: "In total, there are 45 levels of Thorp shuffle, requiring about 2250 bits of noise budget. Then, the PRG requires about 750 bits of noise budget. In total, about 3000 bits of noise budget is needed." The 750 bits is the PRG noise consumption in the conjectured parameter setting — it is a cost, not a yield. There is no bootstrapping under the conjectured parameters (the paper explicitly removes it), so characterizing 750 bits as a bootstrapping yield is doubly incorrect as the checkup states.

---

**INCORRECT Finding 3 — CONFIRMED**

Verified against p.29 of the PDF. The paper explicitly says "each taking 0.86 seconds on a GPU" when deriving the 19,731-hour figure for prior FHE-based works. The notes' [^15] reproduces the 0.86s figure and the 19,731-hour calculation but omits "on a GPU," leaving it unqualified. The notes' own Section 11 table lists relaxed bootstrapping at 43 seconds (single-thread CPU), which is the measured figure from p.27-28 of the PDF. The 0.86s figure is 43s / 50 (GPU speedup factor from [76], stated in p.28 as "GPU can accelerate BFV operations by about 50x"). The omission of the GPU qualifier in [^15] creates an unexplained 50x contradiction internal to the notes.

---

**MINOR Finding 1 — CONFIRMED**

The ~7600 bits figure for proven-params total noise budget does not appear anywhere in the PDF. The paper states 400 bits per bootstrapping, 8 levels per bootstrapping interval, 55 bootstrappings, and an 860-bit ciphertext modulus for proven params — none of which arithmetically produce 7600 in any obvious way. The 3000-bit figure for conjectured params is explicitly stated on p.30. The ~7600 figure is an editorial derivation not sourced from the paper.

---

**MINOR Finding 2 — CONFIRMED**

Verified against the PDF. Table 2 (p.27) labels the row "LP [53]." The Section 5.1 prose (p.29) says "LP [55]." Reference [53] is Lazzaretti-Papamanthou TCC 2023; [55] is Lazzaretti-Papamanthou USENIX Security 2024. The paper has an internal inconsistency, and the notes propagate it by using [55] in [^16] (matching the prose) and [53] in the Concrete Benchmarks table (matching Table 2).

---

**MINOR Finding 3 — CONFIRMED**

Verified against the PDF. Algorithm 6 line 12 explicitly sets `m = N log(N) r` — matching the notes' formula. Algorithm 5 (bfvThorp) line 26 runs the outer loop "for t in [1, ..., r+1]," which would imply (r+1) rounds. The paper is internally inconsistent on this point; the notes reproduce the Algorithm 6 value. The discrepancy originates in the paper, not in the notes.
