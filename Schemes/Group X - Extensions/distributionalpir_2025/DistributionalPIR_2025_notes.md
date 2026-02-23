## Distributional PIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Distributional Private Information Retrieval](https://eprint.iacr.org/2025/132) (2025) |
| **Archetype** | Model/definition + Construction + Compiler/framework |
| **PIR Category** | Group X — Extensions |
| **Security model** | Single-server CPIR (identical to standard PIR; computational or information-theoretic) |
| **Additional assumptions** | Underlying batch-PIR scheme's assumptions (e.g., LWE/RingLWE when instantiated with SimplePIR) |
| **Correctness model** | Relaxed/probabilistic — three notions: explicit, worst-case, and average-case correctness |
| **Rounds (online)** | Inherits from underlying PIR scheme (1 round when using SimplePIR) |
| **Record-size regime** | General (evaluated with 560-byte tweets in CrowdSurf) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SimplePIR (Henzinger et al., 2023, Group A); Respire (Burton et al., 2024); batch-PIR via batch codes (Ishai et al., 2004); YPIR (Menon & Wu, 2024) |
| **What changed** | Prior PIR schemes treat all database records uniformly, hitting the Omega(N) server-time lower bound. Distributional PIR introduces a new model that takes a popularity distribution P over records as input, relaxes correctness to probabilistic guarantees, and routes queries to a small "popular" sub-database with high probability — breaking the linear barrier in expected time for skewed distributions.&#8201;[^1] |
| **Superseded by** | N/A (first paper to define this model, as of 2025) |
| **Concurrent work** | Lam et al. (2023) explore "hot indices" in the two-server setting with a stronger correctness notion but no implementation.&#8201;[^2] Gomez-Leos & Heidarzadeh (2022) study side information in the information-theoretic PIR setting, focusing on communication rather than computation.&#8201;[^3] |

### Core Idea

Distributional PIR exploits the fact that real-world database access patterns are heavily skewed: a small fraction of records account for the vast majority of queries (e.g., the top 1% of Twitter accounts have the vast majority of followers&#8201;[^4]). The construction copies the k most-popular database entries into a separate small "popular" database. When a client queries, the scheme probabilistically routes the query to either the popular database (fast) or the full database (slow), with the routing decision independent of the requested index — preserving standard PIR security.&#8201;[^5] Concretely, with probability kappa_worst the client and server run an errorless batch-PIR over all N records, and with probability (1 - kappa_worst) they run a fast-but-errorful PIR scheme over only the top k = cdf_P^{-1}((kappa_avg - kappa_worst)/(1 - kappa_worst)) most popular records.&#8201;[^6] For a power-law distribution (alpha > 1), the expected server runtime converges to a constant independent of N as N grows large.&#8201;[^7]

The paper also contributes a new RingLWE-based encryption optimization for SimplePIR that reduces client encryption time by 128-349x and server preprocessing by 116-351x via modulus switching, plus GPU offloading for server-side matrix-vector products.&#8201;[^8]

### Formal Definitions

#### Model Name

**Distributional PIR** — a generalization of batch-PIR parameterized by a popularity distribution P over database indices {1, ..., N}.&#8201;[^9]

#### Syntax

A distributional-PIR scheme on a database of N items with distribution P, message space M, and batch size B consists of five routines:&#8201;[^10]

| Routine | Signature | Role |
|---------|-----------|------|
| Dist.Setup | (P) -> pp | Compute public parameters from the popularity distribution |
| Dist.Encode | (pp, P, D) -> D_code | Encode the database given distribution and public parameters |
| Dist.Query | (pp, I) -> (st, q) | Client generates query for index list I in [N]^B |
| Dist.Answer | D_code(q) -> a | Server answers query with oracle access to encoded database |
| Dist.Recover | (st, a) -> (M union {bottom})^B | Client recovers B items, each a record or failure symbol bottom |

Setting P to be arbitrary (uniform) recovers the syntax of a standard batch-PIR scheme.&#8201;[^11]

#### Security Notion

Identical to standard PIR: after answering a query, the server learns no information about which record the user was fetching — whether or not the user's query pattern follows P.&#8201;[^12] Formally, for all database indices i, j, the server's view of a client querying for i and j must be indistinguishable (Definition A.1.1, Experiment A.1). A distributional-PIR scheme is delta-secure iff DistAdv[A, Pi] <= delta for all adversaries A.&#8201;[^13]

Critical security requirement: the client's decision to query the popular vs. full database must be **independent** of the record it wants to fetch. The routing coin is a Bernoulli(kappa_worst) draw, not conditioned on the index.&#8201;[^14]

#### Correctness Notions

Three progressively weaker correctness guarantees:&#8201;[^15]

| Notion | Definition | Relationship |
|--------|-----------|--------------|
| **Explicit correctness (kappa_exp)** | For any index, the client recovers its desired record or a detectable failure symbol bottom with probability >= kappa_exp | Strongest; client *knows* when retrieval failed |
| **Worst-case correctness (kappa_worst)** | For any index, client recovers its desired record with probability >= kappa_worst | Client may receive wrong record without detecting it |
| **Average-case correctness (kappa_avg)** | When indices are sampled i.i.d. from P, client recovers a kappa_avg fraction of desired records in expectation | Only meaningful relative to P |

Always: kappa_worst <= kappa_avg <= kappa_exp.&#8201;[^16]

#### Efficiency Metrics

Two main cost metrics, both in expectation over the distribution P:&#8201;[^17]

- **Expected server time T**: Dist.Answer makes at most T probes to D_code in expectation
- **Expected communication cost C**: total size of pp, q, and a is at most C in expectation

#### Relationship to Standard PIR

Every standard PIR scheme with correctness kappa is a distributional-PIR scheme where all three correctness parameters equal kappa.&#8201;[^18] The power of distributional PIR is that, depending on P, distributional schemes can have the same average-case correctness with significantly reduced server-side cost.

### Compiler Interface

The distributional-PIR construction is a **generic compiler** that lifts any standard batch-PIR scheme into a distributional-PIR scheme.&#8201;[^19]

| Field | Detail |
|-------|--------|
| **Input** | Any delta-secure, errorless batch-PIR scheme Pi_batch with message space M, batch size B, server runtime Õ(K) on a database of size K, and communication cost C(K) |
| **Additional input** | Popularity distribution P over [N]; correctness parameters kappa_avg, kappa_worst in [0,1] |
| **Output** | A 2*delta-secure distributional-PIR scheme Pi with explicit correctness 1, average-case correctness kappa_avg, worst-case correctness kappa_worst |
| **Preserved properties** | Security (composable — delta_dist + delta_batch); batch-PIR interface; black-box use of underlying scheme |
| **Expected server runtime** | Õ(k * (1 - kappa_worst) + N * kappa_worst) where k = cdf_P^{-1}((kappa_avg - kappa_worst) / (1 - kappa_worst))&#8201;[^20] |
| **Expected communication** | k * log N + C(k) * (1 - kappa_worst) + C(N) * kappa_worst&#8201;[^21] |

#### Instantiations Evaluated

| Underlying PIR | Application | Database | Result |
|----------------|------------|----------|--------|
| SimplePIR [49] | Twitter feed (CrowdSurf) | 38 GB, 73M users, 560-byte tweets | 5-77x less server work, 4.8-9.7x less communication vs. no batching; 8x total cost reduction&#8201;[^22] |
| Respire [15] | Twitter feed | 1 GB subset | 6.7-12.8x more queries/sec, 2.3-117x less communication vs. no batching&#8201;[^23] |
| YPIR [79] | SCT auditing | 5 billion SCTs | 12x less server CPU, 3x less communication vs. PIR-based approaches&#8201;[^24] |

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | LWE or RingLWE (inherited from underlying PIR; RingLWE used in the Section 6 encryption optimization) |
| **Encryption scheme** | Linearly homomorphic encryption with preprocessing (SimplePIR-style); Section 6 introduces a hybrid RingLWE/LWE scheme using modulus switching&#8201;[^25] |
| **Ring / Field** | R_q = Z[x]/(x^n + 1) for RingLWE encryption (n = 2048 or 4096, q_1 prime > 2^32 or 2^64); modulus-switched to LWE ciphertext modulo q_2 in {2^32, 2^64}&#8201;[^26] |
| **Key structure** | Standard LWE/RingLWE secret key; SimplePIR hint matrix D (preprocessed database) |
| **Modulus switching** | Client encrypts under RingLWE with prime modulus q_1, reinterprets the RingLWE ciphertext as an LWE ciphertext via negacyclic matrix, and switches modulus to q_2 — achieving fast RingLWE encryption + cheap LWE homomorphic evaluation&#8201;[^27] |

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Distribution estimation | Server | Estimate popularity distribution P (from logs, external info, or private aggregation) | -- | Periodic |
| Dist.Setup | Server | Compute cutoff k = cdf_P^{-1}((kappa_avg - kappa_worst)/(1 - kappa_worst)); identify top-k indices L; run batch-PIR Setup on popular DB (size k) and full DB (size N) | pp = (pp_1, pp_2, L) to client | Once / on distribution change |
| Dist.Encode | Server | Encode popular DB (records at indices in L) and full DB using batch-PIR Encode | -- | Once / on DB change |
| Dist.Query | Client | Sample routing bit b ~ Bernoulli(kappa_worst); if b=0: map requested indices into popular DB, query popular DB; if b=1: query full DB&#8201;[^28] | Query q upward | Per query |
| Dist.Answer | Server | Parse q to determine which encoded DB to probe; run batch-PIR Answer on the selected DB | Answer a downward | Per query |
| Dist.Recover | Client | Parse routing bit; run corresponding batch-PIR Recover; for b=0 set m_j = bottom for indices not in popular set | -- | Per query |

#### CrowdSurf System Architecture (Section 9)

| Component | Detail |
|-----------|--------|
| Infrastructure servers | Hold all tweets; serve as PIR servers |
| Popular bucket | Small DB of most-popular users' tweets (15 MB for users following 16-24 accounts) |
| Full bucket | Remaining tweets |
| First bucket delivery | Sent in plaintext (popular, small) |
| Second bucket | Answered via distributional PIR |
| Hint compression | RingLWE-based encryption (Section 6); parallelized across CPUs for hint-compression, GPUs for PIR evaluation&#8201;[^29] |

### Complexity

#### Core Metrics

| Metric | Asymptotic | Concrete (CrowdSurf: 38 GB Twitter DB, B=24, kappa_avg=0.8, kappa_worst=0.01) | Phase |
|--------|-----------|---------------------------------------|-------|
| Expected server time | Õ(k*(1-kappa_worst) + N*kappa_worst) | 0.004 s GPU + negligible CPU (PIR portion)&#8201;[^30] | Online |
| Expected communication | k*log N + C(k)*(1-kappa_worst) + C(N)*kappa_worst | 21 MB total per request&#8201;[^31] | Online |
| Client storage | O(popular DB indices + hint) | 65 MB (hint) per client&#8201;[^31] | Setup (reusable) |
| Server storage | O(N + k) (two encoded databases) | 38 GB + 15 MB popular bucket | Setup |
| Queries per second (SimplePIR, B=24) | -- | 10-195x more than no-batching baseline&#8201;[^32] | Online |
| Queries per second (Respire, B=16-64) | -- | 6.7-12.8x more than no-batching baseline&#8201;[^23] | Online |
| Per-request dollar cost | -- | $0.0057 (CrowdSurf) vs. $0.046 (batch-PIR baseline) = 8x cheaper&#8201;[^33] | Online |

#### Encryption Optimization Metrics (Section 6)

| Metric | LWE (SimplePIR) | RingLWE [68] | Section 6 Hybrid | Phase |
|--------|----------------|-------------|-----------------|-------|
| Preprocess (s) | 2973 | 3.3 | 16 | Offline |
| Encrypt (s) | 0.7 | 0.008 | 0.004 | Online |
| Multiply (s) | 0.4 | 2.2 | 0.4 | Online |
| Decrypt (s) | 0.7 | 0.247 | 0.7 (stateful) or 0.004 (stateless)&#8201;[^34] | Online |

Query latency improvement: 128-161x faster for q=2^32; 200-349x faster for q=2^64 compared to LWE-based alternatives (Figure 3).&#8201;[^8]

#### Lower Bound (Theorem 5.1)

For any distributional-PIR scheme without database encoding:&#8201;[^35]

```
E[T] >= max{ N * (kappa_worst - W), cdf_P^{-1}(kappa_avg - W) }
where W = delta + (1 - kappa_exp) / (|M| - 1)
```

On real-world distributions, the construction's runtime is within ~1.4x of this lower bound.&#8201;[^36]

### Performance Benchmarks

#### Distributional PIR vs. Batch Codes (Section 7.2.1)

Hardware: r7i.4xlarge AWS instance (16 vCPUs, 128 GB RAM). 4 GB Twitter database. Client storage capped at 200 MB (5% of DB). kappa_avg = 0.8, kappa_worst = 0.01.

**SimplePIR instantiation (Figure 9):**

| Batch size | Dist. PIR (queries/sec) | Hash batch code (queries/sec) | Cuckoo batch code (queries/sec) | No batching (queries/sec) |
|-----------|------------------------|-------------------------------|--------------------------------|--------------------------|
| 1 | ~5 | ~2 | ~1.5 | ~2 |
| 8 | ~30 | ~8 | ~5 | ~2 |
| 16 | ~80 | ~15 | ~10 | ~2 |
| 24 | ~195 | ~20 | ~15 | ~2 |

Distributional PIR increases queries-per-second by 10-195x and reduces communication by 4.8-9.7x vs. no batching. Against batch codes: 2-8.5x more queries/sec, 1.8-9.73x less communication.&#8201;[^32]

**Respire instantiation (Figure 10):**

| Batch size | Dist. PIR (queries/sec) | Hash batch code (queries/sec) | No batching (queries/sec) |
|-----------|------------------------|-------------------------------|--------------------------|
| 1 | ~0.6 | ~0.4 | ~0.3 |
| 8 | ~1.5 | ~0.8 | ~0.3 |
| 16 | ~2.2 | ~1.0 | ~0.3 |
| 64 | ~3.5 | ~1.0 | ~0.3 |

#### GPU Batching (Section 7.1, Figure 5)

Hardware: c7.2xlarge (CPU, 8 vCPUs) cluster of 8 machines vs. p3.2xlarge (NVIDIA V100, 16 GB). 4 GB database.

For a batch of 50 concurrent requests, one GPU processes roughly 3x more requests/second than the 64-core CPU cluster at the same deployment dollar cost.&#8201;[^37]

#### CrowdSurf End-to-End (Section 9.1, Table 12)

| Metric | Batch PIR (baseline) | CrowdSurf (distributional PIR) |
|--------|---------------------|-------------------------------|
| Hint compression CPU (core-s) | 3.17 | 0.54 |
| Hint compression cost (cents) | 0.034 | 0.0053 |
| PIR CPU (core-s) | 1.19 | -- |
| PIR GPU (s) | -- | 0.004 |
| PIR cost (cents) | 0.012 | 0.0003 |
| **Total cost (cents)** | **0.046** | **0.0057** |
| Communication (download) | 34 MB | 21 MB |
| Client storage | 78 MB | 65 MB |
| Latency | -- | ~500 ms |

#### SCT Auditing (Section 8, Table 11)

| Approach | Crypto privacy | Server CPU (core-ms) | Communication (KB) | Storage (MB) |
|----------|---------------|---------------------|-------------------|-------------|
| Chrome | No | -- | 120 | -- |
| PIR (YPIR) | Yes | 1130 | 1534 | -- |
| Distributional PIR | Yes | 91 | 561 | 6 |

Distributional PIR reduces computation by 12x and communication by 3x compared to PIR-based SCT auditing, while adding cryptographic privacy that Chrome's approach lacks.&#8201;[^24]

### Comparison with Prior Work

| Dimension | Distributional PIR | Standard batch-PIR (Hash/Cuckoo) | Frequency smoothing (Pancake [37]) | DP-PIR [5, 95] |
|-----------|-------------------|----------------------------------|-----------------------------------|----------------|
| Security guarantee | Standard PIR (identical) | Standard PIR | Weaker (security degrades if distribution estimate is wrong) | Relaxed (differential privacy, leaks bounded info) |
| Correctness | Relaxed (probabilistic) | Full (deterministic) | Full | Full |
| Server runtime scaling | Sub-linear (expected) for skewed P | Õ(N) | Õ(N) with dummy queries | Sub-linear (probes subset) |
| Approach to distribution | Exploits skew openly | Ignores distribution | Hides skew via dummy accesses | Server's probed subset depends on query (leaks info) |
| Composability | Yes (with DP-PIR for further relaxation) | N/A | No (security depends on accuracy of P) | Yes (with distributional PIR) |
| Black-box use of PIR | Yes | N/A | No | No |

### Key Tradeoffs & Limitations

- **Requires distribution knowledge:** The server must have a good approximation of the popularity distribution P. If P is unknown or hard to estimate, the scheme cannot provide its speedups. Measuring P can itself leak information about aggregate user behavior.&#8201;[^38]
- **Relaxed correctness:** Out-of-distribution queries (records not in the popular set) fail with probability (1 - kappa_worst). This is unsuitable for applications requiring deterministic retrieval. The failure disproportionately affects users whose interests deviate from the majority, raising fairness concerns.&#8201;[^39]
- **Distribution shift:** If the true query distribution P-hat diverges from the estimated P, average-case correctness degrades by at most B * Delta(P, P-hat) (Proposition 2.1).&#8201;[^40] The server must periodically re-estimate P and re-run Setup.
- **Public parameters size:** The public parameters encode the popular indices L = (l_1, ..., l_k), which can be large. Mitigation strategies include sorting the DB by popularity (pp = just a cutoff k), downloading top-k indices, or using recursive PIR to fetch them.&#8201;[^41]
- **Two-database overhead:** The server maintains two encoded databases (popular and full), increasing storage. The popular DB is small (15 MB in CrowdSurf), but the full DB encoding remains full-size.
- **Hint-compression dominance:** In the CrowdSurf deployment, hint-compression (preprocessing) accounts for the majority of cost. Distributional PIR reduces PIR cost by 40x but hint-compression only by 6.4x, limiting total improvement to 8x.&#8201;[^42]
- **No database encoding in lower bound:** The lower bound (Theorem 5.1) only applies to schemes without database encoding. Schemes with sophisticated preprocessing could potentially do better, though such preprocessing is currently impractical.&#8201;[^43]

### Robustness Against Distribution Shift

Proposition 2.1 provides a formal guarantee:&#8201;[^40] if a distributional-PIR scheme has average-case correctness kappa_avg under P and batch size B, then under a shifted distribution P-hat it has average-case correctness at least kappa_avg - B * Delta(P, P-hat). This means the scheme degrades gracefully with statistical distance between estimated and true distributions.

### Deployment Strategies for Public Parameters (Table 1)

| Strategy | Params size | Per-query communication | Per-query server runtime |
|----------|------------|------------------------|------------------------|
| Construction 3.2 (download top-k) | log N * cdf_P^{-1}(...) | Q | R |
| Download top-k | (log N + l) * cdf_P^{-1}(...) | Q - (1-kappa_worst)*C(cdf_P^{-1}(...), l) | R - (1-kappa_worst)*l*cdf_P^{-1}(...) |
| Sorted DB | log N | Q | R |
| Recursive PIR | log N | Q + C(N, log N) | R + N*log N |

Where Q and R abbreviate the full expected communication and runtime expressions from Theorem 3.3.&#8201;[^41]

### Open Problems

1. **Extending to other cryptographic protocols:** The authors note that distributional speedups could apply to secure multiparty computation, fully homomorphic encryption, and other privacy-preserving protocols that currently treat all inputs uniformly.&#8201;[^44]
2. **Better distribution estimation:** Private measurement of P without leaking user information remains an open challenge. The paper sketches approaches (private aggregation [22, 31, 88], multi-party computation [25, 101]) but does not solve this.&#8201;[^38]
3. **Generalized utility functions:** Appendix E introduces "average-case utility" using linear utility functions U, allowing applications where not all failures are equally costly (e.g., SCT auditing wants failures on popular sites, ad serving wants failures on low-revenue ads). Theorem E.1 shows average-case utility reduces to average-case correctness on a modified distribution.&#8201;[^45]
4. **Composing with DP-PIR:** The paper notes that distributional PIR can be composed with differentially-private PIR [5, 95] to relax both correctness and security simultaneously for even greater speedups.

### Implementation Notes

- **Language:** Approximately 3000 lines of Go + 1000 lines of C++&#8201;[^46]
- **Open source:** CrowdSurf available at https://github.com/ryanleh/crowdsurf
- **Underlying PIR libraries:** SimplePIR [49], Respire [15], YPIR [79]
- **Encryption:** Microsoft SEAL (release 4.1) [80] for some LWE operations; custom RingLWE encryption for Section 6 optimizations
- **GPU support:** NVIDIA V100 (p3.2xlarge AWS) for server-side matrix-vector products; uses existing matrix-multiplication libraries as black box
- **Benchmarking platform:** c7.2xlarge AWS (8 vCPUs, 16 GB) for CPU; p3.2xlarge (V100, 16 GB) for GPU. GPU instance costs ~8x the CPU instance.
- **Security parameters:** 128-bit computational security, 40-bit statistical correctness. Lattice parameters: n in {2048, 4096}, q in {2^32, 2^64}, sigma = 3.2 (discrete Gaussian).&#8201;[^47]

### Uncertainties

- **Power-law assumption:** The constant-runtime result (Claim B.3) relies on P following a power-law distribution. Real distributions (e.g., Twitter followers) follow a *truncated* power-law (Figure 6, alpha = 2.1). The paper validates empirically that the approximation holds well for 1 million Twitter users (Figure 7), but the gap between the theoretical model and real data may widen for other application domains.
- **Batch size dependence:** Performance gains do not scale linearly with batch size because each batch size uses a different popularity distribution (Section 7.2). The cutoff point k varies significantly: for users making 16-24 queries, the cutoff is 8x smaller than for users making 56-64 queries. This makes it difficult to predict performance without knowing the exact application workload.
- **Hint-compression cost:** The paper acknowledges that hint-compression dominates CrowdSurf's cost and that "improvements to hint-compression performance will immediately increase the relative improvement of CrowdSurf" (p. 14). The reported 8x total savings is thus sensitive to future improvements in this orthogonal area.
- **Correctness validation scope:** The empirical validation of average-case correctness (Figure 7) uses a specific parameterization (kappa_avg=0.8, kappa_worst=0.01) on a 2014 Twitter dataset. Whether the achieved correctness matches predictions under other distributions or parameter settings is not tested.
- **CrowdSurf tweet frequency model:** The end-to-end evaluation assumes every followed user has tweeted since last retrieval (Section 9.1). In practice, tweet frequency varies and affects whether CrowdSurf's gains are higher or lower than reported.

[^1]: Abstract (p. 1): "We introduce distributional PIR, a new type of PIR that can run faster than classic PIR — both asymptotically and concretely — when the popularity distribution is skewed."
[^2]: Section 10, "PIR with popularity distributions" (p. 14): "Recent work by Lam et al. [63], explored how to improve the cost of batch PIR in the two-server setting. [...] their scheme satisfies a much stronger notion of correctness."
[^3]: Section 10, "PIR with popularity distributions" (p. 14): "Several works in the information-theory community have studied PIR in a similar setting to ours [...] they focus only on communication."
[^4]: Section 1 (p. 1): "the top 1% of Twitter users have the vast majority of followers on the platform [34], the top 1% of web domains account for more than 95% of all web-browsing activity [67, 92]."
[^5]: Section 1 (p. 2): "Our technique is to copy the 'popular' database entries into a separate, small database [...] Since the client's choice of which database to query is independent of the record it wants to fetch, we guarantee exactly the same notion of cryptographic privacy as classical PIR."
[^6]: Theorem 3.3 (p. 5): "Let k = cdf_P^{-1}((kappa_avg - kappa_worst)/(1 - kappa_worst)). There exists a 2*delta-secure distributional-PIR scheme Pi with explicit correctness 1, average-case correctness kappa_avg, worst-case correctness kappa_worst."
[^7]: Section B.3, Claim B.3 (p. 21): "If P_N is a power-law distribution [...] there exists a corresponding distributional PIR scheme [...] with worst-case correctness 0 and server running time T such that lim_{N->infinity} T = O(B)."
[^8]: Section 6 / Section 7.1 (p. 8-9): "our scheme is 128-161x faster for 32-bit ciphertext moduli and 200-349x faster for 64-bit ciphertext moduli."
[^9]: Section 2 (p. 3): "In this section, we introduce distributional PIR, a new type of private-information-retrieval scheme for applications in which (1) some database entries are queried more often than others and (2) a relaxed correctness guarantee is acceptable."
[^10]: Section 2.1 (p. 3): Syntax definition listing all five routines with their signatures.
[^11]: Section 2.1 (p. 3): "Setting the popularity distribution P to be arbitrary recovers the syntax of a standard batch-PIR scheme."
[^12]: Section 2.1, "Security" (p. 3): "Informally, the client's query should leak no information about their requested database indices, just as in a standard PIR scheme."
[^13]: Experiment A.1, Section A.1.1 (p. 18): Formal security experiment defining DistAdv[A, Pi] = |Pr[Sec_Pi(A, 0) = 1] - Pr[Sec_Pi(A, 1) = 1]|.
[^14]: Construction 3.1 / Construction B.7, Dist.Query (p. 5, 23): The routing bit b is sampled as Bernoulli(kappa_worst), independent of the requested index I.
[^15]: Section 2.1, "Correctness" (p. 3-4): "We define three correctness notions for distributional PIR, capturing three types of correctness failure."
[^16]: Section 2.1 (p. 4): "We always have that kappa_worst <= kappa_avg <= kappa_exp since an explicit correctness failure is also a worst-case correctness failure, and a worst-case correctness failure is also an average-case correctness failure."
[^17]: Section 2.1, "Efficiency" (p. 4) and Section A.1.3 (p. 19): Formal definitions of expected server time and expected communication cost.
[^18]: Section 2.1 (p. 4): "We can interpret any standard PIR scheme with correctness kappa as a distributional-PIR scheme in which all three correctness parameters are kappa."
[^19]: Section 1 (p. 2): "a generic compiler that lifts a standard PIR scheme into a distributional-PIR scheme." Also Theorem 3.3 (p. 5).
[^20]: Theorem 3.3 (p. 5): Expected server runtime is Õ(k*(1-kappa_worst) + N*kappa_worst).
[^21]: Theorem 3.3 (p. 5): Expected communication is k*log N + C(k)*(1-kappa_worst) + C(N)*kappa_worst.
[^22]: Section 7.2.1 (p. 11) and Section 9.1, Table 12 (p. 14): Server work and communication improvements (5-77x less server work, 4.8-9.7x less communication) from Section 7.2.1; 8x total cost reduction ($0.0057 vs. $0.046) from Table 12.
[^23]: Section 7.2.1 (p. 11): "When using Respire, our construction increases the queries-per-second by 6.7-12.8x and reduces communication by 2.3-117x."
[^24]: Section 8, Table 11 (p. 12): Distributional PIR achieves 91 core-ms server CPU and 561 KB communication vs. PIR's 1130 core-ms and 1534 KB.
[^25]: Section 6 (p. 8): "our scheme performs preprocessing and encryption using a RingLWE-based encryption scheme, then converts the preprocessed state and ciphertext into forms that are compatible with SimplePIR."
[^26]: Section 7.1 (p. 9): "we use ciphertext moduli q = 2^32 and q = 2^64 with respective lattice security parameters n = 2048 and n = 4096."
[^27]: Section 6 (p. 8): "the client encrypts their input under a RingLWE-based scheme using prime modulus q_1, reinterprets the RingLWE-type ciphertext as an LWE-type ciphertext [...] and modulus switches the ciphertext to a new modulus q_2."
[^28]: Construction B.7, Dist.Query (p. 23): Full pseudocode showing the Bernoulli routing and index remapping.
[^29]: Section 9, "PIR optimizations" (p. 13): "CrowdSurf uses our linearly homomorphic encryption scheme from Section 6 with hint-compression [...] we use two different clusters: a cluster of CPUs for hint-compression, and a cluster of GPUs for everything else."
[^30]: Table 12 (p. 14): CrowdSurf PIR GPU time = 0.004 s per request.
[^31]: Table 12 (p. 14): CrowdSurf downloads 21 MB per request; clients use 65 MB storage.
[^32]: Section 7.2.1 (p. 11): "our construction increases the queries-per-second by 10-195x and reduces communication by 4.8-9.7x compared to the baseline that doesn't use batch codes."
[^33]: Table 12 (p. 14): "$0.0057 per request for CrowdSurf vs. $0.046 for batch PIR baseline."
[^34]: Table 2 (p. 8): Comparison of encryption schemes showing Section 6 achieves 0.004 s encrypt and 0.7 s decrypt (stateful) or 0.004 s decrypt (stateless).
[^35]: Theorem 5.1 (p. 7): "E[T] >= max{N*(kappa_worst - W), cdf_P^{-1}(kappa_avg - W)}."
[^36]: Section 5 (p. 7): "the runtime of our distributional-PIR construction for a single query is within ~1.4x of the lower-bound."
[^37]: Section 7.1, "Batching requests with GPUs" (p. 10): "For a batch of 50 concurrent requests, one GPU can process roughly 3x more requests per second than the 64-core CPU cluster."
[^38]: Section 3 / Section 4.1 (p. 3, 6): "the PIR server must have a good approximation of the popularity distribution P." Section 4.1 discusses external information, private measurement, and their tradeoffs.
[^39]: Section 1, "Limitations" (p. 3): "this weakened correctness notion more notably affects users with 'out-of-distribution' query patterns, potentially raising fairness concerns."
[^40]: Proposition 2.1 (p. 4): "If a distributional-PIR scheme [...] has average-case correctness kappa_avg under [...] P, then it has average-case correctness at least kappa_avg_hat = kappa_avg - B*Delta(P, P-hat) under query distribution P-hat."
[^41]: Table 1 (p. 7): Big-O asymptotic costs for four public-parameter deployment strategies.
[^42]: Section 9.1 (p. 14): "the cost of hint-compression greatly diminishes the gains from our techniques. Thus, improvements to hint-compression performance will immediately increase the relative improvement of CrowdSurf compared to the baseline."
[^43]: Section 5 (p. 7): "Pre-processing PIR schemes [...] can subvert our lower bound, though these schemes are, as of now, very far from practical [86]."
[^44]: Section 11 (p. 15): "An exciting direction of future work would be to explore whether we can gain analogous speedups in other cryptographic protocols — secure multiparty computation, fully homomorphic encryption, etc."
[^45]: Appendix E, Theorem E.1 (p. 27): For any linear utility function U and batch size 1, there exists a modified distribution P' (the normalized product of P and U) such that if the scheme has average-case correctness kappa_avg on P', it also achieves average-case utility kappa_avg on P — reducing utility to correctness on a reweighted distribution.
[^46]: Section 7 (p. 9): "We implemented our distributional-PIR construction, PIR optimizations, and system for private Twitter feeds, CrowdSurf, in approximately 3000 lines of Go and 1000 lines of C++."
[^47]: Section 7.1 (p. 9): "We parameterize our linearly homomorphic encryption with preprocessing to satisfy 128-bits of computational security and 40-bits of statistical correctness [...] sigma = 3.2."
