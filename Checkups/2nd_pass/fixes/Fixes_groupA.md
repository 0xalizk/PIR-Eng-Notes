## Group A — Fixes Applied

#### [thorpir_2024_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) — [\[^8\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) (body text)
- **Issue:** Body text incorrectly describes the database as split into K = N/Q partitions labeled db_1,...,db_K. Per Algorithm 2 (p.14) of the PDF, the database is split into Q partitions db_1,...,db_Q, each of size K = N/Q.
- **Before:** `DB in {0,1}^N split into K = N/Q partitions db_1,...,db_K, each of size K = 2^20 elements.`
- **After:** `DB in {0,1}^N split into Q partitions db_1,...,db_Q, each of size K = N/Q elements.`

#### [thorpir_2024_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) — [\[^8\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) (footnote)
- **Issue:** Footnote swaps partition count and partition size — claims K = 2^20 partitions each containing Q = 2^10 elements, but the paper defines Q = 2^10 partitions each of size K = 2^20.
- **Before:** `each of the K = 2^20 partitions contains Q = 2^10 elements`
- **After:** `there are Q = 2^10 partitions each containing K = 2^20 elements`

---

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^fhe_d\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Table stated d = 5 for N = 10^6, but the formula d = 1 + ceil(log_4(N/128)) gives d = 8. The paper never explicitly states d = 5 for this database size.
- **Before:** `5 (for N = 10^6)` / footnote claimed d = 5 with editorial interpretation
- **After:** `8 (for N = 10^6)` / footnote updated with correct formula derivation

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^circular\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Line number reference "Algorithm 2, line 13" is brittle since numbering may vary by rendering.
- **Before:** `Algorithm 2, line 13). This implicitly requires`
- **After:** `Algorithm 2, line 13: externalProduct(A, c[...])). This implicitly requires ... Note: line numbering may vary by PDF rendering.`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^whatchanged\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Ellipsis in quoted text implied omitted words where the original sentence is continuous.
- **Before:** `"...on the server... with the help of"`
- **After:** `"...on the server with the help of"`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^correctness\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** The specific inequality Err(ct_resp) < floor(q/t)/2 is an editorial formalization not explicitly stated in the paper.
- **Before:** `Section 2.1, p.2: "Since the message is encoded..."`
- **After:** `Section 2.1, p.2: "Since the message is encoded..." The specific inequality ... is an editorial formalization of this correctness condition; the paper does not state it in this form.`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^noise_first\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** "Multiplicative" growth label is correct for the first dimension but slightly ambiguous without noting subsequent dimensions are additive.
- **Before:** footnote text without clarification
- **After:** Added note: "Multiplicative" here applies to the first dimension only; subsequent dimensions use external products with additive noise growth.

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^respsize\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Conflated Section 4.4 (expansion factor derivation) with the concrete 128 KB figure which comes from Section 6.3/Table 3.
- **Before:** `Section 4.4, p.8: ... 128 KB = 30 KB * 4.2 ≈ 126 KB, padded.`
- **After:** `Section 4.4, p.8: ... The concrete 128 KB response figure comes from Section 6.3, p.11 and Table 3, p.11. Editorial calculation: 30 KB * 4.2 ≈ 126 KB, padded to 128 KB.`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^bench_req\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Parenthetical "(each BFV ciphertext is 4x bigger due to larger q)" was an oversimplification.
- **Before:** `(each BFV ciphertext is 4x bigger due to larger q).`
- **After:** `(each ciphertext in OnionPIR is 4x bigger than SealPIR's, but OnionPIR packs everything into a single ciphertext, yielding a net 2x increase).`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^tradeoff_security\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** "below the typical 128-bit target" presented as paper finding but is editorial interpretation.
- **Before:** `below the typical 128-bit target.`
- **After:** `which is below the typical 128-bit target (editorial note: the 128-bit target is a common industry convention; the paper does not mention this threshold).`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^cmp_ali_comp\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Comparison table lists Ali et al. with 60 KB entries vs OnionPIR's 30 KB entries without noting they are not apples-to-apples.
- **Before:** `Section 7, p.12: "around 900 seconds."`
- **After:** `Section 7, p.12: "around 900 seconds." Note: Ali et al.'s figures are for 60 KB entries, while OnionPIR uses 30 KB entries ... This makes the computation comparison not strictly apples-to-apples.`

#### [onionpir_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) — [\[^fhe_F\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md)
- **Issue:** Phrasing "q set to 60 bits" could be misread as q = 60.
- **Before:** `SealPIR, in comparison, has F = 10 with q set to 60 bits and t = 12 bits.`
- **After:** `SealPIR, in comparison, has F = 10 with a 60-bit q and a 12-bit t (Section 6.2, p.10).`

---

#### [sealpir_2018_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) — [\[^2\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md)
- **Issue:** Formula notation conflated ciphertext-size variable N_d with the ring dimension N multiplied by d.
- **Before:** `O(N * d * N^{1/d})` / `O(N * d * ceil(sqrt_d(n)/N))`
- **After:** `O(N_d * d-root(n))` / `O(N_d * ceil(d-root(n)/N))` with clarification of variable meanings

#### [sealpir_2018_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) — [\[^26\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md)
- **Issue:** Complexity table mixed values from two database sizes (n=262,144 and n=1,048,576). Fixed all to consistently use n=1,048,576.
- **Before:** `Answer 0.5 s` / `total 1.65 s` / `Extract 1.39 ms`
- **After:** `Answer 2.01 s` / `total 6.38 s` / `Extract 1.69 ms`

#### [sealpir_2018_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) — [\[^40\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md)
- **Issue:** Truncated paraphrase omitted meaningful qualifying tail clause from the PDF.
- **Before:** `"...the difference becomes less prominent."`
- **After:** `"...the difference in the number of plaintexts between XPIR and SealPIR (for the same d) becomes less prominent until n is large enough that the second operand in Equation 1 approaches log(t) again."`

---

#### [mulpir_2019_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md) — [\[^1\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md)
- **Issue:** Wrong section attribution for circular security — appears on p. 2, not p. 10.
- **Before:** `(Section 4, p. 10)`
- **After:** `(Section 1, p. 2)`

#### [mulpir_2019_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md) — [\[^26\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md)
- **Issue:** Page reference off by one — "Multiplying GSW ciphertexts by plaintext matrices" heading appears on p. 11, not p. 10.
- **Before:** `Section 4.1, p. 10`
- **After:** `Section 4.1, p. 11`

#### [mulpir_2019_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md) — [\[^27\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md)
- **Issue:** Section misattribution — SealPIR rate quote is in Section 1.1, not Section 1.2.
- **Before:** `Section 1.2, p. 4`
- **After:** `Section 1.1, p. 4`

---

#### [cwpir_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) — [\[^3\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md)
- **Issue:** Quoted text blended wording from abstract (p. 1) and a separate sentence on p. 2 — added "keyword," extra comma, and changed "to" to "for."
- **Before:** `"Constant-weight keyword PIR is the first practical, single-round solution for single-server keyword PIR."`
- **After:** `"constant-weight PIR is the first practical single-round solution to single-server keyword PIR."`

#### [cwpir_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) — [\[^2\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md)
- **Issue:** Didn't distinguish plain vs. arithmetic CW operator depths (ceil(log_2 k) vs. 1 + ceil(log_2 k)).
- **Before:** `The constant-weight equality operator has multiplicative depth ceil(log_2 k)`
- **After:** `The plain constant-weight equality operator has multiplicative depth ceil(log_2 k); the arithmetic constant-weight operator has depth 1 + ceil(log_2 k).`

#### [cwpir_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) — [\[^21\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md)
- **Issue:** General formula substituted k! for d!, mixing CW-specific notation into the general formula.
- **Before:** `O(d-th root of (k! * n))`
- **After:** `O(d-th root of (d! * n))`

---

#### [frodopir_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md) — [\[^throughput\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md)
- **Issue:** Derived throughput "~1.27 GB/s" was arithmetic error; 1 GB / 825.37 ms ≈ 1.21 GB/s.
- **Before:** `~1.27 GB/s`
- **After:** `~1.21 GB/s`

#### [frodopir_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md) — [\[^safebrowsing\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md)
- **Issue:** Used general benchmark figures (Table 6) instead of SafeBrowsing-specific config from Appendix B / Table 8.
- **Before:** `offline download of ~6 MB ... ~3.2 KB response`
- **After:** `offline download of 180 KB per shard (~2.81 MB total for 16 shards) ... 0.1 KB response per shard (Table 8, p. 38)`

#### [frodopir_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md) — [\[^shard\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md)
- **Issue:** Attributed specific sharding example to Section 5.4 but it appears in Section 6.2, p. 21.
- **Before:** `Section 5.4, p. 16-17.`
- **After:** `Section 5.4, p. 16-17 (general) and Section 6.2, p. 21 (specific example).`

---

#### [spiral_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md) — [\[^7\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md)
- **Issue:** AVX speedup discussion is in Section 5.3 (p.34), not Section 5.2 (p.27-28).
- **Before:** `Section 5.2 (p.27-28)`
- **After:** `Section 5.3 (p.34)`

#### [spiral_2022_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md) — [\[^19\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md)
- **Issue:** 1.9x monetary cost claim is in the abstract (p.1), not Section 1 (p.2).
- **Before:** `Section 1 (p.2)`
- **After:** `Abstract (p.1)`

---

#### [xpir_2014_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md) — [\[^6\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md)
- **Issue:** Divisibility direction in modulus chain backwards — for decreasing chain q_0 > q_1 > ... the correct relationship is q_{i+1} | q_i (smaller divides larger), not q_i | q_{i+1}.
- **Before:** `q_i | q_{i+1}`
- **After:** `q_{i+1} | q_i` (5 occurrences + footnote note about PDF's ambiguous notation)

---

#### [xpir_2016_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md) — [\[^38\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md)
- **Issue:** SSD specification is first introduced on p. 13 ("Experimental setting"), not just p. 15 ("Medium Access Issues").
- **Before:** `p. 15, Section 4, "Medium Access Issues"`
- **After:** `p. 13, Section 4, "Experimental setting" ... p. 15, "Medium Access Issues"`

---

#### [onionpirv2_2025_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md) — [\[^13\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md)
- **Issue:** Page reference p.5 should be p.6; "plaintext slots" could mislead readers about SIMD batching.
- **Before:** `§3.3, p.5`
- **After:** `§3.3, p.6` + disambiguation note about polynomial coefficient positions vs. SIMD slots

---

#### [addra_2021_notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md) — [\[^3\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md)
- **Issue:** Quote omits trailing clause about avoiding unbounded packet build up.
- **Before:** `"...to process and forward the packet."`
- **After:** `"...to process and forward the packet, to avoid an unbounded packet build up."`
