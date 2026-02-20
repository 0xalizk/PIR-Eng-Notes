## Group B -- Fixes Applied

### INCORRECT Fixes

#### [YPIR notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md) -- [^4]
- **Issue:** HintlessPIR download cited as 3.2 MB at 32 GB x 64 KB; actual Table 7 value is 724 KB
- **Before:** `YPIR+SP achieves 444 KB download vs. 3.2 MB for HintlessPIR at 32 GB x 64 KB records.`
- **After:** `YPIR+SP achieves 444 KB download vs. 724 KB for HintlessPIR at 32 GB x 64 KB records.`

#### [YPIR notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md) -- [^14]
- **Issue:** YPIR upload/download figures swapped with SimplePIR's and DoublePIR's values
- **Before:** `At 32 GB, YPIR achieves 724 KB upload, 32 MB download (but only 12 KB for DoublePIR's small response), 2.64 s server time, 12.1 GB/s throughput.`
- **After:** `At 32 GB, YPIR achieves 2.5 MB upload, 12 KB download, 2.64 s server time, 12.1 GB/s throughput.`

#### [WhisPIR notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md) -- [^29]
- **Issue:** Table 1 rotation counts misattributed across rows (d=1024 value assigned to d=2048; wrong n=2^12 d=128 value)
- **Before:** `For n=2^12, d=2048, optimal generator gives 113,664 total rotations vs 386,048 for naive (3.4x improvement). For d=128, optimal gives 448 vs naive thousands.`
- **After:** `For n=2^12, d=1024, optimal generator gives 113,664 total rotations. For d=2048, optimal generator gives 386,048 total rotations. For n=2^12, d=128, optimal gives 2,496 total rotations.`

#### [Respire notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) -- [^4]
- **Issue:** Omits one of three RLWE assumptions while claiming to summarize all three
- **Before:** `Three RLWE assumptions with different parameters. Main ring uses uniform secret in [-7,7], Gaussian error with sigma=9.9. Small ring uses Gaussian secret and error with sigma=253.6.`
- **After:** `Three RLWE assumptions with different parameters. (1) Main ring R_{d1,q1} uses uniform secret in [-7,7], Gaussian error with sigma=9.9. (2) Main ring R_{d1,q1} for vectorization uses Gaussian secret and error with sigma'_1=9.9. (3) Small ring R_{d2,q2} uses Gaussian secret and error with sigma=253.6.`

#### [Respire notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) -- [^16]
- **Issue:** Correctness bound inequality direction inverted (success lower bound presented as failure upper bound)
- **Before:** `Pr[fail] <= 1 - 2*d2*n_vec * exp(...) <= 2^{-40}`
- **After:** `Pr[success] >= 1 - 2*d2*n_vec * exp(...), equivalently Pr[fail] <= 2*d2*n_vec * exp(...) <= 2^{-40}`

#### [Respire notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) -- [^35]
- **Issue:** Citation about communication size ("27x smaller") used in body to support computation speed claim ("27--50x slower")
- **Before:** `27-50x slower than SimplePIR/YPIR, but with 21-42x less communication and no large offline hint download`
- **After:** `27-50x slower than SimplePIR/YPIR, but with up to 27x smaller communication and no large offline hint download`

#### [NPIR notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2025/NPIR_2025_notes.md) -- [^5]
- **Issue:** Claims NPIR matches Spiral's rate of 0.250; Spiral's actual rate is 0.390
- **Before:** `while matching Spiral's communication rate of 0.250`
- **After:** `with a communication rate of 0.250` (footnote updated to note Spiral's rate is 0.390)

#### [NPIR notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2025/NPIR_2025_notes.md) -- [^15]
- **Issue:** Claims q_1 ~ 2^32; actual q_1 = 11*2^21+1 ~ 2^24.5
- **Before:** `For N=2048, phi=16, q_1 approx 2^32: 2048*16*32/8 = 128 KB.`
- **After:** `For N=2048, phi=16, q_1 = 11*2^21+1 (approx 2^24.5). The 128 KB response size per Table 1 reflects 32-bit aligned storage in practice.`

#### [NPIR notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2025/NPIR_2025_notes.md) -- [^23]
- **Issue:** Formula log_2(p)/log_2(q_1) = 8/32 is wrong; log_2(q_1) ~ 24.5, not 32
- **Before:** `Communication rate | log_2(p) / log_2(q_1) | 0.250 (= 8/32)`
- **After:** `Communication rate | -- | 0.250 (from byte-aligned communication; see Footnote 1, p.3)` (footnote updated to explain byte-alignment origin)

#### [InsPIRe notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md) -- [^8]
- **Issue:** Conflates two InspiRING parameter sets (d=10 and d=11), mixing favorable numbers
- **Before:** `InspiRING requires 84 KB key material vs 462 KB (CDKS) and 360 KB (HintlessPIR). Online runtime is 16 ms vs 56 ms (CDKS), though offline is slower (2.4 s vs 2.0 s for HintlessPIR).`
- **After:** `InspiRING with log_2 d=10 has Key Material=60 KB, Offline=2.4 s, Online=16 ms. InspiRING with log_2 d=11 has Key Material=84 KB, Offline=36 s, Online=40 ms. CDKS has Key Material=462 KB, Online=56 ms. HintlessPIR has Key Material=360 KB, Offline=2.0 s.`

#### [Pirouette notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) -- [^2]
- **Issue:** Body text claims bit decomposition produces RGSW ciphertexts, but the cited text says LWE ciphertexts (LWE-to-RGSW is a separate step)
- **Before:** `converting it into ceil(log_2 N) RGSW ciphertexts that encrypt individual index bits`
- **After:** `producing ceil(log_2 N) LWE ciphertexts that encrypt individual index bits, and then converts these into RGSW ciphertexts via a separate LWEtoRGSW step`

#### [Pirouette notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) -- [^10]
- **Issue:** Cites Table 3 for the q=2N claim; Table 3 does not contain this -- it is in Section 3.1
- **Before:** `Bit decomposition via blind rotation requires q = 2N (i.e., q_in = 2 * 2^11 for the blind rotation step).[^10]` with footnote citing Table 3 only
- **After:** `Bit decomposition via blind rotation requires q = 2N (Section 3.1, p.6). Table 3 (p.10) shows the actual parameters: log_2(q_in) = 32 for the input LWE query modulus.[^10]`

#### [Pirouette notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) -- [^24]
- **Issue:** Claims "exact transcriptions" but parallel table has offline comm (91 MB) in computation rows for T-Respire
- **Before:** `All values are exact transcriptions.` with 91 MB in T-Respire computation cells
- **After:** Footnote updated to note the transcription error; T-Respire computation cells changed to `--`

#### [VIA notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md) -- [^1]
- **Issue:** Fabricated primacy claim ("the first practical PIR protocol without offline communication to do so") not present in cited abstract
- **Before:** `VIA achieves O_lambda(log N) online communication complexity, the first practical PIR protocol without offline communication to do so.`
- **After:** `"we propose VIA, a single-server PIR scheme that eliminates offline communication while achieving O_lambda(log N) online communication complexity."`

#### [VIA notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md) -- [^4]
- **Issue:** HintlessPIR total is 18578 KB, not 10578 KB (dropped leading digit)
- **Before:** `HintlessPIR's 10578 KB`
- **After:** `HintlessPIR's 18578 KB`

### MINOR Fixes

#### HintlessPIR (2023)

**[^2]**
- **Issue:** Truncated quote missing trailing qualifier
- **Before:** `yielding concretely worse per-query bandwidth (by two orders of magnitude)."`
- **After:** `yielding concretely worse per-query bandwidth (by two orders of magnitude) than HintlessPIR, while also being slower by constant factors."`

**[^19]**
- **Issue:** Missing "1+" inside logarithm in conditions (2) and (3)
- **Before:** `sqrt(ln(k(n_rows+n)/(delta/3)))` and `sqrt(ln(kn * ceil(n_rows/n) / (delta/3)))`
- **After:** `sqrt(ln(1 + k(n_rows+n)/(delta/3)))` and `sqrt(ln(1 + kn * ceil(n_rows/n) / (delta/3)))`

**[^33]**
- **Issue:** Cited "Appendix B, after Lemma 11 (p.40)" but kappa = omega(log n) for NTTlessPIR appears in Appendix E (p.42)
- **Before:** `Appendix B, after Lemma 11 (p.40)`
- **After:** `Appendix E, after Lemma 11 (p.42)`

#### YPIR (2024)

**[^16]**
- **Issue:** Quote uses variable "n" but paper uses "d" for lattice dimension
- **Before:** `"asymptotically reduces the offline preprocessing cost by a factor of n/log n."`
- **After:** `"asymptotically reduces the offline preprocessing cost by a factor of d/log d."`

**[^15]**
- **Issue:** Page citation slightly narrow; text spans p.21-22
- **Before:** `Section 4.4 (p.21)`
- **After:** `Section 4.4 (p.21-22)`

**[^33] and body text**
- **Issue:** Body text says "1.4--1.7x" but paper says "1.5--1.7x"
- **Before:** `1.4--1.7x effective throughput improvement` / `1.5-1.7x`
- **After:** `1.5--1.7x effective throughput improvement` / `1.5--1.7x`

#### WhisPIR (2024)

**[^8]**
- **Issue:** Content on p.5, not p.4 as cited
- **Before:** `Section 2.2 (p.4)`
- **After:** `Section 2.2 (p.5)`

**[^19]**
- **Issue:** Relinearization description is from Section 2.2 (p.4), not Section 3.3 (p.8) as cited
- **Before:** `Section 3.3 (p.8)`
- **After:** `Section 2.2 (p.4)`

**[^22]**
- **Issue:** Remark A.2 content is on p.15, not p.14
- **Before:** `Remark A.2 (p.14)`
- **After:** `Remark A.2 (p.15)`

**[^25]**
- **Issue:** Same as [^8] -- correctness text on p.5, not p.4
- **Before:** `Section 2.2 (p.4)`
- **After:** `Section 2.2 (p.5)`

**[^27]**
- **Issue:** Quoted text does not match PDF verbatim
- **Before:** `"each multiplication reduces the dimension of the database by one."`
- **After:** `"each multiplication reduces the dimension of the remaining database by a factor of l."`

**[^44]**
- **Issue:** Blocklist database text is on p.13, not p.12
- **Before:** `Section 5 (p.12)`
- **After:** `Section 5 (p.13)`

#### Respire (2024)

**[^2] (body text)**
- **Issue:** Body adds "~" before "4 KB" not present in original
- **Before:** `reducing query size from 14 KB to ~4 KB`
- **After:** `reducing query size from 14 KB to 4 KB`

#### NPIR (2025)

**[^24]**
- **Issue:** Explanation "because packing keys are reused" is inaccurate interpretation of amortization
- **Before:** `0.288 s amortized per query because packing keys are reused`
- **After:** `0.288 s amortized per query`

**[^33]**
- **Issue:** Notes add a specific threshold of ">= 32" not stated in the paper
- **Before:** Footnote included specific batch code details
- **After:** `"with larger batch sizes" NPIR_b becomes less efficient than PIRANA. The paper does not specify a specific threshold (e.g., ">= 32").`

#### InsPIRe (2025)

**[^3]**
- **Issue:** "only supports small entry sizes" overstates the cited text which says "useful when the entry size is small"
- **Before:** `only supports small entry sizes (e.g., 1 bit)`
- **After:** `is useful when the entry size is small`

**[^4]**
- **Issue:** "lacks the polynomial evaluation technique" is editorial not found at cited location
- **Before:** `InsPIRe^(2) uses two levels of partial ring packing and is more flexible but lacks the polynomial evaluation technique.`
- **After:** `InsPIRe^(2) uses two levels of partial ring packing and is more flexible.`

**[^23]**
- **Issue:** Notes say all runtimes averaged over 5 runs; PDF distinguishes offline (measured once) from online (averaged)
- **Before:** `All runtimes averaged over 5 runs (standard deviation < 5%).`
- **After:** `Offline runtimes measured once; online runtimes averaged over 5 runs (standard deviation < 5%).`

**[^24]**
- **Issue:** Parenthetical conflates spiral-rs library with the YPIR implementation
- **Before:** `Built on RLWE building blocks from spiral-rs (YPIR implementation).`
- **After:** `Built on RLWE building blocks from spiral-rs.`

**[^26] (body text)**
- **Issue:** "28% faster online time than CDKS" mixes d=10 and d=11 parameter set figures
- **Before:** `with 28% faster online time than CDKS`
- **After:** `InspiRING (d=10) achieves 71% faster online time than CDKS (16 ms vs 56 ms); InspiRING (d=11) achieves 28% faster online time than CDKS (40 ms vs 56 ms)`

#### VIA (2025)

**[^3]**
- **Issue:** Formula cited as Section 1.1 (p.4) but appears on p.13 (Section 4.2)
- **Before:** `Section 1.1 (p.4)`
- **After:** `Section 4.2 (p.13)`

**[^22]**
- **Issue:** Omits that VIA-C also adds query decompression (step 1)
- **Before:** `VIA-C adds CRot (step 6) and response compression (step 7)`
- **After:** `VIA-C adds query decompression (step 1), CRot (step 6), and response compression (step 7)`
