## InsPIRe: Communication-Efficient PIR with Server-side Preprocessing -- Engineering Notes

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
<sub><nobr>9. <a href="#query-structure"><b>Query Structure</b></a></nobr></sub><br>
<sub><nobr>10. <a href="#communication-breakdown">Communication Breakdown</a></nobr></sub><br>
<sub><nobr>11. <a href="#correctness-analysis">Correctness Analysis</a></nobr></sub>

</td><td>

<sub><nobr>12. <a href="#complexity"><b>Complexity</b></a></nobr></sub><br>
<sub><nobr>13. <a href="#performance-benchmarks"><b>Performance Benchmarks</b></a></nobr></sub><br>
<sub><nobr>14. <a href="#application-scenarios">Application Scenarios</a></nobr></sub><br>
<sub><nobr>15. <a href="#deployment-considerations">Deployment Considerations</a></nobr></sub><br>
<sub><nobr>16. <a href="#key-tradeoffs-limitations"><b>Key Tradeoffs & Limitations</b></a></nobr></sub><br>
<sub><nobr>17. <a href="#comparison-with-prior-work">Comparison with Prior Work</a></nobr></sub><br>
<sub><nobr>18. <a href="#portable-optimizations"><b>Portable Optimizations</b></a></nobr></sub><br>
<sub><nobr>19. <a href="#implementation-notes"><b>Implementation Notes</b></a></nobr></sub><br>
<sub><nobr>20. <a href="#open-problems">Open Problems</a></nobr></sub><br>
<sub><nobr>21. <a href="#uncertainties">Uncertainties</a></nobr></sub>

</td></tr></table>

| Field | Value |
|-------|-------|
| **Paper** | [InsPIRe: Communication-Efficient PIR with Server-side Preprocessing](https://eprint.iacr.org/2025/1352) (2025) |
| **Archetype** | Construction + Building-block (InspiRING ring packing is a novel primitive) |
| **PIR Category** | Group B -- Stateless single-server, sub-model: CRS / query-bundled |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | Key-dependent RLWE hardness + circular security (for key-switching matrices) + CRS model |
| **Correctness model** | Probabilistic (failure prob bounded by correctness parameter delta = 2^{-40}) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server responds) |
| **Record-size regime** | Parameterized (1-bit to 32 KB demonstrated; interpolation degree t trades communication vs computation) |

<a id="lineage"></a>

### Lineage <a href="#toc">⤴</a>

| Field | Value |
|-------|--------|
| **Builds on** | YPIR (Group B, CRS/hintless), CDKS ring packing [18], DoublePIR (Group C), Spiral (Group A) |
| **What changed** | Replaces CDKS ring packing (which requires lg(d) key-switching matrices) with InspiRING (only 2 key-switching matrices) by exploiting the CRS model's fixed random components; adds homomorphic polynomial evaluation to reduce the second PIR dimension's response size from O(lg(t)) ciphertexts to 1 ciphertext |
| **Superseded by** | N/A |
| **Concurrent work** | KSPIR [58] (also CRS-model PIR with low communication) |

<a id="core-idea"></a>

### Core Idea <a href="#toc">⤴</a>

InsPIRe addresses the fundamental tension in single-server PIR between high throughput and low query communication without requiring offline communication. Prior CRS-model schemes like YPIR achieve high throughput but sacrifice online communication (up to megabytes per query). InsPIRe resolves this by introducing InspiRING, a novel ring packing algorithm that transforms d LWE ciphertexts into a single RLWE ciphertext using only two key-switching matrices (versus lg(d) in CDKS), with smaller noise growth and most computation deferrable to an offline preprocessing phase.&#8201;[^1] Additionally, InsPIRe encodes database columns as polynomials and uses homomorphic polynomial evaluation with RGSW-encrypted unit monomials to compress the second-dimension PIR response to a single ciphertext, incurring only additive noise per multiplication.&#8201;[^2]

[^1]: Abstract (p.1): "At the core of InsPIRe, we develop a novel ring packing algorithm, InspiRING, for transforming LWE ciphertexts into RLWE ciphertexts. InspiRING only requires two key-switching matrices whereas prior approaches needed logarithmic key-switching matrices."

[^2]: Section 6.1 (p.15-16): "Instead of explicitly representing each column as a concatenation of t database entries, our key idea is to implicitly represent it as coefficients of a polynomial that evaluates to the entries in that column for some publicly fixed evaluation points."

---

<a id="variants"></a>

### Variants <a href="#toc">⤴</a>

| Variant | Key Difference | Offline Comm | Online Comm | Best For |
|---------|---------------|-------------|-------------|----------|
| **InsPIRe_0** | Ring packing on top of DoublePIR; packs DoublePIR response LWE ciphertexts | None (CRS) | Lowest for 1-bit entries | 1-bit entries, optimizing server runtime |
| **InsPIRe^(2)** | Two layers of partial ring packing with parameters gamma_0, gamma_1, gamma_2 | None (CRS) | Flexible tradeoff via gamma_i | Medium entries (64 B), balancing communication and computation |
| **InsPIRe** | InspiRING + homomorphic polynomial evaluation; polynomial-encoded database | None (CRS) | Lowest total communication at moderate/large entries | General-purpose; 64 B to 32 KB entries |

InsPIRe_0 is a direct application of InspiRING to compress DoublePIR responses and is useful when the entry size is small.&#8201;[^3] InsPIRe^(2) uses two levels of partial ring packing and is more flexible.&#8201;[^4] InsPIRe is the full construction that combines InspiRING with homomorphic polynomial evaluation for the best communication-computation balance.&#8201;[^5]

[^3]: Section 4 (p.12): "InsPIRe_0 is instantiated on top of DoublePIR by using InspiRING or PartialInspiRING to pack the result of the DoublePIR responses."

[^4]: Section 5 (p.12): "InsPIRe^(2) consists of two levels of packing" using PartialInspiRING with three packing parameters gamma_0, gamma_1, gamma_2.

[^5]: Section 6 (p.15): "We present a new PIR protocol that uses our InspiRING ring packing algorithm as a building block" combined with "homomorphic polynomial evaluation."

---

<a id="novel-primitives-abstractions"></a>

### Novel Primitives / Abstractions <a href="#toc">⤴</a>

#### InspiRING (Full Packing)

| Field | Detail |
|-------|--------|
| **Name** | InspiRING |
| **Type** | Cryptographic primitive (ring packing algorithm) |
| **Interface / Operations** | `InspiRING.Pack([A, b] in Z_q^{d x (d+1)}, K_g in R_q^{ell x 2}, K_h in R_q^{ell x 2}) -> (a_fin, b_fin) in R_q x R_q`. Input: d LWE ciphertexts (as matrix), two key-switching matrices. Output: one RLWE ciphertext encrypting the d messages as polynomial coefficients. |
| **Security definition** | Security inherits from RLWE hardness + circular security assumption (key-switching matrices encrypt scaled automorphic images of the secret key).&#8201;[^6] |
| **Correctness definition** | Output RLWE ciphertext has additive packing noise e_pack with sub-Gaussian parameter sigma_pack^2 <= ell * d^2 * z^2 * sigma_chi^2 / 4 (Theorem 2, p.11). |
| **Purpose** | Translate d LWE ciphertexts into a single RLWE ciphertext, enabling efficient response compression in PIR. Designed specifically for the CRS model where random components are fixed and preprocessable. |
| **Built from** | Galois group trace function (Lemma 1), key-switching, Galois automorphisms tau_g and tau_h |
| **Standalone complexity** | Offline: O(d^3 + ell * d^2 * lg(d)). Online: O(ell * d^2).&#8201;[^7] |
| **Relationship to prior primitives** | Improves on CDKS [18] ring packing: CDKS needs lg(d) key-switching matrices (large cryptographic material); InspiRING needs only 2. InspiRING also has smaller noise growth and faster concrete packing times when total key-switching material must be small.&#8201;[^8] |

[^6]: Section 3.2 (p.12): "Beyond RLWE hardness, our packing scheme relies on the standard circular security assumption, as key-switching matrices encrypt (scaled) automorphic images of the secret key."

[^7]: Theorem 1 (p.11): "InspiRING in the CRS model can pack d LWE ciphertexts in O(d^3 + ell * d^2 * lg(d)) offline time and O(ell * d^2) online time where ell is the dimension of the key-switching matrix."

[^8]: Section 7.4, Table 5 (p.21-22): InspiRING with log_2 d=10 has Key Material=60 KB, Offline=2.4 s, Online=16 ms. InspiRING with log_2 d=11 has Key Material=84 KB, Offline=36 s, Online=40 ms. CDKS has Key Material=462 KB, Online=56 ms. HintlessPIR has Key Material=360 KB, Offline=2.0 s.

##### Three-Stage Construction

**Stage 1 -- LWE to Intermediate Ciphertext (TRANSFORM):** Each LWE ciphertext (a, b = -<a,s> + m) is reinterpreted as a larger intermediate representation IRCtx(m_hat) = (a_hat, b_tilde) where a_hat in R_q^d is constructed from Galois images of the RLWE-embedded random component, and b_tilde retains the original b. The key insight is using the trace function Tr(p) = sum_{j=0}^{d/2-1} tau_g^j(p) + tau_h o tau_g^j(p) to isolate the constant term: Tr(p) = d * c_0.&#8201;[^9] The message is embedded as a constant-term polynomial m_hat(X) = m, enabling interference-free aggregation.

[^9]: Lemma 1 (p.9): "Let p(X) in Z[X]/(X^d + 1) ... Then Tr(p) = d * c_0." This is the foundation for constructing the intermediate ciphertext representation.

**Stage 2 -- Aggregation of Intermediate Ciphertexts (PACK):** d IRCtx ciphertexts are combined by multiplying IRCtx(m_hat_k) by X^k and summing: the aggregated plaintext m_hat_agg = sum_{k=0}^{d-1} m_hat_k * X^k embeds each original LWE message into a distinct polynomial coefficient.&#8201;[^10]

[^10]: Section 3.2 (p.10): "The above operation positions the original plaintext messages in the LWE ciphertexts, m_k, into the coefficients of m_hat_agg."

**Stage 3 -- Conversion to RLWE Ciphertext (COLLAPSE):** The aggregated intermediate ciphertext IRCtx(m_hat_agg) = (a_hat_agg, b_tilde_agg) in R_q^d x R_q is converted to a standard two-component RLWE ciphertext via iterative key-switching. The key-switching matrices K_g and K_h, plus their Galois automorphic images, "telescope" the d random components down to masking by two secret key shares s_bar and tau_h(s_bar), then a final key-switching eliminates tau_h(s_bar).&#8201;[^11]

[^11]: Section 3.2 (p.10-11): "This iterative key-switching procedure is designed to maintain an important invariant: throughout the reduction, the evolving random components remain dependent only on the initial, preprocessable random components of the input LWE ciphertexts and the key-switching matrices K_g and K_h."

#### PartialInspiRING

| Field | Detail |
|-------|--------|
| **Name** | PartialInspiRING |
| **Type** | Variant of InspiRING (ring packing algorithm) |
| **Interface / Operations** | `PartialInspiRING.PartialPack([A, b] in Z_q^{gamma x (d+1)}, K_g in R_q^{ell x 2}) -> (a_fin, b_fin) in R_q x R_q`. Packs gamma <= d/2 LWE ciphertexts using only one key-switching matrix. |
| **Purpose** | Reduces key material by half (1 KS matrix instead of 2). Only the first gamma coefficients of the packed RLWE ciphertext carry the messages; remaining coefficients are discarded. Used in InsPIRe^(2) and InsPIRe for partial response packing. |
| **Standalone complexity** | Offline: O(gamma^2 * d + ell * gamma * d * lg(d)). Online: O(ell * gamma * d).&#8201;[^12] |
| **Noise** | sigma_pack^2 <= ell * gamma * d * z^2 * sigma_chi^2 / 4 (Theorem 4, p.12). |

[^12]: Theorem 3 (p.12): PartialInspiRING complexity with gamma <= d/2 LWE ciphertexts and one key-switching matrix.

#### Homomorphic Polynomial Evaluation

| Field | Detail |
|-------|--------|
| **Name** | Homomorphic polynomial evaluation (for PIR) |
| **Type** | PIR technique / abstraction |
| **Interface / Operations** | Server encodes each database column as a polynomial h^(i)(Z) = sum_{j=0}^{t-1} c_j^(i) * Z^j in R_p[Z] where h^(i)(z_j) = y_j^(i) (the j-th entry in column i). Client sends RGSW(omega^j) for a single evaluation point z_j = omega^j. Server evaluates the polynomial homomorphically using RLWE-RGSW external products. |
| **Purpose** | Replaces one-hot selection vectors (O(lg(t)) ciphertexts) for the second PIR dimension with a single RGSW ciphertext, reducing communication. |
| **Built from** | Polynomial interpolation over R_p using unit monomial evaluation points z_k = omega^k where omega = X^{2d/t} is a primitive t-th root of unity. Evaluation via Horner's method (EvalPoly, Algorithm 9).&#8201;[^13] |
| **Key property** | By choosing evaluation points as unit monomials (elements of the form +/- X^k), each RLWE-RGSW external product incurs only additive noise growth (Lemma 2), not multiplicative. This is critical for keeping noise manageable across t-1 multiplications.&#8201;[^14] |
| **Constraints** | (1) t <= 2d (required for unit monomial evaluation points). (2) t is a power of two (required for Cooley-Tukey FFT interpolation). Non-power-of-two t supported via less efficient Lagrange interpolation (Appendix G.3). Constraint (1) can be relaxed via multivariate interpolation (Appendix G.2).&#8201;[^15] |

[^13]: Section 6.1 (p.16): "To perform evaluation, we will use the Horner-style method (see EvalPoly in Algorithm 9), that only involves RLWE-RGSW external products and RLWE additions."

[^14]: Lemma 2 (p.16): "Given RLWE(m_0) and RGSW(m_1) where m_1 = +/- X^k ... the external product RLWE(m_0) boxdot RGSW(m_1) incurs additive noise e_ep with sigma_ep^2 <= ell * d * z^2 * sigma_chi^2 / 2."

[^15]: Section 6.1 (p.16): Constraints listed under "Constraints and Generalizations."

---

<a id="cryptographic-foundation"></a>

### Cryptographic Foundation <a href="#toc">⤴</a>

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Key-dependent RLWE (Definition 1, Appendix F, p.32): a variant of decisional RLWE where the oracle provides samples that may depend on the secret key via a function family F_auto = {k * tau_g \| k in Z_q, g in N}. Standard RLWE is a special case. |
| **Encryption/encoding schemes** | (1) **LWE encryption:** (a, b) in Z_q^d x Z_q, b = -<a,s> + e + Delta*m. Used for first-dimension PIR query (indicator vector). (2) **RLWE encryption:** (a, b) in R_q x R_q. Used for packed responses and intermediate packing results. (3) **RGSW encryption:** [a', b'] = [a, -sa + e] + m * G_{2,z}. Used for homomorphic polynomial evaluation (single ciphertext encrypting evaluation point). |
| **Ring / Field** | R = Z[X]/(X^d + 1) with d a power of two. R_q = Z_q[X]/(X^d + 1). Concrete: d = 2048 for InsPIRe^(2) and InsPIRe. Plaintext ring: R_p = Z_p[X]/(X^d + 1). |
| **Key structure** | Secret key s sampled from chi(Z^d) (LWE) or chi(R) (RLWE). In the CRS model, random components (a vectors, A matrices) are fixed globally and shared; fresh secret keys are sampled per query (multiplicative security loss proportional to number of queries).&#8201;[^16] |
| **Correctness condition** | Probabilistic: for delta > 2d*exp(-pi*(Delta/2 - tp/2)^2 / sigma_main^2), InsPIRe is (1-delta)-correct, where sigma_main^2 = N*p^2*sigma_chi^2 + t*ell_ks*d^2*z_ks^2*sigma_chi^2/4 + t*ell_gsw*d*z_gsw^2*sigma_chi^2/2 (Theorem 10, p.32).&#8201;[^17] |

[^16]: Section 2.1 (p.7): "Under this assumption, we fix the random components of the LWE/RLWE ciphertexts, and this scheme remains secure as long as fresh secret keys are generated for each query."

[^17]: Theorem 10 (p.32): Defines sigma_main and the correctness bound for InsPIRe. Also Theorem 9 (p.31) gives the noise decomposition e = e_main + e_overflow with e_overflow negligible in practice.

---

<a id="key-data-structures"></a>

### Key Data Structures <a href="#toc">⤴</a>

- **Database:** D in Z_p^{td x N/t}, a matrix where each column corresponds to t database entries, each entry an element of Z_p^d. For InsPIRe, entries are further encoded as polynomials: each column i is represented by h^(i)(Z) in R_p[Z] of degree t-1, with h^(i)(z_j) = y_j^(i). The encoded database D' in Z_p^{td x N/t} stores the polynomial coefficients c_j^(i) in R_p.&#8201;[^18]
- **Key-switching matrices:** K_g = KS.Setup(tau_g(s_bar), s_bar) and K_h = KS.Setup(tau_h(s_bar), s_bar) in R_q^{ell x 2} each. For InsPIRe: two KS matrices for InspiRING packing. Total key material: 2 * d * ell_ks * log_2(q) bits.
- **RGSW ciphertext:** A single RGSW(omega^j) in R_q^{2*ell_gsw x 2} encrypting the evaluation point. Size: 4 * ell_gsw * d * log_2(q) bits.
- **Query:** Consists of (b, RGSW(omega^j), y_g, y_h) where b in Z_q^{N/t} is the encrypted indicator vector, RGSW(omega^j) is the evaluation-point ciphertext, and y_g, y_h are key-switching material components.

[^18]: Section 6.1 (p.15-16): "We will use polynomials to represent each column of the matrix D" with evaluation at unit monomial points z_k = omega^k.

---

<a id="database-encoding"></a>

### Database Encoding <a href="#toc">⤴</a>

- **Representation:** Matrix D in Z_p^{td x N/t}. Each column holds t entries, each entry in Z_p^d. For InsPIRe, each column is further encoded as a degree-(t-1) polynomial h^(i)(Z) over R_p whose evaluation at t unit monomial points z_0, ..., z_{t-1} yields the t entries.
- **Record addressing:** Two-level index (i, j): column i = target column (selected by LWE indicator vector), row j = target entry within column (selected by polynomial evaluation at z_j = omega^j).
- **Preprocessing required:** Polynomial interpolation of each column: given the t entries y_0^(i), ..., y_{t-1}^(i) in R_p, compute coefficients c_0^(i), ..., c_{t-1}^(i) via inverse DFT (Cooley-Tukey FFT). Time: O(t * log(t)) per column, O(N/t * t * log(t)) = O(N * log(t)) total.&#8201;[^19]
- **Record size equation:** Each entry is an element of Z_p^d, i.e., d * log_2(p) bits. For arbitrary entry size m: if m > d, divide into m/d chunks and run PIR on m/d parallel databases; if m < d, bundle d/m entries per Z_p^d element.

[^19]: Algorithm 7 (p.17): EncodeDB calls Interpolate which uses CooleyTukey for FFT-based interpolation.

---

<a id="protocol-phases"></a>

### Protocol Phases <a href="#toc">⤴</a>

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **DB Encoding** | Server | Polynomial interpolation of each column (EncodeDB) | -- | Once (or on DB change) |
| **CRS Setup** | Trusted party | Generate public random matrix A, KS random components w_g, w_h | Global CRS | Once |
| **Setup (offline)** | Server | Compute pp = (N, t, rp, gp_ks, gp_gsw, qry_off); precompute key-switching material random parts; encode database D' | pp shared with client | Once |
| **Query** | Client | Sample secret s, compute LWE indicator vector b, generate RGSW(omega^j) for target entry j, generate KS material y_g, y_h | qry = (b, RGSW(omega^j), y_g, y_h) -- upload size per Theorem 12 | Per query |
| **Respond (offline)** | Server | Reconstruct K_g, K_h from precomputed random parts + client's y_g, y_h; matrix-multiply D' * [A, b] to get t*d LWE ciphertexts | -- (precomputed) | Per query (but most work is preprocessable) |
| **Respond (online)** | Server | InspiRING.Pack on t batches of d LWE ciphertexts; EvalPoly on packed RLWE ciphertexts with RGSW(omega^j) | resp = one RLWE ciphertext, size 2*d*log_2(q) bits | Per query |
| **Extract** | Client | RLWE.Dec(s_bar, resp) to recover y_j^(i) in R_p | -- | Per query |

---

<a id="query-structure"></a>

### Query Structure <a href="#toc">⤴</a>

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Packing keys (y_g, y_h) | KS material | 2 * d * ell_ks * log_2(q) bits (84 KB concrete) | Complete key-switching matrices K_g, K_h on server |
| Indicator vector b | LWE ciphertexts | (N/t) * log_2(q) bits | Encrypted selection of target column |
| RGSW ciphertext | RGSW | 4 * ell_gsw * d * log_2(q) bits (84 KB concrete) | Encrypted evaluation point omega^j for polynomial evaluation |

---

<a id="communication-breakdown"></a>

### Communication Breakdown <a href="#toc">⤴</a>

| Component | Direction | Size (concrete, 1 GB / 64 B) | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Packing keys | Upload | 84 KB | No (per-query secret) | KS material for InspiRING |
| Query (indicator + RGSW) | Upload | 196 KB (varies with N/t) | No | LWE indicator + evaluation point |
| Response | Download | 12 KB | No | Single RLWE ciphertext |
| **Total** | -- | **292 KB** | -- | From Table 2 (1 GB, 64 B entry) |

---

<a id="correctness-analysis"></a>

### Correctness Analysis <a href="#toc">⤴</a>

#### Option A: FHE Noise Analysis

The noise analysis tracks sub-Gaussian parameters through three sources, combined under the independence heuristic.&#8201;[^20]

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| First-dim matrix multiply (N/t LWE ciphertexts summed) | sigma_1^2 <= N*p^2*sigma_chi^2 | Additive (summation) | Multiplying each LWE ct by Z_p element and summing N/t of them |
| InspiRING packing (per batch of d LWEs) | sigma_pack^2 <= ell_ks*d^2*z_ks^2*sigma_chi^2/4 | Additive (key-switching) | Theorem 2: noise from d-2 key-switchings in Collapse |
| Polynomial evaluation (t-1 external products) | sigma_ep^2 <= ell_gsw*d*z_gsw^2*sigma_chi^2/2 per step | Additive per step | Lemma 2: unit monomial RGSW ensures additive-only noise growth |
| **Total main noise** | sigma_main^2 = N*p^2*sigma_chi^2 + t*ell_ks*d^2*z_ks^2*sigma_chi^2/4 + t*ell_gsw*d*z_gsw^2*sigma_chi^2/2 | -- | Theorem 9 (p.31): three terms correspond to the three phases |

- **Correctness condition:** For delta > 2d*exp(-pi*(Delta/2 - tp/2)^2 / sigma_main^2), InsPIRe is (1-delta)-correct (Theorem 10, p.32).
- **Independence heuristic used?** Yes -- all intermediate error terms are assumed independent to enable variance-based (not worst-case) analysis.&#8201;[^21]
- **Overflow noise:** e_overflow = epsilon * p * m_hat where epsilon in [-1/2, 1/2) from the scaling factor Delta = floor(q/p) = q/p + epsilon. Bounded by ||e_overflow||_inf <= tp/2. In practice negligible because q >> tp^2.&#8201;[^22]
- **Dominant noise source:** The packing noise (InspiRING) dominates for small t; the polynomial evaluation noise grows with t.

[^20]: Section 2 (p.7): "we assume the independence heuristic where the error terms of all intermediate computations are independent."

[^21]: Theorem 9 (p.31) and Theorem 10 (p.32) both invoke the independence heuristic.

[^22]: Theorem 9 (p.31): "The e_overflow term is introduced from the homomorphic polynomial evaluation because the sum of the embedded plaintexts typically overflows the R_p plaintext space." Shown negligible for q >> tp^2.

---

<a id="complexity"></a>

### Complexity <a href="#toc">⤴</a>

#### Core metrics

| Metric | Asymptotic (InsPIRe) | Concrete (1 GB, 64 B entries) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | (N/t)*log_2(q) + (d*ell_ks + 4*ell_gsw*d + 2*d)*log_2(q) | 196 KB upload (query) + 84 KB upload (keys) | Online |
| Response size | 2*d*log_2(q) | 12 KB | Online |
| Total communication | d*ell_ks*log_2(q) + (N/t)*log_2(q) + 4*ell_gsw*d*log_2(q) + 2*d*log_2(q) (Theorem 12) | 292 KB | Online |
| Server computation | O(N*d + t*ell_ks*d^2 + t*ell_gsw*d*lg(d)) online | 960 ms (online server time) | Online |
| Throughput | -- | 1006 MB/s (1 GB, 64 B entry) | Online |

#### FHE-specific metrics

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|---------|-------|
| Public parameters | O(N*d) (matrix A) + KS random parts | ~80 KB (keys) + CRS | Setup |
| Expansion factor | 2*log_2(q)/log_2(p) for response | q=56-bit, p=16-bit: F ~ 7 | -- |
| Multiplicative depth | t-1 (polynomial evaluation) but additive-only noise due to unit monomials | Up to 31 for t=32 | -- |

#### Server computation breakdown (InsPIRe, 1 GB, 64 B entry)

| Step | Offline | Online |
|------|---------|--------|
| Matrix multiplication (D' * [A, b]) | -- | O(N*d) |
| InspiRING packing (t batches) | O(t*(d^3 + ell_ks*d^2*lg(d))) | O(t*ell_ks*d^2) |
| Polynomial evaluation (EvalPoly) | -- | O(t*ell_gsw*d*lg(d)) |

---

<a id="performance-benchmarks"></a>

### Performance Benchmarks <a href="#toc">⤴</a>

**Hardware:** Intel Xeon CPU @ 2.6 GHz, single-threaded. Offline runtimes measured once; online runtimes averaged over 5 runs (standard deviation < 5%).&#8201;[^23]

**Implementation:** ~3,000 lines of Rust (InspiRING); ~3,000 lines of Rust (InsPIRe^(2)); ~2,000 lines of Rust (InsPIRe). Built on RLWE building blocks from spiral-rs. Code: https://github.com/google/private-membership/tree/main/research/InsPIRe.&#8201;[^24]

[^23]: Section 7 (p.19): "We perform all experimental evaluations on an Intel Xeon CPU @ 2.6 GHz ... single-threaded mode."

[^24]: Section 7 (p.19): Implementation details and GitHub links.

**Lattice parameters (Table 1, p.19):**

| Scheme | d | log_2(q) | sigma_chi | p | ell_KS | ell_GSW | z_KS | z_GSW |
|--------|---|----------|-----------|---|--------|---------|------|-------|
| InsPIRe_0 (ring 1) | 1024 | 32 | 6.4 | 256 | 3 | -- | -- | -- |
| InsPIRe_0 (ring 2) | 2048 | 56 | 6.4 | 8192 | 3 | -- | 2^19 | -- |
| InsPIRe^(2) | 2048 | 53 | 6.4 | 65536 | 3 | -- | 2^19 | -- |
| InsPIRe | 2048 | 56 | 6.4 | 65535 | 3 | 3 | 2^19 | 2^19 |

Security: 128-bit, based on lattice-estimator [2] with correctness parameter delta = 2^{-40}.&#8201;[^25]

[^25]: Section 7 (p.19): "For InsPIRe^(2) and InsPIRe, we use lattice parameters which provide 128-bit security based on the lattice-estimator [2] and correctness parameter delta = 2^{-40}."

#### Table 2: 1-bit entries (selected rows, 1 GB database = 2^33 x 1 bit)

| Metric | YPIR | SimpleYPIR | KSPIR | HintlessPIR | InsPIRe_0 | InsPIRe^(2) | InsPIRe |
|--------|------|-----------|-------|-------------|-----------|-------------|---------|
| Upload (Keys) | 462 KB | 462 KB | 462 KB | 360 KB | 84 KB | 80 KB | 84 KB |
| Upload (Query) | 1024 KB | 448 KB | 14 KB | 512 KB | 106 KB | 113 KB | 140 KB |
| Download | 12 KB | 12 KB | 224 KB | 3316 KB | 36 KB | 52 KB | 12 KB |
| Total Comm | 1498 KB | 922 KB | 700 KB | 4188 KB | 226 KB | 245 KB | 236 KB |
| Server Time | 830 ms | 830 ms | 5910 ms | 2000 ms | 320 ms | 480 ms | 280 ms |
| Throughput | 8930 MB/s | 8930 MB/s | 1390 MB/s | 4040 MB/s | -- | 2880 MB/s | 3620 MB/s |

#### Table 3: 64 B entries (selected rows, 1 GB = 2^24 x 64 B)

| Metric | YPIR | SimpleYPIR | KSPIR | HintlessPIR | InsPIRe^(2) (selected) | InsPIRe |
|--------|------|-----------|-------|-------------|----------------------|---------|
| Upload (Keys) | 462 KB | 462 KB | 360 KB | 128 KB | 80 KB | 84 KB |
| Upload (Query) | 384 KB | 112 KB | 14 KB | 128 KB | 109 KB | 196 KB |
| Download | 12 KB | 228 KB | 224 KB | 1748 KB | 52 KB | 12 KB |
| Total Comm | 858 KB | 802 KB | 598 KB | 2004 KB | 241 KB | 292 KB |
| Server Time | 600 ms | 600 ms | 780 ms | 750 ms | 360 ms | 280 ms |
| Throughput | 1720 MB/s | 1720 MB/s | 1310 MB/s | 1370 MB/s | 2880 MB/s | 3620 MB/s |

#### Table 4: 32 KB entries (selected rows, 1 GB = 2^15 x 32 KB)

| Metric | YPIR | SimpleYPIR | KSPIR | HintlessPIR | InsPIRe^(2) (selected) | InsPIRe |
|--------|------|-----------|-------|-------------|----------------------|---------|
| Upload (Keys) | 462 KB | 462 KB | 360 KB | 128 KB | 84 KB | 84 KB |
| Upload (Query) | 112 KB | 112 KB | 14 KB | 128 KB | 112 KB | 196 KB |
| Download | 228 KB | 888 KB | 224 KB | 6452 KB | 96 KB | 96 KB |
| Total Comm | 802 KB | 1462 KB | 598 KB | 6708 KB | 292 KB | 376 KB |
| Server Time | 600 ms | 600 ms | 780 ms | 750 ms | 640 ms | 410 ms |
| Throughput | 1720 MB/s | 1720 MB/s | 1310 MB/s | 1370 MB/s | 1600 MB/s | 2500 MB/s |

#### Ring packing benchmark (Table 5, p.22): Packing 2^12 LWE ciphertexts

| Metric | HintlessPIR | InspiRING (d=10) | CDKS | InspiRING (d=11) |
|--------|-------------|------------------|------|------------------|
| Unpacked Size | 16 MB | 14 MB | 56 MB | 56 MB |
| Key Material | 360 KB | **60 KB** | 462 KB | **84 KB** |
| Packed Size | 180 KB | 32 KB | 56 KB | 56 KB |
| Total Size | 540 KB | **92 KB** | 518 KB | **140 KB** |
| Offline Runtime | 2.0 s | 2.4 s | 11 s | 36 s |
| Online Runtime | 141 ms | **16 ms** | 56 ms | **40 ms** |

InspiRING achieves 84% less key material than CDKS and 76% less than HintlessPIR. InspiRING (d=10) achieves 71% faster online time than CDKS (16 ms vs 56 ms); InspiRING (d=11) achieves 28% faster online time than CDKS (40 ms vs 56 ms), at the cost of a slower offline phase.&#8201;[^26]

[^26]: Section 7.4 (p.22): "InspiRING requires significantly smaller key material compared to existing work, specifically, 84%, 76%, and over 99% less key material than CDKS and HintlessPIR, respectively."

---

<a id="application-scenarios"></a>

### Application Scenarios <a href="#toc">⤴</a>

#### Private Queries in IPFS (Section 8.1)

IPFS content retrieval involves three PIR query types: peer routing (256 x 1.5 KB), content discovery (200K records), and content retrieval (2^14 x 256 KB). InsPIRe improves communication by 32-51% and computation by 8-86% over prior RLWEPIR-based work [60].&#8201;[^27]

| IPFS Step | DB Shape | InsPIRe Comm | Prior [60] Comm | Improvement |
|-----------|----------|-------------|-----------------|-------------|
| Peer Routing | 256 x 1.5 KB | 69 KB | >100 KB | 32% |
| Content Discovery | 200K records | 128 KB | >280 KB | 46% |
| Content Retrieval | 2^14 x 256 KB | 1.02 MB | >2.1 MB | 51% |

[^27]: Table 6 (p.23): IPFS PIR cost comparison.

#### Privacy-Preserving Device Enrollment (Section 8.2)

Chrome OS device enrollment checks membership in a server-held database. InsPIRe is ideal because there is no opportunity for offline client-server communication (cold start). For 40M devices (each 64 bytes, 2.38 GB database): total communication 292 KB, response time 815 ms.&#8201;[^28]

[^28]: Table 7 (p.23): "The concrete cost of using PIR for device enrollment is only a few hundred KiloBytes."

---

<a id="deployment-considerations"></a>

### Deployment Considerations <a href="#toc">⤴</a>

- **Database updates:** Server re-encodes database (polynomial interpolation) on change. No per-client state to update. Server-side preprocessing of InspiRING can be re-executed independently.&#8201;[^29]
- **Cold start suitability:** Excellent -- no offline communication needed. CRS model means clients can issue queries immediately.&#8201;[^30]
- **Anonymous query support:** Yes -- no per-client state on server. Fresh secret key per query. Server stores no client-identifying material.
- **Session model:** Ephemeral client (stateless between queries).
- **Key rotation / query limits:** Security degrades multiplicatively with number of queries Q (standard hybrid argument, Appendix F.1). Fresh secret key per query mitigates this.
- **Sharding:** Not explicitly discussed, but the matrix structure D in Z_p^{td x N/t} is naturally shardable by columns.

[^29]: Section 1.1 (p.4-5): "PIR with server-side preprocessing only requires the server to locally compute and update its internal database representation to handle database changes."

[^30]: Section 1.1 (p.4): "Cold Start" argument: "PIR protocols with server-side preprocessing may be used immediately even if the client has no time to perform offline communication."

---

<a id="key-tradeoffs-limitations"></a>

### Key Tradeoffs & Limitations <a href="#toc">⤴</a>

- **Communication vs computation tradeoff via interpolation degree t:** Larger t reduces query size (fewer rows N/t in the indicator vector) but increases polynomial evaluation cost (t-1 external products). Optimal total communication at t = sqrt(N), but server runtime increases.&#8201;[^31]
- **Offline preprocessing cost:** InspiRING's offline phase has cubic dependence on d (O(d^3)), which is slower than CDKS's offline for large d. The online savings compensate in PIR applications.
- **Constraint on t:** Requires t <= 2d for unit monomial evaluation points. For d = 2048 and typical database shapes, t <= 4096. Multivariate extension (Appendix G.2) relaxes this at the cost of alpha RGSW ciphertexts instead of one.
- **Key material still non-trivial:** While 5x smaller than YPIR's keys, the 84 KB packing key upload is not zero. In bandwidth-critical applications, this matters.
- **Approximate gadget decomposition (Appendix G.1):** Can reduce key material and computation by ~25-33% by dropping the least significant digit of the decomposition, at the cost of a small additive noise term.&#8201;[^32]

[^31]: Section 7.2 (p.20): "the choice of the interpolation degree results in a tradeoff between communication and computation."

[^32]: Appendix G.1 (p.34): "We expect this technique to reduce the size of the key-switching matrices and the RGSW encrypted evaluation points by around 33% while reducing the total computation up to approximately 25%."

---

<a id="comparison-with-prior-work"></a>

### Comparison with Prior Work <a href="#toc">⤴</a>

**1 GB database, 64 B entries (Table 3):**

| Metric | InsPIRe | YPIR | KSPIR | HintlessPIR | SimpleYPIR |
|--------|---------|------|-------|-------------|-----------|
| Total Comm | **292 KB** | 858 KB | 598 KB | 2004 KB | 802 KB |
| Server Time | **280 ms** | 600 ms | 780 ms | 750 ms | 600 ms |
| Throughput | **3620 MB/s** | 1720 MB/s | 1310 MB/s | 1370 MB/s | 1720 MB/s |
| Upload Keys | 84 KB | 462 KB | 360 KB | 128 KB | 462 KB |

**Key takeaway:** InsPIRe simultaneously achieves the lowest total communication (67% less than YPIR, 51% less than KSPIR) and the highest throughput (2.1x over YPIR) among all CRS-model and hintless PIR schemes, without any offline communication. For 1-bit entries, InsPIRe_0 achieves even lower communication (226 KB) and faster server time (320 ms). The only scenario where InsPIRe is outperformed is when minimizing only server runtime for 1-bit entries (where InsPIRe_0 with its simpler DoublePIR-based structure may be preferred).&#8201;[^33]

[^33]: Section 7.3 (p.21): "In summary, InsPIRe strictly improves over existing PIR schemes with server-side preprocessing, and may also be parameterized to optimize specific metrics such as communication."

---

<a id="portable-optimizations"></a>

### Portable Optimizations <a href="#toc">⤴</a>

- **InspiRING ring packing:** Applicable to any RLWE-based PIR in the CRS model that needs LWE-to-RLWE conversion. Can directly replace CDKS packing in YPIR for improved key material and online time.&#8201;[^34]
- **Homomorphic polynomial evaluation with unit monomials:** Applicable to any scheme needing homomorphic evaluation of a polynomial over R_p. The additive-only noise property from unit monomial evaluation points is a general technique independent of PIR.
- **Trace-function-based intermediate ciphertexts:** The use of Galois group trace to isolate constant terms is a reusable algebraic technique for constructing MLWE-like intermediate representations from LWE ciphertexts.
- **Approximate gadget decomposition (Appendix G.1):** Dropping least-significant digits of gadget decomposition to reduce key material. Applicable to any scheme using key-switching or RGSW external products.

[^34]: Section 6 (p.15): "One can follow the prior PIR frameworks such as YPIR [63] and replace their ring packing algorithms with InspiRING. This immediately results in an improved PIR scheme."

---

<a id="implementation-notes"></a>

### Implementation Notes <a href="#toc">⤴</a>

- **Language / Library:** Rust, building on spiral-rs (YPIR implementation [3]) for RLWE operations.
- **Polynomial arithmetic:** NTT-based (standard for RLWE operations).
- **Lines of Code (LOC):** ~3,000 (InspiRING) + ~3,000 (InsPIRe^(2)) + ~2,000 (InsPIRe) = ~8,000 total.
- **Open source:** https://github.com/google/private-membership/tree/main/research/InsPIRe
- **Parallelism:** Single-threaded for all benchmarks.
- **SIMD / vectorization:** Not explicitly discussed; inherits from spiral-rs baseline.

---

<a id="open-problems"></a>

### Open Problems <a href="#toc">⤴</a>

- **Multivariate polynomial evaluation:** Extending to t > 2d via multivariate interpolation (Appendix G.2) with alpha variables, requiring alpha RGSW ciphertexts. Full analysis of the communication-computation tradeoff in this regime is left open.&#8201;[^35]
- **Non-power-of-two t:** Lagrange interpolation (Appendix G.3) supports arbitrary t at O(t^2) cost instead of O(t*log(t)). Whether more efficient approaches exist for specific non-power-of-two t values is open.
- **Approximate gadget decomposition:** Mentioned as a promising optimization with estimated 25-33% improvement, but not fully implemented or benchmarked.

[^35]: Appendix G.2 (p.35): Multivariate extension described but concrete parameter optimization left to future work.

---

<a id="uncertainties"></a>

### Uncertainties <a href="#toc">⤴</a>

- The paper uses d to denote both the LWE dimension and the ring degree interchangeably (stated explicitly on p.6: "Throughout the paper, we use d to denote both the dimension of LWE samples and the degree of RLWE samples").
- The variable p is used for both the plaintext modulus and as a generic polynomial symbol. Context disambiguates but may cause confusion.
- Table 2's "SimpleYPIR" column refers to a simplified YPIR variant using YPIR parameters with InsPIRe_0, described as "YPIR parameters identical to those used in YPIR" (p.19). The exact relationship to published YPIR is not fully specified.
- Noise analysis for InsPIRe^(2) (Theorem 7, Theorem 8, p.14-15) involves three separate failure events E_0, E_1, E_2 corresponding to three packing stages, each with its own noise variance. The parameter tables (Table 8, p.38) show these lead to distinct optimal parameterizations.
