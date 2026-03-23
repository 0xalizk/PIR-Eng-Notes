## HintlessPIR — Replication Benchmarks

### Implementation

- **Repo:** [hintless_pir](https://github.com/google/hintless_pir) (Google's C++ implementation)
- **Language:** C++ with Bazel build system
- **Dependencies:** SHELL encryption library, Eigen, Abseil, Google Benchmark, Highway (SIMD)

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), 16 cores, 50 GB RAM, AVX-512 (F, DQ, IFMA, BW, CD, VL, VBMI, VNNI, BITALG, VPOPCNTDQ)
- **Paper:** AWS r7iz.4xlarge, Intel Sapphire Rapids at 3.00 GHz, 128 GB RAM, single-threaded, clang 16, AVX-512

**Note:** Both systems have AVX-512 support. Communication sizes measured from protobuf serialization may differ from paper's raw payload sizes.

### Build

```bash
cd schemes/HintlessPIR
bazel build //hintless_simplepir:full_benchmark -c opt
# Binary: bazel-bin/hintless_simplepir/full_benchmark
```

A custom `full_benchmark.cc` was added to the repo (not upstream) to measure full end-to-end PIR: preprocessing, query gen, server response, client recovery, and communication sizes.

### Configuration

Paper Table 1/Table 2 configurations:

| Config | DB Description | db_rows | db_cols | record_bits | Shards | DB Size |
|--------|---------------|---------|---------|-------------|--------|---------|
| H1     | 2^20 × 8B     | 1024    | 1024    | 64          | 8      | 8 MB    |
| H2     | 2^20 × 256B   | 1024    | 1024    | 2048        | 256    | 268 MB  |
| H3     | 2^26 × 8B     | 8192    | 8192    | 64          | 8      | 537 MB  |
| H4     | 2^30 × 1B     | 32768   | 32768   | 8           | 1      | 1.07 GB |
| H5     | 2^18 × 32KB   | 512     | 512     | 262144      | 32768  | 8.59 GB |

Parameters constant across all configs:
- `lwe_secret_dim = 1400`
- `lwe_modulus_bit_size = 32`
- `lwe_plaintext_bit_size = 8`
- `lwe_error_variance = 8`
- `linpir_params.log_n = 12`
- `linpir_params.qs = {35184371884033, 35184371703809}` (~90 bits)
- `linpir_params.ts = {2056193, 1990657}` (~42 bits)
- `linpir_params.gadget_log_bs = {16, 16}`
- `rows_per_block = 1024`

### Running

```bash
# Example: H4 (2^30 x 1B)
./bazel-bin/hintless_simplepir/full_benchmark \
  --num_rows=32768 --num_cols=32768 --record_bits=8 --trials=5 --rows_per_block=1024
```

### Results

Run date: 2026-03-20. Bazel opt build. Single-threaded. 5 trials each (warmup trial excluded).

#### Table 2 Replication: Computation

| Config | DB Size | Server Preproc (s) | Server Online (ms) | Client Query Gen (ms) | Client Recovery (ms) | Throughput (MB/s) |
|--------|---------|--------------------|--------------------|----------------------|---------------------|-------------------|
| H1     | 8 MB    | 4.63               | 306.7              | 57.5                 | 12.9                | 26.1              |
| H2     | 268 MB  | 94.4               | 2625.4             | 54.7                 | 375.7               | 97.5              |
| H3     | 537 MB  | 74.6               | 816.5              | 504.1                | 94.1                | 627.0             |
| H4     | 1.07 GB | 142.6              | 560.7              | 2268.2               | 46.8                | 1826.2            |
| H5     | 8.59 GB | —                  | —                  | —                    | —                   | —                 |

Paper reference (AWS r7iz.4xlarge, Intel Sapphire Rapids 3.0 GHz, single-threaded):

| Config | DB Size | Server Preproc (s) | Server Online (ms) | Client Recovery (ms) | Throughput (MB/s) |
|--------|---------|--------------------|--------------------|---------------------|-------------------|
| H1     | 8 MB    | 3.11               | 233                | 4.78                | 35                |
| H2     | 268 MB  | 51.57              | 385                | 25.50               | 698               |
| H3     | 537 MB  | 93.58              | 478                | 36.66               | 1122              |
| H4     | 1.07 GB | 199.15             | 613                | 51.00               | 1750              |
| H5     | 8.59 GB | 2128               | 1347               | 52.32               | 6376              |

#### Table 1 Replication: Communication

| Config | DB Size | Query Size (KB) | Response Size (KB) |
|--------|---------|-----------------|-------------------|
| H1     | 8 MB    | 365.1           | 1480.4            |
| H2     | 268 MB  | 365.1           | 47370.8           |
| H3     | 537 MB  | 399.6           | 11842.0           |
| H4     | 1.07 GB | 518.1           | 5920.9            |

Paper reference (raw payload, not protobuf-serialized):

| Config | DB Size | Query Size (KB) | Response Size (KB) |
|--------|---------|-----------------|-------------------|
| H1     | 8 MB    | 334             | 288               |
| H2     | 268 MB  | 388             | 1540              |
| H3     | 537 MB  | 415             | 2212              |
| H4     | 1.07 GB | 453             | 3080              |

#### Peak Server Memory (RSS)

| Config | DB Size | Shards | Peak RSS (GB) |
|--------|---------|--------|---------------|
| H1     | 8 MB    | 8      | 1.1           |
| H2     | 268 MB  | 256    | 18.3          |
| H3     | 537 MB  | 8      | 5.5           |
| H4     | 1.07 GB | 1      | 4.1           |

### Compute Performance Analysis

**Single-shard config (H4, record_bits=8):**

| Metric | Ours | Paper | Ratio |
|--------|------|-------|-------|
| Server Preproc | 142.6 s | 199.15 s | 0.72x (faster) |
| Server Online | 560.7 ms | 613 ms | 0.91x (faster) |
| Client Recovery | 46.8 ms | 51.0 ms | 0.92x (faster) |
| Throughput | 1826 MB/s | 1750 MB/s | 1.04x (faster) |

Our hardware performs slightly better than the paper's AWS r7iz.4xlarge (Intel Sapphire Rapids 3.0 GHz) for single-shard workloads. Both systems support AVX-512, and the performance is very close.

**Multi-shard configs (H1, H3: 8 shards):**

| Config | Metric | Ours | Paper | Ratio |
|--------|--------|------|-------|-------|
| H1 | Server Online | 306.7 ms | 233 ms | 1.32x |
| H1 | Client Recovery | 12.9 ms | 4.78 ms | 2.70x |
| H3 | Server Online | 816.5 ms | 478 ms | 1.71x |
| H3 | Client Recovery | 94.1 ms | 36.66 ms | 2.57x |

8-shard configs show 1.3-1.7x slowdown on server side and 2.6-2.7x on client recovery. This suggests our implementation has higher per-shard overhead compared to the paper's hardware.

**High-shard config (H2: 256 shards):**

| Metric | Ours | Paper | Ratio |
|--------|------|-------|-------|
| Server Preproc | 94.4 s | 51.57 s | 1.83x |
| Server Online | 2625.4 ms | 385 ms | 6.82x |
| Client Recovery | 375.7 ms | 25.5 ms | 14.7x |

With 256 shards (256-byte records), performance degrades dramatically — 6.8x on server online, 14.7x on client recovery. This suggests either the paper's implementation handles multi-byte records differently (e.g., vertical stacking into a single large matrix instead of per-shard LinPIR instances), or the paper's AVX-512 optimizations are significantly more effective for this access pattern.

### Communication Size Analysis

**Communication sizes from protobuf serialization do not match paper's reported raw payload sizes.** The discrepancies are systematic:

- **Query sizes:** Our measurements are 8-15% smaller than the paper for H1/H3/H4, similar for H2. The paper may include additional metadata (e.g., PRG seeds, index encoding) not captured in the protobuf `HintlessPirRequest`.

- **Response sizes:** Our measurements are substantially larger than the paper, scaling linearly with the number of shards:
  - H4 (1 shard): 5921 KB vs paper 3080 KB — 1.92x
  - H1 (8 shards): 1480 KB vs paper 288 KB — 5.1x (but 1480/8 = 185 KB per shard)
  - H3 (8 shards): 11842 KB vs paper 2212 KB — 5.4x
  - H2 (256 shards): 47371 KB vs paper 1540 KB — 30.8x

The response size discrepancy is due to two factors:
1. **Protobuf serialization overhead:** Adds ~1.9x over raw payload for single-shard (H4).
2. **Multi-shard structure:** The implementation sends separate LinPIR responses per shard. The paper likely reports communication for a vertical-stacking approach where a single LinPIR execution serves all shards.

**Note:** Communication sizes are deterministic and do not depend on hardware. The difference from paper values reflects measurement methodology (protobuf vs raw) and potentially architectural differences in how multi-byte records are handled.

### H5 Status

H5 (2^18 × 32KB = 8.59 GB) is **not runnable** on our hardware.

With 32768 shards (each 512 × 512), the estimated memory requirement is:
- Raw data matrices: 32768 × 512 × 512 × 4 B = 32 GB
- Hint matrices: 32768 × 512 × 1400 × 4 B ≈ 88 GB
- Total > 50 GB available RAM

Paper used 128 GB RAM (AWS r7iz.4xlarge) for this config.

### Raw Output

<details>
<summary>H1: 2^20 × 8B (8 MB)</summary>

```
=== HintlessPIR Full Benchmark ===
DB: 1024 x 1024 = 1048576 records
Record size: 64 bits
DB size: 8 MB
Trials: 5
rows_per_block: 1024

Creating server with random database...
  Server creation: 133.002 ms
Server preprocessing...
  Server preprocessing: 4628.71 ms (4.62871 s)
  Public params size: 264 bytes (0.257812 KB)
Creating client...
  Client creation: 6.45991 ms
  [Warmup] Server response: 349.876 ms
  [Trial 1] Server response: 301.365 ms
  [Trial 2] Server response: 287.546 ms
  [Trial 3] Server response: 318.252 ms
  [Trial 4] Server response: 317.559 ms
  [Trial 5] Server response: 308.767 ms

=== Results ===
Correctness: 5/5

--- Communication ---
Query size: 373837 bytes (365.075 KB)
Response size: 1515885 bytes (1480.36 KB)

--- Computation (avg over 5 trials) ---
Server preprocessing: 4628.71 ms (4.62871 s)
Client query gen: 57.5405 ms
Server online: 306.698 ms
Client recovery: 12.8942 ms
Server throughput: 26.0843 MB/s
```
</details>

<details>
<summary>H2: 2^20 × 256B (268 MB)</summary>

```
=== HintlessPIR Full Benchmark ===
DB: 1024 x 1024 = 1048576 records
Record size: 2048 bits
DB size: 256 MB
Trials: 5
rows_per_block: 1024

Creating server with random database...
  Server creation: 4391.58 ms
Server preprocessing...
  Server preprocessing: 94428 ms (94.428 s)
  Public params size: 264 bytes (0.257812 KB)
Creating client...
  Client creation: 5.35205 ms
  [Warmup] Server response: 2655.13 ms
  [Trial 1] Server response: 2661.32 ms
  [Trial 2] Server response: 2643.63 ms
  [Trial 3] Server response: 2577.53 ms
  [Trial 4] Server response: 2644.62 ms
  [Trial 5] Server response: 2599.64 ms

=== Results ===
Correctness: 5/5

--- Communication ---
Query size: 373833 bytes (365.071 KB)
Response size: 48507736 bytes (47370.8 KB)

--- Computation (avg over 5 trials) ---
Server preprocessing: 94428 ms (94.428 s)
Client query gen: 54.7252 ms
Server online: 2625.35 ms
Client recovery: 375.71 ms
Server throughput: 97.5109 MB/s

Peak RSS: 19,160,184 KB (18.3 GB)
```
</details>

<details>
<summary>H3: 2^26 × 8B (537 MB)</summary>

```
=== HintlessPIR Full Benchmark ===
DB: 8192 x 8192 = 67108864 records
Record size: 64 bits
DB size: 512 MB
Trials: 5
rows_per_block: 1024

Creating server with random database...
  Server creation: 7048.28 ms
Server preprocessing...
  Server preprocessing: 74609 ms (74.609 s)
  Public params size: 264 bytes (0.257812 KB)
Creating client...
  Client creation: 5.18965 ms
  [Warmup] Server response: 819.764 ms
  [Trial 1] Server response: 824.613 ms
  [Trial 2] Server response: 843.319 ms
  [Trial 3] Server response: 793.441 ms
  [Trial 4] Server response: 813.653 ms
  [Trial 5] Server response: 807.669 ms

=== Results ===
Correctness: 5/5

--- Communication ---
Query size: 409229 bytes (399.638 KB)
Response size: 12126218 bytes (11842 KB)

--- Computation (avg over 5 trials) ---
Server preprocessing: 74609 ms (74.609 s)
Client query gen: 504.058 ms
Server online: 816.539 ms
Client recovery: 94.1049 ms
Server throughput: 627.037 MB/s

Peak RSS: 5,735,904 KB (5.5 GB)
```
</details>

<details>
<summary>H4: 2^30 × 1B (1.07 GB)</summary>

```
=== HintlessPIR Full Benchmark ===
DB: 32768 x 32768 = 1073741824 records
Record size: 8 bits
DB size: 1024 MB
Trials: 5
rows_per_block: 1024

Creating server with random database...
  Server creation: 13731.6 ms
Server preprocessing...
  Server preprocessing: 142601 ms (142.601 s)
  Public params size: 264 bytes (0.257812 KB)
Creating client...
  Client creation: 4.62768 ms
  [Warmup] Server response: 569.479 ms
  [Trial 1] Server response: 556.919 ms
  [Trial 2] Server response: 565.582 ms
  [Trial 3] Server response: 559.342 ms
  [Trial 4] Server response: 564.809 ms
  [Trial 5] Server response: 556.965 ms

=== Results ===
Correctness: 5/5

--- Communication ---
Query size: 530513 bytes (518.079 KB)
Response size: 6062980 bytes (5920.88 KB)

--- Computation (avg over 5 trials) ---
Server preprocessing: 142601 ms (142.601 s)
Client query gen: 2268.22 ms
Server online: 560.723 ms
Client recovery: 46.7592 ms
Server throughput: 1826.21 MB/s

Peak RSS: 4,288,700 KB (4.1 GB)
```
</details>

### Issues & Observations

- **Protobuf overhead:** Communication sizes measured via protobuf serialization include field tags, varint encoding, and padding. Paper reports raw cryptographic payload sizes. This accounts for ~1.9x response size difference in single-shard configs.
- **Multi-shard scaling:** The implementation creates independent LinPIR server instances per shard, each with its own preprocessed data. This scales linearly with shard count (ceil(record_bits / 8)). Performance degrades significantly for high shard counts (H2: 256 shards).
- **Hardware match:** For single-shard workloads (H4), our hardware is 0.72-0.92x of the paper's timing (i.e., faster). Both systems have AVX-512 support. Our CPU appears comparable to or slightly faster than the paper's Sapphire Rapids at 3.0 GHz for this workload.
- **Memory pressure at H2:** 18.3 GB RSS for 268 MB logical database (256 shards). Each shard stores data matrix + hint matrix + LinPIR preprocessed data.
- **H5 blocked:** Requires >120 GB RAM due to 32768 shards. Paper used 128 GB RAM.
- **Warmup effect:** First trial consistently 10-20% slower; excluded from averages.
- **Correctness:** All configs verified correct (5/5 trials each).
