## WhisPIR -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [WhisPIR: Stateless Private Information Retrieval with Low Communication](https://eprint.iacr.org/2024/266) (2024) |
| **Archetype** | Construction + Engineering optimization |
| **PIR Category** | Group B -- Stateless single-server (sub-model: CRS / query-bundled) |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | RLWE; no circular security required |
| **Correctness model** | Deterministic (for honest execution, conditioned on noise staying within bounds) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Small to Moderate (optimized for entries up to a few KB; large entries handled by splitting across R_p elements) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Spiral [Group A] (protocol structure: compressed query + index expansion + homomorphic DB lookup), SealPIR/OnionPIR [Group A] (index expansion algorithm), HintlessPIR [Group B] (stateless model, key precomputation from Li et al. [LMRSW23]) |
| **What changed** | Replaces Spiral's Regev+GSW composition with BGV encryption exclusively; uses non-compact BGV (no relinearization) to avoid sending relinearization keys; introduces optimized index expansion with a single rotation key and iterative precomputed key switching |
| **Superseded by** | N/A |
| **Concurrent work** | HintlessPIR [LMRSW23] is noted as a concurrent stateless PIR protocol that also transfers FHE evaluation keys with the query; WhisPIR's computation is Spiral-like while HintlessPIR's is SimplePIR/TipToe-like |

### Core Idea

WhisPIR is a fully stateless single-server PIR protocol that achieves low per-query communication by bundling compressed evaluation keys with the query itself, eliminating any offline phase or persistent client state.[^1] The key technical insight is to use the non-compact variant of the BGV homomorphic encryption scheme -- allowing ciphertexts to grow beyond the standard 2-component form during homomorphic multiplications -- which eliminates the need for relinearization keys and reduces both communication and computation.[^2] WhisPIR further optimizes the index expansion algorithm (inherited from SealPIR/OnionPIR) for the single-rotation-key setting by carefully choosing the generator for substitution operations, reducing the number of rotations by 2--50x over the naive choice, and introduces iterative precomputed key switching that rotates the key instead of the ciphertext.[^3]

[^1]: Abstract (p.1): "We introduce WhisPIR, a fully stateless PIR protocol with low per-query communication. WhisPIR clients are all ephemeral, meaning that they appear with only the protocol public parameters and disappear as soon as their query is complete."

[^2]: Section 3.3 (p.8): "An important optimization in our protocol is that we do not relinearize the result of multiplications as in most instantiations of BGV. This can be viewed as the non-compact variant of BGV, where the size of the ciphertext grows with the depth of the function."

[^3]: Section 1.2 (p.3): "WhisPIR achieves its performance by relying on several novel optimizations... we optimize the index expansion algorithm for when only one rotation key is available... we can reduce the number of rotations required to expand the index by over an order of magnitude."

---

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring Learning with Errors (RLWE) over R_q = Z_q[x]/(x^n + 1) where n is a power of two[^4] |
| **Encryption/encoding scheme** | BGV (Brakerski-Gentry-Vaikuntanathan) [BGV12]: single encryption scheme for all operations, using non-compact variant that does not relinearize after homomorphic multiplications[^5] |
| **Ring / Field** | R_q := Z_q[x]/(x^n + 1), n in {2^12, 2^13}; plaintext ring R_p with p coprime to q; ring expansion factor gamma_R (empirically set to 2*sqrt(n))[^6] |
| **Key structure** | Single secret s sampled from error distribution chi over R_q; switching key swk_pi consists of w = ceil(log_B(q)) tuples of (b'_i, a'_i) in R_q^2; all keys derived from a PRG seed sigma[^7] |
| **Correctness condition** | The noise term of the ciphertext, defined as ct(sk) = m + p * e, must satisfy ||e||_inf < q/p for correct decryption[^8] |

[^4]: Section 2.2 (p.4): "The BGV scheme is parametrized by a ring R_q := Z_q[x]/(x^n + 1) and a plaintext modulus p coprime to q."

[^5]: Section 2.2 (p.4): BGV encryption: ct = (m + p*e - a*s, a) where all operations are over R_q. Decryption: parse ct = (c_0, c_1) and return (c_0 + c_1*s mod q) mod p.

[^6]: Remark A.1 (p.14): "We leverage empirical results [HPS19, Section 6.1] demonstrating that an expansion factor of gamma_R = 2*sqrt(n) is sufficient to bound ||a*b||_inf <= gamma_R * ||a||_inf * ||b||_inf."

[^7]: Algorithm 4 (p.9): Setup samples PRG seed sigma and uses it to generate c_1 and {a'_i} for switching key polynomials.

[^8]: Section 2.2 (p.4): "The correctness of the Decrypt algorithm holds as long as the noise term of the ciphertext, defined as ct(sk) = m + p*e, satisfies ||e||_inf < q/p."

---

### Key Data Structures

- **Database:** D in Z_t^N, indexed by i in [N]. Digitized into k digits in base l, so i = (i_1, ..., i_k) with each i_j in [l], where l^k >= N. Packed into (R_p)^(l^k) ring elements, each holding n * floor(log_2(p)) bits.[^9]
- **Public parameters (pp):** Tuple (sigma, pi, k, l, n, q, B, p, N, t) -- just the PRG seed and basic parameters. Fits in a few hundred bits.[^10]
- **Server parameters (sp):** Precomputed rotations from Algorithm 2 (all outputs of iterative PreSwitch), the PRG-expanded switching key elements, and the server's copy of the database. Computed once and reused across all queries.[^11]
- **Query (qry):** Tuple (c_0, {b'_i}_{i=0}^{w-1}) -- one ciphertext component c_0 in R_q plus w switching key elements in R_q, where w = ceil(log_B(q)). Total size is (w+1) ring elements over R_q.[^12]
- **Response (ans):** A non-compact BGV ciphertext with k+1 components: (m + p*e - sum_{i=1}^{k} a_i * s^i, a_1, ..., a_k). After modulus switching, each component is over R_{p*n}, achieving near-minimal modulus.[^13]

[^9]: Section 3.1 (p.6): "Our first step is to digitize this index space with respect to some digit l, such that l^k >= N. We can now write an index i in [N] as k digits i_1, ..., i_k, i_j in [l]."

[^10]: Section 1.2 (p.3): "The only public parameters in WhisPIR are a database size and basic parameters to specify the polynomial ring for the BGV FHE scheme, which can fit into just a few hundred bits."

[^11]: Algorithm 4, step 7 (p.9): "Use Algorithm 2 to precompute all rotations in Algorithm 1. Set sp to be pp along with all outputs of all iterations of Algorithm 2 for the precomputed rotations."

[^12]: Section 3.1 (p.6): "The query consists of two pieces. The first piece is a BGV rotation key... The second piece is a BGV ciphertext encrypting the index."

[^13]: Section 3.3 (p.8): The final ciphertext has the form (m + p*e - sum a_i * s^i, a_1, ..., a_k). Remark A.2 (p.14): After modulus switching, result ciphertexts have modulus of size roughly p*n.

---

### Database Encoding

- **Representation:** k-dimensional hypercube of dimensions [l] x [l] x ... x [l] (k times), where l is the digit base and l^k >= N.[^14]
- **Record addressing:** Each index i in [N] represented as k digits (i_1, ..., i_k) in base l. Each digit encoded as a length-l one-hot binary vector, concatenated across k sets to form a k*l binary vector.[^15]
- **Preprocessing required:** Database elements packed into R_p ring elements. For entries smaller than n * floor(log_2(p)) bits, multiple entries share one ring element. Server precomputes all iterative rotations (Algorithm 2) once.[^16]
- **Record size equation:** Each R_p element encodes n * floor(log_2(p)) bits. For log(p)=1 (binary), each element holds n bits = 512 bytes (n=4096). For log(p)=8, each element holds 8n bits = 4096 bytes (n=4096).[^17]

[^14]: Section 3.1 (p.6): "We view the database as consisting of N = l^k elements of R_p."

[^15]: Section 3.1 (p.6): "The representation of an index i in [N] is in base l, where each digit is represented as a one-hot vector. In total, the representation of this digit is a k-hot binary vector of length k*l."

[^16]: Algorithm 4 (p.9): Step 7 uses Algorithm 2 to precompute all rotations.

[^17]: Section 4.1 (p.10): "For log(p) = 1, it requires about 2.1 million R_p elements to represent the database [1 GB], while for log(p) = 8 the rate increases proportionally to only require roughly 262000 R_p elements."

---

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Server | Select parameters (n, p, q, B, k, l, pi); sample PRG seed sigma; precompute all rotations via Algorithm 2 | pp (few hundred bits) published | Once (or when DB size changes significantly) |
| Query Gen | Client | Parse pp; compute index digits in base l; construct k*l one-hot vector as BGV plaintext m; sample secret s and error e; compute c_0 and switching key tuples {b'_i} from PRG seed | qry = (c_0, {b'_i}) upload ↑ | Per query |
| Answer | Server | (1) Index expansion: evaluate Algorithm 1 on c_0 using Algorithm 3 (online key switching) to produce k*l scalar encryptions. (2) Database multiplication: depth-k circuit of homomorphic multiplications (first level: plaintext-ciphertext; subsequent levels: ciphertext-ciphertext) | ans = non-compact BGV ciphertext ↓ | Per query |
| Recover | Client | Parse query state (s, i); decrypt using generalized BGV decryption for non-compact ciphertexts; extract record bits from the correct R_p position | -- | Per query |

---

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| c_0 (message term) | R_q element | n * ceil(log_2(q)) bits | Encrypted index: first component of BGV ciphertext encoding the k*l one-hot index vector |
| {b'_i}_{i=0}^{w-1} | w R_q elements | w * n * ceil(log_2(q)) bits | Switching key tuples: enable server to perform automorphisms for index expansion without the client's secret key |

Total upload size = (w+1) * n * ceil(log_2(q)) / 8 bytes, where w = ceil(log_B(q)).[^18]

[^18]: Section 3.1 (p.6): "As long as k*l <= n/2, this digit fits in a single BGV ciphertext... many encrypted indices can be sent along with the query if the application allows a client to perform a batch of queries at once."

---

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Public parameters (pp) | ↓ | O(λ) bits (~few hundred bits) | Yes (global) | PRG seed + basic parameters |
| Switching key + index ciphertext | ↑ | (w+1) ring elements over R_q | No (per query) | w = ceil(log_B(q)); dominates upload |
| Response (non-compact ciphertext) | ↓ | (k+1) ring elements over R_{p*n} (post-modswitch) | No (per query) | Dominates download; modulus switched to near-minimal |

---

### Non-Compact BGV: Key Innovation

Standard BGV ciphertexts have 2 components (c_0, c_1) in R_q^2. After multiplying two such ciphertexts, the result has 3 components (c_0, c_1, c_2) in R_q^3, requiring a relinearization step to reduce back to 2 components. Relinearization requires a relinearization key of size comparable to the switching key.[^19]

WhisPIR's insight is to skip relinearization entirely. After k levels of homomorphic multiplication, the ciphertext has k+1 components: ct = (m + p*e - sum_{i=1}^{k} a_i * s^i, a_1, ..., a_k). This "non-compact" ciphertext is still decryptable -- the client evaluates the polynomial in s to recover the message.[^20] The savings are twofold:

[^19]: Section 3.3 (p.8): "In the full instantiation of BGV, a relinearization operation reduces the degree of the ciphertext back to a linear function of the secret key."

[^20]: Section 3.3 (p.8): Non-compact ciphertext form: (m + p*e - sum a_i * s^i, a_1, ..., a_k). "By not relinearizing, we save on communicating the relinearization key, which is as large as the rotation switching key."

1. **No relinearization key needed:** The relinearization key would be as large as the rotation switching key, roughly doubling the upload. Eliminating it saves a factor of ~k in ring elements per response but removes one key from upload.[^21]
2. **Smaller response after modulus switching:** The non-compact response has k+1 components but each is over a very small modulus (roughly p*n after switching), so total response size is (k+1)*n*ceil(log_2(p*n)) bits.[^22]

[^21]: Section 3.3 (p.8): "By not relinearizing, we save on communicating the relinearization key, which is as large as the rotation switching key, at the cost of growing the number of ring elements in the resulting ciphertext by roughly a factor of k."

[^22]: Remark A.2 (p.14): "Regardless of the size of the ciphertext resulting from a homomorphic computation, as long as this ciphertext meets the requirements of Lemma A.1... it can be reduced to a minimal modulus before being sent over the network. This minimum modulus is defined by Equation (5), meaning that all result ciphertexts have a modulus of size roughly p*n."

---

### Correctness Analysis

#### Option A: FHE Noise Analysis

The noise analysis tracks worst-case infinity norms through each operation, using the ring expansion factor gamma_R.

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| Fresh encryption | \|\|e\|\|_inf <= B_chi (bound on chi samples) | -- | chi is discrete Gaussian with std dev sigma |
| Key switching (one rotation) | \|\|e'\|\|_inf <= gamma_R * B_chi * B * w | additive | B = decomposition base, w = ceil(log_B(q)); each switching adds noise bounded by gamma_R * B_chi * B * w[^23] |
| Index expansion (all rotations) | Accumulated from ~total_rotations key switches | additive | Total rotations depend on generator choice (Table 1) |
| Homomorphic multiplication (plaintext-ct) | \|\|e'\|\|_inf <= p * gamma_R * \|\|m\|\|_inf * \|\|e\|\|_inf | multiplicative | First level only; plaintext operand is DB element[^24] |
| Homomorphic multiplication (ct-ct) | \|\|e'\|\|_inf <= p * (\|\|e\|\| + \|\|e'\|\| + gamma_R * \|\|e\|\| * \|\|e'\|\|) | multiplicative | Equation (1), p.4; subsequent k-1 levels |
| Modulus switching | \|\|e'\|\|_inf <= q_2/q_1 * noise + p * gamma_R * \|\|s\|\|_inf | additive (rounding) | Lemma A.1 (p.14); reduces modulus from q to ~p*n |

[^23]: Section 2.2.1 (p.5): "The size of the resulting noise term is ||e'|| <= gamma_R * B_chi * B * w." where B_chi is bound on noise in switching key.

[^24]: Section 2.2 (p.4): EvalMultPlain noise: "||e'|| <= gamma_R * ||m|| * ||e|| < p*sqrt(n)*||e||" when using Euclidean norm.

- **Correctness condition:** ||e||_inf < q/p (equivalently, noise term in ct(sk) = m + p*e must satisfy the bound for mod-p reduction to recover m)[^25]
- **Independence heuristic used?** No explicit heuristic stated; worst-case bounds used throughout.
- **Dominant noise source:** Homomorphic multiplications in the depth-k database scan (ciphertext-ciphertext multiplications at depth >= 2)

[^25]: Section 2.2 (p.4): Decryption correctness requires ||e||_inf < q/p.

---

### Complexity

#### Core metrics

| Metric | Concrete (benchmark params) | Phase |
|--------|---------------------------|-------|
| Query size (upload) | ~10--30 KB (depends on B, w) (approximate, from Figure 2) | Online |
| Response size (download) | ~200--1200 KB (depends on p, chunks, k) (approximate, from Figure 1) | Online |
| Total communication | ~300--3000 KB (approximate, from Figures 2, 4) | Online |
| Server computation | ~0.5--30 s single-threaded (approximate, from Figures 2, 4; varies with DB size and param settings) | Online |
| Client computation | "A few dozen milliseconds regardless of the database size" (key generation, encryption, decryption)[^26] | Online |

[^26]: Section 4 (p.10): "The client's computation consists only of key generation, encryption and decryption, which take only a few dozen milliseconds regardless of the database size."

#### FHE-specific metrics

| Metric | Value | Phase |
|--------|-------|-------|
| Public parameters | O(λ) bits (~few hundred bits) | Setup (once) |
| Multiplicative depth | k (= number of hypercube dimensions, typically 3--4)[^27] | -- |
| Ring dimension n | 2^12 = 4096 or 2^13 = 8192 | -- |
| Ciphertext modulus q | Fits in two 64-bit machine words (~110 bits)[^28] | -- |

[^27]: Section 3.1 (p.6): "After this packing has been performed... we view the database as consisting of N = l^k elements of R_p, and each multiplication reduces the dimension of the database by one."

[^28]: Section 4.1 (p.10): "The BGV parameters for a database of this size are n = 2^12 and a ciphertext modulus requiring two machine words to represent (roughly 110 bits)."

---

### Optimization Catalog

| Optimization | Known/Novel | Source | Improvement | Applicable to |
|-------------|-------------|--------|-------------|---------------|
| **Optimal generator selection** for index expansion | Novel | This paper (Section 3.2) | 2--50x reduction in total rotations vs naive choice of generator[^29] | Any PIR scheme using single-key oblivious expansion over Z_{2n}* |
| **Iterative precomputed key switching** ("rotate the key, not the ciphertext") | Novel | This paper (Section 3.2, Algorithms 2--3) | ~4x computation saving per switching key inner product; enables lazy modular reduction and SIMD vectorization[^30] | Any BGV/BFV scheme computing iterated automorphisms |
| **Non-compact BGV** (skip relinearization) | Novel application | This paper (Section 3.3); non-compact HE is known but novel in PIR context | Eliminates relinearization key from upload (~halves key upload); reduces response modulus to ~p*n[^31] | Any low-depth BGV/BFV PIR where multiplicative depth k <= 4 |
| **Splitting the index into multiple ciphertexts** | Novel | This paper (Section 3.5) | Order-of-magnitude reduction in index expansion rotations; reduces index representation from k*l to k*l/c per ciphertext[^32] | Any PIR using index expansion with automorphisms |
| **Increasing plaintext modulus p** (ciphertext rate tuning) | Known | Standard BGV/BFV technique | Reduces number of R_p elements needed to represent DB; trades noise budget for fewer DB multiplications[^33] | Any ring-based PIR with DB scan phase |
| **Database chunking** (splitting DB into c chunks) | Known | Standard PIR technique (SealPIR, OnionPIR) | Reduces index space by factor c; increases download by factor c; large net computation reduction[^34] | Any single-server PIR |
| **PRG seed compression** for switching key | Known | Standard technique (Galbraith et al.) | Replaces random ring elements with PRG output; reduces upload[^35] | Any lattice-based PIR with evaluation keys |
| **Precomputing top coefficient a_k** | Novel | This paper (Section 3.3) | ~2x server computation reduction during DB scan (precompute a_k from fixed DB)[^36] | WhisPIR and similar non-compact schemes with stable DB |
| **Hoisting-style decomposition** (decompose over full modulus) | Known | [JVC18, LMRSW23] | Makes non-standard basis decomposition over RNS-unfriendly modulus optimal for single-key setting[^37] | Schemes with non-RNS-friendly key switching |

[^29]: Table 1 (p.7): For n=2^12, d=2048, optimal generator gives 113,664 total rotations vs 386,048 for naive (3.4x improvement). For d=128, optimal gives 448 vs naive thousands.

[^30]: Section 3.2 (p.7--8): "Our idea is to only rotate the input ciphertext once to the target permutation pi^u, then perform u key switching operations where each operation rotates the secret key by pi^{-1}." Algorithm 3 is "almost entirely a single inner product over R_q."

[^31]: Section 3.3 (p.8) and Remark A.2 (p.14): Non-compact form eliminates relinearization key. Modulus switching compresses response to modulus ~p*n.

[^32]: Section 3.5 (p.9): "If we split the k*l vector into two vectors each of length k*l/2, encrypt these vectors separately, then expand out the index using two invocations of Algorithm 1, we will save on the overall number of rotations."

[^33]: Section 3.5 (p.10): "Increasing the Ciphertext Rate. To improve the runtime of this phase, we decrease the number of R_p elements required to represent the database by increasing the plaintext modulus p."

[^34]: Section 3.5 (p.9): "We can consider a simple variant of the scheme where the database is split into c equal chunks... This increases the download by a factor of c, but it also reduces the index space by a factor of c."

[^35]: Algorithm 4, step 6 (p.9): "We use the standard technique of transmitting a PRG seed sigma rather than sending the truly random terms c_1 and {a'_i}."

[^36]: Section 3.3 (p.8--9): "We briefly note that we can extend the precomputation... to precompute the top coefficient a_k of the output ciphertext as long as the database remains fixed... this precomputed a_k term can save nearly a factor of 2x during the database scan."

[^37]: Section 3.1 (p.6): "A hoisting-style optimization [JVC18, LMRSW23] makes this non-standard choice of basis optimal."

---

### Performance Benchmarks

**Hardware:** Intel i7 core at 2.5 GHz, 32 GB RAM, Ubuntu 20, clang++ v10. Single-threaded. 128-bit security [ACC+18].[^38]

[^38]: Section 4 (p.10): "We implement WhisPIR in C++, compile the code with clang++ version 10, and benchmark on a machine running Ubuntu 20 with an Intel i7 core running at 2.5 GHz and 32 GB of RAM."

**Comparison baselines:** Spiral (own benchmark on same machine), SimplePIR (own benchmark on same machine, 32-byte entries), HintlessPIR (reported from [LMRSW23] at 3.0 GHz).[^39]

[^39]: Section 4 (p.10): Footnotes 2, 3, 4 give benchmark sources. Spiral and SimplePIR run on the same machine. HintlessPIR uses reported values from LMRSW23 at 3.0 GHz.

All values below are approximate (extracted from charts; the paper has no benchmark tables).

#### Figure 1: WhisPIR 1 GB database, n=2^12, q in two 64-bit words

**Minimum communication setting (log(p) = 1 except first bar at log(p) = 3):**

| Chunks (c) | Communication (KB, approx) | Server Computation (s, approx) | Notes |
|------------|---------------------------|-------------------------------|-------|
| 1 | ~350 | ~14 | Dominated by DB scan |
| 4 | ~400 | ~8 | |
| 8 | ~450 | ~7 | |
| 16 | ~500 | ~4 | |
| 32 | ~700 | ~3.5 | |

**log(p) = 8 setting:**

| Chunks (c) | Communication (KB, approx) | Server Computation (s, approx) | Notes |
|------------|---------------------------|-------------------------------|-------|
| 1 | ~350 | ~12 | DB scan ~0.75s |
| 4 | ~550 | ~6 | |
| 8 | ~800 | ~4 | |
| 16 | ~1200 | ~2.5 | |
| 32 | ~1400 | ~2 | |

#### Figure 2: Communication vs. Computation tradeoff (1 GB database)

| Scheme | Total Communication (KB, approx) | Server Computation (s, approx) |
|--------|--------------------------------|-------------------------------|
| WhisPIR (min comm) | ~300 | ~15 |
| WhisPIR (best tradeoff) | ~500 | ~3--4 |
| WhisPIR (max chunks) | ~1500--2000 | ~1--2 |
| Spiral | ~15,800 (per-query, excl. offline) | ~2.1 |
| SimplePIR | ~126,000 (per-query, excl. offline) | ~0.125 |
| HintlessPIR | ~2500--3000 | ~2--3 |

#### Figure 4: Performance across database sizes (marked sweet-spot points)

| DB Size | Communication (KB, approx) | Server Computation (s, approx) |
|---------|---------------------------|-------------------------------|
| 1 GiB | ~500--1000 | ~3--7 |
| 8 GiB | ~700--1500 | ~7--15 |
| 16 GiB | ~1000--2000 | ~12--25 |
| 32 GiB | ~1500--3000 | ~20--30 |

#### Figure 4, right panel: Marked sweet-spot points by DB size

| DB Size | Key Upload (KB, approx) | Index Upload (KB, approx) | Download (KB, approx) | DB Scan (s, approx) | Index Expand (s, approx) |
|---------|------------------------|--------------------------|----------------------|--------------------|-----------------------|
| 1 GiB | ~100 | ~200 | ~300 | ~2 | ~3 |
| 8 GiB | ~100 | ~250 | ~600 | ~4 | ~7 |
| 16 GiB | ~150 | ~350 | ~800 | ~6 | ~10 |
| 32 GiB | ~200 | ~400 | ~1200 | ~8 | ~15 |

#### Comparison: Stateless PIR (Figure 5)

**Per-query communication (right panel, minimum communication points):**

| DB Size | WhisPIR (KB, approx) | Spiral (KB, approx) | SimplePIR (KB, approx) |
|---------|---------------------|--------------------|-----------------------|
| 1 GiB | ~300 | ~300 | ~1800 |
| 8 GiB | ~500 | ~1000 | ~1500 |
| 16 GiB | ~750 | ~2000 | ~1800 |

**One-time communication (left panel, log scale):**

| DB Size | WhisPIR (KB, approx) | Spiral (KB, approx) | SimplePIR (KB, approx) |
|---------|---------------------|--------------------|-----------------------|
| 1 GiB | ~1--2 (just pp) | ~10,000--20,000 | ~100,000--200,000 |
| 8 GiB | ~1--2 | ~50,000--100,000 | ~400,000--500,000 |
| 16 GiB | ~1--2 | ~100,000+ | ~500,000+ |

WhisPIR's one-time communication is negligible (only public parameters) while Spiral and SimplePIR require large offline uploads (evaluation keys and database digests, respectively).[^40]

[^40]: Section 4.2 (p.11): "Observe that nearly all of the communication in both Spiral and SimplePIR is this protocol state."

#### Crossover analysis (WhisPIR vs Spiral)

The number of queries before Spiral outperforms WhisPIR in total communication: ~120 queries for 1 GiB, ~58 queries for 8 GiB, ~26 queries for 16 GiB.[^41] All parameter values benchmarked for WhisPIR never allow Spiral to catch up in computation.[^42]

[^41]: Section 4.2 (p.12): "Solving for the minimum number of queries before Spiral outperforms WhisPIR in communication gives 120 queries for a 1 GiB database, 58 queries for an 8 GiB database, and 26 queries for a 16 GiB database."

[^42]: Section 4.2 (p.12): "Note that all parameter values benchmarked for WhisPIR outperform Spiral in computation, so the Spiral computation will never catch up to WhisPIR without further optimization."

---

### Application Scenarios

#### Secure Blocklist Checking in E2E Encrypted Messaging

WhisPIR is applied to URL blocklist checking in end-to-end encrypted messaging apps (e.g., Signal, WhatsApp).[^43]

[^43]: Section 5 (p.12): "We propose using WhisPIR to allow users' applications to privately query the blocklist server to check membership of a message in the blocklist without revealing messages to this host server."

- **Database:** 2^24 malicious URLs, each hashed (SHA3) to 32-byte strings, inserted into a Cuckoo hash table with two hash functions. Final DB size: ~1 GB (2x the original table due to Cuckoo hashing).[^44]
- **Query protocol:** Client hashes received URL, computes two Cuckoo hash indices, issues one WhisPIR query for the pair of indices (batch of 2). Switching key reused across both indices. Checks if returned hashes match the URL hash.[^45]
- **Performance (Figure 6):** WhisPIR achieves <25% of HintlessPIR's communication while coming within ~10% of HintlessPIR's computation time for this application.[^46]

[^44]: Section 5 (p.12): "We determine a blocklist consisting of 2^24 entries... Each entry is a 32-byte hash, and the hash table is double the size of the input keys. This results in a database of roughly 1 GB."

[^45]: Section 5 (p.12--13): "The application then acts as the client in WhisPIR to query the hash table at these two indices."

[^46]: Section 5 (p.13): "WhisPIR is able to come within 10% of HintlessPIR's runtime while using 25% of the communication, and WhisPIR strictly outperforms HintlessPIR using less than 1/3 the communication."

---

### Deployment Considerations

- **Database updates:** Server precomputation (Algorithm 2 rotations) can be reused as long as DB size remains stable. The precomputed a_k coefficient must be updated when the DB changes, but the paper notes this is practical for most applications where updates are less frequent than queries.[^47]
- **Sharding:** Not discussed explicitly, but the chunking optimization (splitting DB into c chunks) naturally supports sharding.
- **Anonymous query support:** Yes -- fully stateless; clients are ephemeral with no persistent identity.[^48]
- **Session model:** Ephemeral client -- appears with only public parameters, issues one query (or batch), disappears.
- **Cold start suitability:** Excellent -- no offline phase. A new client needs only the public parameters (a few hundred bits).[^49]
- **Amortization crossover:** WhisPIR is preferred over Spiral when the number of queries per client is small (fewer than ~26--120 queries depending on DB size). As query count grows, Spiral's amortized offline cost eventually wins.[^50]
- **Parallelism:** Protocol is "embarrassingly parallel" and application-dependent. All single-threaded benchmarks; parallel performance left for future work.[^51]

[^47]: Section 3.3 (p.9): "Only in settings where the server is receiving many more updates than queries would maintaining this a_k term result in significant computational overhead."

[^48]: Section 1.2 (p.3): "WhisPIR does not require any offline phase to update any client or server parameters, regardless of any database updates."

[^49]: Section 1.2 (p.3): "The only public parameters in WhisPIR are a database size and basic parameters... which can fit into just a few hundred bits."

[^50]: Section 4.2 (p.12): Crossover at 120 queries (1 GiB), 58 queries (8 GiB), 26 queries (16 GiB).

[^51]: Section 4 (p.10): "While this protocol is 'embarrassingly' parallel, available parallelism is highly application dependent, so we leave the examination of the parallel performance for future work."

---

### Key Tradeoffs & Limitations

- **Communication-computation tradeoff is continuous:** WhisPIR supports a wide range of operating points via parameters (c, p, B, number of index ciphertexts). The tradeoff curve has a "1/x" shape -- minimum communication is relatively slow, but an order-of-magnitude computation reduction costs only ~2x more communication.[^52]
- **Computation not competitive with SimplePIR:** SimplePIR's plain-LWE matrix-vector multiply (~0.125s for 1 GB) remains faster, but SimplePIR's communication (126 MB per query) is prohibitive in stateless settings.[^53]
- **Small record sizes preferred:** WhisPIR outperforms HintlessPIR in both communication and computation for entries up to ~1 KB. For 32 KB entries (8 GiB HintlessPIR benchmark), WhisPIR outperforms in communication but not computation.[^54]
- **Ring dimension jump:** Communication jumps when the ring dimension must increase from n=2^12 to n=2^13 (at ~8--16 GiB), because each ring element doubles in size.[^55]
- **Single-threaded benchmarks only:** Parallel scaling is not characterized.

[^52]: Section 4.2 (p.11): "The general shape of the performance options for WhisPIR... is roughly a shape of 1/x."

[^53]: Section 4 (p.10): SimplePIR achieves ~0.125s but ~126 MB communication.

[^54]: Section 4.2 (p.11): "For all of these databases, WhisPIR outperforms HintlessPIR in both communication and computation... the 8 GiB database has 32 KB entries, which is significantly larger than all benchmarks in this work."

[^55]: Section 4.2 (p.11): "The jump in the communication that occurs within the 8 GiB plot is due to the increase in the polynomial modulus degree from n = 2^12 to n = 2^13."

---

### Comparison with Prior Work

All values approximate (chart-derived). 1 GiB database, single-threaded.

| Metric | WhisPIR (sweet spot) | WhisPIR (min comm) | Spiral | SimplePIR | HintlessPIR |
|--------|---------------------|-------------------|--------|-----------|-------------|
| Per-query communication | ~500 KB | ~300 KB | ~300 KB (excl. offline) | ~1800 KB (excl. offline) | ~2500--3000 KB |
| One-time (offline) comm | ~0 KB | ~0 KB | ~15,000 KB | ~126,000 KB | ~0 KB |
| Server computation | ~3--4 s | ~15 s | ~2.1 s | ~0.125 s | ~2--3 s |
| Client storage | 0 | 0 | Evaluation keys | DB digest | 0 |
| Stateless? | Yes | Yes | No | No | Yes |
| DB params | 1 GiB | 1 GiB | 1 GiB | 1 GiB | 0.25--1 GiB |

**Key takeaway:** WhisPIR is the preferred scheme for stateless, ephemeral-client applications where per-query communication must be minimized and the number of queries per client is small (fewer than ~26--120). It strictly dominates HintlessPIR for small record sizes and outperforms Spiral in total communication for low-query-count clients.

---

### Portable Optimizations

- **Optimal generator selection for single-key expansion (Section 3.2, Table 1):** The technique of selecting g in Z_{2n}* to minimize total rotations in the coefficient expansion tree is applicable to any PIR scheme that performs oblivious expansion with a single automorphism key. Could benefit Spiral, SealPIR, OnionPIR in constrained settings.
- **Iterative precomputed key switching (Algorithms 2--3):** The "rotate the key, not the ciphertext" approach -- precomputing key permutations offline and performing only a single inner product online -- is applicable to any BGV/BFV scheme that computes iterated automorphisms. The technique enables SIMD-friendly inner-product computation.
- **Non-compact HE for low-depth PIR:** Skipping relinearization when multiplicative depth is small (k <= 4) is applicable to any low-depth BFV/BGV PIR protocol, trading a small increase in response elements for eliminating the relinearization key.

---

### Implementation Notes

- **Language / Library:** C++ (custom implementation), compiled with clang++ v10[^56]
- **Polynomial arithmetic:** RNS representation of RLWE modulus [GHS12, KPZ21] for ciphertext moduli larger than 64 bits[^57]
- **SIMD / vectorization:** Lazy modular reduction combined with vectorized instructions enabled by the iterative key switching approach (Algorithm 3 is "almost entirely a single inner product over R_q")[^58]
- **Parallelism:** Single-threaded benchmarks; described as "embarrassingly parallel"
- **Open source:** Not mentioned

[^56]: Section 4 (p.10).

[^57]: Section 4 (p.10): "Our implementation makes use of the standard RNS representation of the RLWE modulus [GHS12, KPZ21] to efficiently work over ciphertext moduli larger than 64 bits."

[^58]: Section 3.2 (p.8): "Combined with standard 'lazy' modulus-reduction, this allows significant acceleration from vectorized instructions."

---

### Open Problems (stated by authors)

- Closed-form expression for the optimal generator in the index expansion algorithm, and closed-form solutions when multiple generators are available.[^59]
- Parallel performance characterization and optimization.[^60]
- Determining the smallest database entry size for which WhisPIR can no longer strictly outperform HintlessPIR.[^61]
- Fine-grained tradeoffs that make WhisPIR more Spiral-like (sending evaluation keys to reduce per-query cost) for higher query counts.[^62]

[^59]: Section 3.2 (p.7): "We leave the development of a closed-form expression for this optimal generator... for future work."

[^60]: Section 4 (p.10): "We leave the examination of the parallel performance for future work."

[^61]: Section 4.2 (p.11): "We leave for future work to determine the smallest database entry size for which WhisPIR can no longer strictly outperform HintlessPIR."

[^62]: Section 4.2 (p.12): "Eventually, as the batch size grows, it will likely make sense for WhisPIR to start taking on more features of the Spiral protocol... We leave these fine-grain trade-offs for future work."

---

### Related Papers in Collection

| Paper | Group | Relationship |
|-------|-------|-------------|
| Spiral [MW22] | Group A | Direct predecessor; WhisPIR takes Spiral's protocol structure and compresses evaluation keys to the point of statelessness |
| SealPIR [ACLS18] | Group A | Introduced the index expansion algorithm (Algorithm 1) that WhisPIR optimizes |
| OnionPIR [MCR21] | Group A | Also uses the SealPIR index expansion; WhisPIR's optimization to this algorithm applies |
| SimplePIR [HHCG+23] | Group C | Comparison baseline; unbeatable in computation but high communication |
| HintlessPIR [LMRSW23] | Group B | Concurrent stateless PIR; WhisPIR outperforms in communication for small entries |

---

### Uncertainties

- **Chart-derived values:** All benchmark numbers are approximate (read from charts in Figures 1--6). The paper contains no benchmark tables with exact values. Accuracy estimated at +/-10%.
- **Notation: n vs ring dimension:** The paper uses n for ring dimension (degree of the cyclotomic polynomial). This is consistent with standard BGV convention but differs from some PIR papers that use n for database size.
- **log(p) convention:** The paper uses log(p) to mean log_2(p) throughout, as stated in Section 2 ("the base of a logarithm is always 2").
- **Security level:** Parameters stated to achieve 128-bit security via [ACC+18] (Homomorphic Encryption Standard), but specific (n, log q) pairs are not tabulated -- only that n in {2^12, 2^13} with q fitting in two 64-bit machine words.
- **Empirical ring expansion factor:** gamma_R = 2*sqrt(n) is used based on empirical results from [HPS19], not proven worst-case. Remark A.1 notes this is standard practice.
