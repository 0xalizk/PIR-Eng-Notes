## PIR Benchmarks

Replicating paper-reported benchmarks and running a standardized grid for cross-scheme comparison.

### Setup

Prerequisites: macOS (Apple Silicon), `brew install cryptopp`, Python 3.10+ with `uv`, C++17 compiler.

```bash
cd benchmarks/implementations/
git clone https://github.com/renling/S3PIR.git
git clone https://github.com/keewoolee/rms24-plinko-spec.git
```

`implementations/*/` is gitignored. See [`implementations/README.md`](implementations/README.md) for the full list.

### Benchmark Types

**Replication** — reproduce paper configs to verify our setup matches published results (within hardware variance).

**Standardized** — unified grid for cross-scheme comparison (3 DB sizes × 3 entry sizes):

| DB Size | 32B entries | 64B entries | 256B entries |
|---------|-------------|-------------|--------------|
| 1 GB | 2^25 | 2^24 | 2^22 |
| 8 GB | 2^28 | 2^27 | 2^25 |
| 32 GB | 2^30 | 2^29 | 2^27 |

### Caveats

- **Hardware:** Apple Silicon, not Intel Xeon. Compute timings differ from papers; communication sizes match exactly.
- **lambda=80** matches papers but is below the 128-bit modern standard.
- **Plinko:** Correctness-only (Python spec too slow for performance benchmarking).

### Directory Structure

```
benchmarks/
  implementations/             # gitignored
  replication_benchs/<scheme>/run_notes.md
  standardized_benchs/<scheme>/run_notes.md
```
