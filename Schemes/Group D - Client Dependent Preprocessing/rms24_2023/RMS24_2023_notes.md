## RMS24 -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Simple and Practical Amortized Sublinear Private Information Retrieval using Dummy Subsets](https://doi.org/10.1145/3658644.3690266) (2024) |
| **Archetype** | Construction |
| **PIR Category** | Group D -- Client-dependent preprocessing |
| **Security model** | Semi-honest two-server non-colluding (primary) / Semi-honest single-server (secondary variant) |
| **Additional assumptions** | OWF (PRF instantiated with AES-128) |
| **Correctness model** | Probabilistic with standard (non-degrading) guarantees -- failure probability bounded by a union bound over queries, does not grow per query[^1] |
| **Rounds (online)** | 1 (client sends two subsets, server returns two parities) |
| **Record-size regime** | Small (8-byte and 32-byte entries in benchmarks; 256-byte entries tested for scaling) |

<a id="fn-1"></a>
[^1]: Section 3.5 (p.8): Correctness failure happens when none of the M = λ * sqrt(N) main hints contains the queried index. By Lemma 1, each hint contains a given index with probability at least 1/(2*sqrt(N)), so the failure probability is at most (1 - 1/(2*sqrt(N)))^{λ*sqrt(N)} < e^{-λ/2}, which is astronomically small for large λ. This is a standard (non-degrading) guarantee: the same bound holds for every subsequent query because hint replenishment preserves the distribution.

---

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Corrigan-Gibbs-Kogan [Group D] (CK20, first amortized sublinear PIR); TreePIR [Group D] (partition-based hints); Corrigan-Gibbs et al. backup hints concept[^2] |
| **What changed** | Prior schemes either required parallel repetition (λ factor blowup on all costs) to achieve negligible correctness failure, or weakened the correctness model to non-adaptive queries (Piano). RMS24 introduces dummy subsets -- a second subset constructed from unrepresented partitions -- which eliminates the information leakage from the queried index's absence, removing the need for parallel repetition while maintaining standard PIR correctness.[^3] |
| **Superseded by** | N/A |
| **Concurrent work** | Piano PIR [Group D] (Zhou et al., concurrent with updated version achieving O(1) response via singleton entries, but with weaker correctness model requiring non-adaptive queries)[^4] |

<a id="fn-2"></a>
[^2]: Section 3.1 (p.4): "We will describe our techniques on top of the partition-based hints because they offer advantages in compact hint storage and fast membership testing." The partition-based hint structure comes from TreePIR [22]. Backup hints for single-server replenishment originate from Corrigan-Gibbs et al. [9].

<a id="fn-3"></a>
[^3]: Section 1 (p.2): "Our main idea to address this leakage is for the client to additionally send a dummy subset of indices. The dummy subset contains one random index from each of the sqrt(N)/2 partitions that do not appear in the query subset."

<a id="fn-4"></a>
[^4]: Section 5 (p.13): Piano PIR weakens the correctness guarantee and requires non-adversarial query sequences; publishing the permutation key enables an adversary to force queries into the same partition and cause correctness failure (paraphrase of discussion on p.13).

---

### Core Idea

RMS24 presents a stateful PIR scheme that achieves amortized sublinear communication and computation for both two-server and single-server settings, while maintaining *standard* PIR correctness (correctness for arbitrary, adaptively chosen query sequences).[^5] The database of N entries is divided into sqrt(N) partitions. Each client hint selects sqrt(N)/2 + 1 random partitions and picks one random index from each, storing the XOR parity. The key innovation is the **dummy subset**: when querying, the client constructs a real subset (the hint's subset minus the queried index) and a dummy subset (one random index from each unrepresented partition), then sends both in random order to the server.[^6] This eliminates the information leakage that prior schemes suffered -- where the server could learn which partition the queried index belongs to -- without requiring parallel repetition. The result is O(1) online response overhead (2x the insecure baseline for two servers, 4x for one server) with O(sqrt(N)) client storage and computation.[^7]

<a id="fn-5"></a>
[^5]: Section 2 (p.3): The standard stateful PIR definition requires correctness for any adaptively chosen query sequence and privacy against a server that chooses both candidate query sequences.

<a id="fn-6"></a>
[^6]: Section 3.1 (p.4): "The dummy subset contains one random index from each of the sqrt(N)/2 partitions that do not appear in the query subset. The client also randomly swaps the two subsets."

<a id="fn-7"></a>
[^7]: Table 1 (p.2): Two-server: O(sqrt(N)) request, O(1) response, O(λ*sqrt(N)) client storage, O(sqrt(N)) client computation, O(sqrt(N)) server computation. Single-server: O(sqrt(N)) request, O(sqrt(N)/λ) response amortized, O(λ*sqrt(N)) client storage.

---

### Variants

| Variant | Key Difference | Servers | Online Response | Hint Replenishment | Amortization Window |
|---------|---------------|---------|----------------|--------------------|---------------------|
| Two-server | Offline server generates hints; online server answers queries + helps replenish | 2 (non-colluding) | O(1) -- constant, 4x element size | On-the-fly via offline server (Alg. 3) | Unlimited (constant amortized)[^8] |
| Single-server | Client streams entire DB offline; uses backup hints for replenishment | 1 | O(sqrt(N)/λ) amortized | Via pre-computed backup hint pairs (Alg. 5) | 0.4 * λ * sqrt(N) queries per offline phase[^9] |

<a id="fn-8"></a>
[^8]: Section 3.6 (p.9): "The amortized cost of our two-server scheme only depends on the online phase and the hint replenishment step." The offline phase runs once. Each query costs O(1) response and O(sqrt(N)) server computation.

<a id="fn-9"></a>
[^9]: Section 3.4 (p.7): The client retrieves λ*sqrt(N) main hints and λ*sqrt(N) backup hints. Backup hints come in pairs; with pairs, the client can make up to λ*sqrt(N)/2 queries before needing to re-run the offline phase. The 0.4*λ*sqrt(N) figure used in Table 1 is a conservative estimate for the simpler non-paired strategy.

---

### Novel Primitives / Abstractions

#### 1. Dummy Subsets

| Field | Detail |
|-------|--------|
| **Name** | Dummy subset |
| **Type** | Privacy technique / Set distribution |
| **Interface** | Given a real query subset S covering sqrt(N)/2 + 1 partitions (with queried index removed), construct S' from one random index per uncovered partition. Send (S, S') or (S', S) with equal probability. |
| **Security definition** | Indistinguishability of the bit vector b and offset vector r from random (Lemma 2)[^10] |
| **Purpose** | Eliminate the information leakage from the queried index's absence in the query subset, allowing the scheme to achieve standard PIR privacy without parallel repetition |
| **Built from** | PRF evaluations for the offset vectors; random sampling for dummy indices |

<a id="fn-10"></a>
[^10]: Section 3.5 (p.8): Lemma 2 proves Pr(b | i) = Pr(b | i') for any two query indices i and i', where b is the bit vector encoding which partitions go to which subset. The proof shows each event has probability tau/2 where tau = C(sqrt(N)-1, sqrt(N)/2)^{-1}, independent of the queried index.

#### 2. Partition-Based Hints with Median Cutoff Selection

| Field | Detail |
|-------|--------|
| **Name** | Partition-based hint with PRF-derived median cutoff |
| **Type** | Data structure |
| **Interface** | For hint j: compute V_j = [v_{j,0}, ..., v_{j,sqrt(N)-1}] where v_{j,k} = PRF("select" || j || k). Find median v-hat_j. Select partitions where v_{j,k} < v-hat_j. Pick one index per selected partition via r_{j,k} = PRF("offset" || j || k). Store (j, v-hat_j, e_j, P_j).[^11] |
| **Purpose** | Enable O(1)-time membership testing (check if partition k is selected by hint j) and compact hint storage (only store cutoff, extra index, and parity) |
| **Built from** | PRF with domain separation ("select" and "offset" prefixes) |
| **Standalone complexity** | O(1) per membership test; O(sqrt(N)) to reconstruct full subset |

<a id="fn-11"></a>
[^11]: Section 3.2 (p.5): The median cutoff divides V_j into two equal-sized halves. Only the cutoff value v-hat_j needs to be stored, not the full set of selected partitions, because membership can be recomputed from the PRF. The "offset" PRF determines which specific index is chosen from each selected partition.

---

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (one-way functions) -- minimal assumption; PRF exists if OWF exists[^12] |
| **PRF instantiation** | AES-128 via CryptoPP's AES-NI implementation[^13] |
| **Key structure** | Per-client PRF key shared between client and offline server (two-server) or held by client alone (single-server). The PRF key derives all hint structures deterministically. |
| **Correctness condition** | Pr[fail] <= e^{-λ/2} per query, by union bound over queries (Lemma 1 + Section 3.5)[^14] |

<a id="fn-12"></a>
[^12]: Section 2 (p.3-4): "PRF is one of the most common cryptographic primitives and can be instantiated from any one-way function" (quote continues with mentions of AES and SHA as practical instantiations).

<a id="fn-13"></a>
[^13]: Section 4.1 (p.9): "We use AES as the pseudorandom function. We use CryptoPP's implementation of AES, which leverages Intel's AES-NI instructions."

<a id="fn-14"></a>
[^14]: Section 3.5 (p.8): Lemma 1 proves each hint contains any particular index with probability at least 1/(2*sqrt(N)). With M = λ*sqrt(N) hints, the probability that none contains the queried index is at most (1 - 1/(2*sqrt(N)))^{λ*sqrt(N)} < e^{-λ/2}.

---

### Key Data Structures

- **Database layout:** N entries divided into sqrt(N) equal-size partitions, each of size sqrt(N). Entry i belongs to partition floor(i / sqrt(N)).[^15]
- **Main hint (j, v-hat_j, e_j, P_j):** Hint ID j, median cutoff v-hat_j (32-bit), extra index e_j (32-bit), parity P_j (w-bit XOR of all selected entries). Each hint covers sqrt(N)/2 + 1 partitions with one index per partition.[^16]
- **Backup hint pair (two-server):** Not needed -- replenishment is on-the-fly via offline server.
- **Backup hint pair (single-server):** Pair of hints (P_j, P'_j) sharing the same cutoff v-hat_j, covering complementary halves of the partition space. Stored alongside main hints during streaming offline phase.[^17]
- **Client storage:** λ*sqrt(N) main hints (two-server) or λ*sqrt(N) main + λ*sqrt(N)/2 backup pairs (single-server). Per hint: w + 64 bits (32-bit cutoff + 32-bit extra index + w-bit parity + 1 comparison bit).[^18]

<a id="fn-15"></a>
[^15]: Section 3.1 (p.4): "A database of size N is divided into sqrt(N) partitions each of size sqrt(N)."

<a id="fn-16"></a>
[^16]: Section 3.2 (p.5): "Hint storage. Each hint is stored as a tuple (j, v-hat_j, e_j, P_j) where j is a unique hint ID, v-hat_j is the cutoff median value, e_j is the extra index, and P_j is the parity."

<a id="fn-17"></a>
[^17]: Section 3.4 (p.7): "A more clever strategy is to have backup hints in pairs, similar in spirit to the two-server hint replenishment algorithm." Each backup hint pair stores parities for both halves.

<a id="fn-18"></a>
[^18]: Section 4.1 (p.9): "We use 32-bit numbers for elements in V_j to save client storage and computation." Hint IDs use 32-bit integers in single-server (reset periodically) and 64-bit in two-server.

---

### Protocol Phases

#### Two-Server Scheme

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Offline (Alg. 1) | Offline server | Generate M = λ*sqrt(N) hints using shared PRF key: compute cutoffs, select partitions, compute parities | O(λ*sqrt(N)) words down to client[^19] | Once at setup |
| Online Query (Alg. 2) | Client | Find hint j containing index i; construct real subset S (remove i) and dummy subset S'; permute and send to online server | (sqrt(N)/2 + 1) * log(N) bits up (compact encoding via bit vector b and offset vector r)[^20] | Per query |
| Online Answer | Online + Offline servers | Each server computes XOR parity of its received subset | 2 * w bits down (two parities P, P') | Per query |
| Decode | Client | Discard dummy parity; recover DB[i] = P XOR P_j (stored parity of hint j) | -- | Per query |
| Replenish (Alg. 3) | Offline server + Client | Offline server constructs new hint with next ID J, sends (J, v-hat_J, P_J, P'_J); client picks correct half, adds i as extra index | O(1) words | Per query (piggybacked) |

<a id="fn-19"></a>
[^19]: Section 3.6 (p.9): "The offline phase costs O(λ*sqrt(N)) communication and O(λ*N) computation at the offline server."

<a id="fn-20"></a>
[^20]: Section 3.2 (p.5-6): The compact encoding using b and r costs (sqrt(N)/2 + 1) * log(N) bits, reducing the request size compared to sending explicit subsets at sqrt(N) * log(N) bits.

#### Single-Server Scheme

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Streaming Offline (Alg. 4) | Client | Stream DB partition by partition; build 1.5M hints (M main + 0.5M backup pairs) using PRF key | N words down (full DB stream)[^21] | Every 0.4*λ*sqrt(N) queries |
| Online Query (Alg. 2) | Client | Same as two-server: find hint, construct real + dummy subsets, permute and send | (sqrt(N)/2 + 1) * log(N) bits up | Per query |
| Online Answer | Server | Compute XOR parities of both received subsets | 2 * w bits down | Per query |
| Decode | Client | Discard dummy parity; recover DB[i] | -- | Per query |
| Replenish (Alg. 5) | Client | Find unused backup hint pair that skips the queried partition; promote to main hint with i as extra index | -- (local) | Per query |

<a id="fn-21"></a>
[^21]: Section 3.6 (p.9): "The streaming offline phase costs N communication and O(λ*N) computation, and needs to be run every 0.5*λ*sqrt(N) online queries." The single-server response overhead is O(sqrt(N)/λ) amortized because the O(N) offline communication is amortized over 0.5*λ*sqrt(N) queries.

---

### Two-Server Protocol Details

| Aspect | Offline Server | Online Server |
|--------|----------------|---------------|
| **Data held** | Full DB copy + shared PRF key | Full DB copy |
| **Role in offline** | Generates all hints; sends (j, v-hat_j, e_j, P_j) per hint to client | None |
| **Query received** | Replenishment request (after each online query) | Two subsets (S, S') or (S', S) in random order |
| **Computation (online)** | O(sqrt(N)) per replenishment -- construct one new hint | O(sqrt(N)) per query -- compute XOR parity of each subset |
| **Security guarantee** | Computational (OWF/PRF) -- learns nothing about query sequence | Computational (OWF/PRF) -- cannot distinguish real from dummy subset[^22] |
| **Non-collusion assumption** | Required -- if servers collude, the offline server's PRF key reveals all hint structures, and the online server's subsets reveal the query |

<a id="fn-22"></a>
[^22]: Section 3.5 (p.8): Privacy is proven by showing that the bit vector b (encoding the partition assignment) has probability Pr(b | i) = tau/2 for any query index i (Lemma 2), so observing b gives the server no advantage in distinguishing between any two candidate queries.

---

### Correctness Analysis (Option B: Probabilistic)

| Field | Detail |
|-------|--------|
| **Failure mode** | No main hint contains the queried index i |
| **Failure probability** | Pr[fail] <= (1 - 1/(2*sqrt(N)))^{λ*sqrt(N)} < e^{-λ/2}[^23] |
| **Probability grows over queries?** | No -- per-query independent. Hint replenishment preserves the distributional invariant (H' is identically distributed to H).[^24] |
| **Probability grows over DB mutations?** | N/A -- DB updates not addressed |
| **Key parameters affecting correctness** | Number of hints M = λ*sqrt(N); coverage probability q = (sqrt(N)/2 + 1)/sqrt(N) * 1/sqrt(N) per hint per index |
| **Proof technique** | Lemma 1 gives per-hint coverage probability >= 1/(2*sqrt(N)); then apply (1-p)^M bound with M = λ*sqrt(N). For subsequent queries, a distributional invariance argument shows replenished hints follow distribution R (identical to original).[^25] |
| **Amplification** | Not needed -- failure is already negligible for λ = 80 (e^{-40}) |
| **Adaptive vs non-adaptive** | Correctness holds for fully adaptive queries -- this is the key distinction from Piano PIR[^26] |
| **Query model restrictions** | Two-server: unlimited queries. Single-server: bounded by backup hint supply (~0.4*λ*sqrt(N) queries per offline phase). |

<a id="fn-23"></a>
[^23]: Section 3.5 (p.8): Lemma 1 and the paragraph following it.

<a id="fn-24"></a>
[^24]: Section 3.5 (p.9): "Thus, every hint j in H' follows the same distribution as the hint j in H. This shows that the main hints after a query are identically distributed as they were before the query." The proof uses a matrix representation H where each row is a hint and shows the distribution R_i (conditioned on containing i) and R_{-i} (conditioned on not containing i) are preserved.

<a id="fn-25"></a>
[^25]: Section 3.5 (p.8-9): The full distributional argument constructs random variable J (the consumed hint index) with geometric-like distribution Pr(J = j) = (1-q)^j * q, then shows that for any hint j in H', its distribution is a mixture of R (sampled from R with probability 1-(1-q)^j) and R_{-i} (with the remaining probability), which equals R.

<a id="fn-26"></a>
[^26]: Section 2 (p.3): "Piano PIR [34], however, does not satisfy the above definition (even for statically constructed queries) because it requires the client query sequence to have no adversarial influence."

---

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (2^28 entries x 32 bytes = 8 GB) | Phase |
|--------|-----------|-------------------------------------------|-------|
| Query size (request) | O(sqrt(N) * log N) bits | 34 KB (two-server); 34 KB (single-server) | Online |
| Response size | O(w) -- constant (two-server); O(w) per query (single-server) | 64 bytes (two parities, w=32) | Online |
| Server computation | O(sqrt(N)) | 2.7 ms (two-server); 2.7 ms online (single-server)[^27] | Online |
| Client computation | O(sqrt(N)) | < 1 ms (finding hint + subset construction) | Online |
| Response overhead | 2x insecure baseline (two-server); 4x (single-server)[^28] | 2x (two-server); 4x (single-server) | -- |

<a id="fn-27"></a>
[^27]: Table 2 (p.11): At 2^28 x 32-byte entries (8 GB), the two-server scheme achieves 60.16 MB offline communication and 842 s offline computation, with 34.1 KB online communication and 2.7 ms online computation.

<a id="fn-28"></a>
[^28]: Section 3.6 (p.9): "The online response overhead is O(1), or 4x to be precise, since both the online server and the offline server both send back two parities." For two-server, only 2 parities are needed from the online server (the other 2 come from replenishment). The "2x" figure is from the abstract: "the online response overhead is only twice that of simply fetching the desired entry without privacy."

#### Preprocessing metrics

| Metric | Two-Server Asymptotic | Two-Server Concrete (8 GB) | Single-Server Asymptotic | Single-Server Concrete (8 GB) |
|--------|----------------------|---------------------------|-------------------------|------------------------------|
| Offline communication | O(λ*sqrt(N)) words | 60.16 MB | O(N) words (full DB stream) | 8192 MB[^29] |
| Offline computation | O(λ*N) | 842 s | O(λ*N) | 1146 s |
| Client storage | O(λ*sqrt(N)) words | 60.16 MB | O(λ*sqrt(N)) words | 100 MB[^30] |
| Amortized response overhead | O(1) | 2x | O(sqrt(N)/λ) | varies |
| Amortization window | Unlimited (constant) | -- | ~0.4*λ*sqrt(N) queries | ~0.4 * 80 * 2^14 ~ 524K queries |

<a id="fn-29"></a>
[^29]: Table 3 (p.11): At 2^28 x 32-byte entries, the single-server scheme requires 8192 MB offline communication (full DB stream) and 1146 s offline computation. Client storage is 100 MB.

<a id="fn-30"></a>
[^30]: Table 3 (p.11): Client storage for single-server at 8 GB is 100 MB (1.5x the two-server's 60 MB because of backup hint pairs). At 2^28 x 256-byte entries (64 GB), client storage is 660 MB.

#### Preprocessing Characterization

| Aspect | Two-Server | Single-Server |
|--------|-----------|---------------|
| **Preprocessing model** | Server-side computation (offline server generates hints) | Streaming (single-pass over DB)[^31] |
| **Client peak memory** | O(λ*sqrt(N)) | O(λ*sqrt(N)) |
| **Number of DB passes** | 1 (offline server) | 1 (streaming) |
| **Hint refresh mechanism** | Pipelining -- offline server replenishes on-the-fly after each query | Full re-download after ~0.4*λ*sqrt(N) queries |

<a id="fn-31"></a>
[^31]: Section 3.4 (p.7-8): Algorithm 4 streams the database one partition at a time. For each partition k, it downloads DB[k*sqrt(N) : (k+1)*sqrt(N) - 1] and processes all 1.5M hints to update their parities. This requires only O(λ*sqrt(N)) client memory.

---

### Performance Benchmarks

#### Hardware

AWS m5.8xlarge: 3.1 GHz Intel Xeon, 128 GB RAM, Ubuntu 22.04, GCC 11.3, Go 1.18. All experiments single-threaded.[^32]

<a id="fn-32"></a>
[^32]: Section 4.2 (p.10): "We run all experiments on an AWS m5.8xlarge instance equipped with a 3.1 GHz Intel Xeon processor and 128 GB RAM."

#### Two-Server Benchmarks (Table 2)

| Database | Client Storage (MB) | Offline Comm. (MB) | Offline Compute (s) | Online Comm. (KB) | Online Compute (ms) |
|----------|--------------------|--------------------|---------------------|-------------------|---------------------|
| 2^20 x 32B (32 MB) | 3.76 | 3.76 | 2.3 | 2.26 | 0.12 |
| 2^24 x 32B (512 MB) | 15.04 | 15.04 | 41 | 8.64 | 0.54 |
| 2^28 x 8B (2 GB) | 30.16 | 30.16 | 636 | 34.0 | 2.19 |
| 2^28 x 32B (8 GB) | 60.16 | 60.16 | 842 | 34.1 | 2.7 |
| 2^28 x 256B (64 GB) | 340.16 | 340.16 | 2242 | 35.0 | 5.23 |

#### Single-Server Benchmarks (Table 3)

| Database | Client Storage (MB) | Offline Comm. (MB) | Offline Compute (s) | Online Comm. (KB) | Online Compute (ms) | Amortized Comm. (KB) | Amortized Compute (ms) |
|----------|--------------------|--------------------|---------------------|-------------------|---------------------|---------------------|----------------------|
| 2^20 x 32B (32 MB) | 6.25 | 32 | 4 | 2.18 | 0.14 | 2.99 | 0.25 |
| 2^24 x 32B (512 MB) | 25 | 512 | 65 | 8.56 | 0.62 | 11.76 | 1.0 |
| 2^28 x 8B (2 GB) | 40 | 2048 | 989 | 34.02 | 2.4 | 37.22 | 3.9 |
| 2^28 x 32B (8 GB) | 100 | 8192 | 1146 | 34.06 | 2.7 | 46.86 | 4.5 |
| 2^28 x 256B (64 GB) | 660 | 65536 | 2327 | 34.5 | 4.2 | 136.9 | 7.8 |

---

### Comparison with Prior Work

#### Two-Server (at 2^28 x 32B = 8 GB)

| Metric | RMS24 | DPF-PIR | Checklist | TreePIR |
|--------|-------|---------|-----------|---------|
| Client storage (MB) | 60.16 | -- | 1119.74 | 46.14 |
| Offline comm. (MB) | 60.16 | -- | 46.14 | 46.14 |
| Offline compute (s) | 842 | -- | 1141 | 430 |
| Online comm. (KB) | 34.1 | 1.31 | 0.64 | 1049.6 |
| Online compute (ms) | 2.7 | 745 | 1.8 | 14 |
| DB params | 2^28 x 32B | 2^28 x 32B | 2^28 x 32B | 2^28 x 32B |

#### Single-Server (at 2^28 x 32B = 8 GB)

| Metric | RMS24 | Spiral | SimplePIR | Piano |
|--------|-------|--------|-----------|-------|
| Client storage (MB) | 100 | -- | 352.98 | 144.75 |
| Amortized comm. (KB) | 46.86 | 35.0 | 688 | 90.41 |
| Amortized compute (ms) | 4.5 | 30273 | 1123 | 9.6 |
| Correctness model | Standard | Deterministic | Deterministic | Non-adaptive only |
| DB params | 2^28 x 32B | 2^28 x 32B | 2^28 x 32B | 2^28 x 32B |

**Key takeaway:** RMS24 should be preferred when standard PIR correctness is required (adaptive query sequences) and sublinear server computation is needed. In the two-server setting, it achieves the best balance of low communication, low computation, and manageable client storage -- avoiding the 1 GB+ client storage of Checklist and the 1 MB+ online communication of TreePIR.[^33] In the single-server setting, it is 9-14x better in communication and hundreds of times faster in computation than SimplePIR, while providing stronger correctness guarantees than Piano.[^34]

<a id="fn-33"></a>
[^33]: Section 4.3 (p.10): "Our scheme achieves a balance of low client storage, low communication, and low computation for all database parameters, by avoiding major bottlenecks in previous schemes such as linear client storage, linear server computation, or high communication."

<a id="fn-34"></a>
[^34]: Section 4.3 (p.11): "Compared with the latest version of Piano PIR, which is concurrent with our work, our communication is about 2x better, and our amortized computation is 1.7 -- 3.7x better. Moreover, we achieve these improvements while providing a stronger correctness guarantee."

---

### Portable Optimizations

- **Dummy subset technique:** Applicable to any partition-based hint PIR scheme to eliminate leakage from the queried index's partition membership. Removes the need for parallel repetition (λ-factor blowup on all costs). Could be applied to TreePIR's hint system.[^35]
- **PRF-based median cutoff for partition selection:** Using the median of PRF outputs to select exactly half the partitions allows O(1) membership testing per hint without storing the full partition set. Generalizable to any scheme needing pseudorandom subset selection with compact representation.
- **Compact two-subset encoding:** Encoding two subsets as a bit vector b (partition assignment) plus offset vector r (index within partition) halves the request size compared to sending explicit index lists.[^36]
- **Introselect-based fast median:** Filtering 7/8 of PRF outputs via heuristic bounds before running introselect for the median. Reduces the median-finding bottleneck in the offline phase.[^37]

<a id="fn-35"></a>
[^35]: Section 3.1 (p.4): "Our techniques can be applied to the original sublinear scheme of Corrigan-Gibbs and Kogan [10] or the partition-based hints of TreePIR [22]."

<a id="fn-36"></a>
[^36]: Section 3.2 (p.6): The compact encoding costs (sqrt(N)/2 + 1) * log(N) bits vs. sqrt(N) * log(N) bits for sending explicit subsets directly.

<a id="fn-37"></a>
[^37]: Section 4.1 (p.10): "We can filter out elements that are too large or too small... In expectation, this filters 7/8 of the elements." The probability of filtering a median element is 6 x 10^{-5} for N = 2^20.

---

### Implementation Notes

- **Language:** C++ (RMS24 scheme); baselines in C++ (DPF-PIR, Spiral) and Go (Checklist, TreePIR, SimplePIR, Piano)[^38]
- **PRF:** AES-128 via CryptoPP with AES-NI. A single 128-bit AES output is broken into four to eight 32-bit pseudorandom numbers, shared across different hint/partition combinations to save computation.[^39]
- **Polynomial arithmetic:** N/A (PRF-based, no polynomial operations)
- **SIMD / vectorization:** AES-NI (via CryptoPP)
- **Parallelism:** Single-threaded in all benchmarks
- **Lines of Code:** ~600 lines (two-server); ~500 lines (single-server)[^40]
- **Open source:** https://github.com/renling/S3PIR/
- **Security parameter:** λ = 80[^41]
- **V_j element size:** 32-bit fixed-point numbers for PRF-derived partition selection values[^42]

<a id="fn-38"></a>
[^38]: Section 4.1 (p.9): "We implemented our scheme in C++. The implementation is available at https://github.com/renling/S3PIR/."

<a id="fn-39"></a>
[^39]: Section 4.1 (p.9-10): "We break up a single 128-bit AES output into four to eight pseudorandom numbers (i.e., v_{j,k} and r_{j,k} in the algorithms) across different hints or partitions to save computation."

<a id="fn-40"></a>
[^40]: Section 4.1 (p.9): "the two-server version of our implementation comprises about 600 lines of code and the single-server version comprises about 500 lines of code."

<a id="fn-41"></a>
[^41]: Section 4.1 (p.9): "We set the parameter λ to 80."

<a id="fn-42"></a>
[^42]: Section 4.1 (p.9-10): "We use 32-bit numbers for elements in V_j to save client storage and computation." The paper notes a corner case where two or more elements equal the median; such hints are discarded with very small probability.

---

### Application Scenarios

- **Private DNS lookup:** Mentioned as a motivating application where adversarial query influence is realistic (Kaminsky attack), making Piano's non-adaptive correctness model insufficient.[^43]
- **Private password checking:** Mentioned as a general PIR application.[^44]

<a id="fn-43"></a>
[^43]: Section 2 (p.3): "Consider DNS lookup, which is a primary application that Piano PIR targets. The threat model of DNS typically assumes that the client may visit a malicious webpage that can trigger DNS queries of the adversary's choosing, e.g., as in the Kaminsky attack."

<a id="fn-44"></a>
[^44]: Section 1 (p.1): "An efficient PIR scheme enables many privacy-preserving applications, such as password check [1]."

---

### Deployment Considerations

- **Database updates:** Not addressed. Hints become stale if the database changes; full re-preprocessing is required.[^45]
- **Two-server trust model:** Requires two non-colluding servers. The offline server holds the PRF key and must not collude with the online server.
- **Session model:** Persistent client -- client maintains hint state across queries.
- **Cold start suitability:** No -- requires offline preprocessing (two-server: server-side hint generation; single-server: full DB streaming).
- **Amortization crossover (single-server):** Offline cost dominates for the first query. At 8 GB (2^28 x 32B), the offline phase costs 8192 MB communication and 1146 s computation. Amortized per-query cost (46.86 KB, 4.5 ms) is reached after sufficient queries.
- **Scalability concern:** Client storage is O(λ*sqrt(N)), which reaches 660 MB at 64 GB database size (single-server). The paper acknowledges this as a limitation.[^46]

<a id="fn-45"></a>
[^45]: Section 6 (p.14): "Other general challenges involving stateful PIR include how to handle updates to the database."

<a id="fn-46"></a>
[^46]: Section 6 (p.14): "A limitation shared by all existing amortized sublinear schemes is that the O(λ*sqrt(N)) client storage, while sublinear, is still quite large in practice. An indirect consequence is that the single-server offline phase cannot do much better than streaming the whole database when the client needs so many hints."

---

### Key Tradeoffs & Limitations

- **Client storage:** O(λ*sqrt(N)) is sublinear but still large in practice -- 60 MB at 8 GB, 660 MB at 64 GB. Shared limitation with all amortized sublinear PIR schemes.
- **Request size:** O(sqrt(N) * log N) bits is the dominant cost for small databases. At 2^28 entries, this is ~34 KB. The paper notes this as an open problem -- techniques exist to reduce it but sacrifice other aspects.[^47]
- **Single-server offline cost:** Streaming the entire database is required for the single-server variant, which is prohibitive for very large databases and delays the first query.
- **No database update support:** Hints become invalid when the database changes, requiring full re-preprocessing.
- **Two-server non-collusion requirement:** The two-server variant requires a strong trust model (non-colluding servers), which may not be available in all deployment scenarios.

<a id="fn-47"></a>
[^47]: Section 6 (p.14): "An obvious one is the Omega(sqrt(N)) request size. There exist techniques to reduce the request size, but the challenge is to do so without sacrificing other aspects of the algorithm."

---

### Open Problems

- **Reducing request size:** Can the O(sqrt(N)) request size be reduced without sacrificing other efficiency metrics?[^48]
- **Reducing client storage:** The O(λ*sqrt(N)) client storage is a limitation shared by all amortized sublinear PIR schemes.
- **Database updates:** How to handle updates to the database without full re-preprocessing.
- **Keyword PIR:** Supporting queries by keywords rather than indices in the stateful PIR setting.[^49]

<a id="fn-48"></a>
[^48]: Section 6 (p.14).

<a id="fn-49"></a>
[^49]: Section 6 (p.14): "Other general challenges involving stateful PIR include how to handle updates to the database and how to support queries by keywords, and recent works have made some progress in these directions [19, 24]."

---

### Related Papers in Collection

| Paper | Group | Relationship |
|-------|-------|-------------|
| CK20 | Group D | First amortized sublinear PIR; RMS24 builds on the CK20 framework but eliminates the λ parallel repetition factor and the O(N) client storage / O(N) per-query computation bottleneck |
| TreePIR | Group D | Introduced partition-based hints adopted by RMS24; RMS24 eliminates TreePIR's O(sqrt(N)) response overhead |
| Piano | Group D | Concurrent single-server scheme with similar asymptotic efficiency but weaker correctness model (non-adaptive queries only); RMS24 achieves 2x better communication and 1.7-3.7x better computation |
| Checklist | Group D | Two-server scheme with O(N) client storage or O(N) per-query computation; RMS24 achieves sublinear on both |
| SimplePIR | Group C | Single-server baseline with linear server computation; RMS24 is hundreds of times faster in computation at 8 GB |
| Spiral | Group A | Single-server single-query PIR baseline; RMS24 has higher communication but orders of magnitude lower computation |

---

### Uncertainties

- **Median corner case:** When two or more elements of V_j equal the median, the hint is discarded. The paper states this happens with probability ~6 x 10^{-5} for N = 2^20 and decreases with database size. The pseudocode omits this handling for readability.
- **Exact amortization window (single-server):** The paper states "close to, but fewer than, 0.5*λ*sqrt(N)" queries. The "0.4*λ*sqrt(N)" figure used in Table 1 caption is described as conservative ("say 0.4*λ*sqrt(N)").
- **Go vs C++ comparison fairness:** RMS24 is implemented in C++ while several baselines (Checklist, TreePIR, SimplePIR, Piano) are in Go. The paper does not normalize for language overhead, though the performance gaps are large enough (orders of magnitude) that this is unlikely to change conclusions.
