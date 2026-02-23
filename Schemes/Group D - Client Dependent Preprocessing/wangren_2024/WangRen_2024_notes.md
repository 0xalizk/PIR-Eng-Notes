## WangRen — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Single-Server Client Preprocessing PIR with Tight Space-Time Trade-off](https://eprint.iacr.org/2024/1845) (2024) |
| **Archetype** | Construction (theory-only) + Theory (proves tight space-time tradeoff) |
| **PIR Category** | Group D — Client-dependent preprocessing |
| **Security model** | Semi-honest single-server, computational (OWF) |
| **Additional assumptions** | None beyond OWF (PRF and small-domain PRP are both constructible from OWF) [^1] |
| **Correctness model** | Deterministic (permutation-based hint table covers every DB entry exactly once per row; correctness proved via Lemma 4.4) [^2] |
| **Rounds (online)** | 1 (client sends T indices, server returns T entries) |
| **Record-size regime** | Parameterized (entry size w is a free parameter; tight tradeoff holds for w = Omega(log n)) [^3] |

[^1]: Section 1.1 (p.2): "Assuming one-way functions exist" is the sole computational assumption. PRF from OWF is standard [GGM86]. Small-domain PRP from PRF is via [MR14].

[^2]: Lemma 4.4 (p.19): "Construction 4.2 satisfies the correctness definition of client preprocessing PIR." The proof relies on Lemma 3.13 (every element appears exactly once) and Lemma 4.3 (hint parities are always correct). Deterministic — no failure probability.

[^3]: Section 1.1 (p.3): The tight tradeoff ST = O(nw) holds when w = Omega(log n), which the authors note "is the most natural setting as it takes log n bits to represent the index of a database with n entries."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Lazzaretti-Papamanthou [LP24] (single-pass client preprocessing with imaginary hint table, 2-server), Corrigan-Gibbs-Kogan [CGK20/CGHK22] (first sublinear-server client preprocessing PIR), Yeo [Yeo23] (ST = Omega(n) lower bound for 1-bit entries), Ishai-Shi-Wichs [ISW24] (SZK communication barrier) |
| **What changed** | LP24 introduced a permutation-based hint table that avoids the coupon-collector duplication problem, but required two non-colluding servers and linear client storage. This paper (1) introduces empty cells and relocation to eliminate the second server, and (2) replaces linear-size permutation arrays with a PRP-backed relocation data structure to achieve sublinear client storage. |
| **Superseded by** | N/A |
| **Concurrent work** | N/A |

### Core Idea

Prior client preprocessing PIR schemes achieve S = O(λ * sqrt(n) * w) storage and T = O(sqrt(n)) server probes, yielding ST = O(λ * n * w) — a factor λ away from the Omega(nw) lower bound. The extra λ comes from the coupon-collector duplication inherent in independently sampled hint sets. This paper adapts the permutation-based hint table of [LP24] to work with a single server by introducing a novel relocation data structure. Each query consumes one column of the hint table; entries in that column are relocated to random empty positions in the same row, maintaining the invariant that each DB entry appears exactly once per row. A small-domain PRP compresses the permutation state, reducing client storage from O(n) to O(n/T * (log n + w)). The resulting scheme achieves ST = O(nw) when w = Omega(log n), matching the lower bound up to constant factors.&#8201;[^4]

[^4]: Theorem 1.1 (p.2): Client storage O(Qw + Q log n) bits, amortized communication O(Tw + T log n) bits, amortized server computation O(T) accesses, amortized client computation O(T) XORs and O(T) small-domain PRP calls, over Q = n/T queries.

### Novel Primitives / Abstractions

#### Relocation Data Structure

| Field | Detail |
|-------|--------|
| **Name** | Relocation data structure (DS) |
| **Type** | Data structure |
| **Interface / Operations** | DS.Init(m, m'): randomized initialization algorithm (not an interface operation). Three interface operations: DS.Access(c) -> e: return element at position c (or bottom). DS.Locate(e) -> c: return position of element e. DS.Relocate(c): consume position c, relocate its element to a random empty position. [^5] |
| **Security definition** | Perfect security: initial positions are uniformly random in [m']; after each Relocate, the relocated element lands at a uniformly random empty position, conditioned on all prior state (Definition in Section 3.1, p.12–13). Formally verified via Experiments 3.1 and 3.2 producing identical distributions. [^6] |
| **Correctness definition** | After each Relocate, each element in [m] appears once and only once. Access and Locate are inverses. A relocated element goes to an empty, unconsumed position (Lemma 3.13, 3.14, 3.15). [^7] |
| **Purpose** | Replace T linear-size permutation arrays with T compact PRP-backed instances, reducing client storage from O(n) to O(Qw + Q log n) (Theorem 4.1 / Section 4.3, p.21–22), where the per-instance DS storage is O(lambda + m log m) (Section 1.2, p.7). [^8] |
| **Built from** | Small-domain PRP P over [m'] (from [MR14]) + Hist data structure (Construction 3.4: array C of consumed positions + hash map M for O(1) lookup). All T DS instances share a single global Hist. [^9] |
| **Standalone complexity** | Access: O(1) expected PRP calls for random input. Locate: O(1) expected PRP calls for random input. Relocate(c) then Locate(e): O(1) expected + O(1) amortized PRP calls (Theorem 3.3). [^10] |
| **Relationship to prior primitives** | Novel. Conceptually similar to cuckoo hashing's eviction chains but with a different invariant (every element appears exactly once, positions are uniformly random). The helper graph G (Definition 3.6) of disjoint chains and cycles provides the key structural insight. [^11] |

[^5]: Section 3.1 (p.12): Formal interface definition. DS is parameterized by security parameter λ, size parameters m, m' in N with m' > m.

[^6]: Section 3.1 (pp.12–13): Perfect security formalized via Experiments 3.1 and 3.2 (both on p.13). Lemma 3.16 (p.16) proves identical distributions by induction on the number of Relocate operations.

[^7]: Lemma 3.13 (p.15): elements appear once and only once. Lemma 3.14 (p.16): Access and Locate are inverses. Lemma 3.15 (p.16): Relocate moves elements to empty, unconsumed positions.

[^8]: Section 1.2 (p.7): per-instance DS storage is "O(λ + m log m), avoiding the linear client storage." The total client storage across the full PIR scheme is O(Qw + Q log n) bits (Theorem 4.1, p.17; Section 4.3, p.21–22).

[^9]: Section 1.2 (p.7): "Each DS instance uses a separate small-domain PRP. (The keys to the PRPs can be derived pseudorandomly via a PRF from a single master key.) The T DS instances will share a global array C that stores the consumed columns, along with a hash map to allow finding the index of any column in C (i.e., 'invert' C) in constant time."

[^10]: Theorem 3.3 (p.13): Access O(1) expected for random c in [m'] \ C. Locate O(1) expected for random e in [m]. Relocate(c) and then Locate(e) uses O(1) expected time over position c in [m'] \ C and O(1) amortized time across m calls with distinct c.

[^11]: Definition 3.6 (p.15): The helper graph G has m' nodes; for the t-th consumed position C[t], there is a directed edge from C[t] to P(m+t). G consists of disjoint chains and cycles (Corollary 3.10). Locate traverses out-edges from chain start to end; Access traverses in-edges from chain end to start.

#### Hist (Relocate History)

| Field | Detail |
|-------|--------|
| **Name** | Hist (Construction 3.4) |
| **Type** | Data structure |
| **Interface / Operations** | Hist.Init(): initialize empty array C and empty hash map M. Hist.Append(c): append c to C, set M[c] = |C| - 1. Hist[t] -> c: return C[t] if t < |C|. Hist^{-1}[c] -> t: return M[c] if c in M. [^12] |
| **Purpose** | Track consumed positions and enable O(1) index-to-position and position-to-index lookups during chain traversal in Access and Locate operations. |
| **Built from** | Array + hash map |
| **Standalone complexity** | O(Q log m) bits total for up to Q consumed positions, using the hash map for constant-time inverse lookups. [^12] |

[^12]: Construction 3.4 (p.14–15): Hist stores array C and hash map M. All operations are O(1). Storage is O(m log m) bits in total for the array and hash map when m' = O(m) (p.15).

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (one-way functions). PRF and small-domain PRP are both constructed from OWF. [^1] |
| **Encryption/encoding scheme(s)** | None — purely symmetric-key. PRF used to derive per-row PRP keys: ck_j = PRF(ck_hat, j). Small-domain PRP P_{ck_j} provides the permutation for each DS instance. [^13] |
| **Key structure** | Client key ck = (ck_hat, Hist) where ck_hat is a λ-bit PRF master key and Hist is the shared relocation history. [^14] |
| **Correctness condition** | Deterministic: every DB entry appears in exactly one column per row of the hint table, so the XOR-parity hint always enables correct reconstruction. [^2] |

[^13]: Construction 4.2 (p.18): "For each row j, an instance of DS_j in Construction 3.5 is instantiated with pseudorandom permutation PRP(ck_j, .) where ck_j = PRF(ck_hat, j) and the globally shared Hist."

[^14]: Construction 4.2 (p.18): "The client stores a key ck_hat, the history of consumed columns Hist, and hints h = (h_0, h_1, ..., h_{m'-1})." Initially ck = (ck_hat, Hist); after each query, the updated key is ck' = (ck_hat, Hist) with the appended consumed column.

### Key Data Structures

- **Hint table:** Imaginary T x m' matrix (T rows, m' = 2m = 2n/T columns). Row j is managed by DS_j. Each row contains m database entries from DB_j placed at random positions determined by PRP, plus m empty positions. Column c in row j holds DB_j[DS_j.Access(c)] if the position contains an element, and is empty (bottom = 0^w) otherwise. [^15]
- **Hint parities:** Array h = (h_0, ..., h_{m'-1}) of m' XOR sums, each w bits. h_c = XOR_{j in [T]} DB_j[DS_j.Access(c)], i.e., the XOR of all entries in column c across all T rows. [^16]
- **Relocation data structure (DS):** T instances DS_0, ..., DS_{T-1}, one per row, each backed by a small-domain PRP over [m'] and sharing a global Hist. Replaces the T explicit permutation arrays p_0, ..., p_{T-1} from the linear-storage scheme. [^9]
- **Consumed column set:** Maintained by Hist. After k queries, columns C[0], ..., C[k-1] are consumed and cannot hold elements. The hint table supports m' - m = m total queries before re-preprocessing. [^17]

[^15]: Section 1.2 (p.4–5): "the hint table is now a matrix with T rows where each row is of size m' = 2m = 2n/T. Out of the 2m positions in each row, a random subset of m positions contains the m database entries in that row."

[^16]: Construction 4.2 (p.18): HintConstruct streams the database and computes h_c = h_c XOR DB_j[e] where c = DS_j.Locate(e).

[^17]: Section 1.2 (p.5): "A consumed column will not be replenished as in all previous schemes, and the hint table now has one fewer column. Naturally, a hint table can only support a limited number of queries."

### Database Encoding

- **Representation:** DB is divided into T rows of m = n/T entries each. DB_j = DB[j*m : (j+1)*m] is the j-th row of size m. [^18]
- **Record addressing:** Entry i resides in row j = floor(i/m) at position c = DS_j.Locate(i mod m) within that row. [^19]
- **Preprocessing required:** None on server side. Client streams DB once during HintConstruct to compute hint parities.

[^18]: Section 1.2 (p.3): "For a given parameter T, we divide DB into T rows of size m = n/T and define DB_j = DB[j*m : (j+1)*m] to be the j-th row of the database."

[^19]: Construction 4.2, Query step (p.18): "Let j* <- floor(i/m) and c <- DS_{j*}.Locate(i mod m)."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| KeyGen | Client | Sample λ-bit PRF key ck_hat, initialize Hist | — | Once |
| HintConstruct | Client | Stream entire DB; for each entry DB_j[e] in row j, compute c = DS_j.Locate(e) and update h_c = h_c XOR DB_j[e] | O(nw) bits (DB download) | Every Q = n/T queries [^20] |
| Query | Client | Find target column c via DS_{j*}.Locate(i mod m); build request q = (DS_0.Access(c), ..., DS_{T-1}.Access(c)) replacing j*-th entry with a random element; call Hist.Append(c) | T * log(n) bits upload | Per query |
| Answer | Server | Parse (i_0, ..., i_{T-1}) from q; return (DB_0[i_0], ..., DB_{T-1}[i_{T-1}]) | T * w bits download | Per query |
| Reconstruct | Client | Compute DB[i] = h[c] XOR (XOR of all returned entries except j*-th); update hints for relocated entries | — | Per query |

[^20]: Section 4.3 (p.21): "The client performs the O(nw) preprocessing step per m = n/T queries, so the amortized communication cost from preprocessing is O(Tw)."

### Correctness Analysis

Deterministic correctness -- the scheme always returns the correct answer, with probability 1.

The key invariant is maintained by induction (Lemma 4.3, p.19): after every query, for every unconsumed column c in [m'] \ C, the stored hint h_c equals XOR_{j in [T]} DB_j[DS_j.Access(c)]. Initially this holds because HintConstruct computes exactly these XOR sums. After a query consuming column c, the Reconstruct phase relocates each entry in column c to a random empty position r_j in the same row (via DS_j.Relocate), and updates h_{r_j} <- h_{r_j} XOR a[j] where a[j] is the entry value returned by the server. This preserves the XOR invariant for the new column because the relocated entry is now accounted for in h_{r_j}.&#8201;[^21]

[^21]: Lemma 4.3 (p.19): Initially the hint table is correct by inspecting HintConstruct. After a query, an element is appended to Hist; for each row j where q[j] != bottom, the Reconstruct step computes c = DS_j.Locate(q[j]) and updates h_c = h_c XOR a[j], preserving the XOR invariant for the new column (paraphrase of proof argument).

Correctness of answer reconstruction: the client computes DB[i] = h[c] XOR (XOR_{j in [T], j != j*} a[j]). Since h[c] = XOR_{j in [T]} DB_j[DS_j.Access(c)] and a[j] = DB_j[DS_j.Access(c)] for j != j*, the XOR cancels all terms except DB_{j*}[DS_{j*}.Access(c)] = DB[i]. (Lemma 4.4, p.19).&#8201;[^2]

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(T log n) bits | N/A (no implementation) | Online |
| Response size | O(Tw) bits | N/A (no implementation) | Online |
| Server computation | O(T) accesses to w-bit entries | N/A (no implementation) | Online |
| Client computation | O(T) XORs of w-bit entries + O(T) small-domain PRP calls | N/A (no implementation) | Online |
| Amortized communication | O(Tw + T log n) bits per query | N/A (no implementation) | Online + amortized preprocessing [^22] |

[^22]: Lemma 4.9 (p.21): "each online query has communication cost O(Tw + T log n). The client performs the O(nw) preprocessing step per m = n/T queries, so the amortized communication cost from preprocessing is O(Tw) and overall amortized communication cost is O(Tw + T log n) bits."

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Client hint download | O(nw) bits per window | N/A (no implementation) | Offline (per window of Q = n/T queries) |
| Client persistent storage | O(Qw + Q log n) = O((n/T)(w + log n)) bits | N/A (no implementation) | — [^23] |
| Amortized offline/query | O(Tw + T log n) bits communication | N/A (no implementation) | Amortized over Q = n/T queries |

[^23]: Section 4.3 (p.21): "h contains m' XOR sums of size w each and has size m'w = O(Qw). ck contains λ bits of PRF key and the state for Hist. From Construction 3.4, we know that Hist stores an array of size no more than Q and a hash map containing no more than Q elements. Therefore, the size of ck is O(Q log n) bits and the total client storage is O(Qw + Q log n) bits."

#### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass) [^24] |
| **Client peak memory** | O((n/T)(w + log n)) bits (hint array + DS state) |
| **Number of DB passes** | 1 |
| **Hint refresh mechanism** | Full re-download every Q = n/T queries (consumed columns are not replenished) [^17] |

[^24]: Construction 4.2 (p.18): "The client streams the database by each element." HintConstruct processes entries sequentially.

#### Space-Time Tradeoff

The scheme achieves any point on the tradeoff curve S * T = O(nw) by varying the time parameter T.&#8201;[^25]

| Operating point | T (server probes) | S (client storage) | Communication |
|-----------------|-------------------|--------------------|---------------|
| Minimum storage | n (trivial — read entire DB) | O(w + log n) | O(nw) |
| Balanced (sqrt) | O(sqrt(n)) | O(sqrt(n) * (w + log n)) | O(sqrt(n) * (w + log n)) |
| Minimum time | O(1) | O(n(w + log n)) | O(w + log n) |

[^25]: Theorem 4.1 (p.17) and Theorem 1.1 (p.2): For any T, client storage is O(Qw + Q log n) where Q = n/T. Thus S * T = O((n/T)(w + log n)) * T = O(n(w + log n)) = O(nw) when w = Omega(log n).

### Lower Bounds

#### ST = Omega(nw) for single-query

| Field | Detail |
|-------|--------|
| **Bound type** | Space-time tradeoff lower bound |
| **Bound statement** | ST = Omega(nw) where S = client storage in bits and T = number of server probes for a single query [^26] |
| **Variables** | n = database size (number of entries), w = entry size in bits, S = client storage before the query, T = number of DB entries probed by the server |
| **Model assumptions** | Computationally secure (against single compromised server), server stores DB in its original form, client retrieves desired entry with error probability at most 1/15 |
| **Proof technique** | Extension of Yeo [Yeo23] from 1-bit to w-bit entries. The encoding of [Yeo23] is scaled: setting entry size to w bits makes the encoded database have nw bits instead of n bits. Client storage grows by factor w; metadata does not grow (it depends only on n and probe pattern). This yields ST = Omega(nw). [^27] |
| **Tightness** | Tight — Construction 4.2 achieves ST = O(nw) when w = Omega(log n) [^25] |
| **Matching upper bound** | This paper's Construction 4.2 (Theorem 4.1) |

[^26]: Theorem B.1 (p.27): "For any l = O(1) and any l-server computationally secure (against single compromised server) client preprocessing PIR scheme such that, on database size n and entry size w, the server stores DB in its original form, the client stores S bits before the query, the server probes T entries of the database, and the client retrieves the desired entry with error probability at most 1/15, must have ST = Omega(nw)."

[^27]: Appendix B.1 (p.27–28): "setting the entry size to w-bits, the encoded database will have nw bits instead of n bits. For a fixed number of probes, this will allow us to increase the client storage size by w times and still be able to derive the contradiction."

#### ST = Omega(nw) for amortized multi-query

| Field | Detail |
|-------|--------|
| **Bound type** | Space-time tradeoff lower bound (amortized over many adaptive queries) |
| **Bound statement** | ST = Omega(nw) where S = client storage between queries and T = amortized number of server probes per query [^28] |
| **Model assumptions** | Same as single-query bound; extends to many adaptive queries via reduction from [CGHK22] |
| **Proof technique** | Uses [CGHK22] Theorem 6.2: any multi-query scheme with T amortized probes implies a single-query scheme with O(T) probes and same storage. Combined with Theorem B.1 yields the amortized bound. [^29] |
| **Tightness** | Tight — Construction 4.2 achieves O(T) amortized probes with S = O((n/T)(w + log n)) |

[^28]: Theorem B.2 (p.28): "For any l = O(1) and any l-server computationally secure client preprocessing PIR scheme for many adaptive queries such that, on database size n and entry size w, the server stores DB in its original form, the client stores at most S bits between queries, and the server probes T entries of the database when amortized for all queries, must have ST = Omega(nw)."

[^29]: Appendix B.1 (p.28, "Amortized server probes" paragraph): The lower bound in Theorem B.1 is extended to amortized server probes over many PIR queries, using a reduction from [CGHK22] (Theorem 6.2) showing that any multi-query scheme with T amortized probes implies a single-query scheme with O(T) probes and the same storage.

#### SZK Communication Barrier

| Field | Detail |
|-------|--------|
| **Bound type** | Communication barrier (conditional impossibility) |
| **Bound statement** | Any database-oblivious client preprocessing PIR scheme with S bits of storage and a consecutive sequence of 3S/w queries consuming less than nw/3 bandwidth implies a separation of SZK from BPP [^30] |
| **Model assumptions** | Database-oblivious (queries depend only on symmetric-key cryptography, not on DB contents), S bits of client storage |
| **Proof technique** | Extension of [ISW24] from 1-bit to w-bit entries. The original barrier generalizes immediately because retrieving a single entry of 3S bits from a database of n/3S entries works with 3S/w queries each of w bits. [^31] |
| **Implications** | This paper's scheme meets the barrier with up to constant factors when w = Omega(log n). Schemes with low worst-case online communication (e.g., O(w) per query) must have high amortized communication from preprocessing. Specifically: with S bits of storage, worst-case online comm of less than 1/9 * nw^2/S bits, and amortized comm less than 1/18 * nw^2/S bits implies SZK != BPP (Theorem B.4). [^32] |

[^30]: Theorem B.3 (p.28): "[ISW24] generalized. Any database-oblivious client preprocessing PIR scheme with S bits of client storage, and a consecutive sequence of 3S/w queries consume less than nw/3 bandwidth, implies an average-case hard promise problem in SZK."

[^31]: Appendix B.2 (p.28–29): "The original barrier immediately generalizes to the w-bit entry case as their proof actually proves a barrier for any scheme that can retrieve a single entry of 3S bits from a database of n/3S entries."

[^32]: Theorem B.4 (p.29): Extends the barrier to account for amortized communication from preprocessing. "Any database-oblivious client preprocessing PIR scheme with S bits of storage, (worst case) online communication cost of less than 1/9 * nw^2/S bits, and amortized communication of less than 1/18 * nw^2/S implies an average-case hard promise problem in SZK."

### Performance Benchmarks

No implementation. Analytical estimates from Theorem 4.1 (p.17):

At the balanced operating point T = sqrt(n) with w = Theta(log n):
- Client storage: S = O(sqrt(n) * log n) bits
- Server probes per query: T = O(sqrt(n))
- Amortized communication per query: O(sqrt(n) * log n) bits
- Client computation per query: O(sqrt(n)) XORs of log(n)-bit entries + O(sqrt(n)) PRP calls
- Server computation: T = O(sqrt(n)) DB accesses (no extra computation beyond retrieval)
- Amortization window: Q = n/T = sqrt(n) queries per preprocessing phase

Server performs no computation beyond retrieving the T requested entries, distinguishing this scheme from FHE-based PIR where the server performs expensive homomorphic operations.&#8201;[^33]

[^33]: Section 1.1 (p.3): "The server performs no extra computation aside from retrieving the T entries requested by the client."

### Deployment Considerations

- **Database updates:** Supported efficiently. For updating entry i, the server sends the old and new values; the client computes j = floor(i/m), c = DS_j.Locate(i mod m), and updates h_c <- h_c XOR DB[i] XOR DB'[i]. Cost: O(1) expected PRP calls and 2 XORs. Each entry contributes to exactly one hint, so updates are O(1). [^34]
- **Sharding:** Not explicitly discussed, but the row-based DB partitioning (T rows of m entries) is naturally compatible with sharding each row to a separate shard.
- **Query limits:** Q = m' - m = m = n/T queries per preprocessing window. After Q queries, full re-preprocessing is required.
- **Anonymous query support:** No — client stores personalized hints and state tied to its PRF key.
- **Session model:** Persistent client (stateful: ck, Hist, and hint array h persist across queries).
- **Cold start suitability:** No — requires streaming the entire DB for HintConstruct before any query.

[^34]: Section 4.3 (p.22): "Our scheme additionally supports efficient updates to the database, where updating a random database entry takes O(1) expected PRP calls and two XORs."

### Key Tradeoffs & Limitations

- **Tight ST = O(nw) tradeoff is the main contribution**: this is the first scheme matching the Omega(nw) lower bound up to constant factors (for w = Omega(log n)), resolving a central open question in client preprocessing PIR.
- **No implementation**: the paper is theory-only; no benchmarks or concrete performance measurements are provided. Practical constants (e.g., PRP evaluation cost, hash map overhead) are not measured.
- **Does not meet the server probe lower bound for small entries (w = 1)**: the tradeoff is tight only when w = Omega(log n). For 1-bit entries, the scheme achieves ST = O(n log n), which is a log n factor above the Omega(n) lower bound. [^3]
- **Does not meet the communication barrier for small online communication**: the scheme's online communication is O(nw^2/S) per query, which is higher than schemes like RMS24 or Piano that achieve O(w) online communication. However, the SZK barrier (Theorem B.4) shows that low online communication must be compensated by high amortized preprocessing communication. [^32]
- **Requires client-dependent preprocessing**: not suitable for anonymous access or scenarios where clients cannot maintain persistent state.
- **Single-pass streaming**: HintConstruct processes the DB in a single pass, making it compatible with streaming delivery but requiring the full hint array in memory during preprocessing.

### Comparison with Prior Work

| Metric | WangRen (this) | State-of-art [LP23b, ZPZS24, GZS24, HPPY24] | CGK20/CGHK22 |
|--------|---------------|----------------------------------------------|--------------|
| ST product | O(nw) (tight) | O(λ * sqrt(n) * w * sqrt(n)) = O(λ * nw) | O(n * poly(log n, λ)) |
| Client storage S | O((n/T)(w + log n)) | O(λ * sqrt(n) * w) | O(n * poly(log n, λ)) |
| Server probes T | O(T) (tunable) | O(sqrt(n)) | O(sqrt(n) * poly(log n, λ)) |
| λ factor in ST | None (constant) | λ (from coupon collector) | poly(log n, λ) |
| Number of servers | 1 | 1 (some require 2) | 1 (CGHK22), 2 (CGK20) |
| Correctness | Deterministic | Probabilistic (most) or deterministic | Probabilistic |
| Hardness assumption | OWF | OWF | OWF |

**Key takeaway:** WangRen is the first single-server client preprocessing PIR scheme achieving a tight space-time tradeoff ST = O(nw), eliminating the λ factor present in all prior constructions. It does so via a deterministic permutation-based approach with a novel relocation data structure. The absence of an implementation means practical competitiveness with schemes like Piano remains an open question.

### Portable Optimizations

- **Relocation data structure (DS):** The PRP-backed relocation data structure is a general-purpose primitive for maintaining a dynamic bijection between elements and positions with perfect security. It could replace explicit permutation arrays in any scheme that needs to track element positions through consume-and-relocate operations (e.g., LP24, or any scheme using hint tables with column consumption).
- **Shared Hist across DS instances:** The observation that all T DS instances share the same Hist (because all rows consume the same column at each query) reduces storage from T separate consumed-column sets to a single global one. Applicable to any multi-row hint table scheme.
- **PRP for query randomization (Appendix A.2):** To achieve O(T) client computation for arbitrary (non-random) queries, the client uses a PRP P: [n] -> [n] to permute the database, making any query sequence appear random to the data structure. This technique is applicable to any preprocessing PIR scheme whose efficiency analysis requires random queries. [^35]

[^35]: Appendix A.2 (p.27): "At the beginning of the protocol, the client chooses a PRP P: [n] -> [n] over domain [n] of database indices and sends the PRP key to the server... For every query, the client uses permutation P to transform the desired index into the index of the same entry in the permuted database."

### Open Problems (as discussed by the authors)

- Can the tight ST = O(nw) tradeoff be achieved for 1-bit entries (w = 1), i.e., can the log n factor gap be closed when w = o(log n)?
- Can a scheme simultaneously achieve the tight ST tradeoff and meet the communication barrier (Theorem B.4), i.e., achieve both O(w) online communication and ST = O(nw)?
- Can the scheme be implemented practically and compete with Piano/RMS24 at concrete parameter sizes?

### Related Papers in Collection

- **Piano [Group D]:** Practical single-server preprocessing PIR with O(sqrt(n)) server probes and O(λ * sqrt(n) * w) client storage. Has λ factor in ST product. Probabilistic correctness.
- **Plinko [Group D]:** Theory-only construction using invertible PRFs for O(1) amortized updates. Different technique (puncturable/invertible PRFs vs. relocation).
- **CK20 [Group D]:** First sublinear-server client preprocessing PIR. Puncturable PRF-based. ST product has poly(log n, λ) factors.
- **RMS24 [Group D]:** Practical scheme with dummy subsets. Achieves standard correctness. Has λ factor in storage.
- **SinglePass [Group D]:** Two-server scheme with single-pass streaming preprocessing using Fisher-Yates shuffle. Different model (2-server).
- **IshaiShiWichs [Group D]:** Information-theoretic PIR constructions and lower bounds. Communication barrier [ISW24] is extended by this paper's Appendix B.2.

### Uncertainties

- The paper uses n for database size (number of entries) throughout; no notation collision with ring dimension (no lattice/FHE primitives are used).
- The paper does not give a branded scheme name. "WangRen" is a community-assigned name from the authors' surnames.
- The constant factors hidden in the O(nw) upper bound are not analyzed explicitly; practical competitiveness depends on these constants and the concrete PRP evaluation cost.
- Theorem B.1 requires error probability at most 1/15, which is a specific constant from Yeo's proof technique. The authors do not discuss whether this can be relaxed.
