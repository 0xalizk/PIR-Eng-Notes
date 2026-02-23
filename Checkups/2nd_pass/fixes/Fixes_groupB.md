## Group B — Fixes Applied

#### [YPIR_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md) — [\[^4\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md)
- **Issue:** The 724 KB download figure was attributed to HintlessPIR, but Table 7 (p.28) shows 724 KB belongs to SimplePIR. HintlessPIR's actual download at 32 GB x 64 KB is 3.2 MB.
- **Before:** `YPIR+SP achieves 444 KB download vs. 724 KB for HintlessPIR`
- **After:** `YPIR+SP achieves 444 KB download vs. 3.2 MB for HintlessPIR at 32 GB x 64 KB records (SimplePIR is 724 KB).`

#### [YPIR_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md) — [\[^27\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md)
- **Issue:** "2.7x faster total computation" — the word "total" is misleading; the 2.7x applies to online computation only.
- **Before:** `2.7x faster total computation`
- **After:** `2.7x faster online computation`

---

#### [WhisPIR_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md) — [\[^22\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md)
- **Issue:** Page reference says "p.15" but Remark A.2 appears on p.14 (paper is 14 pages).
- **Before:** `Remark A.2 (p.15)`
- **After:** `Remark A.2 (p.14)`

#### [WhisPIR_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md) — [\[^33\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md)
- **Issue:** Page reference says "p.10" but the subsection heading and quoted text appear on p.9.
- **Before:** `Section 3.5 (p.10)`
- **After:** `Section 3.5 (p.9)`

#### [WhisPIR_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md) — [\[^40\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md)
- **Issue:** Page reference says "p.11" but the quoted sentence appears on p.12.
- **Before:** `Section 4.2 (p.11)`
- **After:** `Section 4.2 (p.12)`

---

#### [Respire_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) — [\[^25\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md)
- **Issue:** Claimed 3.5x query size reduction from "2048/512 = 3.5x" but 2048/512 = 4. The paper's 3.5x comes from the concrete query size ratio (14 KB to 4 KB).
- **Before:** `(e.g., 2048/512 = 3.5x in Respire)`
- **After:** `(e.g., from 14 KB to 4 KB in Respire)`

#### [Respire_2024_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) — [\[^34\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md)
- **Issue:** Parenthetical "(20.84 s vs 15.44 s)" yields ~35% slower, contradicting the paper's stated "~26% slower."
- **Before:** `~26% slower than Spiral on an 8 GB database (20.84 s vs 15.44 s) because`
- **After:** `~26% slower than Spiral on an 8 GB database because`

---

#### [HintlessPIR_2023_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/hintlesspir_2023/HintlessPIR_2023_notes.md) — [\[^22\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/hintlesspir_2023/HintlessPIR_2023_notes.md)
- **Issue:** Misquote: dropped "compressed" from "compressed ciphertexts" and inserted "RLWE" which doesn't appear in the source text.
- **Before:** `"two RLWE ciphertexts and a compressed rotation key"`
- **After:** `"two compressed ciphertexts and a compressed rotation key"`

---

#### [Pirouette_2025_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) — [\[^6\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md)
- **Issue:** RLWE hardness quote attributed to Section 4.1 (p.8) but appears in Section 2.4.1 (p.5).
- **Before:** `Section 4.1 (p.8)`
- **After:** `Section 2.4.1 (p.5)`

#### [Pirouette_2025_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) — [\[^18\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md)
- **Issue:** Mixed body text figure ("around 3 KB") with Table 7 figure ("2 KB") without clarifying sources.
- **Before:** `Table 7 (p.11) and Section 5.2 (p.10): ... Exact value is ~2 KB at 256 B records.`
- **After:** `Section 5.2 (p.10): ... Table 7 (p.11) lists response size as 2 KB for all evaluated configurations.`

#### [Pirouette_2025_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) — [\[^24\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md)
- **Issue:** Footnote contained editorial claim about a "transcription error" in Table 7 that doesn't exist.
- **Before:** `Table 7 (p.11): Values transcribed from official benchmarks. Note: The parallel execution table contains a transcription error where offline communication values (e.g., 91 MB) appear in the computation rows for T-Respire.`
- **After:** `Table 7 (p.11): Values transcribed from official benchmarks.`

#### [Pirouette_2025_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) — [\[^43\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md)
- **Issue:** Satellite-to-ground communication reference is in the Introduction, not the Abstract.
- **Before:** `Abstract (p.1)`
- **After:** `Introduction (p.1)`

---

#### [InsPIRe_2025_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md) — [\[^26\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md)
- **Issue:** Body text reversed which percentage corresponds to which scheme — 84% is for CDKS and 76% is for HintlessPIR.
- **Before:** `84% less key material than HintlessPIR and 76% less than CDKS`
- **After:** `84% less key material than CDKS and 76% less than HintlessPIR`

---

#### [VIA_2025_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md) — [\[^37\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md)
- **Issue:** Quoted text about logarithmic noise variance is from Section 1.1 (p.4), not Section 4.6 (p.15).
- **Before:** `Section 4.6 (p.15)`
- **After:** `Section 1.1 (p.4)`

---

#### [NPIR_2026_notes](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md) — [\[^14\]](../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md)
- **Issue:** Arithmetic example with log_2(q) = 54 doesn't yield 84 KB because q is not exactly 2^54. Replaced derived formula with concrete Table 1 reference.
- **Before:** `For N=2048, q approx 2^54, t_g=5: 2048*54*(1+5)/8 = 84 KB.`
- **After:** `Table 1 (p.15) reports 84 KB for the concrete parameter set (N=2048, t_g=5, q=q_1*q_2).`
