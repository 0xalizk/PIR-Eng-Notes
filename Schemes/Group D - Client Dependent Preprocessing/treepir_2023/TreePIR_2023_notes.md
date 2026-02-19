# TreePIR -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [TreePIR: Sublinear-Time and Polylog-Bandwidth Private Information Retrieval from DDH](https://github.com/alazzaretti/treePIR) (2023) |
| **Archetype** | Construction (primary) + Building-block (secondary: weak privately puncturable PRF / wpPRF) |
| **PIR Category** | **Group D** -- Client-dependent preprocessing, 2-server non-colluding |
| **Security model** | Semi-honest 2-server non-colluding[^1] |
| **Additional assumptions** | OWF (for wpPRF / TreePIR base); DDH (only for the polylog-bandwidth variant via Dottling et al. single-server PIR recursion)[^2] |
| **Correctness model** | Probabilistic (failure prob ≤ negl(lambda)); deterministic variant via shift optimization (Appendix A.1)[^3] |
| **Rounds (online)** | 1 (client sends one message to each server; each server responds)[^4] |
| **Record-size regime** | Parameterized (benchmarked at 1-bit, 32-byte, and 256-byte elements) |

[^1]: Section 2.1 (p.6): Privacy is defined with respect to each server individually. The adversary controls one server and interacts with a simulator for the other. Non-collusion is required -- neither server learns the other's query share.

[^2]: Lemma 4.1 (p.21): The polylog-bandwidth variant replaces the last step (downloading sqrt(N) parities) with a single-server PIR by Dottling et al. (CRYPTO 2019), which relies on DDH. The base TreePIR scheme (Theorem 4.1) requires only OWF.

[^3]: Appendix A.1 (p.27): The base protocol has probabilistic client time O(sqrt(N)) due to sampling keys until one covers the query index. The shift optimization makes client time deterministic by adding a random shift s to each set, guaranteeing coverage with a single key sample.

[^4]: Figure 6 (p.18): The client sends q_0 to server_0 and q_1 to server_1 simultaneously. Each server independently computes and returns its parity array.

---

## Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Corrigan-Gibbs and Kogan (EUROCRYPT 2020) [15] (PRP-PIR model); Kogan and Corrigan-Gibbs (Checklist) [33] (puncturable pseudorandom sets); Shi et al. (CRYPTO 2021) [43] (privately puncturable PRFs for PIR); GGM PRF construction [23] |
| **What changed** | Prior client-preprocessing PIR schemes either required O(N log N) client storage (Checklist [33]), O(sqrt(N) log N) bandwidth (PRP-PIR [15]), or heavy cryptographic machinery (Shi et al. [43] used LWE-based privately puncturable PRFs with estimated >400 MB communication). TreePIR introduces weak privately puncturable PRFs (wpPRFs), a new primitive built from simple GGM-tree PRFs requiring only OWF, achieving O(sqrt(N)) client storage and O(sqrt(N)) bandwidth with O(sqrt(N) log N) server time.[^5] |
| **Superseded by** | N/A (as of 2023; subsequent work includes Piano [Group D], SinglePass [Group D], Plinko [Group D]) |
| **Concurrent work** | N/A |

[^5]: Figure 1 (p.4): Comparison table shows TreePIR achieves O(sqrt(N) log N) server time, O(sqrt(N) log N) client storage, O(sqrt(N)) bandwidth from OWF; or O(sqrt(N) log N) server time, O(sqrt(N)) client storage, O(polylog N) bandwidth from DDH. The Shi et al. scheme has the big-O notation hiding very large security-parameter-dependent factors.

---

## Core Idea

TreePIR is a two-server client-preprocessing PIR scheme that achieves sublinear amortized server computation and sublinear bandwidth. The key insight is a new cryptographic primitive called a *weak privately puncturable PRF* (wpPRF), built from the GGM-tree PRF construction using only one-way functions. The wpPRF allows the client to construct pseudorandom sets that (1) have compact key representation (lambda bits), (2) support private puncturing -- removing an element without revealing which element or even which "chunk" it belonged to, and (3) support efficient full evaluation -- enumerating all input-output pairs for every possible puncture guess in O(N log N) time by exploiting shared structure in the GGM tree. During the offline phase, the client sends M = lambda * sqrt(N) wpPRF keys to server_0, which computes XOR parities of the corresponding pseudorandom sets. Online, the client punctures two keys (one fresh, one from its table) and sends the punctured keys to the two servers, which each compute sqrt(N) parity values. The client reconstructs the answer by XORing its stored parity with the server's response. This reduces PIR on N elements to PIR on sqrt(N) elements, which can be further resolved by downloading sqrt(N) values or recursing with a single-server PIR scheme.[^6]

[^6]: Section 4.1-4.2 (pp.14-18): The reduction from N to sqrt(N) is the core contribution. The wpPRF defines sets S = {i || F.Eval(k,i) : i in [sqrt(N)]}, each containing exactly one element per chunk of size sqrt(N). Puncturing at position x^l (the chunk identifier) produces a key that allows computing parities of the set minus the target element.

---

## Novel Primitives / Abstractions

### Weak Privately Puncturable PRF (wpPRF)

| Field | Detail |
|-------|--------|
| **Name** | Weak Privately Puncturable PRF (wpPRF) |
| **Type** | Cryptographic primitive |
| **Interface / Operations** | **Gen**(1^lambda) -> k: outputs a uniform random key k in {0,1}^lambda. **Eval**(k,x) -> y: evaluates the GGM PRF at point x in {0,1}^n, outputting y in {0,1}^m. **Puncture**(k,i) -> k_i: outputs the privately punctured key at point i (the list of GGM tree seeds NOT on the path to i, ordered left to right). **PEval**(k_i, j, x) -> y: evaluates the punctured key k_i at point x, given a guess j of which point was punctured; reconstructs the leaf at position x from the tree built from (j, k_i).[^7] |
| **Security definition** | Three properties: (1) **Security in puncturing** (Definition 2.6, p.8): the punctured key k_x reveals nothing about F.Eval(k,x) -- indistinguishable from (k_x, random). (2) **Privacy in puncturing** (Definition 3.2, p.12): given k_{x_b} for adversary-chosen x_0, x_1, no PPT adversary can guess b better than 1/2 + negl(lambda).[^8] (3) **Standard PRF pseudorandomness** (Definition 2.4, p.7). |
| **Correctness definition** | **Weak correctness** (Definition 3.3, p.12): PEval(k_x, x, x') = Eval(k, x') for all x' != x. For incorrect guesses j != x, PEval(k_x, j, x') outputs *some* value (possibly random), but is NOT required to equal Eval(k, x').[^9] |
| **Purpose** | Compactly represent pseudorandom subsets of [N] with private puncture capability for PIR. The "private" aspect (hiding WHICH element was removed) is the critical distinction from standard pPRFs, which reveal the punctured position's "chunk" in the GGM tree. |
| **Built from** | GGM-tree PRF from any length-doubling PRG G: {0,1}^lambda -> {0,1}^{2*lambda}. Requires only OWF.[^10] |
| **Standalone complexity** | Gen: O(lambda). Eval: O(n * lambda) -- n sequential applications of G (one per tree level). Puncture: O(n * lambda) -- extract n = log(N) sibling seeds from the path. PEval: O(n * lambda) -- reconstruct tree from guessed puncture point.[^11] |
| **Efficient full evaluation** | Definition 3.4 (p.12): All N sets S_j = {(x, PEval(k_i, j, x)) : x in {0,1}^n, x != j} for all j in {0,1}^n can be enumerated in O(N log N) time total. Achieved because adjacent puncture guesses share most tree structure -- transitioning from S_j to S_{j+1} requires only O(2^h) re-evaluations where h is the height of the differing subtree.[^12] |
| **Relationship to prior primitives** | **Strictly weaker than privately puncturable PRFs** (which additionally guarantee correctness: PEval(k_x, x') = Eval(k, x') for all x' != x, regardless of whether the evaluator knows x). Privately puncturable PRFs require LWE with superpolynomial modulus + FHE [7,13], making them impractical. **NOT equivalent to DPFs** -- DPFs split a point function into two shares; wpPRFs puncture a PRF key. **Strictly stronger than standard (non-private) pPRFs** -- standard GGM pPRFs reveal the punctured point x as part of the key, and the punctured key also reveals the "chunk" (subtree) containing x.[^13] |

[^7]: Figure 5 (p.13): The construction. Puncture outputs the list of seeds not on the path to i, ordered left to right (as shown in Figure 3). PEval reconstructs the tree by placing the punctured key's seeds into positions as if j were the punctured point.

[^8]: Definition 3.2 (p.12): The privacy experiment gives the adversary k_{x_b} for adversary-chosen (x_0, x_1) and random bit b. Privacy holds because the punctured key is just an ordered array of log(N) random-looking strings (PRG security), independent of which point was punctured.

[^9]: Definition 3.3 (p.12): This is the key relaxation vs. standard privately puncturable PRFs. Standard correctness requires PEval(k_x, x') = Eval(k, x') for ALL x' != x, without needing to know x. Weak correctness only guarantees this when the correct puncture point is supplied as a guess.

[^10]: Theorem 3.1 (p.13): The wpPRF satisfies pseudorandomness, security in puncturing, privacy in puncturing, weak correctness in puncturing, and efficient full evaluation, all assuming only that the PRG G is secure (which follows from OWF).

[^11]: Section 2.3 (p.7): GGM PRF evaluation requires n = log(N) sequential applications of G. The punctured key has size n * lambda = log(N) * lambda bits.

[^12]: Section 3.1, proof of Theorem 3.1 (p.14): The enumeration time is sum_{h=1}^{n} (2^n / 2^h) * 2^h = n * 2^n = N log N. The first set S_{0^n} takes O(N log N) to compute from scratch; subsequent sets S_j are computed incrementally with O(2^h) operations where h is the height of the node separating j-1 and j.

[^13]: Section 3 (p.9): Standard GGM pPRF punctured key = (x, [sibling seeds]). The index x is explicitly included. Even without x, the structure reveals which subtree x is in. The wpPRF drops x from the key and outputs only the ordered sibling seeds, making the key look like log(N) independent random strings.

---

## Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (for TreePIR base via PRG security); DDH (only for polylog-bandwidth variant, via Dottling et al. single-server PIR)[^14] |
| **Encryption/encoding scheme(s)** | None -- no FHE or public-key encryption used. Purely symmetric-key / PRF-based. |
| **PRF instantiation** | GGM-tree construction from any secure length-doubling PRG. Implementation uses AES-based PRG.[^15] |
| **Key structure** | Per-client: M = lambda * sqrt(N) independent wpPRF keys k_i in {0,1}^lambda, plus stored parities. Server: holds only DB copies (no per-client persistent state). |
| **Correctness condition** | Pr[query index x not covered by any of the M sets] <= (1 - 1/sqrt(N))^{lambda*sqrt(N)} <= (1/e)^lambda = negl(lambda)[^16] |

[^14]: Section 4.3 (p.20-21): Lemma 4.1 states that assuming DDH is hard, TreePIR achieves polylog online bandwidth by recursing with the Dottling et al. single-server PIR scheme. Without DDH, the base TreePIR (Theorem 4.1) achieves O(sqrt(N)) bandwidth from OWF alone.

[^15]: Section 5 (p.22): Implementation in 530 lines of C++ and 470 lines of Go. Source code at https://github.com/alazzaretti/treePIR.

[^16]: Equations 1-3 (p.20): The probability that a query index x_1 is not in any of the lambda*sqrt(N) sets is at most (1 - 1/sqrt(N))^{lambda*sqrt(N)} <= (1/e)^lambda, which is negligible.

---

## Key Data Structures

- **Client table T**: M = lambda * sqrt(N) entries, each containing a wpPRF key k_j and a parity value p_j = XOR_{i in S_j} DB[i]. Total client storage: O(sqrt(N)) entries (each entry is lambda + w bits, where w is element size).[^17]
- **Pseudorandom set S_i**: Defined as S_i = {v || F.Eval(k_i, v) : v in [sqrt(N)]}. Contains exactly sqrt(N) elements, one per chunk of size sqrt(N) within [N]. Each element is determined by concatenating the chunk index with the wpPRF output.[^18]
- **Parity array P_b**: Each server computes sqrt(N) parities, one per possible puncture position in [sqrt(N)]. The j-th parity phi_j = XOR_{i in S'_j} DB[i], where S'_j is the set reconstructed from the punctured key under puncture guess j.[^19]
- **Database**: Replicated at both servers. N elements of w bits each. Logically partitioned into sqrt(N) chunks of sqrt(N) elements each.

[^17]: Figure 6 (p.18): T = {T_j = (k_j, p_j) : j in [M]}, where M = lambda * sqrt(N).

[^18]: Section 4.1 (p.15): The set S contains each element in [N] with probability 1/sqrt(N), and contains exactly one element within each interval of size sqrt(N).

[^19]: Figure 6, Answer phase (p.18): P_b = [phi_0, ..., phi_{sqrt(N)}], where phi_i = XOR_{j in S_i} DB[j] and S_i is reconstructed via PEval from the punctured key.

---

## Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Preprocessing** | client + server_0 | Client generates M = lambda*sqrt(N) wpPRF keys, sends all keys to server_0. Server_0 computes XOR parity for each set S_i and returns M parity values. Client stores table T of (key, parity) pairs. | lambda*sqrt(N)*lambda bits up; lambda*sqrt(N)*w bits down | Once per offline window (amortized over sqrt(N) queries)[^20] |
| **Query (client)** | client | (1) Sample fresh key k' until F.Eval(k', x^l) = x^r. (2) Find table entry T_j with F.Eval(k_j, x^l) = x^r. (3) Puncture: q_0 = F.Puncture(k', x^l), q_1 = F.Puncture(k_j, x^l). (4) Send q_0 to server_0, q_1 to server_1. | log(N)*lambda bits to each server | Per query |
| **Answer (server_b)** | server_b | Parse q_b = (k_punc). Compute parity array P_b of sqrt(N) entries: for each potential puncture position i in [sqrt(N)], compute S_i via PEval and XOR the corresponding DB entries. Return P_b. | sqrt(N)*w bits down | Per query |
| **Reconstruct** | client | DB[x] = p_j XOR P_1[x^l]. Update table: T_j <- (k', P_0[x^l] XOR DB[x]). | -- | Per query |

[^20]: Theorem 4.1 (p.17): Offline server time is O(lambda*N*log(N)), offline client time is O(lambda*sqrt(N)), offline bandwidth is O(lambda*sqrt(N)).

---

## Two-Server Protocol Details

| Aspect | Server 0 | Server 1 |
|--------|----------|----------|
| **Data held** | Full DB copy | Full DB copy |
| **Role** | Offline: computes initial parity hints from wpPRF keys. Online: computes parity array from a freshly punctured key (independent of client table). | Online only: computes parity array from client's table-derived punctured key.[^21] |
| **Query received** | Punctured wpPRF key q_0 = F.Puncture(k', x^l), where k' is freshly sampled | Punctured wpPRF key q_1 = F.Puncture(k_j, x^l), where k_j is from client's table |
| **Computation** | Expand punctured key into sqrt(N) sets via efficient full evaluation, compute XOR parity for each: O(sqrt(N) log N) time | Same as server_0: O(sqrt(N) log N) time |
| **Response** | Parity array P_0 of sqrt(N) values | Parity array P_1 of sqrt(N) values |
| **Security guarantee** | Computational (OWF): query q_0 is indistinguishable from F.Puncture(k*, alpha) for random k*, alpha (via security + privacy in puncturing of wpPRF)[^22] | Computational (OWF): query q_1 is indistinguishable from F.Puncture(k*, alpha) for random k*, alpha (symmetric argument) |
| **Non-collusion assumption** | **Required** -- neither server learns the other's query share. If servers collude, they can correlate the two punctured keys to determine the queried index.[^23] |

[^21]: Figure 6 (p.18): Server_0 participates in both offline and online phases. Server_1 participates only online. However, Theorem 4.1 notes that privacy for server_0 follows symmetrically from the same arguments as for server_1.

[^22]: Section 4.2 (pp.17-19): The privacy proof constructs a simulator Sim that samples a random key k and a random element alpha from [sqrt(N)], then outputs F.Puncture(k, alpha). Indistinguishability follows from security in puncturing (Definition 2.6) and privacy in puncturing (Definition 3.2).

[^23]: Definition 2.2 (p.6): Privacy is defined per-server, assuming servers do not collude. The privacy definition requires existence of a simulator Sim such that the server's view is indistinguishable from a simulation with no knowledge of x_t.

---

## Variants

| Variant | Key Difference | Server Time* | Client Storage | Online Bandwidth* | Assumption |
|---------|---------------|-------------|---------------|-------------------|------------|
| **TreePIR (Theorem 4.1)** | Base scheme, download sqrt(N) parities | O(sqrt(N) log N) | O(sqrt(N) log N) | O(sqrt(N)) | OWF |
| **TreePIR + single-server PIR (Lemma 4.1)** | Recurse with Dottling et al. PIR on sqrt(N)-element DB | O(sqrt(N) log N) | O(sqrt(N)) | O(polylog N) | DDH |
| **TreePIR + SPIRAL** | Recurse with SPIRAL on sqrt(N)-element DB | O(sqrt(N) log N) | O(sqrt(N)) | ~50 KB (practical) | RLWE |
| **TreePIR with shift (Appendix A.1)** | Deterministic client time via random shift per set | Same | Same + sqrt(N) shift values | Same | OWF |

*Amortized over sqrt(N) queries.[^24]

[^24]: Figure 1 (p.4) and Section 4.4 (p.21): The D = 1/2 tradeoff point is used throughout. The general parameterization allows set size N^D and range N^D, giving online server time N^D, client storage N^{1-D}, and online bandwidth N^D for any D in (0,1).

---

## Correctness Analysis

### Option B: Probabilistic Correctness Analysis

| Field | Detail |
|-------|--------|
| **Failure mode** | The queried index x is not covered by any of the M = lambda * sqrt(N) pseudorandom sets in the client's table T. That is, no T_j has F.Eval(k_j, x^l) = x^r.[^25] |
| **Failure probability** | Pr[fail] <= (1 - 1/sqrt(N))^{lambda*sqrt(N)} <= (1/e)^lambda = negl(lambda) |
| **Probability grows over queries?** | No -- each query consumes one table entry but replaces it with a fresh one (T_j <- (k', P_0[x^l] XOR DB[x])). The table distribution is maintained by induction.[^26] |
| **Probability grows over DB mutations?** | N/A (base scheme does not address mutations; Section 5.3 discusses waterfall-based updates) |
| **Key parameters affecting correctness** | Number of sets M = lambda * sqrt(N); coverage probability 1/sqrt(N) per set per chunk |
| **Proof technique** | Direct probability calculation: each set independently covers each chunk with probability 1/sqrt(N). Over lambda*sqrt(N) independent sets, the probability of no coverage is (1 - 1/sqrt(N))^{lambda*sqrt(N)} <= (1/e)^lambda.[^27] |
| **Amplification** | Not needed -- failure is already negligible in lambda |
| **Adaptive vs non-adaptive** | Correctness holds for adaptive queries. The proof proceeds by induction: after each query, the table entry is replaced with a fresh (k', parity) pair whose distribution is identical to the original, so the next query faces the same coverage probability.[^28] |
| **Query model restrictions** | At most Q < 1/nu(lambda) queries per offline phase, where nu is a negligible function. In practice, this is effectively unlimited. |

[^25]: Section 4.2, proof of Theorem 4.1 (p.20): "For any query index x_1, the probability that we do not find a set that contains x_1, for some negligible function nu(.)."

[^26]: Section 4.2 (p.20): "At the end of the query, we update T by setting T_j = (k', P_0[x^l] XOR DB[x]). Correctness of the parity follows in a similar argument as above. Also, our updated table T maintains its distribution."

[^27]: Equations 1-3 (p.20).

[^28]: Section 4.2 (p.20): "Then, by induction, this will hold for query Q_t to index x_t for any t < 1/nu(lambda)."

---

## Complexity

### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (to each server) | O(lambda * log N) | ~2 KB (at N = 2^32)[^29] | Online |
| Response size (per server) | O(sqrt(N) * w) | 16.6 KB (N=2^32, w=1 bit) | Online |
| Server computation (each server) | O(sqrt(N) * log N) | ~1754 ms per server (amortized, N=2^32, w=1 bit)[^30] | Online |
| Client computation | O(sqrt(N)) probabilistic; O(sqrt(N)) deterministic with shift | <1 ms | Online |
| Total online bandwidth | O(sqrt(N)) (base); O(polylog N) (with DDH recursion) | 16.6 KB (base, N=2^32, w=1); 50 KB (with SPIRAL) | Online |

[^29]: Inferred: The punctured key consists of log(N) seeds of lambda bits each. For N = 2^32 and lambda = 128, this is 32 * 128 / 8 = 512 bytes per server, so ~1 KB total.

[^30]: Figure 7 (p.23): TreePIR amortized query time of 3508 ms over 2000 queries for N = 2^32 with 1-bit elements. This time includes both servers' computation (approximately 1754 ms per server).

### Preprocessing metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Server_0 preprocessing computation | O(lambda * N * log N) | Not separately benchmarked | Offline (once per client) |
| Client offline time | O(lambda * sqrt(N)) | Not separately benchmarked | Offline (once) |
| Offline bandwidth (up: keys) | O(lambda^2 * sqrt(N)) | ~1 MB (at N=2^22)[^31] | Offline |
| Offline bandwidth (down: parities) | O(lambda * sqrt(N) * w) | ~1 MB (at N=2^22, w=256 bytes) | Offline |
| Client persistent storage | O(sqrt(N) * (lambda + w)) | 1.05 MB (N=2^32, w=1 bit); 67 MB (N=2^22, w=256 bytes) | Persistent |
| Server per-client storage | 0 (no additional) | 0 | -- |
| Amortization window | ~sqrt(N) queries before re-preprocessing[^32] | ~2000 queries in benchmarks | -- |

[^31]: Figure 8 (p.24): Client storage of 67 MB for N = 2^22 with 256-byte elements. This corresponds to lambda * sqrt(N) entries of (lambda + w) bits each.

[^32]: Theorem 4.1 (p.17): The offline phase generates M = lambda * sqrt(N) sets. Each query consumes and replaces one entry, so the table can sustain at most M queries before all entries have been replaced. In practice, re-preprocessing is not strictly required since entries are refreshed per-query, but the scheme is analyzed with sqrt(N) queries as the amortization window.

### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Random-access (server computes per-set XOR parities, requiring random access to DB) |
| **Client peak memory** | O(sqrt(N) * (lambda + w)) -- stores the full table T |
| **Number of DB passes** | Multiple (one per set, or optimized to single pass with appropriate scheduling) |
| **Hint refresh mechanism** | Self-refreshing: each query replaces the consumed table entry with a fresh (k', parity) pair derived from server_0's response. Full re-preprocessing only needed if table is corrupted or DB changes substantially.[^33] |

[^33]: Figure 6, Reconstruct phase (p.18): "T_j <- (k', P_0[x^l] XOR DB[x])." The fresh key k' was sampled during the query, so the new entry is independent of the consumed entry.

---

## Performance Benchmarks

**Hardware:** Amazon Web Services EC2 instance m5d.8xlarge, single-threaded.[^34]

[^34]: Section 5 (p.22): "The tests results reflect microbenchmarks run on a single thread in an Amazon Web Services EC2 instance of size m5d.8xlarge."

### TreePIR without recursion (small elements)

Database: 2^32 elements of 1 bit each.

| Protocol | Amortized Query Time | Client Storage | Online Bandwidth |
|----------|---------------------|---------------|-----------------|
| Checklist [33] | 12574 ms | 8.6 GB | 0.51 KB |
| PRP-PIR [15,38] | -- (not supported at this size) | 1.05 MB | 33.5 MB |
| **TreePIR** | **3508 ms** | **1.05 MB** | **16.6 KB** |

Query time amortized per client over 2000 queries.[^35]

[^35]: Figure 7 (p.23): TreePIR is 3.6x faster than Checklist, uses 8,190x less client storage than Checklist, and uses 2,024x less bandwidth than PRP-PIR.

### TreePIR + SPIRAL (moderate elements, moderate DB)

Database: 2^22 elements of 256 bytes each (~1 GB).

| Protocol | Amortized Query Time | Client Storage | Online Bandwidth |
|----------|---------------------|---------------|-----------------|
| Checklist [33] | 140 ms | 78 MB | 0.7 KB |
| PRP-PIR [15,38] | 315 ms | 67 MB | 721 KB |
| **TreePIR + SPIRAL** | **(89+61) ms** | **67 MB** | **50 KB** |

Query time amortized over 200 queries. The 89 ms is TreePIR's first-phase time; 61 ms is SPIRAL's time on the sqrt(N)-element sub-database.[^36]

[^36]: Figure 8 (p.24): TreePIR + SPIRAL achieves (89+61) = 150 ms, which is slightly slower than Checklist's 140 ms for this specific configuration, but uses 14.4x less bandwidth than PRP-PIR and has much less client storage than Checklist at larger scales.

### TreePIR + SPIRAL (small elements, large DB)

Database: 2^28 elements of 32 bytes each (~8 GB).

| Protocol | Amortized Query Time | Client Storage | Online Bandwidth |
|----------|---------------------|---------------|-----------------|
| Checklist [33] | 711 ms | 570 MB | 0.3 KB |
| PRP-PIR [15,38] | -- (not supported) | 67 MB | 7.3 MB |
| **TreePIR + SPIRAL** | **(251+61) ms** | **67 MB** | **50 KB** |

Query time amortized over 2000 queries.[^37]

[^37]: Figure 9 (p.24): At 2^28 elements of 32 bytes, TreePIR + SPIRAL achieves 312 ms total vs. Checklist's 711 ms (2.3x faster), with 8.5x less client storage. PRP-PIR is not benchmarkable at this size.

---

## Application Scenarios

- **Secure Certificate Transparency (SCT) auditing:** Database of 2^33 one-bit elements (certificate presence flags). Requires two-server model. TreePIR without recursion is optimal here because elements are 1 bit -- downloading sqrt(N) bits is cheaper than recursing with a single-server PIR scheme that has fixed baseline communication overhead.[^38]
- **Compromised credential checking:** Large databases of 1-bit entries where the query must be private (e.g., checking if a password hash appears in a breach database).[^39]

[^38]: Section 5.1 (pp.22-23): "One such application was recently introduced by Henzinger et al. [27]. Henzinger et al. study the use of PIR for secure certificate transparency (SCT) auditing."

[^39]: Section 5.1 (p.23): "Another application that might involve large databases of 1 bit entries would be compromised credential checking services."

---

## Deployment Considerations

- **Database updates:** Supported via a waterfall / layered approach (Section 5.3). Initialize log(N) subdatabases of sizes 2^0, 2^1, ..., 2^{log N}. Updates go to the smallest empty layer; when a layer overflows, merge into the next. Client queries all layers. Amortized update cost is manageable; N updates trigger full re-preprocessing.[^40]
- **Sharding:** Not discussed, but the two-server model naturally supports sharding by having each server hold the same shard.
- **Key rotation / query limits:** Effectively unlimited queries per offline phase (bounded by 1/negl(lambda)); table entries are self-refreshing.
- **Anonymous query support:** No -- client maintains persistent state (table T) tied to its preprocessing, revealing identity across queries.
- **Session model:** Persistent client with long-lived table T.
- **Cold start suitability:** No -- requires expensive offline preprocessing before first query.
- **Amortization crossover vs Checklist:** TreePIR provides faster amortized query time and drastically lower client storage for large databases or databases with small elements. Checklist is faster for small databases with large elements (where its O(N log N) client storage is still manageable).[^41]

[^40]: Section 5.3 (pp.25-26): The waterfall approach is borrowed from Kogan and Corrigan-Gibbs [33]. Updates are amortized, and N updates trigger full re-preprocessing. Deletions supported via a reserved special value.

[^41]: Section 5.2 (p.25): "In cases where the database size is small but its elements are large, Checklist still presents itself as a very good candidate. Whenever the size of the database is large or the elements are small, TreePIR provides the best trade-offs in practice."

---

## Key Tradeoffs & Limitations

- **Requires two non-colluding servers** -- not suitable for single-server deployments without recursion to a single-server PIR (which adds DDH or RLWE assumptions and 61 ms overhead).
- **Client-dependent preprocessing** -- not suitable for anonymous access; each client must run an expensive offline phase.
- **Online bandwidth is O(sqrt(N))** in the base scheme -- asymptotically worse than Checklist's O(log N), but concretely competitive for practical database sizes (16.6 KB vs 0.51 KB at N = 2^32, 1-bit elements).
- **Cannot recurse with another preprocessing-based PIR scheme** -- the sqrt(N) parities from the Answer phase are dynamically generated and index-dependent, so a second TreePIR instance cannot be pre-computed for them.[^42]
- **General D-parameterized tradeoff:** Set size and range can be changed to N^D for any D in (0,1), trading client storage (N^{1-D}) against online server time (N^D). The paper fixes D = 1/2 throughout.[^43]

[^42]: Section 4.3 (p.21): "Note that we cannot recurse with a PIR scheme that uses preprocessing based on the database elements (and this includes our TreePIR), since the sqrt(N) words from the last step of the Answer phase are dynamically generated and entirely dependent on the index we decide to query."

[^43]: Section 4.4 (p.21): "If we change our set size to N^D, then this makes our online server time and bandwidth N^D. In exchange, we get client storage and online client time proportional to N^{1-D}."

---

## Comparison with Prior Work

| Metric | TreePIR (base) | TreePIR + SPIRAL | Checklist [33] | PRP-PIR [15] | Shi et al. [43] |
|--------|---------------|-----------------|----------------|-------------|----------------|
| Server time* | O(sqrt(N) log N) | O(sqrt(N) log N) | O(sqrt(N)) | O(sqrt(N)) | O(sqrt(N) log^2 N) |
| Client storage | O(sqrt(N) log N) | O(sqrt(N)) | O(N log N) | O(sqrt(N)) | O(sqrt(N) log^2 N) |
| Online bandwidth* | O(sqrt(N)) | O(polylog N) | O(log N) | O(sqrt(N) log N) | O(polylog N) |
| Assumption | OWF | DDH (or RLWE) | OWF | OWF | LWE |
| Practical? | Yes | Yes | Yes | Yes (but slow) | No (~400 MB comm)[^44] |

*Amortized over sqrt(N) queries. Big-O hides poly(lambda) factors.

[^44]: Section 5 (p.22): "Given the sample parameter instantiation of privately puncturable PRFs by [7], a conservative estimate on the online bandwidth is of at least 2*lambda^4 * log(lambda) * log(N). This means an online per query communication cost of over 400 megabytes, given a security parameter of size 128 bits, for any database size."

**Key takeaway:** TreePIR is the best choice among 2-server client-preprocessing PIR schemes when the database is large (>2^28 elements) or elements are small (<256 bytes). It achieves a unique combination of O(sqrt(N)) client storage and sublinear server time from only OWF, at the cost of O(sqrt(N)) online bandwidth (vs. O(log N) for Checklist). For applications where client storage is constrained (mobile devices, laptops), TreePIR's 1 MB storage vs. Checklist's 8.6 GB at N = 2^32 is decisive.

---

## Portable Optimizations

- **Shift-based deterministic client time (Appendix A.1):** Adding a random shift s in [sqrt(N)] to each pseudorandom set S_i guarantees that the client can always find a covering set with a single key sample (rather than expected sqrt(N) samples). This technique is applicable to any PRF-based client-preprocessing PIR scheme using partitioned pseudorandom sets.[^45]
- **Efficient full evaluation via GGM tree sharing:** The observation that adjacent puncture guesses share GGM tree structure, enabling O(N log N) total evaluation instead of O(N^2), may be applicable to other constructions that enumerate over tree-structured PRF evaluations.
- **Waterfall-based database updates (Section 5.3):** The layered subdatabase approach for supporting mutable databases is borrowed from oblivious RAM literature and is applicable to any client-preprocessing PIR scheme.

[^45]: Appendix A.1 (p.27): The shift technique was previously used in PRP-PIR [15]. TreePIR adapts it by XORing the shift with the wpPRF evaluation: S_i = {v || (F.Eval(k_i, v) XOR s_i) : v in [sqrt(N)]}. Client query step 1 becomes: sample k', let s' = x^r XOR F.Eval(k', x^l), guaranteeing coverage with a single sample.

---

## Implementation Notes

- **Language / Library:** 530 lines of C++ (core wpPRF and parity computation) + 470 lines of Go (protocol orchestration).[^46]
- **Polynomial arithmetic:** N/A (no polynomial operations; scheme is PRF-based).
- **SIMD / vectorization:** Not mentioned.
- **Parallelism:** Single-threaded benchmarks. The two servers operate independently and can run in parallel (reducing wall-clock query time by ~2x).
- **Open source:** https://github.com/alazzaretti/treePIR [Reference 1]

[^46]: Section 5 (p.22): "We implement TreePIR in 530 lines of C++ code and 470 lines of Go code."

---

## Open Problems

- Can wpPRFs be strengthened to full privately puncturable PRFs from weaker assumptions than LWE with superpolynomial modulus?
- Can the D = 1/2 tradeoff point be improved -- i.e., can one achieve better than O(sqrt(N)) simultaneously for server time and client storage?
- Can TreePIR support efficient updates without the O(log N) blowup from the waterfall approach?
- The authors note that wpPRFs "can have further applications" beyond PIR -- what other privacy-preserving protocols benefit from this primitive?[^47]

[^47]: Abstract (p.1): "The crux of our protocol is a new cryptographic primitive that we call weak privately puncturable pseudorandom functions, which we believe can have further applications."

---

## Related Papers in Collection

- **CK20 [Group D]:** First sublinear-server cPIR; uses puncturable pseudorandom sets from standard puncturable PRFs. TreePIR's wpPRF is a simpler alternative achieving similar functionality from weaker assumptions.
- **Piano [Group D]:** PRF-only practical sublinear PIR; single-server model (different from TreePIR's 2-server). Uses PRF-based partitioned sets without private puncturing.
- **Checklist [Group D]:** Compared directly in benchmarks. Uses puncturable pseudorandom sets with O(N log N) client storage. TreePIR achieves 8,190x less client storage.
- **SinglePass [Group D]:** 2-server scheme with streaming preprocessing (single-pass). Uses permutations, not PRFs. Different design philosophy from TreePIR.
- **Spiral [Group A]:** Used as the recursion partner in TreePIR + SPIRAL benchmarks. Provides polylog-bandwidth single-server PIR on the sqrt(N)-element sub-database.

---

## Uncertainties

- **N = 2^n assumption:** The paper assumes N is an even power of two for exposition (Section 4.2, p.17). Appendix A.2 generalizes to arbitrary N by replacing concatenation with multiplication by sqrt(N) plus addition. The benchmarks appear to use power-of-two sizes.
- **Amortization window:** The paper amortizes over "2000 queries" in benchmarks but the theoretical amortization window is sqrt(N) queries. At N = 2^32, sqrt(N) = 2^16 = 65,536 >> 2000. The relationship between the benchmark amortization count and the theoretical window is not explicitly discussed.
- **Big-O hiding lambda factors:** Section 1.4 (p.5) states "Unless explicitly stated, our big-O notation O(.) hides factors in the security parameter." This means all asymptotic bounds in Figure 1 implicitly contain poly(lambda) factors. The Shi et al. entry is flagged with a separate note that its hidden factors are "very large."
- **PRG instantiation:** The paper does not specify which PRG is used in the implementation. The reference implementation likely uses AES-128 as a length-doubling PRG (standard practice for GGM-tree constructions), but this is not stated in the paper.
