## Piano — Replication Benchmarks

### Implementation

- **Paper:** Piano: Extremely Simple, Single-Server PIR with Sublinear Server Computation (IEEE S&P 2024)
- **Repo:** [Piano-PIR-new](https://github.com/wuwuz/Piano-PIR-new) (paper authors' Go implementation)
- **Language:** Go (~800 LOC core, plus tutorial)
- **Dependencies:** gRPC, ChaCha20, AES-NI (via assembly), holiman/uint256
- **Version:** Built from cloned repo at `schemes/Piano/`, commit as-cloned

### Hardware

- **Local:** Intel Core i7-11700F, 16 cores, 50 GB RAM, AVX-512, Ubuntu 24.04 (WSL2)
- **Paper:** Two AWS m5.8xlarge instances (Intel Xeon Platinum 8175M, 32 vCPU, 128 GB RAM), single-threaded server, 8-thread client preprocessing

**Note:** Compute timings will differ from paper due to CPU differences (i7-11700F vs Xeon Platinum 8175M). Communication sizes are deterministic and should match exactly. Our benchmarks run client and server on localhost (negligible network latency), same as paper's LAN setup.

### Build

```bash
cd schemes/Piano/
go build -o piano-server ./server/
go build -o piano-client ./client_new/
```

- **Go version:** go1.25.5 linux/amd64
- **Run date:** 2026-03-13
- **Build notes:** Clean build, no modifications to source. The `DBEntrySize` constant in `util/util.go` is set to 8 (bytes) by default, matching the paper's 1 GB and 2 GB configurations.

### Configuration

DB size is controlled via `config.txt` (first line: `N DBSeed`). Entry size is a compile-time constant (`DBEntrySize = 8` in `util/util.go`).

| Config | N | Entry Size | Total DB | Paper Table |
|--------|---|-----------|----------|-------------|
| P1 | 134,217,728 (2^27) | 8 B | 1 GB | Table 1 |
| P2 | 268,435,456 (2^28) | 8 B | 2 GB | Table 1 |
| P3 | 536,870,912 (2^29) | 8 B | 4 GB | (extrapolation) |

### Running

```bash
# Server (in one terminal):
echo "134217728 1211212" > config.txt   # for 1 GB
./piano-server -port 50051

# Client (in another terminal):
./piano-client -ip localhost:50051 -thread 1    # single-threaded preprocessing
./piano-client -ip localhost:50051 -thread 8    # 8-thread preprocessing
```

### Results

#### P1 — 1 GB Database (N=2^27, 8B entries)

| Metric | Ours (1T) | Ours (8T) | Paper (1T) | Paper (8T) | Delta |
|--------|-----------|-----------|------------|------------|-------|
| Preprocessing time | 315 s | 72 s | 629 s | 111 s | 2.0x / 1.5x faster |
| Online time / query | 1.81 ms | 1.83 ms | 3.0 ms | 3.0 ms | 1.66x faster |
| Server compute / query | 0.242 ms | 0.261 ms | — | — | — |
| Client compute / query | 1.209 ms | 1.217 ms | — | — | — |
| Client storage | 60.5 MB | 61 MB | 61 MB | 61 MB | match |
| Upload / query | 32 KB | 32 KB | 32 KB | 32 KB | match |
| Download / query | 8 B | 8 B | 8 B | 8 B | match |
| Amortized offline time / query | 1.45 ms | 0.33 ms | 2.9 ms | 0.5 ms | 2.0x / 1.5x faster |
| Amortized offline comm / query | 4.84 KB | 4.84 KB | 4.9 KB | 4.9 KB | match |

#### P2 — 2 GB Database (N=2^28, 8B entries)

| Metric | Ours (1T) | Ours (8T) | Paper (1T) | Paper (8T) | Delta |
|--------|-----------|-----------|------------|------------|-------|
| Preprocessing time | 728 s | 163 s | 1471 s | 257 s | 2.0x / 1.6x faster |
| Online time / query | 2.30 ms | 2.27 ms | 3.4 ms | 3.4 ms | 1.48x faster |
| Server compute / query | 0.536 ms | 0.523 ms | — | — | — |
| Client compute / query | 1.335 ms | 1.326 ms | — | — | — |
| Client storage | 70.5 MB | 72 MB | 71 MB | 71 MB | match |
| Upload / query | 64 KB | 64 KB | 64 KB | 64 KB | match |
| Download / query | 8 B | 8 B | 8 B | 8 B | match |
| Amortized offline time / query | 2.29 ms | 0.51 ms | 4.6 ms | 0.8 ms | 2.0x / 1.6x faster |
| Amortized offline comm / query | 6.60 KB | 6.60 KB | 6.6 KB | 6.6 KB | match |

#### P3 — 4 GB Database (N=2^29, 8B entries) — Not in Paper

| Metric | Ours (1T) | Ours (8T) |
|--------|-----------|-----------|
| Preprocessing time | 1404 s | 297 s |
| Online time / query | 3.62 ms | 3.48 ms |
| Server compute / query | 0.665 ms | 0.683 ms |
| Client compute / query | 2.350 ms | 2.327 ms |
| Client storage | 126 MB | 126 MB |
| Upload / query | 64 KB | 64 KB |
| Download / query | 8 B | 8 B |
| Amortized offline time / query | 3.01 ms | 0.64 ms |
| Amortized offline comm / query | 9.01 KB | 9.01 KB |

### Communication Verification

Communication sizes are deterministic given the parameters and match paper values exactly:

| DB Size | Upload (SetSize * 8 bytes) | Download (DBEntrySize) | Paper Upload | Paper Download | Match? |
|---------|---------------------------|----------------------|-------------|---------------|--------|
| 1 GB | 32 KB (4096 * 8B) | 8 B | 32 KB | 8 B | Yes |
| 2 GB | 64 KB (8192 * 8B) | 8 B | 64 KB | 8 B | Yes |

Client storage also matches: 61 MB (1 GB) and 71 MB (2 GB) vs paper's 61 MB and 71 MB.

### Comparison with Paper — Analysis

Our machine (Intel i7-11700F @ 2.5 GHz base / 4.9 GHz boost) is consistently **faster** than the paper's AWS m5.8xlarge (Intel Xeon Platinum 8175M @ 2.0 GHz base / 3.5 GHz boost):

- **Preprocessing (1 thread):** ~2.0x faster across all configs. This is expected given the higher single-core clock speed and newer microarchitecture (Rocket Lake vs Skylake-SP).
- **Preprocessing (8 threads):** ~1.5-1.6x faster. The speedup is smaller because the m5.8xlarge has more physical cores and potentially higher memory bandwidth for parallel workloads.
- **Online time:** 1.5-1.7x faster. Online computation is dominated by hint search (PRF membership tests via AES-NI), which benefits from the higher clock speed.
- **Communication:** Exact match on all metrics — upload, download, amortized offline communication, client storage. These are protocol-determined values independent of hardware.

### Configs Skipped

- **100 GB (N~1.68*10^9, 64B entries):** Would require ~100 GB server RAM for the database alone, exceeding our 50 GB limit. The paper used 128 GB RAM instances.
- **Configs >30 GB:** Skipped per memory constraint policy.

### Derived Cross-Scheme Comparison Metrics

The following metrics are computed from the raw benchmark data above to enable standardized cross-scheme comparison (see `schema_v2.jsonc`). No re-run required.

#### Rate (useful_bytes / response_bytes)

| Config | Record Size | Response Size | Rate |
|--------|-------------|---------------|------|
| P1-P3 (all) | 8 B | 8 B | 1.000 |

Piano achieves **perfect rate** — the server returns exactly the requested record with no ciphertext overhead. This is possible because Piano uses symmetric-key techniques (XOR-based), not FHE.

#### Throughput

**Note:** Piano has **sublinear** server computation — the server touches O(sqrt(N)) entries per query, not the full database. Reporting throughput as db_size / server_time would be misleading.

Server computation per query (already reported):

| Config | DB Size | Server Compute (ms) | Entries Touched (SetSize) |
|--------|---------|---------------------|-----------------------------|
| P1     | 1 GB    | 0.242               | 4,096 (sqrt(N)/4)          |
| P2     | 2 GB    | 0.536               | 8,192                      |
| P3     | 4 GB    | 0.665               | 8,192                      |

For reference, apparent throughput (db_size / server_compute):
- P1: 1024 MB / 0.000242s = 4,132 GB/s (misleading — not comparable to linear-scan schemes)

#### Offline Communication (= full DB streaming)

| Config | DB Size | Offline Comm | Amortized Offline Comm/query |
|--------|---------|-------------|-------------------------------|
| P1     | 1 GB    | 1,024 MB    | 4.84 KB |
| P2     | 2 GB    | 2,048 MB    | 6.60 KB |
| P3     | 4 GB    | 4,096 MB    | 9.01 KB |

Piano requires streaming the full database during preprocessing. The amortized cost per query is low because the preprocessing window supports sqrt(N) × ln(N) queries.

#### Preprocessing Throughput (DB_size / preprocessing_time)

| Config | DB Size | Preprocessing Time (1T) | Preprocessing Time (8T) | Throughput 1T (MB/s) | Throughput 8T (MB/s) |
|--------|---------|-------------------------|-------------------------|----------------------|----------------------|
| P1     | 1 GB    | 315 s                   | 72 s                    | 3.25                 | 14.22                |
| P2     | 2 GB    | 728 s                   | 163 s                   | 2.81                 | 12.56                |
| P3     | 4 GB    | 1,404 s                 | 297 s                   | 2.91                 | 13.77                |

Preprocessing throughput is dominated by PRF evaluation (AES-NI) for hint construction. Multi-threaded preprocessing achieves ~4.3-4.7x speedup with 8 threads.

### Issues & Observations

1. **Online query count capped at 1000:** The implementation caps `totalQueryNum` to 1000 for the online phase (line 139 of `client_new/client_new.go`), regardless of the theoretical window size. This means timing averages are over 1000 queries, not the full window of sqrt(n)*ln(n) queries. The paper likely used the same cap since the code is the reference implementation.

2. **gRPC overhead in online time:** The "Online Time" metric includes gRPC serialization and localhost network round-trip. The breakdown shows ~0.35-0.60 ms of network latency per query. For a fair comparison with the paper's LAN numbers, the server compute time alone (0.24-0.68 ms) is the best metric for server-side scaling.

3. **Thread count affects backup set allocation:** With 8 threads, the backup set count is rounded up to be divisible by the thread count, causing slightly higher client storage (e.g., 61 MB vs 60.5 MB at 1 GB). This has negligible impact on results.

4. **No multi-trial averaging:** The implementation runs the offline phase once and the online phase with 1000 queries. The online phase effectively averages over 1000 trials. Running multiple independent trials would require restarting the server and client each time. The 1000-query average provides sufficient statistical stability for the online metrics.

5. **ChunkSize = 2*sqrt(N) rounded to power of 2:** For N=2^27, ChunkSize=32768=2^15, SetSize=4096=2^12. For N=2^28, ChunkSize=32768, SetSize=8192. For N=2^29, ChunkSize=65536=2^16, SetSize=8192. This matches the paper's parameter description.

### Raw Output

<details>
<summary>P1: 1 GB, 1 Thread</summary>

```
DBSize 134217728, DBSeed 1211212, ChunkSize 32768, SetSize 4096
totalQueryNum 216817
Local Set Num 1343488, Local Backup Set Num 638976
Local Storage Size 60.5 MB
Per query communication cost 32.0078125 kb
Setup Phase took 315018 ms, amortized time 1.4529211270333968 ms per query
Setup Phase Comm Cost 1024 MB, amortized cost 4.8362259416927635 KB per query
Finish Online Phase with 1000 queries
Online Phase took 1810 ms, amortized time 1.81 ms
Per query upload cost 32 kb
Per query download cost 0.0078125 kb
Average Online Time 1.8100016170000002 ms
Average Network Latency 0.358391592 ms
Average Server Time 0.24242387899999998 ms
Average Client Time 1.2091861460000002 ms
Average Find Hint Time 1.069642274 ms
```
</details>

<details>
<summary>P1: 1 GB, 8 Threads</summary>

```
DBSize 134217728, DBSeed 1211212, ChunkSize 32768, SetSize 4096
totalQueryNum 216817
Local Set Num 1343488, Local Backup Set Num 655360
Local Storage Size 61 MB
Per query communication cost 32.0078125 kb
Setup Phase took 72421 ms, amortized time 0.33401901142438095 ms per query
Setup Phase Comm Cost 1024 MB, amortized cost 4.8362259416927635 KB per query
Finish Online Phase with 1000 queries
Online Phase took 1832 ms, amortized time 1.832 ms
Per query upload cost 32 kb
Per query download cost 0.0078125 kb
Average Online Time 1.832122706 ms
Average Network Latency 0.354512113 ms
Average Server Time 0.260593051 ms
Average Client Time 1.217017542 ms
Average Find Hint Time 1.077915425 ms
```
</details>

<details>
<summary>P2: 2 GB, 1 Thread</summary>

```
DBSize 268435456, DBSeed 1211212, ChunkSize 32768, SetSize 8192
totalQueryNum 317982
Local Set Num 1376256, Local Backup Set Num 933888
Local Storage Size 70.5 MB
Per query communication cost 64.0078125 kb
Setup Phase took 728497 ms, amortized time 2.291000748470039 ms per query
Setup Phase Comm Cost 2048 MB, amortized cost 6.595190922756634 KB per query
Finish Online Phase with 1000 queries
Online Phase took 2295 ms, amortized time 2.295 ms
Per query upload cost 64 kb
Per query download cost 0.0078125 kb
Average Online Time 2.295902081 ms
Average Network Latency 0.424954027 ms
Average Server Time 0.536367673 ms
Average Client Time 1.3345803809999999 ms
Average Find Hint Time 1.061426688 ms
```
</details>

<details>
<summary>P2: 2 GB, 8 Threads</summary>

```
DBSize 268435456, DBSeed 1211212, ChunkSize 32768, SetSize 8192
totalQueryNum 317982
Local Set Num 1376256, Local Backup Set Num 983040
Local Storage Size 72 MB
Per query communication cost 64.0078125 kb
Setup Phase took 163236 ms, amortized time 0.5133498122535238 ms per query
Setup Phase Comm Cost 2048 MB, amortized cost 6.595190922756634 KB per query
Finish Online Phase with 1000 queries
Online Phase took 2272 ms, amortized time 2.272 ms
Per query upload cost 64 kb
Per query download cost 0.0078125 kb
Average Online Time 2.272298062 ms
Average Network Latency 0.42384839799999996 ms
Average Server Time 0.52287965 ms
Average Client Time 1.325570014 ms
Average Find Hint Time 1.052370634 ms
```
</details>

<details>
<summary>P3: 4 GB, 1 Thread</summary>

```
DBSize 536870912, DBSeed 1211212, ChunkSize 65536, SetSize 8192
totalQueryNum 465755
Local Set Num 2752512, Local Backup Set Num 1376256
Local Storage Size 126 MB
Per query communication cost 64.0078125 kb
Setup Phase took 1403847 ms, amortized time 3.0141318933774195 ms per query
Setup Phase Comm Cost 4096 MB, amortized cost 9.005386952367662 KB per query
Finish Online Phase with 1000 queries
Online Phase took 3615 ms, amortized time 3.615 ms
Per query upload cost 64 kb
Per query download cost 0.0078125 kb
Average Online Time 3.61515182 ms
Average Network Latency 0.600709425 ms
Average Server Time 0.664860361 ms
Average Client Time 2.3495820339999995 ms
Average Find Hint Time 2.078926077 ms
```
</details>

<details>
<summary>P3: 4 GB, 8 Threads</summary>

```
DBSize 536870912, DBSeed 1211212, ChunkSize 65536, SetSize 8192
totalQueryNum 465755
Local Set Num 2752512, Local Backup Set Num 1376256
Local Storage Size 126 MB
Per query communication cost 64.0078125 kb
Setup Phase took 296716 ms, amortized time 0.6370645511051948 ms per query
Setup Phase Comm Cost 4096 MB, amortized cost 9.005386952367662 KB per query
Finish Online Phase with 1000 queries
Online Phase took 3482 ms, amortized time 3.482 ms
Per query upload cost 64 kb
Per query download cost 0.0078125 kb
Average Online Time 3.482764855 ms
Average Network Latency 0.47241581800000004 ms
Average Server Time 0.682961936 ms
Average Client Time 2.327387101 ms
Average Find Hint Time 2.054629599 ms
```
</details>
