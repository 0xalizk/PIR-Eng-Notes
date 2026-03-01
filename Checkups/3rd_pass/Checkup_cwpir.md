## CwPIR (2022) — 3rd Pass Fact-Check

**Notes:** `cwpir_2022_notes.md`
**PDF:** `FastPIR_orig_arxiv_2202.07569.pdf`
**Claims checked:** 51 | **Issues found:** 3 | **Minor:** 2 | **Incorrect:** 1
**Reviewer verdict:** Issues confirmed: 2 | Minor: 1 | Incorrect: 1 | Rejected (false positive): 1

---

### INCORRECT Findings

**[^7] and Table 6 (notes) — Arithmetic Folklore depth written as ceil, but Table 3 shows floor**

Notes ([^7]) state:

> "Arithmetic Folklore: {0,1}^l domain, 2l * M operations, depth 1 + ceil(log_2 l)."

The same ceil notation appears implicitly in the Primitive 2 table (which cites [^7]) and in the Table 3 transcription in the notes.

PDF Table 3 (p. 9) shows the multiplicative depth of Arithmetic Folklore as **1 + ⌊log₂ ℓ⌋** (floor), not 1 + ⌈log₂ ℓ⌉ (ceil). The floor brackets are visually distinct in the table.

Note: the PDF body text at p. 5 (defining f_AF) states "1 + ⌈log₂ ℓ⌉" (ceil). So there is an internal inconsistency within the paper itself between the body prose and Table 3. The footnote explicitly cites Table 3 as its source ("Table 3, p. 9"), making the ceil transcription inaccurate relative to the cited source. The notes should either reflect Table 3's floor notation or note the discrepancy between p. 5 text and Table 3.

---

### MINOR Issues

**[^33] — Dropped word "time" in quote**

Notes quote (Section 6, p. 13–14):

> "Initially, for log_2 |S| <= 27, k = 2 has the smallest server time. However, when log_2 |S| approaches 28, the expansion constitutes a significant portion of the server time and a switch to k = 3 results in a smaller total server time."

PDF p. 14 reads:

> "Initially, for log₂|S| ≤ 27, k = 2 has the smallest server time. However, when log₂|S| approaches 28, the **expansion time** constitutes a significant portion of the server time and a switch to k = 3 results in a smaller total server time."

The word "time" after "expansion" is dropped in the notes' version of the quote.

---

**Table 6 (notes) — Folklore PIR multiplicative depth incorrectly transcribed**

Notes table (Section "Comparison with Prior Work") lists Folklore PIR's multiplicative depth as:

> `ceil(log_2 n)`

PDF Table 6 (p. 11) gives the Fl. PIR multiplicative depth as **⌈log₂⌈log₂ n⌉⌋** (i.e., approximately floor/ceil of log₂ of log₂ n — the depth of the plain folklore equality operator applied to an index of bit-length ⌈log₂ n⌉). This is a log-of-log expression, not a plain log. The notes omit the outer log, making the entry read as O(log n) depth when it is actually O(log log n) depth.

This is consistent with the paper's construction: Folklore PIR encodes indices as binary strings of length ℓ = ⌈log₂ n⌉, and the plain folklore equality operator over {0,1}^ℓ has multiplicative depth ⌈log₂ ℓ⌉ = ⌈log₂⌈log₂ n⌉⌋. The notes collapse this to ceil(log_2 n), which is the bit-length of the index, not the circuit depth.

---

### Reviewer Verdict

**Summary of changes:** 1 issue REJECTED (downgraded to false positive), 1 issue severity upgraded from MINOR to INCORRECT. Revised counts: **Issues found: 2 | Minor: 1 | Incorrect: 1**.

---

**[^7] / Arithmetic Folklore depth (ceil vs floor) — REJECTED (false positive)**

The fact-checker claimed Table 3 uses floor brackets `⌊log₂ ℓ⌋`, creating a discrepancy with the notes' ceil notation. This is incorrect.

The PDF body text at p. 5 (Arithmetic Folklore Equality Operator section) unambiguously states: "The multiplicative depth of a circuit realizing this operator is equal to 1 + ⌈log₂ ℓ⌉." The typeset brackets in Table 3 are small and visually ambiguous in the PDF rendering — they do not reliably distinguish floor from ceiling. The definitive authoritative statement is the body prose at p. 5, which says ceil and matches the notes exactly. There is no internal inconsistency in the paper; the alleged floor reading of Table 3 is a misread of ambiguous typesetting. The notes' use of ceil is correct.

**Verdict: REJECTED. No error in the notes.**

---

**[^33] — Dropped word "time" in quote — CONFIRMED, severity MINOR**

Confirmed. The PDF (p. 14) reads "the expansion **time** constitutes a significant portion of the server time" and the notes omit the word "time" after "expansion". The core technical meaning is not changed — the reader understands the expansion step is what's growing — but the quote is not verbatim. MINOR classification is appropriate.

**Verdict: CONFIRMED. Severity: MINOR.**

---

**Table 6 (notes) — Folklore PIR multiplicative depth log-of-log — CONFIRMED, severity upgraded to INCORRECT**

Confirmed. PDF Table 6 (p. 11) shows Fl. PIR multiplicative depth as `⌈log₂⌈log₂ n⌉⌋`. The notes write `ceil(log_2 n)`. This is not a formatting variation — it is a qualitatively wrong mathematical expression. The notes give the bit-length of the index (O(log n)), not the circuit depth (O(log log n)).

The magnitude of error is significant: at n = 2^32, the notes imply depth 32 while the paper gives depth ⌈log₂ 32⌉ = 5. This is a ~6x discrepancy and misrepresents the key comparative property of Folklore PIR in the table whose entire purpose is to compare multiplicative depths across schemes. Dropping an outer log in an asymptotic depth expression meets the INCORRECT threshold ("wrong numerical value, >2x off" per SKILL.md; "dropping log factors" is explicitly listed as an asymptotic notation error warranting INCORRECT classification).

The fact-checker's MINOR classification was too lenient. This is the same class of error as writing O(n) when the paper says O(√n).

**Verdict: CONFIRMED. Severity upgraded from MINOR to INCORRECT.**
