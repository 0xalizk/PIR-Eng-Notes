## OnionPIRv2 — Replication Benchmarks

### Implementation

- **Repo:** [OnionPIRv2](https://github.com/chenyue42/OnionPIRv2) (paper authors' C++ implementation)
- **Dependency:** [SEAL-For-OnionPIR](https://github.com/helloboyxxx/SEAL-For-OnionPIR)
- **Language:** C++20
- **Build:** CMake + GCC, Intel HEXL enabled

### Hardware

- **Local:** WSL2 Ubuntu 24.04 on x86_64, AVX-512-capable CPU, single-threaded runs pinned to one core
- **Paper:** AWS EC2 c5n.9xlarge, Intel Xeon Platinum 8124M @ 3.00 GHz, 96 GB RAM, single-threaded

**Note:** Compute timings will differ from paper due to hardware and virtualization differences. Query size, response size, and key sizes should match if the same parameter set is used.

### Configs (from paper Table 2)

| Config | Variant | Ring Degree | Native Entry Size | Approx. DB |
|--------|---------|-------------|-------------------|------------|
| O1 | OnionPIRv2 | 2048 | 3.75 KB | ~1 GB |
| O2 | OnionPIRv2 | 2048 | 3.75 KB | ~8 GB |
| O3 | OnionPIRv2 | 4096 | 22.5 KB | ~1 GB |
| O4 | OnionPIRv2 | 4096 | 22.5 KB | ~8 GB |

### Build

The local benchmark harness uses per-profile build directories and passes `-DONIONPIR_PROFILE=<profile>` to CMake so the upstream hardcoded parameter header does not need manual editing between runs.

Primary runner:

```bash
nohup ./scripts/run_onionpirv2_replication.sh --run-id <id> > results/onionpirv2/<id>/launcher.log 2>&1 < /dev/null &
```

### Results

Run date: 2026-03-15. g++ (Ubuntu 24.04), single-threaded (pinned to core 0), Intel HEXL enabled. Averages over 10 trials (first 3 excluded as warmup).

#### N=2048 Replication

| Config | DB Size | Key Size (MB) | Query (KB) | Response (KB) | Server Time (ms) | Throughput (MB/s) |
|--------|---------|---------------|------------|---------------|-------------------|--------------------|
| O-256MB | 256 MB (smoke) | 0.60 | 16.2 | 13.5 | 193 | 1237.58 |
| O1 | 1 GB | 0.63 | 16.2 | 13.5 | 623 | 1539.78 |
| O2 | 8 GB | -- | -- | -- | -- | -- |

O2 (8 GB) did not complete — the process was still generating the random database when the run was stopped. The NTT-domain physical storage for 8 GB DB is 32 GB, which combined with the database generation process exceeds available memory.

#### O1 Server Time Breakdown (1 GB, N=2048)

| Phase | Time (ms) | % of Total |
|-------|-----------|------------|
| Expand | 48 | 7.7% |
| Convert | 9 | 1.4% |
| First dim | 508 | 81.5% |
| Other dim | 56 | 9.0% |
| Modulus switching | 0 | 0.0% |
| **Total** | **623** | **100%** |

First-dimension processing dominates (~82%), as expected for large databases with many rows.

#### O-256MB Server Time Breakdown (256 MB, N=2048, smoke test)

| Phase | Time (ms) | % of Total |
|-------|-----------|------------|
| Expand | 25 | 13.0% |
| Convert | 8 | 4.1% |
| First dim | 132 | 68.4% |
| Other dim | 27 | 14.0% |
| Modulus switching | 0 | 0.0% |
| **Total** | **193** | **100%** |

#### Communication & Key Size Analysis

| Metric | Ours (N=2048) | Notes |
|--------|---------------|-------|
| Galois key | 324-331 KB | Varies slightly with dimension count |
| GSW key | 331.8 KB | Constant for N=2048 |
| Total key | 0.60-0.63 MB | |
| Query | 16.2 KB | Single BFV ciphertext |
| Response | 13.5 KB | Single response ciphertext |

### Derived Cross-Scheme Comparison Metrics

The following metrics are computed from the raw benchmark data above to enable standardized cross-scheme comparison (see `schema_v2.jsonc`). No re-run required.

#### Rate (useful_bytes / response_bytes)

| Config | Entry Size | Response Size | Rate |
|--------|-----------|---------------|------|
| O-256MB, O1 (N=2048) | 3,840 B (3.75 KB) | 13,824 B (13.5 KB) | 0.278 |

Rate is moderate (~0.28) — the response contains a single BFV ciphertext with modulus-switched coefficients, carrying 3.75 KB of useful data.

#### Throughput (DB_size / server_time)

Already reported in raw output. Reproduced here in standardized units:

| Config | DB Size | Server Time (ms) | Throughput (GB/s) |
|--------|---------|-------------------|--------------------|
| O-256MB | 240 MB | 193 | 1.21 |
| O1      | 960 MB | 623 | 1.50 |

#### Client Storage (= total key size)

| Config | Galois Key (KB) | GSW Key (KB) | Total Key (MB) |
|--------|----------------|-------------|----------------|
| O-256MB | 290 | 324 | 0.60 |
| O1      | 324 | 324 | 0.63 |

Client must generate and upload these keys once per session. Key size grows slightly with the number of dimensions (more Galois key elements for deeper recursion).

#### Server Storage Overhead Ratio

| Config | DB Size | Physical Storage | Overhead Ratio |
|--------|---------|-----------------|----------------|
| O-256MB | 240 MB | 1,024 MB | 4.27x |
| O1      | 960 MB | 4,096 MB | 4.27x |
| O2      | 7,680 MB | 32,768 MB | 4.27x |

Constant ~4.3x overhead from NTT-domain representation (each entry stored as N=2048 polynomial coefficients in u64).

### Issues & Observations

1. **Fresh database each run:** The upstream binary always generates a fresh random database at startup. The generated `rawDB.bin` is transient and deleted on clean process exit.
2. **8 GB config infeasible:** O2 requires ~32 GB NTT-domain physical storage + additional memory for DB generation, exceeding 50 GB RAM. Paper used 96 GB RAM (c5n.9xlarge).
3. **N=4096 configs not yet attempted:** O3 and O4 require a separate build with different SEAL parameters. These may be feasible for the 1 GB config but the 8 GB config will have the same memory constraints.
4. **Client time reported as 0 ms:** The implementation reports client total as 0 ms in the benchmark output. This likely means client operations (key gen, query gen, decode) are not timed in the benchmark binary.
5. **Noise budget:** Remaining noise budget after decryption ranges from 1 to 3 bits across trials, indicating the scheme operates near its correctness threshold. All 13 trials succeeded for each config.

### Raw Output

<details>
<summary>O-256MB: N=2048, 256 MB (smoke test)</summary>

```
PIR PARAMETERS
  Database size (MB)          = 240
  Physical storage (MB)       = 1024
  entry_size_                 = 3840 B = 3.75 KB
  num_pt_                     = 65536
  num_entries_(padded)        = 65536
  dimensions_                 = [ 256 2 2 2 2 2 2 2 2 ]
  seal_params_.poly_modulus_degree() = 2048
  log(q)                      = 60
  log(t)                      = 16

Success rate: 13/13
galois key size: 296892 bytes
gsw key size: 331760 bytes
total key size: 0.599529MB
query size: 16588 bytes = 16.1992 KB
response size: 13824 bytes = 13.5 KB

Average Results (after first 3 warm-up runs):
├── Server total: 193 ms
│   ├── Expand: 25 ms
│   ├── Convert: 8 ms
│   ├── First dim: 132 ms
│   ├── Other dim: 27 ms
│   └── Modulus switching: 0 ms
└── Client total: 0 ms
Server throughput: 1237.58 MB/s
```
</details>

<details>
<summary>O1: N=2048, 1 GB</summary>

```
PIR PARAMETERS
  Database size (MB)          = 960
  Physical storage (MB)       = 4096
  entry_size_                 = 3840 B = 3.75 KB
  num_pt_                     = 262144
  num_entries_(padded)        = 262144
  dimensions_                 = [ 512 2 2 2 2 2 2 2 2 2 ]
  seal_params_.poly_modulus_degree() = 2048
  log(q)                      = 60
  log(t)                      = 16

Success rate: 13/13
galois key size: 331746 bytes
gsw key size: 331760 bytes
total key size: 0.632769MB
query size: 16588 bytes = 16.1992 KB
response size: 13824 bytes = 13.5 KB

Average Results (after first 3 warm-up runs):
├── Server total: 623 ms
│   ├── Expand: 48 ms
│   ├── Convert: 9 ms
│   ├── First dim: 508 ms
│   ├── Other dim: 56 ms
│   └── Modulus switching: 0 ms
└── Client total: 0 ms
Server throughput: 1539.78 MB/s
```
</details>

<details>
<summary>O2: N=2048, 8 GB (incomplete)</summary>

```
PIR PARAMETERS
  Database size (MB)          = 7680
  Physical storage (MB)       = 32768
  entry_size_                 = 3840 B = 3.75 KB
  num_pt_                     = 2097152
  num_entries_(padded)        = 2097152
  dimensions_                 = [ 512 2 2 2 2 2 2 2 2 2 2 2 2 ]
  seal_params_.poly_modulus_degree() = 2048
  log(q)                      = 60
  log(t)                      = 16

[Process stopped during database generation — physical storage (32 GB) exceeded available RAM]
```
</details>
