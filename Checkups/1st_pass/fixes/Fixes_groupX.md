## Group X — Fixes Applied

#### [KeywordPIR notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^31\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-31)
- **Issue:** Column misalignment — SealPIR server cost 0.0067 is the n=2^22 value, not n=2^20; true n=2^20 cost is 0.0040
- **Before:** `MulPIR server cost 0.0036 vs SealPIR 0.0067 at n=2^20 with 288B entries.`
- **After:** `MulPIR server cost 0.0036 vs SealPIR 0.0040 at n=2^20 with 288B entries.`
- Body table also fixed: SealPIR Server Cost at n=1,048,576 changed from `**0.0067**` to `**0.0040**`

#### [KeywordPIR notes](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) — [\[^45\]](../../../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#user-content-fn-45)
- **Issue:** Parenthetical "(client prime generation)" is the notes' interpretation, not the paper's exact column label "C.Create"
- **Before:** `C.Create (client prime generation) for Gentry-Ramzan is 3,294 ms for 1MB database`
- **After:** `C.Create for Gentry-Ramzan is 3,294 ms for 1MB database`

#### [DistributionalPIR notes](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) — [\[^10\]](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#user-content-fn-10)
- **Issue:** Says "six routines" but the paper defines five (Dist.Setup, Dist.Encode, Dist.Query, Dist.Answer, Dist.Recover)
- **Before:** `consists of six routines` / `listing all six routines`
- **After:** `consists of five routines` / `listing all five routines`

#### [DistributionalPIR notes](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) — [\[^34\]](../../../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#user-content-fn-34)
- **Issue:** Stateless/stateful decrypt-time labels were swapped; 0.7 s is stateful, 0.004 s is stateless
- **Before:** `0.004 s decrypt (stateful) or 0.7 s decrypt (stateless)`
- **After:** `0.7 s decrypt (stateful) or 0.004 s decrypt (stateless)`
- Body table also fixed: `0.7 (stateless) or 0.004 (stateful)` changed to `0.7 (stateful) or 0.004 (stateless)`
