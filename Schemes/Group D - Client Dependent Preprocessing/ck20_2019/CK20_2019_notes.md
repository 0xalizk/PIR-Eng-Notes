## CK20 — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Private Information Retrieval with Sublinear Online Time](https://eprint.iacr.org/2019/1075) (2019, Eurocrypt 2020) |
| **Archetype** | Construction (theory-only) + Building-block (puncturable pseudorandom sets) + Model/definition (offline/online PIR) |
| **PIR Category** | Group D — Client-Dependent Preprocessing |
| **Security model** | Two-server non-colluding (statistical or computational); single-server (computational) |
| **Additional assumptions** | OWF (for puncturable PRFs from GGM tree); PRGs (for computational variant); linearly homomorphic encryption + standard single-server PIR (for single-server constructions); FHE (for optimal single-server variant) |
| **Correctness model** | Probabilistic (failure per-read <= 1/2, amplified to 2^{-λ} via λ parallel repetitions) |
| **Rounds (online)** | 1 (single round: client sends query, server responds) |
| **Record-size regime** | Single-bit retrieval (DB in {0,1}^n); multi-bit via parallel repetition (Remark 37, Appendix C.1) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | CGKS95 (original two-server PIR); BIM04 (PIR with preprocessing — encoded database); DIO01 (server-side encoding for sublinear time); BGI14/BGI16 (distributed point functions); BW13/KPTZ13 (puncturable PRFs from GGM tree); IKOS04 (batch PIR codes) |
| **What changed** | All prior offline/online PIR schemes require either linear online server time or extra server storage proportional to the database. CK20 introduces *puncturable pseudorandom sets* to compress the client's offline query to O(λ log n) bits while achieving sublinear online server time Õ(sqrt(n)), with servers storing only the unmodified database. |
| **Superseded by** | Piano (2024), Plinko (2024), TreePIR (2023), and other Group D schemes improve on practical aspects (streaming preprocessing, concrete efficiency), but CK20 remains the foundational theoretical result for sublinear-online PIR without extra server storage. |
| **Concurrent work** | BLW17 (privately constrained PRFs for offline/online PIR with linear online time); PPY18 (private stateful information retrieval with sublinear public-key operations but linear online time) |

[^1]: Abstract (p.1): "We present the first protocols for private information retrieval that allow fast (sublinear-time) database lookups without increasing the server-side storage requirements."

### Core Idea

CK20 presents the first PIR protocols with *sublinear* online server time while requiring *no extra server storage* beyond the database itself. Prior work either required the server to scan the entire database per query (Omega(n) time) or required the server to store a blowup of the database in encoded form.&#8201;[^2] CK20 achieves this by introducing a new cryptographic primitive called a *puncturable pseudorandom set*, which allows the client to compactly represent a pseudorandom subset S of the database that can be "punctured" at any element to hide the punctured element's identity. In the offline phase, the server precomputes parities of shifted versions of S; in the online phase, the client sends a punctured set key, and the server computes the parity of the remaining elements in sublinear time. A lower bound (Theorem 23) proves these constructions achieve the optimal communication-time tradeoff (up to polylog factors) for PIR schemes where the server stores the database unencoded.&#8201;[^3]

[^2]: Section 1 (p.2): "In particular, in all existing PIR schemes, the work at the servers grows linearly with the database size."
[^3]: Section 6 (p.28): "(C+1)(T+1) = Omega-tilde(n)" for any offline/online PIR scheme with C bits of offline communication and T online server probes.

### Formal Definitions

#### Definition 8 — Offline/Online PIR (Two-Server)

An offline/online PIR scheme is a tuple Pi = (Setup, Hint, Query, Answer, Reconstruct) of five efficient algorithms:&#8201;[^4]

- **Setup(1^λ, n) -> (ck, q_h):** Client generates a client key ck and hint request q_h. Crucially, the client can run Setup *before* knowing which database bit to read.
- **Hint(x, q_h) -> h:** The offline server, given database x in {0,1}^n and hint request q_h, produces a hint h.
- **Query(ck, i) -> q:** The client, given its key ck and desired index i in [n], produces a query q for the online server.
- **Answer^x(q) -> a:** The online server, given query q and oracle access to database x, produces answer a. The focus is on schemes where Answer probes o(n) bits of x and runs in o(n) time.
- **Reconstruct(h, a) -> x_i:** The client recovers the desired bit from the hint and answer.

**Correctness:** For every λ, n, x in {0,1}^n, and i in [n], the probability that Reconstruct(h, a) = x_i is 1 (over all randomness).

**Security:** The scheme is *epsilon-secure* if for all i, j in [n], the query distributions D_{λ,n,i} and D_{λ,n,j} have distinguishing advantage at most epsilon(λ, n). The scheme is *statistically secure* if this holds against computationally unbounded adversaries.&#8201;[^5]

[^4]: Definition 8 (p.17): Formal syntax of offline/online PIR.
[^5]: Definition 8 (p.17): Security definition in terms of query distribution indistinguishability.

#### Definition 40 — Multi-Query Offline/Online PIR (Appendix D)

Extends Definition 8 to support polynomially many adaptive queries from a single offline phase:&#8201;[^6]

- **Setup(1^λ, n) -> (ck, q_h):** As before.
- **Hint(x, q_h) -> h:** As before.
- **Query(ck, i) -> (ck', q_left, q_right):** Now outputs an *updated* client key ck' plus queries for both servers.
- **Answer^x(q) -> a:** As before.
- **Reconstruct(h, a_left, a_right) -> (h', x_i):** Returns an updated hint h' and the desired bit.

**Security:** Against a stateful, fully malicious adversary that controls either server and can adaptively choose query indices (Games 41, 42, p.54). The adversary sees the query to the corrupted server but learns nothing about the retrieved index.&#8201;[^7]

[^6]: Definition 40 (p.52): Formal syntax of multi-query offline/online PIR.
[^7]: Games 41-42, Fig. 3 (p.54): Left-server and right-server security games.

#### Definition 46 — Single-Server Offline/Online PIR (Appendix E)

Identical syntax to Definition 8 but with a single-server security notion: the joint distribution of (q_h, q) must be computationally indistinguishable across different query indices i.&#8201;[^8]

[^8]: Definition 46 (p.61): Single-server security requiring indistinguishability of the combined offline/online view.

#### Relationship to standard PIR

Offline/online PIR is a *strict generalization* of standard PIR: any standard two-server PIR scheme with information-theoretic security can be cast as an offline/online scheme (Remark 10), but the online server's time would be Omega(n).&#8201;[^9] CK20 achieves the first offline/online constructions where the online server runs in o(n) time.

[^9]: Remark 10 (p.18): Any two-server perfectly secure PIR scheme can be viewed as an offline/online scheme.

### Novel Primitives / Abstractions

#### Puncturable Pseudorandom Set

| Field | Detail |
|-------|--------|
| **Name** | Puncturable pseudorandom set |
| **Type** | Cryptographic primitive |
| **Interface / Operations** | **Gen(1^λ, n) -> sk:** Generate key for set of size s(n) over universe [n]. **Punc(sk, i) -> sk_p:** Puncture the key at element i in Eval(sk), producing a punctured key. **Eval(sk) -> S:** Expand the key into a set S of [n] with |S| = s(n). Also: **GenWith(1^λ, n, i) -> sk:** Generate a key constrained to contain i. **Shift(sk, delta) -> sk':** Produce a key for the shifted set {x + delta mod n : x in Eval(sk)}.&#8201;[^10] |
| **Security definition** | Game 1 (p.14): Given a punctured key sk_p, the adversary guesses the punctured element x*. The guessing advantage is PSAdv\[A, Psi\](λ, n) := Pr\[A wins\] - 1/(n - s(n) + 1). A puncturable pseudorandom set is *computationally secure* if PSAdv <= negl(λ), and *perfectly secure* if PSAdv = 0 for all unbounded adversaries.&#8201;[^11] |
| **Correctness definition** | With probability 1 over Gen: (1) S in binom([n], s(n)), i.e., S is a valid s(n)-subset, and (2) for all i in S, Eval(Punc(sk, i)) = S \ {i}.&#8201;[^12] |
| **Purpose** | Compactly represent pseudorandom subsets of the database with the ability to privately puncture — enabling the online query to hide the target index by sending only a short punctured key instead of the full set |
| **Built from** | Three constructions provided with increasing compactness: (1) Fact 2: Perfectly secure with linear-size keys (trivially store the set). (2) Theorem 3 / Construction 4: From puncturable PRFs (GGM-tree PRF from OWF), with keys of length O(λ log n) and punctured keys of length O(λ log n). (3) Theorem 7: From PRPs, with keys of length kappa(λ, n) and punctured keys of length s * O(log n), plus fast membership test InSet.&#8201;[^13] |
| **Standalone complexity** | Gen: O(s(n)) * poly(λ, log n). Eval: O(s(n)) * poly(λ, log n). Punc: O(s(n)) * poly(λ, log n). InSet (PRP construction only): poly(λ, log n).&#8201;[^14] |
| **Relationship to prior primitives** | Analogous to puncturable PRFs but for *sets* rather than *functions*. A puncturable PRF key allows evaluating f at all points except x*; a puncturable pseudorandom set key allows enumerating all elements of S except x*. The punctured key also hides x*. Not equivalent to DPFs: the left key can be generated before the index i is chosen, which standard DPFs cannot achieve.&#8201;[^15] |

[^10]: Section 2.1 (p.13): Formal definition of puncturable pseudorandom sets. Section 2.3 (p.16): GenWith and Shift extensions.
[^11]: Game 1 (p.14): Security game for puncturable pseudorandom sets.
[^12]: Section 2.1 (p.13): Correctness requirements.
[^13]: Fact 2 (p.14), Theorem 3 / Construction 4 (p.14-15), Theorem 7 (p.15-16): Three constructions of puncturable pseudorandom sets.
[^14]: Section B.2 (p.39): Efficiency analysis of Construction 4 from puncturable PRF.
[^15]: Section 2 (p.12-13): "A puncturable pseudorandom set is very closely related to a puncturable pseudorandom function."

#### Sparse Distributed Point Functions (Appendix G)

| Field | Detail |
|-------|--------|
| **Name** | Sparse DPF |
| **Type** | Cryptographic primitive (alternative abstraction) |
| **Interface / Operations** | **Gen(1^λ, n) -> K_left = (k_1, ..., k_m):** Generate a family of left keys. **Choose(K_left, i) -> (j, k_right):** Given a left key family and index i in [n], choose a left key k_j and produce a right key k_right such that Eval(k_j) + Eval(k_right) = e_i. **Eval(k) -> v in F^n:** Evaluate a key into a vector.&#8201;[^16] |
| **Security definition** | The right key k_right is computationally (or statistically) indistinguishable from a simulated key Sim_right(1^λ, n), hiding the special index i.&#8201;[^17] |
| **Correctness definition** | With high probability: Eval((K_left)_j) + Eval(k_right) = e_i (the unit vector at position i).&#8201;[^18] |
| **Purpose** | Alternative lens for viewing CK20's PIR constructions — the left keys are generated offline (independent of i), and the right key is sparse (non-zero in only s(n) positions), enabling sublinear Answer computation |
| **Built from** | CK20's puncturable pseudorandom sets directly imply sparse DPFs. Standard DPFs (GI14) cannot achieve sparsity on both sides simultaneously (this would violate the Omega(n) server-time lower bound of BIM04).&#8201;[^19] |
| **Relationship to prior primitives** | A relaxation of standard DPFs: in standard DPFs, both keys evaluate to dense vectors; in sparse DPFs, the right key evaluates to a sparse vector, but the left key family must be generated before the index is chosen.&#8201;[^20] |

[^16]: Appendix G (p.68): Formal definition of sparse DPFs.
[^17]: Appendix G (p.68): Security property of sparse DPFs.
[^18]: Appendix G (p.68): Correctness of sparse DPFs.
[^19]: Appendix G (p.67): "Unfortunately, such a construction is impossible" (both sides sparse), citing BIM04.
[^20]: Appendix G (p.67): Discussion of the relaxation from standard DPFs to sparse DPFs.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Minimal: OWF (one-way functions) suffice for the two-server statistical variant (Theorem 11); PRG existence for the two-server computational variant (Theorem 14, Corollary 6); linearly homomorphic encryption + standard single-server PIR for the single-server LHE construction (Theorem 20); FHE for the optimal single-server variant (Theorem 22) |
| **Key structure** | Per-client puncturable pseudorandom set keys; in the computational variant, PRG seeds replace explicit shift vectors |
| **Correctness condition** | Pr[fail per single read] <= 1/2 (from Bernoulli sampling in Query). Amplified to 2^{-λ} by running λ parallel instances. Can be further transformed to *perfect correctness* at the cost of a negligible security loss.&#8201;[^21] |

[^21]: Appendix C.2 (p.49-50): Failure probability analysis. Each read fails when j = bottom (probability <= 1/n) or i_punc != i (probability (s-1)/n), with combined probability at most s/n <= 1/2 for s <= n/2.

### Key Data Structures

- **Database:** x in {0,1}^n stored in unmodified form on both servers (two-server) or the single server. No encoding, no extra storage.
- **Client hint (single-query):** A set key sk in K, shift vector delta = (delta_1, ..., delta_m) in [n]^m, and parity bits h = (h_1, ..., h_m) in {0,1}^m, where m = (n/s) log n. Total client storage: O(λ * kappa + (λ * n / s(n)) * log^2 n) bits.&#8201;[^22]
- **Client hint (multi-query):** m = (2n/s) log n independent set keys (sk_1, ..., sk_m) in K^m plus m parity bits. Total storage: Õ_λ(n^{1/2}) bits with s = sqrt(n).&#8201;[^23]

[^22]: Appendix C.2 (p.50): Client storage claim for the single-query scheme.
[^23]: Appendix D.2 (p.58): Client stores m = Õ(n^{1/2}) puncturable pseudorandom set keys.

### Variants

| Variant | Key Difference | Offline Comm | Online Comm | Online Server Time | Assumption | Ref |
|---------|---------------|-------------|-------------|-------------------|------------|-----|
| Two-server statistical (Thm 11) | Perfectly secure puncturable sets; statistical security | O(λ * sqrt(n) * log^2 n) | O(λ * sqrt(n) * log n) | Õ_λ(sqrt(n)) | None (information-theoretic puncturable sets) | p.18 |
| Two-server computational (Thm 14) | PRG-based puncturable sets; computational security | O(λ * sqrt(n) * log n) | O(λ^2 * log n) | Õ_λ(sqrt(n)) | PRG existence | p.19 |
| Two-server multi-query (Thm 17) | Supports poly-many adaptive queries from one offline phase | O(λ * sqrt(n) * log n) | O(λ * sqrt(n) * log n) | Õ_λ(sqrt(n)) | PRP existence | p.22 |
| Two-server multi-query low-comm (Cor 18) | Reduced online communication via Hellman tables | Õ_λ(n) | O(λ^2 * log n) | Õ_λ(sqrt(n)) | PRG existence | p.22 |
| Single-server LHE (Thm 20) | Uses linearly homomorphic encryption; no public-key ops online | Õ_λ(n^{2/3}) | Õ_λ(n^{1/3}) | Õ_λ(n^{2/3}) | LHE + single-server PIR | p.25 |
| Single-server FHE (Thm 22) | Uses FHE to simulate both servers; optimal tradeoff | Õ_λ(sqrt(n)) | Õ_λ(sqrt(n)) | Õ_λ(sqrt(n)) | FHE | p.27 |
| Simple single-server (Remark 21 / App E.2) | Very simple; LHE only; linear online bit operations but no public-key ops online | O(sqrt(n)) total | O(sqrt(n)) total | O(n) bit ops, no PK ops | LHE | p.25, p.62 |

### Protocol Phases

#### Construction 16: Two-Server Single-Query PIR

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Client | Generate set key sk <- Gen(1^λ, n); sample m random shifts delta_1, ..., delta_m <- [n]; set ck = (sk, delta_1, ..., delta_m) | -- | Per query (single-query variant) |
| Hint request | Client -> Offline server | Send set key sk and shifts delta | |q_h| = kappa + m * log n bits upward | Per query |
| Hint computation | Offline server | For j = 1, ..., m: compute S_j = Eval(Shift(sk, delta_j)); compute h_j = XOR of x_i for i in S_j | -- | Per query; server time: n * poly(λ, log n) |
| Hint delivery | Offline server -> Client | Send h = (h_1, ..., h_m) | m bits downward | Per query |
| Query generation | Client | Find j such that i_pir - delta_j in Eval(sk). Sample b <- Bernoulli((s-1)/n). If b=0: i_punc = i_pir; else: i_punc = random from Eval(sk_q) \ {i_pir}. Send q = Punc(sk_q, i_punc) | λ * kappa_p bits upward | Per query |
| Answer | Online server | Compute S* = Eval(q) (the punctured set, |S*| = s-1). Return a = XOR of x_i for i in S* | 1 bit (λ bits for λ repetitions) downward | Per query; server time: s(n) * poly(λ, log n) |
| Reconstruct | Client | If j = bottom or b = 0: output bottom. Else: x_i = h_j - a mod 2 | -- | Per query |

[^24]: Construction 16 (p.20): Full specification of two-server PIR with sublinear online time.

#### Construction 44: Two-Server Multi-Query PIR

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Client | Generate m independent set keys sk_1, ..., sk_m <- Gen(1^λ, n); set ck = (sk_1, ..., sk_m) | -- | Once per offline phase |
| Hint request | Client -> Left server | Send all m set keys | m * kappa bits upward | Once per offline phase |
| Hint computation | Left server | For j = 1, ..., m: compute S_j = Eval(sk_j); compute h_j = XOR of x_i for i in S_j | -- | Once; server time: Õ_λ(n) |
| Hint delivery | Left server -> Client | Send h = (h_1, ..., h_m) | m bits downward | Once |
| Query (per read) | Client | Find j such that i in Eval(sk_j) (using InSet). Generate sk_new via GenWith(1^λ, n, i). Swap sk_j with sk_new in ck. Sample b <- Bernoulli((s-1)/n). Compute q_left = Punc(sk_new, i_punc) and q_right = Punc(sk_right, i_punc) | λ * kappa_p bits to each server | Per query |
| Answer (right server) | Right server | Expand Eval(q_right), compute parity of s-1 bits | 1 bit (λ bits total) | Per query; server time: s * poly(λ, log n) |
| Answer (left server) | Left server | Expand Eval(q_left), compute parity for hint refresh | 1 bit (λ bits total) | Per query; server time: s * poly(λ, log n) |
| Reconstruct + Refresh | Client | Recover x_i = h_j - a_right mod 2. Update h_j = a_left + x_i mod 2 | -- | Per query |

[^25]: Construction 44 (p.56): Full specification of multi-query offline/online PIR.

### Two-Server Protocol Details

| Aspect | Offline Server (Left) | Online Server (Right) |
|--------|----------------------|----------------------|
| **Data held** | Full DB copy x in {0,1}^n | Full DB copy x in {0,1}^n |
| **Offline role** | Receives set key(s) and shifts; computes parity hints | None (inactive in offline phase) |
| **Online query received** | Punctured set key q_left (multi-query only, for hint refresh) | Punctured set key q_right |
| **Online computation** | Expand punctured set, compute parity of s-1 bits | Expand punctured set, compute parity of s-1 bits |
| **Security guarantee** | Statistical (two-server variants) or computational (multi-query) | Statistical or computational |
| **Non-collusion assumption** | Required -- neither server learns the other's query |

### Correctness Analysis

#### Option B: Probabilistic Correctness

| Field | Detail |
|-------|--------|
| **Failure mode** | Two failure modes: (1) The desired index i is not covered by any shifted set (j = bottom), probability <= 1/n for m = (n/s) log n. (2) The Bernoulli coin yields b = 1 but i_punc != i_pir, probability (s-1)/n. Combined per-read failure: <= s/n <= 1/2 for s <= n/2.&#8201;[^26] |
| **Failure probability** | Per single instance: <= 1/2. After λ parallel repetitions: <= 2^{-λ}. Multi-query: union bound over T reads gives failure <= T / 2^{λ}.&#8201;[^27] |
| **Probability grows over queries?** | No for single-query (each offline phase is independent). For multi-query (Construction 44), failure probability is bounded by T / 2^{λ} where T is the number of queries, but per-query failure remains <= 1/2 per instance.&#8201;[^28] |
| **Key parameters affecting correctness** | Set size s = s(n) = sqrt(n)/2 (from Construction 4); number of shifted sets m = (n/s) log n; number of parallel repetitions λ |
| **Proof technique** | Birthday-bound analysis for set coverage (Eq. 15, p.49): Pr[j = bottom] = (1 - s/n)^m <= e^{-log n} = 1/n. Bernoulli analysis for i_punc != i: Pr[b=1] = (s-1)/n. |
| **Amplification** | Run λ independent instances in parallel; client succeeds if any instance succeeds. Transforms 1/2 per-read failure to 2^{-λ}.&#8201;[^29] |
| **Adaptive vs non-adaptive** | Correctness holds for adaptive queries in the multi-query variant (Theorem 17, Construction 44). |
| **Query model restrictions** | Single-query variant: one query per offline phase. Multi-query variant: polynomially many adaptive queries per offline phase. |

[^26]: Appendix C.2 (p.49): Failure probability analysis of Construction 16.
[^27]: Appendix C.2 (p.49-50): Amplification via λ parallel repetitions.
[^28]: Appendix D.2 (p.57): Multi-query failure probability via union bound.
[^29]: Appendix C.2 (p.49-50): "By running λ instances of the scheme in parallel, using independent randomness for each instance, we can drive the overall failure probability (when the puncturable pseudorandom set is perfectly secure) to 2^{-λ}."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|---------|-------|
| Online query size | O(λ * kappa_p) where kappa_p = O(λ log n) for PRF-based construction | N/A (no implementation) | Online |
| Online response size | λ bits (λ parallel instances, 1 bit each) | N/A (no implementation) | Online |
| Online server computation | Õ_λ(sqrt(n)) | N/A (no implementation) | Online |
| Client online computation | Õ(s(n) + n/s(n)) * poly(λ) = Õ_λ(sqrt(n)) | N/A (no implementation) | Online |

#### Preprocessing metrics

| Metric | Asymptotic (Thm 11 / Thm 14) | Concrete | Phase |
|--------|------|---------|-------|
| Offline server computation | Õ_λ(n) | N/A (no implementation) | Offline (per-query for single-query; once for multi-query) |
| Offline communication (total) | O(λ * sqrt(n) * log^2 n) [Thm 11] / O(λ * sqrt(n) * log n) [Thm 14] | N/A (no implementation) | Offline |
| Online communication (total) | O(λ * sqrt(n) * log n) [Thm 11] / O(λ^2 * log n) [Thm 14] | N/A (no implementation) | Online |
| Client persistent storage | O(λ * kappa + (λ * n/s(n)) * log^2 n) bits | N/A (no implementation) | Between offline and online |
| Server extra storage | **0** (database stored in unmodified form) | 0 | Persistent |

[^30]: Theorem 11 (p.18) and Theorem 14 (p.19): Main complexity results for two-server constructions.

#### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Random-access (server needs to evaluate parities of pseudorandom subsets of the database) |
| **Client peak memory** | Õ_λ(sqrt(n)) |
| **Number of DB passes** | Not specified (not streaming; requires random access for parity computation) |
| **Hint refresh mechanism** | Single-query: full re-execution of offline phase. Multi-query: online hint refresh via left server -- client sends punctured key of new set, left server returns parity, client updates hint locally.&#8201;[^31] |

[^31]: Section 4.1 (p.23): Hint refresh mechanism in the multi-query scheme.

### Lower Bounds

| Field | Detail |
|-------|--------|
| **Bound type** | Communication-time tradeoff (space-time lower bound) |
| **Bound statement** | For any computationally secure offline/online PIR scheme where the server stores the database in unmodified form: (C + 1)(T + 1) = Omega-tilde(n), where C = offline communication bits downloaded by client, T = number of database bits probed by online server.&#8201;[^32] |
| **Variables** | C: bits the client downloads in the offline phase. T: bits of the database the online server probes. n: database size in bits. |
| **Model assumptions** | Server stores the database in its original (unencoded) form; no extra server storage. Correctness: client recovers its bit with probability at least 1/2 + epsilon for constant epsilon. Both computational and statistical security are covered.&#8201;[^33] |
| **Proof technique** | Reduction to Yao's Box Problem (Definition 47, p.64): an offline/online PIR scheme implies an algorithm for Yao's Box Problem with C bits of advice and T queries. Applying the known lower bound for Yao's Box Problem (Theorem 48: epsilon = Õ(sqrt(C(T+1)/N))) completes the proof.&#8201;[^34] |
| **Tightness** | Tight up to polylogarithmic factors. The two-server construction of Theorem 11 (C = Õ(sqrt(n)), T = Õ(sqrt(n))) achieves (C+1)(T+1) = Õ(n). The single-server FHE construction of Theorem 22 also matches.&#8201;[^35] |
| **Matching upper bound** | Theorem 11 (two-server), Theorem 22 (single-server, with FHE) |
| **Implications** | The lower bound holds against single-server schemes as well. It does NOT preclude schemes where the server stores an encoded database (Remark 24).&#8201;[^36] |

[^32]: Theorem 23 (p.28): "(C+1)(T+1) = Omega-tilde(n)" formal statement.
[^33]: Theorem 23 (p.28): Model restrictions -- server stores DB in original form, uses no additional storage.
[^34]: Appendix F (p.63-66): Full proof via reduction to Yao's Box Problem.
[^35]: Section 6 (p.28): "The offline/online PIR schemes we construct in Section 3 achieve the optimal trade-off, up to log factors."
[^36]: Remark 24 (p.28): "The lower bound of Theorem 23 does not preclude schemes that achieve better communication and lower bound by virtue of having the servers store some form of encoding of the database."

### Performance Benchmarks

No implementation. Analytical estimates:

**Two-server (Theorem 14, s = sqrt(n)):** For n-bit database with security parameter λ:
- Offline communication: O(λ * sqrt(n) * log n) bits
- Online communication: O(λ^2 * log n) bits
- Online server time: sqrt(n) * poly(λ, log n)
- Client storage: O(λ * kappa + λ * sqrt(n) * log^2 n) bits, where kappa = O(λ) (PRF key length)

**Remark 12 (Concrete efficiency, p.18):** The poly(λ, log n) factors hidden in Õ notation can be made as small as O(λ * log n) with careful implementation.&#8201;[^37]

**Single-server LHE (Theorem 20):** For n-bit database:
- Offline: Õ_λ(n^{2/3}) communication, Õ_λ(n) server operations in group G
- Online: Õ_λ(n^{1/3}) communication, Õ_λ(n^{2/3}) time, zero group operations
- Client: Õ_λ(n^{2/3}) time and memory

**Remark 13 (Tradeoff, p.18):** The communication-time tradeoff is continuous. For any function C(n) <= n/2, one can build a two-server scheme with C(n) bits of offline communication and Õ(n/C(n)) online server time.&#8201;[^38]

[^37]: Remark 12 (p.18): "It is possible to make these hidden factors as small as O(λ * log n)."
[^38]: Remark 13 (p.18): Trading communication for online time.

### Single-Server Construction (Theorem 20, Section 5)

The single-server scheme converts the two-server construction into a single-server setting using linearly homomorphic encryption (LHE):&#8201;[^39]

1. **Offline phase (unbalanced):** The client encrypts its set S as an indicator vector v in F^{sqrt(n)} using LHE: ct_v = Enc(k, v). The server computes ct_h = ct_v * Circ(x) via an FFT-like computation in Õ_λ(n) time, exploiting the circulant structure. The client then uses batch PIR (IKOS04) to privately retrieve the m desired components of ct_h.

2. **Rebalancing:** The database is partitioned into n^{1/3} buckets of size n^{2/3} each. The unbalanced scheme is run once per bucket, with the client sending a single query per bucket. This yields total communication Õ_λ(n^{2/3}) and online time Õ_λ(n^{2/3}).&#8201;[^40]

3. **With FHE (Theorem 22):** Using FHE instead of LHE, the client sends an encryption of the PRG seed rather than the set indicator vector. The server homomorphically evaluates the offline server's algorithm on the encrypted seed. This achieves the optimal Õ_λ(sqrt(n)) communication and time, matching the lower bound.&#8201;[^41]

[^39]: Section 5.1 (p.25-27): Proof of Theorem 20.
[^40]: Section 5.1 (p.27): Rebalancing step using the CGKS95 technique.
[^41]: Theorem 22 (p.27): FHE-based single-server scheme achieving optimal bounds.

### Comparison with Prior Work (Table 2, p.6)

Table 2 in the paper provides a comprehensive comparison. Key entries for CK20's constructions (rows marked as "Thm. 11", "Thm. 14", "Thm. 17"):

| Metric | Thm 11 (2-server, stat.) | Thm 14 (2-server, comp.) | Thm 17 (2-server, multi-query) | Thm 20 (1-server, LHE) | Thm 22 (1-server, FHE) | BIM04 (2-server, encoded DB) | DIO01 (extra storage) |
|--------|--------------------------|--------------------------|-------------------------------|------------------------|------------------------|-----------------------------|-----------------------|
| Assumption | None | OWF | None | Lin. hom. enc. | FHE | None | OWF |
| Offline comm | n^{1/2} | n^{1/2} | n^{1/2}/q | n^{2/3} | n^{1/2} | 0 | 0 |
| Online server time | n^{1/2} | n^{1/2} | n^{1/2} | n^{2/3} | n^{1/2} | n^{0.6} | log n |
| Online comm | n^{1/2} | log n | n^{1/2} | n^{1/3} | n^{1/2} | n^{0.6} | log n |
| Extra server storage | **0** | **0** | **0** | **0** | **0** | n^{3.2} | mn |

All columns omit poly(λ) factors and polylog(n) factors.&#8201;[^42]

**Key takeaway:** CK20 is the first (and, for the no-extra-storage model, optimal) construction achieving sublinear online server time without blowing up server storage. Prior approaches (BIM04, DIO01) required massive server storage (n^{3.2} or mn bits). The tradeoff is that CK20 requires a client-dependent offline phase that runs once per client (or once per query in the single-query variant).

[^42]: Table 2 (p.6): Comparison table. "All columns omit poly(λ) factors, for security parameter λ, and also low-order polylog(n) factors."

### Portable Optimizations

- **Puncturable pseudorandom sets as a building block:** The primitive is independently useful wherever one needs a compact representation of a pseudorandom set that can be privately punctured. Potential applications beyond PIR include anonymous credentials, private set membership, and oblivious RAM.
- **Shift-based set derandomization:** The technique of generating multiple sets from a single base set via random shifts (Section 1.5, p.10) reduces communication from O(n log n) (sending explicit sets) to Õ(sqrt(n)), and is reusable in any scheme based on parity hints over random subsets.
- **Sparse DPF abstraction (Appendix G):** The sparse DPF framework provides a clean interface for future constructions: any primitive satisfying the sparse DPF interface yields an offline/online PIR scheme. Improving sparse DPF key sizes would directly improve PIR communication.
- **Hint refresh via puncture-and-replace (Section 4.1):** The multi-query scheme's technique of refreshing consumed hints by generating a new set constrained to contain the queried index (GenWith) and obtaining the new parity from the left server is reused in later Group D schemes (Piano, Plinko, TreePIR).

### Deployment Considerations

- **Database updates:** Not addressed. The parity hints become stale if the database changes; the entire offline phase would need re-execution.
- **Extra server storage:** Zero -- a key advantage over BIM04/DIO01-style preprocessing.
- **Anonymous query support:** No -- the offline phase is client-dependent (the server computes hints specific to each client's set key), so per-client state reveals client identity.
- **Session model:** Persistent client (client stores hint and set keys between queries).
- **Cold start suitability:** No -- requires offline phase with Õ(n) server computation before any query.
- **Amortization crossover (multi-query):** The multi-query scheme (Theorem 17) amortizes the linear offline computation over polynomially many queries. Each online query costs Õ(sqrt(n)), so the amortized per-query cost approaches Õ(sqrt(n)) after sufficiently many queries.

### Key Tradeoffs & Limitations

- **Theory-only:** No implementation or concrete parameter analysis. All bounds include unspecified poly(λ, log n) factors.
- **Single-query vs multi-query:** The basic construction (Section 3) requires re-running the full offline phase per query. The multi-query extension (Section 4) requires PRP assumptions and the PRP-based puncturable set construction (Theorem 7) with fast InSet, adding complexity.
- **Two-server requirement:** The most efficient constructions require two non-colluding servers. The single-server variant requires LHE or FHE and has worse asymptotics (n^{2/3} vs sqrt(n) for the LHE version).
- **Communication vs standard PIR:** Online communication is Omega-tilde(sqrt(n)), which is higher than polylog(n) communication of standard cPIR (CMS99). The lower bound (Theorem 23) proves this is inherent for schemes with sublinear online time and no extra server storage.
- **Offline phase is linear:** The offline server always performs Omega(n) work, scanning the entire database. This is unavoidable by the BIM04 lower bound. The benefit is that this work happens *before* the client decides which bit to read.

### Open Problems

The paper lists the following open questions (Section 7, p.29):&#8201;[^43]

1. Is it possible to construct offline/online PIR schemes in which the client runs in total time o(n), stores o(n) bits, and has online running time polylog(n)?
2. Does Theorem 22 (FHE-based single-server optimal scheme) follow from an assumption weaker than FHE?
3. Can the multi-query scheme of Section 4 be constructed with only one server?
4. Are there simpler constructions of sparse DPFs than those implied by CK20's puncturable pseudorandom sets?

[^43]: Section 7 (p.29): Open questions.

### Uncertainties

- The paper uses "n" exclusively for the database size in bits (n = total bits, not N records of w bits). This is consistent with multi-server PIR conventions but differs from Group A/B/C papers that typically use N for the number of records.
- Remark 12 (p.18) states that the poly(λ, log n) hidden factors "can be made as small as O(λ log n)" but does not provide a worked example with concrete parameters.
- The relationship between Construction 16 (single-query) and Construction 44 (multi-query) involves subtle changes to the hint structure: in Construction 44, the client holds m *independent* set keys rather than shifts of a single key, which changes the client storage structure and the offline communication pattern.
- Remark 5 (p.14): Construction 4 (puncturable pseudorandom set from puncturable PRF) has imperfect correctness -- Gen may fail with negligible probability. This is handled by treating sk = bottom as a fixed set, but the security analysis must account for this.
