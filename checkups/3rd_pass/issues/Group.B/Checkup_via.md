## VIA (2025) — 3rd Pass Fact-Check

**Notes:** `VIA_2025_notes.md`
**PDF:** `VIA_2025_2074.pdf`
**Claims checked:** 61 | **Issues found:** 3 | **Minor:** 2 | **Incorrect:** 1

---

### INCORRECT Findings

**1. HintlessPIR Offline Comp (32 GB) shown as "--" but PDF reports 9252.3 s**

Notes (Performance Benchmarks, Table 1, 32 GB section):
> `| Offline Comp | -- | 315.231 s | 33.34 s | 3376.47 s | 1101.33 s | 67.539 s |`

PDF Table 1 (p.18): The 32 GB row for HintlessPIR Offline Comp reads **9252.3 s**. The 1 GB and 4 GB rows for HintlessPIR Offline Comp are blank (–), which the notes correctly transcribe. But the 32 GB entry is a populated value in the table, not a dash.

The notes omit 9252.3 s and substitute "--", making it appear HintlessPIR has no reported offline computation for 32 GB when the paper measures it at over 2.5 hours.

---

### MINOR Issues

**1. [^3] cites Section 4.2 (p.13) for "87.6x" but that section states "87.7×"**

Notes [^3] (Core Idea section and footnote text):
> "achieving 87.6x smaller queries than Respire for a 32 GB database"
> `Section 4.2 (p.13): VIA-C's LWE-to-RLWE conversion reduces queries to ... For a 32 GB database, VIA-C's query size is only 0.659 KB vs. Respire's 57.77 KB.`

PDF Section 4.2 (p.13): "the query size is only 0.659 KB, whereas the state-of-the-art communication-efficient PIR Respire requires 57.77 KB (**87.7× larger**)."

The number 87.6x appears in Section 5.2 (p.17), not in Section 4.2 (p.13). The footnote cites Section 4.2 (p.13) but uses the figure from Section 5.2. The actual value in the cited section is 87.7x (the paper has a minor internal inconsistency between 87.6x in §5.2 and 87.7x in §1.1/§4.2, but the footnote should reflect what the cited section says).

---

**2. [^34] quote drops terminal phrase "in the one-hot vector length"**

Notes [^34]:
> `"VIA substitutes coefficient expansion techniques with DMux for generating the encrypted one-hot vector, introducing only logarithmic noise variance."`

PDF Section 3.1 (p.8): "VIA substitutes coefficient expansion techniques with DMux for generating the encrypted one-hot vector, introducing only logarithmic noise variance **in the one-hot vector length**."

The dropped phrase is not semantically neutral — it specifies that the logarithmic scaling is with respect to the one-hot vector length (i.e., I), distinguishing it from noise scaling in other dimensions.

---

### Reviewer Verdict

**INCORRECT Finding 1 — HintlessPIR Offline Comp (32 GB) shown as "--" but PDF reports 9252.3 s**

CONFIRMED. PDF Table 1 (p.18) is unambiguous: the 32 GB HintlessPIR Offline Comp cell reads 9252.3 s. The 1 GB and 4 GB rows for that column are genuinely blank (–), which the notes transcribe correctly, but the 32 GB cell is populated. The notes substitute "--" for a real measured value of over 2.5 hours, which is a factual misrepresentation of the paper's data. Severity: Incorrect — stands as reported.

---

**MINOR Issue 1 — [^3] cites Section 4.2 (p.13) for "87.6x" but that section states "87.7×"**

PARTIALLY CONFIRMED, with a correction to the fact-checker's reasoning.

The core problem identified — that [^3] cites the wrong section — is confirmed. The figure "87.6×" appears in Section 5.2 (p.17), not in Section 4.2. The footnote text in the notes cites "Section 4.2 (p.13)" while the number "87.6×" is taken from Section 5.2 (p.17). This is a genuine citation error.

However, the fact-checker's secondary claim — that Section 4.2 (p.13) states "87.7×" — cannot be verified from the PDF. Pages 12–13 (which contain Section 4.2) discuss CRot, RLWE-to-RGSW conversion, and query compression algorithms. Neither page contains the phrase "87.7× larger" or any equivalent ratio. Section 1.1 (pp.3–4) similarly does not use that figure. The "87.7×" value asserted by the fact-checker as appearing in the cited section has no textual basis in the pages reviewed. The paper's internal inconsistency between 87.6× and 87.7× may exist, but the fact-checker has not located where "87.7×" actually appears.

The finding is confirmed as a Minor issue solely on the grounds of wrong-section citation (§4.2 cited, §5.2 is the correct source). The claimed value discrepancy (87.6 vs 87.7) is not confirmed. Severity: Minor — stands, but with the "87.7×" sub-claim withdrawn.

---

**MINOR Issue 2 — [^34] quote drops terminal phrase "in the one-hot vector length"**

CONFIRMED. PDF p.8 (Section 3.1) reads verbatim: "VIA substitutes coefficient expansion techniques with DMux for generating the encrypted one-hot vector, introducing only logarithmic noise variance in the one-hot vector length." The notes quote stops at "noise variance" and omits "in the one-hot vector length." The omission is semantically meaningful — it removes the specification that the logarithmic scaling is in the one-hot vector length I, not in some other dimension. Severity: Minor — stands as reported.

---

**Updated summary:** All 3 issues confirmed. INCORRECT count: 1, Minor count: 2. No findings rejected. The fact-checker's secondary sub-claim within Minor Issue 1 (that §4.2 contains "87.7×") is not supported by the PDF and is withdrawn, but the primary citation-error finding remains valid and the Minor classification is appropriate.
