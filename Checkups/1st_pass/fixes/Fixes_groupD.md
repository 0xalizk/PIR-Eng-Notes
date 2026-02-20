## Group D — Fixes Applied

#### [CK20 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^21\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-21-50482de43f69c5d3a1593fe871b2fd51)
- **Issue:** Failure probability component breakdown over-simplified; combined bound should be s/n, not (s-1)/n + 1/n
- **Before:** `Each read fails when j = bottom or i_punc != i, with combined probability at most (s-1)/n + 1/n <= 1/2 for s <= n/2.`
- **After:** `Each read fails when j = bottom (probability <= 1/n) or i_punc != i (probability (s-1)/n), with combined probability at most s/n <= 1/2 for s <= n/2.`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^1\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-1-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Close paraphrase; paper says "then we describe" not "then describe"
- **Before:** `"We start by describing the CK protocol and then describe our approach to make its preprocessing incremental."`
- **After:** `"We start by describing the CK protocol and then we describe our approach to make its preprocessing incremental."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^2\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-2-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Quote was truncated; paper continues with additional clause
- **Before:** `"Appendix E discusses how to make the SACM OO-PIR scheme [51] incremental."`
- **After:** `"Appendix E discusses how to make the SACM OO-PIR scheme [51] incremental with similar high-level ideas as those presented here, but with vastly different concrete mechanisms."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^4\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-4-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Definition 2 starts on p.3 and continues onto p.4, not solely p.4
- **Before:** `Definition 2 (p.4)`
- **After:** `Definition 2 (p.3-4)`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^9\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-9-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Definition 4 spans pp.7-8, not solely p.8
- **Before:** `Definition 4 (p.8)`
- **After:** `Definition 4 (p.7-8)`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^13\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-13-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Quote omits trailing phrase about small power-of-two range
- **Before:** `"We use AES to implement a PRF for small range, and then apply Patarin's proposal [49] to the PRF to build a secure PRP."`
- **After:** `"We use AES to implement a PRF for small range, and then apply Patarin's proposal [49] to the PRF to build a secure PRP that has a small power-of-two range."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^15\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-15-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Quote truncated; paper continues "where n is the original database size"
- **Before:** `"...the client fails to puncture the set at index i with probability O(1/sqrt(n))."`
- **After:** `"...the client fails to puncture the set at index i with probability O(1/sqrt(n)) where n is the original database size."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^32\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-32-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Wrong page number; content appears on p.14, not p.11
- **Before:** `Section 6.2 (p.11)`
- **After:** `Section 6.2 (p.14)`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^34\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-34-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Quote truncated; paper continues with qualifier about not altering size
- **Before:** `"We consider three types of mutations: addition of new objects, deletion of existing objects, and in-place edits."`
- **After:** `"We consider three types of mutations: addition of new objects, deletion of existing objects, and in-place edits that change the database's content but does not alter its size."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^39\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-39-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Paraphrase missing trailing clause about second construction
- **Before:** `"we show how to adapt the PPRS in SACM to support our notion of incrementality."`
- **After:** `"we show how to adapt the PPRS in SACM to support our notion of incrementality and obtain our second construction of an incremental offline/online PIR scheme."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^40\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-40-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Paper says "not yet useful in practice" not "not yet in practice"
- **Before:** `"not yet in practice"`
- **After:** `"not yet useful in practice"`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^42\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-42-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Quote truncated; paper continues with comparison baseline
- **Before:** `"...improves the throughput achieved by Tor directory nodes by roughly 7x."`
- **After:** `"...improves the throughput achieved by Tor directory nodes by roughly 7x over an implementation of PIR-Tor that uses a state-of-the-art 2-server PIR scheme."`

#### [IncPIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^51\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#user-content-fn-51-c6acf9233b77313c6e6539ff39b3dece)
- **Issue:** Wrong page number; quote appears on p.5, not p.1
- **Before:** `Section 1 (p.1)`
- **After:** `Section 1 (p.5)`

#### [IshaiShiWichs notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md) — [\[^16\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md#user-content-fn-16-a379b55486b29af46ec0b4402515e460)
- **Issue:** O(n^{2/3}) preprocessing bandwidth not explicitly stated in the theorem
- **Before:** `yielding O(n^{2/3}) preprocessing bandwidth and O(n^{1/3}) online bandwidth.`
- **After:** `yielding O(n^{1/3}) online bandwidth per Table 1 (p.3).`

#### [IshaiShiWichs notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md) — [\[^25\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md#user-content-fn-25-a379b55486b29af46ec0b4402515e460)
- **Issue:** O_tilde(n^{1/6}) offline bandwidth claim not explicitly visible in theorem or Table 1
- **Before:** `reducing offline bandwidth from O_tilde(n^{1/2}) to O_tilde(n^{1/6}) per query while maintaining O_tilde(n^{1/3}) online bandwidth.`
- **After:** `maintaining O_tilde(n^{1/3}) online bandwidth.`

#### [IshaiShiWichs notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md) — [\[^36\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md#user-content-fn-36-a379b55486b29af46ec0b4402515e460)
- **Issue:** Content straddles Sections 1.2/1.3 at p.7-8 boundary, not squarely in Section 1.3
- **Before:** `Section 1.3 (p.8)`
- **After:** `Section 1.2-1.3 (p.7-8)`

#### [Piano notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) — [\[^2\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md#user-content-fn-2-6c14cde39528690b99444e4123e6c24f)
- **Issue:** Wrong page number; quote appears on p.3, not p.2
- **Before:** `Section 1.1 (p.2)`
- **After:** `Section 1.1 (p.3)`

#### [Piano notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) — [\[^8\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md#user-content-fn-8-6c14cde39528690b99444e4123e6c24f)
- **Issue:** Wrong section/page; quote appears on p.16 (Section 6), not p.5-6 (Section 2)
- **Before:** `Section 2 (p.5-6)`
- **After:** `Section 6 (p.16)`

#### [Piano notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) — [\[^9\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md#user-content-fn-9-6c14cde39528690b99444e4123e6c24f)
- **Issue:** PRF-only quote is from p.3, not p.16; streaming/FHE quote is from p.16. Split across locations.
- **Before:** `Section 6 (p.16): "the only cryptographic primitive we need is pseudorandom functions (PRFs)... the streaming preprocessing avoids the need of using FHE during the offline phase."`
- **After:** `Section 1.1 (p.3) and Section 6 (p.16): "the only cryptographic primitive we need is pseudorandom functions (PRFs)" (p.3); "the streaming preprocessing avoids the need of using FHE during the offline phase" (p.16).`

#### [Piano notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) — [\[^16\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md#user-content-fn-16-6c14cde39528690b99444e4123e6c24f)
- **Issue:** Minor index naming discrepancy; used i where j was the correct chunk variable
- **Before:** `p_bar_{i,k} <- p_bar_{i,k} XOR DB[Set(sk_bar_{i,k})[j]]`
- **After:** `p_bar_{j,k} <- p_bar_{j,k} XOR DB[Set(sk_bar_{j,k})[j]]`

#### [Piano notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) — [\[^46\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md#user-content-fn-46-6c14cde39528690b99444e4123e6c24f)
- **Issue:** 800-line claim is on p.10 but 160-line reference implementation is on p.3, not p.10
- **Before:** `Section 4.1 (p.10): "the core implementation contains only around 800 lines of code. We also provide a reference implementation (for tutorial purposes) that contains only around 160 lines of code."`
- **After:** `Section 1.1 (p.3) and Section 4.1 (p.10): "the core implementation contains only around 800 lines of code" (p.10). The 160-line reference implementation is mentioned on p.3.`

#### [Plinko notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) — [\[^17\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md#user-content-fn-17-0b8d46740481c7dda6792ea1b957e90d)
- **Issue:** [MR14] reference appears in proof paragraph, not in the theorem statement itself
- **Before:** `Theorem 4.4 (p.12): The iPRF construction uses a small-domain PRP; footnote references [MR14]`
- **After:** `Theorem 4.4 (p.12): The iPRF construction uses a small-domain PRP; the proof paragraph following Theorem 4.4 references [MR14]`

#### [Plinko notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) — [\[^27\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md#user-content-fn-27-0b8d46740481c7dda6792ea1b957e90d)
- **Issue:** Theorem states Õ(n/r) time but does not explicitly break down as "n/r parities per block"
- **Before:** `The server computes n/r parities, each requiring XOR of entries in one block.`
- **After:** `Each online query runs in Õ(n/r) time (paraphrase; the theorem does not explicitly break down the computation as "n/r parities per block").`

#### [Plinko notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) — [\[^41\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md#user-content-fn-41-0b8d46740481c7dda6792ea1b957e90d)
- **Issue:** Exact phrasing varies slightly from p.4; marked as paraphrase
- **Before:** `"Recent lower bounds for traditional PIR have shown that any PIR with pre-processing scheme with client storage r and query time t must obey r * t = Omega(n) [CK20, CHK22, Yeo23]."`
- **After:** `Recent lower bounds show that any PIR with preprocessing scheme with client storage r and query time t must obey r * t = Omega(n) [CK20, CHK22, Yeo23] (paraphrase; exact phrasing varies slightly).`

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^4\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-4-de4f67c36ce93404f11d60ade740011b)
- **Issue:** Close paraphrase labeled as quote; marked as paraphrase
- **Before:** `(verbatim quote attribution with editorial additions)`
- **After:** `(marked as paraphrase of discussion on p.13)`

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^9\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-9-de4f67c36ce93404f11d60ade740011b)
- **Issue:** The 0.4 figure is from the simpler non-paired strategy; with pairs, bound is lambda*sqrt(N)/2
- **Before:** `The client can make approximately 0.4*λ*sqrt(N) queries before needing to re-run the offline phase`
- **After:** `with pairs, the client can make up to λ*sqrt(N)/2 queries before needing to re-run the offline phase. The 0.4*λ*sqrt(N) figure used in Table 1 is a conservative estimate for the simpler non-paired strategy.`

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^12\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-12-de4f67c36ce93404f11d60ade740011b)
- **Issue:** Quote truncated (continues with AES/SHA mentions); location spans p.3-4 boundary
- **Before:** `Section 2 (p.4)`
- **After:** `Section 2 (p.3-4)` (with note about continuation)

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^20\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-20-de4f67c36ce93404f11d60ade740011b)
- **Issue:** Paper says sending directly costs sqrt(N)*log(N) bits, not 2*sqrt(N)*log(N)
- **Before:** `vs. 2 * sqrt(N) * log(N) bits for explicit subsets`
- **After:** `vs. sqrt(N) * log(N) bits for sending explicit subsets directly`

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^27\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-27-de4f67c36ce93404f11d60ade740011b)
- **Issue:** Unit errors: KB should be MB for offline comm, ms should be s for offline compute
- **Before:** `60.16 KB communication and 842 ms offline computation`
- **After:** `60.16 MB offline communication and 842 s offline computation`

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^36\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-36-de4f67c36ce93404f11d60ade740011b)
- **Issue:** Paper says naive cost is sqrt(N)*log(N), not 2*sqrt(N)*log(N) as footnote implies
- **Before:** `vs. 2 * sqrt(N) * log(N) bits for explicit subsets`
- **After:** `vs. sqrt(N) * log(N) bits for sending explicit subsets directly`

#### [RMS24 notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) — [\[^42\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md#user-content-fn-42-de4f67c36ce93404f11d60ade740011b)
- **Issue:** Content spans p.9-10 boundary, not solely p.10
- **Before:** `Section 4.1 (p.10)`
- **After:** `Section 4.1 (p.9-10)`

#### [SinglePass notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^7\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md#user-content-fn-7-b8d15fdfe53b40eed6207ff9665502ba)
- **Issue:** PDF contains typo "completey" for "completely"; notes had corrected version
- **Before:** `"completely uniform"`
- **After:** `"completey uniform" (Note: the PDF contains the typo "completey" for "completely.")`

#### [SinglePass notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^43\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md#user-content-fn-43-b8d15fdfe53b40eed6207ff9665502ba)
- **Issue:** Quote originates from p.13, not Table 2 directly
- **Before:** `Table 2 (p.15)`
- **After:** `Section 4 (p.13)` (with note that benchmark results are in Table 2, p.15)

#### [SinglePass notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^47\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md#user-content-fn-47-b8d15fdfe53b40eed6207ff9665502ba)
- **Issue:** Wrong page number; quote appears on p.2, not p.1
- **Before:** `Section 1 (p.1)`
- **After:** `Section 1 (p.2)`

#### [SinglePass notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^52\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md#user-content-fn-52-b8d15fdfe53b40eed6207ff9665502ba)
- **Issue:** Notes' paraphrase does not closely match footnote 7's actual wording; marked as paraphrase
- **Before:** `(presented as verbatim quote)`
- **After:** `(marked as paraphrase of Footnote 7)`

#### [SinglePass notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^54\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md#user-content-fn-54-b8d15fdfe53b40eed6207ff9665502ba)
- **Issue:** "Permutation approach" attribution is editorial interpretation, not direct quote; clarified
- **Before:** `"the preprocessing roughly equals the cost of a single PIR query" — achieved by the permutation approach rather than independent random subsets.`
- **After:** `"the preprocessing roughly equals the cost of a single PIR query" (the permutation approach, rather than independent random subsets, is the mechanism enabling this — editorial note).`

#### [TreePIR notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^35\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md#user-content-fn-35-c580c7938e9ca64522537b4d433c4bb2)
- **Issue:** Storage and bandwidth ratios (8,190x and 2,024x) are approximate and slightly off from exact table data
- **Before:** `TreePIR is 3.6x faster than Checklist, uses 8,190x less client storage than Checklist, and uses 2,024x less bandwidth than PRP-PIR.`
- **After:** `TreePIR is 3.6x faster than Checklist (12574/3508). Storage and bandwidth ratios are approximate: roughly 8,190x less client storage than Checklist and roughly 2,024x less bandwidth than PRP-PIR (exact ratios may differ slightly from table data).`

#### [WangRen notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^12\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md#user-content-fn-12-956c33c038b1ed9a9b3659412c3862d4)
- **Issue:** Storage formula attributed to p.14 actually appears on p.15
- **Before:** `Construction 3.4 (p.14)`
- **After:** `Construction 3.4 (p.14-15)` (storage formula on p.15)

#### [WangRen notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^21\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md#user-content-fn-21-956c33c038b1ed9a9b3659412c3862d4)
- **Issue:** One quoted phrase is close paraphrase rather than verbatim; marked as paraphrase
- **Before:** `(presented with verbatim quote marks)`
- **After:** `(marked as paraphrase of proof argument)`

#### [WangRen notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^24\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md#user-content-fn-24-956c33c038b1ed9a9b3659412c3862d4)
- **Issue:** Paper says "streams the database by each element" not "one entry at a time"
- **Before:** `"The client streams the entire database one entry at a time."`
- **After:** `"The client streams the database by each element."`
