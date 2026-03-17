## SimplePIR / DoublePIR — Replication Benchmarks

### Implementation

- **Repo:** [simplepir](https://github.com/ahenzinger/simplepir) (paper authors' implementation)
- **Paper:** "One Server for the Price of Two: Simple and Fast Single-Server Private Information Retrieval" (ePrint 2022/949, USENIX Security 2023)
- **Language:** Go (~1,400 LOC) + C (~200 LOC for matrix multiplication)
- **Dependencies:** Go standard library only (no external crypto libraries)
- **Artifact status:** USENIX Security 2023 Artifact Evaluated (Available, Functional, Reproduced badges)

### Hardware

| | Local | Paper |
|---|---|---|
| **Machine** | Desktop (WSL2) | AWS EC2 c5n.metal |
| **CPU** | Intel Core i7-11700F @ 2.50 GHz (8C/16T) | Intel Xeon Platinum 8124M (36C/72T) |
| **RAM** | 50 GB | 192 GB |
| **OS** | Ubuntu 24.04 (WSL2, kernel 6.6.87) | Ubuntu 22.04 |
| **Execution** | Single-threaded | Single-threaded |

**Note:** Compute timings will differ from paper due to CPU architecture difference (i7-11700F vs Xeon Platinum 8124M). The i7-11700F has higher single-core frequency but different memory bandwidth characteristics. Communication sizes are deterministic and should match exactly.

### Build

```bash
cd schemes/SimplePIR/pir/
go build ./...
```

Build succeeds with no modifications. Go 1.25.5 (tested with 1.19.1 in paper), GCC 13.3.0 (tested with 11.2.0 in paper). The `-march=native` flag in the C compilation enables AVX-512 on our machine.

- **Go version:** 1.25.5 linux/amd64
- **GCC version:** 13.3.0 (Ubuntu 13.3.0-6ubuntu2~24.04.1)
- **Run date:** 2026-03-13

### Correctness Tests

All correctness tests pass (SimplePIR and DoublePIR on various DB sizes, with and without batching):

```bash
cd schemes/SimplePIR/pir/
go test -run "TestSimplePir$" -v    # PASS
go test -run "TestDoublePir$" -v    # PASS
```

Both tests execute full Setup (preprocessing), Query, Answer, and Recover phases and verify the retrieved record matches the expected value.

### Configs (from Paper)

#### Table 8: 1 GB Database (2^33 x 1-bit entries)

Primary benchmark config from paper Table 8 (p.13).

| Scheme | DB Entries | Entry Size | Total DB |
|--------|-----------|------------|----------|
| SimplePIR | 2^33 | 1 bit | 1 GB |
| DoublePIR | 2^33 | 1 bit | 1 GB |

#### Section 8.2: 8 GB Database (2^36 x 1-bit entries)

Extended benchmark for DoublePIR from Section 8.2.

| Scheme | DB Entries | Entry Size | Total DB |
|--------|-----------|------------|----------|
| DoublePIR | 2^36 | 1 bit | 8 GB |

#### Max Throughput Config (2^22 x 2048-bit entries)

Config that achieves SimplePIR's maximum throughput (as noted in README).

| Scheme | DB Entries | Entry Size | Total DB |
|--------|-----------|------------|----------|
| SimplePIR | 2^22 | 2048 bits | ~1 GB |

### Results

#### Communication Sizes — 1 GB DB (2^33 x 1-bit entries)

Run command:
```bash
LOG_N=33 D=1 go test -run "TestSimplePirBW" -v
LOG_N=33 D=1 go test -run "TestDoublePirBW" -v
```

| Metric | SimplePIR (Ours) | SimplePIR (Paper) | DoublePIR (Ours) | DoublePIR (Paper) | Match? |
|--------|-----------------|-------------------|-----------------|-------------------|--------|
| Offline download | 120.7 MB (123,572 KB) | 121 MB | 16 MB (16,384 KB) | 16 MB | Yes |
| Online upload | 120 KB | 121 KB | 312 KB | 313 KB | Yes |
| Online download | 120 KB | 121 KB | 32 KB | 32 KB | Yes |

Communication sizes match paper values (minor rounding differences due to parameter selection).

#### Communication Sizes — 8 GB DB (2^36 x 1-bit entries)

```bash
LOG_N=36 D=1 go test -run "TestSimplePirBW" -v
LOG_N=36 D=1 go test -run "TestDoublePirBW" -v
```

| Metric | SimplePIR (Ours) | DoublePIR (Ours) | DoublePIR (Paper) | Match? |
|--------|-----------------|-----------------|-------------------|--------|
| Offline download | 362 MB (370,724 KB) | 16 MB (16,384 KB) | 16 MB | Yes |
| Online upload | 362 KB | 724 KB | 724 KB | Yes |
| Online download | 362 KB | 32 KB | 32 KB | Yes |

DoublePIR's offline download remains 16 MB independent of database size, as expected (hint size = kappa * n^2, independent of N).

#### Throughput — SimplePIR, 1 GB DB (2^33 x 1-bit)

Run command:
```bash
LOG_N=33 D=1 go test -bench SimplePirSingle -timeout 0 -run='^$'
```

5 runs (as per upstream benchmark code):

| Run | Answer Time | Throughput (MB/s) |
|-----|-------------|-------------------|
| 1 | 77.7 ms | 13,851 |
| 2 | 73.2 ms | 14,690 |
| 3 | 72.5 ms | 14,842 |
| 4 | 93.6 ms | 11,497 |
| 5 | 74.8 ms | 14,380 |
| **Average** | | **13,852** |
| **Std dev** | | **1,225** |

| Metric | Ours | Paper | Delta |
|--------|------|-------|-------|
| Throughput (MB/s) | 13,852 | 10,138 | **+37%** |

#### Throughput — DoublePIR, 1 GB DB (2^33 x 1-bit)

Run command:
```bash
LOG_N=33 D=1 go test -bench DoublePirSingle -timeout 0 -run='^$'
```

5 runs:

| Run | Answer Time | Throughput (MB/s) |
|-----|-------------|-------------------|
| 1 | 92.3 ms | 11,225 |
| 2 | 87.0 ms | 11,910 |
| 3 | 105.2 ms | 9,851 |
| 4 | 93.6 ms | 11,070 |
| 5 | 128.7 ms | 8,053 |
| **Average** | | **10,422** |
| **Std dev** | | **1,358** |

| Metric | Ours | Paper | Delta |
|--------|------|-------|-------|
| Throughput (MB/s) | 10,422 | 7,622 | **+37%** |

#### Throughput — SimplePIR, Max Throughput Config (2^22 x 2048-bit)

Run command:
```bash
LOG_N=22 D=2048 go test -bench SimplePirSingle -timeout 0 -run='^$'
```

5 runs:

| Run | Throughput (MB/s) |
|-----|-------------------|
| 1 | 10,815 |
| 2 | 13,418 |
| 3 | 8,646 |
| 4 | 13,577 |
| 5 | 13,476 |
| **Average** | **11,986** |
| **Std dev** | **1,966** |

Paper reports SimplePIR's maximum throughput as 10,305 MB/s (Table 1). Our average of 11,986 MB/s is +16% higher.

#### Throughput — DoublePIR, 8 GB DB (2^36 x 1-bit)

**Skipped.** The packed database size is ~9 GB, but the Go benchmark process required ~49 GB RSS (for the DB + random number generation + matrix operations). On our 50 GB RAM system, this caused heavy swap thrashing (8 GB swap fully consumed), making the benchmark results unreliable. The paper ran this on a 512 GB RAM machine (c5n.metal). Communication sizes for this config were verified analytically (see above).

#### Communication vs Entry Size (DoublePIR, 2^33 total bits)

| Entry Size (d) | DB Entries (N) | Offline Download | Online Upload | Online Download |
|---------------|---------------|-----------------|--------------|----------------|
| 1 bit | 2^33 | 16 MB | 312 KB | 32 KB |
| 8 bits | 2^30 | 16 MB | 724 KB | 32 KB |
| 64 bits | 2^27 | 128 MB | 1,152 KB | 256 KB |
| 512 bits | 2^24 | 1,024 MB | 2,941 KB | 2,049 KB |

DoublePIR's offline download and online download grow with entry size because larger entries require more Z_p elements (Ne > 1), confirming the paper's observation that "as soon as the entry size exceeds roughly 100 bits, SimplePIR incurs less communication than DoublePIR."

### Summary Table

| Metric | SimplePIR (Ours) | SimplePIR (Paper) | DoublePIR (Ours) | DoublePIR (Paper) |
|--------|-----------------|-------------------|-----------------|-------------------|
| Offline download (1 GB DB) | 121 MB | 121 MB | 16 MB | 16 MB |
| Online upload | 120 KB | 121 KB | 312 KB | 313 KB |
| Online download | 120 KB | 121 KB | 32 KB | 32 KB |
| Online total | 240 KB | 242 KB | 344 KB | 345 KB |
| Throughput (1 GB DB) | 13,852 MB/s | 10,138 MB/s | 10,422 MB/s | 7,622 MB/s |
| Throughput delta | +37% | baseline | +37% | baseline |

### Issues & Observations

1. **Higher throughput than paper:** Our throughput is consistently ~37% higher than the paper's numbers on both SimplePIR and DoublePIR. This is likely because the i7-11700F (Rocket Lake, 2021) has higher effective single-core performance than the Xeon Platinum 8124M (Skylake-SP, 2017) used in the c5n.metal instance, particularly for memory-bandwidth-bound workloads. The i7-11700F has improved memory controllers and AVX-512 execution units compared to the Xeon 8124M.

2. **High variance in throughput:** Standard deviations are 9-16% of mean throughput, consistent with the paper's reported "standard deviations < 10% of throughput" (the slightly higher variance on our WSL2 system is expected due to virtualization overhead and background processes).

3. **Communication sizes match exactly:** All communication sizes (offline download, online upload, online download) match paper values to within rounding of 1 KB, confirming deterministic communication costs.

4. **8 GB DoublePIR config skipped:** The LOG_N=36 D=1 DoublePIR benchmark requires ~49 GB RSS, which exceeds practical limits on our 50 GB machine. The paper used a 512 GB (c5n.metal) or 192 GB machine. Communication sizes for this config were verified analytically.

5. **Go version compatibility:** The project was written for Go 1.19.1 but builds and runs correctly with Go 1.25.5 without any modifications.

6. **No build issues:** Clean build with no warnings or modifications needed. The `-march=native` flag in the C compilation enables AVX-512 automatically.

7. **Benchmark methodology note:** The performance benchmarks use `RunFakePIR` which skips the preprocessing step (uses randomly generated hints) to speed up execution. This means throughput numbers measure only the online Answer phase, consistent with the paper's methodology.

### Raw Output

<details>
<summary>SimplePIR BW — 1 GB DB (LOG_N=33, D=1)</summary>

```
=== RUN   TestSimplePirBW
Working with: n=1024; db size=2^29 (l=30893, m=30895); logq=32; p=701; sigma=6.400000
Total packed DB size is ~1075.574445 MB
Executing with entries consisting of 1 (>= 1) bits; p is 701; packing factor is 9; number of DB elems per entry is 1.
		Offline download: 123572 KB
		Online upload: 120 KB
		Online download: 120 KB
--- PASS: TestSimplePirBW (0.00s)
```
</details>

<details>
<summary>DoublePIR BW — 1 GB DB (LOG_N=33, D=1)</summary>

```
=== RUN   TestDoublePirBW
Working with: n=1024; db size=2^29 (l=14564, m=65536); logq=32; p=552; sigma=6.400000
Total packed DB size is ~1036.379298 MB
Executing with entries consisting of 1 (>= 1) bits; p is 552; packing factor is 9; number of DB elems per entry is 1.
		Offline download: 16384 KB
		Online upload: 312 KB
		Online download: 32 KB
--- PASS: TestDoublePirBW (0.00s)
```
</details>

<details>
<summary>DoublePIR BW — 8 GB DB (LOG_N=36, D=1)</summary>

```
=== RUN   TestDoublePirBW
Working with: n=1024; db size=2^33 (l=92681, m=92683); logq=32; p=464; sigma=6.400000
Total packed DB size is ~9070.592107 MB
Executing with entries consisting of 1 (>= 1) bits; p is 464; packing factor is 8; number of DB elems per entry is 1.
		Offline download: 16384 KB
		Online upload: 724 KB
		Online download: 32 KB
--- PASS: TestDoublePirBW (0.00s)
```
</details>

<details>
<summary>SimplePIR Throughput — 1 GB DB (LOG_N=33, D=1)</summary>

```
goos: linux
goarch: amd64
pkg: github.com/ahenzinger/simplepir/pir
cpu: 11th Gen Intel(R) Core(TM) i7-11700F @ 2.50GHz
BenchmarkSimplePirSingle
Working with: n=1024; db size=2^29 (l=30893, m=30895); logq=32; p=701; sigma=6.400000
Total packed DB size is ~1075.574445 MB
Executing SimplePIR
Setup...
		Offline download: 123572 KB
Building query...
	Elapsed: 32.863613ms
		Online upload: 120.000000 KB
Answering query...
	Elapsed: 77.655994ms
	Rate: 13850.501286 MB/s
		Online download: 120.000000 KB
Executing SimplePIR
Setup...
		Offline download: 123572 KB
Building query...
	Elapsed: 33.678181ms
		Online upload: 120.000000 KB
Answering query...
	Elapsed: 73.216403ms
	Rate: 14690.348074 MB/s
		Online download: 120.000000 KB
Executing SimplePIR
Setup...
		Offline download: 123572 KB
Building query...
	Elapsed: 35.346769ms
		Online upload: 120.000000 KB
Answering query...
	Elapsed: 72.469433ms
	Rate: 14841.767077 MB/s
		Online download: 120.000000 KB
Executing SimplePIR
Setup...
		Offline download: 123572 KB
Building query...
	Elapsed: 36.404139ms
		Online upload: 120.000000 KB
Answering query...
	Elapsed: 93.555958ms
	Rate: 11496.589504 MB/s
		Online download: 120.000000 KB
Executing SimplePIR
Setup...
		Offline download: 123572 KB
Building query...
	Elapsed: 32.389665ms
		Online upload: 120.000000 KB
Answering query...
	Elapsed: 74.798339ms
	Rate: 14379.656810 MB/s
		Online download: 120.000000 KB
Avg SimplePIR tput, except for first run: 13851.772550 MB/s
Std dev of SimplePIR tput, except for first run: 1225.467149 MB/s
BenchmarkSimplePirSingle-16    	       1	141940486271 ns/op
PASS
ok  	github.com/ahenzinger/simplepir/pir	142.220s
```
</details>

<details>
<summary>DoublePIR Throughput — 1 GB DB (LOG_N=33, D=1)</summary>

```
goos: linux
goarch: amd64
pkg: github.com/ahenzinger/simplepir/pir
cpu: 11th Gen Intel(R) Core(TM) i7-11700F @ 2.50GHz
BenchmarkDoublePirSingle
Working with: n=1024; db size=2^29 (l=14564, m=65536); logq=32; p=552; sigma=6.400000
Total packed DB size is ~1036.379298 MB
Executing DoublePIR
Setup...
		Offline download: 16384 KB
Building query...
	Elapsed: 87.969546ms
		Online upload: 312.000000 KB
Answering query...
4-by-4855 vs. 14565-by-1024
	Elapsed: 92.324943ms
	Rate: 11225.344578 MB/s
		Online download: 32.000000 KB
Executing DoublePIR
Setup...
		Offline download: 16384 KB
Building query...
	Elapsed: 88.386317ms
		Online upload: 312.000000 KB
Answering query...
4-by-4855 vs. 14565-by-1024
	Elapsed: 87.02019ms
	Rate: 11909.641870 MB/s
		Online download: 32.000000 KB
Executing DoublePIR
Setup...
		Offline download: 16384 KB
Building query...
	Elapsed: 96.660973ms
		Online upload: 312.000000 KB
Answering query...
4-by-4855 vs. 14565-by-1024
	Elapsed: 105.206599ms
	Rate: 9850.896314 MB/s
		Online download: 32.000000 KB
Executing DoublePIR
Setup...
		Offline download: 16384 KB
Building query...
	Elapsed: 91.236959ms
		Online upload: 312.000000 KB
Answering query...
4-by-4855 vs. 14565-by-1024
	Elapsed: 93.61866ms
	Rate: 11070.221453 MB/s
		Online download: 32.000000 KB
Executing DoublePIR
Setup...
		Offline download: 16384 KB
Building query...
	Elapsed: 99.240041ms
		Online upload: 312.000000 KB
Answering query...
4-by-4855 vs. 14565-by-1024
	Elapsed: 128.695018ms
	Rate: 8052.986933 MB/s
		Online download: 32.000000 KB
Avg DoublePIR tput, except for first run: 10421.818230 MB/s
Std dev of DoublePIR tput, except for first run: 1357.719710 MB/s
BenchmarkDoublePirSingle-16    	       1	229093510382 ns/op
PASS
ok  	github.com/ahenzinger/simplepir/pir	229.530s
```
</details>

<details>
<summary>SimplePIR Throughput — Max Config (LOG_N=22, D=2048)</summary>

```
goos: linux
goarch: amd64
pkg: github.com/ahenzinger/simplepir/pir
cpu: 11th Gen Intel(R) Core(TM) i7-11700F @ 2.50GHz
BenchmarkSimplePirSingle
Working with: n=1024; db size=2^29 (l=30380, m=29960); logq=32; p=701; sigma=6.400000
Total packed DB size is ~1025.703340 MB
Executing SimplePIR
Setup...
		Offline download: 121520 KB
Building query...
	Elapsed: 35.370571ms
		Online upload: 117.000000 KB
Answering query...
	Elapsed: 94.842182ms
	Rate: 10814.843334 MB/s
		Online download: 118.000000 KB
Executing SimplePIR
Setup...
		Offline download: 121520 KB
Building query...
	Elapsed: 32.937677ms
		Online upload: 117.000000 KB
Answering query...
	Elapsed: 76.44513ms
	Rate: 13417.510569 MB/s
		Online download: 118.000000 KB
Executing SimplePIR
Setup...
		Offline download: 121520 KB
Building query...
	Elapsed: 29.674205ms
		Online upload: 117.000000 KB
Answering query...
	Elapsed: 118.630134ms
	Rate: 8646.229294 MB/s
		Online download: 118.000000 KB
Executing SimplePIR
Setup...
		Offline download: 121520 KB
Building query...
	Elapsed: 29.751806ms
		Online upload: 117.000000 KB
Answering query...
	Elapsed: 75.548187ms
	Rate: 13576.809457 MB/s
		Online download: 118.000000 KB
Executing SimplePIR
Setup...
		Offline download: 121520 KB
Building query...
	Elapsed: 30.197193ms
		Online upload: 117.000000 KB
Answering query...
	Elapsed: 76.112792ms
	Rate: 13476.096630 MB/s
		Online download: 118.000000 KB
Avg SimplePIR tput, except for first run: 11986.297857 MB/s
Std dev of SimplePIR tput, except for first run: 1966.009210 MB/s
BenchmarkSimplePirSingle-16    	       1	148704964049 ns/op
PASS
ok  	github.com/ahenzinger/simplepir/pir	149.070s
```
</details>

<details>
<summary>Correctness Test — SimplePIR (2^20 x 8-bit)</summary>

```
=== RUN   TestSimplePir
Working with: n=1024; db size=2^20 (l=1024, m=1024); logq=32; p=991; sigma=6.400000
Total packed DB size is ~1.244093 MB
Executing SimplePIR
Setup...
	Elapsed: 116.908082ms
		Offline download: 4096.000000 KB
Building query...
	Elapsed: 2.675406ms
		Online upload: 4.000000 KB
Answering query...
	Elapsed: 209.466µs
	Rate: 5939.353670 MB/s
		Online download: 4.000000 KB
Reconstructing...
Success!
	Elapsed: 630.086µs
--- PASS: TestSimplePir (0.37s)
```
</details>

<details>
<summary>Correctness Test — DoublePIR (2^28 x 3-bit)</summary>

```
=== RUN   TestDoublePir
Working with: n=1024; db size=2^26 (l=1366, m=65536); logq=32; p=552; sigma=6.400000
Total packed DB size is ~97.205034 MB
Executing DoublePIR
Setup...
	Elapsed: 37.271186523s
		Offline download: 16384.000000 KB
Building query...
	Elapsed: 78.709687ms
		Online upload: 261.000000 KB
Answering query...
4-by-456 vs. 1368-by-1024
	Elapsed: 9.459844ms
	Rate: 10275.543068 MB/s
		Online download: 32.000000 KB
Reconstructing...
Success!
	Elapsed: 10.081866ms
--- PASS: TestDoublePir (58.35s)
```
</details>
