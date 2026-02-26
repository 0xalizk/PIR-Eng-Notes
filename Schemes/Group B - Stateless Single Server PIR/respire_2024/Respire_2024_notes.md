## Respire: High-Rate PIR for Databases with Small Records -- Engineering Notes

<a id="toc"></a>

<table><tr><td>

<sub><nobr>1. <a href="#lineage">Lineage</a></nobr></sub><br>
<sub><nobr>2. <a href="#core-idea"><b>Core Idea</b></a></nobr></sub><br>
<sub><nobr>3. <a href="#variants">Variants</a></nobr></sub><br>
<sub><nobr>4. <a href="#cryptographic-foundation">Cryptographic Foundation</a></nobr></sub><br>
<sub><nobr>5. <a href="#ring-architecture-modulus-chain">Ring Architecture / Modulus Chain</a></nobr></sub><br>
<sub><nobr>6. <a href="#key-data-structures"><b>Key Data Structures</b></a></nobr></sub><br>
<sub><nobr>7. <a href="#database-encoding">Database Encoding</a></nobr></sub><br>
<sub><nobr>8. <a href="#protocol-phases"><b>Protocol Phases</b></a></nobr></sub><br>
<sub><nobr>9. <a href="#communication-breakdown">Communication Breakdown</a></nobr></sub><br>
<sub><nobr>10. <a href="#correctness-analysis">Correctness Analysis</a></nobr></sub><br>
<sub><nobr>11. <a href="#complexity"><b>Complexity</b></a></nobr></sub>

</td><td>

<sub><nobr>12. <a href="#batch-pir-construction-3-3">Batch PIR (Construction 3.3)</a></nobr></sub><br>
<sub><nobr>13. <a href="#performance-benchmarks"><b>Performance Benchmarks</b></a></nobr></sub><br>
<sub><nobr>14. <a href="#portable-optimizations"><b>Portable Optimizations</b></a></nobr></sub><br>
<sub><nobr>15. <a href="#implementation-notes"><b>Implementation Notes</b></a></nobr></sub><br>
<sub><nobr>16. <a href="#application-scenarios">Application Scenarios</a></nobr></sub><br>
<sub><nobr>17. <a href="#deployment-considerations">Deployment Considerations</a></nobr></sub><br>
<sub><nobr>18. <a href="#key-tradeoffs-limitations"><b>Key Tradeoffs & Limitations</b></a></nobr></sub><br>
<sub><nobr>19. <a href="#comparison-with-prior-work">Comparison with Prior Work</a></nobr></sub><br>
<sub><nobr>20. <a href="#open-problems">Open Problems</a></nobr></sub><br>
<sub><nobr>21. <a href="#uncertainties">Uncertainties</a></nobr></sub>

</td></tr></table>

| Field | Value |
|-------|-------|
| **Paper** | [Respire: High-Rate PIR for Databases with Small Records](https://eprint.iacr.org/2024/1165) (2024) |
| **Archetype** | Construction |
| **PIR Category** | Group B -- Stateless single-server |
| **Sub-model** | Client-hint upload (secret-key-dependent evaluation keys offline) |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | RLWE + circular security / key-dependent message (KDM) security (Definition D.1) |
| **Correctness model** | Probabilistic (failure prob <= 2^{-40} per query, via subgaussian tail bounds) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns response) |
| **Record-size regime** | Small (<=10 KB) -- this is Respire's niche |
| **Total pages** | 54 (23 main body + 31 pages of appendices A-E) |
| **Implementation** | Rust, ~8,000 LOC; https://github.com/AMACB/respire/ |

---

<a id="lineage"></a>

### Lineage <a href="#toc">⤴</a>

| Field | Value |
|-------|--------|
| **Builds on** | Spiral [Group A/B] (Regev+GSW composition, hypercube database layout, external products); Angel et al. [ACLS18] (query packing/compression); ring switching [BV11, BGV12, GHPS12]; split modulus switching [MW22a] |
| **What changed** | Prior RLWE-based PIR schemes communicate at least one full ring element (d=2048, q~2^56) per query/response. Respire introduces subring embedding and dimension reduction to project responses onto a smaller ring R_{d2} (d2=512), and embeds queries into subring coefficients, achieving total online communication smaller than a single element of the main ring. |
| **Superseded by** | N/A |
| **Concurrent work** | YPIR [MW24], HintlessPIR [LMRS24], WhisPIR [dCLS24] (all 2024, addressing communication in different sub-models) |

---

<a id="core-idea"></a>

### Core Idea <a href="#toc">⤴</a>

Existing lattice-based PIR protocols have high communication overhead because RLWE ciphertexts require ring dimension d >= 2048 and modulus q >= 2^32, meaning even a single ring element is >= 8 KB. For databases with small records (e.g., 256 bytes), this is the dominant cost. Respire addresses this by working over *subrings*: the server performs most computation on the large ring R_{d1} (d1=2048) but projects the response onto a subring R_{d2} (d2=512) via dimension reduction (ring switching), achieving a 4x compression of the response.&#8201;[^1] For query compression, Respire embeds the query into subring coefficients rather than sending a full ring element, reducing query size from 14 KB to 4 KB.&#8201;[^2] On a 256 MB database with 256-byte records, Respire achieves 6.1 KB total online communication -- a 5.9x reduction over Spiral -- with comparable throughput (200-400 MB/s).&#8201;[^3]

[^1]: Section 1.1 (p.2): "Since d1/d2 = 4, this yields a 4x reduction in response size."

[^2]: Section 1.1 (p.2): "This allows us to reduce the query size from 14 KB to 4 KB. Notably, the query is now smaller than even a single element in the big ring R1."

[^3]: Abstract (p.1): "To retrieve a single record from a database with over a million 256-byte records, the Respire protocol requires just 6.1 KB of online communication; this is a 5.9x reduction compared to the best previous lattice-based scheme."

---

<a id="variants"></a>

### Variants <a href="#toc">⤴</a>

| Variant | Key Difference | Offline Comm | Online Comm | Best For |
|---------|---------------|-------------|-------------|----------|
| **Respire (single-query)** | Base protocol, Construction 3.2; n_vec=1, d2=d3 | 3.9 MB ↑ | 4.1 KB ↑ + 2.0 KB ↓ = 6.1 KB | Single queries on small-record DBs |
| **Respire (batch)** | Construction 3.3; adds projection, repacking, vectorization; d3 <= d2; Cuckoo hashing for amortization | 4.6 MB ↑ | varies by T | Small batch sizes (T <= 128) |

---

<a id="cryptographic-foundation"></a>

### Cryptographic Foundation <a href="#toc">⤴</a>

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring Learning with Errors (RLWE) over R_{d,q} = Z_q[x]/(x^d + 1). Three separate RLWE instantiations: (1) R_{d1,q1} for main computation, (2) R_{d1,q1} with different distributions for vectorization, (3) R_{d2,q2} for response compression key-switching.&#8201;[^4] |
| **Encryption/encoding schemes** | (1) **RLWE encoding** (scalar Regev): c = [a; sa + e + mu] in R_{d,q}^2 encodes scalar mu w.r.t. secret s. (2) **GSW encoding**: C in R_{d,q}^{2x2m} encodes bit mu via gadget matrix G_{2,z}. External product of GSW x RLWE -> RLWE implements homomorphic selection.&#8201;[^5] |
| **Ring / Field** | Primary: R_{d1} = Z[x]/(x^{2048} + 1), q1 ~ 2^56. Subring: R_{d2} = Z[x]/(x^{512} + 1), q2 ~ 2^24. Plaintext: R_{d2,p} = Z_p[x]/(x^{512} + 1) with p = 16. |
| **Key structure** | Two secret keys: s1 = [-s_tilde_1 | 1]^T in R_{d1,q1}^2 (query key, main ring); s2 = [-s_tilde_2 | 1]^T in R_{d2,q2}^2 (compression target key, small ring). Both uploaded as evaluation keys in the offline phase. |
| **Correctness condition** | Subgaussian tail bound: Pr[fail] <= 1 - 2*d2*n_vec * exp(-pi*(q3/(2p) - B_final)^2 / sigma_resp^2) where sigma_resp^2 aggregates noise through all phases (Eq. D.5, p.49). Target: per-query error <= 2^{-40}.&#8201;[^6] |

[^4]: Section 4.1 (p.16-17): Three RLWE assumptions with different parameters. (1) Main ring R_{d1,q1} uses uniform secret in [-7,7], Gaussian error with sigma=9.9. (2) Main ring R_{d1,q1} for vectorization uses Gaussian secret and error with sigma'_1=9.9. (3) Small ring R_{d2,q2} uses Gaussian secret and error with sigma=253.6.

[^5]: Section 2 (p.5): GSW encodings defined with decomposition base z, m = 2*(floor(log_z(q)) + 1). External product: Multiply(C_GSW, c_RLWE) = C_GSW * G_{2,z}^{-1}(c_RLWE).

[^6]: Appendix D.1 (p.46-50) and Section 4.1 (p.16): "We choose the scheme parameters to tolerate a correctness error of at most 2^{-40}."

---

<a id="ring-architecture-modulus-chain"></a>

### Ring Architecture / Modulus Chain <a href="#toc">⤴</a>

| Ring | Dimension | Modulus (bits) | Role / Phase |
|------|-----------|---------------|--------------|
| R_{d1,q1} | d1 = 2048 | 56-bit (q1 = q_{1,1} * q_{1,2}, two 28-bit primes, q1 ~ 2^56) | Query encryption, query expansion, first-dimension processing, folding. All server-side homomorphic operations. |
| R_{d1,q2} | d1 = 2048 | ~24-bit (q2 ~ 2^24, single-query) / ~18-bit (q2 ~ 2^18, batch) | Intermediate: after modulus switching from q1, before dimension reduction |
| R_{d2,q2} | d2 = 512 | ~24-bit (q2, single-query) / ~18-bit (batch) | Response after dimension reduction. Random component of compressed response. |
| R_{d2,q3} | d2 = 512 | 4-bit (q3 = 2^4 = 16 = p, single-query) / 8-bit (q3 = 2^8, batch) | Message-embedding component of compressed response (split modulus switching). |
| R_{d3,p} | d3 = 512 (single) / varies (batch) | p = 16 = 2^4 | Plaintext ring for individual database records |

**Split modulus switching:** The response compression (Box 1 / Construction C.3) interleaves modulus switching with dimension reduction. The "random" component c1' lives in R_{d2,q2} while the "message-embedding" component c2' lives in R_{d2,q3} where q3 <= q2. This achieves better compression than uniform modulus switching.&#8201;[^7]

[^7]: Section 3 (p.8): "To achieve better compression, we use the 'split' modulus switching approach from Spiral [MW22a], where the message-embedding component of an RLWE encoding is further scaled to a smaller modulus q3 < q2."

---

<a id="key-data-structures"></a>

### Key Data Structures <a href="#toc">⤴</a>

- **Database:** N = 2^{v1+v2+v3} records, each an element of R_{d3,p} = Z_p[x]/(x^{d3} + 1). Arranged as a (1+v2+v3)-dimensional hypercube: first dimension 2^{v1}, next v2 dimensions of size 2, and v3 "folding" dimensions of size 2. In the single-query case d3 = d2 = 512, so v3 = log2(d1/d2) = 2.&#8201;[^8]
- **Packed database elements:** Each entry in the preprocessed database db is a packed representation r_tilde_{alpha,beta} = Pi(r_{alpha,beta,1}, ..., r_{alpha,beta,2^{v3}}) in R_{d1,p}, packing k = d1/d2 = 4 individual records into one large-ring element via the ring packing function Pi (Eq. 3.3).&#8201;[^9]
- **Public parameters (pp):** pp = (pp_qpk, pp_comp) for single-query; pp = (pp_qpk, pp_proj, pp_vec, pp_comp) for batch. These are automorphism key-switching matrices derived from the client's secret keys. Size: 3.9 MB (single-query, 256 MB DB) to 4.6 MB (batch).&#8201;[^10]
- **Query key (qk):** (s1, s2) -- the two secret keys. Retained by the client.
- **Query (q):** A packed encoding enc = (enc_RLWE, enc_GSW) in R_{d1,q1}^2 containing both RLWE encodings of scaled first-dimension indicator values and GSW encodings of index bits. Total ~4.1 KB (single-query, 256 MB DB).&#8201;[^11]

[^8]: Section 3.1 (p.10): "We view the database as a hypercube with 1 + v2 + v3 dimensions where the first dimension has size 2^{v1}, the remaining v2 + v3 dimensions each have size 2, and v3 = delta1 - delta2."

[^9]: Eq. 3.4 (p.11): SetupDB packs records r_{alpha,beta,1},...,r_{alpha,beta,2^{v3}} into r_tilde_{alpha,beta} = Pi(r_{alpha,beta,1},...,r_{alpha,beta,2^{v3}}) in R_{d1,p}.

[^10]: Table 1 (p.19): Offline communication for Respire is 3.9 MB across all database sizes (256 MB to 8 GB).

[^11]: Table 1 (p.19): Query size is 4.1 KB for 256 MB database (2^20 x 256B), rising to 14.8 KB for 8 GB (2^25 x 256B).

---

<a id="database-encoding"></a>

### Database Encoding <a href="#toc">⤴</a>

- **Representation:** (1+v2+v3)-dimensional hypercube. Each record is an element of R_{d3,p}. For the single-query case, d3 = d2 = 512 and p = 16, so each record holds 512 * log2(16) = 2048 bits = 256 bytes.
- **Record addressing:** Triple (alpha, beta, gamma) where alpha in [2^{v1}], beta in [2^{v2}], gamma in [2^{v3}]. Alpha indexes the first dimension (linear scan), beta indexes the "folding" dimensions, gamma indexes positions within a packed element.
- **Preprocessing required:** Server packs k = d1/d2 = 4 records into each element of R_{d1,p} via the ring packing function Pi (Eq. 3.3), then applies NTT transformation. Preprocessing time: 16.8 s for 256 MB DB, 569 s for 8 GB DB.&#8201;[^12]
- **Record size equation:** Each record maps to one element of Z_p[x]/(x^{d3} + 1), encoding d3 * log2(p) bits. With d3 = 512 and p = 16: 512 * 4 = 2048 bits = 256 bytes.

[^12]: Section 4.2 (p.20): "This precomputation takes 16.8 s for a 256 MB database, and 569 s for an 8 GB database."

---

<a id="protocol-phases"></a>

### Protocol Phases <a href="#toc">⤴</a>

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Setup** | Client | Sample secret keys s1, s2; generate pp_qpk (query packing params from s1), pp_comp (compression params from s1, s2) | pp (3.9 MB) ↑ to server | Once (offline, reusable across queries) |
| **SetupDB** | Server | Pack records into R_{d1,p} elements via Pi; apply NTT | -- | Once per DB version |
| **Query** | Client | Encode index (alpha, beta, gamma) into packed encoding via QueryPack(s1, v, mu) (Eq. 3.5) | q (~4.1 KB) ↑ | Per query |
| **Answer: Query Expansion** | Server | Unpack query into 2^{v1} RLWE encodings + v2 GSW encodings + v3 GSW encodings via QueryUnpack | -- (server-local) | Per query |
| **Answer: First Dimension** | Server | For each beta: c_hat_beta^{(1)} = sum_{alpha} r_tilde_{alpha,beta} * c_alpha^{(1)} | -- (server-local) | Per query |
| **Answer: Folding** | Server | v2 rounds of Select(C_r, c_{r-1,j}, c_{r-1,j+2^{v2-r}}) reducing 2^{v2} encodings to 1 | -- (server-local) | Per query |
| **Answer: Rotation + Folding** | Server | v3 rounds of Select(C_r, c_{r-1}, x^{-2^{v3-r}} * c_{r-1}) -- extracts target record from packed element | -- (server-local) | Per query |
| **Answer: Compression** | Server | Compress(pp_comp, c^{out}): split modulus switch q1->q2 then dimension reduce d1->d2 | a = (c1' in R_{d2,q2}, c2' in R_{d2,q3}) (~2.0 KB) ↓ | Per query |
| **Extract** | Client | CompressRecover(s2, a): decrypt and round to Z_p; extract record | -- | Per query |

---

<a id="communication-breakdown"></a>

### Communication Breakdown <a href="#toc">⤴</a>

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Public parameters (pp) | ↑ | 3.9 MB | Yes, across all queries | Offline; contains key-switching matrices derived from client's secret keys |
| Query (q) | ↑ | 4.1 KB (256 MB DB) | No | Per query; packed RLWE+GSW encoding. PRG seed compresses random component.&#8201;[^13] |
| Response (a) | ↓ | 2.0 KB (256 MB DB) | No | Per query; split-modulus-switched encoding over R_{d2}. c1' in R_{d2,q2}, c2' in R_{d2,q3}. |

**Total online:** 6.1 KB (256 MB DB, single query). For comparison, Spiral requires 36 KB online on the same configuration.&#8201;[^14]

[^13]: Section 4.1 (p.17): "We use a standard optimization...wherein the client sends a PRG seed in place of the random component of the RLWE encodings in the query. We instantiate the PRG using ChaCha20."

[^14]: Table 1 (p.19) and Section 4.2 (p.18): "Notably, in Respire, the total communication is smaller than the size of even a single RLWE ciphertext in previous schemes."

---

<a id="correctness-analysis"></a>

### Correctness Analysis <a href="#toc">⤴</a>

#### Option A: FHE Noise Analysis (subgaussian variance tracking)

Respire tracks noise growth via subgaussian variance parameters (sigma^2) through each phase, following the independence heuristic.&#8201;[^15]

| Phase | Noise variance (sigma^2) | Growth type | Notes |
|-------|--------------------------|-------------|-------|
| After query expansion | sigma_RLWE^2 = sigma_{1,e}^2 * (1 + t_{coeff,RLWE} * d1^3 * z_{coeff,RLWE}^2 / 12); sigma_GSW^2 = sigma_{1,e}^2 * (d1 * B_{1,s}^2 * (1 + t_{coeff,GSW} * d1^3 * z_{coeff,GSW}^2 / 12) + t_conv * d1 * z_conv^2 / 2) | Multiplicative (automorphism key-switching) | RLWE encodings have lower noise than GSW encodings (Theorem B.7) |
| After first dimension | sigma_first^2 = 2^{v1} * d1 * (p/2)^2 * sigma_RLWE^2 | Additive (linear scan) | Scales with first-dim size 2^{v1} |
| After folding (v2+v3 rounds) | sigma_rot^2 = sigma_first^2 + (v2+v3) * t_GSW * d1 * z_GSW^2 * sigma_GSW^2 / 2 | Additive per round | Each Select adds t_GSW * d1 * z_GSW^2 * sigma_GSW^2 / 2 (Theorem A.3) |
| After projection (batch only) | sigma_proj^2 = (4^{delta1-delta3} - 1)/12 * t_proj * d1^2 * sigma_{1,e}^2 | Additive | From coefficient projection via automorphisms |
| After repacking (batch only) | sigma_pack^2 = sigma_rot^2 + (d2/d3) * sigma_proj^2 | Additive | Combines rotation noise with projection noise |
| After vectorization (batch only) | sigma_vec^2 = sigma_pack^2 + n_vec * t_vec * d1 * z_vec^2 * (sigma'_{1,e})^2 / 4 | Additive | Vectorization adds key-switching noise |
| After compression | sigma_resp^2 = (q3/q1)^2 * sigma_vec^2 + (q3/(4*q2^2)) * d1 * (sigma'_{1,s})^2 + (q3/q2)^2 * sigma_{2,e}^2 * B_comp^2 | Three terms: scaled, cross-term, key-switch | B_comp bounded by sqrt(t_comp * d1) * z_comp / 2 (Remark C.5 gives tighter bound) |

- **Correctness condition:** Pr[success] >= 1 - 2*d2*n_vec * exp(-pi*(q3/(2p) - B_final)^2 / sigma_resp^2), equivalently Pr[fail] <= 2*d2*n_vec * exp(-pi*(q3/(2p) - B_final)^2 / sigma_resp^2) <= 2^{-40} (Eq. D.5).&#8201;[^16]
- **Independence heuristic used?** Yes -- models subgaussian error terms as independent across homomorphic operations. Empirically validated: predicted error is an overestimate of actual measured noise.&#8201;[^17]
- **Dominant noise source:** GSW external products in folding steps (each contributes multiplicatively to sigma_GSW^2) and the first-dimension linear scan (scales with 2^{v1}).

[^15]: Appendix A (p.29): "Similar to previous lattice-based PIR schemes based on polynomial rings, we rely on the independence heuristic...we model the (subgaussian) error terms arising in the homomorphic operations as being independent."

[^16]: Appendix D.1, Eq. D.5 (p.49): Full correctness bound combining all noise phases via union bound over d2*n_vec coefficients.

[^17]: Appendix A (p.29): "We stress that the use of the independence heuristic only impacts the correctness error in the protocol (and not the security of the protocol). Empirically, we observe that there is still slack between the magnitude of the error predicted based on our analysis...and the actual measured noise magnitude."

---

<a id="complexity"></a>

### Complexity <a href="#toc">⤴</a>

#### Core metrics

| Metric | Concrete (256 MB, 2^20 x 256B) | Concrete (1 GB, 2^22 x 256B) | Concrete (8 GB, 2^25 x 256B) | Phase |
|--------|-------------------------------|-------------------------------|-------------------------------|-------|
| Query size | 4.1 KB | 7.7 KB | 14.8 KB | Online |
| Response size | 2.0 KB | 2.0 KB | 2.0 KB | Online |
| Server computation | 1.26 s | 3.48 s | 20.84 s | Online |
| Throughput | 204 MB/s | 295 MB/s | 393 MB/s | Online |
| Offline communication ↑ | 3.9 MB | 3.9 MB | 3.9 MB | Offline (per client) |

[^18]: Table 1 (p.19): All values from the single-query Respire row.

#### Preprocessing metrics

| Metric | Concrete | Phase |
|--------|---------|-------|
| Server preprocessing (SetupDB) | 16.8 s (256 MB) / 569 s (8 GB) | Offline (once per DB version) |
| Client setup time | <= 80 ms | Offline (once) |
| Client query generation | <= 148 ms | Per query |
| Client response decoding | <= 7 ms | Per query |
| Client offline upload ↑ | 3.9 MB | Offline (per client, reusable) |

[^19]: Section 4.2 (p.20): "The client-side costs in Respire are minimal. In our experiments, the setup time takes a maximum of 80 ms, the query-generation time takes at most 148 ms, and response decoding takes at most 7 ms."

#### FHE-specific metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Expansion factor (query) | ~16 (256 MB DB: 4.1 KB query for ~256 B index) | Query is smaller than a single R_{d1,q1} element |
| Expansion factor (response) | ~7.8 (2.0 KB response for 256 B record) | Response is over R_{d2,q2} x R_{d2,q3}, much smaller than R_{d1,q1} |
| Multiplicative depth | 0 (uses external products, not ciphertext multiplications) | Noise grows additively per Select operation, not multiplicatively |

---

<a id="batch-pir-construction-3-3"></a>

### Batch PIR (Construction 3.3) <a href="#toc">⤴</a>

#### Cuckoo hashing

For batch queries of size T, Respire uses probabilistic batch codes via Cuckoo hashing to amortize the linear scan cost.&#8201;[^20]

- **Hash functions:** h = 3 independent hash functions
- **Buckets:** B ~ 3T/2 buckets (smallest power-of-two K such that K >= 2N/T)
- **Bucket size:** K <= 2N/T entries each
- **Failure probability:** Cuckoo hashing failure <= 2^{-40} with B ~ 3T/2 buckets
- **Approach:** Server hashes each DB element into B buckets. Client uses Cuckoo hashing to map each of T desired indices to a distinct bucket. Client runs 3T/2 independent single-query Respire instances, one per bucket of size K.

[^20]: Section 4.3 (p.20): "Concretely, the work of [ACLS18] shows that when h = 3 and the number of buckets is roughly B ~ 3T/2, the probability of a cuckoo hashing failure...is at most 2^{-40}."

#### Batch-specific building blocks

1. **Homomorphic repacking (Section 3.2):** Takes k = d2/d3 responses and packs them into a single RLWE encoding via rotation, coefficient projection (Box 3), and aggregation. This is the key technique enabling small-record batch efficiency.
2. **Vectorization (Box 4 / Construction C.1):** When T > k = d2/d3, packs multiple RLWE encodings into a single *vector* RLWE encoding sharing a common random component, reducing response size by ~2.7x at T=32.&#8201;[^21]

[^21]: Section 3.2 (p.13-14): "Concretely, our use of vectorization reduces the response size by a factor of approximately 2.7x when the batch size is 32."

#### Batch benchmarks (Table 2)

| Database | Batch Size T | Metric | VBPIR [MR23] | Respire |
|----------|-------------|--------|--------------|---------|
| 256 MB (2^20 x 256B) | 32 | Query Size | 578 KB | 67.0 KB |
| | | Response Size | 128 KB | 31.8 KB |
| | | Computation | 8.83 s | 15.02 s |
| | | Offline Comm. | 9.3 MB | 4.6 MB |
| 256 MB (2^20 x 256B) | 256 | Query Size | 1156 KB | 326 KB |
| | | Response Size | 1028 KB | 234 KB |
| | | Computation | 27.59 s | 60.04 s |
| 1 GB (2^22 x 256B) | 32 | Query Size | 578 KB | 113 KB |
| | | Response Size | 128 KB | 31.8 KB |
| | | Computation | 32.54 s | 28.12 s |

[^22]: Table 2 (p.21): Batch Respire vs Vectorized BatchPIR. Respire achieves 3.4-8.5x query reduction, 3.4-4.4x response reduction, and 3.4-7.1x total communication reduction.

---

<a id="performance-benchmarks"></a>

### Performance Benchmarks <a href="#toc">⤴</a>

**Hardware:** AWS EC2 r7i.8xlarge (Intel Xeon Platinum 8488C @ 2.4GHz), 32 vCPUs, 256 GB RAM, Ubuntu 22.04.4. Single-threaded execution. rustc 1.77.0, gcc 11.4.0. AVX2 enabled (not AVX-512).&#8201;[^23]

[^23]: Section 4.2 (p.18): "We use an AWS EC2 r7i.8xlarge instance with 32 vCPUs...Our implementation of Respire only uses AVX2, and not AVX-512."

#### Single-query comparison (Table 1)

| Database | Metric | Spiral | SimplePIR | HintlessPIR | YPIR | Respire |
|----------|--------|--------|-----------|-------------|------|---------|
| 2^20 x 256B (256 MB) | Offline Comm. | 7.8 MB | 102.9 MB | -- | -- | 3.9 MB |
| | Query Size | 16.0 KB | 32.0 KB | 424 KB | 574 KB | 4.1 KB |
| | Response Size | 20.0 KB | 102.0 KB | 964 KB | 60 KB | 2.0 KB |
| | Computation | 1.28 s | 0.024 s | 0.658 s | 0.17 s | 1.26 s |
| | Throughput | 200 MB/s | 10.4 GB/s | 389 MB/s | 1.49 GB/s | 204 MB/s |
| 2^22 x 256B (1 GB) | Offline Comm. | 7.8 MB | 211.1 MB | -- | -- | 3.9 MB |
| | Query Size | 16.0 KB | 64.0 KB | 488 KB | 686 KB | 7.7 KB |
| | Response Size | 20.0 KB | 211.2 KB | 1.71 MB | 120 KB | 2.0 KB |
| | Computation | 2.94 s | 0.093 s | 1.242 s | 0.40 s | 3.48 s |
| | Throughput | 348 MB/s | 10.8 GB/s | 825 MB/s | 2.50 GB/s | 295 MB/s |
| 2^25 x 256B (8 GB) | Offline Comm. | 10.0 MB | 445.1 MB | -- | -- | 3.9 MB |
| | Query Size | 16.0 KB | 256.0 KB | 1.35 MB | 1.33 MB | 14.8 KB |
| | Response Size | 60.0 KB | 445.0 KB | 1.71 MB | 228 KB | 2.0 KB |
| | Computation | 15.44 s | 0.772 s | 3.698 s | 1.71 s | 20.84 s |
| | Throughput | 530 MB/s | 10.4 GB/s | 2.16 GB/s | 4.69 GB/s | 393 MB/s |

[^24]: Table 1 (p.19): Full comparison data. Throughput defined as database_size / server_computation_time.

---

<a id="portable-optimizations"></a>

### Portable Optimizations <a href="#toc">⤴</a>

1. **Subring query embedding:** When the number of values h to pack into an RLWE encoding is much smaller than the ring dimension d, embed h values into the coefficients of a subring R_{d2} subset R_{d1} and send only ~h coefficients instead of a full ring element. Applicable to any RLWE-based PIR using query packing (ACLS18, CCR19) with small inputs. Concretely reduces query size by a factor of d/h ≈ 3.5 (e.g., from 14 KB to 4 KB in Respire).&#8201;[^25]

2. **Dimension-reduction response compression:** Project the RLWE response from R_{d1} to R_{d2} via the dimension-reduction map kappa^{-1} (Eq. 3.2), composed with split modulus switching. Only works when records are small (information fits in d2 coefficients). Applicable to any Regev+GSW composition PIR with small-record databases.&#8201;[^26]

3. **Coefficient projection via automorphisms:** The maps pi_j (Eq. 3.6) zero out coefficients of a polynomial at positions not divisible by 2^j. Implemented homomorphically using Frobenius automorphisms (Lemma A.6, Construction A.7). Applicable to any RLWE scheme needing to isolate coefficient subsets for repacking or extraction.&#8201;[^27]

4. **Homomorphic repacking for batch PIR:** Combine rotation, projection, and aggregation to pack k separate RLWE-encoded responses into a single packed RLWE encoding. This enables efficient batch PIR without SIMD/BFV, using only external products and automorphisms.&#8201;[^28]

[^25]: Section 1.1 (p.2) and Appendix B (p.35): "When h << d, the client can instead embed h into the coefficients of a polynomial that lives in a subring of R_{d,q}."

[^26]: Section 3 (p.6-8) and Remark 3.1 (p.9): Dimension reduction loses information -- only works because records are small and packed into the initial position of the large-ring element.

[^27]: Section 3.2 (p.12-13) and Appendix A.1 (p.30-32): Coefficient projection is the key primitive for homomorphic repacking. Builds on automorphism evaluation techniques from [ACLS18, CCR19, CDKS21].

[^28]: Section 3.2 (p.12-13) and Remark 3.5 (p.16): "Our response packing approach...may seem similar to Vectorized BatchPIR [MR23] and Piranha [LLWR24]. However, there is a critical difference: both Vectorized BatchPIR and Piranha leverage SIMD support in FHE...Moreover, SIMD packing is not compatible with the query compression techniques [ACLS18, CCR19]."

---

<a id="implementation-notes"></a>

### Implementation Notes <a href="#toc">⤴</a>

- **Language / Library:** Rust (~8,000 LOC). No external FHE library -- custom implementation.&#8201;[^29]
- **Polynomial arithmetic:** NTT-based. q1 = q_{1,1} * q_{1,2} (two 28-bit primes), q2 = 1 mod 2*d2 for NTT over the small ring. Arithmetic on 64-bit integers via native AVX2 (not AVX-512).&#8201;[^30]
- **CRT decomposition:** q1 is a product of two 28-bit primes, enabling 64-bit native arithmetic modulo each prime with deferred modular reductions and CRT combination.&#8201;[^30]
- **SIMD / vectorization:** AVX2 SIMD instruction set. AVX-512 not used despite being available.&#8201;[^23]
- **Parallelism:** Single-threaded for all benchmarks.
- **PRG:** ChaCha20 for compressing the random component of query RLWE encodings.&#8201;[^13]
- **Open source:** https://github.com/AMACB/respire/

[^29]: Section 4.2 (p.18): "Our implementation of Respire contains roughly 8,000 lines of Rust."

[^30]: Section 4.1 (p.17): "We implement arithmetic modulo q1 using 64-bit native integer arithmetic modulo q_{1,1} and q_{1,2} (with deferred modular reductions), and combine the results using the Chinese remainder theorem."

---

<a id="application-scenarios"></a>

### Application Scenarios <a href="#toc">⤴</a>

- **Metadata-hiding communication:** Anonymous messaging, private DNS -- databases of 10^6+ small records (e.g., 256-byte hash values). Respire is well-suited because records are small and the client makes a handful of queries at a time (e.g., blocklist lookup, DNS query).&#8201;[^31]
- **Password breach checking:** Databases of hash prefixes, each a few hundred bytes. Communication-sensitive setting where low query/response overhead matters more than throughput.
- **Private certificate transparency:** Retrieving certificate status (small records) from a log with millions of entries.

[^31]: Section 1 (p.1) and Remark 2.2 (p.4): "Respire is well-suited for applications where the client is making a handful of queries simultaneously (e.g., blocklist lookup or DNS queries)."

---

<a id="deployment-considerations"></a>

### Deployment Considerations <a href="#toc">⤴</a>

- **Database updates:** Requires re-running SetupDB (re-packing and NTT). Cost: 16.8 s for 256 MB, 569 s for 8 GB. No incremental update mechanism discussed.
- **Key rotation / query limits:** Public parameters are reusable across all queries. Security proof (Theorem D.4) holds for any polynomial number Q of queries.&#8201;[^32]
- **Session model:** Client-hint upload model: client must complete an offline phase (upload 3.9 MB of public parameters) before making queries. Not suitable for fully anonymous / ephemeral access.
- **Cold start suitability:** No -- requires offline communication. First query requires setup (<=80 ms client-side) plus parameter upload.
- **Large-record crossover:** When records exceed a few KB, the subring compression techniques provide no benefit, and Respire converges to Spiral (or SpiralPack) performance.&#8201;[^33]

[^32]: Appendix D.2, Theorem D.4 (p.51): Security holds "for all adversaries making at most Q queries."

[^33]: Section 1.1 (p.3): "Note that the Respire query compression and response compression techniques are tailored for the setting of small database elements. When the database elements are sufficiently large (concretely, on the order of a few KB), then our compression techniques no longer provide any savings and the Respire protocol is equivalent to Spiral."

---

<a id="key-tradeoffs-limitations"></a>

### Key Tradeoffs & Limitations <a href="#toc">⤴</a>

- **Small-record niche:** Respire's subring techniques only help when records fit in d2 < d1 coefficients. For records > ~2 KB, Respire reduces to Spiral with no advantage.&#8201;[^33]
- **Throughput penalty vs Spiral:** Respire is ~26% slower than Spiral on an 8 GB database because the smaller plaintext modulus (p=16 vs p=256) increases the number of RLWE encodings the server must process in the first-dimension scan.&#8201;[^34]
- **Throughput gap vs SimplePIR/YPIR:** 27-50x slower than SimplePIR/YPIR, but with up to 27x smaller communication and no large offline hint download (SimplePIR needs 445 MB hint).&#8201;[^35]
- **Batch scalability limit:** For large batch sizes (T > 128), query expansion becomes the dominant cost and scales linearly with T. Schemes with SIMD support (Vectorized BatchPIR, Piranha) are better for T in the hundreds/thousands.&#8201;[^36]
- **Client-specific offline phase:** The 3.9 MB upload is tied to the client's secret keys, precluding anonymous / stateless access.

[^34]: Section 4.2 (p.19): "Compared to Spiral, Respire is about 26% slower on an 8 GB database (but requires 4.5x less communication and a 2.5x smaller public parameters)."

[^35]: Table 1 (p.19) and Section 4.2 (p.19): "Compared to protocols like SimplePIR, HintlessPIR, and YPIR, the Respire protocol is up to 27x smaller [in communication] on the 8 GB database."

[^36]: Section 4.3 (p.21-22) and Fig. 7 (p.23): "For large batch sizes, Respire has smaller communication, but larger computational overheads."

---

<a id="comparison-with-prior-work"></a>

### Comparison with Prior Work <a href="#toc">⤴</a>

| Metric | Respire | Spiral | SimplePIR | YPIR |
|--------|---------|--------|-----------|------|
| Query size | 4.1 KB | 16.0 KB | 32.0 KB | 574 KB |
| Response size | 2.0 KB | 20.0 KB | 102.0 KB | 60 KB |
| Online comm. | 6.1 KB | 36.0 KB | 134.0 KB | 634 KB |
| Offline comm. | 3.9 MB ↑ | 7.8 MB ↑ | 102.9 MB ↓ | -- |
| Server time | 1.26 s | 1.28 s | 0.024 s | 0.17 s |
| Throughput | 204 MB/s | 200 MB/s | 10.4 GB/s | 1.49 GB/s |
| DB params | 2^20 x 256B (256 MB) | same | same | same |

**Key takeaway:** Respire should be preferred over other lattice-based PIR schemes when (a) database records are small (<=1 KB), (b) communication bandwidth is the bottleneck (not server computation), and (c) a modest offline parameter upload is acceptable. It achieves total online communication comparable to number-theoretic schemes (ElGamal, Gentry-Ramzan) but with >1000x higher server throughput.&#8201;[^37]

[^37]: Section 4.2 (p.18-19): "The advantage of these traditional number-theoretic schemes has been small communication...For example, the Gentry-Ramzan scheme can have communication as low as 1.8 KB...but at the price of a server throughput of roughly 20 KB/s."

---

<a id="open-problems"></a>

### Open Problems <a href="#toc">⤴</a>

- Can subring techniques be extended to achieve similar communication savings for *moderate*-size records (1-10 KB)?
- Can the offline parameter upload be eliminated while retaining Respire's communication efficiency? (This would move Respire from client-hint-upload to hintless.)
- Can the batch version be improved for large batch sizes (T > 256) without sacrificing the communication advantage?

---

<a id="uncertainties"></a>

### Uncertainties <a href="#toc">⤴</a>

- **Notation: d vs d:** The paper uses d generically for ring dimension and also d1, d2, d3 for specific ring dimensions. In Section 2, generic d is used; in Section 3+, the subscripted versions are used consistently.
- **q2 value:** For the single-query case, q2 = 16760833 ~ 2^{24} (Table 3 states q2 explicitly). For the batch case, q2 = 249857 ~ 2^{18} (Table 4). The paper states "q2 ~ 2^24" and "q2 ~ 2^18" respectively.
- **Throughput definition:** The paper defines throughput as "the ratio of the database size to the server's computation time" (Table 1 caption), which is the standard convention in this collection.
