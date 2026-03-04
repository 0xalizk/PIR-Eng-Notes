
**RMS24 replication configs (from paper Table 2/3):**

| Config | Entries | Entry Size | Total DB | lambda | Paper Hardware |
|--------|---------|-----------|----------|--------|---------------|
| R1 | 2^20 | 32B | 32 MB | 80 | m5.8xlarge, single-threaded |
| R2 | 2^24 | 32B | 512 MB | 80 | " |
| R3 | 2^28 | 8B | 2 GB | 80 | " |
| R4 | 2^28 | 32B | 8 GB | 80 | " |
| R5 | 2^28 | 256B | 64 GB | 80 | " |

### Caveats

- **Hardware:** Apple Silicon, not Intel Xeon. Compute timings differ from papers; communication sizes match exactly.
- **lambda=80** matches papers but is below the 128-bit modern standard.
- **Plinko:** Correctness-only (Python spec too slow for performance benchmarking).

