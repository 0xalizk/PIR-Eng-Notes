## Plinko — Standardized Benchmarks (Correctness Only)

### Implementation

- **Repo:** [rms24-plinko-spec](https://github.com/keewoolee/rms24-plinko-spec) (Python reference spec)
- **Note:** Theory paper, pure Python spec. **Not performance-meaningful.** This file documents correctness at small scales using the standardized entry sizes (32B, 64B, 256B).

### Correctness at Small Scale

Run date: 2026-03-03. Apple M-series, Python 3.14.2.

Using standardized entry sizes but drastically smaller DB sizes (pure Python limitation). Security parameter reduced to lambda=40 (default 128 is infeasible even at 256 entries).

**RMS24 spec (for comparison):**

| Entry Size | Entries | lambda | Offline (s) | Correct? |
|-----------|---------|--------|------------|----------|
| 32B | 2^14 | 128 | 14.42 | 5/5 |
| 64B | 2^14 | 128 | 17.65 | 5/5 |
| 256B | 2^14 | 128 | 37.17 | 5/5 |

**Plinko spec:**

| Entry Size | Entries | lambda | Offline (s) | Correct? |
|-----------|---------|--------|------------|----------|
| 32B | 256 | 40 | 18.36 | Yes |
| 32B | 256 | 80 | 65.09 | Yes |
| 32B | 256 | 128 | >120 (timeout) | — |

### Notes

- Standardized grid (1GB/8GB/32GB) is completely infeasible with the pure Python spec
- Even 2^14 entries is infeasible — Plinko's per-entry iPRF inverse is ~1000x more expensive than RMS24's direct PRF in Python
- This file exists for structural completeness — meaningful standardized benchmarks require a C/C++/Rust implementation
- If a production Plinko implementation appears, revisit with full standardized grid
