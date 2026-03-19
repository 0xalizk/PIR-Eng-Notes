## Respire — Replication Benchmarks

### Implementation

- **Repo:** [Respire](https://github.com/AMACB/respire) (paper authors' Rust implementation)
- **Language:** Rust (~8,000 LOC), custom RLWE implementation (no external FHE library)
- **Dependencies:** Pure Rust, no external C/C++ libraries

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), Intel Core i7-11700F, 16 cores, 50 GB RAM, AVX-512 (F, DQ, IFMA, BW, CD, VL, VBMI, VNNI, BITALG, VPOPCNTDQ)
- **Paper:** AWS EC2 r7i.8xlarge (Intel Xeon Platinum 8488C @ 2.4 GHz), 32 vCPUs, 256 GB RAM, Ubuntu 22.04.4, rustc 1.77.0, AVX2 only (not AVX-512)

**Note:** The paper implementation only uses AVX2, not AVX-512. Compute timings will differ due to CPU differences. Communication sizes are deterministic and should match exactly.

### Build

```bash
cd schemes/Respire
RUSTFLAGS="-C target-cpu=native" cargo build --release
```

Compiler: rustc 1.91.0-dev (nightly). Paper uses rustc 1.77.0.

### Configuration

Respire provides pre-built binary configurations in `src/bin/`. The naming format is `<DB size><record size>_<batch size>`. Single-query configs omit the batch suffix.

| Config | Binary | DB Size | Records | Record Size | Batch | Source |
|--------|--------|---------|---------|-------------|-------|--------|
| S1 | `256m256` | 256 MB | 2^20 (1,048,576) | 256 B | 1 | Table 1 |
| S2 | `1g256` | 1 GB | 2^22 (4,194,304) | 256 B | 1 | Table 1 |
| S3 | `8g256` | 8 GB | 2^25 (33,554,432) | 256 B | 1 | Table 1 |
| B1 | `256m256_32` | 256 MB | 2^20 | 256 B | 32 | Table 2 |
| B2 | `256m256_256` | 256 MB | 2^20 | 256 B | 256 | Table 2 |
| B3 | `1g256_32` | 1 GB | 2^22 | 256 B | 32 | Table 2 |

### Running

```bash
RUSTFLAGS="-C target-cpu=native" cargo run --release --bin <name> <number_of_trials>
# Example:
RUSTFLAGS="-C target-cpu=native" cargo run --release --bin 256m256 5
```

### Results

Run date: 2026-03-13. rustc 1.91.0-dev, single-threaded. 5 trials each, averages reported by the program.

#### Table 1 Replication: Single-Query (record = 256 B)

| Config | DB Size | Encode (s) | Setup (ms) | Query Size (KB) | Response Size (KB) | Offline (KB) | Online Comp (s) | Throughput (MB/s) |
|--------|---------|------------|------------|-----------------|--------------------|--------------|-----------------|--------------------|
| S1 | 256 MB | 14.79 | 45.4 | 4.102 | 2.000 | 3980.0 | 0.861 | 297 |
| S2 | 1 GB | 66.90 | 46.2 | 7.656 | 2.000 | 3980.0 | 2.293 | 446 |
| S3 | 8 GB | -- | -- | -- | -- | -- | -- | -- |

S3 (8 GB) skipped: requires ~136 GB RAM (17x DB size for preprocessing).

Paper reference (Intel Xeon Platinum 8488C, from Table 1 p.19):

| Config | DB Size | Query Size (KB) | Response Size (KB) | Offline (MB) | Online Comp (s) | Throughput (MB/s) |
|--------|---------|-----------------|--------------------|--------------|-----------------|--------------------|
| S1 | 256 MB | 4.1 | 2.0 | 3.9 | 1.26 | 204 |
| S2 | 1 GB | 7.7 | 2.0 | 3.9 | 3.48 | 295 |
| S3 | 8 GB | 14.8 | 2.0 | 3.9 | 20.84 | 393 |

#### Table 2 Replication: Batch PIR with Cuckoo Hashing (record = 256 B)

| Config | DB Size | Batch (T) | Query Size (KB) | Response Size (KB) | Offline (KB) | Online Comp (s) |
|--------|---------|-----------|-----------------|--------------------|--------------|--------------------|
| B1 | 256 MB | 32 | 66.992 | 31.750 | 4680.0 | 10.388 |
| B2 | 256 MB | 256 | 326.484 | 233.500 | 4680.0 | 42.956 |
| B3 | 1 GB | 32 | -- | -- | -- | -- |

B3 (1 GB, batch=32) skipped: requires ~49-57x DB size in RAM (~49-57 GB). First trial attempted but showed severe swap thrashing (595s in first_dim alone vs expected ~5s), making timings meaningless.

Paper reference (Intel Xeon Platinum 8488C, from Table 2 p.21):

| Config | DB Size | Batch (T) | Query Size (KB) | Response Size (KB) | Offline (MB) | Online Comp (s) |
|--------|---------|-----------|-----------------|--------------------|--------------|--------------------|
| B1 | 256 MB | 32 | 67.0 | 31.8 | 4.6 | 15.02 |
| B2 | 256 MB | 256 | 326 | 234 | 4.6 | 60.04 |
| B3 | 1 GB | 32 | 113 | 31.8 | 4.6 | 28.12 |

### Communication Size Analysis

#### Single-Query Communication

| Config | Metric | Ours | Paper | Match? |
|--------|--------|------|-------|--------|
| S1 | Query | 4.102 KB | 4.1 KB | Yes (within rounding) |
| S1 | Response | 2.000 KB | 2.0 KB | Yes |
| S1 | Offline | 3980.0 KB (3.89 MB) | 3.9 MB | Yes |
| S2 | Query | 7.656 KB | 7.7 KB | Yes (within rounding) |
| S2 | Response | 2.000 KB | 2.0 KB | Yes |
| S2 | Offline | 3980.0 KB (3.89 MB) | 3.9 MB | Yes |

**All single-query communication sizes match the paper exactly (within rounding).**

#### Batch Communication

| Config | Metric | Ours | Paper | Match? |
|--------|--------|------|-------|--------|
| B1 | Query | 66.992 KB | 67.0 KB | Yes |
| B1 | Response | 31.750 KB | 31.8 KB | Yes |
| B1 | Offline | 4680.0 KB (4.57 MB) | 4.6 MB | Yes |
| B2 | Query | 326.484 KB | 326 KB | Yes |
| B2 | Response | 233.500 KB | 234 KB | Yes |
| B2 | Offline | 4680.0 KB (4.57 MB) | 4.6 MB | Yes |

**All batch communication sizes match the paper exactly (within rounding).**

### Compute Performance Analysis

| Config | Type | DB Size | Batch | Ours (s) | Paper (s) | Speedup (ours vs paper) |
|--------|------|---------|-------|----------|-----------|--------------------------|
| S1 | Single | 256 MB | 1 | 0.861 | 1.26 | 1.46x faster |
| S2 | Single | 1 GB | 1 | 2.293 | 3.48 | 1.52x faster |
| B1 | Batch | 256 MB | 32 | 10.388 | 15.02 | 1.45x faster |
| B2 | Batch | 256 MB | 256 | 42.956 | 60.04 | 1.40x faster |

**Our system is approximately 1.4-1.5x faster than the paper's AWS r7i.8xlarge.** This is somewhat surprising but explainable:

- The Intel Xeon Platinum 8488C (Sapphire Rapids, 2023) runs at a base clock of 2.4 GHz; the i7-11700F (Rocket Lake, 2021) boosts significantly higher in single-threaded workloads (up to 4.9 GHz)
- The paper explicitly notes that Respire "only uses AVX2, and not AVX-512" -- our machine's AVX-512 support is not being used, so both are on equal footing for SIMD
- We are using rustc 1.91.0-dev (nightly) vs the paper's 1.77.0; newer LLVM may produce better codegen
- The speedup is consistent across all configs (~1.4-1.5x), suggesting a genuine clock-speed/IPC advantage

#### Timing Breakdown: Single-Query

| Phase | 256 MB (ms) | 1 GB (ms) |
|-------|-------------|-----------|
| query | 0.29 | 0.27 |
| query_expand_reg | 131.05 | 263.37 |
| query_expand_gsw | 72.35 | 74.07 |
| query_expand_reg_to_gsw | 29.45 | 28.48 |
| first_dim | 347.82 | 1370.66 |
| fold | 276.72 | 553.55 |
| rotate | 1.19 | 1.16 |
| project | 1.54 | 1.36 |
| compress | 0.55 | 0.53 |
| extract | 0.02 | 0.02 |
| **total** | **860.98** | **2293.47** |

The first dimension scan dominates computation (~40% for 256 MB, ~60% for 1 GB), as expected. This scales linearly with 2^{v1}.

#### Client-Side Metrics (from timing breakdown)

| Config | DB Size | Client Query Gen (ms) | Client Extract/Decode (ms) |
|--------|---------|-----------------------|----------------------------|
| S1 | 256 MB | 0.29 | 0.02 |
| S2 | 1 GB | 0.27 | 0.02 |
| B1 | 256 MB (T=32) | 12.80 (+ 1.43 cuckoo) | 0.90 |
| B2 | 256 MB (T=256) | 104.74 (+ 1.60 cuckoo) | 6.16 |

Client operations are negligible for single-query (<0.3 ms total). For batch, query generation scales linearly with batch size T, and extract scales similarly.

#### Timing Breakdown: Batch 256 MB

| Phase | T=32 (ms) | T=256 (ms) |
|-------|-----------|------------|
| query_cuckoo | 1.43 | 1.60 |
| query | 12.80 | 104.74 |
| query_expand_reg | 1480.81 | 6849.54 |
| query_expand_gsw | 2991.75 | 19098.75 |
| query_expand_reg_to_gsw | 1213.60 | 7601.17 |
| first_dim | 1169.10 | 1463.62 |
| fold | 3382.85 | 6746.56 |
| rotate | 57.92 | 471.18 |
| project | 70.91 | 567.29 |
| compress | 6.09 | 45.08 |
| extract | 0.90 | 6.16 |
| **total** | **10388.17** | **42955.70** |

For batch, query expansion dominates (>50% of total time). This scales roughly linearly with T due to the Cuckoo hashing approach (3T/2 buckets).

### Derived Cross-Scheme Comparison Metrics

The following metrics are computed from the raw benchmark data above to enable standardized cross-scheme comparison (see `schema_v2.jsonc`). No re-run required.

#### Client Storage (= public parameter size)

| Config | Type | Public Param Size (KB) | Public Param Size (MB) |
|--------|------|----------------------|----------------------|
| S1, S2 | Single-query | 3,980 | 3.89 |
| B1, B2 | Batch | 4,680 | 4.57 |

Client downloads public parameters once per setup. Batch configs require slightly larger params for Cuckoo hashing support.

#### Throughput (DB_size / server_online_time)

| Config | Type | DB Size | Online Time (s) | Throughput (MB/s) | Throughput (GB/s) |
|--------|------|---------|------------------|-------------------|-------------------|
| S1 | Single | 256 MB | 0.861 | 297 | 0.290 |
| S2 | Single | 1 GB | 2.293 | 446 | 0.436 |
| B1 | Batch (T=32) | 256 MB | 10.388 | 24.6 | 0.024 |
| B2 | Batch (T=256) | 256 MB | 42.956 | 5.96 | 0.006 |

Single-query throughput scales well with DB size. Batch throughput is lower because the server processes T queries simultaneously (query expansion dominates).

Per-query amortized throughput for batch:
- B1: 256 MB * 32 queries / 10.388s = 789 MB/s (per-query equivalent)
- B2: 256 MB * 256 queries / 42.956s = 1,525 MB/s (per-query equivalent)

#### Preprocessing Throughput (DB_size / encode_time)

| Config | Type | DB Size | Encode Time (s) | Preprocessing Throughput (MB/s) |
|--------|------|---------|------------------|--------------------------------|
| S1 | Single | 256 MB | 14.79 | 17.3 |
| S2 | Single | 1 GB | 66.90 | 15.3 |
| B1 | Batch (T=32) | 256 MB | 42.88 | 5.97 |
| B2 | Batch (T=256) | 256 MB | 40.63 | 6.30 |

Batch preprocessing is ~3x slower than single-query because the Cuckoo hashing bucketing step subdivides the database differently.

#### Server Storage Overhead Ratio

| Config | Type | DB Size | Estimated RAM | Overhead Ratio |
|--------|------|---------|---------------|----------------|
| S1 | Single | 256 MB | ~4.4 GB | ~17x |
| S2 | Single | 1 GB | ~17 GB | ~17x |
| B1 | Batch | 256 MB | ~12.5 GB | ~49x |
| B2 | Batch | 256 MB | ~14.5 GB | ~57x |

Respire's NTT-domain representation has very high memory overhead. This is the primary limiting factor for larger database sizes.

### Issues & Observations

- **Memory overhead:** Respire requires ~17x DB size for single-query preprocessing and ~49-57x for batch. This makes the 8 GB single-query config (needs ~136 GB) and the 1 GB batch config (needs ~49-57 GB) infeasible on our 50 GB system.
- **1 GB batch attempted:** One trial of `1g256_32` completed (612s) but was dominated by swap thrashing (`answer_first_dim` took 595s vs expected ~5s). The timing is meaningless and not reported.
- **No AVX-512 usage:** Despite our CPU supporting AVX-512, the Respire implementation only uses AVX2 (as noted in the paper). This matches the paper's experimental setup.
- **Correctness:** All trials completed successfully (no assertion failures or incorrect retrievals). The implementation reports estimated error rates of 2^(-110) for 256 MB and 2^(-79) for 1 GB, well within the target of 2^(-40).
- **Preprocessing time:** Database encoding (NTT transform) takes 14.8s for 256 MB and 66.9s for 1 GB in single-query mode. The paper reports 16.8s for 256 MB, so our system is slightly faster here too (~1.14x).
- **Communication sizes replicate exactly:** All query, response, and offline communication sizes match the paper values within rounding precision. This confirms the implementation matches the paper's cryptographic parameters.

### Raw Output

<details>
<summary>S1: 256m256 (single-query, 256 MB, 5 trials)</summary>

```
Running PIR...
AVX2 is enabled
========
RESPIRE with 256 bytes x 1048576 records (256.000 MiB)
Parameters: RespireParamsExpanded {
    Q1: 66974689739603969,
    Q1A: 268369921,
    Q1B: 249561089,
    D1: 2048,
    Z_GSW: 127,
    T_GSW: 8,
    M_GSW: 16,
    Z_PROJ_SHORT: 16088,
    T_PROJ_SHORT: 4,
    Z_PROJ_LONG: 7,
    T_PROJ_LONG: 20,
    Z_RLWE_TO_GSW: 16088,
    T_RLWE_TO_GSW: 4,
    M_RLWE_TO_GSW: 8,
    Z_VECTORIZE: 258794687,
    T_VECTORIZE: 2,
    BATCH_SIZE: 1,
    N_VEC: 1,
    ERROR_WIDTH_MILLIONTHS: 9900000,
    ERROR_WIDTH_VEC_MILLIONTHS: 9900000,
    ERROR_WIDTH_COMPRESS_MILLIONTHS: 253600000,
    SECRET_BOUND: 7,
    SECRET_WIDTH_VEC_MILLIONTHS: 9900000,
    SECRET_WIDTH_COMPRESS_MILLIONTHS: 253600000,
    P: 16,
    D3: 512,
    NU1: 9,
    NU2: 9,
    Q3: 256,
    Q2: 16760833,
    D2: 512,
    T_COMPRESS: 24,
    Z_COMPRESS: 2,
    BYTES_PER_RECORD: 256,
}
Public param size: 3980.000 KiB
Query size: 4.102 KiB
Response size (batch): 2.000 KiB
Record size (batch): 0.250 KiB
Rate: 0.125
Error rate (estimated): 2^(-110.079)
========
Init times:
    encode: 14.790146723s
    setup: 45.378618ms
    total: 14.835525341s
Init time (end-to-end): 14.83559088s
========
Summary times:
    query: 286.364us mean, 29.659us stddev
    answer_query_expand_reg: 131.049222ms mean, 3.042874ms stddev
    answer_query_expand_gsw: 72.350807ms mean, 3.30611ms stddev
    answer_query_expand_reg_to_gsw: 29.449859ms mean, 2.896809ms stddev
    answer_first_dim: 347.821666ms mean, 3.994776ms stddev
    answer_fold: 276.717014ms mean, 2.056309ms stddev
    answer_rotate: 1.190978ms mean, 131.415us stddev
    answer_project: 1.539725ms mean, 217.694us stddev
    answer_compress: 554.138us mean, 46.982us stddev
    extract: 24.395us mean, 9.001us stddev
    total: 860.984168ms mean, 5.993907ms stddev
```
</details>

<details>
<summary>S2: 1g256 (single-query, 1 GB, 5 trials)</summary>

```
Running PIR...
AVX2 is enabled
========
RESPIRE with 256 bytes x 4194304 records (1024.000 MiB)
Parameters: RespireParamsExpanded {
    Q1: 66974689739603969,
    Q1A: 268369921,
    Q1B: 249561089,
    D1: 2048,
    Z_GSW: 127,
    T_GSW: 8,
    M_GSW: 16,
    Z_PROJ_SHORT: 16088,
    T_PROJ_SHORT: 4,
    Z_PROJ_LONG: 7,
    T_PROJ_LONG: 20,
    Z_RLWE_TO_GSW: 16088,
    T_RLWE_TO_GSW: 4,
    M_RLWE_TO_GSW: 8,
    Z_VECTORIZE: 258794687,
    T_VECTORIZE: 2,
    BATCH_SIZE: 1,
    N_VEC: 1,
    ERROR_WIDTH_MILLIONTHS: 9900000,
    ERROR_WIDTH_VEC_MILLIONTHS: 9900000,
    ERROR_WIDTH_COMPRESS_MILLIONTHS: 253600000,
    SECRET_BOUND: 7,
    SECRET_WIDTH_VEC_MILLIONTHS: 9900000,
    SECRET_WIDTH_COMPRESS_MILLIONTHS: 253600000,
    P: 16,
    D3: 512,
    NU1: 10,
    NU2: 10,
    Q3: 256,
    Q2: 16760833,
    D2: 512,
    T_COMPRESS: 24,
    Z_COMPRESS: 2,
    BYTES_PER_RECORD: 256,
}
Public param size: 3980.000 KiB
Query size: 7.656 KiB
Response size (batch): 2.000 KiB
Record size (batch): 0.250 KiB
Rate: 0.125
Error rate (estimated): 2^(-78.966)
========
Init times:
    encode: 66.9034386s
    setup: 46.193811ms
    total: 66.949632411s
Init time (end-to-end): 66.949705303s
========
Summary times:
    query: 271.135us mean, 17.825us stddev
    answer_query_expand_reg: 263.365357ms mean, 6.836795ms stddev
    answer_query_expand_gsw: 74.069191ms mean, 1.887943ms stddev
    answer_query_expand_reg_to_gsw: 28.484268ms mean, 519.865us stddev
    answer_first_dim: 1.370662227s mean, 28.044794ms stddev
    answer_fold: 553.552336ms mean, 7.419141ms stddev
    answer_rotate: 1.160974ms mean, 40.005us stddev
    answer_project: 1.355131ms mean, 15.151us stddev
    answer_compress: 528.707us mean, 12.395us stddev
    extract: 22.729us mean, 5.183us stddev
    total: 2.293472056s mean, 24.78386ms stddev
```
</details>

<details>
<summary>B1: 256m256_32 (batch, 256 MB, T=32, 5 trials)</summary>

```
Running PIR...
AVX2 is enabled
========
Cuckoo RESPIRE with 256 bytes x 1048576 records (256.000 MiB)
Cuckoo hashing with 3 hash functions, 32 batch size, 49 buckets, 65536 bucket size
Public param size: 4680.000 KiB
Query size: 66.992 KiB
Response size (batch): 31.750 KiB
Record size (batch): 8.000 KiB
Rate: 0.252
Error rate (estimated): 2^(-156.589)
========
Init times:
    encode: 42.883881593s
    setup: 71.299856ms
    total: 42.955181449s
Init time (end-to-end): 42.955195313s
========
Summary times:
    query_cuckoo: 1.42851ms mean, 90.967us stddev
    query: 12.803481ms mean, 474.978us stddev
    answer_query_expand_reg: 1.480809147s mean, 11.972597ms stddev
    answer_query_expand_gsw: 2.991752301s mean, 19.926835ms stddev
    answer_query_expand_reg_to_gsw: 1.213601416s mean, 9.785463ms stddev
    answer_first_dim: 1.169100846s mean, 11.826681ms stddev
    answer_fold: 3.382848628s mean, 19.880205ms stddev
    answer_rotate: 57.921938ms mean, 483.181us stddev
    answer_project: 70.907374ms mean, 953.099us stddev
    answer_compress: 6.092632ms mean, 150.546us stddev
    extract: 898.264us mean, 24.267us stddev
    extract_uncuckoo: 732ns mean, 428ns stddev
    total: 10.38816527s mean, 51.816015ms stddev
```
</details>

<details>
<summary>B2: 256m256_256 (batch, 256 MB, T=256, 5 trials)</summary>

```
Running PIR...
AVX2 is enabled
========
Cuckoo RESPIRE with 256 bytes x 1048576 records (256.000 MiB)
Cuckoo hashing with 3 hash functions, 256 batch size, 398 buckets, 8192 bucket size
Public param size: 4680.000 KiB
Query size: 326.484 KiB
Response size (batch): 233.500 KiB
Record size (batch): 64.000 KiB
Rate: 0.274
Error rate (estimated): 2^(-206.368)
========
Init times:
    encode: 40.629734925s
    setup: 62.247844ms
    total: 40.691982769s
Init time (end-to-end): 40.692040881s
========
Summary times:
    query_cuckoo: 1.603607us mean, 144.398us stddev
    query: 104.739707ms mean, 5.263038ms stddev
    answer_query_expand_reg: 6.849542507s mean, 18.318459ms stddev
    answer_query_expand_gsw: 19.098753434s mean, 66.543518ms stddev
    answer_query_expand_reg_to_gsw: 7.601172505s mean, 26.61843ms stddev
    answer_first_dim: 1.463617417s mean, 67.121641ms stddev
    answer_fold: 6.746561577s mean, 12.163976ms stddev
    answer_rotate: 471.175903ms mean, 1.05694ms stddev
    answer_project: 567.290273ms mean, 893.425us stddev
    answer_compress: 45.07658ms mean, 2.775099ms stddev
    extract: 6.155827ms mean, 253.26us stddev
    extract_uncuckoo: 9.017us mean, 1.858us stddev
    total: 42.955698355s mean, 99.183458ms stddev
```
</details>

<details>
<summary>B3: 1g256_32 (batch, 1 GB, T=32) -- ABORTED (memory)</summary>

```
Running PIR...
AVX2 is enabled
========
Cuckoo RESPIRE with 256 bytes x 4194304 records (1024.000 MiB)
Cuckoo hashing with 3 hash functions, 32 batch size, 49 buckets, 262144 bucket size
Public param size: 4680.000 KiB
Query size: 112.547 KiB
Response size (batch): 31.750 KiB
Record size (batch): 8.000 KiB
Rate: 0.252
Error rate (estimated): 2^(-126.091)
========
Init times:
    encode: 183.405497918s
    setup: 92.749318ms
    total: 183.498247236s
Init time (end-to-end): 183.504084187s

Trial 1 completed but with heavy swap thrashing:
    answer_first_dim: 595.167s (vs expected ~5s)
    total: 612.240s (vs expected ~28s)

Process used ~50 GB RAM (95.3% of system memory) with 4.1 GB swap.
Killed after first trial -- timings are meaningless due to swap pressure.
```
</details>
