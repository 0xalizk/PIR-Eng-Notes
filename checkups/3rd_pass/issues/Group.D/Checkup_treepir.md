## TreePIR (2023) — 3rd Pass Fact-Check

**Notes:** `TreePIR_2023_notes.md`
**PDF:** `TreePIR_2023_204.pdf`
**Claims checked:** 47 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**1. [^14] — DDH assumption attributed to "[19] combined with [16]" but the PDF credits only [16]**

Notes text:
> "The DDH assumption comes from this scheme [19] combined with [16]."

PDF (p.21), Lemma 4.1 proof:
> "Applying the scheme by Döttling et al. [19] we achieve our claimed result, a two-server PIR scheme with sublinear online time and polylog bandwidth, reliant only on the DDH assumption [16]."

The paper attributes the DDH assumption solely to [16]. Reference [19] (Döttling et al.) is cited as the PIR scheme being recursed into, not as a source of the DDH assumption itself. Describing the assumption as coming from "[19] combined with [16]" misattributes [19] as a DDH assumption source. The correct statement is that DDH comes from [16], and [19] is the single-server PIR scheme that happens to be compatible with that assumption.

---

**2. [^43] — Notes introduce "server" into "online server time" where the PDF says "online time"**

Notes text:
> "If we change our set size to N^D, then this makes our online server time and bandwidth N^D."

PDF (p.21), Section 4.4:
> "If we change our set size to N^D, then this makes our online time and bandwidth N^D."

The PDF says "online time," not "online server time." While the intended meaning is the same in context (server computation dominates online time), the word "server" was inserted into the paraphrase and is not present in the source.

---

**3. [^26] — Quoted proof text uses "P_0[x^l]" but the PDF proof uses "P[x_1^l]"**

Notes text (quoting the correctness proof):
> "At the end of the query, we update T by setting T_j = (k', P_0[x^l] XOR DB[x])."

PDF (p.20), correctness proof:
> "At the end of the query, we update T by setting T_j = (k', P[x_1^l] ⊕ DB[x_1])."

The proof text on p.20 uses **P** (without a subscript 0) and **x_1** (the specific first query index), whereas the notes use **P_0** and **x** (generic). The Figure 6 pseudocode on p.18 does use P_0 and x^l, but the quoted text in the footnote is drawn from the proof on p.20, where the notation differs. The notes blend the proof-text notation with the figure notation.

---

### Reviewer Verdict

**Issue 1 — [^14] (DDH attributed to "[19] combined with [16]"): CONFIRMED**

The PDF (p.21) states the result is "reliant only on the DDH assumption [16]" and describes [19] (Döttling et al.) as the single-server PIR scheme being recursed into — a scheme that *itself* relies on DDH. The notes say "The DDH assumption comes from this scheme [19] combined with [16]," which misrepresents [19] as a co-source of the DDH assumption rather than the scheme whose assumption is DDH (where the DDH assumption itself is sourced from [16]). The finding is accurate. Severity: Minor — the technical content is not wrong in a material sense, but the attribution is imprecise.

**Issue 2 — [^43] ("online server time" vs "online time"): CONFIRMED**

PDF p.21, Section 4.4 reads exactly: "If we change our set size to N^D, then this makes our online time and bandwidth N^D." The notes insert the word "server" to produce "online server time," which is not in the source. The finding is accurate. Severity: Minor.

**Issue 3 — [^26] (notation "P_0[x^l]" and "DB[x]"): REJECTED — FALSE POSITIVE**

The fact-checker claims the notes blend proof-text (p.20) notation with Figure 6 notation, flagging P_0 and x as wrong for the p.20 context. However, the notes do not purport to quote the p.20 proof verbatim — they paraphrase the table-update step. More importantly, the notation the notes use (P_0[x^l], DB[x]) matches Figure 6 (p.18) exactly: Reconstruct step 2 reads `T_j ← (k', P_0[x^l] ⊕ DB[x])`. The notes are technically correct and consistent with the primary protocol specification. The p.20 proof uses x_1 and drops the subscript on P only because it is referring to the first query specifically; the general form in Figure 6 uses x and P_0. No error is present in the notes.

---

**Updated summary:** 3 issues reviewed — 2 CONFIRMED (both Minor), 1 REJECTED. Original count of 3 Minor / 0 Incorrect stands; net confirmed issues: 2 Minor.
