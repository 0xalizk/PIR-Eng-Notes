## Spiral — Replication Benchmarks

### Implementation

- **Paper:** Spiral: Fast, High-Rate Single-Server PIR via FHE Composition (ePrint 2022/368)
- **Repo:** [spiral](https://github.com/menonsamir/spiral) (paper authors' C++ implementation)
- **Language:** C++ (~4,000 LOC), uses Intel HEXL for NTT
- **Dependencies:** Intel HEXL 1.2.5 (via vcpkg), CMake, Python 3

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), Intel Core i7-11700F (16 vCPU), 50 GB RAM, AVX-512 (F, DQ, IFMA, BW, CD, VL, VBMI, VNNI, BITALG, VPOPCNTDQ)
- **Paper:** AWS r6i.metal (Intel Xeon Platinum 8375C, 64 vCPU, 512 GB RAM), single-threaded

**Note:** Compute timings will differ from paper due to CPU difference (i7-11700F vs Xeon 8375C). Communication sizes are deterministic and should match exactly.

### Build

```bash
# Prerequisites: vcpkg with hexl installed at ~/vcpkg
# git-lfs required for parameter pickle files

# Modified CMakeLists.txt: changed clang++-12 to clang++-18

# Build + run is automated via select_params.py:
cd schemes/Spiral/
python3 select_params.py 20 256 --show-output --trials 3          # Spiral, 2^20 x 256B
python3 select_params.py 18 30720 --show-output --trials 3        # Spiral, 2^18 x 30KB
python3 select_params.py 14 102400 --show-output --trials 3       # Spiral, 2^14 x 100KB
python3 select_params.py 20 256 --pack --show-output --trials 3   # SpiralPack, 2^20 x 256B
python3 select_params.py 18 30720 --pack --show-output --trials 3 # SpiralPack, 2^18 x 30KB
python3 select_params.py 14 102400 --pack --show-output --trials 3 # SpiralPack, 2^14 x 100KB
python3 select_params.py 18 30720 --direct-upload --show-output --trials 3        # SpiralStream, 2^18 x 30KB
python3 select_params.py 18 30720 --direct-upload --pack --show-output --trials 3 # SpiralStreamPack, 2^18 x 30KB
```

Compiler: clang++-18 (Ubuntu 18.1.3). Paper uses clang 12+. Build uses `-O3 -march=native`.

### Configuration

The `select_params.py` script automatically selects optimal parameters from a pre-computed parameter space (~576K candidates). The script builds the binary with compile-time parameters and runs the benchmark.

Variants:

| Variant          | Flags                    | Description |
|------------------|--------------------------|-------------|
| Spiral           | (none)                   | Base: compressed query, matrix Regev + GSW composition |
| SpiralPack       | `--pack`                 | Response packing for higher rate |
| SpiralStream     | `--direct-upload`        | Client sends expanded encodings (no query expansion) |
| SpiralStreamPack | `--direct-upload --pack` | Both optimizations combined |

### Results

Run date: 2026-03-13. clang++-18 (Ubuntu 18.1.3), single-threaded. 3 trials each, averages reported.

#### Database: 2^20 x 256B (268 MB) — small records

| Metric | Spiral (ours) | Spiral (paper) | SpiralPack (ours) | SpiralPack (paper) |
|--------|---------------|----------------|--------------------|--------------------|
| Param Size | 14 MB | 14 MB | 14 MB | 14 MB |
| Query Size | 14 KB | 14 KB | 14 KB | 14 KB |
| Response Size | 20,992 B (20.5 KB) | 21 KB | 20,480 B (20 KB) | 20 KB |
| Total Server Time (s) | 1.129 | 1.68 | 0.884 | 1.37 |
| Expansion (us) | 453,317 | -- | 435,381 | -- |
| Conversion (us) | 270,020 | -- | 36,673 | -- |
| First-Dim (us) | 197,306 | -- | 191,503 | -- |
| Folding (us) | 208,199 | -- | 219,278 | -- |
| Rate | 0.0122 | 0.0122 | 0.0125 | 0.0125 |
| Correctness | Pass | -- | Pass | -- |

#### Database: 2^18 x 30KB (7.9 GB) — moderate records

| Metric | Spiral (ours) | Spiral (paper) | SpiralPack (ours) | SpiralPack (paper) | SpiralStream (ours) | SpiralStream (paper) | SpiralStreamPack (ours) | SpiralStreamPack (paper) |
|--------|---------------|----------------|--------------------|--------------------|---------------------|----------------------|-------------------------|--------------------------|
| Param Size | 18 MB | 18 MB | 18 MB | 18 MB | 2.6 MB | 3 MB | 15 MB | 16 MB |
| Query Size | 14 KB | 14 KB | 14 KB | 14 KB | 15 MB | 15 MB | 29 MB | 30 MB |
| Response Size | 83,968 B (82 KB) | 84 KB | 86,016 B (84 KB) | 86 KB | 62,464 B (61 KB) | 62 KB | 96,256 B (94 KB) | 96 KB |
| Total Server Time (s) | 16.11 | 24.52 | 11.03 | 17.69 | 5.91 | 9.00 | 3.60 | 5.33 |
| First-Dim (us) | 6,639,039 | -- | 5,950,296 | -- | 3,200,374 | -- | 3,141,136 | -- |
| Folding (us) | 8,323,188 | -- | 3,814,967 | -- | 902,202 | -- | 413,523 | -- |
| Rate | 0.366 | 0.3573 | 0.357 | 0.3488 | 0.492 | 0.4803 | 0.319 | 0.3117 |
| Throughput (MB/s) | 533 | 322 | 779 | 444 | 1,363 | 874 | 2,238 | 1,480 |
| Correctness | Pass | -- | Pass | -- | Pass | -- | Pass | -- |

#### Database: 2^14 x 100KB (1.6 GB) — large records

| Metric | Spiral (ours) | Spiral (paper) | SpiralPack (ours) | SpiralPack (paper) |
|--------|---------------|----------------|--------------------|--------------------|
| Param Size | 14 MB | 17 MB | 47 MB | 47 MB |
| Query Size | 14 KB | 14 KB | 14 KB | 14 KB |
| Response Size | 272,896 B (267 KB) | 242 KB | 188,416 B (184 KB) | 188 KB |
| Total Server Time (s) | 3.18 | 4.92 | 2.97 | 4.58 |
| First-Dim (us) | 1,348,802 | -- | 1,535,269 | -- |
| Folding (us) | 1,170,589 | -- | 641,336 | -- |
| Rate | 0.375 | 0.4129 | 0.543 | 0.5307 |
| Correctness | Pass | -- | Pass | -- |

### Comparison with Paper

#### Communication Sizes

Communication sizes are deterministic and should match paper values exactly.

| Config | Metric | Ours | Paper | Match? |
|--------|--------|------|-------|--------|
| Spiral 2^20x256B | Response | 20,992 B | ~21 KB | Yes |
| Spiral 2^20x256B | Query | 14,336 B | 14 KB | Yes |
| Spiral 2^18x30KB | Response | 83,968 B | 84 KB | Yes |
| Spiral 2^18x30KB | Query | 14,336 B | 14 KB | Yes |
| Spiral 2^14x100KB | Response | 272,896 B | 242 KB | Mismatch (see notes) |
| SpiralPack 2^20x256B | Response | 20,480 B | 20 KB | Yes |
| SpiralPack 2^18x30KB | Response | 86,016 B | 86 KB | Yes |
| SpiralPack 2^14x100KB | Response | 188,416 B | 188 KB | Yes |
| SpiralStream 2^18x30KB | Response | 62,464 B | 62 KB | Yes |
| SpiralStreamPack 2^18x30KB | Response | 96,256 B | 96 KB | Yes |

**Note on Spiral 2^14x100KB response size:** Our result (267 KB) differs from the paper's Table 3 value (242 KB). This is because the parameter selector chose different parameters than in the paper (nu_1=9, nu_2=5, t_GSW=8 vs paper's nu_1=9, nu_2=5, T=11). The response size depends on the number of sub-databases (factor), which is determined by the record size relative to the plaintext capacity. The paper may have used p=512 (log_p=9) yielding a different response size. The automatic parameter selector optimizes for cost, which may produce slightly different tradeoffs.

#### Compute Timings

Our machine (Intel i7-11700F) is consistently **faster** than the paper's AWS r6i.metal (Xeon 8375C) by approximately 1.5-1.7x across all configs. This is expected: the i7-11700F has higher single-thread clock speed (~4.9 GHz turbo vs ~3.5 GHz for the Xeon), and both support AVX-512.

| Config | Ours (s) | Paper (s) | Ratio (paper/ours) |
|--------|----------|-----------|-------------------|
| Spiral 2^20x256B | 1.13 | 1.68 | 1.49x |
| Spiral 2^18x30KB | 16.11 | 24.52 | 1.52x |
| Spiral 2^14x100KB | 3.18 | 4.92 | 1.55x |
| SpiralPack 2^20x256B | 0.88 | 1.37 | 1.56x |
| SpiralPack 2^18x30KB | 11.03 | 17.69 | 1.60x |
| SpiralPack 2^14x100KB | 2.97 | 4.58 | 1.54x |
| SpiralStream 2^18x30KB | 5.91 | 9.00 | 1.52x |
| SpiralStreamPack 2^18x30KB | 3.60 | 5.33 | 1.48x |

Speedup ratio is consistent across configs (1.48-1.60x), confirming the difference is due to CPU clock speed rather than algorithmic or configuration differences.

### Selected Parameters (auto-selected by select_params.py)

| Config | p | q' bits | nu_1 | nu_2 | t_GSW | t_conv | t_exp | n | factor (T) |
|--------|---|---------|------|------|-------|--------|-------|---|------------|
| Spiral 2^20x256B | 256 | 21 | 9 | 6 | 9 | 4 | 8 | 2 | 1 |
| Spiral 2^18x30KB | 256 | 21 | 9 | 9 | 10 | 4 | 16 | 2 | 4 |
| Spiral 2^14x100KB | 256 | 21 | 9 | 5 | 8 | 4 | 8 | 2 | 13 |
| SpiralPack 2^20x256B | 256 | 20 | 9 | 6 | 9 | 4 | 8 | 2 | 1 |
| SpiralPack 2^18x30KB | 256 | 22 | 10 | 8 | 10 | 4 | 16 | 2 | 4 |
| SpiralPack 2^14x100KB | 128 | 20 | 10 | 4 | 6 | 32 | 8 | 8 | 1 |
| SpiralStream 2^18x30KB | 32768 | 27 | 10 | 8 | 4 | 32 | 2 | 2 | 2 |
| SpiralStreamPack 2^18x30KB | 32768 | 26 | 11 | 6 | 3 | 56 | 56 | 4 | 1 |

### Issues & Observations

1. **git-lfs required:** Parameter pickle files (~38 MB each) are stored via git-lfs. Without git-lfs, the files appear as text pointers and fail to load.

2. **Compiler change:** CMakeLists.txt hardcodes `clang++-12`. Changed to `clang++-18` for Ubuntu 24.04 compatibility.

3. **Intel HEXL version:** Paper specifies HEXL 1.2.1; vcpkg installed 1.2.5. API-compatible; no issues observed.

4. **Implicit database:** All benchmarks use implicit database representation (default). This avoids allocating the full database in memory. The paper notes < 1% effect on compute time.

5. **Parameter auto-selection:** The `select_params.py` script uses a cost model calibrated on AWS c5n.2xlarge instances. On different hardware, the cost model's accuracy degrades, but correctness is unaffected. The script always selects the cheapest parameter set satisfying the correctness threshold of 2^{-40}.

6. **Rate differences (2^14x100KB Spiral):** Our Spiral rate (0.375) differs from paper (0.4129). The parameter selector chose p=256 (log_p=8) with factor=13, while the paper likely chose p=512 (log_p=9) with factor=11. Different p values yield different response sizes and rates. The SpiralPack variant matches closely (0.543 vs 0.5307).

### Raw Output

<details>
<summary>Spiral 2^20 x 256B (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 453316.67, "conv_us": 270020.0, "fdim_us": 197306.33, "fold_us": 208198.67, "total_us": 1128841.67, "resp_sz": 20992.0, "query_sz": 14336.0, "param_sz": 14221312.0, "is_corr": 1.0, "rate": 0.0122}
```
</details>

<details>
<summary>Spiral 2^18 x 30KB (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 779911.67, "conv_us": 365643.0, "fdim_us": 6639038.67, "fold_us": 8323188.0, "total_us": 16107781.33, "resp_sz": 83968.0, "query_sz": 14336.0, "param_sz": 18120704.0, "is_corr": 1.0, "rate": 0.366}
```
</details>

<details>
<summary>Spiral 2^14 x 100KB (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 445553.67, "conv_us": 216724.33, "fdim_us": 1348802.0, "fold_us": 1170589.33, "total_us": 3181669.33, "resp_sz": 272896.0, "query_sz": 14336.0, "param_sz": 14221312.0, "is_corr": 1.0, "rate": 0.375}
```
</details>

<details>
<summary>SpiralPack 2^20 x 256B (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 435380.67, "conv_us": 36672.67, "fdim_us": 191503.33, "fold_us": 219277.67, "pack_us": 1644.0, "total_us": 884478.33, "resp_sz": 20480.0, "query_sz": 14336.0, "param_sz": 14106624.0, "is_corr": 1.0, "rate": 0.0125}
```
</details>

<details>
<summary>SpiralPack 2^18 x 30KB (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 1209129.0, "conv_us": 53623.0, "fdim_us": 5950296.0, "fold_us": 3814966.67, "pack_us": 6242.67, "total_us": 11034257.33, "resp_sz": 86016.0, "query_sz": 14336.0, "param_sz": 18464768.0, "is_corr": 1.0, "rate": 0.357}
```
</details>

<details>
<summary>SpiralPack 2^14 x 100KB (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 647733.33, "conv_us": 49555.33, "fdim_us": 1535268.67, "fold_us": 641336.0, "pack_us": 100395.67, "total_us": 2974289.0, "resp_sz": 188416.0, "query_sz": 14336.0, "param_sz": 47022080.0, "is_corr": 1.0, "rate": 0.543}
```
</details>

<details>
<summary>SpiralStream 2^18 x 30KB (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 148705.0, "conv_us": 1657947.33, "fdim_us": 3200374.0, "fold_us": 902202.0, "total_us": 5909228.33, "resp_sz": 62464.0, "query_sz": 15138816.0, "param_sz": 2752512.0, "is_corr": 1.0, "rate": 0.492}
```
</details>

<details>
<summary>SpiralStreamPack 2^18 x 30KB (JSON, averaged over 3 trials)</summary>

```json
{"exp_us": 0.0, "conv_us": 7118.67, "fdim_us": 3141135.67, "fold_us": 413522.67, "pack_us": 33696.0, "total_us": 3595473.0, "resp_sz": 96256.0, "query_sz": 29876224.0, "param_sz": 16056320.0, "is_corr": 1.0, "rate": 0.319}
```
</details>
