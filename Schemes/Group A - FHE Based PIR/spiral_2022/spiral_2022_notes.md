## Spiral: Fast, High-Rate Single-Server PIR via FHE Composition -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Spiral: Fast, High-Rate Single-Server PIR via FHE Composition](https://eprint.iacr.org/2022/368) (2022) |
| **Group** | A -- FHE-based PIR |
| **Sub-model** | Public-parameter upload (query-independent public params sent offline) |
| **Archetype** | Construction (multi-variant: 4 variants with Pareto-optimal tradeoffs) |
| **Total pages** | ~42 (35 main body + appendices + references) |
| **Implementation** | C++, ~4,000 LOC; https://github.com/menonsamir/spiral |

---

### Core Contribution

Spiral introduces a family of single-server PIR protocols that compose two lattice-based encryption schemes -- Regev (matrix variant) and GSW -- via novel **ciphertext translation** techniques (ScalToMat, RegevToGSW). This composition enables a client to compress its entire query into a single scalar Regev ciphertext (~14 KB), which the server expands into both matrix Regev ciphertexts (for first-dimension processing) and GSW ciphertexts (for dimension folding). The key innovation is that ciphertext translation replaces the need to send large GSW ciphertexts, achieving (n+1)^2/2 compression on GSW encodings.[^1] Across four variants, Spiral achieves Pareto-optimal tradeoffs between query size, response size, rate, throughput, and public parameter size, simultaneously improving over OnionPIR (the prior state-of-the-art) by 4.5x in query size, 1.5x in rate, and 2x in throughput.[^2]

[^1]: Remark 3.3 (p.15): RegevToGSW takes t_GSW Regev encodings (2*t_GSW elements of R_q) and outputs a single GSW encoding with (n+1)*m_GSW = (n+1)^2*t_GSW elements of R_q. This is an (n+1)^2/2 compression factor.

[^2]: Abstract and Table 2 (p.29). Improvements are measured against OnionPIR [MCR21] across a broad range of database configurations.

---

### Variants

| Variant | Key Difference | Query Size | Public Params | Rate (2^18 x 30KB) | Throughput | Best For |
|---------|---------------|-----------|--------------|---------------------|------------|----------|
| **Spiral** | Base: matrix Regev + GSW composition, query compressed to single scalar Regev ct | 14 KB | 14--18 MB | 0.3573 | 322 MB/s | General-purpose static PIR |
| **SpiralStream** | Client uploads expanded Regev + GSW encodings directly (no query expansion); eliminates expansion noise | 8--30 MB | 344 KB--5 MB | 0.4803 | 875 MB/s | Streaming (reused query across DBs) |
| **SpiralPack** | Response packing: n^2 scalar Regev encodings packed into single n x n matrix Regev encoding; uses n=1 for query, larger T_pack for response | 14 KB | 14--47 MB | 0.3488 | 444 MB/s | Large records, high rate |
| **SpiralStreamPack** | Combines streaming + packing | 15--30 MB | 16--125 MB | 0.3117 | 1.48 GB/s | Maximum throughput streaming |

**Variant interaction logic:**
- Stream = skip query expansion (client sends expanded encodings). Trades query size for throughput.[^3]
- Pack = response packing via encoding translation. Trades public parameter size for rate.[^4]
- StreamPack = both optimizations combined. Best throughput (1.9 GB/s on 10^6 records) but largest query and params.[^5]

[^3]: Remark 4.4 (p.19): In SpiralStream, the client directly uploads the Regev and GSW encodings rather than compressing into a single encoding. This eliminates noise from query expansion but yields larger queries.

[^4]: Section 4.1 (p.20): SpiralPack breaks each record into T_pack^2 blocks, processes each sub-database independently, then packs the T_pack^2 scalar Regev results into one T_pack x T_pack matrix Regev encoding. Rate scales as n^2/(n^2 + n) > 1/2 for n > 1.

[^5]: Table 3 (p.30) and Table 4 (p.32).

---

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring Learning with Errors (RLWE) in Hermite normal form [LPR10, ACPS09]; decisional RLWE_{d,m,q,chi} over R = Z[x]/(x^d+1) |
| **Encryption/encoding schemes** | (1) **Matrix Regev encoding** (Construction 2.8): encodes M in R_q^{n x n} as C in R_q^{(n+1) x n}; used for first-dimension processing and final response. (2) **GSW encoding** (Construction 2.14): encodes mu in R_p via gadget matrix G_{n+1,z}; used for dimension folding via external product. Both are "encodings" (no decryption), not full encryptions.[^6] |
| **Ring** | R = Z[x]/(x^d + 1), d = 2048 (power-of-two cyclotomic); R_q = R/qR with q = 2^56 (56-bit modulus, product of two 28-bit primes for CRT) |
| **Key structure** | Two secret keys: S = [-s_tilde | I_n]^T in R_q^{(n+1) x n} (response encoding) and s = [-s_tilde_0 | 1]^T in R_q^2 (query encoding). Secret s_tilde sampled from error distribution chi (normal form). |
| **Correctness condition** | ||E||_inf + (q_1 mod p) < q_1/(2p), where E is the final noise after all homomorphic operations and modulus switching (Eq. 5.1, p.24). Target correctness error epsilon_corr = 2dn^2 exp(-pi C^2) <= 2^{-40}. |

[^6]: Definition 2.9 (p.9) and the discussion following Construction 2.8: Spiral uses "encoding" rather than "encryption" because the scheme does not require (or provide) a decryption algorithm for all encoded values. A *redundant* encoding (scaling the message as in Definition 2.10) does allow recovery.

---

### Ring Architecture / Modulus Chain

| Ring | Dimension | Modulus (bits) | Role / Phase |
|------|-----------|---------------|--------------|
| R_q | d = 2048 | 56 (q = 2^56, product of two 28-bit primes alpha, beta) | Query encryption, all homomorphic operations |
| R_{q_1} | d = 2048 | ~21 bits (q_1 = 4p) | Response modulus-switched component 1 (n^2/(n^2+n) fraction of response) |
| R_{q_2} | d = 2048 | ~21 bits (smallest satisfying correctness) | Response modulus-switched component 2 (n/(n^2+n) fraction of response) |

**CRT decomposition:** q = alpha * beta where alpha, beta are 28-bit primes chosen as 2^i - 2^j + 1 with 2^i > 2^j > 2d for fast modular reduction. alpha = beta = 1 mod 2d ensures Z_alpha and Z_beta have subgroups of order 2d, enabling nega-cyclic NTT.[^7]

[^7]: Section 5.2 (p.27-28). CRT with AVX gives a factor of 2x speedup: four 32-bit-by-32-bit multiplications execute in the time of one 64-bit-by-64-bit multiplication.

---

### Key Data Structures

- **Database:** D = {d_1, ..., d_N} of N = 2^{v1+v2} records, each d_i in R_p^{n x n} with ||d_i||_inf <= p/2. Arranged as a (v2+1)-dimensional hypercube: 2^{v1} x 2 x 2 x ... x 2 (first dimension large, remaining v2 dimensions binary).[^8]
- **Public parameters (pp):** Conversion key ck = (V, W, Pi) for RegevToGSW, automorphism keys W_0, ..., W_{rho-1} for coefficient expansion, plus key S for response encoding. Size: 14--18 MB (Spiral), 344 KB--3 MB (SpiralStream), 14--47 MB (SpiralPack).
- **Query key (qk):** Secret keys (s, S). Retained by client; never sent.
- **Query (q):** Single scalar Regev encoding c in R_q^2 (Spiral/SpiralPack) or expanded encodings (SpiralStream/SpiralStreamPack). Compressed via PRG seed for c_0 component.[^9]
- **Response (r):** Modulus-switched matrix Regev encoding. After ModulusSwitch: (c_hat_1 in R_{q_2}^n, C_hat_2 in R_{q_1}^{n x n}).

[^8]: Construction 4.1 (p.17-18). The first dimension is large (2^{v1}) because processing it requires only linear homomorphisms (scalar multiplication with cleartext DB). The remaining v2 binary dimensions use GSW external products (multiplicative homomorphisms with asymmetric noise growth).

[^9]: Section 5.2 (p.27): Instead of sending c_0 in R_q, the client sends a PRG seed s; the server derives c_0 = PRG(s). This is a standard technique [Gal13, BCD+16, ISW21].

---

### Database Encoding

- **Representation:** (v2+1)-dimensional hypercube with dimensions 2^{v1} x 2 x ... x 2.
- **Record addressing:** Tuple (i, j_1, ..., j_{v2}) where i in [0, 2^{v1}-1] and j_k in {0,1}. Equivalently, (i, j) where j in [0, 2^{v2}-1].
- **Preprocessing required:** All ring elements stored in NTT/evaluation representation for fast homomorphic operations during query processing.[^10]
- **Record size equation:** Each record is an element of R_p^{n x n}, encoding dn^2 log p bits. For base Spiral (n=2, p=256, d=2048): 2048 * 4 * 8 = 65,536 bits = 8 KB per plaintext element. When record size S > dn^2 log p, split into T = ceil(S/(dn^2 log p)) blocks, each processed as a separate database with the same expanded query.

[^10]: Section 5.2 (p.28): "We represent all ring elements in their evaluation representation (i.e., the FFT/NTT representation). This enables faster homomorphic operations during query processing."

---

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Setup** | Client | Generate two secret keys S, s; compute conversion key ck, automorphism keys W_i | pp = (ck, W_0, ..., W_{rho-1}) uploaded to server | Once (offline, reusable) |
| **Query** | Client | Encode target index (i*, j_1*, ..., j_{v2}*) as polynomial mu(x) in R_q; encrypt as c = Regev.Encode(s, mu) | q = c (14 KB, or PRG seed ~128 bits + c_1) | Per query |
| **Query Expansion** | Server | Expand c into 2^{v1} matrix Regev encodings + v2 GSW encodings using coefficient expansion + ScalToMat + RegevToGSW | -- (server-local) | Per query |
| **First-Dim Processing** | Server | For each j in [0, 2^{v2}-1]: C_j^{(0)} = sum_{i=0}^{2^{v1}-1} ScalarMul(C_i^{(Reg)}, d_{i,j}) | -- (server-local) | Per query |
| **Folding** | Server | For r = 1 to v2: C_j^{(r)} = Multiply(Complement(C_r^{(GSW)}), C_j^{(r-1)}) + Multiply(C_r^{(GSW)}, C_{2^{v2-r}+j}^{(r-1)}) | -- (server-local) | Per query |
| **Modulus Switch** | Server | r = ModulusSwitch_{q1,q2}(C_0^{(v2)}) | r: response (~20--242 KB depending on config) | Per query |
| **Extract** | Client | Z = Recover_{q1,q2}(S, r); output Decode(Z) in R_p^{n x n} | -- | Per query |

---

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Scalar Regev encoding c | c = (c_0, c_1) in R_q^2 | 14 KB (with PRG compression) | Encodes packed polynomial mu(x) containing first-dim index i* and all subsequent-dim indices j_1*, ..., j_{v2}* |
| Public parameters (ck, W_i) | Key-switching matrices | 14--18 MB | Enable server to perform ScalToMat, RegevToGSW, and automorphisms |

**Query packing (Eq. 4.1, p.18):** The polynomial mu(x) = 2^{-r1} * mu_{i*}(x^2) + 2^{-r2} * x * mu_{J*}(x^2) where mu_{i*} = floor(q/p) * x^{i*} encodes the first-dimension index, and mu_{J*} = sum_{t in [v2]} mu_{j_t*} encodes all subsequent-dimension indices. Here r1 = 1 + v1 and r2 = 1 + ceil(log(t_GSW * v2)).[^11]

[^11]: Construction 4.1, Query step 3 (p.18). The coefficient expansion algorithm (Algorithm 1 in Appendix A) recovers the individual coefficients of mu via homomorphic evaluation of automorphisms.

---

### Novel Primitives / Abstractions

#### ScalToMat (Scalar-to-Matrix Translation)

| Field | Detail |
|-------|--------|
| **Name** | ScalToMat (Scalar to Matrix Regev Conversion) |
| **Type** | Ciphertext translation primitive |
| **Interface** | ScalToMatSetup(s_0, S_1, z) -> W (key-switching matrix); ScalToMat(W, c) -> C (matrix Regev encoding) |
| **Purpose** | Expand a scalar Regev encoding of mu in R_q (under key s_0) into a matrix Regev encoding of mu * I_n (under key S_1) |
| **Built from** | Key-switching matrix W in R_q^{(n+1) x m} that is an encoding of -s_tilde_0 * G_{n,z} under S_1, plus noise. Conceptually: a "dimension-lifting" key switch. |
| **Noise (worst-case)** | ||E||_inf <= ||e||_inf + dtBz/2 where e is the input encoding error, t = floor(log_z q) + 1, B = bound on chi |
| **Noise (subgaussian)** | sigma_E^2 = sigma_e^2 + dt z^2 sigma_chi^2 / 4 |

#### RegevToGSW (Regev-to-GSW Translation)

| Field | Detail |
|-------|--------|
| **Name** | RegevToGSW (Regev to GSW Conversion) |
| **Type** | Ciphertext translation primitive |
| **Interface** | RegevToGSWSetup(s_Regev, S_GSW, z_GSW, z_conv) -> ck = (V, W, Pi); RegevToGSW(ck, c_1, ..., c_{t_GSW}) -> C (GSW encoding) |
| **Purpose** | Convert t_GSW scalar Regev encodings of (mu, mu*z_GSW, ..., mu*z_GSW^{t_GSW-1}) into a single GSW encoding of mu with decomposition base z_GSW |
| **Built from** | ScalToMat (for each of the t_GSW inputs) + a second key-switching matrix V (for cross-key conversion between s_Regev and S_GSW) + permutation matrix Pi. Uses *two* decomposition bases: z_conv for the conversion step and z_GSW for the output GSW encoding. |
| **Noise (worst-case)** | ||E||_inf <= d * e_max * ||s_GSW||_inf + d * t_conv * B * z_conv where e_max = max_i ||e_i||_inf |
| **Noise (subgaussian)** | sigma^2 = t_conv * d * sigma_chi^2 * z_conv^2 / 2 + d * sigma_e^2 * ||s_GSW||_inf^2 |
| **Compression factor** | (n+1)^2/2: takes 2*t_GSW ring elements, produces (n+1)^2*t_GSW ring elements as a GSW encoding |

**Why two decomposition bases?** The conversion base z_conv controls noise from the translation step independently from z_GSW which controls noise in subsequent GSW external products. This decoupling enables finer noise optimization during parameter selection.[^12]

[^12]: Theorem 3.2 (p.14): "The noise introduced by the encoding conversion step depends only on the decomposition base z_conv and not on the decomposition base z_GSW associated with the GSW encodings."

---

### Regev+GSW Composition: Why Two Ciphertext Types?

The fundamental design tension in lattice-based PIR is:

1. **Regev ciphertexts** have excellent *rate* (n^2/(n^2+n) plaintext-to-ciphertext ratio for matrix version) and support additive homomorphisms efficiently. However, multiplicative homomorphism between two Regev ciphertexts causes *exponential* noise growth in the multiplication depth.[^13]

2. **GSW ciphertexts** support multiplicative homomorphism via external products with *asymmetric* noise growth: when one operand is a "fresh" GSW ciphertext, noise grows only *linearly* (additively) in the number of multiplications, not exponentially.[^14] However, GSW ciphertexts have terrible rate -- encrypting a scalar requires a large matrix.

**The composition strategy** (from Gentry-Halevi [GH19], made concrete by Spiral):
- Use Regev encodings for the *bulk data processing* (first dimension: matrix-vector multiply with cleartext database).
- Use GSW encodings only as *selectors* in the binary folding dimensions. Each folding step multiplies a Regev encoding (accumulator) by a fresh GSW encoding (query bit), keeping noise growth linear in v2.
- The final result is a matrix Regev encoding -- high rate for the response.

**Spiral's specific contribution:** Ciphertext translation (ScalToMat, RegevToGSW) enables compressing the query to a single Regev ciphertext while still producing both ciphertext types server-side. Prior approaches (Gentry-Halevi) required the client to send GSW ciphertexts directly (~30 MB queries).[^15]

[^13]: Section 1.1 (p.3): In the BFV scheme, ciphertext noise scales *exponentially* in the multiplicative depth of computation.

[^14]: Theorem 2.19 (p.11-12): For Multiply(C_GSW, C_Regev), the error is ||mu||_inf * ||E_Regev||_inf + md * ||E_GSW||_inf * z/2. The key property is that ||E_GSW||_inf is the error of a *fresh* GSW ciphertext (not the accumulated Regev error), so the noise contribution from the GSW side does not compound.

[^15]: Section 1.2 (p.4): "Gentry and Halevi estimate that the size of the queries in their construction to be 30 MB, which is more than 450x worse compared to existing schemes."

---

### Correctness Analysis (Option A: FHE Noise Analysis)

Spiral tracks noise as subgaussian parameters (sigma^2) under the **independence heuristic** (Remark 2.18).

#### Noise cascade through protocol phases

| Phase | Noise Parameter | Growth Type | Notes |
|-------|----------------|-------------|-------|
| **Query encoding** | sigma_e = sigma (initial) | -- | Client samples e from chi with width sigma = 6.4 |
| **Coefficient expansion (Regev)** | (sigma^{(Reg)})^2 = sigma^2 * (4^{v1+1}(1 + dt_{coeff,Reg} z_{coeff,Reg}^2/3) + dt_{conv} z_{conv}^2/4) | Exponential in v1 | Dominant cost: each expansion round squares noise; mitigated by 4^{v1+1} scaling |
| **Coefficient expansion (GSW)** | (sigma^{(GSW)})^2 <= 4(t_GSW v2 + 1)^2 sigma^2 (1 + dt_{coeff,GSW} z_{coeff,GSW}^2/3) | Quadratic in t_GSW*v2 | Uses separate base z_{coeff,GSW} = 2 to minimize GSW expansion noise |
| **RegevToGSW conversion** | (sigma^{(GSW)}_E)^2 = (sigma-hat^{(GSW)})^2 dB^2 + t_{conv} d sigma^2 z_{conv}^2/2 | Additive | B = bound on chi; adds conversion noise |
| **First-dimension processing** | (sigma^{(0)})^2 = 2^{v1} nd(p/2)^2 (sigma^{(Reg)})^2 | Linear in 2^{v1} | ScalarMul with cleartext DB entries bounded by p/2 |
| **Folding (per round r)** | (sigma^{(r)})^2 = (sigma^{(r-1)})^2 + dm_{GSW} z_{GSW}^2 (sigma^{(GSW)})^2 / 2 | Additive per round | Key property: fresh GSW operand each round; noise grows linearly in v2 |
| **After all folding** | (sigma^{(v2)})^2 = 2^{v1} nd(p/2)^2 (sigma^{(Reg)})^2 + v2 dm_{GSW} z_{GSW}^2/2 * (sigma^{(GSW)})^2 | -- | Two additive terms: first-dim + folding |
| **Modulus switching** | sigma_2^2 = (q_1/q)^2 (sigma^{(v2)})^2 + (q_1/q_2)^2 sigma_s^2 d/4 | Scales down by (q_1/q)^2 | E = E_1 + E_2; E_1 is deterministic rounding, E_2 carries the variance |

**Final correctness condition (Eq. 5.1):**
||E||_inf <= (1/2)(q_1 mod p + (q_1/q)(q mod p) + 2) + C * sigma_2

where C is chosen so that epsilon_corr = 2dn^2 exp(-pi C^2) <= 2^{-40}.

**Independence heuristic (Remark 2.18):** Models noise components from key switching and homomorphic operations as *independent* subgaussian random variables. This allows bounding the *variance* (sigma^2) rather than the L-infinity norm, yielding a square-root improvement on some noise components. The heuristic is standard in lattice-based systems [GHS12b, CGGI18, MCR21] and is validated empirically in Section 5.3 -- the actual noise is several bits below the heuristic prediction (Fig. 6).[^16]

[^16]: Section 5.3 (p.34-35) and Fig. 6: "there is still a decent margin between the measured error magnitude and the predicted error magnitude."

**Dominant noise source:** First-dimension processing (scales as 2^{v1} * n * d * (p/2)^2) when v1 is large. The first dimension size is capped at 2^9 before noise from coefficient expansion becomes too high for the lattice parameters.[^17]

[^17]: Section 5.3 (p.31-32): "the first dimension can have size at most 2^9 before the noise from the coefficient expansion process is too high to ensure correctness."

---

### Multiple Decomposition Bases and Their Roles

Spiral uses **five** distinct decomposition bases, each controlling a different noise/computation tradeoff:

| Base | Symbol | Typical Values | Role | Noise Impact | Computation Impact |
|------|--------|---------------|------|-------------|-------------------|
| Coefficient expansion (Regev) | z_{coeff,Reg} | {2, 4, 8, 16, 32, 56} | Expand scalar Regev into 2^{v1} Regev encodings for first dimension | Larger z -> more noise from automorphism key-switching | Larger z -> fewer gadget digits -> less computation |
| Coefficient expansion (GSW) | z_{coeff,GSW} | 2 (fixed) | Expand scalar Regev into t_GSW*v2 Regev encodings for GSW conversion | Minimal impact (v2*t_GSW << 2^{v1}) | Fixed at 2 to minimize noise |
| Conversion | z_conv | {2, 4, 8, 16, 32, 56} | ScalToMat and RegevToGSW translation step | Controls translation noise independently of GSW gadget | Larger z -> fewer digits in conversion key-switching |
| GSW gadget | z_GSW | {2, 4, ..., 56} | Gadget matrix G_{n+1,z_GSW} for GSW external products in folding | Larger z -> more noise in folding | Larger z -> fewer gadget digits -> faster folding |
| Response modulus switch | q_1, q_2 | q_1=4p, q_2 minimal | Scale down response ciphertext for compact communication | q_1 = 4p ensures q_1 mod p = 0; q_2 chosen as smallest passing correctness | Determines response size |

**Constraint:** 2^{v1} + v2 * t_GSW <= d to pack everything into a single query polynomial.[^18]

[^18]: Section 5.1 (p.25): "to pack the query into a single scalar Regev encoding, we require that 2^{v1} + v2 * t_GSW <= d."

---

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (2^18 x 30KB, 7.9 GB) | Concrete (2^14 x 100KB, 1.6 GB) | Phase |
|--------|-----------|-------------------------------|--------------------------------|-------|
| Query size | O(d log q) | 14 KB | 14 KB | Online |
| Response size | O(dn^2 log q_1 + dn log q_2) | 84 KB | 242 KB | Online |
| Server computation | O(N * n^2(n+1) * d) | 24.52 s | 4.92 s | Online |
| Client computation (Setup) | O(d * rho * n^2 * m) | ~700 ms | ~700 ms | Offline (once) |
| Client computation (Query) | O(d) | ~30 ms | ~30 ms | Per query |
| Client computation (Extract) | O(dn^2) | < 1 ms | < 1 ms | Per query |
| Public parameter size | O(d * n^2 * m * rho) | 18 MB | 17 MB | Offline (once) |
| Rate | n^2 log p / (n^2 log q_1 + n log q_2) | 0.3573 | 0.1969 | -- |
| Throughput | -- | 322 MB/s | 114 MB/s | -- |

#### Per-variant benchmarks (Table 3, p.30: comparison of all 4 variants)

**Database: 2^20 x 256B (268 MB) -- small records**

| Metric | Best Previous | Spiral | SpiralStream | SpiralPack | SpiralStreamPack |
|--------|-------------|--------|-------------|------------|-----------------|
| Param. Size | 1 MB | 14 MB | 344 KB | 14 MB | 16 MB |
| Query Size | 34 KB | **14 KB** | 8 MB | **14 KB** | 15 MB |
| Response Size | 66 KB | 21 KB | **20 KB** | **20 KB** | 71 KB |
| Computation | 1.44 s | 1.68 s | **0.86 s** | 1.37 s | **0.42 s** |
| Rate | 0.0039 | 0.0122 | **0.0125** | **0.0125** | 0.0036 |
| Throughput | 186 MB/s | 159 MB/s | 312 MB/s | 196 MB/s | **635 MB/s** |

**Database: 2^18 x 30KB (7.9 GB) -- moderate records**

| Metric | Best Previous | Spiral | SpiralStream | SpiralPack | SpiralStreamPack |
|--------|-------------|--------|-------------|------------|-----------------|
| Param. Size | 5 MB | 18 MB | **3 MB** | 18 MB | 16 MB |
| Query Size | 63 KB | **14 KB** | 15 MB | **14 KB** | 30 MB |
| Response Size | 127 KB | 84 KB | **62 KB** | 86 KB | 96 KB |
| Computation | 52.99 s | 24.52 s | **9.00 s** | 17.69 s | **5.33 s** |
| Rate | 0.2363 | 0.3573 | **0.4803** | 0.3488 | 0.3117 |
| Throughput | 148 MB/s | 321 MB/s | 874 MB/s | 444 MB/s | **1.48 GB/s** |

**Database: 2^14 x 100KB (1.6 GB) -- large records**

| Metric | Best Previous | Spiral | SpiralStream | SpiralPack | SpiralStreamPack |
|--------|-------------|--------|-------------|------------|-----------------|
| Param. Size | 5 MB | 17 MB | **1 MB** | 47 MB | 24 MB |
| Query Size | 63 KB | **14 KB** | 8 MB | **14 KB** | 30 MB |
| Response Size | 508 KB | 242 KB | **208 KB** | 188 KB | **150 KB** |
| Computation | 14.35 s | 4.92 s | 2.40 s | 4.58 s | **1.21 s** |
| Rate | 0.1969 | 0.4129 | 0.4811 | 0.5307 | **0.6677** |
| Throughput | 114 MB/s | 333 MB/s | 683 MB/s | 358 MB/s | **1.35 GB/s** |

#### FHE-specific metrics

| Metric | Spiral | SpiralStream | SpiralPack | SpiralStreamPack |
|--------|--------|-------------|------------|-----------------|
| Plaintext dimension n | 2 | 2 | 1 (query) / T_pack (pack) | 1 / T_pack |
| Encoding modulus q | 2^56 | 2^56 | 2^56 | 2^56 |
| Communication rate formula | n^2 log p / (n^2 log q_1 + n log q_2) | same | T_pack^2 log p / ((T_pack^2 + T_pack) * log q_eff) | same |
| Max rate achievable | ~0.53 (for n=2) | ~0.81 | ~0.81 | ~0.81 |
| Multiplicative depth | v2 (external products) | v2 | v2 | v2 |

#### Streaming-setting benchmarks (Table 4, p.32: 100KB records, query expansion amortized)

| N | Metric | FastPIR | OnionPIR | Spiral | SpiralPack | SpiralStream | SpiralStreamPack |
|---|--------|---------|----------|--------|------------|-------------|-----------------|
| 2^12 | Throughput* | 23 MB/s | 159 MB/s | 544 MB/s | 640 MB/s | 1.20 GB/s | **1.57 GB/s** |
| 2^16 | Throughput* | 142 MB/s | 157 MB/s | 433 MB/s | 614 MB/s | 1.52 GB/s | **1.93 GB/s** |
| 2^20 | Throughput* | 201 MB/s | 158 MB/s | 355 MB/s | 521 MB/s | 1.46 GB/s | **1.94 GB/s** |
| 2^20 | Rate | 0.1392 | 0.2419 | 0.3902 | 0.6857 | 0.4918 | **0.8057** |

*Throughput excludes query expansion cost (amortized over stream lifetime).

#### Maximum-rate and maximum-throughput configurations (Table 5, p.32)

| Database | Best System (Rate) | Rate | Throughput | Best System (Throughput) | Rate | Throughput |
|----------|-------------------|------|-----------|------------------------|------|-----------|
| 2^20 x 256B | SpiralStream | **0.0227** | 130 MB/s | SpiralStreamPack | 0.0025 | **1.03 GB/s** |
| 2^18 x 30KB | SpiralStream | **0.4883** | 326 MB/s | SpiralStreamPack | 0.1723 | **1.85 GB/s** |
| 2^14 x 1MB | SpiralStreamPack | **0.7750** | 1.35 GB/s | SpiralStreamPack | 0.6532 | **1.65 GB/s** |

---

### Comparison with Prior Work

| Metric | Spiral | SealPIR | FastPIR | OnionPIR | Configuration |
|--------|--------|---------|---------|----------|--------------|
| Query size | **14 KB** | 66 KB | 33 MB | 63 KB | 2^18 x 30KB |
| Response size | 84 KB | 3 MB | 262 KB | **127 KB** | 2^18 x 30KB |
| Server time | **24.52 s** | 74.91 s | 50.52 s | 52.73 s | 2^18 x 30KB |
| Throughput | **322 MB/s** | 105 MB/s | 156 MB/s | 149 MB/s | 2^18 x 30KB |
| Rate | **0.3573** | 0.0092 | 0.1144 | 0.2363 | 2^18 x 30KB |
| Public params | 18 MB | **3 MB** | 1 MB | **5 MB** | 2^18 x 30KB |
| Security | 128-bit | 115-bit | -- | 111-bit | -- |
| Server cost | **$0.000140** | $0.000701 | $0.000297 | $0.000297 | 2^18 x 30KB |

**Key takeaway:** Spiral simultaneously achieves the smallest query, highest rate, and highest throughput for moderate-to-large records. Its main limitation is larger public parameters (14--47 MB vs 1--5 MB for competitors). For streaming applications, SpiralStreamPack achieves 1.9 GB/s throughput -- 9.7x higher than FastPIR and only 2.9x slower than hardware-accelerated AES-based two-server PIR.[^19]

[^19]: Section 1 (p.2): "For streaming large records, we estimate the monetary cost of SpiralStreamPack to be only 1.9x greater than that of the no-privacy baseline where the client directly downloads the desired record."

---

### Modulus Switching (Section 3.4)

Spiral introduces a **two-modulus** switching approach that achieves higher rate than standard single-modulus switching.[^20]

- Standard approach: rescale entire ciphertext from R_q to R_{q'} for a single smaller modulus q'.
- Spiral's approach: rescale different components of the matrix Regev ciphertext to *different* moduli:
  - The n^2 rows carrying the message are rescaled to modulus q_1 (very small, q_1 = 4p).
  - The n rows carrying the encryption overhead are rescaled to modulus q_2 (smallest passing correctness).
- Rate formula: rate = n^2 log p / (n^2 log q_1 + n log q_2).
- This allows rates up to 0.81 (compared to max 0.34 with single-modulus switching).

[^20]: Section 3.4 (p.16): "While previous approaches [BV11, BGV12, GHS12b, GH19] rescale all of the ciphertext components from R_q to R_{q'} for some q' < q, we can achieve further compression by re-scaling some of the components of the Regev ciphertext to one modulus q_1 and the remaining components to a different modulus q_2."

---

### Parameter Selection (Section 5.1)

#### Fixed parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| d (ring dimension) | 2048 | Minimum for 128-bit security with 56-bit q. Supports N <= 2^22 records. |
| q (encoding modulus) | 2^56 | Product of two 28-bit primes for CRT. Sufficient for all target databases. |
| n (plaintext dimension) | 2 (Spiral) / 1 (SpiralPack query) | n=2 balances rate (4/6 = 0.67 theoretical max) vs computation cost (O(n^2(n+1)) per first-dim op) |
| sigma (noise width) | 6.4 | Discrete Gaussian, estimated 128-bit classical security via LWE estimator [APS15] |
| z_{coeff,GSW} | 2 | Fixed at minimum to minimize GSW expansion noise; negligible computation impact since v2*t_GSW << 2^{v1} |
| epsilon_corr (correctness) | 2^{-40} | Target correctness error per ring coefficient |

#### Searched parameters

| Parameter | Search Range | Impact |
|-----------|-------------|--------|
| p (plaintext modulus) | Powers of 2 up to 2^30 | Larger p -> higher rate but more noise in first dim |
| q_1 | 4p (fixed relation) | Ensures q_1 mod p = 0 |
| q_2 | Smallest satisfying correctness | Minimized for best rate |
| z_{coeff,Reg} | {2, 4, 8, 16, 32, 56} | Larger -> less computation, more noise |
| z_conv | {2, 4, 8, 16, 32, 56} | Larger -> less computation, more noise |
| t_GSW | [2, 56] | Controls GSW precision; constrained by 2^{v1} + v2*t_GSW <= d |
| v_1, v_2 | v_1 in [2,11], v_2 varies | Database configuration; v_1 determines first-dim size |
| T (executions) | Computed from record size | T = ceil(S / (dn^2 log p)) |

**Search procedure:** ~3 million candidate parameter sets pruned to ~700,000 feasible sets (correctness < 2^{-40}), cached in 40 MB. Heuristic cost model using AWS pricing ($0.0195/CPU-hour, $0.09/GB outbound) selects minimum total cost. Search takes ~10 seconds.[^21]

#### Sample parameters (Table 1, p.27)

| Database | log p | log q_2 | t_{coeff,Reg} | t_conv | t_GSW | (v_1, v_2) | T | Rate | Est. CPU | Actual CPU |
|----------|-------|---------|--------------|--------|-------|-----------|---|------|----------|-----------|
| 2^20 x 256B | 8 | 21 | 8 | 4 | 9 | (9, 6) | 1 | 0.0122 | 1.68 s | 1.69 s |
| 2^14 x 100KB | 9 | 21 | 16 | 4 | 10 | (9, 5) | 11 | 0.4129 | 5.03 s | 4.92 s |

[^21]: Section 5.1 (p.25-26).

---

### Implementation Notes

- **Language / Library:** C++, ~4,000 lines of code.
- **Polynomial arithmetic:** NTT-based (nega-cyclic NTT). Adapted from SEAL library [SEA19] for FFT implementation. Intel HEXL library [BKS+21] for response-decoding FFTs.
- **CRT decomposition:** q = alpha * beta (two 28-bit primes). All arithmetic in R_alpha x R_beta via CRT. Primes chosen as 2^i - 2^j + 1 for fast modular reduction. CRT with AVX gives 2x speedup on first-dimension processing.[^22]
- **SIMD / vectorization:** AVX2 and AVX-512. AVX2 is the primary performance driver (disabling causes 2x slowdown on large DBs). AVX-512 contributes 6--14% speedup.
- **Parallelism:** Single-threaded benchmarks. All reported numbers are single-threaded on Amazon EC2 c5n.2xlarge (8 vCPUs, Intel Xeon Platinum 8124M @ 3 GHz, 21 GB RAM).
- **Database representation:** Elements in NTT/evaluation form. Implicit representation (1 GB minimum) with < 1% effect on compute time.
- **Open source:** https://github.com/menonsamir/spiral

[^22]: Section 5.3 (p.34): "using CRT with AVX gives us a factor of 2x speed-up for arithmetic operations... we observe a 2.1x slowdown in the time it takes to process the first dimension" when using 64-bit arithmetic instead.

---

### Application Scenarios

#### Private video streaming
- Library of 2^14 movies, 2 GB each. Using SpiralStreamPack:
  - Upload: 30 MB query
  - Download: 2.5 GB response
  - Compute: 5.6 CPU-hours
  - Server cost: **$0.33** (1.9x over no-privacy baseline of $0.18)
  - Comparison: OnionPIR costs $3.01 (17x over baseline, 9x more expensive than Spiral).[^23]

#### Private voice calls (Addra system)
- 2^20 users, 5-minute call = 625 rounds, 96 bytes/round. Using SpiralStream:
  - Upload: 29 MB, Download: 11 MB, CPU: 112 seconds
  - Per-user server cost: $0.0016 (3.9x cheaper than FastPIR/Addra).[^24]

#### Private Wikipedia
- 31 GB database (all English Wikipedia text), 30 KB max article size. Using SpiralPack:
  - 16-core machine, 42 GB RAM, database partitioned into 16 shards
  - End-to-end latency: **4.3 seconds** (2.1x faster than OnionPIR)
  - Monthly server cost: $229.[^25]

[^23]: Section 5.3 (p.35).
[^24]: Section 5.3 (p.35).
[^25]: Section 5.3 (p.35).

---

### Deployment Considerations

- **Database updates:** Not addressed. Database is assumed static. Full re-encoding required for updates (NTT conversion of new elements).
- **Sharding:** Supported naturally -- same query can be applied to multiple database shards in parallel (used in Wikipedia scenario with 16 shards).
- **Key rotation / query limits:** Public parameters are query-independent and reusable for arbitrary queries. No stated query limit. Security relies on KDM-security of Regev encoding (circular security assumption for automorphism keys).
- **Anonymous query support:** Public parameters are client-specific (contain encryption of client's secret key). Server can link queries to the client who uploaded parameters, but cannot link different queries from the same client.
- **Session model:** Setup phase (offline upload of pp) + stateless per-query online phase.
- **Cold start suitability:** No -- requires 14--125 MB public parameter upload before first query. Best for settings where parameters are reused across many queries.
- **Amortization crossover:** Public parameters amortize over all subsequent queries. The streaming variants (SpiralStream, SpiralStreamPack) additionally amortize query expansion cost. Best when client issues many queries against evolving databases (e.g., streaming, messaging).

---

### Key Tradeoffs & Limitations

1. **Large public parameters** (14--125 MB) vs small queries (14 KB). This is the fundamental tradeoff: ciphertext translation requires key-switching matrices that encode the client's secret key under various transformations. Prior schemes have 1--5 MB public parameters.[^26]
2. **Plaintext dimension n** creates a rate-vs-computation tradeoff: rate = n^2/(n^2+n) increases with n, but first-dimension processing cost is O(n^2(n+1)) per operation. Base Spiral uses n=2; SpiralPack uses n=1 for processing with packing to achieve high effective n.[^27]
3. **First-dimension size limited to ~2^9** by noise from coefficient expansion. Cannot scale first dimension indefinitely; must increase v2 (more binary folding rounds) for larger databases, which reduces throughput.
4. **Streaming vs static tradeoff:** SpiralStream achieves much higher throughput but requires 8--30 MB queries (vs 14 KB). Worthwhile only when query is reused across many databases/invocations.
5. **Small records have low rate** (all lattice-based PIR schemes share this limitation): ciphertexts have a minimum size regardless of plaintext, so rate is poor when records are smaller than one plaintext element (dn^2 log p bits).

[^26]: Section 1 (p.2): "In Spiral, they range from 14 to 18 MB and for SpiralStream, they range from 344 KB to 3 MB."

[^27]: Section 5.1 (p.25): "the per-record computational cost also scales linearly with the dimension n. In particular, each homomorphic operation in the first dimension processing pass requires computing N * O(n^2(n+1)) ring operations."

---

### Portable Optimizations

1. **Ciphertext translation (ScalToMat, RegevToGSW):** Applicable to any setting combining Regev and GSW encodings. Provides (n+1)^2/2 compression on GSW ciphertexts at the cost of key-switching material. Useful beyond PIR for any protocol requiring compact GSW ciphertext communication.
2. **Two-modulus switching:** Rescaling different ciphertext components to different moduli. Applicable to any matrix Regev scheme to achieve higher communication rate.
3. **Decoupled decomposition bases (z_conv independent of z_GSW):** Enables finer noise optimization in any protocol using Regev-to-GSW conversion.
4. **CRT with AVX for ring arithmetic:** Using q = product of two 28-bit primes with CRT enables 4x parallelism via AVX (four 32-bit multiplications in one SIMD instruction). Applicable to any RLWE-based system with 56-bit modulus.

---

### Open Problems (stated or implied)

- Hardware acceleration for lattice operations could close the remaining 2.9x gap between SpiralStreamPack and hardware-accelerated AES-based two-server PIR [HH19].
- Reducing public parameter size while maintaining the query compression benefits of ciphertext translation.
- Extending to dynamic databases with efficient update mechanisms.
- Multi-query batching beyond the streaming setting.

---

### Uncertainties

- The paper's concrete parameter selection relies on the independence heuristic (Remark 2.18) for setting lattice parameters. While empirically validated (Fig. 6 shows several bits of margin), the heuristic is not proven. The worst-case bounds (Theorem 4.5) hold unconditionally but require larger parameters.
- Security levels: SealPIR and OnionPIR achieve 115 and 111 bits of security respectively; Spiral claims 128 bits. This makes the comparison slightly favorable to Spiral (it could use slightly smaller parameters at 111 bits for an even faster scheme).
- The paper assumes a "software-based AES" baseline for the 2--4x throughput comparison with symmetric encryption. Hardware-accelerated AES would be 2.9x faster than SpiralStreamPack.
