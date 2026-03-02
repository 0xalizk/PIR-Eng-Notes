## Group D — 3rd Pass Fixes Applied

---

### CK20 (3 fixes)

**Fix 1 — MINOR: [^29] paraphrase in quotation marks**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^29]
- Old value: `"distinguishing the output from 2^{-λ}"`
- New value: Removed quotation marks and changed to paraphrase format: the punctured PRF evaluation at the punctured point is negligibly close to 2^{-lambda} (paraphrase of the security property described on p.14).
- Rationale: The text was a paraphrase, not a verbatim quote. Quotation marks were misleading.

**Fix 2 — MINOR: [^36] "and lower bound" should be "and online time"**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^36]
- Old value: `"and lower bound"`
- New value: `"and online time"`
- Rationale: The PDF says "and online time" in the relevant passage.

**Fix 3 — MINOR: GGM set key length "O(lambda log n)" should be "lambda + O(log n)"**

- Issue ref: Checkup MINOR Issue 3
- Location: Built from field in Novel Primitives section
- Old value: `keys of length O(lambda log n)`
- New value: `keys of length lambda + O(log n)`
- Rationale: The GGM PRF key is lambda bits; the punctured key adds O(log n) sibling seeds, each of lambda bits, but the key length description refers to the base key, which is lambda + O(log n) bits for the punctured form.

---

### IncPIR (4 fixes)

**Fix 1 — INCORRECT: Response size "2 KB" should be "32 B"**

- Issue ref: Checkup INCORRECT Finding 1
- Location: Core metrics table, Response size row
- Old value: `2 KB (optimal)`
- New value: `32 B (optimal)`
- Rationale: The response is a single database entry (256 bits = 32 bytes at the benchmark parameters). 2 KB was incorrect.

**Fix 2 — MINOR: [^52] removed word "incremental" from paraphrased quote**

- Issue ref: Checkup MINOR Issue 1
- Location: Open Problems section body text and footnote [^52]
- Old value: `"designing efficient incremental preprocessing"`
- New value: `"designing efficient preprocessing"`
- Rationale: The PDF does not include the word "incremental" in this passage.

**Fix 3 — MINOR: [^32] "Section 6.2" should be "Section 8.3"**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^32]
- Old value: `Section 6.2 (p.14)`
- New value: `Section 8.3 (p.14)`
- Rationale: The relevant content is in Section 8.3, not Section 6.2.

**Fix 4 — MINOR: Inline citation "(Definition 4, p.8)" should be "(Definition 4, p.7-8)"**

- Issue ref: Checkup MINOR Issue 3
- Location: Inline citation in body text
- Old value: `(Definition 4, p.8)`
- New value: `(Definition 4, p.7-8)`
- Rationale: Definition 4 spans pages 7-8 in the PDF.

---

### IshaiShiWichs (2 fixes)

**Fix 1 — INCORRECT: [^12] "8 associated parity bits" should be "O(n^{1/6}) associated parity bits"**

- Issue ref: Checkup INCORRECT Finding 1
- Location: Hint table description (body text) and footnote [^12]
- Old value (body): `each with 8 associated parity bits (full set parity plus 7 'planar set' parities...)`
- New value (body): `each with 1 + |X_i| + |Y_i| + |Z_i| = O(n^{1/6}) associated parity bits (full set parity plus all 'planar set' parities...)`
- Old value ([^12]): described 8 parities per hint
- New value ([^12]): describes O(n^{1/6}) parities per hint, referencing Fact 4.1
- Rationale: Each hint has parities for all planar sets along each axis, not just 7. The count is 1 + |X_i| + |Y_i| + |Z_i| = O(n^{1/6}).

**Fix 2 — MINOR: [^21] "O(log n) bits" should be "O-tilde(1) bits"**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^21]
- Old value: `O(log n) bits`
- New value: `O-tilde(1) bits`
- Rationale: The PDF states the amortized communication is O-tilde(1) bits, not O(log n).

---

### Piano (3 fixes)

**Fix 1 — MINOR: [^38] "(LAN)" should be "(WAN)"**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^38]
- Old value: `(LAN)`
- New value: `(WAN)` with added LAN speedup info
- Rationale: The benchmark figure cited was for WAN, not LAN.

**Fix 2 — MINOR: [^51] "p.16" should be "p.15"**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^51]
- Old value: `Section 5 (p.16)`
- New value: `Section 5 (p.15)`
- Rationale: The relevant content is on p.15, not p.16.

**Fix 3 — MINOR: [^16] loop variable j should be i in Figure 1 quote**

- Issue ref: Checkup MINOR Issue 3
- Location: Footnote [^16]
- Old value: `for each chunk j and k in [M_2], let p_bar_{j,k}`
- New value: `for i in {0, 1, ..., sqrt(n)-1}/{j} and k in [M_2], let p_bar_{i,k}`
- Rationale: The PDF uses loop variable i (iterating over chunks other than j), not j.

---

### Plinko (2 fixes)

**Fix 1 — MINOR: [^7] "p.10" should be "p.10-11"**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^7]
- Old value: `Definition 4.1 (p.10)`
- New value: `Definition 4.1 (p.10-11)` with note that the quoted text is on p.11
- Rationale: The definition begins on p.10 but the quoted passage is on p.11.

**Fix 2 — MINOR: [^43] should cite both Figure 1 and Figure 2**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^43]
- Old value: Cited only Figure 1
- New value: Added `Figure 2 (p.3): Comparison table of update time and update communication (worst-case and amortized).`
- Rationale: The update metrics referenced in the footnote come from Figure 2, not Figure 1.

---

### RMS24 (16 fixes)

**Fix 1 — INCORRECT: Core Idea response overhead 2x/4x reversed + single-server is O(sqrt(N)/lambda)**

- Issue ref: Checkup INCORRECT Finding 1 (location 1 of 3)
- Location: Core Idea section, body text
- Old value: `2x the insecure baseline for two servers, 4x for one server`
- New value: `4x the insecure baseline for two servers; single-server response overhead is O(sqrt(N)/lambda)`
- Rationale: Section 3.6 says "4x to be precise" for two-server; single-server is O(sqrt(N)/lambda), not 4x.

**Fix 2 — INCORRECT: Complexity table response overhead reversed**

- Issue ref: Checkup INCORRECT Finding 1 (location 2 of 3)
- Location: Complexity section, Core metrics table, Response overhead row
- Old value: `2x insecure baseline (two-server); 4x (single-server)`
- New value: `4x insecure baseline (two-server); O(sqrt(N)/lambda) (single-server)`

**Fix 3 — INCORRECT: [^28] content and page reference**

- Issue ref: Checkup INCORRECT Finding 1 (location 3 of 3)
- Location: Footnote [^28]
- Old value: Referenced 2x/4x with incorrect page
- New value: Updated to describe 4x for two-server and O(sqrt(N)/lambda) for single-server, corrected page to p.8

**Fixes 4-16 — MINOR: Systematic page-number offset from Section 3.4 onward (13 footnotes)**

- Issue ref: Checkup MINOR Finding 1
- All footnotes from Section 3.4 onward cited page numbers one too high. Each was decremented by 1.

| Footnote | Section | Old page | New page |
|----------|---------|----------|----------|
| [^9] | 3.4 | p.7 | p.6 |
| [^17] | 3.4 | p.7 | p.6 |
| [^31] | 3.4 | p.7-8 | p.6-7 |
| [^1] | 3.5 | p.8 | p.7 |
| [^10] | 3.5 | p.8 | p.7 |
| [^14] | 3.5 | p.8 | p.7 |
| [^22] | 3.5 | p.8 | p.7 |
| [^23] | 3.5 | p.8 | p.7 |
| [^24] | 3.5 | p.9 | p.8 |
| [^25] | 3.5 | p.8-9 | p.7-8 |
| [^8] | 3.6 | p.9 | p.8 |
| [^19] | 3.6 | p.9 | p.8 |
| [^21] | 3.6 | p.9 | p.8 |
| [^28] | 3.6 | p.10 | p.8 |
| [^13] | 4.1 | p.9 | p.8 |
| [^18] | 4.1 | p.9 | p.8 |
| [^37] | 4.1 | p.10 | p.9 |
| [^38] | 4.1 | p.9 | p.8 |
| [^39] | 4.1 | p.9-10 | p.8-9 |
| [^40] | 4.1 | p.9 | p.8 |
| [^41] | 4.1 | p.9 | p.8 |
| [^42] | 4.1 | p.9-10 | p.8-9 |
| [^32] | 4.2 | p.10 | p.9 |
| [^33] | 4.3 | p.10 | p.9 |
| [^34] | 4.3 | p.11 | p.10 |
| [^27] | Table 2 | p.11 | p.10 |
| [^29] | Table 3 | p.11 | p.10 |
| [^30] | Table 3 | p.11 | p.10 |

**Fix 16 — MINOR: [^12] page range p.3-4 overstated**

- Issue ref: Checkup MINOR Finding 2
- Location: Footnote [^12]
- Old value: `Section 2 (p.3-4)`
- New value: `Section 2 (p.3)`
- Rationale: The PRF discussion is contained entirely on p.3; Section 3 begins on p.4.

---

### SinglePass (2 fixes)

**Fix 1 — MINOR: [^15] "p.9" should be "p.8"**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^15]
- Old value: `Theorem 3.1 (p.9 and p.16)`
- New value: `Theorem 3.1 (p.8 and p.16)`
- Rationale: Theorem 3.1 is stated on p.8, not p.9. Page 9 contains only Figure 3.

**Fix 2 — MINOR: [^29] "p.9" should be "p.8"**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^29]
- Old value: `Theorem 3.1 (p.9)`
- New value: `Theorem 3.1 (p.8)`
- Rationale: Same underlying error as Fix 1.

---

### TreePIR (2 fixes)

**Fix 1 — MINOR: [^14] DDH attribution wrong**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^14]
- Old value: `The DDH assumption comes from this scheme [19] combined with [16].`
- New value: `The DDH assumption comes from [16]; [19] is the single-server PIR scheme that relies on it.`
- Rationale: The PDF attributes the DDH assumption solely to [16]. Reference [19] is the PIR scheme being recursed into, not a source of the DDH assumption.

**Fix 2 — MINOR: [^43] "online server time" should be "online time"**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^43] and corresponding body text
- Old value: `online server time`
- New value: `online time`
- Rationale: The PDF says "online time," not "online server time." The word "server" was inserted in the paraphrase.

---

### WangRen (3 fixes)

**Fix 1 — MINOR: [^23] p.21 should be p.22**

- Issue ref: Checkup MINOR Issue 1
- Location: Footnote [^23]
- Old value: `Section 4.3 (p.21)`
- New value: `Section 4.3 (p.22)`
- Rationale: The client storage paragraph is on p.22, not p.21.

**Fix 2 — MINOR: [^35] p.27 should be p.26**

- Issue ref: Checkup MINOR Issue 2
- Location: Footnote [^35]
- Old value: `Appendix A.2 (p.27)`
- New value: `Appendix A.2 (p.26)`
- Rationale: The PRP passage and Lemma A.4 are on p.26, not p.27.

**Fix 3 — MINOR: Protocol Phases table query description imprecise**

- Issue ref: Checkup MINOR Issue 3
- Location: Protocol Phases table, Query row, Operation column
- Old value: `replacing j*-th entry with a random element`
- New value: `replacing j*-th entry with DS_{j*}.Access(r*) where r* is a uniformly random unconsumed column (may return bottom if the position is empty)`
- Rationale: The replacement is specifically DS_{j*}.Access of a random unconsumed column, which may yield bottom (empty cell). Describing it as "a random element" omits the mechanism and the possibility of bottom.

---

### Summary

| Scheme | INCORRECT fixes | MINOR fixes | Total fixes |
|--------|----------------|-------------|-------------|
| CK20 | 0 | 3 | 3 |
| IncPIR | 1 | 3 | 4 |
| IshaiShiWichs | 1 | 1 | 2 |
| Piano | 0 | 3 | 3 |
| Plinko | 0 | 2 | 2 |
| RMS24 | 3 | 13 | 16 |
| SinglePass | 0 | 2 | 2 |
| TreePIR | 0 | 2 | 2 |
| WangRen | 0 | 3 | 3 |
| **Total** | **5** | **32** | **37** |

Note: RMS24 INCORRECT Finding 1 (response overhead reversal) was replicated across 3 distinct locations in the notes (Core Idea, Complexity table, footnote [^28]), counting as 3 individual fixes. RMS24 MINOR Finding 1 (systematic page offset) affected 28 footnotes from Section 3.4 onward, each individually corrected. The [^28] footnote was affected by both the INCORRECT finding (content correction) and the MINOR finding (page offset), and both were applied. Four checkup findings were rejected as false positives and not fixed: CK20 INCORRECT Finding 1, IshaiShiWichs [^20], RMS24 [^4], and TreePIR [^26].
