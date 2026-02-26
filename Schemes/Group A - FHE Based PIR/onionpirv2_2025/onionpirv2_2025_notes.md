## OnionPIRv2 — Engineering Notes

<a id="toc"></a>

**Table of Contents**

<table><tr><td>

<sub>1.</sub> <sub><a href="#lineage">Lineage</a></sub><br>
<sub>2.</sub> <sub><a href="#core-idea">Core Idea</a></sub><br>
<sub>3.</sub> <sub><a href="#warmup">Warm-up</a></sub><br>
<sub>4.</sub> <sub><a href="#crypto-foundation">Crypto Foundation</a></sub><br>
<sub>5.</sub> <sub><a href="#ring-architecture">Ring Architecture</a></sub><br>
<sub>6.</sub> <sub><a href="#key-data-structures">Key Data Structures</a></sub><br>
<sub>7.</sub> <sub><a href="#database-encoding">DB Encoding</a></sub><br>
<sub>8.</sub> <sub><a href="#protocol-phases">Protocol Phases</a></sub><br>
<sub>9.</sub> <sub><a href="#query-structure">Query Structure</a></sub><br>
<sub>10.</sub> <sub><a href="#correctness-analysis">Correctness</a></sub>

</td><td>

<sub>11.</sub> <sub><a href="#complexity">Complexity</a></sub><br>
<sub>12.</sub> <sub><a href="#optimization-catalog">Optimization Catalog</a></sub><br>
<sub>13.</sub> <sub><a href="#perf-benchmarks">Performance</a></sub><br>
<sub>14.</sub> <sub><a href="#server-computation">Server Computation</a></sub><br>
<sub>15.</sub> <sub><a href="#comparison">Prior Work</a></sub><br>
<sub>16.</sub> <sub><a href="#portable-optimizations">Portable Optimizations</a></sub><br>
<sub>17.</sub> <sub><a href="#implementation-notes">Implementation</a></sub><br>
<sub>18.</sub> <sub><a href="#tradeoffs">Tradeoffs</a></sub><br>
<sub>19.</sub> <sub><a href="#open-problems">Open Problems</a></sub><br>
<sub>20.</sub> <sub><a href="#uncertainties">Uncertainties</a></sub>

</td></tr></table>

| Field | Value |
|-------|-------|
| **Paper** | [OnionPIRv2: Efficient Single-Server PIR](https://eprint.iacr.org/2025/1142) (2025) |
| **Archetype** | Construction + Engineering optimization |
| **PIR Category** | Group A — FHE-based |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | None beyond RLWE; pseudorandom component trick uses standard PRG |
| **Correctness model** | Deterministic (empirical: 1–3 bits noise budget remaining after decryption, validated over 5000+ runs)&#8201;[^1] |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Moderate (best at 4 KB and above; two parameter sets target ~3.75 KB and ~22.5 KB entries)&#8201;[^2] |

[^1]: §4.1, p.11: "Each parameter set leaves a noise budget of 1 to 3 bits after client decryption. We have tested these parameters in more than 5000 runs and all results are correct."
[^2]: Table 2, p.12: The n=2048 setting uses 3.75 KB native entries; the n=4096 setting uses 22.5 KB entries. Response overhead degrades below ~4 KB.

<a id="lineage"></a>

### Lineage <a href="#toc">⤴</a>

| Field | Value |
|-------|--------|
| **Builds on** | OnionPIR (Mughees, Chen, Ren — CCS 2021) [Group A]; techniques from SealPIR [3], Onion Ring ORAM [9], Spiral [19] |
| **What changed** | Original OnionPIR had a poor open-source prototype; this paper applies standard orthogonal techniques (modulus switching, Barrett reduction, delayed modular reduction, separate RGSW parameters) and novel optimizations (tree trimming in query unpacking, pseudorandom key materials, NTT-domain database storage as matrix multiplication) to achieve up to 40% response reduction and 11x throughput improvement.&#8201;[^3] |
| **Superseded by** | N/A |
| **Concurrent work** | KsPIR (Luo, Liu, Wang — CCS 2024) [18]; Respire (Burton, Menon, Wu — 2024) [8]; WhisPIR [13] |

[^3]: p.2: "OnionPIRv2 achieves 2.5x-3.6x response overhead and 1100-1600 MB/s server computation throughput, which are up to 40% reduction and 11x improvements over the original OnionPIR prototype."

<a id="core-idea"></a>

### Core Idea <a href="#toc">⤴</a>

OnionPIRv2 is an engineering-focused re-implementation of OnionPIR that achieves state-of-the-art single-server PIR performance by combining known techniques overlooked in the original prototype with novel implementation-level optimizations. The key insight is that after NTT-transforming the database, the initial-dimension dot product reduces to standard integer matrix multiplication — enabling memory-bandwidth-limited throughput — while multi-base RGSW decomposition and modulus switching reduce response overhead to 2.5–3.6x.&#8201;[^4]

[^4]: §3.5, p.10: "After applying NTT to the plaintext database, each polynomial multiplication becomes an elementwise vector multiplication. Then, we can reinterpret the computation as n separate instances of standard matrix multiplication."

<a id="warmup"></a>

### Warm-up / Strawman Protocol (Section 3.1) <a href="#toc">⤴</a>

The paper first describes a **warm-up protocol** to motivate the OnionPIR design:&#8201;[^5]

- Use RGSW ciphertexts for all query vectors (not BFV for the initial dimension)
- Use *external product* for every dimension (all log N dimensions, each of size 2)
- This gives a 2 x 2 x ... x 2 hypercube of log N dimensions
- **Advantage:** Significantly reduces response size vs SealPIR due to additive noise growth of external products
- **Disadvantage:** Much higher server computation — external product costs ~2l = 10 polynomial multiplications vs 2 for plaintext-ciphertext multiplication

OnionPIR's solution: keep BFV plaintext-ciphertext multiplication for the *initial dimension* (size N_0 = 512), which dominates computation, and use external products only for subsequent binary dimensions. This gives good response size AND good throughput.&#8201;[^6]

[^5]: §3.1, p.5: "We first describe a warm-up protocol that reduces the response size at the expense of higher computation."
[^6]: §3.2, p.5: "A key idea in OnionPIR is a simple trick to keep the server computation low: stay with BFV plaintext-ciphertext multiplication in the initial dimension and make the initial dimension larger than the remaining dimensions."

<a id="crypto-foundation"></a>

### Cryptographic Foundation <a href="#toc">⤴</a>

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (Ring Learning With Errors) |
| **Encryption/encoding schemes** | BFV [14] (initial dimension query vector, plaintext-ciphertext multiplication) + RGSW [16, 11] (subsequent dimension selection, external products) |
| **Ring / Field** | R = Z[x]/(x^n + 1) with n = 2048 or n = 4096; ciphertext modulus q; plaintext modulus t |
| **Key structure** | Ternary secret s in R; per-client RGSW(s) and evaluation keys stored on server (0.63 MB or 2.9 MB)&#8201;[^7] |
| **Correctness condition** | BFV decryption: round((c_0 + c_1 * s) / Delta) mod t where Delta = floor(q/t); requires noise norm < Delta/2 |

[^7]: §4.4, p.12: "The key material size is 0.63 MB for the smaller parameter setting and 2.9 MB for the larger parameter setting."

<a id="ring-architecture"></a>

### Ring Architecture / Modulus Chain <a href="#toc">⤴</a>

| Setting | Ring Degree n | Ciphertext Modulus q (bits) | Plaintext Modulus t (bits) | Response Modulus q' (bits) | RGSW Decomposition l (unpack) | RGSW Decomposition l (subsequent) |
|---------|--------------|---------------------------|--------------------------|--------------------------|------------------------------|----------------------------------|
| Small | 2048 | 60 | 16 | 27 | 10 | 5 |
| Large | 4096 | 120 | 46 | 57 | 8 | 4 |

Both settings use N_0 = 512 for the initial dimension. Security: ~113 bits (LWE estimator by Albrecht et al.).&#8201;[^8]

[^8]: §4.1, p.11: "The LWE estimator by Albrecht et al. [1] suggests these parameters yield about 113 bits of computational security in both settings."

<a id="key-data-structures"></a>

### Key Data Structures <a href="#toc">⤴</a>

- **Database:** Hypercube with initial dimension N_0 = 512 and d-1 subsequent binary dimensions; total dimensions d = 1 + ceil(log_2(N/N_0))&#8201;[^9]
- **NTT-preprocessed database:** Database entries encoded as polynomials in R mod t, then NTT-transformed for the initial dimension. Stored in NTT domain on server. Storage expansion factor: log q / log t (3.75x for n=2048, 2.6x for n=4096)&#8201;[^10]
- **Per-client key material:** RGSW encryption of secret key + evaluation keys for Subs operations. Size: 0.63 MB (n=2048) or 2.9 MB (n=4096)
- **Query:** Single BFV ciphertext packing N_0 + l(d-1) values&#8201;[^11]

[^9]: §3.6, p.10-11: "The database is represented as a hypercube with initial dimension N_0 = 512, and each of the remaining dimensions is of size 2."
[^10]: §4.4, p.13: "After server preprocessing, the database is stored in NTT form and becomes larger by roughly a factor of log q / log t."
[^11]: §3.3, p.5-6: "With N_0 = 512 and l = 5, we can pack all the query bits into a single BFV ciphertext for all realistic databases."

<a id="database-encoding"></a>

### Database Encoding <a href="#toc">⤴</a>

- **Representation:** Hypercube (N/N_0) x N_0 matrix, where each entry is a polynomial in R mod t
- **Record addressing:** Multi-dimensional: index idx decomposed into (i_0, i_1, ..., i_{d-1}) where i_0 in {0,...,N_0-1} and i_j in {0,1} for j >= 1
- **Preprocessing required:** NTT conversion of entire database (one-time). Each polynomial in the database matrix is transformed to NTT domain, enabling elementwise multiplication instead of polynomial multiplication&#8201;[^12]
- **Record size equation:** Each record occupies n coefficients in Z_t. Native record size = n * log_2(t) / 8 bytes (3.75 KB for n=2048/t=16-bit; 22.5 KB for n=4096/t=46-bit). Larger records span multiple polynomials.

[^12]: §3.5, p.10: "After applying NTT to the plaintext database, each polynomial multiplication becomes an elementwise vector multiplication."

<a id="protocol-phases"></a>

### Protocol Phases <a href="#toc">⤴</a>

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Encoding | Server | NTT-transform database polynomials | — | Once (or on DB update) |
| Key Upload | Client | Send RGSW(s) + evaluation keys | 0.63–2.9 MB ↑ | Once per client |
| Query Gen | Client | QueryPack: encode index into single BFV ciphertext | 16–64 KB ↑ | Per query |
| Query Unpack | Server | ExpandBFV + ExternalProduct to produce N_0 BFV ciphertexts + (d-1) RGSW ciphertexts | — | Per query |
| Initial Dimension | Server | Matrix-vector product: BFV query vector x NTT database | — | Per query (dominates computation) |
| Subsequent Dimensions | Server | d-1 rounds of external products to select correct half | — | Per query |
| Modulus Switch | Server | Switch response ciphertext from modulus q to q' | — | Per query |
| Response | Server | Send modulus-switched BFV ciphertext | 13.5–57 KB ↓ | Per query |
| Decode | Client | BFV decryption | — | Per query |

<a id="query-structure"></a>

### Query Structure <a href="#toc">⤴</a>

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Packed query ciphertext | BFV | 16 KB (n=2048) / 64 KB (n=4096) | Contains N_0 initial-dim indicators + l(d-1) binary selection bits, packed into coefficients&#8201;[^13] |
| Pseudorandom seed | PRG seed | ~256 bits | Server expands to generate the random component (a) of the BFV ciphertext. Halves request size.&#8201;[^14] |

[^13]: §3.3, p.6: "A BFV ciphertext in our implementation has n = 2048 or n = 4096 plaintext slots. With N_0 = 512 and l = 5, we can pack all the query bits into a single BFV ciphertext." Note: "plaintext slots" here refers to polynomial coefficient positions, not SIMD batching slots — OnionPIR packs values into individual coefficients.
[^14]: §3.3, p.8: "Recall that a BFV ciphertext consists of two components, and one of them is sampled uniformly randomly from R mod q. So, the client can generate it pseudorandomly from a short random seed and send the seed to the server."

<a id="correctness-analysis"></a>

### Correctness Analysis <a href="#toc">⤴</a>

<a id="option-a2"></a>

#### Option A2: Library-based noise management <a href="#toc">⤴</a>

- **Library / version:** Microsoft SEAL 4.1
- **Noise growth model:** External product noise is *additive*: O(B * Err(C) + |m_C| * Err(d)), where m_C is typically a single bit.&#8201;[^15] BFV multiplication noise is *multiplicative*. This is the fundamental reason OnionPIR uses external products for subsequent dimensions.
- **Noise budget approach:** SEAL's noise budget estimator used for plaintext modulus selection. Empirical validation: 1–3 bits remaining after decryption over 5000+ runs.&#8201;[^16]
- **Dominant noise source:** External products in query unpacking (computed once) and subsequent dimension selection. The initial dimension uses only plaintext-ciphertext multiplication (cheap noise).

[^15]: Table 1, p.3: External product noise growth is additive for PIR (where m_C encrypts a single bit).
[^16]: §4.1, p.11: "Each parameter set leaves a noise budget of 1 to 3 bits after client decryption."

| Operation | Cost (poly mults) | Noise Growth |
|-----------|------------------|--------------|
| BFV ciphertext addition | ~0 | Additive |
| BFV plaintext-ciphertext mult | 2 | Multiplicative |
| BFV ciphertext-ciphertext mult | 4 + 2l | Multiplicative |
| External product | 4l | Additive (for PIR) |

<a id="complexity"></a>

### Complexity <a href="#toc">⤴</a>

<a id="core-metrics"></a>

#### Core metrics <a href="#toc">⤴</a>

| Metric | Asymptotic | Concrete (n=2048, ~1 GB DB) | Concrete (n=4096, ~8 GB DB) | Phase |
|--------|-----------|---------------------------|---------------------------|-------|
| Query size | O(n log q) | 16 KB | 64 KB | Online |
| Response size | O(n log q') | 13.5 KB | 57 KB | Online |
| Response overhead | O(log q' / log t) | 3.6x | 2.53x | — |
| Server computation | O(N * n * log q / log t) | ~0.8 s (0.9 GB) | ~6.9 s (7.5 GB) | Online |
| Throughput | — | 1109 MB/s | 1098 MB/s | Online |
| Per-client server storage | — | 0.63 MB | 2.9 MB | Persistent |

<a id="fhe-metrics"></a>

#### FHE-specific metrics <a href="#toc">⤴</a>

| Metric | Concrete (n=2048) | Concrete (n=4096) |
|--------|-------------------|-------------------|
| Expansion factor F (pre-modswitch) | q/t = 2^60 / 2^16 = 2^44 | q/t = 2^120 / 2^46 = 2^74 |
| Effective expansion factor (post-modswitch) | q'/t = 2^27 / 2^16 ≈ 2048 → 3.6x overhead&#8201;[^17] | q'/t = 2^57 / 2^46 ≈ 2048 → 2.53x overhead |
| Multiplicative depth | 0 (initial dim uses plaintext-ct mult; subsequent dims use external product with additive noise) | Same |
| Security level | ~113 bits | ~113 bits |

[^17]: §4.4, p.12: "With the n = 2048 parameter choice, the request size is 16 KB and the response size is 13.5 KB, giving a response blowup of 13.5/3.75 = 3.6."

<a id="optimization-catalog"></a>

### Optimization Catalog <a href="#toc">⤴</a>

| # | Optimization | Known/Novel | Source | Improvement | Applicable to |
|---|-------------|-------------|--------|-------------|---------------|
| 1 | **Modulus switching** on response | Known | Brakerski-Vaikuntanathan [7]; Ali et al. [2] | Reduces response size by factor q/q' (from 128 KB to 13.5 KB for n=2048). Supersedes OnionPIR's plaintext splitting.&#8201;[^18] | Any RLWE-based PIR with large ciphertext modulus |
| 2 | **Reducing external products** (1-out-of-2 selection via b*(y-x)+x) | Known | Chillotti et al. [10]; Chen et al. [9]; Park & Tibouchi [22] | Halves the number of external products per subsequent dimension (1 instead of 2) | Any PIR using external products for binary selection |
| 3 | **Delayed modular reduction** | Known | Standard FHE optimization | Skips intermediate mod reductions in sequential additions; applies mod once at end. Reduces instruction count. | Any scheme with sequential homomorphic additions |
| 4 | **Barrett reduction** | Known | Barrett [4]; Geraud et al. [17] | Replaces expensive division-based modular reduction with shift-based operations | Any modular arithmetic implementation |
| 5 | **Separate RGSW parameters** for key material vs query ciphertexts | Known | Menon & Wu (Spiral) [19] | Uses smaller base B for key material (query unpacking, computed once) and smaller l for query RGSW ciphertexts (subsequent dimensions, speed-critical). Better noise-computation tradeoff.&#8201;[^19] | Any scheme using RGSW with both unpacking and selection |
| 6 | **Pseudorandom component in BFV queries** | Known | Chillotti et al. [10] | Halves request size (send seed instead of random polynomial a) | Any RLWE-based PIR |
| 7 | **Tree trimming in query unpacking** | **Novel** | This paper | Skips Subs calls for wasteful nodes when N_0 + l(d-1) is not a power of 2. Requires bit-reversed packing (BitRev). Reduces query unpacking time.&#8201;[^20] | Any PIR using binary tree-based ciphertext expansion (SealPIR, OnionPIR, Spiral variants) |
| 8 | **Pseudorandom components in key materials** | **Novel** | This paper (credited to Zhikun Wang) | Halves per-client server storage for RGSW(s) by generating second components of all 2l rows from a single seed.&#8201;[^21] | Any scheme storing RGSW encryptions of client secrets |
| 9 | **NTT-domain database storage + matrix multiplication reinterpretation** | **Novel application** | NTT is standard; the reinterpretation as n independent integer matrix multiplications is novel to this PIR context | Transforms initial-dimension computation into cache-friendly standard integer matrix multiplication. Throughput approaches memory bandwidth limit.&#8201;[^22] | Any NTT-based PIR where the initial dimension is a plaintext-ciphertext dot product |

[^18]: §3.4, p.8: "Modulus switching takes a ciphertext with modulus q and scales it to a ciphertext with a smaller modulus q' < q... Modulus switching also supersedes a design in the original OnionPIR: the plaintext splitting in the initial dimension."
[^19]: §3.4, p.9: "Menon and Wu [19] suggest using a smaller B for the key material to better control noise in the query unpacking step and a smaller l for query ciphertexts to speed up the dot products in the subsequent dimensions."
[^20]: §3.5, p.9: "In the original OnionPIR, the query unpacking algorithm always produces a perfect binary tree. This is wasteful when N_0 + l(d-1) is not a power of 2."
[^21]: §3.5, p.9: "We can now use a single short seed to generate the second components of all 2l rows of RGSW(s). This cuts the server storage for RGSW(s) in half."
[^22]: §3.5, p.10: "After applying NTT to the plaintext database, each polynomial multiplication becomes an elementwise vector multiplication. Then, we can reinterpret the computation as n separate instances of standard matrix multiplication."

<a id="perf-benchmarks"></a>

### Performance Benchmarks <a href="#toc">⤴</a>

**Hardware:** AWS EC2 c5n.9xlarge, Intel Xeon Platinum 8124M @ 3.00 GHz, 96 GB RAM. Single-threaded. Ubuntu 22.04, GCC 11.0.4. AVX2 + AVX512 enabled (via Intel HEXL in SEAL).&#8201;[^23]

[^23]: §4.3, p.12: "We test the performance of our OnionPIRv2 implementation on an AWS EC2 c5n.9xlarge instance with 96 GB RAM and Intel(R) Xeon(R) Platinum 8124M CPU @ 3.00GHz."

<a id="perf-1gb"></a>

#### Table 2 (reproduced from paper) — ~1 GB Database <a href="#toc">⤴</a>

| Metric | OnionPIRv1 | Spiral | KsPIR | OnionPIRv2 (n=2048) | OnionPIRv2 (n=4096) |
|--------|-----------|--------|-------|---------------------|---------------------|
| DB Entry Size | 30 KB | 8 KB | 8 KB | 3.75 KB | 22.5 KB |
| Server Storage (extra) | 6.3 MB | 15–17 MB | 9–9.3 MB | 0.63 MB | 2.9 MB |
| DB Size | 0.9 GB | 1 GB | 1 GB | 0.9 GB | 1.4 GB |
| Request Size | 64 KB | 14 KB | 140 KB | 16 KB | 64 KB |
| Response Size | 128 KB | 20.5 KB | 26 KB | 13.5 KB | 57 KB |
| Response Overhead | 4.27x | 2.56x | 3.25x | **3.6x** | **2.53x** |
| Throughput | 122 MB/s | 247 MB/s | 1251 MB/s | 1109 MB/s | 1098 MB/s |

<a id="perf-8gb"></a>

#### Table 2 (reproduced from paper) — ~8 GB Database <a href="#toc">⤴</a>

| Metric | OnionPIRv1 | Spiral | KsPIR | OnionPIRv2 (n=2048) | OnionPIRv2 (n=4096) |
|--------|-----------|--------|-------|---------------------|---------------------|
| DB Entry Size | 30 KB | 8 KB | 8 KB | 3.75 KB | 22.5 KB |
| Server Storage (extra) | — | — | — | 0.63 MB | 2.9 MB |
| DB Size | 7.5 GB | 8 GB | 8 GB | 7.5 GB | 11.3 GB |
| Request Size | 64 KB | 14 KB | 140 KB | 16 KB | 64 KB |
| Response Size | 128 KB | 21 KB | 26 KB | 13.5 KB | 57 KB |
| Response Overhead | 4.27x | 2.625x | 3.25x | **3.6x** | **2.53x** |
| Throughput | 149 MB/s | 320 MB/s | 1366 MB/s | 1271 MB/s | 1641 MB/s |

**Note on entry sizes:** Each scheme uses its "native" (most preferred) entry size. Direct comparison requires care — OnionPIRv2 n=4096 uses 22.5 KB entries vs 8 KB for Spiral/KsPIR.&#8201;[^24]

[^24]: §4.3, p.12: "We use each scheme's 'native' (most preferred) entry size, which is why the database size in each experiment matches roughly but not exactly."

<a id="server-computation"></a>

### Server Computation Breakdown <a href="#toc">⤴</a>

The server performs three tasks per query:&#8201;[^25]

1. **Query unpacking** — logarithmic in DB size, insensitive to N. Uses ExpandBFV + ExternalProduct.
2. **Initial dimension dot product** — dominates computation. Reinterpreted as n integer matrix multiplications of size (N/N_0) x N_0 times N_0 x 2. Achieves ~50% of peak memory bandwidth (~12 GB/s on test machine).&#8201;[^26]
3. **Subsequent dimension multiplexing** — d-1 external products. Logarithmic in N.

[^25]: §4.4, p.13: "For both variants of OnionPIRv2, the server mainly performs three tasks: (i) query unpacking, (ii) the initial-dimension dot products between the query vector and the database, and (iii) the multiplexer in the remaining dimensions."
[^26]: §4.4, p.13: "This slightly non-standard integer matrix multiplication achieves roughly 50% of peak memory bandwidth, which is roughly 12 GB/s in our machine."

<a id="initial-dim-throughput"></a>

#### Initial dimension throughput analysis <a href="#toc">⤴</a>

| Setting | log q | Initial dim throughput | Overall throughput | Bottleneck |
|---------|-------|----------------------|-------------------|------------|
| n=2048 | 60 | ~1.6 GB/s | 1109–1271 MB/s | Initial dim + overhead from 64→128 bit integer multiply |
| n=4096 | 120 | ~2.3 GB/s | 1098–1641 MB/s | RNS ↔ standard integer conversion for external products&#8201;[^27] |

[^27]: §4.4, p.13: "The remaining dimensions are slower for the 120-bit modulus q because the Residue Number System (RNS) is employed... non-linear operations, such as NTT and gadget decomposition in external products, require transformation from RNS back to the standard integer representation."

<a id="comparison"></a>

### Comparison with Prior Work <a href="#toc">⤴</a>

| Metric | OnionPIRv2 (n=2048) | OnionPIRv2 (n=4096) | OnionPIRv1 | Spiral | KsPIR |
|--------|---------------------|---------------------|-----------|--------|-------|
| Response overhead | 3.6x | **2.53x** | 4.27x | 2.56x | 3.25x |
| Throughput (~1 GB) | 1109 MB/s | 1098 MB/s | 122 MB/s | 247 MB/s | **1251 MB/s** |
| Throughput (~8 GB) | 1271 MB/s | **1641 MB/s** | 149 MB/s | 320 MB/s | 1366 MB/s |
| Request size | 16 KB | 64 KB | 64 KB | **14 KB** | 140 KB |
| Server storage (per-client) | **0.63 MB** | 2.9 MB | 6.3 MB | 15–17 MB | 9–9.3 MB |

**Speedup over OnionPIRv1:**
- Response overhead: 4.27x → 2.53x (41% reduction with n=4096 setting)
- Throughput: 149 MB/s → 1641 MB/s (11x improvement at 8 GB DB)
- Server storage: 6.3 MB → 0.63 MB (10x reduction with n=2048 setting)

**Key takeaway:** OnionPIRv2 is the best all-around single-server PIR protocol: it achieves competitive response overhead (2.53x, matching Spiral), the highest throughput at large databases (1641 MB/s at 8 GB, beating KsPIR), the smallest per-client server storage (0.63 MB), and reasonable request sizes (16–64 KB). The n=4096 variant is best for large entries (>4 KB) and large databases; the n=2048 variant is best for smaller entries with acceptable 3.6x overhead.

<a id="portable-optimizations"></a>

### Portable Optimizations <a href="#toc">⤴</a>

1. **NTT-domain database storage + matrix multiplication reinterpretation** — applicable to any RLWE-based PIR where the dominant cost is plaintext-ciphertext polynomial multiplication in an initial dimension. Transforms the computation into cache-friendly integer matrix multiplication that can approach memory bandwidth limits.
2. **Tree trimming in query expansion** — applicable to any PIR scheme using binary-tree ciphertext expansion (SealPIR, Spiral family). Saves computation when the number of needed ciphertexts is not a power of 2.
3. **Pseudorandom components in RGSW key materials** — applicable to any scheme that stores RGSW encryptions of client secrets on the server. Halves per-client storage.
4. **Separate RGSW parameters for unpacking vs selection** — applicable to any scheme that uses RGSW for both query unpacking and dimension selection.

<a id="implementation-notes"></a>

### Implementation Notes <a href="#toc">⤴</a>

- **Language / Library:** C++ atop Microsoft SEAL Homomorphic Encryption Library version 4.1&#8201;[^28]
- **Polynomial arithmetic:** NTT-based (SEAL uses Intel HEXL for AVX-512 accelerated NTT)&#8201;[^29]
- **CRT decomposition:** Used internally by SEAL for large moduli. RNS representation for 120-bit modulus (n=4096 setting). RNS ↔ standard integer conversion is a bottleneck for external products.&#8201;[^30]
- **SIMD / vectorization:** AVX2 + AVX-512 (via Intel HEXL integrated into SEAL 4.1)
- **Parallelism:** Single-threaded benchmarks
- **Custom implementations:** RGSW encryption and external products implemented on top of SEAL (SEAL only provides BFV natively)
- **Open source:** https://github.com/chenyue42/OnionPIRv2

[^28]: §4.2, p.11: "We implemented OnionPIRv2 atop the SEAL Homomorphic Encryption Library version 4.1."
[^29]: §4.2, p.11: "In 2021, Intel released the HEXL library [5] for accelerating common computations used in homomorphic encryption schemes, including faster NTT using AVX512 instructions."
[^30]: §4.4, p.13: "Non-linear operations, such as NTT and gadget decomposition in external products, require transformation from RNS back to the standard integer representation."

<a id="tradeoffs"></a>

### Key Tradeoffs & Limitations <a href="#toc">⤴</a>

- **Entry size sensitivity:** Response overhead is fixed (determined by q'/t), so it is optimal for entries at or above the native size (3.75 KB or 22.5 KB). For smaller entries, overhead is worse.&#8201;[^31]
- **Two parameter regimes with different tradeoffs:** n=2048 gives smaller request/key material but 3.6x response overhead; n=4096 gives better 2.53x overhead but 4x larger requests and keys.
- **Per-client key storage required:** 0.63–2.9 MB server storage per client (much smaller than Spiral's 15–17 MB, but still non-zero). Can alternatively be sent per-query at the cost of request size.&#8201;[^32]
- **Initial dimension is memory-bandwidth limited:** Current implementation achieves ~50% of peak bandwidth. The 64-bit source / 128-bit destination integer multiply (for delayed modular reduction) prevents reaching full bandwidth.&#8201;[^33]
- **RNS inefficiency for external products:** The n=4096/120-bit setting suffers from expensive RNS ↔ integer conversions in external products, creating a gap between initial-dimension throughput and overall throughput.&#8201;[^34]
- **Security at 113 bits:** Slightly above the standard 128-bit threshold but below it. Comparable to other PIR work but noted for precision.

[^31]: Table 2: Response size is fixed at 13.5 KB (n=2048) or 57 KB (n=4096) regardless of entry size.
[^32]: §4.4, p.12: "This can be stored on the server. Alternatively, it can be sent as part of the request if a system prefers to avoid per-client extra server storage."
[^33]: §4.4, p.13: "First, to use delayed modular reduction, we must use integer multiplications with 64-bit source operands but 128-bit destination operands to avoid integer overflow."
[^34]: §4.4, p.13: "This is why the overall throughput of OnionPIRv2 is close to the throughput of the initial dimension when q is 60-bit, but there is a noticeable gap when q is 120-bit."

<a id="open-problems"></a>

### Open Problems (stated by authors) <a href="#toc">⤴</a>

- **Reaching memory bandwidth limit:** The initial-dimension matrix multiplication achieves ~50% of peak bandwidth. Closing this gap would improve throughput further.&#8201;[^35]
- **Better RNS engineering:** Improving RNS ↔ standard integer conversion for external products would bring overall throughput closer to initial-dimension throughput for the large-modulus setting.&#8201;[^36]
- **Hardware acceleration:** GPU and FPGA could significantly speed up polynomial multiplications (citing HEAX [23]).&#8201;[^37]

[^35]: §5, p.13: "In theory, the performance of matrix multiplication could reach the memory bandwidth limit. Our implementation does not reach that limit."
[^36]: §5, p.13: "Better engineering of RNS may speed up external products in both query unpacking and remaining dimensions."
[^37]: §5, p.13: "Recent works have demonstrated that GPU and FPGA can significantly speed up polynomial multiplications."

<a id="uncertainties"></a>

### Uncertainties <a href="#toc">⤴</a>

- The paper does not provide explicit query unpacking or subsequent-dimension timing breakdowns — only states they are "logarithmic" and "insensitive to the database size." The overall throughput numbers bundle all three phases.
- Entry sizes differ across schemes in Table 2, making direct throughput comparison imprecise. The paper acknowledges this but does not normalize.
- The 113-bit security claim relies on the Albrecht et al. LWE estimator [1] from 2015; newer estimators may yield slightly different security levels.
