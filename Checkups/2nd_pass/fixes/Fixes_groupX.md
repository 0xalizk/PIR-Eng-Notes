## Group X — Fixes Applied

#### [KeywordPIR_2019_notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^8\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)
- **Issue:** Footnote cited Table 3 (p. 12) with MulPIR values of 122 kB, but the body text uses 119 kB from Table 1 (p. 7).
- **Before:** `Table 3 (p. 12): MulPIR (d=2) for n=262,144 shows upload 122 kB, download 122 kB`
- **After:** `Table 1 (p. 7): MulPIR (d=2) for n=2^20 shows upload 119 kB, download 119 kB`

#### [KeywordPIR_2019_notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^11\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)
- **Issue:** Cited Section 6.1 (p. 11) for exact plaintext modulus t = 2^12 + 1, but Section 6.1 only says "size of 12 bits." Exact value is in Table 1 footnote (p. 7).
- **Before:** only citing Section 6.1
- **After:** Added: `The exact value t = 2^12 + 1 is stated in the Table 1 footnote (p. 7).`

#### [KeywordPIR_2019_notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^26\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)
- **Issue:** Section heading stated "n=2^20" (1,048,576) but the table values come from n=262,144 column of Table 3.
- **Before:** `n=2^20, 288B entries`
- **After:** `n=262,144, 288B entries`

#### [KeywordPIR_2019_notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^28\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)
- **Issue:** Gentry-Ramzan row attributed solely to Table 2 but GR data is from Section 4 and Table 8 (p. 20).
- **Before:** `Asymptotic communication complexity (Table 2, p. 8)` / footnote only citing Table 2
- **After:** `Asymptotic communication complexity (Table 2, p. 8; Gentry-Ramzan from Section 4 and Table 8, p. 20)` + expanded footnote

#### [KeywordPIR_2019_notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^45\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)
- **Issue:** Body text said "10-50 seconds" but footnote data spans 3-50 seconds.
- **Before:** `which takes 10-50 seconds on the client`
- **After:** `which takes 3-50 seconds on the client depending on the application`

---

#### [DistributionalPIR_2025_notes](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) — [\[^16\]](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md)
- **Issue:** Reasoning chain reversed — PDF says explicit -> worst-case -> average-case, but notes had explicit -> average-case -> worst-case.
- **Before:** `an explicit correctness failure is also an average-case correctness failure, and an average-case correctness failure is also a worst-case correctness failure`
- **After:** `an explicit correctness failure is also a worst-case correctness failure, and a worst-case correctness failure is also an average-case correctness failure`

#### [DistributionalPIR_2025_notes](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) — [\[^22\]](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md)
- **Issue:** Source attribution cited only Table 12 but the server work/communication figures come from Section 7.2.1 (p. 11).
- **Before:** `Section 9.1, Table 12 (p. 14)`
- **After:** `Section 7.2.1 (p. 11) and Section 9.1, Table 12 (p. 14): Server work and communication improvements from Section 7.2.1; 8x total cost reduction from Table 12.`

#### [DistributionalPIR_2025_notes](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) — [\[^45\]](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md)
- **Issue:** Oversimplified paraphrase of Theorem E.1 omitting the role of modified distribution P'.
- **Before:** `"for any linear utility function and batch size 1, average-case utility reduces to average-case correctness."`
- **After:** `For any linear utility function U and batch size 1, there exists a modified distribution P' (the normalized product of P and U) such that if the scheme has average-case correctness kappa_avg on P', it also achieves average-case utility kappa_avg on P — reducing utility to correctness on a reweighted distribution.`
