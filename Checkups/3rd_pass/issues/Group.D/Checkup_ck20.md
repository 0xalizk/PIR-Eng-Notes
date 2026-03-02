## CK20 (2019) — 3rd Pass Fact-Check

**Notes:** `CK20_2019_notes.md`
**PDF:** `CK20_SublinearOnline_2019_1075.pdf`
**Claims checked:** 43 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

**[Variants table, Corollary 18 row] — Online Server Time incorrectly stated as Õ_λ(sqrt(n))**

Notes (Variants table, row "Two-server multi-query low-comm (Cor 18)"):
> Online Server Time: Õ_λ(sqrt(n))

PDF p.22, Corollary 18 states explicitly:
> "the client offline time increases to Õ_λ(n), the client storage and online time increases to Õ_λ(n^{5/6}), and the total online communication decreases to O(λ^2 log n)."

The online server time for Corollary 18 is Õ_λ(n^{5/6}), not Õ_λ(sqrt(n)). This is confirmed by Table 2 (p.6), which shows the Thm 17 row (from which Cor 18 derives) but Cor 18 is a separate variant that specifically trades online time for reduced communication using Hellman tables. The D.3 proof on p.60 confirms: each of the m searches takes time Õ_λ(s(n)^{2/3}), for a total online time of Õ_λ(n^{5/6}). The notes list Õ_λ(sqrt(n)) for this variant, which is the online time for Theorem 17 (the base multi-query scheme), not the Corollary 18 variant.

---

### MINOR Issues

**[^29] — Amplification quote uses quotation marks but is a paraphrase**

Notes (footnote [^29]):
> "By running λ instances of the scheme in parallel, using independent randomness for each instance, we can drive the overall failure probability (when the puncturable pseudorandom set is perfectly secure) to 2^{-λ}."

The notes present this in quotation marks (as a direct quote). The PDF on p.49-50 (Appendix C.2) does not contain this exact sentence verbatim. The PDF says the failure probability "can drive down the failure probability to be approximately 1/n" for a single run (p.21), and in C.2 (p.49) discusses how running O(λ) instances in parallel drives the failure probability down to be negligible in λ. On p.50, the proof states the failure probability is "negligibly close to 2^{-λ}" rather than exactly 2^{-λ}. The quoted text in [^29] is a paraphrase, not a direct quotation, and should not appear in quotation marks.

---

**[^36] — Remark 24 quote has a substitution error**

Notes (footnote [^36]):
> "The lower bound of Theorem 23 does not preclude schemes that achieve better communication **and lower bound** by virtue of having the servers store some form of encoding of the database."

PDF p.28, Remark 24, says:
> "The lower bound of Theorem 23 does not preclude schemes that achieve better communication **and online time** by virtue of having the servers store some form of encoding of the database."

The notes have "and lower bound" where the PDF says "and online time." This appears to be an editing artifact from a prior pass. The phrase "and lower bound" is grammatically odd here and does not reflect the paper's meaning.

---

**[Built from field, Puncturable Pseudorandom Set table] — GGM instantiation key length stated imprecisely**

Notes (Novel Primitives section, Puncturable Pseudorandom Set, "Built from" field):
> "instantiated with the GGM-tree PRF (Corollary 6), this gives keys of length O(λ log n) and punctured keys of length O(λ log n)."

PDF p.15 (immediately below Construction 4, describing the GGM-PRG instantiation) states:
> "set keys of λ + O(log n) bits in length, punctured keys of O(λ log n) bits in length"

The set key length is λ + O(log n), which is dominated by λ rather than λ log n. Stating "O(λ log n)" for the set key is technically an overstatement relative to the tighter λ + O(log n) bound the paper gives. For punctured keys the O(λ log n) bound is correct. This is a minor imprecision (the bound is not wrong, just looser than what the PDF states).

---

### Reviewer Verdict

**INCORRECT Finding — [Variants table, Corollary 18 row] Online Server Time:** REJECTED (false positive).

The checkup conflates the client's online time with the server's online time. Corollary 18 (p.22) states "the client storage and online time increases to Õ_λ(n^{5/6})." The Proof of Corollary 18 in Appendix D.3 (p.60) confirms that the Õ_λ(n^{5/6}) figure is the cost of the client-side Hellman-table data structure (space m·Õ_λ(s(n)^{2/3}) = Õ_λ(n^{5/6})), which the client uses to search for the right set key offline. The online server's Answer algorithm in Construction 44 still only evaluates a punctured set of size s-1 = Õ(sqrt(n)) and computes one XOR parity, giving server online time Õ_λ(sqrt(n)) — unchanged from Theorem 17. The notes' entry of Õ_λ(sqrt(n)) for the server's online time in the Cor 18 row is correct. The checkup incorrectly attributes the client's storage/online-time figure to the server.

**MINOR Finding — [\^29] amplification quote uses quotation marks but is a paraphrase:** CONFIRMED.

The PDF text on p.49 reads: "Since the client can detect whenever a failure occurs, by running λ instances of the scheme in parallel, using independent randomness for each instance, we can drive the overall failure probability (when the puncturable pseudorandom set is perfectly secure) to 2^{-λ}." The notes present a truncated version of this (dropping the opening clause) inside quotation marks. Additionally, p.50 clarifies "the failure probability of all λ instances must be negligibly close to 2^{-λ}" — not exactly 2^{-λ}. The quoted text in [\^29] is a paraphrase, not a direct quotation.

**MINOR Finding — [\^36] Remark 24 quote has "and lower bound" instead of "and online time":** CONFIRMED.

PDF p.28, Remark 24 reads verbatim: "The lower bound of Theorem 23 does not preclude schemes that achieve better communication and online time by virtue of having the servers store some form of encoding of the database." The notes have "and lower bound" in place of "and online time." This is a genuine transcription/editing error that produces a grammatically odd and technically meaningless phrase.

**MINOR Finding — [\^13] GGM instantiation set key length overstated as O(λ log n):** CONFIRMED.

PDF p.15 states set keys are "λ + O(log n) bits in length." O(λ log n) is a strictly looser bound; the tighter expression is O(λ) (since the log n term is dominated by λ for any non-trivial λ). For punctured keys, O(λ log n) is correct. The notes overstate the set key length for the GGM instantiation.

---

**Net summary: 3 confirmed, 1 rejected.**

The header counts require updating: the one INCORRECT finding is rejected, leaving 0 incorrect findings. The 3 MINOR findings are all confirmed.

Updated counts: **Claims checked:** 43 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0
