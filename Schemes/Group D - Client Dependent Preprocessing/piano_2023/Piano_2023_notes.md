## Piano — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Piano: Extremely Simple, Single-Server PIR with Sublinear Server Computation](https://eprint.iacr.org/2022/452) (2023, IEEE S&P 2024) |
| **Archetype** | Construction |
| **PIR Category** | Group D — Client-Dependent Preprocessing |
| **Security model** | Semi-honest single-server, client-specific preprocessing (subscription model) |
| **Additional assumptions** | None beyond OWF (PRF instantiated via AES; PRP for load balancing) |
| **Correctness model** | Probabilistic (failure prob bounded by negl(kappa) + negl(λ) over all Q queries in a window) |
| **Rounds (online)** | 2 (client sends set S', server returns parity) |
| **Record-size regime** | Small (1-bit natively; multi-bit via direct extension per footnote 4) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | CK20 [Group D] (first sublinear-server single-server PIR in the client-preprocessing model); CHK22 (lower bound ST = Omega(n) for adaptive PIR without server preprocessing); BIM00 (linear server computation lower bound without preprocessing) |
| **What changed** | CK20 required puncturable PRFs and only supported a single query per offline phase. Piano replaces puncturable PRFs with plain PRFs (from OWF), supports unbounded queries via pipelining, and achieves the first practical sublinear-server single-server PIR implementation. |
| **Superseded by** | Plinko [Group D] (2024, invertible PRFs, worst-case O(1) updates); RMS24 [Group D] (2024, dummy subsets, standard correctness model) |
| **Concurrent work** | N/A |

[^1]: Abstract (p.1): Piano achieves amortized O~(sqrt(n)) server and client computation and O(sqrt(n)) online communication per query, requiring O~_λ(sqrt(n)) client storage.
[^2]: Section 1.1 (p.3): "the only cryptographic primitive we need is pseudorandom functions (PRFs), which can be accelerated through the AES-NI instruction sets."

### Core Idea

Piano achieves sublinear server computation for single-server PIR by having each client precompute a table of "hints" during a streaming pass over the database.&#8201;[^3] Each hint is the XOR-parity of a pseudorandom set of sqrt(n) database entries (one from each "chunk" of sqrt(n) consecutive entries). To query index x, the client finds a hint whose pseudorandom set contains x, replaces x with a fresh replacement index from the same chunk, and sends the modified set to the server. The server computes the XOR-parity of the modified set in O(sqrt(n)) time and returns it. The client recovers DB[x] by XOR-ing the server's answer with the stored parity and the replacement entry's value.&#8201;[^4] A PRP applied to the database permutes indices so that arbitrary (non-random) queries are handled, and a pipelining technique amortizes the offline phase to support unbounded queries.&#8201;[^5]

[^3]: Section 2 (p.3): "Suppose the database DB[0...n-1] contains n bits. We divide the indices {0,1,...,n-1} into sqrt(n) chunks each of size sqrt(n)."
[^4]: Section 2, "Making a single query" (p.4): Client finds (S,p) with x in S, replaces x's chunk entry with replacement r, sends S' to server, server returns XOR parity q, client computes DB[x] = q XOR p_i XOR DB[r].
[^5]: Section 2, "Supporting unbounded, arbitrary queries" (p.5): PRP for load balancing and pipelining trick for unbounded queries.

### Variants

| Variant | Key Difference | Online Comm (download) | Client Storage | Best For |
|---------|---------------|----------------------|----------------|----------|
| **Main scheme** (Section 2 / Figure 1) | Client sends full set S'; server returns O(1) parity | O(1) download, O(sqrt(n)) upload | O~_λ(sqrt(n) log kappa alpha(kappa)) | Lower communication |
| **Offset-vector variant** (Appendix A) | Client sends offset vector Delta_{-x} instead of full set; server returns sqrt(n) parities | O(sqrt(n)) download, O(sqrt(n)) upload | Slightly less (no replacement index-value pairs) | Less client storage |

[^6]: Appendix A (p.20): "This variant has less storage but comes with more online communication." The offset vector encodes the set S without revealing which index was removed, and the server returns sqrt(n) guessed parities.
[^7]: Appendix A (p.21): "In short, the two schemes have the same asymptotic behaviors and they provide a tradeoff between the local storage and the online communication (up to a constant factor)."

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Pseudorandom sets with chunk structure |
| **Type** | Set distribution |
| **Interface / Operations** | Set(sk) := {j * sqrt(n) + PRF_sk(j)}_{j in {0,...,sqrt(n)-1}}; Set(sk, x) replaces the chunk(x) entry with x |
| **Security definition** | Set S' sent to server is distributed identically to a fresh random set (Theorem 3.2, Lemma C.2) |
| **Correctness definition** | Each set contains exactly one index per chunk; index x is in Set(sk) with probability 1/sqrt(n) |
| **Purpose** | Generate pseudorandom subsets of DB that contain exactly one entry per chunk, enabling O(sqrt(n)) server computation and hiding which index was queried |
| **Built from** | PRF (AES-128 in practice) |
| **Standalone complexity** | Set generation: O(sqrt(n)) PRF evaluations; membership test: O(1) |
| **Relationship to prior primitives** | Simpler than puncturable PRFs (CK20) or privately puncturable PRFs (TreePIR). No puncturing needed — the full edited set is sent to the server. |

[^8]: Section 6 (p.16): "By sending the whole edited set, we can do puncturing or programming without need of complicated constructions."
[^9]: Section 1.1 (p.3) and Section 6 (p.16): "the only cryptographic primitive we need is pseudorandom functions (PRFs)" (p.3); "the streaming preprocessing avoids the need of using FHE during the offline phase" (p.16).

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (one-way functions) — the minimal assumption. PRFs are constructed from OWF.&#8201;[^10] |
| **PRF instantiation** | AES-128 with AES-NI hardware acceleration. 128-bit keys. |
| **PRP** | Pseudorandom permutation applied to DB indices for load balancing (converts arbitrary queries to random queries). Server publishes PRP key.&#8201;[^11] |
| **Key structure** | Master PRF key msk in {0,1}^λ; per-hint short tags tag_i (32 bits). j-th offset of i-th hint = PRF(msk, tag_i || j). This optimization saves 30% storage and provides 2-3x PRF evaluation speedup.&#8201;[^12] |
| **Correctness condition** | Pr[all Q queries correct] >= 1 - negl(kappa) - negl(λ), where kappa is the statistical security parameter (set to 40) and λ is the computational security parameter (set to 128).&#8201;[^13] |

[^10]: Section 1.1 (p.3): "the only cryptographic primitive we need is pseudorandom functions (PRFs)." Section 5 (p.13): "it is the first single-server PIR scheme that relies solely on one-way functions (OWF) and has sublinear server computation."
[^11]: Section 2 (p.5): "the server applies a pseudorandom permutation (PRP) to all indices of the database... The server publishes the PRP key."
[^12]: Section 4.1, "Optimization" (p.10): Master PRF key plus 32-bit tags instead of independent λ-bit keys per hint. "In practice, we observe this optimization saves the storage by 30%."
[^13]: Theorem 3.3 / Theorem C.3 (p.8, p.26): With M_1 = sqrt(n) ln(kappa) alpha(kappa) primary hints and M_2 = 3 ln(kappa) alpha(kappa) backup entries per chunk, all Q = sqrt(n) ln(kappa) alpha(kappa) queries are answered correctly with probability at least 1 - negl(λ) - negl(kappa).

### Key Data Structures

- **Primary table T:** M_1 = sqrt(n) ln(kappa) alpha(kappa) entries, each consisting of a PRF key sk_i (stored as 32-bit tag), a previously queried index x' (or bottom), and a parity bit p_i = XOR_{j in Set(sk_i)} DB[Set(sk_i)[j]].&#8201;[^14]
- **Replacement entries:** For each chunk j in {0,...,sqrt(n)-1}, M_2 = log(kappa) alpha(kappa) = O~(1) entries of the form (r, DB[r]) where r is a random index from chunk j. Used to replace the queried chunk index in the set sent to the server.&#8201;[^15]
- **Backup table:** For each chunk j, M_2 = 3 ln(kappa) alpha(kappa) entries of the form (sk_bar_{j,k}, p_bar_{j,k}) where sk_bar_{j,k} is a PRF key for a backup set and p_bar_{j,k} is the parity of all indices in the backup set except the one in chunk j. Used to refresh the primary table after a query.&#8201;[^16]

[^14]: Figure 1 (p.6): Primary table definition. Implementation uses 32-bit tags with master key rather than independent λ-bit keys.
[^15]: Figure 1 (p.6): "Store replacement entries: sample and store M_2 tuples of the form (r, DB[r]) where r is a random index from the j-th chunk."
[^16]: Figure 1 (p.6): "Update backup table: for each chunk j and k in [M_2], let p_bar_{j,k} <- p_bar_{j,k} XOR DB[Set(sk_bar_{j,k})[j]]."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Permutation | Server | Apply PRP pi to DB indices | PRP key published | Once |
| Streaming Preprocessing | Client | Stream entire DB; for each chunk, update M_1 primary hint parities, store M_2 replacement entries, update M_2 backup parities per chunk | O(n) download | Per window of Q queries |
| Query | Client | Find hint (sk_i, x', p_i) containing x; find replacement (r, DB[r]) from chunk(x); send S' = Set(sk_i, x') with chunk(x) entry replaced by r | O(sqrt(n)) upload | Per query |
| Answer | Server | Compute q = XOR_{k in S'} DB[k] | O(1) download | Per query |
| Decode | Client | Compute beta = q XOR p_i XOR DB[r] | -- | Per query |
| Refresh | Client | Replace consumed primary hint with backup entry; update backup parity with DB[x] | -- | Per query |

[^17]: Figure 1, "Online query" (p.6): Steps (a)-(e) for query and step 2 for refresh.

### Correctness Analysis

#### Option B: Probabilistic Correctness Analysis

| Field | Detail |
|-------|--------|
| **Failure mode** | Two failure types: (1) client cannot find a primary hint set containing the queried index x; (2) client runs out of backup/replacement entries in a chunk.&#8201;[^18] |
| **Failure probability** | Bounded by negl(kappa) + negl(λ). With kappa = 40, the failure probability is bounded by 2^{-40} across all Q queries in a window, matching SimplePIR [Group C].&#8201;[^19] |
| **Probability grows over queries?** | No — the bound holds jointly for all Q = sqrt(n) ln(kappa) alpha(kappa) queries in a single preprocessing window. After the window, a new preprocessing phase runs.&#8201;[^20] |
| **Probability grows over DB mutations?** | N/A for the base static scheme. The dynamic extension (Appendix B.2) uses hierarchical data structures with separate PIR instances per level. |
| **Key parameters affecting correctness** | M_1 = sqrt(n) ln(kappa) alpha(kappa) (primary hints); M_2 = 3 ln(kappa) alpha(kappa) (backup entries per chunk); Q = sqrt(n) ln(kappa) alpha(kappa) (window size) |
| **Proof technique** | Union bound for failure type 1: Pr[no set contains x] = (1 - 1/sqrt(n))^{M_1} <= (1/e)^{ln(kappa) alpha(kappa)} = kappa^{-alpha(kappa)}. Chernoff bound for negatively correlated variables for failure type 2: balls-into-bins argument bounding the probability that any chunk receives more than M_2 queries.&#8201;[^21] |
| **Amplification** | Not needed — failure probability is already negligible by parameter choice. |
| **Adaptive vs non-adaptive** | Adaptive queries supported. Privacy proof (Theorem 3.2 / Theorem C.1) shows the adversary can adaptively choose queries and the client's hint table remains identically distributed to a fresh random sampling in the adversary's view.&#8201;[^22] |
| **Query model restrictions** | At most Q = sqrt(n) ln(kappa) alpha(kappa) distinct queries per preprocessing window. Duplicate queries handled via local caching. Arbitrary (non-random) queries handled via PRP. Unbounded total queries via pipelining.&#8201;[^23] |

[^18]: Theorem 3.3 proof sketch (p.8-9): "There are only two types of events that causes failures: 1) the client cannot find a set that contains the online query index; 2) the client runs out of hints in a backup group."
[^19]: Section 4.1 (p.10): "We set the statistical security parameter kappa to 40... matching the same failure probability as SimplePIR."
[^20]: Theorem 3.3 (p.8): The correctness bound holds for "all the Q = sqrt(n) ln(kappa) alpha(kappa) queries."
[^21]: Theorem C.3 (p.26): Union bound gives sqrt(n) * kappa^{-alpha(kappa)} for type 1; Chernoff bound for negatively correlated variables gives kappa^{-Theta(alpha(kappa))} for type 2.
[^22]: Theorem 3.2 / Lemma C.2 (p.8, p.24): The client's primary hint table is identically distributed as D_n^{M_1} conditioned on the adversary's view, even for adaptive queries.
[^23]: Section 2 (p.5): Duplicate queries resolved by local caching of most recent Q results; arbitrary queries handled via PRP; unbounded queries via pipelining.

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (100 GB, n = 1.68 * 10^9, 64-byte entries) | Phase |
|--------|-----------|------------------------------------------------------|-------|
| Query size (upload) | O(sqrt(n)) | 100 KB | Online |
| Response size (download) | O(1) | 64 bytes (one entry) | Online |
| Server computation | O(sqrt(n)) | 11.9 ms | Online |
| Client computation | O_λ(sqrt(n)) expected | 11.9 ms (dominated by hint search: O(sqrt(n)) PRF evaluations) | Online |
| Client storage | O_λ(sqrt(n) log kappa alpha(kappa)) | 839 MB | Persistent |

[^24]: Table 1 (p.11): Performance of Piano on 100 GB database (n approximately 1.68 * 10^9, 64-byte entries).
[^25]: Theorem 3.4 (p.9): Each online query has expected O_λ(sqrt(n)) client time, O(sqrt(n)) server time, and O(sqrt(n)) communication.

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (100 GB) | Phase |
|--------|-----------|-------------------|-------|
| Preprocessing time (client) | O_λ(n log kappa alpha(kappa)) | 192 min (1 thread) / 32 min (8 threads) | Offline (per window) |
| Preprocessing communication | O(n) | 100 GB download | Offline (per window) |
| Amortized offline time per query | -- | 13.2 ms (1 thread) / 2.2 ms (8 threads) | Amortized over Q = sqrt(n) ln n queries |
| Amortized offline communication per query | -- | 120.5 KB | Amortized over Q queries |
| Server preprocessing | O(n) (PRP permutation, streaming DB to client) | -- | Offline |
| Server per-client storage | 0 (no additional server storage) | 0 | Persistent |

[^26]: Theorem 3.4 (p.9): Offline phase has O(n) communication, O_λ(n log kappa alpha(kappa)) client time, and O(n) server time. The scheme requires "no additional server storage."
[^27]: Table 1 (p.11): Amortized offline costs at 100 GB: 13.2ms/2.2ms time, 120.5KB communication, amortized over Q = sqrt(n) ln n queries.

#### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass). Client downloads DB sequentially chunk by chunk, updates all M_1 primary hint parities and M_2 backup parities per chunk, then deletes the chunk.&#8201;[^28] |
| **Client peak memory** | O_λ(sqrt(n) log kappa alpha(kappa)). During preprocessing, the client holds one sqrt(n)-size chunk plus all hint/backup state. Concretely, the client storage column in Table 1 reflects the persistent storage (839 MB at 100 GB).&#8201;[^29] |
| **Number of DB passes** | 1 |
| **Hint refresh mechanism** | Pipelining — during the current window of Q queries, the client runs the preprocessing phase for the next window in the background. Client stores 2x sets of hints (current + next). After current window exhausted, swap to the new set.&#8201;[^30] |

[^28]: Figure 1, "Offline preprocessing" (p.6): "Client downloads the whole DB from the server in a streaming way: when the client has the j-th chunk DB[j*sqrt(n) : (j+1)*sqrt(n)]: ... Delete DB[j*sqrt(n) : (j+1)*sqrt(n)] from the local storage."
[^29]: Theorem 3.4 proof (p.9): "the client will only store one sqrt(n)-size chunk of the DB at a time. So the client's storage is O_λ(sqrt(n) log kappa alpha(kappa))."
[^30]: Section 2 (p.5): "during the current window of Q queries, we run the preprocessing phase of the next Q queries... It brings 2x cost to the local storage."

### Performance Benchmarks

Hardware: Two AWS m5.8xlarge instances with 128 GB RAM. Server computation is single-threaded. Client preprocessing is parallelized with 8 threads. Wide-area network: coast-to-coast, 2 Gbps, 60 ms RTT.

#### LAN benchmarks (Table 1)

| Metric | SimplePIR 1 GB (n=2^27, 8B entries) | Piano 1 GB | SimplePIR 2 GB (n=2^28, 8B entries) | Piano 2 GB | SimplePIR(*) 100 GB (n=1.68*10^9, 64B) | Piano 100 GB |
|--------|--------------------------------------|-----------|--------------------------------------|-----------|----------------------------------------|-------------|
| Preprocessing time | 293 s | 629 s / 111 s | 608 s | 1471 s / 257 s | 425 min | 192 min / 32 min |
| Preprocessing comm. | 123 MB | 1 GB | 173 MB | 2 GB | 1.2 GB | 100 GB |
| Online time | 131.6 ms | 3.0 ms | 219.5 ms | 3.4 ms | 10.9 s | 11.9 ms |
| Online comm. | 238 KB | 32 KB | 338 KB | 64 KB | 2.3 MB | 100 KB |
| Am. offline time | 1.4 ms | 2.9 / 0.5 ms | 2.9 ms | 4.6 / 0.8 ms | 29.6 ms | 13.2 ms / 2.2 ms |
| Am. offline comm. | 0.6 KB | 4.9 KB | 0.6 KB | 6.6 KB | 1.4 KB | 120.5 KB |
| Client storage | 123 MB | 61 MB | 173 MB | 71 MB | 1.2 GB | 839 MB |

(*) SimplePIR 100 GB results are extrapolated since their implementation does not support databases this large.&#8201;[^31]

[^31]: Table 1 (p.11): "The results for SimplePIR with the 100GB database are extrapolated since their implementation cannot directly support such a large database."

#### WAN benchmarks (Table 2, 60 ms RTT, 2 Gbps)

| Metric | Non-Private 2 GB | SimplePIR 2 GB | Piano 2 GB | Non-Private 100 GB | SimplePIR(*) 100 GB | Piano 100 GB |
|--------|-----------------|---------------|-----------|-------------------|-------------------|-------------|
| Online time | 59.8 ms | 279.3 ms | 64.0 ms | 61.0 ms | 10.9 s | 72.6 ms |
| Online comm. | 16 B | 338 KB | 64 KB | 72 B | 2.3 MB | 100 KB |

[^32]: Table 2 (p.12): Over WAN, Piano achieves 72.6 ms online time for 100 GB, compared to non-private baseline of 61.0 ms — only 1.2x slowdown. SimplePIR extrapolated at 10.9 s — a 915x performance gap.
[^33]: Section 7 (p.16): "for a 100GB database over a coast-to-coast link, Piano achieves 73ms response time, which is only 1.2x slowdown w.r.t. a non-private baseline."

### Application Scenarios

- **Private DNS:** Database size approximately 100 GB for a full DNS repository. Frequent queries during daytime; preprocessing can run at night or during idle periods. Piano's streaming preprocessing is well-suited.&#8201;[^34]
- **Private Light-weight Blockchain Node:** Light-weight nodes make frequent queries to full nodes for blockchain data, with a natural verification pass over the blockchain history that can double as the preprocessing phase.&#8201;[^35]

[^34]: Section 6 (p.16): "DNS queries are usually made frequently and usually made during a period periodically (e.g., daytime). Piano is also suitable for building a private DNS service."
[^35]: Section 6 (p.16): "A light-weight node needs to make a verification pass over the blockchain history, and it has frequent queries, which makes Piano a suitable privacy-preserving solution."

### Deployment Considerations

- **Database updates:** Base scheme is static. Appendix B.2 describes a dynamic extension using hierarchical data structures (Bentley-Saxe technique): every Q updates, merge and rebuild affected levels. Amortized communication per update is O_λ(log n), amortized server time is O(log n), amortized client time is O_λ(log n * log kappa * alpha(kappa)).&#8201;[^36]
- **Key-value queries:** Appendix B.1 describes extension using Cuckoo hashing: hash n keys into a table D of size O(n) with logarithmic overflow pile F. Client stores F locally and retrieves from two candidate positions in D.&#8201;[^37]
- **Session model:** Persistent client with per-client preprocessing state. Not suitable for anonymous/ephemeral access.
- **Cold start suitability:** No — requires full DB download for preprocessing.
- **Amortization crossover:** Piano becomes faster than SimplePIR immediately for online queries at any database size, but requires O(n) preprocessing communication. At 100 GB, Piano's online time (11.9 ms LAN / 72.6 ms WAN) vs SimplePIR's extrapolated 10.9 s shows approximately 150-915x speedup on the online path.&#8201;[^38]
- **Query limits:** Q = sqrt(n) ln n queries per preprocessing window. With pipelining, unlimited total queries.

[^36]: Appendix B.2, "Performance analysis" (p.23-24): Hierarchical data structure with L = O(log n) levels, each level l containing a PIR instance of size 2^l * Q. Amortized costs per update: O_λ(log n) communication, O(log n) server time.
[^37]: Appendix B.1 (p.22): Cuckoo hashing with overflow pile for key-value queries.
[^38]: Section 1.1 (p.3) and Table 2 (p.12): "This represents over 150x speedup relative to SimplePIR" (LAN); over WAN, Piano is 72.6 ms vs SimplePIR's extrapolated 10.9 s.

### Key Tradeoffs & Limitations

- **O(n) preprocessing communication:** Client must download the entire database once per preprocessing window. This is the dominant cost and is orders of magnitude larger than SimplePIR's hint (e.g., 100 GB vs 1.2 GB at 100 GB database size).&#8201;[^39]
- **O(sqrt(n)) online communication:** Compared to prior theoretical schemes [ZLTS23, LP22] that achieve O~_λ(1) online communication, Piano trades optimal communication for practical simplicity and PRF-only assumptions.&#8201;[^40]
- **Client storage grows with DB size:** At 100 GB, client storage is 839 MB. At 1 GB, it is only 61 MB.
- **Preprocessing is client-compute-bound:** Preprocessing requires O(n log kappa alpha(kappa)) PRF evaluations and XOR operations. For 100 GB with 8 threads, this takes 32 minutes. PRF evaluations dominate when entry size is small (64 bytes or less).&#8201;[^41]
- **Not suitable for anonymous access:** Client-dependent preprocessing means the server knows which client is querying (but not what is being queried).

[^39]: Section 6 (p.16): "The main limitation of Piano is its communication cost: 1) the client has to download the whole database during the setup phase; 2) the online communication cost per query is O(sqrt(n))."
[^40]: Section 6 (p.16): Piano's O(sqrt(n)) communication trades off against ZLTS23/LP22's O~_λ(1) but "this sacrifice is actually what makes our solutions practical."
[^41]: Section 4.3, "Preprocessing costs" (p.11-12): "the PRF evaluations are the computation bottleneck when the entry size is not too big (e.g., 64 bytes or less). Therefore, our scheme's concrete performance depends more on the number of entries, rather than the per-entry size."

### Comparison with Prior Work

#### Asymptotic comparison (Table 3, p.14)

| Metric | Piano | SimplePIR [Group C] | CK20 [Group D] | CHK22 | ZLTS23/LP22 |
|--------|-------|--------------------|----|------|-------------|
| Assumption | OWF | LWE | LWE | LWE | LWE |
| Communication | O(sqrt(n)) | O~_λ(sqrt(n)) | O~_λ(sqrt(n)) | O~_λ(sqrt(n)) | O~_λ(1) |
| Per-query time | O~_λ(sqrt(n)) | O(n) | O~_λ(n) | O~_λ(sqrt(n)) | O~_λ(sqrt(n)) |
| Extra space | O~_λ(sqrt(n)) | O~_λ(sqrt(n)) | O~_λ(n) | O~_λ(sqrt(n)) | O~_λ(sqrt(n)) |

[^42]: Table 3 (p.14): Piano is the only scheme with OWF assumption (vs LWE for all others) and O(sqrt(n)) per-query time. CK20 has O~_λ(n) per-query time and extra space. ZLTS23/LP22 achieve O~_λ(1) communication but require FHE.

#### Concrete comparison at key database sizes

| Metric | SimplePIR 1 GB | Piano 1 GB | Speedup |
|--------|---------------|-----------|---------|
| Online time | 131.6 ms | 3.0 ms | 43.9x |
| Online comm. | 238 KB | 32 KB | 7.4x |
| Client storage | 123 MB | 61 MB | 2x less |

| Metric | SimplePIR(*) 100 GB | Piano 100 GB | Speedup |
|--------|-------------------|-------------|---------|
| Online time | 10.9 s | 11.9 ms | ~915x |
| Online comm. | 2.3 MB | 100 KB | 23x |
| Client storage | 1.2 GB | 839 MB | 1.4x less |

[^43]: Section 4.3 (p.11): "for medium-sized databases (1GB/2GB), we outperform SimplePIR by 43.9x - 64.6x in terms of online querying latency."

**Key takeaway:** Piano is the scheme of choice for large databases (10+ GB) where online query latency matters more than preprocessing cost. Its sublinear server computation produces asymptotically growing speedups over linear-scan schemes as database size increases. The PRF-only construction makes it simpler to implement and audit than any FHE-based alternative.

### Portable Optimizations

- **Master PRF key + short tags:** Instead of storing an independent λ-bit PRF key per hint, store one master key msk and a 32-bit tag per hint. Compute PRF(msk, tag_i || j) for the j-th chunk offset. This saves 30% storage and provides 2-3x PRF evaluation speedup, applicable to any PRF-based hint scheme (RMS24, Plinko).&#8201;[^44]
- **PRP load balancing:** Applying a PRP to database indices converts arbitrary query patterns into random query patterns. This makes the balls-into-bins analysis exact and simplifies correctness proofs. Applicable to any Group D scheme with chunk-based structure.&#8201;[^45]
- **Pipelining preprocessing:** Running the next window's preprocessing concurrently with the current window's queries, at 2x storage cost, converts a bounded-query scheme into an unbounded-query scheme. Applicable to any Group D scheme with windowed amortization.

[^44]: Section 4.1, "Optimization" (p.10): "the client just needs to generate a λ-bit master PRF key msk and a unique short tag tag_i (e.g. 32 bits) for the i-th hint."
[^45]: Section 2 (p.5): "the server applies a pseudorandom permutation (PRP) to all indices of the database... this permutation is independent of the queries."

### Implementation Notes

- **Language / Library:** Go (Golang), approximately 800 lines of code for the full implementation. A tutorial reference implementation in 160 lines of code is also provided.&#8201;[^46]
- **Polynomial arithmetic:** N/A (PRF-based, no polynomial rings).
- **SIMD / vectorization:** AES-NI hardware instructions for PRF evaluation.
- **Parallelism:** Preprocessing is parallelized across 8 threads (client-side). Server-side and online computation are single-threaded.&#8201;[^47]
- **64-bit index:** Uses 64-bit integers for database indices to support arbitrarily large databases.&#8201;[^48]
- **Chunk size:** Set to 2*sqrt(n), rounded to nearest power of 2, making modulo operations efficient. Does not affect asymptotic complexity.&#8201;[^49]
- **Open source:** https://github.com/wuwuz/Piano-PIR-new

[^46]: Section 1.1 (p.3) and Section 4.1 (p.10): "the core implementation contains only around 800 lines of code" (p.10). The 160-line reference implementation is mentioned on p.3.
[^47]: Section 4.1, "Parallelization" (p.10): "We parallelize the preprocessing on the client side... All server-side and online computation is performed on a single thread."
[^48]: Section 4.1 (p.10): "Our implementation uses a 64-bit integer to denote a database index and thus we can support sufficiently large database."
[^49]: Section 4.1, "Parameters" (p.10): "we set the chunk size to be 2*sqrt(n) and round it up to the nearest power of 2, which makes the modulo operation more efficient."

### Open Problems

- Designing a practical single-server PIR with O~_λ(1) online communication (current Piano uses O(sqrt(n))).&#8201;[^50]
- Reducing the preprocessing communication from O(n) (full DB download) while maintaining PRF-only assumptions and practical efficiency.

[^50]: Section 6 (p.16): "designing a truly practical single-server PIR with O~_λ(1) communication overhead is one of the major future questions to be explored."

### Uncertainties

- The paper uses n for total database size in bits throughout; this is consistent and does not collide with other notation in this paper. However, it differs from the convention in FHE-based papers where n denotes ring dimension.
- SimplePIR's 100 GB performance numbers are extrapolated by the Piano authors, not measured directly, since SimplePIR's implementation did not support databases that large.
- The paper presents the "revised version" (S&P 2024) of the original ePrint 2022/452. The main scheme in the body (Figure 1) is the new simpler construction; the original initial scheme is presented as a variant in Appendix A.

### Related Papers in Collection

- **SimplePIR / DoublePIR [Group C]:** Primary comparison target. Piano achieves 43-915x faster online queries at the cost of client-dependent preprocessing and O(n) offline communication.
- **CK20 [Group D]:** Theoretical predecessor. First single-server sublinear PIR in the client-preprocessing model, but required puncturable PRFs and supported only a single query.
- **Plinko [Group D]:** Successor. Uses invertible PRFs for worst-case O(1) database updates, but is theory-only (no implementation).
- **TreePIR [Group D]:** Two-server concurrent work. Achieves polylogarithmic per-query communication via weak privately puncturable PRFs. For 2^28 entries (8 GB), TreePIR's best amortized online time is 23 ms (non-recursive) vs Piano's 8 ms amortized with 4x local storage.&#8201;[^51]
- **RMS24 [Group D]:** Successor. Uses dummy subsets for standard (non-consumable) correctness model.

[^51]: Section 5 (p.16): "For an 8GB database with 2^28 entries, the best amortized online time results reported in TreePIR are 23ms for the non-recursive scheme and 84ms for the recursive scheme. For comparison, our scheme has an amortized 8ms per-query time under the same setting with 4x local storage."
