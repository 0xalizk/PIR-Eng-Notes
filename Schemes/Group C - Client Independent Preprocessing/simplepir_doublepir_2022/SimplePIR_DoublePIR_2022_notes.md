## SimplePIR / DoublePIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [One Server for the Price of Two: Simple and Fast Single-Server Private Information Retrieval](https://eprint.iacr.org/2022/949) (2022) |
| **Archetype** | Construction (multi-construction: SimplePIR + DoublePIR) + Building-block (linearly homomorphic encryption with preprocessing) |
| **PIR Category** | Group C — Client-Independent Preprocessing |
| **Security model** | Semi-honest single-server CPIR with preprocessing |
| **Additional assumptions** | None beyond plain LWE (no circular security, no ROM; pseudorandom matrix A derived from hash function modeled as random oracle for compression, but security holds without it) |
| **Correctness model** | Probabilistic (correctness error delta, configurable; delta = 2^{-40} in benchmarks) |
| **Rounds (online)** | 1 (non-interactive) |
| **Record-size regime** | Small (1-bit to 1 KB in benchmarks; supports larger via column retrieval) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Kushilevitz-Ostrovsky single-server PIR (1997); Regev's LWE-based encryption (2009, [86]); the "square-root" approach to PIR (Chang 2004 [23], Lipmaa 2005 [69]) |
| **What changed** | Prior lattice-based PIR uses Ring LWE for polylogarithmic server work per database bit, but with large expansion factors (F approximately 1024 for plain LWE). SimplePIR shows the server can precompute the dominant n/(n+1) fraction of work (approximately 99.9%) into a client-independent "hint" via a matrix-vector product D * A, leaving only 2N lightweight integer operations online. DoublePIR recursively applies SimplePIR to compress the hint from O(n * sqrt(N)) to O(n^2), independent of N.&#8201;[^1] |
| **Superseded by** | YPIR (2024, GPU-accelerated SimplePIR variant); Tiptoe (2023, uses SimplePIR for keyword search) |
| **Concurrent work** | FrodoPIR [34] — "essentially identical to SimplePIR, up to the choice of lattice parameters"&#8201;[^2] |

[^1]: Abstract (p.1): SimplePIR achieves 10 GB/s/core throughput approaching memory bandwidth; DoublePIR shrinks the hint to roughly 16 MB independent of database size.
[^2]: Section 2, "Concurrent work: FrodoPIR" (p.4): FrodoPIR is independent concurrent work that constructs a PIR scheme essentially identical to SimplePIR.

### Core Idea

SimplePIR exploits the structure of Regev's LWE-based encryption to shift the vast majority of PIR server computation into a client-independent offline phase. The key insight is that in a Regev encryption Enc(mu) = (A, A^T * s + e + floor(q/p) * mu), the matrix A is independent of the encrypted message.&#8201;[^3] The server represents the database as a sqrt(N)-by-sqrt(N) matrix D over Z_p and precomputes the hint matrix D * A, which it distributes to all clients. To answer a query, the server computes only D * c (a matrix-vector product with the query vector c), requiring just 2N integer multiplications and additions over Z_q — nearly the cost of reading the database from memory.&#8201;[^4] This yields 10 GB/s/core throughput (81% of memory bandwidth), roughly 8x faster than the best prior single-server PIR and approaching the throughput of two-server schemes.&#8201;[^5] DoublePIR applies SimplePIR recursively: the client runs a second level of SimplePIR over the hint matrix and answer vector to retrieve the needed row of the hint and the corresponding answer element, reducing the hint from approximately 121 MB to approximately 16 MB at the cost of slightly lower throughput (7.4 GB/s/core).&#8201;[^6]

[^3]: Section 4.1 (p.6): "a large part of the ciphertext — namely, the matrix A — is independent of the encrypted message. It is thus possible to generate the matrix A ahead of time."
[^4]: Remark 4.1 (p.5): The server performs 2N operations in Z_q per query, and 2nN operations in the preprocessing phase, where n = 2^10.
[^5]: Table 1 (p.3) and Section 1 (p.1): SimplePIR achieves 10 GB/s/core; the fastest prior single-server scheme (Spiral family [76]) achieves 1,314 MB/s.
[^6]: Section 5 (p.7): DoublePIR reduces the hint to roughly n^2 on lattice dimension n = 2^10, concretely 16 MB.

### Variants

| Variant | Hint Size | Online Upload | Online Download | Throughput | Best For |
|---------|-----------|---------------|-----------------|------------|----------|
| **SimplePIR** (Section 4) | n * sqrt(N) elements in Z_q (approximately 121 MB for 1 GB DB) | sqrt(N) elements in Z_q (approximately 120 KB) | sqrt(N) elements in Z_q (approximately 120 KB) | 10.0 GB/s/core | Maximum throughput; amortized over many queries |
| **DoublePIR** (Section 5) | kappa * n^2 elements in Z_q (approximately 16 MB, independent of N) | 2 * sqrt(N) elements in Z_q (approximately 313 KB) | kappa * (2n + 1) elements in Z_q (approximately 32 KB) | 7.4 GB/s/core | Smaller hint; fewer queries to amortize |

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Decision LWE (plain, not Ring LWE)&#8201;[^7] |
| **Encryption/encoding scheme** | Secret-key Regev encryption: Enc(mu) = (a, a^T * s + e + floor(q/p) * mu) where a is the public matrix row, s is the secret key, e is sampled from chi&#8201;[^8] |
| **Ring / Field** | No ring structure. Operates over Z_q for ciphertexts and Z_p for plaintexts. Secret dimension n, ciphertext modulus q, plaintext modulus p. |
| **Key structure** | Secret key s sampled uniformly from Z_q^n. Matrix A in Z_q^{sqrt(N) x n} is a public parameter (derived from a short seed via hash function in practice).&#8201;[^9] Stateless client — no persistent secret across queries. |
| **Correctness condition** | floor(q/p) >= sqrt(2) * sigma * p * N^{1/4} * sqrt(ln(2/delta)) where sigma is the Gaussian error standard deviation and delta is the correctness error probability&#8201;[^10] |

[^7]: Section 3.1 (p.4) and Section 1 "Plain learning with errors" (p.3): "We base our PIR schemes on the standard learning-with-errors (LWE) problem — not the ring variant."
[^8]: Section 3.1 (p.4): Regev encryption defined with parameters (n, q, chi) and plaintext modulus p.
[^9]: Section 4.1, point 3 (p.7): "we compress A using pseudorandomness... the server and the clients can derive A as the output of a public hash function."
[^10]: Theorem C.1, Equation (2) (p.20): The correctness condition for SimplePIR.

### Key Data Structures

- **Database matrix D:** sqrt(N)-by-sqrt(N) matrix over Z_p, where N is the number of records. Each entry is a single Z_p element (approximately 8–10 bits with benchmark parameters).&#8201;[^11]
- **LWE matrix A:** sqrt(N)-by-n matrix over Z_q, serving as the public parameter for Regev encryption. Compressed to a short seed in practice.
- **Server hint (hint_s):** For SimplePIR, this is the "bottom" part of the preprocessing: stored on the server (trivial in SimplePIR). For DoublePIR, hint_s = Decomp(A_1^T * db^T) in Z_q^{kappa x n x ell}.
- **Client hint (hint_c):** The preprocessed matrix D * A in Z_q^{sqrt(N) x n}. In SimplePIR, the client downloads this entirely (approximately 121 MB for a 1 GB database). In DoublePIR, the client downloads a much smaller hint: hint_c = hint_s * A_2 in Z_q^{kappa x n x n} (approximately 16 MB).&#8201;[^12]

[^11]: Section 4 (p.5–6), Figure 2: The database is represented as a matrix in Z_p^{sqrt(N) x sqrt(N)}.
[^12]: Section 5.1 (p.8) and Section 8.2 (p.14): DoublePIR's hint is 16 MB for a database of 2^36 1-bit entries.

### Database Encoding

- **Representation:** sqrt(N)-by-sqrt(N) matrix over Z_p. For DoublePIR, the matrix dimensions are ell-by-m (rectangular, not necessarily square) so that the first level of PIR dominates computation.&#8201;[^13]
- **Record addressing:** Two-dimensional index (i_row, i_col) in [sqrt(N)]^2 decomposed from the linear index i in [N].
- **Preprocessing required:** Server computes D * A (matrix multiplication over Z_q). This is 2nN operations in Z_q — one-time, client-independent. In practice, the database is stored in "packed form" and decompressed into Z_p elements on-the-fly to avoid being memory-bandwidth-bound.&#8201;[^14]
- **Record size equation:** Basic scheme: each record is a single Z_p element (approximately log_2(p) bits). For larger records, encode each record as d elements in Z_p (base-p decomposition), stack vertically in the same column, and retrieve the full column via sqrt(N) Recover calls.&#8201;[^15]

[^13]: Section 8, "Implementation" (p.12): "In DoublePIR, we represent the database as a rectangular (rather than square) matrix, so that the first level of PIR dominates the computation."
[^14]: Section 8, "Implementation" (p.12): "We store the database in memory in packed form and decompress it into Z_p elements on-the-fly, as otherwise the Answer routine is memory-bandwidth-bound."
[^15]: Section 4.3, "Supporting databases with larger record sizes" (p.7): Retrieve an entire column of the database matrix with a single online query.

### Protocol Phases — SimplePIR

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Init | Public | Generate LWE matrix A in Z_q^{sqrt(N) x n} from seed | — | Once (public parameter) |
| Setup (preprocessing) | Server | Compute hint_c = D * A in Z_q^{sqrt(N) x n} (2nN operations in Z_q) | hint_c: n * sqrt(N) elements in Z_q (approximately 121 MB for 1 GB DB) to all clients | One-time, client-independent |
| Query | Client | Decompose index i into (i_row, i_col). Sample fresh s, e. Compute qu = (A * s + e + Delta * u_{i_col}) in Z_q^{sqrt(N)} | qu: sqrt(N) elements in Z_q upward (approximately 120 KB) | Per query |
| Answer | Server | Compute ans = D * qu in Z_q^{sqrt(N)} (2N operations in Z_q) | ans: sqrt(N) elements in Z_q downward (approximately 120 KB) | Per query |
| Recover | Client | Compute d_hat = ans[i_row] - hint_c[i_row, :] * s. Round to nearest multiple of Delta and divide. | — | Per query |

### Protocol Phases — DoublePIR

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Init | Public | Generate A_1 in Z_q^{m x n} and A_2 in Z_q^{ell x n} from seeds | — | Once |
| Setup (preprocessing) | Server | Compute hint_s = Decomp(A_1^T * db^T), hint_c = hint_s * A_2. Total: 2nN + 2 * kappa * n^2 * sqrt(N) operations in Z_q&#8201;[^16] | hint_c: kappa * n^2 elements in Z_q (approximately 16 MB) to all clients | One-time, client-independent |
| Query | Client | Decompose i into (i_row, i_col). Sample (s_1, e_1) for level-1 query c_1, and (s_2, e_2) for level-2 query c_2 | c_1: m elements in Z_q + c_2: ell elements in Z_q upward (approximately 2 * sqrt(N) elements total) | Per query |
| Answer | Server | Level 1: ans_1 = Decomp(c_1^T * db^T), h = ans_1 * A_2. Level 2: stack [ans_h; ans_2] = [hint_s; ans_1] * c_2. Total: 2N + 2(2n+1) * sqrt(N) * kappa operations&#8201;[^17] | (h, ans_h, ans_2): kappa * (2n+1) elements in Z_q downward (approximately 345 KB) | Per query |
| Recover | Client | Compute [h_hat_1; a_hat_1] from answer and hint, apply Recomp and Round_Delta. Run two levels of SimplePIR recovery. | — | Per query |

[^16]: Section 5.1 (p.8): Concrete costs of DoublePIR preprocessing.
[^17]: Section 5.1 (p.8): Per-query server work is 2N + 2(2n+1) * sqrt(N) * kappa operations in Z_q.

### Correctness Analysis

#### FHE Noise Analysis (Option A — plain LWE, single correctness inequality)

SimplePIR and DoublePIR use Regev's additively homomorphic encryption, so noise analysis reduces to bounding the inner product of a database row with the error vector.

**SimplePIR correctness condition (Theorem C.1, p.20):**&#8201;[^18]

Recovery succeeds when Round_Delta(d_hat) / Delta equals db[i_row, i_col], which requires |db[i_row, :] * e| < Delta/2, where Delta = floor(q/p).

Using the discrete Gaussian tail bound with variance sigma^2 = s^2 / (2 * pi):

Pr[|db[i_row, :] * e| >= Delta/2] < delta

as long as:

floor(q/p) >= sqrt(2) * sigma * p * N^{1/4} * sqrt(ln(2/delta))

This follows from ||db[i_row, :]|| <= sqrt(sqrt(N) * (p/2)^2) = N^{1/4} * p/2, combined with Gaussian concentration.

[^18]: Appendix C.2, Theorem C.1 (p.20): Formal correctness proof deriving the parameter constraint.

**DoublePIR correctness condition (Theorem E.1, p.25):**&#8201;[^19]

DoublePIR's recovery executes kappa * (n+1) + 1 invocations of SimplePIR's Recover. The correctness condition is:

floor(q/p) >= sigma * p * sqrt(2 * max(m, ell) * ln(2 * (kappa * (n+1) + 1) / delta))

which is slightly more conservative than SimplePIR due to the union bound over kappa * (n+1) + 1 recovery steps.

[^19]: Appendix E.2, Theorem E.1, Equation (3) (p.25): DoublePIR correctness condition.

**Parameter selection:**

| Database size N | Plaintext modulus p (SimplePIR) | Plaintext modulus p (DoublePIR) |
|-----------------|-------------------------------|-------------------------------|
| 2^26 | 991 | 929 |
| 2^28 | 833 | 781 |
| 2^30 | 701 | 657 |
| 2^34 | 495 | 464 |
| 2^38 | 350 | 328 |
| 2^42 | 247 | 231 |

- **LWE secret dimension:** n = 2^10 (1024)&#8201;[^20]
- **Ciphertext modulus:** q = 2^32
- **Error distribution chi:** Discrete Gaussian with standard deviation sigma = 6.4
- **Correctness error:** delta = 2^{-40}
- **Security:** 128-bit security against best known attacks, based on lattice-attack-cost estimates from [7]

[^20]: Section 4.2 (p.7): "we set the secret dimension n = 2^10, use modulus q = 2^32... and allow correctness error delta = 2^{-40}."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (SimplePIR, 1 GB DB, 1-bit entries) | Concrete (DoublePIR, 1 GB DB, 1-bit entries) | Phase |
|--------|-----------|---------------------------------------------|----------------------------------------------|-------|
| Query size (upload) | O(sqrt(N)) elements in Z_q | 120 KB&#8201;[^21] | 345 KB&#8201;[^21] | Online |
| Response size (download) | O(sqrt(N)) elements in Z_q (SimplePIR); O(kappa * (2n+1)) (DoublePIR) | 120 KB&#8201;[^21] | 345 KB&#8201;[^21] | Online |
| Server computation (online) | 2N operations in Z_q (SimplePIR); 2N + 2(2n+1) * sqrt(N) * kappa (DoublePIR) | — | — | Online |
| Client computation | O(n) per query (key generation + inner product) | < 1 ms | approximately 100 ms (1 GB DB)&#8201;[^22] | Online |
| Throughput | Limited by memory bandwidth | 10.0 GB/s/core | 7.4 GB/s/core | Online |

[^21]: Table 8 (p.13): SimplePIR online: 121 KB up, 121 KB down. DoublePIR online: 313 KB up, 32 KB down.
[^22]: Figure 18 (p.30, Appendix H): Client query + recover time for DoublePIR on a 1 GB database is approximately 100 ms.

#### Preprocessing metrics (Group C)

| Metric | Asymptotic | Concrete (SimplePIR, 1 GB DB) | Concrete (DoublePIR, 1 GB DB) | Phase |
|--------|-----------|------------------------------|-------------------------------|-------|
| Server preprocessing computation | 2nN operations in Z_q (SimplePIR); 2nN + 2 * kappa * n^2 * sqrt(N) (DoublePIR) | approximately 5 core-minutes&#8201;[^23] | approximately 5 core-minutes&#8201;[^23] | Offline (one-time) |
| Server preprocessing (1% DB change) | O(c * n * sqrt(N)) for c changed rows | approximately 3 seconds (approximate, from Figure 17)&#8201;[^23] | approximately 10 seconds (approximate, from Figure 17)&#8201;[^23] | Per DB update |
| Client hint download | n * sqrt(dN) elements in Z_q (SimplePIR); kappa * n^2 elements in Z_q (DoublePIR) | 121 MB&#8201;[^24] | 16 MB&#8201;[^24] | Offline (global, one-time) |
| Client persistent storage | Same as hint download | 121 MB | 16 MB | Persistent |
| Amortization window | Unbounded — hint reusable for unlimited queries until DB changes | Unbounded | Unbounded | — |
| Amortized offline/query (over 100 queries) | hint / Q | 1.4 MB (SimplePIR); 0.5 MB (DoublePIR)&#8201;[^25] | — | — |

[^23]: Figure 17 (p.30, Appendix H): Server preprocessing time on databases of increasing size. On 1 GB, both schemes take approximately 5 core-minutes for full preprocessing; 1% DB change takes a few seconds.
[^24]: Table 8 (p.13): SimplePIR offline upload = 0 MB, offline download (server-to-client hint) is 121 MB; DoublePIR offline download = 16 MB.
[^25]: Table 16 (p.31, Appendix H): Per-query communication amortized over 100 queries.

#### If-reported metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Memory bandwidth utilization | 10 GB/s/core (SimplePIR) = 81% of machine's 12.4 GB/s memory bandwidth&#8201;[^26] | Core metric — server is memory-bandwidth-bound |
| Financial server cost (SimplePIR) | $1 * 10^{-4} per query (100 queries, AWS) | Compute $1.5 * 10^{-5}/core-second + data transfer $0.09/GB&#8201;[^27] |
| Financial server cost (DoublePIR) | $2 * 10^{-5} per query (100 queries, AWS) | Lower due to smaller offline download |

[^26]: Section 1 (p.1): "SimplePIR achieves 10 GB/s/core server throughput, which approaches the memory bandwidth of the machine... roughly 12.4 GB/s/core on our machine."
[^27]: Section 8.1 (p.13): Per-query cost computation using AWS pricing.

### Performance Benchmarks

#### Hardware

AWS EC2 c5n.metal instance, Ubuntu 22.04. Single-threaded execution. Five runs, standard deviations < 10% of throughput.&#8201;[^28]

[^28]: Section 8 (p.12): "We run all experiments using a single thread of execution, on an AWS c5n.metal instance running Ubuntu 22.04."

#### Throughput comparison (Table 1, p.3; Table 10, p.18)

| Scheme | Servers | Communication | No per-client storage | Overhead polylog(n) | Max throughput/core |
|--------|---------|---------------|----------------------|--------------------|--------------------|
| DPF PIR | 2 | log N | Yes | Yes | 5,381 MB/s |
| XOR PIR | 2 | sqrt(N) | Yes | Yes | 6,067 MB/s |
| XOR PIR fast | 2 | sqrt(N) | Yes | Yes | 11,797 MB/s |
| SealPIR (d=2) | 1 | sqrt(N) | No | Yes | 97 MB/s |
| MulPIR | 1 | sqrt(N) | No | Yes | 69 MB/s |
| FastPIR | 1 | N | No | Yes | 215 MB/s |
| OnionPIR | 1 | log N | No | Yes | 104 MB/s |
| Spiral family | 1 | log N | No | Yes | 1,314 MB/s |
| FrodoPIR | 1 | sqrt(N) | Yes | Yes | 1,256 MB/s |
| **SimplePIR** | **1** | **sqrt(N)** | **Yes** | **Yes** | **10,305 MB/s** |
| **DoublePIR** | **1** | **sqrt(N)** | **Yes** | **Yes** | **7,622 MB/s** |

#### Detailed benchmark (Table 8, p.13) — database of 2^33 x 1-bit entries

| Metric | SealPIR | FastPIR | OnionPIR | Spiral | SpiralPack | SpiralStream | SpiralStreamPack | **SimplePIR** | **DoublePIR** |
|--------|---------|---------|----------|--------|------------|--------------|------------------|-------------|-------------|
| Offline upload (MB) | 5 | 0.06 | 5 | 15 | 19 | 0.34 | 15 | **0** | **0** |
| Offline download (MB) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **121** | **16** |
| Online upload (KB) | 91 | 33,000 | 256 | 14 | 14 | 15,000 | 29,000 | **121** | **313** |
| Online download (KB) | 181 | 64 | 128 | 20 | 20 | 99 | 20 | **121** | **32** |
| Throughput (MB/s) | 97 | 217 | 60 | 259 | 260 | 485 | 1,370 | **10,138** | **7,622** |

#### Batching throughput (Table 19, p.31; Figure 9, p.13)

| Queries per batch | SimplePIR effective throughput (GB/s) | DoublePIR effective throughput (GB/s) |
|-------------------|--------------------------------------|---------------------------------------|
| 1 | 9.9 | 7.4 |
| 4 | 26.8 | 17.5 |
| 16 | 100.4 | 41.8 |
| 64 | 394.3 | 75.9 |
| 256 | 1,567.0 | 91.7 |
| 1,024 | 3,611.2 | 103.2 |

SimplePIR's throughput scales linearly with batch size, exceeding 100 GB/s at batch size >= 16. DoublePIR plateaus at approximately 100 GB/s for batch size >= 256 as the second level of PIR becomes a bottleneck.&#8201;[^29]

[^29]: Section 8.1 (p.13) and Table 19 (p.31): "SimplePIR's throughput scales linearly... DoublePIR achieves a throughput over 50 GB/s for k >= 32; when k >= 256, the throughput plateaus at roughly 100 GB/s."

#### Per-query communication amortized over 100 queries (Table 16, p.31)

| Entry size | 1 bit | 1 B | 8 B | 64 B | 512 B | 4 KB |
|------------|-------|-----|-----|------|-------|------|
| SimplePIR (MB) | 1.4 | 1.5 | 1.4 | 1.4 | 1.4 | 1.4 |
| DoublePIR (MB) | 0.5 | 1.0 | 3.1 | 11 | 86 | 690 |

SimplePIR's amortized communication is nearly constant across entry sizes. DoublePIR's communication grows with entry size because larger entries require more hint downloads.&#8201;[^30]

[^30]: Table 16 (p.31) and Figure 20 (p.30): "As soon as the entry size exceeds roughly 100 bits, SimplePIR incurs less communication than DoublePIR."

### Comparison with Prior Work

SimplePIR and DoublePIR achieve a novel point in the PIR design space: substantially higher throughput than all prior single-server PIR schemes, and competitive with two-server PIR schemes, at the cost of a large offline download (the hint).&#8201;[^31]

| Dimension | SimplePIR | DoublePIR | Spiral (best prior single-server) | Two-server XOR PIR |
|-----------|-----------|-----------|----------------------------------|-------------------|
| Throughput/core | 10.0 GB/s | 7.4 GB/s | 1.3 GB/s (SpiralStreamPack) | 6.1 GB/s |
| Offline download | 121 MB (1 GB DB) | 16 MB | 0 | 0 |
| Online communication | 242 KB | 345 KB | 40 KB | sqrt(N) |
| Per-client server storage | 0 | 0 | 5–19 MB (evaluation keys) | 0 |
| Security assumption | Plain LWE | Plain LWE | Ring LWE | Non-collusion |

[^31]: Section 8.1 (p.12): "SimplePIR and DoublePIR achieve throughputs of 10.0 GB/s and 7.4 GB/s respectively, which is roughly 8x faster than the best prior single-server PIR scheme."

### Implementation Notes

- **Language:** Go (1,400 lines for SimplePIR and DoublePIR combined) + C (200 lines for performance-critical matrix multiplication routines). No external libraries.&#8201;[^32]
- **Arithmetic:** Native uint32 for q = 2^32 operations. Database stored in packed form, decompressed on-the-fly during Answer to avoid memory-bandwidth bottleneck.
- **Parallelism:** All benchmarks single-threaded. Both Setup and Answer are "fully parallelizable."&#8201;[^33]
- **Matrix A compression:** A derived from a hash function applied to a fixed string in counter mode, so server and clients only store a short seed.
- **Open source:** MIT license at `github.com/ahenzinger/simplepir`
- **Lines of code:** Approximately 1,600 total (Go + C)
- **Software dependencies:** Go (v1.19.1) and GCC (v11.2.0). Python + NumPy + Matplotlib for evaluation plots.
- **Reproducibility:** Artifact evaluated at USENIX Security 2023 — received Available, Functional, and Reproduced badges.

[^32]: Section 8 (p.12): "We implement SimplePIR in fewer than 1,200 lines of Go code, along with 200 lines of C, and DoublePIR in 210 additional lines of Go code."
[^33]: Appendix H (p.30): "Both the server time and the client time are measured using a single thread of execution (and are fully parallelizable)."

### Key Tradeoffs & Limitations

- **Large hint (SimplePIR):** The client must download approximately 121 MB for a 1 GB database (4 * sqrt(N) KB for N bytes). If the client makes only a single query, this hint download dominates communication and makes SimplePIR uncompetitive. The scheme is designed for the amortized setting.&#8201;[^34]
- **Online communication approximately 10x larger than best prior work:** Per-query online communication is on the order of hundreds of kilobytes, compared to tens of kilobytes for Spiral/OnionPIR. This is an inherent cost of using plain LWE with large expansion factor F = n approximately 1024.&#8201;[^34]
- **Record size scaling (DoublePIR):** DoublePIR's communication grows with entry size because the hint must account for the base-p decomposition of each record. For entries above approximately 100 bits, SimplePIR has lower total communication than DoublePIR.
- **Correctness is probabilistic:** With delta = 2^{-40}, there is a non-negligible (but very small) probability of decryption failure per query.
- **No sublinear online server work:** The server must touch every database bit during the online Answer phase (2N operations). This is inherent for any PIR-with-preprocessing scheme where the server work is linear.&#8201;[^35]
- **Hint staleness on DB update:** When the database changes, the hint must be partially or fully recomputed. For SimplePIR, updating c rows requires computing c single-row-by-A products. For DoublePIR, the update is more involved (both hint_s and hint_c must be refreshed).&#8201;[^36]
- **Stateless client advantage:** Unlike SealPIR and RLWE-based schemes, SimplePIR/DoublePIR do not require the client to hold a persistent secret key across queries. This provides forward secrecy: a server that later compromises the client cannot retroactively learn past queries.&#8201;[^37]

[^34]: Section 1, "Limitations" (p.2): "our client must download a 'hint'... the hint is tens of megabytes. If a client makes only one query, this hint download dominates the overall communication. Second, our schemes' online communication is on the order of hundreds of kilobytes, which is 10x larger than in some prior work."
[^35]: Section 1 (p.1): "a hard limit on the throughput of PIR schemes... is the speed with which the PIR server can read the database from memory: roughly 12.4 GB/s/core on our machine."
[^36]: Appendix C.3, "Handling database updates" (p.22) and Appendix E.3, "Handling database updates" (p.27).
[^37]: Appendix B (p.18): "we demonstrate that several recent PIR schemes, including SealPIR and its descendants, are insecure against a certain type of active attack that enables the server to recover a client's long-term, secret state."

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Linearly Homomorphic Encryption with Preprocessing |
| **Type** | Cryptographic primitive |
| **Interface / Operations** | Setup() -> pp; Enc(pp, sk, v) -> ct; Preproc(pp, f) -> hint_f; Apply(pp, f, ct) -> ct_f; Dec(sk, hint_f, ct_f) -> d&#8201;[^38] |
| **Security definition** | Semantic security: given pp and ct, no efficient adversary can distinguish the encrypted vector (Definition in Appendix D, p.23) |
| **Correctness definition** | Correctness error delta: Pr[d = f(v)] >= 1 - delta for any linear function f and encrypted vector v |
| **Purpose** | Abstracts the key property of Regev encryption exploited by SimplePIR: the ability to preprocess a linear function f into a hint, then evaluate f on encrypted data using only the hint and a lightweight online computation |
| **Built from** | Regev encryption with reused public matrix A&#8201;[^39] |
| **Standalone complexity** | Hint size: n elements of Z_q (one row of A^T dotted with f's matrix); Apply: m additions and m multiplications in Z_q; Dec: 1 inner product + rounding. All independent of security parameter n. |
| **Relationship to prior primitives** | Generalizes standard linearly homomorphic encryption by adding a preprocessing phase. Compared to Paillier or ElGamal-based LHE, this construction has hint/ciphertext/evaluation costs that scale with λ rather than λ^2 or λ^3 (Table 11, p.23).&#8201;[^40] |

[^38]: Appendix D.1 (p.22–23): Formal definition of linearly homomorphic encryption with preprocessing.
[^39]: Appendix D.2 (p.23): "we construct a linear homomorphic encryption scheme with preprocessing from Regev encryption."
[^40]: Table 11 (p.23): Comparison of linearly homomorphic encryption schemes. The LWE-based construction achieves hint size λ, ciphertext size 1 per bit, Apply time 1, and Dec time λ — all linear or constant in the security parameter.

### Application: Certificate Transparency Auditing

SimplePIR and DoublePIR are applied to private SCT (Signed Certificate Timestamp) auditing, using a novel approximate set-membership data structure (Section 6).&#8201;[^41]

- **Problem:** A client wants to check whether an SCT appears in an auditor's set of valid SCTs without revealing which websites it visits.
- **Data structure:** a = 768 independent one-hash-function Bloom filters, each of size 8N bits, over the set of N active SCTs. Adversarial false-positive rate: 1/2. Failure probability: 2^{-128} over hash function choice.
- **Deployment parameters (2^36 entries = 5 billion SCTs):**
  - DoublePIR hint: 16 MB (downloaded once per month)
  - Online upload: 724 KB
  - Online download: 32 KB
  - Server compute: < 1.3 core-seconds per query
  - Client storage: 16 MB (reducible to 150 KB)
  - Cost per client: approximately $0.001/month + $4 * 10^{-9}/TLS connection

[^41]: Sections 6–7 (p.9–12) and Section 8.2 (p.14): The application to Certificate Transparency auditing.

### Open Problems

1. **Reduce communication cost:** The authors note that combining their preprocessing ideas with sublinear-time PIR [30, 31] to reduce computation beyond the linear-server-time barrier is an exciting direction.&#8201;[^42]
2. **Recursive PIR with more than two levels:** After r levels of recursion, communication scales as r * N^{1/r} upload and n^{r-1} download. For r > 2, the communication is "likely too large for databases of interest." Constructing recursive LWE-based PIR with total communication n * N^{1/r} is an open question.&#8201;[^43]
3. **Smaller expansion factor:** The large expansion factor F = n approximately 1024 for plain LWE fundamentally limits online communication. Reducing F while maintaining plain-LWE simplicity would improve the communication-throughput tradeoff.
4. **Local rounding optimization:** The online download can be decreased by a factor of log(q)/log(p) approximately 3x by having server and client each locally round their values, at the expense of a much smaller plaintext modulus p (Appendix C.3).&#8201;[^44]
5. **Fast matrix multiplication for preprocessing:** The preprocessing step computes D * A, which can be accelerated using subcubic matrix multiplication algorithms, though the authors suspect this would not improve concrete performance at their parameter sizes.&#8201;[^45]

[^42]: Section 9, "Conclusion" (p.14): "Two exciting directions remain open: one is to reduce our schemes' communication; another is to combine our ideas with those of sublinear-time PIR to reduce the computation beyond the linear-server-time barrier."
[^43]: Section 5.1, Remark 5.1 (p.8): "An intriguing open question is to construct recursive LWE-based PIR schemes with total communication n * N^{1/r}."
[^44]: Appendix C.3, "Decreasing the online download with local rounding" (p.22): Decreases download by approximately 3x at the expense of smaller p and thus faster-decreasing correctness margins.
[^45]: Appendix C.3, "Faster preprocessing" (p.22): Subcubic matrix multiplication could improve asymptotic preprocessing time.

### Uncertainties

- **Notation:** The paper uses n for the LWE secret dimension (2^10) and N for the database size. This is consistent with standard LWE notation but differs from some RLWE-based PIR papers where n is the ring dimension and N is the database size. Throughout these notes, n = LWE dimension = 1024, N = database record count.
- **Throughput measurement methodology:** Throughput is defined as database size divided by server online time per query, measured single-threaded. This does not include preprocessing time. The "effective throughput" with batching (Table 19) includes the amortized preprocessing cost and assumes the client recovers a constant fraction of the batch.
- **DoublePIR rectangular matrix choice:** The paper states that DoublePIR uses a rectangular matrix "so that the first level of PIR dominates the computation" but does not give explicit formulas for the optimal aspect ratio. The concrete dimensions ell and m satisfying ell * m >= N are chosen by the implementation.
- **Chart-derived values:** Server preprocessing times for 1 GB databases and 1% DB change are read from Figure 17 (log-scale) and are approximate.
- **FrodoPIR comparison:** The paper states FrodoPIR is "essentially identical" to SimplePIR, but FrodoPIR uses different LWE parameters (FrodoKEM-derived) and a different programming language. The throughput difference (1,256 MB/s vs 10,305 MB/s) may reflect implementation differences as much as parameter choices.
