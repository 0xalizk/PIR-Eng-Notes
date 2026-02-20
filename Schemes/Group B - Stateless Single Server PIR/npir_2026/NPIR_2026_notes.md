## NPIR: High-Rate PIR for Databases with Moderate-Size Records -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [NPIR: High-Rate PIR for Databases with Moderate-Size Records](https://eprint.iacr.org/2025/2257) (2026) |
| **Archetype** | Construction |
| **PIR Category** | Group B -- Stateless single-server PIR |
| **Sub-model** | Public-parameter upload (client sends public key material offline) |
| **Security model** | Semi-honest single-server (computational PIR) |
| **Additional assumptions** | Key-dependent pseudorandomness for NTRU encodings (circular security, Definition 5, p.27); decisional NTRU (Definition 2, p.7) |
| **Correctness model** | Probabilistic (delta-correct: Pr[fail] <= delta, with delta targeted at 2^{-40} via parameter selection) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Moderate (10--100 KB); primary evaluation at 32 KB records; extensions to 2 KB (small) and 128 KB (large) |

[^1]: Abstract (p.1): "we present NPIR, a high-rate single-server PIR that is based on NTRU encoding and outperforms the state-of-the-art Spiral (Menon & Wu, S&P 2022) and NTRUPIR (Xia & Wang, EuroS&P 2024) in terms of server throughput for databases with moderate-size records."

[^2]: Section 5.1 (p.16): "we select a parameter set that achieves a correctness error of at most 2^{-40} while maintaining NIST-I security via the lattice estimator."

---

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | NTRUPIR [53] (NTRU-based PIR via NTRU FHE, EuroS&P 2024); Spiral [43] (Regev+GSW composition, S&P 2022); Xiang et al. [54] (NTRU automorphisms for bootstrapping, CRYPTO 2023); Chen et al. [18] (LWEs-to-RLWE ring packing, ACNS 2021); SealPIR [3] (coefficient expansion technique) |
| **What changed** | Replaced RLWE-based external products and homomorphic selection (Spiral) with NTRU encoding + a novel NTRU packing technique that compresses N*phi NTRU encodings into phi encodings by extracting constant terms via Galois-group automorphisms, eliminating second-dimension folding overhead |
| **Superseded by** | N/A |
| **Concurrent work** | N/A |

[^3]: Section 1.1 (p.2): "We give an affirmative answer to above question by introducing NPIR, a high-rate single-server PIR that is based on NTRU encoding and outperforms Spiral [43] in terms of server throughput for databases with moderate-size records."

[^4]: Section 1.2 (p.4): "Our NTRU packing mechanism adapts the LWEs-to-RLWE ring packing paradigm from [18] to the NTRU setting."

---

### Core Idea

NPIR addresses the high server computation cost of existing high-rate PIR schemes (Spiral, NTRUPIR) for databases with moderate-size records (tens of KB). The key innovation is a novel **NTRU packing** technique that compresses N*phi NTRU encodings -- whose constant terms form a target record -- into phi NTRU encodings, using an FFT-style structure built from Galois group automorphisms and the field trace function.[^4] This replaces the homomorphic selection method used in Spiral and NTRUPIR's second-dimension processing. Combined with a polynomial-matrix database layout indexed by (col, term) pairs, NPIR achieves 1.50--2.84x better server throughput than Spiral and 1.77--2.55x better than NTRUPIR for 1--32 GB databases with 32 KB records, with a communication rate of 0.250.[^5]

[^5]: Table 1 (p.15) and Section 5.2 (p.16-17): NPIR throughput ranges from 175.34 MB/s (1 GB) to 715.15 MB/s (32 GB), compared to Spiral's 116.89--272.11 MB/s and NTRUPIR's 98.56--311.69 MB/s over the same range. NPIR's rate is 0.250 while Spiral's rate is 0.390.

---

### Variants

| Variant | Key Difference | Query Size | Response Size | Best For |
|---------|---------------|-----------|--------------|----------|
| **NPIR** | Base: single-query retrieval with NTRU packing | 84 KB | 128 KB | Single moderate-size record retrieval |
| **NPIR_b** | Batch variant: groups T queries into ceil(T*ell/N) column encodings and T NGSW encodings | Larger (T queries packed) | Smaller per record (fully utilized plaintext space) | Multi-record retrieval (batch sizes 8--32) |

[^6]: Section 4.3.1 (p.14): "Leveraging unused capacity in column plaintexts (ell - 1 <= N - 1), the client groups T batch indices into subsets of size floor(N/ell) and encodes them into ceil(T*ell/N) column encodings and T NGSW encodings."

---

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | NTRU packing |
| **Type** | Cryptographic primitive (ciphertext compression) |
| **Interface / Operations** | NPSetup(1^λ, f, B_pk) -> pk: generates packing key (set of automorphism keys W_i for i in [kappa]). NPacking(pk, C) -> c_hat: takes N NTRU encodings and outputs a single packed NTRU encoding. |
| **Security definition** | Pseudorandomness given the public key, based on key-dependent pseudorandomness for NTRU encodings (Definition 5, p.27) |
| **Correctness definition** | c_hat * f approx N * SUM_{i in [N]} v_{i,0} * X^i, where v_{i,0} is the constant term of the i-th input encoding's plaintext. Error is sub-Gaussian with parameter sigma_hat <= sqrt((N^2-1)*t_pk*N*B_pk^2*sigma_chi^2/36 + N^2*sigma_chi^2). |
| **Purpose** | Compresses N NTRU encodings into one encoding that preserves only the constant terms of the underlying plaintexts, enabling extraction of a full database record from matrix-vector product results |
| **Built from** | NTRU automorphisms (tau_kappa, from [54]); FFT-style recursive structure adapted from LWEs-to-RLWE ring packing [18]; anticirculant matrix M(f) replaces the standard secret matrix to handle the f^{-1} factor in NTRU encodings |
| **Standalone complexity** | NPSetup: O(kappa * t_pk) automorphism key generations where kappa = log_2(N). NPacking: O(N * log N) automorphism operations (FFT-style recursion with log_2(N) levels). |
| **Relationship to prior primitives** | Extends LWEs-to-RLWE ring packing [18] from RLWE to NTRU; introduces anticirculant matrix F = M(f) to handle NTRU's invertible secret key structure, which is incompatible with the matrix-to-polynomial transformation used in RLWE packing. |

[^7]: Section 3.1 (p.10): "While [18] employs a matrix-to-polynomial transformation, applying the matrix form of NTRU directly results in incompatibility with the ring-packing model due to the invertible secret matrix F. To address this incompatibility, we introduce a special anticirculant matrix F = M(f), derived from a polynomial f."

[^8]: Theorem 1 (p.11): The NTRU packing scheme is correct with sub-Gaussian error parameter sigma_hat <= sqrt((N^2-1)*t_pk*N*B_pk^2*sigma_chi^2/36 + N^2*sigma_chi^2), and satisfies pseudorandomness given the public key if NTRU encodings satisfy Definition 5.

---

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Decisional NTRU problem (Definition 2, p.7): distinguish g * f^{-1} from uniform over R_q, where f and g are sampled from sub-Gaussian distribution chi with f invertible |
| **Encryption/encoding schemes** | (1) **NTRU encoding** (Regev-like): NTRU_f(u) := (g + Delta * u) * f^{-1} in R_q, where g sampled from chi, Delta = floor(q/p), u in R_p. (2) **NGSW encoding** (GSW-like): NGSW_f(B_g, v) := (g_0/f + B_g^0 * v, ..., g_{t_g-1}/f + B_g^{t_g-1} * v) in R_q^{t_g}, used for external products. |
| **Ring / Field** | R = Z[X]/(X^N + 1), N = 2048 (power-of-two cyclotomic); R_q = Z_q[X]/(X^N + 1) with q approx 2^54 (product of two NTT-friendly primes q_1 = 11 * 2^21 + 1 and q_2 = 479 * 2^21 + 1) |
| **Key structure** | Single invertible secret key f sampled from chi with f^{-1} existing in R_q. Public parameter pp = (pk, ck, B_pk, B_ce, B_g) where pk is the NTRU packing key and ck is the coefficient expansion key. Query key qk = f. |
| **Correctness condition** | Probabilistic: floor(q_1/p) >= sigma_chi * sqrt(N * ln(2/delta) / pi) * sqrt(1 + ((N^2-1)*t_pk*B_pk^2/9 + ell*p^2/3*(1 + (2^r)^2*t_ce*N*B_ce^2/3 + t_g*N*B_g^2/12)) / q_2^2) (Equation 2, p.29) |

[^9]: Section 2.4 (p.7): "NTRU_f(u) := (g + Delta * u) * f^{-1} in R_q, where g is sampled from chi and Delta is the scaling factor floor(q/p)."

[^10]: Section 5.1 (p.16): "We first set the NTRU parameter set: dimension N = 2048, modulus q approx 2^54, and error distribution chi, which is a sub-Gaussian distribution with parameter sigma_chi = sqrt(4*pi/3)."

[^11]: Section 5.1 (p.16): "We employ the fast number-theoretic transform (NTT) technique to accelerate polynomial multiplications. To do so, we use a modulus q, represented as a product of two NTT-friendly primes, that is, q = q_1 * q_2 where q_1 = 11 * 2^21 + 1 and q_2 = 479 * 2^21 + 1."

---

### Key Data Structures

- **Database:** D in R_p^{N*phi x ell}, a matrix of polynomials over the plaintext ring R_p = Z_p[X]/(X^N + 1) with p = 256. Each record is indexed by a (col, term) pair where col in [ell] and term in [N]. The row count is N*phi where phi is the packing number. Record size = N*phi*log_2(p) bits = N*phi bytes (for p = 256).[^12]
- **Public parameters (pp):** Packing key pk (log_2(N) = 11 automorphism keys, each of size t_pk * log_2(q) bits), expansion key ck (ceil(log_2(ell)) automorphism keys, each of size t_ce * log_2(q) bits), and decomposition bases B_pk, B_ce, B_g. Total storage: 0.89--1.44 MB.[^13]
- **Query key (qk):** Secret key f (single polynomial in R).
- **Query (qu):** Triple consisting of ((2^r)^{-1} mod q) * cc, (N^{-1} mod q) * rc, where cc is an NTRU encoding and rc is an NGSW encoding. Size: 84 KB (N*log_2(q)*(1 + t_g) bits).[^14]
- **Response (resp):** phi modulus-switched NTRU encodings. Size: N*phi*log_2(q_1) bits = 128 KB for phi = 16.[^15]

[^12]: Section 4.1 (p.12): "NPIR operates on database D = {d_{i,j}}_{i in [N*phi], j in [ell]} in R_p^{N*phi x ell}, where each record maps to coefficients of a column-specific term."

[^13]: Table 1 (p.15): Storage (public parameter) for NPIR ranges from 0.89 MB (1 GB DB) to 1.44 MB (32 GB DB).

[^14]: Section 4.1 (p.12): "the client generates one NTRU and one NGSW encoding and upload a query of size N*log_2(q)*(1 + t_g)." For N=2048, q approx 2^54, t_g=5: 2048*54*(1+5)/8 = 84 KB.

[^15]: Section 4.1 (p.12): "the client downloads a response of size N*phi*log_2(q_1)." For N=2048, phi=16, q_1 = 11*2^21+1 (approx 2^24.5). The 128 KB response size per Table 1 reflects 32-bit aligned storage in practice.

---

### Database Encoding

- **Representation:** Matrix of polynomials D in R_p^{N*phi x ell}. Each column corresponds to one of ell groups; each row is one of N*phi polynomials. A record at index ind = (col, term) spans all N*phi rows at column col, with the data stored in the coefficient of X^term in each polynomial.[^12]
- **Record addressing:** Two-part index: col in [ell] selects a column, term in [N] selects a polynomial coefficient. The record consists of the term-th coefficients from all N*phi polynomials in column col.
- **Preprocessing required:** Server converts the database from raw records d_i in Z_p^m into polynomial encoding {d_{i,j}} in R_p^{N*phi x ell}, then performs NTT conversion for efficient polynomial multiplication.[^16]
- **Record size equation:** Record size = N * phi * log_2(p) bits. For p = 256 (8 bits): record_size = N * phi bytes. With N = 2048: phi = 16 gives 32 KB, phi = 1 gives 2 KB, phi = 64 gives 128 KB.[^17]

[^16]: Section 4.1 (p.12): "the server converts the database format (polynomial encoding + NTT conversion)."

[^17]: Section 5.1 (p.16): "The record size is equal to the packing number multiplied by the modulus (i.e., N*phi*log_2(p) bits). Therefore, we define the packing number phi as 16 for 32 KB."

---

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Setup** | Client | Generate decomposition bases B_pk, B_ce, B_g; sample invertible secret f from chi; create packing key pk via NPSetup and expansion key ck via CESetup | -- | Once |
| **Public param upload** | Client -> Server | Send pp = (pk, ck, B_pk, B_ce, B_g) | 0.89--1.44 MB upload | Once (reusable across queries) |
| **DB Encoding** | Server | Encode D into R_p^{N*phi x ell}; perform NTT conversion | -- | Once per DB update |
| **Query Gen** | Client | Encrypt column plaintext cp = X^col as NTRU encoding cc; encrypt rotation plaintext rp = -X^{N-term} as NGSW encoding rc; apply scaling factors (2^r)^{-1}, N^{-1} | 84 KB upload | Per query |
| **Query Recovery** | Server | Expand cc into ell NTRU encodings via CoeffExpand; compute external product of each with rc to form query vector | -- | Per query |
| **First-dim Multiply** | Server | Compute c_hat_i = SUM_{j=0}^{ell-1} d_{i,j} * c_tilde_j for each i in [N*phi] | -- | Per query |
| **Packing** | Server | Apply NPacking to compress {c_hat_i} into phi packed encodings; modulus switch from q to q_1 | -- | Per query |
| **Response** | Server -> Client | Send phi modulus-switched NTRU encodings | 128 KB download | Per query |
| **Recover** | Client | For each of phi encodings, compute Coeff(rho_bar_i * f) to extract record coefficients | -- | Per query |

[^18]: Figure 4 (p.13): Complete construction of the NPIR scheme showing all five algorithms: Setup, SetupDB, Query, Response, Recover.

---

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Column encoding cc | NTRU encoding of X^col | N * log_2(q) bits (approx 14 KB) | Selects target column via coefficient expansion |
| Rotation encoding rc | NGSW encoding of -X^{N-term} | N * t_g * log_2(q) bits (approx 70 KB) | Rotates to target term position via external product |
| Scaling factors | (2^r)^{-1} mod q, N^{-1} mod q | Embedded in query | Offsets expansion and packing scaling effects |

[^19]: Section 4.1 (p.12-13), Figure 4: The query consists of the tuple (((2^r)^{-1} mod q) * cc, (N^{-1} mod q) * rc).

---

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Public parameters (pk, ck) | Client -> Server | 0.89--1.44 MB | Yes, across all queries | Offline; size depends on ell |
| Query (cc + rc) | Client -> Server | 84 KB | No | Per query; dominated by NGSW encoding |
| Response | Server -> Client | 128 KB | No | Per query; phi packed NTRU encodings after modswitch |

---

### Correctness Analysis

#### Option A: FHE Noise Analysis

The paper tracks noise via sub-Gaussian parameters through four phases of the Response algorithm: query recovery (coefficient expansion + external product), first-dimension multiplication, NTRU packing, and modulus switching.[^20]

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| After coefficient expansion | sigma_ce <= sqrt((2^r)^2 * t_ce * N * B_ce^2 * sigma_chi^2 / 3 + (2^r)^2 * sigma_chi^2) | Additive (tree of automorphisms) | r = ceil(log_2(ell)) levels; noise pre-multiplied by (2^r)^{-1} |
| After external product (query recovery) | sigma_1st <= sqrt((2^r)^2 * t_ce * N * B_ce^2 * sigma_chi^2 / 3 + t_g * N * B_g^2 * sigma_chi^2 / 12 + sigma_chi^2) | Additive (external product adds NGSW noise) | Uses norm bound on rotation plaintext rp: norm(rp)_2^2 = 1 |
| After first-dim multiply | sigma_2nd = sqrt(N * ell * p^2 * sigma_1st^2 / 12) | Multiplicative (inner product with DB) | DB coefficients d_{i,j} are uniform in Z_p |
| After NTRU packing | sigma_3rd <= sqrt((N^2-1) * t_pk * N * B_pk^2 * sigma_chi^2 / 36 + sigma_2nd^2) | Additive (log_2(N) automorphism levels) | From Theorem 1 |
| After modulus switching | sigma_4th^2 <= sigma_3rd^2 / q_2^2 + N * sigma_chi^2 / 4 | Scaling + rounding | Modswitch from q to q_1 introduces rounding error bounded by 1/2 and scaling by q_1/q |

- **Correctness condition:** floor(q_1/p) >= sigma_chi * sqrt(N * ln(2/delta) / pi) * sqrt(composite_expression) where the composite expression aggregates all four noise phases (Equation 2, p.29).[^21]
- **Independence heuristic used?** The proof assumes sub-Gaussian composition (summation property) throughout, which is standard but implicitly assumes independence of noise sources across phases.
- **Empirical noise budget:** Parameters are selected to achieve delta <= 2^{-40} correctness error.[^2]
- **Dominant noise source:** The first-dimension multiplication (sigma_2nd) dominates because it involves an inner product of ell database polynomials with ell query ciphertexts, each contributing p^2/12 variance per coefficient. For large databases (large ell), this term scales linearly with ell.

[^20]: Appendix A.2 (p.28-29): Proof of Theorem 2 decomposes the Response algorithm into four steps: query recovery, database-query multiplication, packing, and modulus switching.

[^21]: Equation 2 (p.29): The full correctness inequality combining all four noise phases.

---

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (32 KB records, 8 GB DB) | Phase |
|--------|-----------|----------------------------------|-------|
| Query size | O(N * log q * (1 + t_g)) | 84 KB | Online |
| Response size | O(N * phi * log q_1) | 128 KB | Online |
| Server computation | O(N * ell * phi) multiplications + O(phi) packing ops | 14.87 s | Online |
| Client computation | O(1 + t_g) encryptions + O(phi) decryptions | 1.62 ms | Online |
| Throughput | -- | 550.91 MB/s | Online |
| Response overhead | O(1) | 4x (128 KB / 32 KB) | -- |

[^22]: Table 1 (p.15): For 8 GB (2^18 x 32 KB) database, NPIR achieves 550.91 MB/s throughput, 14.87 s server time, 1.62 ms client time.

#### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Public parameters | O(t_pk * N * log_2(N) * log q + t_ce * N * log_2(ell) * log q) | 1.22 MB (8 GB DB) | Setup (once) |
| Communication rate | -- | 0.250 (from byte-aligned communication; see Footnote 1, p.3) | -- |
| Expansion factor | log_2(q_1) / log_2(p) | 4.0 (= 32/8) | -- |

[^23]: Section 1.1 (p.3): NPIR's rate is 0.250. Footnote 1 (p.3): "The scaling factor is defined as Delta := floor(q/p), where q is a modulus and p is a plaintext modulus. Indeed, q must be aligned during communication, and the rate is not exactly equal to the scaling factor." The rate 0.250 arises from practical byte-alignment (8 bits per 32-bit aligned coefficient), not from the raw formula log_2(p)/log_2(q_1).

#### Server computation breakdown

| Component | Time (8 GB DB) | Scaling |
|-----------|---------------|---------|
| Expand (query recovery) | 0.08 s | O(log ell) -- linear in DB columns |
| Multiply (first-dim) | 10.18 s | O(N * ell * phi) -- linear in DB size |
| Packing | 4.61 s (0.288 s amortized) | O(phi) -- constant per record size |
| **Total** | **14.87 s** | -- |

[^24]: Table 2 (p.17): Breakdown of NPIR server time for 4--32 GB databases. Packing overhead is 4.61 s total but only 0.288 s amortized per query.

---

### Performance Benchmarks

**Hardware:** Aliyun ECS.r7.16xlarge instance, Intel Xeon Ice Lake Platinum 8369B at 2.70 GHz, 64 vCPUs, 512 GB RAM, Ubuntu 22.04. Single-threaded. AVX2 for SIMD optimizations.[^25]

[^25]: Section 5.1 (p.14): "Experiments are conducted on an Aliyun ECS.r7.16xlarge instance (Ubuntu 22.04) with 64 vCPUs (Intel Xeon Ice Lake Platinum 8369B at 2.70 GHz) and 512 GB of RAM, leveraging AVX2 for SIMD optimizations."

#### Table 1 excerpt: Single moderate-size record (32 KB), selected schemes

| Metric | NPIR | Spiral | NTRUPIR | OnionPIR |
|--------|------|--------|---------|----------|
| **Rate** | 0.250 | 0.390 | 0.444 | 0.250 |
| **DB: 1 GB (2^15 x 32 KB)** | | | | |
| Storage (MB) | 0.89 | 8.38 | 6.13 | 5 |
| Preproc. (s) | 13.32 | 29.86 | 13.32 | 22.31 |
| Query (KB) | 84 | 16 | 24 | 64 |
| Response (KB) | 128 | 82 | 72 | 128 |
| Server time (s) | 5.84 | 8.76 | 10.39 | 8.33 |
| Throughput (MB/s) | 175.34 | 116.89 | 98.56 | 122.93 |
| Client time (ms) | 1.61 | 2.34 | 7.13 | 4.09 |
| **DB: 8 GB (2^18 x 32 KB)** | | | | |
| Storage (MB) | 1.22 | 8.63 | 6.13 | -- |
| Server time (s) | 14.87 | 35.47 | 36.78 | -- |
| Throughput (MB/s) | 550.91 | 230.96 | 222.73 | -- |
| Client time (ms) | 1.62 | 2.36 | 7.51 | -- |
| **DB: 32 GB (2^20 x 32 KB)** | | | | |
| Storage (MB) | 1.44 | 8.75 | 6.13 | -- |
| Server time (s) | 45.82 | 120.42 | 105.13 | -- |
| Throughput (MB/s) | 715.15 | 272.11 | 311.69 | -- |
| Client time (ms) | 1.61 | 2.29 | 7.57 | -- |

[^26]: Table 1 (p.15): Full comparison of retrieving a single moderate-size record (32 KB per record). OnionPIR simulated with 30 KB records. CwPIR and PIRANA omitted from this excerpt.

#### Varying record sizes (8 GB DB)

NPIR achieves maximum throughput at 4 KB records. For 32 KB records, NPIR is 2.38x faster than the next best scheme. The non-monotonic throughput trend arises from two opposing effects: larger records reduce query recovery cost per byte but increase packing frequency.[^27]

[^27]: Section 5.3.2 (p.18) and Figure 6 (p.18): "the optimal throughput is achieved at a record size of 4 KB" due to the tradeoff between reduced query ciphertext recovery and increased packing frequency.

---

### Comparison with Prior Work

| Metric | NPIR | Spiral | NTRUPIR | OnionPIR |
|--------|------|--------|---------|----------|
| Query size | 84 KB | 16 KB | 24 KB | 64 KB |
| Response size | 128 KB | 82 KB | 72 KB | 128 KB |
| Server time (8 GB, 32 KB) | 14.87 s | 35.47 s | 36.78 s | -- |
| Throughput (8 GB, 32 KB) | 550.91 MB/s | 230.96 MB/s | 222.73 MB/s | -- |
| Client time | 1.61 ms | 2.34 ms | 7.13 ms | 4.09 ms |
| Public param storage | 1.22 MB | 8.63 MB | 6.13 MB | 5 MB |
| Preproc. time (8 GB) | 111.06 s | 268.14 s | 111.06 s | -- |
| Communication rate | 0.250 | 0.390 | 0.444 | 0.250 |
| DB params | 2^18 x 32 KB | 2^18 x 32 KB | 2^18 x 32 KB | -- |

[^28]: Section 5.2 (p.17): "In terms of server processing time, NPIR outperforms Spiral by 1.50 to 2.84 times and NTRUPIR by 1.77 to 2.55 times for databases ranging from 1 GB to 32 GB."

**Key takeaway:** Prefer NPIR when server throughput for moderate-size records (10--100 KB) is the primary optimization target and communication bandwidth is not the binding constraint. NPIR has the smallest public parameter storage (0.89--1.44 MB vs 5--14.83 MB for competitors), fastest preprocessing (tied with NTRUPIR, sharing NTT conversion), and shortest client time. However, its query size (84 KB) is 5.25x larger than Spiral's (16 KB), making it less suitable for severely upload-constrained settings.[^29]

[^29]: Section 1.1 (p.4): "Limitation: query size in communication. ... it is 2.16 times greater than Spiral, primarily due to a query size that is 5.25 times larger, whereas the response size is only 1.78 times larger."

---

### Portable Optimizations

- **NTRU packing via Galois automorphisms:** The FFT-style packing structure that extracts constant terms from N NTRU encodings can be applied to any NTRU-based scheme needing to compress homomorphic computation results. The key insight -- using the anticirculant matrix M(f) to bridge NTRU's f^{-1} factor with the ring packing model -- is potentially applicable to NTRU-based bootstrapping and NTRU-based multi-party computation.[^7]
- **Polynomial-matrix database layout:** The (col, term) indexing scheme, where a record spans all rows at one column and one polynomial coefficient, enables simultaneous first-dimension processing and rotation. This layout could be adapted for any ring-based PIR scheme.[^30]

[^30]: Section 1.1 (p.3): "This database can be considered a polynomial version of the database in KsPIR [40], enabling simultaneous first dimension processing and rotation."

---

### Implementation Notes

- **Language / Library:** Rust (approx 4,600 lines) with 50 lines of C++. Uses NTL-11.5.1 for number-theoretic operations and the NTT module from Spiral-rs (https://github.com/menonsamir/spiral-rs).[^31]
- **Polynomial arithmetic:** NTT-based via Spiral-rs NTT module; database stored in NTT domain after preprocessing.
- **CRT decomposition:** q = q_1 * q_2 with q_1 = 11 * 2^21 + 1 and q_2 = 479 * 2^21 + 1 (both NTT-friendly primes).[^11]
- **SIMD / vectorization:** AVX2 for SIMD optimizations.[^25]
- **Parallelism:** Single-threaded for all benchmarks.
- **Open source:** https://github.com/llllinyl/npir

[^31]: Section 5.1 (p.14): "We implement NTRU packing, NPIR, and NPIR_b in approximately 4,600 lines of Rust and 50 lines of C++. We use the NTL library and the NTT module from Spiral-rs."

---

### Application Scenarios

- **Private advertising systems:** Moderate-size records (20--40 KB advertisements) over mobile networks with limited bandwidth (8 Mbps upload, 29 Mbps download). NPIR's high rate and low server cost make it suitable for constrained-network deployments.[^32]
- **Private Wikipedia:** Article sizes up to 30 KB with mobile users on bandwidth-limited connections.[^32]

[^32]: Section 1 (p.2): "Notably, moderate-size records are used for privacy-preserving advertising systems [5, 27, 45] where the size of an advertisement is 20-40 KB, and for private Wikipedia [43] with a maximum article size of 30 KB."

---

### Deployment Considerations

- **Database updates:** Requires full re-preprocessing (NTT conversion) when database changes. Preprocessing time scales linearly with database size (13.32 s for 1 GB to 437.69 s for 32 GB).
- **Public parameter reuse:** The public parameters (packing key + expansion key) are reusable across all queries for a given client. Size is small (0.89--1.44 MB), making offline upload practical even over constrained networks.
- **Session model:** Persistent client with one-time key upload; stateless queries thereafter.
- **Cold start suitability:** No -- requires offline public parameter upload before first query. However, the upload is small compared to schemes like Spiral (0.89 MB vs 8.38 MB).
- **Batch support:** NPIR_b variant supports batch queries (8--32 records), though it becomes less efficient than PIRANA for batch sizes >= 32 due to lack of batch codes and SIMD/constant-weight optimizations.[^33]

[^33]: Section 5.4.1 (p.18-19): "with larger batch sizes" NPIR_b becomes less efficient than PIRANA. The paper does not specify a specific threshold (e.g., ">= 32").

---

### Key Tradeoffs & Limitations

- **Query size is large:** 84 KB query is 5.25x larger than Spiral's 16 KB, driven by the NGSW encoding component (t_g + 1 = 6 polynomials). Reducing NGSW encoding size is identified as an open problem.[^29]
- **Communication rate is lower than Spiral and NTRUPIR:** Rate of 0.250 vs Spiral's 0.390 and NTRUPIR's 0.444. Total online communication is 2.16x greater than Spiral.[^29]
- **Packing overhead for small databases:** For 1 GB databases, packing time (4.61 s) represents a significant fraction of total server time (5.84 s). Amortization at 0.288 s helps but is still non-trivial.
- **NTRU security considerations:** NTRU parameter selection is more delicate than RLWE; the paper uses the Lattice Estimator for NIST-I security validation but notes that parameter optimization following Ducas-van Woerden [23] is future work.

---

### Open Problems

- **NGSW encoding compression:** "The large query size is particularly the result of NTRU-based GSW-like encryption consisting of a vector of NTRU encodings, and reducing the size of this encryption or the entire query message deserves further exploration."[^34]
- **Batch code integration:** Incorporating batch codes to reduce database traversal for the batch variant NPIR_b.
- **Parameter optimization:** Applying NTRU parameter optimization techniques from [23] (Ducas-van Woerden, "NTRU fatigue").
- **Extension to other NTRU-based protocols:** Applying the NTRU packing framework to privacy-enhancing protocols beyond PIR.[^35]

[^34]: Section 1.1 (p.4): Limitation discussion of query size.

[^35]: Section 7 (p.21): "Future work will include exploring NGSW encoding compression, batch code integration, and parameter optimization following [23], as well as extending this framework to other NTRU-based privacy-enhancing protocols."

---

### Uncertainties

- **Ring dimension variable:** The paper uses N for the ring dimension (power of two, N = 2048) and n for the number of database records. This is opposite to many PIR papers (e.g., Spiral uses d for ring dimension and N for record count). Context disambiguates, but care is needed when cross-referencing.
- **Rate definition vs expansion factor:** The paper defines rate as the ratio of record size to response size, which equals log_2(p)/log_2(q_1) = 8/32 = 0.250. However, footnote 1 (p.3) notes that q must be "aligned during communication" so the rate is "not exactly equal to the scaling factor."
- **Packing key size vs automorphism key size:** The paper states "public parameter of size t_pk * N * log_2(N) * log_2(q) + t_ce * N * log_2(ell) * log_2(q)" (Section 4.1, p.12) but the concrete storage in Table 1 (0.89--1.44 MB) is smaller than a naive calculation would suggest, likely due to seed compression or NTT-domain representation details not fully specified.
