## SealPIR — Replication Benchmarks

### Implementation

- **Paper:** PIR with Compressed Queries and Amortized Query Processing (ePrint 2017/1142, Oakland 2018)
- **Repo:** [SealPIR](https://github.com/microsoft/SealPIR) (paper authors' C++ implementation)
- **Language:** C++ (~2,000 LOC), uses Microsoft SEAL 4.0.0
- **Dependencies:** Microsoft SEAL 4.0.0, CMake 3.10+

**Important note on implementation version:** The current SealPIR repository has been updated from the original paper's implementation. Key differences:
- Paper used SEAL 2.3.0-4 with N=2048; current code uses SEAL 4.0.0 with N=4096
- Current code uses symmetric encryption, batching, and recursive mod switching (optimizations added post-paper)
- Communication sizes differ from paper due to these implementation changes (larger N = larger ciphertexts, but recursive mod switching reduces response expansion factor from ~5-12 to ~4)
- The original paper-matching code is available at commit `ccf86c50fd3291` but requires an old SEAL version

### Hardware

- **Local:** x86_64, Ubuntu 24.04 (WSL2), Intel Core i7-11700F (16 vCPU), 50 GB RAM, AVX-512 (F, DQ, IFMA, BW, CD, VL, VBMI, VNNI, BITALG, VPOPCNTDQ)
- **Paper:** Microsoft Azure H16 (16-core 3.6 GHz Intel Xeon E5-2667, 112 GB RAM), single-threaded

**Note:** Compute timings will differ from paper due to CPU difference (i7-11700F vs Xeon E5-2667). Communication sizes differ due to updated implementation (see above).

### Build

```bash
# 1. Build and install SEAL 4.0.0
cd /tmp
git clone --branch v4.0.0 --depth 1 https://github.com/microsoft/SEAL.git seal-4.0.0
cd seal-4.0.0
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DSEAL_USE_INTEL_HEXL=OFF -DCMAKE_INSTALL_PREFIX=$HOME/.local
cd build && make -j$(nproc) && make install

# 2. Build SealPIR
cd schemes/SealPIR/
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=$HOME/.local
cd build && make -j$(nproc)

# 3. Run tests
ctest .   # 6/6 passed

# 4. Run benchmarks (custom benchmark.cpp added)
./bin/benchmark <log_num_items> <item_size_bytes> [d=2] [N=4096] [logt=20] [trials=5]
```

Compiler: g++ 13.3.0 (Ubuntu 13.3.0-6ubuntu2~24.04.1). Build uses default CMake Release flags.

### Configuration

Default parameters (from updated codebase):
- N = 4096 (polynomial degree)
- logt = 20 (plaintext modulus bits)
- d = 2 (hypercube dimensions)
- Symmetric encryption: enabled
- Batching: enabled
- Recursive mod switching: enabled
- Expansion ratio: 12 (4 ciphertexts in response)
- Coefficient moduli: 36 + 36 + 37 = 109 bits total

Paper parameters (original):
- N = 2048
- logt = variable (Expand optimization changes effective t)
- d = 2
- q = 60-bit coefficient modulus

### Results

Run date: 2026-03-13. g++ 13.3.0, single-threaded. 5 trials each, averages reported.

#### SealPIR d=2, 288-byte elements (paper Figure 9 configs)

| Metric | n=2^16 (ours) | n=2^16 (paper) | n=2^18 (ours) | n=2^18 (paper) | n=2^20 (ours) | n=2^20 (paper) |
|--------|---------------|----------------|---------------|----------------|---------------|----------------|
| **Client CPU** | | | | | | |
| Query gen (ms) | 2.27 | 3.37 | 2.60 | 3.37 | 2.59 | 3.37 |
| Decode (ms) | 0.92 | 1.37 | 0.87 | 1.39 | 0.84 | 1.69 |
| **Server CPU** | | | | | | |
| Setup (s) | 0.315 | 0.23 | 1.298 | 1.04 | 5.223 | 4.26 |
| Reply gen (s) | 0.238 | 0.18* | 0.761 | 0.61* | 2.607 | 2.12* |
| **Network** | | | | | | |
| Query (KB) | 90.7 | 64 | 90.7 | 64 | 90.7 | 64 |
| Reply (KB) | 181.1 | 256 | 181.2 | 256 | 181.2 | 256 |
| Reply ciphertexts | 4 | F (~5) | 4 | F (~5) | 4 | F (~5) |

*Paper reports Expand + Answer separately; combined here for comparison: e.g., at n=2^20, paper shows Expand=0.11s + Answer=2.01s = 2.12s total.

#### SealPIR d=2, 1024-byte elements

| Metric | n=2^16 (ours) |
|--------|---------------|
| **Client CPU** | |
| Query gen (ms) | 2.50 |
| Decode (ms) | 0.96 |
| **Server CPU** | |
| Setup (s) | 1.220 |
| Reply gen (s) | 0.732 |
| **Network** | |
| Query (KB) | 90.8 |
| Reply (KB) | 181.0 |
| Reply ciphertexts | 4 |

### Comparison with Paper

#### Communication Sizes

Communication sizes **differ** from paper values due to the updated implementation:

| Metric | Ours | Paper | Explanation |
|--------|------|-------|-------------|
| Query size | ~91 KB | 64 KB | Larger N (4096 vs 2048) increases ciphertext size. Symmetric encryption reduces vs public-key but N doubling dominates. |
| Reply size | ~181 KB | 256 KB | Recursive mod switching reduces expansion ratio from F~5 to 4 ciphertexts. Despite larger individual ciphertexts, total response is smaller. |

These differences are expected and documented in the SealPIR README changelog: "This implementation of SealPIR uses the latest version of SEAL, fixes several bugs, and provides better serialization/deserialization of queries and responses."

#### Compute Timings

| Config | Metric | Ours | Paper | Ratio (ours/paper) |
|--------|--------|------|-------|--------------------|
| n=2^16 | Setup | 0.315 s | 0.23 s | 1.37x slower |
| n=2^16 | Reply gen | 0.238 s | 0.18 s | 1.32x slower |
| n=2^18 | Setup | 1.298 s | 1.04 s | 1.25x slower |
| n=2^18 | Reply gen | 0.761 s | 0.61 s | 1.25x slower |
| n=2^20 | Setup | 5.223 s | 4.26 s | 1.23x slower |
| n=2^20 | Reply gen | 2.607 s | 2.12 s | 1.23x slower |

Our timings are ~1.2-1.4x slower than the paper. This is a combination of factors:
1. **Larger ring dimension:** N=4096 vs N=2048 means each NTT operation is ~2x more expensive
2. **Updated SEAL version:** SEAL 4.0.0 may have different performance characteristics than SEAL 2.3.0-4
3. **Hardware difference:** i7-11700F (4.9 GHz turbo) vs Xeon E5-2667 (3.6 GHz) — our CPU has higher clock but the larger N dominates
4. **Client-side operations** are faster (2.3-2.6 ms vs 3.37 ms) likely because symmetric encryption is faster than public-key

The ratio is consistent across database sizes (~1.2-1.4x), suggesting the overhead is from the larger ring dimension rather than algorithmic differences.

### PIR Parameters Detail

| Config | Elements/ptxt | BFV plaintexts (padded) | Dim 1 | Dim 2 |
|--------|---------------|------------------------|-------|-------|
| 2^16 x 288B | 35 | 1,892 | 44 | 43 |
| 2^18 x 288B | 35 | 7,569 | 87 | 87 |
| 2^20 x 288B | 35 | 30,102 | 174 | 173 |
| 2^16 x 1024B | 9 | 7,310 | 86 | 85 |

### Issues & Observations

1. **Implementation version mismatch:** The current SealPIR repo is significantly updated from the paper. Communication sizes cannot be directly compared. To replicate exact paper numbers, one would need to check out the original commit (`ccf86c50fd3291`) and use SEAL 2.3.0-4, which is no longer readily available.

2. **SEAL installation:** SEAL 4.0.0 was built from source and installed to `~/.local`. No system-wide installation was available. Intel HEXL was disabled (not needed for SealPIR).

3. **Symmetric encryption:** The updated code uses symmetric encryption by default, which reduces query size but requires the server to hold the client's secret key (or use a key-switching approach). The paper used public-key encryption.

4. **Recursive mod switching:** The updated implementation uses recursive mod switching to reduce the expansion factor from ~5-12 (paper) to exactly 4 (current). This significantly reduces reply size (181 KB vs 256 KB).

5. **Correctness:** All trials passed correctness verification. All 6 unit tests passed.

6. **Benchmark methodology:** Custom `benchmark.cpp` was added to the source to accept command-line parameters and run multiple trials. The original `main.cpp` hardcodes parameters (2^16 x 1024B).

### Raw Output

<details>
<summary>2^16 x 288B, d=2 (5 trials)</summary>

```
Config: N=4096, logt=20, d=2, num_items=65536, item_size=288
Correctness: ALL PASS
Avg Setup:           315.266 ms (0.315266 s)
Avg Query gen:       2.2726 ms
Avg Server reply:    238.084 ms (0.238084 s)
Avg Client decode:   0.9164 ms
Avg Query size:      92893.4 bytes (90.7162 KB)
Avg Reply size:      185469 bytes (181.122 KB)
Reply num ciphertexts: 4
```
</details>

<details>
<summary>2^18 x 288B, d=2 (5 trials)</summary>

```
Config: N=4096, logt=20, d=2, num_items=262144, item_size=288
Correctness: ALL PASS
Avg Setup:           1297.68 ms (1.29768 s)
Avg Query gen:       2.6032 ms
Avg Server reply:    761.401 ms (0.761401 s)
Avg Client decode:   0.8668 ms
Avg Query size:      92882.8 bytes (90.7059 KB)
Avg Reply size:      185598 bytes (181.248 KB)
Reply num ciphertexts: 4
```
</details>

<details>
<summary>2^20 x 288B, d=2 (5 trials)</summary>

```
Config: N=4096, logt=20, d=2, num_items=1048576, item_size=288
Correctness: ALL PASS
Avg Setup:           5222.91 ms (5.22291 s)
Avg Query gen:       2.5906 ms
Avg Server reply:    2607.46 ms (2.60746 s)
Avg Client decode:   0.8416 ms
Avg Query size:      92866.2 bytes (90.6896 KB)
Avg Reply size:      185528 bytes (181.18 KB)
Reply num ciphertexts: 4
```
</details>

<details>
<summary>2^16 x 1024B, d=2 (5 trials)</summary>

```
Config: N=4096, logt=20, d=2, num_items=65536, item_size=1024
Correctness: ALL PASS
Avg Setup:           1220.26 ms (1.22026 s)
Avg Query gen:       2.4978 ms
Avg Server reply:    731.829 ms (0.731829 s)
Avg Client decode:   0.9558 ms
Avg Query size:      93014.6 bytes (90.8346 KB)
Avg Reply size:      185390 bytes (181.045 KB)
Reply num ciphertexts: 4
```
</details>
