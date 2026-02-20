## XPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [XPIR: Private Information Retrieval for Everyone](https://eprint.iacr.org/2014/1025) (2016) |
| **Archetype** | Construction + System |
| **PIR Category** | Group A — FHE-based PIR |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | Ring-LWE (standard lattice assumption); IND-CPA from [28] |
| **Correctness model** | Deterministic (given correct parameter selection by the auto-optimizer) |
| **Rounds (online)** | 1 (non-interactive: client sends query, server returns reply) |
| **Record-size regime** | Large (>=10 Mbit elements in throughput benchmarks); parameterized |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Brakerski-Vaikuntanathan Ring-LWE HE scheme [28]; Stern's cPIR formulation [33]; Lipmaa's recursive PIR [34]; Aguilar et al. broken cPIR scheme [7] (reuses the protocol structure, replaces the cryptosystem) |
| **What changed** | Replaced number-theoretic (Paillier/RSA-based) cPIR cryptosystems with a Ring-LWE-based additively homomorphic encryption scheme, achieving multi-gigabit/s processing throughput on a commodity CPU. Added an auto-optimizer that selects cryptographic and PIR parameters jointly. |
| **Superseded by** | SealPIR [Group A] introduced query compression via oblivious expansion, which XPIR lacks. XPIR's NTTTools library and optimization ideas influenced later work. |
| **Concurrent work** | Doroz, Sunar, Hammouri "Bandwidth Efficient PIR from NTRU" (ePrint 2014/232, WAHC'14) — NTRU-based, different authors and techniques. Community calls that paper "XPIR-2014." |

### Core Idea

Prior cPIR schemes based on number-theoretic assumptions (Paillier, RSA) process the database at ~1 Mbit/s, making trivial full-database download faster in almost all settings.[^1] XPIR replaces the underlying cryptosystem with a Ring-LWE-based additively homomorphic encryption scheme that achieves 5–20 Gbit/s server-side processing throughput on a commodity laptop, making cPIR faster than trivial download for databases with more than ~10 elements over a 100 Mbit/s connection.[^2] The system includes an auto-optimizer that jointly selects encryption parameters (N, q), PIR parameters (recursion depth d, aggregation alpha), and factors in upload/download bandwidth to minimize round-trip time or other user-defined cost functions.[^3]

### System Context

- **Application:** General-purpose cPIR library with four evaluated use-cases: Netflix-like private video streaming (static DB), IPTV (dynamic DB), Match.com-like private keyword search (static DB), NYSE stock market private data retrieval (dynamic DB).[^4]
- **Key constraint driving PIR design:** Total round-trip time (query generation + upload + server processing + download + decryption) must beat trivial full-database download for the given network setting.[^5]
- **System architecture:** Single server (MSI GT60 laptop, Core i7-3630QM, 8 GB DDR3 RAM) with client on the same or remote machine. Network simulated at ADSL (1 Mbps up / 20 Mbps down) and FTTH (100 Mbps symmetric).[^6]
- **Where PIR fits:** The XPIR library is the complete system — it includes the Ring-LWE cryptosystem, the PIR protocol, and the auto-optimizer as a single GPLv3 package.[^7]

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Ring-LWE over R_q = Z_q[X] / <X^N + 1>, based on the analysis of [28] (Brakerski-Vaikuntanathan). Indistinguishability reduces to the standard Ring-LWE lattice problem.[^8] |
| **Encryption/encoding scheme(s)** | Symmetric Ring-LWE encryption scheme (SKE) with derived public-key variant. Additively homomorphic: supports Sum (ciphertext addition) and Absorb (plaintext-ciphertext multiplication). No ciphertext-ciphertext multiplication — strictly additive HE, not FHE.[^9] |
| **Ring / Field** | R_q = Z_q[X] / <X^N + 1> with N in {1024, 2048, 4096} and q a product of 60-bit or 30-bit primes congruent to 1 mod 2N (for NTT compatibility). Polynomials stored in NTT-CRT representation.[^10] |
| **Key structure** | Secret key s sampled from chi (error distribution) over R_q. Public key pk = (pk1, pk2) derived via SKE.Encrypt(s, 0). Randomness from Salsa20/20 CSPRNG (up to 256-bit security).[^11] |
| **Correctness condition** | Decryption recovers m = e mod t where e = b - a*s. Correct if accumulated noise stays below the plaintext modulus t. Maximum number of additions h_a is a parameter to ParamGen.[^12] |

### Key Data Structures

- **Database:** n elements of l bits each, optionally reshaped into a d-dimensional hypercube of side length ceil(n^{1/d}) via recursion.[^13]
- **Query:** d vectors of ceil(n^{1/d}) ciphertexts each (one per recursion dimension). Each ciphertext encrypts 0 except at the target index position, which encrypts 1.[^14]
- **Reply:** A vector of ceil(l / l_0) ciphertexts, where l_0 is the absorbable plaintext bits per ciphertext.[^15]
- **NTT-CRT representation:** All polynomials (keys, query elements, database chunks) stored in Number-Theoretic Transform + Chinese Remainder Theorem form for O(N log N) polynomial multiplication instead of O(N^2).[^16]

### Database Encoding

- **Representation:** Flat array of n elements, each split into chunks of l_0 bits (plaintext capacity per ciphertext). With recursion (d > 1), reshaped into a d-dimensional array of side ceil(n^{1/d}).[^17]
- **Record addressing:** Multi-dimensional index decomposition (i_1, ..., i_d) in base ceil(n^{1/d}).[^18]
- **Preprocessing required:** For static databases, elements are pre-imported into NTT-CRT form at 5 Gbit/s (laptop) to 10 Gbit/s (high-end server). This is the main bottleneck for the preprocessing phase.[^19]
- **Aggregation:** Groups of alpha elements can be aggregated into a single "super-element" of size l * alpha, reducing n to ceil(n/alpha) at the cost of increased reply size.[^20]

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Performance Cache** | Client + Server | Both sides benchmark encryption/decryption throughput and reply generation throughput for all candidate parameter sets | -- | Once at startup |
| **Optimization** | Client | Auto-optimizer selects best (N, q, d, alpha, EncParams) given database shape (n, l), bandwidth (U, D), and target function f_target | -- | Once per database shape / network change |
| **DB Import (static)** | Server | Convert database elements to NTT-CRT form | -- | Once (pre-processing); 5 Gbit/s on laptop[^19] |
| **Choice** | Client + Server | Server sends catalog; client picks index i | Catalog metadata | Per query |
| **Query Gen** | Client | Generate d selection vectors of ceil(n^{1/d}) ciphertexts each; encrypt 1 at target, 0 elsewhere | d * ceil(n^{1/d}) * ciphertext_size (up) | Per query |
| **Reply Gen** | Server | For each recursion dimension j in [1..d]: absorb database chunks with query ciphertexts, sum results. Produces a single reply vector. | -- (server-side) | Per query |
| **Reply Send** | Server | Send reply vector R = (R_1, ..., R_{ceil(l/l_0)}) | ceil(l/l_0) * ciphertext_size (down) | Per query |
| **Reply Extract** | Client | Decrypt d encryption layers; recover element at index i | -- | Per query |

### Auto-Optimization Algorithm

The auto-optimizer is XPIR's signature engineering contribution. It runs on the client after receiving the database shape (n, l) and network bandwidth (U, D) from the server.[^3]

**Inputs:**
- Recursion range (d_1, d_2): range of dimension values to try
- Aggregation range (alpha_1, alpha_2): range of aggregation values
- Encryption parameter list EncParams: all candidate (N, q) pairs
- Upload/download bandwidth (U, D)
- Target optimization function f_target (default: minimize RTT)

**Search procedure:**
1. Server sends database shape (n, l) and its performance cache to client.
2. Client runs a bandwidth test if U or D are unknown.
3. For every encryption scheme parameters in EncParams:
   - For every dimension d between d_1 and d_2:
     - For every aggregation value alpha between alpha_1 and alpha_2:
       - Estimate queryGenerationTime from client performance cache
       - Estimate querySendingTime from upload bandwidth U
       - Estimate replyGenerationTime from server performance cache
       - Estimate replySendingTime from download bandwidth D
       - Estimate replyDecryptionTime from client performance cache
       - Compute performance measure via f_target on these five values
4. Output the parameter set with the best performance measure.[^21]

**Default target function:** f_target = MAX(queryGenTime, querySendTime) + MAX(replyGenTime, replySendTime, replyDecryptTime). This models the pipelining: query generation and sending overlap; reply generation, sending, and decryption overlap.[^22]

**Other target functions:** minimum total resources, cloud cost (dollar value per CPU-ms and per bit transmitted).[^22]

**Convexity optimization:** When alpha_1 = 1 and alpha_2 = n (large range), the optimizer uses a dichotomy (binary search) on alpha, exploiting the empirical convexity of the target function: as alpha grows, query size shrinks but reply size grows.[^23]

**Runtime:** The optimizer runs in a few milliseconds for any database configuration.[^23]

### Encryption Parameter Sets

| Parameters (N, q bits) | Max h_a (sums) | Plaintext capacity | Ciphertext size | Expansion factor F | Security (bits) |
|------------------------|----------------|-------------------|-----------------|--------------------|-----------------|
| (1024, 60) | 97 | <= 20 Kbits | 128 Kbits | >= 6.4 | 97 |
| (2048, 120) | 91 | <= 100 Kbits | 512 Kbits | >= 5.12 | 91 |
| (4096, 120) | 335 | <= 192 Kbits | 1 Mbit | >= 5.3 | 256 (capped by Salsa20/20) |

[^24]

**Security notes:** For constant modulus q, security increases exponentially with polynomial degree N while computational cost increases only (almost) linearly. Upgrading from (2048, 120) to (4096, 120) roughly doubles cost but increases theoretical security to 335 bits (capped at 256 by the PRNG).[^25]

### NTTTools Library

XPIR's custom polynomial arithmetic library (NTTTools) is a key engineering contribution, built without external dependencies (no NTL, no GMP except for decryption lifting coefficients).[^26]

#### NTT-CRT Representation

- **NTT (Number-Theoretic Transform):** FFT analog over finite fields for polynomial multiplication in O(N log N). Uses Harvey's NTT algorithm, restricted to power-of-two polynomial degrees.[^27]
- **CRT (Chinese Remainder Theorem):** Represents large modulus q as a product of small primes, enabling native 64-bit arithmetic. Multiplication cost is linear in log(q) (number of CRT components).[^28]
- **Combined NTT-CRT:** All polynomials stored in evaluation-domain, coordinate-wise representation. Encryption requires only 3 NTT-CRT transforms plus basic operations. Decryption requires inverse NTT plus CRT lifting.[^29]

#### Pre-computed Newton Coefficients

A novel optimization for modular multiplication when one operand (the query element) is reused many times.[^30]

- **Problem:** Multiplying two 60-bit integers modulo a 60-bit prime requires 64x64->128-bit multiplication followed by costly integer division.
- **Solution:** Pre-compute y' = floor(y * 2^64 / p) for the reused operand y. Then: q = x*y' / 2^64; r = x*y - q*p mod 2^64; if r > p: r = r - p.
- **Cost:** Two integer multiplications + one conditional subtraction (replacing the costly division).
- **Impact:** In the PIR reply generation, the query elements are the reused multipliers. Pre-computation is amortized across all database element absorptions.[^30]

#### Performance Comparison: NTTTools vs Double-CRT (HElib)

**Pre-processing (NTT transforms):**[^31]

| Parameters | NTTTools | Double-CRT |
|------------|----------|------------|
| (1024, 60\|\|44) | 16 us | 178 us |
| (2048, 120\|\|132) | 78 us | 1100 us |

**Processing (multiply and add):**[^31]

| Parameters | NTTTools | Double-CRT |
|------------|----------|------------|
| (1024, 60\|\|44) | 2.3 us | 5 us |
| (2048, 120\|\|132) | 9.6 us | 27 us |

**Multiplication (single polynomial mult):**[^32]

| Parameters | NTTTools | Double-CRT |
|------------|----------|------------|
| (1024, 60\|\|44) | 1.8 us | 3.4 us |
| (2048, 120\|\|132) | 7.3 us | 20.2 us |

NTTTools is 2-3x faster for processing and ~10x faster for pre-processing, mainly due to Harvey's NTT and the restriction to power-of-two degrees.[^31]

**Memory:** NTTTools uses 8 KB per polynomial (degree 1024, 60-bit coefficients) by default, plus 2x with pre-computed quotients. Double-CRT uses ~40 KB per object for large amounts.[^33]

### PIR Pre-processing and Reply Generation Throughput

| Parameters | (1024, 60) | (2048, 120) | (4096, 120) |
|------------|-----------|-------------|-------------|
| Input size (per poly) | 20 Kbits | 100 Kbits | 192 Kbits |
| Pre-processing (per poly) | 4.2 us | 19 us | 38 us |
| Pre-processing (PIR throughput) | 4.8 Gbps | 5.2 Gbps | 5 Gbps |
| Processing (per poly) | 0.57 us | 2.3 us | 4.8 us |
| Processing (PIR throughput) | 18 Gbps | 22 Gbps | 20 Gbps |

[^34] Tests on MSI GT60 laptop, Core i7-3630QM 2.67 GHz, using all cores with OpenMP.

**Implication:** After NTT-CRT import, the database is processed at roughly 20 Gbit/s during reply generation. The bottleneck is importing data into NTT-CRT form (~5 Gbit/s). For dynamic databases where import cannot be done ahead of time, processing is limited by the import phase to ~5 Gbit/s.[^35]

### Encryption and Decryption Performance

For polynomial degree 4096 and varying modulus size (Figure 5):[^36]

| Modulus bitsize | Encryption (us, approx) | Decryption (us, approx) |
|-----------------|------------------------|------------------------|
| 60 | ~230 | ~100 |
| 120 | ~500 | ~500 |
| 180 | ~800 | ~1500 |
| 240 | ~1100 | ~2100 |

- Encryption cost scales linearly in modulus size (and ciphertext size).
- Decryption cost jumps above 60 bits due to CRT lifting requiring GMP multi-precision arithmetic.
- At 60-bit modulus: query generation at 700 Mbit/s, decryption at 5 Gbit/s.
- At 120-bit modulus: query generation at 850 Mbit/s, decryption at 710 Mbit/s (CRT lifting bottleneck).[^36]

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(d * n^{1/d} * F * l_0) where F = expansion factor | d=1: n * 128 Kbit (1024,60) or n * 512 Kbit (2048,120); d=2: 2*sqrt(n) * ciphertext_size | Online |
| Response size | O(F^d * l) | F^d * l where F ~= 5-6 | Online |
| Server computation | O(n * l) — linear scan of entire database | 18-22 Gbit/s throughput (pre-processed static); ~5 Gbit/s (dynamic) [^34] | Online |
| Client computation (query gen) | O(d * n^{1/d}) encryptions | 700–850 Mbit/s [^36] | Online |
| Client computation (decryption) | O(d * l / l_0) decryptions | 710 Mbit/s – 5 Gbit/s depending on modulus [^36] | Online |
| Throughput (user-perceived) | Depends on n, d, bandwidth | ~15/n Gbit/s for d=1 (approximate, from Figure 6) [^37] | Online |

#### FHE-specific metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Expansion factor (F) | >= q/t | 5.12 – 6.4 depending on parameters [^24] | -- |
| Multiplicative depth | 0 (additive-only HE; no ciphertext-ciphertext multiplication) | 0 | -- |
| Recursion depth d | 1 or 2 (chosen by optimizer) | d=1 best for throughput; d=2 best for latency with n >= 1000 [^37] | -- |

### Performance Benchmarks

#### Hardware

- **Server:** MSI GT60 laptop, Core i7-3630QM 2.67 GHz (mobile), 8 GB DDR3 RAM. Single-core for NTTTools microbenchmarks (Figure 3, 4). All cores (4C/8T) with OpenMP for PIR throughput (Figure 2).[^34][^31]
- **Storage:** OCZ Vertex 460 SSD (4 Gbit/s contiguous read) for databases exceeding RAM.[^38]
- **Alternative server:** 10-core Xeon E7-4870 roughly doubles throughput and caps at RAM bandwidth.[^39]

#### Static Database Throughput (Figure 6, log-scale, approximate)

User-perceived throughput of streaming data on FTTH (100 Mbit/s), database files >= 10 Mbit:[^37]

| n (files in DB) | d=1, 91-bit sec (Gbit/s, approx) | d=2, 91-bit sec (Gbit/s, approx) | d=1, 256-bit sec (Gbit/s, approx) | Trivial FTTH PIR (Gbit/s) |
|-----------------|-----------------------------------|-----------------------------------|-------------------------------------|--------------------------|
| 10 | ~1.5 | ~0.3 | ~1.3 | 0.1 |
| 100 | ~0.15 | ~0.08 | ~0.13 | 0.1 |
| 1,000 | ~0.015 | ~0.015 | ~0.013 | 0.1 |
| 10,000 | ~0.0015 | ~0.005 | ~0.0013 | 0.1 |
| 100,000 | ~0.00015 | ~0.002 | ~0.00013 | 0.1 |

**Key observations:**
- Trivial PIR (full download at 100 Mbit/s FTTH) is 10-200x slower than cPIR for small n values (n <= ~100); for larger n (n >= ~1000 in d=1), trivial PIR is actually faster.[^37]
- d=1 throughput follows ~15/n Gbit/s (straight line on log-log plot).[^37]
- d=2 with recursion: query size proportional to 2*sqrt(n), significant overhead for small n but superior for n >= ~1000.[^40]
- 256-bit security (4096,120) is only ~10% worse than 91-bit security (2048,120) due to doubled ciphertext capacity.[^25]

#### Static Database Latency (Figure 7, log-scale, approximate)

Initial latency before user starts receiving data, on FTTH:[^40]

| n (files in DB) | d=1 FTTH (s, approx) | d=2 FTTH (s, approx) |
|-----------------|---------------------|---------------------|
| 10 | ~0.03 | ~0.1 |
| 100 | ~0.3 | ~0.3 |
| 1,000 | ~3 | ~1 |
| 10,000 | ~30 | ~5 |
| 100,000 | ~300 | ~15 |

Latency grows linearly in n for d=1 and as sqrt(n) for d=2. Upload bandwidth is the main bottleneck.[^40]

#### Dynamic Database Throughput (Figure 8, log-scale, approximate)

Without pre-processing (IPTV-like setting), FTTH 100 Mbit/s:[^41]

- Throughput is roughly 6x lower than static (pre-processed) case.
- d=1 at n=100: ~25 Mbit/s (approximate). Sufficient for one 720p-30fps stream per 50 simultaneous clients.[^41]
- d=2 provides less benefit for dynamic data since the import bottleneck dominates.[^41]

#### Round-Trip Time (Figure 10, static data, log-scale, approximate)

RTT on FTTH, using (1024, 60) parameters, F ~= 6:[^42]

| n*l (DB size) | n=10,000 elements | Trivial FTTH PIR | Request Processing (RP) |
|---------------|-------------------|------------------|------------------------|
| 1 Mbit | ~0.05 s | ~0.00001 s | ~0.0001 s |
| 10 Mbit | ~0.05 s | ~0.0001 s | ~0.001 s |
| 100 Mbit | ~0.06 s | ~0.001 s | ~0.01 s |
| 1 Gbit | ~0.1 s | ~0.01 s | ~0.1 s |
| 10 Gbit | ~1 s | ~0.1 s | ~1 s |
| 100 Gbit | ~10 s | ~1 s | ~10 s |

Trivial PIR is faster only for databases with fewer than ~10 elements (where cPIR expansion factor dominates).[^42]

#### Concrete Worked Example (from text, exact)

n = 10,000 elements, l = 1 Mbit each, parameters (1024, 60), F ~= 6, FTTH, no recursion/aggregation:[^43]
- Query generation: 0.05 s (at 2.2 Gbit/s)
- Query sending: 12.8 s (10,000 * 128 Kbit over 100 Mbit/s upload)
- Reply processing: 0.1 s (at 10 Gbit/s)
- Reply sending: 0.06 s (6 * 1 Mbit over 100 Mbit/s download)
- Reply decryption: ~1 ms

**With d=2 recursion:** Query sending time divided by factor ~50 (from 10,000 ciphertexts to 200), with little impact on other times.[^43]

#### Netflix Use-Case (exact from text)

Database: 100,000 movies (static files, pre-processable with H.265/HEVC compression):[^44]
- **720p at 30fps** (400 Kbit/s needed): User can hide choice among **35,000 movies**.
- **1024p at 60fps** (2 Mbit/s needed): Hide choice among ~8,000 movies.

#### Sniffer Use-Case (exact from text)

Private packet sniffer filtering traffic by source IP:[^45]
- Parameters (1024, 60) for Class B network (65,535 addresses): query size 1 GByte.
- Parameters (2048, 120): query size 4 GBytes (stored on disk, not re-sent per packet).
- **Bimodal traffic distribution** (40% small, 40% MTU, 20% mid): sniffer processes link at **600 Mbit/s** (approximate, from Figure 9).[^46]
- **Buffered packets** filling a plaintext: sniffer processes link at roughly **3 Gbit/s** for parameters (2048, 120).[^47]

### Application Scenarios

- **Private video streaming (Netflix-like):** Static pre-processed database. User hides choice among 8K-35K movies depending on quality/framerate tradeoff. Multiple concurrent users are scalable: disk access is synchronous across users, so costs do not increase.[^48]
- **IPTV:** Dynamic database (cannot pre-process). Single processor handles 100 720p-30fps streams for 50 simultaneous clients, or 5000 streams of distant IP web cameras.[^41]
- **Private keyword search (Match.com):** Private criteria search over dating profiles. With public pre-filtering by city, latency drops from 10 minutes to 6-60 seconds for 5-keyword queries.[^49]
- **Private stock market data (NYSE):** Dynamic stream at 5-10 Gbit/s. Latency-oriented: client retrieves company information in ~100 ms, which is acceptable since the data is already 100 ms old.[^50]

### Comparison with Prior Work

| Metric | XPIR (Ring-LWE) | Paillier cPIR | Trivial PIR (full download) |
|--------|-----------------|---------------|---------------------------|
| DB processing throughput | 5–20 Gbit/s (laptop) [^34] | ~1 Mbit/s [^1] | N/A (bandwidth-limited) |
| Expansion factor F | 5.1–6.4 [^24] | Lower (~2-3) but much slower | 1.0 |
| Security basis | Ring-LWE (post-quantum) | Factoring (not post-quantum) | None needed |
| Best regime | n > ~10 elements, moderate bandwidth | Extremely low bandwidth only [^51] | Very high bandwidth (>20 Gbit/s) or n <= 4 [^52] |
| Query size scaling | O(d * n^{1/d}) ciphertexts | O(n) (no recursion standard) | 0 (just request index) |

**Key takeaway:** XPIR is the first cPIR system where server processing throughput (5-20 Gbit/s) exceeds typical network bandwidth, making cPIR faster than trivial download for nearly all practical database sizes. The auto-optimizer selects Ring-LWE cPIR in almost all settings; Paillier is chosen only for extremely low bandwidths; trivial download only when bandwidth exceeds ~20 Gbit/s.[^51]

### Portable Optimizations

- **Pre-computed Newton quotients for modular multiplication:** Replace costly integer division with pre-computed scaled approximation when one multiplicand is reused. Applicable to any NTT-based polynomial arithmetic where the same polynomial is multiplied against many others (universal for PIR reply generation).[^30]
- **NTT-CRT mixed representation:** Combine NTT (for polynomial multiplication) with CRT (for handling large moduli in native 64-bit words). Applicable to any Ring-LWE-based system.[^28]
- **Harvey's NTT algorithm:** Very fast NTT restricted to power-of-two polynomial degrees; applicable to any RLWE scheme with matching degree constraints.[^27]
- **Auto-optimization framework:** The joint parameter search over (encryption params, recursion depth, aggregation, bandwidth) is applicable to any PIR system with configurable parameters.[^3]

### Implementation Notes

- **Language / Library:** C++, custom NTTTools library. No external crypto dependencies (no NTL, no GMP except for CRT lifting in decryption). GPLv3 license.[^7]
- **Polynomial arithmetic:** NTT-based using Harvey's algorithm, restricted to power-of-two polynomial degrees. CRT for large moduli decomposed into 60-bit or 30-bit primes.[^27][^28]
- **CRT decomposition:** q is a product of 60-bit primes (or 30-bit for CRT lifting). Each prime is congruent to 1 mod 2N for NTT compatibility.[^10]
- **SIMD / vectorization:** Not explicitly mentioned. OpenMP for multi-threading across database chunks.[^34]
- **Parallelism:** Multi-threaded via OpenMP for PIR throughput benchmarks. Single-core for microbenchmarks.[^34][^31]
- **Network:** TCP sockets with simulated bandwidth constraints for ADSL/FTTH. Authors note TCP buffering/windowing overhead for very small latencies and suggest UDP for more linear behavior.[^53]
- **Randomness:** Salsa20/20 CSPRNG providing up to 256 bits of security.[^11]
- **Open source:** https://github.com/XPIR-team/XPIR [^7]

### Key Tradeoffs & Limitations

- **No query compression:** XPIR sends one ciphertext per database element per recursion dimension. Without recursion (d=1), query size is O(n). Recursion (d=2) reduces this to O(sqrt(n)) but increases reply expansion to F^2. SealPIR's later oblivious expansion technique dramatically improves this.[^14]
- **Additive-only HE:** The Ring-LWE scheme supports only Sum and Absorb (plaintext * ciphertext), not ciphertext * ciphertext multiplication. This prevents the multiplicative homomorphic operations used in later schemes (GSW external products, BFV SIMD). The advantage is zero multiplicative depth, keeping parameters small.[^9]
- **Expansion factor:** F >= 5.1 means at minimum 5x communication overhead for the reply. This is inherent to the Ring-LWE encryption scheme's ciphertext-to-plaintext ratio.[^24]
- **Memory for large databases:** Databases up to 10 Gbit fit in RAM. For larger databases (Netflix 100K movies), data is chunked through RAM with SSD backing, adding disk transfer time as a bottleneck.[^38]
- **Decryption bottleneck at large moduli:** For moduli > 60 bits, CRT lifting requires GMP multi-precision arithmetic, reducing decryption throughput from 5 Gbit/s to 710 Mbit/s at 120-bit modulus.[^36]
- **Dynamic database penalty:** Without pre-processing, throughput drops ~6x because NTT-CRT import must be done on-the-fly during reply generation.[^41]
- **Trivial PIR still wins for n <= ~4 elements** or when available bandwidth exceeds database processing throughput (~20 Gbit/s static, ~5 Gbit/s dynamic).[^52]

### Deployment Considerations

- **Database updates:** Static databases can be fully pre-processed. Dynamic databases must import data on-the-fly at ~5 Gbit/s. No incremental update mechanism — the entire database (or changed chunks) must be re-imported.[^35]
- **Sharding:** Not explicitly addressed, but the authors note that disk access is synchronous for concurrent users, so adding users does not increase per-query I/O cost.[^48]
- **Key rotation / query limits:** Not discussed. The encryption scheme generates fresh randomness per query via Salsa20/20.
- **Anonymous query support:** Yes — the scheme is stateless. No client-dependent preprocessing or persistent per-client state on the server.
- **Session model:** Ephemeral client. Each query is independent.
- **Cold start suitability:** Yes (no offline communication beyond catalog exchange), though the performance cache benchmark adds startup latency.
- **Multiple users:** Synchronous disk access means concurrent users share I/O cost. 12 users hiding choice among 8K movies at 720p-30fps use 8% of one processor.[^48]

### Open Problems (as stated or implied by the authors)

- Extending the auto-optimizer to multi-core and distributed server settings.[^54]
- Combining cPIR with replicated-database PIR for better security/performance tradeoffs (the Popcorn approach cited in [46]).[^55]
- Adapting XPIR for very small databases (n <= 10) where cPIR expansion factor dominates and trivial download is faster.[^52]
- Supporting ciphertext-ciphertext multiplication for richer homomorphic operations (addressed by later schemes using BFV/GSW).[^9]

### Uncertainties

- **"n" notation collision:** The paper uses uppercase N for polynomial degree and lowercase n for number of database elements. This is explicitly noted as "unusual notation" on p. 4.[^56] Throughout these notes, N = polynomial degree, n = number of database elements.
- **Chart-derived values:** All values extracted from Figures 6, 7, 8, 9, 10, 11 are approximate (log-scale charts). Values marked "approximate" throughout.
- **Security estimation methodology:** The paper uses the Lindner-Peikert approach [32] for parameter generation, which predates the modern Lattice Estimator. The 91-bit and 97-bit security levels for (2048,120) and (1024,60) may differ under modern estimation.[^57]
- **Paillier comparison details:** The Paillier-based cPIR comparison ("~1 Mbit/s") is attributed to Sion and Carbunar [1] (NDSS'07) and refers to number-theoretic cPIR with 1024-bit RSA modulus. Modern Paillier implementations may be faster, but the paper's main claim is about the orders-of-magnitude gap with Ring-LWE.[^1]
- **Multi-threading scope:** Figure 2 throughput values use all cores (OpenMP), but Figures 3 and 4 microbenchmarks are single-core. The throughput figures in Section 4 use all cores. The distinction is not always explicit.

---

### Footnotes

[^1]: p. 1, Abstract and Section 1 -- "Sion and Carbunar showed that cPIR schemes were not practical"; p. 2, Section 1.1 -- "a multiplication over a large modulus... restricts both the database size and the throughput."

[^2]: p. 1, Abstract -- "the paradigm shift introduced by lattice-based cryptography... cPIR is of practical value"; p. 13, Section 4 -- multi-gigabit processing throughput demonstrated.

[^3]: p. 7, Section 3.1 -- Protocol overview with optimization steps 1-5; pp. 23-24, Appendix A -- Full optimization algorithm pseudocode.

[^4]: pp. 12-19, Section 4 -- Four use-cases: Netflix (p. 15), IPTV (p. 15-16), Match.com (pp. 18-19), NYSE (p. 19).

[^5]: p. 2, Section 1.1, "Focused issue" -- "The main performance metric we use is the time needed for a client to retrieve an element privately."

[^6]: pp. 12-13, Section 4, "Experimental setting" -- MSI GT60 laptop, Core i7-3630QM 2.67 GHz, 8 GB DDR3. FTTH and ADSL simulated via timers.

[^7]: p. 1, NOTE box -- "XPIR is free (GPLv3) software and available at https://github.com/XPIR-team/XPIR."

[^8]: p. 5, Section 2.1 -- "Based on the analysis of [28], this scheme ensures indistinguishability if the standard lattice problem Ring-LWE is hard."

[^9]: pp. 4-5, Section 2.1 -- SKE scheme with Add (ciphertext addition) and Absorb (plaintext * ciphertext multiplication). No ciphertext-ciphertext multiply defined.

[^10]: p. 5, Section 2.1 -- R_q = Z_q[X] / <X^N + 1>; ParamGen forces N in {1024, 2048, 4096} and q to be a multiple of 60-bit or 30-bit primes congruent to 1 mod 2N.

[^11]: p. 13, Section 4, "Security" -- "To generate randomness for our scheme, we use Salsa20/20 (Salsa20/20 is able to provide up to 256 bits of security)."

[^12]: pp. 4-5, Section 2.1 -- SKE.ParamGen takes security parameter k and maximum additions h_a.

[^13]: p. 6, Section 2.2 -- Recursion: "an integer d called dimension... the client only needs to send d x n^{1/d} query elements."

[^14]: p. 6, Section 2.2, "Query Generation" -- "generate the i-th query element q_i as: A random encryption of zero if i != i_0; A random encryption of one if i = i_0."

[^15]: p. 6, Section 2.2, "Reply Generation" -- "For j from 1 to ceil(l/l_0): Compute R_j := Sum_{i=1}^n Absorb(m_{i,j}, q_i)."

[^16]: pp. 8-9, Section 3.2.1 -- "In XPIR we use a mixed NTT-CRT representation to reduce computational costs."

[^17]: p. 6, Section 2.2 -- "aggregate them by groups of size alpha and obtain a database with ceil(n/alpha) elements of size l x alpha."

[^18]: p. 24, Appendix A, "Query generation" -- "Define (i_1, ..., i_d) the decomposition in base ceil(n^{1/d}) of i."

[^19]: p. 9, Figure 2 -- Pre-processing throughput: 4.8 Gbit/s (1024,60), 5.2 Gbit/s (2048,120), 5 Gbit/s (4096,120).

[^20]: p. 6, Section 2.2 -- "To reduce query size it is possible to aggregate them by groups of size alpha."

[^21]: pp. 23-24, Appendix A -- "Optimization (Client and Server)" algorithm pseudocode.

[^22]: p. 8, Section 3.1 -- "the round-trip time of the retrieval... is given by the function MAX(queryGenerationTime, querySendingTime) + MAX(replyGenerationTime, replySendingTime, replyDecryptionTime)."

[^23]: p. 24, Appendix A, "Remark (convexity)" -- "the optimizer always returned very reasonable results and was able to run in a few milliseconds for any database."

[^24]: p. 5, Figure 1 -- Parameter sets table with N, q, max sums, plaintext, ciphertext, and F values.

[^25]: p. 13, Section 4, "Security" -- "security (in attacker operations) increases exponentially... computational costs increase only (almost) linearly"; (4096,120) theoretical security 335 bits, capped at 256.

[^26]: p. 9, Section 3.2.1, "Comparison with [40]" -- "we have built our library without using any external library (Double-CRT is built over NTL which in turn is built over GMP) which results in a big performance improvement."

[^27]: p. 9, Section 3.2.1 -- "we use Harvey's NTT algorithm [42] which is very fast but only works for some polynomial degrees (powers of two)."

[^28]: p. 8, Section 3.2.1 -- "The CRT representation ensures that the multiplication cost is also linear in log p, instead of quadratic for a trivial algorithm."

[^29]: p. 11, Section 3.2.3 -- "encryption requires only the computation of three NTT-CRT transformations and some basic operations."

[^30]: p. 10, Section 3.2.2 -- Pre-computing Newton coefficients algorithm: "q = xy'/2^64; r = xy - qp mod 2^64; if r > p: r = r - p." "This algorithm requires just two integer multiplications a shift and a conditional subtraction."

[^31]: p. 10, Figure 3 -- NTTTools vs Double-CRT pre-processing and processing times. "Tests are on a single-core."

[^32]: p. 11, Figure 4 -- Multiplication times for NTTTools vs Double-CRT.

[^33]: p. 10, Section 3.2.1 -- "the memory footprint in NTTTools is of 8 Kbytes by default and twice that with pre-computed quotients... Double-CRT objects memory usage increases linearly at 40Kbytes per object."

[^34]: p. 9, Figure 2 -- PIR pre-processing and processing throughput table.

[^35]: p. 9, Section 3.2.1, "Implications on cPIR performance" -- "After importation, the database is processed during the reply generation phase at roughly 20Gbits/s"; import at 5 Gbit/s.

[^36]: p. 11 (60-bit numbers), Figure 5 and text -- "We are able to generate a query at 700Mbits/s and decrypt an incoming reply at 5Gbits/s" (60-bit); p. 12 (120-bit numbers) -- "encryption scales well... it is possible to generate a query at 850Mbits/s, but decryption suffers... 710Mbits/s" (120-bit).

[^37]: p. 14, Figure 6 -- "User-perceived throughput of XPIR streaming static data." Log-log plot. "this line is pretty close to the straight line defined by 15/n Gbps."

[^38]: p. 15, Section 4, "Medium Access Issues" -- "OCZ Vertex 460 SSD (4Gbit/s access)"; databases up to 10 Gbits in RAM, larger chunked.

[^39]: p. 14, Figure 6 caption -- "Performance on a server with a better processor (e.g. ten-core Xeon E7-4870) roughly doubles and caps at that level as RAM bandwidth is saturated."

[^40]: p. 14, Figure 7 -- "Initial latency before the user starts to receive streaming data." "latency grows linearly in n in dimension 1 and in sqrt(n) in dimension 2, and that the main bottleneck is the available upload bandwidth."

[^41]: p. 16, Figure 8 and text -- "user-perceived throughput is roughly divided by six" vs static. "For an IPTV like application, a single processor can handle one hundred 720p-30fps streams for 50 simultaneous clients."

[^42]: p. 18, Figure 10 -- "Round-trip (RTT) and request processing (RP) times... Trivial PIR (from top to bottom the second filled line) is faster than cPIR for databases with less than ten elements."

[^43]: p. 18, text -- Worked example: n=10,000, l=1Mb, (1024,60), F~=6. "sending the query over the FTTH link takes 12.8 seconds... Using recursion divides query sending time by a factor 50."

[^44]: p. 15, Section 4.1, "The Netflix Use-case" -- "If the user is willing to receive a 720p-30fps video stream he can hide his choice among 35K movies."

[^45]: pp. 16-17, Section 4.2, "The Private Sniffer Use-Case" -- Query sizes for Class B network range.

[^46]: p. 17, Section 4.2 and Figure 9 -- "the sniffer is able process a link at 600Mbps (purple line)."

[^47]: p. 17, Section 4.2 -- "we can process a link at roughly 3Gbps (blue line), for parameters (2048,120)."

[^48]: p. 15, Section 4.1, "Multiple Users" -- "if data is accessed synchronously for concurrent users, disk access costs do not increase, so scalability is not an issue."

[^49]: pp. 18-19, Section 4.3, "Match.com Use-Case" -- "Using the public keyword pre-filtering... we can hope to divide the size of the database by a factor 10 to 100... which would lower the waiting time to 6-60 seconds."

[^50]: p. 19, Section 4.3, "NYSE Use-Case" -- "the user should get the information in roughly 100ms, which is a reasonable waiting time for information that is already 100ms old."

[^51]: p. 19, Section 4.4 -- "the Paillier based cPIR will be chosen for extremely small bandwidths"; "Ring-LWE based cPIR is chosen by the optimizer... in almost all situations."

[^52]: p. 19-20, Section 4.4 -- "trivial PIR will be the natural choice when available bandwidth is higher than our database processing throughput"; "for database with two to four elements."

[^53]: p. 14-15, text -- "The strange behaviour of the FTTH lines for a small number of elements comes from the fact that we use TCP sockets."

[^54]: p. 20, Section 5 -- "using a high end server in a multi-core setting can only increase this difference further."

[^55]: p. 15, Section 4.1 -- "Replacing it with XPIR would bring security and a x100 performance boost on the cPIR subroutine."

[^56]: p. 4, Section 2.1, "Notations" -- "we use uppercase N for the polynomial degree (which is an unusual notation) to distinguish the polynomial degree from the number of elements."

[^57]: p. 13, Section 4, "Security" -- Parameters generated "following the approach of [32]" (Lindner-Peikert, 2011).
