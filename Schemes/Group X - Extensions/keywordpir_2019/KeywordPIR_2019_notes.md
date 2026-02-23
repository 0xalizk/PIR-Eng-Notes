## Communication-Computation Trade-offs in PIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Communication-Computation Trade-offs in PIR](https://eprint.iacr.org/2019/1483) (2019) |
| **Archetype** | Comparison / multi-paradigm |
| **PIR Category** | Group X — Extensions |
| **Security model** | Semi-honest single-server CPIR (all constructions); SPIR extension in Appendix E.1 |
| **Additional assumptions** | RLWE (SealPIR/MulPIR); Phi-hiding / safe primes (Gentry-Ramzan) |
| **Correctness model** | Deterministic (FHE noise budget managed by parameter selection for HE schemes; exact arithmetic for Gentry-Ramzan) |
| **Rounds (online)** | 1 (non-interactive) for all constructions |
| **Record-size regime** | 288B (Pung-style), 8kB, 2MB, 40kB, 307kB benchmarked |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SealPIR (Angel et al., S&P 2018, Group A); XPIR (Aguilar-Melchor et al., 2016, Group A); Gentry-Ramzan PIR (ICALP 2005); Chor et al. keyword PIR (1998); Stern's d-dimensional recursion (1998); Borodin-Moenck modular interpolation (1974) |
| **What changed** | (1) Optimizes SealPIR communication by 75-80% via secret-key encryption, modulus switching, and new oblivious expansion; (2) Introduces MulPIR, which replaces additive-only recursion with multiplicative homomorphism to reduce communication for large entries; (3) Improves Gentry-Ramzan with fast modular interpolation and client-aided exponentiation, reducing server computation by up to 85%; (4) Introduces keyword PIR via simple hashing and cuckoo hashing for sparse databases |
| **Superseded by** | OnionPIR (2021, builds on MulPIR with external products); Spiral (2022, further optimizes FHE-based PIR communication); SimplePIR/DoublePIR (2023, lattice-based with preprocessing) |
| **Concurrent work** | SHECS-PIR (Park and Tibouchi, ESORICS 2020) — also uses GSW-style multiplicative homomorphism for PIR&#8201;[^1] |

### Core Idea

This paper presents a systematic study of *communication-computation trade-offs* across three fundamentally different PIR paradigms: additive HE (SealPIR), somewhat HE with multiplicative homomorphism (MulPIR), and number-theoretic (Gentry-Ramzan).&#8201;[^2] The central insight is that no single construction dominates across all settings — the optimal choice depends on database shape (number and size of entries) and the relative costs of computation versus communication.&#8201;[^3]

For **SealPIR**, the paper achieves "for free" (near-zero computational overhead) communication reductions of up to 80% through three techniques: (1) compressing the upload by using secret-key encryption instead of public-key encryption (halving upload size), (2) compressing the download via modulus switching (reducing by a factor of approximately 2.4x), and (3) a new oblivious expansion algorithm that is linear over the plaintext space and further reduces upload communication.&#8201;[^4]

For **MulPIR**, the paper introduces a PIR construction that uses both additive and multiplicative homomorphism of the FV scheme during recursion. Instead of the response growing exponentially in F (the ciphertext expansion factor) with each recursion level as in SealPIR, MulPIR performs one homomorphic multiplication per recursion step, yielding response size O(c(n)) where c(d) is the size of a ciphertext supporting d successive multiplications — trading higher server computation for dramatically smaller communication for databases with large entries.&#8201;[^5]

For **Gentry-Ramzan PIR**, the paper provides the first practically efficient implementation by employing fast modular interpolation (Õ(n log^2 n) via Borodin-Moenck) for server setup and a novel client-aided variant where the client precomputes powers of the generator, enabling a tunable trade-off between communication and server computation that can reduce computation by up to 85%.&#8201;[^6]

Finally, the paper introduces **keyword PIR** for sparse databases via two hashing-based constructions (simple hashing and cuckoo hashing), enabling PIR with server computation proportional to actual database size rather than the index domain size.&#8201;[^7]

### Cross-Paradigm Comparison

| Approach | Paradigm | Upload (kB) | Download (kB) | Server Time (ms) | Server Cost (US cents) | Best For |
|----------|----------|-------------|---------------|-------------------|----------------------|----------|
| **SealPIR [5]** (d=2) | Additive HE (FV/BFV) | 61.4 | 307 | 1,185 (Expand+Response) | 0.0040 | Moderate entries, bandwidth-constrained settings |
| **Optimized SealPIR** (d=2) | Additive HE (FV/BFV) | 15.4 | 128 | 884 (Expand+Response) | 0.0028 (approximate) | Same as SealPIR but with better communication |
| **MulPIR** (d=2) | Somewhat HE (FV multiplicative) | 119 | 119 | 1,174 (Expand+Response) | 0.0026 | Large entries (8kB+); balanced upload/download&#8201;[^8] |
| **Gentry-Ramzan** (1 gen.) | Number-theoretic (CRT + discrete log) | 0.5 | 1.3 | 54,125 (Setup+Response) | 0.0145 | Minimal communication; small DB; cost-insensitive&#8201;[^9] |
| **Client-Aided GR** (50 gen.) | Number-theoretic (CRT + Straus multi-exp) | 13.1 | 1.3 | 6,654 (Setup+Response) | 0.0011 | Small entries; client willing to precompute&#8201;[^10] |
| **ElGamal** | Additive HE (NIST P-224r1) | 1,480 | 0.6 | 55,044 (Setup+Response) | 0.0382 | Baseline comparison only |
| **Damgard-Jurik** (s=1) | Additive HE (Paillier generalization) | 280 | 280 | 120,636 (approximate, Setup+Response) | 0.0091 | N/A in practice (too slow) |

All values from Table 5 (p. 13) for the 1MB database (5,000 elements of 288B) without recursion. Server costs from Table 3 (p. 12) for 288B entries with n=2^20 use recursion d=2.

### Cryptographic Foundations

#### 1. Fan-Vercauteren (FV/BFV) — used by SealPIR and MulPIR

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (Ring Learning With Errors) |
| **Encryption scheme** | Fan-Vercauteren (FV/BFV) via SEAL library |
| **Ring / Field** | R = Z[x]/(x^N + 1); ciphertexts in (R/qR)^2; plaintexts in R/tR |
| **Parameters (SealPIR)** | N = 2048, modulus q = 60 bits, plaintext modulus t = 2^12 + 1, 115-bit security&#8201;[^11] |
| **Parameters (MulPIR)** | N = 8192, modulus q = 160 bits (with 50 + 2 * 55 bit modulus switching), plaintext modulus t = 2^20 + 2^19 + 2^17 + 2^16 + 2^14 + 1, 180-bit security&#8201;[^12] |
| **Key operations** | Addition, scalar multiplication, ciphertext multiplication (MulPIR only in recursion), substitution (for oblivious expansion) |
| **Expansion factor** | F = 2 log(q) / log(t); SealPIR: F approximately 10; MulPIR: uses modulus switching to reduce effective F to approximately 4&#8201;[^13] |

#### 2. Gentry-Ramzan — number-theoretic PIR

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Phi-hiding assumption (difficulty of deciding whether a prime divides phi(m) for composite m); discrete logarithm in Z_m* |
| **Mathematical structure** | Chinese Remainder Theorem (CRT) representation of the database as a single large integer E, where E = D_i mod pi_i for pairwise coprime moduli pi_i >= 2^l&#8201;[^14] |
| **Group structure** | Z_m* where m = Q_1 * Q_2, with Q_1 = 2q_1 + 1, Q_2 = 2q_2 * pi_k + 1 safe primes; generator g of subgroup of order q_1 * q_2 * pi_k&#8201;[^15] |
| **Server computation** | Modular exponentiation: g' = g^E mod m |
| **Client decryption** | Discrete logarithm via Pohlig-Hellman algorithm in Z_{pi_k} |

#### 3. Additional HE Schemes (benchmarked in Appendix D / Table 5)

| Scheme | Type | Expansion Factor | Key Feature |
|--------|------|-----------------|-------------|
| **ElGamal** | Additive HE | >= 2 | NIST P-224r1 curve; small plaintext, fast decryption via baby-step-giant-step DLP&#8201;[^16] |
| **Damgard-Jurik** | Additive HE | >= 1 + 1/s (approaches 1) | RSA modulus N = pq; parameterized by s; uniquely achieves F close to 1, simplifying recursion&#8201;[^17] |
| **FV (as SHE)** | Somewhat HE | >= 2 | Supports bounded-depth multiplication; used by MulPIR |

### Protocol Phases

#### Optimized SealPIR (Section 3)

| Phase | Actor | Operation | Communication | Notes |
|-------|-------|-----------|---------------|-------|
| Query | Client | Generate selection vectors; encode into polynomials using secret-key FV encryption; normalization (2^{-c} mod t) folded into query&#8201;[^18] | d * ceil(d*m / 2^c) ciphertexts upward | Secret-key encryption halves upload vs public-key |
| Expand | Server | Obliviously expand each query ciphertext into selection vectors using Algorithm 7 (new expansion, linear over plaintext space)&#8201;[^19] | -- (internal) | Simplified: each ciphertext expands independently |
| Response | Server | Recursive inner products + modulus switching on intermediate ciphertexts | Single ciphertext (after modulus switching) | Modulus switching reduces download by approximately 2.4x |
| Extract | Client | Decrypt using secret key | -- | Standard FV decryption |

#### MulPIR (Section 3.4)

| Phase | Actor | Operation | Communication | Notes |
|-------|-------|-----------|---------------|-------|
| Query | Client | Same as optimized SealPIR (Algorithm 6) | ceil(d*m / 2^c) ciphertexts upward | Same upload as optimized SealPIR |
| Expand | Server | Oblivious expansion (Algorithm 7) | -- (internal) | Same expansion as optimized SealPIR |
| Response (recursion) | Server | At each recursion level: homomorphic **multiplication** of ciphertexts (not additive layering)&#8201;[^20] | -- (internal) | Key difference: uses ct-ct multiplication per recursion level |
| Modulus switch | Server | Apply modulus switching to compress response ciphertexts | Single ciphertext downward | Effective F approximately 4 after modulus switching |
| Extract | Client | Decrypt; parse database elements from FV plaintext | -- | Larger plaintext space packs more data |

#### Gentry-Ramzan PIR (Section 4)

| Phase | Actor | Operation | Communication | Notes |
|-------|-------|-----------|---------------|-------|
| Setup (offline) | Server | Encode database D via CRT: compute E such that E = D_i mod pi_i; use fast modular interpolation (Borodin-Moenck, Õ(n log^2 n))&#8201;[^21] | -- | One-time; reusable across queries if DB unchanged |
| Query | Client | Generate safe primes Q_1, Q_2; compute m = Q_1 * Q_2; sample generator g of appropriate subgroup | (m, g) sent to server: 3 * λ_GR bits&#8201;[^22] | Client must generate large primes (expensive) |
| Response | Server | Compute g' = g^E mod m (modular exponentiation with exponent E) | g' in Z_m*: single group element | Server computation dominates |
| Extract | Client | Compute h = g'^{q_2}, h' = g'^{q_1*q_2}; solve for d via Pohlig-Hellman in Z_{pi_k} | -- | DLP in small subgroup is efficient |

#### Client-Aided Gentry-Ramzan (Section 4.3)

| Phase | Actor | Operation | Communication | Notes |
|-------|-------|-----------|---------------|-------|
| Query | Client | Same as GR but additionally precompute l+1 powers: g, g^b, g^{b^2}, ..., g^{b^l} using Euler's theorem to reduce exponents&#8201;[^23] | (m, g, g^b, ..., g^{b^l}) to server | Extra l group elements in upload |
| Response | Server | Rewrite E in base b; compute product of multi-exponentiations using Straus's algorithm&#8201;[^24] | g' in Z_m*: single group element | Server computation reduced proportional to number of generators |
| Extract | Client | Same as standard GR | -- | -- |

#### Keyword PIR — Simple Hashing (Section 5)

| Phase | Actor | Operation | Communication | Notes |
|-------|-------|-----------|---------------|-------|
| Pre-processing | Server | Hash each (key, data) pair into one of m bins using public hash function H | H sent to client | Bucket size grows with n |
| Query | Client | Compute H(i) for query key i; run PIR.Query(H(i)) on the bin database | PIR query for single bucket | Works well with MulPIR (large plaintext absorbs bucket) |
| Response | Server | Run PIR.Response on the queried bucket | PIR response | -- |
| Extract | Client | Decrypt; search bucket for desired key | -- | -- |

#### Keyword PIR — Cuckoo Hashing (Section 5, Construction 1)

| Phase | Actor | Operation | Communication | Notes |
|-------|-------|-----------|---------------|-------|
| Pre-processing | Server | Build cuckoo hash table with kappa hash functions (H_1, ..., H_kappa); each item placed in exactly one of kappa locations&#8201;[^25] | Hash functions sent to client | Table size proportional to |D| with constant multiplicative overhead |
| Query | Client | Compute H_j(i) for j in [kappa]; run kappa PIR queries (one per hash function) | kappa PIR queries | Constant number of queries regardless of DB size |
| Response | Server | Run kappa PIR responses | kappa PIR responses | -- |
| Extract | Client | Decrypt all kappa responses; output item if found, else bottom | -- | Correctness guaranteed by cuckoo hashing properties |

### Complexity

#### Core metrics — SealPIR variants and MulPIR (d=2, n=262,144, 288B entries)

| Metric | SealPIR [5] | Optimized SealPIR | MulPIR (d=2) | Phase |
|--------|------------|-------------------|-------------|-------|
| Upload size | 61.4 kB | 15.4 kB | 122 kB | Online |
| Download size | 307 kB | 128 kB | 122 kB | Online |
| Total communication | 368.4 kB | 143.4 kB | 244 kB | Online |
| Client Query (ms) | 19 | 19 | 172 | Online |
| Server Expand (ms) | 145 | 294 | 391 | Online |
| Server Response (ms) | 1,020 | 590 (approximate) | 1,919 | Online |
| Server Cost (US cents) | 0.0040 | 0.0028 (approximate) | 0.0026 | Online |

Values from Table 3 (p. 12), n = 262,144 column (closest to 2^18); for n = 2^20 see the 1,048,576 columns.&#8201;[^26]

#### Core metrics — Gentry-Ramzan (5,000 entries of 288B, no recursion)

| Metric | GR (1 gen.) | Client-Aided GR (15 gen.) | Client-Aided GR (50 gen.) | Client-Aided GR (100 gen.) |
|--------|------------|---------------------------|---------------------------|----------------------------|
| Upload (kB) | 0.5 | 4.1 | 13.1 | 25.8 |
| Download (kB) | 1.3 | 1.3 | 1.3 | 1.3 |
| C.Setup (ms) | 1,532 | 1,540 | 1,594 | 1,796 |
| S.Setup (ms) | 3,294 | 2,688 | 3,966 | 7,980 |
| S.Respond (ms) | 51,803 | 5,495 | 2,988 | 2,904 |
| Server Cost (US cents) | 0.0145 | 0.0016 | **0.0011** | 0.0014 |

Values from Table 5 (p. 13), 1MB database row.&#8201;[^27]

#### Asymptotic communication complexity (Table 2, p. 8; Gentry-Ramzan from Section 4 and Table 8, p. 20)

| HE Type | Recursion d (1 <= d <= log n) | Recursion d = log n | Computation Cost |
|---------|-------------------------------|---------------------|-----------------|
| Additive HE | O(d*n^{1/d} + F^{d-1}) ciphertexts | O(log n + F^{log n - 1}) | n(A + S) to n^{1/d} * F^{d-1} * (A + S) |
| Somewhat HE (MulPIR) | O(d*n^{1/d}) ciphertexts | O(log n) | n(A + S) + n^{(d-1)/d} * M |
| Fully HE | -- | O(log n) | n * log(n) * M + n(A + S + M) |
| Gentry-Ramzan | O(λ_GR) (constant!) | N/A | 2 * n * pt multiplications of λ_GR-bit numbers |

Where A = addition, S = scalar multiplication, M = ciphertext multiplication.&#8201;[^28]

#### Communication costs by entry size (Table 1, p. 7; n = 2^20, d = 2)

| Entry size | Scheme | Upload (kB) | Download (kB) |
|------------|--------|-------------|---------------|
| 288B | SealPIR [5] | 61.4 | 307.2 |
| 288B | Optimized SealPIR (w/o Remark 1) | 15.4 | 128 |
| 288B | Optimized SealPIR (w/ Remark 1) | 15.4 | 64 |
| 288B | MulPIR | 119 | 119 |
| 8kB | SealPIR [5] | 61.4 | 921 |
| 8kB | Optimized SealPIR (w/o Remark 1) | 15.4 | 384 |
| 8kB | MulPIR | 119 | 119 |
| 2MB | SealPIR [5] | 61.4 | 200,294 |
| 2MB | Optimized SealPIR (w/o Remark 1) | 15.4 | 83,456 |
| 2MB | MulPIR | 119 | 13,660 |

MulPIR's download advantage grows dramatically with entry size because its response does not scale with F^{d-1}.&#8201;[^29]

### Performance Benchmarks

#### Hardware and Setup

All experiments on a virtual machine with Intel Xeon E5-2695 v3 @ 2.30 GHz, 128 GB RAM, Debian. Monetary costs computed using Google Cloud Platform prices: 1 cent per CPU-hour and 8 cents per GB of internet traffic.&#8201;[^30]

#### SealPIR vs MulPIR (Table 3, p. 12) — 288B entries, recursion d=2

| Database size n | 262,144 | 1,048,576 | 4,194,304 |
|----------------|---------|-----------|-----------|
| **SealPIR [5] (d=2)** | | | |
| Client Query (ms) | 19 | 19 | 19 |
| Server Expand (ms) | 145 | 590 | 12,891 |
| Server Response (ms) | 1,020 | 3,520 | 12,891 |
| Upload (kB) | 61.4 | 61.4 | 61.4 |
| Download (kB) | 307 | 307 | 307 |
| Server Cost (US cents) | 0.0040 | **0.0040** | 0.017 |
| **MulPIR (d=2)** | | | |
| Client Query (ms) | 172 | 192 | 213 |
| Server Expand (ms) | 391 | 783 | 1,610 |
| Server Response (ms) | 1,919 | 5,213 | 16,307 |
| Upload (kB) | 122 | 122 | 122 |
| Download (kB) | 122 | 122 | 122 |
| Server Cost (US cents) | 0.0026 | **0.0036** | 0.0069 |

MulPIR achieves lower server cost than SealPIR for most database sizes due to its lower communication costs, despite higher computation.&#8201;[^31]

#### Large entries: 4GB database of 100,000 elements at 40kB each (Table 4, p. 12)

| Metric | Optimized SealPIR | MulPIR |
|--------|-------------------|--------|
| Client Query (ms) | 42 | 263 |
| Server Expand (ms) | 357 | 3,560 |
| Server Response (ms) | 47,712 | 52,280 |
| Upload (kB) | 15 | 119 |
| Download (kB) | 1,792 | 238 |
| Server Cost (US cents) | 0.028 | **0.018** |

For large entries, MulPIR reduces communication of SealPIR by 7x at similar computation cost, reducing total monetary server cost by 35%.&#8201;[^32]

#### Private File Download — 3GB database, 10,000 entries of 307kB (Table 5, p. 13)

| Scheme | # chunks | Upload (kB) | Download (kB) | S.Setup (ms) | S.Respond (ms) | Server Cost (US cents) |
|--------|----------|-------------|---------------|-------------|----------------|----------------------|
| MulPIR | 100 | 79.4 | 1,385 | 88,815 | 34,388 | **0.0417** |
| Client-Aided GR (50 gen.) | 4,955 | 13.1 | 1,259 | 1,347,036 | 28,684 | 0.0016 (approximate) |
| Damgard-Jurik (s=1) | 1,060 | 2,960 | 614 | approximately 80,000 | approximately 3,200 | 11.7451 |
| ElGamal | 76,800 | 280 | 4,300 | approximately 300 | approximately 88,800 | 1.4338 |

Values from Table 5 (p. 13). Timings marked with "approximately" are estimated on a smaller number of chunks.&#8201;[^33]

#### Password Checkup Application (Table 6, p. 13)

| Bucket size | GR Comm. (kB) | GR Client (ms) | GR Server (ms) | GR Server Cost | MulPIR Comm. (kB) | MulPIR Client (ms) | MulPIR Server (ms) | MulPIR Server Cost |
|-------------|--------------|----------------|----------------|---------------|-------------------|--------------------|--------------------|-------------------|
| 10k | 10.4 | 24,324 | 317 | 0.00017 | 90.5 | 156 | 475 | 0.00086 |
| 50k | 10.4 | 24,906 | 1,649 | 0.00054 | 90.5 | 195 | 810 | 0.00095 |
| 200k | 10.4 | 30,644 | 2,774 | 0.00085 | 90.5 | 195 | 830 | 0.00095 |
| 1M | 10.4 | 49,819 | 31,055 | 0.0087 | 90.5 | 265 | 3,742 | 0.0018 |

GR achieves best communication (10.4 kB constant) but client computation is orders of magnitude higher. MulPIR outperforms GR in total server cost for bucket sizes >= 200k.&#8201;[^34]

### Novel Constructions and Techniques

#### 1. Optimized Oblivious Expansion (Algorithms 6-7)

The key insight is that oblivious expansion (Algorithm 5 from SealPIR) is *linear over the plaintext space*: if the input ciphertext encrypts m = sum(m_i * x^i), then expansion produces N ciphertexts, each encrypting the corresponding m_i.&#8201;[^35] This linearity enables two optimizations:
- **Normalization in query**: The 2^{-c} mod t normalization factor is folded into the Query algorithm (Algorithm 6, line 4) rather than applied server-side after expansion (as in SealPIR's Algorithm 5, lines 20-22). This avoids n scalar multiplications on ciphertexts.
- **Concatenated expansion**: Instead of d independent expansions of ceil(m/2^c) ciphertexts each, all d selection vectors are concatenated and encrypted in ceil(d*m/2^c) ciphertexts total, simplifying the expansion (Algorithm 7 vs Algorithm 5).

#### 2. MulPIR — Multiplicative Homomorphism for Recursion

MulPIR replaces the additive-HE-based recursion in SealPIR with *ciphertext-ciphertext multiplication* at each recursion level.&#8201;[^36] In additive recursion, each recursion level produces F plaintext elements per intermediate ciphertext, causing the response to grow as F^{d-1} ciphertexts. In MulPIR, the server performs one homomorphic multiplication per level, keeping the response to a single ciphertext (of size c(d) supporting d multiplications). This requires parameters (N, q) large enough to support the multiplicative depth d, making individual operations more expensive but dramatically reducing total communication for large entries.

#### 3. Fast Modular Interpolation for Gentry-Ramzan (Section 4.2)

The CRT encoding E = sum(D_k * a_k * M_k) naively requires Omega(n^2) time because each M_k = M / pi_k has size Omega(n). The paper applies Borodin-Moenck's divide-and-conquer modular interpolation: split the set of moduli in half, factor out the product of each half, and recurse. Using Schonhage-Strassen integer multiplication, total time is Õ(n * log^2(n) * log(log(n))).&#8201;[^37] The supermoduli M_1, M_2 and inverses a_k can be precomputed and reused across queries when the moduli set remains the same.

#### 4. Client-Aided Gentry-Ramzan (Section 4.3)

The server rewrites the exponent E in base b >= 2: E = E_0 + E_1*b + E_2*b^2 + ... + E_l*b^l. The client precomputes g, g^b, g^{b^2}, ..., g^{b^l} using Euler's theorem to efficiently reduce exponents modulo phi(m). The server then computes g^E = g^{E_0} * (g^b)^{E_1} * ... * (g^{b^l})^{E_l} as a product of l+1 multi-exponentiations using Straus's algorithm.&#8201;[^38] The security argument is that revealing powers of g leaks no information since the server could compute them itself (just not as fast, since the server does not know phi(m)).

### Keyword PIR for Sparse Databases (Section 5)

#### Problem Setting

Standard PIR assumes dense indices [1, n], but many real-world databases are *sparse*: the database has |D| elements indexed by keys from a much larger domain. Keyword PIR aims for server computation proportional to |D|, not the domain size.&#8201;[^39]

#### Construction 1: Simple Hashing

Server selects hash function H mapping keys to m bins. Each database element (i, d) is placed in bin H(i). Client queries for key i by running PIR on the bucket at H(i). Bucket size grows as O(|D| / m), which works well with MulPIR (large plaintext space absorbs large buckets) but poorly with Gentry-Ramzan (which wants small plaintexts).

#### Construction 2: Cuckoo Hashing

Server builds a cuckoo hash table with kappa hash functions, guaranteeing each element is in exactly one of kappa possible locations. Table size is proportional to |D| with constant multiplicative overhead. Client makes kappa PIR queries (one per hash function). This construction ensures each bucket contains at most one element, making it ideal for Gentry-Ramzan (small plaintext) and enabling CRT batching of the kappa queries into a single Gentry-Ramzan query.&#8201;[^40]

### Comparison with Prior Work

#### HE-based PIR schemes (Table 5, p. 13; 1MB database, 5,000 entries of 288B)

| Metric | MulPIR | ElGamal | Damgard-Jurik (s=1) | Gentry-Ramzan (1 gen.) | Client-Aided GR (50 gen.) |
|--------|--------|---------|--------------------|-----------------------|---------------------------|
| Upload (kB) | 14 | 1,480 | 0.6 | 0.5 | 13.1 |
| Download (kB) | 21 | 283 | 614 | 1.3 | 1.3 |
| Total comm. (kB) | 35 | 1,763 | 614.6 | 1.8 | 14.4 |
| S.Setup (ms) | 39 | 29 | 40,636 | 1,532 | 1,594 |
| S.Respond (ms) | 3,910 | 893 | 20,710 | 51,803 | 2,988 |
| Server Cost (US cents) | **0.0019** | 0.0091 | 0.0382 | 0.0145 | **0.0011** |

Key findings: Client-Aided GR (50 generators) achieves the lowest server cost for small entries. MulPIR achieves the best server cost among HE-based schemes. Damgard-Jurik and ElGamal are significantly slower on the client side.&#8201;[^41]

#### Versus original SealPIR

- Optimized SealPIR reduces upload by 75% (61.4 kB to 15.4 kB) and download by up to 80% (307 kB to 64 kB with Remark 1 optimization) at essentially no additional computation cost&#8201;[^42]
- MulPIR further reduces download for large entries: at 2MB entries, MulPIR download is 13,660 kB vs SealPIR's 200,294 kB (14.7x reduction)&#8201;[^43]

#### Versus trivial download

For databases where downloading everything is viable, PIR becomes worthwhile when communication cost exceeds computation cost. At Google Cloud Platform prices ($0.01/CPU-hour, $0.08/GB), the paper shows PIR is cost-effective for databases above a few thousand entries.

### Key Tradeoffs & Limitations

1. **MulPIR computation vs communication**: MulPIR achieves dramatically better communication for large entries but requires larger parameters (N=8192 vs 2048) and costlier ciphertext multiplication, yielding approximately 2x higher server computation than SealPIR for 288B entries.&#8201;[^44]

2. **Gentry-Ramzan prime generation bottleneck**: Each query requires generating fresh safe primes (Q_1, Q_2) of λ_GR bits, which takes 3-50 seconds on the client depending on the application — impractical for latency-sensitive applications.&#8201;[^45]

3. **Recursion depth d=2 is optimal in practice**: For both SealPIR and MulPIR, d=3 does not improve communication or computation over d=2, because the upload already consists of a single ciphertext at d=2.&#8201;[^46]

4. **Entry size determines optimal scheme**: For small entries (288B), additive HE (SealPIR) with d=2 achieves the lowest monetary cost among HE schemes. For large entries (40kB+), MulPIR dominates. For minimal communication with small databases, client-aided Gentry-Ramzan wins.&#8201;[^47]

5. **Keyword PIR hashing tradeoff**: Simple hashing produces large buckets (good for MulPIR, bad for GR); cuckoo hashing produces unit-size buckets with kappa queries (good for GR with CRT batching, adds kappa multiplicative overhead for HE schemes).&#8201;[^48]

6. **Modulus switching tradeoff (Remark 1)**: Applying modulus switching at each recursion level further reduces download by a factor of approximately log_2(p)/log_2(q) but at the cost of n^{1/2} additional modular reductions, significantly increasing computation.&#8201;[^49]

7. **No malicious security**: All constructions assume semi-honest servers. The SPIR extension (Appendix E.1) provides database privacy via OPRFs but does not handle malicious servers.

### Implementation Notes

- **Language / Libraries**: C++ using SEAL 3.2.0 (SealPIR) and SEAL 3.5.4 (MulPIR); OpenSSL for BigNum and elliptic curve operations (ElGamal, Damgard-Jurik, Gentry-Ramzan)&#8201;[^50]
- **SealPIR implementation**: Based on Microsoft's open-source SealPIR (https://github.com/microsoft/SealPIR)
- **Polynomial arithmetic**: NTT-based (via SEAL)
- **CRT batching for GR**: Uses Groth et al. [36] technique to batch kappa cuckoo hash queries into a single GR query (Appendix E.2)
- **Parallelism**: Single-threaded benchmarks throughout
- **Precomputation**: GR supermoduli M_1, M_2 and inverses a_k are precomputed and reusable when moduli set is unchanged

### Open Problems

1. **Closing the communication gap**: MulPIR achieves O(log n) communication asymptotically but the constants (large N, q for multiplicative depth) remain high. Can parameters be reduced while maintaining security?&#8201;[^51]

2. **Practical Gentry-Ramzan at scale**: The fast modular interpolation makes setup feasible, but server response (modular exponentiation of a huge integer) remains a bottleneck for large databases. The paper demonstrates viability for approximately 50k entries but not beyond.&#8201;[^52]

3. **Reducing client cost in Gentry-Ramzan**: Prime generation dominates client time. Can safe primes be precomputed or amortized across queries?

4. **Better keyword PIR constructions**: The simple hashing and cuckoo hashing approaches each have limitations (large buckets vs multiple queries). Can a single construction achieve constant queries with constant-size buckets?

5. **Combining paradigms**: The paper shows different schemes win in different regimes. A system that dynamically selects the optimal scheme based on database parameters and network conditions could provide uniformly good performance.

6. **Beyond semi-honest security**: Extending the constructions to handle malicious servers, particularly for the password checkup application where server integrity is important.

### Uncertainties

- **Exact parameter selection for MulPIR**: The paper states "polynomial of dimension 8192 with 50 + 2 * 55 bit modulus, modulus switching to 50 bits, and plaintext modulus t = 2^20 + 2^19 + 2^17 + 2^16 + 2^14 + 1" (Table 1 footnote, p. 7) but does not fully justify why this specific plaintext modulus was chosen or how it was determined to support exactly the required multiplicative depth.

- **Gentry-Ramzan security level**: The paper uses λ_GR-bit primes but does not specify the exact security level achieved for the benchmarked parameter sets. The 2048-bit modulus and block size of 500 are mentioned (Section 6.2, p. 11) but the concrete security guarantee is not stated.

- **Remark 1 cost estimation**: The paper notes that the Remark 1 optimization (modulus switching at each recursion level) is "computation-expensive" and omits it from fair comparisons (footnote 4, p. 11). The exact computational overhead is not quantified.

- **Approximate values in Table 5**: Timings for Damgard-Jurik and ElGamal on the 3GB database are explicitly marked as "approximately" estimated from a smaller number of chunks (Table 5 footnote, p. 13).

- **Naming convention**: The filename references "SealPIR_KeywordPIR" but the paper's primary contribution is broader — it covers SealPIR optimizations, MulPIR (a new construction), Gentry-Ramzan improvements, and keyword PIR. The paper's actual title is "Communication-Computation Trade-offs in PIR."

[^1]: Appendix A (p. 16): "Park and Tibouchi [51] present a construction that uses GSW-style homomorphic encryption that support logarithmic multiplicative degree and achieves O(log n) communication."
[^2]: Abstract (p. 1): "We study the computation and communication costs and their possible trade-offs in various constructions for private information retrieval (PIR), including schemes based on homomorphic encryption and the Gentry-Ramzan PIR."
[^3]: Section 1 (p. 2): "We analyze the communication-computation trade-offs that different PIR construction approaches offer and the hurdles towards achieving the optimal asymptotic communication costs in practice."
[^4]: Section 1.1 (p. 2): "Our first contribution reduces the communication of SealPIR by (1) using symmetric key encryption to reduce the upload size, (2) using modulus switching reduction techniques... to reduce the value of F down to F approximately 4, and (3) introducing a new oblivious expansion algorithm which can further halve the upload communication."
[^5]: Section 1.1 (p. 2): "We then present MulPIR, a PIR protocol additionally leveraging multiplicative homomorphism to implement the recursion steps in PIR... it introduces a meaningful tradeoff by significantly reducing communication, at the cost of an increased computational cost for the server."
[^6]: Section 1.1 (p. 2-3): "We leverage a divide-and-conquer modular interpolation algorithm [7] that enables us to achieve computation complexity Õ(n log^2 n)... This enables a client-aided technique that allows us to improve the server's computation at the price of (small) additional work at the client."
[^7]: Section 1.1 (p. 3): "we introduce new ways to handle PIR over sparse databases (keyword PIR), based on different hashing techniques."
[^8]: Table 1 (p. 7): MulPIR (d=2) for n=2^20 shows upload 119 kB, download 119 kB — perfectly balanced communication.
[^9]: Table 5 (p. 13): Gentry-Ramzan (1 generator) achieves 0.5 kB upload / 1.3 kB download for 5,000-element database — orders of magnitude less communication than any HE scheme.
[^10]: Table 5 (p. 13): Client-Aided GR (50 generators) achieves lowest server cost at 0.0011 US cents for the 1MB database.
[^11]: Section 6.1 (p. 11): "For SealPIR, we use the parameters of [5]: polynomials of dimension 2048 and a modulus of 60 bits, providing 115 bits of security. The plaintext modulus has a size of 12 bits (d=2) / 16 bits (d=3)." The exact value t = 2^12 + 1 is stated in the Table 1 footnote (p. 7): "plaintext modulus t = 2^12 + 1."
[^12]: Table 1 footnote (p. 7): "For MulPIR, we use a polynomial of dimension 8192 with 50 + 2 * 55 bit modulus, modulus switching to 50 bits, and plaintext modulus t = 2^20 + 2^19 + 2^17 + 2^16 + 2^14 + 1."
[^13]: Section 3.1 (p. 6): "reduces the download size by approximately log_2(q)/(2 * log_2(t)); using SealPIR parameters and using modulus switching to a prime p approximately 2^25, this technique enables to reduce the download by a factor 60/25 = 2.4x."
[^14]: Section 4.1 (p. 8), Equation (2): "E <= product(pi_i), and E = D_i mod pi_i for all i in [n]."
[^15]: Procedure 8 (p. 9): "Q_1 := 2q_1 + 1 s.t. Q_1 and q_1 are prime and log_2(Q_1) >= λ. Q_2 := 2q_2*pi_k + 1 s.t. Q_2 and q_2 are prime and log_2(Q_2) >= λ."
[^16]: Table 7 / Appendix D (p. 19): ElGamal plaintext size is "pt small", expansion >= 2, decryption requires 2^{pt} multiplications of λ_EG-bit numbers.
[^17]: Appendix D (p. 19): "The ciphertext expansion F can be made as small as desired and F > 1. This unusual property enables to simplify the recursion in PIR."
[^18]: Algorithm 6, line 4 (p. 7): "m_j <- sum_{i in [2^c]} (2^{-c} mod t) * s'_j[i] * x^i in R/tR" — normalization folded into query.
[^19]: Section 3.2 (p. 7): "The key insight behind our new algorithms is that oblivious expansion (Algorithm 5) is linear over the plaintext space."
[^20]: Section 3.4 (p. 7-8): "We introduce MulPIR, a variant of SealPIR with the optimizations above, which further replaces the emulated multiplications with homomorphic multiplications during recursion."
[^21]: Section 4.2 (p. 9): "we rely on the modular interpolation algorithm by Borodin and Moenck [7]... Repeating the above transformation recursively leads to a divide-and-conquer algorithm for modular interpolation, which, using the Schonhage-Strassen integer multiplication [59], has a total running time of O(n log^2 n log log n) [7]."
[^22]: Procedure 8 (p. 9): Query output is (m, g) in Z x Z_m*, where m = Q_1 * Q_2 with each Q_i of λ bits.
[^23]: Section 4.3 (p. 9): "the client can use Eq. (3)... these l exponentiations may be efficiently computed by the client using the prime factorization of m."
[^24]: Section 4.3 (p. 9): "For our implementation, we choose Straus's algorithm [62], a description of which can be found in [39, Alg. 14.88]."
[^25]: Section 5, Construction 1 (p. 10): "The server generates cuckoo hash functions using the data dependent key generation Cuckoo.KeyGen(D) and builds a cuckoo hash table for its sparse database."
[^26]: Table 3 (p. 12): Communication and CPU costs of SealPIR and MulPIR for n elements of 288B.
[^27]: Table 5 (p. 13): Communication and computation costs for PIR protocols on 1MB database (5,000 elements of 288B).
[^28]: Table 2 (p. 8): "Communication-Computation Trade-Off of homomorphic encryption based PIR Protocols... This table aims at giving an insight on the overall trend but does not accurately reflect the costs." The Gentry-Ramzan row is editorially assembled from Section 4 (p. 8-9) and Table 8 (p. 20), which lists GR baseline communication as 3*lambda_GR bits with computation of 2*n*pt multiplications of lambda_GR-bit numbers.
[^29]: Table 1 (p. 7): For 2MB entries, SealPIR download is 200,294 kB vs MulPIR's 13,660 kB.
[^30]: Section 6 (p. 11): "All our experiments are performed in a virtual machine with a Intel(R) Xeon(R) CPU E5-2695 v3 @ 2.30GHz and 128GB, running Debian. Monetary costs were computed using Google Cloud Platform prices [1], which at the time of writing were at one cent per CPU-hour and 8 cents per GB of internet traffic."
[^31]: Table 3 (p. 12): MulPIR server cost 0.0036 vs SealPIR 0.0040 at n=2^20 with 288B entries.
[^32]: Table 4 (p. 12): "MulPIR enables to reduce the communication of SealPIR by a factor 7x in that setting, which also results in a reduction of the monetary server costs by 35%."
[^33]: Table 5 footnote (p. 13): "Median over 10 computations. The timings indicated with approximately have been estimated on a smaller number of chunks to finish in a reasonable amount of time."
[^34]: Table 6 (p. 13): Password Checkup application comparing Gentry-Ramzan and MulPIR across bucket sizes.
[^35]: Section 3.2 (p. 7): "if m = sum_{i in [N]} m_i * x^i in R/tR, then the output of the oblivious expansion consists of N ciphertexts, respectively encrypting each of the m_i's in the constant coefficient of the plaintexts."
[^36]: Appendix B.2 (p. 18): "the server computes the response with the (encryption of the) selection vector s_1 using homomorphic multiplication... c = Enc(sk, <s_1, {D_{i'n^{1/2}+j'}}_{i}>) = Enc(sk, D_{i'n^{1/2}+j'})."
[^37]: Section 4.2 (p. 9): Borodin-Moenck modular interpolation achieving O(n log^2 n log log n) total running time.
[^38]: Section 4.3 (p. 9): "the server rewrites the large exponent E according to some base b >= 2... g^E = g^{E_0} * (g^b)^{E_1} * (g^{b^2})^{E_2} * ... * (g^{b^l})^{E_l}."
[^39]: Section 5 (p. 9-10): "The traditional setting for PIR over a database of size n assumes that each database element has a unique index in [n]... In some scenarios, such dense indices are not immediately available, and database elements are instead indexed by keywords from a much larger domain."
[^40]: Section 5 (p. 10): "our approach leverages cuckoo hashing in a different way... we apply cuckoo hashing on the server side, to compress the domain of its indices."
[^41]: Table 5 (p. 13): Comprehensive cost comparison across all implemented schemes on 1MB database.
[^42]: Table 1 (p. 7): Upload reduced from 61.4 kB to 15.4 kB (75%); download from 307.2 kB to 64 kB (79%) with Remark 1.
[^43]: Table 1 (p. 7): For 2MB entries, MulPIR download 13,660 kB vs SealPIR 200,294 kB.
[^44]: Table 3 (p. 12): MulPIR server Expand + Response time is approximately 2x SealPIR's at n=262,144 (2,310 ms vs 1,165 ms).
[^45]: Table 5 (p. 13): C.Create for Gentry-Ramzan is 3,294 ms for 1MB database; Table 6 shows 24,324 ms for password checkup with 10k bucket.
[^46]: Section 6.1 (p. 11): "we observe that d = 3 doesn't improve either communication or computation of MulPIR or SealPIR, due to the fact that the upload for d = 2 already consists of only a single ciphertext."
[^47]: Section 6 (p. 11): "These results can inform decision making of what is the most appropriate PIR instantiation for a particular application."
[^48]: Section 5 (p. 10): Simple hashing "has the drawback that the size of the buckets grows asymptotically with the number of items n" while cuckoo hashing "ensures that each bucket only contains a single database element."
[^49]: Remark 1 (p. 6): "one can further reduce the communication requirement at the cost of increasing the computation cost... perform n^{1/2} modulus switching."
[^50]: Section 6.1 (p. 11): "We use the SealPIR implementation available on Microsoft's GitHub [3] based on Seal 3.2.0, and we implement MulPIR with Seal 3.5.4." Section 6.2 (p. 11): "All the implementations are standalone and rely only on OpenSSL for BigNum and elliptic curve operations."
[^51]: Table 2 (p. 8): Somewhat HE achieves O(log n) communication at d = log n, but the computation cost includes n^{(d-1)/d} * M multiplicative operations.
[^52]: Table 5 (p. 13): GR server response time of 51,803 ms for 5,000 entries; extrapolation suggests impractical times for databases much larger than approximately 50k entries.
