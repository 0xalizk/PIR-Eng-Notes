# IshaiShiWichs — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [PIR with Client-Side Preprocessing: Information-Theoretic Constructions and Lower Bounds](https://eprint.iacr.org/2024/976) (2025) |
| **Archetype** | Theory (information-theoretic constructions + lower bounds) |
| **PIR Category** | Group D — Client-dependent preprocessing |
| **Security model** | Information-theoretic (perfect privacy against semi-honest server) |
| **Additional assumptions** | None (information-theoretic; no computational assumptions) |
| **Correctness model** | Probabilistic (failure prob amplifiable to negl(n) via parallel repetition); adaptive correctness achieved for 1-server constructions |
| **Rounds (online)** | 1 (single round-trip) |
| **Record-size regime** | Parameterized (bit-string database x in {0,1}^n; each record is 1 bit) |

## Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Dvir-Gopi 2-server PIR [DG16] (for Theorem 3.1), Piano [ZPSZ24] / Mughees-Ren [MIR23] (PRF-based constructions used as template), Corrigan-Gibbs-Kogan [CK20] (puncturable pseudorandom set paradigm), Chor et al. [CGKS95] (classical 2-server IT-PIR), Beimel-Ishai-Malkin [BIM00] / Woodruff-Yekhanin [WY05] (prior IT preprocessing PIR) |
| **What changed** | Prior information-theoretic preprocessing PIR results were limited to the 2-server setting (BIM00, WY05) or the public-preprocessing model; this paper is the first to explore IT preprocessing PIR in the single-server client-specific model, proving both new upper bounds via cross-product set constructions and new lower bounds via mutual information amplification |
| **Superseded by** | N/A |
| **Concurrent work** | Ghoshal, Zhou, Shi [GZS24a] (efficient preprocessing PIR without public-key crypto); Mughees, Ren [MIR23] (simple and practical sublinear PIR) |

## Core Idea

This paper is the first to study information-theoretic single-server preprocessing PIR, making contributions on both upper and lower bounds. On the upper-bound side, it constructs IT preprocessing PIR schemes by (1) adapting the Dvir-Gopi 2-server PIR to a single-server setting with nearly optimal client space and bandwidth tradeoff (Theorem 3.1), and (2) building a novel single-server construction using cross-product sets over a 3-dimensional database representation with sublinear server computation (Theorem 4.4/A.3). On the lower-bound side, it proves that any IT preprocessing PIR scheme with both client space and per-query bandwidth o(sqrt(n)) implies the existence of one-way functions (Theorem 5.1), and that for database-oblivious schemes, breaking this tradeoff implies a hard problem in SZK (Theorem 1.2/Corollary 5.8). The lower bounds are proven via a new intermediate primitive called Mutual Information Amplification (MIA).

## Formal Definitions

### Preprocessing PIR (Section 2, p.8)

A k-server preprocessing PIR scheme consists of:
- **Preprocessing:** Executed once upfront. Each server holds DB in {0,1}^n. Client and server(s) run a protocol; each party may store local state afterward.[^1]
- **Query:** Repeatable. Client inputs index id in {0,...,n-1}. Stateful client and server(s) run a query protocol; client outputs the answer.[^1]

[^1]: Section 2 (p.8): Defines a k-server preprocessing PIR as a two-phase stateful protocol (preprocessing + query), where the total number of queries T(n) is polynomial in n.

### Privacy Definitions

**Perfect privacy:** A k-server preprocessing PIR scheme satisfies perfect privacy iff there exists a simulator Sim such that for any n, any DB in {0,1}^n, any sequence of queries, for any server j in [k], the real-world server view is identically distributed to Sim(n, DB, T(n), j).[^2]

[^2]: Section 2 (p.8): The simulator is not given the query sequence, capturing the intuition that any single server's view leaks nothing about queries.

### Correctness Definitions

**Non-adaptive correctness:** For any polynomial T(n), there exists negl(.) such that for any n, any DB, any sequence of T(n) queries chosen independently of the scheme's randomness, the client outputs correct answers for all queries with probability 1 - negl(n).[^3]

[^3]: Section 2 (p.9): Non-adaptive correctness assumes queries are chosen independently of the randomness consumed by the PIR scheme.

**Adaptive correctness:** For any adversary A that adaptively chooses queries based on the server's view so far, the client outputs correct answers for all queries with probability 1 - negl(n).[^4]

[^4]: Section 2 (p.9): Adaptive correctness is strictly stronger; the adversary can choose each query after seeing the server's state from prior queries.

### (n,t)-PIR (Definition 1, p.20)

A relaxed model used in lower-bound proofs. Allows arbitrary preprocessing (DB_tilde, hint) <- Prep(1^lambda, DB), a PIR protocol Pi between server (holding DB_tilde) and client (holding hint and t indices), and requires only computational security for the protocol transcript.[^5]

[^5]: Definition 1 (p.20-21): The (n,t)-PIR model relaxes standard preprocessing PIR in five ways: trusted preprocessing may produce an encoded database correlated with the hint; both parties may be arbitrarily stateful; queries are bounded by t; indices are chosen upfront; and security is only against outsiders seeing the protocol transcript.

### Database-oblivious (n,t)-PIR (Definition 3, p.25)

A database-oblivious scheme restricts Definition 1 so that: (1) the database is not encoded (DB_tilde = DB), and (2) each question from the client depends only on the client's randomness and the index sequence, not on the server's responses.[^6]

[^6]: Definition 3 (p.25): All known constructions (CK20, Piano, MIR23, etc.) are database-oblivious, making the SZK barrier widely applicable.

## Novel Primitives / Abstractions

### Mutual Information Amplification (MIA)

| Field | Detail |
|-------|--------|
| **Name** | Mutual Information Amplification (MIA) |
| **Type** | Cryptographic primitive (key agreement variant) |
| **Interface / Operations** | (KeyGen, Pi): KeyGen(1^lambda) -> (sk_A, sk_B); Pi(sk_A; sk_B) -> (k_A, k_B) where k_A = k_B with overwhelming probability |
| **Security definition** | Amplification: the shared key k is computationally indistinguishable from having Shannon entropy >= l conditioned on the protocol transcript, where l > m = I(sk_A; sk_B) (Definition 2, p.22) |
| **Correctness definition** | k_A = k_B with overwhelming probability |
| **Purpose** | Intermediate primitive for proving the OWF lower bound; PIR implies non-trivial MIA, and non-trivial MIA implies OWFs |
| **Built from** | Constructed from any (n,t)-PIR with good enough parameters (Theorem 5.2) |
| **Standalone complexity** | Inherits from the underlying PIR |
| **Relationship to prior primitives** | Novel primitive introduced in this paper; related to key agreement but with a shared-information starting point |

[^7]: Definition 2 (p.22): MIA is parameterized as (m, l)-MIA where m bounds the initial mutual information and l is the target Shannon entropy of the shared key conditioned on the transcript.

### Cross-Product Set Distribution D

| Field | Detail |
|-------|--------|
| **Name** | Cross-product set distribution D |
| **Type** | Set distribution |
| **Interface / Operations** | Sample S = X x Y x Z where X, Y, Z are random subsets of {0,...,m-1}, each element included independently with probability 1/n^{1/6}, where m = n^{1/3} |
| **Purpose** | Generates random subsets of {0,...,n-1} of expected size sqrt(n) with a succinct description of size O(n^{1/6}) (storing X, Y, Z separately) |
| **Built from** | Basic randomized sampling |
| **Standalone complexity** | Sampling: O(n^{1/3}); description: O(n^{1/6}); set size: E[|S|] = sqrt(n) |

[^8]: Section 4.1 (p.12-13): The set distribution D samples each dimension independently with probability 1/n^{1/6} over m = n^{1/3} elements, yielding expected set size sqrt(n) with description size 3*n^{1/6}.

### Vanilla Somewhere Statistical Binding (SSB) Hash

| Field | Detail |
|-------|--------|
| **Name** | Vanilla SSB hash function |
| **Type** | Cryptographic primitive |
| **Interface / Operations** | (Gen, Hash): Gen(1^lambda, j) -> hk; Hash(hk, x) -> y where |y| < |x| |
| **Security definition** | Weak local binding: a computationally unbounded decoder Dec can recover x_j from Hash(hk, x) with probability 1 - negl(lambda). Hiding: Gen(1^lambda, j) ~=_c Gen(1^lambda, j') (Definition 5, p.26) |
| **Purpose** | Intermediate primitive in the SZK barrier proof chain: single-record (n,t)-PIR implies vanilla SSB hash (Theorem 5.5), and vanilla SSB hash implies a hard SZK problem (Theorem 5.7) |
| **Built from** | Constructed from single-record (n,t)-PIR by replacing the hint with pairwise-independent hash of each database record |
| **Relationship to prior primitives** | Relaxation of SSB hash from [HW15, OPWW15]: does not require efficient local decommitment; binding is weakened to assume hk is chosen independently of x |

[^9]: Definition 5 (p.26): The vanilla SSB hash relaxes the standard SSB notion in two ways — no efficient local decommitment and the binding requirement assumes the hash key is chosen independently of the input.

## Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Information-theoretic (no computational assumptions for constructions); lower bounds prove that beating the IT tradeoff implies OWF/SZK |
| **Key structure** | Client's hint is a table of random cross-product sets with associated parities; no cryptographic keys |
| **Correctness condition** | Pr[correct per query] >= 0.1 for a single instance; amplified to 1 - negl(n) via omega(log n) parallel repetition |

[^10]: Section 4.2 (p.14): The base scheme achieves correctness probability >= 0.1 per query; amplification to 1 - negl(n) uses omega(log n) independent parallel instances sharing the same streaming pass.

## Key Data Structures

- **Database representation:** n-bit string x in {0,1}^n reshaped as a 3-dimensional m x m x m array where m = n^{1/3}, with DB[x,y,z] = DB[id] for id = (x,y,z) in base-m representation.[^11]
- **Cross-product sets:** Each hint entry is S = X x Y x Z where X, Y, Z are subsets of {0,...,m-1}, described in O(n^{1/6}) bits.[^8]
- **Hint table:** L = 20*sqrt(n) cross-product sets, each with 8 associated parity bits (full set parity plus 7 "planar set" parities obtained by removing one element from one dimension).[^12]
- **Planar sets:** For each hint S = X x Y x Z and each element x in X (resp. y in Y, z in Z), the "planar set" {x} x Y x Z (resp. X x {y} x Z, X x Y x {z}) of size n^{1/3} whose parity can be maintained during streaming.[^13]

[^11]: Section 4.1 (p.12-13): The database index id in {0,...,n-1} is expressed as a tuple (x,y,z) in {0,...,m-1}^3 using base-m representation.

[^12]: Section 4.2 (p.14): The client stores L = 20*sqrt(n) hints, each consisting of: (1) the set description (X, Y, Z), (2) parities of X x Y x Z and of all sub-cross-products formed by removing one element from one dimension.

[^13]: Section 4.2 (p.15): Planar sets have size n^{1/3}; each hint has n^{1/6} planar sets per dimension (3 dimensions), enabling cumulative parity updates during streaming.

## Database Encoding

- **Representation:** 3-dimensional m x m x m array (m = n^{1/3}) over bits
- **Record addressing:** Base-m decomposition of index id yields (x,y,z) coordinates
- **Preprocessing required:** None on the server side; server stores original database only

## Protocol Phases

### Construction 1: Nearly Optimal Client Space/Bandwidth Tradeoff (Theorem 3.1)

This construction adapts the Dvir-Gopi 2-server PIR [DG16] to a single-server preprocessing model. The server computation is slightly super-linear.

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Preprocessing | Client + Server | Client runs t instances of query_1(n) to get (msg_i, st_i) pairs; makes a streaming pass over DB to compute res_i = sum_j c_j * DB[j] for each hint | O(n) bandwidth | Once (streaming, single pass) |
| Query | Client | Grabs next unconsumed hint (msg, st, res); computes (msg', st') <- query_2(st, q) | O(k) upload where k = exp(sqrt(log n * log log n)) | Per query |
| Answer | Server | Computes ans_2(DB, msg') | O(k) download | Per query |
| Decode | Client | Outputs dec(st', res, res') | -- | Per query |

[^14]: Section 3.1 (p.10-11): The generic construction piggybacks the next phase's preprocessing over the current phase's queries, with each phase covering t queries. The hint table consists of {msg_i, st_i, res_i} for i in [t].

### Construction 2: Sublinear Server Computation (Theorems 4.3/4.4/A.3)

This is the paper's main novel construction using cross-product sets.

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Preprocessing | Client | Samples L = 20*sqrt(n) random cross-product sets S_i = X_i x Y_i x Z_i; streams DB to compute parities of each S_i and its planar sub-sets | O(n) bandwidth; O(n) client computation | Once (streaming, single pass) |
| Query (step 1) | Client | Finds a hint S containing query (x,y,z); computes S' <- Resample(S, (x,y,z)) | -- | Per query |
| Query (step 2) | Client | Sends succinct description of S' to server | O(n^{1/6}) upload | Per query |
| Answer | Server | Computes O(n^{1/3}) parities: parity of S', and parities of planar sets (X' union {x}) x Y' x Z' for each x, similarly for y, z | O(n^{1/3}) download; O(n^{2/3}) server computation | Per query |
| Decode | Client | Combines stored parities (p_111, p_011, p_101, p_110) with server parities (p_000, p_100, p_010, p_001) via XOR reconstruction: DB[x,y,z] = XOR_{i,j,k in {0,1}} p_{ijk} | -- | Per query |
| Hint refresh | Client | Replaces consumed hint with a new set S sampled from D conditioned on containing (x,y,z) | -- | Per query |

[^15]: Section 4.2 (p.14-15): The query protocol has the client send a resampled set S' (description size O(n^{1/6})) and the server computes O(n^{1/3}) parities. Reconstruction uses 8 parities p_{ijk} indexed by which of x, y, z are removed.

### Construction 3: 2-Server Variant (Theorem B.1)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Preprocessing | Client + Left server | Client generates hint table and sends to left server; left server computes all O(n^{1/6}) parities per hint in O(n^{1/2}) time | O(n^{2/3}) bandwidth | Once per window |
| Query | Client + Right server | Client sends resampled set S' to right server | O(n^{1/3}) online bandwidth | Per query |
| Answer | Right server | Computes parities as in single-server scheme | O(n^{2/3}) server computation | Per query |
| Decode | Client | Reconstruction as in single-server scheme | -- | Per query |

[^16]: Appendix B (p.38-39): In the 2-server variant, preprocessing is performed with the left server and queries with the right server, yielding O(n^{2/3}) preprocessing bandwidth and O(n^{1/3}) online bandwidth.

## Reconstruction Algorithm (Section 4.1)

Given a cross-product set S = X x Y x Z containing query point (x,y,z), the client needs 8 parities corresponding to all subsets formed by including or excluding x from X, y from Y, and z from Z:

- p_111 = parity(X x Y x Z)
- p_011 = parity((X\{x}) x Y x Z)
- p_101 = parity(X x (Y\{y}) x Z)
- p_110 = parity(X x Y x (Z\{z}))
- p_001 = parity((X\{x}) x (Y\{y}) x Z)
- p_010 = parity((X\{x}) x Y x (Z\{z}))
- p_100 = parity(X x (Y\{y}) x (Z\{z}))
- p_000 = parity((X\{x}) x (Y\{y}) x (Z\{z}))

Then DB[x,y,z] = XOR_{i,j,k in {0,1}} p_{ijk}. This works because every element except (x,y,z) appears an even number of times in the sum.[^17]

[^17]: Section 4.1 (p.13-14): The reconstruction identity DB[x,y,z] = XOR_{i,j,k} p_{ijk} holds because for any element (x',y',z') != (x,y,z), it appears in an even number of the 8 sub-cross-products, so its contribution cancels.

## Resample Operation (Section 4.1)

Given set S = X x Y x Z and point (x,y,z) in S, Resample(S, (x,y,z)) produces S' = X' x Y' x Z' by re-sampling each element's membership (independently with probability 1/n^{1/6}) while forcing x in X', y in Y', z in Z'. This preserves the distribution of S' as identical to a fresh sample from D, hiding which point was queried.[^18]

[^18]: Section 4.1 (p.13): The Resample operation re-randomizes the set while keeping the queried point, ensuring the query sent to the server is indistinguishable from a fresh random set.

## Correctness Analysis

### Option B: Probabilistic Correctness Analysis

| Field | Detail |
|-------|--------|
| **Failure mode** | (1) Resample fails to remove x from X, y from Y, or z from Z (probability <= 3/n^{1/6}); (2) no hint in the hint table contains the query point (x,y,z) |
| **Failure probability** | Per-instance: <= 0.9; amplified to negl(n) via omega(log n) parallel repetition |
| **Probability grows over queries?** | No (per-query independent, by the hint refresh mechanism) |
| **Key parameters affecting correctness** | Number of hints L = 20*sqrt(n); set size E[|S|] = sqrt(n); containment probability 1/sqrt(n) per set |
| **Proof technique** | Birthday-style analysis: Pr[no set contains query] = (1-1/sqrt(n))^{20*sqrt(n)} <= 1/e^{20} (Section 4.5); Markov inequality for bounding good-match probability; union bound over failure events |
| **Amplification** | omega(log n) independent parallel instances; client can detect which instance (if any) gives a correct answer by verifying against stored parities |
| **Adaptive vs non-adaptive** | Warmup (Theorem 4.3): non-adaptive only. Full scheme (Theorem 4.4/A.3): adaptive correctness via hint-specific permutations |
| **Query model restrictions** | Warmup: bounded to Q = sqrt(n)/10 random distinct queries per window. Full scheme (Appendix A): unbounded arbitrary queries via pipelining |

[^19]: Section 4.5 (p.17-19): The probability of failing to find a good match is at most 1/e^{20} + (1 - 1/e^{20}) * 0.5 <= 0.6 using the birthday bound on hint containment and Markov inequality on the number of good hints.

[^20]: Section 4.2 (p.14): The base correctness probability per instance is >= 0.1; running omega(log n) instances in parallel amplifies to 1 - negl(n).

### Adaptive Correctness Upgrade (Appendix A)

The paper introduces a novel technique using hint-specific permutations to achieve adaptive correctness. Each hint entry stores (S, pi) where pi is a special-purpose random permutation over {0,...,n-1}^3 defined by a random vector r in GF(2^k)^{3x3} (where k = log(n)/3). The permutation pi_r(v) = Rv is a GF(2^k)-linear map, which can be described in O(1) field elements (O(log n) bits).[^21]

[^21]: Appendix A.3 (p.35): The permutation pi_r maps (x_0, y_0, z_0) to (x, y, z) via an invertible 3x3 matrix R over GF(2^k), achieving the key property that for distinct v != v', the probability Pr_r[x = x'] <= 1/(n^{1/3}-1) for each coordinate.

The key property: for distinct points v, v', if (x,y,z) = pi_r(v) and (x',y',z') = pi_r(v'), then Pr_r[x = x'] <= 1/(n^{1/3}-1) and similarly for y, z coordinates (Claim A.1). This ensures that the correctness proof from Section 4.5 extends to arbitrary (not just random) queries, because the permutation effectively randomizes the (x,y,z) representation from the adversary's perspective.[^22]

[^22]: Proposition A.2 (p.35): The counterpart of Proposition 4.2 for arbitrary queries: for any fixed original coordinates, the probability that a distinct point lands in the same set is at most 4.1/sqrt(n).

## Complexity

### Construction 1: Nearly Optimal Tradeoff (Theorem 3.1)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (online bandwidth) | O(exp(sqrt(log n * log log n))) | N/A (no implementation) | Online |
| Response size (online bandwidth) | O(exp(sqrt(log n * log log n))) | N/A (no implementation) | Online |
| Server computation | O(n * exp(sqrt(log n * log log n))) | N/A (no implementation) | Online |
| Client computation | O(n * exp(sqrt(log n * log log n))) | N/A (no implementation) | Online |
| Offline bandwidth | O(n/t) | N/A (no implementation) | Per query (amortized over t queries) |
| Client space | O(t * exp(sqrt(log n * log log n))) | N/A (no implementation) | -- |

[^23]: Theorem 3.1 (p.11): Instantiating with Dvir-Gopi PIR yields k = exp(O(sqrt(log n * log log n))), giving n^{1/2+o(1)} client space and O(sqrt(n)) bandwidth per query when t = sqrt(n).

### Construction 2: Sublinear Server Computation (Theorem 4.4/A.3)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (online bandwidth) | O_tilde(n^{1/3}) | N/A (no implementation) | Online |
| Response size (online bandwidth) | O_tilde(n^{1/3}) | N/A (no implementation) | Online |
| Server computation | O_tilde(n^{2/3}) | N/A (no implementation) | Online |
| Client computation | O_tilde(n^{1/2}) | N/A (no implementation) | Online |
| Offline bandwidth | O_tilde(n^{1/2}) | N/A (no implementation) | Per query (amortized) |
| Client space | O_tilde(n^{2/3}) | N/A (no implementation) | -- |

[^24]: Theorem 4.4 / Theorem A.3 (p.20, p.37): The tilde-O notation hides a super-logarithmic factor alpha(n) from the omega(log n) parallel repetition used to boost correctness from 0.1 to 1 - negl(n).

### Construction 3: 2-Server Variant (Theorem B.1)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (online bandwidth) | O_tilde(n^{1/3}) | N/A (no implementation) | Online |
| Response size (online bandwidth) | O_tilde(n^{1/3}) | N/A (no implementation) | Online |
| Server computation | O_tilde(n^{2/3}) | N/A (no implementation) | Online |
| Client computation | O_tilde(n^{1/2}) | N/A (no implementation) | Online |
| Offline bandwidth | O_tilde(n^{1/6}) | N/A (no implementation) | Per query (amortized) |
| Client space | O_tilde(n^{2/3}) | N/A (no implementation) | -- |

[^25]: Theorem B.1 (p.39): The 2-server variant offloads preprocessing to the left server, reducing offline bandwidth from O_tilde(n^{1/2}) to O_tilde(n^{1/6}) per query while maintaining O_tilde(n^{1/3}) online bandwidth.

### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass) |
| **Client peak memory** | O(n^{2/3}) |
| **Number of DB passes** | 1 |
| **Hint refresh mechanism** | Pipelining (next window's preprocessing piggybacked on current window's queries) |

[^26]: Section 4.2 (p.15): The preprocessing algorithm proceeds in batches of n^{2/3} bits; at any time the client only stores the current batch plus O(n^{2/3}) set descriptions.

### Amortized Cost Per Query (Construction 2, single instance)

| Metric | Amortized over sqrt(n) queries |
|--------|-------------------------------|
| Bandwidth | O(n/sqrt(n)) + O(n^{1/3}) = O(sqrt(n)) |
| Client work | O(n/sqrt(n)) + O(sqrt(n)) = O(sqrt(n)) |
| Server work | O(n/sqrt(n)) + O(n^{2/3}) = O(n^{2/3}) |

[^27]: Section 4.3 (p.16): Amortizing the O(n) preprocessing cost over sqrt(n) queries yields O(sqrt(n)) amortized bandwidth and client work, and O(n^{2/3}) amortized server work per query.

## Lower Bounds

### Lower Bound 1: OWF Implication (Theorem 5.1 / Theorem 1.1)

| Field | Detail |
|-------|--------|
| **Bound type** | Computational barrier (space-bandwidth tradeoff implies OWF) |
| **Bound statement** | Any (n,t)-PIR with per-query communication complexity c and hint-size |hint| <= t(1 - ct/n) - 1 implies one-way functions. In particular, for t = sqrt(n), any IT (n,t)-PIR must have per-query communication or hint size >= sqrt(n)/2. |
| **Variables** | n = database size (bits); t = number of queries; c = per-query communication complexity C/t; |hint| = client space |
| **Model assumptions** | Extremely general: allows arbitrary preprocessing (server may store encoded DB), arbitrary dynamic state for both parties, unbounded polynomial computation per query, arbitrary round complexity. Lower bound is on the initial hint size only. |
| **Proof technique** | PIR => Mutual Information Amplification (Theorem 5.2) => MIA implies OWF via false entropy argument (Theorem 5.3, using [IL89, Lemma 4.5]) |
| **Tightness** | Tight up to n^{o(1)} factor: Theorem 3.1 achieves client space t * n^{o(1)} and bandwidth n^{o(1)} per query |
| **Matching upper bound** | Theorem 3.1 (Construction 1) matches with both client space and bandwidth n^{1/2+o(1)} |
| **Implications** | Preprocessing PIR with sublinear hint AND sublinear bandwidth => OWF; also rules out certain forms of truly information-theoretic ORAM |

[^28]: Theorem 5.1 (p.21): The lower bound holds even in the extremely relaxed (n,t)-PIR model where preprocessing can produce an arbitrary encoded database, and the scheme need only retrieve t consecutive database positions.

[^29]: Theorem 5.3 (p.24): Any (m, l)-MIA with l >= m + 1 implies OWFs, using the observation that the distribution (view, k_A) has noticeable false entropy and applying [IL89, Lemma 4.5].

#### Extensions of the OWF Lower Bound (Section 5.1.1)

The lower bound extends along several dimensions:
- **Hint size vs mutual information:** The condition |hint| is small can be replaced by the more general condition that the mutual information I((DB, DB_tilde); hint) is small.[^30]
- **Index-dependent preprocessing:** The result holds even if preprocessing (DB_tilde, hint) <- Prep(1^lambda, DB, (i_1,...,i_t)) depends on the query indices.[^30]
- **Retrieving a single chunk:** The bound applies even to schemes that only retrieve t consecutive locations.[^31]
- **Download vs communication:** The bound can be stated in terms of download complexity d alone: |hint|(1 - t/n) <= t(1 - dt/n) - 1.[^31]

[^30]: Section 5.1.1 (p.24): The generalization to mutual information shows the lower bound applies to schemes where the hint contains a large random component plus a small database-dependent component.

[^31]: Section 5.1.1 (p.25): When stated in terms of download complexity d, for t = sqrt(n), either download or hint must be Omega(sqrt(n)) in any IT scheme.

### Lower Bound 2: SZK Barrier (Theorem 1.2 / Corollary 5.8)

| Field | Detail |
|-------|--------|
| **Bound type** | Complexity-theoretic barrier |
| **Bound statement** | Any (1-roundtrip) database-oblivious preprocessing PIR scheme with client space < t/3 and t queries consuming total bandwidth < n/3 implies an average-case hard promise problem in SZK. In particular, it implies a separation of (promise) SZK from BPP. |
| **Variables** | t = omega(log lambda) number of queries; n = database size; client space and total bandwidth are the space/communication measures |
| **Model assumptions** | Database-oblivious: client's questions depend only on its randomness and the index sequence (not on server's responses). All known constructions satisfy this. |
| **Proof technique** | Three-step chain: (1) database-oblivious (n,t)-PIR => single-record (n,t)-PIR (Claim 5.4); (2) single-record (n,t)-PIR => vanilla SSB hash (Theorem 5.5); (3) vanilla SSB hash => hard problem in SZK (Theorem 5.7 via Conditional Entropy Approximation [Vad06]) |
| **Tightness** | Shows Piano [ZPSZ24] and subsequent improvements [MIR23, GZS24a] have (nearly) optimal client space/bandwidth tradeoff in Minicrypt |
| **Matching upper bound** | Theorem 3.1 and Piano (OWF-based) match the lower bound up to super-logarithmic factors |
| **Implications** | OWFs or even stronger "unstructured" symmetric primitives are unlikely to significantly improve the tradeoff. A ROM construction breaking O(sqrt(n)) client space and bandwidth would separate (promise) SZK from BPP relative to a random oracle — settling a natural open problem in complexity theory. |

[^32]: Corollary 5.8 (p.28): The SZK barrier combines Claim 5.4 (database-oblivious PIR => single-record PIR), Theorem 5.5 (single-record PIR => vanilla SSB hash), and Theorem 5.7 (vanilla SSB hash => hard SZK problem).

[^33]: Theorem 1.2 (p.4): The SZK barrier shows that the client-space and bandwidth tradeoff of Piano is optimal up to a super-logarithmic factor for schemes in Minicrypt.

[^34]: Section 5.2 (p.28): The proofs fully relativize: if the database-oblivious PIR has access to an oracle O, then it implies an SSB hash with access to O, which separates CEA^O (in SZK^O) from BPP^O. This gives a barrier even for random oracle constructions.

## Comparison with Prior Work

### Information-Theoretic Preprocessing PIR Schemes (from Table 1, p.3)

| Scheme | Compute | Communication | Client Space | Server Space | # Servers |
|--------|---------|---------------|-------------|-------------|-----------|
| BIM00 | O(n / log^2 n) | O(n^{1/3}) | 0 | O(n^2) | 2 |
| WY05 | O(n / poly log n) | O(n^{1/3}) | 0 | poly(n) | 2 |
| BIM00 (single-server) | O(n^{1/2+epsilon}) | O(n^{1/2+epsilon}) | 0 | O(n^{1+epsilon'}) | 2 |
| CK20 lower bound | Omega(n/t) | any | O(t) | 0 | 1 |
| **Theorem 3.1 (this paper)** | n^{1+o(1)} | n^{o(1)} online + O(n^{1/2}) offline | n^{1/2+o(1)} | 0 | **1** |
| **Theorem A.3 (this paper)** | O_tilde(n^{2/3}) server, O_tilde(n^{1/2}) client | O(n^{1/3}) online + O(n^{1/2}) offline | O_tilde(n^{2/3}) | 0 | **1** |
| **Theorem B.1 (this paper)** | O_tilde(n^{2/3}) server, O_tilde(n^{1/2}) client | O(n^{1/3}) online | O_tilde(n^{2/3}) | 0 | **2** |
| **Lower bound (this paper)** | any | Omega(n/t) | O(t) | any | 1 |

[^35]: Table 1 (p.3): Comparison of information-theoretic preprocessing PIR schemes. The paper's constructions are the first single-server IT preprocessing PIR schemes in the client-specific model. Prior 2-server schemes (BIM00, WY05) use public preprocessing with polynomial server space.

**Key takeaway:** This paper establishes the first information-theoretic single-server preprocessing PIR, achieving nearly optimal client-space and bandwidth tradeoff (tight to within n^{o(1)} factors per the lower bound). The constructions are purely theoretical with no implementation, but demonstrate that the OWF assumption in Piano is unnecessary for achieving the same asymptotic guarantees. The lower bounds show that significantly improving the sqrt(n) tradeoff requires "cryptomania" assumptions (beyond OWFs and even SZK-hard problems).

## Explicit Adaptive Correctness Attack on Prior Schemes (Section 1.3)

The paper identifies an explicit adaptive correctness attack against Piano [ZPSZ24] and Ghoshal et al. [GZS24a]. These schemes use a single public PRP to permute database indices for load balancing, with O_tilde(1) replacement entries per chunk. The attack: after observing the PRP, adaptively choose sqrt(n) queries that all land in the same chunk, exhausting its replacement entries and causing correctness failure.[^36]

[^36]: Section 1.3 (p.8): The attack exploits that Piano's load balancing uses a public PRP with O_tilde(1) replacement entries per chunk; choosing all queries in one chunk breaks correctness.

## Application Scenarios

- **Secure multiparty computation:** Information-theoretic PIR protocols can be distributed among two or more parties making only black-box use of cryptography (or none at all in honest-majority settings), avoiding the non-black-box overhead of OWF-based protocols.[^37]
- **Information-theoretic ORAM:** The lower bound also applies to "truly information-theoretic" ORAM where encryption is not free, ruling out certain constructions.[^38]

[^37]: Section 1.1 (p.6): Distributing the PIR client among multiple parties for MPC is a primary motivation; IT protocols can be distributed without non-black-box use of cryptography.

[^38]: Section 1.1 (p.2): The lower bound implies a fundamental tradeoff for truly information-theoretic ORAM where encryption is not considered a free assumption.

## Key Tradeoffs & Limitations

- **No implementation:** All constructions are theory-only; no benchmarks or concrete parameter instantiations are provided.
- **Super-logarithmic overhead:** The O_tilde(.) notation hides a super-logarithmic alpha(n) factor from omega(log n)-wise parallel repetition needed for negligible failure probability.
- **Construction 1 has super-linear server computation:** The nearly optimal tradeoff (Theorem 3.1) requires n^{1+o(1)} server computation per query, making it impractical despite tight client-space/bandwidth tradeoff.
- **Construction 2 has n^{2/3} client space:** While achieving sublinear server computation, the client space O_tilde(n^{2/3}) exceeds the sqrt(n) lower bound by a polynomial factor.
- **2-server scheme lacks adaptive correctness:** The 2-server variant (Theorem B.1) achieves only non-adaptive correctness because the preprocessing phase reveals the random set choices to the left server.[^39]
- **Gap between upper and lower bounds:** For sublinear server computation, there is a gap between the O_tilde(n^{2/3}) upper bound on client space/bandwidth and the Omega(sqrt(n)) lower bound. Closing this gap is stated as an open problem.
- **1-bit records:** All constructions work over {0,1}^n (single-bit entries); extending to w-bit entries requires standard but non-trivial adaptations.

[^39]: Appendix B (p.39): The 2-server scheme cannot benefit from the adaptive correctness techniques of Appendix A because the preprocessing phase leaks the random set choices to the left server.

## Open Problems

- Can we simultaneously achieve O_tilde(n^{1/2}) client space, bandwidth, AND server computation in a single-server IT preprocessing PIR?[^40]
- Can we achieve a 2-server IT preprocessing PIR scheme with adaptive correctness and the same efficiency as Theorem B.1?[^39]
- Does a ROM construction with o(sqrt(n)) client space and bandwidth for database-oblivious PIR exist? (Such a construction would separate SZK from BPP relative to a random oracle.)[^41]

[^40]: Section 1.1 (p.5): The paper asks whether client space, bandwidth, and server computation can all be bounded by O_tilde(n^{1/2}), closing the gap between the upper bound (Theorem 1.4) and the lower bound (Theorem 1.1).

[^41]: Section 5.2 (p.28): A ROM construction breaking the O(sqrt(n)) barrier would settle the natural open question of whether (promise) SZK can be separated from BPP relative to a random oracle.

## Related Papers in Collection

- **Piano [Group D]:** OWF-based single-server preprocessing PIR with O_tilde(sqrt(n)) bandwidth and client space; this paper proves Piano's tradeoff is nearly optimal in Minicrypt and identifies an adaptive correctness attack.
- **CK20 [Group D]:** First sublinear-server cPIR without extra server storage; introduced the puncturable pseudorandom set paradigm that this paper combines with classical IT-PIR techniques.
- **Mughees-Ren / MIR23 [Group D]:** Practical sublinear PIR with adaptive correctness; this paper derives a naive IT construction from MIR23 (Theorem 3.2) and uses it as a baseline.
- **WangRen [Group D]:** Proves tight space-time tradeoff ST = O(nw) for computational preprocessing PIR; this paper's lower bounds are complementary (tradeoff between client space and bandwidth rather than space and time).
- **CGKS Survey [Group X]:** Covers foundational multi-server IT-PIR constructions that this paper extends to the single-server preprocessing setting.

## Uncertainties

- The Dvir-Gopi PIR [DG16] is cited as having query length k = exp(O(sqrt(log n * log log n))), but the exact constant in the exponent is not specified in this paper; the notation n^{o(1)} subsumes this.
- The paper uses O_tilde(.) in two different ways: sometimes hiding polylog(n) factors, sometimes hiding a super-logarithmic alpha(n) from parallel repetition. Theorem A.3 and 4.4 use it for the latter (p.20, p.37). This is explicitly noted by the authors: "O_tilde(.) hides a multiplicative log n * alpha(n) factor for an arbitrary super-constant function alpha(n)" (Theorem 1.4, p.5).
- The paper's "Theorem 3.2" attributes a construction to Mughees et al. [MIR23] rather than presenting a new construction; it is stated as an observation about making PRF-based schemes information-theoretic by storing expanded sets directly.
