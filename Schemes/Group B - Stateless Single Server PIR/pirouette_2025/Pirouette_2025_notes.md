## Pirouette: Query Efficient Single-Server PIR -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Pirouette: Query Efficient Single-Server PIR](https://doi.org/10.56553/popets-2025-0038) (2025) |
| **Archetype** | Construction |
| **PIR Category** | Group B -- Stateless single-server PIR |
| **Sub-model** | Client-hint upload (secret-key-dependent evaluation keys uploaded offline) |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | Circular security / KDM (key-dependent message) security for LWE and RLWE; PRG modeled as random oracle |
| **Correctness model** | Probabilistic (failure prob <= 2^{-40} via independence heuristic and atomic pattern analysis) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server responds) |
| **Record-size regime** | Parameterized (evaluated at 256 B records; record-size-independent query) |
| **Total pages** | 27 (13 main body + 14 appendix) |
| **Implementation** | C++ with OpenFHE; https://github.com/KULeuven-COSIC/Pirouette |

---

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Respire [Group B] (hypercube structure, record selection, response compression); TFHE/FHEW bootstrapping [Chillotti et al.] (blind rotation); Micciancio-Polyakov [72] (large-precision digit decomposition) |
| **What changed** | Replaces RLWE query compression (Respire's 14.8 KB query) with a single high-precision LWE ciphertext (36 B), using blind rotation and negacyclic LUT evaluation to homomorphically bit-decompose the LWE query and convert it to RGSW ciphertexts server-side. Eliminates transciphering entirely. |
| **Superseded by** | N/A |
| **Concurrent work** | N/A |

---

### Core Idea

Pirouette achieves a **36-byte query** for PIR over 2^25 records by transmitting a single high-precision LWE ciphertext LWE(idx, Delta) instead of RLWE ciphertexts or transciphered symmetric encryptions.&#8201;[^1] The server homomorphically bit-decomposes this LWE ciphertext using blind rotation (from TFHE/FHEW bootstrapping), producing ceil(log_2 N) LWE ciphertexts that encrypt individual index bits, and then converts these into RGSW ciphertexts via a separate LWEtoRGSW step.&#8201;[^2] These RGSW ciphertexts then drive the same hypercube record-selection pipeline as Respire (first-dimension processing via RLWE' selectors, folding via CMUX, rotation via CMUX). The result is a 9.3x query-size reduction over T-Respire and 420x over Respire, while server computation is only 2x slower than Respire.&#8201;[^3]

[^1]: Abstract (p.1): "our Pirouette protocol, which achieves a query size of just 36 B. This represents a 9.3x reduction compared to T-Respire and a 420x reduction to Respire."

[^2]: Section 1.1 (p.2): "The server first performs a homomorphic bit decomposition to the LWE query LWE(idx), and outputs ceil(log_2 N) LWE ciphertexts, each encrypting a single bit idx_l."

[^3]: Table 7 (p.11): For 2^25 x 256 B, Pirouette query = 36 B vs Respire 14.8 KB vs T-Respire 336 B; Pirouette computation = 60 s vs Respire 30 s.

---

### Variants

| Variant | Key Difference | Query Size | Offline Comm | Throughput (seq.) | Best For |
|---------|---------------|-----------|-------------|-------------------|----------|
| **Pirouette** | High-precision bit decomposition + blind rotation; 36 B query | 36 B | 1.2 GB | 137 MB/s | Minimum query size; bandwidth-constrained upload |
| **Pirouette^H** | Skips bit decomposition; sends LWE encryptions of all index bits directly | 55--60 B | 650 MB | 150 MB/s--178 MB/s | Faster computation; lower offline cost; slightly larger query acceptable |

**Tradeoff logic:**
- Pirouette minimizes query size (36 B) at the cost of higher offline communication (1.2 GB) and the blind-rotation computation in Phase 0.&#8201;[^4]
- Pirouette^H eliminates the bit-decomposition step, nearly halving offline key material (650 MB vs 1.2 GB) and improving computation by 20--30%, but increases query size to 55--60 B because all (n+1)-th components of the per-bit LWE ciphertexts must be sent along with the PRG seed.&#8201;[^5]

[^4]: Table 7 (p.11): Pirouette offline comm = 1.2 GB; Pirouette^H offline comm = 650 MB.

[^5]: Section 4.2 (p.9) and Table 7 (p.11): "Pirouette^H queries of all the bits ... requiring transmission of all their (n+1)-th components along with a PRG seed. This increases the query size from 36 B to 60 B."

---

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | LWE (plain, for query) + RLWE (for server-side computation and response). Security relies on both LWE and RLWE hardness.&#8201;[^6] |
| **Encryption/encoding schemes** | (1) **LWE** (high-precision): LWE_s^{n,q}(m, Delta) for query -- 25-bit plaintext modulus, 32-bit ciphertext modulus, encrypts index directly. (2) **RLWE**: RLWE_s^{N,Q}(m) for server-side computation. (3) **RLWE'** (Gadget RLWE): tuple of RLWE encryptions under gadget vector; used in external products for selector construction. (4) **RGSW**: RGSW_s^{N,Q}(b) for bit encryptions used as CMUX control bits in folding/rotation. |
| **Ring / Field** | R = Z[X]/(X^N + 1) with N = 512 for computation phases; R_{N_1} = Z[X]/(X^{N_1} + 1) with N_1 = 512 for response. LWE dimension n = 1300 (bit decomposition input) / n = 600 (after key-switch). Ciphertext moduli: q = 2^32 (LWE query), Q = 2^56 (RLWE computation), Q_1 (response compression). |
| **Key structure** | LWE secret s in Z^n (binary coefficients); RLWE secret s_1 in R_{N_1}. Client generates both; evaluation keys evk derived from s are uploaded to server offline. Circular security / KDM assumption required.&#8201;[^7] |
| **Correctness condition** | Failure probability epsilon <= 2^{-40}, achieved by bounding noise variance through each phase using the independence heuristic and atomic patterns.&#8201;[^8] |

[^6]: Section 4.1 (p.8): "Phase 1-3 of the Pirouette protocol operate over R and rely on the hardness of RLWE for security." Section 1.1 (p.2): "the Pirouette query is LWE(idx, Delta) ... relies on the hardness of LWE in this phase."

[^7]: Definition A.21 (p.25) and Theorem A.22 (p.25--26): Security proof requires F_scal-KDM security for LWE over Z_q and KDM security for RLWE over R_Q with respect to F_quad and F_aut.

[^8]: Section 4.1 (p.8): "a common choice of epsilon is epsilon <= 2^{-40}" and Appendix A.1 (p.16): correctness analysis via independence heuristic and atomic patterns.

---

### Ring Architecture / Modulus Chain

| Ring | Dimension | Modulus (bits) | Role / Phase |
|------|-----------|---------------|--------------|
| Z_q (LWE) | n_in = 1300 | 32-bit (q = 2^32) | Query encryption (high-precision LWE) |
| Z_q (LWE, post key-switch) | n_out = 600 | 12-bit (q_out) | After bit decomposition, before LWEtoRGSW |
| R_Q (RLWE/RGSW) | N = 512 | 56-bit (Q = 2^56) | Phases 1--3: selector construction, folding, rotation |
| R_{Q_1} (response) | N_1 = 512 | compressed | Response compression via ModSwitch + RingSwitch |

**Key modulus relationships:**
- High-precision LWE uses 25-bit plaintext modulus (Delta = floor(q/t)) with 32-bit ciphertext modulus q. This is the defining feature: conventional LWE-based FHE uses 4--5 bit plaintext moduli.&#8201;[^9]
- Bit decomposition via blind rotation requires q = 2N (Section 3.1, p.6). Table 3 (p.10) shows the actual parameters: log_2(q_in) = 32 for the input LWE query modulus.&#8201;[^10]
- Q = 268496897 * 268460033 approx 2^56 for computation phases, chosen as CRT-friendly product to exploit fast modular arithmetic.&#8201;[^11]

[^9]: Section 1.1 (p.2): "Our implementation uses a 25-bit plaintext modulus and 32-bit ciphertext modulus for LWE. This differs from conventional LWE-based applications [8,36,40] that typically consider a small plaintext modulus of 4 or 5 bits."

[^10]: Section 3.1 (p.6): q = 2N is required for the blind rotation step. Table 3 (p.10): n_in = 1300, n_out = 600, log_2(q_in) = 32, log_2(q_out) = 12, log_2(Q) = 56.

[^11]: Table 4 (p.10): "we modulus switch to Q = 268496897 * 268460033 to exploit the CRT and decrease the number of modular additions/multiplications."

---

### Key Data Structures

- **Database:** N records of size kappa bits, arranged as a (1 + v_2 + v_3)-dimensional hypercube with dimensions 2^{v_1} x 2^{v_2} x 2^{v_3}. Each plaintext element in R_{N,p} packs N/N_1 records. The preprocessed database db = {db_i in R_{N,p}}_{i in [0, 2^{v_1+v_2} - 1]} consists of 2^{v_1+v_2} ring elements.&#8201;[^12]
- **Preprocessed database:** Ring elements stored in NTT domain after SetupDB. Preprocessing cost: O(N log N) arithmetic operations per ring element. Approximately 128 GB RAM for an 8 GB database.&#8201;[^13]
- **Evaluation keys (evk):** Secret-key-dependent material uploaded offline. Components: blind-rotation keys (RGSW encryptions of secret key bits), key-switching keys, squaring keys, automorphism keys. Total size: 1.2 GB (Pirouette) or 650 MB (Pirouette^H).&#8201;[^14]
- **Query:** LWE ciphertext (a, b) in Z_q^{n+1}. The a component is derived from a PRG seed (32 B); only the b component (4 B) and the seed are transmitted. Total: 36 B.&#8201;[^15]

[^12]: Table 2 (p.8) and Section 4.1 (p.8): "each plaintext element in R_{N,p} encodes 2^{v_3} records" and "the SetupDB algorithm outputs N/(2^{v_3}) = 2^{v_1+v_2} elements in the ring R_{N,p}."

[^13]: Section 5.2 (p.10): "the pre-processed database (8GB) takes approximately 128GB of RAM."

[^14]: Table 6 (p.11): Storage requirements broken down by component -- Evaluation (4n * l * N * log_2(Q)), Key-Switching (N * l * (n+1) * log_2(Q)), Squaring (2Nl * log_2(Q)), Automorphism (log_2(N) * 2Nl * log_2(Q)), Response Compression (2Nl * log_2(Q)).

[^15]: Section 4.1 (p.7--8): "the querier samples a PRG seed ... which outputs n uniformly random elements in Z_q ... the querier computes b = <a, s> + Delta * idx + e mod q. The query qu consists of the PRG seed and the b part."

---

### Database Encoding

- **Representation:** (1 + v_2 + v_3)-dimensional hypercube. First dimension has 2^{v_1} entries, remaining v_2 dimensions have size 2 (binary folding), and v_3 rotation dimensions have size 2.
- **Record addressing:** Index idx in [N] decomposed as (alpha, beta_1, ..., beta_{v_2+v_3}) where alpha in [2^{v_1}] and beta_i in {0, 1}.
- **Preprocessing required:** NTT conversion of all database polynomials. Cost: O(N log N) operations. Database-parameter dependent (depends on N, p, Q).&#8201;[^16]
- **Record size equation:** Each record is kappa bits. With ring dimension N and plaintext modulus p, each ring element R_{N,p} encodes N * log_2(p) bits. For kappa = 256 * 8 bits and N_1 = 512: each R_{N_1,p} element holds one record.

[^16]: Section 5.2 (p.10): "database entries are mapped to coefficients of polynomials ... transformed using number-theoretic transforms (NTTs) with a cost of O(N log(N)) arithmetic operations."

---

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Setup** | Client | Generate LWE secret s, RLWE secret s_1; derive evaluation keys evk | -- | Once per client |
| **SetupDB** | Server | Encode N records into hypercube of ring elements; NTT transform | -- | Once per database |
| **Offline upload** | Client -> Server | Upload evaluation keys evk (blind-rotation keys, key-switching keys, squaring keys, automorphism keys) | 1.2 GB up (Pirouette) / 650 MB up (Pirouette^H) | Once per client |
| **Query** | Client | Encrypt idx as LWE(idx, Delta); send PRG seed + b component | 36 B up | Per query |
| **Phase 0: Bit Decomposition** | Server | Expand LWE query via BitDecomp (Algorithm 3): apply high-precision bit decomposition using blind rotation, key-switching, and modulus switching to produce ceil(log_2 N) RGSW ciphertexts encrypting individual index bits | -- | Per query |
| **Phase 0: LWEtoRGSW** | Server | Convert LWE ciphertexts of index bits to RGSW format via Algorithm 15 (blind rotation + coefficient extraction + squaring key) | -- | Per query |
| **Phase 1: First-dimension processing** | Server | Build v_1-bit RLWE' selector from RGSW bits via binary-tree construction (Algorithm 21); multiply selector against database rows | -- | Per query |
| **Phase 2: Folding** | Server | Apply v_2 rounds of CMUX using RGSW ciphertexts of folding bits to select within each dimension | -- | Per query |
| **Phase 3: Rotation** | Server | Apply v_3 rounds of CMUX using RGSW ciphertexts of rotation bits to select subring element | -- | Per query |
| **Response compression** | Server | ModSwitch_{Q -> Q_1} + RingSwitch_{N -> N_1} to compress RLWE ciphertext | 2 KB down | Per query |
| **Extract** | Client | Decrypt received RLWE ciphertext using s_1 to recover record | -- | Per query |

---

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| PRG seed | Plaintext | 32 B | Server derives a = PRG(seed) in Z_q^n |
| b component | Scalar in Z_q | 4 B | b = <a,s> + Delta * idx + e mod q; encodes the query index |
| **Total query** | **LWE ciphertext** | **36 B** | **Encrypted target index (high-precision LWE)** |

For Pirouette^H, the query instead consists of log(N) separate (n+1)-th LWE components (one per index bit) plus a PRG seed, totaling 55--60 B.&#8201;[^17]

[^17]: Section 4.2 (p.9): "only their (n+1)-th components need to be transmitted together with a PRG seed."

---

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Evaluation keys (evk) | Client -> Server | 1.2 GB (Pirouette) / 650 MB (Pirouette^H) | Yes, across all queries to any database | Offline; one-time per client. Dominated by blind-rotation and key-switching material. |
| LWE query (PRG seed + b) | Client -> Server | 36 B (Pirouette) / 55--60 B (Pirouette^H) | No | Per query. Expansion factor from 36 B to full query is enormous due to PRG. |
| Response | Server -> Client | ~2 KB | No | Per query. After ModSwitch + RingSwitch compression. Nearly constant across database sizes.&#8201;[^18] |

[^18]: Table 7 (p.11) and Section 5.2 (p.10): "yielding a small and nearly constant response sizes (around 3 KB)." Exact value is ~2 KB at 256 B records.

---

### Correctness Analysis

#### FHE Noise Analysis

Pirouette's correctness relies on bounding the noise variance through a cascade of FHE operations across Phases 0--3. The paper uses the independence heuristic (assuming ciphertexts are independent) and atomic patterns from [12] to track noise variance.&#8201;[^19]

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| Input LWE query | sigma^2 = 3.19^2 | Initial | Error sampled from discrete Gaussian |
| After blind rotation (Phase 0) | sigma^2_br | Additive (n applications of CMUX) | n CMUX gates, each contributing gadget noise sigma^2_bowtie |
| After coefficient extraction | sigma^2_cext <= sigma^2_c + N^2 * sigma^2_autk | Additive | log_2(N) automorphism evaluations |
| After LWEtoRGSW (Phase 0) | sigma^2_C <= N * (L^2/4) * (sigma^2_br + sigma^2_cext + sigma^2_sq) | Multiplicative in N | Theorem A.13 (p.21) |
| After selector construction (Phase 1) | sigma^2_selcon <= v_1 * sigma^2_bowtie | Multiplicative in v_1 | Theorem A.19 (p.24--25): v_1 external products |
| After folding (Phase 2) + rotation (Phase 3) | sigma^2_out | Accumulated CMUX noise | v_2 + v_3 additional CMUX operations |
| Final output (Theorem A.20) | sigma^2_out <= (Q_1^2 / Q_2) * (2^{v_1} p L_p sigma^2_sel-con + 2^{v_2+v_3} sigma^2_switch) + sigma^2_ms1 + sigma^2_rswitch | Combined | Theorem A.20 (p.25) |

- **Correctness condition:** Overall failure probability epsilon <= 2^{-40}.&#8201;[^20]
- **Independence heuristic used?** Yes -- the paper assumes ciphertexts produced by different operations are independent. This is standard in TFHE/FHEW-derived constructions.&#8201;[^21]
- **Dominant noise source:** The LWEtoRGSW conversion in Phase 0, which involves blind rotation (n iterations) and coefficient extraction (log_2(N) automorphisms). This is also the computational bottleneck.&#8201;[^22]

[^19]: Section 4.1 (p.8): "the overall correctness of any algorithm that outputs a (R)LWE ciphertext c will be characterized by the soundness of the approach ... and the failure probability epsilon." Appendix A.1 (p.16): "we rely on the independence heuristic, which assumes that ciphertexts are independent."

[^20]: Section 5.1 (p.9): "in order to provide a failure probability of at most 2^{-40} and a standard security parameter of λ = 128 bits."

[^21]: Appendix A.1 (p.16): "Similar to previous works, we rely on the independence heuristic, which assumes that ciphertexts are independent."

[^22]: Section 5.2 (p.10): "the computation cost of Phase 0 and the multiplicative depth of Phases 1-3 remain constant. Only the computation cost of Phases 1-3 increases proportionally." Figure 3 (p.11): bar charts show LWEtoRGSW dominates Phase 0 time.

---

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (2^25 x 256 B = 8 GB) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(log q) = O(1) w.r.t. N | 36 B (Pirouette) / 60 B (Pirouette^H) | Online |
| Response size | O(N_1 * log Q_1) | ~2 KB | Online |
| Server computation (seq.) | O(N) | 60 s (Pirouette) / 55 s (Pirouette^H) | Online |
| Throughput (seq.) | -- | 137 MB/s (Pirouette) / 148 MB/s (Pirouette^H) | Online |
| Throughput (32-core par.) | -- | 585 MB/s (Pirouette full par.) / 178 MB/s (Pirouette^H par. Phase 0) | Online |

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (2^25 x 256 B = 8 GB) | Phase |
|--------|-----------|-------------------------------|-------|
| Server DB preprocessing | O(N log N) | ~128 GB RAM required | Offline (once per DB) |
| Client offline upload | O(n * l * N * log Q) | 1.2 GB (Pirouette) / 650 MB (Pirouette^H) | Offline (once per client) |
| Server per-client storage | -- | 1.2 GB / 650 MB (evaluation keys) | Persistent |
| Client persistent storage | -- | Secret key only (< 10 KB) | -- |

#### FHE-specific metrics

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|---------|-------|
| Expansion factor (query) | -- | 36 B / (log_2(2^25) bits) = 36/3.125 ~ 11.5 | -- |
| LWE expansion factor | q/t = 2^32 / 2^25 = 128 | 1.28 if using PRG seed (32/25) | -- |
| Multiplicative depth | v_2 + v_3 CMUX levels + Phase 0 blind rotation | v_2 in {7,9,12}, v_3 = 2 | Phases 1--3 |

---

### Performance Benchmarks

**Hardware:** Intel Xeon Gold 6248R CPU, 512 GB RAM, 32 cores. Sequential and 32-core parallel settings.&#8201;[^23]

[^23]: Section 5.1 (p.9): "We run all experiments using an Intel(R) Xeon(R) Gold 6248R CPU with 512 GB of RAM."

#### Table 7 (reproduced): Sequential execution

| Database | Metric | Respire | T-Respire | Pirouette | Pirouette^H |
|----------|--------|---------|-----------|-----------|-------------|
| 2^20 x 256 B (256 MB) | Offline Comm. | 4 MB | 91 MB | 1.2 GB | 650 MB |
| | Query Size | 4.1 KB | 55 B | 36 B | 55 B |
| | Computation | 1.5 s | 217 s | 19 s | 15 s |
| | Response Size | -- | -- | 2 KB | 2 KB |
| | Throughput | 170 MB/s | 1 MB/s | 13 MB/s | 17 MB/s |
| 2^22 x 256 B (1 GB) | Offline Comm. | 4 MB | 91 MB | 1.2 GB | 650 MB |
| | Query Size | 7.7 KB | 208 B | 36 B | 57 B |
| | Computation | 4 s | 296 s | 26 s | 22 s |
| | Throughput | 256 MB/s | 3 MB/s | 39 MB/s | 48 MB/s |
| 2^25 x 256 B (8 GB) | Offline Comm. | 4 MB | 91 MB | 1.2 GB | 650 MB |
| | Query Size | 14.8 KB | 336 B | 36 B | 60 B |
| | Computation | 30 s | 486 s | 60 s | 55 s |
| | Throughput | 273 MB/s | 16 MB/s | 137 MB/s | 148 MB/s |

#### Parallelized execution (32 cores)

| Database | Metric | T-Respire (par. trans) | Pirouette (par. Phase 0) | Pirouette^H (par. Phase 0) | Pirouette (full par.) |
|----------|--------|----------------------|------------------------|--------------------------|---------------------|
| 2^20 x 256 B | Computation | -- | 8 s | 6 s | 7 s |
| | Throughput | 17 MB/s | 32 MB/s | 42 MB/s | 36 MB/s |
| 2^22 x 256 B | Computation | -- | 12 s | 9 s | 9 s |
| | Throughput | 46 MB/s | 85 MB/s | 113 MB/s | 109 MB/s |
| 2^25 x 256 B | Computation | -- | 51 s | 46 s | 14 s |
| | Throughput | 136 MB/s | 150 MB/s | 178 MB/s | 585 MB/s |

[^24]: Table 7 (p.11): Values transcribed from official benchmarks. Note: The parallel execution table contains a transcription error where offline communication values (e.g., 91 MB) appear in the computation rows for T-Respire.

---

### Novel Primitives / Abstractions

#### High-Precision Homomorphic Bit Decomposition

| Field | Detail |
|-------|--------|
| **Name** | High-precision homomorphic bit decomposition (BitDecomp / LPBD) |
| **Type** | Cryptographic primitive (FHE subroutine) |
| **Interface / Operations** | BitDecomp(ct, d, v): takes LWE ciphertext ct = LWE_s^{n,q}(m, q/2^{d*v}) and outputs {LWE_s^{N,Q/2}(m_i, Q/2)}_{i in [0, d*v-1]} where m = sum m_i * 2^i |
| **Purpose** | Decompose a high-precision LWE plaintext (25 bits) into individual encrypted bits, enabling server-side expansion of a compact LWE query into RGSW ciphertexts |
| **Built from** | BasicBitDecomp (Algorithm 1, blind rotation + sample extraction, handles v bits at a time) composed with DigitDecomp (Algorithm 2, d rounds of base-2^v digit extraction) |
| **Standalone complexity** | Approximately 3 * ceil(k/v) BlindRotate operations for k = d*v total bits, where each BlindRotate costs O(n) CMUX gates and O(N log N) NTTs |
| **Key innovation** | Conventional bit decomposition is limited to v = 4 or 5 bits (requiring v BlindRotate operations per decomposition). Pirouette's approach uses multi-value bootstrapping [29] with modulus q = 2N to support v up to 9 with only 3 * ceil(k/v) BlindRotate operations, enabling practical decomposition of 25-bit plaintexts.&#8201;[^25] |

[^25]: Section 3.1 (p.6): "conventional homomorphic bit decomposition requires v expensive BlindRotate operations ... we instantiate the multi-value bootstrapping [29], reducing the number of BlindRotate operations to just one while maintaining minimal noise growth."

#### Negacyclic LUT Evaluation (EvalNegLUT)

| Field | Detail |
|-------|--------|
| **Name** | EvalNegLUT (Algorithm 13) |
| **Type** | Cryptographic primitive (FHE subroutine) |
| **Interface / Operations** | EvalNegLUT(c, evk, f): takes LWE sample c = LWE_s^{n,2N}(m,1), blind-rotation key evk, and negacyclic function f : Z_q -> Z_Q; outputs LWE sample encrypting f(m+e) |
| **Purpose** | Evaluate lookup tables homomorphically during bit decomposition; extracts individual bits from the encrypted plaintext |
| **Built from** | BlindRotate + SampleExtract |
| **Correctness** | Theorem A.11 (p.20): output variance sigma^2_out = sigma^2_br (inherits blind-rotation noise only) |

#### Homomorphic Floor Function (HomFloor)

| Field | Detail |
|-------|--------|
| **Name** | HomFloor (Algorithm 17) |
| **Type** | Cryptographic primitive (FHE subroutine) |
| **Interface / Operations** | HomFloor(c, F, evk, ksk): takes LWE sample c = LWE_s^{n,Q'}(m) where m = m_hat * q + m_hat * alpha, flag F in {top, bottom}; outputs LWE_s^{n,Q'}(m_hat, q) with noise bounded by beta |
| **Purpose** | Rounds a large plaintext to a multiple of a smaller modulus homomorphically; key building block for large-precision digit decomposition (LPDD, Algorithm 18) |
| **Built from** | Two rounds of EvalNegLUT (for MSB extraction and identity evaluation) + KeySwitch + ModSwitch |
| **Correctness** | Theorem A.15 (p.22): noise bounded by beta <= q/4 with overwhelming probability |

---

### v_1-bit Selector Construction

The selector is the mechanism that maps encrypted index bits to a one-hot encrypted selection vector for the first dimension of the hypercube.

Given v_1 RGSW ciphertexts {RGSW(b_j)}_{j in [0, v_1-1]} encrypting individual bits of the first-dimension index, Pirouette constructs 2^{v_1} RLWE' ciphertexts {RLWE'(delta_{i,b})}_{i in [0, 2^{v_1}-1]} where delta_{i,b} = 1 iff i = sum_j b_j * 2^j (i.e., a one-hot indicator).&#8201;[^26]

The construction uses a binary-tree approach (Algorithm 21): starting from RLWE'(1), each branching step takes a parent node RLWE'(n) and a control bit RGSW(b_i) and outputs left child LC(n, b_i) = RLWE'(b_i * n) and right child RC(n, b_i) = n - LC(n, b_i). This requires only (2^v - 1) RGSW-RLWE' multiplications (external products) -- just 1/v of the naive approach.&#8201;[^27]

[^26]: Section 3.2 (p.7) and Algorithm 21 (p.24): "A homomorphic selector selects messages based on encrypted control bits."

[^27]: Section 3.2 (p.7): "The resulting procedure requires only (2^v - 1) RGSW-RLWE' multiplications -- just 1/v of the naive approach."

---

### LWEtoRGSW Conversion

A critical server-side operation that converts LWE ciphertexts (output of bit decomposition) to RGSW ciphertexts needed for CMUX operations. Implemented as Algorithm 15 in the appendix.&#8201;[^28]

The procedure takes an LWE sample c = LWE_s^{n,2N}(b, N), a blind-rotation key (evk), a squaring key (sqk), and automorphism keys (autk), and outputs a full RGSW_G(b) ciphertext.

Steps:
1. Apply blind rotation to obtain an RLWE accumulator encrypting the negacyclic function
2. Extract l = ceil(log_L(Q)) coefficients using the ExtractCoef procedure (Algorithm 14) with automorphism keys
3. Combine via squaring key multiplication to assemble the RGSW matrix

**Noise variance:** sigma^2_C <= N * (||s||_inf^2 / 4) * (sigma^2_br + sigma^2_cext) + sigma^2_sq (Theorem A.13, p.21).&#8201;[^29]

[^28]: Algorithm 15 (p.21): "LWEtoRGSW : LWE x Z x (RLWE')^{log_2(N)} x RGSW^n -> RGSW."

[^29]: Theorem A.13 (p.21): Full noise variance bound for the LWEtoRGSW conversion.

---

### Comparison with Prior Work

| Metric | Pirouette | Pirouette^H | Respire | T-Respire | SimplePIR | Spiral |
|--------|-----------|-------------|---------|-----------|-----------|--------|
| Query size | **36 B** | 55--60 B | 4.1--14.8 KB | 55--336 B | ~10s KB | ~14 KB |
| Response size | 2 KB | 2 KB | -- | -- | ~10s KB | ~100s KB |
| Offline comm. | 1.2 GB | 650 MB | 4 MB | 91 MB | ~10s MB | ~14--18 MB |
| Computation (8 GB, seq.) | 60 s | 55 s | 30 s | 486 s | ~fast | ~fast |
| Throughput (8 GB, seq.) | 137 MB/s | 148 MB/s | 273 MB/s | 16 MB/s | ~high | ~high |
| DB params | 2^25 x 256 B | 2^25 x 256 B | 2^25 x 256 B | 2^25 x 256 B | varies | varies |

**Key takeaway:** Pirouette is the optimal choice when upload bandwidth is the binding constraint (e.g., satellite-to-ground, bandwidth-constrained mobile devices) and offline setup cost (1.2 GB one-time) is acceptable. For scenarios requiring minimal offline communication, Respire or SimplePIR remain preferable. For maximum throughput, SimplePIR and Spiral dominate.&#8201;[^30]

[^30]: Section 5.4 (p.13): "Pirouette and Pirouette^H would be most applicable in scenarios where: (1) online bandwidth, particularly from client to server, is severely constrained; (2) offline bandwidth is widely available ... (3) the server computation can leverage multi-core parallelisation."

---

### Portable Optimizations

- **High-precision LWE bit decomposition via blind rotation:** The technique of using TFHE/FHEW blind rotation to homomorphically decompose a high-precision LWE plaintext into individual bits is not specific to PIR. It can benefit any FHE application requiring server-side expansion of compact ciphertexts (e.g., private database lookups, oblivious RAM, secure function evaluation).&#8201;[^31]
- **Binary-tree selector construction:** The O(2^v - 1) RGSW-RLWE' multiplication tree for v-bit selectors (Algorithm 21) is 1/v more efficient than the naive product approach and is applicable to any scheme using CMUX-based selection.
- **PRG seed compression of LWE queries:** Sending only the b component of an LWE ciphertext plus a PRG seed for the a components achieves expansion from 36 B to n * log(q) bits. Standard technique but critical here.

[^31]: Section 6 (p.13): "our novel approach to reduce the client-to-server communication, which provides a lower server-side computational overhead than transciphering and is applicable for many other FHE-based applications."

---

### Implementation Notes

- **Language / Library:** C++ with OpenFHE library; manually optimized routines for time-critical sections.&#8201;[^32]
- **Polynomial arithmetic:** NTT-based. CRT decomposition with Q = product of two primes for fast 32-bit modular arithmetic.
- **PRG:** CTR-DRBG with AES-128 (NIST SP 800-90A) for query PRG compression (seed size 32 B, output up to 2^67 bits). AES-CTR used for transciphering benchmarks (T-Respire comparison).&#8201;[^33]
- **SIMD / vectorization:** Not explicitly mentioned; OpenFHE provides platform-specific optimizations.
- **Parallelism:** Evaluated both sequential and 32-core parallel. Phase 0 (LWEtoRGSW conversions, gadget decompositions, NTTs) and Phases 1--3 (partial sums, folding) are highly parallelizable. Full parallelization achieves 2.7x--4.3x speedup.&#8201;[^34]
- **Security estimation:** Albrecht et al.'s lattice estimator, commit 787c05a. Lambda = 128 bits. Binary secret key (coefficients from {0, 1}).&#8201;[^35]
- **Open source:** https://github.com/KULeuven-COSIC/Pirouette

[^32]: Section 5.1 (p.9): "We implement our approach by relying on the OpenFHE library and manually optimized routines in time-critical sections."

[^33]: Section 5.1 (p.9): "we instantiate the PRG query compression using CTR-DRBG with AES-128 as described in [85] using a seed size of 32 B."

[^34]: Section 5.2 (p.10): "parallelisation improves the overall Pirouette runtime by 2.7x-4.3x" and Figure 3 (p.11).

[^35]: Section 5.1 (p.9): "The security of our parameters was estimated through Albrecht et al.'s lattice estimator [3] commit 787c05a."

---

### Deployment Considerations

- **Database updates:** Server must re-preprocess modified records (re-NTT the affected polynomial). Appending data can exploit recursive NTT/FFT structure without full re-computation.&#8201;[^36]
- **Offline cost amortization:** The 1.2 GB evaluation key upload is a one-time cost per client, reusable across all queries to any database. However, the paper notes that "effective amortization is impractical due to the prohibitively large number of queries required to offset the offline expense" for small numbers of queries.&#8201;[^37]
- **Key rotation / query limits:** Not discussed. Keys are reusable indefinitely under circular security assumption.
- **Anonymous query support:** No -- the evaluation keys are client-specific and secret-key-dependent. Server can link queries from the same client.
- **Session model:** Persistent client (must upload evaluation keys before querying).
- **Cold start suitability:** No -- requires 1.2 GB / 650 MB offline upload before first query.
- **Encrypted database support:** Remark 1 (p.8) notes that Pirouette can be extended to encrypted databases (RLWE encryptions of polynomials), relevant for blind array access and sensitive data analysis.&#8201;[^38]

[^36]: Section 5.2 (p.10): "it is possible to avoid performing a full NTT for each new record by exploiting the recursive structure of NTT and FFT algorithms."

[^37]: Section 5.4 (p.13): "this offline cost in Pirouette and Pirouette^H is a one-time expense that does not grow with the number of queries or database updates, effective amortization is impractical due to the prohibitively large number of queries required."

[^38]: Remark 1 (p.8): "Pirouette can be extended to support private queries over encrypted databases, which could be relevant to achieve the blind array access in [8] and to analyse sensitive data [15,16,18,63,97]."

---

### Key Tradeoffs & Limitations

- **Query size vs offline communication:** Pirouette achieves the smallest known query size (36 B) but at the cost of the largest offline communication among compared schemes (1.2 GB vs 4 MB for Respire, 91 MB for T-Respire).&#8201;[^39]
- **Computation overhead:** Single-core computation is 2x slower than Respire (60 s vs 30 s for 8 GB) due to the expensive blind-rotation-based bit decomposition in Phase 0. However, Phase 0 is highly parallelizable.&#8201;[^40]
- **Asymmetric communication:** The 2 KB response dominates total online communication (36 B up + 2 KB down). The paper does not address server-to-client response compression, noting this as future work.&#8201;[^41]
- **Record size independence:** Query size is independent of record size (only depends on log N), making Pirouette particularly attractive as database size grows. This is a structural advantage over RLWE-query schemes whose query size grows with packing parameters.
- **Circular security / KDM assumption:** Required for the evaluation keys (blind-rotation keys are RGSW encryptions of secret key components). Standard in TFHE/FHEW literature but stronger than plain IND-CPA.&#8201;[^42]

[^39]: Table 7 (p.11): Quantitative comparison of offline communication across all schemes.

[^40]: Table 7 (p.11): Pirouette 60 s vs Respire 30 s for sequential execution at 2^25 x 256 B.

[^41]: Section 5.3 (p.13): "Pirouette shares the same theoretical objective as transciphering to reduce client-to-server communication, and does not consider the server-to-client direction."

[^42]: Definition A.21 (p.25): KDM security definition. Theorem A.22 (p.25): "Under the standard circular security assumption ... the evaluation keys evk do not leak information about the secret key."

---

### Application Scenarios

- **Satellite-to-ground PIR:** Query size is critical for uplink-constrained satellite communication channels (mentioned in abstract and introduction).&#8201;[^43]
- **Bandwidth-constrained mobile devices:** Asymmetric networks where upload is expensive but download/offline capacity is available (e.g., wired device initialization followed by wireless queries).
- **Private contact discovery, safe browsing, genome imputation:** General PIR applications cited in the introduction where small query sizes reduce client costs.

[^43]: Abstract (p.1): "Minimizing query size is particularly important ... when clients operate on bandwidth-constrained devices ... such as in satellite-to-ground communication."

---

### Open Problems

- **NTRU-based blind rotation:** Incorporating NTRU-based blind rotation methods [21, 64] into Pirouette could substantially reduce computation time, as NTRU replaces RGSW samples with half-sized ciphertexts and reduces NTT bottleneck proportionally.&#8201;[^44]
- **Server-to-client response reduction:** The 2 KB response dominates online communication; further compression is noted as future work.
- **Reducing offline communication:** Key material reuse (e.g., sharing blind-rotation keys across subroutines) could reduce the 1.2 GB offline cost, though the paper notes this would degrade performance due to parameter mismatches across steps.&#8201;[^45]

[^44]: Section 6 (p.13): "several works [21,64] introduced blind-rotation approaches that rely internally on the NTRU scheme ... the modified blind-rotation reduces the primary bottleneck of this step, by the same amount."

[^45]: Section 5.2 (p.10): "some key material may be reused ... However, this would substantially degrade performance, as the parameters for each subroutine dictate the output variance and efficiency."

---

### Related Papers in Collection

- **Respire [Group B]:** Direct predecessor. Pirouette uses Respire's hypercube structure, record selection via RLWE' selectors, and response compression via ModSwitch + RingSwitch. Pirouette replaces Respire's RLWE query with a single high-precision LWE ciphertext.
- **Spiral [Group A]:** Shares the Regev+GSW composition paradigm and ciphertext translation ideas. Pirouette's selector construction is conceptually similar to Spiral's GSW-based dimension folding. Compared in Figure 4.
- **SimplePIR [Group C]:** Compared in Figure 4. SimplePIR achieves much higher throughput (memory-bandwidth-bound) with larger queries and database-dependent hints.
- **TFHE/FHEW [building-block, not in collection]:** Source of the blind rotation, bootstrapping, and negacyclic LUT evaluation primitives that enable Pirouette's bit decomposition.

---

### Uncertainties

- **Response size "2 KB":** Table 7 does not list exact response sizes per configuration. The text states "around 3 KB" (Section 5.2, p.10) and "nearly constant response sizes" (same section), but the Communication Breakdown on p.10 says "2 KB." Used 2 KB as the primary figure.
- **Parameter table naming:** Table 3 parameters are for "bit decomposition" (Phase 0 internal), Table 4 for "scheme-switching" (Phases 1--3). The two tables use different LWE dimensions (n_in = 1300 vs n = 512) and moduli, which could be confused.
- **RGSW gadget approximation:** Table 4 notes l_rgsw != ceil(log_{B_rgsw}(Q)) + 1, stating "we rely on an approximate gadget [33, 94] to improve performance." The exact approximation quality is not quantified.
- **Pirouette^H query size variation:** Listed as 55 B, 57 B, or 60 B across different database sizes in Table 7. This is because the number of index bits (ceil(log_2 N)) varies with N.
