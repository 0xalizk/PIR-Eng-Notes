# MulPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | Compressible FHE with Applications to PIR |
| **Authors** | Craig Gentry, Shai Halevi |
| **Year** | 2019 |
| **ePrint / Venue** | 2019/733; TCC 2019 |
| **Archetype** | Construction (theory-only) + Building-block |
| **PIR Category** | Group A — FHE-based PIR |
| **Security model** | Semi-honest single-server, computational (RLWE) |
| **Additional assumptions** | Circular security (for full FHE via bootstrapping); none needed for the PIR application which uses leveled evaluation only [^1] |
| **Correctness model** | Deterministic (noise analysis proves decryption succeeds with overwhelming probability under heuristic independence; failure probability < 2^{-277} in Appendix A variant, < 2^{-570} in Section 5 variant) [^2] |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Large (>=100 KB); scheme needs entry size above ~100 KB for amortization to dominate [^3] |
| **PDF** | `Papers/Group A - FHE Based PIR/MulPIR_2019_733.pdf` |

[^1]: The PIR scheme uses a leveled variant of GSW without bootstrapping, hence only RLWE is needed (no circular security). See Section 5, p. 19: secret key chosen from error distribution, ring-LWE over R_Q. Circular security would be needed only for compressible *fully* homomorphic encryption via bootstrapping (Section 4, p. 10).

[^2]: The noise analysis in both variants uses a heuristic independence assumption — treating noise terms as independent Gaussians — then bounds decryption failure via erfc. Section 5 (p. 21): erfc(28/sqrt(2)) < 2^{-570}. Appendix A (p. 32): erfc(20/sqrt(2)) < 2^{-293}, union-bounded over 9 * 2^{12} coefficients to < 2^{-277}.

[^3]: Section 1.1, p. 4: "our scheme needs entry-size above 100KB to approach top performance."

## Lineage

| Field | Value |
|-------|--------|
| **Builds on** | GSW [GSW13] (FHE from LWE), PVW [PVW08] (batched LWE encryption), SealPIR [ACLS18] (query-expansion technique), Micciancio-Peikert [MP12] (gadget matrices), KLL+15 / LP17 (rate-optimal PIR using Damgard-Jurik) |
| **What changed** | Prior rate-optimal PIR [KLL+15] relied on Damgard-Jurik (quantum-unsafe, computationally expensive — one mod-N multiplication per bit with N >= 2048). This paper replaces it with a compressible GSW-based FHE scheme achieving near-optimal rate under RLWE, with dramatically lower per-byte computational cost (~1.8 multiplications per byte vs. mod-2048 multiplications). |
| **Superseded by** | MulPIR implementation (Ali et al., S&P 2021) which implements this paper's ideas with SEAL; OnionPIR builds on MulPIR |
| **Concurrent work** | Dottling et al. [DGI+19] (trapdoor hash functions, compressible HE under different assumptions); Brakerski et al. [BDGM19] (rate-1 FHE under LWE, more general but less practical) |

## Core Idea

The paper constructs the first *compressible* fully homomorphic encryption scheme: evaluated GSW ciphertexts (which are bloated matrices) can be publicly compressed into compact, high-rate matrix-encrypting ciphertexts. The compression packs many GSW bit-encryptions into a single PVW-style ciphertext whose plaintext-to-ciphertext ratio approaches 1 - epsilon for any epsilon > 0. Applied to PIR, this yields a single-server scheme with communication rate 4/9 (concrete) or approaching 1 (asymptotic), while the server's amortized work is under 1.8 single-precision modular multiplications per database byte — potentially faster than whole-database AES encryption. [^4]

[^4]: Abstract, p. 1 and Section 1.1, pp. 2–4. The rate 4/9 comes from (n'_0/n'_1)^2 = (2/3)^2 approximately 0.44 (Section 5.2, p. 19). The 1.8 multiplications per byte figure is from Appendix A's variant (p. 32); Section 5's variant uses ~2.3 multiplications per byte (p. 16).

## Novel Primitives / Abstractions

### Compressible FHE

| Field | Detail |
|-------|--------|
| **Name** | Compressible (Fully) Homomorphic Encryption |
| **Type** | Cryptographic primitive (new FHE variant) |
| **Interface / Operations** | (KeyGen, Encrypt, Evaluate, **Compress**, Decrypt) — standard FHE plus a public Compress operation [^5] |
| **Security definition** | Semantic security under decision-LWE with gap poly(lambda)^{1/epsilon} (Theorem 1, p. 10) |
| **Correctness definition** | Decrypt(s, Compress(pk, Evaluate(pk, Pi, Encrypt(pk, b)))) recovers Pi(b) with probability 1 (Definition 1, p. 6) |
| **Purpose** | Compress bloated evaluated FHE ciphertexts to near-plaintext size, enabling high communication rate in PIR |
| **Built from** | GSW encryption (low-rate, for homomorphic evaluation) + PVW batched encryption (high-rate, as compression target). Both share the same LWE matrix secret key S = [S'|I]. |
| **Rate** | alpha = (|p|/|q|) * (n_0/n_1) for PVW variant (Lemma 1, p. 9); alpha = n_0^2 / (n_1 * n_2) for nearly-square-gadget variant (Lemma 2, p. 12). Both approach 1 - epsilon. |
| **Relationship to prior primitives** | First compressible FHE. Prior compressible *additively* homomorphic encryption: Damgard-Jurik [DJ01] (quantum-unsafe, rate 1-o(1)). No prior LWE-based scheme broke the rate-1/2 barrier. |

[^5]: Definition 1, p. 6. Compress is a *public* operation: it takes the public key and evaluated ciphertexts, requires no secret key. This is critical — the server can compress its own computed answer.

### Nearly Square Gadget Matrix H

| Field | Detail |
|-------|--------|
| **Name** | Nearly square gadget matrix H |
| **Type** | Cryptographic primitive (novel gadget construction) |
| **Interface / Operations** | H is an n_0(t-1) x n_0*t matrix over Z_q (for q = p^t - 1); the "public trapdoor" is F = H^{-1}(0), a full-rank-over-reals matrix with small entries that spans the mod-q kernel of H [^6] |
| **Purpose** | Enable decryption of compressed ciphertexts with minimal expansion. Standard Micciancio-Peikert gadget G has rate at most 1/(log q), far too low. H achieves rate approaching 1 because it is nearly square. |
| **Key property** | Entries of F' (the base matrix) have magnitude at most (q+1)/p approximately q^{1-1/t}. For q = p^t - 1, the matrix F' is a circulant of powers of p (Equation 7, p. 13). Noise tolerance: beta <= (p-1)/2 = floor(q^{1/t})/2. |
| **Built from** | For q = p^t - 1: explicit circulant construction (Eq. 7). For general q: lattice reduction of the vector u = (1, a, a^2, ..., a^{t-1}) where a = ceil(q^{1/t}) (p. 15). |
| **Standalone complexity** | Computing H^{-1}(0) to H^{-1}(x): reduce each entry modulo the lattice L(F'), costing O(t^2) operations per column (Lemma 3, p. 14) |

[^6]: Section 4.4, pp. 13–15. The standard G gadget from [MP12] gives G^{-1}(C) with entries in {0,1}, but G has n_1 x m columns where m = n_1 * log q, so rate <= n_0/m = 1/log q. The nearly square H has dimension n_0(t-1) x n_0*t, so rate = (t-1)/t which approaches 1.

## Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring-LWE (RLWE) over cyclotomic ring R = Z[X]/(X^{2^{12}} + 1), index 2^{13}, dimension 2^{12} [^7] |
| **Encryption/encoding scheme(s)** | (1) GSW with matrix secrets: low-rate ciphertexts for homomorphic evaluation. Invariant: SC = sigma * S * G + E (mod q). (2) PVW (Peikert-Vaikuntanathan-Waters) batched encryption: high-rate compressed ciphertexts. Invariant: SC = f * Z + E' (mod q) with Z in Z_p. (3) Nearly-square-gadget variant: compressed ciphertext invariant SC = M * H + E (mod q). |
| **Ring / Field** | R_Q = Z_Q[X]/(X^{2^{12}} + 1) with Q = q * q' where q approximately 2^{46}, q' approximately 2^{60}. CRT representation over three moduli: R_Q, R_q, R_{q'}. Both q and q' chosen as primes with primitive 2^{12}-th roots of unity for FFT. [^8] |
| **Key structure** | Secret key: S = (S'|I) in R_Q^{n'_0 x n'_1} with S' a scalar in R_Q (ring-LWE: k' = 1, n'_0 = 2, n'_1 = 3). Public key: pseudorandom matrix P such that S * P = E (mod Q). Client generates ciphertexts using secret key directly (client-side encryption). [^9] |
| **Correctness condition** | Noise magnitude must remain below beta = (p-1)/2 = floor(q^{1/t})/2 approximately 2^{14.3} after all operations including modulus switching. Verified via sub-Gaussian heuristic: noise variance bounded by 2^{19} (Section 5, p. 21) or 2^{17.26} (Appendix A, p. 32), giving >= 20 standard deviations of margin. |

[^7]: Section 5.2, p. 19. Consulting the HE standard [ACC+18, Table 1], a cyclotomic ring of index 2^{13} with modulus Q of size up to 111 bits yields security level of 128 bits.

[^8]: Section 5.2, p. 19. The composite Q = q * q' is used to allow computation at a large modulus (for noise tolerance) followed by modulus switching to the smaller q (for rate). CRT representation enables efficient arithmetic: each ring multiplication is 2^{12} independent modular multiplications.

[^9]: Section 5.1, p. 18: "the encrypter is the client who has the decryption key. Hence it can create ciphertexts using the secret key" — setting C_i := sigma_i * G + P_i mod q, producing lower noise than public-key encryption.

## Key Data Structures

- **Database as hypercube:** N entries arranged as N_1 x N_2 x ... x N_D. Concrete: N_1 = 256 (= 2^8), N_2 = N_3 = ... = N_D = 4, with D chosen so that 256 * 4^{D-1} >= N. For N = 2^{20}, D = 7 (Section 5), or N_1 = 256, D = 13 for N = 2^{20} in Appendix A. [^10]
- **Database blocks as ring matrices:** Each entry broken into blocks of 4 * 2^{12} * 42 bits (approximately 84 KB). Each block is a 2-by-2 plaintext matrix M in R_q, multiplied by gadget matrix H to get redundant representation M' = M * H (mod q), then encoded in CRT representation modulo Q. [^11]
- **Three gadget matrices for different phases:** G_1 (wide-and-short, 3 x 159 over R_Q) for initial bit processing of i_1; G_2 (somewhat rectangular, 3 x 6) for folding small dimensions; and hat{G} (3 x 153 over R_Q) for key-switching gadgets in the automorphism variant. [^12]

[^10]: Section 5.2, p. 19 uses N_1 = 2^8, N_j = 4 for j > 1. Appendix A.3 (p. 28) uses N_1 = 256, N_2 = ... = N_D = 2 with D = 13 for N = 2^{20}.

[^11]: Section 5.2, p. 20: "breaking each entry into 2-by-2 plaintext matrices M in R_q (recall q approximately 2^{46}). Hence each matrix holds 2 * 2 * 46 * 2^{12} approximately 2^{19.5} bits (92KB)." Server stores M' = M * H mod q in CRT representation modulo Q, entailing a ~3.5x storage blowup.

[^12]: Section 5.2, p. 19: G_1 has m'_1 = n'_1 * ceil(log_4 Q) = 3 * 53 = 159 columns; G_2 has m'_2 = n'_1 * ceil(log_{2^{51}} Q) = 3 * 2 = 6 columns. Appendix A.3, p. 28 uses slightly different parameters: G_1 with m'_1 = n'_1 * floor(log_4(Q)) = 2 * 51 = 102; G_2 with m'_2 = n'_1 * ceil(log_{2^{51}} Q) = 3 * 2 = 6.

## Database Encoding

- **Representation:** Hypercube N_1 x N_2 x ... x N_D of 2x2 matrices over R_q, further encoded as 2x3 redundant matrices M' = M * H (mod q) in CRT representation modulo Q. [^11]
- **Record addressing:** Mixed-radix index (i_1, i_2, ..., i_D) with i_1 in [N_1] and i_j in {0,1} or {0,...,3}.
- **Preprocessing required:** Multiply each 2x2 data matrix M by gadget matrix H (one-time); convert all entries to CRT representation (evaluation form) so that FFTs are avoided during query processing. [^13]
- **Storage overhead:** CRT encoding modulo Q = q * q' roughly doubles entry size; redundant encoding via H adds factor n_2/n_0 = 3/2. Combined blowup: approximately 3.5x (footnote 9, p. 20: "106/46 * 3/2 approximately 3.5").

[^13]: Section 5.1, pp. 17–18: "pre-processing the database to minimize the number of FFTs during processing. Our scheme needs to switch between CRT representation (for arithmetic) and representation in the decoding basis (for G^{-1}). [...] we can drastically reduce the number of FFTs by pre-processing the database, putting it all in CRT representation."

## Protocol Phases

### Section 5 Variant (pure GSW query)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Encoding | Server | Compute M' = M * H, convert to CRT over R_Q | -- | Once |
| Query Gen | Client | Encrypt bits of i_1 as GSW ciphertexts (8 bits: 1 via identity, 7 via G_1); encrypt bits of i_j for j > 1 as GSW ciphertexts via G_2. | ~198 MB upload [^14] | Per query |
| First-dim processing | Server | Use GSW homomorphism to compute encrypted unit vector for dimension 1 (log N_1 = 8 GSW multiplications). Multiply by database and sum across first dimension. | -- | Per query |
| Dimension folding | Server | For each remaining dimension j = 2,...,D: multiply compressed ciphertexts by GSW-encrypted bits of i_j. Each fold reduces dimension by factor N_j = 4. | -- | Per query |
| Modulus switching | Server | Replace each ciphertext C with C' = ceil(C/q') in R_q^{n'_1 x n'_1}. | -- | Per query |
| Response | Server | Send modulus-switched compressed ciphertexts. | L * n'_1 * n'_2 * 46 * 2^{12} bits per entry (~92 KB per 84 KB plaintext block) [^15] | Per query |
| Decode | Client | Compute X = S * C (mod q), recover M * H, use trapdoor F = H^{-1}(0) to extract M. | -- | Per query |

[^14]: Section 5.2, p. 20: total ring elements sent = 9 + 3381 + 6 * 72 = 3822. Each element is 106 * 2^{12} bits. Total = 106 * 2^{12} * 3822 approximately 2^{30.6} bits approximately 198 MB. This is the "bulky" query size that Appendix A aims to reduce.

[^15]: The response size for a single 2x2 plaintext block is a 3x3 matrix over R_q: 9 * 46 * 2^{12} bits approximately 27 KB per block. Rate = (2*2*46*2^{12}) / (3*3*46*2^{12}) = 4/9 approximately 0.44.

### Appendix A Variant (query expansion with automorphisms)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Encoding | Server | Same as above | -- | Once |
| Key-switching setup | Client | Generate 8 key-switching matrices W_{2^j} for automorphisms tau_{2^j}, j = 0,...,7. Each W is 3x153 over R_Q. | ~183 MB upload [^16] | Once (reusable) |
| Query Gen | Client | Encrypt i_1 as single Regev ciphertext C_1 (n'_1 x m'_1 = 3x102 elements); encrypt each i_j (j > 1) as GSW ciphertext C_j (3x6 elements). Total: 522 ring elements over R_Q. | ~26 MB upload [^17] | Per query |
| Query expansion | Server | Apply automorphism-based expansion procedure (Fig. 2) to turn single Regev ciphertext C_1 into N_1 = 256 ciphertexts, one per slot. Uses 8 iterations, each applying tau_{2^j} + key-switching. | -- | Per query |
| First-dim processing | Server | Shrink expanded ciphertexts via G_1^{-1}(I_2), multiply by pre-processed database rows M' = M * H in CRT form, sum across first dimension. | -- | Per query |
| Dimension folding | Server | Same as Section 5 variant. | -- | Per query |
| Modulus switching & Response | Server | Same as Section 5 variant. | Same as Section 5 | Per query |
| Decode | Client | Same as Section 5 variant. | -- | Per query |

[^16]: Appendix A.3, p. 28: 8 * 3 * 153 * 2^{12} * 102 bits = 8 * 3 * 153 * 2^{12} * 102 bits. The paper states "about 183MB." These are query-independent and reusable across many PIR instances.

[^17]: Appendix A.3, p. 29: "a total of 522 ring elements over R_Q, or roughly 26MB." The "online" portion is under 30 MB, an 85% savings over the Section 5 variant's 198 MB.

## Correctness Analysis

### Option A: FHE Noise Analysis (Sub-Gaussian / Variance Tracking)

The paper tracks noise variance through each phase under a heuristic independence assumption, treating noise coordinates as zero-mean normal random variables.

**Section 5 variant (p. 20-21):**

| Phase | Noise variance (per coordinate) | Growth mechanism | Notes |
|-------|-------------------------------|------------------|-------|
| After first-dim GSW evaluation | sum of 7 terms: E_u x G_1^{-1}(something) | Additive over log N_1 = 8 levels | Entries of G_1^{-1} in [-2, 2], error E_u with variance 8. Variance per entry: 2^2 * m'_1 * 2^{12} = 159 * 2^{14} |
| After plaintext multiplication | Multiply by M'' (entries in [+-2^{45}]) over R_q (2^{12} coefficients) | Multiplicative: factor 2^{2*45} * n'_1 * 2^{12} = 3 * 2^{102} | Dominant step: produces variance 3339 * 2^{127} per coordinate |
| After dimension folding (D-1 folds) | Each fold adds 4 terms E x G_2^{-1}(something) | Additive: 4*(D-1) = 24 terms total | G_2 entries in [+-2^{52}]; added variance per fold: 9 * 2^{123}. Total added: 9 * 2^{123} |
| Before modulus switching | < 3340 * 2^{127} | Dominated by first-dim | |
| After modulus switching | Scale by q' approximately 2^{60}, plus rounding error S * Xi | Variance reduced by factor 2^{120}; rounding adds 3 * 2^{15} | Total: 3340 * 2^7 + 3 * 2^{15} approximately 525824 approximately 2^{19} |

- **Noise standard deviation:** sigma approximately 2^{9.5}
- **Decryption threshold:** beta = (p-1)/2 = (2^{46/3} - 1)/2 approximately 2^{14.3}
- **Margin:** 2^{14.3} / 2^{9.5} approximately 28 standard deviations
- **Failure probability:** erfc(28/sqrt(2)) < 2^{-570} per coordinate; union over n'_1 * n'_2 * 2^{12} = 9 * 2^{12} coordinates remains negligible [^2]
- **Independence heuristic used?** Yes. The paper states: "Since each noise coordinate is a weighted sum of many noise terms which are zero-mean with similar variance, it makes sense to treat it as a zero-mean Normal random variable" (p. 21).

**Appendix A variant (p. 31-32) — slightly different due to query expansion noise:**

| Phase | Noise variance (per coordinate) | Notes |
|-------|-------------------------------|-------|
| After query expansion | 256 * 8 + 255 * 153 * 2^{17} < 305 * 2^{24} | 256 fresh E terms + 255 key-switching noise terms |
| After plaintext multiplication | 305 * 2^{24} * 3 * 2^{94} = 915 * 2^{118}. Times 256 rows: 915 * 2^{126} | Slightly different from Section 5 due to 2x2 vs 2x3 matrices |
| After dimension folding | Adds 24 terms of variance 9 * 2^{119} each: total 9 * 2^{119} | Smaller than Section 5 because G_2 entries are in [+-2^{50}] |
| After modulus switching | 916 * 2^6 + 3 * 2^{15} approximately 156928 approximately 2^{17.26} | |

- **Noise standard deviation:** sigma approximately 2^{8.6}
- **Margin:** 2^{14.3} / 2^{8.6} > 20 standard deviations
- **Failure probability:** erfc(20/sqrt(2)) < 2^{-293} per coordinate; union over 9 * 2^{12}: < 2^{-277} [^2]

## Complexity

### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(N_1 * n'_1 * m'_1 * d * log Q) [^14] | Section 5: ~198 MB; Appendix A (online): ~26 MB; Appendix A (with key-switching gadgets): ~209 MB total | Online (upload) |
| Response size | O(L * n'_1 * n'_2 * d * log q) | ~(9/4) * plaintext size (rate 4/9 approximately 0.44) [^15] | Online (download) |
| Server computation | O-tilde(log log lambda + log log log N) per bit of DB [^18] | Section 5: ~2.3 mod-q multiplications per byte; Appendix A: ~1.8 mod-q multiplications per byte | Online |
| Client computation | Encryption + decryption | N/A (no implementation) | Online |
| Communication rate | 1 - epsilon for any epsilon > 0 (asymptotic, requiring bootstrapping) | 4/9 approximately 0.44 (concrete, without bootstrapping) | -- |
| Response overhead | O(1) | 2.25x vs non-private (i.e., rate 0.44 means 1/0.44 approximately 2.27x expansion) | -- |

[^18]: Section 1.1, p. 2: "the computational overhead of our PIR scheme is O-tilde(log log lambda + log log log N)." This counts the overhead factor beyond the inherent omega(N) work. The log log terms arise because q = O-tilde(log N + lambda) and mod-q multiplication costs O-tilde(log log q).

### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Communication rate | 1 - epsilon | 4/9 approximately 0.44 | -- |
| Expansion factor (F) | 1/(1 - epsilon) | 9/4 = 2.25 | -- |
| Multiplicative depth | O(log N_1) for first dim; O(1) per additional dim | 8 (first dim) + 12 (remaining dims, at 1 per fold) | -- |
| Modulus Q (bits) | O(log N + lambda) | ~106 bits (46 + 60) | -- |

## Estimation Methodology

The paper provides detailed analytical cost estimates without running code. The methodology is as follows.

**Cost model — modular multiplications per database byte:**

The dominant cost is the first-dimension processing: multiplying GSW ciphertext matrices C by plaintext matrices M' * H modulo Q. [^19]

*Section 5 variant (p. 22):*
- Matrix multiplication C x M'H: ciphertexts are n'_1 x n'_1 = 3x3, plaintext matrices are n'_1 x n'_2 = 3x3 (both over R_Q).
- Naive matrix mult: 3^3 = 27 ring multiplications per matrix product.
- Each ring mult (dimension 2^{12}, CRT over double modulus Q = q * q'): 2 * 2^{12} modular integer multiplications.
- Total per matrix mult: 2 * 27 * 2^{12} approximately 2^{17.75} modular multiplications.
- Each plaintext matrix encodes ~2^{16.5} bytes.
- **Amortized: 2^{17.75} / 2^{16.5} approximately 2.4 modular multiplications per byte.**
- Using Laderman's method (23 multiplications for 3x3 matrices instead of 27): **~2 multiplications per byte.** [^20]

*Appendix A variant (p. 32):*
- Ciphertexts are n'_1 x n'_0 = 3x2 (smaller due to Regev encryption for first index).
- Plaintext matrices are n'_0 x n'_2 = 2x3.
- Naive matrix mult: 3^2 * 2 = 18 ring multiplications.
- Total per matrix mult: 2 * 18 * 2^{12} = 9 * 2^{14} modular multiplications.
- Plaintext: 4 * 2^{12} * 42 bits = 42 * 2^{11} bytes.
- **Amortized: (9 * 2^{14}) / (42 * 2^{11}) = 9*8/42 approximately 1.72 modular multiplications per byte.** [^21]

**Comparison to AES:**
Software AES without hardware support: >= 25 cycles per byte [SR10, Cry09]. A single-precision modular multiplication is comparable to or cheaper than one AES round. The paper argues that the PIR server's work (~1.8 multiplications/byte) should be competitive with or faster than AES encryption of the entire database. With hardware AES-NI, AES costs ~1 cycle/byte, so PIR would be slower per-byte — but the paper notes that the structured nature of the matrix multiplication (same GSW matrix times many plaintext matrices) enables pre-processing optimizations. [^22]

**Bootstrapping crossover:**
Achieving rate approaching 1 (instead of 4/9) requires bootstrapping just before compression. Bootstrapping costs approximately 2^{30} cycles per plaintext byte vs. ~2^4 cycles for the base scheme. The asymptotic improvement only pays off for databases with N >= 2^{26} approximately 64 million entries. [^23]

[^19]: Section 5, p. 22 (complexity analysis) and Appendix A, p. 32 (same analysis for the variant).

[^20]: Section 5, p. 22: "Using Laderman's method we can multiply 3-by-3 matrices with only 23 multiplications [Lad76], so the amortized work is only 2 modular multiplications per byte."

[^21]: Appendix A, p. 32: "the amortized work per byte is (9 * 2^{14}) / (42 * 2^{11}) = 9*8/42 approximately 1.72 modular multiplication per database byte."

[^22]: Section 5, p. 22 and Appendix A, pp. 32–33.

[^23]: Section 5, p. 23: "bootstrapping takes close to 2^{30} cycles per plaintext byte (vs. the procedure above that takes around 2^4 cycles per byte). Hence the asymptotic efficiency is likely to take hold only for databases with at least N = 2^{30-4} = 64,000,000 entries."

## How Ciphertext Compression Works

The compression mechanism is the paper's central technical contribution. It operates in two variants:

### Variant 1: PVW-based (Section 4.1)

Given l * n_0^2 GSW ciphertexts C_{u,v,w} (each n_1 x m matrices encrypting bits sigma_{u,v,w}), compress into a single PVW ciphertext C* in Z_q^{n_1 x n_0}: [^24]

```
C* := sum_{u,v,w} C_{u,v,w} x G^{-1}(f * 2^w * T'_{u,v})  (mod q)
```

where f = ceil(q/p), T_{u,v} are n_0 x n_0 singleton matrices (1 in position (u,v), 0 elsewhere), T'_{u,v} is T_{u,v} padded with k zero rows on top, and l = floor(log p).

The key insight: multiplying S into C* telescopes to S * C* = f * Z + E' where Z = sum z_{u,v} * T_{u,v} with z_{uv} = sum 2^w * sigma_{u,v,w} in [p]. The matrix Z contains all the plaintext bits packed in binary representation. Decryption recovers Z by rounding to multiples of f.

**Rate:** alpha = |p|/|q| * n_0/n_1 (Lemma 1, p. 9).

### Variant 2: Nearly-square-gadget-based (Section 4.2)

Same approach but replaces the PVW target with a matrix ciphertext using the nearly square gadget H: [^25]

```
C* := sum_{u,v,w} C_{u,v,w} x G^{-1}(2^w * T'_{u,v} x H)  (mod q)
```

Compressed ciphertext C* in Z_q^{n_1 x n_2}. Decryption: compute X = S * C = M * H + E (mod q), multiply by trapdoor F to clear H, subtract to recover M.

**Rate:** alpha = n_0^2 / (n_1 * n_2) (Lemma 2, p. 12). For n_1 = n_0 + k and n_2 approximately n_0 * (1 + 1/(t-1)), both ratios approach 1 as n_0 grows.

### Why compression works with GSW

The critical observation is that GSW ciphertexts and PVW/matrix ciphertexts can share the same LWE secret key S = [S'|I]. A GSW ciphertext C encrypting sigma satisfies SC = sigma * SG + E. The compression formula C* = sum C_{u,v,w} x G^{-1}(target) uses the GSW multiplication mechanism — but the "target" is not another GSW ciphertext; it is a *noiseless* encoding of the plaintext position in the PVW/matrix format. Because the target is noiseless, the dominant noise term sigma * E' (where E' comes from the target's encryption noise) vanishes — this is why compression does not need the encrypted scalars to be small, only the original GSW encryption noise. [^26]

[^24]: Section 4.1, pp. 8–9, specifically Equations (3) and (4).

[^25]: Section 4.2, pp. 11–12, specifically Equation (6).

[^26]: Section 4.1, p. 10 ("Multiplying GSW ciphertexts by plaintext matrices"): "the 'noiseless ciphertext' M* has E' = 0, hence the term sigma * E' from above does not appear in the resulting noise term, no matter how large sigma is." This is exploited in PIR where the database values (large) multiply the query ciphertexts (bits).

## Variants

| Variant | Key Difference | Query Size | Server Work/Byte | Rate | Best For |
|---------|---------------|------------|-----------------|------|----------|
| Section 5 (pure GSW) | All index bits encrypted as GSW ciphertexts; no key-switching gadgets needed | ~198 MB | ~2.3 mults (naive), ~2.0 mults (Laderman) | 4/9 approximately 0.44 | Simplicity; single-query scenarios where query size is less critical |
| Appendix A (query expansion) | First index i_1 encrypted as single Regev ciphertext; server expands via automorphisms + key-switching | ~26 MB online + ~183 MB offline (key-switching gadgets, reusable) | ~1.72 mults (naive) | 4/9 approximately 0.44 | Multi-query scenarios; smaller per-query bandwidth |
| Asymptotic (with bootstrapping) | Bootstrap before compression to achieve rate -> 1 | Same | + ~2^{30} cycles/byte for bootstrapping | 1 - epsilon | N >= 2^{26} entries; bandwidth-critical |

## Comparison with Prior Work

| Metric | MulPIR (this paper, Appendix A variant) | SealPIR [ACLS18] | KLL+15 / LP17 (Damgard-Jurik) | Trivial (send whole DB + AES) |
|--------|----------------------------------------|-----------------|-------------------------------|-------------------------------|
| Communication rate | 4/9 approximately 0.44 | ~1/1000 [^27] | 1 - o(1) | ~1 (with AES overhead) |
| Server work per byte | ~1.8 mod-q multiplications (q approximately 50-60 bits) | ~20 cycles per byte [^28] | 1 mod-N multiplication per bit (N >= 2048 bits) | ~1-25 cycles per byte (AES) |
| Hardness assumption | RLWE (post-quantum) | RLWE (post-quantum) | N-th residuosity (quantum-vulnerable) | Symmetric key |
| Implementation | None (theory only) | Yes (SEAL-based) | None practical | Trivial |
| Entry-size regime | Large (>= 100 KB) | Small-medium (optimized for 288 bytes) | Any | Any |

[^27]: Section 1.2, p. 4: "the SealPIR results from [ACLS18, Fig. 9] indicate a rate of roughly 1/1000." SealPIR's rate can be improved for large entries but remains far below 1/2. (Footnote 5, p. 4.)

[^28]: Section 1.1, p. 4: "SealPIR reports just over twenty cycles per database byte."

**Key takeaway:** MulPIR achieves a 440x improvement in communication rate over SealPIR (0.44 vs ~0.001) while using fewer modular multiplications per byte than SealPIR uses CPU cycles per byte. The cost is much larger query sizes (26-198 MB vs SealPIR's ~60 KB) and the requirement for large database entries (>= 100 KB). For large-entry databases (images, video chunks, documents), MulPIR's approach dominates on the response side; for small-entry databases (DNS records, contact discovery), SealPIR is more appropriate.

## Key Tradeoffs & Limitations

- **No implementation:** Paper is theory-only; all performance estimates are analytical. The authors explicitly state: "While we did not implement our PIR scheme, we explain in detail why we estimate that it should be not only theoretically efficient but also practically fast" (p. 2) and (footnote 7, p. 16): "Implementing it and measuring its performance may be an interesting topic for future work." [^29]
- **Very large query sizes:** The Section 5 variant has ~198 MB queries. The Appendix A variant reduces this to ~26 MB online but requires ~183 MB of key-switching gadgets (amortizable across queries). Both are orders of magnitude larger than SealPIR's ~60 KB queries.
- **Large entry requirement:** Amortization of the fixed per-query overhead requires entries >= 100 KB. For small entries the scheme is not competitive. [^3]
- **Database storage blowup:** CRT encoding plus gadget-matrix redundancy entails a ~3.5x server-side storage expansion. [^11]
- **FFTs are not fully eliminated:** While pre-processing the database avoids most FFTs, FFTs are still needed during query expansion and after folding the first dimension (for converting between coefficient and CRT representations). For very large N/N_1, FFT cost becomes negligible; for small databases it may dominate. [^30]
- **Rate 4/9 is not rate 1:** Achieving rate approaching 1 requires bootstrapping, which costs ~2^{30} cycles per byte and is only worthwhile for N >= 64 million entries. [^23]

[^29]: Section 1.1, p. 2 and footnote 7, p. 16.

[^30]: Section 5.1, pp. 17–18 and Section 5 complexity analysis, p. 22.

## Portable Optimizations

- **Database pre-processing in CRT/evaluation form:** Pre-compute NTT of all database entries so that the server never needs to perform FFTs on the bulk of the data during query processing. Only initial query processing and post-first-dimension conversion require FFTs. Applicable to any RLWE-based PIR. [^13]
- **Multiple G matrices for different phases:** Using a wide-and-short G for phases with heavy noise accumulation (first dimension) and a more-square G for phases with lighter noise (subsequent dimensions) optimizes the noise-to-rate tradeoff. Applicable to any GSW-based scheme with heterogeneous noise growth. [^12]
- **Client-side encryption for lower noise:** When the PIR client holds the secret key, generate ciphertexts as C = sigma * G + P (using a fresh pseudorandom P) instead of standard public-key encryption. This avoids one noise term, halving the noise at the cost of larger-seeming but equally-secure ciphertexts. [^9]
- **Modulus switching before response:** Perform all computation at large modulus Q, then switch to small modulus q before sending the response. This reduces response size by factor Q/q while scaling noise by the same factor. Standard technique from BGV but applied here specifically to compressed ciphertexts. [^31]
- **Noiseless plaintext multiplication:** When right-multiplying a GSW ciphertext by a plaintext matrix, construct the matrix as a "noiseless ciphertext" M* = q/p * M'. The sigma * E' noise term vanishes since E' = 0, allowing the encrypted scalar sigma to be arbitrarily large. Critical for PIR where database values are large. [^26]

[^31]: Section 5.1, p. 18: "we perform the computation relative to a large modulus Q, then switch to a smaller modulus q before sending the final result to the client, scaling the noise roughly by q/Q."

## Deployment Considerations

- **Database updates:** Not addressed. The scheme assumes a static database. Pre-processing (CRT conversion, M' = MH computation) must be redone for updated entries.
- **Sharding:** Not discussed, but the hypercube structure naturally supports sharding along the first dimension (each shard holds N/N_1 entries corresponding to one hyperrow).
- **Query limits:** No cryptographic query limit (no state consumed per query). However, each query requires ~26 MB upload (Appendix A variant), making high query rates bandwidth-constrained.
- **Cold start suitability:** Section 5 variant: yes (no offline material needed, but 198 MB per query). Appendix A variant: no (requires offline upload of 183 MB key-switching material, but this is reusable).
- **Entry-size crossover:** The scheme becomes competitive with SealPIR-type schemes above ~100 KB entry sizes. Below this threshold, the per-query overhead is not sufficiently amortized. [^3]

## Application Scenarios

- **Private movie/video streaming:** Explicitly discussed. A 4 GB movie would be encoded in ~44K plaintext matrices (L approximately 44,000). At this scale, FFT overhead is negligible and the ~1.8 multiplications per byte would yield practical streaming performance. [^10]
- **Private image retrieval:** A single JPEG image has L approximately 4 matrices. Even at this smaller scale, the scheme achieves rate 0.44. [^10]
- **General large-file PIR:** The scheme is most natural for databases of files >= 100 KB — document repositories, software update servers, medical records. [^3]
