## IshaiShiWichs (2025) — 3rd Pass Fact-Check

**Notes:** `IshaiShiWichs_2025_notes.md`
**PDF:** `IshaiShiWichs_2025_976.pdf`
**Claims checked:** 38 | **Issues found:** 3 | **Minor:** 2 | **Incorrect:** 1
**After reviewer pass:** Issues found: 2 | **Minor:** 1 | **Incorrect:** 1 | **Rejected (false positive):** 1

---

### INCORRECT Findings

**[^12] — "8 associated parity bits" per hint is wrong**

Notes text:
> "each with 8 associated parity bits (full set parity plus 7 'planar set' parities obtained by removing one element from one dimension)"

PDF (Section 4.2, p.14):
> "For each i ∈ [L], write S_i = X_i × Y_i × Z_i, the client wants to store the parities of the following sets: S_i = X_i × Y_i × Z_i; for each x ∈ X_i: (X_i\{x}) × Y_i × Z_i; for each y ∈ Y_i: X_i × (Y_i\{y}) × Z_i; for each z ∈ Z_i: X_i × Y_i × (Z_i\{z})."

The hint stores 1 full-set parity plus |X_i| + |Y_i| + |Z_i| planar-set parities, totalling O(n^{1/6}) parities per hint (since E[|X_i|] = E[|Y_i|] = E[|Z_i|] = n^{1/6} per Fact 4.1, p.13). The "8 parities" figure belongs to the reconstruction algorithm, which uses 8 sub-cross-product parities p_{ijk} — 4 retrieved from the stored hint and 4 returned by the server. The notes conflate the 8 parities used during reconstruction with what is physically stored per hint entry. Footnote [^12] compounds this by saying "7 planar set parities" (the remaining 7 of 8 reconstruction parities), but in reality O(n^{1/6}) planar-set parities are stored. Footnote [^13] correctly describes n^{1/6} planar sets per dimension, which directly contradicts the "8 parities" claim in [^12].

---

### MINOR Issues

**[^20] — Wrong section reference for base correctness probability**

Notes text:
> "Section 4.2 (p.14): The base correctness probability per instance is >= 0.1; running omega(log n) instances in parallel amplifies to 1 - negl(n)."

PDF: Section 4.2 (pp.14–15) is the scheme description ("PIR Scheme for Q = √n/10 Random Distinct Queries"). The base correctness derivation and the 0.1 figure appear in Section 4.5, "Proof of Correctness under Random Queries" (pp.17–19), specifically on p.19: "Pr[Q-th query is incorrect] ≤ 0.6 + o(1) ≤ 0.9" from which the correctness probability of at least 0.1 is derived. The section reference should be "Section 4.5 (p.17-19)" not "Section 4.2 (p.14)."

---

**[^21] — Permutation description size notation mismatch**

Notes text (Adaptive Correctness Upgrade section):
> "the permutation pi_r(v) = Rv is a GF(2^k)-linear map, which can be described in O(1) field elements (O(log n) bits)."

PDF (Appendix A.4, p.36):
> "the permutation π can be described in Õ(1) bits"

The notes say "O(log n) bits" whereas the PDF uses "Õ(1) bits." These are asymptotically equivalent (Õ(1) hides polylog factors, and O(log n) is within that range), but the notes substitute a concrete O(log n) figure where the PDF uses tilde notation. This is a minor precision issue; the notes do not misstate the fact, but substitute a specific bound for the tilde notation the paper uses.

---

### Reviewer Verdict

**Summary after review:** 1 confirmed INCORRECT, 1 confirmed MINOR, 1 REJECTED (false positive). Adjusted counts: **Issues found: 2 | Minor: 1 | Incorrect: 1**

---

#### [^12] — "8 associated parity bits" per hint: CONFIRMED INCORRECT

The fact-checker's finding is valid. Section 4.2 (p.14) of the PDF explicitly lists what is stored per hint: (1) the parity of S_i = X_i x Y_i x Z_i, plus (2) for each x in X_i: parity of (X_i\{x}) x Y_i x Z_i, plus analogous sets for each y in Y_i and each z in Z_i. The total is 1 + |X_i| + |Y_i| + |Z_i| parities. Since E[|X_i|] = E[|Y_i|] = E[|Z_i|] = n^{1/6} (Fact 4.1, p.13), this is O(n^{1/6}) parities per hint, not 8. The "8 parities" (p_000 through p_111) are the reconstruction inputs assembled during query time — four retrieved from the hint table and four returned by the server — not the count of things stored per hint. The notes conflate these two distinct quantities. The INCORRECT classification stands.

---

#### [^20] — Wrong section reference for base correctness probability: REJECTED (false positive)

The PDF's Section 4.2 opening paragraph (p.14) explicitly states: "achieves correctness with probability at least 0.1 as long as there are only Q = sqrt(n)/10 random and distinct queries." The 0.1 figure is asserted right there, at the exact location the footnote cites. Section 4.5 (pp.17–19) contains the proof of this claim, but the claim itself appears in Section 4.2 at p.14. The footnote [^20] is citing where the fact is stated, not where it is proved, which is a normal and acceptable citation practice. The section reference is not wrong. This finding is a FALSE POSITIVE and should be rejected. The MINOR classification is not warranted.

---

#### [^21] — Permutation description size notation mismatch: CONFIRMED MINOR

The PDF (Appendix A.4, p.36) states "the permutation π can be described in Õ(1) bits." The notes render this as "O(1) field elements (O(log n) bits)." Inspecting the construction in Appendix A.3 (p.35), the permutation π_r is parameterized by r = (r_1, r_2, r_3) in GF(2^k)^3 where k = log(n)/3, so the description is 3 field elements totalling log(n) bits. The notes' concrete derivation is mathematically correct, and O(log n) bits is consistent with Õ(1) bits. However, the notes present "O(log n) bits" as if quoting or closely paraphrasing the paper, when the paper only says Õ(1). This is a minor precision issue — the notes are not wrong, but they substitute a derived concrete bound for the paper's stated asymptotic. The MINOR classification stands.

