# FrodoPIR -- Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | FrodoPIR: Simple, Scalable, Single-Server Private Information Retrieval |
| **Authors** | Alex Davidson, Goncalo Pestana, Sofia Celi |
| **Year** | 2022 |
| **ePrint / Venue** | 2022/981 |
| **Archetype** | Construction |
| **PIR Category** | Filed Group A (FHE-based); functionally **Group C (client-independent preprocessing)**. Uses plain LWE, not RLWE/FHE. The offline phase is entirely client-independent: the server computes a global hint matrix once, and all clients download the same public parameters. No per-client server interaction is required during preprocessing.[^filing] |
| **Security model** | Semi-honest single-server |
| **Additional assumptions** | PRG (to expand seed mu into matrix **A**); hardness of decisional ternary LWE (Assumption 1)[^ternary] |
| **Correctness model** | Probabilistic (correct with high probability when q >= 8*rho^2*sqrt(m); Theorem 2)[^correct] |
| **Rounds (online)** | 1 (non-interactive: client sends query vector, server returns response) |
| **Record-size regime** | Small (1 KB default benchmarks); performance degrades for large elements due to linear query size[^regime] |
| **PDF** | `Papers/Group A - FHE Based PIR/FrodoPIR_2022_981.pdf` |

[^filing]: The paper is filed in Group A because it uses lattice-based (LWE) cryptography, but its architecture is structurally Group C: the server performs a one-time, client-independent preprocessing step that produces global public parameters, which all clients download. There is no `cinit` message -- the scheme omits the client-initialization step entirely (Section 4.2, p. 12).

[^ternary]: Security relies on the decisional ternary LWE problem (Assumption 1, p. 9): LWE_{q,n,m,chi} where chi is the uniform distribution on {-1, 0, 1}. This follows from Brakerski et al. [20], showing ternary decisional LWE is as hard as standard LWE.

[^correct]: Theorem 2 (p. 13): "If q >= 8*rho^2*sqrt(m), then FPIR is correct with high probability." The bound arises from requiring the LWE noise term to be small enough to round correctly (Appendix A.1, p. 33-34).

[^regime]: Online query size is m*log(q) bits -- linear in the number of DB elements m. For m = 2^20 with 1 KB elements, the query reaches approximately 4 MB (Table 6, p. 19). This is the scheme's main bandwidth limitation.

## Lineage

| Field | Value |
|-------|--------|
| **Builds on** | FrodoKEM [17] (plain LWE key exchange; source of parameter philosophy -- eschewing ring structure for simplicity); stateful PIR framework of Patel et al. (PSIR) [65] and Mughees et al. (SOnionPIR) [62]; Corrigan-Gibbs et al. (CHKPIR) [30] |
| **What changed** | Prior stateful PIR schemes (SOnionPIR, CHKPIR) required per-client offline phases scaling linearly in client count. FrodoPIR replaces the per-client offline interaction with a single client-independent global hint matrix **M** = **A** * **D**, computed once by the server. All clients download the same (mu, **M**) pair and independently derive their own query states.[^lineage] |
| **Superseded by** | N/A (concurrent work SimplePIR/DoublePIR [50] uses a similar LWE-based approach with different parameter tradeoffs) |
| **Concurrent work** | SimplePIR and DoublePIR (Henzinger, Hong, Corrigan-Gibbs, Meiklejohn, Vaikuntanathan, 2022/949) -- same underlying LWE mechanism with different parameter choices and a square-matrix assumption[^concurrent] |

[^lineage]: Section 2.2 (p. 5) details the limitations: SOnionPIR's offline phase takes 25 seconds per client query for 2^20 elements. PSIR downloads the entire DB. CHKPIR has similar per-client costs. FrodoPIR's key insight is that the offline phase cost is fixed regardless of client count C (Table 1, p. 6).

[^concurrent]: Section 7.2 (p. 28) compares: SimplePIR uses n = 1024, Gaussian error (sigma = 6.4), and assumes a square DB matrix, leading to 124 MB hint download for a 1 GB DB vs ~6 MB for FrodoPIR. SimplePIR achieves smaller online query (242 KB vs ~4 MB) but larger hint.

## Core Idea

FrodoPIR constructs a stateful single-server PIR scheme built entirely on plain LWE (not Ring-LWE), where the server's offline preprocessing is completely client-independent. The server compresses the database **D** into a global hint matrix **M** = **A** * **D** (where **A** is pseudorandomly derived from a public seed mu), which all clients download. Each client independently generates LWE-masked query states from **M** and **A**, then forms online queries by adding an indicator vector to the LWE mask. The server computes a simple matrix-vector product to answer each query. This design shifts the bottleneck from per-client preprocessing (O(m) per client in SOnionPIR) to a single global setup, making the scheme dramatically cheaper at scale when serving many clients.[^core]

[^core]: The financial advantage is quantified in Table 1 (p. 6): FrodoPIR's amortized financial cost is $(1.9/C * 10^{-2} + 1.3 * 10^{-3}) per query for C clients, compared to $8.8 * 10^{-5} per query for SOnionPIR (which scales with C).

## Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Plain (unstructured) LWE over Z_q. Specifically, the decisional ternary LWE problem (LWE_{q,n,m,chi}) where chi is uniform on {-1, 0, 1}.[^lwe_plain] |
| **Encryption/encoding scheme(s)** | Regev-style LWE encryption adapted for PIR. The query vector b_tilde = s^T * A + e^T + f_i is an LWE sample plus an indicator signal. No FHE, no Ring structure, no NTT.[^encoding] |
| **Ring / Field** | Z_q with q = 2^32 (standard 32-bit unsigned integer arithmetic). No polynomial ring structure.[^field] |
| **Key structure** | Per-query secret vector s sampled from chi^n (ternary); error vector e sampled from chi^m (ternary). No long-term client keys -- each query consumes one (b, c) pair from the preprocessed state.[^keys] |
| **Correctness condition** | q >= 8*rho^2*sqrt(m), where rho is the plaintext packing parameter and m is the number of DB elements (Theorem 2, p. 13). Derived from requiring the noise term (e + f_i)^T * D to round correctly.[^correctcond] |

[^lwe_plain]: This is deliberately NOT Ring-LWE. The paper explicitly notes (p. 2): "counter to accepted intuition -- eschewing ring lattice structures can lead to flexible and practically efficient PIR schemes." The LWE dimension n = 1774 is not a power of two, which would be required for NTT-based Ring-LWE.

[^encoding]: The database is parsed into a matrix D in Z_rho^{m x omega} where omega = ceil(w / log(rho)) and w is the bit-length of each element. Each DB entry is split into omega chunks of log(rho) bits each. The hint M = A * D compresses from n*m entries of A down to n*omega entries of M (Section 4.2, p. 12).

[^field]: q = 2^32 enables all modular arithmetic to use native 32-bit unsigned integer wrapping. No special modular reduction needed -- the Rust implementation uses the standard library's u32 type (Section 6, p. 18).

[^keys]: The secret s and error e are sampled fresh for each preprocessed query. The client generates c = s_j^T * M for the hint component and b_j = s_j^T * A + e_j^T for the query mask, storing pairs (b_j, c_j) as state (Section 4.2, p. 12).

[^correctcond]: The proof (Appendix A.1, p. 33-34) uses Corollary 2: for m ternary samples, the sum is bounded by 4*sqrt(m) with all but negligible probability. Since each entry of D is at most rho, the noise magnitude is bounded by 4*rho*sqrt(m). The rounding step requires this to be < q/(2*rho), yielding q >= 8*rho^2*sqrt(m).

## Key Data Structures

- **Database matrix D**: The raw DB (m elements of w bits each) is parsed into D in Z_rho^{m x omega}, where omega = ceil(w / log(rho)). Each row D[i] stores one DB element split into omega chunks of log(rho) bits.[^ds1]
- **Public matrix A**: Pseudorandomly expanded from seed mu via PRG(mu, n, m, q), producing A in Z_q^{n x m}. Shared across all clients; never stored explicitly -- rederived from mu.[^ds2]
- **Global hint matrix M**: M = A * D in Z_q^{n x omega}. This is the core client-independent public parameter. Size: n * omega * log(q) bits.[^ds3]
- **Client state X**: A set of c preprocessed pairs {(b_j, c_j)}_{j in [c]} where b_j in Z_q^m and c_j in Z_q^omega. Each pair is consumed by one online query.[^ds4]

[^ds1]: Section 4.2, p. 12. For w = 8192 bits (1 KB elements) and rho = 2^10, omega = 8192/10 = 820 (approximately). For rho = 2^9, omega = 8192/9 = 911 (approximately).

[^ds2]: Section 4.1, p. 12. The seed mu is lambda bits. The PRG expansion is the dominant client offline cost, taking 0.58-9.25 seconds depending on m (Table 6, p. 19).

[^ds3]: Section 4.2, p. 12. M is n x omega over Z_q, so its size is n * omega * 32 bits. For n = 1774, omega = 820, this is approximately 5682 KB (Table 6, p. 19). This is the client's offline download (excluding the lambda-bit seed).

[^ds4]: Section 4.2, p. 12. Each pair occupies (m + omega) * log(q) bits. For c = 500 preprocessed queries with m = 2^20, client storage reaches approximately 2 GB (Figure 4, p. 22). Without preprocessing (log(m) mode), client stores only (mu, M) totaling lambda + n*omega*log(q) bits.

## Database Encoding

- **Representation:** Matrix D in Z_rho^{m x omega}. Each row is one DB element. The database is interpreted as m rows, each consisting of omega entries in Z_rho.[^dbenc1]
- **Record addressing:** Row indexing -- the i-th DB element is row D[i].
- **Preprocessing required:** The server computes D = parse(DB, rho) and then M = A * D. The matrix A * D multiplication involves nm*omega modular multiplications (Table 3, p. 14). Server storage grows to approximately 3x the original DB due to the rho-encoding.[^dbenc2]
- **Record size equation:** Each w-bit record maps to omega = ceil(w / log(rho)) entries in Z_rho, requiring omega * log(q) bits in the hint per record.

[^dbenc1]: Section 4.2, p. 12 and footnote 6. The i-th row of D consists of omega chunks, each being log(rho) bits of DB[i].

[^dbenc2]: Section 2.3, p. 8: "the server database matrix is 3x as large as the original database." This is because each log(rho)-bit chunk of the original data is stored as a log(q) = 32-bit integer in D.

## Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Server Setup (ssetup) | Server | Sample seed mu; derive A = PRG(mu, n, m, q); parse DB into D; compute M = A * D | -- | Once (global) |
| Publish Parameters | Server | Publish (mu, M) to public repository | n*omega*log(q) + lambda bits download (~5.5--6.3 MB) | Once (global)[^phase1] |
| Client Preprocessing (cpreproc) | Client | Download (mu, M); derive A from mu; sample c pairs of (s_j, e_j) from chi; compute b_j = s_j^T*A + e_j^T and c_j = s_j^T*M; store X = {(b_j, c_j)} | -- (local computation) | Once per client[^phase2] |
| Query Generation (query) | Client | Pop (b, c) from state; set f_i[i] = q/rho; compute b_tilde = b + f_i | m*log(q) bits upload | Per query[^phase3] |
| Server Response (respond) | Server | Compute c_tilde = b_tilde^T * D | omega*log(q) bits download | Per query[^phase4] |
| Client Output (process) | Client | Compute x = round(c_tilde - c, rho) | -- (local) | Per query |

[^phase1]: Table 2, p. 14. Offline client download: lambda + n*omega*log(q) bits. For the standard parameters, this is approximately 5682 KB (m <= 2^18) or 6313 KB (m >= 2^19) per Table 6, p. 19.

[^phase2]: Table 3, p. 14. Client preprocessing involves n*(m + omega) modular multiplications per query plus nm PRG operations for deriving A. The PRG derivation cost is amortized over c queries: 0.58s for m = 2^16 up to 9.25s for m = 2^20 (Table 6, p. 19). Per-query preprocessing takes 0.15-2.34 seconds.

[^phase3]: Table 2, p. 14. Online upload: m*log(q) bits. For m = 2^20 with q = 2^32, query = 2^20 * 32 bits = 4 MB. The query generation itself is a single vector addition taking < 0.35 ms (Table 6, p. 19).

[^phase4]: Server response computation is b_tilde^T * D, a vector-matrix multiply over Z_q: m*omega multiplications and (m-1)*omega additions. Response size: omega*log(q) bits = 3.2--3.6 KB for 1 KB elements (Table 6, p. 19). Response overhead: < 3.6x.

## Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| b_tilde = b + f_i | LWE sample + indicator | m * log(q) bits (= m * 32 bits) | Encrypted query: an LWE mask b (pseudorandom) plus indicator f_i with f_i[i] = q/rho at the target index, zeros elsewhere[^qs1] |

[^qs1]: Section 4.3, p. 12. The query b_tilde = s^T*A + e^T + f_i is indistinguishable from uniform by the decisional LWE assumption (Theorem 3, p. 13). The server sees only a uniformly random-looking vector in Z_q^m.

## Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Seed mu | Server -> Client (download) | lambda bits (128 bits) | Yes, until A is rotated | Part of global public parameters; offline[^comm1] |
| Hint matrix M | Server -> Client (download) | n*omega*log(q) bits (~5.5--6.3 MB) | Yes, until A is rotated | Part of global public parameters; offline |
| Query b_tilde | Client -> Server (upload) | m*log(q) bits (256 KB -- 4 MB) | No | Per query; online |
| Response c_tilde | Server -> Client (download) | omega*log(q) bits (3.2--3.6 KB) | No | Per query; online |

[^comm1]: Table 2, p. 14. The hint download is static for a given (mu, DB) pair. It changes only when the server rotates A (after up to 2^52 queries observed globally) or when the DB is updated.

## Correctness Analysis

### Option A: Plain LWE Noise Analysis (additive-only, no homomorphic multiplication)

The scheme performs no homomorphic operations. The correctness analysis reduces to a single rounding step.

**Decryption equation (Eq. 5, p. 13):**

x = round(c_tilde - c, rho) = round((e + f_i)^T * D, rho)

The noise term is e^T * D, where e is a ternary vector of dimension m and D has entries in Z_rho.

**Noise bound:** By Corollary 2 (p. 10), the sum of m ternary samples is bounded by 4*sqrt(m) with all but negligible probability. Since each entry of D is at most rho, the infinity norm of e^T * D is at most 4*rho*sqrt(m).[^noise]

**Correctness condition (Theorem 2, p. 13):** q >= 8*rho^2*sqrt(m).

For the rounding to be correct, the noise magnitude rho/q * ||e^T * D||_inf must be < 1/2. This yields:
- rho/q * 4*rho*sqrt(m) < 1/2
- q > 8*rho^2*sqrt(m)

**Parameter check:** For m = 2^20, rho = 2^9, q = 2^32: 8 * 2^18 * 2^10 = 2^31. Since q = 2^32 >= 2^31, the condition holds.[^paramcheck]

[^noise]: Appendix A.1, p. 33-34. The argument uses Corollary 2 (p. 10), which applies the central limit theorem to ternary sums: for sufficiently large m = poly(lambda), the sum of m samples from {-1, 0, 1} is bounded by 4*sqrt(m) with all but negligible probability.

[^paramcheck]: Table 5 (p. 16) shows the parameter settings. For m = 2^20, rho = 2^9 (not 2^10), which is needed to satisfy the correctness bound. For m <= 2^18, rho = 2^10 can be used since 8 * 2^20 * 2^9 = 2^32 = q.

## Complexity

### Core metrics

| Metric | Asymptotic | Concrete (m = 2^20, w = 1 KB) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(m * log(q)) | 4096 KB (4 MB) | Online |
| Response size | O(omega * log(q)) | 3.556 KB | Online |
| Server computation | O(m * omega) mults | 825.37 ms | Online |
| Client query computation | O(1) (single vector add) | 0.34 ms | Online |
| Client output computation | O(omega) | 0.43 ms | Online |
| Response overhead | < 3.6x | 3.556x (over 1 KB element) | -- |
| Throughput | O(m * w / server_time) | ~1.27 GB/s | Online[^throughput] |

[^throughput]: Throughput from Table 7 (p. 26): for 2^20 x 256B DB, FrodoPIR achieves 1.56 GB/s on c5n.2xlarge. For 1 KB elements, derived from server response time of 825 ms processing a 1 GB DB.

### Preprocessing metrics

| Metric | Asymptotic | Concrete (m = 2^20, w = 1 KB) | Phase |
|--------|-----------|-------------------------------|-------|
| Server preprocessing | O(n * m * omega) mults | 1895.2 s (~31.6 min) | Offline (one-time, global)[^servpreproc] |
| Client hint download | O(n * omega * log(q)) | 6313.07 KB (~6.2 MB) | Offline (per client, but same data for all)[^hintdl] |
| Client derive matrix A | O(n * m) PRG ops | 9.25 s | Offline (per client, amortized over c queries) |
| Client per-query preprocessing | O(n * (m + omega)) mults | 2.343 s | Offline (per query) |
| Server storage | O(lambda + m * omega * log(rho)) | ~3x original DB | Persistent[^servstor] |
| Client storage (with preproc) | O(lambda + c * (m + omega) * log(q)) | ~2 GB for c = 500 | Persistent |
| Client storage (without preproc) | O(lambda + n * omega * log(q)) | ~6.3 MB | Persistent (log(m) mode) |

[^servpreproc]: Table 6, p. 19. For m = 2^20, the server database preprocessing takes 1895.2 seconds. This is a one-time cost amortized globally over all clients and all queries. The amortized per-query cost drops to < 0.002s for 1M queries (Figure 2, p. 20).

[^hintdl]: Table 6, p. 19. The download is the same for ALL clients (mu, M). For m <= 2^18, it is 5682.47 KB; for m >= 2^19, it is 6313.07 KB (the increase is because rho drops from 2^10 to 2^9, increasing omega).

[^servstor]: Table 4, p. 15. Server stores lambda + m*omega*log(rho) bits. The ~3x factor comes from each log(rho)-bit chunk being stored in a full 32-bit integer, plus the overhead of the omega dimension.

### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Download-and-compute: client downloads global parameters, then computes locally |
| **Client-independence** | Fully client-independent -- server preprocessing is identical regardless of number/identity of clients[^ci] |
| **Number of DB passes (server)** | 1 (single matrix multiplication A * D) |
| **Hint refresh mechanism** | Full re-download when A is rotated or DB changes |

[^ci]: This is the defining characteristic of FrodoPIR vs prior stateful schemes. Section 2.3, p. 7: "the offline phase of the protocol is performed by the server alone, completely independent of the number of clients or queries that will be made."

### If-reported metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Financial server cost (per query, m = 2^20) | ~$0.001 | From Figure 5 (p. 23): per-query online cost is approximately 10^{-3} cents; initial setup is approximately 1 cent[^finance] |
| Financial cost (100K queries, m = 2^20) | ~$1 | Abstract, p. 1: "financial costs are ~$1 for answering 100,000 client queries" |
| AWS instance cost | $0.3712/hr ($0.0464/CPU-hr) | t2.2xlarge, 8 CPU cores, 32 GB RAM (Section 6, p. 18)[^aws] |

[^finance]: Figure 5 (p. 23) shows that for m = 2^20, the initial setup cost is approximately 1 cent and the per-query cost is approximately 10^{-3} cents. The server offline cost amortizes globally: for C = 1M clients, the per-client share of setup is negligible.

[^aws]: Section 6, p. 18. All experiments are single-threaded on this instance. Data transfer costs: $0.09/GB server-to-client, $0 client-to-server.

## Performance Benchmarks

**Hardware:** Amazon t2.2xlarge EC2 instance, 8 CPU cores, 32 GB RAM. All experiments single-threaded.[^bench_hw]

### Table 6 (p. 19): Non-amortized performance (w = 1 KB elements)

| Metric | m = 2^16 | m = 2^17 | m = 2^18 | m = 2^19 | m = 2^20 |
|--------|----------|----------|----------|----------|----------|
| Client download (KB) | 5682.47 | 5682.47 | 5682.47 | 6313.07 | 6313.07 |
| DB preprocessing (s) | 104.57 | 206.26 | 429.07 | 936.36 | 1895.2 |
| Client derive A (s) | 0.5826 | 1.1698 | 2.2118 | 4.7284 | 9.25 |
| Client per-query preproc (s) | 0.1468 | 0.2898 | 0.5795 | 1.182 | 2.343 |
| Client query (KB) | 256 | 512 | 1024 | 2048 | 4096 |
| Server response (KB) | 3.203 | 3.203 | 3.203 | 3.556 | 3.556 |
| Client query gen (ms) | 0.0213 | 0.0422 | 0.0811 | 0.1648 | 0.3429 |
| Server respond (ms) | 45.013 | 94.505 | 188.36 | 417.92 | 825.37 |
| Client output (ms) | 0.359 | 0.398 | 0.363 | 0.42 | 0.434 |

[^bench_hw]: Table 6 (p. 19). The server offline phase costs can be amortized globally across all clients C. Client derive-matrix and per-query preprocessing amortize over c queries per client.

### Table 7 (p. 26): Comparison with Spiral (c5n.2xlarge instance)

| Database | Metric | Spiral | FrodoPIR |
|----------|--------|--------|----------|
| 2^20 x 256B | One-time preprocessing | -- | 327 s |
| | Per-client download | 14 MB | 1.54 MB |
| | Query size | 14 KB | 4 MB |
| | Response size | 20 KB | 912 B |
| | Computation | 1.37 s | 0.16 s |
| | Rate | 0.0125 | 0.28 |
| | Throughput | 196 MB/s | 1.56 GB/s |
| 2^14 x 30 KB | Query size | 14 KB | 1 MB |
| | Response size | 86 KB | 96 KB |
| | Computation | 17.69 s | 4.27 s |
| | Rate | 0.3488 | 0.3125 |
| | Throughput | 434 MB/s | 1.76 GB/s |
| 2^14 x 100 KB | Query size | 14 KB | 64 KB |
| | Response size | 188 KB | 320 KB |
| | Computation | 4.58 s | 0.89 s |
| | Rate | 0.5307 | 0.3125 |
| | Throughput | 358 MB/s | 1.76 GB/s |

## Application Scenarios

- **Google SafeBrowsing API (Appendix B, p. 35):** The SafeBrowsing blocklist has > 90 MB of entries. Browsers currently store a compressed probabilistic data structure and query Google's API for false-positive checks -- revealing browsing patterns. FrodoPIR can replace this with private lookups. The DB is approximately 2^20 entries of 32-byte hash prefixes.[^safebrowsing]
- **Certificate Transparency auditing:** Clients check certificate inclusion in CT logs without revealing which certificates they are interested in (Section 7.1, p. 27).
- **Certificate revocation (OCSP):** Replace OCSP queries that reveal certificate identity to CAs (Section 7.1, p. 27-28).
- **PIR for streaming:** Sharding enables chunk-based private retrieval of large data (video); FrodoPIR can serve as a building block (Section 7.1, p. 28).

[^safebrowsing]: Appendix B (p. 35-36) provides a detailed analysis. Current SafeBrowsing: browser stores ~2.5 MB Bloom-filter-like structure locally, queries API on hits. With FrodoPIR: offline download of ~6 MB of public parameters, then per-query cost of a single PIR interaction with ~3.2 KB response.

## Deployment Considerations

- **Database updates:** Require re-running spreproc (server preprocessing) and all clients re-downloading (mu, M). Sharding mitigates this: if updates are confined to one shard, only that shard's parameters need refreshing, costing 1/(kappa * s) of the full database.[^update]
- **Sharding:** Explicitly recommended for large databases (Section 5.4, p. 16-17). Database is split into s parallel instances of size m/s each. Each instance processes the same query. Reduces online query size from m to m/s but increases client download by factor s. Also enables parallelism.[^shard]
- **Key rotation / query limits:** Security holds conservatively for up to 2^52 global queries observed by the server before requiring rotation of A. Security parameter: lambda = nu - 52 where nu is the base LWE security. When reached, the server resamples mu, recomputes M, and clients re-download.[^rotation]
- **Anonymous query support:** Yes -- queries are statistically indistinguishable from uniform (Theorem 3, p. 13). The server cannot link queries to clients. However, the client state (b, c) pairs create a form of identity if compromised.
- **Session model:** Persistent client (must maintain state of preprocessed pairs). Can operate in ephemeral mode with log(m) storage by re-deriving A online, but this costs 0.5--9.25 seconds per query (Figure 4, p. 22).
- **Cold start suitability:** Moderate -- requires downloading ~6 MB hint. Once downloaded, deriving A and computing one (b, c) pair takes 0.7--11.6 seconds depending on m.
- **Amortization crossover:** FrodoPIR becomes cheaper than SOnionPIR-based approaches (including hypothetical online-free PIR) for databases of size <= 2^18 across all client counts, and is competitive at 2^20 (Figure 7, p. 25).[^crossover]

[^update]: Section 5.4, p. 17. With s shards, updating one shard requires only 1/(kappa * s) of the full DB to be reprocessed and re-downloaded. For large DBs, this fraction is very small.

[^shard]: Section 5.4, p. 16-17. Sharding also addresses RAM constraints: the t2.2xlarge instance cannot process m = 2^24 in a single instance, but 16 shards of 2^20 elements each would work.

[^rotation]: Section 5.2, p. 15. The bound ell = 2^52 queries is set conservatively. The concrete security is lambda = nu - log(ell) via Corollary 1 (p. 10). Less conservative analyses (Appendix C) suggest the number of queries may not significantly impact security.

[^crossover]: Figure 7, p. 25. FrodoPIR is compared against an online-free PIR scheme with zero online costs and SOnionPIR offline costs. FrodoPIR is cheaper for DB sizes <= 2^18 at any C, and approximately equal at 2^20.

## Key Tradeoffs & Limitations

- **Linear online query size:** The query is m * log(q) bits -- linear in the number of DB elements. For m = 2^20, this is 4 MB. This is the primary bandwidth limitation and is much larger than RLWE-based schemes (e.g., Spiral: 14 KB). Sharding can reduce this at the cost of increased offline download.[^tradeoff1]
- **Large client storage with preprocessing:** With c = 500 preprocessed queries and m = 2^20, client storage reaches ~2 GB (Figure 4, p. 22). Without preprocessing, storage drops to ~6.3 MB but each online query incurs 0.5--9.25s of computation to derive A.[^tradeoff2]
- **Server storage overhead:** The encoded database matrix is ~3x the original DB size due to the expansion from log(rho)-bit chunks to 32-bit integers.[^tradeoff3]
- **No per-query preprocessing savings in online phase:** Unlike RLWE schemes with query expansion, the full m-dimensional vector must be transmitted each time.
- **Re-preprocessing on DB update:** Any change to the database requires recomputing M = A * D and all clients re-downloading. Sharding partially mitigates this.

[^tradeoff1]: Section 5.4, p. 16 and Table 6, p. 19. This linear dependence is a fundamental consequence of the plain-LWE approach: the query must "touch" every DB element to hide the target. RLWE schemes use algebraic structure to compress the query.

[^tradeoff2]: Figure 4, p. 22. The tradeoff is explicit: preprocessing provides 10^3x -- 10^4x faster online queries at the cost of O(m) storage per preprocessed query.

[^tradeoff3]: Section 2.3, p. 8. This 3x overhead is comparable to RLWE schemes that store DB in NTT form (typically 2x overhead).

## Comparison with Prior Work

### vs. Stateful PIR Schemes (Table 1, p. 6; Figure 6, p. 24)

| Metric | FrodoPIR | SOnionPIR | PSIR | CHKPIR |
|--------|----------|-----------|------|--------|
| Security assumption | LWE | RLWE | RLWE | RLWE |
| Security level | 128 bits | <= 115 bits | <= 111 bits | <= 115 bits |
| Offline: client-independent? | **Yes** | No | No (downloads DB) | No |
| Offline: server computation | O(m*n*omega) (once) | O(k*m) per client | -- | O(m) per client |
| Client offline download | lambda + n*omega*log(q) (~6 MB) | O(sqrt(m)) per client | |DB| (entire DB) | O(sqrt(m)) per client |
| Online: query size | m*log(q) (4 MB for 2^20) | 1 query | 1 query | 1 query |
| Online: response size | omega*log(q) (~3.6 KB) | O(sqrt(m)) | O(sqrt(m)) | O(sqrt(m)) |
| Online: response blowup | < 3.6x | 128x | 320x | ~128x |
| Online: server computation | O(m*omega) | O(m) | O(m) | O(sqrt(m)) |
| Financial cost per query (m=2^20, C clients) | $(1.9/C * 10^-2 + 1.3*10^-3) | $8.8*10^-5 (scales with C) | $8.8*10^-5 | ~$8.8*10^-5 |

### vs. Stateless PIR / Spiral (Table 7, p. 26)

| Metric | FrodoPIR | Spiral |
|--------|----------|--------|
| 2^20 x 256B: query | 4 MB | 14 KB |
| 2^20 x 256B: response | 912 B | 20 KB |
| 2^20 x 256B: computation | 0.16 s | 1.37 s |
| 2^20 x 256B: throughput | 1.56 GB/s | 196 MB/s |
| 2^20 x 256B: rate | 0.28 | 0.0125 |
| 2^14 x 100KB: query | 64 KB | 14 KB |
| 2^14 x 100KB: computation | 0.89 s | 4.58 s |
| 2^14 x 100KB: throughput | 1.76 GB/s | 358 MB/s |

**Key takeaway:** FrodoPIR excels for many small elements (narrow databases) where its high throughput (up to 8x Spiral) and low response blowup (< 3.6x vs 128x for SOnionPIR) dominate. The linear query size is the main disadvantage. For large multi-client deployments, FrodoPIR's client-independent preprocessing makes it dramatically cheaper than per-client schemes: the server offline cost is fixed regardless of client count, and the ~6 MB per-client download is orders of magnitude smaller than streaming the entire DB (PSIR) or running per-client FHE preprocessing (SOnionPIR).[^takeaway]

[^takeaway]: Section 6.2, p. 22-25 and Section 8, p. 29. FrodoPIR's niche is high-client-count deployments with small records (e.g., SafeBrowsing, DNS). Spiral is preferred when record sizes are large or client upload bandwidth is constrained.

## Portable Optimizations

- **Client-independent hint via seed-expanded LWE matrix:** The technique of publishing (seed, M = A * D) where A = PRG(seed) is applicable to any LWE-based PIR scheme. SimplePIR independently uses the same technique.[^portable1]
- **Ternary secret/error distribution:** Using chi = Uniform({-1, 0, 1}) for both secret and error vectors simplifies sampling and enables the CLT-based noise bound (Corollary 2). Applicable to any plain-LWE construction.[^portable2]
- **q = 2^32 for native arithmetic:** Choosing q as a power of two eliminates modular reduction -- all arithmetic wraps natively in 32-bit unsigned integers. Applicable to any LWE scheme that does not require NTT (which needs specific prime moduli).[^portable3]

[^portable1]: Section 7.2, p. 28. SimplePIR's hint is larger (124 MB for 1 GB DB) because it assumes a square DB matrix. FrodoPIR's rectangular hint structure is more compact.

[^portable2]: Section 3.2, p. 9 and Section 5.2, p. 15. The ternary distribution is inherited from FrodoKEM [17]. Many lattice schemes (NTRU prime, lattice signatures) use similar ternary distributions [51, 15, 34, 46].

[^portable3]: Section 5.2, p. 15 and Section 6, p. 18. The Rust implementation uses the standard library u32 type with wrapping arithmetic.

## Implementation Notes

- **Language / Library:** Rust. Open-source at https://github.com/brave-experiments/frodo-pir.[^impl1]
- **Polynomial arithmetic:** N/A -- plain LWE, no polynomial operations, no NTT.
- **CRT decomposition:** N/A -- single modulus q = 2^32.
- **SIMD / vectorization:** Not mentioned. The implementation is described as "simple, non-optimized" (Abstract, p. 1).
- **Parallelism:** All experiments single-threaded. Server-side column-by-column independence in b_tilde^T * D enables trivial parallelization and sharding.[^impl2]
- **Lines of Code (LOC):** 735 lines including tests (Section 6, p. 18).
- **Open source:** https://github.com/brave-experiments/frodo-pir
- **External dependencies:** None for cryptographic operations. All modular arithmetic uses the Rust standard library's 32-bit unsigned integer type.[^impl3]

[^impl1]: Section 6, p. 18 and footnotes 1 and 11.

[^impl2]: Section 5.4, p. 16-17. Each column of D can be processed independently, making the server response computation embarrassingly parallel.

[^impl3]: Section 6, p. 18: "All modular arithmetic is implemented using instructions associated with the 32-bit unsigned integer type included in the Rust standard library."

## Open Problems

- Can the DoublePIR optimization (running the scheme twice -- once on DB, once on M -- to reduce hint download from ~6 MB to ~16 MB for larger DBs while reducing online query size) be applied to FrodoPIR? The authors note the philosophy is applicable but do not present results (Section 7.2, p. 28).[^open1]
- Sub-cubic matrix multiplication algorithms (Strassen, Coppersmith-Winograd) could improve server preprocessing from O(n*m*omega) -- not explored in the paper (Section 7, p. 27).[^open2]
- Batch query processing: multiple client queries can be batched into a matrix multiplication, enabling sublinear scaling per query (Section 7, p. 27).[^open3]
- Can the ternary LWE dimension n = 1774 be reduced under less conservative security analyses? Appendix C discusses this possibility for smaller query counts.[^open4]

[^open1]: Section 7.2, p. 28. DoublePIR effectively replaces the m-dimensional query with a sqrt(m)-dimensional one at the cost of the server performing additional computation on M itself.

[^open2]: Section 7, p. 27. The A * D multiplication has dimensions n x m and m x omega, fitting the regime where sub-cubic methods provide speedup.

[^open3]: Section 7, p. 27, citing Lueks and Goldberg [57].

[^open4]: Appendix C discusses that the number of queries may not significantly impact security in practice. Setting ell = 2^20 instead of 2^52 would allow n to decrease, improving the kappa compression ratio.

## Uncertainties

- The paper uses rho for both the plaintext packing parameter (entries of D are in Z_rho) and as ||D||_inf in the correctness proof (Appendix A.1). These are consistent only if all DB entries are packed at maximum -- the correctness bound is worst-case.[^unc1]
- The improvement factor kappa = log(rho)*m / (n*log(q)) is defined on p. 16 as the ratio of offline download to original DB size. The reported values in Table 5 range from 13 to 188, meaning the hint is 13x--188x smaller than the raw DB.[^unc2]
- The financial cost formula in Table 1 (p. 6) uses C in the denominator for the offline component, confirming the global amortization, but the online component (1.3*10^-3) appears independent of C. This implies for very large C, online costs dominate.[^unc3]

[^unc1]: Appendix A.1, p. 33: "assuming that each entry in D is equal to rho = ||D||_inf." This is a worst-case assumption.

[^unc2]: Table 5, p. 16. For m = 2^20, kappa = 187.603, meaning the client downloads roughly 1/188 of the raw DB. The kappa formula captures the compression gain from using an n-dimensional LWE matrix (n << m) to represent the DB.

[^unc3]: Table 1, p. 6. The formula $(1.9/C * 10^-2 + 1.3 * 10^-3) per query shows offline cost (1.9*10^-2 / C) vanishes as C grows, leaving only the per-query online cost of approximately $0.0013.
