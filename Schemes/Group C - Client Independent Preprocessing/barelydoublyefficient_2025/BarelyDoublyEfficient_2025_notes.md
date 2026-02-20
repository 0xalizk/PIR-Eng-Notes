## Barely Doubly-Efficient SimplePIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | Barely Doubly-Efficient SimplePIR (Keewoo Lee, 2025) |
| **Archetype** | Construction (theory-only) / Feasibility |
| **PIR Category** | Group C — Client-Independent Preprocessing |
| **Security model** | Semi-honest single-server DEPIR in the CRS model (unkeyed); equivalently, keyed DEPIR with public preprocessing in the standard model |
| **Additional assumptions** | Plain LWE with polynomial modulus-to-noise ratio (Definition 2.4); CRS model |
| **Correctness model** | Statistical (overwhelming probability over Setup randomness) |
| **Rounds (online)** | 1 (non-interactive) |
| **Record-size regime** | Single-bit retrieval (DB in {0,1}^N) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SimplePIR (Henzinger et al., USENIX Security 2023, Group C); Williams' fast matrix-vector multiplication with preprocessing (SODA 2007); Brakerski-Vaikuntanathan SHE (BV11); Kedlaya-Umans fast modular composition (KU08) |
| **What changed** | SimplePIR requires O(N) server computation online (naive matrix-vector multiply). This work applies Williams' sub-quadratic matrix-vector multiplication preprocessing to the database matrix, reducing online server computation to O(N/log N) — achieving the first DEPIR from plain LWE. The CRS (matrix **A**) is treated identically to SimplePIR, but the database matrix is preprocessed via CRT decomposition + Williams' technique. Also, **H** = **D-hat** * **A** is now sent as part of the online answer rather than the offline hint.[^1] |
| **Superseded by** | N/A (as of May 2025, this is the state-of-the-art for plain-LWE-based DEPIR) |
| **Concurrent work** | CIMR25 (Chen-Ishai-Mour-Rosen): sk-DEPIR from the Learning Subspace with Noise (LSN) assumption, also achieving barely doubly-efficient O(N/log N) server computation[^2] |

### Core Idea

This paper presents the first construction of Doubly-Efficient Private Information Retrieval (DEPIR) from the plain LWE assumption. Prior to this work, the only known DEPIR construction was that of Lin-Mook-Wichs (LMW23, STOC 2023), which requires the Ring-LWE assumption. Whether DEPIR could be built from plain (unstructured) LWE — or indeed from any alternative foundation — was a major open problem.[^3]

The construction is conceptually simple: it instantiates the LMW23 template using SimplePIR (rather than the algebraic SHE approach of LMW23) and replaces Kedlaya-Umans fast polynomial evaluation with Williams' fast matrix-vector multiplication preprocessing.[^4] SimplePIR can be viewed as an instance of *algebraic linearly homomorphic encryption (ALHE)*, where homomorphic evaluation of a linear transformation on ciphertexts corresponds to a linear transformation over the ciphertexts themselves. This means the server's online work reduces to a single matrix-vector multiplication **D-hat** * **v**, which can be accelerated via Williams' preprocessing.

The resulting scheme is only *barely* doubly-efficient: the server's online computation is O(N / log N), a modest sublinear improvement over the Omega(N) lower bound for standard PIR. Nevertheless, it was previously unknown whether even this modest sublinear efficiency could be achieved from unstructured, plain LWE.[^5]

The CRS is essential for sublinear online computation. Without it, the server would need to compute **D-hat** * **A** online (where **A** is the LWE matrix with n = polylog(N) columns), which would nullify the O(log^2 N)-factor savings from Williams' preprocessing.[^6]

### Formal Definitions

#### Definition 2.1 — DEPIR (Unkeyed)

A DEPIR scheme consists of a tuple of probabilistic algorithms (Setup, Prep, Query, Answer, Extract):[^7]

- **pp <- Setup(1^λ, 1^N):** Takes security parameter λ and database size N; outputs public parameter pp. All subsequent algorithms take pp as implicit input.
- **DB-tilde <- Prep(DB):** Preprocessing algorithm. Takes a database DB in {0,1}^N and outputs a preprocessed database DB-tilde. Runs in poly(λ, N) time.
- **(q, st) <- Query(i):** Takes a query index i in [N] and outputs a query q along with a secret state st.
- **a <- Answer(DB-tilde, q):** Takes preprocessed database (stored in RAM) and a query q; outputs an answer a.
- **b <- Extract(st, a):** Takes secret state st and answer a; outputs a bit b in {0,1}.

**Correctness:** For any DB in {0,1}^N and any i in [N], the probability is overwhelming (over pp <- Setup) that Extract(st, a) = DB[i].

**Privacy:** For any i_0, i_1 in [N], no PPT adversary can distinguish between Query(i_0) and Query(i_1) with non-negligible advantage, for an overwhelming fraction of pp <- Setup.

**Efficiency:** Prep runs in poly(λ, N) time. Query, Answer, and Extract each run in o(N) * poly(λ) time — i.e., the online phase is sublinear in N.

#### Definition 2.2 — Keyed DEPIR

The keyed variant adds a KeyGen algorithm and provides the key k to Prep, Query, and Extract. Three privacy levels are defined:[^8]

- **sk-DEPIR:** Adversary gets only oracle access to Query(k, .).
- **pk-DEPIR:** Adversary is additionally given the key k.
- **Keyed DEPIR with public preprocessing:** Adversary is given both the key k and the randomness used in KeyGen.

**Equivalence (Remark 2.1):** An unkeyed DEPIR in the CRS model implies a keyed DEPIR with public preprocessing in the standard model (and vice versa), with the same online efficiency. The CRS simply becomes the key.[^9]

#### Relationship Hierarchy

Keyed DEPIR with public preprocessing => pk-DEPIR => sk-DEPIR. The construction in this paper achieves the strongest level (unkeyed DEPIR in CRS / keyed with public preprocessing).

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Plain LWE (Learning with Errors) over Z_q — no ring structure required |
| **Specific variant** | LWE with polynomial modulus-to-noise ratio (Definition 2.4): for any polynomial 1/alpha = poly(λ), parameters (n, m, q, chi) can be found in deterministic poly(λ, log(1/alpha)) time such that alpha * q > B and LWE_{n,m,q,chi} holds for any m = poly(λ)[^10] |
| **Parameters** | n = poly(λ, log(1/alpha)), q = poly(λ, 1/alpha), chi is B-bounded |
| **Trust model** | Common Random String (CRS) model: A <- Z_q^{m x n} sampled uniformly as public parameter; alternatively, standard model with keyed DEPIR |
| **Why plain LWE matters** | RLWE enjoys worst-case to average-case reduction to ideal lattice problems; plain LWE reduces to general lattice problems. Some community members express reservations about RLWE's long-term security due to its additional algebraic structure. Constructing DEPIR from plain LWE was an explicit open problem.[^11] |

### Key Data Structures

| Structure | Description | Size |
|-----------|-------------|------|
| **A** (CRS) | Uniformly random matrix in Z_q^{m x n}, serves as the LWE public parameter; shared across all clients and queries | O(m * n * log q) = Õ(sqrt(N)) * poly(λ) |
| **D** | Database reshaped as a matrix in Z_p^{m x m}, where m^2 * floor(log p) >= N. Each entry DB[i] maps to the k-hat-th bit of D[i-hat, j-hat] via i = i-hat + j-hat * m + k-hat * m^2 | m x m matrix over Z_p |
| **D-hat** | Natural lifting of D to Z^{m x m} (interpreting Z_p elements as {0, 1, ..., p-1} in Z); then preprocessed (mod q) via Lemma 3.1 for fast evaluation | m x m matrix, preprocessed |
| **H** | Hint matrix H = D-hat * A in Z_q^{m x n}; in SimplePIR this is sent offline to client; in DEPIR construction it is sent as part of the online answer | m x n matrix over Z_q |
| **v** (query) | LWE sample v = A * s + e + floor(q/p) * u_j-hat, where s <- Z_q^n, e <- chi^m | m-dimensional vector over Z_q |
| **st** (client state) | Tuple (s, i-hat, k-hat) — the LWE secret key and the decomposed index coordinates | O(n * log q + log N) bits |

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Trusted party / CRS | Sample A <- Z_q^{m x n}. Set parameters (m, p) so m^2 * floor(log p) >= N. Choose (n, q, chi) for LWE with modulus-to-noise ratio 1/alpha >= 2m * p^3.[^12] | A published as CRS | Once (global) |
| Prep | Server | (1) Reshape DB into D in Z_p^{m x m}, lift to D-hat in Z^{m x m}. (2) Preprocess D-hat (mod q) for fast matrix-vector multiplication via Lemma 3.1 (CRT decomposition into small primes + Williams preprocessing for each). (3) Compute H <- D-hat * A. (4) Output DB-tilde = (D-hat, H).[^13] | -- | Once per DB / on DB change |
| Query | Client | Decompose index i into (i-hat, j-hat, k-hat). Sample s <- Z_q^n, e <- chi^m. Compute v <- A * s + e + floor(q/p) * u_{j-hat}. Output q = v, st = (s, i-hat, k-hat).[^14] | |q| = m * log q bits upward | Per query |
| Answer | Server | Parse DB-tilde as (D-hat, H) and q as v. Evaluate w <- D-hat * v using preprocessed D-hat (Lemma 3.1). Output a = (w, H). | |a| = m * log q + m * n * log q bits downward | Per query |
| Extract | Client | Parse st as (s, i-hat, k-hat) and a as (w, H). Compute z <- w - H * s. Output the k-hat-th bit of round(p/q * z[i-hat]).[^15] | -- | Per query |

### SimplePIR as a Building Block (Section 2.4, Fig. 1)

The construction builds directly on SimplePIR. In SimplePIR, the server computes D-hat * v naively (O(m^2) time) and sends the hint H = D-hat * A to the client during an offline phase. The key observation enabling DEPIR is:[^16]

1. **D-hat * A is query-independent** — it can be precomputed once as part of Prep, not computed fresh per query.
2. **D-hat * v is a matrix-vector product with a fixed matrix** — after preprocessing D-hat via Williams' technique, each subsequent multiplication takes O(m^2 / log^2 m) time, which is sublinear in m^2 (hence sublinear in N).
3. **H is moved from offline hint to online answer** — the server includes H in the answer a = (w, H), eliminating the need for client-specific offline preprocessing.

### Williams' Fast Matrix-Vector Multiplication (Section 2.5)

**Theorem 2.1 (Williams, SODA 2007):** For any finite (semi-)ring R, any m x m matrix over R can be preprocessed in O(m^{2+epsilon} * |R|) time so that subsequent matrix-vector multiplications take O(m^2 / (epsilon * log m)^2) steps.[^17]

**Corollary 2.1:** Over Z_q, preprocessing takes O(m^{2+epsilon}) * polylog(q) time and evaluation takes O(m^2 / (epsilon * log m)^2) * Õ(log m + log q) + Õ(m) * polylog(q) time.

**Lemma 3.1 (CRT refinement):** The direct application of Williams' theorem over Z_q has evaluation time depending on log q, which is too large. The paper uses the Chinese Remainder Theorem to decompose the computation into small primes: reduce D-hat modulo each of t = O(log M) small primes q_i = O(log M) (where M = m * (q-1)^2), preprocess each reduced matrix independently via Corollary 2.1, then reconstruct via CRT. This yields:[^18]

- Preprocessing time: Õ(m^{2+epsilon}) * polylog(q)
- Evaluation time: O(m^2 / (epsilon * log m)^2) * Õ(log m + log q) + Õ(m) * polylog(q)

### Correctness Analysis

Correctness follows from SimplePIR's correctness analysis. The key computation is:

z = w - H * s = D-hat * v - D-hat * A * s = D-hat * (v - A * s) = D-hat * (e + floor(q/p) * u_{j-hat})

The i-hat-th entry of z is:

z[i-hat] = sum_j D-hat[i-hat, j] * e_j + floor(q/p) * D-hat[i-hat, j-hat]

Rounding recovers D[i-hat, j-hat] (mod p) provided the noise is bounded: the modulus-to-noise ratio condition 1/alpha >= 2m * p^3 ensures that the rounding error from the LWE noise term is small enough to correctly extract each bit.[^19]

The only modification from SimplePIR is that w is computed via Lemma 3.1 (fast preprocessed multiplication) rather than naive multiplication, which produces an identical result.

### Complexity

#### Main Theorem (Theorem 3.1)

Under the LWE with polynomial modulus-to-noise ratio assumption, for any 0 < epsilon < 1/2, there exists a DEPIR scheme in the CRS model achieving:[^20]

| Metric | Asymptotic | Concrete | Phase | Source |
|--------|-----------|----------|-------|--------|
| Preprocessing runtime | Õ(N^{1+epsilon}) * poly(λ) | N/A (no implementation) | Offline | Theorem 3.1 (author-stated) |
| Server's online runtime | O(N / (epsilon * log N)^2) * polyloglog(N) * poly(λ) | N/A (no implementation) | Online | Theorem 3.1 + footnote 4 (author-stated)[^21] |
| Client's online runtime | Õ(sqrt(N)) * poly(λ) | N/A (no implementation) | Online | Theorem 3.1 (author-stated) |
| Online communication | Õ(sqrt(N)) * poly(λ) | N/A (no implementation) | Online | Theorem 3.1 (author-stated) |
| CRS size | O(m * n * log q) = Õ(sqrt(N)) * poly(λ) | N/A (no implementation) | Setup | Corollary 3.1 proof (inferred) |

#### Derivation of Parameters

Setting m = ceil(sqrt(N / log N)) and p = 2^{ceil(log N)}, which implies 1/alpha = poly(N) = poly(λ) (since N = poly(λ)):[^22]

- **m** = Theta(sqrt(N / log N)) — the side length of the database matrix
- **n** = poly(λ, log(1/alpha)) = polylog(N) — the LWE dimension (number of columns of A)
- **q** = poly(λ, 1/alpha) = poly(N) — the LWE modulus
- **p** = poly(N) — the plaintext modulus (number of bits packed per matrix entry)

#### Detailed Efficiency Breakdown (from Section 3 analysis)

| Component | Runtime | Notes |
|-----------|---------|-------|
| Prep Step 2: Preprocess D-hat | Õ(m^{2+epsilon}) * polylog(q) | Williams + CRT (Lemma 3.1) |
| Prep Step 3: Compute H = D-hat * A | m^2 * n * polylog(q) | Textbook matrix multiplication; Õ(m^2) * poly(λ) |
| Overall Prep | Õ(N^{1+epsilon}) * poly(λ) | Dominated by Step 2 (author-estimated) |
| Answer Step 2: Fast D-hat * v | O(m^2/(epsilon * log m)^2) * Õ(log m + log q) + Õ(m) * polylog(q) | Lemma 3.1 evaluation |
| Answer: output H | O(m * n * log q) | Simply reading H; Õ(sqrt(N)) * poly(λ) |
| Overall Answer (server online) | O(N/(epsilon * log N)^2) * polyloglog(N) * poly(λ) | Dominated by fast multiplication (author-estimated) |
| Query Step 3: Compute A * s | m * n * polylog(q) | Matrix-vector product |
| Overall Query (client online) | Õ(sqrt(N)) * poly(λ) | Dominated by A * s (author-estimated) |
| Extract Steps 2-3 | O(m * n) + O(1) | H * s multiplication + rounding |
| Overall Extract (client online) | Õ(sqrt(N)) * poly(λ) | Dominated by H * s (author-estimated) |

#### Comparison: Sublinearity Factor

The server's online runtime is O(N / log^2 N) (ignoring polyloglog and poly(λ) factors). Compared to the Omega(N) lower bound for standard (non-preprocessed) PIR, the savings factor is only log^2 N — hence "barely" doubly-efficient.[^23]

No implementation. Analytical estimates: Server online computation is O(N / (epsilon * log N)^2) * polyloglog(N) * poly(λ), which for epsilon = 1/4 and ignoring lower-order terms gives roughly O(N / log^2 N) work. The preprocessing cost is Õ(N^{1+epsilon}) * poly(λ), which for epsilon = 1/4 is Õ(N^{5/4}). Communication is Õ(sqrt(N)) per query. All estimates are asymptotic with no concrete instantiation provided by the authors.

### Comparison with Prior Work

| Scheme | Assumption | Model | Server Online | Preprocessing | Communication | Privacy Level |
|--------|-----------|-------|---------------|---------------|---------------|---------------|
| **This work** | Plain LWE (poly mod-to-noise) | CRS | O(N/log^2 N) * polyloglog * poly(λ) | Õ(N^{1+epsilon}) * poly(λ) | Õ(sqrt(N)) * poly(λ) | Unkeyed DEPIR / pk-DEPIR / sk-DEPIR[^24] |
| LMW23 | Ring-LWE (quasi-poly approx factor) | Standard | polylog(N) * poly(λ) | poly(N, λ) | polylog(N) * poly(λ) | Unkeyed DEPIR |
| BIPW17, CHR17 | Ad hoc (secretly permuted Reed-Muller codes) | Standard | polylog(N) | poly(N) | polylog(N) | sk-DEPIR |
| CIMR25 | Learning Subspace with Noise (LSN) | Standard | O(N/log N) | poly(N) | -- | sk-DEPIR |
| DMZ23, OPPW24, OPPW25 | Ring-LWE | Standard | Optimizations of LMW23 | -- | -- | Unkeyed DEPIR |

#### Key Distinctions

1. **First from plain LWE:** All prior DEPIR or sk-DEPIR constructions with standard-assumption security require either Ring-LWE (LMW23 and its optimizations) or non-standard code-based assumptions (BIPW17, CHR17). This work is the first from plain LWE.[^25]
2. **Barely vs. fully doubly-efficient:** LMW23 achieves polylog(N) server online time. This work achieves only O(N/log^2 N) — a gap of N/polylog(N). The gain over standard PIR is modest (log^2 N factor).
3. **CRS model requirement:** The CRS (matrix A) is essential. Without it, the server would need to compute D-hat * A online, which costs O(m^2 * n) and nullifies the Williams speedup.[^26]
4. **Strongest privacy level for plain LWE:** Via Remark 2.1, the CRS-model construction implies keyed DEPIR with public preprocessing — stronger than both sk-DEPIR and pk-DEPIR.

### Key Tradeoffs & Limitations

1. **Barely sublinear server computation:** The O(N/log^2 N) online server cost is only a polylogarithmic improvement over O(N). For practical database sizes (say N = 2^30), log^2 N = 900, giving roughly a 900x speedup — meaningful but far from the polylog(N) achieved by Ring-LWE-based DEPIR.[^27]

2. **CRS model dependency:** The CRS A in Z_q^{m x n} must be available to both server and client before the protocol begins. In practice, this could be generated from a short seed via a PRF, but the paper does not explore this. The CRS size is Õ(sqrt(N)) * poly(λ), which is non-trivial.[^28]

3. **Large preprocessing cost:** Preprocessing time is Õ(N^{1+epsilon}), superlinear in the database size. For epsilon = 1/4, this is Õ(N^{5/4}). This must be repeated whenever the database changes.

4. **Large online communication:** Communication per query is Õ(sqrt(N)) * poly(λ), dominated by the server sending H = D-hat * A (an m x n matrix). This is much larger than the polylog(N) communication of LMW23.

5. **Single-bit retrieval:** The scheme retrieves individual bits from {0,1}^N. Retrieving larger records would require multiple queries or packing techniques not discussed in the paper.

6. **Polynomial modulus-to-noise ratio assumption:** While this is a standard variant of LWE, it requires 1/alpha = poly(N), meaning the noise rate alpha = 1/poly(N) is inverse-polynomial. This is weaker than the more common exponential modulus-to-noise ratio but still considered a standard assumption.

7. **No concrete parameter instantiation:** The paper provides no concrete parameter choices, making it impossible to estimate real-world performance. The poly(λ) and polylog factors hidden in asymptotic notation could be substantial.

### Open Problems (Section 4)

The paper identifies three open problems, framed as intermediate steps toward LWE-based DEPIR with O(N^{1-epsilon}) server computation:[^29]

1. **LWE-based (unkeyed) barely doubly-efficient PIR in the standard model** — i.e., O(N / log^c N) server computation for some constant c > 0, without the CRS model.

2. **LWE-based (unkeyed) DEPIR with O(N^{1-epsilon}) server computation** for some constant epsilon > 0, in the CRS model — or even using any black-box crypto not currently known to be constructible from LWE (citing LMW25, which shows black-box crypto is useless for DEPIR).

3. **LWE-based sk-DEPIR with O(N^{1-epsilon}) server computation** for some constant epsilon > 0 — even the weaker secret-key variant remains open for polynomial savings from plain LWE.

### Uncertainties

- **Tightness of poly(λ) factors:** The analysis hides potentially large polynomial factors in λ throughout (in preprocessing, communication, and server online time). Since n = poly(λ, log(1/alpha)) and q = poly(λ, 1/alpha), the concrete overhead from the security parameter could dominate for practical database sizes. No guidance is given on what λ values would be needed.

- **Practical feasibility of Williams' preprocessing:** Williams' fast matrix-vector multiplication (Theorem 2.1) is a theoretical result; its constant factors and practical efficiency are unknown. The technique involves nontrivial combinatorial preprocessing (rectangular matrix multiplication scheduling) that may have very large hidden constants, potentially making the O(N/log^2 N) bound worse than naive O(N) for any practically relevant N.

- **CRT decomposition overhead:** Lemma 3.1 introduces t = O(log M) = O(log(m * q^2)) CRT components. Each requires independent Williams preprocessing. The additive Õ(m) * polylog(q) term in the evaluation time could be significant for moderate m.

- **Comparison with CIMR25:** The concurrent work of Chen-Ishai-Mour-Rosen (CIMR25) achieves sk-DEPIR with O(N/log N) server computation from the Learning Subspace with Noise assumption. The paper notes LSN "can be viewed as a less structured variant of the earlier assumptions" (BIPW17, CHR17). The relative security of plain LWE vs. LSN is not fully resolved.

- **Database update model:** No discussion of how database updates interact with the Õ(N^{1+epsilon}) preprocessing. Any modification to DB requires full re-preprocessing, which is superlinear.

---

<a id="fn-1"></a>
[^1]: Section 1.2 — Technical Overview (p. 3): "Our construction resembles that of [LMW23], but instantiates it with SimplePIR [HHC+23] (Section 2.4) in place of [BV11], and employs matrix-vector multiplication preprocessing due to Williams [Wil07] (Section 2.5) instead of [KU08]."

<a id="fn-2"></a>
[^2]: Section on sk-DEPIR (p. 2): "More recent work [CIMR25] constructs sk-DEPIR from the Learning Subspace with Noise (LSN) assumption... the resulting scheme is only barely doubly-efficient, achieving server-side computation of O(N/log N)."

<a id="fn-3"></a>
[^3]: Section 1, Introduction (p. 1-2): "In particular, constructing DEPIR from plain LWE [Reg05] is still open... realizing DEPIR from alternative foundations remains an open problem."

<a id="fn-4"></a>
[^4]: Section 1.2 — Technical Overview (p. 3): "SimplePIR can be viewed as an instance of algebraic linearly homomorphic encryption (ALHE), analogous to ASHE, where the homomorphic evaluation of a linear transformation on given ciphertexts itself corresponds to some linear transformation over the ciphertexts."

<a id="fn-5"></a>
[^5]: Section 1.1 — Our Contribution (p. 2): "While our constructions are only barely doubly-efficient, with server computation of O(N/log^2 N) * polyloglog(N), it was previously unknown whether even such modest sublinear efficiency could be achieved from unstructured, plain LWE."

<a id="fn-6"></a>
[^6]: Section 1.2 — Role of the CRS (p. 3): "Without assuming CRS, the server would need to compute (D-hat * A, D-hat * v) from the LWE ciphertext (A, v)... As n = polylog(N), computing D-hat * A online would nullify the O(log^2 N)-factor savings afforded by [Wil07]."

<a id="fn-7"></a>
[^7]: Definition 2.1 — DEPIR (p. 4): formal syntax and correctness/privacy/efficiency definitions.

<a id="fn-8"></a>
[^8]: Definition 2.2 — Keyed DEPIR (p. 5): "We say that a keyed DEPIR scheme is an sk-DEPIR scheme if the adversary is given only oracle access to Query(k, .). If the adversary is also given the key k, the scheme is called a pk-DEPIR scheme."

<a id="fn-9"></a>
[^9]: Remark 2.1 (p. 6): "An unkeyed DEPIR scheme in the CRS model implies a keyed DEPIR scheme with public preprocessing in the standard model, and vice versa, with both having the same online efficiency."

<a id="fn-10"></a>
[^10]: Definition 2.4 — LWE with polynomial modulus-to-noise ratio (p. 6): "For any security parameter λ and any polynomial modulus-to-noise ratio 1/alpha = poly(λ), one can, in deterministic poly(λ, log(1/alpha)) time, find parameters n, q, chi..."

<a id="fn-11"></a>
[^11]: Footnote 1 (p. 2): "While RLWE enjoys an average-case to worst-case reduction due to [LPR10], the reduction is to lattice problems over ideal lattices... whereas plain LWE reduces to problems over general lattices."

<a id="fn-12"></a>
[^12]: Fig. 1 — SimplePIR Setup (p. 8): "Set (m, p) so that m^2 * floor(log p) >= N. Choose parameters (n, q, chi) such that LWE_{n,m,q,chi} holds, and the modulus-to-noise ratio 1/alpha is at least 2m * p^3."

<a id="fn-13"></a>
[^13]: Fig. 2 — LWE-based DEPIR Prep (p. 10): "1. Reshape DB... 2. Preprocess D-hat (mod q) into D-tilde using Lemma 3.1. 3. Compute H <- D-hat * A. 4. Output DB-tilde = (D-tilde, H)."

<a id="fn-14"></a>
[^14]: Fig. 1 — SimplePIR Query (p. 8): "Compute v <- A * s + e + floor(q/p) * u_{j-hat}, where u_j denotes the unit vector with a one in the j-hat-th position."

<a id="fn-15"></a>
[^15]: Fig. 2 — Extract (p. 10): "Compute z <- w - H * s. Output the k-hat-th bit of round(p/q * z-tilde[i-hat]) as b."

<a id="fn-16"></a>
[^16]: Section 2.4 (p. 7): "The simple yet powerful idea behind SimplePIR is to observe that D-hat * A is independent of the query index, allowing A to be fixed as a CRS and shared across all queries."

<a id="fn-17"></a>
[^17]: Theorem 2.1 (p. 7): Williams [Wil07] — "every m x m matrix over R can be processed in O(m^{2+epsilon*log|R|}) time such that every subsequent matrix-vector multiplication can be performed in O(m^2 / (epsilon * log m)^2) steps."

<a id="fn-18"></a>
[^18]: Appendix A — Proof of Lemma 3.1 (p. 14-15): "Set M := m * (q-1)^2... we can reconstruct A * v in Z_q^m from A-hat * v-hat (mod q_i) for all i in [t], as long as the product of distinct primes satisfies prod q_i > M."

<a id="fn-19"></a>
[^19]: Section 2.4 — Analysis (p. 7): "Correctness, defined similarly to Definition 2.1, holds as long as the modulus-to-noise ratio satisfies 1/alpha >= 2m * p^3."

<a id="fn-20"></a>
[^20]: Theorem 3.1 (p. 10-11): "Under the LWE with polynomial modulus-to-noise ratio assumption, there exists a DEPIR scheme in the CRS model achieving the following efficiency for any 0 < epsilon < 1/2."

<a id="fn-21"></a>
[^21]: Theorem 3.1 + footnote 4 (p. 11): "Server's Online Runtime: O(N/(epsilon * log N)^2) * polyloglog(N) * poly(λ)." Footnote 4: "More precisely, O(N/(epsilon * log N)^2) * polyloglog(N) * Õ(log λ) + Õ(sqrt(N)) * poly(λ)."

<a id="fn-22"></a>
[^22]: Section 3, below Fig. 2 (p. 10): "If we set m = ceil(sqrt(N / log N)) and p = 2^{ceil(log N)}, which implies 1/alpha = poly(N), we obtain the following theorem."

<a id="fn-23"></a>
[^23]: Section 1.1 (p. 2): The term "barely doubly-efficient" reflects that the sublinearity factor is only polylogarithmic, contrasting with the polynomial savings (polylog(N) total) of LMW23.

<a id="fn-24"></a>
[^24]: Corollary 3.1 (p. 11): "Under the LWE with polynomial modulus-to-noise ratio assumption, there exists a keyed DEPIR scheme with public preprocessing in the standard model, achieving the same efficiency stated in Theorem 3.1."

<a id="fn-25"></a>
[^25]: Section 1 (p. 2): "This remains essentially the only known construction to date, and realizing DEPIR from alternative foundations, particularly from plain LWE, has remained elusive."

<a id="fn-26"></a>
[^26]: Section 1.2 — Role of the CRS (p. 3): "As n = polylog(N), computing D-hat * A online would nullify the O(log^2 N)-factor savings afforded by [Wil07]. Therefore, we follow SimplePIR and treat A as a CRS."

<a id="fn-27"></a>
[^27]: This is inferred from the asymptotic expressions. For N = 2^30, log_2 N = 30, so log^2 N is approximately 900 (in natural log: ln(2^30) is approximately 20.8, so ln^2 N is approximately 433). The actual constant depends on the base of the logarithm in Williams' theorem.

<a id="fn-28"></a>
[^28]: Corollary 3.1 proof (p. 11): "the size of the CRS, A in Z_q^{m x n}, is O(m * n * log q) = Õ(sqrt(N)) * poly(λ)."

<a id="fn-29"></a>
[^29]: Section 4 — Open Problems (p. 11): "A significant milestone would be the construction of LWE-based (unkeyed) DEPIR scheme in the standard model with server-side computation of O(N^{1-epsilon}) for some constant epsilon > 0, ideally polylog(N)."
