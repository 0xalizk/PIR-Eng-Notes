## RMS24 — Replication Benchmarks

### Implementation

- **Repo:** [S3PIR](https://github.com/renling/S3PIR) (paper authors' C++ implementation)
- **Language:** C++ (~1100 LOC)
- **Dependencies:** CryptoPP (AES-NI / ARM Crypto Extensions)

### Hardware

- **Local:** Apple Silicon (M-series) — ARM Crypto Extensions instead of Intel AES-NI
- **Paper:** AWS m5.8xlarge (Intel Xeon Platinum 8175M, 32 vCPU, 128 GB RAM), single-threaded

**Note:** Compute timings will differ from paper due to architecture difference. Communication sizes are deterministic and should match exactly.

### Configs (from paper Table 2/3)

| Config | Entries | Entry Size | Total DB | lambda | S3PIR Tier |
|--------|---------|-----------|----------|--------|-----------|
| R1 | 2^20 | 32B | 32 MB | 80 | SMALL |
| R2 | 2^24 | 32B | 512 MB | 80 | SMALL |
| R3 | 2^28 | 8B | 2 GB | 80 | LARGE |
| R4 | 2^28 | 32B | 8 GB | 80 | LARGE |
| R5 | 2^28 | 256B | 64 GB | 80 | FULL |

### Build

```bash
cd benchmarks/implementations/S3PIR/
brew install cryptopp
mkdir -p build
make CXX="g++ -I/opt/homebrew/include -L/opt/homebrew/lib"
```

The Makefile puts `-lcryptopp` in CXXFLAGS rather than LDFLAGS — works fine since it's a single compile-and-link step. On macOS, `g++` maps to Apple Clang (arm64). The Homebrew include/lib paths are required because Clang doesn't search `/opt/homebrew/` by default.

### Results

#### SMALL Tier (R1–R2) — Single-Threaded

Run date: 2026-03-02. Apple M-series, single-threaded, CryptoPP 8.9.0, Apple Clang 17.

**One-server variant:**

| Config | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) | Amortized (ms) |
|--------|--------|-----------|------------|------------|-------------------|-----------------|
| R1 | 20 | 32B | 1024 | 4.53 | 0.191 | 0.302 |
| R2 | 24 | 32B | 4096 | 73.71 | 0.792 | 1.242 |

**Two-server variant:**

| Config | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) |
|--------|--------|-----------|------------|------------|-------------------|
| R1 | 20 | 32B | 1024 | 2.86 | 0.185 |
| R2 | 24 | 32B | 4096 | 51.62 | 0.811 |

#### Communication Sizes (Computed from Protocol)

Online communication per query is deterministic given parameters. Derived from source analysis:

- **Query (client → server):** bitmask over `c` partitions (`ceil(c/8)` bytes) + `c/2` offsets (4 bytes each)
- **Response (server → client):** 2 × entry_size bytes (two XOR parities)
- **Offline:** full DB download (N × entry_size)

| Config | Blocks (c) | Block Size (w) | Query (bytes) | Response (bytes) | Online (KB) |
|--------|-----------|---------------|--------------|-----------------|------------|
| R1 | 1,024 | 1,024 | 2,176 | 64 | 2.19 |
| R2 | 4,096 | 4,096 | 8,704 | 64 | 8.56 |
| R3 | 16,384 | 16,384 | 34,816 | 16 | 34.02 |
| R4 | 16,384 | 16,384 | 34,816 | 64 | 34.06 |
| R5 | 16,384 | 16,384 | 34,816 | 512 | 34.50 |

**Paper verification:** R4 online comm should be ~34.1 KB — our computed 34.06 KB matches.

#### LARGE Tier (R3–R4) — Single-Threaded

Run date: 2026-03-03. Apple M-series, single-threaded, CryptoPP 8.9.0, Apple Clang 17.

**One-server variant:**

| Config | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) | Amortized (ms) |
|--------|--------|-----------|------------|------------|-------------------|-----------------|
| R3 | 28 | 8B | 16384 | 1242.06 | 3.254 | 5.149 |
| R4 | 28 | 32B | 16384 | 1269.06 | 22.378 | 24.314 |

**Observations:**
- Offline times nearly identical (1242 vs 1269s) despite 4x entry size — offline is dominated by partition/cutoff computation (same N=2^28 entries), not XOR accumulation.
- Online scales ~7x with 4x entry size (3.25 → 22.4 ms/q) — XOR parity computation over larger entries dominates.

#### FULL Tier (R5) — Single-Threaded

Run date: 2026-03-03. Apple M-series, single-threaded, `s3pir_simlargeserver`, CryptoPP 8.9.0.

**One-server variant:**

| Config | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) | Amortized (ms) |
|--------|--------|-----------|------------|------------|-------------------|-----------------|
| R5 | 28 | 256B | 16384 | 1485.90 | 4.193 | 6.460 |

**Observations:**
- Offline (1486s) only ~20% slower than R3/R4 (~1250s) despite 8x/32x entry size — confirms offline is partition-bound.
- Online (4.19ms/q) is only ~30% more than R3 (3.25ms/q at 8B) even though entries are 32x larger. SimLargeServer regenerates entries on the fly, which changes the bottleneck compared to the regular binary.

#### Multi-Threaded

S3PIR is **single-threaded by design** — no OpenMP, pthreads, or std::thread in the codebase. Paper benchmarks (m5.8xlarge) are also single-threaded. Multi-threaded benchmarks would require source modifications (e.g., parallelizing the offline loop over partitions). Out of scope for now.

### Derived Cross-Scheme Comparison Metrics

The following metrics are computed from the raw benchmark data above to enable standardized cross-scheme comparison (see `schema_v2.jsonc`). No re-run required.

#### Rate (useful_bytes / response_bytes)

| Config | Entry Size | Response Size | Rate |
|--------|-----------|---------------|------|
| R1-R5 (all) | w bytes | 2w bytes | 0.50 |

Rate is always 0.5 — the protocol returns two XOR parities (2 × entry_size). This is protocol-determined and independent of database size.

#### Throughput

**Note:** RMS24 has **sublinear** server computation — the server touches O(sqrt(N)) entries per query, not the full database. Reporting throughput as db_size / online_time would be misleading. Instead, the relevant metric is **server work per query** (already reported as online_time/query).

For reference, the effective "apparent throughput" (db_size / online_time) would be:

| Config | DB Size | Online/query (ms) | Apparent Throughput (GB/s) | Note |
|--------|---------|-------------------|-----------------------------|------|
| R1     | 32 MB   | 0.191             | 163.6 | Misleading — server only touches sqrt(N)=1024 entries |
| R2     | 512 MB  | 0.792             | 631.3 | Misleading |
| R3     | 2 GB    | 3.254             | 599.9 | Misleading |
| R4     | 8 GB    | 22.378            | 348.9 | Misleading |
| R5     | 64 GB   | 4.193             | 14,901 | Misleading — SimLargeServer regenerates entries on-the-fly |

These values are **not comparable** to throughput of linear-scan schemes (SimplePIR, Spiral, etc.).

#### Client Storage

Client stores lambda regular hints and ~lambda/2 backup hints, each of entry_size bytes. Estimated from protocol parameters:

| Config | N | sqrt(N) | lambda | Estimated Client Hint Storage |
|--------|---|---------|--------|-------------------------------|
| R1     | 2^20 | 1,024 | 80 | ~3.75 MB (1.5 × 80 × 1024 × 32B) |
| R2     | 2^24 | 4,096 | 80 | ~15 MB (1.5 × 80 × 4096 × 32B) |
| R3     | 2^28 | 16,384 | 80 | ~15 MB (1.5 × 80 × 16384 × 8B) |
| R4     | 2^28 | 16,384 | 80 | ~60 MB (1.5 × 80 × 16384 × 32B) |
| R5     | 2^28 | 16,384 | 80 | ~480 MB (1.5 × 80 × 16384 × 256B) |

These are estimates based on the protocol formula. The C++ implementation uses M/2 backup hints (vs M in the Python spec), so the 1.5x multiplier accounts for regular + backup.

#### Offline Communication (= full DB download)

| Config | DB Size | Offline Communication |
|--------|---------|----------------------|
| R1     | 32 MB   | 32 MB   |
| R2     | 512 MB  | 512 MB  |
| R3     | 2 GB    | 2 GB    |
| R4     | 8 GB    | 8 GB    |
| R5     | 64 GB   | 64 GB   |

RMS24 requires downloading the full database during the offline/preprocessing phase.

#### Preprocessing Throughput (DB_size / offline_time)

| Config | DB Size | Offline Time (s) | Preprocessing Throughput (MB/s) |
|--------|---------|-------------------|--------------------------------|
| R1     | 32 MB   | 4.53              | 7.06  |
| R2     | 512 MB  | 73.71             | 6.95  |
| R3     | 2 GB    | 1,242.06          | 1.65  |
| R4     | 8 GB    | 1,269.06          | 6.45  |
| R5     | 64 GB   | 1,485.90          | 44.1  |

R3's low throughput is anomalous — smaller entry size (8B) creates more partitions to process with the same N=2^28. R5 uses SimLargeServer (on-the-fly entry generation), so its throughput is not directly comparable.

### Issues & Observations

- **`-Ofast` deprecation:** Apple Clang warns that `-Ofast` is deprecated; recommends `-O3 -ffast-math`. Harmless — kept as-is to match upstream.
- **VLA warnings:** Clang warns about C++ variable-length arrays (a Clang extension). These are used for small stack arrays sized by template-like parameters. No runtime issue.
- **Two-server "Amortized" column:** S3PIR outputs `-` for two-server amortized time (not computed by the implementation).
- **Output format:** CSV at `build/output.csv` — columns: Variant, Log2 DBSize, EntrySize(Bytes), NumQueries, Offline Time (s), Online Time (ms), Amortized Compute Time Per Query (ms).
- **Communication sizes:** Not reported by S3PIR CLI. Computed from protocol spec (see table above). R4 online comm = 34.06 KB, matches paper's ~34.1 KB.

### Cross-Check: Python Spec vs C++ Implementation

Both implement the same core RMS24 protocol with equivalent parameter scaling:

| Aspect | Python Spec | C++ (S3PIR) | Match? |
|--------|------------|------------|--------|
| Core algorithm | Blocks + hints + XOR | Partitions + hints + XOR | Same |
| Parameter scaling | w = 2^ceil(log2(sqrt(N))) | PartSize = 2^(LogN/2) | Same |
| Regular hints | lambda x w | LAMBDA x PartSize | Same |
| Backup hints | M (= regular count) | M/2 | Different |
| PRF | SHAKE-256 | AES-128 ECB | Different |
| PRF key | Random per-client | Hardcoded "1234567812345678" | Different |
| Query structure | Bitmask + offsets | Bool array + offsets | Equivalent |
| Cutoff logic | Median-based, collision check | Median-based + outlier filtering | Similar |

**Key differences:**
- PRFs differ (SHAKE-256 vs AES-128) — implementations cannot interoperate but are individually correct
- C++ has a hardcoded PRF key (benchmark artifact, not production-safe)
- Python allocates 2x backup hints vs C++'s 1.5x — Python is more conservative
- Both produce correct PIR results independently verified
