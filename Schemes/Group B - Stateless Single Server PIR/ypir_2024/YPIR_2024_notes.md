## YPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [YPIR: High-Throughput Single-Server PIR with Silent Preprocessing](https://eprint.iacr.org/2024/270) (2024) |
| **Archetype** | Construction + Engineering optimization |
| **PIR Category** | Group B — Stateless single-server (Hintless: no offline communication) |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | RLWE + circular security (key-dependent pseudorandomness for RLWE encodings, Definition A.1) |
| **Correctness model** | Probabilistic (correctness error delta <= 2^{-40}) |
| **Rounds (online)** | 1 (non-interactive: single query, single response) |
| **Record-size regime** | Small (1-bit or 1-byte baseline); large-record variant YPIR+SP supports 32--64 KB records |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SimplePIR/DoublePIR [Group C] for the matrix-LWE PIR structure; CDKS packing [CDKS21] for LWE-to-RLWE conversion; Spiral [Group A] for key-switching-based response compression |
| **What changed** | Replaces the bootstrapping-based LWE-to-RLWE conversion used in Tiptoe and HintlessPIR with the CDKS ring packing transformation, which uses key-switching rather than homomorphic decryption. This allows a smaller RLWE modulus, yielding 7.5x smaller packed encodings and 2.7x faster packing than HintlessPIR. |
| **Superseded by** | N/A |
| **Concurrent work** | Tiptoe [HDCZ23a], HintlessPIR [LMRS24a] (both use bootstrapping-based approaches to eliminate the hint) |

### Core Idea

YPIR eliminates the offline hint download required by SimplePIR/DoublePIR by compressing the DoublePIR response into a small number of RLWE encodings using the Chen-Dai-Kim-Song (CDKS) packing transformation.[^1] Unlike Tiptoe and HintlessPIR which use bootstrapping to homomorphically evaluate the hint-decryption function (requiring the RLWE plaintext modulus to be as large as the LWE encoding modulus), YPIR uses key-switching-based packing that keeps the LWE and RLWE encodings under the same modulus, yielding much smaller RLWE ciphertexts and near-SimplePIR throughput (97% at 32 GB) with zero offline communication.[^2]

<a id="fn-1"></a>
[^1]: Section 1.1 (p.2): "Instead of using bootstrapping, we take a packing approach... and 'pack' the DoublePIR response into a more compact representation using polynomial rings."
<a id="fn-2"></a>
[^2]: Abstract (p.1): "YPIR achieves 12.1 GB/s/core server throughput and requires 2.5 MB of total communication... On the same setup, the state-of-the-art SimplePIR protocol achieves 12.5 GB/s/core."

### Variants

| Variant | Key Difference | Offline Comm | Online Comm (32 GB) | Best For |
|---------|---------------|-------------|---------------------|----------|
| YPIR (base) | Packs DoublePIR response via CDKS | None | 2.5 MB total | Small records (1-bit/1-byte), private SCT auditing |
| YPIR+SP | Packs SimplePIR response instead of DoublePIR | None | 2.6 MB total (64 KB records) | Large records (32--64 KB), password breach checking |

YPIR+SP applies the CDKS packing to the SimplePIR output (an entire column of the database) rather than the DoublePIR output, naturally encoding large records.[^3] For large records (32--64 KB), YPIR+SP achieves 7--14x smaller responses than HintlessPIR with similar query size and only 5% less throughput.[^4]

<a id="fn-3"></a>
[^3]: Section 4.6 (p.28): "We consider a variant of YPIR where we apply the LWE-to-RLWE packing procedure to the SimplePIR output rather than the DoublePIR output."
<a id="fn-4"></a>
[^4]: Table 7 (p.28): YPIR+SP achieves 444 KB download vs. 724 KB for HintlessPIR at 32 GB x 64 KB records.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE_{d1,m1,q1,chi1} for SimplePIR step; RLWE_{d2,m2',q2,chi2} for packing step (where m2' = m2 + (floor(log_z q2) + 1) * log d2) |
| **Encryption/encoding scheme(s)** | Plain LWE encoding (SimplePIR step, dimension d1 = 1024); RLWE encoding via CDKS packing (dimension d2 = 2048); Regev-style encodings for both steps |
| **Ring / Field** | R_{d1} = Z[x]/(x^{d1}+1) with d1 = 2^{10} = 1024 for SimplePIR; R_{d2} = Z[x]/(x^{d2}+1) with d2 = 2^{11} = 2048 for DoublePIR + packing |
| **Key structure** | Two independent secret keys: s1 from chi1 (discrete Gaussian, sigma = 11*sqrt(2pi)) for SimplePIR; s2 from chi2 (discrete Gaussian, sigma = 6.4*sqrt(2pi)) for DoublePIR/packing. Client also generates CDKS packing key pk from s2. |
| **Correctness condition** | delta <= 2*d2*rho*exp(-pi*tau_double^2/sigma_double^2) + 2*exp(-pi*tau_simple^2/sigma_simple^2) <= 2^{-40} (Theorem 3.4) |

### Ring Architecture / Modulus Chain

| Ring | Dimension | Modulus (bits) | Role / Phase |
|------|-----------|---------------|--------------|
| Z_{q1} (integers) | d1 = 1024 (LWE dimension) | 32-bit (q1 = 2^{32}) | SimplePIR step: matrix-vector product over integers |
| R_{d2,q2} | d2 = 2048 | 56-bit (q2 = (2^{28} - 2^{16} + 1)(2^{28} - 2^{24} - 2^{21} + 1)) | DoublePIR step + LWE-to-RLWE packing |
| R_{d2,q-hat_{2,1}} | d2 = 2048 | 28-bit | Modulus-switched response component 1 |
| R_{d2,q-hat_{2,2}} | d2 = 2048 | 20-bit | Modulus-switched response component 2 |

<a id="fn-5"></a>
[^5]: Table 1 (p.14): Full parameter table showing SimplePIR parameters (d1=2^{10}, sigma1=11*sqrt(2pi), N=2^8, q1=2^{32}, q-hat1=2^{28}) and DoublePIR parameters (d2=2^{11}, sigma2=6.4*sqrt(2pi), p=2^{15}, q2~2^{56}, q-hat_{2,1}=2^{28}, q-hat_{2,2}=2^{20}, z=2^{19}).

### Key Data Structures

- **Database:** Matrix D in Z_N^{l1 x l2} where l1 = m1*d1, l2 = m2*d2 for ring dimensions d1, d2 and integers m1, m2. Records are indexed by row-column pair (i1, i2) in [l1] x [l2]. Database elements are Z_N values (N = 2^8 for 1-bit records, each record is 8 bits).[^6]
- **Hint matrices:** H1 = G^{-1}_{d1,p}(A1*D) in Z^{kappa*d1 x l2} where kappa = ceil(log q-hat1 / log p); H2 = A2 * H1^T in Z_{q2}^{d2 x kappa*d1}. Both are precomputed once per database update.[^7]
- **Packing key:** pk = (W1, ..., W_ell) consisting of ell = log d2 key-switching matrices, each W_i in R_{q2}^{2 x t}. Total size: 462 KB (fixed, independent of database size).[^8]
- **Negacyclic matrices:** A_j = NCyclicMat(a_j^T) in Z_{q_j}^{d_j x d_j} -- structured matrices enabling NTT-based preprocessing.

<a id="fn-6"></a>
[^6]: Section 3 (p.11): "We model the database as a matrix D in Z_N^{l1 x l2}."
<a id="fn-7"></a>
[^7]: Equation 3.1 (p.11): "H1 = G^{-1}_{d1,p}(A1*D|_{q1,q-hat1}) and H2 = A2 * H1^T."
<a id="fn-8"></a>
[^8]: Table 4 (p.22): Packing key |pk| = 462 KB across all database sizes.

### Database Encoding

- **Representation:** 2D matrix D in Z_N^{l1 x l2}, where l1 and l2 are multiples of d1 and d2 respectively.
- **Record addressing:** Row-column pair (i1, i2), decomposed as i_j = alpha_j * d_j + beta_j where alpha_j in [m_j] and beta_j in [d_j].
- **Preprocessing required:** Negacyclic matrix A1 = NCyclicMat(a1^T) enables NTT-based hint computation. Vectors a1, a2 in public parameters are derived from a PRG seed (ChaCha20 in counter mode).[^9]
- **Dimension selection:** For a database of t one-bit records, set t' = ceil(t / log N), l1 = 2^{ceil(log t'/2)}, l2 = 2^{floor(log t'/2)}. The database is arranged as a square (or near-square) matrix.[^10]

<a id="fn-9"></a>
[^9]: Remark 3.2 (p.12): "The vectors a1 and a2 are uniformly random, and could be derived from a random oracle."
<a id="fn-10"></a>
[^10]: Section 4 (p.15): "When the database consists of t one-bit records, we let t' = ceil(t/log N), and set l1 = 2^{ceil(log t'/2)} and l2 = 2^{floor(log t'/2)}."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Setup | Server | Compute H1, H2 from D using structured matrices A1, A2. Precompute random components of CDKS.Pack output. | -- | Once per DB update |
| Query Gen | Client | Sample s1, s2, compute packing key pk via CDKS.Setup(1^λ, s2, z). Construct LWE encodings c1 (row indicator), c2 (column indicator). | q = (pk, c1, c2) uploaded: 724 KB -- 2.5 MB | Per query |
| Answer (SimplePIR) | Server | Compute T = g_p^{-1}(c1^T * D |_{q1,q-hat1}) -- linear scan over database | -- | Per query |
| Answer (DoublePIR) | Server | Compute C = delta * [H2, A2*T^T; c2^T*H1^T, c2^T*T^T] | -- | Per query |
| Answer (Packing) | Server | Apply CDKS.Pack(pk, C_i) for each block C_i; only O(kappa + log d2) NTTs needed online (rest precomputed) | -- | Per query |
| Answer (Modulus switch) | Server | Apply ModReduce to packed RLWE encodings | resp = rho pairs (c_{i,1}, c_{i,2}): 12 KB -- 32 MB | Per query |
| Extract | Client | Decrypt RLWE encodings using s2, recover coefficient vector, apply gadget expansion with s1, round to recover mu in Z_N | -- | Per query |

<a id="fn-11"></a>
[^11]: Construction 3.1 (p.11-12): Full protocol specification with four Answer steps and Extract procedure.

### Correctness Analysis

#### Option A: FHE Noise Analysis

YPIR uses the independence heuristic to bound noise as sub-Gaussian variance rather than worst-case magnitude.[^12]

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| SimplePIR step | sigma_simple^2 <= d1*sigma1^2/4 + (q-hat1/q1)^2 * l1 * N^2 * sigma1^2 / 4 | Additive (inner product) | Dominated by database-dependent term |
| DoublePIR + packing | sigma_double^2 <= (q-hat_{2,2}/q-hat_{2,1})^2 * d2 * sigma2^2/4 + (q-hat_{2,2}/q2)^2 * (sigma2^2/4)(l2*p^2 + (d2^2-1)(t*d2*z^2)/3) | Additive + packing noise | Packing adds (d2^2-1)(t*d2*z^2*sigma_chi^2/4) term from CDKS |

- **Correctness condition:** delta <= 2*d2*rho*exp(-pi*tau_double^2/sigma_double^2) + 2*exp(-pi*tau_simple^2/sigma_simple^2) <= 2^{-40}
- **Independence heuristic used?** Yes -- models intermediate error terms as independent sub-Gaussian random variables. Standard in lattice-based PIR.[^13]
- **Dominant noise source:** SimplePIR step dominates for large databases (96% of server time at 32 GB). The packing noise is fixed (independent of database size).

<a id="fn-12"></a>
[^12]: Section 2 (p.7): "Like many lattice-based PIR constructions, we use the independence heuristic that models the error terms arising in intermediate homomorphic computations to be independent."
<a id="fn-13"></a>
[^13]: Theorem 3.4 (p.13-14): Full correctness bound with tau_double and tau_simple margin expressions.

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (32 GB, 1-bit records) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(sqrt(N) * log q / log p + d * log d * log q) | 724 KB (upload) | Online |
| Response size | O(d^2 * kappa * log q-hat / d2) | 32 MB (download) | Online |
| Server computation | O(N * d) | 2.64 s | Online |
| Client computation | -- | Negligible (decryption + rounding) | Online |
| Throughput | O(M) where M = memory bandwidth | 12.1 GB/s/core | Online |
| Response overhead | -- | 32 MB / 32 GB = 0.001x (response independent of DB size) | -- |

<a id="fn-14"></a>
[^14]: Table 2 (p.20): At 32 GB, YPIR achieves 2.5 MB upload, 12 KB download, 2.64 s server time, 12.1 GB/s throughput.

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (32 GB) | Phase |
|--------|-----------|-----------------|-------|
| Server preprocessing | O(l1 * l2 * d1 * log d1) | 11 CPU-minutes (48 MB/s) | Offline (per DB update) |
| Client hint download | 0 | 0 | -- |
| Client offline upload | 0 | 0 | -- |
| Server per-client storage | 0 | 0 (stateless) | -- |

<a id="fn-15"></a>
[^15]: Section 4.4 (p.21-22): "For a 32 GB database, the offline precomputation of YPIR would take about 11 CPU-minutes."
<a id="fn-16"></a>
[^16]: Section 4.1 (p.15): NTT-based preprocessing is d/log d faster than naive: "asymptotically reduces the offline preprocessing cost by a factor of d/log d."

#### FHE-specific metrics

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|---------|-------|
| Expansion factor (LWE) | (n+1)*log q / log p | ~1000x (LWE) reduced to ~2x (RLWE) | -- |
| Expansion factor (RLWE) | 2*log q / log p | Response uses RLWE: (d+1)/2 compression | -- |
| Communication rate | -- | Response size independent of DB size (only depends on lattice parameters) | -- |

<a id="fn-17"></a>
[^17]: Section 1.2 (p.5): "RLWE decreases the expansion factor from (n+1)*log q/log p to 2*log q/log p. For concrete values of n ~ 2^{10}, this is a 1000x reduction."

#### If-reported metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Memory bandwidth utilization | 83% of machine memory bandwidth at 32 GB | Core metric: YPIR is memory-bandwidth-limited, not compute-limited |
| Financial server cost (SCT auditing) | $228/week per 1M clients | 8x cheaper than DoublePIR ($1822), 84x cheaper than Tiptoe |
| Financial server cost (with batching) | $183/week per 1M clients | With cross-client batching, batch size k=4 |

<a id="fn-18"></a>
[^18]: Abstract (p.1): "up to 83% of the memory bandwidth of the machine."
<a id="fn-19"></a>
[^19]: Table 6 (p.26): Weekly server costs for private SCT auditing. YPIR total cost $0.000228, DoublePIR weekly $0.001822, Tiptoe $0.019139.

### Optimization Catalog

| Optimization | Known/Novel | Source | Improvement | Applicable to |
|-------------|-------------|--------|-------------|---------------|
| CDKS packing (LWE-to-RLWE) | Known (adapted) | [CDKS21] | 1000x ciphertext expansion reduction; eliminates hint download | Any LWE-based PIR needing response compression |
| Negacyclic matrix encoding for preprocessing | Novel | This paper | 10--15x faster preprocessing (d/log d asymptotic) | Any SimplePIR-family protocol |
| Preprocessing of CDKS.Pack random components | Novel | This paper | 9x reduction in online packing cost (from O(kappa*d1 + log d2) to O(kappa + log d2) NTTs) | Any scheme using CDKS packing |
| Cross-client batching | Known (adapted) | [LG15, CMS16] | 1.5--1.7x effective throughput improvement | Any memory-bandwidth-limited PIR |
| PRG seed compression for public parameters | Known | Standard (ChaCha20) | Compresses a1, a2 and pk random components | Any LWE/RLWE PIR with random public matrices |
| Split modulus switching | Known | [MW22] | Reduces response size via two-target modulus reduction | Any RLWE-based PIR with multi-prime modulus |
| NTT representation for key-switching / automorphisms | Known (reorganized) | NTT standard practice | Eliminates per-query NTT for packing; permutation on NTT representation replaces automorphism | Any CDKS-based packing |
| CRT decomposition with native 64-bit arithmetic | Known (adapted) | This paper's implementation | Avoids modular reduction after every operation; reduces Eq 3.2 cost by 60x vs. naive | Any NTT-friendly multi-prime scheme |

<a id="fn-20"></a>
[^20]: Section 4.1 (p.15): "By using structured matrices, the YPIR approach is asymptotically faster (by a factor of d/log d)... concretely faster (10-15x)."
<a id="fn-21"></a>
[^21]: Section 4.2 (p.16-17): "Our approach reduces the number of NTTs the Answer algorithm has to compute from O(kappa*d1 + log d2) to O(kappa + log d2). Concretely, this reduces the online cost of the packing transformation by 9x."
<a id="fn-22"></a>
[^22]: Footnote 8 (p.14): "We use 64-bit integer arithmetic to implement arithmetic operations with respect to a 28-bit modulus... the computation of Eq. (3.2) is 60x slower if we perform a modulus reduction after every arithmetic operation."

### Performance Benchmarks

**Hardware:** Amazon EC2 r6i.16xlarge -- Intel Xeon Platinum 8375C @ 2.9 GHz, 64 vCPUs, 512 GB RAM. Single-threaded. GCC 11, AVX2 + AVX-512 enabled. Memory bandwidth measured via STREAM: approximately 14.6 GB/s per core.[^23]

**Implementation:** 3000 lines of Rust + 1000 line C++ kernel for 32-bit matrix multiplication. Open source: https://github.com/menonsamir/ypir.[^24]

#### Table 2 (reproduced): Single-bit retrieval from databases of varying sizes

| Database | Metric | SimplePIR | DoublePIR | Tiptoe | HintlessPIR | YPIR |
|----------|--------|-----------|-----------|--------|-------------|------|
| **1 GB** | Prep. Throughput | 3.7 MB/s | 3.4 MB/s | 1.6 MB/s | 4.8 MB/s | 39 MB/s |
| | Off. Download | 121 MB | 16 MB | -- | -- | -- |
| | Upload | 120 KB | 312 KB | 33 MB | 488 KB | 846 KB |
| | Download | 120 KB | 32 KB | 2.1 MB | 1.7 MB | 12 KB |
| | Server Time | 74 ms | 94 ms | 2.47 s | 743 ms | 129 ms |
| | Throughput | 13.6 GB/s | 10.6 GB/s | 415 MB/s | 1.3 GB/s | 7.8 GB/s |
| **8 GB** | Prep. Throughput | 3.1 MB/s | 2.9 MB/s | 1.6 MB/s | 5.2 MB/s | 46 MB/s |
| | Off. Download | 362 MB | 16 MB | -- | -- | -- |
| | Upload | 362 KB | 724 KB | 33 MB | 1.4 MB | 1.5 MB |
| | Download | 362 KB | 32 KB | 1.7 MB | 1.7 MB | 12 KB |
| | Server Time | 708 ms | 845 ms | 9.75 s | 1.62 s | 687 ms |
| | Throughput | 11.3 GB/s | 9.5 GB/s | 840 MB/s | 4.9 GB/s | 11.6 GB/s |
| **32 GB** | Prep. Throughput | 3.3 MB/s | 3.3 MB/s | 1.4 MB/s | 5.7 MB/s | 48 MB/s |
| | Off. Download | 724 MB | 16 MB | -- | -- | -- |
| | Upload | 724 KB | 1.4 MB | 34 MB | 2.4 MB | 2.5 MB |
| | Download | 724 KB | 32 MB | 17 MB | 3.2 MB | 12 KB |
| | Server Time | 3.08 s | 3.22 s | 21.00 s | 5.00 s | 2.64 s |
| | Throughput | 10.4 GB/s | 9.9 GB/s | 1.5 GB/s | 6.4 GB/s | 12.1 GB/s |

<a id="fn-23"></a>
[^23]: Section 4.4 (p.19): "We use an Amazon EC2 r6i.16xlarge instance running Ubuntu 22.04, with 64 vCPUs (Intel Xeon Platinum 8375C CPU @ 2.9 GHz) and 512 GB of RAM."
<a id="fn-24"></a>
[^24]: Footnote 9 (p.19): "Our code is available at https://github.com/menonsamir/ypir."

#### Table 3 (reproduced): Server computation breakdown

| DB Size | SimplePIR step | DoublePIR step | Packing step | Total |
|---------|---------------|----------------|-------------|-------|
| 1 GB | 0.07 s (59%) | 14 ms (11%) | 39 ms (30%) | 0.13 s |
| 4 GB | 0.30 s (82%) | 27 ms (7%) | 38 ms (10%) | 0.37 s |
| 16 GB | 1.21 s (93%) | 57 ms (4%) | 39 ms (3%) | 1.31 s |
| 32 GB | 2.56 s (96%) | 58 ms (2%) | 39 ms (1%) | 2.66 s |

<a id="fn-25"></a>
[^25]: Table 3 (p.22): Packing is a fixed cost (~39 ms), independent of database size. At 32 GB, SimplePIR dominates at 96%.

#### Table 4 (reproduced): Query size breakdown

| DB Size | |c1| | |c2| | |pk| | Total |
|---------|------|------|------|-------|
| 1 GB | 128 KB (15%) | 256 KB (30%) | 462 KB (55%) | 846 KB |
| 4 GB | 256 KB (21%) | 512 KB (42%) | 462 KB (38%) | 1.2 MB |
| 16 GB | 512 KB (26%) | 1.0 MB (51%) | 462 KB (23%) | 2.0 MB |

<a id="fn-26"></a>
[^26]: Table 4 (p.22): The packing key pk is fixed at 462 KB. The c2 encoding is roughly 2x larger than c1 because log q2 / log q1 ~ 2.

#### Table 5: LWE-to-RLWE packing microbenchmarks (packing 2^{12} LWE encodings)

| Metric | Tiptoe | HintlessPIR | CDKS (no preprocess) | CDKS (with preprocess) |
|--------|--------|-------------|---------------------|----------------------|
| log(n, q, p) | (10, 32, 8) | (10, 32, 8) | (11, 56, 15) | (11, 56, 15) |
| Parameter Size | 32 MB | 360 KB | 528 KB | 528 KB |
| Output Size | 514 KB | 180 KB | 24 KB | 24 KB |
| Output Rate | 0.01 | 0.02 | 0.31 | 0.31 |
| Offline Compute | -- | 2012 ms | -- | 1029 ms |
| Online Compute | 594 ms | 141 ms | 340 ms | 52 ms |

<a id="fn-27"></a>
[^27]: Table 5 (p.25): CDKS approach with preprocessing achieves 7.5x smaller output than HintlessPIR, 15x higher rate, and 2.7x faster total computation.

### Application Scenarios

#### Private SCT Auditing (Section 4.5)

- **Database:** 2^{36} bits (8 GB) representing 5 billion active SCTs via Bloom filters.
- **Workload:** 20 audits per client per week (10^4 TLS connections, 1/1000 audit fraction, 2 audits each).
- **Key advantage:** YPIR supports *daily* database updates at no extra client communication cost (no hint to re-download), whereas DoublePIR requires weekly hint re-download compromising real-time auditing.[^28]
- **Cost comparison (Table 6):** YPIR: $228/week per 1M clients. DoublePIR weekly: $1,822. DoublePIR daily: $10,863. Tiptoe: $19,139. HintlessPIR: $3,708.[^29]

<a id="fn-28"></a>
[^28]: Section 1 (p.1): "Since there is no offline communication in YPIR, our approach allows clients to always audit the most recent Certificate Transparency logs."
<a id="fn-29"></a>
[^29]: Table 6 (p.26): Full cost breakdown. YPIR total cost is 8x lower than DoublePIR-weekly and 48x lower than DoublePIR-daily.

#### Password Breach Checking (Section 4.6)

- **Database:** 1 billion SHA-256 hashes (2^{19} records x 64 KB each, 32 GB total).
- **Approach:** Bucket retrieval -- hash password, retrieve bucket by prefix, search locally.
- **Result:** Single breach check requires 2.6 MB total communication and 5.2 seconds computation. 2.2x less total communication than HintlessPIR, but 5% more computation.[^30]

<a id="fn-30"></a>
[^30]: Section 4.6 (p.29): "Using YPIR+SP, performing a single password breach check against 1 billion compromised passwords requires just 2.6 MB of total communication and 5.2 seconds of computation."

### Portable Optimizations

1. **Negacyclic matrix encoding for NTT-based preprocessing:** Replace the random matrix A in SimplePIR/DoublePIR/FrodoPIR preprocessing with a structured negacyclic matrix A = NCyclicMat(a^T). This allows computing A*D using NTTs in O(l1*l2*d*log d) time instead of O(l1*l2*d^2), yielding d/log d ~ 100x asymptotic speedup. Applicable to any SimplePIR-family protocol with zero impact on online costs. Security shifts from plain LWE to RLWE.[^31]

2. **CDKS packing with precomputed random components:** Precompute the random (query-independent) components of CDKS.Pack output during Setup, reducing online packing from O(kappa*d1) to O(kappa + log d2) NTTs. Applicable to any scheme using CDKS packing.[^32]

3. **Cross-client batching:** Process k concurrent queries from independent, non-coordinating clients via a single database scan (matrix-matrix product Q*D instead of k separate q_i^T*D). Effective throughput = k*l/T. With k=4, exceeds memory bandwidth barrier (16+ GB/s effective throughput). Applicable to any memory-bandwidth-limited PIR scheme. Transparent to clients.[^33]

<a id="fn-31"></a>
[^31]: Section 4.1 (p.15) + Appendix B (p.36-37): Full derivation showing A1*d computed via NCyclicMat multiplication in O(d1*log d1) per column.
<a id="fn-32"></a>
[^32]: Section 4.2 (p.16-17): Preprocessing reduces online NTTs from O(kappa*d1 + log d2) to O(kappa + log d2).
<a id="fn-33"></a>
[^33]: Section 4.3 (p.17-18): "Cross-client batching can increase the effective server throughput of many PIR schemes by 1.5--1.7x."

### Implementation Notes

- **Language / Library:** Rust (3000 LOC) + C++ (1000 LOC) for fast 32-bit matrix multiplication. Uses Intel HEXL [BKS+21] for AVX2/AVX-512 acceleration where relevant.
- **Polynomial arithmetic:** NTT-based. Modulus q2 is a product of two 28-bit NTT-friendly primes, enabling native 64-bit integer arithmetic without frequent modular reduction.[^34]
- **CRT decomposition:** q2 = (2^{28} - 2^{16} + 1) * (2^{28} - 2^{24} - 2^{21} + 1). Arithmetic performed modulo each 28-bit prime using 64-bit integers; CRT reconstruction only when needed.
- **SIMD / vectorization:** AVX2 and AVX-512 enabled via compiler flags and Intel HEXL.
- **Parallelism:** Single-threaded benchmarks (the primary computation -- matrix-vector product -- is highly parallelizable).
- **PRG:** ChaCha20 in counter mode for generating pseudorandom public parameters a1, a2 and packing key random components.
- **Open source:** https://github.com/menonsamir/ypir

<a id="fn-34"></a>
[^34]: Footnote 8 (p.14): "Since we use 64-bit integer arithmetic to implement arithmetic operations with respect to a 28-bit modulus, we do not need to perform a modulus reduction after every arithmetic operation."

### Comparison with Prior Work

#### Single-bit retrieval, 32 GB database

| Metric | YPIR | SimplePIR | DoublePIR | HintlessPIR | Tiptoe |
|--------|------|-----------|-----------|-------------|--------|
| Upload | 2.5 MB | 724 KB | 1.4 MB | 2.4 MB | 34 MB |
| Download | 12 KB | 724 KB | 32 MB | 3.2 MB | 17 MB |
| Total online comm | 2.5 MB | 1.4 MB | 33.4 MB | 5.6 MB | 51 MB |
| Offline download | **0** | 724 MB | 16 MB | **0** | **0** |
| Server time | 2.64 s | 3.08 s | 3.22 s | 5.00 s | 21.00 s |
| Throughput | 12.1 GB/s | 10.4 GB/s | 9.9 GB/s | 6.4 GB/s | 1.5 GB/s |
| Prep. throughput | 48 MB/s | 3.3 MB/s | 3.3 MB/s | 5.7 MB/s | 1.4 MB/s |

<a id="fn-35"></a>
[^35]: Table 2 (p.20): All measurements from official reference implementations on the same hardware.

**Key takeaway:** YPIR is the preferred scheme when offline communication must be eliminated (dynamic databases, cold-start clients, multi-database access) while maintaining near-maximal throughput. It achieves 97% of SimplePIR's throughput and 83% of the machine's memory bandwidth at 32 GB, with zero offline communication. The main tradeoff is 1.8--3.6x larger total online communication compared to SimplePIR/DoublePIR (which additionally require offline downloads of 16--724 MB).[^36]

<a id="fn-36"></a>
[^36]: Section 1.1 (p.3): "YPIR achieves 97% of the throughput of one of the fastest single-server PIR schemes while fully eliminating all offline communication and only incurring a modest increase in query size."

### Deployment Considerations

- **Database updates:** Server must re-preprocess (recompute H1, H2, and CDKS.Pack random components) on each database update. With NTT-based preprocessing, this takes 11 CPU-minutes for 32 GB (vs. 144 CPU-minutes for SimplePIR).[^37]
- **Sharding:** Explicitly discussed for communication-throughput tradeoff. Running k instances on k sub-databases of size N/k reduces query size while increasing response size. Can achieve 95% of DoublePIR throughput at 1.5 MB total communication.[^38]
- **Anonymous query support:** Yes -- fully stateless. No client-specific state on server, no offline phase. Each query is independent.
- **Session model:** Ephemeral client. No persistent state needed between queries.
- **Cold start suitability:** Excellent -- no offline communication, no hint download. First query works immediately.
- **Communication floor:** Cannot achieve <1 MB total communication for a 32 GB database (minimum query size ~1.1 MB due to packing key). For settings with tight communication budgets, DoublePIR with its 16 MB offline hint may be preferable.[^39]

<a id="fn-37"></a>
[^37]: Section 4.4 (p.21): "The offline precomputation of YPIR would take about 11 CPU-minutes, whereas for SimplePIR/DoublePIR, it would take roughly 144 CPU-minutes."
<a id="fn-38"></a>
[^38]: Section 4.4 (p.22-23): Communication-computation tradeoff via sharding/rebalancing discussed with Figure 3.
<a id="fn-39"></a>
[^39]: Section 1.1 (p.4): "The minimum YPIR query size is 1.1 MB... YPIR may not be appropriate" for small fixed communication budgets.

### Key Tradeoffs & Limitations

- **Larger queries:** YPIR queries are 1.8--3x larger than DoublePIR and 3--7x larger than SimplePIR due to the packing key (462 KB fixed overhead) and larger c2 encoding (needs log q2 / log q1 ~ 2x more bits).[^40]
- **Small database penalty:** At 1 GB, YPIR throughput (7.8 GB/s) is 43% lower than SimplePIR (13.6 GB/s) because the fixed packing cost (39 ms) represents 30% of server time. The packing cost becomes negligible (1%) at 32 GB.[^41]
- **RLWE assumption required:** The NTT-based preprocessing optimization requires RLWE hardness (not plain LWE). The online computation remains over integers Z_q, not the polynomial ring.
- **Circular security assumption:** Requires key-dependent pseudorandomness for RLWE encodings (Definition A.1), standard in lattice-based schemes but non-trivial.[^42]
- **Memory bandwidth bound:** Like all SimplePIR-family schemes, YPIR cannot exceed the memory bandwidth of the machine. At 32 GB, YPIR achieves 83% of the theoretical memory bandwidth ceiling (~14.6 GB/s).[^43]

<a id="fn-40"></a>
[^40]: Section 1.1 (p.4): "A YPIR query is 1.8-3x larger than a DoublePIR query... and 3-7x larger than a SimplePIR query."
<a id="fn-41"></a>
[^41]: Table 3 (p.22): Packing is 30% of total at 1 GB, 1% at 32 GB.
<a id="fn-42"></a>
[^42]: Section 3 (p.10): "Pseudorandomness thus relies on a 'circular security' assumption."
<a id="fn-43"></a>
[^43]: Remark 4.1 (p.15-16): A ring-based SimplePIR incurs a 3.6x throughput reduction (11.5 GB/s to 3.2 GB/s) due to log q/log N representation blowup.

### Open Problems

- Can we design PIR schemes with silent preprocessing that achieve significantly smaller communication than YPIR while retaining comparable throughput?[^44]
- Can faster matrix multiplication algorithms (e.g., Strassen) improve the concrete efficiency of cross-client batching in SimplePIR-based protocols?[^45]

<a id="fn-44"></a>
[^44]: Section 4.4 (p.23): "An important open question is to design PIR schemes that require significantly smaller communication while retaining comparable server throughput (and silent preprocessing)."
<a id="fn-45"></a>
[^45]: Section 4.3 (p.18): "It is interesting to see whether faster matrix multiplication algorithms can be used to further improve concrete efficiency in SimplePIR-based protocols."

### Related Papers in Collection

- **SimplePIR/DoublePIR [Group C]:** Direct predecessors. YPIR builds on their matrix-LWE structure and database encoding. YPIR eliminates their offline hint download.
- **Spiral [Group A]:** Shares the key-switching-based response compression philosophy. YPIR's CDKS packing is conceptually similar to Spiral's response packing.
- **HintlessPIR [Group B]:** Concurrent hintless scheme using bootstrapping-based LWE-to-RLWE conversion. YPIR achieves 2--6x higher throughput and 7.5x smaller packed encodings.
- **VeriSimplePIR [Group C]:** Adds verifiability to SimplePIR; YPIR's NTT preprocessing optimization is directly applicable.
- **IncrementalPIR [Group C]:** Addresses preprocessing cost for SimplePIR family; YPIR's NTT-based preprocessing is complementary.

### Uncertainties

- The paper uses N for both the record-count modulus (Z_N, where N = 2^8 for byte-valued records) and implicitly the total number of records in asymptotic expressions. Context disambiguates: N = l1 * l2 for total records, N (in Z_N) for the record value space.
- Memory bandwidth measurements use STREAM [McC95] but the precise per-core bandwidth ceiling (~14.6 GB/s referenced on p.1, dashed line in Figure 2 at approximately 15 GB/s) is approximate, read from the chart.
- The "conjectured max throughput" line in Figure 4 (approximately 22 GB/s) assumes minimum 2 arithmetic operations per database byte; this is an engineering estimate, not a proven bound.
