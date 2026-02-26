## HintlessPIR — Engineering Notes

<a id="toc"></a>

<table><tr><td>

<sub><nobr>1. <a href="#lineage">Lineage</a></nobr></sub><br>
<sub><nobr>2. <a href="#core-idea"><b>Core Idea</b></a></nobr></sub><br>
<sub><nobr>3. <a href="#variants">Variants</a></nobr></sub><br>
<sub><nobr>4. <a href="#novel-primitives-abstractions">Novel Primitives / Abstractions</a></nobr></sub><br>
<sub><nobr>5. <a href="#cryptographic-foundation">Cryptographic Foundation</a></nobr></sub><br>
<sub><nobr>6. <a href="#key-data-structures"><b>Key Data Structures</b></a></nobr></sub><br>
<sub><nobr>7. <a href="#database-encoding">Database Encoding</a></nobr></sub><br>
<sub><nobr>8. <a href="#protocol-phases"><b>Protocol Phases</b></a></nobr></sub><br>
<sub><nobr>9. <a href="#communication-breakdown">Communication Breakdown</a></nobr></sub><br>
<sub><nobr>10. <a href="#correctness-analysis">Correctness Analysis</a></nobr></sub><br>
<sub><nobr>11. <a href="#complexity"><b>Complexity</b></a></nobr></sub>

</td><td>

<sub><nobr>12. <a href="#performance-benchmarks"><b>Performance Benchmarks</b></a></nobr></sub><br>
<sub><nobr>13. <a href="#application-scenarios">Application Scenarios</a></nobr></sub><br>
<sub><nobr>14. <a href="#deployment-considerations">Deployment Considerations</a></nobr></sub><br>
<sub><nobr>15. <a href="#key-tradeoffs-limitations"><b>Key Tradeoffs & Limitations</b></a></nobr></sub><br>
<sub><nobr>16. <a href="#comparison-with-prior-work">Comparison with Prior Work</a></nobr></sub><br>
<sub><nobr>17. <a href="#portable-optimizations"><b>Portable Optimizations</b></a></nobr></sub><br>
<sub><nobr>18. <a href="#implementation-notes"><b>Implementation Notes</b></a></nobr></sub><br>
<sub><nobr>19. <a href="#open-problems">Open Problems</a></nobr></sub><br>
<sub><nobr>20. <a href="#related-papers-in-collection">Related Papers in Collection</a></nobr></sub><br>
<sub><nobr>21. <a href="#uncertainties">Uncertainties</a></nobr></sub>

</td></tr></table>

| Field | Value |
|-------|-------|
| **Paper** | [Hintless Single-Server Private Information Retrieval](https://eprint.iacr.org/2023/1733) (2023) |
| **Archetype** | Construction + Building-block (LinPIR / composable preprocessing are novel primitives) |
| **PIR Category** | Group B — Stateless Single-Server (sub-model: Hintless — no offline communication) |
| **Security model** | Semi-honest single-server CPIR |
| **Additional assumptions** | Circular security of RLWE (required for seed reuse across queries); Random Oracle Model (for public randomness expansion from seed) |
| **Correctness model** | Probabilistic (correctness error at most delta, configurable; see Lemma 19) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Small to Moderate (8 B to 32 KB benchmarked; supports larger via column stacking) |

<a id="lineage"></a>

### Lineage <a href="#toc">⤴</a>

| Field | Value |
|-------|--------|
| **Builds on** | SimplePIR / DoublePIR [Group C] (LWE-based PIR with client-independent hints); Spiral [Group A] (RLWE-based composition with Regev+GSW ciphertexts); Halevi-Shoup matrix-vector multiplication algorithm [31] |
| **What changed** | SimplePIR requires clients to download a large database-dependent hint (H = DB * A). HintlessPIR eliminates this hint by having the server homomorphically compute H * s via a new LinPIR sub-protocol (NTTlessPIR), using RLWE-based composable preprocessing to make the homomorphic computation efficient. This removes all offline client-server communication while maintaining throughput close to SimplePIR.&#8201;[^1] |
| **Superseded by** | YPIR [Group B] (2024, eliminates offline communication via CDKS ring packing and GPU acceleration); later Group B schemes (WhisPIR, InsPIRe, VIA) build on similar stateless paradigms |
| **Concurrent work** | Tiptoe PIR [33] — concurrent independent work that similarly removes the SimplePIR hint using RLWE, but with O(sqrt(m) + n^2) online communication (roughly two orders of magnitude larger than HintlessPIR for large databases)&#8201;[^2] |

[^1]: Abstract (p.1): "Our first construction (HintlessPIR) eliminates the client preprocessing step from the recent LWE-based SimplePIR... by outsourcing the 'hint' related computation to the server, leveraging a new concept of homomorphic encryption with composable preprocessing."
[^2]: Section 1, Technical Contributions (p.9): "Note that while Tiptoe PIR is similarly 'hintless', its per-query communication is asymptotically worse (O(sqrt(m) + n^2) compared to O(sqrt(m) + n)), yielding concretely worse per-query bandwidth (by two orders of magnitude) than HintlessPIR, while also being slower by constant factors."

<a id="core-idea"></a>

### Core Idea <a href="#toc">⤴</a>

HintlessPIR eliminates the database-dependent client hint from SimplePIR by replacing the local client computation c_0 = H * s (which requires the hint H = DB * A) with a secure server-side computation via a new Linear PIR (LinPIR) sub-protocol called NTTlessPIR.&#8201;[^3] The key technical innovation is *homomorphic encryption with composable preprocessing*: RLWE-based ciphertexts consist of a public-randomness part alpha(ct) (depending only on the random seed) and a secret-dependent part beta(ct). Since alpha is known in advance, the server can preprocess the expensive parts of all homomorphic operations (gadget products, key-switching, rotations) offline, leaving only cheap linear operations online.&#8201;[^4] This yields an O(log n) asymptotic speedup in the homomorphic computation. Combined with CRT decomposition to handle arbitrary moduli and RLWE slot packing, the scheme achieves throughput up to 60% of SimplePIR while requiring no offline communication, no client-side database-dependent state, and no server-side client-dependent state.&#8201;[^5]

[^3]: Section 1, "HintlessPIR" (p.5): "The starting point for our first construction is the SimplePIR construction. This arranges the database as a square matrix... One can therefore encrypt the selection vector u_i, and homomorphically multiply by the database to obtain a PIR scheme."
[^4]: Section 3 (p.18): "The main idea is that RLWE-based ciphertexts consists of two parts (a, b) where a is some public randomness that does not depend on the encrypted message, and is often available in advance... the public randomness of the ciphertexts output by homomorphic operations often depends only on the public randomness of the input."
[^5]: Section 8, Conclusion (p.31): "we were able to achieve concretely fast server processing time in our first construction, HintlessPIR, namely up to 60% of the throughput of Simple PIR, and up to 9.4x higher throughput than Spiral PIR."

<a id="variants"></a>

### Variants <a href="#toc">⤴</a>

| Variant | Key Difference | Offline Comm | Online Comm (asymptotic) | Best For |
|---------|---------------|-------------|--------------------------|----------|
| **HintlessPIR** | LWEPIR + NTTlessPIR composition; sqrt(m) bandwidth | O(1) (none) | O(sqrt(m) + n) | Most practical databases up to ~1 TB |
| **TensorPIR** | 3D database; tensor product of two selection vectors | O(1) (none) | O(m^{1/3} + n) | Extremely large databases (>= 1 TB) |

<a id="novel-primitives-abstractions"></a>

### Novel Primitives / Abstractions <a href="#toc">⤴</a>

#### LinPIR (Linear PIR)

| Field | Detail |
|-------|--------|
| **Name** | Linear PIR (LinPIR) |
| **Type** | Cryptographic primitive / PIR generalization |
| **Interface / Operations** | S.setup(DB) -> (hint_C, hint_S); C.query(a, C_hint) -> (qu, C_state); S.response(qu, S_hint) -> rsp; C.recover(C_state, rsp) -> sum_i a_i * DB_i mod p&#8201;[^6] |
| **Security definition** | For all (i, j) in [m]^2, distributions of query(i) and query(j) are computationally indistinguishable (Definition 7, p.16)&#8201;[^7] |
| **Correctness definition** | (1 - delta)-correct: Pr[C.recover != sum_i a_i * DB_i] <= delta for any database and any linear query a (Definition 6, p.16)&#8201;[^8] |
| **Purpose** | Generalization of standard PIR where a client queries an arbitrary linear combination of records (not just a single record). Standard PIR is LinPIR where a = basis vector. Used to securely compute H * s without transmitting H. |
| **Built from** | RLWE-based linearly homomorphic encryption with composable preprocessing |
| **Standalone complexity** | NTTlessPIR: Server preprocessing O(k * ell * n * n_cols * log n); Server response time kn_cols(n_rows + n + (ell+2)n); Client upload kn + ell*n; Client download 2k * ceil(n_rows/n) * n (Lemma 6, p.23)&#8201;[^9] |
| **Relationship to prior primitives** | Strictly generalizes standard PIR. LWEPIR (the SimplePIR/FrodoPIR family) is a special case. Tiptoe PIR's LinPIR scheme uses column-major matrix-vector multiplication; NTTlessPIR uses diagonally-dominant decomposition.&#8201;[^10] |

[^6]: Definition 5 (p.16): "A Single-Server LinPIR Scheme with Preprocessing is a tuple of four algorithms..."
[^7]: Definition 7 (p.16): "A Single-Server LinPIR scheme with Preprocessing is said to be secure if for all (i, j) in [m]^2, the distributions of query(i) and query(j) are computationally indistinguishable."
[^8]: Definition 6 (p.16): "A Single-Server LinPIR scheme with Preprocessing Scheme is said to be (1 - delta)-correct if for any database DB..."
[^9]: Lemma 6 (p.23): Complexity analysis of NTTlessPIR.
[^10]: Section 2.5, "Tiptoe PIR" (p.17): "The main difference between this LinPIR scheme and the scheme we develop in Section 4 (NTTlessPIR) is that Tiptoe PIR utilizes the column-major (rather than diagonally-dominant) matrix-vector multiplication algorithm."

#### Composable Preprocessing (alpha/beta Decomposition)

| Field | Detail |
|-------|--------|
| **Name** | Homomorphic Encryption with Composable Preprocessing |
| **Type** | Optimization paradigm / cryptographic technique |
| **Interface / Operations** | For any HE operation F: Preproc_F(alpha(ek), alpha(ct)) -> g; Apply_F(g, ek, ct) -> result; Apply^alpha_F(g) -> alpha(result) (Equations 2-3, p.18)&#8201;[^11] |
| **Security definition** | Inherited from underlying RLWE security |
| **Correctness definition** | Apply_F produces the same output as Eval_F (the standard homomorphic evaluation) |
| **Purpose** | Decomposes any preprocessable HE operation into an expensive offline part (Preproc, depending only on public randomness alpha) and a cheap online part (Apply, linear operations). The key property is *composability*: alpha of the output depends only on g, enabling cascaded preprocessing across complex circuits.&#8201;[^12] |
| **Built from** | Structural property of RLWE ciphertexts: ct = (a, b) where a = alpha(ct) is public randomness, b = beta(ct) is secret-dependent |
| **Standalone complexity** | Preproc_diamond: O(ell * n * log n) Z_q ops, output size (ell+1)n; Apply_diamond: (ell+1)n Z_q ops (Lemma 2, p.20). Preproc_ks: O(ell * n * log n); Apply_ks: (ell+2)n (Lemma 3, p.20). Preproc_rot^oR: O(ell * n * R * log n); Apply_rot^oR: (R-1)(ell+2)n (Lemma 4, p.21).&#8201;[^13] |
| **Relationship to prior primitives** | Analogous to SimplePIR's hint precomputation (server precomputes DB * A), but generalized to the RLWE setting and applicable to arbitrary composable circuits of HE operations, not just matrix-vector multiplication.&#8201;[^14] |

[^11]: Section 3 (p.18): "Eval_F(ek, ct) = Apply_F(Preproc_F(alpha(ek), alpha(ct)), ek, ct)" and "alpha(Apply_F(g, ek, ct)) = Apply^alpha_F(g)."
[^12]: Section 3, Equation 3 (p.18): "the public randomness component of the output... depends only on the result of the preprocessing g, and in particular, it can be computed in advance."
[^13]: Lemmas 2, 3, 4 (pp.20-21): Preprocessing complexities for diamond-product, key-switching, and batched rotations respectively.
[^14]: Section 1, "Homomorphic Encryption with Composable Preprocessing" (p.7): "The high-level idea behind homomorphic encryption with composable preprocessing is similar to SimplePIR, albeit in the setting of RLWE-based encryption, and for a wider class of computations."

<a id="cryptographic-foundation"></a>

### Cryptographic Foundation <a href="#toc">⤴</a>

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Decision LWE (for LWEPIR component) and Decision RLWE (for NTTlessPIR component)&#8201;[^15] |
| **Encryption/encoding scheme(s)** | LWE encryption: Enc_s(m; seed) where A := RO(seed), b := A * s + e + Delta * m (Definition 1, p.14); RLWE encryption: Enc_v(m) = [a, a * v + e + Delta * m] (Definition 2, p.14)&#8201;[^16] |
| **Ring / Field** | Z[X]/(X^n + 1) with n = 2^12 = 4096 (RLWE ring dimension); ciphertext modulus q approx 2^90 (product of NTT-friendly primes); plaintext moduli p_0, p_1 of 22 bits each for CRT decomposition&#8201;[^17] |
| **Key structure** | LWE secret s sampled from chi_sigma^N (ternary distribution) with N = 1408; RLWE secret v sampled from chi_sigma^n. Fresh RLWE key v per query. A expanded from short seed via random oracle.&#8201;[^18] |
| **Correctness condition** | Three conditions must simultaneously hold (Lemma 19, p.46): (1) Q > sqrt(n_cols) * p^2 * sigma * sqrt(ln(1 + n_rows/(delta/3))); (2) q > sqrt(ln(1 + k(n_rows+n)/(delta/3))) * max_j sqrt(ell * N) * n * sigma * gamma * p_j^2; (3) product_j p_j > Q * sigma * sqrt(N) * sqrt(ln(1 + kn * ceil(n_rows/n) / (delta/3)))&#8201;[^19] |

[^15]: Lemma 18, Appendix F (p.46): "Let (N, Q, sigma) be such that LWE is hard. Let (n, q, sigma) be such that RLWE is hard, and moreover assume that RLWE is circular secure. Then HintlessPIR is a secure PIR with preprocessing scheme."
[^16]: Definitions 1-2 (p.14): LWE and RLWE encryption definitions with seed-based public randomness.
[^17]: Section 7.1 (pp.26-27): "We set N = 1408, ciphertext modulus Q = 2^32... We set our RLWE parameters as n = 2^12, ciphertext modulus q approx 2^90, and error standard deviation 3.2... we choose two NTT-friendly plaintext moduli p_0, p_1 of 22 bits each for CRT decomposing H and s."
[^18]: Section 7.1 (pp.26-27): "sample the LWE secret key from the uniform ternary distribution."
[^19]: Lemma 19, Appendix F (p.46): Correctness conditions for HintlessPIR combining LWEPIR, NTTlessPIR decryption, and CRT interpolation failure probabilities.

<a id="key-data-structures"></a>

### Key Data Structures <a href="#toc">⤴</a>

- **Database as matrix:** DB in Z_p^{sqrt(m) x sqrt(m)} where m is the number of records. For records larger than one Z_p element, each record uses d > 1 LWE plaintext elements stacked vertically in a column of DB.&#8201;[^20]
- **Hint matrix H:** H := DB * A in Z_Q^{sqrt(m) x N} — this is the SimplePIR hint. In HintlessPIR, H is never transmitted to the client; instead, H * s is computed homomorphically via NTTlessPIR.
- **Preprocessed data g_j:** Server stores Preproc_{A_i}_i output for each CRT modulus p_j: size kn * n_cols * (ell + 1) elements of Z_q per modulus. This is computed once and reused across all queries.&#8201;[^21]
- **RLWE ciphertexts (query):** Two compressed RLWE ciphertexts (encoding s mod p_j) plus a compressed rotation key, totaling approximately 323 KB.&#8201;[^22]

[^20]: Section 7.2 (p.27): "For large database records, we follow the suggestion in [34] to encode each record using d > 1 LWE plaintext elements and vertically stack them in a column of the database matrix DB."
[^21]: Lemma 7 (p.24): "Server Long-term Storage: knN(ell + 1) elements of Z_q and sqrt(m) * N elements of Z_Q."
[^22]: Section 7.2 (p.27): "a NTTlessPIR query is 323KB (which includes two compressed ciphertexts and a compressed rotation key)."

<a id="database-encoding"></a>

### Database Encoding <a href="#toc">⤴</a>

- **Representation:** sqrt(m) x sqrt(m) matrix over Z_p, following SimplePIR's approach. For NTTlessPIR, the hint matrix H = DB * A is viewed as a database in Z_Q^{sqrt(m) x N} with n_cols = N <= n columns.
- **Record addressing:** Linear index i decomposed as (i_0, i_1) = (i mod d_u, i / d_u) where d_u = sqrt(m). Client queries column i_1 of DB via LWEPIR and retrieves row i_0 of the result.
- **Preprocessing required:** Server computes DB * A (one-time, client-independent) and Preproc for NTTlessPIR (one-time per seed). Both are reusable across all queries.
- **Record size equation:** Each record maps to d = ceil(record_bits / log_2(p)) elements in Z_p. The LWE plaintext space is approximately 8-10 bits for databases up to 2^38 records.&#8201;[^23]

[^23]: Section 7.2 (p.27): "The LWE plaintext space is about 8 to 10 bits for databases up to 2^38 records."

<a id="protocol-phases"></a>

### Protocol Phases <a href="#toc">⤴</a>

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Server Setup** | Server | Compute H = DB * A; run NTTlessPIR.setup(H) to get preprocessed data g_j for each CRT modulus p_j; set LWEPIR hint to (0, seed) | -- | Once per DB / per seed reseed |
| **Query (LWEPIR)** | Client | Decompose index i into (i_0, i_1); compute LWEPIR query: Enc_s(u_{i_0}; seed) | sqrt(m) elements of Z_Q upward | Per query |
| **Query (NTTlessPIR)** | Client | Sample fresh RLWE key v; compute Enc_v(encode(s mod p_j)) for each CRT modulus p_j, plus rotation key | (k + ell)n elements of Z_q + sqrt(m) elements of Z_Q upward | Per query |
| **Response (LWEPIR)** | Server | Compute DB * query (matrix-vector product) | sqrt(m) elements of Z_Q downward | Per query |
| **Response (NTTlessPIR)** | Server | For each p_j, compute Apply_{A_i}(g_j, rotated ciphertexts, hat{b}_j) | 2k(sqrt(m) + n) elements of Z_q downward | Per query |
| **Recover** | Client | Decrypt NTTlessPIR response to get c_0 = H * s; then compute LWEPIR recovery: round((rsp, v_{i_1}) - c_0) / Delta | -- | Per query |

<a id="communication-breakdown"></a>

### Communication Breakdown <a href="#toc">⤴</a>

| Component | Direction | Size (concrete, 8 GB DB) | Reusable? | Notes |
|-----------|-----------|-------------------------|-----------|-------|
| LWEPIR query | upward | ~130 KB | No | sqrt(m) elements of Z_Q |
| NTTlessPIR query (RLWE ciphertexts + rotation key) | upward | ~323 KB | No | k=2 CRT ciphertexts + compressed rotation key |
| **Total query** | upward | **~453 KB** | No | Per query |
| LWEPIR response | downward | ~130 KB | No | sqrt(m) elements of Z_Q |
| NTTlessPIR response | downward | ~2950 KB | No | 2k * ceil(n_rows/n) * n elements of Z_q |
| **Total response** | downward | **~3080 KB** | No | Per query |

<a id="correctness-analysis"></a>

### Correctness Analysis <a href="#toc">⤴</a>

#### Option A: FHE Noise Analysis

The noise analysis uses sub-Gaussian and sub-Exponential parameter tracking under an independence heuristic.&#8201;[^24]

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| LWEPIR response | psi_2-norm at most sqrt(n_cols) * p * sigma | additive | Error in DB * (A * s + e) = DB * e (Lemma 16, p.42) |
| NTTlessPIR: rotation key generation | psi_2-norm at most sqrt(ell) * gamma * sigma^2 * n per key | multiplicative (via diamond-products) | From single ksk to n/2 rotation keys (Lemma 14, p.40) |
| NTTlessPIR: rotations of ciphertext | psi_2-norm at most sqrt(ell * n_cols) * n * sigma * gamma | cumulative from n_cols rotations | Each rotation adds sqrt(ell) * n * sigma * gamma noise (p.43) |
| NTTlessPIR: matrix-vector multiply | psi_2-norm at most max_j sqrt(ell * n_cols) * n * sigma * gamma * p_j | multiplicative (plaintext * rotated ct) | Under independence heuristic; error = sqrt(ell * n_cols) * n * sigma * gamma * max_j p_j (Lemma 17, p.43) |
| CRT interpolation | n/a — deterministic given correct NTTlessPIR decryption | -- | Requires product_j p_j > n_cols * norm(DB)_inf * norm(m)_inf |

- **Correctness condition:** Three conditions simultaneously (Lemma 19, p.46): LWEPIR decryption, NTTlessPIR decryption, and CRT interpolation must each succeed with probability at least 1 - delta/3.
- **Independence heuristic used?** Yes. The paper assumes intermediate values in homomorphic computations are independent, then validates empirically in Section 7.&#8201;[^25]
- **Dominant noise source:** NTTlessPIR matrix-vector multiplication (the sum of n_cols plaintext-ciphertext products after rotation).

[^24]: Appendix A (p.37-38): "We will use the independence heuristic, or the heuristic assumption that intermediate values within homomorphic computations are independent, and therefore one may apply pythagorean additivity in all situations."
[^25]: Appendix A (p.38): "the noise bounds we derive will be heuristic -- we will validate them against our implementation in Section 7."

<a id="complexity"></a>

### Complexity <a href="#toc">⤴</a>

#### Core metrics

| Metric | Asymptotic | Concrete (2^30 x 1B = 1.07 GB) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(sqrt(m) + n) | 453 KB | Online |
| Response size | O(sqrt(m) + n) | 3080 KB | Online |
| Server computation | nm + O_tilde(sqrt(m) * n) | 613 ms (single-thread) | Online |
| Client computation | -- | 51.00 ms | Online (recovery) |
| Throughput | -- | 1750 MB/s (single-thread) | Online |
| Response overhead | O(1) constant factor > SimplePIR | ~33x (current impl); ~9x with optimizations&#8201;[^26] | -- |

[^26]: Section 1, footnote 10 (p.9): "In our current implementation, this constant factor is somewhat large -- approx 33x larger. We discuss several optimizations that would reduce this to approx 9x larger in Appendix E.1."

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (2^30 x 1B = 1.07 GB) | Phase |
|--------|-----------|-------------------------------|-------|
| Server preprocessing | nm + O_tilde(sqrt(m) * n) | 199.15 s | Offline (one-time per seed) |
| Server long-term storage | knN(ell + 1) + sqrt(m) * N elements | ~proportional to DB size | Persistent |
| Client hint download | O(1) | 0 | N/A (hintless) |
| Client persistent storage | 0 | 0 | -- |

#### FHE-specific metrics

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|---------|-------|
| Multiplicative depth | 0 (linear operations only) | 0 | -- |
| CRT moduli count k | O(1) | 2 (two 22-bit NTT-friendly primes) | -- |
| Gadget size ell | ceil(log_z(q)) | ~3 (for q approx 2^90 with z-base decomposition)&#8201;[^27] | -- |

[^27]: Section 7.1 (p.27): RLWE parameters n = 2^12, q approx 2^90, implying ell = ceil(90/30) = 3 with 30-bit gadget decomposition base.

<a id="performance-benchmarks"></a>

### Performance Benchmarks <a href="#toc">⤴</a>

**Hardware:** AWS r7iz.4xlarge, Intel Sapphire Rapids CPUs at 3.00 GHz, 128 GB RAM, single-threaded (except Table 3). Compiled with clang 16, AVX-512.&#8201;[^28]

[^28]: Section 7.2 (p.27): "We ran our server program on an AWS r7iz.4xlarge instance with Intel Sapphire Rapids CPUs running at 3.00GHz and with 128GB RAM. We took advantage of the SIMD instruction sets such as AVX-512, and compiled our test program using clang 16."

#### Table 1: Communication costs (exact, from Table 1 p.28)

| Database | 2^20 x 8B (8 MB) | 2^20 x 256B (268 MB) | 2^26 x 8B (537 MB) | 2^30 x 1B (1.07 GB) | 2^18 x 32KB (8.59 GB) |
|----------|-------------------|----------------------|---------------------|----------------------|-----------------------|
| HintlessPIR Query | 334 KB | 388 KB | 415 KB | 453 KB | 1502 KB |
| HintlessPIR Response | 288 KB | 1540 KB | 2212 KB | 3080 KB | 3080 KB |
| SimplePIR Hint | 16 MB | 92 MB | 131 MB | 185 MB | 185 MB |
| SimplePIR Query | 12 KB | 66 KB | 93 KB | 131 KB | 1180 KB |
| SimplePIR Response | 12 KB | 66 KB | 93 KB | 131 KB | 117 KB |
| Spiral Params | 8 MB | 8 MB | 9 MB | 9 MB | 10 MB |
| Spiral Query | 16 KB | 16 KB | 16 KB | 16 KB | 16 KB |
| Spiral Response | 21 KB | 21 KB | 21 KB | 21 KB | 61 KB |

#### Table 2: Computation costs (exact, from Table 2 p.29)

| Database | 2^20 x 8B (8 MB) | 2^20 x 256B (268 MB) | 2^26 x 8B (537 MB) | 2^30 x 1B (1.07 GB) | 2^18 x 32KB (8.59 GB) |
|----------|-------------------|----------------------|---------------------|----------------------|-----------------------|
| **HintlessPIR** | | | | | |
| Server Online Time | 233 ms | 385 ms | 478 ms | 613 ms | 1347 ms |
| Server Throughput | 35 MB/s | 698 MB/s | 1122 MB/s | 1750 MB/s | 6376 MB/s |
| Server Preproc. Time | 3.11 s | 51.57 s | 93.58 s | 199.15 s | 2128 s |
| Client Recovery Time | 4.78 ms | 25.50 ms | 36.66 ms | 51.00 ms | 52.32 ms |
| **SimplePIR** | | | | | |
| Server Online Time | 0.75 ms | 28 ms | 53 ms | 105 ms | 841 ms |
| Server Throughput | 11201 MB/s | 9675 MB/s | 10046 MB/s | 10268 MB/s | 10213 MB/s |
| Server Preproc. Time | 0.96 s | 45.39 s | 85.24 s | 188.03 s | 2116 s |
| **Spiral** | | | | | |
| Server Online Time | 691 ms | 694 ms | 1229 ms | 2319 ms | 12769 ms |
| Server Throughput | 12 MB/s | 387 MB/s | 436 MB/s | 463 MB/s | 673 MB/s |
| Client Param Gen Time | 139 ms | 193 ms | 326 ms | 326 ms | 326 ms |

#### Table 3: Multi-threaded results (exact, from Table 3 p.30)

| Database | 2^20 x 8B (8 MB) | 2^20 x 256B (268 MB) | 2^26 x 8B (537 MB) | 2^30 x 1B (1.07 GB) | 2^18 x 32KB (8.59 GB) |
|----------|-------------------|----------------------|---------------------|----------------------|-----------------------|
| HintlessPIR (4 threads) Online | 115 ms | 162 ms | 193 ms | 232 ms | 418 ms |
| HintlessPIR (4 threads) Throughput | 0.07 GB/s | 1.66 GB/s | 2.78 GB/s | 4.62 GB/s | 20.53 GB/s |
| SimplePIR (4 threads) Online | 0.30 ms | 7 ms | 14 ms | 27 ms | 213 ms |
| SimplePIR (4 threads) Throughput | 28.15 GB/s | 38.78 GB/s | 39.22 GB/s | 40.36 GB/s | 40.42 GB/s |

<a id="application-scenarios"></a>

### Application Scenarios <a href="#toc">⤴</a>

- **Few-query clients:** HintlessPIR is designed for settings where clients make only a few queries before the database updates, making hint amortization impractical. For a single initial query, HintlessPIR has lower total communication than SimplePIR (which must transmit its hint) and lower latency than Spiral (which must transmit evaluation keys).&#8201;[^29]
- **Anonymous queries:** The absence of client-dependent server state means the server cannot link queries to clients, enabling anonymous access patterns.&#8201;[^30]
- **Dynamic databases:** No client hints to invalidate when the database changes; only the server-side preprocessing must be updated.&#8201;[^31]

[^29]: Section 7.2 (p.28-29): "One of the advantages of HintlessPIR is the absence of offline interaction between the client and the server, which makes it very appealing for situations where the client only makes a few queries before the database is updated."
[^30]: Section 1, "The problem with preprocessing" (p.4): "if the server requires client-dependent state, the server must have knowledge of this information for correct protocol execution... does not provide anonymity regarding which client is querying the database at which time."
[^31]: Section 1, "The problem with preprocessing" (p.3): "When the database is updated, all hints need to be recomputed to maintain correctness across all clients."

<a id="deployment-considerations"></a>

### Deployment Considerations <a href="#toc">⤴</a>

- **Database updates:** Server must rerun preprocessing (DB * A and Preproc) when DB changes. Preprocessing cost is comparable to SimplePIR's hint generation (~199 s for 1 GB).&#8201;[^32]
- **Seed reseeding:** Server must periodically reseed (regenerate the random oracle seed) every kappa = omega(log n) queries for security. This is amortized: T_amortize = T_preprocess/kappa + T_response = (1 + o(1)) * T_response.&#8201;[^33]
- **Anonymous query support:** Yes (stateless, no client-dependent server state).
- **Session model:** Ephemeral client — no persistent state required between queries.
- **Cold start suitability:** Excellent — no offline communication required; a new client can immediately issue a query.
- **Amortization crossover vs SimplePIR:** HintlessPIR has lower total communication until SimplePIR amortizes its hint over approximately 50-100 queries. Bandwidth advantage over Spiral holds for the first 3-5 queries.&#8201;[^34]

[^32]: Table 2 (p.29): Server preprocessing time for HintlessPIR at 1.07 GB is 199.15 s vs SimplePIR's 188.03 s.
[^33]: Appendix E, after Lemma 11 (p.42): "we set kappa minimal such that the amortized cost of preprocessing disappears (asymptotically). For NTTlessPIR, one can check that this is kappa = omega(log n)."
[^34]: Section 1, "Implementation" (p.11): "We find that our protocol has lower bandwidth until one is able to reuse a hint for approx 50 to 100 SimplePIR queries to the same database, and our bandwidth advantage over Spiral holds for the first 3 to 5 queries."

<a id="key-tradeoffs-limitations"></a>

### Key Tradeoffs & Limitations <a href="#toc">⤴</a>

- **Server throughput gap:** HintlessPIR achieves up to 60% of SimplePIR's throughput and up to 9.4x higher than Spiral, but SimplePIR remains ~6x faster per query at large database sizes. The gap narrows as m grows.&#8201;[^35]
- **Response size overhead:** Current implementation produces responses approximately 33x larger than SimplePIR. Unimplemented optimizations (Appendix E.1) could reduce this to approximately 9x.&#8201;[^36]
- **Circular security assumption:** Required for RLWE seed reuse across queries. Standard RLWE does not suffice.&#8201;[^37]
- **Small databases:** For very small databases (8 MB), HintlessPIR is slower than both SimplePIR and trivial download. The overhead of NTTlessPIR preprocessing and homomorphic computation dominates.
- **TensorPIR not practical for typical sizes:** TensorPIR has better asymptotic communication O(m^{1/3} + n) but requires larger RLWE parameters (n >= 2^13, q >= 2^150) due to depth-2 computation, making it only competitive for databases >= 1 TB.&#8201;[^38]

[^35]: Section 8 (p.31): "up to 60% of the throughput of Simple PIR, and up to 9.4x higher throughput than Spiral PIR."
[^36]: Appendix E.1 (pp.43-45): Three optimizations are discussed: packing (implemented, gives constant-factor speedup), reducing response size by half (sending only beta component), and lossily compressing RLWE ciphertexts.
[^37]: Lemma 18, Appendix F (p.46): "moreover assume that RLWE is circular secure."
[^38]: Section 7.3 (p.31): "We estimate that for databases of size 2^40 with 1 byte records that TensorPIR has server running time close to HintlessPIR and with smaller communication cost."

<a id="comparison-with-prior-work"></a>

### Comparison with Prior Work <a href="#toc">⤴</a>

#### Single-query total communication (from Tables 1-2, exact)

| Metric | HintlessPIR | SimplePIR | Tiptoe PIR | Spiral | DoublePIR |
|--------|------------|-----------|------------|--------|-----------|
| Total comm (1st query) | 3533 KB | 185 MB + 262 KB | 23 MB + ~2.7 MB | 9 MB + 37 KB | 874 MB + 750 KB |
| Server online time | 613 ms | 105 ms | 1890 ms | 2319 ms | 113 ms |
| Server throughput | 1750 MB/s | 10268 MB/s | 568 MB/s | 463 MB/s | 9506 MB/s |
| Client recovery | 51.00 ms | -- | 14.67 ms | -- | -- |
| Offline comm required? | No | Yes (hint) | No | Yes (params) | Yes (hint) |
| DB params | 2^30 x 1B (1.07 GB) | same | same | same | same |

**Key takeaway:** HintlessPIR is the optimal choice when clients make few queries (1-50) against a database that may change, and when anonymous access is required. For high-throughput bulk serving with amortization over many queries, SimplePIR remains faster. For minimum per-query communication with amortization, Spiral is better.

<a id="portable-optimizations"></a>

### Portable Optimizations <a href="#toc">⤴</a>

- **Composable preprocessing (alpha/beta decomposition):** Applicable to any RLWE-based protocol that uses gadget products and key-switching. The paper notes this could be applied to the RLWE expansion algorithm of [15] and potentially to other protocols beyond PIR.&#8201;[^39]
- **NTT-precomputation for diamond-products:** Reduces diamond-product online cost from O(n log n) to O(n) Z_q operations by precomputing NTT(g^{-1}(iNTT(a_hat))_i). Applicable to any scheme using gadget-based key-switching.
- **CRT decomposition for arbitrary-modulus LinPIR:** Running LinPIR mod several NTT-friendly primes p_j and using CRT reconstruction lets the scheme handle moduli Q that are not NTT-friendly. Applicable to any RLWE-based scheme that needs to operate over non-NTT moduli.
- **RLWE slot packing for matrix-vector multiplication:** Packing two copies of s in the 4096 RLWE slots reduces the number of rotations from n_cols - 1 to 511 and halves the ciphertext-plaintext multiplications.&#8201;[^40]

[^39]: Section 8, Conclusion (p.32): "It seems very interesting to extend such technique to additional homomorphic operations and constructions."
[^40]: Section 7.1 (p.27): "Our RLWE parameters provide 4096 slots in each plaintext polynomial, so we pack two copies of s in the query ciphertexts... this packing strategy reduces the number of rotations to 511, and reduces the number of ciphertext-plaintext multiplications by half."

<a id="implementation-notes"></a>

### Implementation Notes <a href="#toc">⤴</a>

- **Language / Library:** C++ (custom implementation, not built on SEAL or OpenFHE). Uses RNS variant of BFV for the NTTlessPIR component.&#8201;[^41]
- **Polynomial arithmetic:** NTT-based (all computation in NTT domain after preprocessing).
- **CRT decomposition:** Q = 2^32 (LWE ciphertext modulus); RLWE modulus q = product of NTT-friendly primes totaling ~90 bits; plaintext moduli p_0, p_1 of 22 bits each.
- **SIMD / vectorization:** AVX-512 (Intel Sapphire Rapids).&#8201;[^42]
- **Parallelism:** Single-threaded for main benchmarks; 4-thread results in Table 3. NTTlessPIR's first step (rotations) parallelized to 2 threads (one per plaintext modulus p_j); second step (matrix-vector multiply) parallelized to 4 threads.&#8201;[^43]
- **Open source:** https://github.com/google/hintless_pir&#8201;[^44]

[^41]: Section 7.1 (p.27): "Our NTTlessPIR scheme implementation is based on the Residue Number System (RNS) variant of Brakerski/Fan-Vercauteren (BFV) FHE scheme that supports linear homomorphic operations."
[^42]: Section 7.2 (p.27): "We took advantage of the SIMD instruction sets such as AVX-512."
[^43]: Section 7.2 (p.30): "the first step of NTTlessPIR's online algorithm is distributed to two threads, one per plaintext modulus, and the second step to four threads."
[^44]: Section 7.1, footnote 16 (p.26): "https://github.com/google/hintless_pir"

<a id="open-problems"></a>

### Open Problems <a href="#toc">⤴</a>

- Extending composable preprocessing to the GHS variant of key-switching [25], which the authors note is nontrivial.&#8201;[^45]
- Applying composable preprocessing to other protocols beyond PIR (e.g., FHE-based general computation).
- Reducing the response size overhead from approximately 33x (current) toward the approximately 9x theoretical minimum identified in Appendix E.1.

[^45]: Section 8, Conclusion (p.32): "It seems nontrivial to apply this technique to the GHS variant of key-switching."

<a id="related-papers-in-collection"></a>

### Related Papers in Collection <a href="#toc">⤴</a>

- **SimplePIR / DoublePIR [Group C]:** Direct ancestor. HintlessPIR replaces SimplePIR's hint download with a LinPIR query.
- **Spiral [Group A]:** Comparison point for RLWE-based PIR with compact communication but expensive computation.
- **YPIR [Group B]:** Successor that also eliminates offline communication, using CDKS ring packing and GPU acceleration for higher throughput.
- **FrodoPIR [Group A, functionally Group C]:** Essentially identical to SimplePIR (acknowledged by both papers); also requires database-dependent hint.
- **Tiptoe PIR (concurrent):** Similar goal but with O(N) additional communication overhead in the LinPIR component.

<a id="uncertainties"></a>

### Uncertainties <a href="#toc">⤴</a>

- **Variable "n" overloading:** The paper uses n for the RLWE ring dimension (n = 2^12 = 4096) and N for the LWE secret dimension (N = 1408). These are consistent throughout but differ from some other papers (e.g., SimplePIR uses n for LWE dimension). The asymptotic comparison in Figure 1 uses n for LWE secret dimension and m for database size.
- **Gadget parameters:** The exact gadget quality gamma and gadget size ell are not explicitly stated for the concrete parameter choices. From q approx 2^90, ell is inferred to be approximately 3.
- **Packing details:** The paper mentions packing two diagonals of each 1024 x 2048 block of H but the exact slot layout and its interaction with CRT decomposition could benefit from more explicit specification.
- **Response size constant factor:** The paper reports approximately 33x response overhead vs SimplePIR in the current implementation but projects approximately 9x with optimizations (Appendix E.1). Neither figure directly maps to the asymptotic O(1) constant in Figure 1.
