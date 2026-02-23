## ThorPIR -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [ThorPIR: Single Server PIR via Homomorphic Thorp Shuffles](https://eprint.iacr.org/2024/482) (2024) |
| **Archetype** | Construction (primary) + Building-block (secondary: LWR-based FHE-friendly PRG) |
| **PIR Category** | **Group A + D hybrid** -- FHE-based PIR (Group A) with client-dependent preprocessing (Group D)&#8201;[^1] |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | LWR (Learning With Rounding); conjectured tighter Thorp shuffle bound (Conjecture 3.3) for best parameters&#8201;[^2] |
| **Correctness model** | Deterministic (given correct FHE decryption) |
| **Rounds (online)** | 1 (non-interactive: client sends Q indices, server returns Q elements) |
| **Record-size regime** | Small (360 bytes per element in benchmarks) |

[^1]: Filed in Group A but the preprocessing is client-dependent: the client generates BFV keys and encrypted PRG seeds, and the server homomorphically computes a per-client shuffled/hinted database. This makes it functionally a Group A + Group D hybrid.

[^2]: Two security tiers: (1) **Proven security** (Theorem 4.5) relies on BFV semantic security + LWR hardness + the proven Thorp shuffle mixing bound (Theorem 3.2), requiring r=480 shuffle rounds. (2) **Conjectured security** (Conjecture 3.3) assumes the Thorp shuffle is indistinguishable from random after only λ=45 rounds for computational adversaries, reducing preprocessing by >100x. LWR security parameters are heuristically estimated via reduction to LWE using the Albrecht-Player-Scott estimator [2].

---

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Lazzaretti-Papamanthou (USENIX Security 2024) [55] two-server scheme (hint structure); Corrigan-Gibbs-Kogan (EUROCRYPT 2020) [28] offline/online PIR model; Morris et al. [72] Thorp shuffle mixing analysis; Liu-Wang [62] relaxed BFV bootstrapping |
| **What changed** | Prior single-server client-preprocessing PIR schemes either required O(N) offline bandwidth (streaming DB to client) or had FHE circuits of depth Omega_λ(N), making them impractical. ThorPIR replaces the random permutation with a Thorp shuffle (O(λ) depth), builds an LWR-based FHE-friendly PRG (1680x faster than homomorphic AES), and uses relaxed bootstrapping to achieve sublinear offline bandwidth with a low-depth, parallelizable preprocessing circuit. |
| **Superseded by** | N/A (as of 2024) |
| **Concurrent work** | Deo et al. [32] independently propose homomorphic LWR-based PRG evaluation for transciphering. ThorPIR's PRG is 3-10x faster per-bit. |

---

### Core Idea

ThorPIR is a single-server client-preprocessing PIR scheme achieving sublinear offline bandwidth and a low-depth FHE preprocessing circuit. The key insight is replacing the random permutation used in prior hint-based PIR constructions&#8201;[^3] with a **Thorp shuffle** -- a card-shuffling algorithm that can be evaluated as an O(λ)-depth circuit (vs. O(N) depth for Fisher-Yates or O(λ * log N) depth for sorting networks). The client sends encrypted PRG seeds to the server, which homomorphically generates pseudorandom bits via a novel LWR-based PRG, homomorphically performs the Thorp shuffle on the encrypted database, and returns encrypted hints. The client decrypts to obtain hints identical in structure to the two-server scheme of [55], enabling sublinear online queries.

[^3]: The two-server construction of [55] uses random permutations to generate XOR-parity hints. The single-server adaptation requires the server to compute these permutations obliviously under FHE, which is the central challenge this paper solves.

---

### Novel Primitives / Abstractions

#### 1. LWR-based FHE-friendly PRG

| Field | Detail |
|-------|--------|
| **Name** | (t, m, 1/2)-PRG (Algorithm 4) |
| **Type** | Cryptographic primitive |
| **Interface** | Input: seed s in Z_t^n. Output: m pseudorandom bits. Public parameter: k matrices A_1,...,A_k in Z_t^{m x n}. |
| **Security definition** | PRG security under LWR_{n,t,2,R_i} for rounding functions R_i (Theorem 4.3)&#8201;[^4] |
| **Purpose** | Generate the N * r * log(N) random bits needed for the Thorp shuffle under FHE, replacing AES which costs ~672ms/bit homomorphically vs. ~0.4ms/bit for this PRG&#8201;[^5] |
| **Built from** | LWR assumption. Compute R(A_i * s) for k independent matrices, combine via a product-of-indicators formula to achieve output bias 1/2 + t^{-k} = 1/2 + negl(λ). |
| **Standalone complexity** | O(λ) multiplications total: n plaintext multiplications for A*s, then k * log(t) ciphertext multiplications for the rounding function R(x) = (x^{(t-1)/2} + 1) * 2^{-1}. Depth: O(λ / log(t) + log(t)). |
| **Key optimization** | The rounding function R uses repeated squaring (log(t) multiplications) instead of degree-(t-1) interpolation, exploiting Fermat's little theorem in Z_t. |

[^4]: The reduction goes: LWR_{n,t,2,R_i} is equivalent to LWR_{n,t,2,floor(.)} (Lemma 4.1) which reduces to standard LWE with appropriate parameters. Two heuristic assumptions are made: (1) LWR with non-standard rounding R_i is equivalent to LWR with standard rounding, (2) LWR_{n,t,2,floor(.)} is equivalent to LWE with dimension n, ciphertext modulus q, and Gaussian error sigma such that Pr[|e| < t/2] > 1 - negl(λ).

[^5]: 1680x improvement over homomorphic AES evaluation, which takes 86 seconds for 128 bits on a single CPU [89].

#### 2. Improved Thorp Shuffle Mixing Bound

| Field | Detail |
|-------|--------|
| **Name** | Theorem 3.2 (Improved Thorp Shuffle Bound) |
| **Type** | Theoretical result |
| **Statement** | For N = 2^n, after t rounds of Thorp Shuffle, any adaptive q-query unbounded adversary has advantage at most (2q(4n+t)/(4n-4)) * (4qn/N)^{t/(4(n-2))} over a random permutation. |
| **Improvement over prior** | Reduces the number of required rounds by ~2.5x compared to Morris et al. [72], which had advantage bound (2q(n+t)/(n+1)) * (2qn/N)^{t/(2(n+1))}. The improvement comes from the exponent changing from t/(2n) to approximately t/(4n) and the base from (4q*logN/N)^{1/2} to (2q*logN/N). |
| **Proof technique** | Refined Markov chain coupling argument. Identifies two new "convergence opportunities" where pair processes can match, increasing the coupling probability per round by more than half compared to [72]. |

---

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring-LWE (for BFV semantic security) + LWR (for PRG security)&#8201;[^6] |
| **Encryption scheme** | BFV (Brakerski/Fan-Vercauteran) fully homomorphic encryption |
| **Ring** | Z_t[X]/(X^D + 1) where D is a power of two |
| **Plaintext modulus t** | 65537 (proven security) or 786433 (conjectured security) |
| **Ring dimension D** | 2^15 = 32768 (proven) or 2^17 = 131072 (conjectured) |
| **Ciphertext modulus** | 860 bits, composed of 16 primes of ~60 bits each (proven security); 3000 bits (conjectured) |
| **Key structure** | Per-client BFV key pair (pk_BFV, sk_BFV); PRG seeds s in Z_t^n encrypted under pk_BFV |
| **Noise management** | Relaxed bootstrapping [62] -- correctness holds only for a fixed subset of the plaintext space (sufficient since both PRG outputs and DB entries use subsets of Z_t). Applied every c levels for (r+1)*log(N)/c total bootstrappings.&#8201;[^7] |

[^6]: No concrete LWR security estimators exist. The authors heuristically estimate security by reducing LWR to LWE and using the Albrecht-Player-Scott LWE estimator [2]. Under this heuristic, n=220, t=65537, sigma=128 provides >= 128 bits of computational security.

[^7]: Each relaxed bootstrapping yields ~400 bits of noise budget (proven params) or ~750 bits (conjectured params), allowing 8 levels of Thorp shuffle before the next bootstrapping. Total bootstrappings: ceil(480/8) = 55 (proven) or 0 (conjectured -- no bootstrapping needed since depth is only 45).

---

### Key Data Structures

- **Database encoding**: DB in {0,1}^N split into Q partitions db_1,...,db_Q, each of size K = N/Q elements. Elements addressed as tuples (q,k) in [Q] x [K].&#8201;[^8]
- **Hints**: K = N/Q XOR-parity hints h_1,...,h_K where h_j = XOR_{i in [Q]} db_i[tau_i(j)] for Q Thorp shuffle permutations tau_1,...,tau_Q.
- **Client state (st)**: Hints H = (h_1,...,h_K), per-query Used dictionaries (Used_i for i in [Q]), and Thorp shuffle seeds (s_1,...,s_Q). Total storage: O(N/Q + T*Q) = 377 MB for benchmark parameters.
- **USED dictionaries**: Track which partition indices have been queried for each permutation, enabling dummy-query resampling for privacy.

[^8]: With N = 2^30 entries of 360 bytes = 2880 bits each, and Q = 2^10, there are Q = 2^10 partitions each containing K = 2^20 elements. Each BFV ciphertext can hold D = 32768 slots, so 2880/3 = 960 ciphertexts per partition (3 bits per slot).

---

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Setup** | Client | Generate BFV keys, choose k such that t^{-k} = negl(λ), choose n for LWR, sample PRG seed s, encrypt s under pk_BFV, choose Thorp shuffle round count t. | pp = (pp_BFV, pk_BFV, ct_s, t) sent to server | Once per preprocessing epoch |
| **PRG Expansion** | Server (under FHE) | Homomorphically evaluate f_{A_1,...,A_k}(ct_s) to generate (r+1)*log(N)*N random bits as BFV ciphertexts ct_{bits,i,j}. | -- | During preprocessing |
| **Homomorphic Thorp Shuffle** | Server (under FHE) | Run bfvThorp (Algorithm 5): for each of r rounds x n levels, perform butterfly-network swaps on encrypted DB using encrypted random bits. Apply relaxed bootstrapping every c levels.&#8201;[^9] | -- | During preprocessing |
| **Hint Return** | Server | Sum the Q shuffled encrypted databases: return sum_{i in [Q]} db_{ct,i}. | 1.4 GB download | Once per preprocessing epoch |
| **Hint Decryption** | Client | Decrypt returned ciphertexts to obtain hints h_1,...,h_K. | -- | Once per preprocessing epoch |
| **Query** | Client | Compute y = Th.Inv(s_q, k), generate Q partition indices o_i (resampling from [K]\Used_i if already seen). Send rq = (o_1,...,o_Q). | O_λ(Q) = 389 KB upload | Per query |
| **Answer** | Server | Return a = (db_1[o_1],...,db_Q[o_Q]). | 389 KB download&#8201;[^10] | Per query |
| **Reconstruct** | Client | Store db_i[o_i] in Used_i for all i. Compute DB[x] = (XOR_{i!=q} Used_i[a_i]) XOR h_y. | -- | Per query |

[^9]: The butterfly network equivalence (n rounds of butterfly = n rounds of Thorp Shuffle, per [30, Lemma 1]) is essential. In the butterfly formulation, at round l in [n], position j is swapped with position j + 2^{l-1} for all j where floor(j / 2^{l-1}) is odd. Elements at the same 2^{l-1} stride are in the same ciphertext when 2^{l-1} < D, enabling efficient SIMD swaps.

[^10]: Online bandwidth is dominated by the Q = 1024 partition indices and Q returned elements. Each element is 360 bytes. Total: Q * 360 bytes per direction, plus small overhead for Thorp shuffle evaluations.

---

### Preprocessing Metrics (Group D style)

| Metric | Proven Security (Thm 4.5) | Conjectured Security (Conj 3.3) |
|--------|---------------------------|----------------------------------|
| **Preprocessing depth** | 480 (Thorp rounds) | 45 |
| **Offline bandwidth** | 1.4 GB | 1.4 GB |
| **Client time (decryption)** | 38.4s (single-thread); ~9.6s (8 threads) | 38.4s |
| **Server time (FHE computation)** | 2.16 hours (128K GPUs) | 0.015 hours (128K GPUs) |
| **End-to-end preprocessing time** | 2.17 hours (@30MB/s BW) | 0.03 hours (@30MB/s BW)&#8201;[^11] |
| **Queries before re-preprocessing** | Q = 2^10 = 1024 | Q = 2^10 = 1024 |
| **Client storage** | 377 MB | 377 MB |
| **Parallelizability** | Fully parallelizable over 2^30/2^16 * 2880/3 > 2^27 instances | Same |
| **Preprocessing cost (USD)** | ~$25,353 (128K RTX 3060 Ti for ~1 hour) | ~$172 |

[^11]: End-to-end time is max(server_compute_time, bandwidth_transfer_time) + client_decrypt_time since computation and transfer can overlap. At 30MB/s, downloading 1.4GB takes ~47 seconds; the bottleneck is server computation for proven security or bandwidth for conjectured security.

---

### Correctness Analysis

#### Option C: Deterministic Correctness

Deterministic correctness follows from: (1) BFV decryption correctness (unconditional given sufficient noise budget), (2) correctness of the Thorp shuffle permutation (the homomorphic evaluation exactly matches plaintext evaluation), and (3) the hint reconstruction formula DB[x] = h XOR (XOR of cached elements) recovers the target element by cancellation.&#8201;[^12] The relaxed bootstrapping preserves correctness because PRG outputs and DB entries occupy a fixed subset of the BFV plaintext space Z_t, which is exactly the domain where relaxed bootstrapping guarantees correct output [62].

[^12]: Formally, for query x = (q,k), the client computes j = tau_q^{-1}(k), then DB[x] = db_q[k] = h_j XOR (XOR_{i != q} db_i[tau_i(j)]) XOR (XOR_{i != q} db_i[tau_i(j)]) -- the two XOR terms cancel, leaving db_q[k].

---

### Complexity

#### Asymptotic Complexity (Table 1 from paper)

| Metric | Asymptotic | Phase |
|--------|-----------|-------|
| **Preprocessing depth** | O_λ(1) | Offline |
| **Offline bandwidth** | O(N^{2/3}) | Offline |
| **Preprocessing time (client)** | O_λ(N) (decryption) | Offline |
| **Preprocessing time (server)** | O_λ(N) (FHE computation) | Offline |
| **Online query + answer time (client)** | O_λ(Q) | Online |
| **Online bandwidth** | O(N^{1/3}) per query | Online |
| **Online server time** | O(Q) per query | Online |
| **# queries per epoch** | N^{1/3} (for Q = T = N^{1/3}) | -- |
| **Client storage** | O(N^{2/3}) | Persistent |
| **Update time** | O_λ(1) per element update | Online |

**Parameter setting for sublinear asymptotics**: Q * T = o(N) is required. Choosing Q = T = N^{1/3} yields O(N^{2/3}) amortized server time, O(N^{2/3}) offline+total bandwidth, O(N^{1/3}) online bandwidth and query time, and O(N^{2/3}) client storage.&#8201;[^13]

[^13]: Table 1 in the paper compares ThorPIR's asymptotics against PIANO [91], MIR [73], CHK1/CHK2 [27], ZLTS [90], and LP [53]. ThorPIR is the only scheme besides CHK1 with sublinear preprocessing depth. Compared to CHK1, ThorPIR wins on every metric except depth (O_λ(1) vs O(1) for CHK1) due to CHK1's large hidden constants: CHK1's offline bandwidth and storage are >10x and >5x the database size respectively.

#### Concrete Benchmarks (Table 2 from paper)

**Database**: N = 2^30 entries, 360 bytes each = 360 GB total. Server: 128K GPUs (RTX 3060 Ti equivalent). Client: single-thread CPU.

| Scheme | Depth | Preprocess BW | Client Time | Server Time | E2E Time | Query BW | Query Time | Client Space |
|--------|-------|--------------|-------------|-------------|----------|----------|------------|--------------|
| PIANO [91] | N/A | 360 GB | 1.9H | N/A | 3.4H | 5.93 MB | 35.3ms | 1.74 GB |
| MIR [73] | N/A | 360 GB | 1H | N/A | 3.4H | 62.1 KB | 10.3ms | 1.42 GB |
| CHK1 [27, Thm 4.1] | 1 | 5.7 TB | 1H | 0.3H | 52.8H | 11.9 MB | 1.9s | 1.9 TB |
| CHK2 [27, Thm 5.1] | >2^30 | 2.4 GB | 65.8s | >19,000H | >19,000H | 382 KB | 10.3ms | 1.8 GB |
| ZLTS [90] | >2^30 | 2.4 GB | 65.8s | >19,000H | >19,000H | >0.5 GB | -- | 1.75 GB |
| LP [53] | >2^30 | 2.4 GB | 65.8s | >19,000H | >19,000H | >0.5 GB | -- | 1.75 GB |
| **ThorPIR (proven)** | **480** | **1.4 GB** | **38.4s** | **2.16H** | **2.17H** | **389 KB** | **3.6ms** | **377 MB** |
| **ThorPIR (conjectured)** | **45** | **1.4 GB** | **38.4s** | **0.015H** | **0.03H** | **389 KB** | **3.6ms** | **377 MB** |
| SimplePIR [47] | N/A | 2.2 GB | N/A | <1 Min | <2 Min | 4.5 MB | 3.6s | 2.2 GB |
| FrodoPIR [31] | N/A | 2.2 GB | N/A | <1 Min | <2 Min | 4.5 MB | 3.6s | 2.2 GB |

**Key comparisons**:
- **vs. PIANO/MIR** (streaming Group D): ThorPIR achieves ~2x faster E2E preprocessing at 30 MB/s bandwidth, but the real advantage emerges at lower bandwidth (10 MB/s: ThorPIR ~2H vs. MIR/PIANO >10H) since ThorPIR's offline bandwidth is 1.4 GB vs. 360 GB.&#8201;[^14]
- **vs. CHK2/ZLTS/LP** (FHE-based sublinear bandwidth): ThorPIR's depth is 480 vs. >2^30, a **six orders of magnitude improvement**. This is the paper's core advantage: low depth enables parallelization over 128K GPUs (prior FHE-based works cannot parallelize at all) and dramatically reduces bootstrapping cost.&#8201;[^15]
- **vs. SimplePIR/FrodoPIR** (no preprocessing / client-independent): These have no client-dependent preprocessing cost but O(N) online server time and 2.2 GB client storage. ThorPIR trades preprocessing for 3.6ms online queries with 377 MB storage.

[^14]: At 30 MB/s: PIANO streams 360 GB in ~3.3 hours (most of its 3.4H E2E), while ThorPIR downloads only 1.4 GB in ~47 seconds. The gap widens linearly with decreasing bandwidth.

[^15]: The depth > 2^30 for CHK2/ZLTS/LP means each level requires a bootstrapping operation. With relaxed bootstrapping at 0.86s/op, the minimum serial time is 2^30/13 * 0.86s = 19,731 hours = ~2.25 years of continuous GPU computation, which cannot be parallelized because the operations are sequential.

---

### Online Phase Detail

**Query time breakdown** (per query):
- Client: 1 inverse Thorp shuffle evaluation + (Q-1) forward Thorp shuffle evaluations + Q resampling checks against USED dictionaries. Total: O_λ(Q) = O(λ * Q) Thorp shuffle operations at ~O(λ) each. Concretely: ~3.6 ms.&#8201;[^16]
- Server: Q random accesses into the partitioned database, returning Q elements. Total: O(Q).

**Update mechanism**: For a database element update at position (q,k), the server sends the index and the XOR-diff (old XOR new) to the client. The client computes j = Th.Inv(s_q, k), finds which hint h_j is affected, and updates h_j = h_j XOR old XOR new. Also updates Used_q[k] if present. This takes O_λ(1) time (one inverse Thorp shuffle + two XORs + one hash table lookup). Prior schemes require Omega(sqrt(N)) time per update.&#8201;[^17]

[^16]: The 3.6ms online time is validated by benchmarking on Amazon EC2 t2.large instance against PIANO [91], MIR [73], and LP [55] implementations run on smaller databases (1M, 2M, 4M elements of 360 bytes), then extrapolating to 2^30 elements based on per-access cost.

[^17]: This O_λ(1) update property is unique to ThorPIR among preprocessing PIR schemes. It follows from the Thorp shuffle's efficient point-evaluation: finding which hint an element belongs to requires only evaluating Th.Inv at a single point, not scanning all hints.

---

### BFV Operation Costs (measured on GCP N2, Intel Xeon Gold 6268, D=32768)

| Operation | Time (single-thread CPU) |
|-----------|-------------------------|
| Ciphertext multiplication (+ relinearization) | 315 ms |
| Plaintext multiplication (with NTT) | 27 ms |
| Plaintext multiplication (without NTT) | 1.5 ms |
| Addition | 0.68 ms |
| Rotation | 125 ms |
| Decryption | 2.5 ms |
| Relaxed bootstrapping (3-bit plaintext) | 43 s |

---

### Preprocessing Runtime Estimation Detail

**PRG evaluation (single-thread CPU)**: n=220 plaintext multiplications (seed expansion) + 16 ciphertext multiplications (squaring for Fermat) + 4 additional ciphertext multiplications (k-1=4 repetitions) + 7 levels of ciphertext multiplication (modulus switching overhead). Total: ~23 seconds per PRG call, reducible to ~12.3 seconds with input Q reduced from 860 to 680 bits.&#8201;[^18]

**Thorp shuffle (single-thread CPU)**: Each swap level requires 4 ciphertext multiplications, 4 rotations, 4 plaintext multiplications, and 10 additions. Each level has 2^20/2^16 * 2880/3 = 7680 ciphertext pairs to process. With GPU acceleration (~50x per [76]), a single GPU processes one level in time proportional to 7680 one-level shuffles. Total for 480 levels with 55 bootstrappings: ~21,666 hours on one GPU, or ~2 hours on 128K GPUs.&#8201;[^18b]

[^18]: The PRG seed is provided in NTT form, saving the initial NTT conversion. Modulus switching every 2 ciphertext multiplication levels reduces by ~60/Q per level.

[^18b]: The construction is "embarrassingly parallel": each of the 7680 ciphertext-pair shuffle operations per level is independent, and the bootstrapping operations are also independent across ciphertext pairs within a level. Only the level-to-level sequencing introduces serial dependencies.

---

### Conjectured Security Variant

Under Conjecture 3.3, the Thorp shuffle requires only λ = 45 rounds (instead of 480) for 128-bit security against computational adversaries making q = sqrt(N) queries.&#8201;[^19] This eliminates bootstrapping entirely and enables:

| Change | Proven | Conjectured |
|--------|--------|-------------|
| Thorp rounds r | 480 | 45 |
| Ring dimension D | 2^15 | 2^17 |
| Plaintext modulus t | 65537 | 786433 (20-bit prime) |
| Ciphertext modulus | 860 bits | 3000 bits |
| PRG repetitions k | 5 | 4 |
| Bootstrapping needed | Yes (55 times) | No |
| Total noise budget | ~7600 bits (with bootstrapping) | 3000 bits (raw) |
| Server preprocessing time | 2.16H (128K GPUs) | 0.015H (128K GPUs) |
| Dollar cost | ~$25,353 | ~$172 |

The conjectured parameters use D = 2^17 (SEAL library does not support this; runtime estimated theoretically as D*log(D) scaling). Without bootstrapping, 20 bits per slot are usable, and all 2250 bits of noise budget for the shuffle plus 750 bits for the PRG fit within the 3000-bit ciphertext modulus.&#8201;[^20]

[^19]: The conjecture states: for N = 2^n = Omega(λ^c), q = sqrt(N), after t = λ rounds, any adaptive q-query PPT adversary has advantage at most 2^{-c*λ} in distinguishing the Thorp shuffle from a random permutation. The known attack for q > 2 and t = log(N) rounds (checking where elements 1 and 2 land -- they always end in different halves) fails once t = omega(log N) since the elements may then end in the same half.

[^20]: The theoretical runtime estimate for conjectured parameters: with 50K cores of CPUs (GCP N2 instance) instead of 128K GPUs, the cost is roughly 1.9 hours with similar dollar cost (~$172). Even 1024 RTX 3060 Ti GPUs achieve ~1.9 hours.

---

### Dynamic Databases and Updates

ThorPIR handles database updates in O_λ(1) time per element:
1. Server streams the update (index, old value, new value) to all clients.
2. Client computes j = Th.Inv(s_q, k) to find the affected hint.
3. Client updates: h_j = h_j XOR old XOR new.
4. If the element is cached in Used_q, update Used_q[k] = new.

This is one inverse Thorp shuffle evaluation, two XORs, and a hash table update -- concretely nanoseconds. All prior schemes require Omega(sqrt(N)) per update (either scanning sqrt(N) hints or recomputing a matrix-vector product).&#8201;[^21]

[^21]: For PIANO/MIR, the client must check which of its sqrt(N) hints contain the updated element, requiring sqrt(N) random accesses. For SimplePIR/FrodoPIR, the hint is DB * A where A is a sqrt(N) x n matrix, so updating one DB entry requires recomputing one row's contribution: O_λ(sqrt(N)) time.

---

### Security Analysis Summary

**Privacy** (Theorem 7.1): Proven via simulation. In the preprocessing phase, the client downloads the entire database (linear-bandwidth variant) or sends only encrypted parameters (sublinear variant), leaking nothing about future queries. In the online phase, the Q indices o_1,...,o_Q sent to the server are each uniformly distributed in [K] from the server's perspective, by the CCA security of the Thorp shuffle and the resampling of already-used indices from [K]\USED_i.&#8201;[^22]

**Key security properties**:
- Query privacy against adaptive adversaries for T = o(N) total queries per preprocessing epoch.
- Preprocessing reveals nothing: in the linear-bandwidth variant, the client streams the full DB; in the sublinear variant, the server sees only BFV-encrypted seeds.
- After T queries, re-preprocessing is required (the USED dictionaries grow and the shuffle's advantage degrades).

[^22]: The proof proceeds via three experiments: Experiment 0 (ideal -- random points, perfect privacy), Experiment 1 (random permutations replacing Thorp shuffles), Experiment 2 (actual construction). Experiments 1 and 2 are indistinguishable by CCA security of the Thorp shuffle. Experiments 0 and 1 are indistinguishable by a hybrid argument over the T queries, using the fact that random permutation outputs at fresh points are uniform.

---

### Comparison: Why Not Sorting Networks?

The paper explicitly addresses this alternative (Section 9.1). Two reasons:
1. **Depth**: The best O(log N)-depth sorting networks (AKS [1]) have constant factor ~1800. Practical O(log^2 N)-depth networks are still asymptotically worse and concretely far deeper than Thorp shuffles. Under FHE, each comparison requires O(λ) depth (to compare λ-bit random tags), giving total depth Omega(λ * log N) vs. O(λ) for the Thorp shuffle.
2. **Tag size**: Sorting networks require each element to be assigned a random tag of at least λ bits (to avoid collision with probability >= 2^{-λ}). This multiplies the depth by λ, whereas the Thorp shuffle needs only 1 random bit per element per round.

---

### Uncertainties and Open Questions

1. **LWR parameter security is heuristic.** No concrete LWR security estimators exist. The reduction LWR -> LWE uses two unproven assumptions (footnote 6, p.25). The actual security level may be lower than 128 bits.&#8201;[^23]
2. **Conjecture 3.3 is unproven.** The >100x preprocessing improvement relies on an unproven conjecture about the Thorp shuffle's mixing time for computational adversaries. The known lower bound on distinguishing rounds is omega(log N); the conjecture asserts λ rounds suffice for 2^{-c*λ} advantage. There is a known attack for t <= log N rounds but no known attack for t > λ.
3. **No implementation exists.** All benchmarks in Table 2 are estimates based on counting FHE operations and measured per-operation costs. The SEAL library does not support D = 2^17 needed for conjectured parameters.
4. **GPU acceleration is assumed, not measured.** The 50x GPU speedup factor is taken from [76]; actual performance on the specific circuit structure of homomorphic Thorp shuffles may differ.
5. **Large server hardware requirement.** The proven-security variant requires 128K GPUs for ~2 hour preprocessing. This is a datacenter-scale deployment costing ~$25K per client preprocessing epoch.
6. **Relaxed bootstrapping correctness.** The relaxed bootstrapping technique [62] is correct only for inputs in a fixed subset of Z_t. The paper argues this is satisfied since PRG outputs and DB entries use known subsets, but the interaction between PRG output distribution and the bootstrapping domain needs careful verification in implementation.

[^23]: Specifically, the heuristic assumption (1) -- that LWR_{n,t,2,R_i} for the specific non-standard rounding function R_i is equivalent to LWR_{n,t,2,floor(.)} -- has no formal reduction. The functions R_i involve complex probability distributions (see definition after Theorem 4.3, p.20) that differ for each i in [k].

---

### Key Takeaways for Engineering

1. **The Thorp shuffle is the key enabler.** Its O(λ)-depth circuit is what makes FHE-based preprocessing practical. The 2.5x improvement in mixing bound (Theorem 3.2) directly reduces preprocessing cost by 2.5x.
2. **The LWR-based PRG is independently useful.** At 0.4 ms/bit vs. 672 ms/bit for homomorphic AES, it is a 1680x improvement applicable to any FHE application needing pseudorandom bit generation.
3. **Online phase is already fast.** At 3.6 ms per query and 389 KB bandwidth, the online phase is competitive with the best PIR schemes. The bottleneck is preprocessing cost, which is where the conjectured bound matters most.
4. **Update time is a unique advantage.** O_λ(1) per update vs. Omega(sqrt(N)) for all prior schemes makes ThorPIR preferred for dynamic databases.
5. **The conjectured security variant is the practical target.** At $172 per client preprocessing (vs. $25K with proven security), the conjectured variant is the only commercially viable option. Proving Conjecture 3.3 (or something close) is the most impactful open problem for making this scheme practical.
