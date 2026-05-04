## CGKS (1995) — 3rd Pass Footnote Checkup

**Notes:** `CGKS_1995_notes.md`
**PDF:** `CGKS_1995.pdf`
**Total footnotes:** 28 | **Correct:** 24 | **Minor:** 4 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**1. [\[^7\]](../../../../research/multiserver/symmetric.IT/cgks_1995/CGKS_1995_notes.md#user-content-fn-7)** — Close paraphrase presented with quotation marks and ellipses. The string "one round … the user … produces k queries, one per server. The servers respond … The user reconstructs the desired bit x_i from these k replies" is not a verbatim contiguous quote. The "one round" phrase comes from §2 intro (p.969: "we define a special case … where the interaction is carried out in one round"), while the rest paraphrases §2.1's randomized-strategy intro on p.969 ("produces k queries … one per server. The servers respond according to strategies … The user reconstructs the desired bit x_i from these k replies, together with i and r"). Blended across two locations.

**2. [\[^16\]](../../../../research/multiserver/symmetric.IT/cgks_1995/CGKS_1995_notes.md#user-content-fn-16)** — Misquote: notes write "g and the f_p s are arbitrary fixed functions". Paper p.978 reads "the f_ps are arbitrary fixed functions mapping binary strings into elements of some finite Abelian group … and g is a homomorphism of the group onto Z_2". The paper's text describes only `f_p` as the "arbitrary fixed functions"; `g` is described separately as a homomorphism. Inserting "g and the" changes the statement.

**3. [\[^19\]](../../../../research/multiserver/symmetric.IT/cgks_1995/CGKS_1995_notes.md#user-content-fn-19)** — Ellipsis collapse changes meaning. Notes quote: "SRV_000 … can produce the query (S_1^{σ_1}, S_2^{σ_2}, S_3^1), sent to SRV_001." Paper p.974 actually says SRV_000 "can produce a relatively short string which contains the answer to the query (S_1^{σ_1}, S_2^{σ_2}, S_3^1), sent to SRV_001." The collapsed quotation makes it sound like SRV_000 produces the query; in fact it produces the *answer to* the query. The rest of the footnote (about S_3^1 = S_3^0 ⊕ {j} and the n^{1/d} bits emulation) is correct.

**4. [\[^28\]](../../../../research/multiserver/symmetric.IT/cgks_1995/CGKS_1995_notes.md#user-content-fn-28)** — Body text under [^28] attributes the record-size figures "applicable to records of sizes 2^15 and 2^20 for databases containing 2^30 and 2^40 bits, respectively" to "the §3.1 / §3.2 schemes" jointly. The quoted figures (2^15, 2^20) are specifically for the **two-server** (§3.1) scheme. The paper p.979 gives different figures for the four-server (§3.2 with d=2) scheme: "records of sizes 2^10 and 2^13 for databases containing 2^30 and 2^40 bits, respectively." Conflating the two schemes' applicability ranges into a single quote is imprecise.
