## YPIR — Replication Benchmarks

### Implementation

- **Repo:** [YPIR](https://github.com/menonsamir/ypir) (paper authors' Rust implementation)
- **Local checkout:** `a73e550`
- **Language:** Rust with a small C++ matrix-multiplication kernel
- **Dependencies:** Rust toolchain, C++ compiler with AVX-512 support

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), 16 vCPUs, Intel Core i7-11700F, 50 GiB RAM, AVX-512 (`avx512f`, `avx512dq`, `avx512ifma`, `avx512bw`, `avx512vl`, `avx512vbmi`, `avx512_vnni`, `avx512_bitalg`, `avx512_vpopcntdq`)
- **Paper:** Amazon EC2 `r6i.16xlarge`, Intel Xeon Platinum 8375C @ 2.9 GHz, 64 vCPUs, 512 GB RAM, single-threaded

**Note:** Compute timings will differ from the paper due to CPU and memory-bandwidth differences. Communication sizes are deterministic and should match exactly up to paper rounding.

### Build

```bash
cd schemes/YPIR
cargo build --release
# Binary: ./target/release/run
```

Toolchain notes:

- The repo pins `nightly-2024-02-07` in `rust-toolchain.toml`.
- Local build succeeded with `cargo 1.91.0-dev` / `rustc 1.91.0-dev`.
- Build emitted warnings about `stdarch_x86_avx512` now being stable and about elided lifetimes in `server.rs`, but produced a working optimized binary.

### Configs

Paper Table 2 reports YPIR single-bit retrieval at 1 GB, 8 GB, and 32 GB.

| Config | DB Size | num_items argument | item_size_bits | num_clients | trials |
|--------|---------|--------------------|----------------|-------------|--------|
| Y1     | 1 GB    | `2^33`             | 1              | 1           | 5      |
| Y2     | 8 GB    | `2^36`             | 1              | 1           | 5      |
| Y3     | 32 GB   | `2^38`             | 1              | 1           | 5      |

Supplementary local run (useful for paper Table 3 style breakdown):

| Config | DB Size | num_items argument | item_size_bits | num_clients | trials |
|--------|---------|--------------------|----------------|-------------|--------|
| Y4     | 4 GB    | `2^35`             | 1              | 1           | 5      |

### Running

```bash
cd schemes/YPIR

./target/release/run 8589934592 1 1 5 ../../results/ypir_1gb.json > ../../results/ypir_1gb.stdout.log
./target/release/run 34359738368 1 1 5 ../../results/ypir_4gb.json > ../../results/ypir_4gb.stdout.log
./target/release/run 68719476736 1 1 5 ../../results/ypir_8gb.json > ../../results/ypir_8gb.stdout.log

# 32 GB raw JSON already existed in the workspace and was reused:
# ../../results/ypir_32gb.json
```

### Results

Run date: 2026-03-12. Single process, `num_clients=1`, 5 trials per config, with warmup excluded by the implementation for the reported `online.serverTimeMs`.

The implementation reports exact byte counts. Tables below convert those byte counts to KiB / MiB for exact local values, then compare them to the paper's rounded KB / MB labels.

#### Table 2 Replication: YPIR (single-bit retrieval)

| Config | DB Size | Prep Throughput (MiB/s) | Upload (KiB) | Download (KiB) | Server Time (s) | Throughput (GiB/s) |
|--------|---------|--------------------------|--------------|----------------|-----------------|--------------------|
| Y1     | 1 GB    | 48.95                    | 846.0        | 12.0           | 0.140           | 7.14               |
| Y2     | 8 GB    | 56.55                    | 1486.0       | 12.0           | 0.856           | 9.35               |
| Y3     | 32 GB   | 58.55                    | 2510.0       | 12.0           | 2.944           | 10.87              |

Paper reference (Table 2, p.20):

| Config | DB Size | Prep Throughput | Upload | Download | Server Time | Throughput |
|--------|---------|-----------------|--------|----------|-------------|------------|
| Y1     | 1 GB    | 39 MB/s         | 846 KB | 12 KB    | 129 ms      | 7.8 GB/s   |
| Y2     | 8 GB    | 46 MB/s         | 1.5 MB | 12 KB    | 687 ms      | 11.6 GB/s  |
| Y3     | 32 GB   | 48 MB/s         | 2.5 MB | 12 KB    | 2.64 s      | 12.1 GB/s  |

#### Table 2 Comparison Summary

| Config | Metric | Ours | Paper | Match? | Notes |
|--------|--------|------|-------|--------|-------|
| Y1     | Upload | 846.0 KiB | 846 KB | Yes | Exact after KiB rounding |
| Y2     | Upload | 1486.0 KiB | 1.5 MB | Yes | 1486 KiB = 1.45 MiB; paper rounds to 1.5 MB |
| Y3     | Upload | 2510.0 KiB | 2.5 MB | Yes | 2510 KiB = 2.45 MiB; paper rounds to 2.5 MB |
| Y1-Y3  | Download | 12.0 KiB | 12 KB | Yes | Exact |
| Y1     | Server Time | 140 ms | 129 ms | Close | 1.09x slower |
| Y2     | Server Time | 856 ms | 687 ms | Close | 1.25x slower |
| Y3     | Server Time | 2944 ms | 2640 ms | Close | 1.12x slower |

**Communication replication:** Upload and download sizes match the paper within the paper's displayed rounding.

**Compute replication:** Local online times are 1.09x to 1.25x slower than the paper's `r6i.16xlarge` measurements, which is plausible given the weaker local CPU and lower per-core memory bandwidth.

**Preprocessing replication:** Local prep throughput is actually higher than the paper's reported numbers (48.95 / 56.55 / 58.55 MiB/s vs. 39 / 46 / 48 MB/s). This likely reflects implementation, toolchain, and measurement-environment differences rather than a protocol discrepancy.

#### Supplementary: 4 GB Local Run

This config is not part of paper Table 2, but it is useful as an intermediate point and for the paper's Table 3 style breakdown.

| Config | DB Size | Prep Throughput (MiB/s) | Upload (KiB) | Download (KiB) | Server Time (s) | Throughput (GiB/s) |
|--------|---------|--------------------------|--------------|----------------|-----------------|--------------------|
| Y4     | 4 GB    | 53.69                    | 1230.0       | 12.0           | 0.459           | 8.71               |

Indicative breakdown fields from the 4 GB JSON:

| Config | First Pass (ms) | Second Pass (ms) | Packing (ms) | StdDev Total (ms) |
|--------|------------------|------------------|--------------|-------------------|
| Y4     | 350              | 33               | 42           | 49.39             |

**Important caveat:** in the current implementation, `online.serverTimeMs` is averaged across post-warmup trials, but `firstPassTimeMs`, `secondPassTimeMs`, and `ringPackingTimeMs` are copied from the first retained measurement rather than averaged. They are useful as indicative breakdowns, not as rigorously averaged Table 3 replications.

### Issues & Observations

- **32 GB result source:** `results/ypir_32gb.json` already existed in the workspace with timestamp `2026-03-12 02:32:54 +0900`, and was reused as the 32 GB raw result. A same-turn rerun was started but exceeded 20 minutes while holding about 33.5 GiB RSS, so it was aborted to avoid burning more time without improving result quality.
- **8 GB runtime anomaly:** The 8 GB run completed successfully but took substantially longer wall-clock time than naive interpolation from 4 GB and 32 GB would suggest. The implementation remained CPU-bound at ~100% with about 8.6 GiB RSS and no swap usage.
- **Single-threaded intent:** Paper measurements are single-threaded. These local runs also used a single process with `num_clients=1`; no parallel query batching was used.
- **Breakdown aggregation quirk:** Only `online.serverTimeMs` and `stdDevServerTimeMs` are averaged across retained trials. Other phase-specific timing fields are not.
- **Build warnings:** The local toolchain emits harmless warnings for a now-stable AVX-512 feature gate and for elided lifetime syntax in `server.rs`.

### Raw Output

<details>
<summary>Y1: 1 GB</summary>

```text
Running YPIR (w/ DoublePIR) on a database of 8589934592 bits, and performing cross-client batching over 1 clients.
The server performance measurement will be averaged over 5 trials.
Measurement completed. See the README for details on what the following fields mean.
Result:
{
  "offline": {
    "uploadBytes": 0,
    "downloadBytes": 0,
    "serverTimeMs": 20920,
    "clientTimeMs": 0,
    "simplepirPrepTimeMs": 16259,
    "simplepirHintBytes": 117440512,
    "doublepirHintBytes": 14680064
  },
  "online": {
    "uploadBytes": 866304,
    "downloadBytes": 12288,
    "simplepirQueryBytes": 131072,
    "doublepirQueryBytes": 229376,
    "simplepirRespBytes": 114688,
    "doublepirRespBytes": 12288,
    "serverTimeMs": 140,
    "clientQueryGenTimeMs": 364,
    "clientDecodeTimeMs": 0,
    "firstPassTimeMs": 107,
    "secondPassTimeMs": 12,
    "ringPackingTimeMs": 44,
    "sqrtNBytes": 32768,
    "allServerTimesMs": [165, 145, 132, 125, 133],
    "stdDevServerTimeMs": 14.057026712644463
  }
}
```
</details>

<details>
<summary>Y4: 4 GB</summary>

```text
Running YPIR (w/ DoublePIR) on a database of 34359738368 bits, and performing cross-client batching over 1 clients.
The server performance measurement will be averaged over 5 trials.
Measurement completed. See the README for details on what the following fields mean.
Result:
{
  "offline": {
    "uploadBytes": 0,
    "downloadBytes": 0,
    "serverTimeMs": 76293,
    "clientTimeMs": 0,
    "simplepirPrepTimeMs": 67275,
    "simplepirHintBytes": 234881024,
    "doublepirHintBytes": 14680064
  },
  "online": {
    "uploadBytes": 1259520,
    "downloadBytes": 12288,
    "simplepirQueryBytes": 262144,
    "doublepirQueryBytes": 458752,
    "simplepirRespBytes": 229376,
    "doublepirRespBytes": 12288,
    "serverTimeMs": 459,
    "clientQueryGenTimeMs": 1077,
    "clientDecodeTimeMs": 0,
    "firstPassTimeMs": 350,
    "secondPassTimeMs": 33,
    "ringPackingTimeMs": 42,
    "sqrtNBytes": 65536,
    "allServerTimesMs": [427, 422, 416, 544, 486],
    "stdDevServerTimeMs": 49.38825771375216
  }
}
```
</details>

<details>
<summary>Y2: 8 GB</summary>

```text
Running YPIR (w/ DoublePIR) on a database of 68719476736 bits, and performing cross-client batching over 1 clients.
The server performance measurement will be averaged over 5 trials.
Measurement completed. See the README for details on what the following fields mean.
Result:
{
  "offline": {
    "uploadBytes": 0,
    "downloadBytes": 0,
    "serverTimeMs": 144867,
    "clientTimeMs": 0,
    "simplepirPrepTimeMs": 136088,
    "simplepirHintBytes": 234881024,
    "doublepirHintBytes": 14680064
  },
  "online": {
    "uploadBytes": 1521664,
    "downloadBytes": 12288,
    "simplepirQueryBytes": 524288,
    "doublepirQueryBytes": 458752,
    "simplepirRespBytes": 229376,
    "doublepirRespBytes": 12288,
    "serverTimeMs": 856,
    "clientQueryGenTimeMs": 1514,
    "clientDecodeTimeMs": 0,
    "firstPassTimeMs": 831,
    "secondPassTimeMs": 35,
    "ringPackingTimeMs": 48,
    "sqrtNBytes": 65536,
    "allServerTimesMs": [916, 949, 845, 772, 800],
    "stdDevServerTimeMs": 67.17320894523351
  }
}
```
</details>

<details>
<summary>Y3: 32 GB (raw JSON reused from existing workspace artifact)</summary>

```json
{
  "offline": {
    "uploadBytes": 0,
    "downloadBytes": 0,
    "serverTimeMs": 559632,
    "clientTimeMs": 0,
    "simplepirPrepTimeMs": 538710,
    "simplepirHintBytes": 469762048,
    "doublepirHintBytes": 14680064
  },
  "online": {
    "uploadBytes": 2570240,
    "downloadBytes": 12288,
    "simplepirQueryBytes": 1048576,
    "doublepirQueryBytes": 917504,
    "simplepirRespBytes": 458752,
    "doublepirRespBytes": 12288,
    "serverTimeMs": 2944,
    "clientQueryGenTimeMs": 3044,
    "clientDecodeTimeMs": 0,
    "firstPassTimeMs": 3263,
    "secondPassTimeMs": 67,
    "ringPackingTimeMs": 38,
    "sqrtNBytes": 131072,
    "allServerTimesMs": [3371, 3105, 2964, 2701, 2579],
    "stdDevServerTimeMs": 283.16920736549025
  }
}
```
</details>
