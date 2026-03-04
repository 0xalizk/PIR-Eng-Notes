## RMS24 — Standardized Benchmarks

### Implementation

- **Repo:** [S3PIR](https://github.com/renling/S3PIR) (paper authors' C++ implementation)
- **Threading:** Single-threaded (S3PIR has no multi-thread support)

### Hardware

- **Local:** Apple Silicon (M-series)

### Configs

| Label | DB Size | Entry Size | Entries | lambda |
|-------|---------|-----------|---------|--------|
| S1-32 | 1 GB | 32B | 2^25 | 80 |
| S1-64 | 1 GB | 64B | 2^24 | 80 |
| S1-256 | 1 GB | 256B | 2^22 | 80 |
| S2-32 | 8 GB | 32B | 2^28 | 80 |
| S2-64 | 8 GB | 64B | 2^27 | 80 |
| S2-256 | 8 GB | 256B | 2^25 | 80 |
| S3-32 | 32 GB | 32B | 2^30 | 80 |
| S3-64 | 32 GB | 64B | 2^29 | 80 |
| S3-256 | 32 GB | 256B | 2^27 | 80 |

### Results

Run date: 2026-03-02. Apple M-series, single-threaded, CryptoPP 8.9.0, Apple Clang 17. One-server variant only.

#### 1 GB Tier

| Label | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) | Amortized (ms) |
|-------|--------|-----------|------------|------------|-------------------|-----------------|
| S1-32 | 25 | 32B | 8192 | 155.40 | 1.249 | 2.197 |
| S1-64 | 24 | 64B | 4096 | 81.00 | 0.870 | 1.364 |
| S1-256 | 22 | 256B | 2048 | 22.29 | 0.543 | 0.816 |

#### 8 GB Tier

Run date: 2026-03-03. S2-32 reuses R4 replication result (same params).

| Label | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) | Amortized (ms) |
|-------|--------|-----------|------------|------------|-------------------|-----------------|
| S2-32 | 28 | 32B | 16384 | 1269.06 | 22.378 | 24.314 |
| S2-64 | 27 | 64B | 16384 | 648.95 | 17.445 | 19.425 |
| S2-256 | 25 | 256B | 8192 | 178.72 | 9.251 | 10.341 |

#### 32 GB Tier

Run date: 2026-03-03. Via `s3pir_simlargeserver` (<0.5 GB RAM, regenerates DB entries on the fly).

| Label | Log2 N | Entry Size | NumQueries | Offline (s) | Online/query (ms) | Amortized (ms) |
|-------|--------|-----------|------------|------------|-------------------|-----------------|
| S3-32 | 30 | 32B | 32768 | 4975.00 | 6.694 | 10.490 |
| S3-64 | 29 | 64B | 32768 | 2555.97 | 5.064 | 8.964 |
| S3-256 | 27 | 256B | 16384 | 704.29 | 2.868 | 5.017 |

### Command Reference

```bash
cd benchmarks/implementations/S3PIR/

# Build (macOS)
make CXX="g++ -I/opt/homebrew/include -L/opt/homebrew/lib"

# 1 GB configs
./build/s3pir --one-server 25 32 build/standardized.csv   # S1-32
./build/s3pir --one-server 24 64 build/standardized.csv   # S1-64
./build/s3pir --one-server 22 256 build/standardized.csv  # S1-256

# 8 GB configs
./build/s3pir --one-server 28 32 build/standardized.csv   # S2-32
./build/s3pir --one-server 27 64 build/standardized.csv   # S2-64
./build/s3pir --one-server 25 256 build/standardized.csv  # S2-256

# 32 GB configs (use simlargeserver to avoid OOM)
./build/s3pir_simlargeserver --one-server 30 32 build/standardized.csv   # S3-32
./build/s3pir_simlargeserver --one-server 29 64 build/standardized.csv   # S3-64
./build/s3pir_simlargeserver --one-server 27 256 build/standardized.csv  # S3-256
```

### Issues & Observations

- **Offline scaling:** Offline time scales roughly linearly with DB size — 22s (1GB/256B) → 81s (1GB/64B) → 155s (1GB/32B). More entries = more partitions = longer offline.
- **Communication (computed from protocol):**

| Label | Blocks (c) | Block Size (w) | Query (bytes) | Response (bytes) | Online (KB) |
|-------|-----------|---------------|--------------|-----------------|------------|
| S1-32 | 4,096 | 8,192 | 8,704 | 64 | 8.56 |
| S1-64 | 4,096 | 4,096 | 8,704 | 128 | 8.62 |
| S1-256 | 2,048 | 2,048 | 4,352 | 512 | 4.75 |
| S2-32 | 16,384 | 16,384 | 34,816 | 64 | 34.06 |
| S2-64 | 8,192 | 16,384 | 17,408 | 128 | 17.12 |
| S2-256 | 4,096 | 8,192 | 8,704 | 512 | 9.00 |
| S3-32 | 32,768 | 32,768 | 69,632 | 64 | 68.06 |
| S3-64 | 16,384 | 32,768 | 34,816 | 128 | 34.12 |
| S3-256 | 8,192 | 16,384 | 17,408 | 512 | 17.50 |
- **Threading:** Single-threaded only. Cross-scheme comparisons should note this disadvantage for RMS24.
- **Amortized time:** Includes offline amortization. Online-only cost per query is sub-millisecond at all 1GB configs.
