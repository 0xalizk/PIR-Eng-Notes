## CwPIR (Constant-weight PIR) — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Constant-weight PIR: Single-round Keyword PIR via Constant-weight Equality Operators](https://arxiv.org/abs/2202.07569) (2022) |
| **Archetype** | Construction + Building-block (constant-weight equality operators are a standalone primitive; PIR is the application) |
| **PIR Category** | Group A — FHE-based |
| **Security model** | Semi-honest single-server computational PIR |
| **Additional assumptions** | None stated beyond standard FV (BFV) lattice assumptions |
| **Correctness model** | Deterministic (standard BFV decryption correctness, conditioned on noise budget; lossy mapping variant has probabilistic collision bound) |
| **Rounds (online)** | 1 (non-interactive) |
| **Record-size regime** | Large (primary evaluation targets large payloads, 268 KB+ where CwPIR outperforms MulPIR) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SealPIR [Group A] (oblivious expansion, query compression), MulPIR [Group A] (FHE multiplication-based PIR), BFV/FV cryptosystem via Microsoft SEAL 3.6 |
| **What changed** | Replaces the selection-vector communication approach (SealPIR/MulPIR) with an equality-operator computation approach. Instead of the client sending an encrypted selection vector that the server expands, the server computes the selection vector itself using constant-weight equality operators applied to the client's encrypted query against each database identifier. This eliminates the dimension-dependent response blowup and enables native keyword PIR. |
| **Superseded by** | N/A |
| **Concurrent work** | N/A |

### Core Idea

Prior FHE-based PIR protocols (SealPIR, MulPIR) have the server acquire the selection vector by receiving it from the client (encrypted, then expanded). This requires the selection vector to be over index space, making keyword PIR require extra rounds to first resolve a keyword to an index.&#8201;[^1] CwPIR takes a fundamentally different approach: the server *computes* the selection vector itself by evaluating an equality operator between the client's encrypted query and each database identifier. By encoding identifiers as constant-weight codewords (binary strings with fixed Hamming weight k), the equality check circuit has multiplicative depth O(log k) rather than O(log n) for the folklore binary equality operator.&#8201;[^2] This makes the equality-operator approach practical for the first time and naturally enables single-round keyword PIR since the server can compare the encrypted query against arbitrary keyword identifiers without resolving them to indices first.&#8201;[^3]

[^1]: Chor et al. [15] reduce keyword PIR to index PIR using interactive protocols requiring extra rounds of communication. Ali et al. [4] use probabilistic hashing to reduce keyword PIR to index PIR. (Section 2.5, p. 5)
[^2]: The arithmetic folklore equality operator for domain {0,1}^l has multiplicative depth 1 + ceil(log_2 l); the plain folklore operator has depth ceil(log_2 l). The constant-weight equality operator has multiplicative depth ceil(log_2 k), depending only on the Hamming weight k, not the code length m. (Table 3, p. 9; Section 3.1, p. 6)
[^3]: "Constant-weight keyword PIR is the first practical, single-round solution for single-server keyword PIR." (Abstract, p. 1)

### Novel Primitives / Abstractions

#### Primitive 1: Plain Constant-weight Equality Operator

| Field | Detail |
|-------|--------|
| **Name** | Plain constant-weight equality operator (f_PCW) |
| **Type** | Cryptographic circuit / equality operator |
| **Interface / Operations** | f_PCW(x, y) for x, y in CW(m, k): outputs 1 if x = y, 0 otherwise. One operand (y) is public. |
| **Security definition** | N/A (circuit, not a standalone primitive with security game) |
| **Correctness definition** | For x, y in CW(m, k): f_PCW(x, y) = product over {j : y[j]=1} of x[j]. When x = y, all selected bits are 1, so the product is 1. When x != y, at least one selected bit is 0, yielding 0.&#8201;[^4] |
| **Purpose** | Efficiently compute whether two constant-weight codewords are equal, with multiplicative depth depending only on k (the Hamming weight), not the code length m. Used as the core of the PIR selection vector calculation. |
| **Built from** | k plaintext multiplications with a BFV ciphertext, organized as a binary tree of depth ceil(log_2 k). |
| **Standalone complexity** | k multiplications, multiplicative depth ceil(log_2 k). |
| **Relationship to prior primitives** | Specialization of the plain folklore equality operator (Eq. 4) to constant-weight codes. The folklore operator has depth ceil(log_2 l) for l-bit operands; the CW operator achieves depth ceil(log_2 k) where k << l for large domains.&#8201;[^5] |

[^4]: Equation (5), p. 6: f_PCW(x, y) = product over {j : y[j]=1} of x[j].
[^5]: Table 3 (p. 9) comparison: Plain Folklore has l * M operations with depth ceil(log_2 l); Plain CW has k * M operations with depth ceil(log_2 k), where M denotes a single homomorphic multiplication (unit label, not a count variable).

#### Primitive 2: Arithmetic Constant-weight Equality Operator

| Field | Detail |
|-------|--------|
| **Name** | Arithmetic constant-weight equality operator (f_ACW) |
| **Type** | Cryptographic circuit / equality operator |
| **Interface / Operations** | f_ACW(x, y) for x, y in CW(m, k): computes inner product k' = sum of x[i]*y[i], then evaluates (1/k!) * product_{i in [k]} (k' - i). Outputs 1 if x = y, 0 otherwise. Both operands may be encrypted. |
| **Purpose** | Oblivious equality check where both operands are encrypted (e.g., comparing two encrypted secret-shared numbers). |
| **Built from** | m + k homomorphic multiplications (m for inner product, k for the polynomial evaluation), multiplicative depth 1 + ceil(log_2 k). Operates over any field where k! has a multiplicative inverse. |
| **Standalone complexity** | pM + (m + k) * M operations, depth 1 + ceil(log_2 k), where pM = plaintext multiplications, M = ciphertext multiplications.&#8201;[^6] |
| **Relationship to prior primitives** | The arithmetic folklore equality operator (Eq. 3) has depth 1 + ceil(log_2 l) with 2l * M operations. The arithmetic CW operator trades fewer multiplications in the equality check for more multiplications in the inner product, which can be done in parallel.&#8201;[^7] |

[^6]: Algorithm 2 and surrounding text, p. 6. The circuit performs m + k multiplications with multiplicative depth 1 + ceil(log_2 k).
[^7]: Table 3, p. 9. Arithmetic Folklore: {0,1}^l domain, 2l * M operations, depth 1 + ceil(log_2 l). Arithmetic CW: CW(m,k) domain, pM + (m+k) * M operations, depth 1 + ceil(log_2 k).

#### Primitive 3: Perfect Mapping (integers to constant-weight codes)

| Field | Detail |
|-------|--------|
| **Name** | Perfect Mapping to CW(m, k) |
| **Type** | Encoding algorithm |
| **Interface / Operations** | Input: x in [n], m, k such that C(m,k) >= n. Output: y in CW(m, k). Injective mapping based on combinatorial number system (Algorithm 3, p. 6). |
| **Purpose** | Maps integer identifiers to constant-weight codewords for use in the equality operator. |
| **Built from** | Greedy assignment of the i-th valid codeword from a sorted list. Complexity O(m + k).&#8201;[^8] |
| **Relationship to prior primitives** | Also supports an inverse perfect mapping (Algorithm 7, Appendix A) and a lossy mapping (Algorithm 8, Appendix A) inspired by Bloom filters for when the domain is too large for perfect mapping. |

[^8]: Algorithm 3, p. 6. The procedure assigns bits greedily from position m-1 down to 0, using binomial coefficient comparisons.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (Ring Learning with Errors) via the Fan-Vercauteren (FV/BFV) cryptosystem |
| **Encryption/encoding scheme(s)** | FV cryptosystem as implemented in Microsoft SEAL 3.6. Supports: addition, plaintext multiplication, ciphertext multiplication, and substitution.&#8201;[^9] |
| **Ring / Field** | R_t = Z_t[x]/(x^N + 1), R_q = Z_q[x]/(x^N + 1) where N is a power of 2 (polynomial modulus degree), t is the plaintext modulus, q is the ciphertext modulus. N in {4096, 8192, 16384} used in experiments.&#8201;[^10] |
| **Key structure** | Standard BFV secret key; encryption uses the secret key (not public key) for query construction.&#8201;[^11] |
| **Correctness condition** | Standard BFV decryption correctness: noise must remain below the decryption threshold after all homomorphic operations. The multiplicative depth of the equality circuit (ceil(log_2 k)) determines the minimum N required.&#8201;[^12] |

[^9]: Section 2.1.1, p. 2 (four operations listed) and Table 1, p. 3 (noise growth types): Addition (additive noise growth), Plain Multiplication (multiplicative noise growth), Multiplication (multiplicative noise growth), Substitution (additive noise growth).
[^10]: Section 2.1.1, p. 2. "The polynomial modulus degree, N, is a power of two and t is the plaintext modulus."
[^11]: Algorithm 4, p. 7, line 6: "ct_i(x) = Enc(sk, m_i(x))" — encryption with the secret key.
[^12]: Table 1 (p. 3) shows operation costs for different N. Larger multiplicative depth requires larger N for valid decryption.

### Key Data Structures

- **Database:** Table of n rows, each with an identifier from domain ID and payload data. Payload data is converted to FV plaintexts during setup, with at most s plaintexts per row.&#8201;[^13]
- **Constant-weight code table:** Each identifier in the database is pre-mapped to a constant-weight codeword CW(m, k) during the offline setup stage.&#8201;[^14]
- **Query:** Client's query encoded as a constant-weight codeword, compressed into ceil(m / 2^c) FV ciphertexts using a compression factor c.&#8201;[^15]
- **Expanded query:** After server-side oblivious expansion, a vector of m ciphertexts, each encrypting one bit of the query codeword.&#8201;[^16]
- **Selection vector:** n ciphertexts, each encrypting 0 or 1, computed by the server using the equality operator against each database identifier.&#8201;[^17]

[^13]: Section 3.3.1, p. 7. "After this offline stage, the server holds a table of plaintexts with n rows and at most s plaintexts in each row."
[^14]: Section 3.3.1, p. 7. "The constant-weight code corresponding to each identifier can be calculated and stored in this stage."
[^15]: Algorithm 4, p. 7. The compression factor c determines how many bits per plaintext: 2^c bits per plaintext, producing ceil(m / 2^c) ciphertexts.
[^16]: Algorithm 5, p. 8. Output is m ciphertexts after oblivious expansion.
[^17]: Algorithm 6, p. 8. "The output of this stage is an encrypted selection vector of size n, with each bit in a separate ciphertext."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Setup** | Server (offline) | Set FHE parameters; convert DB payloads to FV plaintexts; precompute CW codes for each identifier | -- | Once / on DB change |
| **Query** | Client | Choose k and derive m such that C(m,k) >= n; map query to CW(m,k); compress into ceil(m/2^c) ciphertexts; encrypt with secret key | ceil(m/2^c) ciphertexts ↑ (e.g., 216 KB for k=2) | Per query |
| **Query Expansion** | Server | Expand received ciphertexts into m individual-bit ciphertexts using modified oblivious expansion (Algorithm 5) | -- | Per query |
| **Selection Vector Calculation** | Server | For each of n identifiers: map to CW(m,k), evaluate plain equality operator f_PCW against expanded query | -- | Per query |
| **Inner Product** | Server | For each of s payload plaintexts: compute inner product of selection vector with corresponding DB column | s ciphertexts ↓ | Per query |
| **Extract** | Client | Decrypt received ciphertexts; extract payload data | -- | Per query |

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Compressed CW query | ceil(m/2^c) FV ciphertexts | 216 KB (k=2, N=8192) | Encrypted constant-weight encoding of the query identifier |
| Parameters (m, k, c) | Plaintext integers | negligible | Code length, Hamming weight, compression factor |

### Correctness Analysis

#### Option A2: Library-based noise management

- **Library / version:** Microsoft SEAL 3.6
- **Parameter constraints:** N >= 8192 required for CwPIR (the equality operator circuit has multiplicative depth ceil(log_2 k), plus the oblivious expansion adds depth). CwPIR requires N >= 8192 whereas SealPIR can use N = 4096.&#8201;[^18]
- **Noise growth type per operation:** Plaintext multiplication (multiplicative noise growth), substitution (additive noise growth). The modified oblivious expansion (Algorithm 5) replaces two substitutions + one plaintext multiplication with one substitution + two plaintext multiplications, for an overall speedup.&#8201;[^19]
- **Depth constraint:** Total multiplicative depth = depth of oblivious expansion (c levels, each using substitution + PM) + depth of equality operator (ceil(log_2 k)). For k=2, depth of equality = 1; for k=4, depth = 2.&#8201;[^20]

[^18]: Table 7 (p. 11) and p. 11 text: Folklore PIR requires N=8192 at n=256 (produces decryptable results), but at n=512 with N=8192 results are undecryptable (marked *). CwPIR with k=2 uses N=8192 successfully up to n=65536. Note: SealPIR's N=4096 parameter comes from p. 11 text, not Table 7.
[^19]: Section 3.3.3 "Query Expansion," p. 7. "We replace the use of two substitutions and one plaintext multiplication in the inner loop of Algorithm 1 with one substitution and two plaintext multiplications."
[^20]: Table 3, p. 9: Plain CW multiplicative depth = ceil(log_2 k).

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (k=2, n=16384, 1 plaintext payload) | Phase |
|--------|-----------|----------------------------------------------|-------|
| Query size (upload) | O(k-th root of (k! * n) + k) bits, mapped to ciphertexts&#8201;[^21] | 216 KB | Online |
| Response size (download) | s ciphertexts (s = number of payload plaintexts) | 106 KB | Online |
| Server computation (total) | n * k * M + n * s * PM (selection vector + inner product)&#8201;[^22] | 9.7 s (n=256, single-thread) to 2500 s (n=65536, single-thread); 0.8-640 s parallelized | Online |
| Multiplicative depth | ceil(log_2 k) (for equality operator)&#8201;[^23] | 1 (k=2), 2 (k=3 or 4) | -- |
| Expansion factor (F) | 2 log q / log t (standard BFV) | Not explicitly stated; N=8192 default modulus | -- |

[^21]: Section 2, p. 2: "for a multiplicative depth of d in the PIR protocol over a database with n possible identifiers, the representation used in constant-weight PIR has a size of O(d-th root of (k! * n))." For comparison, SealPIR and MulPIR use representations of size O(d * d-th root of n).
[^22]: Table 6, p. 11. CwPIR: n*k*M + n*s*PM operations (excluding expansion).
[^23]: Table 3, p. 9.

#### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query bit-length | O(k-th root of (k! * n) + k) | m = 24 bits for n=256/k=2; m = 182 for n=16384/k=2; m = 363 for n=65536/k=2&#8201;[^24] | Online |
| Compression factor c | c in {0, 1, ..., log_2 N} | Chosen to balance expansion cost vs. upload cost | Online |
| Expansion cost | O(m) substitutions + PM | See Query Expansion column in Table 7 | Online |

[^24]: Table 7, p. 11, "Code Length" column.

#### Keyword PIR additional complexity (sparse databases)

| Metric | Asymptotic | Notes |
|--------|-----------|-------|
| Query bit-length | O(k-th root of (k! * |S(ID)|) + k) where |S(ID)| = domain size | Depends on domain size, not DB size&#8201;[^25] |
| # Operations (excl. expansion) | n * k * M + n * s * PM | Depends on DB size n, NOT domain size |S(ID)|&#8201;[^26] |
| Download cost | s ciphertexts | Same as index PIR |

[^25]: Section 3.3.5, p. 8. For keyword PIR: "the code length, m, and Hamming weight, k, are chosen such that C(m,k) >= |S(ID)|."
[^26]: Section 3.3.5, p. 8. "In the selection vector calculation step, encrypted bits of the selection vector are generated only for identifiers in the database." Computation scales with n = |ID|, not |S(ID)|.

### Performance Benchmarks

#### Hardware

Intel Xeon E5-4640 @ 2.40 GHz, 32 physical cores, Ubuntu 16.04. All protocols implemented in C++ with SEAL 3.6 (or SEAL 3.7 for expanded evaluation). SealPIR/MulPIR use OpenMined PIR implementation. 128-bit security. N in {4096, 8192, 16384}.&#8201;[^27]

[^27]: Section 5, p. 11.

#### Table 7 (p. 11): Index PIR runtime comparison (response = 1 plaintext)

**Folklore PIR** (N = 8192, Query = 216 KB, Response = 106 KB):

| # Rows | DB (MB) | Code Length | Expansion (s) | Sel. Vec. Calc (s) | Inner Product (s) | Total Server (s) |
|--------|---------|------------|---------------|-------------------|------------------|-----------------|
| 256 | 8 | 5 | 0.06 | 58 | 0.9 | 60 |
| 512 | 9 | 10 | 0.1 | 130 | 1.7 | 130 |

**Folklore PIR** (N = 16384, Query = 913 KB, Response = 224 KB):

| # Rows | DB (MB) | Code Length | Expansion (s) | Sel. Vec. Calc (s) | Inner Product (s) | Total Server (s) |
|--------|---------|------------|---------------|-------------------|------------------|-----------------|
| 512 | 21 | 9 | 0.8 | 650 | 7.4 | 660 |
| 1024 | 42 | 10 | 0.8 | 1500 | 14 | 1500 |
| 2048 | 84 | 11 | 0.8 | 3300 | 29 | 3300 |
| 4096 | 170 | 12 | 0.8 | 7200 | 56 | 7200 |
| 8192 | 340 | 13 | 0.8 | 16000 | 120 | 16000 |
| 16384 | 670 | 14 | 0.8 | 35000 | 250 | 35000 |

**CwPIR** (k = 2, N = 8192, Query = 216 KB, Response = 106 KB):

| # Rows | DB (MB) | Code Length | Expansion (s) | Sel. Vec. Calc (s) | Inner Product (s) | Total Server (s) |
|--------|---------|------------|---------------|-------------------|------------------|-----------------|
| 256 | 5.2 | 24 | 0.3 | 8.3 | 0.9 | 9.7 |
| 512 | 10 | 33 | 0.5 | 17 | 1.7 | 19 |
| 1024 | 21 | 46 | 0.5 | 33 | 3.5 | 38 |
| 2048 | 42 | 65 | 1 | 67 | 6.9 | 75 |
| 4096 | 84 | 92 | 1 | 130 | 13 | 150 |
| 8192 | 170 | 129 | 2 | 270 | 27 | 300 |
| 16384 | 340 | 182 | 2 | 540 | 55 | 600 |
| 32768 | 670 | 257 | 5 | 1100 | 110 | 1200 |
| 65536 | 1300 | 363 | 5 | 2300 | 230 | 2500 |

**CwPIR** (k = 2, N = 8192, Parallelized):

| # Rows | DB (MB) | Code Length | Expansion (s) | Sel. Vec. Calc (s) | Inner Product (s) | Total Server (s) |
|--------|---------|------------|---------------|-------------------|------------------|-----------------|
| 256 | 5.2 | 24 | 0.1 | 0.5 | 0.3 | 1.1 |
| 512 | 10 | 33 | 0.1 | 0.7 | 0.5 | 1.6 |
| 1024 | 21 | 46 | 0.2 | 1.4 | 1.2 | 2.9 |
| 2048 | 42 | 65 | 0.2 | 2.9 | 2.4 | 5.6 |
| 4096 | 84 | 92 | 0.3 | 5.7 | 4.6 | 11 |
| 8192 | 170 | 129 | 0.3 | 11 | 9.2 | 21 |
| 16384 | 340 | 182 | 0.4 | 22 | 18 | 41 |
| 32768 | 670 | 257 | 0.6 | 44 | 34 | 79 |
| 65536 | 1300 | 363 | 0.7 | 87 | 70 | 160 |
| 131072 | 2700 | 513 | 1.2 | 170 | 140 | 320 |
| 262144 | 5400 | 725 | 1.4 | 340 | 290 | 640 |

#### Table 8 (p. 11): Communication cost (payload = 1 plaintext)

| Scheme | Upload Cost | Download Cost | Total Comm. |
|--------|-----------|--------------|-------------|
| SealPIR | 61.4 KB | 307 KB | 368.4 KB |
| MulPIR | 122 KB | 119 KB | 241 KB |
| CwPIR | 216 KB | 106 KB | 322 KB |

#### Table 9 (p. 12): Keyword PIR with large items (server runtime)

Server: Intel Xeon(R) CPU E7-8860 v4 @ 2.20 GHz, 144 cores, Ubuntu 20.04. Parallelized.&#8201;[^28]

[^28]: Table 9 caption, p. 12. "The experiments in Table 9 were performed on an Intel(R) Xeon(R) CPU E7-8860 v4 @ 2.20GHz running Ubuntu 20.04."

| Keyword Bitlength | n | DB Size (GB) | Item Size (MB) | Server Time (s) |
|-------------------|------|-------------|---------------|-----------------|
| 16 | 1000 | 1.3 | 1.3 | 51.9 |
| 16 | 1000 | 2.6 | 2.6 | 107 |
| 16 | 1000 | 5.2 | 5.2 | 200 |
| 16 | 1000 | 10.0 | 10.0 | 369 |
| 16 | 10000 | 13.0 | 1.3 | 508 |
| 16 | 10000 | 26.0 | 2.6 | 878 |
| 16 | 10000 | 52.0 | 5.2 | 1670 |
| 16 | 10000 | 100.0 | 10.0 | 3250 |
| 32 | 1000 | 1.3 | 1.3 | 59 |
| 32 | 1000 | 10.0 | 10.0 | 354 |
| 32 | 10000 | 13.0 | 1.3 | 506 |
| 32 | 10000 | 100.0 | 10.0 | 3180 |
| 48 | 1000 | 1.3 | 1.3 | 71.3 |
| 48 | 1000 | 10.0 | 10.0 | 380 |
| 48 | 10000 | 13.0 | 1.3 | 541 |
| 48 | 10000 | 100.0 | 10.0 | 3300 |

#### Large payload comparison (Figure 2, p. 12, approximate values)

At n = 16384 rows, comparing CwPIR (k=2) vs MulPIR (d=2, lower-bound estimate):

| Payload size (KB) | CwPIR runtime (s, approx.) | MulPIR runtime (s, approx.) | CwPIR faster? |
|-------------------|---------------------------|----------------------------|---------------|
| 50 | ~100 | ~50 | No |
| 100 | ~150 | ~150 | Tie |
| 268 | ~350 | ~350 | Crossover point |
| 400 | ~500 | ~700 | Yes |
| 500 | ~600 | ~1000 | Yes |

CwPIR outperforms MulPIR when payload exceeds ~268 KB (DB size ~4.3 GB).&#8201;[^29]

[^29]: Section 5, p. 12. "constant-weight PIR has a smaller runtime than MulPIR when the payload size exceeds 268 KB, which corresponds to a database size of 4.3 GB." The MulPIR values are lower-bound estimates since the OpenMined implementation does not support large payloads.

### Equality Operator Benchmarks (Section 4)

#### Table 4 (p. 9): Plain equality operators (seconds, single-thread)

| Operator | Config | n=2^8 | n=2^16 | n=2^32 | n=2^64 | n=2^128 | n=2^256 | n=2^512 |
|----------|--------|-------|--------|--------|--------|---------|---------|---------|
| Plain Folklore (N=8192) | depth=3 | 0.27 | 0.54 | -- | -- | -- | -- | -- |
| Plain CW, k=log_2 n (N=8192) | depth=3 | 0.27 | 0.57 | -- | -- | -- | -- | -- |
| Plain CW, k=1/2 log_2 n (N=8192) | depth=2 | 0.27 | 0.55 | -- | -- | -- | -- | -- |
| Plain CW, k=1/4 log_2 n (N=8192) | depth=1 | 0.11 | 0.25 | -- | -- | -- | -- | -- |
| **Plain CW, k=1/8 log_2 n (N=8192)** | **depth=0** | **0.0005** | **0.038** | -- | **0.54** | -- | -- | -- |

Bold numbers indicate best runtimes per domain size. The constant-weight operator with small k achieves up to **~14x speedup** over folklore (e.g., n=2^16: 0.038s vs 0.54s for k=1/8 log_2 n at N=8192).&#8201;[^30]

[^30]: Table 4, p. 9. The cited numbers (0.038s vs 0.54s) yield a ratio of 0.54/0.038 = ~14x. "The constant-weight plain operator consistently outperforms the folklore operator in terms of running time."

#### Parallelization speedup (Figure 1, p. 10)

The constant-weight operator benefits more from parallelization than folklore. The folklore circuit gains at most ~2x speedup, while the constant-weight circuit achieves up to **10x speedup** because the m homomorphic multiplications in the CW operator can be done independently in parallel.&#8201;[^31]

[^31]: Sections 4.2/5 boundary, p. 10. "The folklore circuit runs at most 2 times faster with parallelization, whereas the constant-weight circuit has more than a 10x speedup in some cases."

### Application Scenarios

#### Private File Retrieval (Section 6)

CwPIR is proposed for private file retrieval where items are large (e.g., documents) and retrieved by name/keyword rather than index. Key advantages for this application:&#8201;[^32]
- **No hash table required:** Unlike MulPIR/SealPIR keyword PIR approaches, CwPIR does not need to store identifiers in a hash table or resolve keywords to indices.
- **Single round:** No extra round of communication to resolve keyword to address.
- **Database updates:** Updates to the database can be performed without interaction with users (no hash function parameter renegotiation).
- **Unreliable networks:** Single-round protocol is robust to unreliable connections.

[^32]: Section 6 "Keyword PIR for Private File Retrieval," p. 12. "constant-weight PIR is performed without the use of a hash-table to store the identifiers or multiple rounds of communication."

#### Keyword PIR domain size analysis (Figure 4, p. 14)

For n = 16384 rows, payload = 1 plaintext (~20.1 KB), database ~330 MB, varying domain bit-length:
- For log_2 |S| <= 27: k = 2 gives smallest server time (~20-30s).
- For 28 <= log_2 |S| <= 40: k = 3 is optimal (expansion step becomes dominant for k=2).
- For log_2 |S| >= 41: k = 4 produces best results.
- The expansion step (shaded area in Figure 4) grows with domain size and eventually dominates; larger k reduces expansion cost at the expense of deeper equality circuits.&#8201;[^33]

[^33]: Section 6, p. 13-14. "Initially, for log_2 |S| <= 27, k = 2 has the smallest server time. However, when log_2 |S| approaches 28, the expansion constitutes a significant portion of the server time and a switch to k = 3 results in a smaller total server time."

### Comparison with Prior Work

#### Table 6 (p. 11): Protocol properties (|S(ID)| = |ID| = n)

| Method | Mult Depth | Query Bit-length | # Operations (excl. expansion) | Download Cost (cts) |
|--------|-----------|-----------------|-------------------------------|-------------------|
| SealPIR | d - 1 | d * ceil(d-th root of n) | sum_{i=0}^{d-1} n^{(d-i)/d} * F^i * PM | F^{d-1} * s |
| MulPIR | d - 1 | d * ceil(d-th root of n) | (n * PM + sum_{i=0}^{d-1} n^{(d-i)/d} * M) * s | s |
| Folklore PIR | ceil(log_2 n) | ceil(log_2 n) | n * (log_2 n) * M + n * s * PM | s |
| **CwPIR** | **ceil(log k)** | **O(k-th root of (k! * n) + k)** | **n * k * M + n * s * PM** | **s** |

#### Table 10 (p. 13): Keyword PIR properties (sparse database, |S| = domain size)

| Method | Mult Depth | Query Bit-length | # Operations (excl. expansion) | Download Cost (cts) |
|--------|-----------|-----------------|-------------------------------|-------------------|
| SealPIR | d - 1 | d * ceil(d-th root of |S|) | n * PM + sum_{i=0}^{d-1} |S|^{(d-i)/d} * F^i * PM | F^{d-1} |
| MulPIR | d - 1 | d * ceil(d-th root of |S|) | n * PM + sum_{i=0}^{d-1} |S|^{(d-i)/d} * M | 1 |
| **CwPIR** | **ceil(log k)** | **O(k-th root of (k!*|S|) + k)** | **n * k * M + n * PM** | **1** |

**Key takeaway:** CwPIR is the only scheme where the number of operations (excluding expansion) depends on the actual database size n, not the domain size |S|. For keyword PIR over sparse databases (n << |S|), this is a decisive advantage. SealPIR and MulPIR operations scale with |S| because they use dimension-wise encodings that depend on the full domain.&#8201;[^34]

[^34]: Table 10, p. 13, and surrounding text. "the number of operations (excluding expansion) of constant-weight PIR does not depend on the size of the domain."

#### Table 11 (p. 13): Query encoding size comparison (bits required)

| Domain Bit-length | CW (k=1) | CW (k=2) | CW (k=3) | CW (k=4) | Dim-wise (d=1) | Dim-wise (d=2) | Dim-wise (d=3) |
|-------------------|----------|----------|----------|----------|---------------|---------------|---------------|
| 4 | 16 | 7 | 6 | 7 | 16 | 8 | 9 |
| 8 | 256 | 24 | 13 | 11 | 256 | 32 | 21 |
| 12 | 4096 | 92 | 31 | 20 | 4096 | 128 | 48 |
| 16 | 65536 | 363 | 75 | 37 | 65536 | 512 | 123 |
| 20 | -- | 1449 | 186 | 73 | -- | 2048 | 306 |
| 32 | -- | 92683 | 2955 | 569 | -- | 131072 | 4878 |
| 48 | -- | -- | 119088 | 9068 | -- | -- | 196608 |

For the same multiplicative depth (matching k to d), the constant-weight code produces a **smaller encoding** than dimension-wise encoding (Figure 3, p. 13).&#8201;[^35]

[^35]: Section 6, p. 13. "for the same multiplicative depth, the constant-weight code is smaller than the dimension-wise encoding."

### Deployment Considerations

- **Database updates:** CwPIR supports database updates without client interaction. The server simply recomputes the CW mapping for changed identifiers in the setup stage. No hash function renegotiation needed (unlike hash-table-based keyword PIR).&#8201;[^36]
- **Sharding:** Not discussed.
- **Key rotation / query limits:** Standard BFV key management; no special limits beyond standard.
- **Anonymous query support:** Yes (stateless, single-round).
- **Session model:** Ephemeral client (no persistent state).
- **Cold start suitability:** Yes (no offline communication or preprocessing).

[^36]: Section 6, p. 12. "updates to the database may require a change in the parameters of the hash function to avoid collisions. An additional round of communication is required for each query to communicate new hash function parameters to the user."  This problem exists for hash-table approaches; CwPIR avoids it.

### Key Tradeoffs & Limitations

- **Server computation is high:** CwPIR's server must evaluate the equality operator against every database row (n * k multiplications for selection vector). For small payloads, this dominates and makes CwPIR slower than SealPIR/MulPIR. The crossover vs MulPIR occurs at payload ~268 KB.&#8201;[^37]
- **Upload cost depends on domain size for keyword PIR:** The query encoding length grows with |S(ID)| (the domain size), not the database size n. For very large domains, the expansion step becomes the bottleneck (Figure 4).&#8201;[^38]
- **Minimum N = 8192:** The folklore approach (SealPIR) can use N = 4096 for small databases. CwPIR requires N >= 8192 for the equality circuit, increasing per-operation cost.&#8201;[^39]
- **Memory usage:** Constant-weight encoding requires storing m ciphertexts after expansion, where m can be large for small k. Higher k reduces m but increases multiplicative depth.&#8201;[^40]
- **k parameter tradeoff:** Smaller k means longer code (larger m, more expansion cost) but shallower circuit (can use smaller N). Larger k means shorter code but deeper circuit (requires larger N). The optimal k depends on the domain size.&#8201;[^41]

[^37]: Section 5, p. 12: "constant-weight PIR has a smaller runtime than MulPIR when the payload size exceeds 268 KB."
[^38]: Section 6, p. 13-14, and Figure 4.
[^39]: Table 7, p. 11. Folklore PIR produces valid results at N=8192 for 256 rows, but CwPIR also requires N=8192 minimum.
[^40]: Section 4.1, p. 9. "Faster runtimes for the plain constant-weight circuit come at the cost of higher memory usage during the protocol."
[^41]: Section 6, p. 13-14 and Table 11.

### Portable Optimizations

- **Constant-weight equality operators:** The equality operator primitive is applicable beyond PIR to any setting requiring encrypted equality checks: secure search, secure pattern matching, private set intersection.&#8201;[^42] The plain CW operator is especially useful when one operand is public and the domain can be mapped to constant-weight codes.
- **Modified oblivious expansion (Algorithm 5):** Replaces 2 substitutions + 1 PM with 1 substitution + 2 PM per inner-loop iteration. This optimization was adopted by the OpenMined community for MulPIR.&#8201;[^43]
- **Lossy mapping via Bloom-filter-inspired hashing (Algorithm 8):** For domains too large for perfect CW mapping, the lossy mapping uses hash functions to set k positions in an m-bit string. Collision probability is 1/C(m,k). Applicable to any protocol needing compact domain encodings with bounded false-positive rates.&#8201;[^44]

[^42]: Section 1, p. 1: "Equality operators are an essential building block in tasks over secure computation such as private information retrieval."
[^43]: Footnote 1, p. 7: "This modification in the expansion algorithm was first adopted in the implementation of MulPIR from the OpenMined community."
[^44]: Algorithm 8, Appendix A (p. 16). Theorem 2 (p. 17) proves collision probability is 1/C(m,k).

### Implementation Notes

- **Language / Library:** C++ with Microsoft SEAL library, version 3.6 (PIR protocols) and version 3.7 (extended evaluation).&#8201;[^45]
- **Polynomial arithmetic:** NTT-based (via SEAL), using SIMD batch encoding for parallelism across plaintext slots.
- **SIMD / vectorization:** SEAL's SIMD batch encoding used. "All circuits are run in a SIMD fashion using the batch encoding functionality of SEAL. Using this feature, N elements can be compared at the same time."&#8201;[^46]
- **Parallelism:** All experiments run both single-threaded and parallelized across 32 physical cores. Selection vector calculation is embarrassingly parallel across database rows. Inner product is parallelizable across s payload plaintexts.&#8201;[^47]
- **Open source:** https://github.com/RasoulAM/constant-weight-pir [^48]

[^45]: Sections 4 and 5. "We implement the circuits using C++ and the SEAL library (version 3.6)." and "Our implementation of constant-weight PIR and folklore PIR is open-source and available on Github. We implement all protocols using C++ and SEAL (version 3.7)."
[^46]: Section 4, p. 9.
[^47]: Section 4, p. 9 and Section 3.3.3, p. 8: "this step... can be done in parallel across the identifiers in the database" and "The s inner products can also be done in parallel."
[^48]: Footnotes 2 and 3, pages 9 and 11.

### Related Papers in Collection

- **SealPIR [Group A]:** Introduced oblivious expansion for query compression and the recursion/dimension approach. CwPIR's Algorithm 5 is a modified version of SealPIR's Algorithm 1. SealPIR uses selection-vector communication; CwPIR uses equality-operator computation.
- **MulPIR [Group A]:** Replaced SealPIR's layered encryption with homomorphic multiplications for better communication. CwPIR competes with MulPIR directly and outperforms it for payloads > 268 KB.
- **FastPIR/Addra [Group A]:** Different paper despite the filename. FastPIR uses one-hot selection vectors in BFV; CwPIR uses constant-weight equality operators. They are in the same group but represent orthogonal approaches.&#8201;[^49]
- **Spiral [Group A]:** Uses Regev+GSW composition; a different FHE paradigm from both the selection-vector (SealPIR) and equality-operator (CwPIR) lines.

[^49]: SKILL.md lineage note: "FastPIR/Addra (2021) uses one-hot selection vectors (NOT equality operators) — it is a system paper embedding a BFV-based PIR scheme, distinct from CwPIR."

### Open Problems

- Can the constant-weight equality operator be combined with more efficient FHE schemes (e.g., Regev+GSW composition from Spiral) to further reduce computation?
- The paper notes that hardware accelerators (GPUs) or HE acceleration libraries (Intel HEXL) could substantially improve performance.&#8201;[^50]
- Can the lossy mapping be improved to achieve lower collision probability for the same code length?

[^50]: Section 6, p. 12: "The results... can easily be enhanced using hardware accelerators (GPUs) or accelerators for the homomorphic encryption libraries such as HEXL [10]."

### Uncertainties

- **Notation collision: n vs N:** The paper uses n for number of database rows and N for the polynomial modulus degree of the FV cryptosystem. These are clearly distinguished throughout.
- **Notation collision: k:** In this paper, k is the Hamming weight of constant-weight codes, NOT the security parameter. The security parameter is implicitly 128 bits (from SEAL parameter selection).
- **MulPIR runtime estimates:** Figure 2's MulPIR values are lower-bound estimates based on per-plaintext runtime extrapolation, since the OpenMined implementation does not support large payloads. Marked as author-estimated.&#8201;[^51]
- **Parallelized runtimes in Table 7:** The parallelized CwPIR results are on the same 32-core machine, but the degree of parallelism achieved is not precisely stated per phase.

[^51]: Section 5, p. 12: "The implementation of MulPIR by OpenMined does not support large payloads, so we provide a lower bound of the runtime of MulPIR (with d = 2) based on the server time for a payload of one plaintext."
