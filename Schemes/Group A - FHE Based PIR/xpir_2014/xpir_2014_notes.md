## Bandwidth Efficient PIR from NTRU (XPIR-2014) — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Bandwidth Efficient PIR from NTRU](https://eprint.iacr.org/2014/232) (2014) |
| **Archetype** | Construction |
| **PIR Category** | Group A — FHE-based PIR |
| **Security model** | Semi-honest single-server (computational PIR) |
| **Additional assumptions** | RLWE reduction for NTRU (Stehle-Steinfeld variant [12]); no circular security or ROM needed |
| **Correctness model** | Deterministic (correctness condition on noise: \|\|c^{2^d} f^{2^d}\|\|\_inf < q\_d/2) [^1] |
| **Rounds (online)** | 1 (non-interactive: client sends query, server sends response) |
| **Record-size regime** | Small (single-bit entries; extendable to w-bit via parallel evaluations) [^2] |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Stehle-Steinfeld NTRU variant [12], Lopez-Alt/Tromer/Vaikuntanathan FHE from NTRU [11], Brakerski/Gentry/Vaikuntanathan modulus reduction [10], Smart-Vercauteren SIMD batching [8,9], Kushilevitz-Ostrovsky PIR [2], Boneh-Goh-Nissim PIR [3], Aguilar-Melchor-Gaborit lattice PIR [30,31] |
| **What changed** | Replaced prior PHE/pairing-based PIR schemes with an NTRU-based SWHE using CRT batching and modulus reduction to achieve >1000x bandwidth improvement over BGN and K-O schemes |
| **Superseded by** | XPIR-2016 (Aguilar-Melchor et al., ePrint 2014/1025) — Ring-LWE-based with auto-optimization; SealPIR [Group A] — BFV with oblivious expansion |
| **Concurrent work** | Doroz, Hu, Sunar, "Homomorphic AES Evaluation using NTRU" [16] (same group, same NTRU SWHE implementation) |

### Core Idea

The paper constructs a single-server cPIR by evaluating the arithmetic retrieval function f(x) = SUM\_{y in [2^l]} (x == y) \* D\_y (mod 2) homomorphically using a leveled Somewhat Homomorphic Encryption (SWHE) scheme based on the Stehle-Steinfeld variant of NTRU. The key insight is that the equality-comparison circuit has depth only ceil(log\_2(l)) where l = log\_2(N), so a depth-5 SWHE suffices for databases up to 2^32 (4 billion) entries. By combining CRT-based SIMD batching (encoding epsilon independent index bits into one ciphertext), the scheme achieves query sizes as small as 32 KB for 4 billion entries in bundled mode — over 1000x smaller than BGN and K-O schemes.[^3]

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring Learning With Errors (RLWE), via the Stehle-Steinfeld reduction from NTRU to RLWE [^4] |
| **Encryption/encoding scheme** | Stehle-Steinfeld NTRU variant [12] — leveled SWHE with modulus reduction technique from [10]. No relinearization or key switching needed (single-user, tree-structured circuit). [^5] |
| **Ring / Field** | R\_{q\_i} = Z\_{q\_i}[x] / (Phi\_m(x)) where Phi\_m(x) is the m-th cyclotomic polynomial of degree n = phi(m). Decreasing prime moduli chain q\_0 > q\_1 > ... > q\_d with q\_i \| q\_{i+1}. [^6] |
| **Key structure** | Per-level keys: for each level i, sample u^(i), g^(i) from distribution chi, set f^(i) = 2u^(i) + 1, h^(i) = 2g^(i)(f^(i))^{-1} in R\_{q\_i}. Public key = (h^(0), q\_0). Evaluation keys not needed due to q\_i \| q\_{i+1} specialization. [^7] |
| **Correctness condition** | \|\|c^{2^d} f^{2^d}\|\|\_inf < q\_d / 2, with noise growth c^{2^d} f^{2^d} = (...((c^2 kappa + p\_1)^2 kappa + p\_2)^2 ... + p\_{2^i}) f^{2^d} where kappa = q\_{i+1}/q\_i is the modulus reduction rate [^8] |

### Key Data Structures

- **Database:** Matrix M of size 2^{l/2} x 2^{l/2} where N = 2^l is the number of single-bit entries. Index i is split: first l/2 bits select row, last l/2 bits select column.[^9]
- **Query:** Vector of l encrypted index bits Q = [xi\_0(x), ..., xi\_{l-1}(x)], each an NTRU ciphertext polynomial in R\_{q\_0}. In Bundled Query mode, epsilon index bits are CRT-packed into each ciphertext.[^10]
- **Response:** A single ciphertext polynomial R encoding the result (or epsilon results in bundled mode).[^11]
- **Modulus chain:** Decreasing sequence of odd primes q\_0 > q\_1 > ... > q\_d with divisibility condition q\_i \| q\_{i+1}.[^6]

### Database Encoding

- **Representation:** Database D of N = 2^l single-bit entries stored as matrix M of dimension 2^{l/2} x 2^{l/2}.[^9]
- **Record addressing:** Index x is split into l bits; first l/2 bits -> row selector A (one-hot encoded), last l/2 bits -> column selector B (one-hot encoded).[^9]
- **Batching (Bundled Query):** Database row bits {D\_y[1], ..., D\_y[epsilon]} are encoded as polynomials via inverse CRT: D\_y(x) = CRT^{-1}(D\_y[1], ..., D\_y[epsilon]) using the factorization of Phi\_m(x) into irreducible factors mod 2.[^12]
- **Batching (Single Query):** Row index bits {y\_i[1], ..., y\_i[epsilon]} and data bits {D\_y[1], ..., D\_y[epsilon]} are both CRT-packed for parallel comparison across epsilon slots.[^13]

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **KeyGen** | Client | Generate NTRU key pairs (h^(i), f^(i)) for levels i = 0..d | — | Once per session |
| **Query Gen** | Client | Encrypt each index bit (or CRT-packed batch of index bits) as NTRU ciphertexts xi\_i(x) = h(x)s\_i(x) + 2e\_i(x) + beta\_i(x) | l ciphertexts upward | Per query |
| **Server Compute** | Server | Evaluate f(x) = SUM\_{y} (PROD\_{i in [l]} (xi\_i(x) + y\_i(x) + 1)) D\_y(x) homomorphically. XOR = polynomial addition; AND = polynomial multiplication + modulus reduction. | — | Per query |
| **Response** | Server | Send single resulting ciphertext R = r(xi\_0(x),...,xi\_{l-1}(x)) | 1 ciphertext downward | Per query |
| **Decode** | Client | Decrypt: compute m = c^(i) f^(i) (mod 2) via modular reductions. For bundled mode, extract each slot z\_i = dec(r) (mod F\_i(x)). | — | Per query |

### Correctness Analysis

#### Option A: FHE Noise Analysis

The NTRU SWHE uses modulus reduction (not relinearization) to control noise growth through multiplicative levels. Each AND gate (polynomial multiplication) produces noise that grows exponentially in the secret key power, but modulus reduction at each level rescales the noise by a factor kappa = q\_{i+1}/q\_i.[^8]

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| After encryption | \|\|c^(0) f^(0)\|\|\_inf | Initial | Bounded by chi distribution (B-bounded, B = 2) |
| After each AND + mod reduction | \|\|c-tilde^(i)\|\|\_inf | Multiplicative | Noise grows as (...((c^2 kappa + p\_1)^2 kappa + p\_2)^2...) |
| After depth d | \|\|c^{2^d} f^{2^d}\|\|\_inf | Exponential in d | Must be < q\_d / 2 for correct decryption |

- **Correctness condition:** \|\|c^{2^d} f^{2^d}\|\|\_inf < q\_d / 2 [^8]
- **Independence heuristic used?** No explicit mention; noise analysis follows [16] which uses worst-case bounds.
- **Dominant noise source:** The secret key powers f^{2^d} grow exponentially since relinearization is not used. This is the primary constraint on achievable depth. [^5]

#### Option C: Deterministic Correctness

Deterministic correctness — the retrieval function f(x) is an exact arithmetic identity (equality check via product of XOR comparisons). When the noise condition is satisfied, decryption is exact. No probabilistic failure mode.[^1]

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase | Confidence |
|--------|-----------|---------------------------|-------|------------|
| Query size (Bundled) | O(alpha log N) | 32 KB (d=5, N=2^32, epsilon=1024) | Online | exact [^14] |
| Query size (Single) | O(alpha log N) | 32 MB (d=5, N=2^32) | Online | exact [^14] |
| Response size (Bundled) | O(alpha) | 784 KB (d=5, N=2^32) | Online | exact [^14] |
| Response size (Single) | O(alpha) | 784 KB (d=5, N=2^32) | Online | exact [^14] |
| Per-query bandwidth (Bundled, normalized by epsilon) | O(alpha log N / epsilon) | ~32 KB query + ~0.77 KB response per retrieval (d=5) | Online | inferred [^15] |
| Server computation per row (Bundled, d=5) | — | 4.45 ms index comparison + 0.22 ms data aggregation = 4.67 ms total | Online | exact [^16] |
| Server computation per row (Single, d=5) | — | 4.56 ms index comparison + 37 ms data aggregation = 41.56 ms total | Online | exact [^16] |

#### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Confidence |
|--------|-----------|---------------------------|------------|
| Multiplicative depth | ceil(log\_2(l)) where l = log\_2(N) | d = 5 for N = 2^32 (4 billion entries) | exact [^17] |
| Ciphertext size (alpha) | poly(n, log q) | 8192 polynomials of degree 16384 with 512-bit coefficients at d=5; ~32 KB per ciphertext (bundled) | exact [^14] |
| Expansion factor (F) | Not directly stated | Response 784 KB for 1024 bits retrieved = ~6272x per bit; ~6.1x per retrieval in bundled mode | inferred |
| Batching capacity (epsilon) | Number of irreducible factors of Phi\_m(x) mod 2 | 1024 (d=5), 630 (d=4), 256 (d=3) | exact [^14] |

### Performance Benchmarks

**Hardware:** Intel Pentium @ 3.5 GHz (single-threaded). NTL 6.0 library for lattice operations.[^18]

#### Table 2: Parameter choices and communication sizes [^14]

| max N | (log\_2 q, n) | epsilon | Query Size (MB) | Response Size (KB) |
|-------|-------------|---------|----------------|-------------------|
| 4 Billion (2^32) | (512, 16384) | 1024 | 32 | 784 |
| 65536 (2^16) | (250, 8190) | 630 | 3.9 | 154 |
| 256 (2^8) | (160, 4096) | 256 | 0.625 | 44 |

#### Table 3: Per-entry processing times (msec) [^16]

| Component | Bundled (d=5) | Bundled (d=4) | Bundled (d=3) | Single (d=5) | Single (d=4) | Single (d=3) |
|-----------|-------------|-------------|-------------|------------|------------|------------|
| Index comparison | 4.45 | 0.71 | 0.31 | 4.56 | 2.03 | 1.29 |
| Data aggregation | 0.22 | 0.09 | 0.04 | 37 | 7.45 | 3.40 |
| **Total per entry** | **4.67** | **0.80** | **0.35** | **41.56** | **9.48** | **4.69** |

#### Table 1: Hermite factor and supported depth (gamma, d) [^19]

| n | log\_2(q) = 512 | log\_2(q) = 640 | log\_2(q) = 768 | log\_2(q) = 1024 | log\_2(q) = 1280 |
|-------|--------------|--------------|--------------|---------------|---------------|
| 2^13 (8192) | (1.01083, 5) | (1.0135, 5) | (1.0162, 6) | (1.0218, 6) | (1.0273, 7) |
| 2^14 (16384) | (1.00538, 5) | (1.0067, 5) | (1.0081, 6) | (1.0108, 6) | (1.0135, 6) |
| 2^15 (32768) | (1.00269, 5) | (1.0033, 5) | (1.0040, 6) | (1.0054, 6) | (1.0067, 6) |

Security is parameterized via the Hermite factor gamma. The feasibility boundary for current lattice reduction is delta^n <= 1.01^n.[^20]

### Comparison with Prior Work

#### Table 4: Query size comparison for various database sizes [^21]

| Scheme | BW Complexity | alpha (d=5) | alpha (d=4) | alpha (d=3) | Query (d=5) | Query (d=4) | Query (d=3) |
|--------|-------------|------------|------------|------------|------------|------------|------------|
| Boneh-Goh-Nissim | alpha sqrt(N) | 6144 | 6144 | 6144 | 96 MB | 384 KB | 24 KB |
| Kushilevitz-Ostrovsky | alpha sqrt(N) | 2048 | 2048 | 2048 | 32 MB | 128 KB | 8 KB |
| **Ours (Single)** | **alpha log N** | **8388608** | **2047500** | **655360** | **32 MB** | **249 KB** | **80 KB** |
| **Ours (Bundled)** | **alpha log N** | **8192** | **3250** | **2560** | **32 KB** | **406 B** | **320 B** |

**Key observations:**
- At d=5 (N up to 2^32), Bundled Query achieves 32 KB — 1024x smaller than BGN (96 MB), 1000x smaller than K-O (32 MB).[^22]
- At d=4 (N up to 2^16), Bundled Query achieves 406 B — 944x smaller than BGN (384 KB).[^21]
- The alpha (ciphertext size) for Single Query mode is very large (8.3M elements at d=5) because each index bit has its own ciphertext without batching normalization. When normalized by epsilon, the per-retrieval cost of Single Query is comparable to Bundled Query.
- Ciphertext size alpha is "almost independent" of database size — growing from 256 entries to 2^16 entries increases alpha by only 1.26x in bundled mode.[^23]

**Key takeaway:** This scheme achieves dramatically lower bandwidth than prior HE-based PIR (BGN, K-O) by leveraging NTRU SWHE with O(log N) communication complexity instead of O(sqrt(N)). The tradeoff is significantly higher server computation, approximately 8x slower than K-O for d=4 with 1 GB rows.[^24]

### Implementation Notes

- **Language / Library:** C++ with Shoup's NTL library version 6.0 [17] for lattice/polynomial operations.[^18]
- **Polynomial arithmetic:** Cyclotomic polynomial ring arithmetic via NTL. The paper uses Phi\_m(x) (not necessarily x^n + 1), requiring m to satisfy m \| (2^lambda - 1) for CRT batching to produce enough slots.[^12]
- **Modulus chain:** Specialized: q\_i \| q\_{i+1}, which eliminates the need for key switching and public evaluation keys. This reduces key size significantly but constrains the modulus chain to a divisibility tower.[^6]
- **No relinearization:** The circuit is a perfect binary tree (depth d), so secret key grows as f^{2^d}. This avoids the expensive relinearization step but means the secret key power grows exponentially, constraining achievable depth.[^5]
- **Batching:** CRT-based SIMD using the factorization of Phi\_m(x) mod 2 into epsilon irreducible factors of degree lambda. Requires m such that 2 has multiplicative order lambda mod m (i.e., lambda is the smallest integer with m \| (2^lambda - 1)).[^12]
- **SIMD / vectorization:** Not mentioned. Single-threaded implementation on Intel Pentium.
- **Parallelism:** The server computation (iterating over each database row) is embarrassingly parallel but no multi-threading was implemented.[^18]

### Key Tradeoffs & Limitations

- **Bandwidth vs. computation:** The scheme achieves >1000x bandwidth improvement over BGN/K-O at the cost of significantly higher server computation. At d=4, processing time is ~8x slower than K-O for 1 GB rows.[^24]
- **Single-bit entries:** The base scheme retrieves single-bit entries. Multi-bit entries (w-bit) require w parallel evaluations of the PIR function, each on independent batched data. Data aggregation cost is proportional to w (polynomial multiplication per additional bit in Single Query mode).[^2]
- **Bundled vs. Single Query tradeoff:** Bundled Query packs epsilon independent indices into one query (different rows retrieved simultaneously) — ideal for batch retrieval. Single Query retrieves one row but processes epsilon database positions in parallel — no batch retrieval, but faster per-row data aggregation in Bundled mode (0.22 ms vs. 37 ms at d=5).[^16]
- **Index comparison dominates:** At d=5, index comparison takes 4.45 ms/row versus 0.22 ms/row for data aggregation in Bundled mode. The index comparison is a one-time cost per row that amortizes over wider database entries.[^16]
- **Ciphertext size nearly database-independent:** Going from N=256 to N=65536 increases ciphertext size by only ~1.26x in bundled mode because the PIR depth only grows logarithmically. This is a significant advantage for scaling.[^23]
- **No key switching / no relinearization** simplifies the implementation but limits the maximum circuit depth (practically d <= 6) because the secret key power f^{2^d} grows exponentially.[^5]
- **Security estimation via Hermite factor** is a pre-2016 methodology; modern lattice estimator tools may yield different security levels for the same parameters.[^20]

### Portable Optimizations

- **CRT batching for PIR:** Packing multiple independent index bits (or multiple queries) into SIMD slots of a single ciphertext via the Chinese Remainder Theorem. This technique was later adopted widely in BFV-based PIR (SealPIR, FastPIR/Addra).[^12]
- **Arithmetic retrieval formulation:** Expressing the PIR retrieval function as f(x) = SUM (x == y) D\_y with the equality test decomposed as PROD (x\_i + y\_i + 1). This formulation generalizes to any HE scheme supporting XOR and AND.[^25]
- **Modulus chain with divisibility:** The q\_i \| q\_{i+1} specialization eliminates key switching entirely. Applicable to any NTRU-based leveled scheme in a single-user setting where relinearization is not needed.[^6]

### Uncertainties

- **Security level in bits:** The paper uses Hermite factor gamma as the security metric rather than concrete bit-security. For (n=16384, log q=512), gamma = 1.00538, yielding security t(gamma) = log(T(gamma)) = 1.8/log(gamma) - 110 which gives approximately 225 bits of security by the Lindner-Peikert estimate [15]. However, this estimate is from 2011 and may not reflect modern lattice attack improvements. Confidence: **inferred**.[^20]
- **Ciphertext size alpha units:** Table 4 gives alpha in number of ciphertexts (not bytes). The paper states "alpha is the ciphertext size that differs in each scheme." For this scheme, one ciphertext is a polynomial of degree n with log\_2(q)-bit coefficients, so one ciphertext is n * log\_2(q) / 8 bytes. At d=5: 16384 * 512 / 8 = 1 MB per ciphertext. The Bundled Query sends l = 32 ciphertexts = 32 MB, which matches Table 2. The "32 KB" bundled query size in Table 4 appears to be after normalizing by epsilon = 1024. **This normalization is critical for the 1000x claim.**[^22]
- **n vs N collision:** The paper uses n for the cyclotomic polynomial degree (phi(m)) and N for the database size. These are unambiguous within the paper.[^9]
- **Batching parameter epsilon values:** The paper states epsilon = 1024 for d=5 but does not show the derivation of all epsilon values. These depend on the factorization of specific cyclotomic polynomials mod 2.[^14]
- **Missing total query time:** The paper gives per-row times but does not report end-to-end query latency for a full database. For N = 2^32 with d=5 Bundled Query: 2^32 * 4.67 ms = ~200 million seconds per query (infeasible for a single thread). This suggests the scheme targets smaller databases or parallel execution. Confidence: **inferred**.

---

### Footnotes

[^1]: Section 4.1, p. 7 — "we can express the correctness condition as ||c^{2^i} f^{2^i}||\_inf < q\_d/2"
[^2]: Section 3, p. 5, footnote 3 — "we restricted the database entries D\_i to be bits but a w-bit entry can also easily be handled by considering w parallel and independent function evaluations"
[^3]: Abstract, p. 1 — "our implementation achieves a significantly lower bandwidth cost (more than 1000 times smaller)"
[^4]: Section 4, p. 5 — "We make use of the modified NTRU scheme introduced by Stehle and Steinfeld [12]... Stehle and Steinfeld formalized the security setting and reduced the security of their NTRU variant to the ring learning with error (RLWE) problem"
[^5]: Section 4, p. 6 — "we do not use relinearizations as proposed in [11] since we are in a single user setting and we have a shallow well structured circuit (a perfect binary tree) to evaluate"
[^6]: Section 4, p. 6 — "We use a decreasing sequence of odd prime moduli q\_0 > q\_1 > ... > q\_d... we specialize the prime moduli q\_i by requiring q\_i | q\_{i+1} as was proposed in [16]. This allows us to eliminate the need for key switching"
[^7]: Section 4, p. 6 — KeyGen description: "We choose a decreasing sequence of primes q\_0 > q\_1 > ... > q\_d and a polynomial Phi\_m(x)... set f^(i) = 2u^(i) + 1 and h^(i) = 2g^(i)(f^(i))^{-1}"
[^8]: Section 4.1, p. 7 — "With modulus reduction rate of kappa ≈ q\_{i+1}/q\_i the following equation holds c^{2^d} f^{2^d} = (...((c^2 kappa + p\_1)^2 kappa + p\_2)^2... + p\_{2^i})f^{2^d}"
[^9]: Section 3, p. 4-5 — "Bob stores D in a matrix M of size 2^{h/2} x 2^{h/2}"
[^10]: Section 5, p. 8 — "The query Q = [xi\_i(x),...,xi\_{l-1}(x)] is then send to the PIR server"
[^11]: Section 5, p. 9 — "the response (a single ciphertext) R = r([xi\_0(x),...,xi\_{l-1}(x)]) is sent back to the PIR client"
[^12]: Section 5, p. 8 — "Batching was introduced by Smart and Vercauteren [8,9]... The encoding is achieved using the Chinese Remainder Theorem"
[^13]: Section 5, p. 9 — "Single Query: In the single query mode we will also perform batching... we batch the row bits of y\_i and D\_y as well"
[^14]: Table 2, p. 10 — "Polynomial parameters and Query/Response sizes necessary to support various database sizes N"
[^15]: Inferred from Table 2: for d=5, query = 32 MB total / epsilon = 1024 retrievals = ~32 KB per retrieval; response = 784 KB / 1024 = ~0.77 KB per retrieval
[^16]: Table 3, p. 10 — "Index comparison and data aggregation times per entry in the database for (d, epsilon) choices of (5, 1024), (4, 630) and (3, 256) on Intel Pentium @ 3.5 Ghz"
[^17]: Section 3, p. 5 — "a depth 5 or 6 circuit will suffice since that will give us an ability to construct a PIR for a database of size 2^32 and 2^64, respectively"
[^18]: Section 6, p. 9 — "We implemented the proposed PIR protocol with both the Single and Bundled Querying modes in C++ where we relied on Shoup's NTL library version 6.0"
[^19]: Table 1, p. 7 — "Hermite factor and supported circuit depth (gamma, d) for various q and n"
[^20]: Section 4.1, p. 7 — "for larger dimensional lattices, a factor delta^n <= 1.01^n would be the feasibility limit for current lattice reduction algorithms"
[^21]: Table 4, p. 11 — "Comparison of query sizes for databases upto 2^32, 2^16 and 2^8 entries"
[^22]: Section 6, p. 10 — "The query size of our scheme is smaller by a factor of 1024, 1200, and 3072 when compared to BGN, Melchor-Gaborit and Kushilevitz-Ostrovsky, respectively"
[^23]: Section 6, p. 11 — "when the table size is grown from 256 entries to 2^16 entries, the ciphertext size grows only about by 1.26 times in the bundled case"
[^24]: Section 6, p. 10 — "in a Bundled Query with d = 4 and 1 GBytes of data in a row, the processing time will be about 8 times slower than a Kushilevitz and Ostrovsky implementation"
[^25]: Section 3, p. 4-5 — "f(x) = SUM\_{y in [2^l]} (x = y) D\_y (mod 2), where the bitwise comparison (x = y) may be computed as PROD\_{i in [l]} (x\_i + y\_i + 1)"
