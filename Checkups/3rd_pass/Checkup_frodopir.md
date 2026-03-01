## FrodoPIR (2022) — 3rd Pass Fact-Check

**Notes:** `frodopir_2022_notes.md`
**PDF:** `FrodoPIR_2022_981.pdf`
**Claims checked:** 35 | **Issues found:** 5 | **Minor:** 1 | **Incorrect:** 4

---

### INCORRECT Findings

**1. Financial cost formula: online component exponent is wrong (three occurrences)**

Three places in the notes state the FrodoPIR per-query online cost as `$1.3 * 10^{-3}`:

- [^core] (Core Idea section): "FrodoPIR's amortized financial cost is $(1.9/C * 10^{-2} + 1.3 * 10^{-3}) per query for C clients"
- Comparison table (vs. Stateful PIR Schemes): FrodoPIR financial cost per query listed as `$(1.9/C * 10^-2 + 1.3*10^-3)`
- [^unc3] (Uncertainties section): "the online component (1.3*10^-3) appears independent of C"

PDF Table 1 (p. 6): The FrodoPIR financial formula reads $(1.9/C \times 10^{-2} + 1.3 \times 10^{-5})$.

The exponent on the second term is **-5**, not -3. The online per-query cost is $1.3 × 10^{-5}$ (cents), not $1.3 × 10^{-3}$ (cents). This is a two-order-of-magnitude error that recurs in all three locations.

---

**2. SOnionPIR financial cost attributed to wrong scheme**

[^core] (Core Idea section): "compared to $8.8 * 10^{-5} per query for SOnionPIR (which scales with C)"

Comparison table: SOnionPIR financial cost listed as `$8.8*10^-5 (scales with C)`

PDF Table 1 (p. 6): SOnionPIR's financial cost is **$6.4 × 10^{-4}**. The value $8.8 × 10^{-5}$ is the financial cost of **PSIR** (and approximately CHKPIR, marked with †). The notes have attributed PSIR's financial cost to SOnionPIR.

---

**3. PSIR and SOnionPIR security levels swapped in Comparison table**

Comparison table (vs. Stateful PIR Schemes):
- Notes list SOnionPIR security as `<= 115 bits`
- Notes list PSIR security as `<= 111 bits`

PDF p. 6: "PSIR and SOnionPIR provide 115 and 111 bits of security, respectively [62, 65]."

The assignment is reversed. Per the PDF: **PSIR = 115 bits**, **SOnionPIR = 111 bits**. The notes have them swapped.

---

**4. Wrong database size label in Table 7 (30 KB row)**

Table 7 (p. 26 comparison with Spiral): The notes label the 30 KB row as `2^14 x 30 KB`.

PDF Table 7 (p. 26): The row with 30 KB elements corresponds to a database of **2^18 × 30KB**, not 2^14 × 30KB. The three database configurations in Table 7 are: 2^20 × 256B, **2^18 × 30KB**, and 2^14 × 100KB. The notes correctly identify the other two rows but mislabel this one.

---

### MINOR Issues

**1. [^tradeoff3] — 3x overhead comparison conflates two separate PDF claims**

Notes say (Section Key Tradeoffs & Limitations): "This 3x overhead is comparable to RLWE schemes that store DB in NTT form (typically 2x overhead)."

PDF p. 8: "Such database transformations are common in PIR: RLWE-based schemes usually store their database in a format that allows using number-theoretic transform operations easily; **and** store database elements as FHE ciphertexts which can lead to a 2× increase in database storage."

The PDF describes two distinct sources of storage overhead in RLWE schemes (NTT format storage, and FHE ciphertext expansion), and attributes the "2×" specifically to FHE ciphertext storage — not to NTT form alone. The notes compress this into a single claim attributing 2x overhead to NTT form, which slightly misrepresents the source sentence.

---

### Reviewer Verdict

All four INCORRECT findings and the one MINOR finding were verified against the PDF and notes. No false positives found. Summary counts stand as reported.

---

**INCORRECT 1 — Financial cost exponent (-3 vs -5): CONFIRMED**

Verified directly in PDF Table 1 (p. 6). The FrodoPIR financial column reads `$(1.9/C × 10^{-2} + 1.3 × 10^{-5})` — the exponent on the online term is unambiguously **-5**. The notes carry `-3` in all three locations ([^core] line 72, comparison table line 365, [^unc3] line 446). Two-order-of-magnitude error, three occurrences. Genuine.

**INCORRECT 2 — SOnionPIR financial cost attributed to wrong scheme: CONFIRMED**

Verified in PDF Table 1 (p. 6). SOnionPIR's financial cost is `$6.4 × 10^{-4}`; `$8.8 × 10^{-5}` belongs to PSIR (with CHKPIR marked `~$8.8 × 10^{-5}†`). The notes [^core] and the comparison table both assign `$8.8 × 10^{-5}` to SOnionPIR — PSIR's value. Genuine misattribution.

**INCORRECT 3 — PSIR and SOnionPIR security levels swapped: CONFIRMED**

Verified in PDF p. 6 body text: "PSIR and SOnionPIR provide 115 and 111 bits of security, respectively." The notes comparison table (line 357) lists SOnionPIR as `<= 115 bits` and PSIR as `<= 111 bits` — the inverse of the PDF. Genuine transposition.

**INCORRECT 4 — Wrong database size label in Table 7 (30 KB row): CONFIRMED**

Verified in PDF Table 7 (p. 26). The three database rows are `2^20 × 256B`, `2^18 × 30KB`, and `2^14 × 100KB`. The notes (line 290) label the 30 KB row as `2^14 x 30 KB`; the correct label is `2^18 × 30KB`. The other two rows are correctly identified. Genuine mislabel.

**MINOR 1 — [^tradeoff3] conflates two PDF claims about RLWE storage overhead: CONFIRMED**

Verified in PDF p. 8. The PDF sentence lists two separate things RLWE schemes do: (1) store the database in NTT format, and (2) store elements as FHE ciphertexts, with the 2x overhead attributed specifically to the latter. The notes [^tradeoff3] (line 346) compresses this into "RLWE schemes that store DB in NTT form (typically 2x overhead)", wrongly associating the 2x figure with NTT storage rather than FHE ciphertext expansion. The misattribution is real, though the practical significance is limited since the note's broader point (that 3x is comparable to known RLWE overhead) remains directionally correct.
