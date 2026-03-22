## HarmonyPIR — Engineering Notes

<a id="toc"></a>

<table><tr><td>

<sub><nobr>1. <a href="#lineage">Lineage</a></nobr></sub><br>
<sub><nobr>2. <a href="#core-idea"><b>Core Idea</b></a></nobr></sub><br>
<sub><nobr>3. <a href="#variants">Variants</a></nobr></sub><br>
<sub><nobr>4. <a href="#novel-primitives-abstractions">Novel Primitives / Abstractions</a></nobr></sub><br>
<sub><nobr>5. <a href="#cryptographic-foundation">Cryptographic Foundation</a></nobr></sub><br>
<sub><nobr>6. <a href="#key-data-structures"><b>Key Data Structures</b></a></nobr></sub><br>
<sub><nobr>7. <a href="#database-encoding">Database Encoding</a></nobr></sub><br>
<sub><nobr>8. <a href="#protocol-phases"><b>Protocol Phases</b></a></nobr></sub><br>
<sub><nobr>9. <a href="#correctness-analysis">Correctness Analysis</a></nobr></sub><br>
<sub><nobr>10. <a href="#complexity"><b>Complexity</b></a></nobr></sub>

</td><td>

<sub><nobr>11. <a href="#preprocessing-characterization">Preprocessing Characterization</a></nobr></sub><br>
<sub><nobr>12. <a href="#performance-benchmarks"><b>Performance Benchmarks</b></a></nobr></sub><br>
<sub><nobr>13. <a href="#comparison-with-prior-work">Comparison with Prior Work</a></nobr></sub><br>
<sub><nobr>14. <a href="#optimization-catalog"><b>Optimization Catalog</b></a></nobr></sub><br>
<sub><nobr>15. <a href="#portable-optimizations"><b>Portable Optimizations</b></a></nobr></sub><br>
<sub><nobr>16. <a href="#implementation-notes"><b>Implementation Notes</b></a></nobr></sub><br>
<sub><nobr>17. <a href="#deployment-considerations">Deployment Considerations</a></nobr></sub><br>
<sub><nobr>18. <a href="#key-tradeoffs-limitations"><b>Key Tradeoffs & Limitations</b></a></nobr></sub><br>
<sub><nobr>19. <a href="#open-problems">Open Problems</a></nobr></sub><br>
<sub><nobr>20. <a href="#related-papers-in-collection">Related Papers in Collection</a></nobr></sub><br>
<sub><nobr>21. <a href="#uncertainties">Uncertainties</a></nobr></sub>

</td></tr></table>

| Field | Value |
|-------|-------|
| **Paper** | [Efficient Single-Server Stateful PIR Using Format-Preserving Encryption](https://eprint.iacr.org/2026/437) (2026) |
| **Authors** | Pranav Shriram Arunachalaramanan, Ling Ren |
| **Archetype** | Construction + Engineering optimization (improves WangRen with new hint organization and optimized PRP) |
| **PIR Category** | Group 2b — Interactive-Hint |
| **Security model** | Semi-honest single-server, computational (OWF for Harmony-AES; empirical FPE security for Harmony-FF1) |
| **Additional assumptions** | Harmony-AES: OWF (PRP from PRF from AES). Harmony-FF1: FF1 FPE is a secure small-domain PRP (NIST-standardized, empirical assumption)&#8201;[^1] |
| **Correctness model** | Deterministic at the information-theoretic layer (permutation-based hint row ensures each DB entry appears exactly once; correctness proved by induction in Lemma 5.1 and Theorem 5.2). The formal PIR definition (Section 3.2) allows negligible failure probability ε, but the actual construction never fails.&#8201;[^2] |
| **Rounds (online)** | 1 (client sends T indices, server returns T entries) |
| **Record-size regime** | Small (32-byte entries in benchmarks; similar results for entries up to 256 bytes)&#8201;[^3] |

[^1]: Section 5.2 (p.7): Harmony-FF1 uses FF1 FPE, recently standardized by NIST [15]. Harmony-AES uses the Hoang et al. PRP [24], provably secure under the assumption that AES is a secure PRF.

[^2]: Theorem 5.2 (p.7): Correctness follows from Lemma 5.1, which proves by induction that hint parities always match the combined parity of DB entries in their segment.

[^3]: Section 7.2 (p.10): "We perform each comparison for databases consisting of 2^20, 2^24 and 2^28 entries, with 32 byte entries. We note that a similar comparison holds for entry sizes up to 256 bytes."

---

<a id="lineage"></a>

### Lineage <a href="#toc">⤴</a>

| Field | Value |
|-------|--------|
| **Builds on** | WangRen [Group 2b] (relocation data structure, hint table with permutations, tight space-time tradeoff ST = O(nw)), Hoang-Morris-Rogaway [24] (small-domain PRP via card shuffle) |
| **What changed** | WangRen uses T partitioned permutations (one per row of the hint table), requiring T costly small-domain PRP instances. HarmonyPIR replaces the hint table with a single "hint row" using only one permutation of size 2N, enabling efficient instantiation via FF1 FPE or an optimized Hoang et al. PRP with 4× fewer AES calls.&#8201;[^4] |
| **Superseded by** | N/A |
| **Concurrent work** | Balanced PIR [3] (by the same first author and advisor) — strikes a different point in the computation-communication tradeoff space&#8201;[^5] |

[^4]: Section 2.2 (p.2): "The key idea. Our PIR scheme HarmonyPIR uses a new hint organization, which requires only a single random permutation of size 2N."

[^5]: Section 1 (p.1) and Table 1 (p.2): Balanced PIR [3] achieves efficient computation and client storage but has costly communication; HarmonyPIR achieves efficient communication while Harmony-FF1 matches Balanced PIR's computation.

---

<a id="core-idea"></a>

### Core Idea <a href="#toc">⤴</a>

WangRen PIR divides the database into T partitions, each with its own random permutation — requiring T small-domain PRP instances and making FF1 instantiation infeasible (FF1 needs domain size ≥ 10^6, but partition size M = N/T ≈ √N would require N ≥ 2.5 × 10^11, i.e., "a quarter trillion").&#8201;[^6] HarmonyPIR replaces the partitioned hint table with a single "hint row" of 2N cells using one permutation of size 2N. The N database indices appear once each, and N cells are empty. The hint row is partitioned into M = 2N/T segments of size T. Each segment's XOR parity is a hint. On query, the client uses one segment to retrieve the answer, then relocates its values to random empty cells. This single-permutation design enables FF1 instantiation (domain = 2N ≥ 10^6 when N ≥ 500K), yielding Harmony-FF1 with 100× better amortized computation than WangRen. For Harmony-AES, a 4× AES-call reduction via phase-group batching further reduces client computation over WangRen's PRP.&#8201;[^7]

[^6]: Section 2.2 (p.3): "This means the database size N must at least be a quarter trillion, which rules out many practical application scenarios." The math: FF1 requires 2M ≥ 10^6, so M ≥ 500,000; with T ≈ M ≈ √N, N ≈ M² = 2.5 × 10^11.

[^7]: Section 2.2 (p.2–3): "This allows us to efficiently instantiate the random permutation in HarmonyPIR through two ways: i) using an empirical FPE called FF1 [15], and ii) using the small-domain PRP from Hoang et al. [24] (with improvements)."

---

<a id="variants"></a>

### Variants <a href="#toc">⤴</a>

| Variant | Key Difference | PRP Instantiation | Amort Computation | Security Basis | Best For |
|---------|---------------|-------------------|-------------------|----------------|----------|
| Harmony-FF1 | FF1 FPE | NIST FF1 [15] | 1× (baseline) | Empirical FPE security (NIST-standardized) | Maximum performance; databases with N ≥ 500K entries&#8201;[^8] |
| Harmony-AES | Improved Hoang et al. PRP | AES-based card shuffle with 4× batching | ~15× slower than Harmony-FF1&#8201;[^9] | Provably secure under AES/PRF | Conservative security; any database size |

[^8]: Section 1.1 (p.1): "For strong security guarantees, Harmony-FF1 requires the database to contain at least half a million entries, per the NIST recommendation [15]." See also Section 5.2 (p.7).

[^9]: Table 1 (p.2): Harmony-AES has ~15× the amortized computation of Harmony-FF1 (and Balanced PIR).

Both variants have identical communication costs; they differ only in client computation due to PRP instantiation efficiency.&#8201;[^10]

[^10]: Section 7.3 (p.11): "Both variants of HarmonyPIR have the same communication, because their requests and responses are identical (in fact, their efficiencies only differ in client computation)."

---

<a id="novel-primitives-abstractions"></a>

### Novel Primitives / Abstractions <a href="#toc">⤴</a>

#### Restricted Relocation Data Structure (DS')

| Field | Detail |
|-------|--------|
| **Name** | Restricted relocation data structure DS' |
| **Type** | Data structure (adaptation of WangRen's DS) |
| **Interface / Operations** | DS'.Access(c) → v: return value in cell c. DS'.Locate(v) → c: return cell containing value v. DS'.RelocateSegment(s): relocate all T values in segment s to random empty cells, one after the other.&#8201;[^11] |
| **Correctness definition** | Inherits from DS: each value in [N'] appears exactly once; Access and Locate are inverses; relocated values go to unconsumed empty cells (Lemma 4.1, inheriting from DS Lemmas 3.1 and 3.2).&#8201;[^12] |
| **Security definition** | Randomness invariance: after any number of RelocateSegment operations, values in non-relocated cells follow a uniform random permutation, even conditioned on values at relocated cells (Lemma 4.1).&#8201;[^13] |
| **Purpose** | Enables segment-level relocation with O(R) storage for R RelocateSegment operations, instead of O(R·T) for R·T individual Relocate operations.&#8201;[^14] |
| **Built from** | WangRen's relocation data structure DS [47], with the modified history data structure Hist' (Algorithm 2). |
| **Standalone complexity** | Access/Locate: O(1) PRP evaluations in expectation&#8201;[^15]; RelocateSegment: O(1). |

[^11]: Section 4.1 (p.5): DS' only allows Access, Locate, and RelocateSegment operations (does not allow individual Relocate operations).

[^12]: Lemma 4.1 (p.6): "DS' satisfies correctness and randomness invariance as defined in Section 3.4."

[^13]: Section 3.4 (p.4–5): Randomness invariance formally defined: the list of values in DS follows P(U_{N',N'-i}) after i relocations, conditioned on relocated values.

[^14]: Section 4.2 (p.5–6): "Observe that DS' only needs O(R) client storage (rather than O(R·T)) for performing R RelocateSegment operations, by using Hist'."

[^15]: Theorem 5.5 (p.8): Cites "[47, Lemmas A.1 and A.2]" for the fact that each Locate and Access operation involves O(1) small-domain PRP evaluations in expectation.

#### History Data Structure for Segment Relocations (Hist')

| Field | Detail |
|-------|--------|
| **Name** | Hist' (Algorithm 2) |
| **Type** | Data structure |
| **Interface / Operations** | Hist'.Init(T): initialize with segment size T. Hist'.Append(s): append segment s to relocated-segment list. Hist'[p]: index-based lookup — returns S[⌊p/T⌋]·T + (p mod T). Hist'^{-1}[c]: value-based lookup — returns M[⌊c/T⌋]·T + (c mod T).&#8201;[^16] |
| **Purpose** | Tracks relocation history at segment granularity rather than cell granularity, achieving O(R) storage for R segment relocations instead of O(R·T). |

[^16]: Algorithm 2 (p.5): Hist' stores a list S of relocated segments and a map M from segment to position. Lookups use segment-level indirection with cell offset within segment.

#### Optimized Small-domain PRP (Section 6.2)

| Field | Detail |
|-------|--------|
| **Name** | Phase-group optimized variant of Hoang et al. [24] card shuffle (Algorithm 5) |
| **Type** | Cryptographic primitive (small-domain PRP) |
| **Interface / Operations** | P_k(X) → Y: evaluate permutation at point X. P_k^{-1}(Y) → X: evaluate inverse.&#8201;[^17] |
| **Built from** | AES block cipher |
| **Key optimization** | Groups β = 4 consecutive rounds into a "phase." Cards in a phase share a "phase group" G of size 2^β = 16 positions. A single AES call generates 16·4 = 64 bits, sufficient for all round-function outputs in the phase. This yields 4× fewer AES invocations: r/β instead of r.&#8201;[^18] |
| **Standalone complexity** | Θ(log N − log ε) rounds total, requiring (log N − log ε)/4 AES calls per evaluation.&#8201;[^19] |
| **(N'/2, ε)-security** | Lemma 6.1: HarmonyPIR only reveals N of 2N permutation positions to the server across M/2 queries. A PRP that is (N'/2, ε)-secure suffices, rather than full (N', ε)-security. This relaxation may enable faster or simpler PRP constructions.&#8201;[^20] |

[^17]: Section 6 (p.8): Formal definition of (q, ε)-secure small-domain PRP.

[^18]: Section 6.2 (p.10): "For such a shuffle, observe that 2^β · β must be smaller than the output of AES (which is 128 bits)... Hence, we choose β = 4. To evaluate the small-domain PRP on a single input, Algorithm 5 only requires r/β AES invocations."

[^19]: Theorem 6.2 (p.9): "There exists a small-domain PRP P that is (N'/2, ε)-secure, and the algorithms for P_k and P_k^{-1} both run in time Θ(log N − log ε)."

[^20]: Lemma 6.1 (p.9): "The client makes only M/2 queries using the same DS' in HarmonyPIR, after which it reruns the offline phase... During these queries, the server/adversary only sees the values at N cells of DS'."

---

<a id="cryptographic-foundation"></a>

### Cryptographic Foundation <a href="#toc">⤴</a>

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Harmony-AES: OWF (AES is a secure PRF → small-domain PRP via [24]). Harmony-FF1: FF1 FPE is a secure small-domain PRP (empirical assumption, NIST-standardized [15]).&#8201;[^21] |
| **Encryption/encoding scheme(s)** | N/A — no FHE. Uses small-domain PRP for hint row permutation and XOR for parity computations. |
| **Key structure** | Single AES key k (for PRP round functions and round keys). Harmony-FF1 uses a single FF1 key.&#8201;[^22] |
| **Correctness condition** | Deterministic: hint parity H[s] always equals XOR of DB entries at indices in segment s (Lemma 5.1).&#8201;[^23] |

[^21]: Section 5.2 (p.7): Harmony-AES's PRP is "provably secure under the assumption that the well-established Advanced Encryption Standard (AES) is secure." Harmony-FF1 uses FF1 where "for a domain of size at least 10^6, the resources required for best known attacks on FF1 are prohibitive."

[^22]: Section 6.1 (p.9): "Practically, the round functions and the round keys can be instantiated using AES [16] with a key k."

[^23]: Lemma 5.1 (p.7): Proved by induction — base case: offline phase correctly initializes parities; inductive step: relocations correctly update parities using the third correctness condition of DS'.

---

<a id="key-data-structures"></a>

### Key Data Structures <a href="#toc">⤴</a>

- **Hint row:** A single list of 2N cells. The N database indices [N] each appear exactly once; the remaining N cells are empty (⊥). The 2N values are randomly permuted by a single PRP of size 2N. Partitioned into M = 2N/T segments of size T.&#8201;[^24]
- **Hint parities H:** List of M = 2N/T XOR parities, one per segment. H[i] = ⊕_{j ∈ P_i} DB[HR[j]], where P_i is the set of cells in segment i.&#8201;[^25]
- **Restricted relocation data structure DS':** Stores the hint row compactly. Uses Hist' (a list of relocated segments and a segment-to-position map) plus the PRP key to reconstruct cell contents via Access/Locate. Client storage is O(M) entries (not O(N)).&#8201;[^26]
- **Relocation history C:** Tracks which segments have been relocated. After M/2 queries, all empty cells are consumed and the offline phase must be re-executed.&#8201;[^27]

[^24]: Section 2.2 (p.3): "Hints in HarmonyPIR are sampled according to a list of 2N cells, called the hint row."

[^25]: Section 5.1 (p.6): "The i-th hint parity, denoted as H[i], is computed as the combined parity of the database entries at the indices in segment i of DS'."

[^26]: Theorem 5.5 (p.8): Client storage is O(Mw + M log N) bits — M hint parities of w bits each, plus Hist' with at most M/2 segments.

[^27]: Section 5.1 (p.7): "After M/2 queries, there will be no more empty cells left in DS', and the client cannot make queries anymore."

---

<a id="database-encoding"></a>

### Database Encoding <a href="#toc">⤴</a>

- **Representation:** Flat array of N entries, each w bits.
- **Record addressing:** Direct index-based — DB[k] retrieves the k-th entry.
- **Preprocessing required:** None on server side. The client streams the database once during the offline phase to compute hint parities.

---

<a id="protocol-phases"></a>

### Protocol Phases <a href="#toc">⤴</a>

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DS' Init | Client | Initialize restricted relocation data structure with 2N cells, segment size T, and a fresh PRP key | — | Once per offline phase |
| Hint Computation | Client | Stream DB from server; for each entry DB[k], locate its cell c ← DS'.Locate(k), compute segment s = ⌊c/T⌋, update H[s] ← H[s] ⊕ DB[k]&#8201;[^28] | Nw bits ↓ | Once per offline phase |
| Query (Request) | Client | Locate query index: c ← DS'.Locate(q), s = ⌊c/T⌋, r = c mod T. Build request Q of T values: Q[i] = DS'.Access(s·T+i) for i ≠ r; Q[r] = DS'.Access(l) where l is a random cell outside segment s.&#8201;[^29] | T·log N bits ↑ | Per query |
| Query (Response) | Server | Return DB entries at non-empty indices in Q&#8201;[^30] | T·w bits ↓ | Per query |
| Answer | Client | A ← H[s] ⊕ (⊕_{i ∈ [T]\r} R[i])&#8201;[^31] | — | Per query |
| Relocate | Client | DS'.RelocateSegment(s); for each relocated value, find its new segment d_i and update H[d_i] ← H[d_i] ⊕ R[i] (or ⊕ A for the query index)&#8201;[^32] | — | Per query |

[^28]: Algorithm 3, PIR.Offline (p.6): The client streams DB entry by entry, locating each in DS' and XORing into the appropriate hint parity.

[^29]: Algorithm 3, PIR.Online, lines 4–10 (p.6): The query index q is replaced in the request with a random value from DS', hiding which element is being queried.

[^30]: Algorithm 3, line 11 (p.6): "Sends Q to the server and receive a response R of the database entries at indices in Q."

[^31]: Algorithm 3, line 12 (p.6): Client recovers DB[q] as the XOR of H[s] with all other response entries in the segment.

[^32]: Algorithm 3, lines 13–17 (p.6–7): After relocation, hint parities are updated so they remain consistent with the new segment contents.

#### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| DB stream | ↓ | N·w bits | No | Offline, per epoch of M/2 queries |
| Request Q | ↑ | T·⌈log N⌉ bits | No | Per query; T values from [N] ∪ {⊥} |
| Response R | ↓ | T·w bits | No | Per query; DB entries at non-empty Q indices |

#### Database Modification Handling

When DB[i] is modified to DB'[i], the server sends diff = DB[i] ⊕ DB'[i] to the client. The client finds the segment containing index i as s = ⌊DS'.Locate(i)/T⌋ and updates H[s] ← H[s] ⊕ diff.&#8201;[^33]

[^33]: Section 5.1, "Handling Database Modifications" (p.7): Single Locate operation plus one XOR per update.

---

<a id="correctness-analysis"></a>

### Correctness Analysis <a href="#toc">⤴</a>

#### Option C: Deterministic Correctness

Deterministic correctness — the scheme never fails, for any sequence of queries.&#8201;[^34]

[^34]: Theorem 5.2 (p.7): "The PIR scheme in Algorithm 3 satisfies correctness."

**Proof structure:** By induction on the query count j (Lemma 5.1):
- **Base case (j = 1):** Each DB index has a unique location in DS' (correctness condition 1 of DS'). The offline phase correctly computes hint parities by locating each index and XORing.
- **Inductive step (j → j+1):** After query j, indices in the used segment s are relocated. The client finds destination cells using Locate and updates hint parities. By the third correctness condition of DS' (non-relocated cells remain unchanged), only the parities of the source segment and destination segments need updating.&#8201;[^35]

[^35]: Lemma 5.1 (p.7): "We can show this by induction... From the third correctness condition of DS' (Section 3.4), updating these hint parities is sufficient as the other cells of DS' remain unchanged."

#### Privacy Analysis

Requests are computationally indistinguishable from T random values sampled without replacement from the remaining DS' contents (Lemma 5.3). The simulator for the ideal world simply samples from P_T(U_{N,N-T·i}) for the i-th request (Theorem 5.4). This holds for the adaptive adversary defined in Experiment 1 (Section 3.2), where the server can choose query indices based on prior views.&#8201;[^36]

[^36]: Theorem 5.4 (p.8): "We construct a simulator for the server using Lemma 5.3; the i-th request of the client is simulated using the distribution P_T(U_{N,N-T·i}). Such a simulation works for the adaptive adversary in Section 3.2 because Lemma 5.3 holds for any sequence of query indices."

---

<a id="complexity"></a>

### Complexity <a href="#toc">⤴</a>

#### Core metrics

| Metric | Asymptotic | Concrete (2^27 × 32B, Harmony-FF1) | Phase |
|--------|-----------|-------------------------------------|-------|
| Online communication (total) | O(Tw + T log N) | 216 KB (request + response)&#8201;[^37] | Online |
| Server computation | O(T) lookups | — | Online |
| Client computation | O(T) PRP evals + O(T) XORs | 9.36 ms (online)&#8201;[^38] | Online |
| Amortized communication | O(Tw + T log N) | 472 KB&#8201;[^39] | Amortized |
| Amortized computation | O(T) PRP evals + O(T) XORs | 13.2 ms&#8201;[^40] | Amortized |

[^37]: Table 2 (p.11): Online communication is 216 KB total for HarmonyPIR at 2^27 × 32B. The PDF reports combined request + response in a single "Online Comm." column. The request (T·⌈log N⌉ bits) is much smaller than the response (T·w bits) since w = 256 >> log N = 27.

[^38]: Table 2 (p.11): Harmony-FF1 online compute is 9.36 ms; Harmony-AES online compute is 190.9 ms for 2^27 × 32B.

[^39]: Table 2 (p.11): Harmony-FF1 amortized communication is 472 KB for 2^27 × 32B.

[^40]: Table 2 (p.11): Harmony-FF1 amortized computation is 13.2 ms for 2^27 × 32B.

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (2^27 × 32B, Harmony-FF1) | Phase |
|--------|-----------|-------------------------------------|-------|
| Offline communication ↓ | O(Nw) (stream entire DB) | 4096 MB&#8201;[^41] | Offline (per window) |
| Offline computation (client) | O(N) PRP evals + O(N) XORs | 63.7 s&#8201;[^42] | Offline (per window) |
| Client persistent storage | O(Mw + M log N) bits | 1.06 MB (matched to WR PIR storage)&#8201;[^43] | Persistent |
| Amortization window | M/2 = N/T queries | ~N/T queries | — |

[^41]: Table 2 (p.11): Offline communication equals the database size (4096 MB for 2^27 × 32B entries).

[^42]: Table 2 (p.11): Harmony-FF1 offline compute is 63.7 s; Harmony-AES offline compute is 1421 s for 2^27 × 32B.

[^43]: Table 2 (p.11): Client storage is 1.06 MB for both HarmonyPIR variants at 2^27 × 32B, matched to WR PIR's preferred storage.

#### Space-time tradeoff

Client storage S and online communication/computation T satisfy S·T = O(Nw), since S = O(Mw) and T = O(N/M). This meets the Yeo [49] lower bound ST = Ω(nw) when w = Ω(log N), making the tradeoff tight.&#8201;[^44]

[^44]: Section 7.2 (p.10): "HarmonyPIR has a tight space-time tradeoff [49] (i.e., it trades off storage smoothly for communication and computation)."

---

<a id="preprocessing-characterization"></a>

### Preprocessing Characterization <a href="#toc">⤴</a>

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass) — client streams DB entry by entry&#8201;[^45] |
| **Client peak memory** | O(Mw + M log N) bits (hint parities + Hist') |
| **Number of DB passes** | 1 |
| **Hint refresh mechanism** | Full re-download — after M/2 queries, client re-executes offline phase with fresh PRP key&#8201;[^46] |

[^45]: Algorithm 3, PIR.Offline (p.6): "Stream the database from the server. For each k-th entry..."

[^46]: Section 5.1 (p.7): "After M/2 queries, there will be no more empty cells left in DS', and the client cannot make queries anymore. Hence, the offline procedure needs to be executed again."

---

<a id="performance-benchmarks"></a>

### Performance Benchmarks <a href="#toc">⤴</a>

**Hardware:** Apple M4 Pro processor, 24 GB RAM. All experiments single-threaded. WR PIR benchmarked using Balanced PIR [3]'s C++ reimplementation (not original WR PIR code).&#8201;[^47]

[^47]: Section 7.1–7.2 (p.10): "We run all our experiments on a MacBook Pro laptop that has the Apple M4 Pro processor with 24 GB RAM." Footnote 3: WR PIR "C++ implementation... from the work of Balanced PIR [3]."

#### Table 2: Comparison with WR PIR [47]

All schemes use matched client storage. Communication and server computation are identical between HarmonyPIR and WR PIR; they differ only in client computation.

| Scheme | DB | Storage (MB) | Offline Comm (MB) | Offline Compute (s) | Online Comm (KB) | Online Compute (ms) | Amort Comm (KB) | Amort Compute (ms) |
|--------|-----|-------------|------------------|--------------------|-----------------|--------------------|----------------|-------------------|
| WR PIR | 2^19 × 32B (16 MB) | 0.06 | 16 | 17.1 | 13 | 65.9 | 29 | 82.6 |
| Harmony-AES | " | 0.06 | 16 | 3.9 | 13.5 | 8.9 | 29.5 | 12.7 |
| Harmony-FF1 | " | 0.06 | 16 | 0.26 | 13.5 | 0.52 | 29.5 | 0.77 |
| WR PIR | 2^23 × 32B (256 MB) | 0.27 | 256 | 296.6 | 52 | 288.6 | 116 | 361 |
| Harmony-AES | " | 0.27 | 256 | 76 | 54 | 39.8 | 118 | 58.4 |
| Harmony-FF1 | " | 0.27 | 256 | 3.9 | 54 | 2.3 | 118 | 3.3 |
| WR PIR | 2^27 × 32B (4096 MB) | 1.06 | 4096 | 5228 | 208 | 1281 | 464 | 1600 |
| Harmony-AES | " | 1.06 | 4096 | 1421 | 216 | 190.9 | 472 | 277.6 |
| Harmony-FF1 | " | 1.06 | 4096 | 63.7 | 216 | 9.36 | 472 | 13.2 |

[^48]

[^48]: Table 2 (p.11): Exact reproduction. Note: table headers show 2^19/2^23/2^27 entries while Section 7.2 prose says "2^20, 2^24 and 2^28" — the tables are authoritative (see Uncertainties).

#### Table 3: Comparison with RMS PIR [42]

HarmonyPIR uses much less client storage (matched to a lower level) and achieves better amortized communication. HarmonyPIR's communication and computation scale as √(N/64) (with T = √(N/64)), versus RMS PIR's √N.&#8201;[^49]

[^49]: Section 7.3 (p.12): "HarmonyPIR has communication and computation proportional to √(N/64) (as T = √(N/64)), whereas RMS PIR has communication and computation proportional to √N."

| Scheme | DB | Storage (MB) | Offline Comm (MB) | Offline Compute (s) | Online Comm (KB) | Online Compute (ms) | Amort Comm (KB) | Amort Compute (ms) |
|--------|-----|-------------|------------------|--------------------|-----------------|--------------------|----------------|-------------------|
| RMS PIR | 2^19 × 32B (16 MB) | 5.625 | 16 | 1.95 | 1.1 | 0.12 | 1.5 | 0.17 |
| Harmony-AES | " | 4.25 | 16 | 3.9 | 0.2 | 0.09 | 0.46 | 0.15 |
| Harmony-FF1 | " | 4.25 | 16 | 0.26 | 0.2 | 0.006 | 0.46 | 0.01 |
| RMS PIR | 2^23 × 32B (256 MB) | 22.5 | 256 | 31.2 | 4.1 | 0.5 | 5.7 | 0.7 |
| Harmony-AES | " | 17 | 256 | 76 | 0.84 | 0.42 | 1.8 | 0.7 |
| Harmony-FF1 | " | 17 | 256 | 3.89 | 0.84 | 0.02 | 1.8 | 0.03 |
| RMS PIR | 2^27 × 32B (4096 MB) | 90 | 4096 | 527.6 | 16.1 | 2.16 | 22.5 | 3 |
| Harmony-AES | " | 68 | 4096 | 1421 | 3.4 | 2.7 | 7.4 | 4 |
| Harmony-FF1 | " | 68 | 4096 | 75 | 3.4 | 0.1 | 7.4 | 0.2 |

[^50]

[^50]: Table 3 (p.11): When using RMS PIR's preferred storage (large, ~20% of DB), HarmonyPIR uses slightly less storage and achieves 3× better amortized communication and 15–20× better amortized computation (Harmony-FF1).

#### Table 4: Comparison with Balanced PIR [3]

Balanced PIR has comparable computation to Harmony-FF1 but much worse communication. Harmony-FF1 achieves 10× better online communication and 5× better amortized communication.&#8201;[^51]

[^51]: Section 7.3 (p.12): "The online and amortized communication of HarmonyPIR is 10x and 5x better than the online and amortized communication of Balanced PIR, respectively."

| Scheme | DB | Storage (MB) | Offline Comm (MB) | Offline Compute (s) | Online Comm (KB) | Online Compute (ms) | Amort Comm (KB) | Amort Compute (ms) |
|--------|-----|-------------|------------------|--------------------|-----------------|--------------------|----------------|-------------------|
| Balanced PIR | 2^19 × 32B (16 MB) | 0.6 | 16 | 4.9 | 17 | 0.08 | 19.3 | 0.09 |
| Harmony-AES | " | 0.53 | 16 | 3.9 | 1.7 | 0.8 | 3.7 | 1.2 |
| Harmony-FF1 | " | 0.53 | 16 | 0.26 | 1.7 | 0.048 | 3.7 | 0.08 |
| Balanced PIR | 2^23 × 32B (256 MB) | 2.5 | 256 | 85 | 68 | 0.37 | 77.1 | 0.35 |
| Harmony-AES | " | 2.1 | 256 | 76 | 6.8 | 3.4 | 14.8 | 5.7 |
| Harmony-FF1 | " | 2.1 | 256 | 3.89 | 6.8 | 0.19 | 14.8 | 0.3 |
| Balanced PIR | 2^27 × 32B (4096 MB) | 10 | 4096 | 1526 | 272 | 1.57 | 308.6 | 1.8 |
| Harmony-AES | " | 8.5 | 4096 | 1421 | 27 | 18.7 | 59 | 29.5 |
| Harmony-FF1 | " | 8.5 | 4096 | 66 | 27 | 0.85 | 59 | 1.35 |

[^52]

[^52]: Table 4 (p.11): Harmony-AES is 16× better than Balanced PIR in amortized computation; Harmony-FF1 is comparable to Balanced PIR in computation.

---

<a id="comparison-with-prior-work"></a>

### Comparison with Prior Work <a href="#toc">⤴</a>

Relative comparison (from Table 1, normalized to best-in-class = 1×):&#8201;[^53]

| Scheme | Amortized Computation | Amortized Communication |
|--------|----------------------|------------------------|
| RMS PIR [42] | ~15× | ~3× |
| WR PIR [47] | ~100× | 1× |
| Balanced PIR [3] | 1× | ~5× |
| Harmony-AES | ~15× | ~1× |
| Harmony-FF1 | 1× | ~1× |

[^53]: Table 1 (p.2): Approximate and relative metrics, normalized so that the best scheme in each metric is 1×.

Finer-grained ratios from Section 7.3:&#8201;[^54]
- Harmony-AES is 6× better than WR PIR in amortized computation
- Harmony-FF1 is 17–20× faster than RMS PIR in amortized computation
- Harmony-FF1 achieves 10× better online / 5× better amortized communication vs Balanced PIR

[^54]: Section 7.3 (p.11–12): Specific ratios stated in the comparison text for each baseline.

**Key takeaway:** Harmony-FF1 is the first single-server stateful PIR scheme that simultaneously achieves near-optimal amortized communication and amortized computation, using only ~0.06–1 MB of client storage. Harmony-AES offers the same communication advantage with a conservative security assumption (AES), at the cost of ~15× higher computation.

---

<a id="optimization-catalog"></a>

### Optimization Catalog <a href="#toc">⤴</a>

| Optimization | Known/Novel | Source | Improvement | Applicable to |
|-------------|-------------|--------|-------------|---------------|
| Single-permutation hint organization | Novel | This paper | Enables FF1 FPE; eliminates T-permutation overhead | Stateful PIR with partition-based hints |
| Phase grouping for PRP (β=4) | Novel | This paper, Section 6.2 | 4× reduction in AES calls per PRP evaluation&#8201;[^55] | Any Hoang et al. [24] PRP instantiation |
| Round key precomputation | Novel (application) | This paper, Section 6.2 | Eliminates key-generation AES calls during online phase&#8201;[^56] | Single-PRP schemes (not multi-PRP like WR PIR) |
| Segment-level history tracking (Hist') | Novel | This paper, Section 4.2 | O(R) storage vs O(R·T) for R segment relocations | Relocation data structures with segment operations |
| Improved relocation via empty-value lookup (Alg. 7) | Novel | This paper, Section 10 (Appendix) | Shorter lookup chains by locating destination cells via predictable empty-value indices (N + m·T + i) rather than chasing original values&#8201;[^57] | Relocation-based PIR schemes (applies to both HarmonyPIR and WR PIR) |

[^55]: Section 6.2 (p.9–10): "To evaluate the small-domain PRP on a single input, Algorithm 5 only requires r/β AES invocations. For comparison, Algorithm 4 needs r AES invocations. Therefore, our improved variant achieves a 4× reduction in the number of AES invocations."

[^56]: Section 6.2 (p.10): "In Harmony-AES, the client can precompute the round keys of the small-domain PRP in Algorithm 5 in the offline phase and store them locally. This amounts to O(λ(log N − log ε)) client storage."

[^57]: Section 10 (p.14): Uses the modified Locate definition that supports finding cells containing even empty values. Both original and improved methods perform T Locate calls, but the improved variant yields shorter lookup chains because empty-value indices (N + m·T + i) have predictable starting positions in the relocation data structure.

---

<a id="portable-optimizations"></a>

### Portable Optimizations <a href="#toc">⤴</a>

- **Phase-group AES batching (Section 6.2):** Groups β = 4 rounds of the Hoang et al. card shuffle into a single AES call, reducing AES invocations by 4×. Applicable to any application of the Hoang et al. [24] small-domain PRP.
- **(N'/2, ε)-security observation (Lemma 6.1):** Both HarmonyPIR and WR PIR only reveal half the permutation to the server. This means a PRP that is only secure against seeing half its domain suffices, potentially enabling faster or simpler PRP constructions.
- **Round-key precomputation (Section 6.2):** Since HarmonyPIR uses a single PRP instance, the client can precompute and store all round keys during the offline phase, avoiding additional AES calls during online queries. This is not feasible for WR PIR (which uses T PRP instances).

---

<a id="implementation-notes"></a>

### Implementation Notes <a href="#toc">⤴</a>

- **Language / Library:** C++, 900 lines of code. Uses CryptoPP library for AES.&#8201;[^58]
- **Polynomial arithmetic:** N/A (PRF/XOR-based scheme)
- **SIMD / vectorization:** Not mentioned (CryptoPP likely uses AES-NI)
- **Parallelism:** Single-threaded (all benchmarks)
- **Open source:** The paper states "The implementation is available at HarmonyPIR" (Section 7.1) with a hyperlink, but the repository is not publicly accessible as of March 2026.&#8201;[^59]

[^58]: Section 7.1 (p.10): "We implement both variants of HarmonyPIR using C++ in 900 lines of code."

[^59]: Section 7.1 (p.10): "The implementation is available at HarmonyPIR." (Inline hyperlink in the PDF.) Baseline URLs: `https://github.com/renling/S3PIR` (RMS PIR), `https://github.com/PranavShriram/Balanced-PIR` (Balanced PIR, also used for WR PIR benchmarks).

---

<a id="deployment-considerations"></a>

### Deployment Considerations <a href="#toc">⤴</a>

- **Database updates:** Supported — server sends diff = DB[i] ⊕ DB'[i]; client performs one Locate + one XOR. Cost: O(1) per update.&#8201;[^60]
- **Sharding:** Not discussed.
- **Key rotation / query limits:** Client must re-execute offline phase after M/2 = N/T queries, using a fresh PRP key.&#8201;[^61]
- **Anonymous query support:** No — client stores personalized hints (DS' state), so client identity is implicitly linked to hint state.
- **Session model:** Persistent client (client maintains DS' and H across queries within an amortization window).
- **Cold start suitability:** No — requires streaming the entire database in the offline phase.
- **Minimum database size:** Harmony-FF1 requires N ≥ 500,000 entries (for FF1 domain ≥ 10^6). Harmony-AES has no minimum.&#8201;[^62]

[^60]: Section 5.1, "Handling Database Modifications" (p.7): One Locate and one XOR per database entry modification.

[^61]: Section 5.1 (p.7): "After M/2 queries, there will be no more empty cells left in DS', and the client cannot make queries anymore."

[^62]: Section 1.1 (p.1): "For strong security guarantees, Harmony-FF1 requires the database to contain at least half a million entries, per the NIST recommendation [15]." See also Section 5.2 (p.7).

---

<a id="key-tradeoffs-limitations"></a>

### Key Tradeoffs & Limitations <a href="#toc">⤴</a>

- **Offline communication equals database size:** All single-server stateful PIR schemes in this family stream the full DB during preprocessing. The paper notes this as "a common drawback of most schemes in the single-server stateful setting; schemes that circumvent this drawback [Plinko, OnionPIR] suffer from other inefficiencies."&#8201;[^63]
- **Harmony-FF1 security is empirical:** FF1 is NIST-standardized but relies on empirical security analysis, not a reduction to standard assumptions. Known practical attacks exist on FF1 for very small domains.&#8201;[^64]
- **Harmony-AES computation overhead:** The AES-based PRP is ~15× slower than FF1, making Harmony-AES only competitive with (not better than) RMS PIR in computation.
- **Client storage vs communication tradeoff:** The natural choice T ≈ √N yields M ≈ 2√N. Reducing T improves communication but increases client storage proportionally (tight tradeoff ST = O(Nw)).
- **No multi-threading optimization:** All benchmarks are single-threaded; the PRP evaluations during online phase and offline Locate calls are sequential.

[^63]: Section 7.3 (p.11): "All the schemes stream the entire database during the offline phase... This is a common drawback of most schemes in the single-server stateful setting." References [26] (Plinko) and [39] (OnionPIR).

[^64]: Section 5.2 (p.7): "While practical attacks exist on FF1 on very small domain sizes [7, 12, 13, 23, 25], the NIST FF1 recommendation [15][Appendix A.2] specifies that for a domain of size at least 10^6, the resources required for best known attacks on FF1 are prohibitive."

---

<a id="open-problems"></a>

### Open Problems <a href="#toc">⤴</a>

The paper does not explicitly list open problems. Implicit questions include:
- Can the single-permutation hint organization be extended to reduce offline communication below O(N)?
- Can FF1-like efficiency be achieved under standard (non-empirical) cryptographic assumptions?
- Can multi-threading or hardware acceleration (AES-NI) further close the gap between Harmony-AES and Harmony-FF1?

---

<a id="related-papers-in-collection"></a>

### Related Papers in Collection <a href="#toc">⤴</a>

| Paper | Group | Relationship |
|-------|-------|-------------|
| WangRen (2024) | 2b | Direct predecessor — HarmonyPIR builds on WangRen's relocation data structure and improves hint organization from T permutations to 1 |
| RMS24 / Ren et al. (2024) | 2b | Comparison baseline — partition-based hints with λ√N client storage |
| Piano (2023) | 2b | Earlier single-server sublinear PIR — uses PRF-based hints, not permutation-based |
| Balanced PIR (2025) | 2b | Concurrent work by same authors — different tradeoff point (efficient computation/storage, worse communication) |
| Plinko (2024) | 2b | Theoretical — achieves O̅(1) updates via invertible PRFs; mentioned in related work |
| SinglePass (2024) | 2b | Two-server — streaming single-pass preprocessing; HarmonyPIR also uses streaming offline phase |
| TreePIR (2023) | 2b | Two-server — introduced partition-based hints that RMS PIR adapted for single-server |
| ThorPIR (2024) | 2b | Achieves sublinear offline communication via homomorphic Thorp shuffles, but requires massive GPU resources&#8201;[^65] |
| CK20 (2020) | 2b | First sublinear-server single-server PIR — uses parallel PIR repetitions, costly in practice |

[^65]: Section 8.1 (p.12): "Fisch et al. [17] give a method that achieves sublinear offline communication, but requires substantial server computational power (hundreds of thousands of GPUs) to match the offline computation of other schemes."

---

<a id="uncertainties"></a>

### Uncertainties <a href="#toc">⤴</a>

- **Table headers vs text:** Table 2 header says "2^19 32-byte entries" but the text (Section 7.2) says "2^20, 2^24 and 2^28 entries." The total database size "16 MB" is consistent with 2^19 × 32 bytes = 16 MB. The intro (p.1) separately mentions "2^20 entries of 32 Bytes each" as a "32 MB" database, which is internally consistent. The evaluation text's "2^20, 2^24, 2^28" exponents appear erroneous (off-by-one); the tables are authoritative.&#8201;[^66]
- **Table 3 scheme label:** Table 3 labels the baseline as "RMS PIR [47]" (reference 47 is WangRen), but from context (storage levels, comparison text) it clearly should be "RMS PIR [42]" (reference 42 is Ren et al.). This is a typographic error in the PDF.&#8201;[^67]
- **Section 8.2 reference error:** The PDF references "the start-of-the-art scheme by Morris and Rogaway [28]" but reference [28] is Kiayias et al. 2015 (an unrelated PIR paper). The intended reference is likely [37] (Morris and Rogaway 2014).
- **GitHub URL:** The paper references "HarmonyPIR" as a hyperlink for the implementation but the repository is not publicly accessible as of March 2026 (returns 404). The Balanced PIR repo (github.com/PranavShriram/Balanced-PIR) also returns 404. Code may not yet be released.
- **Online communication split:** The PDF reports combined online communication in a single column. The request/response split is asymmetric (request = T·⌈log N⌉ bits << response = T·w bits) but exact per-direction values are not tabulated.
- **Balanced PIR reference:** Referenced as [3] throughout; described as a 2025 ePrint. The same first author (Arunachalaramanan) and advisor (Ren) — concurrent/companion work.

[^66]: Section 7.2 (p.10) vs Table 2 (p.11): The text says "2^20, 2^24 and 2^28" but tables show 2^19, 2^23, 2^27 with 32-byte entries. The 16 MB / 256 MB / 4 GB sizes match the table headers.

[^67]: Table 3 (p.11): The scheme label "RMS PIR [47]" should be "RMS PIR [42]" based on the comparison text in Section 7.3 (p.12) which correctly says "Comparison with RMS PIR [42]. (Table 3)."
