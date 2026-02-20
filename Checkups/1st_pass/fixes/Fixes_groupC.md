## Group C — Fixes Applied

#### [SimplePIR / DoublePIR (2022)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) — [\[^5\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#user-content-fn-5)
- **Issue:** Misattributed variant name "SpiralStreamPack" to Table 1; Table 1 says "Spiral family [76]"
- **Before:** `the fastest prior single-server scheme (SpiralStreamPack) achieves 1,314 MB/s`
- **After:** `the fastest prior single-server scheme (Spiral family [76]) achieves 1,314 MB/s`

#### [SimplePIR / DoublePIR (2022)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) — [\[^7\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#user-content-fn-7)
- **Issue:** Section reference says "Section 2" but the quote is in Section 1
- **Before:** `Section 3.1 (p.4) and Section 2 "Plain learning with errors" (p.3)`
- **After:** `Section 3.1 (p.4) and Section 1 "Plain learning with errors" (p.3)`

#### [SimplePIR / DoublePIR (2022)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) — Variants table (body text)
- **Issue:** DoublePIR upload/download both listed as "approximately 345 KB"; 345 KB is the total, not each direction
- **Before:** `2 * sqrt(N) elements in Z_q (approximately 345 KB) | kappa * (2n + 1) elements in Z_q (approximately 345 KB)`
- **After:** `2 * sqrt(N) elements in Z_q (approximately 313 KB) | kappa * (2n + 1) elements in Z_q (approximately 32 KB)`

#### [SimplePIR / DoublePIR (2022)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) — [\[^24\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#user-content-fn-24)
- **Issue:** "offline download = 0 MB" should be "offline upload = 0 MB" (0 MB is the upload, not the download)
- **Before:** `SimplePIR offline download = 0 MB server-to-client hint download is 121 MB`
- **After:** `SimplePIR offline upload = 0 MB, offline download (server-to-client hint) is 121 MB`

#### [SimplePIR / DoublePIR (2022)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) — [\[^40\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#user-content-fn-40)
- **Issue:** Apply cost is 1 (constant), not lambda; footnote incorrectly grouped Apply/Dec as both lambda
- **Before:** `hint size λ, ciphertext size 1 per bit, and Apply/Dec time λ — all linear or constant in the security parameter`
- **After:** `hint size λ, ciphertext size 1 per bit, Apply time 1, and Dec time λ — all linear or constant in the security parameter`

#### [SimplePIR / DoublePIR (2022)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) — Line 119 (body text)
- **Issue:** Missing outer square root in norm bound expression
- **Before:** `||db[i_row, :]|| <= sqrt(N) * (p/2)^2 = N^{1/4} * p/2`
- **After:** `||db[i_row, :]|| <= sqrt(sqrt(N) * (p/2)^2) = N^{1/4} * p/2`

#### [VeriSimplePIR (2024)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md) — [\[^7\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-7)
- **Issue:** Footnote says "seven algorithms" but Construction 4.1 defines eight
- **Before:** `Full VLHE API definition with seven algorithms`
- **After:** `Full VLHE API definition with eight algorithms`

#### [VeriSimplePIR (2024)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md) — [\[^9\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-9)
- **Issue:** Correctness condition formula missing multiplicative factor of m (first form) / sqrt(m*ell) (second form)
- **Before:** `q >= sigma * 2*ell*p^2 * sqrt(2m * ln(2/delta))`
- **After:** `q >= 2*sigma*m*ell*p^2 * sqrt(2*ell * ln(2/delta))`

#### [VeriSimplePIR (2024)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md) — [\[^33\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-33)/[\[^34\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-34)
- **Issue:** Citation points swapped; [\[^34\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-34) (communication overhead 13-20%) was cited for computation overhead, [\[^33\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-33) (computation 12-40%) was cited for communication
- **Before:** `1.1-1.5x SimplePIR`[\[^33\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-33) and `12-40% overhead vs SimplePIR (Verify step)`[\[^34\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-34)
- **After:** `1.1-1.5x SimplePIR`[\[^34\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-34) and `12-40% overhead vs SimplePIR (Verify step)`[\[^33\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#user-content-fn-33)

#### [IncrementalPIR (2026)](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md) — [\[^20\]](../../../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md#user-content-fn-20)
- **Issue:** Second quote ("impossible in SimplePIR") attributed to Section 2.3 (p. 8) but actually appears in Section 4.1 (p. 12)
- **Before:** `Section 2.3 (p. 8): "Strong deletion... is the ideal property for practical applications" but "secure deletion against malicious clients is impossible in SimplePIR."`
- **After:** `Section 2.3 (p. 8): "Strong deletion... is the ideal property for practical applications." Section 4.1 (p. 12): "secure deletion against malicious clients is impossible in SimplePIR."`
