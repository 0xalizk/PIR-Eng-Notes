## WangRen (2024) — 3rd Pass Fact-Check

**Notes:** `WangRen_2024_notes.md`
**PDF:** `WangRen_2024_1845.pdf`
**Claims checked:** 35 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**1. [^23] Wrong page reference — client storage quote is on p.22, not p.21**

Notes text: "Section 4.3 (p.21): 'h contains m' XOR sums of size w each and has size m'w = O(Qw). ck contains λ bits of PRF key and the state for Hist. From Construction 3.4, we know that Hist stores an array of size no more than Q and a hash map containing no more than Q elements. Therefore, the size of ck is O(Q log n) bits and the total client storage is O(Qw + Q log n) bits.'"

PDF (p.22, Section 4.3, "Client storage." paragraph): "h contains m' XOR sums of size w each and has size m'w = O(Qw). ck contains λ bits of PRF key and the state for Hist. As all DS has the same access pattern, we can use the same Hist across rows. From Construction 3.4, we know that Hist stores an array of size no more than Q and a hash map containing no more than Q elements. Therefore, the size of ck is O(Q log n) bits and the total client storage is O(Qw + Q log n) bits."

The quoted text is on p.22. Page 21 contains only the Communication and Server time sub-sections of Section 4.3. The citation should read "Section 4.3 (p.22)".

---

**2. [^35] Wrong page reference — Appendix A.2 PRP quote is on p.26, not p.27**

Notes text: "Appendix A.2 (p.27): 'At the beginning of the protocol, the client chooses a PRP P: [n] -> [n] over domain [n] of database indices and sends the PRP key to the server... For every query, the client uses permutation P to transform the desired index into the index of the same entry in the permuted database.'"

PDF: The heading "A.2 Deferred proofs in Section 4" and Lemma A.4 (which contains the "Efficiency for arbitrary queries" passage with the quoted text) appear on p.26. The passage quoted — "At the beginning of the protocol, the client chooses a PRP P : [n] → [n] over domain [n] of database indices and sends the PRP key to the server. The client and server then execute the protocol on a permuted database where indices are permuted with P. For every query, the client uses permutation P to transform the desired index into the index of the same entry in the permuted database." — is in the proof of Lemma A.4 on p.26. The citation should read "Appendix A.2 (p.26)".

---

**3. Protocol Phases table — Query phase description imprecise about what replaces the j*-th entry**

Notes text (Query row, Operation column): "build request q = (DS_0.Access(c), ..., DS_{T-1}.Access(c)) replacing j*-th entry with a random element"

PDF p.18 Construction 4.2, Query: "Let r∗ ←$ [m'] \ C. Rewrite q[j∗] ← DS_{j∗}.Access(r∗)."

The replacement value is not "a random element" in the abstract sense — it is specifically DS_{j∗}.Access(r∗), the DB entry (or ⊥) at a uniformly random unconsumed column r∗ in row j∗. The client sends a DB index drawn from a random unconsumed position in the same row, which may be ⊥ (an empty cell). Describing this as "a random element" omits the mechanism (DS.Access of a random unconsumed column) and the possibility of the ⊥ value. This is in the prose table rather than a footnoted claim, but it is imprecise enough to mislead a reader about the protocol structure.

---

### Reviewer Verdict

**Issue 1 — [^23] Wrong page reference (p.21 vs p.22): CONFIRMED**

PDF evidence is unambiguous. Page 21 ends with the "Server time." subsection and the closing of the proof of Lemma 4.9. The "Client storage." paragraph — including the entire quoted passage beginning "h contains m' XOR sums of size w each..." through "total client storage is O(Qw + Q log n) bits" — appears at the top of p.22. The footnote text quotes this passage correctly but attributes it to p.21. The citation should read "Section 4.3 (p.22)". Severity: Minor (off-by-one page, core claim correct).

**Issue 2 — [^35] Wrong page reference (p.27 vs p.26): CONFIRMED**

PDF evidence is unambiguous. The "A.2 Deferred proofs in Section 4" heading, Lemma A.4, and the "Efficiency for arbitrary queries" paragraph — which contains the full quoted passage beginning "At the beginning of the protocol, the client chooses a PRP P : [n] → [n]..." — all appear on p.26. Page 27 opens mid-proof with the PRP-calls formula, then begins Appendix B. The footnote quotes the passage correctly but cites p.27. The citation should read "Appendix A.2 (p.26)". Severity: Minor (off-by-one page, core claim correct).

**Issue 3 — Protocol Phases table imprecision about replaced entry: CONFIRMED**

Construction 4.2 on p.18 states "Let r∗ ←$ [m'] \ C. Rewrite q[j∗] ← DS_{j∗}.Access(r∗)." The notes say "replacing j*-th entry with a random element." The actual replacement is the output of DS_{j*}.Access applied to a uniformly random unconsumed column r* — which may return ⊥ if that position is empty. "A random element" omits both the DS.Access mechanism and the ⊥ possibility, which are relevant to understanding the protocol's privacy argument (the server cannot distinguish the real query column from a dummy one that may be empty). Severity stands as Minor: this is prose-table description rather than a footnoted claim, but the imprecision is genuine and could mislead a reader about the protocol structure.

**Summary after review:** All 3 issues confirmed. No findings rejected. Counts unchanged: 3 Minor, 0 Incorrect.
