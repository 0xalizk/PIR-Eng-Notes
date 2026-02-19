## OnionPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [OnionPIR: Response Efficient Single-Server PIR](https://eprint.iacr.org/2021/1081) (2021) |
| **Archetype** | Construction (primary) |
| **PIR Category** | Group A — FHE-based |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | Circular security (implicit in RGSW key-encryption for query expansion)[^circular] |
| **Correctness model** | Deterministic (noise budget is analytically bounded; no probabilistic failure) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Large (30 KB per entry in experiments)[^recordsize] |
[^circular]: RGSW encryption of the secret key A = RGSW(-s) is provided to the server for query expansion (Algorithm 2, line 12-13). This implicitly requires a circular-security assumption.
[^recordsize]: Section 6.2, p.10: "We set each database entry to be 30 KB."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SealPIR (Angel et al., 2018) [Group A], XPIR (Aguilar-Melchor et al., 2016) [Group A], Onion Ring ORAM (Chen, Chillotti, Ren, 2019) |
| **What changed** | SealPIR uses BFV ciphertext multiplication for processing higher dimensions, causing multiplicative noise growth (exponential in depth). OnionPIR replaces this with external products (GSW x Regev), which produce only additive noise growth, enabling higher-dimensional hypercubes, a larger plaintext modulus t, and a dramatically smaller ciphertext expansion factor F (4.2x vs ~100x).[^whatchanged] |
| **Superseded by** | OnionPIRv2 / FHEPIR_2025 (engineering optimization) |
| **Concurrent work** | SHECS-PIR (Park and Tibouchi, 2020) — also uses external products but with >2x computation cost over SealPIR[^concurrent]; Ali et al. (2019) — BFV ciphertext multiplication + modulus switching, ~900s computation[^concurrent2] |

[^whatchanged]: Section 1, p.1 "Main contribution 1": "The main technique is to carefully control the noise growth from the ciphertext operations on the server." Section 4.1, p.5: "the noise only grows additively after each external product operation."
[^concurrent]: Section 7, p.12: "Park and Tibouchi present a construction based on external products that improve the response overhead to 16x; but their computation cost more than doubled compared to SealPIR."
[^concurrent2]: Section 7, p.12: "Ali et al. also gives a protocol... to retrieve 60 KB entry from a database with one million entries requires around 900 seconds."

### Core Idea

OnionPIR achieves a 4.2x response overhead (vs. the insecure baseline of downloading the raw entry), compared to SealPIR's ~100x, by replacing BFV ciphertext multiplications with external products (RGSW x BFV). External products grow noise only additively (O(B * Err(C) + Err(d))) rather than multiplicatively (O(t * (Err(ct1) + Err(ct2)))), which allows: (1) representing the database as a higher-dimensional hypercube (d = 1 + ceil(log_4(N/128)) dimensions instead of 2), (2) using a larger plaintext modulus t = 60 bits (vs. SealPIR's 12 bits), and (3) reducing the ciphertext expansion factor F from ~10 to ~4.2.[^coreidea] A secondary technique, DecompMul, handles the first dimension using decomposed ciphertext-plaintext multiplication to balance noise and computation.

[^coreidea]: Abstract, p.1: "OnionPIR achieves a response size overhead of just 4.2x over the insecure baseline, in contrast to the 100x response overhead of state-of-the-art schemes."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (Ring Learning With Errors)[^rlwe] |
| **Encryption/encoding scheme(s)** | BFV (Brakerski/Fan-Vercauteren) for data ciphertexts + RGSW for query vectors in dimensions 2..d. First dimension uses BFV queries processed via DecompMul.[^schemes] |
| **Ring / Field** | R = Z[x]/(x^n + 1) with n = 4096, ciphertext modulus q = 124 bits, plaintext modulus t = 60 bits[^ring] |
| **Key structure** | Binary secret s sampled from "small" distribution (SEAL defaults); client provides RGSW(-s) to server for query expansion[^keystructure] |
| **Correctness condition** | Noise in final BFV ciphertext must satisfy Err(ct_resp) < floor(q/t)/2 for correct decryption[^correctness] |

[^rlwe]: Section 2.1, p.2: "The security of lattice-based SHE is based on the hardness of Learning With Errors (LWE) or its variant on the polynomial ring (RLWE)."
[^schemes]: Section 4.1, p.5: warm-up uses RGSW for all query vectors with external products. Section 4.2, p.5-6: improved protocol uses BFV for first dimension (DecompMul) and RGSW for remaining dimensions (external products).
[^ring]: Section 6.2, p.10: "We set the polynomial degree n to 4096 and the size of coefficient modulus q to 124 bits... plaintext modulus t to 60 bits."
[^keystructure]: Algorithm 2, p.7: "A = RGSW(-s), RGSW encryption of the client's secret key."
[^correctness]: Section 2.1, p.2: "Since the message is encoded in the most significant bits and the noise e is small, rounding mu recovers m."

### Key Data Structures

- **Database as hypercube:** N entries organized as N_1 x N_2 x ... x N_d where N_1 = 128 and N_2 = N_3 = ... = N_d = 4. Total dimensions d = 1 + ceil(log_4(N/128)).[^hypercube]
- **Decomposed database:** Each 30 KB entry is decomposed into two halves of log(t)/2 = 30 bits each via DecompPlain(pt) before first-dimension processing.[^decomp]
- **Packed query ciphertext:** All query bits for all d dimensions packed into a single BFV ciphertext. First dimension: 2 values per query bit (256 total). Higher dimensions: l values per query bit (4l(d-1) total). With l = 5 and 10^6 entries, 386 values packed into one ciphertext with n = 4096 slots.[^querypacking]

[^hypercube]: Section 4.4, p.7: "The size of the first dimension is N_1 = 128 and each of the remaining dimensions is of size 4. The total number of dimensions is thus d = 1 + ceil(log_4(N/N_1))."
[^decomp]: Section 4.2, p.6, Figure 4: "DecompPlain(pt): Decompose input pt into two parts each of size log(t)/2 bits."
[^querypacking]: Section 4.3, p.7: "We pack two values for each query bit, hence, in total 256 values for the first dimension... a total of 386 values will be packed."

### Database Encoding

- **Representation:** d-dimensional hypercube with N_1 = 128 along the first axis and N_i = 4 for i >= 2.[^dbenc1]
- **Record addressing:** Multi-index (i_1, ..., i_d) where i_j is the position in the j-th dimension of the hypercube.[^dbenc2]
- **Preprocessing required:** Server decomposes each entry via DecompPlain into two halves of log(t)/2 bits before the protocol begins (Algorithm 3, line 1).[^dbenc3]
- **Record size equation:** With n = 4096 and t = 60-bit, each ciphertext holds 4096 * 60 / 8 = 30 KB of plaintext data, so one entry fits in a single BFV ciphertext.[^dbenc4]

[^dbenc1]: Section 4.4, p.7.
[^dbenc2]: Algorithm 3, p.8, line 2: "Client converts idx into a vector (i_1, ... i_d)."
[^dbenc3]: Algorithm 3, p.8, line 1: "Server computes {pt_j} = {DecompPlain(DB_j)}."
[^dbenc4]: Section 6.2, p.10: "With n = 4096 and 60-bit t, 30 KB of plaintext data can fit in a single ciphertext."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| DB Decomposition | Server | DecompPlain on each entry | — | Once (preprocessing) |
| Query Generation | Client | Convert index to d binary query vectors; pack all into single BFV ciphertext via QueryPack (Alg. 1) | 64 KB up[^querysize] | Per query |
| Query Unpacking | Server | Expand single ciphertext into d query vectors using BFV expansion + external products with RGSW(-s) (Alg. 2) | — | Per query |
| First-Dimension Dot Product | Server | DecompMul between BFV query vector and decomposed plaintext columns | — | Per query |
| Higher-Dimension Dot Products | Server | External products between RGSW query vectors and intermediate BFV ciphertexts | — | Per query |
| Response | Server | Send single BFV ciphertext | 128 KB down[^respsize] | Per query |
| Decode | Client | BFV decrypt to recover plaintext entry | — | Per query |

[^querysize]: Section 4.4, p.8: "Using the pseudorandom seed optimization... the request size is 64 KB."
[^respsize]: Section 4.4, p.8: "We set the ciphertext modulus q to 124 bits (padded to 128 bits in the implementation). The plaintext modulus t is set to 60 bits. This gives a ciphertext expansion factor F ≈ 4.2. The response is thus only 4.2x larger than the plaintext entry." 128 KB = 30 KB * 4.2 ≈ 126 KB, padded.

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Packed query ciphertext | BFV | 64 KB (with seed optimization)[^qstruct1] | Encrypts all d query vectors |
| RGSW(-s) | RGSW | Provided once at initialization | Server-side query expansion key |
| Pseudorandom seed | Plaintext | Small | Replaces random c_0 component to halve request size[^qstruct2] |

[^qstruct1]: Section 4.4, p.8: "the request size is 64 KB."
[^qstruct2]: Section 4.3, p.7: "instead of sending a truly random c_0, the client can generate a pseudorandom c_0 from a short random seed and send the seed to the server. This optimization reduces the request size in half."

### Novel Primitives / Abstractions

#### DecompMul (Decomposed Ciphertext-Plaintext Multiplication)

| Field | Detail |
|-------|--------|
| **Name** | DecompMul |
| **Type** | Cryptographic operation (variant of ciphertext-plaintext multiplication) |
| **Interface / Operations** | DecompMul(pt', ct') where pt' = DecompPlain(pt) = {pt_1, pt_2} (two halves of log(t)/2 bits each) and ct' = DecompEncrypt(b) = {b * 2^{log(t)/2}, b} (two BFV ciphertexts). Output: dot product pt' . ct' = BFV ciphertext encrypting m * b.[^decompmul_interface] |
| **Purpose** | Reduce noise from first-dimension ciphertext-plaintext multiplication. Standard BFV ct-ptxt multiply adds noise proportional to the full plaintext modulus t. DecompMul decomposes both operands into halves of sqrt(t), so each sub-multiply adds noise proportional to sqrt(t) ≈ log(t)/2 bits instead of t.[^decompmul_purpose] |
| **Built from** | BFV ciphertext-plaintext multiplication applied to decomposed operands |
| **Standalone complexity** | Same computational cost as two BFV ciphertext-plaintext multiplications plus one addition[^decompmul_cost] |
| **Noise growth** | O(sqrt(t) * Err(ct)) per DecompMul, vs O(t * Err(ct)) for standard ct-ptxt multiply. Approximately log(t)/2 bits of noise added per operation.[^decompmul_noise] |

[^decompmul_interface]: Figure 4, p.6: "(1) pt' = {pt_1, pt_2} ← DecompPlain(pt)... (2) ct' = {ct_1, ct_2} ← DecompEncrypt(b)... (3) ct ← DecompMul(pt', ct'): Computes the dot-product."
[^decompmul_purpose]: Section 4.2, p.6: "Inspired by the external product technique which reduces noise growth by decomposing a ciphertext into smaller parts, our solution is to decompose the plaintext before multiplying them with the encrypted query vector."
[^decompmul_cost]: Figure 4 shows two multiplications plus an addition.
[^decompmul_noise]: Section 4.2, p.6: "each DecompMul operation adds about log(t)/2 bits of noise."

#### Benes Copy Network (for Stateful OnionPIR)

| Field | Detail |
|-------|--------|
| **Name** | Homomorphic Benes Copy Network |
| **Type** | Data structure / routing network |
| **Interface / Operations** | Input: N encrypted data items + copy requests (which item, how many copies). Output: array of b = 1.5ck encrypted entries with desired replication. Each 2x2 switch is a homomorphic mux gate constructed via external product (BFV input x RGSW control bit).[^benes_interface] |
| **Purpose** | Privately replicate database entries for the PBSR (Private Batch Sum Retrieval) construction in stateful OnionPIR. The copy network replicates each entry the desired number of times, then a permutation network shuffles the output to hide which entries overlap across subsets.[^benes_purpose] |
| **Built from** | N x N Benes interconnection network with 2 log N - 1 stages, each containing N/2 switches. Each switch uses two mux gates (Figure 6) constructed from external products.[^benes_built] |
| **Noise growth** | Each input passes through 2 log N - 1 switches; noise grows only logarithmically in N since external products are additive.[^benes_noise] |

[^benes_interface]: Section 5.2, p.9: "each switch can be constructed using two mux gates. Chillotti et al. use external product to construct a homomorphic mux gate. Specifically, each input is a BFV ciphertext and the control bit is a RGSW ciphertext."
[^benes_purpose]: Section 5.2, p.9: "the server knows that the adjacent entries are likely copies of the same database entry. This may leak information... This is why we need the permutation step."
[^benes_built]: Section 5.2, p.9: "It is a N x N interconnection network with 2 log N - 1 stages. Each stage contains N/2 nodes where each node is a 2 x 2 switch."
[^benes_noise]: Section 5.2, p.9: "Each input to the copy network passes through 2 log N - 1 switches, so the noise in the output ciphertext only increases logarithmically in N."

### Correctness Analysis

#### Option A: FHE Noise Analysis

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| After query expansion (BFV + RGSW) | Err(ct_exp) <= O(w^2) * Err(BFV) | Multiplicative (in packed bits w) | w = total packed query bits. Because fewer bits are packed (logarithmic in d), this is modest.[^noise_exp] |
| After first dimension (DecompMul) | Err(ct_1) = O(w^2 * N_1 * B') * Err(BFV) | Multiplicative | N_1 = 128. B' = max value of decomposed plaintext = 2^{log(t)/2} = 2^30.[^noise_first] |
| After dimensions 2..d (external products) | Err(ct_resp) <= Err(ct_1) + O(d) * Err(ct_exp) | Additive | Critical insight: external products add noise additively, not multiplicatively. d-1 additional dimensions add O(d) * Err(ct_exp), which is insignificant compared to Err(ct_1).[^noise_ext] |

- **Correctness condition:** Err(ct_resp) < floor(q/t) / 2[^noise_correct]
- **Independence heuristic used?** No explicit mention.
- **Dominant noise source:** First-dimension DecompMul dot product, which grows by O(w^2 * N_1 * B') * Err(BFV).[^noise_dominant]

**Why external products control noise better than BFV multiplication:**

The key insight is captured in Table 1 (p.3). BFV ciphertext multiplication has noise growth O(t * (Err(ct_1) + Err(ct_2))), which is multiplicative in the plaintext modulus t and in the current noise level. Applying L such multiplications in sequence yields noise exponential in L: O(t^L * N) * Err(BFV).[^noise_comparison_exp]

External products have noise growth O(B * Err(C) + Err(d)), which is additive in the existing noise. Applying L external products yields noise only L times larger: roughly L * O(B * Err(C) + Err(d)). This is why SealPIR was limited to d = 2 dimensions (one BFV multiplication), while OnionPIR can use d = 5+ dimensions.[^noise_comparison_add]

[^noise_exp]: Section 4.4, p.8: "The noise in the unpacked ciphertext (RGSW and BFV both) is bounded by: Err(ct_exp) <= O(w^2) * Err(BFV)."
[^noise_first]: Section 4.4, p.8: "the noise increases by a factor of O(N_1 * B')... Err(ct_1) = O(w^2 * N_1 * B') * Err(BFV)."
[^noise_ext]: Section 4.4, p.8: "Subsequent dimensions use external products and the noise increase is additive and insignificant. Err(ct_resp.) <= Err(ct_1) + O(d) * Err(ct_exp)."
[^noise_correct]: Section 2.1, p.2.
[^noise_dominant]: Section 4.4, p.8.
[^noise_comparison_exp]: Section 4.4, p.8: "had we used BFV ciphertext multiplications instead of external products, the noise in the output ciphertext would have grown exponentially to Err(ct_resp.) <= O(t^d * N) * Err(BFV). This noise grows too fast with the number of dimensions d, which is why prior works were limited to d = 2."
[^noise_comparison_add]: Section 2.2, p.3, Table 1: "the noise growth in the external product is additive, which allows the evaluation of deeper circuits." Section 3, p.3: "external product operations increase noise additively."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (N = 10^6, 30 KB entries) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(1) ciphertexts (single BFV ct) | 64 KB[^c_query] | Online |
| Response size | O(1) ciphertexts (single BFV ct) | 128 KB[^c_resp] | Online |
| Server computation | O(N) polynomial multiplications[^c_server_asymp] | ~101 s (N = 2^18)[^c_server_conc] | Online |
| Client computation | Encrypt + decrypt (negligible) | Not reported separately | Online |
| Response overhead (F) | 2 log q / log t | 4.2x[^c_F] | — |

[^c_query]: Section 4.4, p.8. Remains 64 KB for all practical database sizes up to 2^390.
[^c_resp]: Section 6.3, p.11: "the response size is only 128 KB."
[^c_server_asymp]: Section 4.4, p.8: "The total number of polynomial multiplications required by the dot product operations is about 2 * N + 4 * l * (N/N_1 + N/(N_1*N_2) + ...). ... the computational cost is dominated by the 2N polynomial multiplications."
[^c_server_conc]: Table 3, p.11.
[^c_F]: Section 4.4, p.8: "This gives a ciphertext expansion factor F ≈ 4.2."

#### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Expansion factor (F) | 2 log q / log t | 4.2 (q = 124 bit, t = 60 bit)[^fhe_F] | — |
| Ciphertext modulus q | — | 124 bits[^fhe_q] | — |
| Plaintext modulus t | — | 60 bits[^fhe_t] | — |
| Ring dimension n | — | 4096[^fhe_n] | — |
| Decomposition factor l | — | 5 (for RGSW gadget)[^fhe_l] | — |
| Hypercube dimensions d | 1 + ceil(log_4(N/128)) | 5 (for N = 10^6)[^fhe_d] | — |
| Security level | — | ~111 bits (LWE estimator, Albrecht et al.)[^fhe_sec] |  — |

[^fhe_F]: Section 4.4, p.8. SealPIR, in comparison, has F = 10 with q set to 60 bits and t = 12 bits.
[^fhe_q]: Section 6.2, p.10: "coefficient modulus q to 124 bits." This is moderately large; enables t = 60 bits while maintaining security.
[^fhe_t]: Section 6.2, p.10.
[^fhe_n]: Section 6.2, p.10.
[^fhe_l]: Section 2.2, p.3: "Typically, l is set to 5."
[^fhe_d]: Section 4.4, p.7: "d = 1 + ceil(log_4(N/128))". For N = 10^6: d = 1 + ceil(log_4(7812.5)) = 1 + ceil(6.47) = 1 + 7... the paper states d = 5 for 10^6, so N_1 = 128, 4 remaining dimensions of size 4 give 128 * 4^4 = 128 * 256 = 32768... The paper notes for 1M entries and l = 5: "a total of 386 values will be packed."
[^fhe_sec]: Section 6.2, p.10: "The LWE estimator by Albrecht et al. suggests these parameters yield about 111 bits of computational security."

#### If-reported metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Financial server cost (N = 2^16) | $0.008/query | Network-dominated for small DB[^cost_small] |
| Financial server cost (N = 2^20) | $0.112/query | Computation begins to dominate[^cost_large] |
| Financial server cost (N = 2^24) | $1.792/query | Computation-dominated[^cost_huge] |

[^cost_small]: Table 3, p.11. OnionPIR is 4x cheaper than SealPIR at N = 65536 due to smaller response.
[^cost_large]: Table 3, p.11.
[^cost_huge]: Table 3, p.11. OnionPIR's server cost is $1.792 vs SealPIR's $1.818 — nearly identical for large N because computation dominates and both have similar computation costs.

### Performance Benchmarks

**Hardware:** Amazon EC2 t2.2xlarge, 32 GB RAM, 8 CPU cores with AVX.[^hardware]
**Threading model:** Not specified (results are averages over 10 runs).[^threading]
**Database parameters:** N entries of 30 KB each. N ranges from 2^16 to 2^24.[^dbparams]
**Pricing:** $0.01/CPU-hour + $0.09/GB network (EC2 rates at time of writing).[^pricing]

[^hardware]: Section 6.2, p.10: "we used a t2.2xlarge instance with 32 GB ram and 8 CPU cores with AVX enabled."
[^threading]: Section 6.2, p.10: "All the other results are obtained by running each experiment 10 times and taking the average."
[^dbparams]: Section 6.2, p.10.
[^pricing]: Section 6.2, p.10: "one cent per CPU-hour and nine cents per GB of Internet traffic."

#### Table 3: OnionPIR vs SealPIR (stateless)

| Metric | SealPIR N=2^16 | SealPIR N=2^18 | SealPIR N=2^20 | SealPIR N=2^24 | OnionPIR N=2^16 | OnionPIR N=2^18 | OnionPIR N=2^20 | OnionPIR N=2^24 |
|--------|---------------|---------------|---------------|---------------|----------------|----------------|----------------|----------------|
| Response (KB) | 3,200 | 3,200 | 3,200 | 3,200 | **128** | **128** | **128** | **128** |
| Request (KB) | 32 | 32 | 32 | 64 | 64 | 64 | 64 | 64 |
| Query Unpack (s) | 5.4 | 10.7 | 21.5 | 86.3 | **3.6** | **4.1** | **4.6** | **5.5** |
| Dot-Products (s) | 20.7 | 91.2 | 381.6 | 6,362.1 | 21.3 | 97.0 | 396.3 | 6,410.7 |
| Total Computation (s) | 26.1 | 101.9 | 403.1 | 6,448.4 | 24.9 | 101.1 | 400.9 | 6,416.2 |
| Server Cost (cents) | 0.034 | 0.055 | 0.139 | 1.818 | **0.008** | **0.029** | **0.112** | 1.792 |

Key observations from Table 3:
- Response size: OnionPIR's 128 KB is **25x smaller** than SealPIR's 3,200 KB, constant across all database sizes.[^bench_resp]
- Request size: OnionPIR's 64 KB is 2x larger than SealPIR's 32 KB (each BFV ciphertext is 4x bigger due to larger q). However, OnionPIR remains 64 KB for all practical sizes while SealPIR grows.[^bench_req]
- Computation: Nearly identical (within 1-2%) for both schemes. Dot-product time dominates and scales linearly with N.[^bench_comp]
- Query unpacking: OnionPIR is faster because it packs only a logarithmic number of query bits (vs SealPIR's 2*sqrt(N) bits).[^bench_unpack]
- Server cost: OnionPIR is ~4x cheaper at small databases (network-dominated) and converges to SealPIR at large databases (computation-dominated).[^bench_cost]

[^bench_resp]: Table 3, p.11. The 25x improvement is the paper's central contribution.
[^bench_req]: Section 6.3, p.11: "the request size in OnionPIR is twice as large as SealPIR... But for larger databases, the request size of OnionPIR will remain 64 KB."
[^bench_comp]: Section 6.3, p.11: "the computational cost of OnionPIR is almost identical to SealPIR across all database sizes."
[^bench_unpack]: Section 6.3, p.11: "Query unpacking in OnionPIR takes much less time than SealPIR because we pack only a logarithmic number of query bits."
[^bench_cost]: Section 6.3, p.11.

#### Table 4: Stateful OnionPIR vs Patel et al.

| Metric | Stateful OnionPIR N=2^16 | Stateful OnionPIR N=2^18 | Stateful OnionPIR N=2^20 | Stateful OnionPIR N=2^24 | Patel et al. N=2^16 | Patel et al. N=2^18 | Patel et al. N=2^20 | Patel et al. N=2^24 |
|--------|--------------------------|--------------------------|--------------------------|--------------------------|---------------------|---------------------|---------------------|---------------------|
| **Online** Response (KB) | 128 | 128 | 128 | 128 | 3,200 | 3,200 | 3,200 | 3,200 |
| **Online** Request (KB) | 64.1 | 64.2 | 64.2 | 64.5 | 34 | 36 | 40 | 64 |
| **Online** Computation (s) | 3.1 | 6.3 | 25.1 | 200.5 | 0.1 | 0.4 | 0.8 | 3.1 |
| **Offline** Response (KB) | 128 | 128 | 128 | 128 | 3,932 | 15,728 | 62,914 | 1,006,632 |
| **Offline** Request (KB) | 11.0 | 23.1 | 24.6 | 66.5 | — | — | — | — |
| **Offline** Computation (s) | 10.6 | 23.2 | 25.0 | 87.1 | — | — | — | — |
| **Amortized** Response (KB) | 256 | 256 | 256 | 256 | 7,132 | 18,928 | 66,114 | 1,009,832 |
| **Amortized** Request (KB) | 75.1 | 87.3 | 88.8 | 131.0 | 34 | 36 | 40 | 64 |
| **Amortized** Computation (s) | 13.7 | 29.5 | 50.1 | 287.6 | 0.1 | 0.4 | 0.8 | 3.1 |
| Server Cost (cents) | 0.006 | 0.010 | 0.016 | 0.081 | 0.061 | 0.162 | 0.567 | 8.668 |

Key observations from Table 4:
- Stateful OnionPIR reduces computation by 1.8x to 22x over stateless OnionPIR (depending on N).[^stat_comp]
- Response size is doubled to 256 KB amortized (online 128 KB + offline 128 KB).[^stat_resp]
- Compared to Patel et al., amortized response is 27x-3900x smaller because Patel et al. requires downloading the entire database in the offline phase.[^stat_patel]
- Monetary cost: Stateful OnionPIR is ~10x-107x cheaper than Patel et al.[^stat_cost]

[^stat_comp]: Section 6.4, p.11: "The reduction in computational time scales with the database size, ranging from 1.8x to 22x."
[^stat_resp]: Table 4, p.11.
[^stat_patel]: Section 6.4, p.11: "the amortized response size of stateful OnionPIR is only 256 KB, which is a reduction of 27 ~ 3,900x compared to Patel et al."
[^stat_cost]: Section 6.4, p.11: "Overall, the stateful OnionPIR has around 10 ~ 107x cheaper monetary cost than Patel et al."

### Comparison with Prior Work

| Metric | OnionPIR | SealPIR | XPIR | Ali et al. | SHECS-PIR |
|--------|----------|---------|------|-----------|-----------|
| Response size (KB) | **128** | 3,200 | 17,000 (17 MB)[^cmp_xpir_resp] | 357[^cmp_ali_resp] | N/R |
| Request size (KB) | 64 | 32 | 17,000 (17 MB)[^cmp_xpir_req] | 119[^cmp_ali_req] | N/R |
| Server computation (s) | ~101 (N=2^18) | ~102 (N=2^18) | ~383[^cmp_xpir_comp] | ~900[^cmp_ali_comp] | >2x SealPIR[^cmp_shecs] |
| Expansion factor F | **4.2** | 10 | ~100 | N/R | 16 |
| DB params | N=10^6, 30KB entries | same | N=10^6 | N=10^6, 60KB | N=10^6 |

[^cmp_xpir_resp]: Section 7, p.12: "the downside of their protocol is that the request size is 17 MB and the response size overhead is 100x."
[^cmp_xpir_req]: Section 7, p.12.
[^cmp_xpir_comp]: Section 7, p.12: "around 383 seconds of server computation."
[^cmp_ali_resp]: Section 7, p.12: "357 KB response size."
[^cmp_ali_req]: Section 7, p.12: "119 KB request size."
[^cmp_ali_comp]: Section 7, p.12: "around 900 seconds."
[^cmp_shecs]: Section 7, p.12: "their computation cost more than doubled compared to SealPIR."

**Key takeaway:** OnionPIR is the preferred choice when response size (bandwidth) is the primary concern and computation cost comparable to SealPIR is acceptable. For databases up to ~10^6 entries, OnionPIR achieves 25x smaller responses than SealPIR with virtually identical server computation time. The crossover point where SealPIR's request size exceeds OnionPIR's occurs around N = 4 million entries.

### Portable Optimizations

1. **External products for higher-dimensional hypercubes:** The substitution of BFV ciphertext multiplication with GSW x Regev external products to enable d > 2 dimensions is applicable to any BFV-based PIR scheme that processes databases as hypercubes. The additive noise growth property is the key enabler.[^port_ext]

2. **DecompMul (Decomposed Ciphertext-Plaintext Multiplication):** Decomposing the plaintext into sqrt(t)-sized pieces before multiplying with ciphertexts can reduce noise in any protocol that performs BFV ciphertext-plaintext multiplications. Applicable beyond PIR to general FHE circuits.[^port_decomp]

3. **Homomorphic Benes copy network:** Using external products to evaluate copy/routing networks homomorphically is applicable to any MPC or ORAM protocol requiring oblivious data replication.[^port_benes]

4. **Query packing across dimensions:** Packing query bits for all d dimensions into a single BFV ciphertext (exploiting that n >> total query bits) reduces request size to a single ciphertext for most practical database sizes. Applicable to any hierarchical PIR scheme.[^port_pack]

[^port_ext]: The core contribution; see Section 4.1.
[^port_decomp]: Figure 4, p.6.
[^port_benes]: Section 5.2, p.9.
[^port_pack]: Section 4.3, Algorithm 1.

### Implementation Notes

- **Language / Library:** C++ built on Microsoft SEAL Homomorphic Encryption Library version 3.5.1.[^impl_seal]
- **Polynomial arithmetic:** NTT-based. The paper identified SEAL's NTT implementation as a bottleneck (>80% of server time) and replaced it with NFLLib, which uses "several arithmetic optimizations and AVX2 specialization for arithmetic operations over polynomials." NFLLib's NTT is 2-3x faster than SEAL's.[^impl_ntt]
- **CRT decomposition:** CRT representation implemented for RGSW ciphertexts, "which is more efficient than using multi-precision arithmetic."[^impl_crt]
- **SIMD / vectorization:** AVX (via NFLLib integration).[^impl_avx]
- **Parallelism:** Not explicitly multi-threaded in the reported benchmarks (single-threaded implied).
- **Lines of Code:** ~3000 lines of C++ modifications to integrate NFLLib's NTT into SEAL and implement RGSW/external products.[^impl_loc]
- **Open source:** Not explicitly linked in the paper.

[^impl_seal]: Section 6.1, p.10: "We implemented OnionPIR atop the SEAL Homomorphic Encryption Library version 3.5.1."
[^impl_ntt]: Section 6.1, p.10: "more than 80% of the server compute time is due to number-theoretic transformation (NTT)... The NTT implementation in NFLLib is 2 - 3x faster than SEAL."
[^impl_crt]: Section 6.1, p.10: "We also implemented the CRT representation of RGSW encryption scheme."
[^impl_avx]: Section 6.1, p.10: "AVX2 specialization."
[^impl_loc]: Section 6.1, p.10: "our modifications consist of around 3000 lines of C++ code."

### Variants

| Variant | Key Difference | Response Size | Computation | Best For |
|---------|---------------|---------------|-------------|----------|
| Stateless OnionPIR | Base protocol | 128 KB | ~101 s (N=2^18) | Single queries, minimal client state |
| Stateful OnionPIR | Integrates PSIR framework of Patel et al. with novel PBSR using Benes copy networks | 256 KB (amortized) | 1.8x-22x less than stateless[^var_stat] | Repeated queries from same client |

[^var_stat]: Section 6.4, p.11.

### Application Scenarios

- **Private media streaming** — mentioned as motivation (Popcorn, ref [40]): large-record regime where response overhead dominates costs.[^app_media]
- **Private ad delivery** (ref [39]).[^app_ad]
- **Anonymous communication** (PIR-Tor, ref [51]).[^app_anon]

[^app_media]: Section 1, p.1.
[^app_ad]: Section 1, p.1.
[^app_anon]: Section 1, p.1.

### Deployment Considerations

- **Database updates:** Not addressed for stateless OnionPIR. Stateful OnionPIR "currently only applies to the static database" — updates are listed as an open problem.[^deploy_update]
- **Sharding:** Not discussed.
- **Key rotation / query limits:** The RGSW(-s) key is provided once. No explicit query limits mentioned, but stateful variant has c * k total subset entries per offline phase window.
- **Anonymous query support:** Stateless OnionPIR supports anonymous queries (no client state required). Stateful OnionPIR requires persistent client state, revealing client identity across queries.
- **Session model:** Stateless = ephemeral client; Stateful = persistent client with local storage.
- **Cold start suitability:** Stateless: yes (single-round, no preprocessing). Stateful: no (requires offline PBSR phase).

[^deploy_update]: Section 8, p.13: "it currently only applies to the static database. An interesting direction is to explore how to support updates to the database in stateful PIR."

### Key Tradeoffs & Limitations

1. **Request size 2x larger than SealPIR** for small databases (64 KB vs 32 KB), because the larger q (124-bit vs 60-bit) makes each BFV ciphertext 4x larger, partially offset by packing all dimensions into one ciphertext.[^tradeoff_req]

2. **Computation not improved:** OnionPIR's server computation is nearly identical to SealPIR — the O(N) dot-product dominates and is unchanged. The paper's contribution is purely in communication efficiency.[^tradeoff_comp]

3. **NTT bottleneck:** >80% of server time is NTT. The paper mitigates with NFLLib but notes GPU/FPGA as future work.[^tradeoff_ntt]

4. **Static database only** for the stateful variant.[^tradeoff_static]

5. **Large q (124-bit) needed:** The larger ciphertext modulus increases ciphertext size (partially offsetting response gains) and increases the absolute cost of each polynomial multiplication. The paper notes n = 4096 provides only ~111 bits of security, below the typical 128-bit target.[^tradeoff_security]

[^tradeoff_req]: Section 6.3, p.11.
[^tradeoff_comp]: Table 3, p.11.
[^tradeoff_ntt]: Section 6.1, p.10 and Section 8, p.13.
[^tradeoff_static]: Section 8, p.13.
[^tradeoff_security]: Section 6.2, p.10: "about 111 bits of computational security." SealPIR uses n = 2048 with q = 60 bits and provides 115 bits.

### Open Problems

1. **GPU/FPGA acceleration:** "Recent research efforts have demonstrated that GPU and FPGA can significantly speed up polynomial multiplications. An interesting future direction is to integrate them into PIR."[^open_gpu]
2. **Removing public-key operations from stateful PIR online phase:** "try to get rid of the expensive public-key operations in the online phase of stateful PIR."[^open_stateful]
3. **Database updates for stateful PIR:** "explore how to support updates to the database in stateful PIR."[^open_updates]

[^open_gpu]: Section 8, p.13.
[^open_stateful]: Section 8, p.13.
[^open_updates]: Section 8, p.13.

### Uncertainties

- **Security level:** The paper reports ~111 bits of security for their parameter choice (n = 4096, q = 124 bits). This is below the standard 128-bit target. The paper also states "115 bits" in Section 6.2 when setting q = 60 bits and n = 2048 (SealPIR's parameters). There may be some inconsistency in how the LWE estimator was applied across different parameter sets.
- **Stateful OnionPIR's batched PIR:** The offline phase computation cost is "simulated" (Section 6.2: "We have not implemented batched PIR, so the offline phase computation cost is simulated"), meaning the stateful variant's benchmarks are partially estimated rather than fully measured.
- **n vs N ambiguity:** The paper uses n for ring dimension (4096) and N for database size. This is consistent throughout but worth noting as some PIR papers use n for database size.
