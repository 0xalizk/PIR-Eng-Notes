## Group A (FHE Based PIR) -- 3rd Pass Fixes Applied

**Date:** 2026-03-02
**Schemes fixed:** 11
**Total edits applied:** 28 individual changes across 11 files

---

### SealPIR (5 fixes)

**File:** `Schemes/Group A - FHE Based PIR/sealpir_2018/sealpir_2018_notes.md`

1. **INCORRECT -- Comparison table XPIR(d=3) query size (cross-pass persistent)**
   - Location: Comparison with Prior Work table, XPIR (d=3) row
   - Old: `2,560 KB`
   - New: `4,064 KB`
   - Reason: Value was from n=262,144 row of Figure 9, not n=1,048,576

2. **INCORRECT -- Comparison table XPIR(d=3) client Query CPU (cross-pass persistent)**
   - Location: Comparison with Prior Work table, XPIR (d=3) row
   - Old: `8.03 ms`
   - New: `12.74 ms`
   - Reason: Same wrong-row error as above

3. **INCORRECT -- Comparison table XPIR(d=3) server CPU (cross-pass persistent)**
   - Location: Comparison with Prior Work table, XPIR (d=3) row
   - Old: `3.68 s`
   - New: `4.84 s`
   - Reason: Value unattested in Figure 9 for any XPIR(d=3) database size; correct value is Setup 2.32s + Answer 2.52s = 4.84s

4. **MINOR -- [^9] page reference (cross-pass persistent)**
   - Location: Footnote [^9]
   - Old: `p. 4`
   - New: `p. 3`
   - Reason: FV background preamble with F = 2*log(q)/log(t) is on p. 3, not p. 4

5. **MINOR -- [^8] "in EXPAND" word order (cross-pass persistent)**
   - Location: Footnote [^8]
   - Old: `the factor is always 1 in EXPAND (i.e., no noise growth) because...`
   - New: `the factor is always 1 (i.e., no noise growth) in EXPAND because...`
   - Reason: PDF has "in EXPAND" after the parenthetical, not before

---

### XPIR-2014 (2 fixes)

**File:** `Schemes/Group A - FHE Based PIR/xpir_2014/xpir_2014_notes.md`

1. **INCORRECT -- [^14] "per ciphertext" should be "per retrieval"**
   - Location: FHE-specific metrics table, Ciphertext size row
   - Old: `~32 KB per ciphertext (bundled)`
   - New: `~32 KB per retrieval (bundled)`
   - Reason: 32 KB is the per-retrieval bandwidth after normalizing by epsilon=1024, not per-ciphertext; one ciphertext is ~1 MB

2. **MINOR -- [^4] dropped [13] reference**
   - Location: Footnote [^4]
   - Old: `"We make use of the modified NTRU scheme introduced by Stehle and Steinfeld [12]...`
   - New: `"We make use of the modified NTRU scheme [13] introduced by Stehle and Steinfeld [12]...`
   - Reason: PDF distinguishes [13] (original NTRU by Hoffstein-Pipher-Silverman) from [12] (Stehle-Steinfeld modification)

---

### XPIR-2016 (3 fixes)

**File:** `Schemes/Group A - FHE Based PIR/xpir_2016/xpir_2016_notes.md`

1. **INCORRECT -- Encryption Parameter Sets table: mislabeled column + phantom duplicate**
   - Location: Encryption Parameter Sets table
   - Old: Column headed "Max h_a (sums)" with values 97/91/335, plus separate "Security (bits)" column with same values
   - New: Single column headed "Max Sec (bits)" with values 97/91/335 (capped at 256 by Salsa20/20 for 4096 row); duplicate Security column removed
   - Reason: PDF Figure 1 column is "Max Sec", not "Max h_a (sums)"; h_a is an input to ParamGen, not a tabulated output

2. **INCORRECT -- U, D bandwidth source misattributed to server**
   - Location: Auto-Optimization Algorithm section, introductory sentence
   - Old: `...receiving the database shape (n, l) and network bandwidth (U, D) from the server.`
   - New: `...receiving the database shape (n, l) and the server's performance cache from the server; the client determines upload/download bandwidth (U, D) via its own bandwidth test.`
   - Reason: PDF Appendix A Step 2 says client runs its own bandwidth test for U, D

3. **MINOR -- [^36] Figure 5 page reference (cross-pass persistent)**
   - Location: Footnote [^36]
   - Old: `p. 11 (60-bit numbers), Figure 5 and text`
   - New: `p. 11 (60-bit numbers, prose) and p. 12 (Figure 5)`
   - Reason: Figure 5 and its caption appear on p. 12, not p. 11; the prose is on p. 11

---

### MulPIR (1 fix)

**File:** `Schemes/Group A - FHE Based PIR/mulpir_2019/mulpir_2019_notes.md`

1. **INCORRECT -- [^12] G_2 base in Section 5.2 portion**
   - Location: Footnote [^12], Section 5.2 description of G_2
   - Old: `log_{2^{51}} Q`
   - New: `log_{2^{53}} Q`
   - Reason: PDF p.19 (Section 5.2) uses base 2^{53} for G_2; the value 2^{51} is the Appendix A.3 base (correctly retained in the Appendix portion of the same footnote)

---

### OnionPIR (1 fix)

**File:** `Schemes/Group A - FHE Based PIR/onionpir_2021/onionpir_2021_notes.md`

1. **MINOR -- Body text "AVX" should be "AVX2"**
   - Location: Implementation Notes, SIMD/vectorization bullet
   - Old: `AVX (via NFLLib integration)`
   - New: `AVX2 (via NFLLib integration)`
   - Reason: PDF Section 6.1 says "AVX2 specialization"; the notes' own footnote [^impl_avx] correctly says AVX2

---

### OnionPIRv2 (1 fix)

**File:** `Schemes/Group A - FHE Based PIR/onionpirv2_2025/onionpirv2_2025_notes.md`

1. **MINOR -- BFV decryption operation: round -> floor**
   - Location: Cryptographic Foundation table, Correctness condition row
   - Old: `round((c_0 + c_1 * s) / Delta)`
   - New: `floor((c_0 + c_1 * s) / Delta)`
   - Reason: PDF p.2 uses floor throughout for BFV decryption, not nearest-integer rounding

---

### Addra / FastPIR (2 fixes)

**File:** `Schemes/Group A - FHE Based PIR/addra_2021/addra_2021_notes.md`

1. **INCORRECT -- Record-size regime description**
   - Location: Header table, Record-size regime row
   - Old: `Small (96 bytes — one LPCNet voice frame encoding 40 ms audio)`
   - New: `Small (96 bytes — one 480 ms subround: 12 LPCNet frames of 8 bytes each)`
   - Reason: One LPCNet frame is 8 bytes (40 ms); 96 bytes = 12 frames = 480 ms subround

2. **MINOR -- Pung round trips missing ceiling function**
   - Location: System Context section, two-hop sentence
   - Old: `Pung's log_2(n+1) round trips`
   - New: `Pung's ⌈log_2(n+1)⌉ round trips`
   - Reason: PDF p.1 includes the ceiling operator ⌈·⌉

---

### CwPIR (2 fixes)

**File:** `Schemes/Group A - FHE Based PIR/cwpir_2022/cwpir_2022_notes.md`

1. **MINOR -- [^33] dropped word "time"**
   - Location: Footnote [^33]
   - Old: `the expansion constitutes a significant portion`
   - New: `the expansion time constitutes a significant portion`
   - Reason: PDF p.14 reads "the expansion time constitutes"

2. **INCORRECT (upgraded from MINOR) -- Table 6 Folklore PIR multiplicative depth**
   - Location: Table 6 (Protocol properties), Folklore PIR row, Mult Depth column
   - Old: `ceil(log_2 n)`
   - New: `⌈log₂⌈log₂ n⌉⌉`
   - Reason: PDF Table 6 shows a log-of-log expression (depth of the equality circuit over bit-length ⌈log₂ n⌉); the notes collapsed this to O(log n) when the actual value is O(log log n), a qualitative error (e.g., at n=2^32: notes imply depth 32, paper gives depth 5)

---

### Spiral (3 fixes)

**File:** `Schemes/Group A - FHE Based PIR/spiral_2022/spiral_2022_notes.md`

1. **MINOR -- [^12] Theorem 3.2 attribution**
   - Location: Footnote [^12]
   - Old: `Theorem 3.2 (p.14):`
   - New: `Section 3.2, introductory paragraph (p.14):`
   - Reason: The quoted sentence appears in the introductory prose of Section 3.2, not in Theorem 3.2 itself (which is the formal noise bound for RegevToGSW)

2. **MINOR -- Variants table SpiralStream public params upper bound**
   - Location: Variants table, SpiralStream row, Public Params column
   - Old: `344 KB--5 MB`
   - New: `344 KB--3 MB`
   - Reason: PDF p.2 and Table 2 (p.29) both give 344 KB to 3 MB; the notes' own [^26] and Key Tradeoffs section correctly state 3 MB

3. **MINOR -- Comparison with Prior Work table Spiral server time**
   - Location: Comparison with Prior Work table, Server time row
   - Old: `24.52 s`
   - New: `24.46 s`
   - Reason: The Comparison section corresponds to Table 2 (head-to-head vs SealPIR/FastPIR/OnionPIR), which gives 24.46 s; the value 24.52 s is from Table 3 (four-variant comparison). The per-variant benchmark tables correctly retain 24.52 s from Table 3.

---

### FrodoPIR (5 fixes, 8 individual edits)

**File:** `Schemes/Group A - FHE Based PIR/frodopir_2022/frodopir_2022_notes.md`

1. **INCORRECT -- Financial cost exponent (three occurrences)**
   - Locations: [^core] (line 72), Comparison table (line 365), [^unc3] (line 446)
   - Old: `1.3 * 10^{-3}` (or `1.3*10^-3`)
   - New: `1.3 * 10^{-5}` (or `1.3*10^-5`)
   - Reason: PDF Table 1 (p.6) gives the online term as 1.3 x 10^{-5}; the notes had a two-order-of-magnitude error

2. **INCORRECT -- SOnionPIR financial cost (two occurrences)**
   - Locations: [^core] (line 72), Comparison table (line 365)
   - Old: `$8.8 * 10^{-5}` for SOnionPIR
   - New: `$6.4 * 10^{-4}` for SOnionPIR
   - Reason: PDF Table 1 (p.6) gives SOnionPIR as $6.4 x 10^{-4}; the value $8.8 x 10^{-5} belongs to PSIR

3. **INCORRECT -- PSIR and SOnionPIR security levels swapped**
   - Location: Comparison table, Security level row
   - Old: SOnionPIR `<= 115 bits`, PSIR `<= 111 bits`
   - New: SOnionPIR `<= 111 bits`, PSIR `<= 115 bits`
   - Reason: PDF p.6 states "PSIR and SOnionPIR provide 115 and 111 bits of security, respectively"

4. **INCORRECT -- Table 7 row label**
   - Location: Table 7 comparison, 30 KB row label
   - Old: `2^14 x 30 KB`
   - New: `2^18 x 30 KB`
   - Reason: PDF Table 7 (p.26) configurations are 2^20 x 256B, 2^18 x 30KB, 2^14 x 100KB

5. **MINOR -- [^tradeoff3] NTT/FHE ciphertext conflation**
   - Location: Footnote [^tradeoff3]
   - Old: `RLWE schemes that store DB in NTT form (typically 2x overhead)`
   - New: `RLWE schemes that store database elements as FHE ciphertexts (typically 2x overhead from ciphertext expansion)`
   - Reason: PDF p.8 attributes the 2x overhead to FHE ciphertext storage, not NTT form; the paper describes NTT format and FHE ciphertext expansion as two separate sources of overhead

---

### ThorPIR (6 fixes)

**File:** `Schemes/Group A - FHE Based PIR/thorpir_2024/thorpir_2024_notes.md`

1. **INCORRECT -- Theorem 3.2 prior bound formula garbled**
   - Location: Novel Primitives table, Improvement over prior row
   - Old: `Morris et al. [72], which had advantage bound (2q(n+t)/(n+1)) * (2qn/N)^{t/(2(n+1))}`
   - New: `Morris et al. [72], which had advantage bound 2q(4n+t)/(4n-4) * (4qn/N)^{t/(4(n-2))} (Section 2.5, p.11)`
   - Reason: The notes' formula mixed numerator/denominator terms from different parameterizations; corrected to match the actual prior bound stated in Section 2.5

2. **INCORRECT -- [^7] 750 bits mischaracterized as bootstrapping yield**
   - Location: Footnote [^7]
   - Old: `...or ~750 bits (conjectured params), allowing 8 levels...`
   - New: Rewrote to clarify that 750 bits is the PRG noise consumption in the conjectured parameter setting, not a bootstrapping yield
   - Reason: Conjectured params use no bootstrapping; the 750 bits is a noise budget requirement for the PRG, not something bootstrapping yields

3. **INCORRECT -- [^15] 0.86s/op missing GPU context**
   - Location: Footnote [^15]
   - Old: `With relaxed bootstrapping at 0.86s/op, the minimum serial time...`
   - New: `With relaxed bootstrapping at 0.86s/op on a GPU (derived from the 43s single-thread CPU cost with ~50x GPU acceleration per [76])...`
   - Reason: PDF explicitly says "each taking 0.86 seconds on a GPU"; omitting this creates a 50x contradiction with the notes' own BFV operations table (43s for relaxed bootstrapping)

4. **MINOR -- ~7600 bits total noise budget unsourced**
   - Location: Conjectured Security Variant table, Total noise budget row
   - Old: `~7600 bits (with bootstrapping)`
   - New: `~7600 bits (with bootstrapping; editorially estimated, not stated in paper)`
   - Reason: The ~7600 figure does not appear in the paper; the 3000-bit conjectured figure is explicitly stated on p.30

5. **MINOR -- LP reference inconsistency [55] vs [53]**
   - Location: Footnote [^16]
   - Old: `LP [55]`
   - New: `LP [53]` with explanatory note about the paper's own internal inconsistency
   - Reason: The paper's Table 2 uses [53] while Section 5.1 prose uses [55]; standardized to [53] per Table 2 for internal consistency

6. **MINOR -- PRG random bits formula r vs r+1**
   - Location: Novel Primitives table, Purpose row
   - Old: `Generate the N * r * log(N) random bits`
   - New: Added parenthetical noting that Algorithm 6 line 12 uses r but Algorithm 5's bfvThorp loop runs for r+1 rounds (paper-internal inconsistency)
   - Reason: The paper itself is inconsistent between Algorithm 6 (r) and Algorithm 5 (r+1); the notes now flag this

---

### Fix Counts by Scheme

| Scheme | Incorrect | Minor | Total |
|--------|-----------|-------|-------|
| SealPIR | 3 | 2 | 5 |
| XPIR-2014 | 1 | 1 | 2 |
| XPIR-2016 | 2 | 1 | 3 |
| MulPIR | 1 | 0 | 1 |
| OnionPIR | 0 | 1 | 1 |
| OnionPIRv2 | 0 | 1 | 1 |
| Addra | 1 | 1 | 2 |
| CwPIR | 1 | 1 | 2 |
| Spiral | 0 | 3 | 3 |
| FrodoPIR | 4 | 1 | 5 |
| ThorPIR | 3 | 3 | 6 |
| **Total** | **16** | **15** | **31** |

### Cross-Pass Persistent Issues Resolved

All 5 cross-pass persistent issues from prior passes have been resolved:

1. SealPIR [^8]: "in EXPAND" qualifier position -- fixed
2. SealPIR [^9]: Page number p.4 -> p.3 -- fixed
3. SealPIR comparison table: XPIR(d=3) values from wrong database-size row -- fixed (3 values)
4. CwPIR: Table 6 Folklore operator depth log vs log-log -- fixed
5. XPIR-2016 [^36]: Figure 5 page reference p.11 -> p.12 -- fixed

### Rejected Findings (NOT fixed)

The following checkup findings were rejected by the reviewer as false positives and were NOT applied:

- **Spiral**: INCORRECT 1 (rate vs response size) -- rejected; the paper uses "1.5x in rate" on p.2
- **MulPIR**: [^17] page reference p.29 vs p.28 -- rejected; the 522-element sentence is on p.29
- **OnionPIR**: Ali et al. request size 119 KB -- rejected; 119 KB is correct per PDF
- **OnionPIRv2**: [^14] section reference -- rejected; text is in Section 3.3, not 3.4
- **CwPIR**: [^7] ceil vs floor in Arithmetic Folklore depth -- rejected; body text on p.5 uses ceil
