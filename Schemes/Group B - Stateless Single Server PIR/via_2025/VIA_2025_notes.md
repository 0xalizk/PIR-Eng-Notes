## VIA: Communication-Efficient Single-Server Private Information Retrieval -- Engineering Notes

<a id="toc"></a>

<table><tr><td>

<sub><nobr>1. <a href="#lineage">Lineage</a></nobr></sub><br>
<sub><nobr>2. <a href="#core-idea"><b>Core Idea</b></a></nobr></sub><br>
<sub><nobr>3. <a href="#variants">Variants</a></nobr></sub><br>
<sub><nobr>4. <a href="#novel-primitives-abstractions">Novel Primitives / Abstractions</a></nobr></sub><br>
<sub><nobr>5. <a href="#cryptographic-foundation">Cryptographic Foundation</a></nobr></sub><br>
<sub><nobr>6. <a href="#ring-architecture-modulus-chain">Ring Architecture / Modulus Chain</a></nobr></sub><br>
<sub><nobr>7. <a href="#key-data-structures"><b>Key Data Structures</b></a></nobr></sub><br>
<sub><nobr>8. <a href="#database-encoding">Database Encoding</a></nobr></sub><br>
<sub><nobr>9. <a href="#database-dimensions-table-4">Database Dimensions (Table 4)</a></nobr></sub><br>
<sub><nobr>10. <a href="#protocol-phases"><b>Protocol Phases</b></a></nobr></sub><br>
<sub><nobr>11. <a href="#correctness-analysis">Correctness Analysis</a></nobr></sub>

</td><td>

<sub><nobr>12. <a href="#gadget-parameters">Gadget Parameters</a></nobr></sub><br>
<sub><nobr>13. <a href="#complexity"><b>Complexity</b></a></nobr></sub><br>
<sub><nobr>14. <a href="#performance-benchmarks"><b>Performance Benchmarks</b></a></nobr></sub><br>
<sub><nobr>15. <a href="#comparison-with-prior-work">Comparison with Prior Work</a></nobr></sub><br>
<sub><nobr>16. <a href="#portable-optimizations"><b>Portable Optimizations</b></a></nobr></sub><br>
<sub><nobr>17. <a href="#implementation-notes"><b>Implementation Notes</b></a></nobr></sub><br>
<sub><nobr>18. <a href="#deployment-considerations">Deployment Considerations</a></nobr></sub><br>
<sub><nobr>19. <a href="#key-tradeoffs-limitations"><b>Key Tradeoffs & Limitations</b></a></nobr></sub><br>
<sub><nobr>20. <a href="#related-papers-in-collection">Related Papers in Collection</a></nobr></sub><br>
<sub><nobr>21. <a href="#open-problems">Open Problems</a></nobr></sub><br>
<sub><nobr>22. <a href="#uncertainties">Uncertainties</a></nobr></sub>

</td></tr></table>

| Field | Value |
|-------|-------|
| **Paper** | [VIA: Communication-Efficient Single-Server Private Information Retrieval](https://eprint.iacr.org/2025/2074) (2025) |
| **Archetype** | Construction (multi-variant: VIA, VIA-C, VIA-B) |
| **PIR Category** | Group B -- Stateless single-server; sub-model: Hintless (VIA) / Client-hint upload (VIA-C, VIA-B). VIA-C straddles the Group B/C border due to its offline communication of secret-key-dependent evaluation keys. |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | Circular security / KDM (key-dependent message) for the underlying RLWE/MLWE encryption |
| **Correctness model** | Probabilistic (failure prob <= 2^{-40}) |
| **Rounds (online)** | 1 (non-interactive) |
| **Record-size regime** | Small (log p bits per record; 8 bits for VIA, 4 bits for VIA-C/VIA-B) / Variable via blinded extraction |

<a id="lineage"></a>

### Lineage <a href="#toc">⤴</a>

| Field | Value |
|-------|--------|
| **Builds on** | Respire [Group B] (architecture: I x J matrix, ring switching, CMux selection, sample extraction), Spiral [Group A] (Regev+GSW composition, external products, ciphertext translation), HERMES [29] (MLWE packing concept) |
| **What changed** | Replaces coefficient expansion (used by Spiral, Respire, OnionPIR for generating encrypted unit vectors) with a DMux-CMux tree structure, eliminating offline communication entirely. VIA-C adds a novel LWE-to-RLWE conversion with O(n log n) noise variance (vs. O(n^3) in prior work [28]) for query compression. |
| **Superseded by** | N/A |
| **Concurrent work** | N/A |

<a id="core-idea"></a>

### Core Idea <a href="#toc">⤴</a>

VIA addresses the high online communication cost of lattice-based PIR schemes that eliminate offline communication. Prior hintless schemes (YPIR, HintlessPIR) achieve O_lambda(sqrt(N)) online communication; VIA achieves O_lambda(1) -- specifically O(log N) online communication -- by replacing coefficient expansion with a DMux-CMux binary tree that generates the encrypted one-hot vector from only log I RGSW ciphertexts of control bits.&#8201;[^1] The DMux-CMux architecture requires only logarithmically many ciphertexts to select among I rows and J columns, yielding the name "VIA" from the symmetric triangular layout of the DMux and CMux trees.&#8201;[^2] VIA-C further compresses queries to O(log N) elements in Z_q via a novel LWE-to-RLWE conversion that introduces only O(n log n) noise variance, achieving 87.6x smaller queries than Respire for a 32 GB database.&#8201;[^3]

[^1]: Abstract (p.1): "we propose VIA, a single-server PIR scheme that eliminates offline communication while achieving O_lambda(log N) online communication complexity."

[^2]: Section 1.1 (p.3): The DMux-CMux architecture resembles a symmetric triangular configuration (a "V" shape), which inspired the name VIA.

[^3]: Section 4.2 (p.13): VIA-C's LWE-to-RLWE conversion reduces queries to l*log(IJn_1/n_2) = l*log N elements in Z_{q_1}. For a 32 GB database, VIA-C's query size is only 0.659 KB vs. Respire's 57.77 KB.

<a id="variants"></a>

### Variants <a href="#toc">⤴</a>

| Variant | Key Difference | Offline Comm | Online Query | Online Response | Best For |
|---------|---------------|-------------|--------------|----------------|----------|
| **VIA** | Base: DMux-CMux replaces coefficient expansion; fresh RGSW ciphertexts in query; p = 256 | None | 473--675 KB | 15.5 KB | Hintless PIR; general use without offline phase |
| **VIA-C** | LWE-to-RLWE query compression + RLWE-to-RGSW on server + blinded extraction; p = 16 | 14.8 MB (eval keys) | 0.57--0.66 KB | 1.44 KB | Minimum communication; small-record databases |
| **VIA-B** | Batch extension of VIA-C; homomorphic repacking packs T answers into one RLWE ciphertext | 14.8 MB (eval keys) | 17--145 KB (batch T) | 1.48--1.81 KB | Batch queries on tiny-record (1-byte) databases |

[^4]: Table 1 (p.18): VIA achieves 690.25 KB total online communication for 32 GB, vs. YPIR's 2572 KB and HintlessPIR's 18578 KB.

[^5]: Table 1 (p.18): VIA-C achieves 2.098 KB total online communication for 32 GB (0.659 KB query + 1.439 KB response), vs. Respire's 59.77 KB.

[^6]: Section 4.5 (p.14): VIA-B models each database record as an element of R_{n_3,p} where n_3 <= n_2, and each packed element contains n_1/n_3 individual records.

<a id="novel-primitives-abstractions"></a>

### Novel Primitives / Abstractions <a href="#toc">⤴</a>

#### DMux (Homomorphic Demultiplexer)

| Field | Detail |
|-------|--------|
| **Name** | 1-to-2^m DMux (Algorithm 2) |
| **Type** | Cryptographic primitive (homomorphic circuit) |
| **Interface / Operations** | Input: RGSW ciphertexts C_ctrl of m control bits b in {0,1}^m, RLWE ciphertext c = RLWE_S(M). Output: 2^m RLWE ciphertexts where the b-th position encrypts M and all others encrypt 0. |
| **Security definition** | Inherited from RLWE/RGSW security |
| **Purpose** | Generates encrypted one-hot vector from log I control bits, replacing coefficient expansion. Requires only log I RGSW ciphertexts instead of I RLWE ciphertexts. |
| **Built from** | External products (RGSW x RLWE -> RLWE) |
| **Standalone complexity** | 2^m - 1 external products for m = log I control bits |
| **Relationship to prior primitives** | Dual of CMux: DMux routes one input to one of 2^m outputs; CMux selects one of 2^m inputs to one output. Together they form the "V" architecture. |

[^7]: Section 3.1, Algorithm 2 (p.8): DMux is a binary tree of depth m = log I. At each level i, each node splits via DMux(C_{ctrl,i}, res_j) = (res_{2j} = c - C box c, res_{2j+1} = C box c), performing 2^i external products at level i.

#### CRot (Controlled Rotation)

| Field | Detail |
|-------|--------|
| **Name** | CRot (Controlled Rotation) |
| **Type** | Cryptographic primitive (homomorphic circuit) |
| **Interface / Operations** | Input: RGSW ciphertexts C_rot of rotation bits gamma_i in {0,1}, RLWE ciphertext c = RLWE_S(M). Output: RLWE_S(M * X^{-sum_i gamma_i * 2^i}). |
| **Purpose** | Homomorphic conditional rotation of the RLWE ciphertext to shift the target coefficient to position 0 for sample extraction. Used in VIA-C to avoid direct transmission of the rotation ciphertext. |
| **Built from** | External products (log(n_1/n_2) levels) |

[^8]: Section 4.2 (p.12): CRot takes a tuple C_rot of RGSW ciphertexts with gamma_i in {0,1} and an RLWE ciphertext c = RLWE_S(M), outputting RLWE_S(M * X^{-sum_i gamma_i * 2^i}).

#### LWE-to-RLWE Conversion (Novel)

| Field | Detail |
|-------|--------|
| **Name** | LWE-to-RLWE conversion via iterative MLWE-to-MLWE steps |
| **Type** | Cryptographic primitive (ciphertext format conversion) |
| **Interface / Operations** | Input: rank-n LWE ciphertext c = LWE_s(mu) in Z_q. Output: (1, n)-MLWE ciphertext (equivalent to RLWE) encrypting mu. Denoted LWEtoRLWE(c, c_hat_toRLWE). |
| **Purpose** | Converts LWE-format queries (compact) into RLWE format (processable by server). Enables VIA-C's O(log N) query compression. |
| **Built from** | MLWE-to-MLWE conversion (iterative doubling via MLWE embedding + key switching), RLWE-to-MLWE extraction |
| **Standalone complexity** | 2 log n key-switching keys, 2 log n key-switching operations |
| **Relationship to prior primitives** | Functionally equivalent to HERMES [29] in the single-ciphertext case, but: (1) focuses on single-ciphertext settings (no multi-ciphertext overhead), (2) uses log n MLWE midpoints (HERMES uses few), (3) achieves O(n log n) noise variance vs. O(n^3) in [28]. |

[^9]: Section 4.1 (p.11-12), Lemma 4.2 (p.12): The LWE-to-RLWE algorithm requires 2 log n key-switching keys and performs 2 log n key-switching operations. Noise variance is theta_c + 2*theta_ks*log n, i.e., O(n log n), compared to O(n^3) for [28].

<a id="cryptographic-foundation"></a>

### Cryptographic Foundation <a href="#toc">⤴</a>

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (base VIA) and MLWE (VIA-C, VIA-B). The (m, n, q, chi_S, chi_E)-MLWE problem reduces to the LWE assumption when n = 1 and to the RLWE assumption when m = 1. Security reduced to RLWE over R_{n_1,q_1} via the reduction: (m,n)-MLWE is at least as hard as (mn, q, chi_S, chi_E)-RLWE.&#8201;[^10] |
| **Encryption/encoding schemes** | (1) **RLWE encoding**: c = (A, A*S + E + Delta*M) for polynomial ring R_{n,q}, with Delta = ceil(q/p). (2) **RGSW encoding**: C = (RLev_S(-SM), RLev_S(M)) -- pair of RLev ciphertexts. (3) **MLWE encoding** (VIA-C): (A, <A, S> + E + M) in R_{n,q}^{m+1}. |
| **Ring / Field** | Multi-ring: R_{n_1,q_1} (large ring, n_1 = 2048), R_{n_2,q_2} (small ring, n_2 = 512), plus auxiliary moduli q_3, q_4. See Ring Architecture table. |
| **Key structure** | Two independent RLWE secret keys: S_1 from chi_{S,1} over R_{n_1,q_1} (control/rotation ciphertexts), S_2 from chi_{S,2} over R_{n_2,q_2} (selection bits, ring-switching target). Ring-switching key rsk maps S_1 to S_2. In VIA, S_1 is uniform on [-2, 2]; in VIA-C/VIA-B, S_1 is discrete Gaussian with sigma_{1,S} = 32.&#8201;[^11] |
| **Correctness condition** | Probabilistic: ||E_final||_inf < floor((q_3 - q_4)/p)/2 - 1. Achieved via erfc bound: Pr[correct] >= erfc(floor((q_3 - q_4)/p)/2 - 1) / sqrt(2*theta_ans)). Parameters selected so that error rate < 2^{-40}.&#8201;[^12] |

[^10]: Section 4 (p.10): The (m, n, q, chi_S, chi_E)-MLWE problem is at least as hard as the (mn, q, chi_S, chi_E)-RLWE problem.

[^11]: Section 5.1 (p.16): VIA uses chi_{1,S} uniform on [-2, 2] with sigma_{1,E} = 1 (Gaussian). VIA-C/VIA-B use sigma_{1,S} = 32, sigma_{1,E} = 1024 (both Gaussian).

[^12]: Appendix C.2 (p.27): The correctness condition is ||E_final||_inf <= floor((q_3 - q_4)/p)/2 - 1, with the error probability bounded by erfc(floor((q_3 - q_4)/p)/2 - 1 / sqrt(2*theta_ans)).

<a id="ring-architecture-modulus-chain"></a>

### Ring Architecture / Modulus Chain <a href="#toc">⤴</a>

#### VIA Parameters

| Ring | Dimension | Modulus (bits) | Value | Role / Phase |
|------|-----------|---------------|-------|--------------|
| R_{n_1,q_1} | n_1 = 2048 | 57-bit | q_1 = q_{1,1} * q_{1,2} ~ 2^57 | Query encryption (control bits, rotation ct), DMux, first-dimension folding |
| R_{n_2,q_2} | n_2 = 512 | 35-bit | q_2 ~ 2^35 | Selection bits (RGSW), CMux, ring-switching target |
| R_{n_2,q_3} | n_2 = 512 | 31-bit | q_3 ~ 2^31 | Response compression (modulus-switched output) |
| Z_{q_4} | -- | 15-bit | q_4 = 2^15 | Final extraction modulus |
| R_{n_1,p} / R_{n_2,p} | n_1 / n_2 | -- | p = 256 | Plaintext space (VIA) |

[^13]: Section 5.1 (p.16-17) and Appendix B (p.22): VIA uses q_1 = 268369921 * 268369921 ~ 2^57, q_2 = 34359214081 ~ 2^35, q_3 = 2147352577 ~ 2^31, q_4 = 2^15, p = 256. Both q_{1,1}, q_{1,2} are primes with q_{1,1}, q_{1,2} = 1 mod 2*n_1 for NTT.

#### VIA-C / VIA-B Parameters

| Ring | Dimension | Modulus (bits) | Value | Role / Phase |
|------|-----------|---------------|-------|--------------|
| R_{n_1,q_1} | n_1 = 2048 | 75-bit | q_1 = q_{1,1} * q_{1,2} ~ 2^75 | LWE-to-RLWE conversion, RLWE-to-RGSW, query decompression |
| R_{n_2,q_2} | n_2 = 512 | 34-bit | q_2 ~ 2^34 | Selection bits, CMux, ring-switching target |
| R_{n_2,q_3} | n_2 = 512 | 23-bit | q_3 ~ 2^23 | Response compression |
| Z_{q_4} | -- | 12-bit | q_4 = 2^12 | Final extraction modulus |
| R_{n_1,p} / R_{n_2,p} | n_1 / n_2 | -- | p = 16 | Plaintext space (VIA-C/VIA-B) |

[^14]: Section 5.1 (p.16) and Appendix B (p.22): VIA-C/VIA-B use q_1 = 137438822401 * 274810798081 ~ 2^75, q_2 = 17175674881 ~ 2^34, q_3 = 8380417 ~ 2^23, q_4 = 2^12, p = 16. Larger q_1 accommodates the additional noise from LWE-to-RLWE conversion and RLWE-to-RGSW conversion.

**Security level:** 110 bits of classical security, estimated using the Lattice Estimator [46]. RLWE and MLWE parameters are aligned so that MLWE security reduces to RLWE over R_{n_1,q_1}.&#8201;[^15]

[^15]: Section 5.1 (p.16): "We choose the lattice parameters to ensure that each of the underlying RLWE/MLWE assumptions which we require for security provides 110 bits of classical security. We use the lattice estimator tool [46] for our security estimates."

<a id="key-data-structures"></a>

### Key Data Structures <a href="#toc">⤴</a>

- **Database:** X in R_{n_2,p}^N, structured as an I x J matrix over R_{n_1,p} where N*n_2 = I*J*n_1. Each entry db[i,j] = iota^{n_2->n_1}((db_{kIJ+iJ+j})_{k in [n_1/n_2]}) packs n_1/n_2 = 4 elements of R_{n_2,p} into one element of R_{n_1,p} via subring embedding.&#8201;[^16]
- **Query (VIA):** Four components: c_rot = RLWE_{S_1}(X^{-gamma}) (rotation), C_ctrl = RGSW_{S_1}(alpha) (log I control bits), C_sel = RGSW_{S_2}(rev(beta)) (log J selection bits), rsk (ring-switching key from S_1 to S_2).
- **Query (VIA-C):** l * log N LWE ciphertexts in Z_{q_1} (each encrypting one bit of index scaled by q_1/B^i), where l is gadget length. Total query size: l * log(IJn_1/n_2) elements of Z_{q_1}.&#8201;[^17]
- **Public parameters (VIA-C):** pp_qck = (c_hat_toRLWE, c_hat_toRGSW) for LWE-to-RLWE and RLWE-to-RGSW conversion; pp_rck for response compression. Uploaded offline. Total: ~14.8 MB.&#8201;[^18]

[^16]: Section 3.1 (p.8-9), Figure 3 (p.9): The encoding packs d = n_1/n_2 = 4 database records per ring element using the subring embedding iota^{n_2->n_1}.

[^17]: Section 4.2 (p.13): VIA-C queries are l * log(IJn_1/n_2) LWE ciphertexts. Each LWE ciphertext contains precisely one non-random element, and pseudorandomness permits further reduction, requiring merely l * log N elements in Z_{q_1}.

[^18]: Table 1 (p.18): VIA-C offline communication is 14.8 MB for all database sizes tested (1 GB, 4 GB, 32 GB).

<a id="database-encoding"></a>

### Database Encoding <a href="#toc">⤴</a>

- **Representation:** I x J matrix over R_{n_1,p}. Each matrix entry packs d = n_1/n_2 = 4 records from R_{n_2,p}.
- **Record addressing:** Index idx decomposes as idx = gamma * IJ + alpha * J + beta, where (alpha, beta, gamma) in [I] x [J] x [n_1/n_2]. Binary representations of alpha and beta serve as DMux control bits and CMux selection bits respectively.
- **Preprocessing required:** NTT conversion of the database over R_{n_1,p}. For VIA, only an NTT per n_1 = 2048 elements is needed (no polynomial interpolation). VIA and VIA-C share the same database encoding.&#8201;[^19]
- **Record size equation:** Each record is log_2(p) bits. VIA: p = 256 so 8 bits/record. VIA-C/VIA-B: p = 16 so 4 bits/record. Variable-size records supported via blinded extraction (multiple sample extractions).&#8201;[^20]

[^19]: Section 5.1 (p.16): "Database encoding in the Setup database phase is not required; only an NTT is performed per n_1 = 2048 elements."

[^20]: Section 3.2 (p.9): Blinded extraction allows the client to send c_rot = Enc(x^{-t}) for any t in [n_1], enabling retrieval of any coefficient. Multi-sample extraction generalizes to variable-sized records.

<a id="database-dimensions-table-4"></a>

### Database Dimensions (Table 4) <a href="#toc">⤴</a>

| Database Size | VIA (I, J) | VIA-C (I, J) |
|---------------|-----------|-------------|
| 1 GB | (2^6, 2^13) | (2^8, 2^12) |
| 4 GB | (2^8, 2^13) | (2^9, 2^13) |
| 32 GB | (2^9, 2^15) | (2^11, 2^14) |

[^21]: Appendix B, Table 4 (p.22): Database dimension choices for VIA and VIA-C across database sizes.

<a id="protocol-phases"></a>

### Protocol Phases <a href="#toc">⤴</a>

#### VIA Protocol (Figure 4, p.10)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Encoding | Server | Compute db[i,j] via subring embedding + NTT | -- | Once per DB update |
| Query | Client | Encrypt index as (c_rot, C_ctrl, C_sel, rsk); compress via PRG seed | 473--675 KB up | Per query |
| Answer Step 1: DMux | Server | DMux(C_ctrl, c_rot) -> I one-hot RLWE ciphertexts | -- | Per query |
| Answer Step 2: ModSwitch | Server | ModSwitch_{q_2,q_2}(c_i^{(0)}) for each i in [I] | -- | Per query |
| Answer Step 3: First dim | Server | c_j^{(2)} = sum_{i in [I]} c_i^{(1)} * db[i,j] for each j in [J] | -- | Per query |
| Answer Step 4: Ring switch | Server | RingSwitch(rsk, c_j^{(2)}) from R_{n_1} to R_{n_2} | -- | Per query |
| Answer Step 5: CMux | Server | CMux(C_sel, (c_j^{(3)})_{j in J}) -> single RLWE ciphertext | -- | Per query |
| Answer Step 6: ModSwitch | Server | ModSwitch_{q_3,q_4}(ans') -> final answer | 15.5 KB down | Per query |
| Decode | Client | Dec_{st}(ans) -> record d | -- | Per query |

#### VIA-C Protocol (Figure 8, p.14)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup (offline) | Client | Generate pp_qck (LWE-to-RLWE + RLWE-to-RGSW keys) and pp_rck (response compression key) | 14.8 MB up | Once per key |
| DB Encoding | Server | Same as VIA | -- | Once per DB update |
| Query | Client | QueryComp(s, b_ctrl, b_sel, b_rot) -> l*log N LWE ciphertexts in Z_{q_1} | 0.57--0.66 KB up | Per query |
| Answer Step 1: QueryDecomp | Server | LWEtoRLWE + RLWEtoRGSW -> C_ctrl, C_sel, C_rot | -- | Per query |
| Answer Steps 2-6: DMux through CMux | Server | Same pipeline as VIA (DMux -> ModSwitch -> FirstDim -> CMux) | -- | Per query |
| Answer Step 7: CRot | Server | CRot(C_rot, c^{(3)}) -> homomorphic rotation | -- | Per query |
| Answer Step 8: RespComp | Server | ModSwitch + RingSwitch + truncation | 1.44 KB down | Per query |
| Decode | Client | RespCompRecover(S_2, ans) -> record d | -- | Per query |

[^22]: Figure 8 (p.14): VIA-C adds query decompression (step 1), CRot (step 6), and response compression (step 7) compared to VIA. The rotation ciphertext is not sent directly; instead, encrypted rotation bits are sent and CRot is applied homomorphically.

#### VIA-B Protocol (Figure 9, p.15)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup (offline) | Client | Same as VIA-C plus repacking keys | 14.8 MB up | Once per key |
| Query | Client | QueryComp for each of T batch indices | 17--145 KB up (batch) | Per batch |
| Answer Steps 1-6 | Server | VIA-C answer pipeline for each of T queries independently | -- | Per batch |
| Answer Step 7: Repack | Server | Repack_{n_2}({c^{(4),t}}_{t in [T]}, pp_qck) -> single RLWE ciphertext | -- | Per batch |
| Answer Step 8: RespComp | Server | Response compression | 1.48--1.81 KB down | Per batch |
| Decode | Client | Recover T records | -- | Per batch |

[^23]: Section 4.7 (p.15-16): VIA-B runs T independent VIA-C queries, then uses homomorphic repacking (MLWEs-to-RLWE conversion) to pack T answers into a single RLWE ciphertext. The repacking algorithm achieves logarithmic noise variance scaling.

<a id="correctness-analysis"></a>

### Correctness Analysis <a href="#toc">⤴</a>

#### Option A: FHE Noise Analysis

VIA-B's correctness analysis (Appendix C.2, which subsumes VIA and VIA-C) tracks variance-based noise through 8 phases.

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| 1. Query decompression | theta_ctrl, theta_sel, theta_rot | Additive (from LWE-to-RLWE + RLWE-to-RGSW) | theta_ctrl depends on l_conv, B_conv, theta_{1,E}, theta_{toRLWE}, theta_{toRGSW} |
| 2. DMux | theta_dmux = theta_ctrl + theta_DMux * log I | Logarithmic in I | theta_DMux depends on gadget params (l_{ctrl}, B_{ctrl}) and theta_ctrl |
| 3. Modulus switching | theta_ms = theta_dmux * q_2^2 / q_1^2 + (1 + n_1 * theta_{1,S})/12 | Multiplicative (q_2/q_1 ratio) + additive | Reduces noise by (q_2/q_1)^2 factor |
| 4. First dimension | theta_first = I * n_1 * theta_ms * p^2/4 | Linear in I, quadratic in p | Dominant cost: plaintext-ciphertext multiply across I rows |
| 5. CMux | theta_cmux = theta_first + theta_CMux * log J | Logarithmic in J | theta_CMux depends on gadget params (l_{sel}, B_{sel}) and theta_sel |
| 6. CRot | theta_crot = theta_cmux + log(n_1/n_3) * theta_CRot | Logarithmic in n_1/n_3 | theta_CRot depends on gadget params (l_{rot}, B_{rot}) and theta_rot |
| 7. Repacking | theta_rep = theta_crot + 2 * theta_ks * log n_2 | Logarithmic in n_2 | MLWEs-to-RLWE conversion adds 2*theta_ks*log n_2 |
| 8. Response compression | theta_ans (final) | Additive | Modulus switch + ring switch + key switch |

[^24]: Appendix C.2 (p.25-27): Full noise cascade for VIA-B. Each phase's noise variance is tracked via Lemmas C.1-C.5.

- **Correctness condition:** ||E_final||_inf <= floor((q_3 - q_4)/p)/2 - 1. Pr[correct] >= erfc((floor((q_3 - q_4)/p)/2 - 1) / sqrt(2 * theta_ans)).
- **Independence heuristic used?** Yes -- noise terms from different operations are assumed independent (variance-based tracking).
- **Dominant noise source:** First-dimension folding (theta_first = I * n_1 * theta_ms * p^2/4), which is linear in I and quadratic in the plaintext modulus p. This explains why VIA-C uses p = 16 (vs. VIA's p = 256) -- smaller p drastically reduces first-dimension noise, enabling the larger q_1 needed for query compression.&#8201;[^25]

[^25]: Section 5.1 (p.16) and Figure 11 (p.19): First dimension processing is the dominant computational overhead. VIA uses p = 256 (8-bit records), VIA-C uses p = 16 (4-bit records). The smaller p in VIA-C reduces first-dimension noise but also reduces per-query record size.

<a id="gadget-parameters"></a>

### Gadget Parameters <a href="#toc">⤴</a>

#### VIA (Table 5)

| Component | Gadget Length (l) | Gadget Base (B) |
|-----------|------------------|----------------|
| DMux | (2, 2) | (370758, 370758) |
| CMux | (4, 3) | (24, 24) |
| Ring-Switching Key | 4 | 24 |

#### VIA-C / VIA-B (Table 6)

| Component | Gadget Length (l) | Gadget Base (B) |
|-----------|------------------|----------------|
| DMux | (2, 2) | (55879, 55879) |
| CMux | (2, 2) | (81, 81) |
| Conversion Key | 18 | 18 |
| Ring-Switching Key | 8 | 8 |

[^26]: Appendix B, Tables 5-6 (p.23): Gadget parameters for VIA and VIA-C/VIA-B. The notation (l_1, l_2) and (B_1, B_2) for DMux and CMux corresponds to the two RLev components within each RGSW ciphertext, which may use different parameters.

<a id="complexity"></a>

### Complexity <a href="#toc">⤴</a>

#### Core metrics

| Metric | Asymptotic | Concrete (32 GB) | Phase |
|--------|-----------|-------------------|-------|
| **VIA** | | | |
| Query size | O_lambda(log N) | 674.75 KB | Online |
| Response size | O_lambda(1) | 15.5 KB | Online |
| Server computation | O_lambda(N) | 10.286 s | Online |
| Throughput | -- | 3.11 GB/s | Online |
| **VIA-C** | | | |
| Query size | O_lambda(log N) | 0.659 KB | Online |
| Response size | O_lambda(1) | 1.439 KB | Online |
| Server computation | O_lambda(N) | 20.307 s | Online |
| Throughput | -- | 1.58 GB/s | Online |
| Offline communication | O_lambda(1) | 14.8 MB up | Offline (once) |
| Offline computation | O_lambda(N) | 67.539 s | Offline (once) |
| **VIA-B (T=256, 1 GB, 1-byte records)** | | | |
| Query size | -- | 145.31 KB | Online |
| Response size | -- | 1.81 KB | Online |
| Offline communication | -- | 14.8 MB up | Offline (once) |

[^27]: Table 1 (p.18): Performance comparison at 32 GB. VIA online communication total: 690.25 KB. VIA-C online communication total: 2.098 KB.

[^28]: Table 3 (p.20): Asymptotic analysis. VIA: offline comp O_lambda(N), offline comm "-" (none), online comp O_lambda(N), online comm O_tilde_lambda(1). VIA-C: offline comp O_lambda(N), offline comm O_lambda(1), online comp O_lambda(N), online comm O_tilde_lambda(1).

#### FHE-specific metrics

| Metric | VIA | VIA-C |
|--------|-----|-------|
| Expansion factor (F) | q_3/p = 2^31/256 ~ 2^23 (pre-extraction); effective ~ 15.5 KB / (log_2(256)/8) = 15.5 KB per byte | q_4/p = 2^12/16 = 256; effective ~ 1.44 KB per 0.5 byte |
| Multiplicative depth | 1 (first-dim is plaintext-ciphertext multiply, DMux/CMux are external products) | Same |
| Security level | 110-bit classical | 110-bit classical |

<a id="performance-benchmarks"></a>

### Performance Benchmarks <a href="#toc">⤴</a>

**Hardware:** AMD 9950X CPU, 128 GB RAM, Ubuntu 22.04.5. Compiler: clang 19.1.7 with AVX-512DQ and AVX-512IFMA52 instruction sets. Single-threaded execution. All measurements averaged over at least 5 trials with standard deviation at most 5%.&#8201;[^29]

[^29]: Section 5.2 (p.17): Experimental setup details.

#### Table 1: VIA and VIA-C vs. prior work (single query, record size = log_2(p) bits)

| Metric | HintlessPIR | YPIR | **VIA** | SimplePIR | Respire | **VIA-C** |
|--------|------------|------|---------|-----------|---------|-----------|
| *1 GB database* | | | | | | |
| Offline Comm | -- | -- | -- | 128 MB | 3.9 MB | 14.8 MB |
| Offline Comp | -- | 12.18 s | 1.06 s | 94.1 s | 33.75 s | 2.09 s |
| Query Size | 453 KB | 846 KB | 473.1 KB | 128 KB | 7.66 KB | 0.568 KB |
| Response Size | 3080 KB | 12 KB | 15.5 KB | 128 KB | 2 KB | 1.439 KB |
| Online Comp | 2.193 s | 0.465 s | 0.442 s | 0.064 s | 1.871 s | 0.83 s |
| Throughput | 466.9 MB/s | 2.15 GB/s | 2.26 GB/s | 15.63 GB/s | 547.3 MB/s | 1.2 GB/s |
| *32 GB database* | | | | | | |
| Offline Comm | -- | -- | -- | 724 MB | 3.9 MB | 14.8 MB |
| Offline Comp | -- | 315.231 s | 33.34 s | 3376.47 s | 1101.33 s | 67.539 s |
| Query Size | 1064 KB | 2560 KB | 674.75 KB | 724 KB | 57.77 KB | 0.659 KB |
| Response Size | 17514 KB | 12 KB | 15.5 KB | 724 KB | 2 KB | 1.439 KB |
| Online Comp | 17.391 s | 7.086 s | 10.286 s | 2.674 s | 45.851 s | 20.307 s |
| Throughput | 1.84 GB/s | 4.52 GB/s | 3.11 GB/s | 11.97 GB/s | 714.66 MB/s | 1.58 GB/s |

[^30]: Table 1 (p.18): Full benchmark table. Values are exact (copied from table).

#### Table 2: VIA-B vs. Respire-B (batch, 1-byte records)

| DB | Metric | Respire (T=32) | VIA-B (T=32) | Respire (T=256) | VIA-B (T=256) |
|----|--------|---------------|-------------|----------------|--------------|
| 256 MB | Offline Comm | 4.6 MB | 14.8 MB | 4.6 MB | 14.8 MB |
| | Query Size | 67 KB | 17 KB | 326 KB | 135.9 KB |
| | Response Size | 31.8 KB | 1.48 KB | 234 KB | 1.81 KB |
| 1 GB | Offline Comm | 4.6 MB | 14.8 MB | 4.6 MB | 14.8 MB |
| | Query Size | 113 KB | 18.16 KB | 513 KB | 145.31 KB |
| | Response Size | 31.8 KB | 1.48 KB | 230 KB | 1.81 KB |

[^31]: Table 2 (p.20): Comparison of VIA-B and batched Respire for 1-byte records. VIA-B achieves 3.5x query size reduction and 127x response size reduction at T=256 for 1 GB.

<a id="comparison-with-prior-work"></a>

### Comparison with Prior Work <a href="#toc">⤴</a>

#### Without offline communication (32 GB)

| Metric | **VIA** | YPIR | HintlessPIR |
|--------|---------|------|-------------|
| Query size | 674.75 KB | 2560 KB | 1064 KB |
| Response size | 15.5 KB | 12 KB | 17514 KB |
| Total online comm | 690.25 KB | 2572 KB | 18578 KB |
| Throughput | 3.11 GB/s | 4.52 GB/s | 1.84 GB/s |
| Offline comp | 33.34 s | 315.231 s | -- |
| Comm reduction vs. YPIR | 3.7x | -- | -- |

#### With offline communication (32 GB)

| Metric | **VIA-C** | Respire | SimplePIR |
|--------|-----------|---------|-----------|
| Query size | 0.659 KB | 57.77 KB | 724 KB |
| Response size | 1.439 KB | 2 KB | 724 KB |
| Total online comm | 2.098 KB | 59.77 KB | 1448 KB |
| Throughput | 1.58 GB/s | 714.66 MB/s | 11.97 GB/s |
| Offline comm | 14.8 MB | 3.9 MB | 724 MB |
| Offline comp | 67.539 s | 1101.33 s | 3376.47 s |
| Comm reduction vs. Respire | 28.5x | -- | -- |
| Comm reduction vs. SimplePIR | 690x | -- | -- |

[^32]: Section 5.2 (p.17): "Without offline communication, VIA achieves 690.25 KB online communication for a 32 GB database -- 3.7x reduction compared to YPIR and a 26.9x compared to HintlessPIR."

[^33]: Section 5.2 (p.17): "With offline communication, VIA-C achieves a 0.659 KB query for a 32 GB database -- an 87.6x reduction relative to Respire. Total online communication is reduced 28.5x versus Respire."

**Key takeaway:** VIA is the preferred hintless scheme when minimizing total online communication is paramount and throughput requirements are in the low-GB/s range. It dominates HintlessPIR in all metrics and reduces YPIR's communication by 3.7x while maintaining comparable throughput (3.11 vs. 4.52 GB/s). VIA-C is preferred when offline communication is acceptable and ultra-low online communication is needed -- it achieves 2.1 KB total online for 32 GB, making it suitable for bandwidth-constrained clients. VIA-B extends VIA-C to batch queries on tiny-record databases, achieving 127x response reduction over Respire-B.

<a id="portable-optimizations"></a>

### Portable Optimizations <a href="#toc">⤴</a>

- **DMux-CMux architecture:** Applicable to any RLWE-based PIR scheme that currently uses coefficient expansion to generate encrypted one-hot vectors. Reduces the required number of query ciphertexts from O(I) to O(log I), eliminating the need for automorphism-based expansion and client-specific public parameters. The key insight is that logarithmically many RGSW control bits suffice to propagate a single RLWE ciphertext to the target position via a binary tree of external products.&#8201;[^34]
- **LWE-to-RLWE conversion via iterative MLWE-to-MLWE:** Generalizable to any scheme needing LWE-to-RLWE format conversion. Achieves O(n log n) noise variance vs. O(n^3) in [28], with compact (logarithmic) public parameters. Can replace the LWE-to-RLWE step in YPIR, Respire, HintlessPIR, InsPIRe.&#8201;[^35]
- **Modulus switching before first-dimension folding:** Reduces computational cost of the plaintext-ciphertext multiply phase by operating under a smaller modulus. Applicable to any scheme with a first-dimension folding step (Spiral, Respire, WhisPIR).&#8201;[^36]
- **Homomorphic repacking (MLWEs-to-RLWE):** Generalizes LWE-to-RLWE to pack multiple MLWE ciphertexts into one RLWE ciphertext with logarithmic noise variance. Useful for batch PIR constructions beyond VIA-B.&#8201;[^37]
- **MLWE as a portable concept:** MLWE bridges LWE (m=1) and RLWE (n=1), parameterized by module rank m. The conversion chain LWE -> (n/2, 2)-MLWE -> (n/4, 4)-MLWE -> ... -> (1, n)-MLWE = RLWE provides a smooth interpolation with controllable noise at each step.

[^34]: Section 1.1 (p.3) and Section 3.1 (p.8): "VIA substitutes coefficient expansion techniques with DMux for generating the encrypted one-hot vector, introducing only logarithmic noise variance."

[^35]: Lemma 4.2 (p.12): "The LWE-to-RLWE conversion algorithm introduces O(n log n) noise variance," compared to O(n^3) for the approach in [28].

[^36]: Section 3.1 (p.8): "We implement modulus switching before first-dimensional folding. This optimization significantly reduces computational overhead for first-dimensional folding while incurring negligible additional error."

[^37]: Section 1.1 (p.4): The homomorphic repacking algorithm "introduces only logarithmic noise variance, making it suitable for large-scale ciphertext repacking scenarios."

<a id="implementation-notes"></a>

### Implementation Notes <a href="#toc">⤴</a>

- **Language / Library:** C++, approximately 4,000 lines of code. Custom implementation (no SEAL/OpenFHE dependency).&#8201;[^38]
- **Polynomial arithmetic:** NTT-based. CRT decomposition used for multi-prime moduli (q_1 = q_{1,1} * q_{1,2}).
- **SIMD / vectorization:** AVX-512DQ and AVX-512IFMA52 instruction sets enabled for all schemes.
- **Parallelism:** Single-threaded for all benchmarks.
- **Open source:** https://anonymous.4open.science/r/VIA-8888/ (anonymized at time of writing).&#8201;[^39]

[^38]: Section 5.2 (p.17): "Our implementation of VIA and VIA-C contains roughly 4,000 lines of C++."

[^39]: Section 1.2 (p.4): Code anonymously open-sourced.

<a id="deployment-considerations"></a>

### Deployment Considerations <a href="#toc">⤴</a>

- **Database updates:** Re-encode via NTT (lightweight); no hint invalidation for VIA. VIA-C/VIA-B: offline evaluation keys are independent of the database, so database updates do not require re-uploading keys.
- **Sharding:** Not discussed, but the I x J matrix structure is naturally shardable by rows.
- **Key rotation / query limits:** Not discussed. Circular security / KDM assumption required.
- **Anonymous query support:** VIA: yes (fully stateless, no offline communication). VIA-C/VIA-B: limited -- the client must upload evaluation keys in an offline phase, which is per-client and secret-key-dependent.
- **Cold start suitability:** VIA: excellent (no offline phase). VIA-C: requires 14.8 MB offline upload before first query.
- **Record size flexibility:** Blinded extraction (Section 3.2) allows retrieving any coefficient position in [n_1], supporting variable record sizes. Multi-sample extraction generalizes further.&#8201;[^40]

[^40]: Section 3.2 (p.9): Blinded extraction allows c_rot = Enc(x^{-t}) for arbitrary t in [n_1], and multi-sample extraction extends to variable-sized records.

<a id="key-tradeoffs-limitations"></a>

### Key Tradeoffs & Limitations <a href="#toc">⤴</a>

- **VIA vs. YPIR throughput:** VIA's throughput (3.11 GB/s at 32 GB) is lower than YPIR's (4.52 GB/s) because YPIR's memory-bandwidth-bound architecture (plain LWE matrix-vector multiply) is fundamentally faster for the first-dimension step. VIA trades throughput for 3.7x lower communication.
- **VIA-C's smaller plaintext modulus:** To accommodate query compression noise (LWE-to-RLWE + RLWE-to-RGSW), VIA-C uses p = 16 (4-bit records) vs. VIA's p = 256 (8-bit records). This means VIA-C requires more queries per byte of useful data for records > 4 bits.
- **VIA-C's larger q_1:** VIA-C requires a 75-bit q_1 (vs. VIA's 57-bit) to accommodate query decompression noise. This increases first-dimension computation cost by approximately 2x.&#8201;[^41]
- **Offline communication for VIA-C/VIA-B:** 14.8 MB of evaluation keys must be uploaded per client, making VIA-C unsuitable for anonymous or ephemeral access patterns.
- **Security level:** All variants target 110-bit classical security (not the standard 128-bit), which may be insufficient for some deployment scenarios.
- **Preprocessing time advantage:** VIA's preprocessing (33.34 s for 32 GB) is 9.5x faster than YPIR and 50x faster than SimplePIR, consisting solely of database NTT encoding with a small modulus.

[^41]: Section 5.2 (p.19): "VIA employs a 256-bit modulus, whereas VIA-C utilizes a 16-bit modulus. This disparity necessitates twice the computational cost for VIA-C relative to VIA at equivalent database scales."

<a id="related-papers-in-collection"></a>

### Related Papers in Collection <a href="#toc">⤴</a>

- **Spiral [Group A]:** VIA inherits the Regev+GSW composition and external product framework. VIA's DMux-CMux replaces Spiral's coefficient expansion + ciphertext translation.
- **Respire [Group B]:** VIA's direct predecessor in architecture (I x J matrix, ring switching, CMux, sample extraction). VIA replaces Respire's coefficient expansion with DMux, eliminating Respire's offline communication.
- **YPIR [Group B]:** Closest hintless competitor. YPIR uses CDKS ring packing for query compression; VIA uses DMux. VIA achieves 3.7x lower communication but ~1.5x lower throughput at 32 GB.
- **HintlessPIR [Group B]:** VIA reduces communication by 26.9x vs. HintlessPIR at 32 GB while maintaining comparable throughput.
- **SimplePIR [Group C]:** SimplePIR achieves highest throughput (11.97 GB/s) but requires 724 MB offline communication. VIA-C achieves 690x lower online communication at 1.58 GB/s throughput.
- **HERMES [ref 29]:** MLWE packing technique. VIA's LWE-to-RLWE conversion is functionally equivalent in the single-ciphertext case but differs in implementation details (log n midpoints, single-ciphertext focus).

<a id="open-problems"></a>

### Open Problems <a href="#toc">⤴</a>

- Can the throughput gap between VIA and YPIR/SimplePIR be closed while maintaining logarithmic communication?
- Can VIA-C's plaintext modulus be increased (e.g., to p = 256) without prohibitive noise growth from query decompression?
- Can the DMux-CMux technique be adapted to multi-server settings or combined with preprocessing for further communication reduction?

<a id="uncertainties"></a>

### Uncertainties <a href="#toc">⤴</a>

- **Subscript conventions for theta:** The paper uses multi-level subscripts extensively (theta_ctrl, theta_DMux, theta_cmux, theta_crot, etc.). The correctness analysis in Appendix C.2 defines each per-phase noise variance, but some symbols (e.g., theta_ctrl for the RGSW ciphertext noise vs. theta_ctrl for the overall control-bit phase noise) are overloaded between the VIA direct-query case and the VIA-C query-decompression case.
- **Record size ambiguity for VIA benchmarks:** Table 1 does not explicitly state the record size in bytes. From the parameters: VIA retrieves log_2(256) = 8 bits per query; VIA-C retrieves log_2(16) = 4 bits per query. The "record" is a single element of R_{n_2,p}, but the paper also discusses blinded extraction for larger records. Benchmark figures appear to measure single-element retrieval.
- **VIA-B vectorization threshold:** Section 4.7 (p.15-16) states VIA-B "eliminates vectorization entirely for batch sizes below 2048" but this is only explicitly benchmarked for T = 32 and T = 256.
- **ePrint number:** The paper is referenced as ePrint 2025/2074 in the file path but the actual ePrint URL should be verified.
