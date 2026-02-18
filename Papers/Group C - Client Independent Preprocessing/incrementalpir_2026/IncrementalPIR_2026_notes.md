# iSimplePIR (Entry-level) — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | Incremental Single-Server Private Information Retrieval (2026) |
| **Archetype** | Construction + Update/maintenance |
| **PIR Category** | Group C — Client-Independent Preprocessing |
| **Security model** | Semi-honest single-server preprocessing PIR |
| **Additional assumptions** | None beyond decisional LWE |
| **Correctness model** | Deterministic (noise bounded by rounding parameter) |
| **Rounds (online)** | 1 (non-interactive, identical to SimplePIR) |
| **Record-size regime** | Small (1-bit entries in microbenchmarks; 32-byte SHA256 hashes in password breach application) |

## Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SimplePIR (Henzinger et al., USENIX Security 2023, Group C) [^1]; Ma et al. incremental offline/online PIR (USENIX Security 2022) for the two-server incremental definition [^2] |
| **What changed** | SimplePIR's Appendix C.3 mentions row-level incremental preprocessing but never develops it formally. Ma et al. [33] define incremental preprocessing only for the multi-server setting, with limitations on the number of modified/deleted entries. This paper (1) gives the first formal definition of single-server incremental PIR, (2) constructs entry-level updates (finer granularity than row-level), and (3) adds a communication-optimized row aggregation mechanism. |
| **Superseded by** | N/A (first paper in this space for single-server) |
| **Concurrent work** | N/A |

## Core Idea

iSimplePIR (Entry-level) introduces *entry-level incremental preprocessing* for SimplePIR: when individual database entries are inserted, modified, or deleted, the server computes a compact *difference* for the affected entry and sends it to the client, who locally updates the corresponding row of the hint matrix **H** via a single vector-scalar multiplication and addition.[^3] The key observation is that the hint **H** = **D** . **A**, so **H'** = **D'** . **A** = **D** . **A** + (**D'** - **D**) . **A**. For a single modified entry at position (i, j), the difference delta = d'_{i,j} - d_{i,j} is a scalar, and the hint update reduces to adding delta . **A**[j] to the i-th row of **H** — requiring only O(n) integer multiplications and additions instead of the O(n * sqrt(N)) operations needed by the row-level strategy.[^4] For scenarios with many updates in the same row, a *communication-optimized row aggregation* mechanism switches to row-level transmission when the per-entry communication exceeds the per-row cost, controlled by a threshold t = ceil((n * log q + log sqrt(N)) / (log p + log sqrt(N))).[^5] The online phase is completely unchanged from SimplePIR, preserving its throughput and communication properties.

[^1]: Section 3.1 (p. 8): SimplePIR scheme description with H = D . A as the hint.
[^2]: Section 1 (p. 2): "Ma et al. [33] propose the concept of incremental preprocessing."
[^3]: Figure 2 (p. 10): Construction 1, entry-level real-time updates step 2 and StateUpdate step 2.
[^4]: Table 1 (p. 14): Before combination SimplePIR requires n*sqrt(N) multiplications and additions; after combination with iSimplePIR (Entry-level), it requires only n multiplications and n additions.
[^5]: Section 4.1 (p. 11): "Let t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N))). When M' > t, the server computes the differences... and sums the results into an intermediate vector."

## Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Decisional Learning with Errors (LWE) [^6] |
| **Encryption/encoding scheme** | Regev-style LWE encryption: query q = **A** . **s** + **e** + Delta . **b**_{i_c}, where Delta = floor(q/p) [^7] |
| **Ring / Field** | No ring structure. Operates over Z_q^{sqrt(N) x n} (matrix **A**), Z_p^{sqrt(N) x sqrt(N)} (database **D**), Z_q^{sqrt(N) x n} (hint **H**) [^7] |
| **Key structure** | Public matrix **A** sampled uniformly from Z_q^{sqrt(N) x n}; client secret **s** sampled from Z_q^n; error vector **e** from discrete Gaussian chi |
| **Correctness condition** | Noise from LWE error must remain small enough that rounding by Delta recovers the correct plaintext in Z_p. Incremental updates are exact (no additional noise introduced). [^8] |

[^6]: Appendix A.1 (p. 23): "The security of SimplePIR scheme is based on the decisional version of the Learning with Errors (LWE) problem [42]."
[^7]: Section 3.1 (p. 8): SimplePIR construction parameters and algorithms.
[^8]: Section 4.1, Theorem 3 (p. 12): "Under the LWE assumption... our single-server iSimplePIR (Entry-level) scheme satisfies correctness, query privacy, and non-triviality."

## Key Data Structures

| Structure | Type | Size | Role |
|-----------|------|------|------|
| **D** (database) | Matrix in Z_p^{sqrt(N) x sqrt(N)} | N entries (sqrt(N) rows x sqrt(N) columns) | Stores database entries; each entry d_{i,j} in Z_p |
| **A** (public matrix) | Matrix in Z_q^{sqrt(N) x n} | sqrt(N) * n elements in Z_q | LWE public matrix; shared between server and all clients. Can be generated from a small seed. [^9] |
| **H** (hint) | Matrix in Z_q^{sqrt(N) x n} | sqrt(N) * n elements in Z_q | Client-side preprocessed hint; H = D . A. Client stores locally. [^7] |
| **beta** (update summary) | Tuple (beta_edit, beta_del, beta_add) | Variable per update | Server-to-client update package containing entry-level differences or aggregated row vectors, plus version number v [^3] |

[^9]: Section 4.2 (p. 14): "the server and client can communicate and store only a small seed to generate matrix A."

## Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Server computes, client downloads | H = D . A | sqrt(N) * n * log(q) bits (hint download) | Once at initialization |
| DBUpdate | Server | Applies operations op to D, producing D' and update summary beta | -- (internal) | Per DB change |
| StateUpdate | Client | Parses beta and incrementally updates H to H' | beta transmitted server -> client | Per DB change |
| Query | Client | Writes index i = (i_r, i_c), samples s and e, computes q = A . s + e + Delta . b_{i_c} | sqrt(N) * log(q) bits upward | Per query |
| Answer | Server | Computes a = D' . q | sqrt(N) * log(q) bits downward | Per query |
| Recover | Client | Computes d_i = round((a[i_r] - H'[i_r] . s) / Delta) | -- (local) | Per query |

### Update Algorithms (Construction 1, Figure 2)

**Entry-level real-time updates:**

For a **modification** of entry d_{i,j} to d'_{i,j}:
1. Server computes delta_edit = d'_{i,j} - d_{i,j} in Z_p, sends (i, j, delta_edit, v) to client
2. Client computes h_i = delta_edit . A[j] in Z_q^n and adds h_i to the i-th row of H [^10]

For a **deletion** of entry g_{i,j}:
1. Server samples random r from Z_p, computes delta_del = r - g_{i,j} in Z_p, sends (i, j, delta_del, v) to client
2. Client computes h_i = delta_del . A[j] in Z_q^n and adds h_i to the i-th row of H [^11]

For an **insertion** of new entries:
1. When entries form a complete row f_i, server computes f'_i = f_i . A in Z_q^n, sends (f'_i, v) to client
2. Client appends f'_i to the end of H [^12]

**Communication-optimized row aggregation:**

When the number of modified/deleted entries M' in a row exceeds the threshold t:
1. Server aggregates all differences in the row, multiplies by the relevant rows of A, and sums into an intermediate vector d'_i or g'_i in Z_q^n
2. Server sends (i, d'_i, v) to client; client adds d'_i to the i-th row of H [^5]

[^10]: Figure 2 (p. 10): Construction 1, step 2 (modification) and StateUpdate step 2 (entry-level).
[^11]: Figure 2 (p. 10): Construction 1, step 3 (deletion). The deleted entry is replaced with a random value to prevent the client from learning the deleted content.
[^12]: Figure 2 (p. 10): Construction 1, step 1 (insertion) and StateUpdate step 1.

## Correctness Analysis

### Proof sketch (Theorem 3, p. 12)

**Non-triviality:** When M entries are modified or deleted, the computational cost of iSimplePIR (Entry-level) is O(nM), which is proportional to M (the number of updates) rather than N (the database size). For M insertions across M'_r new rows, the cost is O(n * M'_r * sqrt(N)). Both are sublinear in N when M << N. [^13]

**Correctness:** The hint update is exact. For modifications, H' = D . A + (D' - D) . A = D' . A. The entry-level update computes delta . A[j] and adds it to the i-th row of H, which is equivalent to recomputing the product of the modified row with A. The same holds for deletion (replacement with random) and insertion (appending new rows). The online phase correctness follows from the original SimplePIR proof. [^14]

**Query privacy:** The incremental update does not involve the query index i, so the update process is independent of future queries. The distributions P_i (setup from scratch on D') and P'_i (setup on D then incrementally updated) produce computationally indistinguishable queries. The proof uses the triangle inequality and the fact that SimplePIR reuses A across clients (Corollary C.3 in [26]). [^15]

[^13]: Theorem 3, proof sketch (p. 12): "the computational cost of iSimplePIR (Entry-level) is O(nM). When M new entries are inserted across M'_r rows, the cost becomes O(nM'_r * sqrt(N))."
[^14]: Section 4.1 (p. 13): "H' = D . A + (D' - D) . A... it is evident that H' equals the product of the updated database D' and A."
[^15]: Section 4.1 (p. 13): Query privacy proof using P_i and P'_i distributions.

## Complexity

### Core metrics (online — identical to SimplePIR)

| Metric | Asymptotic | Concrete (1GB DB, 1-bit entries) | Phase |
|--------|-----------|----------------------------------|-------|
| Query size | O(sqrt(N) * log q) | 240 KB [^16] | Online |
| Response size | O(sqrt(N) * log q) | 240 KB [^16] | Online |
| Server computation | O(N) | 95 ms [^16] | Online |
| Throughput | O(N / t_server) | 10.5 GB/s [^16] | Online |
| Client computation (Query) | O(n) | Negligible (included in online) | Online |
| Client computation (Recover) | O(n) | Negligible | Online |

### Preprocessing metrics (Group C)

| Metric | Asymptotic | Concrete (1GB DB, 1% col-major) | Phase |
|--------|-----------|--------------------------------|-------|
| **Preprocessing computation (entry-level)** | O(nM) per M modified entries | 0.77 s [^17] | Offline |
| **Preprocessing computation (row-level)** | O(n * sqrt(N) * M_r) per M_r modified rows | 172.45 s [^17] | Offline |
| **Preprocessing communication (entry-level)** | O(M * (log p + log sqrt(N))) per entry, or O(n * log q + log sqrt(N)) per row-aggregated | 28.50 MB [^17] | Offline |
| **Preprocessing communication (row-level)** | O(M_r * n * log q) per M_r modified rows | 120.75 MB [^17] | Offline |
| **Hint size (client storage)** | sqrt(N) * n * log q bits | 241 MB (for 4GB password DB) [^18] | Stored |
| **Amortization window** | Per-entry (real-time) or per-row (when M' > t in a row) | t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N))) | -- |

[^16]: Table 2 (p. 18): Row-major scenario, iSimplePIR (Entry-level) column. Online comm. 240 KB, server comp. 94.62 ms (row-major) / 95.63 ms (col-major), throughput 10.6 / 10.5 GB/s.
[^17]: Table 2 (p. 18): Column-major scenario. Entry-level offline comp. 0.77s vs Row-level 172.45s (224x reduction). Entry-level offline comm. 28.50 MB vs Row-level 120.75 MB (4.2x reduction).
[^18]: Section 6.2 (p. 20): "the underlying SimplePIR scheme requires clients to store a 241MB hint locally."

## Update Metrics

| Metric | Value |
|--------|-------|
| **Cost per DB update (worst-case)** | O(n * sqrt(N)) — row-level fallback when row aggregation is triggered (M' > t updates in a single row) [^5] |
| **Cost per DB update (amortized, entry-level)** | O(n) — one vector-scalar multiply of A[j] by delta, one vector addition to H[i] [^4] |
| **Communication per update (entry-level)** | log p + log sqrt(N) bits per entry (difference + row/column indices + version) [^19] |
| **Communication per update (row-aggregated)** | n * log q + log sqrt(N) bits per row [^19] |
| **Aggregation threshold t** | t = ceil((n * log q + log sqrt(N)) / (log p + log sqrt(N))) — when M' > t modifications in a row, switch to row aggregation [^5] |
| **Deletion semantics** | Weak deletion only. Deleted entry replaced with random r; new clients cannot retrieve. Existing clients who retained prior hints or difference values can potentially recover deleted entries. Strong deletion is impossible in SimplePIR's preprocessing model. [^20] |
| **Supported mutation types** | Insertion (append-only, at end of DB), modification (arbitrary entry), deletion (replaced with random) [^21] |

[^19]: Section 4.1 (p. 11): Communication cost analysis — "approximately M' log p + (M' + 1) log sqrt(N) bits under the entry-level strategy and n log q + log sqrt(N) bits under the row-level strategy."
[^20]: Section 2.3 (p. 8): "Strong deletion... is the ideal property for practical applications" but "secure deletion against malicious clients is impossible in SimplePIR." Footnote 2 (p. 12): "a malicious client may leverage the received update-related data and a copy of the original hint to iteratively query and verify entries in order to recover deleted items."
[^21]: Section 2.3 (p. 7–8): "we focus on three types of database updates: the insertion of new entries, modification of existing entries, and deletion."

## Mutation Model

| Aspect | Detail |
|--------|--------|
| **Update types** | Insert (append-only at end of DB), Modify (arbitrary entry), Delete (replace with random) [^21] |
| **Who initiates** | Server initiates DBUpdate; client applies StateUpdate. Versioned with number v for ordering. [^3] |
| **Consistency model** | Sequential consistency via version numbers. Client verifies version v before applying each update. [^22] |
| **Impact on hints** | Entry-level: additive update to a single row of H (one vector addition). Insertion: append new row to H. Row-aggregated: additive update to a single row of H (same as row-level). [^10] |
| **Re-preprocessing trigger** | None — incremental updates avoid full re-preprocessing for any number of updates. The scheme degrades gracefully: as more entries are updated, communication may trigger row aggregation, but never requires re-running Setup from scratch. [^13] |
| **Insertion constraint** | Insertions must be at the end of the database. Arbitrary-position insertion would shift all subsequent indices, requiring full re-preprocessing. [^23] |

[^22]: Figure 2 (p. 10): "attach version number v" in DBUpdate; "verify the v" in StateUpdate.
[^23]: Section 2.3 (p. 7–8): "we also only support the insertion of new entries at the end of the database. This is because if new entries are added at arbitrary positions, the insertion of a single entry would affect the indices of all subsequent entries."

## Composability

| Aspect | Detail |
|--------|--------|
| **Base scheme** | SimplePIR (Henzinger et al., USENIX Security 2023) [^1] |
| **Integration point** | The hint H = D . A is a matrix product. Any scheme whose offline phase computes a product of the database matrix with a public matrix can use entry-level incremental updates. [^24] |
| **Improvement** | Reduces preprocessing from O(n * sqrt(N)) to O(n) per single-entry update. Table 1 shows reductions across all compatible schemes. [^4] |
| **Compatible schemes** | DoublePIR [26] (nm -> n operations), APIR [16] (n*sqrt(N) -> n), VeriSimplePIR [14] ((n+lambda)(m+lambda) -> (n+lambda)), YPIR [38] (d_1 * l_1 -> d_1) [^24] |
| **Limitations** | Only applicable to schemes whose hint is a matrix product of DB and a public matrix. Schemes using fundamentally different preprocessing (e.g., FHE-based, PRF-based) are not compatible. The technique is specific to the SimplePIR family. [^25] |

[^24]: Table 1 (p. 14): Operation counts before and after combination with iSimplePIR (Entry-level) for five schemes.
[^25]: Section 5 (p. 14): "Due to space limitations, we only present the setup phase of the four case study schemes based on SimplePIR."

## Performance Benchmarks

### Experimental setup

Hardware: Intel i7 processor at 3.3 GHz, 16 GB RAM. Ubuntu 24.04. Single-threaded. C/C++ implementation (~1000 lines of code), compiled with clang++ v18 using -O3. 10 trials, standard deviations <10%. [^26]

Parameters: Lattice dimension n = 2^10, modulus q = 2^32, plaintext modulus p chosen to minimize online communication. [^27]

[^26]: Section 6 (p. 16–17): Experimental setup description.
[^27]: Section 6 (p. 17): "Both row-level and entry-level incremental SimplePIR schemes are benchmarked with lattice dimension n = 2^10, modulus q = 2^32."

### Microbenchmarks (Table 2, p. 18) — 1GB database, 1% update, 1-bit entries

| Scenario | Metric | iSimplePIR (Row-level) | iSimplePIR (Entry-level) |
|----------|--------|----------------------|------------------------|
| **Row-major** | Offline comp. (s) | 1.77 | 1.70 |
| | Offline comm. (MB) | 1.26 | 1.26 |
| | Online comm. (KB) | 241 | 240 |
| | Server comp. (ms) | 95.73 | 94.62 |
| | Throughput (GB/s) | 10.4 | 10.6 |
| | Server cost | $0.000133 | $0.000134 |
| **Col-major** | Offline comp. (s) | 172.45 | **0.77** |
| | Offline comm. (MB) | 120.75 | **28.50** |
| | Online comm. (KB) | 240 | 240 |
| | Server comp. (ms) | 97.23 | 95.63 |
| | Throughput (GB/s) | 10.3 | 10.5 |
| | Server cost | $0.010635 | **$0.002527** |

### Key observations from microbenchmarks

1. **Row-major (worst case for entry-level):** iSimplePIR (Entry-level) matches row-level performance due to row aggregation automatically triggering when many entries in the same row are modified.[^28]
2. **Column-major (best case for entry-level):** 224x reduction in preprocessing computation (172.45s vs 0.77s), 4.2x reduction in communication (120.75 MB vs 28.50 MB), 4.2x reduction in monetary cost ($0.010635 vs $0.002527).[^28]
3. **Online phase unchanged:** Both schemes achieve ~95 ms server computation and ~10.5 GB/s throughput for a 1GB database, consistent with original SimplePIR.[^29]

[^28]: Section 6.1 (p. 17): "under conditions unfavorable to entry-level incremental preprocessing, iSimplePIR (Entry-level) incurs no additional overhead compared to the row-level scheme" and "it achieves 224x less computation, 4.2x smaller communication."
[^29]: Section 6.1 (p. 17): "the online server computation time of iSimplePIR(Entry-level) is approximately 95ms, which is comparable to that of SimplePIR [26, Table 8]."

### Scaling behavior (Figures 3 & 4, p. 18–19)

- **Varying update ratio (1%–8%, 1GB DB):** In the column-major setting, iSimplePIR (Entry-level) consistently outperforms row-level. At 8% updates, row aggregation begins to trigger more frequently, narrowing the communication gap. [^30]
- **Varying database size (1GB–4GB, 1% update):** The communication advantage diminishes from 4.2x at 1GB to 2.1x at 4GB in the column-major case, because the number of modified entries grows faster than the number of rows. [^30]

[^30]: Section 6.1 (p. 19): "the communication advantage of iSimplePIR (Entry-level) diminishes with increasing database size — from a 4.2x reduction at 1GB to a 2.1x reduction at 4GB."

### Password breach detection benchmark (Section 6.2, Figure 5, p. 19–20)

Database: ~4GB of SHA256 hashes from the Blyss implementation [7, 35], ~1.3 million 32-byte hashes updated (random update pattern).

| Metric | iSimplePIR (Row-level) | iSimplePIR (Entry-level) |
|--------|----------------------|------------------------|
| Offline computation (s) | ~500 (estimated from Fig. 5) | **~6** |
| Offline communication (MB) | ~350 (estimated from Fig. 5) | **~170** |

- iSimplePIR (Entry-level) achieves **86x** reduction in preprocessing computation and **2.1x** reduction in communication compared to row-level.[^31]
- **Online throughput:** 8–29x higher than the Spiral family and 133x higher than MulPIR. Online communication is 1.4x lower than DoublePIR but 7x higher than Spiral.[^32]
- **Client storage:** 241 MB for the hint (applies to all SimplePIR-based schemes).[^18]

[^31]: Section 6.2 (p. 20): "iSimplePIR (Entry-level) achieves 86x lower computation and 2.1x smaller communication for offline hint preprocessing compared to iSimplePIR (Row-level)."
[^32]: Section 6.2 (p. 20): "the throughput of iSimplePIR (Entry-level) is 8–29x higher than the Spiral family and 133x higher than MulPIR."

## Comparison with Prior Work

| Metric | iSimplePIR (Entry-level) | iSimplePIR (Row-level) | Ma et al. [33] (multi-server) | Checklist [28] |
|--------|------------------------|----------------------|------------------------------|----------------|
| Server model | Single-server | Single-server | Multi-server (2+) | Single-server |
| Update granularity | Entry-level | Row-level | Entry-level (limited) | Bucket-level |
| Mutation limit | Unlimited | Unlimited | Product of M and update sets must be sublinear in N [^33] | N/A (re-preprocess per bucket) |
| Preprocessing comp. per entry update | O(n) | O(n * sqrt(N)) | Varies | Full bucket re-preprocessing |
| Online overhead | None (identical to SimplePIR) | None | Loses efficient online operations (sends plaintext indices) [^33] | Must query all log N buckets |
| Composable with SimplePIR family | Yes (DoublePIR, APIR, VeriSimplePIR, YPIR) | Yes (SimplePIR only) | No (multi-server) | No |

[^33]: Section 1.2 (p. 5): "in [33], the number of modified or deleted entries M is strictly limited (the product of M and the number of update sets must remain sublinear in N)."

## Key Tradeoffs & Limitations

- **Weak deletion only:** Strong deletion is impossible in SimplePIR's preprocessing model. A malicious client who retains the difference values or a copy of the old hint can potentially recover deleted entries by querying and cross-referencing. The weak deletion only protects against new clients who join after the deletion. [^20]

- **Insertion restricted to append-only:** New entries can only be added at the end of the database. Arbitrary-position insertion would cascade index changes, requiring a full re-preprocessing. This limits applicability to append-friendly data models. [^23]

- **Client-side computation during updates:** The multiplication delta . A[j] during real-time updates is performed by the client. While this is O(n) and independent of N, it shifts computation to the client side. This contrasts with PIANO [48], which also performs client-side offline computation but incurs N-related overhead, making client computation the bottleneck. [^34]

- **Large hint size:** The client must store the full hint H (241 MB for a 4GB database). This is inherited from SimplePIR and is a fundamental constraint of the preprocessing model. Suitable for desktop clients but potentially prohibitive for mobile devices. [^18]

- **Row aggregation narrows advantage at high update ratios:** At 8% content update ratio, row aggregation triggers frequently enough that the communication savings over row-level diminish. For databases with very high churn concentrated in few rows, the entry-level approach offers less benefit. [^30]

- **Computational advantage diminishes with database size:** At 4GB (column-major, 1% update), the communication reduction is 2.1x (down from 4.2x at 1GB), because the number of affected entries grows with sqrt(N) while row count grows with sqrt(N). [^30]

[^34]: Section 4.1 (p. 13–14): "the client computation in our incremental preprocessing is independent of N. This contrasts with PIANO [48] which also performs client-side offline computation, but incurs N-related overhead."

## Open Problems

1. **Entry-level incremental preprocessing for sublinear server computation schemes:** The paper's conclusion explicitly identifies extending entry-level incremental preprocessing to schemes with sublinear server-side computation [17, 18, 48] as future work. [^35]

2. **Strong deletion in preprocessing PIR:** The paper acknowledges that strong deletion is impossible in SimplePIR's model. Achieving strong deletion while preserving preprocessing efficiency remains open. [^20]

3. **Single-round incremental updates:** Section 4.2 mentions extending to a single-round setting [9, 46] where the client's queries remain unchanged before and after database updates, with the server incrementally computing new responses at the cost of additional server storage. [^36]

[^35]: Section 7 (p. 21): "Future research directions include constructing entry-level incremental preprocessing for sublinear server-side computation schemes [17, 18, 48]."
[^36]: Section 4.2 (p. 14): "We also consider an extension to a single-round [9, 46] setting where the client's queries remain unchanged before and after database updates."

## Uncertainties

- **Exact threshold t values:** The aggregation threshold t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N))) depends on the specific parameter choices. The paper does not explicitly compute t for the benchmark parameters (n = 2^10, q = 2^32). For these parameters, t is approximately ceil((10 * 32 + 0.5 * log_2(N)) / (log_2(p) + 0.5 * log_2(N))), which depends on p and N.

- **Interaction with DoublePIR's decomposition:** Section 5 briefly describes how iSimplePIR (Entry-level) integrates with DoublePIR, but the update mechanism for the decomposed database (using Decomp and base-p representation) is only sketched. It is not clear whether the entry-level update preserves the same improvement ratio when applied through the decomposition layer.

- **VeriSimplePIR combination details:** The paper states that the incremental update is applied to both H_ver and Z_ver, but the interaction with the SIS-based commitment C_ver = Hash(A_1, H_ver) is not fully specified. Whether C_ver must be recomputed from scratch or can also be incrementally updated is unclear.

- **Concurrent updates:** The versioning scheme uses sequential version numbers v, suggesting updates must be applied in order. The paper does not discuss handling concurrent or out-of-order updates, which would be relevant for multi-client settings where different clients may receive updates at different times.

- **Password breach detection parameters:** The exact breakdown of offline computation (server-side DBUpdate vs client-side StateUpdate) is not provided for the password breach benchmark. The 86x figure represents total preprocessing time, but the split between server and client computation may matter for deployments.
