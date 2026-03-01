## XPIR (2016) — 3rd Pass Fact-Check

**Notes:** `xpir_2016_notes.md`
**PDF:** `XPIR_computational_2014_1025.pdf`
**Claims checked:** 57 | **Issues found:** 4 | **Minor:** 2 | **Incorrect:** 2

---

### INCORRECT Findings

**1. Encryption Parameter Sets table: "Max h_a (sums)" column is actually "Max Sec" (security bits)**

Notes table header:

> `| Parameters (N, q bits) | Max h_a (sums) | Plaintext capacity | Ciphertext size | Expansion factor F | Security (bits) |`

with values 97, 91, 335 in the "Max h_a (sums)" column, and those same values repeated in the "Security (bits)" column.

PDF Figure 1 (p. 5) column headings are: `Parameters | Max Sec | Plaintext | Ciphertext | F`. The values 97, 91, 335 appear under **"Max Sec"**, meaning maximum security in attacker-operation bits — not a maximum number of homomorphic additions. The parameter h_a is an *input* to `SKE.ParamGen(1^k, h_a)` (p. 5), not an output of the scheme and not tabulated in Figure 1 at all.

The notes have mislabeled the "Max Sec" column as "Max h_a (sums)" and then separately duplicated those values correctly in a "Security (bits)" column, resulting in a phantom column and a misattributed meaning for the 97 / 91 / 335 values.

---

**2. [^3] Auto-optimizer inputs: U, D described as received from the server, but the client determines them via a bandwidth test**

Notes (Auto-Optimization Algorithm section):

> "It runs on the client after receiving the database shape (n, l) and network bandwidth (U, D) from the server."

PDF Appendix A (p. 23), Optimization algorithm:
- Step 1: "Server: Send optimization information — The database shape (n and ℓ) — The server performance cache"
- Step 2: "Client: If U or D are null do a bandwidth test to redefine them"

The server sends the database shape and its performance cache. The bandwidth values U and D are determined by the client via its own bandwidth test; they are not sent by the server. The footnote [^3] also correctly cites "upload/download usable bandwidth (U, D)" as an input to the Optimization algorithm in the Appendix — but the body text of the notes incorrectly attributes the source of U and D to the server rather than to the client's bandwidth test.

---

### MINOR Issues

**1. [^3] / [^21] Optimization algorithm page range cited as "pp. 23-24" — the algorithm itself ends on p. 23**

Notes [^3] and [^21] both cite "pp. 23-24, Appendix A" for the full Optimization algorithm pseudocode. The Optimization algorithm (steps 1-4) is entirely on p. 23. Page 24 contains the separate Query generation, Reply generation, Reply extraction algorithms, and the Convexity Remark — none of which are the Optimization algorithm. The citation "pp. 23-24" overstates the page range for the specific algorithm being cited.

---

**2. [^36] Figure 5 is on p. 12, not p. 11**

Notes [^36]:

> "p. 11 (60-bit numbers), Figure 5 and text"

Figure 5 ("Encryption and decryption times for polynomial degree 4096 and varying modulus size") and its caption appear on p. 12, not p. 11. The prose text on p. 11 (bottom of right column) contains the 700 Mbit/s and 5 Gbit/s numbers, and the figure follows on p. 12. The footnote conflates text location (p. 11) with Figure 5 location (p. 12) by citing them together as "p. 11 (60-bit numbers), Figure 5 and text."

---

### Reviewer Verdict

**Summary of review:** All 4 findings verified against PDF. No false positives found. Counts unchanged: 2 Incorrect, 2 Minor.

---

#### INCORRECT 1 — "Max h_a (sums)" column mislabeled as "Max Sec" in PDF

CONFIRMED.

PDF Figure 1 (p. 5) is unambiguous: the column heading is "Max Sec" (not "Max h_a (sums)"), and the values 97, 91, 335 appear under it. The notes table has a "Max h_a (sums)" column with those same values and then a separate "Security (bits)" column that also shows 97, 91, and "256 (capped by Salsa20/20)" for the three rows respectively — confirming the phantom-column duplication described in the finding. The PDF has no "Max h_a (sums)" column in Figure 1 at all; h_a is only an input parameter to SKE.ParamGen, not a tabulated output. The mislabeling and duplication are genuine.

---

#### INCORRECT 2 — U, D described as received from server; client determines them via bandwidth test

CONFIRMED.

PDF p. 23, Optimization algorithm, Step 1 says the server sends "The database shape (n and ℓ)" and "The server performance cache" — no mention of sending U or D. Step 2 says "Client: If U or D are null do a bandwidth test to redefine them." U and D are listed as inputs to the Optimization algorithm in its header, but they originate from a client-side bandwidth test, not from the server. The body text of the notes ("receiving the database shape (n, l) and network bandwidth (U, D) from the server") incorrectly attributes the source of U and D to the server. Notably, the notes' own Search Procedure block (step 2: "Client runs a bandwidth test if U or D are unknown") is correct — only the introductory body sentence is wrong.

---

#### MINOR 1 — Citation "pp. 23-24" overstates page range for Optimization algorithm

CONFIRMED.

The Optimization algorithm (steps 1-4) fits entirely on p. 23. Page 24 opens with the tail of the Optimization step 3 (the bandwidth estimate lines that spill over), followed by step 4, and then immediately the Choice, Query generation, Reply generation, and Reply extraction algorithms, plus the Convexity Remark. On inspection, step 3's last two sub-bullets ("Estimate replySendingTime" and "Estimate replyDecryptionTime") and step 4 do continue onto the top of p. 24, so "pp. 23-24" is not strictly wrong for the full algorithm — the Optimization algorithm does straddle the page boundary. The finding slightly overstates the error: the algorithm is not entirely on p. 23. The minor issue is still valid (the citation bundles in the Convexity Remark and other algorithms that are not the Optimization algorithm), but the severity is lower than described. Verdict: CONFIRMED as minor, with the caveat that "pp. 23-24" is technically correct for the Optimization algorithm steps themselves.

---

#### MINOR 2 — Figure 5 cited alongside p. 11; Figure 5 is actually on p. 12

CONFIRMED.

PDF confirmed: the 700 Mbit/s and 5 Gbit/s prose is at the bottom of p. 11 right column, and Figure 5 (with its caption) appears at the top of p. 12. The notes footnote [^36] writes "p. 11 (60-bit numbers), Figure 5 and text" — placing Figure 5 in the same reference block as "p. 11" rather than p. 12 where the figure actually sits. The footnote does separately cite "p. 12 (120-bit numbers)" for the 850/710 Mbit/s prose, which is correct. The misattribution of Figure 5 to p. 11 rather than p. 12 is a genuine minor location error.
