## Group D — Fixes Applied

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^7\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** INCORRECT — PEval description mischaracterized as "placing the punctured key's seeds into positions." PDF Figure 5 (p.13) defines PEval as computing the leaf node at position x.
- **Before:** `PEval reconstructs the tree by placing the punctured key's seeds into positions as if j were the punctured point.`
- **After:** `PEval computes the leaf node at position x of the tree reconstructed from the pair (j, k_i), where j is the guessed puncture point; it outputs y = G_x((j, k_i)).`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^13\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** INCORRECT — Claimed "the structure reveals which subtree x is in," but paper (p.9) says "without revealing x, there is no way to evaluate." The paper's point is that x is needed for evaluation, not that the structure leaks information.
- **Before:** `Even without x, the structure reveals which subtree x is in.`
- **After:** `without revealing x, there is no way to evaluate the pPRF punctured key at the other points.`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^29\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** INCORRECT — Table said "~2 KB" but footnote derivation yields 512 bytes per server = ~1 KB total.
- **Before:** `~2 KB (at N = 2^32)` / `so ~1 KB total.`
- **After:** `~1 KB (at N = 2^32)` / `so ~0.5 KB per server (~1 KB total for both servers).`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^1\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Privacy definition description inaccurate; the simulator replaces the client, not "the other server."
- **Before:** `The adversary controls one server and interacts with a simulator for the other.`
- **After:** `The adversary A acts as one server, while a simulator Sim replaces the client in the simulated experiment.`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^5\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — "security-parameter-dependent factors" should be "factors very large in the security parameter" per the paper's wording.
- **Before:** `very large security-parameter-dependent factors`
- **After:** `factors very large in the security parameter`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^6\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — "chunk" should be "interval" per the paper's terminology (p.15).
- **Before:** `one element per chunk of size sqrt(N)`
- **After:** `one element for each interval of size sqrt(N) within [N]`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^8\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Privacy reasoning attributed to Definition 3.2 but comes from proof of Theorem 3.1 (p.13).
- **Before:** (no attribution)
- **After:** `(proof of Theorem 3.1, p.13)`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^12\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Dropped factor of 2 from total enumeration time: paper says "2N log N," not "N log N."
- **Before:** `N log N`
- **After:** `N log N per pass ... the whole process ... takes time 2N log N`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^14\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Page reference "p.20-21" but Lemma 4.1 is on p.21; added citation context for Dottling et al.
- **Before:** `Section 4.3 (p.20-21)`
- **After:** `Section 4.3 (p.21)` with `Dottling et al. (CRYPTO 2019) [19]`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^18\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Used slightly different phrasing from the paper ("contains" vs "will contain").
- **Before:** `The set S contains each element`
- **After:** `The set S will contain each element`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^22\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Simplified simulator description; updated to match paper's q_sim notation.
- **Before:** `samples a random key k and a random element alpha from [sqrt(N)]`
- **After:** `runs k <- F.Gen(1^lambda), samples alpha uniformly from [sqrt(N)], and outputs q_sim <- F.Puncture(k, alpha)`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^36\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Editorial extrapolation "much less client storage at larger scales" not supported by Figure 8 data.
- **Before:** `has much less client storage than Checklist at larger scales`
- **After:** `At this benchmark size, both TreePIR and Checklist have similar client storage (67 MB vs 78 MB).`

#### [TreePIR_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) — [\[^45\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md)
- **Issue:** MINOR — Added editorial label "PRP-PIR" not in the paper.
- **Before:** `The shift technique was previously used in PRP-PIR [15].`
- **After:** `This technique was used before in [15].`

---

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^8\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** INCORRECT — Client storage formula doesn't appear in the paper. Replaced with the paper's actual formulas.
- **Before:** `reducing client storage from O(n) to O(n/T * log(n/T) + Q * log(n/T))`
- **After:** `reducing client storage from O(n) to O(Qw + Q log n) (Theorem 4.1 / Section 4.3, p.21–22)`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^5\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — DS.Init listed as an interface operation but PDF defines it as a separate initialization algorithm.
- **Before:** `DS.Init(m, m'): initialize with m elements in m' positions (m' > m). DS.Access(c) -> e:`
- **After:** `DS.Init(m, m'): randomized initialization algorithm (not an interface operation). Three interface operations: DS.Access(c) -> e:`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^6\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Security definition spans pp.12-13, not just p.13.
- **Before:** `Section 3.1 (p.13)`
- **After:** `Section 3.1 (pp.12–13)`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^9\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Truncated the hash-map detail about the global array C.
- **Before:** footnote missing hash-map detail
- **After:** Added: `"stores the consumed columns, along with a hash map to allow finding the index of any column in C (i.e., 'invert' C) in constant time."`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^10\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Simplified amortization scope; added "across m calls with distinct c."
- **Before:** `O(1) amortized time.`
- **After:** `O(1) amortized time across m calls with distinct c.`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^12\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Derived formula O(|C| * (log m' + log |C|)) not in the PDF; replaced with paper's O(m log m).
- **Before:** `Storage is O(|C| * (log m' + log |C|)) bits`
- **After:** `Storage is O(m log m) bits in total ... when m' = O(m)`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^14\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Elided distinction between initial key ck and updated key ck'.
- **Before:** footnote without ck/ck' distinction
- **After:** Added: `Initially ck = (ck_hat, Hist); after each query, the updated key is ck' = (ck_hat, Hist) with the appended consumed column.`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^21\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Omitted variable naming from the PDF's Reconstruct step.
- **Before:** `the value is XORed onto the parity value for the new column`
- **After:** `the Reconstruct step computes c = DS_j.Locate(q[j]) and updates h_c = h_c XOR a[j]`

#### [WangRen_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) — [\[^29\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md)
- **Issue:** MINOR — Close paraphrase lacked specificity about the reduction mechanism.
- **Before:** `"The lower bound ... can be extended to the amortized server probes over many PIR queries, using a reduction from [CGHK22]."`
- **After:** Expanded with: `Theorem 6.2 showing that any multi-query scheme with T amortized probes implies a single-query scheme with O(T) probes and the same storage.`

---

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^16\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** INCORRECT — Cited Table 1 (p.3) for online bandwidth but Table 1 doesn't distinguish online vs. offline. Also used O(n^{1/3}) instead of O_tilde(n^{1/3}).
- **Before:** `O(n^{1/3}) online bandwidth per Table 1 (p.3)`
- **After:** `O_tilde(n^{1/3}) online bandwidth per Theorem 1.5 (p.5)`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^5\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — Enumerated "five ways" but PDF uses bullet points without numbering.
- **Before:** `in five ways`
- **After:** `in several ways (summarized from the Remarks on p.21)`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^10\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — Cited Section 4.2 (p.14) for the >= 0.1 correctness probability, but the derivation is in Section 4.5 (p.17-19).
- **Before:** `Section 4.2 (p.14)`
- **After:** `Section 4.2/4.5 (p.14, 17-19)`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^13\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — "n^{1/6} planar sets per dimension" stated as fixed count but PDF gives E[|X_i|] = n^{1/6} (expected).
- **Before:** `has n^{1/6} planar sets per dimension`
- **After:** `has an expected n^{1/6} planar sets per dimension`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^14\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — Omitted that Phase 1 preprocessing is executed upfront before piggybacking.
- **Before:** `The generic construction piggybacks the next phase's preprocessing`
- **After:** `The generic construction executes preprocessing upfront, then piggybacks the next phase's preprocessing`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^19\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — Used "birthday bound" but the PDF uses a standard independent-trial argument and "Markov Inequality."
- **Before:** `using the birthday bound`
- **After:** `using an independent-trial bound`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^26\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — Client storage phrased as two additive terms but PDF states a unified O(n^{2/3}) bound.
- **Before:** `the current batch plus O(n^{2/3}) set descriptions`
- **After:** `only O(n^{2/3}) total space (covering the current batch and set descriptions)`

#### [IshaiShiWichs_2025_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) — [\[^36\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md)
- **Issue:** MINOR — Cited "Section 1.2-1.3" but the adaptive correctness attack is entirely within Section 1.3.
- **Before:** `Section 1.2-1.3 (p.7-8)`
- **After:** `Section 1.3 (p.7-8)`

---

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^1\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Abstract is on the unnumbered title page; removed "p.1."
- **Before:** `Abstract (p.1)`
- **After:** `Abstract`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^3\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — "C bits of offline communication" but Theorem 23 defines C as bits the client *downloads* in the offline phase.
- **Before:** `C bits of offline communication`
- **After:** `the client downloads C bits in the offline phase`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^10\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Omits the trivial constraint s(n) <= n from the definition.
- **Before:** `Formal definition of puncturable pseudorandom sets.`
- **After:** `Formal definition of puncturable pseudorandom sets (for set size s with s(n) <= n).`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^13\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Conflated general Theorem 3 with GGM-tree instantiation (Corollary 6).
- **Before:** `with keys of length O(λ log n)`
- **After:** `with keys of length kappa(λ, n) + O(log n); instantiated with GGM-tree PRF (Corollary 6), this gives O(λ log n)`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^14\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Section B.2 is "Proof of Theorem 3," not just "Efficiency analysis."
- **Before:** `Efficiency analysis of Construction 4`
- **After:** `Proof of Theorem 3 (includes efficiency analysis of Construction 4)`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^15\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Quoted text omits the parenthetical abbreviation present in the PDF.
- **Before:** `"A puncturable pseudorandom set is very closely related to a puncturable pseudorandom function."`
- **After:** `"A puncturable pseudorandom set is very closely related to a puncturable pseudorandom function ('puncturable PRF')."`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^19\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Attributed DPFs to "GI14" alone but PDF references [GI14, BGI15, BGI16].
- **Before:** `Standard DPFs (GI14)`
- **After:** `Standard DPFs [GI14, BGI15, BGI16]`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^22\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Used "kappa" but PDF uses "|kappa|" (the key length).
- **Before:** `O(λ * kappa + ...)`
- **After:** `O(λ * |kappa| + ...), where |kappa| denotes the key length`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^28\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Cites "p.57" but the union-bound result is on p.58.
- **Before:** `Appendix D.2 (p.57)`
- **After:** `Appendix D.2 (p.57-58)`

#### [CK20_2019_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) — [\[^42\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
- **Issue:** MINOR — Comparison table listed Thm 17 assumption as "None" but Table 2 in PDF says "OWF."
- **Before:** `| Assumption | None | OWF | None |`
- **After:** `| Assumption | None | OWF | OWF |`

---

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^2\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — "three novel state-of-the-art" is misleading; Checklist is from 2021. Added companion scheme names.
- **Before:** `one of three novel state-of-the-art client preprocessing PIR schemes`
- **After:** `alongside Checklist [21] and TreePIR [23] as one of three state-of-the-art client preprocessing PIR schemes`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^8\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Bracketed [PRFs] presented as part of a direct quote; PDF actually says "they."
- **Before:** `"Unlike previous schemes, [PRFs] will not be necessary to argue security."`
- **After:** `"unlike previous schemes, they will not be necessary to argue security" (where "they" refers to PRFs)`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^9\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Location is Footnote 7 on p.16, not the main Appendix A body.
- **Before:** `Appendix A (p.16)`
- **After:** `Appendix A, Footnote 7 (p.16)`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^19\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Step numbering imprecise: r_i sampled in step 3, S_refresh in step 4.
- **Before:** `Query step 4–5 (p.9)`
- **After:** `Query step 3–4 (p.9)`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^20\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Citation from intuition section used without noting the concrete example context.
- **Before:** `Section 1.2 (p.3)`
- **After:** `Section 1.2, Intuition (p.3): ... (from concrete example with N=16, Q=4)`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^24\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Editorial gloss was inside the quote but is not in the PDF.
- **Before:** `"...effectively removing the old element from this hint's position and adding the new one."`
- **After:** `"..." — effectively removing the old element ... (paraphrase of the proof's interpretation).`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^39\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — "beats DPF after just 2 queries" implies 2 is the breakeven; paper says "already better even when performing two queries."
- **Before:** `beats DPF (no preprocessing) after just 2 queries`
- **After:** `beats DPF (no preprocessing) at as few as 2 queries`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^41\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Presented as direct quote but is lightly condensed; PDF also notes bandwidth tradeoff.
- **Before:** `"SinglePass achieves 50-100x better preprocessing time..."`
- **After:** `"we will see that SinglePass achieves 50-100x better preprocessing time..." (lightly condensed; the PDF also notes the bandwidth tradeoff).`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^43\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Section number error: blocklist benchmark is in Section 6, not Section 4.
- **Before:** `Section 4 (p.13)`
- **After:** `Section 6 (p.13)`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^48\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — First clause paraphrased from Footnote 6 but presented as direct quote; footnote also discusses Checklist's keyword query support.
- **Before:** `"our single pass scheme is a pure PIR scheme..."`
- **After:** `"Our single pass scheme is a pure PIR scheme..." (paraphrase; the footnote also discusses Checklist's keyword query support and O(log N) amortized bandwidth).`

#### [SinglePass_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) — [\[^52\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md)
- **Issue:** MINOR — Omits O(Q + N/Q) complexity cost and distinction that updatable scheme requires the inverse.
- **Before:** `Storing the inverse permutation ... has constant overhead; in some scenarios it may be beneficial to omit the inverse to save space`
- **After:** Added `at the cost of O(Q + N/Q) client query time. The inverse is only needed in the static scheme for this step; the updatable scheme requires the inverse for O(1) updates`

---

#### [Plinko_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) — [\[^27\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md)
- **Issue:** MINOR — Theorem 5.3 states total query time, not server-specific time.
- **Before:** `(paraphrase; the theorem does not explicitly break down...)`
- **After:** `the theorem states total (client + server) query time; server-specific Õ(n/r) is inferred`

#### [Plinko_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) — [\[^37\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md)
- **Issue:** MINOR — Section misattribution: "Additions and Deletions" on p.9 is in Section 1, not Section 5.2.
- **Before:** `Section 5.2, "Additions and Deletions" (p.9)`
- **After:** `Section 1, "Additions and Deletions" (p.9)`

#### [Plinko_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) — [\[^38\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md)
- **Issue:** MINOR — Same section misattribution as [^37].
- **Before:** `Section 5.2, "Additions and Deletions" (p.9)`
- **After:** `Section 1, "Additions and Deletions" (p.9)`

---

#### [RMS24_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md) — [\[^3\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md)
- **Issue:** MINOR — Quote appears in Section 3.1 (p.4), not Section 1 (p.2).
- **Before:** `Section 1 (p.2)`
- **After:** `Section 3.1 (p.4)`

#### [RMS24_2024_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md) — [\[^9\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md)
- **Issue:** MINOR — Misattributes 0.4 figure as being for "simpler non-paired strategy"; it's the conservative rounding for the paired strategy.
- **Before:** `conservative estimate for the simpler non-paired strategy`
- **After:** `conservative estimate (the paired strategy achieves close to but fewer than 0.5*λ*sqrt(N))`

---

#### [IncPIR_2021_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^1\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md)
- **Issue:** MINOR — Cited "Section 4.1" but the quoted sentence is in the intro paragraph of Section 4.
- **Before:** `Section 4.1 (p.5)`
- **After:** `Section 4 (p.5)`

#### [IncPIR_2021_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) — [\[^51\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md)
- **Issue:** MINOR — Cited "Section 1" but the quoted text is at end of Section 3.4 on p.5.
- **Before:** `Section 1 (p.5)`
- **After:** `Section 3.4 (p.5)`

---

#### [Piano_2023_notes](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) — [\[^42\]](../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md)
- **Issue:** MINOR — Stated ZLTS23/LP22 "require FHE" but Table 3 lists "LWE" as the assumption; FHE is the cryptographic primitive, LWE is the hardness assumption.
- **Before:** `but require FHE`
- **After:** `but require LWE (and use FHE)`
