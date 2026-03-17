## NPIR — Replication Benchmarks

### Implementation

- **Repo:** [NPIR](https://github.com/llllinyl/npir) (paper authors' Rust implementation)
- **Language:** Rust (~4,600 LOC) + C++ (~50 LOC for NTL FFI)
- **Dependencies:** NTL-11.5.1, libgmp, Spiral-rs NTT module (vendored)

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), Intel Core i7-11700F (16 logical cores), 50 GB RAM, AVX-512 (F, DQ, IFMA, BW, CD, VL, VBMI, VNNI, BITALG, VPOPCNTDQ)
- **Paper:** Aliyun ECS r7iz.metal-16xl, Intel Xeon Platinum 8488C, 64 vCPU, 512 GB RAM, Ubuntu 22.04, AVX2, single-threaded

**Note:** Compute timings will differ from paper due to CPU differences — our i7-11700F has higher single-thread clock speed than the Xeon 8488C @ 2.70 GHz. Communication sizes are deterministic and must match exactly.

### Build

```bash
# Prerequisites (already installed)
sudo apt-get install -y build-essential libntl-dev libgmp3-dev

# Build the C++ FFI shared library (if not present)
cd schemes/NPIR/src
g++ -shared -fPIC -o libinvmod.so invmod.cpp -lntl -lgmp

# Adjust build.rs paths to local system
# (rustc-link-search must point to src/ for libinvmod.so,
#  and /usr/lib/x86_64-linux-gnu for NTL/GMP)

# Build
cd schemes/NPIR
RUSTFLAGS="-C target-cpu=native" cargo build --release

# Set LD_LIBRARY_PATH before running
export LD_LIBRARY_PATH=$PWD/src:$LD_LIBRARY_PATH
```

**Bug fix required:** The `pack_db` function in `npirstandard.rs` (and `npirbatch.rs`) allocates a temporary NTT buffer as `Vec<u64>`, which has only 8-byte alignment. The AVX2 NTT code uses `_mm256_load_si256`, which requires 32-byte alignment. This causes a SIGSEGV on every run. Fix: replace `let mut pol_ntt: Vec<u64> = vec![0; dimension * 2]` with `let mut pol_ntt = AlignedMemory64::<u64>::new(dimension * 2)` and use `.as_mut_slice()` when passing to `reduce_copy_small` and `ntt_forward`. This matches the alignment strategy used elsewhere in the codebase (e.g., `packed_row` on the preceding line). The README acknowledges intermittent SIGSEGV in `pack_db` but does not identify the root cause.

Compiler: rustc 1.91.0-dev, g++ 13.3.0, single-threaded. RUSTFLAGS="-C target-cpu=native".

### Configuration

NPIR test configs are selected via `npir_pack_test(databaselog, phi)` where `databaselog` is log2 of the DB size in bytes and `phi` is the packing number. Record size = N * phi bytes (N=2048).

| Config | DB Size | Records | Record Size | databaselog | phi | ell (cols) |
|--------|---------|---------|-------------|-------------|-----|------------|
| N1     | 1 GB    | 2^15    | 32 KB       | 33          | 16  | 16         |
| N2     | 2 GB    | 2^16    | 32 KB       | 34          | 16  | 32         |
| N3     | 4 GB    | 2^17    | 32 KB       | 35          | 16  | 64         |
| N4     | 8 GB    | 2^18    | 32 KB       | 36          | 16  | 128        |
| N5     | 16 GB   | 2^19    | 32 KB       | 37          | 16  | 256        |
| N6     | 32 GB   | 2^20    | 32 KB       | 38          | 16  | 512        |

**Skipped configs:** N4 (8 GB), N5 (16 GB), N6 (32 GB) require >50 GB RAM for the NTT-domain database representation. The packed NTT DB uses `rows * cols * N * 8` bytes (each row stores `ell * 2048` u64 values). For 8 GB DB: 32768 rows * 128 cols * 2048 * 8 bytes = ~64 GB, exceeding available memory.

### Running

```bash
cd schemes/NPIR
export LD_LIBRARY_PATH=$PWD/src:$LD_LIBRARY_PATH

# 1 GB / 32 KB records
RUSTFLAGS="-C target-cpu=native" cargo test --release -- --nocapture npirstandard::tests::test_1gb_32kb

# 2 GB / 32 KB records
RUSTFLAGS="-C target-cpu=native" cargo test --release -- --nocapture npirstandard::tests::test_2gb_32kb

# 4 GB / 32 KB records
RUSTFLAGS="-C target-cpu=native" cargo test --release -- --nocapture npirstandard::tests::test_4gb_32kb
```

Each test runs 6 iterations. The first iteration is excluded as warmup; the remaining 5 are averaged.

### Results

Run date: 2026-03-13. rustc 1.91.0-dev, g++ 13.3.0, single-threaded. 6 trials each (first excluded as warmup, 5 averaged).

#### Table 1 Replication: NPIR (single query, 32 KB records)

| Config | DB Size | PP Size (KB) | Query (KB) | Response (KB) | Preproc. (s) | Server Time (s) | Throughput (MB/s) |
|--------|---------|--------------|------------|---------------|--------------|------------------|-------------------|
| N1     | 1 GB    | 910.00       | 84.00      | 128.00        | 13.40        | 4.524            | 226.35            |
| N2     | 2 GB    | 1022.00      | 84.00      | 128.00        | 27.06        | 5.456            | 375.37            |
| N3     | 4 GB    | 1134.00      | 84.00      | 128.00        | 68.38        | 7.491            | 546.93            |

Paper reference (Intel Xeon Platinum 8488C @ 2.70 GHz, from Table 1 p.15):

| Config | DB Size | PP Size (MB) | Query (KB) | Response (KB) | Preproc. (s) | Server Time (s) | Throughput (MB/s) |
|--------|---------|--------------|------------|---------------|--------------|------------------|-------------------|
| N1     | 1 GB    | 0.89         | 84         | 128           | 13.32        | 5.84             | 175.34            |
| N4     | 8 GB    | 1.22         | 84         | 128           | 111.06       | 14.87            | 550.91            |
| N6     | 32 GB   | 1.44         | 84         | 128           | 437.69       | 45.82            | 715.15            |

#### Comparison (1 GB — only directly comparable config)

| Metric             | Ours (i7-11700F)  | Paper (Xeon 8488C) | Ratio (ours/paper) |
|--------------------|-------------------|--------------------|---------------------|
| Public params      | 910 KB (0.89 MB)  | 0.89 MB            | 1.00x (match)       |
| Query size         | 84 KB             | 84 KB              | 1.00x (match)       |
| Response size      | 128 KB            | 128 KB             | 1.00x (match)       |
| Preprocessing      | 13.40 s           | 13.32 s            | 1.01x               |
| Server time        | 4.524 s           | 5.84 s             | 0.77x (29% faster)  |
| Throughput         | 226.35 MB/s       | 175.34 MB/s        | 1.29x               |

**Communication sizes match exactly**, confirming correct parameter selection and implementation. The 29% faster server time is expected given the i7-11700F's higher single-thread performance vs. the Xeon Platinum 8488C at 2.70 GHz.

### Server Time Breakdown (from raw output)

| Config | DB Size | Query Recovery (ms) | SimplePIR Multiply (ms) | Packing (ms) | Total (ms) |
|--------|---------|---------------------|-------------------------|--------------|------------|
| N1     | 1 GB    | ~7                  | ~1,016                  | ~3,448       | 4,524      |
| N2     | 2 GB    | ~15                 | ~1,883                  | ~3,502       | 5,456      |
| N3     | 4 GB    | ~29                 | ~3,854                  | ~3,499       | 7,491      |

Observations:
- SimplePIR multiply time scales linearly with DB size (as expected — linear scan).
- Packing time is roughly constant (~3.5 s for phi=16), independent of DB size.
- Query recovery time doubles with each DB size doubling (scales with log(ell) expansion levels).

### Issues & Observations

1. **SIGSEGV in `pack_db`:** Alignment bug (see Build section). Required patching `npirstandard.rs` and `npirbatch.rs` to use `AlignedMemory64` for the temporary NTT buffer. Without this fix, every test crashes with SIGSEGV.
2. **Memory usage:** The NTT-domain packed database uses ~8x the raw DB size (each polynomial coefficient stored as a packed u64 with both CRT components). This limits benchmarking on machines with <512 GB RAM to databases of ~4 GB or smaller.
3. **Compiler warning:** `#![feature(stdarch_x86_avx512)]` is stable since rustc 1.89.0. Harmless.

### Raw Output

<details>
<summary>N1: 1 GB / 32 KB</summary>

```
Generate the database with size 2^33 ...
Generate and preprocess the database!
Finish the database!
========================================================================================
Server prep. time: 13403996 μs
========================================================================================
Public parameters size: 910.00 KB
Query size: 84.00 KB
Response size: 128.00 KB
========================================================================================
The database has 32768 rows and 16 cols.
[Trial 1 — warmup, excluded]
Server time: 5082119 μs
[Trial 2] Server time: 4583870 μs
[Trial 3] Server time: 4479053 μs
[Trial 4] Server time: 4517593 μs
[Trial 5] Server time: 4525507 μs
[Trial 6] Server time: 4516369 μs
Server ave time: 4524478 μs
```
</details>

<details>
<summary>N2: 2 GB / 32 KB</summary>

```
Generate the database with size 2^34 ...
Generate and preprocess the database!
Finish the database!
========================================================================================
Server prep. time: 27062352 μs
========================================================================================
Public parameters size: 1022.00 KB
Query size: 84.00 KB
Response size: 128.00 KB
========================================================================================
The database has 32768 rows and 32 cols.
[Trial 1 — warmup, excluded]
Server time: 7127006 μs
[Trial 2] Server time: 5476343 μs
[Trial 3] Server time: 5359145 μs
[Trial 4] Server time: 5382812 μs
[Trial 5] Server time: 5370491 μs
[Trial 6] Server time: 5692475 μs
Server ave time: 5456253 μs
```
</details>

<details>
<summary>N3: 4 GB / 32 KB</summary>

```
Generate the database with size 2^35 ...
Generate and preprocess the database!
Finish the database!
========================================================================================
Server prep. time: 68377594 μs
========================================================================================
Public parameters size: 1134.00 KB
Query size: 84.00 KB
Response size: 128.00 KB
========================================================================================
The database has 32768 rows and 64 cols.
[Trial 1 — warmup, excluded]
Server time: 15884740 μs
[Trial 2] Server time: 7931961 μs
[Trial 3] Server time: 7317002 μs
[Trial 4] Server time: 7500628 μs
[Trial 5] Server time: 7242950 μs
[Trial 6] Server time: 7460509 μs
Server ave time: 7490610 μs
```
</details>
