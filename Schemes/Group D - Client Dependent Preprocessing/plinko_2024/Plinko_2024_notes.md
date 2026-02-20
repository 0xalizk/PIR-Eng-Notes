## Plinko — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | Plinko: Single-Server PIR with Efficient Updates via Invertible PRFs (Alexander Hoover, Sarvar Patel, Giuseppe Persiano, Kevin Yeo, 2024) |
| **Archetype** | Construction (theory-only) + Building-block (invertible PRFs) + Update/maintenance |
| **PIR Category** | Group D — Client-Dependent Preprocessing |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | Existence of one-way functions (OWF) only — no public-key cryptography required |
| **Correctness model** | Probabilistic (failure prob <= negl(λ)); inherited from base schemes [RMS24, Piano] |
| **Rounds (online)** | 2 (client sends query, server responds) |
| **Record-size regime** | Single-bit retrieval (extends to B-bit entries) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Piano [ZPZS24, Group D], RMS24 [Group D]; the core iPRF construction uses PRP [LR88] + a novel pseudorandom multinomial sampler (PMNS) |
| **What changed** | Prior OO-PIR schemes (Piano, RMS24) use standard PRFs to represent hint sets, requiring the client to perform a linear Õ(r) pass over all stored hints to find one containing the queried index. Plinko replaces PRFs with invertible PRFs (iPRFs), enabling Õ(1) hint searching and Õ(1) worst-case database updates. |
| **Superseded by** | N/A |
| **Concurrent work** | LP24 (Lazzaretti-Papamanthou, USENIX Security 2024) and FLLP24/ThorPIR (Fisch et al.) independently achieve efficient updates, but use 2-server or public-key operations respectively[^1] |

<a id="fn-1"></a>
[^1]: Section 1 (p.5): "We note that independent, concurrent work [LP24, FLLP24] additionally achieves efficient updates, but uses different techniques from us. Their work either uses 2 servers [LP24] or public-key operations [FLLP24]."

### Core Idea

Prior single-server PIR schemes with client preprocessing (Piano, RMS24) achieve sub-linear query time t = Õ(r + n/r) where r is client storage, but always require Õ(r) client time to search for a relevant hint among the client's r stored hints.[^2] This means the total query time is Õ(r + n/r), which is only optimal when r = O(sqrt(n)). Plinko introduces a novel cryptographic primitive called an invertible pseudorandom function (iPRF) that allows the client to efficiently invert the PRF used for hint generation, finding all hints containing a given index x in Õ(1) time.[^3] This reduces total query time to Õ(n/r) for any choice of client storage r, matching the known lower bound r * t = Omega(n) up to polylogarithmic factors for all parameterizations.[^4] As a direct consequence, the iPRF inversion also enables worst-case Õ(1) database updates, since the client can immediately identify all hints affected by a changed entry.[^5]

<a id="fn-2"></a>
[^2]: Section 2, "Hint Searching" (p.7): "Unfortunately one drawback of the above scheme is elided in the brief description that the client will 'find a hint set containing x,' which itself will depend on the set representation."

<a id="fn-3"></a>
[^3]: Section 2, "Invertible PRFs" (p.7): "The primary tool we use to build efficient hint searching is a new primitive we call an invertible PRF (iPRF)... iPRFs also have an efficient inversion algorithm iF.F^{-1}(k, .), which returns the pre-image of the given input."

<a id="fn-4"></a>
[^4]: Abstract (p.1): "Our scheme uses t = Õ(n/r) query time for any client storage size r. This matches known lower bounds of r * t = Omega(n) up to logarithmic factors for all parameterizations."

<a id="fn-5"></a>
[^5]: Abstract (p.1): "Plinko is also the first updateable PIR scheme where an entry can be updated in worst-case Õ(1) time."

### Novel Primitives / Abstractions

#### Invertible Pseudorandom Function (iPRF)

| Field | Detail |
|-------|--------|
| **Name** | Invertible Pseudorandom Function (iPRF) |
| **Type** | Cryptographic primitive |
| **Interface / Operations** | (Gen, F, F^{-1}): Gen : {0,1}^* -> K (key generation); F : K x D -> R (forward evaluation, deterministic); F^{-1} : K x R -> 2^D (inversion, deterministic, returns set of all pre-images)[^6] |
| **Security definition** | iPRF security (Definition 4.1): an adversary with oracle access to both F_k(.) and F_k^{-1}(.) cannot distinguish the pair from (R(.), R^{-1}(.)) where R is a truly random function with its true inverse. Strictly stronger than standard PRF security.[^7] |
| **Correctness definition** | For all y in R: Pr[F_k^{-1}(y) != {x in D : F_k(x) = y}] <= negl(λ)[^8] |
| **Purpose** | Enable Õ(1) hint searching and Õ(1) worst-case database updates in OO-PIR schemes |
| **Built from** | PRP (pseudorandom permutation) + PMNS (pseudorandom multinomial sampler); both built from OWF[^9] |
| **Standalone complexity** | Gen: Õ(1); Forward evaluation F: Õ(1) time; Inversion F^{-1}: O(|pre-image|) time (linear in output size), with O(log m) calls to F and the PRP[^10] |
| **Relationship to prior primitives** | Not equivalent to truncated PRPs (which have distinguishable pre-image size distributions). Not the same as the "invertible PRF" of Boneh-Kim-Wu [BKW17], which considers only injective random functions. iPRFs handle arbitrary (non-injective) mappings with varying pre-image sizes.[^11] |

<a id="fn-6"></a>
[^6]: Definition 4.1 (p.10): "An invertible pseudorandom function (iPRF) from domain D to range R with keyspace K is a triple of efficiently computable functions: a randomized key generation function Gen, a deterministic function F : K x D -> R, and a deterministic function F^{-1} : K x R -> 2^D."

<a id="fn-7"></a>
[^7]: Definition 4.1 (p.10): The adversarial advantage Adv^{iprf}_{iF}(λ, A) is defined as the absolute difference between Pr[A^{F_k(.), F_k^{-1}(.)}(1^λ) = 1] and Pr[A^{R(.), R^{-1}(.)}(1^λ) = 1]. "We also observe that this definition is strictly stronger than the PRF security definition."

<a id="fn-8"></a>
[^8]: Definition 4.1 (p.10): Correctness requires Pr[F_k^{-1}(y) != {x in D : F_k(x) = y}] <= negl(λ) for all y in R.

<a id="fn-9"></a>
[^9]: Theorem 4.4 (p.12): "Let P be a secure PRP over [n] and (Gen, S, S^{-1}) be a secure PMNS from [n] to [m]. Then, there exists a secure iPRF iF, defined as follows: iF.Gen(1^λ) = (P.Gen(1^λ), S.Gen(1^λ)); iF.F((k1,k2),x) = S(k2, P(k1,x)); iF.F^{-1}((k1,k2),y) = {P^{-1}(k1,x) : x in S^{-1}(k2,y)}."

<a id="fn-10"></a>
[^10]: Theorem 4.7 (p.16-17): "S is efficient and only requires O(log m) time and log m calls to the F, when evaluated in the forward or reverse direction."

<a id="fn-11"></a>
[^11]: Section 1 (p.3-4): "Tight bounds for distinguishing a truncated PRP from a random function are well known... For most domain and range sizes (including settings for our PIR applications), an adversary will successfully distinguish between a truncated PRP and PRF." Also: "[BKW17] where only injective random functions were considered (that is also not appropriate for our PIR application)."

#### Pseudorandom Multinomial Sampler (PMNS)

| Field | Detail |
|-------|--------|
| **Name** | Pseudorandom Multinomial Sampler (PMNS) |
| **Type** | Cryptographic primitive (intermediate building block for iPRF) |
| **Interface / Operations** | (Gen, S, S^{-1}): Gen : {0,1}^* -> K (encoding generation); S : K x [n] -> [m] (forward: which bin does ball x land in?); S^{-1} : K x [m] -> 2^{[n]} (inverse: which balls landed in bin y?)[^12] |
| **Security definition** | PMNS security (Definition 4.3): the inverse oracle S^{-1}(k,.) is computationally indistinguishable from the inverse of a true multinomial distribution MN(n,m), which models throwing n balls into m bins uniformly at random[^13] |
| **Correctness definition** | For all y in [m]: Pr[S^{-1}(k,y) != {x in [n] : S(k,x) = y}] <= negl(λ) |
| **Purpose** | Provides a PRF-like function whose pre-image distribution matches that of a random function (multinomial distribution), unlike truncated PRPs which have uniform pre-image sizes |
| **Built from** | A binary tree of pseudorandom binomial samples seeded by a PRF F(k, node). At each tree node, Binomial(count, p; F(k, node)) decides how many balls go left vs. right. The tree has depth ceil(log m).[^14] |
| **Standalone complexity** | Forward and inverse evaluation: O(log m) time, O(log m) calls to the seeding function F[^15] |

<a id="fn-12"></a>
[^12]: Definition 4.2 (p.11): "A multinomial sampler (MNS) for MN(n,m) with encoding space K is a triple of efficiently computable functions."

<a id="fn-13"></a>
[^13]: Definition 4.3 (p.11): "A multinomial sampler MN(n,m) = (Gen, S, S^{-1}) is a pseudorandom multinomial sampler (PMNS) if, for all efficient A, Adv^{pmns}_{S}(λ, A) <= negl(λ)."

<a id="fn-14"></a>
[^14]: Figure 4 (p.16): The pseudocode shows S and S^{-1} using a `children(k, node)` subroutine that samples Binomial(count, p; F(k, node)) to split balls between left and right subtrees.

<a id="fn-15"></a>
[^15]: Theorem 4.7 (p.16-17): "S is efficient and only requires O(log m) time and log m calls to the F."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Existence of one-way functions (OWF) — the minimal assumption for computational PIR with preprocessing[^16] |
| **Primitives used** | PRF (from OWF via GGM [GGM84]); PRP (from PRF via Luby-Rackoff [LR88]); small-domain PRP (e.g., Sometimes-Recurse Shuffle [MR14] for O(log n) calls to underlying PRF)[^17]; PMNS (from PRF, this paper) |
| **Key structure** | Per-client: master PRF key msk generates n/r per-block iPRF keys K[alpha] = PRF(msk, alpha). Each iPRF key itself is a pair (k1, k2) = (PRP key, PMNS encoding). |
| **Correctness condition** | Pr[fail] <= negl(λ); correctness is inherited from RMS24/Piano since iPRFs are computationally indistinguishable from random functions[^18] |

<a id="fn-16"></a>
[^16]: Section 1, "New Single-Server PIR with Optimal Trade-off Curve" (p.4): "Even more interesting is that we achieve this trade-off without the use of public-key cryptography, because Plinko only requires the existence of one-way functions."

<a id="fn-17"></a>
[^17]: Theorem 4.4 (p.12): The iPRF construction uses a small-domain PRP; the proof paragraph following Theorem 4.4 references [MR14] "Sometimes-Recurse Shuffle" which provides O(log n) calls to the underlying PRF.

<a id="fn-18"></a>
[^18]: Section 5.2, "Correctness" (p.23): "As iPRFs are also indistinguishable from random functions, we note that our hint distribution is identical to [RMS24]. As a result, we can directly use the correctness arguments from [RMS24]."

### Key Data Structures

- **Database:** n entries of B bits each, partitioned into c = n/w blocks of w consecutive entries each, where w is the block size parameter. Index i is decomposed as i = alpha * w + beta, where alpha is the block index and beta is the intra-block offset.[^19]
- **Regular hint table H:** λ * w entries stored in H[0], ..., H[λ*w - 1]. Each entry H[j] = (P_j, p_j) consists of a partition P_j (subset of c/2 + 1 blocks) and a parity p_j (XOR of selected entries).[^20]
- **Backup hint table T:** q entries stored in T[λ*w], ..., T[λ*w + q - 1]. Each entry T[j] = (B_j, ell_j, r_j) consists of a block subset B_j of size c/2, plus two parities ell_j and r_j (XOR of entries at iPRF-chosen offsets within B_j and its complement).[^21]
- **Cache Q:** Hash table storing results of previously queried indices, to handle repeated queries.[^22]
- **iPRF keys K[alpha]:** One iPRF key per block (alpha in [c]), derived from a master key via PRF. Maps hint indices to intra-block offsets. Forward: iF.F(K[alpha], j) gives the offset for hint j in block alpha. Inverse: iF.F^{-1}(K[alpha], beta) returns all hint indices that chose offset beta in block alpha.[^23]

<a id="fn-19"></a>
[^19]: Section 5.2 (p.21): "The set [n] of the indices of the database is partitioned into c := n/w blocks of w consecutive indices."

<a id="fn-20"></a>
[^20]: Section 5.2 (p.21): "The regular hint table H is initialized with λ*w regular hints that are stored in slots 0, ..., λ*w - 1."

<a id="fn-21"></a>
[^21]: Section 5.2 (p.21): "The backup table T is initialized with q backup hints that are stored in slots λ*w, ..., λ*w + q - 1."

<a id="fn-22"></a>
[^22]: Section 5.2 (p.22): "We store the result of each query in a hash table Cache and, in case of repeated queries, we return the value found in Cache."

<a id="fn-23"></a>
[^23]: Section 5.2 (p.21): "For each block alpha in P_j, we select entry i = alpha*w + iF.F(k_alpha, j), where k_alpha is the seed for block alpha."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **HintInit (offline)** | Client | Stream database; for each entry, compute block/offset, invert iPRF to find relevant hints, XOR entry into hint parities. Build H and T tables. | O(n) download (streaming) | Once per preprocessing window (q queries) |
| **Query** | Client | (1) Find hint H[j] containing index x via iPRF inversion: compute iF.F^{-1}(K[alpha], beta) to get candidate hints. (2) Construct two sets S and S-hat from the hint's partition. (3) Randomly choose offsets for blocks outside the partition. (4) Send query (P', offsets) to server. | Õ(n/r) upload (n/w offsets) | Per query |
| **Answer** | Server | For each of n/w blocks, compute parity of entries at the given offsets. Return two parities (one for each set). | Õ(n/r) download (2 parities of B bits) | Per query |
| **Recon** | Client | XOR server parities with stored hint parity to recover D[x]. Promote a backup hint from T to H to replace the consumed hint. Update state. | -- | Per query |
| **UpdateDB** | Server | Set D[i] <- d. Compute delta = (i, D[i] XOR d). Send (x, u XOR u') to client. | O(log n) bits | Per DB mutation |
| **UpdateHint** | Client | Invert iPRF at the updated index to find all Õ(1) hints containing x. XOR the update delta into each affected hint's parity. Also update Cache and hints under construction. | -- | Per DB mutation |

### Correctness Analysis

#### Option B: Probabilistic Correctness Analysis

| Field | Detail |
|-------|--------|
| **Failure mode** | A queried index x is not covered by any unused hint in H (all hints containing x have been consumed or none exist) |
| **Failure probability** | Pr[fail] <= negl(λ); each hint independently includes x with probability O(1/w), and there are λ*w + q = Õ(r) hints total[^24] |
| **Probability grows over queries?** | Yes -- hints are consumed per query; bounded by q queries per offline phase |
| **Probability grows over DB mutations?** | No -- updates modify hint parities in place without changing the hint structure |
| **Key parameters affecting correctness** | λ (security parameter), w (block size), q (backup count), r (client storage) |
| **Proof technique** | Chernoff bound on the number of hints containing any given entry. Expected number of hints containing x is Õ(r/w) = Õ(1). By Chernoff, at most Õ(1) hints contain x except with probability 2^{-λ - log n}. Union bound over all n entries gives negligible failure probability.[^25] |
| **Amplification** | Not needed; failure is already negligible |
| **Adaptive vs non-adaptive** | Correctness holds for adaptive queries (up to Q queries per window) |
| **Query model restrictions** | At most q queries per offline phase; repeated queries served from Cache |

<a id="fn-24"></a>
[^24]: Section 5.2, "Efficiency" (p.23): "As there are λ*w + q = Õ(r) hints, we know the expected number of hints containing the x-th entry is Õ(r/w) = Õ(1)."

<a id="fn-25"></a>
[^25]: Section 5.2, "Efficiency" (p.23): "By Chernoff's bound, we know that the x-th entry will not appear in more than max{O(λ + log n), Õ(r/w)} except with probability 2^{-λ - log n}."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query upload (communication) | Õ(n/r) bits[^26] | N/A (no implementation) | Online |
| Response (communication) | Õ(n/r) bits | N/A (no implementation) | Online |
| Server computation | Õ(n/r)[^27] | N/A (no implementation) | Online |
| Client computation (query) | Õ(n/r)[^28] | N/A (no implementation) | Online |
| Total query time (client + server) | Õ(n/r)[^29] | N/A (no implementation) | Online |

<a id="fn-26"></a>
[^26]: Theorem 5.3 (p.20): "Each online query uses Õ(n/r) bits of communication."

<a id="fn-27"></a>
[^27]: Theorem 5.3 (p.20): Each online query runs in Õ(n/r) time (paraphrase; the theorem does not explicitly break down the computation as "n/r parities per block").

<a id="fn-28"></a>
[^28]: Section 5.2, "Efficiency" (p.23): "As the first step, the client searches for a hint containing the query index x using our iPRF construction... the client's query time becomes Õ(n/r) with the main cost coming from enumerating the n/r offsets."

<a id="fn-29"></a>
[^29]: Theorem 5.3 (p.20): "Each online query runs in Õ(n/r) time."

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Client hint storage | Õ(r) bits[^30] | N/A (no implementation) | Persistent |
| Offline phase time | Õ(n)[^31] | N/A (no implementation) | Per window of q queries |
| Offline communication | O(n) bits (streaming download)[^32] | N/A (no implementation) | Per window of q queries |
| Amortization window | q queries (parameterizable; think of q = Õ(r))[^33] | N/A (no implementation) | -- |

<a id="fn-30"></a>
[^30]: Theorem 5.3 (p.20): "The client uses Õ(r) memory."

<a id="fn-31"></a>
[^31]: Theorem 5.3 (p.20): "The offline phase runs in Õ(n) time and uses O(n) communication."

<a id="fn-32"></a>
[^32]: Section 5.1 (p.19): "Our definition stresses the offline model of two prior works [ZPZS24, RMS24], which gives the client a single streaming pass over the database."

<a id="fn-33"></a>
[^33]: Section 5.2 (p.22): "The above only enables querying at most q times."

#### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass over DB) |
| **Client peak memory** | Õ(r) |
| **Number of DB passes** | 1 |
| **Hint refresh mechanism** | Pipelining: client streams n/q entries per query to build a replacement hint set in the background. After q queries the new set is ready.[^34] |

<a id="fn-34"></a>
[^34]: Section 5.2 (p.22): "More recent works [ZPZS24, RMS24] propose amortizing the offline phase by streaming n/q = Õ(n/r) database entries following each query... this does not increase query time or communication as each query already uses Õ(n/r) communication and time."

#### Update metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Cost per DB update (worst-case) | Õ(1) client time (polylog(n)) | Via single iPRF inversion to find all affected hints[^35] |
| Cost per DB update (amortized) | Õ(1) | Same as worst-case -- no amortization needed |
| Communication per update | O(log n) bits | Server sends (index, old XOR new) to client[^36] |
| Aggregation threshold | None -- each update is processed individually | |
| Deletion semantics | Weak (overwrite with zero or canonical value)[^37] | |
| Supported mutation types | Modify (update entry value). Insert/delete via cuckoo hashing reduction to keyword-PIR or via zeroed-entry approach.[^38] | |

<a id="fn-35"></a>
[^35]: Section 5.2, "Update Algorithm" (p.22): "The client can perform an iPRF inversion, like when querying x, to enumerate hints which have x in them and update the corresponding parities."

<a id="fn-36"></a>
[^36]: Section 5.2, "Update Algorithm" (p.22): "To update an x-th entry of the database from u to u', the server just needs to send (x, u XOR u') to the client."

<a id="fn-37"></a>
[^37]: Section 5.2, "Additions and Deletions" (p.9): "To delete, we can overwrite elements with random information or a canonical 'deleted' value."

<a id="fn-38"></a>
[^38]: Section 5.2, "Additions and Deletions" (p.9): "One can also consider the more general keyword-PIR (key-value) where it makes sense to add/delete new entries. A standard cuckoo-hashing technique (see [ZPZS24, ALP+21]) can reduce keyword-PIR to standard PIR."

### Mutation Model

| Aspect | Detail |
|--------|--------|
| **Update types supported** | Modify (primary). Insert/Delete via reduction to keyword-PIR or zeroed-entry approach. |
| **Who initiates updates** | Server unilaterally: server modifies DB[i] and sends delta to client |
| **Consistency model** | Immediate -- client updates affected hints upon receiving delta |
| **Impact on hints** | Each update affects Õ(1) hints in expectation and with high probability. Client identifies affected hints via iPRF inversion at the updated index.[^39] |
| **Re-preprocessing trigger** | After q queries (hint exhaustion), not triggered by updates |

<a id="fn-39"></a>
[^39]: Section 2, "Efficient Database Updates" (p.8): "Our efficient hint searching algorithm has the benefit of not only giving one candidate hint but all hints that contain the specified index. So, when a client is told to perform an update, they can just do a single call to the iPRF in use, find the hints containing the index, and then update those parities immediately."

### Variants

| Variant | Key Difference | Base Scheme | Client Query Time | Update (worst-case) |
|---------|---------------|-------------|-------------------|---------------------|
| **Plinko (RMS24-based)** | Primary construction; modifies RMS24 by replacing PRFs with iPRFs | RMS24 | Õ(n/r) | Õ(1) |
| **Plinko-Piano** | Alternative construction applying iPRFs to Piano [ZPZS24] instead of RMS24 | Piano [ZPZS24] | Õ(n/r) | Õ(1) |

The Plinko-Piano variant (Appendix B) uses Piano's set structure (sets of size n/w with one element per block) but replaces PRF evaluations with iPRF evaluations. The main idea is the same: iPRF inversion enables fast hint searching and efficient updates.[^40]

<a id="fn-40"></a>
[^40]: Appendix B (p.30): "In this section, we show how we can use invertible PRFs (iPRFs) to improve the client-side computation for queries and updates in Piano [ZPZS24]."

### Lower Bounds

| Field | Detail |
|-------|--------|
| **Bound type** | Space-time tradeoff for PIR with client preprocessing |
| **Bound statement** | r * t = Omega(n), where r is client storage and t is online query time[^41] |
| **Variables** | n = database size (bits), r = client hint storage (bits), t = total online query time |
| **Model assumptions** | Single-server PIR with client preprocessing; adaptive adversary |
| **Proof technique** | Established in [CK20, CHK22, Yeo23] |
| **Tightness** | Plinko matches this bound: achieves t = Õ(n/r) for any r, giving r * t = Õ(n). Tight up to polylogarithmic factors for ALL parameterizations.[^42] |
| **Matching upper bound** | Plinko (this paper) -- first scheme to match for all r, not just r = O(sqrt(n)) |

<a id="fn-41"></a>
[^41]: Section 1 (p.4): Recent lower bounds show that any PIR with preprocessing scheme with client storage r and query time t must obey r * t = Omega(n) [CK20, CHK22, Yeo23] (paraphrase; exact phrasing varies slightly).

<a id="fn-42"></a>
[^42]: Section 1 (p.4): "Plinko obtains optimal query time t = Õ(n/r) for any choice of client storage size r."

### Performance Benchmarks

No implementation. Analytical estimates from Figure 1 (p.3) and Figure 6 (p.30), setting r = sqrt(n):

| Scheme | Crypto Assumption | Client Storage | Query Time | Query Comm. | Update Time (worst-case) | Update Time (amortized) | Update Comm. (worst-case) | Update Comm. (amortized) |
|--------|-------------------|---------------|-----------|-------------|-------------------------|------------------------|--------------------------|--------------------------|
| CHK [CHK22] | LWE | r | r + n/r | n/r | sqrt(n) | sqrt(n) | log n | log n |
| ZLTS [ZLTS23] | LWE | r | r + n/r | polylog(n) | sqrt(n) | sqrt(n) | log n | log n |
| Piano [ZPZS24] | OWF | r | r + n/r | n/r | n | polylog(n) | log n | log n |
| RMS [RMS24] | OWF | r | r + n/r | n/r | sqrt(n) | sqrt(n) | log n | log n |
| GZS [GZS24] | OWF | r | r + n/r | sqrt(n/r) | sqrt(n) | sqrt(n) | log n | log n |
| **Plinko** | **OWF** | **r** | **n/r** | **n/r** | **polylog(n)** | **polylog(n)** | **log n** | **log n** |

All entries hide polylog factors. The key advantage of Plinko is visible in the Query Time column (n/r instead of r + n/r) and the Update Time columns (polylog(n) worst-case instead of sqrt(n) or n).[^43]

<a id="fn-43"></a>
[^43]: Figure 1 (p.3): Comparison table of amortized query time and query communication for existing single-server offline/online PIR schemes, with client storage r = sqrt(n).

### Composability

| Base Scheme | Integration Point | Improvement | Limitations |
|------------|-------------------|-------------|-------------|
| RMS24 [Group D] | Replace PRF with iPRF in hint generation and hint searching | Client query time reduced from Õ(r + n/r) to Õ(n/r); worst-case update reduced from Õ(sqrt(n)) to Õ(1) | Requires iPRF with small domain/range security (standard truncated PRPs insufficient)[^44] |
| Piano [ZPZS24, Group D] | Replace PRF with iPRF in hint generation and hint searching (Appendix B) | Client query time reduced from Õ(r + n/r) to Õ(n/r); worst-case update reduced from O(n) to Õ(1)[^45] | Same iPRF requirements |

<a id="fn-44"></a>
[^44]: Section 5.2 (p.23): "It is clear to see that our usage of iPRF requires security for both small domains and ranges as the number of hints is similar to the size of client storage meaning truncated PRPs cannot be used."

<a id="fn-45"></a>
[^45]: Appendix B (p.30-32): Plinko-Piano pseudocode and description showing how iPRFs improve Piano.

### Comparison with Prior Work

#### Query Time Tradeoff (at r = n^{2/3})

| Metric | Plinko | Piano [ZPZS24] | RMS24 | Lower Bound [Yeo23] |
|--------|--------|----------------|-------|---------------------|
| Client storage r | n^{2/3} | n^{2/3} | n^{2/3} | n^{2/3} |
| Server time | Õ(n^{1/3}) | Õ(n^{1/3}) | Õ(n^{1/3}) | -- |
| Client time | Õ(n^{1/3}) | Õ(n^{2/3}) | Õ(n^{2/3}) | -- |
| Total query time t | Õ(n^{1/3}) | Õ(n^{2/3}) | Õ(n^{2/3}) | Omega(n^{1/3}) |
| r * t | Õ(n) | Õ(n^{4/3}) | Õ(n^{4/3}) | Omega(n) |
| Crypto assumption | OWF | OWF | OWF | -- |

This example at r = n^{2/3} illustrates the gap that Plinko closes: prior work achieves total query time Õ(n^{2/3}) (dominated by the client's linear hint search), whereas the lower bound only requires Omega(n^{1/3}). Plinko matches the lower bound.[^46]

<a id="fn-46"></a>
[^46]: Section 1 (p.4): "For example, when r = O(n^{2/3}), prior works require query times of t = Õ(n^{2/3}) whereas the lower bound specifies query time only need be as large as Omega(n^{1/3})."

#### Update Cost Comparison

| Metric | Plinko | Piano [ZPZS24] | RMS24 | Bentley-Saxe approach |
|--------|--------|----------------|-------|-----------------------|
| Worst-case update time | polylog(n) | n | sqrt(n) | O(n) |
| Amortized update time | polylog(n) | polylog(n) | sqrt(n) | O(log n) |
| Worst-case update comm. | O(log n) | Bn | B * log n | O(n) |
| Amortized update comm. | O(log n) | B * log n | B * log n | O(log n) |

Plinko achieves logarithmic worst-case for both time and communication, matching what the Bentley-Saxe approach achieves only in the amortized case.[^47]

<a id="fn-47"></a>
[^47]: Figure 2 (p.3) and Figure 6 (p.30): Comprehensive comparison tables of update metrics.

**Key takeaway:** Plinko is the preferred scheme when (1) optimal space-time tradeoffs are needed for arbitrary client storage sizes (especially r >> sqrt(n)), and (2) worst-case Õ(1) database update efficiency is required. It achieves both properties using only one-way functions, at the cost of being theory-only with no implementation.

### Portable Optimizations

- **iPRF-based hint searching:** The technique of replacing PRFs with iPRFs for Õ(1) hint lookups is applicable to any OO-PIR scheme that uses PRF-compressed random sets (demonstrated on both RMS24 and Piano). Could potentially extend to other Group D schemes using similar hint structures.[^48]
- **PMNS construction:** The pseudorandom multinomial sampler is a standalone primitive with potential applications beyond PIR wherever one needs to efficiently simulate the pre-image distribution of a random function.[^49]

<a id="fn-48"></a>
[^48]: Section 2 (p.8): "We can apply iPRFs to two recently proposed schemes, Piano and RMS [ZPZS24, RMS24]."

<a id="fn-49"></a>
[^49]: Section 6 (p.24): "By introducing this notion, we leave open the possibility of finding other applications for iPRFs in cryptography for either efficiency or security improvements."

### Deployment Considerations

- **Database updates:** Worst-case Õ(1) per update -- a significant advantage for mutable databases. Server sends O(log n) bits per mutation; client updates in-place.
- **Sharding:** Not discussed, but the block-based structure (c = n/w blocks) is naturally amenable to sharding.
- **Key rotation / query limits:** q queries per offline window; client must re-stream the database after exhausting the hint set.
- **Anonymous query support:** No -- client-dependent preprocessing means each client has personalized hints that could link queries to the client.
- **Session model:** Persistent client with stateful hint storage.
- **Cold start suitability:** No -- requires O(n) offline streaming phase before first query.
- **Necessity of database streaming:** The offline phase necessarily requires linear communication if one insists on building single-server PIR with sub-linear query communication from OWF only, because sub-linear offline communication + sub-linear online communication implies oblivious transfer, which requires public-key operations.[^50]

<a id="fn-50"></a>
[^50]: Section 5.2, "Necessity of Database Streaming" (p.23-24): "If one constructs a single-server PIR with sub-linear offline phase communication and sub-linear query communication, it is easy to see that this can be used to build oblivious transfer (OT) following the reduction in [DMO00]. Given that OT requires public-key operations [IR89], the offline phase must use linear communication."

### Key Tradeoffs & Limitations

- **Theory-only:** No implementation or benchmarks; practical constants hidden in Õ notation are unknown. The PMNS construction involves log m recursive binomial samples, each requiring a PRF evaluation and a binomial sampling step.
- **Client-dependent preprocessing:** Each client must independently stream the entire database and compute personalized hints. Not suitable for anonymous access patterns.
- **Hint exhaustion:** After q queries, the client must re-execute the offline streaming phase. The pipelining approach (streaming n/q entries per query) amortizes this cost but adds implementation complexity.
- **iPRF overhead:** The iPRF construction composes a PRP with a PMNS, each requiring O(log m) PRF evaluations per forward/inverse call. For practical block sizes (w = sqrt(n)), this means O(log(sqrt(n))) = O(log n / 2) PRF calls per iPRF operation, which may be acceptable but introduces a logarithmic overhead over raw PRF evaluation.
- **Small-domain iPRF requirement:** The iPRF must be secure even for small domains and ranges (the number of hints per block is approximately λ * w, which may be comparable to or smaller than the block size w). Truncated PRPs are insufficient for this regime.[^51]

<a id="fn-51"></a>
[^51]: Section 5.2, "Invertible PRF Requirements" (p.23): "It is clear to see that our usage of iPRF requires security for both small domains and ranges as the number of hints is similar to the size of client storage meaning truncated PRPs cannot be used."

### Open Problems

- **iPRFs from other assumptions:** The current iPRF construction uses only OWF. Can iPRFs be built from assumptions that also provide puncturability? A puncturable iPRF would enable communication-efficient query protocols for PIR schemes that rely on puncturable PRFs.[^52]
- **Client online time:** Current lower bounds do not separately bound client query time vs. server query time. Some schemes (SACM21, LP23b, LP23a, ZLTS23) achieve nearly-constant online client time after a hint is found. Combining efficient hint finding (iPRFs) with these schemes could yield better asymptotic results.[^53]
- **Other iPRF applications:** The paper suggests iPRFs may have applications in cryptography beyond PIR, for efficiency or security improvements.[^54]

<a id="fn-52"></a>
[^52]: Section 6 (p.24): "For example, many PIR schemes improve their query communication using puncturable PRFs from a learning with errors assumption. A puncturable iPRF would lead to direct improvements for single-server PIR."

<a id="fn-53"></a>
[^53]: Section 6 (p.24): "It seems possible that one could construct the PIR scheme with nearly-constant online client query time."

<a id="fn-54"></a>
[^54]: Section 6 (p.24): "We leave open the possibility of finding other applications for iPRFs in cryptography for either efficiency or security improvements."

### Related Papers in Collection

- **Piano [ZPZS24, Group D]:** Direct predecessor. Plinko-Piano (Appendix B) applies iPRFs to Piano's construction.
- **RMS24 [Group D]:** Direct predecessor. The primary Plinko construction (Section 5.2) is built on top of RMS24.
- **CK20 [Group D]:** First single-server PIR with sub-linear query time from client preprocessing. Established lower bound r * t = Omega(n).
- **TreePIR [LP23b, Group D]:** 2-server scheme using weak privately puncturable PRFs. Different set representation, not directly composable with iPRFs.
- **WangRen [Group D]:** Theory-only scheme achieving tight ST = O(nw) space-time tradeoff via relocation. Different approach (deterministic correctness, permutation-based).
- **SinglePass [LP24, Group D]:** Concurrent work achieving efficient updates via 2-server model; different approach from iPRFs.

### Uncertainties

- **Notation for Õ:** The paper defines Õ to hide "multiplicative factors which are poly-logarithmic in the main variables" (p.9), treating λ as constant. This differs from the standard convention where Õ hides polylog factors in the argument. The paper explicitly notes this deviation.
- **Concrete query overhead:** The iPRF inversion involves O(log m) calls to the PMNS inverse, each of which involves O(log m) binomial samples seeded by a PRF. The total number of PRF calls per iPRF inversion is O(log^2 m) = O(log^2 n). The practical impact of this overhead is unknown without benchmarks.
- **Parameter w vs r:** Throughout the paper, w (block size) and r (client storage) are treated as free parameters. The paper notes "it may be helpful to think of w = q = Õ(r)" (p.21), but the exact relationship depends on the target tradeoff point.
