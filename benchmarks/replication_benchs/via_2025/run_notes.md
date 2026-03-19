## VIA — Replication Benchmarks

### Implementation

- **Repo:** [VIA](https://github.com/owniai/VIA) (paper authors' C++ implementation)
- **Language:** C++ (~4,000 LOC), custom lattice library (no SEAL/OpenFHE)
- **Dependencies:** Intel HEXL (static library, built from source)

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), 16 cores, 50 GB RAM, AVX-512 (F, DQ, IFMA, BW, CD, VL, VBMI, VNNI, BITALG, VPOPCNTDQ)
- **Paper:** AMD Ryzen 9 9950X, 128 GB RAM, Ubuntu 22.04.5, clang 19.1.7, single-threaded

**Note:** Compute timings will differ from paper due to CPU difference. Communication sizes are deterministic and should match exactly.

### Build

```bash
# 1. Build Intel HEXL
git clone https://github.com/intel/hexl.git /tmp/intel-hexl
cd /tmp/intel-hexl
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j$(nproc)
cp build/hexl/lib/libhexl.a schemes/VIA/lib/

# 2. Build VIA
cd schemes/VIA
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . -j$(nproc)
# Binary: ./VIA_PIR
```

Compiler: g++ 13.3.0 (Ubuntu 24.04). Paper uses clang 19.1.7 — both produce functionally equivalent code with `-O3 -march=native`.

### Configuration

VIA requires compile-time parameter changes in `src/core.hpp` for different database sizes. Key parameters: `LOG_ROW` and `LOG_COL`.

| Config | Variant | DB Size | LOG_ROW | LOG_COL | Source |
|--------|---------|---------|---------|---------|--------|
| V1     | VIA     | 1 GB    | 6       | 13      | Table 4 |
| V2     | VIA     | 4 GB    | 8       | 13      | Table 4 |
| V3     | VIA     | 32 GB   | 9       | 15      | Table 4 |
| V4     | VIA-C   | 1 GB    | 8       | 12      | Table 4 |
| V5     | VIA-C   | 4 GB    | 9       | 13      | Table 4 |
| V6     | VIA-C   | 32 GB   | 11      | 14      | Table 4 |

VIA-B configs (from Table 2, 1-byte records):

| Config | DB Size | Batch (T) | LOG_ROW | LOG_COL |
|--------|---------|-----------|---------|---------|
| VB1    | 256 MB  | 32        | TBD     | TBD     |
| VB2    | 256 MB  | 256       | TBD     | TBD     |
| VB3    | 1 GB    | 32        | TBD     | TBD     |
| VB4    | 1 GB    | 256       | TBD     | TBD     |

### Running

The binary is interactive. Input format: `VIA_or_VIA-C` `blinded_extraction` `iterations`

```bash
# Example: VIA, no blinded extraction, 5 iterations
echo "0 0 5" | ./VIA_PIR

# Example: VIA-C, no blinded extraction, 5 iterations
echo "1 0 5" | ./VIA_PIR
```

### Results

Run date: 2026-03-11. g++ 13.3.0, single-threaded. 5 trials each, averages computed from rounds 2-5 (round 1 excluded as warmup).

#### Table 1 Replication: VIA (single query, record = 8 bits)

| Config | DB Size | Setup DB (s) | Query Size (KB) | Response Size (KB) | Online Comp (s) | Throughput (GB/s) |
|--------|---------|--------------|-----------------|--------------------|-----------------|--------------------|
| V1     | 1 GB    | 1.495        | 473.13          | 23.0               | 1.043           | 0.96               |
| V2     | 4 GB    | 8.933        | 587.13          | 23.0               | 3.701           | 1.11               |
| V3     | 32 GB   | 52.534       | 674.75          | 23.0               | 28.774          | 1.14               |

Paper reference (AMD 9950X, from PDF Table 1 p.18):

| Config | DB Size | Offline Comp (s) | Query Size (KB) | Response Size (KB) | Online Comp (s) | Throughput (GB/s) |
|--------|---------|-------------------|-----------------|--------------------|-----------------|--------------------|
| V1     | 1 GB    | 1.06              | 473.1           | 15.5               | 0.442           | 2.26               |
| V2     | 4 GB    | 4.195             | 587.1           | 15.5               | 1.361           | 2.94               |
| V3     | 32 GB   | 33.34             | 674.75          | 15.5               | 10.286          | 3.11               |

**VIA timing breakdown (avg rounds 2-5, ms):**

| Config | DMux   | ModSwitch | FirstDim  | RingSwitch | CMux   | Total    |
|--------|--------|-----------|-----------|------------|--------|----------|
| V1     | 3.43   | 1.21      | 796.85    | 168.53     | 72.88  | 1042.72  |
| V2     | 15.46  | 5.48      | 3428.77   | 175.29     | 76.07  | 3701.35  |
| V3     | 36.22  | 11.71     | 27664.05  | 741.73     | 319.61 | 28773.25 |

#### Table 1 Replication: VIA-C (single query, record = 4 bits)

| Config | DB Size | Offline Comm (MB) | Setup DB (s) | Query Size (KB) | Response Size (KB) | Online Comp (s) | Throughput (GB/s) |
|--------|---------|--------------------|--------------|-----------------|--------------------|-----------------|---------------------|
| V4     | 1 GB    | 14.84              | 5.586        | 0.403           | 2.188              | 2.296           | 0.44                |
| V5     | 4 GB    | 14.84              | 17.183       | 0.439           | 2.188              | 7.673           | 0.52                |
| V6     | 32 GB   | 14.84              | 106.037      | 0.494           | 2.188              | 57.205          | 0.56                |

Paper reference (AMD 9950X, from PDF Table 1 p.18):

| Config | DB Size | Offline Comm (MB) | Offline Comp (s) | Query Size (KB) | Response Size (KB) | Online Comp (s) | Throughput (GB/s) |
|--------|---------|--------------------|--------------------|-----------------|--------------------|-----------------|--------------------|
| V4     | 1 GB    | 14.8               | 2.09               | 0.568           | 1.439              | 0.83            | 1.2                |
| V5     | 4 GB    | 14.8               | 7.786              | 0.604           | 1.439              | 2.777           | 1.44               |
| V6     | 32 GB   | 14.8               | 67.539             | 0.659           | 1.439              | 20.307          | 1.58               |

**VIA-C timing breakdown (avg rounds 2-5, ms):**

| Config | Decompress | DMux    | ModSwitch | FirstDim  | CMux   | CRot  | RingSwitch | Total     |
|--------|------------|---------|-----------|-----------|--------|-------|------------|-----------|
| V4     | 254.84     | 143.27  | 5.88      | 1782.45   | 114.59 | 0.066 | 0.078      | 2296.33   |
| V5     | 253.66     | 312.02  | 12.58     | 6910.58   | 246.53 | 0.053 | 0.066      | 7673.41   |
| V6     | 275.28     | 1506.95 | 42.65     | 55002.00  | 420.19 | 0.062 | 0.086      | 57204.65  |

#### Table 2 Replication: VIA-B (batch, 1-byte records)

VIA-B is **not reproducible from the current public upstream codebase**.

Verification performed on 2026-03-12:

- Local checkout matches upstream `origin/main` at commit `f65aa9d`.
- `git ls-remote --heads --tags https://github.com/owniai/VIA.git` returns only `refs/heads/main` and no public tags.
- The official GitHub tree for `main` contains only `README.md`, `include/`, `lib/`, and `src/`; there are no VIA-B or batch-specific source files.
- Full local git history (`git log --all --name-only`) contains no files or symbols matching `VIA_B`, `VIAB`, `batch`, `repack`, `RespComp`, or `qck`.
- Upstream `README.md` documents only `VIA`, `VIA with Blinded Extraction`, `VIA-C`, and `VIA-C with Blinded Extraction`.

Paper reference (Table 2, p.20) for the missing batch implementation:

| Config | DB Size | Batch (T) | Offline Comm (MB) | Query Size (KB) | Response Size (KB) | Replication Status |
|--------|---------|-----------|-------------------|-----------------|--------------------|--------------------|
| VB1    | 256 MB  | 32        | 14.8              | 17.00           | 1.48               | Blocked: no public VIA-B code |
| VB2    | 256 MB  | 256       | 14.8              | 135.9           | 1.81               | Blocked: no public VIA-B code |
| VB3    | 1 GB    | 32        | 14.8              | 18.16           | 1.48               | Blocked: no public VIA-B code |
| VB4    | 1 GB    | 256       | 14.8              | 145.31          | 1.81               | Blocked: no public VIA-B code |

Conclusion: Table 2 cannot be replicated locally without an additional non-public implementation release from the authors.

### Communication Size Analysis

#### VIA Communication — Comparison with Paper

| Config | Metric | Ours (KB) | Paper (KB) | Match? | Notes |
|--------|--------|-----------|------------|--------|-------|
| V1     | Query  | 473.13    | 473.1      | Yes    | Within rounding |
| V2     | Query  | 587.13    | 587.1      | Yes    | Exact match (notes had wrong value 608.88; PDF confirms 587.1) |
| V3     | Query  | 674.75    | 674.75     | Yes    | Exact match |
| V1-V3  | Response | 23.0   | 15.5       | **No** | See note below |

**All VIA query sizes match the paper exactly.**

**Response size discrepancy (23 KB vs 15.5 KB):** The implementation consistently reports 23 KB, while the paper reports 15.5 KB. The implementation outputs 8 RLWE ciphertexts (for d=n1/n2=4 packed records under the modulus-switched modulus chain), while the paper appears to report a single response element. The 23 KB figure equals DEGREE2 * (LOG_MODULUS_Q3 + LOG_MODULUS_Q4) * 8 / 8 / 1024 — the full packed answer before final client-side extraction.

#### VIA-C Communication — Comparison with Paper

| Config | Metric | Ours | Paper | Match? | Notes |
|--------|--------|------|-------|--------|-------|
| V4-V6  | Offline | 14.84 MB | 14.8 MB | Yes | Within rounding |
| V4     | Query  | 0.403 KB | 0.568 KB | **No** | Ours smaller by 0.165 KB |
| V5     | Query  | 0.439 KB | 0.604 KB | **No** | Ours smaller by 0.165 KB |
| V6     | Query  | 0.494 KB | 0.659 KB | **No** | Ours smaller by 0.165 KB |
| V4-V6  | Response | 2.188 KB | 1.439 KB | **No** | See note below |

**VIA-C query size discrepancy:** The implementation consistently reports query sizes exactly 0.165 KB (169 bytes) smaller than the paper across all three database sizes. This fixed delta suggests the paper includes a constant-size component (e.g., PRG seed, index metadata, or rotation parameters) in the query size that the implementation does not count in its communication overhead printout. The scaling across database sizes is otherwise identical.

**VIA-C response size discrepancy (2.188 KB vs 1.439 KB):** Same pattern as VIA — the implementation reports the full RLWE ciphertext pair (2 polynomials of degree 512), while the paper reports the compressed response after final modulus switching to Q4.

#### Communication Summary

**VIA query sizes replicate exactly.** VIA-C query sizes are systematically 0.165 KB smaller (constant offset). Response sizes differ consistently for both variants due to implementation reporting the pre-extraction packed ciphertext vs the paper's post-extraction single-element figure. Offline communication (VIA-C) matches.

### Compute Performance Analysis

**Online computation:**

| Config | Variant | DB Size | Ours (s) | Paper (s) | Slowdown | Notes |
|--------|---------|---------|----------|-----------|----------|-------|
| V1     | VIA     | 1 GB    | 1.043    | 0.442     | 2.36x    | |
| V2     | VIA     | 4 GB    | 3.701    | 1.361     | 2.72x    | |
| V3     | VIA     | 32 GB   | 28.774   | 10.286    | 2.80x    | Memory simulation for >4GB |
| V4     | VIA-C   | 1 GB    | 2.296    | 0.83      | 2.77x    | |
| V5     | VIA-C   | 4 GB    | 7.673    | 2.777     | 2.76x    | |
| V6     | VIA-C   | 32 GB   | 57.205   | 20.307    | 2.82x    | Memory simulation for >2GB |

**Setup/offline computation:**

| Config | Variant | DB Size | Ours (s) | Paper (s) | Slowdown |
|--------|---------|---------|----------|-----------|----------|
| V1     | VIA     | 1 GB    | 1.495    | 1.06      | 1.41x    |
| V2     | VIA     | 4 GB    | 8.933    | 4.195     | 2.13x    |
| V3     | VIA     | 32 GB   | 52.534   | 33.34     | 1.58x    |
| V4     | VIA-C   | 1 GB    | 5.586    | 2.09      | 2.67x    |
| V5     | VIA-C   | 4 GB    | 17.183   | 7.786     | 2.21x    |
| V6     | VIA-C   | 32 GB   | 106.037  | 67.539    | 1.57x    |

**Our system is approximately 2.4-2.8x slower than the paper's AMD 9950X for online computation.** This is expected:
- The AMD 9950X (Zen 5, 2024) has significantly higher IPC and clock speeds than our CPU
- The paper uses clang 19.1.7 which may produce better vectorized code for this workload than g++ 13.3.0
- Both systems support AVX-512IFMA which is critical for VIA's 52-bit integer multiply performance

The online slowdown is consistent across all configs (~2.7x average), with a slight outlier at V1 (2.36x) likely due to the smaller working set fitting better in cache on our machine.

Setup/offline time slowdown is less consistent (1.4-2.7x), which is expected since setup is dominated by NTT conversion and memory allocation patterns that scale differently across architectures.

### Peak Server Memory (RSS)

Measured via `/usr/bin/time -v` wrapping the VIA_PIR binary. Run date: 2026-03-20.

| Config | Variant | DB Size | Peak RSS (KB) | Peak RSS (GB) |
|--------|---------|---------|---------------|---------------|
| V1     | VIA     | 1 GB    | 8,768,128     | 8.36          |
| V2     | VIA     | 4 GB    | 34,056,448    | 32.48         |
| V3     | VIA     | 32 GB   | 35,064,448    | 33.44         |
| V4     | VIA-C   | 1 GB    | 16,992,896    | 16.20         |
| V5     | VIA-C   | 4 GB    | 33,944,064    | 32.37         |
| V6     | VIA-C   | 32 GB   | 34,207,872    | 32.62         |

**Notes:**
- V2, V3, V5, V6 all plateau at ~32-33 GB RSS. This is because the implementation caps physical allocation at 4 GB (VIA) / 2 GB (VIA-C) and simulates larger databases during the first-dimension step.
- VIA-C (V4) uses ~2x more RSS than VIA (V1) for the same 1 GB DB due to the additional compressed query material and conversion key storage.
- V1 (8.4 GB) for a 1 GB DB implies ~8.4x memory overhead from NTT-domain representation + key material.

### Client-Side Timing

Measured from binary output. Averages over rounds 2-5 (round 1 excluded as warmup).

#### VIA (V1-V3)

| Config | DB Size | Query Gen (ms) | Recover (μs) |
|--------|---------|----------------|---------------|
| V1     | 1 GB    | 2.90           | 26            |
| V2     | 4 GB    | 2.87           | 21            |
| V3     | 32 GB   | 3.11           | 31            |

#### VIA-C (V4-V6)

| Config | DB Size | Client Setup (ms) | Query Gen (ms) | Recover (μs) |
|--------|---------|-------------------|----------------|---------------|
| V4     | 1 GB    | 25.69             | 0.48           | 5             |
| V5     | 4 GB    | 25.58             | 0.54           | 10            |
| V6     | 32 GB   | 24.99             | 0.61           | 5             |

**Notes:**
- VIA client query gen (~3 ms) is independent of DB size — only depends on LOG_ROW and LOG_COL.
- VIA-C client query gen (~0.5 ms) is much faster because the query is a compressed LWE sample rather than RLWE ciphertexts.
- VIA-C has an additional client setup phase (~25 ms) for generating the compressed query keys.
- Recover time is negligible for both variants (< 0.1 ms).

### Derived Cross-Scheme Comparison Metrics

The following metrics are computed from the raw benchmark data above to enable standardized cross-scheme comparison (see `schema_v2.jsonc`).

#### Rate (useful_bytes / response_bytes)

| Config | Variant | Record Size | Response Size | Rate |
|--------|---------|-------------|---------------|------|
| V1-V3  | VIA     | 1 B (8 bits) | 23.0 KB | 0.0000425 |
| V4-V6  | VIA-C   | 0.5 B (4 bits) | 2.188 KB | 0.000223 |

VIA is optimized for single-bit/byte retrieval from very large databases. Rate is inherently low because the response contains full RLWE ciphertexts for a single record.

#### Throughput (DB_size / server_online_time)

| Config | DB Size | Server Time (s) | Throughput (GB/s) |
|--------|---------|------------------|-------------------|
| V1     | 1 GB    | 1.043            | 0.96              |
| V2     | 4 GB    | 3.701            | 1.08              |
| V3     | 32 GB   | 28.774           | 1.11              |
| V4     | 1 GB    | 2.296            | 0.44              |
| V5     | 4 GB    | 7.673            | 0.52              |
| V6     | 32 GB   | 57.205           | 0.56              |

#### Client Storage

| Variant | Persistent Client Storage | Notes |
|---------|--------------------------|-------|
| VIA     | 0 MB | Stateless — no offline phase, no client-side hint |
| VIA-C   | 14.84 MB | = offline hint download (compressed query material) |

#### Preprocessing Throughput (DB_size / setup_time)

| Config | DB Size | Setup Time (s) | Preprocessing Throughput (MB/s) |
|--------|---------|-----------------|--------------------------------|
| V1     | 1 GB    | 1.495           | 685  |
| V2     | 4 GB    | 8.933           | 459  |
| V3     | 32 GB   | 52.534          | 624  |
| V4     | 1 GB    | 5.586           | 183  |
| V5     | 4 GB    | 17.183          | 238  |
| V6     | 32 GB   | 106.037         | 309  |

Note: VIA/VIA-C setup is server-side NTT preprocessing of the database. For DBs > 4 GB (VIA) / > 2 GB (VIA-C), the implementation simulates larger databases, so these throughput values are approximations.

### Issues & Observations

- **Compile-time config:** Database size parameters are compile-time constants in `core.hpp`. Each config requires a recompile.
- **Memory simulation:** For VIA databases > 4 GB and VIA-C databases > 2 GB, the implementation allocates only 4 GB / 2 GB respectively and simulates larger databases during the first-dimension step. This means the 32 GB configs (V3, V6) are timing approximations, not exact measurements on a full database.
- **Interactive binary:** The test binary reads from stdin. Use `echo "args" | ./VIA_PIR` for scripted runs.
- **VIA-B:** As of 2026-03-12, the public upstream repo exposes only one branch (`main`) and contains no VIA-B / batch source files. Table 2 remains blocked on upstream code availability.
- **Warmup effect:** Round 1 is consistently slower than subsequent rounds (likely due to cache warming, memory allocation). We report averages over rounds 2-5.
- **Communication size reporting:** The implementation's communication overhead printout does not match paper values exactly. See detailed analysis above. The discrepancies appear to be in how components are counted, not in the underlying cryptographic parameters.

### Raw Output

<details>
<summary>V1: VIA, 1 GB (LOG_ROW=6, LOG_COL=13)</summary>

```
Database size: 1024 MB, Row: 64, Col: 8192
Online upload: 473.125 KiB, Online download: 23 KiB
Setup Database: 1.49524 s

Round 1: Total Answer Time: 1174.99 ms
Round 2: Total Answer Time: 1031.16 ms
Round 3: Total Answer Time: 1051.26 ms
Round 4: Total Answer Time: 1068.45 ms
Round 5: Total Answer Time: 1020.08 ms
```
</details>

<details>
<summary>V2: VIA, 4 GB (LOG_ROW=8, LOG_COL=13)</summary>

```
Database size: 4096 MB, Row: 256, Col: 8192
Online upload: 587.125 KiB, Online download: 23 KiB
Setup Database: 8.93271 s

Round 1: Total Answer Time: 3790.13 ms
Round 2: Total Answer Time: 3808.27 ms
Round 3: Total Answer Time: 3707.72 ms
Round 4: Total Answer Time: 3633.25 ms
Round 5: Total Answer Time: 3656.16 ms
```
</details>

<details>
<summary>V3: VIA, 32 GB (LOG_ROW=9, LOG_COL=15)</summary>

```
Database size: 32768 MB, Row: 512, Col: 32768
Online upload: 674.75 KiB, Online download: 23 KiB
Setup Database: 52.5344 s

Round 1: Total Answer Time: 30754.3 ms
Round 2: Total Answer Time: 28680.7 ms
Round 3: Total Answer Time: 28534.7 ms
Round 4: Total Answer Time: 28492.5 ms
Round 5: Total Answer Time: 29386.1 ms
```
</details>

<details>
<summary>V4: VIA-C, 1 GB (LOG_ROW=8, LOG_COL=12)</summary>

```
Database size: 1024 MB, Row: 256, Col: 4096
Offline upload: 14.8428 MiB
Online upload: 0.402832 KiB, Online download: 2.1875 KiB
Setup Database: 5.58604 s

Round 1: Total Answer Time: 2361.23 ms
Round 2: Total Answer Time: 2254.14 ms
Round 3: Total Answer Time: 2283.96 ms
Round 4: Total Answer Time: 2395.19 ms
Round 5: Total Answer Time: 2252.21 ms
```
</details>

<details>
<summary>V5: VIA-C, 4 GB (LOG_ROW=9, LOG_COL=13)</summary>

```
Database size: 4096 MB, Row: 512, Col: 8192
Offline upload: 14.8428 MiB
Online upload: 0.439453 KiB, Online download: 2.1875 KiB
Setup Database: 17.1825 s

Round 1: Total Answer Time: 7986.42 ms
Round 2: Total Answer Time: 7625.56 ms
Round 3: Total Answer Time: 7688.47 ms
Round 4: Total Answer Time: 7764.69 ms
Round 5: Total Answer Time: 7612.92 ms
```
</details>

<details>
<summary>V6: VIA-C, 32 GB (LOG_ROW=11, LOG_COL=14)</summary>

```
Database size: 32768 MB, Row: 2048, Col: 16384
Offline upload: 14.8428 MiB
Online upload: 0.494385 KiB, Online download: 2.1875 KiB
Setup Database: 106.037 s

Round 1: Total Answer Time: 56637.8 ms
Round 2: Total Answer Time: 56489.1 ms
Round 3: Total Answer Time: 56308.5 ms
Round 4: Total Answer Time: 57671.3 ms
Round 5: Total Answer Time: 58350.2 ms
```
</details>
