## Group A -- Fixes Applied

### INCORRECT Fixes

#### [SealPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) -- [\[^36\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-36)
- **Issue:** Cited "Section 7.5 of SKILL taxonomy" which does not exist in the SealPIR paper; adoption claim is editorial
- **Before:** `Section 7.5 of SKILL taxonomy: "Oblivious query expansion (Expand) — SealPIR, OnionPIR, OnionPIRv2, Spiral, WhisPIR, NPIR."`
- **After:** `Editorial note: Oblivious query expansion (Expand) was introduced by SealPIR (Section 3.3) and subsequently adopted by OnionPIR, Spiral, and other FHE-based PIR schemes. The adoption claim is based on the cited papers in this collection, not on a specific section of the SealPIR paper itself.`

#### [XPIR-2016 notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md) -- [\[^44\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md#user-content-fn-44)
- **Issue:** Fabricated middle row "720p at 60fps (800 Kbit/s): ~8,000 movies" not present in paper; paper gives only two data points
- **Before:** Three-row table including `720p at 60fps (800 Kbit/s needed): Hide choice among ~8,000 movies.`
- **After:** Two-row table with only the paper's data points: 35K movies at 720p-30fps and 8K movies at 1024p-60fps

#### [Addra/FastPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md) -- [\[^24\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md#user-content-fn-24)
- **Issue:** Client Query time cited as 1.4 ms; paper Table 2 says 21.3 ms
- **Before:** `Client Query time: 1.4 ms`
- **After:** `Client Query time: 21.3 ms`

#### [CwPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) -- [\[^30\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-30)
- **Issue:** "10x speedup" understates the improvement; Table 3 shows CwPIR 1020ms vs SealPIR 14500ms = ~14x
- **Before:** `up to **10x speedup** over SealPIR` with footnote citing "up to 10x improvement (Table 3)"
- **After:** `up to **~14x speedup** over SealPIR` with footnote citing "~14x improvement (Table 3: CwPIR 1020 ms vs SealPIR 14500 ms at n=2^20, m=256B)"

#### [ThorPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) -- [\[^10\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md#user-content-fn-10)
- **Issue:** "360 bits = 45 bytes" is wrong; paper uses 360 bytes per element throughout
- **Before:** `360 bits = 45 bytes` (footnote), `360 bits = 2880 bits` ([\[^8\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md#user-content-fn-8)), `360 bits per element` (metadata table)
- **After:** `360 bytes` (footnote), `360 bytes = 2880 bits` ([\[^8\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md#user-content-fn-8)), `360 bytes per element` (metadata table); also fixed body text references

### MINOR Fixes

#### [SealPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) (2018)

**[\[^3\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-3)**
- **Issue:** Wrong page number for Figure 2
- **Before:** `Figure 2 (p. 4)`
- **After:** `Figure 2 (p. 3)`

**[\[^8\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-8)**
- **Issue:** Omitted "in EXPAND" qualifier from quote about depth
- **Before:** `"each of the substitution operations [...] requires log_2(N/2) multiplications"`
- **After:** `"each of the substitution operations in EXPAND [...] requires log_2(N/2) multiplications"`

**[\[^9\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-9)**
- **Issue:** Section reference too specific; content is in FV background preamble, not Section 3.1
- **Before:** `Section 3.1, p. 4`
- **After:** `Section 3 (FV background preamble), p. 4`

**[\[^19\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-19)**
- **Issue:** Wrong page number
- **Before:** `Section 3.4, p. 5`
- **After:** `Section 3.4, p. 4`

**[\[^22\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-22)**
- **Issue:** Wrong section and page for BFV noise bound content
- **Before:** `Section 3.4, p. 5`
- **After:** `Section 3, p. 3`

**[\[^26\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-26)**
- **Issue:** Row attribution cites n=262,144 but values shown are from n=1,048,576 row
- **Before:** Incorrectly attributed row values
- **After:** Corrected row attribution to match Table 2 values

**[\[^40\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-40)**
- **Issue:** Wrong page number
- **Before:** `Section 7.2.1, p. 12`
- **After:** `Section 7.2.1, p. 11`

#### [XPIR-2014 notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md) (2014)

**[\[^1\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-1)**
- **Issue:** Wrong exponent variable in absorbed-ciphertext formula
- **Before:** `c^{2^i}`
- **After:** `c^{2^d}`

**[\[^9\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-9)**
- **Issue:** Wrong section reference for PIR protocol description
- **Before:** `Section 3, p. 4-5`
- **After:** `Section 2.1, p. 3`

**[\[^17\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-17)**
- **Issue:** Wrong section reference for Stern-Brocot tree
- **Before:** `Section 3, p. 5`
- **After:** `Section 4, p. 5`

**[\[^22\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-22)**
- **Issue:** Body text and footnote claim "1000x smaller" but paper shows 3072x
- **Before:** `1000x smaller than K-O`
- **After:** `3072x smaller than K-O` (body text and footnote both corrected)

#### [XPIR-2016 notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md) (2016)

**[\[^36\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md#user-content-fn-36)**
- **Issue:** Page reference conflates two results on different pages
- **Before:** Single `p. 12` reference for both 60-bit and 120-bit operations
- **After:** Split reference: 60-bit numbers on p. 11, 120-bit on p. 12

**[\[^37\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md#user-content-fn-37)**
- **Issue:** Overstated qualifier "for most database sizes"; slowness only applies to small n
- **Before:** `10-200x slower than cPIR for most database sizes`
- **After:** `10-200x slower than cPIR for small n values (n <= ~100); for larger n (n >= ~1000 in d=1), trivial PIR is actually faster`

**[\[^38\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md#user-content-fn-38)**
- **Issue:** Wrong page and section for experimental setting reference
- **Before:** `p. 13, Section 4, "Experimental setting"`
- **After:** `p. 15, Section 4, "Medium Access Issues"`

#### [MulPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md) (2019)

**[\[^6\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md#user-content-fn-6)**
- **Issue:** Incorrect dimension notation for matrix H
- **Before:** Inconsistent dimension for H
- **After:** Corrected to `n_0 x n_2` with base case note added

**[\[^12\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md#user-content-fn-12)**
- **Issue:** Wrong parameter name for Appendix A variant
- **Before:** `n'_1`
- **After:** `n'_0`

**[\[^15\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md#user-content-fn-15)**
- **Issue:** Block size calculation off by ~8x (27 KB vs actual 207 KB)
- **Before:** `approximately 27 KB per block`
- **After:** `approximately 207 KB per block`

#### [OnionPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) (2021)

**[\[^circular\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-circular)**
- **Issue:** Line reference too broad; added editorial inference note
- **Before:** `line 12-13`
- **After:** `line 13` with editorial inference note added

**[\[^whatchanged\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-whatchanged)**
- **Issue:** Truncated quote missing trailing clause
- **Before:** Quote ending at `...`
- **After:** Added omitted text `... with the help of recent advances in homomorphic encryption schemes.`

**[\[^coreidea\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-coreidea)**
- **Issue:** Inserted word "size" not in original paper text
- **Before:** `response size overhead`
- **After:** `response overhead`

**[\[^querypacking\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-querypacking)**
- **Issue:** Wrong section number
- **Before:** `Section 4.3`
- **After:** `Section 4.4`

**[\[^fhe_d\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-fhe_d)**
- **Issue:** Conflated protocol config (d=5) with formula application (d=8)
- **Before:** Unclear d=5 vs d=8 relationship
- **After:** Clarified that d=5 is the protocol configuration, not the formula application

**[\[^tradeoff_security\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-tradeoff_security)**
- **Issue:** 128-bit security claim mixed with paper citation as if paper states it
- **Before:** Editorial claim embedded in citation
- **After:** Separated editorial note from paper citation

**[\[^concurrent2\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#user-content-fn-concurrent2)**
- **Issue:** Truncated quote missing "of server computation"
- **Before:** Quote ending without qualifier
- **After:** Added `of server computation` to complete the quote

#### [OnionPIRv2 notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md) (2025)

**[\[^10\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-10)**
- **Issue:** Omitted qualifier "roughly" from quote
- **Before:** `"costs one external product"`
- **After:** `"roughly costs one external product"`

#### [Addra/FastPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md) (2021)

**[\[^3\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md#user-content-fn-3)**
- **Issue:** Wrong page and section for SEAL library reference
- **Before:** `Paper p.2, Section 2.1`
- **After:** `Paper p.1, Introduction`

**[\[^10\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md#user-content-fn-10)**
- **Issue:** Wrong page number
- **Before:** `Paper p.7`
- **After:** `Paper p.6`

**[\[^32\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md#user-content-fn-32)**
- **Issue:** Wrong page number
- **Before:** `Paper p.9`
- **After:** `Paper p.8`

#### [CwPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) (2022)

**[\[^1\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-1)**
- **Issue:** Misattributed Chor et al. and Ali et al. contributions
- **Before:** Combined attribution
- **After:** Separated Chor et al. (multi-server PIR) and Ali et al. (communication-computation tradeoff) attributions

**[\[^2\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-2)**
- **Issue:** Confused plain folklore equality operator with arithmetic constant-weight variant
- **Before:** `folklore binary equality operator`
- **After:** `arithmetic folklore equality operator` with plain folklore multiplicative depth noted

**[\[^5\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-5)**
- **Issue:** M described as "number of multiplications" rather than a unit label
- **Before:** `M = number of multiplications`
- **After:** `M denotes a single homomorphic multiplication (unit label, not a count variable)`

**[\[^9\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-9)**
- **Issue:** Missing Table 1 reference for noise growth classification
- **Before:** No table reference
- **After:** Added Table 1 reference for noise growth types

**[\[^18\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-18)**
- **Issue:** Missing attribution for SealPIR N=4096 source
- **Before:** No source for N=4096 claim
- **After:** Added note that SealPIR N=4096 comes from p. 11 text

**[\[^31\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#user-content-fn-31)**
- **Issue:** Section reference too narrow
- **Before:** `Section 4.2, p. 10`
- **After:** `Sections 4.2/5 boundary, p. 10`

#### [Spiral notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md) (2022)

**[\[^14\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md#user-content-fn-14)**
- **Issue:** Omitted leading factor d in noise bound (Theorem 2.19)
- **Before:** Noise bound without factor d
- **After:** Added missing factor `d *` to noise bound expression

**[\[^15\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md#user-content-fn-15)**
- **Issue:** Wrong section number; quote is in introduction before Section 1.2
- **Before:** `Section 1.2 (p.4)`
- **After:** `Section 1, p.4 (introduction, before Section 1.2)`

**[\[^17\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md#user-content-fn-17)**
- **Issue:** Omitted qualifications about Spiral/SpiralPack specificity and parameter constraint
- **Before:** Unqualified 2^9 limit statement
- **After:** Added qualifications: applies to "Spiral and SpiralPack" specifically, "without moving to a larger set of lattice parameters"

#### [FrodoPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md) (2022)

**[\[^ci\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#user-content-fn-ci)**
- **Issue:** Wrong page for client-independence quote
- **Before:** `Section 2.3, p. 7`
- **After:** `p. 2`

**[\[^open1\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#user-content-fn-open1)**
- **Issue:** Body text says "reduce hint download from ~6 MB to ~16 MB" which is an increase, not a reduction; conflates SimplePIR and FrodoPIR figures
- **Before:** `reduce hint download from ~6 MB to ~16 MB for larger DBs while reducing online query size`
- **After:** `as SimplePIR does to reduce its 124 MB hint to ~16 MB) be applied to FrodoPIR to reduce online query size? FrodoPIR's hint is already ~6 MB, so the benefit would target query size rather than hint size.` (footnote also updated)

**[\[^safebrowsing\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#user-content-fn-safebrowsing)**
- **Issue:** "~2.5 MB Bloom-filter-like structure" figure not in paper; paper says "8x smaller" than >90 MB blocklist
- **Before:** `browser stores ~2.5 MB Bloom-filter-like structure locally`
- **After:** `browser stores a compressed probabilistic data structure locally (described as "8x smaller" than the >90 MB blocklist)`

#### [ThorPIR notes](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) (2024)

**[\[^8\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md#user-content-fn-8)**
- **Issue:** Bits/bytes unit confusion ("360 bits = 2880 bits" is incoherent)
- **Before:** `360 bits = 2880 bits`
- **After:** `360 bytes = 2880 bits`
