## SealPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [PIR with compressed queries and amortized query processing](https://eprint.iacr.org/2017/1142) (2018) |
| **Archetype** | Construction + Building-block (oblivious expansion is a reusable primitive) |
| **PIR Category** | Group A — FHE/HE-based |
| **Security model** | Semi-honest single-server CPIR |
| **Additional assumptions** | None beyond RLWE (no circular security, no ROM) |
| **Correctness model** | Deterministic (FHE noise budget managed by parameter selection) |
| **Rounds (online)** | 1 (non-interactive) |
| **Record-size regime** | Small (288 bytes in benchmarks) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | XPIR (Aguilar-Melchor et al., 2016, Group A); Stern's d-dimensional hypercube technique (Stern, 2005) |
| **What changed** | XPIR requires O(N) ciphertexts in the query (one per DB element). SealPIR replaces this with a single compressed ciphertext per dimension that the server obliviously expands via a new Expand algorithm, reducing query size by up to 274x. Also switches from BV (used by XPIR) to the Fan-Vercauteren (FV/BFV) cryptosystem using SEAL. |
| **Superseded by** | MulPIR (2019, higher communication rate via GSW); OnionPIR (2021, external products for better noise control and single-ciphertext response) |
| **Concurrent work** | N/A |

### Core Idea

SealPIR's central contribution is *oblivious query expansion* (Expand): a server-side procedure that takes a single BFV ciphertext encoding the client's desired index as a monomial x^i and produces N ciphertexts where the i-th encrypts 1 and all others encrypt 0 — without learning i.[^1] This eliminates the O(N) query cost of XPIR, compressing queries from d * N^{1/d} ciphertexts down to d * ceil(N^{1/d}/N_ring) ciphertexts, where N_ring is the ring dimension.[^2] The expansion uses only substitution operations (automorphisms) and additions — no homomorphic multiplications — keeping noise growth additive and enabling smaller parameters.[^3] A secondary contribution is *probabilistic batch codes* (PBCs) for amortized multi-query PIR.

[^1]: Section 3.3, Figure 3. The server never sees the plaintext index; it only applies algebraic operations (substitution + addition) on ciphertexts.
[^2]: Section 3.4–3.5. Query communication goes from O(N * d * N^{1/d}) in XPIR to O(N * d * ceil(sqrt_d(n)/N)) in SealPIR, where N_ring = 2048 or 4096.
[^3]: Figure 2 (p. 4). Substitution has additive noise growth (cost 0.279 ms), compared to ciphertext multiplication's multiplicative noise growth (cost 1.514 ms).

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Expand (oblivious query expansion) |
| **Type** | Cryptographic primitive / server-side algorithm |
| **Interface / Operations** | Expand(query = Enc(x^i)) -> [o_0, ..., o_{n-1}] where o_i = Enc(1), o_j = Enc(0) for j != i |
| **Security definition** | Implicit from BFV semantic security — server sees only ciphertexts; substitution keys are public.[^4] |
| **Correctness definition** | Proved in Appendix A.2; noise bound in Appendix A.3. |
| **Purpose** | Compress PIR queries from O(N) to O(1) ciphertexts per dimension, shifting network cost to server computation. |
| **Built from** | BFV substitution operation Sub(c, k), which maps Enc(p(x)) to Enc(p(x^k)); derived from Gentry et al.'s Galois group actions.[^5] |
| **Standalone complexity** | O(n) substitutions + O(n) additions for n-element expansion. Each substitution costs 0.279 ms (Figure 2). Total: O(n) time with additive noise growth. |
| **Relationship to prior primitives** | Generalizes the "slot permutation" technique from Gentry et al. [44, Section 4.2]. Called "automorphisms" in later literature (Spiral, OnionPIR). Foundation for the entire selection-vector branch of FHE-based PIR. |

[^4]: The substitution keys (analogous to Galois keys / automorphism keys) must be sent from client to server. This is 2.9 MB of auxiliary material, reusable across all queries (Section 6, p. 10).
[^5]: Appendix A.1. SealPIR implements the Galois group actions algorithm from Gentry et al. in SEAL, requiring only a subset of the arbitrary permutations Gentry et al. describe.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (Ring Learning With Errors) |
| **Encryption/encoding scheme** | Fan-Vercauteren (FV/BFV) via the SEAL library [4] (version 2.3.0-4) |
| **Ring / Field** | R_t = Z_t[x]/(x^N + 1) for plaintexts; R_q = Z_q[x]/(x^N + 1) for ciphertexts; N = 2048, q = 2^60 - 2^18 + 1 (60-bit coefficient modulus)[^6] |
| **Key structure** | Standard BFV secret key (polynomial in R_q); additional substitution keys (Galois keys) for Expand — 2.9 MB per client, reusable across queries |
| **Correctness condition** | Noise must remain below q/(2t) after all homomorphic operations. Managed by choosing N, q, t to support the depth of Expand + Answer.[^7] |

[^6]: Section 7, "Parameters" paragraph (p. 10). N = 2048, coefficients 60 bits, SEAL uses q = 2^60 - 2^18 + 1. XPIR uses q = 2^61 - i * 2^14 + 1 for various i.
[^7]: Section 3.3, p. 4; noise growth analysis in Appendix A.3.

### Key Operations in BFV (Figure 2)

| Operation | CPU Cost (ms) | Noise Growth | Notes |
|-----------|--------------|--------------|-------|
| Addition | 0.002 | Additive | Ciphertext + ciphertext |
| Plaintext multiplication | 0.141 | Multiplicative* | *Factor is always 1 in Expand (no noise growth) because the plaintext is a monomial with coefficient in {0, 1}[^8] |
| Ciphertext multiplication | 1.514 | Multiplicative | Not used in Expand; used only in Answer phase |
| Substitution (automorphism) | 0.279 | Additive | Core operation of Expand. Sub(c, k): Enc(p(x)) -> Enc(p(x^k)) |

[^8]: Figure 2 footnote: "While plaintext multiplication yields a multiplicative increase in the noise, the factor is always 1 (i.e., no noise growth) because it is based on the number of non-zero coefficients in the plaintext [28, Section 6.2]."

### Expansion Factor

The expansion factor F = 2 * log(q) / log(t) determines the ratio between ciphertext size and the largest plaintext that can be encrypted.[^9] For the recommended security parameters (F >= 6.4), this is a fundamental constraint on how much data can be packed per ciphertext.

- With N = 2048, q = 60-bit, t = 2^23: F approximately 2 * 60 / 23 approximately 5.2
- The Expand optimization (Section 6) changes the effective plaintext modulus from t = 2^y to t' = 2^{y-l} where l = ceil(log_2(m)), reducing packing efficiency but eliminating the inverse-multiplication step in Expand.[^10]

[^9]: Section 3.1, p. 4. F = 2 * log(q) / log(t).
[^10]: Section 6, Equation 1 (p. 10). The optimization avoids n plaintext multiplications and one inversion, reducing noise, but requires the server to use t' < t for database representation.

### Database Encoding

- **Representation:** d-dimensional hypercube of side length N^{1/d}. For d = 2, database is sqrt(N) x sqrt(N) matrix M where each cell is one DB element.[^11]
- **Record addressing:** Multi-dimensional index, one per hypercube dimension. For d = 2: (row, column) addressing.
- **Preprocessing required:** Elements encoded as FV plaintext polynomials. Each element e in DB is encoded by storing log(t) bits of e per coefficient of the polynomial p(x). For small elements, multiple elements can be packed into a single FV plaintext.[^12]
- **Record size equation:** alpha = floor(N * log(t') / beta) elements per FV plaintext, where beta is element size in bits. For 288-byte elements with the Expand optimization: alpha approximately 14 (comparable to XPIR's alpha = 14 at these parameters).[^13]

[^11]: Section 3.4, p. 5. Generalizes to d dimensions.
[^12]: Section 6, "Encoding elements as FV plaintexts" (p. 10).
[^13]: Section 6, p. 10, and Section 7 parameters discussion.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| KeyGen | Client | Generate BFV key pair (pk, sk) + substitution keys | Substitution keys: 2.9 MB to server | Once per client |
| Setup | Server | Represent DB in amenable format (encode as FV plaintexts, structure as d-dimensional hypercube) | -- | Once / on DB change |
| Query | Client | Encode index i as monomial x^i, encrypt: query = Enc(x^i). Send d ciphertexts (one per dimension).[^14] | d * ceil(N^{1/d}/N) ciphertexts upward | Per query |
| Expand | Server | Obliviously expand each of d compressed ciphertexts into N^{1/d}-element selection vectors | -- (internal) | Per query |
| Answer | Server | For each dimension: matrix-vector product between DB and expanded selection vector (plaintext-ciphertext multiplications + homomorphic additions) | -- (internal) | Per query |
| Response | Server | Send F^{d-1} ciphertexts to client | F^{d-1} ciphertexts downward | Per query |
| Extract | Client | Decrypt response, combine chunks | -- | Per query |

[^14]: Section 3.4–3.5, p. 5. For databases larger than N (ring dimension), client sends ceil(N^{1/d}/N) ciphertexts per dimension, which are expanded and concatenated.

### The Expand Algorithm (Figure 3)

#### High-level description

Expand takes a single ciphertext query = Enc(x^i) and outputs n ciphertexts [o_0, ..., o_{n-1}] where o_i = Enc(1) and o_j = Enc(0) for all j != i. It works by iteratively doubling the number of ciphertexts through l = ceil(log_2(n)) rounds.[^15]

#### Algorithm (Figure 3, p. 5)

```
function Expand(query = Enc(x^i)):
  find smallest m = 2^l such that m >= n
  ciphertexts <- [query]

  // Phase 1: Doubling via substitution (l iterations)
  for j = 0 to l-1 do
    for k = 0 to 2^j - 1 do
      c_0 <- ciphertexts[k]
      c_1 <- c_0 * x^{-2^j}              // plaintext multiplication (shift)
      c_0' <- c_0 + Sub(c_0, N/2^j + 1)  // substitution maps p(x)->p(-x) when k=N/2^j+1
      c_{k+2^j}' <- c_1 + Sub(c_1, N/2^j + 1)
    ciphertexts <- [c_0', ..., c_{2^{j+1}-1}']

  // Phase 2: Normalization (multiply by inverse of m mod t)
  inverse <- m^{-1} (mod t)
  for j = 0 to n-1 do
    o_j <- ciphertexts[j] * inverse

  return [o_0, ..., o_{n-1}]
```

#### Worked example for n = 2 (Section 3.3, p. 4)

Given query = Enc(x^i) with i in {0, 1}:

1. c_0 = query, c_1 = query * x^{-1}
2. Sub(c, N+1) maps p(x) to p(-x) since x^{N+1} = -x (mod x^N + 1)[^16]
3. c_0' = c_0 + Sub(c_0, N+1): if i=0 then Enc(1) + Enc(1) = Enc(2); if i=1 then Enc(x) + Enc(-x) = Enc(0)
4. c_1' = c_1 + Sub(c_1, N+1): if i=0 then Enc(x^{-1}) + Enc(-x^{-1}) = Enc(0); if i=1 then Enc(1) + Enc(1) = Enc(2)
5. Multiply by inverse of 2: o_0 = Enc(1) if i=0, else Enc(0); o_1 = Enc(1) if i=1, else Enc(0)

#### Noise analysis

Each iteration of the outer loop involves one substitution (additive noise growth) and one addition. Over l = log_2(n) iterations, total noise growth is O(l) additive terms.[^17] This is crucial: unlike approaches that use homomorphic multiplications (which would give multiplicative/exponential noise growth), Expand's exclusive use of substitution + addition keeps noise manageable with moderate parameters.

[^15]: Figure 3, p. 5. Each outer loop iteration doubles the ciphertext count.
[^16]: Footnote 2, p. 4: x^{N+1} = -x (mod x^N + 1).
[^17]: Appendix A.3 bounds the noise growth of Expand. Substitution has additive noise growth (Figure 2).

#### Expand optimization (Section 6, p. 10)

In FV, Enc(2^l) (for y >= l) is equivalent to Enc(1) with plaintext modulus t' = 2^{y-l}.[^18] Instead of multiplying all n ciphertexts by the inverse of m = 2^l (Phase 2 above), SealPIR simply changes the plaintext modulus from t to t' = t / 2^l. This:
- Avoids n plaintext multiplications and one modular inversion
- Reduces noise growth
- **Tradeoff:** The server must represent the database with the smaller plaintext modulus t', packing fewer database elements per FV plaintext

The effective t' is computed via Equation 1 (p. 10):

```
log(t') + ceil(log(ceil(d-root(n_fv)))) <= log(t)
where n_fv = ceil(n / alpha), alpha = floor(N * log(t') / beta)
```

[^18]: Section 6, "Optimization to Expand" (p. 10).

### Reducing Expansion Cost: d-Dimensional Hypercube (Section 3.4)

#### The cost problem

Expand is O(n) in substitutions. For a database with N elements, running Expand once costs O(N), nearly as expensive as the Answer phase itself.[^19]

#### Stern's solution adapted

Structure the database as a d-dimensional hypercube of side N^{1/d}. The client encodes d indices (one per dimension) and sends d ciphertexts. The server runs Expand d times, each on a N^{1/d}-element vector, costing O(d * N^{1/d}) total.[^20]

#### Communication tradeoffs with d

| d | Query ciphertexts | Response ciphertexts | Expand cost | Best for |
|---|-------------------|---------------------|-------------|----------|
| 1 | 1 | 1 | O(N) — prohibitive | N/A (too expensive) |
| 2 | 2 * ceil(N^{1/2}/N_ring) | F | O(2 * sqrt(N)) | Most practical use cases[^21] |
| 3 | 3 * ceil(N^{1/3}/N_ring) | F^2 | O(3 * N^{1/3}) | Small query priority; but response grows as F^2 |
| d > 3 | d * ceil(N^{1/d}/N_ring) | F^{d-1} | O(d * N^{1/d}) | Response size dominates; impractical[^22] |

The query communication complexity goes from O(N * d * N^{1/d}) in XPIR to O(N * d * ceil(N^{1/d}/N_ring)) in SealPIR.[^23]

[^19]: Section 3.4, p. 5. "One issue with Expand is that despite each operation being inexpensive, O(n) operations are needed to extract the n-entry query vector."
[^20]: Section 3.4, p. 5. Each Expand call costs O(N^{1/d}) rather than O(N).
[^21]: Figure 9 and Section 7.1 benchmarks. d = 2 gives the best overall balance for databases up to 2^20 entries.
[^22]: Section 3.4, p. 5: "values of d > 3 in XPIR lead to responses that are so large that they outweigh any reduction in query size."
[^23]: Section 3.5, p. 5: "the query communication complexity goes from O(Nd * d-root(n)) in XPIR to O(Nd * ceil(d-root(n)/N)) in SealPIR."

### Handling Larger Databases (Section 3.5)

When the database has more than N (ring dimension) elements, a single ciphertext cannot encode all N^{1/d} indices for a dimension. Two solutions:[^24]

1. **Multiple ciphertexts per dimension:** Client sends ceil(N^{1/d}/N) ciphertexts per dimension; server expands each to N elements and concatenates.
2. **Higher d combined with multiple ciphertexts:** For 2^30 entries with d = 2, the database is a 2^15 x 2^15 matrix. With N = 4096, each dimension needs ceil(2^15 / 4096) = 8 ciphertexts. Total query: 16 ciphertexts.

[^24]: Section 3.5, p. 5. Examples computed for 2^30-entry database.

### Correctness Analysis

#### Option A2: Library-based noise management

- **Library / version:** SEAL 2.3.0-4 (Microsoft)
- **Parameter constraints:** N = 2048 sufficient for the multiplicative depth of SealPIR (Expand uses only substitutions with additive noise; Answer uses plaintext-ciphertext multiplications with bounded noise growth; the overall depth is low)
- **Noise growth type per operation:** Substitution: additive. Plaintext multiplication: multiplicative (but factor = 1 for monomials in Expand). Homomorphic addition: additive.
- **Depth constraint:** Effectively depth-1 for the Answer phase (one round of plaintext-ciphertext multiply + summation). Expand adds only additive noise.[^25]
- **The Expand optimization** further reduces noise by eliminating the Phase 2 normalization multiplications.

[^25]: Figure 2 and Appendix A.3. The Answer phase (Figure 1, lines 10-12) performs plaintext-ciphertext multiplication followed by addition — both low-noise operations.

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (N=2^20, d=2, 288B elements) | Phase |
|--------|-----------|---------------------------------------|-------|
| Query size | O(d * ceil(N^{1/d} / N_ring) * \|ct\|) | 64 KB | Online |
| Response size | O(F^{d-1} * \|ct\|) | 256 KB | Online |
| Server computation (Expand) | O(d * N^{1/d}) substitutions | 0.11 s[^26] | Online |
| Server computation (Answer) | O(N) plaintext-ct multiplications | 0.5 s[^26] | Online |
| Server computation (total) | O(N + d*N^{1/d}) | 1.65 s (Setup + Expand + Answer)[^26] | Online |
| Client computation (Query) | O(d) encryptions | 3.37 ms[^26] | Online |
| Client computation (Extract) | O(F^{d-1}) decryptions | 1.39 ms[^26] | Online |
| Response overhead | F^{d-1} | F = approximately 5-12 depending on t'; for d=2, 1 ciphertext response | -- |

[^26]: Figure 9 (p. 11), column "SealPIR (d=2)", row n = 262,144 (closest to 2^18; 2^20 = 1,048,576 column): Query 3.37 ms, Extract 1.69 ms, Setup 4.26 s, Expand 0.11 s, Answer 2.01 s. For n = 1,048,576: total server time = 4.26 + 0.11 + 2.01 = 6.38 s.

#### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Expansion factor (F) | 2*log(q)/log(t) | 5.2 (t=2^23), up to 12 (t'=2^10) | -- |
| Substitution key material | O(log N) keys | 2.9 MB per client (reusable) | Setup (once) |
| Multiplicative depth | 0 (Expand) + 1 (Answer) | 1 | -- |

### Performance Benchmarks

#### Microbenchmarks (Figure 9, p. 11)

Hardware: Microsoft Azure H16 instances (16-core 3.6 GHz Intel Xeon E5-2667, 112 GB RAM) for servers; F16s (16-core 2.4 GHz Intel Xeon E5-2673, 32 GB RAM) for clients. Ubuntu 16.04. Single-threaded measurements. 288-byte elements. 10 trials, <10% standard deviation.

**SealPIR (d=2):**

| Database size (n) | 65,536 | 262,144 | 1,048,576 |
|-------------------|--------|---------|-----------|
| **Client CPU (ms)** | | | |
| Query | 3.37 | 3.37 | 3.37 |
| Extract | 1.37 | 1.39 | 1.69 |
| **Server CPU (sec)** | | | |
| Setup | 0.23 | 1.04 | 4.26 |
| Expand | 0.05 | 0.11 | 0.11 |
| Answer | 0.13 | 0.5 | 2.01 |
| **Network (KB)** | | | |
| Query | 64 | 64 | 64 |
| Answer | 256 | 256 | 256 |

**XPIR (d=2) for comparison:**

| Database size (n) | 65,536 | 262,144 | 1,048,576 |
|-------------------|--------|---------|-----------|
| **Client CPU (ms)** | | | |
| Query | 13.83 | 27.57 | 55.14 |
| Extract | 0.34 | 0.29 | 0.30 |
| **Server CPU (sec)** | | | |
| Setup | 0.15 | 0.57 | 2.27 |
| Answer | 0.21 | 0.63 | 2.12 |
| **Network (KB)** | | | |
| Query | 4,384 | 8,768 | 17,536 |
| Answer | 256 | 256 | 256 |

#### Key observations from benchmarks

1. **Query compression:** SealPIR achieves 274x smaller queries than XPIR (d=2) for 2^20 elements (64 KB vs 17,536 KB).[^27]
2. **Client cost reduction:** Query generation is 16.4x less expensive for the client (3.37 ms vs 55.14 ms).[^27]
3. **Server overhead from Expand:** SealPIR introduces 11% to 24% CPU overhead to the server for oblivious expansion (e.g., at n=1,048,576: Expand=0.11s vs Answer=2.01s, overhead = 5%).[^28]
4. **Query size is constant** for d=2 at all database sizes tested (64 KB), because all indices fit in ceil(sqrt(n)/N) = 1 ciphertext per dimension up to n = 2^20 with N = 2048.
5. **Answer size is constant** at 256 KB (= F ciphertexts for d=2).

[^27]: Section 1, p. 1: "SealPIR results in queries that are 274x smaller and are 16.4x less expensive for the client to construct."
[^28]: Section 1, p. 1: "SealPIR introduces between 11% and 24% CPU overhead to the server."

#### Response time experiments (Figure 10, p. 12)

Deployment scenarios tested with 288-byte elements:

| Scenario | Bandwidth | SealPIR vs XPIR (d=2) at 2^20 elements |
|----------|-----------|---------------------------------------|
| intra-DC | 3.4 Gbps | SealPIR competitive; scp (trivial download) fastest |
| inter-DC | 800 Mbps | SealPIR comparable to XPIR |
| home | 20 Mbps | SealPIR achieves up to 42% lower response time[^29] |
| mobile | 10 Mbps | SealPIR significantly better than XPIR; lowest response time among PIR schemes |

[^29]: Section 7.2.1, p. 11: "SealPIR's lower network consumption and competitive CPU costs yield up to a 42% reduction in response time."

#### Throughput (Figure 11, p. 12)

Database: 2^20 elements, 288-byte entries. Measured with concurrent clients from South India and EU West data centers:

- SealPIR (d=2): saturates at approximately 7 requests/second (approximately 23% lower throughput than XPIR d=2, which saturates at approximately 9 req/s)[^30]
- XPIR (d=3): lower throughput than SealPIR
- SealPIR achieves 50% higher throughput than XPIR (d=3)
- Both SealPIR and XPIR achieve over 20x higher throughput than naive PIR (scp), since network bandwidth is the bottleneck for scp

[^30]: Section 7.2.2, p. 12: "SealPIR achieves a 50% higher throughput than XPIR with d = 3, but a 23% lower throughput than XPIR with d = 2."

### Multi-Query PIR with Probabilistic Batch Codes (Sections 4-5)

#### Probabilistic Batch Codes (PBCs)

A secondary contribution: PBCs relax traditional batch codes by allowing a small probability of failure (approximately 2^{-40}). This enables much more efficient multi-query PIR.[^31]

- **Construction:** Based on reverse hashing using 3-way Cuckoo hashing (w=3 hash functions, b=1.5k buckets for k queries)
- **Failure probability:** p approximately 2^{-40} for k > 200 (closer to 2^{-20} for smaller k)[^32]
- **Codewords:** m = 3n (each element replicated in w = 3 candidate buckets)
- **Compared to Pung's multi-retrieval:** mPIR (SealPIR + PBC) produces fewer total codewords (3n vs Pung's higher m), yielding 2.6x CPU reduction and 6x network reduction

#### mPIR benchmarks (Figure 12, p. 13)

Database: 2^20 elements, 288 bytes, using SealPIR with t = 2^20.

| Metric | Single-query | mPIR (Cuckoo, k=256) |
|--------|-------------|---------------------|
| Client MultiQuery (ms) | 3.07 | 4.92 |
| Client MultiExtract (ms) | 2.51 | 2.70 |
| Server MultiSetup (sec) | 6.1 | 0.12 |
| Server MultiAnswer (sec) | 3.24 | 0.08 |
| Query (KB) | 64 | 96 |
| Answer (KB) | 384 | 384 |

Per-request amortized server CPU cost with mPIR at k=256 is 40.5x lower than running k parallel single-query PIR instances.[^33]

[^31]: Section 4.2, p. 6. PBC differs from traditional batch codes in that it fails to be complete with probability p.
[^32]: Section 4.5, p. 8: "the failure probability is estimated to be p approximately 2^{-40} for k > 200."
[^33]: Section 7.3, p. 12.

### Case Study: Pung Integration (Section 7.4)

SealPIR + mPIR integrated into the Pung private communication system:

| Config | Throughput (k=64) | Network cost per user (k=16) |
|--------|-------------------|------------------------------|
| Pung (original) | baseline | 279 MB per round |
| Pung+S (SealPIR) | comparable | reduced |
| Pung+M (mPIR) | higher | reduced |
| Pung+MS (both) | 3.1x higher[^34] | 7.7 MB per round (36x reduction)[^35] |

[^34]: Section 7.4, p. 13: "the throughput of Pung+MS is 3.1x higher than that of Pung."
[^35]: Section 7.4, p. 13: "per-client communication costs are cut down to 7.7 MB per round (versus 279 MB in the original Pung implementation)."

### Comparison with Prior Work

| Metric | SealPIR (d=2) | XPIR (d=2) | XPIR (d=3) |
|--------|--------------|------------|------------|
| Query size (n=2^20) | 64 KB | 17,536 KB | 2,560 KB |
| Response size | 256 KB | 256 KB | 1,952 KB |
| Server CPU (n=2^20) | 6.38 s | 4.39 s | 3.68 s |
| Client Query CPU | 3.37 ms | 55.14 ms | 8.03 ms |
| Query compression factor | **274x** over XPIR d=2 | 1x | 6.8x over XPIR d=2 |
| Throughput | 7 req/s (approximate) | 9 req/s (approximate) | lower |
| DB params | 2^20 x 288B | 2^20 x 288B | 2^20 x 288B |

**Key takeaway:** SealPIR trades a modest increase in server CPU (11-24% from Expand) for a dramatic reduction in query size (274x). This makes PIR practical on bandwidth-limited networks (home, mobile). For throughput-sensitive deployments with ample bandwidth, XPIR (d=2) may still be preferable.

### Portable Optimizations

1. **Oblivious expansion (Expand):** The core technique of using substitution/automorphism operations to expand a single ciphertext into a selection vector. Adopted by OnionPIR, Spiral, YPIR, WhisPIR, NPIR, and essentially all subsequent FHE-based PIR schemes.[^36]
2. **Plaintext modulus reduction trick:** Changing t to t' = t/2^l to avoid the normalization step in Expand. Applicable to any BFV-based scheme using Expand.
3. **Probabilistic batch codes via reverse hashing:** Application-independent multi-query amortization technique. Applicable to any CPIR scheme, not just SealPIR.
4. **d-dimensional hypercube structuring:** Predates SealPIR (from Stern), but SealPIR's combination with compressed queries makes it practical. The d=2 sweet spot is widely adopted.

[^36]: Section 7.5 of SKILL taxonomy: "Oblivious query expansion (Expand) — SealPIR, OnionPIR, OnionPIRv2, Spiral, WhisPIR, NPIR."

### Implementation Notes

- **Language / Library:** C++ (SEAL 2.3.0-4) and Rust (approximately 2,000 lines total)[^37]
- **Polynomial arithmetic:** NTT-based (via SEAL)
- **CRT decomposition:** Not explicitly discussed; SEAL handles internally
- **SIMD / vectorization:** Not explicitly mentioned
- **Parallelism:** Single-threaded benchmarks. Paper notes XPIR's protocol is "embarrassingly parallel" and SealPIR inherits this property for the Answer phase.[^38]
- **Lines of Code:** Approximately 2,000 (C++ and Rust combined)
- **Open source:** Built on SEAL (https://sealcrypto.org) and XPIR (https://github.com/xpir-team/xpir/)
- **mPIR library:** 1,700 lines of Rust, implements 5 PBC constructions using SHA-256 for hash functions

[^37]: Section 6, p. 10: "This is around 2,000 lines of C++ and Rust."
[^38]: Section 1, p. 1: "XPIR's protocol is embarrassingly parallel and one can regain the lost throughput by employing additional servers."

### Deployment Considerations

- **Database updates:** Requires re-running Setup (re-encoding DB as FV plaintexts). Not addressed in detail.
- **Sharding:** Not discussed, but the embarrassingly parallel nature of Answer supports it.
- **Key rotation / query limits:** Substitution keys (2.9 MB) are reusable across all queries from the same client. No explicit query limit.
- **Anonymous query support:** Yes — SealPIR is stateless (no persistent client state on server). Each query is independent.
- **Session model:** Ephemeral client. Substitution keys can be sent once per session.
- **Cold start suitability:** Moderate — requires 2.9 MB substitution key upload, but no per-query offline phase.

### Key Tradeoffs & Limitations

- **Server CPU overhead:** Expand adds 11-24% server computation over XPIR. For CPU-bound deployments, this is non-trivial.[^39]
- **Expansion factor constrains response:** For d >= 2, response size grows as F^{d-1}. With F approximately 5-12, d=3 already yields F^2 = 25-144 ciphertexts in the response. This makes d > 3 impractical.
- **Small element regime:** Benchmarks use 288-byte elements. For larger elements, each element spans multiple FV plaintexts, requiring l parallel Answer computations (one per chunk). Response grows proportionally.
- **Expand optimization tradeoff:** Reducing t to t' packs fewer DB elements per plaintext. For n=2^22, t' shrinks to 2^12, causing SealPIR to use more plaintexts than XPIR. "For even larger databases, since we must use a higher dimension parameter d... the difference becomes less prominent."[^40]
- **No ciphertext multiplication compression:** Unlike later schemes (MulPIR, OnionPIR), SealPIR does not use GSW/RGSW to compress the response. The response is always F^{d-1} BFV ciphertexts.
- **Substitution key size:** 2.9 MB per client is manageable but non-trivial for mobile deployments. Later schemes (OnionPIR) address this.

[^39]: Section 7.1, p. 11.
[^40]: Section 7.2.1, p. 12.

### Open Problems (Section 8, p. 14)

1. **Reduce Expand CPU cost:** "Observe that in Expand and Stern's protocol, when the database dimension (d) is greater than 1, the computation consists of several matrix-vector products. We can therefore implement the optimization described by Beimel et al. [16] where multiple queries (from potentially different users) are aggregated to form a matrix; the server can then use a subcubic matrix multiplication algorithm."[^41]
2. **Improve PBC allocation strategies:** "We could also consider strategies that optimize for the offline setting in which all balls are available at the same time."[^41]

[^41]: Section 8, p. 14.

### Uncertainties

- **Ring dimension notation:** The paper uses N for the ring dimension (polynomial degree bound) and n for the database size. This is the opposite convention from some later papers where n is the ring dimension. Throughout these notes, N = ring dimension (2048 or 4096), n = database element count.
- **Exact expansion factor at benchmark parameters:** The paper states F >= 6.4 as the minimum for security (p. 4) but does not give the exact F for all benchmark configurations. With q = 60-bit and t = 2^23, F = 2*60/23 approximately 5.2, which is below 6.4, suggesting the actual t used may differ. The Expand optimization's t' makes this parameter configuration-dependent.
- **XPIR parameter differences:** XPIR uses different q values (q = 2^61 - i*2^14 + 1) and BV (not BFV), making direct per-operation comparisons imprecise. The aggregate benchmarks are reliable.
- **Errata (November 16, 2020):** The paper has a corrected typo in Figure 4 — the plaintext coefficients after Expand (j=0) had incorrect values in the prior version. The corrected version shows coefficient 2x^2 (not 2x) in the third entry.
